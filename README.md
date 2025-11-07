# TV Remote - Web Application

A web-based Android TV remote control that works in your browser. No app installation needed!

## Features

- 🌐 **Web-Based**: Works in any modern browser
- 🎮 **Full Gaming Controller**: Complete gamepad layout with:
  - Virtual joystick for analog movement
  - Action buttons (A, B, X, Y) with color coding
  - Shoulder buttons (L1, L2, R1, R2)
  - Start and Select buttons
  - D-Pad for digital navigation
- 📱 **TV Remote Controls**: Power, Home, Back, Menu, Volume
- ⚡ **Fast & Responsive**: Low latency control
- 🎨 **Modern UI**: Beautiful, gamepad-inspired interface
- 📡 **Wi-Fi Connection**: Connect over your local network

## Quick Start

### 📱 Mobile-Only Setup (No Computer Needed!)

**Best for users without a computer/laptop:**

1. **Install Termux** on your Android phone (Play Store or F-Droid)
2. **In Termux, run:**
   ```bash
   pkg update && pkg install nodejs git
   cd ~/storage/downloads/tv-remote
   npm install
   node server.js
   ```
3. **Find your phone's IP:** `ifconfig wlan0` (in Termux)
4. **Open browser:** Go to `http://YOUR_PHONE_IP:3000`
5. **Connect to TV!**

**📖 See [MOBILE_ONLY_SETUP.md](MOBILE_ONLY_SETUP.md) for complete mobile-only guide**

---

### 💻 Using Computer (Alternative)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Open in Browser

**On Computer:**
- Open your browser and go to: `http://localhost:3000`

**On Mobile Phone:**
- Find your computer's IP address (see [MOBILE_GUIDE.md](MOBILE_GUIDE.md))
- Open browser on phone and go to: `http://YOUR_COMPUTER_IP:3000`
- Example: `http://192.168.1.50:3000`

### 4. Setup Your Android TV

1. **Enable Developer Options**:
   - Go to `Settings` → `About`
   - Tap "Build" or "Build number" **7 times**

2. **Enable ADB Debugging**:
   - Go to `Settings` → `Developer Options`
   - Enable **"ADB debugging"** or **"USB debugging"**
   - Enable **"Network debugging"** or **"ADB over network"**

3. **Find Your TV's IP Address**:
   - Go to `Settings` → `Network` → `Wi-Fi`
   - Note the IP address (e.g., `192.168.1.100`)

### 5. Connect

1. Enter your TV's IP address in the web app
2. Click "Connect"
3. Start controlling your TV!

## How It Works

The web app uses a Node.js proxy server to communicate with your Android TV via ADB (Android Debug Bridge) protocol. Since browsers can't make direct TCP connections, the server acts as a bridge:

```
Browser → Express Server → Android TV (ADB)
```

## Requirements

- **Node.js** (v14 or higher)
- **Android TV** with ADB debugging enabled
- **Same Wi-Fi network** for both computer and TV

## Troubleshooting

### Server Won't Start

- **Port already in use**: Change `PORT` in `server.js` or stop the other service
- **Missing dependencies**: Run `npm install`

### Can't Connect to TV

- **Check IP address**: Make sure it's correct
- **Same network**: Both devices must be on the same Wi-Fi
- **ADB enabled**: Verify ADB debugging is enabled on TV
- **Firewall**: Check if firewall is blocking port 5555

### Controls Not Working

- **Connection status**: Make sure it shows "Connected" (green)
- **Server running**: Verify the server is still running
- **Try reconnecting**: Disconnect and connect again

### Enable ADB Over Network

If your TV doesn't have "Network debugging" option:

1. Connect TV to computer via USB
2. Run: `adb tcpip 5555`
3. Disconnect USB
4. Now you can connect over network

## Development

### Run with Auto-Reload

```bash
npm run dev
```

### Project Structure

```
.
├── index.html      # Main web page
├── styles.css      # Styling
├── app.js          # Client-side JavaScript
├── server.js       # Node.js proxy server
└── package.json    # Dependencies
```

## API Endpoints

- `POST /connect` - Connect to Android TV
  - Body: `{ "ip": "192.168.1.100" }`
  
- `POST /disconnect` - Disconnect from TV

- `POST /keyevent` - Send key event
  - Body: `{ "keyCode": "KEYCODE_HOME" }`

- `GET /status` - Get connection status

## Supported Key Codes

### TV Controls
- `KEYCODE_POWER` - Power button
- `KEYCODE_HOME` - Home button
- `KEYCODE_BACK` - Back button
- `KEYCODE_MENU` - Menu button
- `KEYCODE_VOLUME_UP` - Volume up
- `KEYCODE_VOLUME_DOWN` - Volume down
- `KEYCODE_VOLUME_MUTE` - Mute
- `KEYCODE_DPAD_UP` - D-pad up
- `KEYCODE_DPAD_DOWN` - D-pad down
- `KEYCODE_DPAD_LEFT` - D-pad left
- `KEYCODE_DPAD_RIGHT` - D-pad right
- `KEYCODE_DPAD_CENTER` - D-pad center/OK
- `KEYCODE_MEDIA_PLAY_PAUSE` - Play/Pause

### Gaming Controller Buttons
- `KEYCODE_BUTTON_A` - A button (Green)
- `KEYCODE_BUTTON_B` - B button (Blue)
- `KEYCODE_BUTTON_X` - X button (Red)
- `KEYCODE_BUTTON_Y` - Y button (Yellow)
- `KEYCODE_BUTTON_L1` - Left shoulder button
- `KEYCODE_BUTTON_L2` - Left trigger
- `KEYCODE_BUTTON_R1` - Right shoulder button
- `KEYCODE_BUTTON_R2` - Right trigger
- `KEYCODE_BUTTON_START` - Start button
- `KEYCODE_BUTTON_SELECT` - Select button

## Security Note

This app is designed for local network use. The ADB connection gives full control over your Android TV, so:

- Only use on trusted networks
- Don't expose the server to the internet
- Disable ADB debugging when not in use

## License

MIT License - Free for personal use

## 📱 Mobile Access

**Want to use this on your phone?** See the complete guide:
- **[MOBILE_GUIDE.md](MOBILE_GUIDE.md)** - Full instructions for mobile web access

Quick steps:
1. Find your computer's IP address
2. Start server: `npm start`
3. On phone browser: `http://YOUR_COMPUTER_IP:3000`
4. Connect to TV and start controlling!

## Support

For issues or questions:
1. Check the troubleshooting section
2. See [MOBILE_GUIDE.md](MOBILE_GUIDE.md) for mobile-specific help
3. Verify ADB is working: `adb connect <TV_IP>:5555`
4. Check server logs for error messages

