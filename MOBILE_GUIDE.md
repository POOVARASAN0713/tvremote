# Mobile Web Guide - TV Remote

Complete guide to connect and use the TV Remote web app on your mobile phone.

## 📱 How to Open on Mobile Web

### Method 1: Using Your Computer's IP Address (Recommended)

1. **Find Your Computer's IP Address:**
   - **Windows**: Open Command Prompt, type `ipconfig`, look for "IPv4 Address" (e.g., 192.168.1.50)
   - **Mac**: Open Terminal, type `ifconfig | grep "inet "`, look for your local IP
   - **Linux**: Open Terminal, type `hostname -I` or `ip addr show`

2. **Start the Server on Your Computer:**
   ```bash
   cd "tv remote"
   npm install
   npm start
   ```
   You should see: `Server running on http://localhost:3000`

3. **Open on Your Phone:**
   - Make sure your phone is on the **same Wi-Fi network** as your computer
   - Open your phone's browser (Chrome, Safari, etc.)
   - Type: `http://YOUR_COMPUTER_IP:3000`
   - Example: `http://192.168.1.50:3000`
   - The app will load on your phone!

### Method 2: Using ngrok (Access from Anywhere)

1. **Install ngrok:**
   - Download from: https://ngrok.com/download
   - Or install via npm: `npm install -g ngrok`

2. **Start Your Server:**
   ```bash
   npm start
   ```

3. **In a New Terminal, Start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL:**
   - You'll see something like: `https://abc123.ngrok.io`
   - Copy this URL

5. **Open on Your Phone:**
   - Open browser on your phone (can be on any network!)
   - Paste the ngrok URL
   - The app will load!

### Method 3: Deploy to a Web Server

You can deploy the app to services like:
- **Heroku** (free tier available)
- **Vercel**
- **Netlify**
- **GitHub Pages** (static hosting)

## 🔌 How to Connect to Your Android TV

### Step 1: Enable ADB on Your TV

1. **Enable Developer Options:**
   - Go to `Settings` → `About` (or `Device Preferences` → `About`)
   - Find "Build" or "Build number"
   - **Tap it 7 times** until you see "You are now a developer"

2. **Enable ADB Debugging:**
   - Go to `Settings` → `Developer Options`
   - Enable **"ADB debugging"** or **"USB debugging"**
   - Enable **"Network debugging"** or **"ADB over network"**

3. **Find Your TV's IP Address:**
   - Go to `Settings` → `Network` → `Wi-Fi` (or `Ethernet`)
   - Note the IP address (e.g., `192.168.1.100`)

### Step 2: Connect from the Web App

1. **Open the app** on your phone/computer browser

2. **Enter Connection Details:**
   - **Server URL**: 
     - If using computer IP: `http://YOUR_COMPUTER_IP:3000`
     - If using ngrok: `https://YOUR_NGROK_URL`
     - If deployed: Your deployed URL
   - **TV IP Address**: Enter your TV's IP (e.g., `192.168.1.100`)

3. **Click "Connect"**
   - Wait for "Connected" status (green)
   - If connection fails, see Troubleshooting below

4. **Choose Your Mode:**
   - **Remote Control**: Simple TV remote
   - **Gaming Controller**: Full gamepad with customizable buttons

5. **Start Controlling!**
   - Use the virtual joystick or buttons
   - Customize button positions in Gaming Controller mode

## 🎮 Quick Start Checklist

- [ ] Computer and phone on same Wi-Fi network
- [ ] Server running (`npm start`)
- [ ] Know your computer's IP address
- [ ] TV has ADB debugging enabled
- [ ] Know your TV's IP address
- [ ] Open browser on phone: `http://COMPUTER_IP:3000`
- [ ] Enter TV IP and click Connect
- [ ] Choose Remote or Joystick mode
- [ ] Start controlling!

## 🔧 Troubleshooting

### Can't Access on Mobile

**Problem**: Can't open the website on phone
- **Solution 1**: Check both devices are on same Wi-Fi
- **Solution 2**: Check computer firewall isn't blocking port 3000
- **Solution 3**: Try using ngrok for easier access
- **Solution 4**: Make sure server is running (`npm start`)

**Problem**: "Connection refused" or "Can't reach this page"
- **Solution**: 
  - Verify server is running
  - Check IP address is correct
  - Try `http://` instead of `https://`
  - Check firewall settings

### Can't Connect to TV

**Problem**: "Connection failed" when connecting to TV
- **Solution 1**: Verify TV IP address is correct
- **Solution 2**: Ensure ADB debugging is enabled on TV
- **Solution 3**: Make sure TV and computer/phone are on same network
- **Solution 4**: Try restarting the TV
- **Solution 5**: Check if TV firewall is blocking port 5555

**Problem**: "Failed to establish ADB connection"
- **Solution**: 
  - Enable "Network debugging" in Developer Options
  - If not available, connect TV to computer via USB first
  - Run: `adb tcpip 5555` (requires ADB installed on computer)
  - Then disconnect USB and try again

### Buttons Not Working

**Problem**: Buttons don't respond
- **Solution 1**: Check connection status shows "Connected" (green)
- **Solution 2**: Make sure you're not in Edit Mode
- **Solution 3**: Try disconnecting and reconnecting
- **Solution 4**: Refresh the page

## 📲 Mobile-Specific Tips

### Add to Home Screen (PWA-like Experience)

1. **On iPhone (Safari):**
   - Open the app in Safari
   - Tap Share button (square with arrow)
   - Select "Add to Home Screen"
   - App icon will appear on home screen

2. **On Android (Chrome):**
   - Open the app in Chrome
   - Tap menu (3 dots)
   - Select "Add to Home Screen" or "Install App"
   - App icon will appear on home screen

### Best Mobile Experience

- **Use Landscape Mode**: Rotate phone for better controller layout
- **Full Screen**: Use browser's full screen mode
- **Keep Screen On**: Disable auto-lock while using
- **Stable Wi-Fi**: Ensure strong connection for best performance

## 🌐 Network Setup

### Same Network Required

For the app to work, all devices must be on the same Wi-Fi network:
- ✅ Your computer (running server)
- ✅ Your phone (accessing web app)
- ✅ Your Android TV (being controlled)

### Port Forwarding (Advanced)

If you want to access from different networks:
1. Forward port 3000 on your router
2. Use your public IP address
3. **Warning**: This exposes your server to the internet - use with caution!

## 💡 Pro Tips

1. **Bookmark the URL**: Save the app URL in your phone's browser
2. **Use ngrok for Remote Access**: Access from anywhere with ngrok
3. **Customize Layout**: Edit button positions for your gaming style
4. **Save Your Settings**: IP addresses are saved automatically
5. **Quick Switch**: Use "Switch Mode" to change between Remote and Joystick

## 🆘 Still Having Issues?

1. Check server logs for error messages
2. Verify all IP addresses are correct
3. Test ADB connection manually: `adb connect TV_IP:5555`
4. Restart server: Stop (Ctrl+C) and run `npm start` again
5. Clear browser cache and try again

---

**Need More Help?** Check the main README.md for detailed setup instructions.

