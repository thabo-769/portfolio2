import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bluetooth,
  CheckCircle2,
  Clock3,
  Laptop2,
  Loader2,
  LockKeyhole,
  Power,
  RefreshCw,
  Server,
  ShieldCheck,
  SignalHigh,
  TabletSmartphone,
  Trash2,
  Usb,
  Wifi,
  X,
} from 'lucide-react';
import { useToast } from '../../../admin/ToastContext';
import { createDefaultRemotePermissionSet, type RemoteDevice, type RemotePermissionSet, type RemoteSession } from '../types';
import { useRemoteDevices, type CreatedPairing } from '../hooks/useRemoteDevices';

type FilterKey = 'all' | 'wifi' | 'bluetooth' | 'usb' | 'paired';

interface ConnectDraft {
  viewScreen: boolean;
  controlScreen: boolean;
  clipboard: boolean;
  fileTransfer: boolean;
  persistPermissions: boolean;
}

interface ConnectState {
  deviceId: string;
  step: 'pairing' | 'permissions';
  pairing: CreatedPairing | null;
  codeEntry: string;
  draft: ConnectDraft;
  busy: boolean;
  error: string | null;
}

const FILTERS: Array<{ id: FilterKey; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'bluetooth', label: 'Bluetooth' },
  { id: 'usb', label: 'USB' },
  { id: 'paired', label: 'Paired' },
];

const PERMISSION_TOGGLES: Array<{
  key: keyof Pick<ConnectDraft, 'viewScreen' | 'controlScreen' | 'clipboard' | 'fileTransfer'>;
  label: string;
  description: string;
}> = [
  {
    key: 'viewScreen',
    label: 'View screen',
    description: 'Show the remote screen after explicit authorization.',
  },
  {
    key: 'controlScreen',
    label: 'Keyboard and mouse',
    description: 'Allow pointer and keyboard input only after approval.',
  },
  {
    key: 'clipboard',
    label: 'Clipboard',
    description: 'Sync text clipboard contents only when enabled.',
  },
  {
    key: 'fileTransfer',
    label: 'File transfer',
    description: 'Allow approved uploads and downloads only.',
  },
];

function now(): number {
  return Date.now();
}

function formatRelativeTime(value: number | null | undefined): string {
  if (!value) return 'Never';
  const diff = Math.max(0, Date.now() - value);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(value: number | null | undefined): string {
  if (!value) return 'Unavailable';
  return new Date(value).toLocaleString();
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function shortId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

function isLocalBridge(device: RemoteDevice): boolean {
  return device.bridgeUrl === 'local://remote-device-dashboard';
}

function isPaired(device: RemoteDevice): boolean {
  return device.trusted || device.authorizationStatus === 'trusted';
}

function isOnline(device: RemoteDevice): boolean {
  return device.status !== 'offline' && device.status !== 'connection_failed';
}

function deviceTypeLabel(type: RemoteDevice['type']): string {
  switch (type) {
    case 'desktop':
      return 'Desktop';
    case 'laptop':
      return 'Laptop';
    case 'phone':
      return 'Phone';
    case 'tablet':
      return 'Tablet';
    case 'server':
      return 'Server';
    case 'embedded':
      return 'Embedded';
    default:
      return 'Unknown';
  }
}

function methodLabel(method: RemoteDevice['connectionMethod'] | string): string {
  switch (method) {
    case 'usb':
      return 'USB';
    case 'wifi':
      return 'Wi-Fi';
    case 'bluetooth':
      return 'Bluetooth';
    case 'lan':
      return 'LAN';
    case 'mdns':
      return 'mDNS';
    case 'manual':
      return 'Manual';
    default:
      return method;
  }
}

function methodIcon(method: RemoteDevice['connectionMethod'] | string): React.ReactNode {
  switch (method) {
    case 'usb':
      return <Usb className="h-4 w-4" />;
    case 'bluetooth':
      return <Bluetooth className="h-4 w-4" />;
    case 'wifi':
    case 'lan':
      return <Wifi className="h-4 w-4" />;
    default:
      return <SignalHigh className="h-4 w-4" />;
  }
}

function deviceIcon(device: RemoteDevice): React.ReactNode {
  switch (device.type) {
    case 'phone':
    case 'tablet':
      return <TabletSmartphone className="h-5 w-5" />;
    case 'server':
      return <Server className="h-5 w-5" />;
    default:
      return <Laptop2 className="h-5 w-5" />;
  }
}

function networkSummary(device: RemoteDevice): string {
  if (!isOnline(device)) return 'Offline';
  if (device.ipAddress) return `IP ${device.ipAddress}`;
  if (device.ssid) return `SSID ${device.ssid}`;
  if (device.hostName) return device.hostName;
  if (device.connectionMethod === 'bluetooth') return 'Bluetooth link';
  if (device.connectionMethod === 'usb') return 'USB link';
  return 'Awaiting network details';
}

function signalSummary(device: RemoteDevice): string {
  if (!isOnline(device)) return 'Offline';
  return `${device.connectionQuality}% signal`;
}

function permissionSummary(permissions: RemotePermissionSet): string[] {
  const chips: string[] = [];
  if (permissions.viewScreen) chips.push('Screen');
  if (permissions.controlScreen) chips.push('Control');
  if (permissions.useClipboard) chips.push('Clipboard');
  if (permissions.browseFiles || permissions.uploadFiles || permissions.downloadFiles) chips.push('Files');
  return chips;
}

function buildDraft(device?: RemoteDevice): ConnectDraft {
  const defaults = createDefaultRemotePermissionSet();
  const saved = device?.permissions ?? defaults;
  const hasSavedPermissions = Boolean(device && Object.values(saved).some(Boolean));

  const baseView = hasSavedPermissions
    ? Boolean(saved.viewScreen || saved.controlScreen)
    : Boolean(device?.capabilities.screen || device?.capabilities.screenControl);
  const baseControl = hasSavedPermissions ? Boolean(saved.controlScreen) : Boolean(device?.capabilities.screenControl);
  const baseClipboard = hasSavedPermissions ? Boolean(saved.useClipboard) : Boolean(device?.capabilities.clipboard);
  const baseFiles = hasSavedPermissions
    ? Boolean(saved.browseFiles || saved.uploadFiles || saved.downloadFiles)
    : Boolean(device?.capabilities.files);

  return {
    viewScreen: baseView,
    controlScreen: baseControl,
    clipboard: baseClipboard,
    fileTransfer: baseFiles,
    persistPermissions: true,
  };
}

function applyDraftRules(current: ConnectDraft, patch: Partial<ConnectDraft>): ConnectDraft {
  const next: ConnectDraft = { ...current, ...patch };
  if (next.controlScreen) {
    next.viewScreen = true;
  }
  if (!next.viewScreen) {
    next.controlScreen = false;
  }
  return next;
}

function draftToPermissions(draft: ConnectDraft): RemotePermissionSet {
  const permissions = createDefaultRemotePermissionSet();
  permissions.viewScreen = draft.viewScreen;
  permissions.controlScreen = draft.controlScreen;
  permissions.useClipboard = draft.clipboard;
  permissions.browseFiles = draft.fileTransfer;
  permissions.uploadFiles = draft.fileTransfer;
  permissions.downloadFiles = draft.fileTransfer;
  return permissions;
}

function filterVisibleDevices(devices: RemoteDevice[], filter: FilterKey): RemoteDevice[] {
  return devices.filter(device => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'wifi' &&
        (device.connectionMethods.includes('wifi') || device.connectionMethods.includes('lan') || device.connectionMethods.includes('mdns'))) ||
      (filter === 'bluetooth' && device.connectionMethods.includes('bluetooth')) ||
      (filter === 'usb' && device.connectionMethods.includes('usb')) ||
      (filter === 'paired' && isPaired(device));

    return matchesFilter;
  });
}

function statusPillClass(active: boolean): string {
  return active ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-zinc-300';
}

function actionButtonClass(active: boolean): string {
  return active ? 'border-white bg-white text-black hover:bg-zinc-100' : 'border-white/10 bg-black/20 text-white hover:bg-white hover:text-black';
}

function Card({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-white">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function PermissionToggle({
  checked,
  disabled,
  label,
  description,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition-all ${
        checked ? 'border-white bg-white text-black' : 'border-white/10 bg-black/20 text-white hover:bg-white/5'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className={`mt-2 text-xs leading-relaxed ${checked ? 'text-black/70' : 'text-zinc-500'}`}>{description}</p>
        </div>
        <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${checked ? 'border-black bg-black text-white' : 'border-current/35'}`}>
          {checked ? <CheckCircle2 className="h-4 w-4" /> : null}
        </span>
      </div>
    </button>
  );
}

function DeviceRow({
  device,
  selected,
  onSelect,
  onConnect,
}: {
  device: RemoteDevice;
  selected: boolean;
  onSelect: () => void;
  onConnect: () => void;
}) {
  const selectedRow = selected;
  const textTone = selectedRow ? 'text-black/70' : 'text-zinc-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`rounded-2xl border p-4 transition-all ${selectedRow ? 'border-white bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.08)]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <button type="button" onClick={onSelect} className="flex min-w-0 items-start gap-3 text-left">
          <div className={`rounded-2xl border p-2.5 ${selectedRow ? 'border-black/10 bg-black text-white' : 'border-white/10 bg-black/20 text-white'}`}>
            {deviceIcon(device)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`truncate text-sm font-semibold ${selectedRow ? 'text-black' : 'text-white'}`}>{device.name}</h4>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedRow ? 'border-black/10 bg-black/5 text-black' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
                {deviceTypeLabel(device.type)}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedRow ? 'border-black/10 bg-black/5 text-black' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
                {device.operatingSystem}
              </span>
            </div>
            <p className={`mt-1 text-sm ${textTone}`}>
              {methodLabel(device.connectionMethod)} · {networkSummary(device)}
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusPillClass(isOnline(device))}`}>
            {isOnline(device) ? 'Online' : 'Offline'}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusPillClass(isPaired(device))}`}>
            {isPaired(device) ? 'Paired' : 'Unpaired'}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedRow ? 'border-black/10 bg-black/5 text-black' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
            {signalSummary(device)}
          </span>
          <span className={`text-xs ${textTone}`}>Last connection {formatRelativeTime(device.lastConnectedAt)}</span>
          <button
            type="button"
            onClick={event => {
              event.stopPropagation();
              onConnect();
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all ${actionButtonClass(selectedRow)}`}
          >
            <LockKeyhole className="h-4 w-4" />
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LiveRemoteView({ device, interactive }: { device: RemoteDevice; interactive: boolean }) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [frame, setFrame] = useState<{ imageDataUrl: string; capturedAt: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendInput = async (payload: Record<string, unknown>) => {
    if (!interactive || !device.bridgeUrl?.startsWith('http')) return;
    try {
      const response = await fetch(`${device.bridgeUrl.replace(/\/$/, '')}/api/remote-device/input`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id, ...payload }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { message?: string };
        setError(result.message ?? 'The device rejected the interaction.');
      }
    } catch {
      setError('The device interaction bridge is unreachable.');
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadFrame = async () => {
      if (!device.bridgeUrl?.startsWith('http')) {
        setError('This device has not provided a screen bridge.');
        return;
      }
      try {
        const response = await fetch(`${device.bridgeUrl.replace(/\/$/, '')}/api/remote-device/screen?deviceId=${encodeURIComponent(device.id)}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });
        const payload = (await response.json()) as { available?: boolean; imageDataUrl?: string; capturedAt?: number; message?: string };
        if (cancelled) return;
        if (!response.ok || !payload.available || !payload.imageDataUrl) {
          setError(payload.message ?? 'The device did not return a screen frame.');
          return;
        }
        setError(null);
        setFrame({ imageDataUrl: payload.imageDataUrl, capturedAt: payload.capturedAt ?? Date.now() });
      } catch {
        if (!cancelled) setError('The screen bridge is unreachable.');
      }
    };

    void loadFrame();
    const interval = window.setInterval(() => void loadFrame(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [device.bridgeUrl]);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        <span>Live screen</span>
        <span>{frame ? `Updated ${formatRelativeTime(frame.capturedAt)}` : 'Waiting for frame'}</span>
      </div>
      <div
        className={`relative flex aspect-video items-center justify-center bg-[#050505] outline-none ${interactive ? 'cursor-crosshair' : ''}`}
        tabIndex={interactive ? 0 : -1}
        onKeyDown={event => {
          if (!interactive || event.nativeEvent.isComposing) return;
          event.preventDefault();
          void sendInput({ action: 'key', key: event.key });
        }}
      >
        {frame ? (
          <img
            ref={imageRef}
            src={frame.imageDataUrl}
            alt={`Live view of ${device.name}`}
            className="h-full w-full object-contain"
            onClick={event => {
              if (!interactive || !imageRef.current) return;
              const bounds = imageRef.current.getBoundingClientRect();
              const scaleX = imageRef.current.naturalWidth / bounds.width;
              const scaleY = imageRef.current.naturalHeight / bounds.height;
              void sendInput({
                action: 'tap',
                x: Math.round((event.clientX - bounds.left) * scaleX),
                y: Math.round((event.clientY - bounds.top) * scaleY),
              });
            }}
          />
        ) : (
          <p className="px-5 text-center text-xs text-zinc-500">{error ?? 'Connecting to the screen bridge…'}</p>
        )}
        {interactive && frame ? <span className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/15 bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">Click screen · keyboard enabled</span> : null}
      </div>
    </div>
  );
}

function SessionCard({ session, device, onDisconnect }: { session: RemoteSession; device?: RemoteDevice; onDisconnect: () => void }) {
  const active = session.status === 'active';
  const chips = permissionSummary(session.grantedPermissions);
  const duration = formatDuration(Math.floor((now() - session.startedAt) / 1000));

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{session.deviceName}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {methodLabel(session.method)} · {active ? `Active for ${duration}` : `Started ${formatDateTime(session.startedAt)}`}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusPillClass(active)}`}>
          {active ? 'Active' : 'Ended'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {chips.length > 0 ? (
          chips.map(chip => (
            <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
              {chip}
            </span>
          ))
        ) : (
          <span className="text-xs text-zinc-500">No permissions recorded.</span>
        )}
      </div>

      <div className="mt-3 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
        <p>Start: {formatDateTime(session.startedAt)}</p>
        <p>End: {session.endedAt ? formatDateTime(session.endedAt) : 'Active now'}</p>
      </div>

      {active && device && session.grantedPermissions.viewScreen ? <LiveRemoteView device={device} interactive={session.grantedPermissions.controlScreen} /> : null}

      {active ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100"
        >
          <Power className="h-4 w-4" />
          Disconnect
        </button>
      ) : null}
    </div>
  );
}

function ConnectDialog({
  device,
  state,
  onClose,
  onRequestNewCode,
  onConfirmPairing,
  onStartSession,
  onToggleDraft,
  onChangeCodeEntry,
}: {
  device: RemoteDevice;
  state: ConnectState;
  onClose: () => void;
  onRequestNewCode: () => void;
  onConfirmPairing: () => void;
  onStartSession: () => void;
  onToggleDraft: (patch: Partial<ConnectDraft>) => void;
  onChangeCodeEntry: (value: string) => void;
}) {
  const permissionChips = [
    state.draft.viewScreen ? 'Screen' : null,
    state.draft.controlScreen ? 'Control' : null,
    state.draft.clipboard ? 'Clipboard' : null,
    state.draft.fileTransfer ? 'Files' : null,
  ].filter(Boolean) as string[];

  const transportAvailable = ['usb', 'wifi', 'lan', 'bluetooth'].includes(device.connectionMethod);
  const support = {
    // A discovered and authorized transport can receive a permission request
    // even when its first manifest did not include a complete capability list.
    // The companion device remains responsible for accepting or refusing it.
    viewScreen: Boolean(device.capabilities.screen || device.capabilities.screenControl || device.bridgeUrl || transportAvailable),
    controlScreen: Boolean(device.capabilities.screenControl || device.bridgeUrl || transportAvailable),
    clipboard: Boolean(device.capabilities.clipboard || device.bridgeUrl || transportAvailable),
    fileTransfer: Boolean(device.capabilities.files || device.bridgeUrl || transportAvailable),
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-[#0A0A0B] p-5 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Remote access request</p>
            <h2 className="mt-2 text-2xl font-semibold">{device.name}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {deviceTypeLabel(device.type)} · {device.operatingSystem} · {methodLabel(device.connectionMethod)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300 transition-colors hover:bg-white hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {state.error ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">{state.error}</div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Target device</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{device.name}</h3>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusPillClass(isPaired(device))}`}>
                  {isPaired(device) ? 'Paired' : 'Unpaired'}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Device ID" value={shortId(device.id)} />
                <InfoRow label="Platform" value={device.operatingSystem} />
                <InfoRow label="Connection" value={methodLabel(device.connectionMethod)} />
                <InfoRow label="Last connection" value={formatRelativeTime(device.lastConnectedAt)} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    {state.step === 'pairing' ? 'Pairing code' : 'Pairing verified'}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {state.step === 'pairing'
                      ? 'Enter the one-time code on the authorized target device and confirm it here.'
                      : 'The device is trusted. Choose the permissions you want to grant for this session.'}
                  </p>
                </div>

                {state.step === 'pairing' ? (
                  <button
                    type="button"
                    onClick={onRequestNewCode}
                    disabled={state.busy}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    New code
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                    <ShieldCheck className="h-4 w-4" />
                    Ready
                  </span>
                )}
              </div>

              {state.step === 'pairing' ? (
                <>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-xl tracking-[0.24em] text-white">
                    {state.pairing?.code ?? 'Waiting for code'}
                  </div>
                  <label className="mt-4 block space-y-2">
                    <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">Confirm code</span>
                    <input
                      value={state.codeEntry}
                      onChange={event => onChangeCodeEntry(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/25"
                      placeholder="Enter the pairing code"
                      autoComplete="one-time-code"
                    />
                  </label>
                </>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {permissionChips.length > 0 ? (
                    permissionChips.map(chip => (
                      <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                        {chip}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No permissions selected.</span>
                  )}
                </div>
              )}

              {state.step === 'pairing' ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-zinc-500">The target user must explicitly approve this connection.</p>
                  <button
                    type="button"
                    onClick={onConfirmPairing}
                    disabled={state.busy || !state.codeEntry.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Confirm code
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-zinc-500">Screen viewing is required to open a remote session.</p>
                  <button
                    type="button"
                    onClick={onStartSession}
                    disabled={state.busy || !state.draft.viewScreen}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Start session
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Requested permissions</p>
              <div className="mt-4 grid gap-3">
                {PERMISSION_TOGGLES.map(toggle => {
                  const checked = state.draft[toggle.key];
                  const disabled = state.busy || !support[toggle.key];

                  return (
                    <PermissionToggle
                      key={toggle.key}
                      checked={checked}
                      disabled={disabled}
                      label={toggle.label}
                      description={toggle.description}
                      onClick={() => {
                        if (disabled) return;
                        const next: Partial<ConnectDraft> = {};
                        if (toggle.key === 'viewScreen') {
                          next.viewScreen = !state.draft.viewScreen;
                          if (!next.viewScreen) next.controlScreen = false;
                        } else if (toggle.key === 'controlScreen') {
                          next.controlScreen = !state.draft.controlScreen;
                          if (next.controlScreen) next.viewScreen = true;
                        } else if (toggle.key === 'clipboard') {
                          next.clipboard = !state.draft.clipboard;
                        } else if (toggle.key === 'fileTransfer') {
                          next.fileTransfer = !state.draft.fileTransfer;
                        }
                        onToggleDraft(next);
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-3 text-xs leading-relaxed text-zinc-500">
                {support.viewScreen ? (
                  <p>Each permission is scoped independently. The session only gets the capabilities you turn on.</p>
                ) : (
                  <p>This device has not provided a screen bridge yet. The request will remain permission scoped.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Remote access request</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{device.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">Requested permissions</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {permissionChips.length > 0 ? (
                  permissionChips.map(chip => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {chip}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-zinc-500">None selected.</span>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Session options</p>
                  <p className="mt-1 text-xs text-zinc-500">Save the approved permissions for this trusted device.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleDraft({ persistPermissions: !state.draft.persistPermissions })}
                  className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                    state.draft.persistPermissions ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {state.draft.persistPermissions ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export const RemoteDevicesPage: React.FC = () => {
  const { toast } = useToast();
  const {
    state,
    discovery,
    loadingDiscovery,
    refreshDiscovery,
    createPairingAttempt,
    approvePairing,
    trustDevice,
    forgetDevice,
    disconnectDevice,
    startSession,
    stopSession,
    toggleClipboardSync,
  } = useRemoteDevices();

  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [connectState, setConnectState] = useState<ConnectState | null>(null);

  const discoveredIds = useMemo(() => new Set((discovery?.devices ?? []).map(device => device.id)), [discovery]);
  const allVisibleDevices = useMemo(
    () => state.devices.filter(device => discoveredIds.has(device.id) && !isLocalBridge(device)),
    [state.devices, discoveredIds]
  );
  const visibleDevices = useMemo(() => filterVisibleDevices(allVisibleDevices, filter), [allVisibleDevices, filter]);
  const trustedDevices = useMemo(
    () => state.devices.filter(device => !isLocalBridge(device) && device.trusted).sort((a, b) => (b.lastConnectedAt ?? 0) - (a.lastConnectedAt ?? 0)),
    [state.devices]
  );
  const activeSessions = useMemo(
    () =>
      state.sessions.filter(session => {
        const device = state.devices.find(item => item.id === session.deviceId);
        return session.status === 'active' && Boolean(device) && !isLocalBridge(device!);
      }),
    [state.devices, state.sessions]
  );
  const sessionHistory = useMemo(
    () =>
      [...state.sessions]
        .filter(session => {
          const device = state.devices.find(item => item.id === session.deviceId);
          return Boolean(device) && !isLocalBridge(device!);
        })
        .sort((a, b) => b.startedAt - a.startedAt)
        .slice(0, 4),
    [state.devices, state.sessions]
  );

  const selectedDevice = useMemo(
    () => visibleDevices.find(device => device.id === selectedDeviceId) ?? visibleDevices[0] ?? null,
    [selectedDeviceId, visibleDevices]
  );
  const selectedSession = useMemo(
    () => activeSessions.find(session => session.deviceId === selectedDevice?.id) ?? null,
    [activeSessions, selectedDevice?.id]
  );
  const activeSession = activeSessions[0] ?? null;

  const scanForDevices = async () => {
    const snapshot = await refreshDiscovery({ interactive: true });
    if (!snapshot) {
      toast('Device scan failed. Check the companion service and try again.', 'error');
      return;
    }

    const usbCount = snapshot.connectionHealth.find(item => item.method === 'usb')?.activeCount ?? 0;
    const usbDevices = snapshot.devices.filter(device => device.connectionMethod === 'usb' || device.connectionMethods?.includes('usb'));

    if (usbCount > 0 || usbDevices.length > 0) {
      toast(`${usbDevices[0]?.name ?? `${usbCount} USB device${usbCount === 1 ? '' : 's'}`} detected via USB. Select it below to connect.`, 'success');
    } else {
      toast('USB scan complete. Connect an authorized device by cable and scan again.', 'info');
    }
  };

  useEffect(() => {
    if (visibleDevices.length === 0) {
      if (selectedDeviceId !== null) {
        setSelectedDeviceId(null);
      }
      return;
    }

    if (!selectedDeviceId || !visibleDevices.some(device => device.id === selectedDeviceId)) {
      setSelectedDeviceId(visibleDevices[0].id);
    }
  }, [selectedDeviceId, visibleDevices]);

  useEffect(() => {
    if (!connectState) return;
    const device = state.devices.find(item => item.id === connectState.deviceId);
    if (!device) {
      setConnectState(null);
    }
  }, [connectState, state.devices]);

  const readyStatus = loadingDiscovery ? 'Scanning' : state.lastDiscoveryError ? 'Attention' : 'Ready';
  const bridgeLabel = discovery?.host.deviceName ?? 'Local bridge';
  const discoveredCount = allVisibleDevices.length;
  const pairedCount = allVisibleDevices.filter(device => device.trusted).length;
  const activeCount = activeSessions.length;

  const openConnect = async (device: RemoteDevice) => {
    setSelectedDeviceId(device.id);

    const usbScreenReady =
      device.connectionMethod === 'usb' &&
      device.capabilities.screen &&
      Boolean(device.bridgeUrl?.startsWith('http'));

    if (usbScreenReady) {
      const draft = applyDraftRules(buildDraft(device), { viewScreen: true });
      const permissions = draftToPermissions(draft);
      startSession(device.id, permissions, { persistPermissions: true });
      trustDevice(device.id);
      toast(`${device.name} connected via USB. Live screen sharing is active.`, 'success');
      void refreshDiscovery();
      return;
    }

    setConnectState({
      deviceId: device.id,
      step: isPaired(device) ? 'permissions' : 'pairing',
      pairing: null,
      codeEntry: '',
      draft: buildDraft(device),
      busy: !isPaired(device),
      error: null,
    });

    if (isPaired(device)) {
      return;
    }

    try {
      const created = await createPairingAttempt(device.id, device.connectionMethod);
      setConnectState(current =>
        current && current.deviceId === device.id
          ? {
              ...current,
              pairing: created,
              codeEntry: created.code,
              step: 'pairing',
              busy: false,
              error: null,
            }
          : current
      );
      toast(`Pairing code generated for ${device.name}.`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start pairing.';
      setConnectState(null);
      toast(message, 'error');
    }
  };

  const requestNewPairingCode = async () => {
    if (!connectState) return;
    const device = state.devices.find(item => item.id === connectState.deviceId);
    if (!device) return;

    setConnectState(current => (current ? { ...current, busy: true, error: null, step: 'pairing' } : current));

    try {
      const created = await createPairingAttempt(device.id, device.connectionMethod);
      setConnectState(current =>
        current && current.deviceId === device.id
          ? {
              ...current,
              pairing: created,
              codeEntry: created.code,
              step: 'pairing',
              busy: false,
              error: null,
            }
          : current
      );
      toast(`New pairing code generated for ${device.name}.`, 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to request a new pairing code.';
      setConnectState(current => (current ? { ...current, busy: false, error: message } : current));
      toast(message, 'error');
    }
  };

  const confirmPairing = async () => {
    if (!connectState) return;
    const device = state.devices.find(item => item.id === connectState.deviceId);
    if (!device) return;

    setConnectState(current => (current ? { ...current, busy: true, error: null } : current));

    try {
      const approved = await approvePairing(device.id, connectState.codeEntry);
      if (!approved) {
        setConnectState(current => (current ? { ...current, busy: false, error: 'The pairing code did not match or expired.' } : current));
        toast('Pairing code did not match or expired.', 'warning');
        return;
      }

      setConnectState(current =>
        current && current.deviceId === device.id
          ? {
              ...current,
              step: 'permissions',
              busy: false,
              error: null,
            }
          : current
      );
      toast('Device pairing approved.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to approve pairing.';
      setConnectState(current => (current ? { ...current, busy: false, error: message } : current));
      toast(message, 'error');
    }
  };

  const handleToggleDraft = (patch: Partial<ConnectDraft>) => {
    setConnectState(current => {
      if (!current) return current;
      return {
        ...current,
        draft: applyDraftRules(current.draft, patch),
      };
    });
  };

  const startConnection = () => {
    if (!connectState) return;
    const device = state.devices.find(item => item.id === connectState.deviceId);
    if (!device) return;
    if (!connectState.draft.viewScreen) {
      setConnectState(current => (current ? { ...current, error: 'Screen viewing is required to open a session.' } : current));
      toast('Screen viewing is required to open a session.', 'warning');
      return;
    }

    const permissions = draftToPermissions(connectState.draft);
    startSession(device.id, permissions, { persistPermissions: connectState.draft.persistPermissions });
    if (permissions.useClipboard) {
      toggleClipboardSync(device.id, true);
    }
    trustDevice(device.id);

    toast(`Remote session started for ${device.name}.`, 'success');
    void refreshDiscovery();
    setConnectState(null);
  };

  const disconnectActiveSession = (session: RemoteSession) => {
    stopSession(session.id);
    const device = state.devices.find(item => item.id === session.deviceId);
    toast(`${device?.name ?? session.deviceName} disconnected.`, 'info');
  };

  const handleForgetDevice = (device: RemoteDevice) => {
    const confirmed = window.confirm(`Forget ${device.name}? This removes trust and saved permissions.`);
    if (!confirmed) return;
    disconnectDevice(device.id);
    forgetDevice(device.id);
    toast(`Forgot ${device.name}.`, 'info');
    if (selectedDevice?.id === device.id) {
      setSelectedDeviceId(null);
    }
  };

  const activeSessionForSelected = selectedDevice ? activeSessions.find(session => session.deviceId === selectedDevice.id) ?? null : null;

  return (
    <div className="space-y-4 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Communication
            </div>
            <div>
              <h1 className="text-3xl font-semibold uppercase tracking-tight sm:text-4xl">REMOTE ACCESS</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
                Discover authorized devices, pair only when the target user approves, and start a session with the exact permissions you choose.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${readyStatus === 'Ready' ? 'border-white bg-white text-black' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Status: {readyStatus}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                <SignalHigh className="h-3.5 w-3.5" />
                Bridge: {bridgeLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                <Clock3 className="h-3.5 w-3.5" />
                Last scan: {formatRelativeTime(state.lastDiscoveryAt)}
              </span>
            </div>
            {state.lastDiscoveryError ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                <AlertTriangle className="h-4 w-4" />
                {state.lastDiscoveryError}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void scanForDevices()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
            >
              {loadingDiscovery ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Scan Devices
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedDevice) {
                  void openConnect(selectedDevice);
                }
              }}
              disabled={!selectedDevice || loadingDiscovery}
              className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole className="h-4 w-4" />
              Connect Device
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <InfoRow label="Discovered" value={`${discoveredCount}`} />
          <InfoRow label="Paired" value={`${pairedCount}`} />
          <InfoRow label="Active sessions" value={`${activeCount}`} />
          <InfoRow label="Selected device" value={selectedDevice?.name ?? 'None'} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Connection filters</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FILTERS.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                    filter === item.id
                      ? 'border-white bg-white text-black'
                      : 'border-white/10 bg-black/20 text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Discovered devices</p>
                <p className="mt-2 text-sm text-zinc-400">Only currently discovered, authorized devices appear in this list.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
                {visibleDevices.length} found
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {visibleDevices.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
                    <TabletSmartphone className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-white">No compatible devices discovered.</p>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    Run a scan to look for authorized USB, Bluetooth, Wi-Fi, hotspot, or LAN companion devices.
                  </p>
                  <button
                    type="button"
                    onClick={() => void scanForDevices()}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100"
                  >
                    {loadingDiscovery ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Scan Devices
                  </button>
                </div>
              ) : (
                visibleDevices.map(device => (
                  <DeviceRow
                    key={device.id}
                    device={device}
                    selected={selectedDevice?.id === device.id}
                    onSelect={() => setSelectedDeviceId(device.id)}
                    onConnect={() => void openConnect(device)}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <Card
            title="Selected device"
            description="Quick details for the device currently in focus."
            icon={<ShieldCheck className="h-5 w-5" />}
          >
            {selectedDevice ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedDevice.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {selectedDevice.operatingSystem} · {deviceTypeLabel(selectedDevice.type)}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusPillClass(isPaired(selectedDevice))}`}>
                    {isPaired(selectedDevice) ? 'Paired' : 'Unpaired'}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Device ID" value={shortId(selectedDevice.id)} />
                  <InfoRow label="Last connection" value={formatRelativeTime(selectedDevice.lastConnectedAt)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openConnect(selectedDevice)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    Connect
                  </button>
                  {activeSessionForSelected ? (
                    <button
                      type="button"
                      onClick={() => disconnectActiveSession(activeSessionForSelected)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                    >
                      <Power className="h-4 w-4" />
                      Disconnect
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleForgetDevice(selectedDevice)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Forget
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {permissionSummary(selectedDevice.permissions).length > 0 ? (
                    permissionSummary(selectedDevice.permissions).map(chip => (
                      <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
                        {chip}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500">No saved permissions.</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Select a discovered device to view its details.</p>
            )}
          </Card>

          {activeSession ? (
            <Card
              title="Remote session"
              description="A live session is currently active."
              icon={<Power className="h-5 w-5" />}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">{activeSession.deviceName}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {methodLabel(activeSession.method)} · {formatDuration(Math.floor((now() - activeSession.startedAt) / 1000))}
                    </p>
                  </div>
                  <span className="rounded-full border border-white bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                    Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {permissionSummary(activeSession.grantedPermissions).map(chip => (
                    <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
                      {chip}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => disconnectActiveSession(activeSession)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100"
                >
                  <Power className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </Card>
          ) : null}

          <Card
            title="Trusted devices"
            description="Previously paired devices that can reconnect without re-running discovery."
            icon={<ShieldCheck className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {trustedDevices.length === 0 ? (
                <p className="text-sm text-zinc-500">No trusted devices yet.</p>
              ) : (
                trustedDevices.slice(0, 4).map(device => (
                  <div key={device.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{device.name}</p>
                        <p className="mt-1 text-[11px] text-zinc-500">Device ID {shortId(device.id)}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {device.operatingSystem} · Last connected {formatRelativeTime(device.lastConnectedAt)}
                        </p>
                      </div>
                      <span className="rounded-full border border-white bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black">
                        Trusted
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {permissionSummary(device.permissions).length > 0 ? (
                        permissionSummary(device.permissions).map(chip => (
                          <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300">
                            {chip}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500">No saved permissions.</span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void openConnect(device)}
                        className="rounded-full bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-zinc-100"
                      >
                        Reconnect
                      </button>
                      <button
                        type="button"
                        onClick={() => handleForgetDevice(device)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                      >
                        Forget
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card
            title="Session history"
            description="Recent remote access sessions with start, end, and permission details."
            icon={<Clock3 className="h-5 w-5" />}
          >
            <div className="space-y-3">
              {sessionHistory.length === 0 ? (
                <p className="text-sm text-zinc-500">No session history yet.</p>
              ) : (
                sessionHistory.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    device={state.devices.find(device => device.id === session.deviceId)}
                    onDisconnect={() => disconnectActiveSession(session)}
                  />
                ))
              )}
            </div>
          </Card>
        </aside>
      </div>

      {connectState && selectedDevice ? (
        <ConnectDialog
          device={selectedDevice}
          state={connectState}
          onClose={() => setConnectState(null)}
          onRequestNewCode={() => void requestNewPairingCode()}
          onConfirmPairing={() => void confirmPairing()}
          onStartSession={startConnection}
          onToggleDraft={handleToggleDraft}
          onChangeCodeEntry={value => {
            setConnectState(current => (current ? { ...current, codeEntry: value, error: null } : current));
          }}
        />
      ) : null}
    </div>
  );
};

export default RemoteDevicesPage;
