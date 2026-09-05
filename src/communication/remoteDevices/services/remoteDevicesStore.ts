import {
  createDefaultRemoteCapabilitySet,
  createDefaultRemoteDevicesState,
  createDefaultRemotePermissionSet,
  type RemoteCapabilitySet,
  type RemoteDevicesState,
  type RemoteEndpoint,
  type RemotePermissionSet,
} from '../types';

const STORAGE_KEY = 'thabo_remote_devices_state_v1';
const listeners = new Set<() => void>();
let cachedState: RemoteDevicesState | null = null;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function cloneState(state: RemoteDevicesState): RemoteDevicesState {
  return JSON.parse(JSON.stringify(state)) as RemoteDevicesState;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asObject<T extends Record<string, unknown>>(value: unknown): T {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as T) : ({} as T);
}

function asTypedRecord<T>(value: unknown): Record<string, T> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, T>) : {};
}

function normalizePermissionSet(value: unknown): RemotePermissionSet {
  const input = asObject<Record<string, unknown>>(value);
  const defaults = createDefaultRemotePermissionSet();
  const next = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof RemotePermissionSet>) {
    next[key] = Boolean(input[key] ?? defaults[key]);
  }
  return next;
}

function normalizeCapabilitySet(value: unknown): RemoteCapabilitySet {
  const input = asObject<Record<string, unknown>>(value);
  const defaults = createDefaultRemoteCapabilitySet();
  const next = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof RemoteCapabilitySet>) {
    next[key] = Boolean(input[key] ?? defaults[key]);
  }
  return next;
}

function normalizeEndpoint(value: unknown): RemoteEndpoint {
  const input = asObject<Record<string, unknown>>(value);
  return {
    id: String(input.id ?? `endpoint-${Math.random().toString(16).slice(2, 8)}`),
    label: String(input.label ?? 'Authorized device'),
    host: String(input.host ?? ''),
    port: Number(input.port ?? 443),
    protocol: (String(input.protocol ?? 'https') as RemoteEndpoint['protocol']),
    path: String(input.path ?? '/.well-known/remote-device.json'),
    trusted: Boolean(input.trusted ?? false),
    lastCheckedAt: input.lastCheckedAt === null || input.lastCheckedAt === undefined ? null : Number(input.lastCheckedAt),
    lastStatus: (String(input.lastStatus ?? 'unknown') as RemoteEndpoint['lastStatus']),
    notes: input.notes ? String(input.notes) : undefined,
  };
}

function normalizeState(value: unknown): RemoteDevicesState {
  const input = asObject<Record<string, unknown>>(value);
  const defaults = createDefaultRemoteDevicesState();
  return {
    ...defaults,
    devices: asArray(input.devices),
    sessions: asArray(input.sessions),
    pairings: asArray(input.pairings),
    transfers: asArray(input.transfers),
    processesByDevice: asTypedRecord(input.processesByDevice),
    filesByDevice: asTypedRecord(input.filesByDevice),
    systemByDevice: asTypedRecord(input.systemByDevice),
    networkByDevice: asTypedRecord(input.networkByDevice),
    logs: asArray(input.logs),
    notifications: asArray(input.notifications),
    endpoints: asArray(input.endpoints).map(normalizeEndpoint),
    trustedDeviceIds: asArray<string>(input.trustedDeviceIds),
    revokedDeviceIds: asArray<string>(input.revokedDeviceIds),
    savedPermissions: asTypedRecord(input.savedPermissions),
    clipboardSyncEnabled: Boolean(input.clipboardSyncEnabled ?? defaults.clipboardSyncEnabled),
    activeDeviceId: input.activeDeviceId ? String(input.activeDeviceId) : null,
    lastDiscoveryAt:
      input.lastDiscoveryAt === null || input.lastDiscoveryAt === undefined ? null : Number(input.lastDiscoveryAt),
    lastDiscoveryError: input.lastDiscoveryError ? String(input.lastDiscoveryError) : null,
    pairingKeyDigest: input.pairingKeyDigest ? String(input.pairingKeyDigest) : null,
  };
}

function readStoredState(): RemoteDevicesState {
  if (!canUseStorage()) {
    return createDefaultRemoteDevicesState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultRemoteDevicesState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultRemoteDevicesState();
  }
}

function persistState(state: RemoteDevicesState): void {
  cachedState = cloneState(state);

  if (canUseStorage()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The dashboard should stay usable even if storage is unavailable.
    }
  }

  for (const listener of listeners) {
    listener();
  }
}

export function getRemoteDevicesState(): RemoteDevicesState {
  if (!cachedState) {
    cachedState = readStoredState();
  }
  return cachedState;
}

export function setRemoteDevicesState(nextState: RemoteDevicesState): void {
  persistState(cloneState(nextState));
}

export function updateRemoteDevicesState(mutator: (state: RemoteDevicesState) => void): RemoteDevicesState {
  const next = cloneState(getRemoteDevicesState());
  mutator(next);
  persistState(next);
  return cloneState(next);
}

export function subscribeRemoteDevicesState(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window !== 'undefined') {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        cachedState = readStoredState();
        listener();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorage);
    };
  }

  return () => {
    listeners.delete(listener);
  };
}
