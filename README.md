<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5d7ec844-1165-424a-81d0-2f55010658af

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Remote Devices

The dashboard now includes `Communication -> Remote Devices` with:

- Browser USB and Bluetooth discovery where the platform allows it
- Explicit trust, revocation, and forget flows
- Temporary pairing codes with encrypted-at-rest secrets
- Session approval, audit logs, notifications, and a security center
- Optional Electron and Python companion bridge files in `electron/` and `python/device_service/`

When the companion is running on each authorized device, `Discover devices` scans the current private `/24` Wi-Fi subnet for the agent manifest on port `8787`. Only devices that explicitly run the companion agent are returned; sharing a Wi-Fi network alone does not grant remote access.

If you want to run the companion device service, start the Python agent from the repository root after making `python/` available on `PYTHONPATH`:

```bash
$env:PYTHONPATH = "python"
python -m device_service.agent --host 127.0.0.1 --port 8787
```
