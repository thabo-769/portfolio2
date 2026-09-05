import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  createDefaultRemoteCapabilitySet,
  createDefaultRemoteDevicesState,
  createDefaultRemotePermissionSet,
  type RemoteConnectionMethod,
  type RemoteDevice,
  type RemoteDeviceManifest,
  type RemoteDevicesState,
  type RemoteDiscoverySnapshot,
  type RemoteEndpoint,
  type RemoteLogEntry,
  type RemoteNotification,
  type RemotePairingAttempt,
  type RemotePermissionSet,
  type RemoteSession,
  type RemoteSessionStatus,
} from '../types';
import { discoverRemoteDevices, enrichManifestWithRuntime, mergeDeviceWithManifest } from '../services/remoteDevicesBridge';
import { generatePairingCode, hashPairingCode, normalizePairingCode } from '../services/security';
import { getRemoteDevicesState, subscribeRemoteDevicesState, updateRemoteDevicesState } from '../services/remoteDevicesStore';

interface RemoteDeviceMutation {
  log?: Omit<RemoteLogEntry, 'id' | 'createdAt'>;
  notification?: Omit<RemoteNotification, 'id' | 'createdAt' | 'read'>;
}

interface CreatedPairing {
  attempt: RemotePairingAttempt;
  code: string;
}

interface UseRemoteDevicesResult {
  state: RemoteDevicesState;
  discovery: RemoteDiscoverySnapshot | null;
  loadingDiscovery: boolean;
  refreshDiscovery: (options?: { interactive?: boolean }) => Promise<RemoteDiscoverySnapshot | null>;
  selectedDevice: RemoteDevice | undefined;
  setSelectedDeviceId: (deviceId: string | null) => void;
  createPairingAttempt: (deviceId: string, method?: RemoteConnectionMethod) => Promise<CreatedPairing>;
  approvePairing: (deviceId: string, code: string) => Promise<boolean>;
  rejectPairing: (pairingId: string) => void;
  trustDevice: (deviceId: string) => void;
  revokeTrust: (deviceId: string) => void;
  forgetDevice: (deviceId: string) => void;
  disconnectDevice: (deviceId: string) => void;
  disconnectAll: () => void;
  updatePermissions: (deviceId: string, patch: Partial<RemotePermissionSet>) => void;
  toggleClipboardSync: (deviceId: string, enabled: boolean) => void;
  startSession: (
    deviceId: string,
    permissions: Partial<RemotePermissionSet>,
    options?: { persistPermissions?: boolean }
  ) => RemoteSession;
  stopSession: (sessionId: string) => void;
  addEndpoint: (endpoint: Omit<RemoteEndpoint, 'id' | 'lastCheckedAt' | 'lastStatus'>) => void;
  updateEndpoint: (endpointId: string, patch: Partial<RemoteEndpoint>) => void;
  removeEndpoint: (endpointId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotification: (notificationId: string) => void;
  resetPairingKeys: () => void;
}

function now(): number {
  return Date.now();
}

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizePermissions(
  base: RemotePermissionSet = createDefaultRemotePermissionSet(),
  patch: Partial<RemotePermissionSet> = {}
): RemotePermissionSet {
  const next = { ...base };
  for (const key of Object.keys(next) as Array<keyof RemotePermissionSet>) {
    if (key in patch) {
      next[key] = Boolean(patch[key]);
    }
  }
  return next;
}

function cloneEndpoints(endpoints: RemoteEndpoint[]): RemoteEndpoint[] {
  return endpoints.map(endpoint => ({ ...endpoint }));
}

function addLogAndNotification(state: RemoteDevicesState, mutation: RemoteDeviceMutation): void {
  if (mutation.log) {
    state.logs = [
      {
        id: randomId('log'),
        createdAt: now(),
        ...mutation.log,
      },
      ...state.logs,
    ].slice(0, 300);
  }

  if (mutation.notification) {
    state.notifications = [
      {
        id: randomId('notification'),
        createdAt: now(),
        read: false,
        ...mutation.notification,
      },
      ...state.notifications,
    ].slice(0, 150);
  }
}

function applyDeviceDefaults(device: RemoteDevice, state: RemoteDevicesState): RemoteDevice {
  const savedPermissions = state.savedPermissions[device.id];
  const trusted = state.trustedDeviceIds.includes(device.id) || device.trusted;
  const revoked = state.revokedDeviceIds.includes(device.id) || device.revoked;
  const capabilities = {
    ...createDefaultRemoteCapabilitySet(),
    ...device.capabilities,
  };
  const permissions = normalizePermissions(
    savedPermissions ? { ...createDefaultRemotePermissionSet(), ...savedPermissions } : device.permissions
  );

  return {
    ...device,
    trusted,
    revoked,
    capabilities,
    permissions,
    authorizationStatus: revoked ? 'revoked' : trusted ? 'trusted' : device.authorizationStatus,
    status: revoked ? 'disconnected' : device.status,
    connectionQuality: Math.max(device.connectionQuality ?? 0, trusted ? 88 : 0),
  };
}

function mergeDiscoveredDevices(state: RemoteDevicesState, manifests: RemoteDeviceManifest[]): RemoteDevice[] {
  const existing = new Map(state.devices.map(device => [device.id, device] as const));
  const next: RemoteDevice[] = [];

  for (const manifest of manifests) {
    const hydrated = enrichManifestWithRuntime(manifest);
    const merged = existing.has(hydrated.id)
      ? mergeDeviceWithManifest(existing.get(hydrated.id)!, manifest)
      : hydrated;
    next.push(applyDeviceDefaults(merged, state));
  }

  for (const device of state.devices) {
    if (!next.some(item => item.id === device.id)) {
      next.push(applyDeviceDefaults(device, state));
    }
  }

  return next.sort((a, b) => {
    const aScore = (a.status === 'connected' ? 1000 : 0) + (a.trusted ? 100 : 0) + (a.lastSeenAt ?? 0);
    const bScore = (b.status === 'connected' ? 1000 : 0) + (b.trusted ? 100 : 0) + (b.lastSeenAt ?? 0);
    return bScore - aScore;
  });
}

function buildSessionId(deviceId: string): string {
  return `${deviceId}-session-${now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function withDevice(state: RemoteDevicesState, deviceId: string, updater: (device: RemoteDevice) => RemoteDevice): void {
  state.devices = state.devices.map(device => (device.id === deviceId ? updater(device) : device));
}

export function useRemoteDevices(): UseRemoteDevicesResult {
  const state = useSyncExternalStore(subscribeRemoteDevicesState, getRemoteDevicesState, createDefaultRemoteDevicesState);
  const [discovery, setDiscovery] = useState<RemoteDiscoverySnapshot | null>(null);
  const [loadingDiscovery, setLoadingDiscovery] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(state.activeDeviceId);
  const endpointSignature = state.endpoints
    .map(endpoint => `${endpoint.id}:${endpoint.protocol}:${endpoint.host}:${endpoint.port}:${endpoint.path}`)
    .join('|');

  useEffect(() => {
    if (!selectedDeviceId && state.activeDeviceId) {
      setSelectedDeviceId(state.activeDeviceId);
    }
  }, [selectedDeviceId, state.activeDeviceId]);

  const refreshDiscovery = useCallback(async (options: { interactive?: boolean } = {}) => {
    setLoadingDiscovery(true);
    try {
      const snapshot = await discoverRemoteDevices(state.endpoints, options);
      setDiscovery(snapshot);

      updateRemoteDevicesState(current => {
        current.lastDiscoveryAt = now();
        current.lastDiscoveryError = snapshot.errors.length > 0 ? snapshot.errors.join(' · ') : null;
        const mergedDevices = mergeDiscoveredDevices(current, snapshot.devices);
        const discoveredIds = new Set(snapshot.devices.map(device => device.id));
        const seenBefore = new Set(current.devices.map(device => device.id));
        const newDevices = snapshot.devices.filter(device => !seenBefore.has(device.id));
        current.devices = mergedDevices;

        if (!current.activeDeviceId && mergedDevices.length > 0) {
          current.activeDeviceId = mergedDevices[0].id;
        }

        if (newDevices.length > 0) {
          addLogAndNotification(current, {
            log: {
              deviceId: newDevices[0].id,
              deviceName: newDevices[0].name,
              action: 'Device detected',
              connectionMethod: newDevices[0].connectionMethod,
              result: 'success',
              details: `${newDevices.length} new device${newDevices.length === 1 ? '' : 's'} discovered.`,
            },
            notification: {
              deviceId: newDevices[0].id,
              deviceName: newDevices[0].name,
              title: 'New device detected',
              message: `${newDevices.length} device${newDevices.length === 1 ? '' : 's'} are ready for pairing.`,
              tone: 'info',
            },
          });
        }

        if (snapshot.connectionHealth.some(item => item.status === 'offline')) {
          current.lastDiscoveryError = current.lastDiscoveryError ?? 'Some connection methods are offline.';
        }

        current.clipboardSyncEnabled = Boolean(current.clipboardSyncEnabled);
        current.devices = current.devices.map(device => ({
          ...device,
          connectionHealth: snapshot.connectionHealth,
          lastSeenAt: discoveredIds.has(device.id) ? now() : device.lastSeenAt,
        }));
      });
      return snapshot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Discovery failed.';
      updateRemoteDevicesState(current => {
        current.lastDiscoveryAt = now();
        current.lastDiscoveryError = message;
        addLogAndNotification(current, {
          log: {
            deviceId: null,
            deviceName: 'Remote devices',
            action: 'Discovery failed',
            connectionMethod: 'manual',
            result: 'failure',
            details: message,
          },
          notification: {
            deviceId: null,
            deviceName: 'Remote devices',
            title: 'Discovery failed',
            message,
            tone: 'error',
          },
        });
      });
      return null;
    } finally {
      setLoadingDiscovery(false);
    }
  }, [endpointSignature]);

  useEffect(() => {
    void refreshDiscovery();
    const interval = window.setInterval(() => {
      void refreshDiscovery();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [refreshDiscovery]);

  const selectedDevice = useMemo(
    () => state.devices.find(device => device.id === selectedDeviceId) ?? state.devices[0],
    [state.devices, selectedDeviceId]
  );

  const createPairingAttempt = useCallback(async (deviceId: string, method?: RemoteConnectionMethod): Promise<CreatedPairing> => {
    const device = state.devices.find(item => item.id === deviceId);
    if (!device) {
      throw new Error('Device not found.');
    }

    const code = generatePairingCode();
    const codeDigest = await hashPairingCode(code);
    const attempt: RemotePairingAttempt = {
      id: randomId('pairing'),
      deviceId,
      deviceName: device.name,
      method: method ?? device.connectionMethod,
      codeDisplay: code,
      codeDigest,
      status: 'pending',
      createdAt: now(),
      expiresAt: now() + 2 * 60 * 1000,
      approvedAt: null,
      rejectedAt: null,
      revokedAt: null,
      issuedBy: 'Dashboard',
    };

    updateRemoteDevicesState(current => {
      current.pairings = [attempt, ...current.pairings.filter(item => item.deviceId !== deviceId)];
      withDevice(current, deviceId, next => ({
        ...next,
        authorizationStatus: 'pairing_required',
        status: 'pairing_required',
      }));
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: device.name,
          action: 'Pairing code generated',
          connectionMethod: attempt.method,
          result: 'info',
          details: 'A temporary pairing code was created for an authorized device.',
        },
        notification: {
          deviceId,
          deviceName: device.name,
          title: 'Pairing requested',
          message: 'A temporary pairing code is ready for approval.',
          tone: 'info',
        },
      });
    });

    return { attempt, code };
  }, [state.devices]);

  const approvePairing = useCallback(
    async (deviceId: string, code: string): Promise<boolean> => {
      const normalized = normalizePairingCode(code);
      const digest = await hashPairingCode(normalized);
      const pairing = state.pairings.find(item => item.deviceId === deviceId && item.status === 'pending');
      if (!pairing || pairing.expiresAt < now()) {
        updateRemoteDevicesState(current => {
          const existing = current.pairings.find(item => item.id === pairing?.id);
          if (existing) {
            existing.status = 'expired';
          }
          addLogAndNotification(current, {
            log: {
              deviceId,
              deviceName: pairing?.deviceName ?? 'Unknown device',
              action: 'Pairing expired',
              connectionMethod: pairing?.method ?? 'manual',
              result: 'warning',
              details: 'The pairing code expired before it was approved.',
            },
            notification: {
              deviceId,
              deviceName: pairing?.deviceName ?? 'Unknown device',
              title: 'Pairing expired',
              message: 'The temporary pairing code expired.',
              tone: 'warning',
            },
          });
        });
        return false;
      }

      if (digest !== pairing.codeDigest) {
        updateRemoteDevicesState(current => {
          const existing = current.pairings.find(item => item.id === pairing.id);
          if (existing) {
            existing.status = 'rejected';
            existing.rejectedAt = now();
          }
          addLogAndNotification(current, {
            log: {
              deviceId,
              deviceName: pairing.deviceName,
              action: 'Pairing rejected',
              connectionMethod: pairing.method,
              result: 'failure',
              details: 'The supplied pairing code did not match.',
            },
            notification: {
              deviceId,
              deviceName: pairing.deviceName,
              title: 'Pairing rejected',
              message: 'The code did not match the expected device approval code.',
              tone: 'error',
            },
          });
        });
        return false;
      }

      updateRemoteDevicesState(current => {
        const existing = current.pairings.find(item => item.id === pairing.id);
        if (existing) {
          existing.status = 'approved';
          existing.approvedAt = now();
        }
        if (!current.trustedDeviceIds.includes(deviceId)) {
          current.trustedDeviceIds = [...current.trustedDeviceIds, deviceId];
        }
        current.revokedDeviceIds = current.revokedDeviceIds.filter(id => id !== deviceId);
        const saved = current.savedPermissions[deviceId] ?? createDefaultRemotePermissionSet();
        current.savedPermissions[deviceId] = saved;
        withDevice(current, deviceId, next => ({
          ...next,
          trusted: true,
          revoked: false,
          authorizationStatus: 'trusted',
          status: 'connected',
          pairedAt: now(),
          lastConnectedAt: now(),
          lastSeenAt: now(),
          permissions: saved,
        }));
        addLogAndNotification(current, {
          log: {
            deviceId,
            deviceName: pairing.deviceName,
            action: 'Pairing approved',
            connectionMethod: pairing.method,
            result: 'success',
            details: 'The pairing code was verified and the device was trusted.',
          },
          notification: {
            deviceId,
            deviceName: pairing.deviceName,
            title: 'Pairing approved',
            message: 'The device is now trusted.',
            tone: 'success',
          },
        });
      });

      return true;
    },
    [state.pairings]
  );

  const rejectPairing = useCallback((pairingId: string) => {
    updateRemoteDevicesState(current => {
      const pairing = current.pairings.find(item => item.id === pairingId);
      if (!pairing) return;
      pairing.status = 'rejected';
      pairing.rejectedAt = now();
      addLogAndNotification(current, {
        log: {
          deviceId: pairing.deviceId,
          deviceName: pairing.deviceName,
          action: 'Pairing rejected',
          connectionMethod: pairing.method,
          result: 'warning',
          details: 'The pairing flow was rejected from the dashboard.',
        },
        notification: {
          deviceId: pairing.deviceId,
          deviceName: pairing.deviceName,
          title: 'Pairing rejected',
          message: 'The pairing request was declined.',
          tone: 'warning',
        },
      });
    });
  }, []);

  const trustDevice = useCallback((deviceId: string) => {
    updateRemoteDevicesState(current => {
      if (!current.trustedDeviceIds.includes(deviceId)) {
        current.trustedDeviceIds = [...current.trustedDeviceIds, deviceId];
      }
      current.revokedDeviceIds = current.revokedDeviceIds.filter(id => id !== deviceId);
      withDevice(current, deviceId, next => ({
        ...next,
        trusted: true,
        revoked: false,
        authorizationStatus: 'trusted',
      }));
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: current.devices.find(device => device.id === deviceId)?.name ?? 'Unknown device',
          action: 'Device trusted',
          connectionMethod: current.devices.find(device => device.id === deviceId)?.connectionMethod ?? 'manual',
          result: 'success',
          details: 'The device is now allowed to reconnect without repeating the full pairing flow.',
        },
        notification: {
          deviceId,
          deviceName: current.devices.find(device => device.id === deviceId)?.name ?? 'Unknown device',
          title: 'Trusted device',
          message: 'The device has been trusted.',
          tone: 'success',
        },
      });
    });
  }, []);

  const revokeTrust = useCallback((deviceId: string) => {
    updateRemoteDevicesState(current => {
      current.trustedDeviceIds = current.trustedDeviceIds.filter(id => id !== deviceId);
      if (!current.revokedDeviceIds.includes(deviceId)) {
        current.revokedDeviceIds = [...current.revokedDeviceIds, deviceId];
      }
      withDevice(current, deviceId, next => ({
        ...next,
        trusted: false,
        revoked: true,
        authorizationStatus: 'revoked',
        status: 'disconnected',
      }));
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: current.devices.find(device => device.id === deviceId)?.name ?? 'Unknown device',
          action: 'Trust revoked',
          connectionMethod: current.devices.find(device => device.id === deviceId)?.connectionMethod ?? 'manual',
          result: 'warning',
          details: 'The device was removed from the trusted list.',
        },
        notification: {
          deviceId,
          deviceName: current.devices.find(device => device.id === deviceId)?.name ?? 'Unknown device',
          title: 'Trust revoked',
          message: 'The device is no longer trusted.',
          tone: 'warning',
        },
      });
    });
  }, []);

  const forgetDevice = useCallback((deviceId: string) => {
    updateRemoteDevicesState(current => {
      const device = current.devices.find(item => item.id === deviceId);
      current.devices = current.devices.filter(item => item.id !== deviceId);
      current.sessions = current.sessions.filter(item => item.deviceId !== deviceId);
      current.pairings = current.pairings.filter(item => item.deviceId !== deviceId);
      current.trustedDeviceIds = current.trustedDeviceIds.filter(item => item !== deviceId);
      current.revokedDeviceIds = current.revokedDeviceIds.filter(item => item !== deviceId);
      delete current.savedPermissions[deviceId];
      delete current.processesByDevice[deviceId];
      delete current.filesByDevice[deviceId];
      delete current.systemByDevice[deviceId];
      delete current.networkByDevice[deviceId];
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          action: 'Device forgotten',
          connectionMethod: device?.connectionMethod ?? 'manual',
          result: 'info',
          details: 'The device metadata and saved permissions were removed.',
        },
        notification: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          title: 'Device forgotten',
          message: 'Saved metadata and permissions were removed.',
          tone: 'info',
        },
      });
      if (current.activeDeviceId === deviceId) {
        current.activeDeviceId = current.devices[0]?.id ?? null;
      }
    });
  }, []);

  const disconnectDevice = useCallback((deviceId: string) => {
    updateRemoteDevicesState(current => {
      current.sessions = current.sessions.map(session =>
        session.deviceId === deviceId ? { ...session, status: 'ended', endedAt: now() } : session
      );
      withDevice(current, deviceId, next => ({
        ...next,
        status: 'disconnected',
        screenSessionActive: false,
        terminalSessionActive: false,
      }));
      const device = current.devices.find(item => item.id === deviceId);
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          action: 'Device disconnected',
          connectionMethod: device?.connectionMethod ?? 'manual',
          result: 'info',
          details: 'The active session was terminated from the dashboard.',
        },
        notification: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          title: 'Device disconnected',
          message: 'The active session has ended.',
          tone: 'info',
        },
      });
    });
  }, []);

  const disconnectAll = useCallback(() => {
    updateRemoteDevicesState(current => {
      current.sessions = current.sessions.map(session => ({ ...session, status: 'ended', endedAt: now() }));
      current.devices = current.devices.map(device => ({
        ...device,
        status: device.trusted ? 'disconnected' : device.status === 'connected' ? 'disconnected' : device.status,
        screenSessionActive: false,
        terminalSessionActive: false,
      }));
      addLogAndNotification(current, {
        log: {
          deviceId: null,
          deviceName: 'Remote devices',
          action: 'Disconnect all sessions',
          connectionMethod: 'manual',
          result: 'warning',
          details: 'Every active remote device session was terminated.',
        },
        notification: {
          deviceId: null,
          deviceName: 'Remote devices',
          title: 'All sessions disconnected',
          message: 'Active remote sessions were terminated.',
          tone: 'warning',
        },
      });
    });
  }, []);

  const updatePermissions = useCallback((deviceId: string, patch: Partial<RemotePermissionSet>) => {
    updateRemoteDevicesState(current => {
      const next = normalizePermissions(current.savedPermissions[deviceId] ?? createDefaultRemotePermissionSet(), patch);
      current.savedPermissions[deviceId] = next;
      withDevice(current, deviceId, device => ({
        ...device,
        permissions: next,
      }));
      const device = current.devices.find(item => item.id === deviceId);
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          action: 'Permissions updated',
          connectionMethod: device?.connectionMethod ?? 'manual',
          result: 'info',
          details: 'Saved permissions were updated for this device.',
        },
        notification: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          title: 'Permissions updated',
          message: 'Saved permissions were changed for the device.',
          tone: 'info',
        },
      });
    });
  }, []);

  const toggleClipboardSync = useCallback((deviceId: string, enabled: boolean) => {
    updateRemoteDevicesState(current => {
      current.clipboardSyncEnabled = enabled;
      withDevice(current, deviceId, device => ({
        ...device,
        clipboardSyncEnabled: enabled,
        permissions: {
          ...device.permissions,
          useClipboard: enabled,
        },
      }));
      const device = current.devices.find(item => item.id === deviceId);
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          action: enabled ? 'Clipboard sync enabled' : 'Clipboard sync disabled',
          connectionMethod: device?.connectionMethod ?? 'manual',
          result: 'info',
          details: 'Clipboard sharing was updated for the active device.',
        },
        notification: {
          deviceId,
          deviceName: device?.name ?? 'Unknown device',
          title: enabled ? 'Clipboard sync enabled' : 'Clipboard sync disabled',
          message: enabled ? 'Clipboard data can now sync for this session.' : 'Clipboard sync is off.',
          tone: 'info',
        },
      });
    });
  }, []);

  const startSession = useCallback(
    (
      deviceId: string,
      permissions: Partial<RemotePermissionSet>,
      options?: { persistPermissions?: boolean }
    ): RemoteSession => {
    const device = state.devices.find(item => item.id === deviceId);
    const persistPermissions = options?.persistPermissions ?? true;
    const granted = normalizePermissions(
      persistPermissions ? state.savedPermissions[deviceId] ?? createDefaultRemotePermissionSet() : createDefaultRemotePermissionSet(),
      permissions
    );
    const nextSession: RemoteSession = {
      id: buildSessionId(deviceId),
      deviceId,
      deviceName: device?.name ?? 'Unknown device',
      method: device?.connectionMethod ?? 'manual',
      status: 'active',
      requestedPermissions: normalizePermissions(createDefaultRemotePermissionSet(), permissions),
      grantedPermissions: granted,
      startedAt: now(),
      endedAt: null,
      lastHeartbeatAt: now(),
      screenSharing: Boolean(granted.viewScreen),
      remoteControl: Boolean(granted.controlScreen),
      terminalEnabled: Boolean(granted.openTerminal),
      clipboardSync: Boolean(granted.useClipboard),
      quality: device?.connectionQuality ?? 72,
      fps: granted.viewScreen ? 24 : 0,
      resolution: granted.viewScreen ? '1920x1080' : 'n/a',
      latencyMs: null,
      throughputMbps: null,
    };

    updateRemoteDevicesState(current => {
      current.sessions = [nextSession, ...current.sessions.filter(session => session.deviceId !== deviceId || session.status !== 'active')];
      withDevice(current, deviceId, next => ({
        ...next,
        status: 'connected',
        screenSessionActive: nextSession.screenSharing,
        terminalSessionActive: nextSession.terminalEnabled,
        clipboardSyncEnabled: nextSession.clipboardSync,
      }));
      if (!current.trustedDeviceIds.includes(deviceId)) {
        current.trustedDeviceIds = [...current.trustedDeviceIds, deviceId];
      }
      if (persistPermissions) {
        current.savedPermissions[deviceId] = granted;
      }
      addLogAndNotification(current, {
        log: {
          deviceId,
          deviceName: nextSession.deviceName,
          action: 'Session started',
          connectionMethod: nextSession.method,
          result: 'success',
          details: 'A remote access session was created for the device.',
        },
        notification: {
          deviceId,
          deviceName: nextSession.deviceName,
          title: 'Remote session started',
          message: 'A remote access session is active.',
          tone: 'success',
        },
      });
    });

    return nextSession;
  },
  [state.devices, state.savedPermissions]
  );

  const stopSession = useCallback((sessionId: string) => {
    updateRemoteDevicesState(current => {
      const session = current.sessions.find(item => item.id === sessionId);
      if (!session) return;
      session.status = 'ended';
      session.endedAt = now();
      withDevice(current, session.deviceId, device => ({
        ...device,
        status: 'disconnected',
        screenSessionActive: false,
        terminalSessionActive: false,
      }));
      addLogAndNotification(current, {
        log: {
          deviceId: session.deviceId,
          deviceName: session.deviceName,
          action: 'Session stopped',
          connectionMethod: session.method,
          result: 'info',
          details: 'The remote session was ended from the dashboard.',
        },
        notification: {
          deviceId: session.deviceId,
          deviceName: session.deviceName,
          title: 'Remote session ended',
          message: 'The session has been stopped.',
          tone: 'info',
        },
      });
    });
  }, []);

  const addEndpoint = useCallback((endpoint: Omit<RemoteEndpoint, 'id' | 'lastCheckedAt' | 'lastStatus'>) => {
    updateRemoteDevicesState(current => {
      current.endpoints = [
        {
          ...endpoint,
          id: randomId('endpoint'),
          lastCheckedAt: null,
          lastStatus: 'unknown',
        },
        ...current.endpoints,
      ];
      addLogAndNotification(current, {
        log: {
          deviceId: null,
          deviceName: endpoint.label,
          action: 'Authorized endpoint added',
          connectionMethod: 'manual',
          result: 'info',
          details: `${endpoint.protocol}://${endpoint.host}:${endpoint.port}${endpoint.path}`,
        },
        notification: {
          deviceId: null,
          deviceName: endpoint.label,
          title: 'Endpoint added',
          message: 'A trusted local-network device endpoint was added.',
          tone: 'info',
        },
      });
    });
  }, []);

  const updateEndpoint = useCallback((endpointId: string, patch: Partial<RemoteEndpoint>) => {
    updateRemoteDevicesState(current => {
      current.endpoints = current.endpoints.map(endpoint =>
        endpoint.id === endpointId
          ? {
              ...endpoint,
              ...patch,
            }
          : endpoint
      );
    });
  }, []);

  const removeEndpoint = useCallback((endpointId: string) => {
    updateRemoteDevicesState(current => {
      current.endpoints = current.endpoints.filter(endpoint => endpoint.id !== endpointId);
    });
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    updateRemoteDevicesState(current => {
      current.notifications = current.notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
    });
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    updateRemoteDevicesState(current => {
      current.notifications = current.notifications.filter(notification => notification.id !== notificationId);
    });
  }, []);

  const resetPairingKeys = useCallback(() => {
    updateRemoteDevicesState(current => {
      current.pairings = [];
      current.pairingKeyDigest = null;
      addLogAndNotification(current, {
        log: {
          deviceId: null,
          deviceName: 'Remote devices',
          action: 'Pairing keys reset',
          connectionMethod: 'manual',
          result: 'warning',
          details: 'All temporary pairing tokens were discarded.',
        },
        notification: {
          deviceId: null,
          deviceName: 'Remote devices',
          title: 'Pairing keys reset',
          message: 'Temporary pairing tokens were cleared.',
          tone: 'warning',
        },
      });
    });
  }, []);

  return {
    state,
    discovery,
    loadingDiscovery,
    refreshDiscovery,
    selectedDevice,
    setSelectedDeviceId,
    createPairingAttempt,
    approvePairing,
    rejectPairing,
    trustDevice,
    revokeTrust,
    forgetDevice,
    disconnectDevice,
    disconnectAll,
    updatePermissions,
    toggleClipboardSync,
    startSession,
    stopSession,
    addEndpoint,
    updateEndpoint,
    removeEndpoint,
    markNotificationRead,
    clearNotification,
    resetPairingKeys,
  };
}

export type { CreatedPairing, UseRemoteDevicesResult };
