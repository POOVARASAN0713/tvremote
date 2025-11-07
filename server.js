// TV Remote Proxy Server
// This server acts as a bridge between the web browser and Android TV
// Browsers can't make direct TCP connections, so we need this proxy

const express = require('express');
const cors = require('cors');
const net = require('net');
const http = require('http');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ADB connection state
let adbSocket = null;
let isConnected = false;
let tvIp = null;

// ADB Protocol Constants
const ADB_MAGIC = 0x4e584e43; // "CNXN" in little endian
const ADB_VERSION = 0x01000000;
const MAX_PAYLOAD = 4096;
const A_CNXN = 0x4e584e43;
const A_OPEN = 0x4e45504f;
const A_OKAY = 0x59414b4f;
const A_WRTE = 0x45545257;
const A_CLSE = 0x45534c43;

// Helper function to create ADB message
function createAdbMessage(command, arg0, arg1, dataLength, data = null) {
    const header = Buffer.alloc(24);
    header.writeUInt32LE(command, 0);
    header.writeUInt32LE(arg0, 4);
    header.writeUInt32LE(arg1, 8);
    header.writeUInt32LE(dataLength, 12);
    
    let checksum = 0;
    if (data) {
        checksum = data.reduce((sum, byte) => sum + byte, 0);
    }
    header.writeUInt32LE(checksum, 16);
    header.writeUInt32LE(command ^ 0xffffffff, 20);
    
    if (data && data.length > 0) {
        return Buffer.concat([header, data]);
    }
    return header;
}

// Helper function to read ADB message
function readAdbMessage(socket) {
    return new Promise((resolve, reject) => {
        const headerBuffer = Buffer.alloc(24);
        let bytesRead = 0;
        
        const readHeader = () => {
            const chunk = socket.read(24 - bytesRead);
            if (chunk) {
                chunk.copy(headerBuffer, bytesRead);
                bytesRead += chunk.length;
                
                if (bytesRead === 24) {
                    const command = headerBuffer.readUInt32LE(0);
                    const dataLength = headerBuffer.readUInt32LE(12);
                    
                    if (dataLength > 0) {
                        const dataBuffer = Buffer.alloc(dataLength);
                        let dataBytesRead = 0;
                        
                        const readData = () => {
                            const chunk = socket.read(dataLength - dataBytesRead);
                            if (chunk) {
                                chunk.copy(dataBuffer, dataBytesRead);
                                dataBytesRead += chunk.length;
                                
                                if (dataBytesRead === dataLength) {
                                    resolve({
                                        command,
                                        arg0: headerBuffer.readUInt32LE(4),
                                        arg1: headerBuffer.readUInt32LE(8),
                                        dataLength,
                                        checksum: headerBuffer.readUInt32LE(16),
                                        magic: headerBuffer.readUInt32LE(20),
                                        data: dataBuffer
                                    });
                                } else {
                                    socket.once('readable', readData);
                                }
                            } else {
                                socket.once('readable', readData);
                            }
                        };
                        
                        socket.once('readable', readData);
                    } else {
                        resolve({
                            command,
                            arg0: headerBuffer.readUInt32LE(4),
                            arg1: headerBuffer.readUInt32LE(8),
                            dataLength: 0,
                            checksum: headerBuffer.readUInt32LE(16),
                            magic: headerBuffer.readUInt32LE(20),
                            data: null
                        });
                    }
                }
            } else {
                socket.once('readable', readHeader);
            }
        };
        
        socket.once('readable', readHeader);
        
        socket.once('error', reject);
        socket.once('close', () => reject(new Error('Socket closed')));
    });
}

// Connect to Android TV via ADB
async function connectToTV(ip) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const ADB_PORT = 5555;
        
        socket.setTimeout(10000);
        
        socket.on('connect', async () => {
            try {
                // Send CNXN message
                const banner = Buffer.from('host::\u0000', 'utf8');
                const connectMsg = createAdbMessage(A_CNXN, ADB_VERSION, MAX_PAYLOAD, banner.length, banner);
                socket.write(connectMsg);
                
                // Wait for response
                const response = await readAdbMessage(socket);
                
                if (response.command === A_CNXN) {
                    adbSocket = socket;
                    isConnected = true;
                    tvIp = ip;
                    resolve(true);
                } else {
                    socket.destroy();
                    reject(new Error('Invalid ADB handshake response'));
                }
            } catch (error) {
                socket.destroy();
                reject(error);
            }
        });
        
        socket.on('error', (error) => {
            reject(error);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timeout'));
        });
        
        socket.on('close', () => {
            isConnected = false;
            adbSocket = null;
        });
        
        socket.connect(ADB_PORT, ip);
    });
}

// Send key event to TV
async function sendKeyEvent(keyCode) {
    if (!isConnected || !adbSocket) {
        throw new Error('Not connected to TV');
    }
    
    return new Promise((resolve, reject) => {
        try {
            // Map key code string to Android key code number
            const keyCodeMap = {
                // TV Controls
                'KEYCODE_POWER': 26,
                'KEYCODE_HOME': 3,
                'KEYCODE_BACK': 4,
                'KEYCODE_MENU': 82,
                'KEYCODE_VOLUME_UP': 24,
                'KEYCODE_VOLUME_DOWN': 25,
                'KEYCODE_VOLUME_MUTE': 164,
                'KEYCODE_DPAD_UP': 19,
                'KEYCODE_DPAD_DOWN': 20,
                'KEYCODE_DPAD_LEFT': 21,
                'KEYCODE_DPAD_RIGHT': 22,
                'KEYCODE_DPAD_CENTER': 23,
                'KEYCODE_MEDIA_PLAY_PAUSE': 85,
                // Gaming Controller Buttons
                'KEYCODE_BUTTON_A': 96,      // A button (Green)
                'KEYCODE_BUTTON_B': 97,      // B button (Blue/Red)
                'KEYCODE_BUTTON_X': 99,      // X button (Red)
                'KEYCODE_BUTTON_Y': 100,     // Y button (Yellow)
                'KEYCODE_BUTTON_L1': 102,    // Left shoulder button
                'KEYCODE_BUTTON_L2': 104,    // Left trigger
                'KEYCODE_BUTTON_R1': 103,    // Right shoulder button
                'KEYCODE_BUTTON_R2': 105,    // Right trigger
                'KEYCODE_BUTTON_START': 108, // Start button
                'KEYCODE_BUTTON_SELECT': 109 // Select button
            };
            
            const androidKeyCode = keyCodeMap[keyCode];
            if (!androidKeyCode) {
                reject(new Error(`Unknown key code: ${keyCode}`));
                return;
            }
            
            // Send shell command via ADB
            const command = `input keyevent ${androidKeyCode}`;
            const shellCommand = `shell:${command}`;
            const commandBuffer = Buffer.from(shellCommand, 'utf8');
            
            // Send OPEN message
            const localId = 1;
            const openMsg = createAdbMessage(A_OPEN, localId, 0, commandBuffer.length, commandBuffer);
            adbSocket.write(openMsg);
            
            // For simplicity, we'll assume it works
            // In production, you'd want to read the response
            setTimeout(() => {
                resolve(true);
            }, 100);
            
        } catch (error) {
            reject(error);
        }
    });
}

// API Routes
app.post('/connect', async (req, res) => {
    try {
        const { ip } = req.body;
        
        if (!ip) {
            return res.status(400).json({ success: false, error: 'IP address required' });
        }
        
        if (isConnected) {
            return res.json({ success: true, message: 'Already connected' });
        }
        
        await connectToTV(ip);
        res.json({ success: true, message: 'Connected successfully' });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/disconnect', (req, res) => {
    if (adbSocket) {
        adbSocket.destroy();
        adbSocket = null;
        isConnected = false;
        tvIp = null;
    }
    res.json({ success: true, message: 'Disconnected' });
});

app.post('/keyevent', async (req, res) => {
    try {
        const { keyCode } = req.body;
        
        if (!keyCode) {
            return res.status(400).json({ success: false, error: 'Key code required' });
        }
        
        if (!isConnected) {
            return res.status(400).json({ success: false, error: 'Not connected to TV' });
        }
        
        await sendKeyEvent(keyCode);
        res.json({ success: true, message: 'Key event sent' });
    } catch (error) {
        console.error('Key event error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        tvIp: tvIp
    });
});

// Start server
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`\n🚀 TV Remote Server running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser\n`);
    console.log('Make sure your Android TV has ADB debugging enabled!');
    console.log('Settings → Developer Options → Enable ADB debugging\n');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error('Please stop the other server or change the PORT in server.js\n');
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

