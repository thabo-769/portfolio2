export const REMOTE_CONNECTION_METHODS = ['usb', 'wifi', 'bluetooth', 'lan', 'mdns', 'manual'] as const;
export type RemoteConnectionMethod = (typeof REMOTE_CONNECTION_METHODS)[number];

export const REMOTE_DEVICE_STATUSES = [
  'available',
  'pairing_required',
  'authorization_required',
  'connected',
  'disconnected',
  'offline',
  'connection_failed',
] as const;
export type RemoteDeviceStatus = (typeof REMOTE_DEVICE_STATUSES)[number];

export const REMOTE_AUTHORIZATION_STATUSES = [
  'trusted',
  'pairing_required',
  'authorization_required',
  'revoked',
  'connected',
  'disconnected',
] as const;
export type RemoteAuthorizationStatus = (typeof REMOTE_AUTHORIZATION_STATUSES)[number];

export const REMOTE_DEVICE_TYPES = ['desktop', 'laptop', 'phone', 'tablet', 'server', 'embedded', 'unknown'] as const;
export type RemoteDeviceType = (typeof REMOTE_DEVICE_TYPES)[number];

export const REMOTE_OPERATING_SYSTEMS = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Unknown'] as const;
export type RemoteOperatingSystem = (typeof REMOTE_OPERATING_SYSTEMS)[number];

export const REMOTE_CAPABILITIES = [
  'screen',
  'screenControl',
  'files',
  'terminal',
  'processes',
  'system',
  'network',
  'clipboard',
  'messages',
  'logs',
] as const;
export type RemoteCapability = (typeof REMOTE_CAPABILITIES)[number];

export const REMOTE_PERMISSION_KEYS = [
  'viewScreen',
  'controlScreen',
  'browseFiles',
  'uploadFiles',
  'downloadFiles',
  'useClipboard',
  'openTerminal',
  'viewProcesses',
  'controlProcesses',
  'viewSystemInformation',
  'viewNetworkInformation',
  'viewMessages',
  'viewLogs',
] as const;
export type RemotePermissionKey = (typeof REMOTE_PERMISSION_KEYS)[number];

export type RemotePermissionSet = Record<RemotePermissionKey, boolean>;
export type RemoteCapabilitySet = Record<RemoteCapability, boolean>;

export type RemoteSessionStatus = 'pending' | 'active' | 'ended' | 'failed';
export type RemoteTransferDirection = 'upload' | 'download';
export type RemoteTransferStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type RemotePairingStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
export type RemoteNotificationTone = 'success' | 'info' | 'warning' | 'error';
export type RemoteAuthorizationState = 'trusted' | 'pairing_required' | 'authorization_required' | 'revoked' | 'connected' | 'disconnected';

export interface RemoteConnectionHealth {
  method: RemoteConnectionMethod;
  status: 'connected' | 'available' | 'paired' | 'offline' | 'unsupported';
  label: string;
  description: string;
  activeCount: number;
  lastSeenAt?: number | null;
}

export interface RemoteHostSnapshot {
  deviceId: string;
  deviceName: string;
  operatingSystem: RemoteOperatingSystem;
  deviceType: RemoteDeviceType;
  connectionMethod: RemoteConnectionMethod;
  batteryLevel: number | null;
  ipAddress: string | null;
  gateway: string | null;
  ssid: string | null;
  connectionQuality: number;
  networkLatencyMs: number | null;
  uptimeSeconds: number | null;
  cpu: string | null;
  memoryGb: number | null;
  storageGb: number | null;
  temperatureC: number | null;
  capabilities: RemoteCapabilitySet;
}

export interface RemoteDeviceManifest {
  id: string;
  name: string;
  type: RemoteDeviceType;
  operatingSystem: RemoteOperatingSystem;
  connectionMethods: RemoteConnectionMethod[];
  connectionMethod: RemoteConnectionMethod;
  ipAddress?: string | null;
  hostName?: string | null;
  macAddress?: string | null;
  batteryLevel?: number | null;
  connectionQuality?: number | null;
  lastConnectedAt?: number | null;
  lastSeenAt?: number | null;
  uptimeSeconds?: number | null;
  cpu?: string | null;
  memoryGb?: number | null;
  storageGb?: number | null;
  gateway?: string | null;
  ssid?: string | null;
  temperatureC?: number | null;
  bridgeUrl?: string | null;
  publicKeyFingerprint?: string | null;
  transportSecurity?: 'https' | 'wss' | 'local-ipc' | 'usb' | 'bluetooth' | null;
  capabilities?: Partial<RemoteCapabilitySet>;
  permissions?: Partial<RemotePermissionSet>;
  softwareVersion?: string | null;
  notes?: string | null;
}

export interface RemoteDevice extends RemoteDeviceManifest {
  status: RemoteDeviceStatus;
  authorizationStatus: RemoteAuthorizationState;
  trusted: boolean;
  revoked: boolean;
  pairedAt: number | null;
  lastConnectedAt: number | null;
  lastSeenAt: number | null;
  connectionQuality: number;
  capabilities: RemoteCapabilitySet;
  permissions: RemotePermissionSet;
  connectionHealth: RemoteConnectionHealth[];
  screenSessionActive: boolean;
  terminalSessionActive: boolean;
  clipboardSyncEnabled: boolean;
}

export interface RemoteSession {
  id: string;
  deviceId: string;
  deviceName: string;
  method: RemoteConnectionMethod;
  status: RemoteSessionStatus;
  requestedPermissions: RemotePermissionSet;
  grantedPermissions: RemotePermissionSet;
  startedAt: number;
  endedAt: number | null;
  lastHeartbeatAt: number | null;
  screenSharing: boolean;
  remoteControl: boolean;
  terminalEnabled: boolean;
  clipboardSync: boolean;
  quality: number;
  fps: number;
  resolution: string;
  latencyMs: number | null;
  throughputMbps: number | null;
}

export interface RemotePairingAttempt {
  id: string;
  deviceId: string;
  deviceName: string;
  method: RemoteConnectionMethod;
  codeDisplay: string;
  codeDigest: string;
  status: RemotePairingStatus;
  createdAt: number;
  expiresAt: number;
  approvedAt: number | null;
  rejectedAt: number | null;
  revokedAt: number | null;
  issuedBy: string;
}

export interface RemoteTransfer {
  id: string;
  deviceId: string;
  deviceName: string;
  fileName: string;
  path: string;
  direction: RemoteTransferDirection;
  status: RemoteTransferStatus;
  bytesTransferred: number;
  totalBytes: number;
  speedBytesPerSecond: number;
  startedAt: number;
  updatedAt: number;
  completedAt: number | null;
  message?: string;
}

export interface RemoteProcessInfo {
  pid: number;
  name: string;
  user?: string | null;
  cpuPercent: number | null;
  memoryMb: number | null;
  status: string;
}

export interface RemoteFileEntry {
  path: string;
  name: string;
  kind: 'file' | 'directory';
  size: number;
  modifiedAt: number | null;
  permissions: string | null;
  mimeType?: string | null;
}

export interface RemoteSystemSnapshot {
  cpu: string | null;
  cpuUsagePercent: number | null;
  memoryUsedPercent: number | null;
  diskUsedPercent: number | null;
  batteryPercent: number | null;
  temperatureC: number | null;
  uptimeSeconds: number | null;
  processCount: number | null;
  networkUploadMbps: number | null;
  networkDownloadMbps: number | null;
  latencyMs: number | null;
}

export interface RemoteNetworkSnapshot {
  connectionLabel: string;
  ssid: string | null;
  localIp: string | null;
  gateway: string | null;
  uploadMbps: number | null;
  downloadMbps: number | null;
  latencyMs: number | null;
  dnsServers: string[];
  activeAdapters: string[];
}

export interface RemoteLogEntry {
  id: string;
  deviceId: string | null;
  deviceName: string;
  action: string;
  connectionMethod: RemoteConnectionMethod;
  result: 'success' | 'warning' | 'failure' | 'info';
  createdAt: number;
  details?: string;
}

export interface RemoteNotification {
  id: string;
  deviceId: string | null;
  deviceName: string;
  title: string;
  message: string;
  tone: RemoteNotificationTone;
  createdAt: number;
  read: boolean;
}

export interface RemoteEndpoint {
  id: string;
  label: string;
  host: string;
  port: number;
  protocol: 'https' | 'wss' | 'http';
  path: string;
  trusted: boolean;
  lastCheckedAt: number | null;
  lastStatus: 'online' | 'offline' | 'unknown';
  notes?: string;
}

export interface RemoteDevicesState {
  devices: RemoteDevice[];
  sessions: RemoteSession[];
  pairings: RemotePairingAttempt[];
  transfers: RemoteTransfer[];
  processesByDevice: Record<string, RemoteProcessInfo[]>;
  filesByDevice: Record<string, RemoteFileEntry[]>;
  systemByDevice: Record<string, RemoteSystemSnapshot>;
  networkByDevice: Record<string, RemoteNetworkSnapshot>;
  logs: RemoteLogEntry[];
  notifications: RemoteNotification[];
  endpoints: RemoteEndpoint[];
  trustedDeviceIds: string[];
  revokedDeviceIds: string[];
  savedPermissions: Record<string, RemotePermissionSet>;
  clipboardSyncEnabled: boolean;
  activeDeviceId: string | null;
  lastDiscoveryAt: number | null;
  lastDiscoveryError: string | null;
  pairingKeyDigest: string | null;
}

export interface RemoteDiscoverySnapshot {
  devices: RemoteDeviceManifest[];
  host: RemoteHostSnapshot;
  connectionHealth: RemoteConnectionHealth[];
  serviceReachable: boolean;
  errors: string[];
}

export function createDefaultRemotePermissionSet(): RemotePermissionSet {
  return {
    viewScreen: false,
    controlScreen: false,
    browseFiles: false,
    uploadFiles: false,
    downloadFiles: false,
    useClipboard: false,
    openTerminal: false,
    viewProcesses: false,
    controlProcesses: false,
    viewSystemInformation: false,
    viewNetworkInformation: false,
    viewMessages: false,
    viewLogs: false,
  };
}

export function createDefaultRemoteCapabilitySet(): RemoteCapabilitySet {
  return {
    screen: false,
    screenControl: false,
    files: false,
    terminal: false,
    processes: false,
    system: false,
    network: false,
    clipboard: false,
    messages: false,
    logs: false,
  };
}

export function createDefaultRemoteDevicesState(): RemoteDevicesState {
  return {
    devices: [],
    sessions: [],
    pairings: [],
    transfers: [],
    processesByDevice: {},
    filesByDevice: {},
    systemByDevice: {},
    networkByDevice: {},
    logs: [],
    notifications: [],
    endpoints: [],
    trustedDeviceIds: [],
    revokedDeviceIds: [],
    savedPermissions: {},
    clipboardSyncEnabled: false,
    activeDeviceId: null,
    lastDiscoveryAt: null,
    lastDiscoveryError: null,
    pairingKeyDigest: null,
  };
}

