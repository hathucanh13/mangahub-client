# MangaHub Desktop

## About

This is the official desktop client for MangaHub, built with Wails (Go + React).

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Development

### Running the App

**⚠️ Important: We recommend using the build mode instead of dev mode for testing.**

The dev mode (`wails dev`) opens 2 UDP/TCP connections which can cause conflicts and unexpected behavior with the notification and sync services.

#### Option 1: Build Mode (Recommended)
```bash
# Build the application
wails build

# Run the built executable
# Windows:
./build/bin/mangahub-desktop.exe

# The executable will be in the build/bin directory
```

#### Option 2: Development Mode (Not Recommended)
```bash
# Run in live development mode
wails dev

# Note: This mode has known issues:
# - Opens duplicate UDP listeners on port 3002
# - Can cause conflicts with TCP sync connections
# - May show incorrect subscription states
```

If you need to use dev mode for quick frontend changes, be aware of these limitations and restart the app frequently.

## Building for Production (THERE'S ALREADY ONE IN THE build/bin DIRECTORY, YOU CAN RUN IT DIRECTLY)

To build a redistributable, production mode package:

```bash
wails build
```

The executable will be created in the `build/bin/` directory.

## Logging

View the application logs:

**Windows (PowerShell):**
```powershell
Get-Content "$env:USERPROFILE\.mangahub-desktop\mangahub-logs\app-$(Get-Date -Format 'yyyy-MM-dd').log" -Tail 50 -Wait
```

## Troubleshooting

### UDP Listener Port Conflicts
If you encounter "address already in use" errors on port 3002:
1. Close all instances of the app
2. Wait a few seconds for Windows to release the port
3. Check if port is still in use: `netstat -ano | findstr :3002`
4. Restart the app
5. Check if you are running the CLI command: mangahub notify register - if so, quit the process by Ctrl + C

### Subscription State Issues
If subscription states are showing incorrectly across different users:
1. Clear the WebView2 cache: `%LOCALAPPDATA%\mangahub-desktop\`
2. Restart the app