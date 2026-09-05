import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

const AGENT_PORT = Number(process.env.REMOTE_DEVICE_AGENT_PORT ?? 8787);
let agentProcess: ChildProcess | null = null;

function pythonExecutable(): string {
  return process.env.REMOTE_DEVICE_PYTHON ?? (process.platform === 'win32' ? 'python' : 'python3');
}

function agentScriptPath(): string {
  return path.join(app.getAppPath(), 'python', 'device_service', 'agent.py');
}

async function ensureAgent(): Promise<void> {
  if (agentProcess) return;
  agentProcess = spawn(pythonExecutable(), [agentScriptPath(), '--host', '127.0.0.1', '--port', String(AGENT_PORT)], {
    stdio: 'ignore',
    windowsHide: true,
  });
}

async function serviceFetch(pathname: string, init?: RequestInit): Promise<Response> {
  await ensureAgent();
  const baseUrl = `http://127.0.0.1:${AGENT_PORT}`;
  return fetch(`${baseUrl}${pathname}`, init);
}

async function serviceFetchJson(pathname: string, init?: RequestInit): Promise<unknown> {
  const response = await serviceFetch(pathname, init);
  if (!response.ok) {
    throw new Error(`Remote device service request failed: ${response.status}`);
  }
  return response.json();
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1600,
    height: 1024,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(app.getAppPath(), 'dist-electron', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devUrl = process.env.ELECTRON_START_URL ?? process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    void win.loadURL(devUrl);
  } else {
    void win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
  return win;
}

app.whenReady().then(async () => {
  await ensureAgent();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (agentProcess && !agentProcess.killed) {
    agentProcess.kill();
  }
});

ipcMain.handle('remote-devices:discover', async () => serviceFetchJson('/api/remote-device/discover'));
ipcMain.handle('remote-devices:discover-usb', async () => {
  const manifest = await serviceFetchJson('/.well-known/remote-device.json');
  return [manifest];
});
ipcMain.handle('remote-devices:discover-bluetooth', async () => []);
ipcMain.handle('remote-devices:discover-network', async () => {
  const snapshot = await serviceFetchJson('/api/remote-device/discover') as { devices?: unknown[] };
  return Array.isArray(snapshot.devices) ? snapshot.devices : [];
});
ipcMain.handle('remote-devices:host', async () => serviceFetchJson('/api/remote-device/system'));
ipcMain.handle('remote-devices:system', async (_event, deviceId: string) => serviceFetchJson('/api/remote-device/system?deviceId=' + encodeURIComponent(deviceId)));
ipcMain.handle('remote-devices:network', async (_event, deviceId: string) => serviceFetchJson('/api/remote-device/network?deviceId=' + encodeURIComponent(deviceId)));
ipcMain.handle('remote-devices:processes', async () => serviceFetchJson('/api/remote-device/processes'));
ipcMain.handle('remote-devices:files', async (_event, deviceId: string, directory: string) =>
  serviceFetchJson('/api/remote-device/files?deviceId=' + encodeURIComponent(deviceId) + '&path=' + encodeURIComponent(directory))
);
ipcMain.handle('remote-devices:terminal', async (_event, deviceId: string, command: string) =>
  serviceFetchJson('/api/remote-device/terminal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, command }),
  })
);
ipcMain.handle('remote-devices:disconnect-all', async () => ({ ok: true }));
ipcMain.handle('remote-devices:disconnect', async () => ({ ok: true }));
ipcMain.handle('remote-devices:forget', async () => ({ ok: true }));
ipcMain.handle('remote-devices:pairing', async () => ({ ok: true }));
ipcMain.handle('remote-devices:clipboard', async () => ({ ok: true }));
ipcMain.handle('remote-devices:session-start', async () => ({ ok: true }));
ipcMain.handle('remote-devices:session-stop', async () => ({ ok: true }));
