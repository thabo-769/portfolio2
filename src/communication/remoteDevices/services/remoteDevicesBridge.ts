import {
  createDefaultRemoteCapabilitySet,
  createDefaultRemotePermissionSet,
  REMOTE_CONNECTION_METHODS,
  type RemoteCapabilitySet,
  type RemoteConnectionHealth,
  type RemoteConnectionMethod,
  type RemoteDevice,
  type RemoteDeviceManifest,
  type RemoteDiscoverySnapshot,
  type RemoteEndpoint,
  type RemoteHostSnapshot,
  type RemoteOperatingSystem,
  type RemotePermissionSet,
  type RemoteSession,
  type RemoteSystemSnapshot,
  type RemoteFileEntry,
  type RemoteProcessInfo,
  type RemoteNetworkSnapshot,
  type RemoteTransfer,
  type RemotePairingAttempt,
} from '../types';

const DEFAULT_DISCOVERY_PATH = '/.well-known/remote-device.json';

interface UsbDeviceLike {
  vendorId: number;
  productId: number;
  serialNumber?: string | null;
  productName?: string | null;
  manufacturerName?: string | null;
}

interface BluetoothDeviceLike {
  id: string;
  name?: string | null;
}

interface BatteryManager {
  level: number;
}

interface WebNavigator extends Navigator {
  userAgentData?: {
    platform?: string;
  };
  getBattery?: () => Promise<BatteryManager>;
  usb?: {
    getDevices: () => Promise<UsbDeviceLike[]>;
    requestDevice?: (options: { filters: Array<Record<string, never>> }) => Promise<UsbDeviceLike>;
  };
  bluetooth?: {
    getDevices: () => Promise<BluetoothDeviceLike[]>;
    requestDevice?: (options: { acceptAllDevices: boolean }) => Promise<BluetoothDeviceLike>;
  };
}

export interface RemoteDeviceBridge {
  discoverDevices?: () => Promise<RemoteDiscoverySnapshot>;
  discoverUsbDevices?: () => Promise<RemoteDeviceManifest[]>;
  discoverBluetoothDevices?: () => Promise<RemoteDeviceManifest[]>;
  discoverNetworkDevices?: (endpoints: RemoteEndpoint[]) => Promise<RemoteDeviceManifest[]>;
  getHostSnapshot?: () => Promise<RemoteHostSnapshot>;
  getSystemSnapshot?: (deviceId: string) => Promise<RemoteSystemSnapshot | null>;
  listFiles?: (deviceId: string, path: string) => Promise<RemoteFileEntry[]>;
  listProcesses?: (deviceId: string) => Promise<RemoteProcessInfo[]>;
  getNetworkSnapshot?: (deviceId: string) => Promise<RemoteNetworkSnapshot | null>;
  runTerminalCommand?: (deviceId: string, command: string) => Promise<{ output: string; exitCode: number }>;
  startSession?: (deviceId: string, permissions: RemotePermissionSet) => Promise<RemoteSession>;
  stopSession?: (sessionId: string) => Promise<void>;
  transferFile?: (
    deviceId: string,
    direction: 'upload' | 'download',
    path: string,
    payload?: File | Blob
  ) => Promise<RemoteTransfer>;
  approvePairing?: (deviceId: string, code: string) => Promise<RemotePairingAttempt>;
  revokePairing?: (deviceId: string) => Promise<void>;
  setClipboardSync?: (deviceId: string, enabled: boolean) => Promise<void>;
  disconnectDevice?: (deviceId: string) => Promise<void>;
  disconnectAll?: () => Promise<void>;
  forgetDevice?: (deviceId: string) => Promise<void>;
}

declare global {
  interface Window {
    remoteDeviceBridge?: RemoteDeviceBridge;
  }
}

function now(): number {
  return Date.now();
}

async function withDiscoveryTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  let timeoutId: number | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error('Discovery permission request timed out.')), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function unionCapabilities(...sets: Array<Partial<RemoteCapabilitySet> | RemoteCapabilitySet | undefined>): RemoteCapabilitySet {
  const next = createDefaultRemoteCapabilitySet();
  for (const set of sets) {
    if (!set) continue;
    for (const key of Object.keys(next) as Array<keyof RemoteCapabilitySet>) {
      next[key] = Boolean(next[key] || set[key]);
    }
  }
  return next;
}

function unionPermissions(...sets: Array<Partial<RemotePermissionSet> | RemotePermissionSet | undefined>): RemotePermissionSet {
  const next = createDefaultRemotePermissionSet();
  for (const set of sets) {
    if (!set) continue;
    for (const key of Object.keys(next) as Array<keyof RemotePermissionSet>) {
      next[key] = Boolean(next[key] || set[key]);
    }
  }
  return next;
}

function dedupeMethods(methods: RemoteConnectionMethod[]): RemoteConnectionMethod[] {
  return [...new Set(methods)];
}

function inferOperatingSystem(text: string): RemoteOperatingSystem {
  const value = text.toLowerCase();
  if (value.includes('windows')) return 'Windows';
  if (value.includes('android')) return 'Android';
  if (value.includes('iphone') || value.includes('ipad') || value.includes('ios')) return 'iOS';
  if (value.includes('mac')) return 'macOS';
  if (value.includes('linux') || value.includes('x11')) return 'Linux';
  return 'Unknown';
}

function inferDeviceType(text: string): RemoteDeviceManifest['type'] {
  const value = text.toLowerCase();
  if (value.includes('laptop') || value.includes('notebook')) return 'laptop';
  if (value.includes('desktop') || value.includes('workstation') || value.includes('pc')) return 'desktop';
  if (value.includes('phone') || value.includes('pixel') || value.includes('iphone') || value.includes('android')) return 'phone';
  if (value.includes('tablet') || value.includes('ipad')) return 'tablet';
  if (value.includes('server') || value.includes('nas')) return 'server';
  return 'unknown';
}

function inferQuality(methods: RemoteConnectionMethod[], trusted: boolean, connected: boolean): number {
  const base = connected ? 78 : 56;
  const methodBoost =
    methods.includes('usb') ? 10 :
    methods.includes('bluetooth') ? 4 :
    methods.includes('wifi') ? 6 :
    methods.includes('lan') ? 8 :
    methods.includes('mdns') ? 5 : 0;
  return clamp(base + methodBoost + (trusted ? 8 : 0), 0, 100);
}

function connectionStateForMethods(methods: RemoteConnectionMethod[], supported: boolean): RemoteConnectionHealth[] {
  return REMOTE_CONNECTION_METHODS.map(method => {
    const methodSupported = supported || methods.includes(method);
    const isPrimary = methods.includes(method);
    let status: RemoteConnectionHealth['status'] = 'unsupported';
    let description = 'Not available on this host.';

    if (method === 'manual') {
      status = 'available';
      description = 'Add an explicitly authorized network endpoint.';
    } else if (method === 'lan' || method === 'wifi') {
      status = navigator.onLine ? 'connected' : 'offline';
      description = navigator.onLine ? 'Network is currently reachable.' : 'Offline';
    } else if (methodSupported && isPrimary) {
      status = 'paired';
      description = 'A matching device is available.';
    } else if (methodSupported) {
      status = 'available';
      description = 'Discovery is available on this host.';
    }

    if (!methodSupported && method !== 'manual') {
      status = 'unsupported';
    }

    return {
      method,
      status,
      label: method.toUpperCase(),
      description,
      activeCount: isPrimary ? 1 : 0,
      lastSeenAt: isPrimary ? now() : null,
    };
  });
}

async function readBatteryLevel(): Promise<number | null> {
  if (typeof navigator === 'undefined') {
    return null;
  }

  try {
    const webNavigator = navigator as WebNavigator;
    if (typeof webNavigator.getBattery !== 'function') return null;
    const battery = await webNavigator.getBattery();
    return clamp(Math.round(battery.level * 100), 0, 100);
  } catch {
    return null;
  }
}

function parseNavigatorOperatingSystem(): RemoteOperatingSystem {
  const webNavigator = navigator as WebNavigator;
  const platform = webNavigator.userAgentData?.platform ?? webNavigator.platform ?? webNavigator.userAgent;
  return inferOperatingSystem(String(platform));
}

function parseNavigatorDeviceName(): string {
  const webNavigator = navigator as WebNavigator;
  const platform = webNavigator.userAgentData?.platform ?? webNavigator.platform;
  return platform ? `${platform} workstation` : 'This workstation';
}

function parseConnectionLabel(): string {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; type?: string } }).connection;
  if (!connection) {
    return navigator.onLine ? 'Network connected' : 'Offline';
  }
  const type = connection.type ? connection.type.toUpperCase() : connection.effectiveType?.toUpperCase() ?? 'NETWORK';
  return `${type} connected`;
}

async function buildHostSnapshot(): Promise<RemoteHostSnapshot> {
  const batteryLevel = await readBatteryLevel();
  const webNavigator = navigator as WebNavigator & { connection?: { effectiveType?: string; rtt?: number; downlink?: number } };
  const connection = webNavigator.connection;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const storageEstimate = typeof navigator.storage?.estimate === 'function' ? await navigator.storage.estimate().catch(() => null) : null;
  const storageGb = storageEstimate?.quota ? Math.round((storageEstimate.quota / 1024 / 1024 / 1024) * 10) / 10 : null;
  const capabilities = createDefaultRemoteCapabilitySet();
  capabilities.system = true;
  capabilities.network = true;
  capabilities.clipboard = Boolean(navigator.clipboard);
  capabilities.files = Boolean((window as Window & { showOpenFilePicker?: unknown }).showOpenFilePicker);

  return {
    deviceId: `host-${webNavigator.userAgentData?.platform ?? webNavigator.platform ?? 'browser'}`,
    deviceName: parseNavigatorDeviceName(),
    operatingSystem: parseNavigatorOperatingSystem(),
    deviceType: inferDeviceType(parseNavigatorDeviceName()),
    connectionMethod: navigator.onLine ? 'wifi' : 'lan',
    batteryLevel,
    ipAddress: null,
    gateway: null,
    ssid: null,
    connectionQuality: navigator.onLine ? 82 : 24,
    networkLatencyMs: connection?.rtt ?? null,
    uptimeSeconds: null,
    cpu: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical cores` : null,
    memoryGb: memory,
    storageGb,
    temperatureC: null,
    capabilities,
  };
}

function toDeviceId(manifest: RemoteDeviceManifest, fallbackMethod: RemoteConnectionMethod): string {
  return manifest.id || `${fallbackMethod}-${manifest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function buildDeviceManifest(
  manifest: Partial<RemoteDeviceManifest>,
  fallbackMethod: RemoteConnectionMethod,
  source: string
): RemoteDeviceManifest {
  const connectionMethods = dedupeMethods([
    ...(manifest.connectionMethods ?? []),
    manifest.connectionMethod ?? fallbackMethod,
  ]);
  const name = asString(manifest.name, `${source} device`) || `${source} device`;
  const connectionMethod = manifest.connectionMethod ?? fallbackMethod;
  return {
    id: toDeviceId({ ...manifest, name, connectionMethod } as RemoteDeviceManifest, fallbackMethod),
    name,
    type: manifest.type ?? inferDeviceType(name),
    operatingSystem: manifest.operatingSystem ?? inferOperatingSystem(name),
    connectionMethods,
    connectionMethod,
    ipAddress: manifest.ipAddress ?? null,
    hostName: manifest.hostName ?? null,
    macAddress: manifest.macAddress ?? null,
    batteryLevel: manifest.batteryLevel ?? null,
    connectionQuality: clamp(asNumber(manifest.connectionQuality, 72), 0, 100),
    lastConnectedAt: manifest.lastConnectedAt ?? null,
    lastSeenAt: manifest.lastSeenAt ?? now(),
    uptimeSeconds: manifest.uptimeSeconds ?? null,
    cpu: manifest.cpu ?? null,
    memoryGb: manifest.memoryGb ?? null,
    storageGb: manifest.storageGb ?? null,
    gateway: manifest.gateway ?? null,
    ssid: manifest.ssid ?? null,
    temperatureC: manifest.temperatureC ?? null,
    bridgeUrl: manifest.bridgeUrl ?? null,
    publicKeyFingerprint: manifest.publicKeyFingerprint ?? null,
    transportSecurity: manifest.transportSecurity ?? null,
    capabilities: manifest.capabilities ?? {},
    permissions: manifest.permissions ?? {},
    softwareVersion: manifest.softwareVersion ?? null,
    notes: manifest.notes ?? null,
  };
}

function normalizeBridgeManifest(manifest: RemoteDeviceManifest, source: RemoteConnectionMethod): RemoteDeviceManifest {
  return buildDeviceManifest(manifest, source, source);
}

function mergeManifests(manifests: RemoteDeviceManifest[]): RemoteDeviceManifest[] {
  const devices = new Map<string, RemoteDeviceManifest>();
  for (const manifest of manifests) {
    const current = devices.get(manifest.id);
    if (!current) {
      devices.set(manifest.id, manifest);
      continue;
    }

    devices.set(manifest.id, {
      ...current,
      ...manifest,
      connectionMethods: dedupeMethods([...current.connectionMethods, ...manifest.connectionMethods]),
      capabilities: unionCapabilities(current.capabilities, manifest.capabilities),
      permissions: unionPermissions(current.permissions, manifest.permissions),
      connectionQuality: Math.max(current.connectionQuality ?? 0, manifest.connectionQuality ?? 0),
      lastSeenAt: Math.max(current.lastSeenAt ?? 0, manifest.lastSeenAt ?? 0) || null,
      lastConnectedAt: Math.max(current.lastConnectedAt ?? 0, manifest.lastConnectedAt ?? 0) || null,
      type: current.type !== 'unknown' ? current.type : manifest.type,
      operatingSystem: current.operatingSystem !== 'Unknown' ? current.operatingSystem : manifest.operatingSystem,
    });
  }

  return [...devices.values()];
}

async function discoverBrowserUsbDevices(interactive = false): Promise<RemoteDeviceManifest[]> {
  if (typeof navigator === 'undefined' || !('usb' in navigator)) {
    return [];
  }

  const usbNavigator = navigator as WebNavigator;

  if (!usbNavigator.usb?.getDevices) {
    return [];
  }

  try {
    const devices = await usbNavigator.usb.getDevices();
    if (interactive && usbNavigator.usb.requestDevice) {
      try {
        const requestedDevice = await withDiscoveryTimeout(usbNavigator.usb.requestDevice({ filters: [] }));
        if (!devices.some(device => device.serialNumber === requestedDevice.serialNumber && device.vendorId === requestedDevice.vendorId && device.productId === requestedDevice.productId)) {
          devices.push(requestedDevice);
        }
      } catch {
        // The user may close the browser permission picker without selecting a device.
      }
    }
    return devices.map(device => {
      const name = device.productName || device.manufacturerName || `USB ${device.vendorId.toString(16)}:${device.productId.toString(16)}`;
      return buildDeviceManifest(
        {
          id: `usb-${device.vendorId}-${device.productId}-${device.serialNumber ?? device.productName ?? 'device'}`,
          name,
          type: inferDeviceType(name),
          operatingSystem: inferOperatingSystem(name),
          connectionMethods: ['usb'],
          connectionMethod: 'usb',
          batteryLevel: null,
          connectionQuality: 72,
          lastSeenAt: now(),
          notes: 'Authorized USB device discovered by the browser USB API.',
          capabilities: { files: false, terminal: false, system: false, network: false, screen: false, screenControl: false, clipboard: false, messages: false, processes: false, logs: false },
        },
        'usb',
        'usb'
      );
    });
  } catch {
    return [];
  }
}

async function discoverBrowserBluetoothDevices(interactive = false): Promise<RemoteDeviceManifest[]> {
  if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
    return [];
  }

  const bluetoothNavigator = navigator as WebNavigator;

  if (!bluetoothNavigator.bluetooth?.getDevices) {
    return [];
  }

  try {
    const devices = await bluetoothNavigator.bluetooth.getDevices();
    if (interactive && bluetoothNavigator.bluetooth.requestDevice) {
      try {
        const requestedDevice = await withDiscoveryTimeout(bluetoothNavigator.bluetooth.requestDevice({ acceptAllDevices: true }));
        if (!devices.some(device => device.id === requestedDevice.id)) {
          devices.push(requestedDevice);
        }
      } catch {
        // The user may close the browser permission picker without selecting a device.
      }
    }
    return devices.map(device =>
      buildDeviceManifest(
        {
          id: `bluetooth-${device.id}`,
          name: device.name || 'Bluetooth device',
          type: inferDeviceType(device.name || 'Bluetooth device'),
          operatingSystem: inferOperatingSystem(device.name || 'Bluetooth device'),
          connectionMethods: ['bluetooth'],
          connectionMethod: 'bluetooth',
          batteryLevel: null,
          connectionQuality: 64,
          lastSeenAt: now(),
          notes: 'Paired Bluetooth device discovered by the browser Bluetooth API.',
          capabilities: { files: false, terminal: false, system: false, network: false, screen: false, screenControl: false, clipboard: false, messages: false, processes: false, logs: false },
        },
        'bluetooth',
        'bluetooth'
      )
    );
  } catch {
    return [];
  }
}

async function probeEndpoint(endpoint: RemoteEndpoint): Promise<RemoteDeviceManifest | null> {
  const url = `${endpoint.protocol}://${endpoint.host}:${endpoint.port}${endpoint.path || DEFAULT_DISCOVERY_PATH}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as Partial<RemoteDeviceManifest>;
    return buildDeviceManifest(
      {
        ...data,
        id: data.id ?? endpoint.id,
        name: data.name ?? endpoint.label,
        connectionMethods: data.connectionMethods ?? ['lan'],
        connectionMethod: data.connectionMethod ?? 'lan',
        bridgeUrl: data.bridgeUrl ?? url,
        transportSecurity: data.transportSecurity ?? (endpoint.protocol === 'https' ? 'https' : 'wss'),
        notes: data.notes ?? endpoint.notes ?? 'Discovered over an explicitly authorized local-network endpoint.',
      },
      data.connectionMethod ?? 'lan',
      'lan'
    );
  } catch {
    return null;
  }
}

async function discoverAuthorizedNetworkDevices(endpoints: RemoteEndpoint[]): Promise<RemoteDeviceManifest[]> {
  if (endpoints.length === 0) return [];

  const discovered = await Promise.all(endpoints.map(endpoint => probeEndpoint(endpoint)));
  return discovered.filter((item): item is RemoteDeviceManifest => Boolean(item));
}

function buildConnectionHealth(
  usb: RemoteDeviceManifest[],
  bluetooth: RemoteDeviceManifest[],
  network: RemoteDeviceManifest[]
): RemoteConnectionHealth[] {
  const counts = new Map<RemoteConnectionMethod, number>();
  for (const device of [...usb, ...bluetooth, ...network]) {
    counts.set(device.connectionMethod, (counts.get(device.connectionMethod) ?? 0) + 1);
  }

  const health: RemoteConnectionHealth[] = [
    {
      method: 'usb',
      status: typeof navigator !== 'undefined' && 'usb' in navigator ? (usb.length > 0 ? 'paired' : 'available') : 'unsupported',
      label: 'USB',
      description: typeof navigator !== 'undefined' && 'usb' in navigator ? 'Enumerates authorized USB devices on this host.' : 'USB discovery is unavailable.',
      activeCount: counts.get('usb') ?? 0,
      lastSeenAt: usb[0]?.lastSeenAt ?? null,
    },
    {
      method: 'wifi',
      status: typeof navigator !== 'undefined' && navigator.onLine ? 'connected' : 'offline',
      label: 'Wi-Fi',
      description: typeof navigator !== 'undefined' && navigator.onLine ? 'Host network is reachable.' : 'Offline.',
      activeCount: counts.get('wifi') ?? counts.get('lan') ?? 0,
      lastSeenAt: now(),
    },
    {
      method: 'bluetooth',
      status: typeof navigator !== 'undefined' && 'bluetooth' in navigator ? (bluetooth.length > 0 ? 'paired' : 'available') : 'unsupported',
      label: 'Bluetooth',
      description: typeof navigator !== 'undefined' && 'bluetooth' in navigator ? 'Authorized Bluetooth devices are available to this browser.' : 'Bluetooth discovery is unavailable.',
      activeCount: counts.get('bluetooth') ?? 0,
      lastSeenAt: bluetooth[0]?.lastSeenAt ?? null,
    },
    {
      method: 'lan',
      status: network.length > 0 ? 'connected' : navigator.onLine ? 'available' : 'offline',
      label: 'LAN',
      description: network.length > 0 ? 'Companion agents on this private Wi-Fi responded successfully.' : 'Run the companion agent on a device to discover it on this Wi-Fi.',
      activeCount: counts.get('lan') ?? 0,
      lastSeenAt: network[0]?.lastSeenAt ?? null,
    },
    {
      method: 'mdns',
      status: network.length > 0 ? 'available' : 'unsupported',
      label: 'mDNS',
      description: 'Bonjour or mDNS discovery can be plugged in through the companion bridge.',
      activeCount: 0,
      lastSeenAt: network[0]?.lastSeenAt ?? null,
    },
    {
      method: 'manual',
      status: 'available',
      label: 'Manual',
      description: 'Manually add authorized device endpoints.',
      activeCount: 0,
      lastSeenAt: now(),
    },
  ];

  return health;
}

export async function discoverRemoteDevices(
  endpoints: RemoteEndpoint[] = [],
  options: { interactive?: boolean } = {}
): Promise<RemoteDiscoverySnapshot> {
  const bridge = window.remoteDeviceBridge;

  // Electron exposes one authoritative discovery operation. Use it as a unit
  // so the device list and connection health describe the same scan.
  if (bridge?.discoverDevices) {
    const snapshot = await bridge.discoverDevices();
    const devices = mergeManifests(
      snapshot.devices.map(device => normalizeBridgeManifest(device, device.connectionMethod ?? 'lan'))
    );

    return {
      ...snapshot,
      devices,
      serviceReachable: true,
      errors: Array.isArray(snapshot.errors) ? snapshot.errors : [],
    };
  }

  const host = bridge?.getHostSnapshot ? await bridge.getHostSnapshot() : await buildHostSnapshot();

  const [usb, bluetooth, network] = await Promise.all([
    bridge?.discoverUsbDevices ? bridge.discoverUsbDevices() : discoverBrowserUsbDevices(Boolean(options.interactive)),
    bridge?.discoverBluetoothDevices ? bridge.discoverBluetoothDevices() : discoverBrowserBluetoothDevices(Boolean(options.interactive)),
    bridge?.discoverNetworkDevices ? bridge.discoverNetworkDevices(endpoints) : discoverAuthorizedNetworkDevices(endpoints),
  ]);

  const merged = mergeManifests([
    {
      id: host.deviceId,
      name: `${host.deviceName} (This Computer)`,
      type: host.deviceType,
      operatingSystem: host.operatingSystem,
      connectionMethods: ['lan', 'manual'],
      connectionMethod: 'lan',
      ipAddress: host.ipAddress,
      batteryLevel: host.batteryLevel,
      connectionQuality: host.connectionQuality,
      lastSeenAt: now(),
      uptimeSeconds: host.uptimeSeconds,
      cpu: host.cpu,
      memoryGb: host.memoryGb,
      storageGb: host.storageGb,
      gateway: host.gateway,
      ssid: host.ssid,
      temperatureC: host.temperatureC,
      bridgeUrl: 'local://remote-device-dashboard',
      transportSecurity: 'local-ipc',
      capabilities: host.capabilities,
      notes: 'This dashboard host is available for local diagnostics and authorized companion actions.',
    },
    ...usb.map(manifest => normalizeBridgeManifest(manifest, 'usb')),
    ...bluetooth.map(manifest => normalizeBridgeManifest(manifest, 'bluetooth')),
    ...network.map(manifest => normalizeBridgeManifest(manifest, 'lan')),
  ]);

  const connectionHealth = buildConnectionHealth(usb, bluetooth, network);

  return {
    devices: merged,
    host,
    connectionHealth,
    serviceReachable: Boolean(bridge?.discoverDevices || bridge?.discoverNetworkDevices || bridge?.getHostSnapshot),
    errors: [],
  };
}

export function enrichManifestWithRuntime(manifest: RemoteDeviceManifest): RemoteDevice {
  const capabilities = unionCapabilities(createDefaultRemoteCapabilitySet(), manifest.capabilities);
  const permissions = unionPermissions(createDefaultRemotePermissionSet(), manifest.permissions);
  const trusted = Boolean(manifest.publicKeyFingerprint || manifest.bridgeUrl);
  const connected = manifest.connectionMethod === 'usb' || manifest.connectionMethod === 'bluetooth' || manifest.connectionMethod === 'lan';
  const methods = dedupeMethods([manifest.connectionMethod, ...(manifest.connectionMethods ?? [])]);
  const health = connectionStateForMethods(methods, true);

  return {
    ...buildDeviceManifest(manifest, manifest.connectionMethod, manifest.connectionMethod),
    status: connected ? 'connected' : 'available',
    authorizationStatus: trusted ? 'trusted' : 'authorization_required',
    trusted,
    revoked: false,
    pairedAt: manifest.lastConnectedAt ?? null,
    lastConnectedAt: manifest.lastConnectedAt ?? null,
    lastSeenAt: manifest.lastSeenAt ?? null,
    connectionQuality: inferQuality(methods, trusted, connected),
    capabilities,
    permissions,
    connectionHealth: health,
    screenSessionActive: false,
    terminalSessionActive: false,
    clipboardSyncEnabled: false,
  };
}

export function mergeDeviceWithManifest(device: RemoteDevice, manifest: RemoteDeviceManifest): RemoteDevice {
  const capabilities = unionCapabilities(device.capabilities, manifest.capabilities);
  const permissions = unionPermissions(device.permissions, manifest.permissions);
  const methods = dedupeMethods([device.connectionMethod, ...(device.connectionMethods ?? []), ...(manifest.connectionMethods ?? [])]);
  const trusted = device.trusted || Boolean(manifest.publicKeyFingerprint || manifest.bridgeUrl);
  const connected = device.status === 'connected' || manifest.connectionMethod === 'usb' || manifest.connectionMethod === 'bluetooth' || manifest.connectionMethod === 'lan';

  return {
    ...device,
    ...manifest,
    connectionMethods: methods,
    connectionMethod: manifest.connectionMethod ?? device.connectionMethod,
    capabilities,
    permissions,
    trusted,
    status: connected ? 'connected' : device.status,
    authorizationStatus: trusted ? 'trusted' : device.authorizationStatus,
    connectionQuality: Math.max(device.connectionQuality ?? 0, manifest.connectionQuality ?? 0),
    lastSeenAt: Math.max(device.lastSeenAt ?? 0, manifest.lastSeenAt ?? 0) || null,
    lastConnectedAt: Math.max(device.lastConnectedAt ?? 0, manifest.lastConnectedAt ?? 0) || null,
    connectionHealth: connectionStateForMethods(methods, true),
  };
}

export function getLocalBridgeCapabilitySummary(): RemoteCapabilitySet {
  const capabilities = createDefaultRemoteCapabilitySet();
  capabilities.system = true;
  capabilities.network = true;
  capabilities.files = Boolean((window as Window & { showDirectoryPicker?: unknown }).showDirectoryPicker);
  capabilities.clipboard = Boolean(navigator.clipboard);
  return capabilities;
}
