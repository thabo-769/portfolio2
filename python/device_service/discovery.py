from __future__ import annotations

import os
import platform
import re
import shutil
import socket
import subprocess
import sys
import time
import ipaddress
import json
import base64
import io
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import psutil  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    psutil = None

try:
    from PIL import ImageGrab  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    ImageGrab = None


def _run(command: List[str], timeout: int = 12) -> str:
    try:
      completed = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
      output = (completed.stdout or completed.stderr or "").strip()
      return output
    except Exception:
      return ""


def _run_bytes(command: List[str], timeout: int = 12) -> bytes:
    try:
        completed = subprocess.run(command, capture_output=True, timeout=timeout, check=False)
        return completed.stdout or b""
    except Exception:
        return b""


def _try_json(command: List[str], timeout: int = 12) -> Any:
    import json

    output = _run(command, timeout=timeout)
    if not output:
        return []
    try:
        return json.loads(output)
    except Exception:
        return output


def _safe_int(value: Any) -> Optional[int]:
    try:
        if value is None:
            return None
        return int(float(value))
    except Exception:
        return None


def _safe_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except Exception:
        return None


def get_local_ip() -> Optional[str]:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.connect(("8.8.8.8", 80))
            return sock.getsockname()[0]
    except Exception:
        return None


def get_local_networks() -> List[ipaddress.IPv4Network]:
    """Return private IPv4 networks for active interfaces, including common hotspots."""
    networks: List[ipaddress.IPv4Network] = []

    if psutil is not None:
        try:
            for addresses in psutil.net_if_addrs().values():
                for address in addresses:
                    if address.family != socket.AF_INET or not address.address or not address.netmask:
                        continue
                    try:
                        network = ipaddress.ip_network(f"{address.address}/{address.netmask}", strict=False)
                    except ValueError:
                        continue
                    if network.is_private and network not in networks:
                        networks.append(network)
        except Exception:
            pass

    local_ip = get_local_ip()
    if local_ip:
        try:
            fallback = ipaddress.ip_network(f"{local_ip}/24", strict=False)
            if fallback not in networks:
                networks.append(fallback)
        except ValueError:
            pass

    # Windows and phone hotspots commonly use one of these private ranges.
    for candidate in ("192.168.43.0/24", "192.168.137.0/24", "172.20.10.0/28"):
        network = ipaddress.ip_network(candidate)
        if network not in networks:
            networks.append(network)

    return networks


def get_hostname() -> str:
    return socket.gethostname() or platform.node() or "unknown"


def get_os_name() -> str:
    return f"{platform.system()} {platform.release()}".strip()


def get_uptime_seconds() -> Optional[int]:
    if psutil is not None:
        try:
            return _safe_int(time.time() - psutil.boot_time())
        except Exception:
            pass
    if platform.system() == "Windows":
        output = _run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime"])
        return None if not output else None
    return None


def get_battery_level() -> Optional[int]:
    if psutil is not None:
        try:
            battery = psutil.sensors_battery()
            if battery is not None:
                return _safe_int(battery.percent)
        except Exception:
            pass

    if platform.system() == "Windows":
        output = _run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_Battery | Select-Object -First 1 -ExpandProperty EstimatedChargeRemaining)"])
        return _safe_int(output)
    return None


def get_cpu_name() -> Optional[str]:
    cpu = platform.processor() or platform.machine() or ""
    return cpu or None


def get_memory_gb() -> Optional[float]:
    if psutil is not None:
        try:
            return round(psutil.virtual_memory().total / 1024 / 1024 / 1024, 1)
        except Exception:
            pass
    return None


def get_storage_gb() -> Optional[float]:
    try:
        usage = shutil.disk_usage(Path.cwd())
        return round(usage.total / 1024 / 1024 / 1024, 1)
    except Exception:
        return None


def get_temperature_c() -> Optional[float]:
    if psutil is not None:
        try:
            temps = psutil.sensors_temperatures(fahrenheit=False)
            for entries in temps.values():
                for entry in entries:
                    return _safe_float(entry.current)
        except Exception:
            pass
    return None


def capture_screen_png() -> Optional[Dict[str, Any]]:
    if ImageGrab is None:
        return None
    try:
        image = ImageGrab.grab(all_screens=True)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        return {
            "imageDataUrl": "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii"),
            "width": image.width,
            "height": image.height,
            "capturedAt": int(time.time() * 1000),
        }
    except Exception:
        return None


def get_gateway() -> Optional[str]:
    system = platform.system()
    if system == "Windows":
        output = _run(["powershell", "-NoProfile", "-Command", "(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway } | Select-Object -First 1 -ExpandProperty IPv4DefaultGateway | Select-Object -ExpandProperty NextHop)"])
        return output or None
    if system == "Darwin":
        output = _run(["sh", "-lc", "route -n get default | awk '/gateway:/{print $2}'"])
        return output or None
    output = _run(["sh", "-lc", "ip route | awk '/default/ {print $3; exit}'"])
    return output or None


def get_ssid() -> Optional[str]:
    system = platform.system()
    if system == "Windows":
        output = _run(["powershell", "-NoProfile", "-Command", "(netsh wlan show interfaces | Select-String 'SSID' | Select-Object -First 1).ToString()"])
        if ":" in output:
            return output.split(":", 1)[-1].strip() or None
        return output or None
    if system == "Darwin":
        output = _run(["sh", "-lc", "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | awk -F': ' '/ SSID/ {print $2; exit}'"])
        return output or None
    output = _run(["sh", "-lc", "iwgetid -r 2>/dev/null || nmcli -t -f active,ssid dev wifi | awk -F: '$1==\"yes\" {print $2; exit}'"])
    return output or None


def discover_usb_devices() -> List[Dict[str, Any]]:
    adb = shutil.which("adb")
    if adb:
        output = _run([adb, "devices", "-l"])
        devices: List[Dict[str, Any]] = []
        for line in output.splitlines()[1:]:
            parts = line.split()
            if len(parts) < 2 or parts[1] != "device":
                continue
            serial = parts[0]
            model = next((part.split(":", 1)[1].replace("_", " ") for part in parts[2:] if part.startswith("model:")), "Android device")
            devices.append({
                "id": f"adb-{serial}",
                "serial": serial,
                "name": model,
                "type": "phone",
                "operatingSystem": "Android",
                "connectionMethod": "usb",
                "connectionMethods": ["usb"],
                "bridgeUrl": f"http://127.0.0.1:{os.environ.get('REMOTE_DEVICE_AGENT_PORT', '8787')}",
                "transportSecurity": "http",
                "lastSeenAt": int(time.time() * 1000),
                "connectionQuality": 92,
                "capabilities": {"screen": True, "screenControl": True, "files": True, "clipboard": True},
                "notes": "Authorized Android device discovered through USB debugging.",
            })
        if devices:
            return devices

    system = platform.system()
    if system == "Windows":
        raw = _try_json([
            "powershell",
            "-NoProfile",
            "-Command",
            "Get-PnpDevice -PresentOnly | Where-Object { $_.InstanceId -like 'USB*' } | Select-Object FriendlyName, InstanceId, Class, Status | ConvertTo-Json -Depth 4",
        ])
        if isinstance(raw, list):
            return raw
        if isinstance(raw, dict):
            return [raw]
        return [{"name": str(raw)}] if raw else []
    if system == "Darwin":
        output = _run(["sh", "-lc", "system_profiler SPUSBDataType -json"])
        return [{"summary": output[:4000]}] if output else []
    output = _run(["sh", "-lc", "lsusb"])
    return [{"summary": output}] if output else []


def discover_bluetooth_devices() -> List[Dict[str, Any]]:
    system = platform.system()
    if system == "Windows":
        raw = _try_json([
            "powershell",
            "-NoProfile",
            "-Command",
            "Get-PnpDevice -Class Bluetooth | Select-Object FriendlyName, InstanceId, Status | ConvertTo-Json -Depth 4",
        ])
        if isinstance(raw, list):
            return raw
        if isinstance(raw, dict):
            return [raw]
        return [{"name": str(raw)}] if raw else []
    if system == "Darwin":
        output = _run(["sh", "-lc", "system_profiler SPBluetoothDataType -json"])
        return [{"summary": output[:4000]}] if output else []
    output = _run(["sh", "-lc", "bluetoothctl devices 2>/dev/null"])
    return [{"summary": output}] if output else []


def discover_network_devices(port: int = 8787, timeout: float = 0.35) -> List[Dict[str, Any]]:
    """Find companion agents on active Wi-Fi, Ethernet, and phone-hotspot networks."""
    networks = get_local_networks()
    if not networks:
        return []

    local_addresses = {getattr(address, "address", "") for addresses in (psutil.net_if_addrs().values() if psutil is not None else []) for address in addresses if address.family == socket.AF_INET}
    addresses = sorted({str(address) for network in networks for address in network.hosts() if str(address) not in local_addresses})

    def probe(address: str) -> Optional[Dict[str, Any]]:
        url = f"http://{address}:{port}/.well-known/remote-device.json"
        try:
            request = urllib.request.Request(url, headers={"Accept": "application/json"})
            with urllib.request.urlopen(request, timeout=timeout) as response:
                payload = json.loads(response.read().decode("utf-8"))
            if not isinstance(payload, dict) or not payload.get("id"):
                return None
            payload["connectionMethod"] = "lan"
            payload["connectionMethods"] = list(set(payload.get("connectionMethods", []) + ["lan", "wifi"]))
            payload["bridgeUrl"] = payload.get("bridgeUrl") or url.rsplit("/", 1)[0]
            payload["transportSecurity"] = "https" if str(payload["bridgeUrl"]).startswith("https://") else "http"
            return payload
        except (OSError, ValueError, urllib.error.URLError, json.JSONDecodeError):
            return None

    devices: List[Dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=32) as executor:
        futures = [executor.submit(probe, address) for address in addresses]
        for future in as_completed(futures):
            device = future.result()
            if device:
                devices.append(device)
    return devices


def capture_adb_screen(serial: str) -> Optional[Dict[str, Any]]:
    adb = shutil.which("adb")
    if not adb:
        return None
    payload = _run_bytes([adb, "-s", serial, "exec-out", "screencap", "-p"], timeout=15)
    if not payload:
        return None
    try:
        from PIL import Image  # type: ignore
        image = Image.open(io.BytesIO(payload))
        return {
            "imageDataUrl": "data:image/png;base64," + base64.b64encode(payload).decode("ascii"),
            "width": image.width,
            "height": image.height,
            "capturedAt": int(time.time() * 1000),
        }
    except Exception:
        return None


def send_adb_input(serial: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    adb = shutil.which("adb")
    if not adb:
        return {"ok": False, "message": "ADB is not installed on this laptop."}

    action = str(payload.get("action", ""))
    if action == "tap":
        x = _safe_int(payload.get("x"))
        y = _safe_int(payload.get("y"))
        if x is None or y is None:
            return {"ok": False, "message": "Tap coordinates are required."}
        _run([adb, "-s", serial, "shell", "input", "tap", str(max(0, x)), str(max(0, y))], timeout=5)
        return {"ok": True}

    if action == "key":
        key = str(payload.get("key", ""))
        keycodes = {
            "Enter": "KEYCODE_ENTER",
            "Backspace": "KEYCODE_DEL",
            "Escape": "KEYCODE_ESCAPE",
            "Tab": "KEYCODE_TAB",
            "ArrowUp": "KEYCODE_DPAD_UP",
            "ArrowDown": "KEYCODE_DPAD_DOWN",
            "ArrowLeft": "KEYCODE_DPAD_LEFT",
            "ArrowRight": "KEYCODE_DPAD_RIGHT",
            "Home": "KEYCODE_HOME",
            "End": "KEYCODE_MOVE_END",
            "Space": "KEYCODE_SPACE",
        }
        keycode = keycodes.get(key)
        if not keycode and len(key) == 1 and key.isalnum():
            keycode = f"KEYCODE_{key.upper()}"
        if not keycode:
            return {"ok": False, "message": "This keyboard key is not supported."}
        _run([adb, "-s", serial, "shell", "input", "keyevent", keycode], timeout=5)
        return {"ok": True}

    return {"ok": False, "message": "Unsupported remote input action."}


def list_processes() -> List[Dict[str, Any]]:
    if psutil is not None:
        try:
            processes: List[Dict[str, Any]] = []
            for proc in psutil.process_iter(attrs=["pid", "name", "username", "cpu_percent", "memory_info", "status"]):
                info = proc.info
                processes.append(
                    {
                        "pid": info.get("pid"),
                        "name": info.get("name") or "unknown",
                        "user": info.get("username"),
                        "cpuPercent": info.get("cpu_percent"),
                        "memoryMb": round((info.get("memory_info").rss if info.get("memory_info") else 0) / 1024 / 1024, 1),
                        "status": info.get("status") or "unknown",
                    }
                )
            return processes
        except Exception:
            pass

    system = platform.system()
    if system == "Windows":
        raw = _run(["powershell", "-NoProfile", "-Command", "Get-Process | Select-Object Name,Id,CPU,WS,Responding | ConvertTo-Json -Depth 4"])
        return [{"summary": raw[:5000]}] if raw else []

    output = _run(["sh", "-lc", "ps -eo pid,comm,pcpu,rss,user,state --sort=-pcpu | head -n 100"])
    return [{"summary": output}] if output else []


def list_files(directory: str) -> List[Dict[str, Any]]:
    path = Path(directory).expanduser()
    if not path.exists() or not path.is_dir():
        return []

    entries: List[Dict[str, Any]] = []
    for child in sorted(path.iterdir(), key=lambda item: (item.is_file(), item.name.lower())):
        try:
            stat = child.stat()
            entries.append(
                {
                    "path": str(child),
                    "name": child.name,
                    "kind": "directory" if child.is_dir() else "file",
                    "size": stat.st_size,
                    "modifiedAt": int(stat.st_mtime * 1000),
                    "permissions": "read/write" if os.access(child, os.W_OK) else "read-only",
                }
            )
        except Exception:
            continue
    return entries


def run_terminal_command(command: str) -> Dict[str, Any]:
    command = command.strip()
    if not command:
        return {"output": "", "exitCode": 0}

    allowed = {
        "hostname", "whoami", "ver", "uname", "systeminfo", "ipconfig",
        "ifconfig", "ip", "ping", "tasklist", "ps", "df", "free", "uptime",
    }
    parts = command.split()
    executable_name = parts[0].lower()
    if executable_name not in allowed or any(re.search(r"[;&|<>`$]", part) for part in parts):
        return {"output": "Command blocked. Only approved read-only diagnostics are available.", "exitCode": 126}

    executable = shutil.which(parts[0])
    if executable_name == "ver" and platform.system() == "Windows":
        executable = shutil.which("cmd")
        parts = [executable, "/c", "ver"] if executable else parts
    if not executable:
        return {"output": f"Command not available: {parts[0]}", "exitCode": 127}

    try:
        completed = subprocess.run(
            parts,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        output = (completed.stdout or "") + (completed.stderr or "")
        return {"output": output.strip(), "exitCode": int(completed.returncode)}
    except Exception as exc:
        return {"output": str(exc), "exitCode": 1}


def build_host_snapshot(base_url: Optional[str] = None) -> Dict[str, Any]:
    local_ip = get_local_ip()
    capability = {
        "screen": ImageGrab is not None,
        "screenControl": False,
        "files": True,
        "terminal": True,
        "processes": True,
        "system": True,
        "network": True,
        "clipboard": False,
        "messages": False,
        "logs": True,
    }

    return {
        "deviceId": f"host-{get_hostname()}",
        "deviceName": get_hostname(),
        "operatingSystem": platform.system() if platform.system() in {"Windows", "Linux", "Darwin"} else "Unknown",
        "deviceType": "desktop",
        "connectionMethod": "lan",
        "batteryLevel": get_battery_level(),
        "ipAddress": local_ip,
        "gateway": get_gateway(),
        "ssid": get_ssid(),
        "connectionQuality": 80 if local_ip else 50,
        "networkLatencyMs": None,
        "uptimeSeconds": get_uptime_seconds(),
        "cpu": get_cpu_name(),
        "memoryGb": get_memory_gb(),
        "storageGb": get_storage_gb(),
        "temperatureC": get_temperature_c(),
        "capabilities": capability,
        "bridgeUrl": base_url,
        "transportSecurity": "https" if base_url and base_url.startswith("https://") else "http",
        "softwareVersion": platform.version(),
        "notes": "Authorized companion device service.",
    }
