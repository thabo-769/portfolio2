from __future__ import annotations

import argparse
import json
import os
import ssl
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

try:
    from .discovery import (
        build_host_snapshot,
        capture_adb_screen,
        capture_screen_png,
        discover_bluetooth_devices,
        discover_network_devices,
        discover_usb_devices,
        list_files,
        list_processes,
        run_terminal_command,
        send_adb_input,
    )
except ImportError:
    # Supports both module execution and Electron's direct child-process launch.
    from discovery import (  # type: ignore[no-redef]
        build_host_snapshot,
        capture_adb_screen,
        capture_screen_png,
        discover_bluetooth_devices,
        discover_network_devices,
        discover_usb_devices,
        list_files,
        list_processes,
        run_terminal_command,
        send_adb_input,
    )


def _json_default(value):
    try:
        return value.__dict__
    except Exception:
        return str(value)


class RemoteDeviceHandler(BaseHTTPRequestHandler):
    server_version = "RemoteDeviceAgent/1.0"

    @property
    def token(self) -> str:
      return getattr(self.server, "auth_token", "")

    @property
    def base_url(self) -> str:
      return getattr(self.server, "base_url", "")

    def _authorized(self) -> bool:
        if not self.token:
            return True
        header = self.headers.get("X-Remote-Device-Auth", "")
        return header == self.token

    def _send_json(self, payload, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload, default=_json_default).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Remote-Device-Auth")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802 - required by BaseHTTPRequestHandler
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Remote-Device-Auth")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def _send_error(self, status: HTTPStatus, message: str) -> None:
        self._send_json({"error": message}, status=status)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            parsed = json.loads(raw.decode("utf-8") or "{}")
            return parsed if isinstance(parsed, dict) else {}
        except Exception:
            return {}

    def do_GET(self):  # noqa: N802 - required by BaseHTTPRequestHandler
        if not self._authorized():
            return self._send_error(HTTPStatus.UNAUTHORIZED, "Unauthorized")

        parsed = urlparse(self.path)
        path = parsed.path

        if path in {"/", "/health", "/api/remote-device/health"}:
            return self._send_json({"ok": True, "service": "remote-device-agent", "baseUrl": self.base_url})

        if path in {"/.well-known/remote-device.json", "/api/remote-device/manifest"}:
            manifest = build_host_snapshot(self.base_url)
            manifest.update(
                {
                    "id": manifest["deviceId"],
                    "name": manifest["deviceName"],
                    "type": manifest["deviceType"],
                    "connectionMethods": ["lan", "mdns"],
                    "connectionMethod": "lan",
                    "lastSeenAt": None,
                    "lastConnectedAt": None,
                    "publicKeyFingerprint": None,
                    "bridgeUrl": self.base_url,
                    "transportSecurity": "https" if self.base_url.startswith("https://") else "http",
                }
            )
            return self._send_json(manifest)

        if path == "/api/remote-device/discover":
            manifest = build_host_snapshot(self.base_url)
            manifest.update(
                {
                    "id": manifest["deviceId"],
                    "name": manifest["deviceName"],
                    "type": manifest["deviceType"],
                    "connectionMethods": ["lan", "mdns"],
                    "connectionMethod": "lan",
                    "lastSeenAt": None,
                    "lastConnectedAt": None,
                    "publicKeyFingerprint": None,
                    "bridgeUrl": self.base_url,
                    "transportSecurity": "https" if self.base_url.startswith("https://") else "http",
                }
            )
            network_devices = discover_network_devices()
            usb_devices = discover_usb_devices()
            return self._send_json(
                {
                    "devices": [manifest, *network_devices, *usb_devices],
                    "host": build_host_snapshot(self.base_url),
                    "connectionHealth": [
                        {
                            "method": "lan",
                            "status": "connected",
                            "label": "LAN",
                            "description": "Authorized companion agents on Wi-Fi or a phone hotspot are online.",
                            "activeCount": 1 + len(network_devices),
                            "lastSeenAt": None,
                        },
                        {
                            "method": "usb",
                            "status": "available" if discover_usb_devices() else "unsupported",
                            "label": "USB",
                            "description": "USB discovery is available on this host.",
                            "activeCount": len(usb_devices),
                            "lastSeenAt": None,
                        },
                        {
                            "method": "bluetooth",
                            "status": "available" if discover_bluetooth_devices() else "unsupported",
                            "label": "Bluetooth",
                            "description": "Bluetooth discovery is available on this host.",
                            "activeCount": len(discover_bluetooth_devices()),
                            "lastSeenAt": None,
                        },
                    ],
                    "serviceReachable": True,
                    "errors": [],
                }
            )

        if path == "/api/remote-device/system":
            snapshot = build_host_snapshot(self.base_url)
            return self._send_json(snapshot)

        if path == "/api/remote-device/network":
            snapshot = build_host_snapshot(self.base_url)
            return self._send_json(
                {
                    "connectionLabel": "Network connected",
                    "ssid": snapshot.get("ssid"),
                    "localIp": snapshot.get("ipAddress"),
                    "gateway": snapshot.get("gateway"),
                    "uploadMbps": None,
                    "downloadMbps": None,
                    "latencyMs": None,
                    "dnsServers": [],
                    "activeAdapters": ["LAN"],
                }
            )

        if path == "/api/remote-device/screen":
            device_id = parse_qs(parsed.query).get("deviceId", [""])[0]
            frame = capture_adb_screen(device_id.removeprefix("adb-")) if device_id.startswith("adb-") else capture_screen_png()
            if not frame:
                return self._send_json({"available": False, "message": "Screen capture is unavailable on this device."})
            return self._send_json({"available": True, **frame})

        if path == "/api/remote-device/processes":
            return self._send_json(list_processes())

        if path == "/api/remote-device/files":
            directory = parse_qs(parsed.query).get("path", [os.getcwd()])[0]
            return self._send_json(list_files(directory))

        self._send_error(HTTPStatus.NOT_FOUND, "Not found")

    def do_POST(self):  # noqa: N802 - required by BaseHTTPRequestHandler
        if not self._authorized():
            return self._send_error(HTTPStatus.UNAUTHORIZED, "Unauthorized")

        parsed = urlparse(self.path)
        path = parsed.path
        payload = self._read_json()

        if path == "/api/remote-device/terminal":
            command = str(payload.get("command", ""))
            return self._send_json(run_terminal_command(command))

        if path == "/api/remote-device/input":
            device_id = str(payload.get("deviceId", ""))
            if not device_id.startswith("adb-"):
                return self._send_error(HTTPStatus.BAD_REQUEST, "Interactive USB control is available for authorized Android devices only.")
            result = send_adb_input(device_id.removeprefix("adb-"), payload)
            return self._send_json(result, HTTPStatus.OK if result.get("ok") else HTTPStatus.BAD_REQUEST)

        self._send_error(HTTPStatus.NOT_FOUND, "Not found")

    def log_message(self, format, *args):  # noqa: A003 - BaseHTTPRequestHandler API
        if os.environ.get("REMOTE_DEVICE_QUIET", "0") == "1":
            return
        super().log_message(format, *args)


def main() -> int:
    parser = argparse.ArgumentParser(description="Authorized remote device companion agent.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    parser.add_argument("--token", default=os.environ.get("REMOTE_DEVICE_TOKEN", ""))
    parser.add_argument("--certfile", default=os.environ.get("REMOTE_DEVICE_CERTFILE", ""))
    parser.add_argument("--keyfile", default=os.environ.get("REMOTE_DEVICE_KEYFILE", ""))
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), RemoteDeviceHandler)
    server.auth_token = args.token
    scheme = "https" if args.certfile and args.keyfile else "http"
    server.base_url = f"{scheme}://{args.host}:{args.port}"

    if args.certfile and args.keyfile:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile=args.certfile, keyfile=args.keyfile)
        server.socket = context.wrap_socket(server.socket, server_side=True)

    print(f"Remote device agent listening on {server.base_url}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
