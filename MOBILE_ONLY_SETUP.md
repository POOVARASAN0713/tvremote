# Mobile-Only Setup (No Computer Needed!)

Complete guide to use TV Remote with **only your mobile phone and TV** - no laptop or computer required!

## 🎯 Quick Solution: Deploy to Free Cloud Service

Deploy the server to a free cloud hosting service, then access it from your phone.

## Option 1: Deploy to Render (Easiest - Recommended)

### Step 1: Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub (free)
3. Connect your GitHub account

### Step 2: Push Code to GitHub
1. Create a new repository on GitHub
2. Upload all your project files
3. Or use GitHub Desktop app on your phone (if available)

### Step 3: Deploy on Render
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Name**: `tv-remote-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Click "Create Web Service"
6. Wait for deployment (2-3 minutes)
7. Copy your service URL (e.g., `https://tv-remote-server.onrender.com`)

### Step 4: Use on Your Phone
1. Open browser on your phone
2. Go to your Render URL: `https://tv-remote-server.onrender.com`
3. Enter your TV's IP address
4. Click Connect!

---

## Option 2: Deploy to Railway (Alternative)

### Step 1: Create Railway Account
1. Go to: https://railway.app
2. Sign up with GitHub
3. Get $5 free credit monthly

### Step 2: Deploy
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway auto-detects Node.js
5. Deploy automatically
6. Copy your Railway URL

### Step 3: Use on Phone
- Open Railway URL on your phone browser
- Connect to TV!

---

## Option 3: Deploy to Heroku (Classic)

### Step 1: Create Heroku Account
1. Go to: https://heroku.com
2. Sign up (free tier available)

### Step 2: Install Heroku CLI (if possible)
- Or use Heroku web interface

### Step 3: Deploy
1. Create new app in Heroku dashboard
2. Connect GitHub repository
3. Enable automatic deploys
4. Deploy branch
5. Copy app URL

---

## Option 4: Use ngrok with Persistent URL (Advanced)

### Step 1: Create ngrok Account
1. Go to: https://ngrok.com
2. Sign up (free account)
3. Get your authtoken

### Step 2: Run Server on Phone (Termux App)
1. Install **Termux** from Play Store
2. In Termux, run:
   ```bash
   pkg update
   pkg install nodejs git
   git clone YOUR_REPO_URL
   cd tv-remote
   npm install
   node server.js
   ```

### Step 3: Use ngrok
1. In another Termux session:
   ```bash
   pkg install curl
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | pkg add -
   pkg install ngrok
   ngrok config add-authtoken YOUR_TOKEN
   ngrok http 3000
   ```
2. Copy the ngrok URL
3. Use it on your phone browser

---

## Option 5: Use Termux on Android (No Cloud Needed!)

### Step 1: Install Termux
1. Download **Termux** from F-Droid or Play Store
2. Open Termux app

### Step 2: Install Node.js
```bash
pkg update
pkg upgrade
pkg install nodejs git
```

### Step 3: Get Your Project
**Option A: Clone from GitHub**
```bash
git clone https://github.com/YOUR_USERNAME/tv-remote.git
cd tv-remote
npm install
```

**Option B: Download and Extract**
1. Download project ZIP on your phone
2. Extract to Downloads folder
3. In Termux:
```bash
cd ~/storage/downloads/tv-remote
npm install
```

### Step 4: Start Server
```bash
node server.js
```

### Step 5: Find Your Phone's IP
```bash
ifconfig
```
Look for `inet` address (e.g., `192.168.1.50`)

### Step 6: Access on Phone
1. Open browser on same phone
2. Go to: `http://localhost:3000` or `http://YOUR_PHONE_IP:3000`
3. Connect to TV!

### Step 7: Keep Server Running
- Keep Termux open in background
- Or use Termux:Widget to create shortcut
- Or use `nohup node server.js &` to run in background

---

## Option 6: Use GitHub Codespaces (Browser-Based)

### Step 1: Create Codespace
1. Go to your GitHub repository
2. Click "Code" → "Codespaces" → "Create codespace"
3. Wait for setup

### Step 2: Run Server
```bash
npm install
npm start
```

### Step 3: Port Forwarding
1. Click "Ports" tab in Codespaces
2. Forward port 3000
3. Make it public
4. Copy the public URL
5. Use on your phone!

---

## 📱 Recommended: Termux Method (Easiest for Mobile-Only)

**Why Termux?**
- ✅ No cloud service needed
- ✅ Works completely offline
- ✅ Free forever
- ✅ Full control
- ✅ No deployment complexity

### Complete Termux Setup

1. **Install Termux** (F-Droid recommended for latest version)

2. **Setup in Termux:**
```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js
pkg install nodejs git

# Navigate to your project
cd ~/storage/downloads
# (or wherever you saved the project)

# Install dependencies
cd tv-remote
npm install

# Start server
node server.js
```

3. **Find Your Phone's IP:**
```bash
ifconfig wlan0
# Look for "inet" - that's your IP
```

4. **Access on Phone:**
- Open Chrome/Safari
- Go to: `http://YOUR_PHONE_IP:3000`
- Example: `http://192.168.1.50:3000`

5. **Keep Running:**
```bash
# Run in background
nohup node server.js > server.log 2>&1 &

# Check if running
ps aux | grep node

# Stop server
pkill node
```

---

## 🔧 Troubleshooting

### Termux Issues

**Problem**: Can't access from browser
- **Solution**: Make sure you're using your phone's IP, not localhost
- **Solution**: Check firewall isn't blocking port 3000
- **Solution**: Try `http://127.0.0.1:3000` first to test

**Problem**: Server stops when Termux closes
- **Solution**: Use `nohup` command (see above)
- **Solution**: Install Termux:Widget for quick start
- **Solution**: Use `tmux` or `screen` to keep session alive

**Problem**: Can't find IP address
- **Solution**: Go to Phone Settings → Wi-Fi → Tap your network → See IP address
- **Solution**: Use `ip addr show` in Termux

### Cloud Deployment Issues

**Problem**: Server goes to sleep (Render free tier)
- **Solution**: First request takes 30 seconds (free tier limitation)
- **Solution**: Upgrade to paid plan for always-on
- **Solution**: Use Railway or Heroku for better free tier

**Problem**: Can't connect to TV from cloud server
- **Solution**: Cloud server can't access your local network
- **Solution**: Use Termux method instead
- **Solution**: Or use ngrok to tunnel to local network

---

## 💡 Best Solution for Mobile-Only

**For Best Experience: Use Termux**

1. ✅ No cloud service needed
2. ✅ Works on your local network
3. ✅ Free forever
4. ✅ Full control
5. ✅ Can access TV on same network

**Steps:**
1. Install Termux
2. Install Node.js in Termux
3. Run server in Termux
4. Access from phone browser
5. Connect to TV!

---

## 📝 Quick Reference

### Termux Commands
```bash
# Start server
node server.js

# Start in background
nohup node server.js &

# Check if running
ps aux | grep node

# Stop server
pkill node

# View logs
tail -f server.log

# Find IP
ifconfig wlan0
```

### Access URLs
- **Same phone**: `http://localhost:3000`
- **Other devices on network**: `http://YOUR_PHONE_IP:3000`
- **Cloud deployment**: `https://YOUR_APP_URL`

---

**Need Help?** The Termux method is recommended for mobile-only setup. It's free, works offline, and gives you full control!

