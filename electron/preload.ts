import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('remoteDeviceBridge', {
  discoverDevices: () => ipcRenderer.invoke('remote-devices:discover'),
  discoverUsbDevices: () => ipcRenderer.invoke('remote-devices:discover-usb'),
  discoverBluetoothDevices: () => ipcRenderer.invoke('remote-devices:discover-bluetooth'),
  discoverNetworkDevices: () => ipcRenderer.invoke('remote-devices:discover-network'),
  getHostSnapshot: () => ipcRenderer.invoke('remote-devices:host'),
  getSystemSnapshot: (deviceId: string) => ipcRenderer.invoke('remote-devices:system', deviceId),
  getNetworkSnapshot: (deviceId: string) => ipcRenderer.invoke('remote-devices:network', deviceId),
  listProcesses: (deviceId: string) => ipcRenderer.invoke('remote-devices:processes', deviceId),
  listFiles: (deviceId: string, directory: string) => ipcRenderer.invoke('remote-devices:files', deviceId, directory),
  runTerminalCommand: (deviceId: string, command: string) => ipcRenderer.invoke('remote-devices:terminal', deviceId, command),
  disconnectAll: () => ipcRenderer.invoke('remote-devices:disconnect-all'),
  disconnectDevice: (deviceId: string) => ipcRenderer.invoke('remote-devices:disconnect', deviceId),
  forgetDevice: (deviceId: string) => ipcRenderer.invoke('remote-devices:forget', deviceId),
  approvePairing: (deviceId: string, code: string) => ipcRenderer.invoke('remote-devices:pairing', deviceId, code),
  setClipboardSync: (deviceId: string, enabled: boolean) => ipcRenderer.invoke('remote-devices:clipboard', deviceId, enabled),
  startSession: (deviceId: string) => ipcRenderer.invoke('remote-devices:session-start', deviceId),
  stopSession: (sessionId: string) => ipcRenderer.invoke('remote-devices:session-stop', sessionId),
});

