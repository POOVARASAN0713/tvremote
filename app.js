// TV Remote Web App
class TVRemote {
    constructor() {
        this.serverUrl = '';
        this.tvIp = '';
        this.isConnected = false;
        this.joystick = null;
        this.lastJoystickKey = null;
        this.lastJoystickTime = 0;
        this.currentMode = null; // 'remote' or 'joystick'
        this.editMode = false; // Button layout edit mode
        this.draggedButton = null;
        this.dragOffset = { x: 0, y: 0 };
        this.demoMode = false; // Demo/preview mode
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupJoystick();
        this.setupModeSelection();
        this.setupButtonCustomization();
        this.loadSettings();
        this.loadButtonPositions();
    }

    loadSettings() {
        const savedServerUrl = localStorage.getItem('serverUrl');
        const savedTvIp = localStorage.getItem('tvIp');
        
        if (savedServerUrl) {
            document.getElementById('serverUrl').value = savedServerUrl;
        }
        if (savedTvIp) {
            document.getElementById('tvIp').value = savedTvIp;
        }
    }

    setupEventListeners() {
        // Connection buttons
        document.getElementById('connectBtn').addEventListener('click', () => this.connect());
        document.getElementById('disconnectBtn').addEventListener('click', () => this.disconnect());
        document.getElementById('demoModeBtn').addEventListener('click', () => this.enableDemoMode());

        // Control buttons (all buttons - will be filtered by mode)
        document.addEventListener('click', (e) => {
            if ((this.isConnected || this.demoMode) && this.currentMode && !this.editMode) {
                const btn = e.target.closest('.control-btn, .dpad-btn, .action-btn, .shoulder-btn, .center-btn');
                if (btn && !btn.disabled) {
                    const keyCode = btn.dataset.key;
                    if (keyCode) {
                        if (this.demoMode) {
                            this.showDemoFeedback(btn, keyCode);
                        } else {
                            this.sendKeyEvent(keyCode);
                        }
                    }
                }
            }
        });

        // Disable buttons initially
        this.setControlsEnabled(false);
    }

    setupModeSelection() {
        // Mode selection buttons
        document.getElementById('selectRemoteMode').addEventListener('click', () => {
            this.selectMode('remote');
        });

        document.getElementById('selectJoystickMode').addEventListener('click', () => {
            this.selectMode('joystick');
        });

        // Switch mode button
        document.getElementById('switchModeBtn').addEventListener('click', () => {
            this.showModeSelection();
        });
    }

    setupButtonCustomization() {
        // Edit layout button
        document.getElementById('editLayoutBtn').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // Save layout button
        document.getElementById('saveLayoutBtn').addEventListener('click', () => {
            this.saveButtonPositions();
            this.toggleEditMode();
        });

        // Reset layout button
        document.getElementById('resetLayoutBtn').addEventListener('click', () => {
            if (confirm('Reset all buttons to default positions?')) {
                this.resetButtonPositions();
            }
        });
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const indicator = document.getElementById('editModeIndicator');
        const editBtn = document.getElementById('editLayoutBtn');
        const saveBtn = document.getElementById('saveLayoutBtn');
        const resetBtn = document.getElementById('resetLayoutBtn');
        const buttons = document.querySelectorAll('.draggable-btn');

        if (this.editMode) {
            indicator.style.display = 'block';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            resetBtn.style.display = 'inline-block';
            
            // Make buttons draggable
            buttons.forEach(btn => {
                btn.style.cursor = 'move';
                btn.style.position = 'absolute';
                btn.classList.add('editing');
                this.makeDraggable(btn);
            });
        } else {
            indicator.style.display = 'none';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            resetBtn.style.display = 'none';
            
            // Remove drag functionality
            buttons.forEach(btn => {
                btn.style.cursor = '';
                btn.classList.remove('editing');
                btn.ondragstart = null;
                btn.ontouchstart = null;
                btn.ontouchmove = null;
                btn.ontouchend = null;
            });
        }
    }

    makeDraggable(button) {
        // Mouse events
        button.addEventListener('mousedown', (e) => {
            if (!this.editMode) return;
            e.preventDefault();
            this.startDrag(button, e.clientX, e.clientY);
        });

        // Touch events
        button.addEventListener('touchstart', (e) => {
            if (!this.editMode) return;
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrag(button, touch.clientX, touch.clientY);
        });
    }

    startDrag(button, clientX, clientY) {
        this.draggedButton = button;
        const rect = button.getBoundingClientRect();
        const containerRect = document.getElementById('controllerLayout').getBoundingClientRect();
        
        this.dragOffset = {
            x: clientX - rect.left - containerRect.left,
            y: clientY - rect.top - containerRect.top
        };

        // Add global move and end listeners
        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('mouseup', this.handleDragEnd);
        document.addEventListener('touchmove', this.handleDragMove);
        document.addEventListener('touchend', this.handleDragEnd);
    }

    handleDragMove = (e) => {
        if (!this.draggedButton || !this.editMode) return;
        
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const containerRect = document.getElementById('controllerLayout').getBoundingClientRect();
        
        let x = clientX - containerRect.left - this.dragOffset.x;
        let y = clientY - containerRect.top - this.dragOffset.y;
        
        // Keep button within container bounds
        const buttonRect = this.draggedButton.getBoundingClientRect();
        const maxX = containerRect.width - buttonRect.width;
        const maxY = containerRect.height - buttonRect.height;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        this.draggedButton.style.left = x + 'px';
        this.draggedButton.style.top = y + 'px';
    }

    handleDragEnd = () => {
        if (this.draggedButton) {
            this.draggedButton = null;
        }
        
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchmove', this.handleDragMove);
        document.removeEventListener('touchend', this.handleDragEnd);
    }

    saveButtonPositions() {
        const positions = {};
        const buttons = document.querySelectorAll('.draggable-btn');
        
        buttons.forEach(btn => {
            const buttonId = btn.dataset.buttonId;
            const rect = btn.getBoundingClientRect();
            const containerRect = document.getElementById('controllerLayout').getBoundingClientRect();
            
            positions[buttonId] = {
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top
            };
        });
        
        localStorage.setItem('buttonPositions', JSON.stringify(positions));
        alert('Button layout saved!');
    }

    loadButtonPositions() {
        const saved = localStorage.getItem('buttonPositions');
        if (!saved) return;
        
        // Wait for layout to be visible before loading positions
        setTimeout(() => {
            try {
                const positions = JSON.parse(saved);
                const buttons = document.querySelectorAll('.draggable-btn');
                const container = document.getElementById('controllerLayout');
                
                if (!container) return;
                
                buttons.forEach(btn => {
                    const buttonId = btn.dataset.buttonId;
                    if (positions[buttonId]) {
                        // Get original position to calculate offset
                        const originalRect = btn.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        
                        btn.style.position = 'absolute';
                        btn.style.left = positions[buttonId].left + 'px';
                        btn.style.top = positions[buttonId].top + 'px';
                        btn.style.zIndex = '10';
                    }
                });
            } catch (e) {
                console.error('Error loading button positions:', e);
            }
        }, 100);
    }

    resetButtonPositions() {
        localStorage.removeItem('buttonPositions');
        const buttons = document.querySelectorAll('.draggable-btn');
        
        buttons.forEach(btn => {
            btn.style.position = '';
            btn.style.left = '';
            btn.style.top = '';
        });
        
        alert('Button layout reset to default!');
    }

    showModeSelection() {
        const modal = document.getElementById('modeSelectionModal');
        modal.style.display = 'flex';
    }

    hideModeSelection() {
        const modal = document.getElementById('modeSelectionModal');
        modal.style.display = 'none';
    }

    selectMode(mode) {
        this.currentMode = mode;
        this.hideModeSelection();
        this.updateModeDisplay();
        // Enable controls if connected OR in demo mode
        this.setControlsEnabled(this.isConnected || this.demoMode);
        
        // Save mode preference
        localStorage.setItem('preferredMode', mode);
    }

    updateModeDisplay() {
        const gamingSection = document.getElementById('gamingControllerSection');
        const remoteSection = document.getElementById('remoteControlSection');
        const buttonsSection = document.getElementById('buttonsSection');
        const modeSwitcher = document.getElementById('modeSwitcher');
        const currentModeText = document.getElementById('currentModeText');

        if (this.currentMode === 'joystick') {
            gamingSection.style.display = 'block';
            remoteSection.style.display = 'none';
            buttonsSection.style.display = 'none';
            currentModeText.textContent = 'Gaming Controller';
            
            // Reload button positions when switching to joystick mode
            setTimeout(() => {
                this.loadButtonPositions();
            }, 100);
        } else if (this.currentMode === 'remote') {
            gamingSection.style.display = 'none';
            remoteSection.style.display = 'block';
            buttonsSection.style.display = 'block';
            currentModeText.textContent = 'Remote Control';
        }

        // Show mode switcher when connected OR in demo mode
        if (this.isConnected || this.demoMode) {
            modeSwitcher.style.display = 'block';
        }
    }

    setupJoystick() {
        const canvas = document.getElementById('joystickCanvas');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = canvas.width / 2 - 15;
        const stickRadius = baseRadius * 0.35;
        let stickX = centerX;
        let stickY = centerY;
        let isDragging = false;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw base circle
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#E0E0E0';
            ctx.fill();
            ctx.strokeStyle = '#3F51B5';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw stick
            ctx.beginPath();
            ctx.arc(stickX, stickY, stickRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#3F51B5';
            ctx.fill();
            ctx.strokeStyle = '#303F9F';
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        const updateStick = (x, y) => {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= baseRadius - stickRadius) {
                stickX = x;
                stickY = y;
            } else {
                const angle = Math.atan2(dy, dx);
                stickX = centerX + (baseRadius - stickRadius) * Math.cos(angle);
                stickY = centerY + (baseRadius - stickRadius) * Math.sin(angle);
            }
            
            // Calculate percentages
            const xPercent = (stickX - centerX) / (baseRadius - stickRadius);
            const yPercent = (stickY - centerY) / (baseRadius - stickRadius);
            
            document.getElementById('joystickX').textContent = xPercent.toFixed(2);
            document.getElementById('joystickY').textContent = yPercent.toFixed(2);
            
            // Send key events (only in joystick mode)
            if ((this.isConnected || this.demoMode) && this.currentMode === 'joystick') {
                if (this.demoMode) {
                    // In demo mode, just show visual feedback
                    if (Math.abs(xPercent) > 0.3 || Math.abs(yPercent) > 0.3) {
                        this.showToast(`Joystick: X=${xPercent.toFixed(2)}, Y=${yPercent.toFixed(2)}`);
                    }
                } else {
                    this.handleJoystickMove(xPercent, yPercent);
                }
            }
            
            draw();
        };

        const getCanvasCoordinates = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            if (e.touches) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            } else {
                return {
                    x: (e.clientX - rect.left) * scaleX,
                    y: (e.clientY - rect.top) * scaleY
                };
            }
        };

        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            const coords = getCanvasCoordinates(e);
            updateStick(coords.x, coords.y);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const coords = getCanvasCoordinates(e);
                updateStick(coords.x, coords.y);
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            stickX = centerX;
            stickY = centerY;
            document.getElementById('joystickX').textContent = '0';
            document.getElementById('joystickY').textContent = '0';
            this.lastJoystickKey = null;
            draw();
        });

        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            stickX = centerX;
            stickY = centerY;
            document.getElementById('joystickX').textContent = '0';
            document.getElementById('joystickY').textContent = '0';
            this.lastJoystickKey = null;
            draw();
        });

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            const coords = getCanvasCoordinates(e);
            updateStick(coords.x, coords.y);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (isDragging) {
                const coords = getCanvasCoordinates(e);
                updateStick(coords.x, coords.y);
            }
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isDragging = false;
            stickX = centerX;
            stickY = centerY;
            document.getElementById('joystickX').textContent = '0';
            document.getElementById('joystickY').textContent = '0';
            this.lastJoystickKey = null;
            draw();
        });

        draw();
    }

    handleJoystickMove(xPercent, yPercent) {
        const threshold = 0.3;
        const currentTime = Date.now();
        
        // Throttle to max 1 event per 200ms
        if (currentTime - this.lastJoystickTime < 200) {
            return;
        }
        
        let keyCode = null;
        
        if (Math.abs(yPercent) > Math.abs(xPercent)) {
            if (yPercent < -threshold) {
                keyCode = 'KEYCODE_DPAD_UP';
            } else if (yPercent > threshold) {
                keyCode = 'KEYCODE_DPAD_DOWN';
            }
        } else {
            if (xPercent < -threshold) {
                keyCode = 'KEYCODE_DPAD_LEFT';
            } else if (xPercent > threshold) {
                keyCode = 'KEYCODE_DPAD_RIGHT';
            }
        }
        
        if (keyCode && keyCode !== this.lastJoystickKey) {
            this.sendKeyEvent(keyCode);
            this.lastJoystickKey = keyCode;
            this.lastJoystickTime = currentTime;
        }
    }

    async connect() {
        this.serverUrl = document.getElementById('serverUrl').value.trim();
        this.tvIp = document.getElementById('tvIp').value.trim();
        
        if (!this.serverUrl || !this.tvIp) {
            alert('Please enter both Server URL and TV IP address');
            return;
        }
        
        // Validate IP address
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(this.tvIp)) {
            alert('Please enter a valid IP address');
            return;
        }
        
        // Save settings
        localStorage.setItem('serverUrl', this.serverUrl);
        localStorage.setItem('tvIp', this.tvIp);
        
        this.updateStatus('connecting', 'Connecting...');
        document.getElementById('connectBtn').disabled = true;
        
        try {
            const response = await fetch(`${this.serverUrl}/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ip: this.tvIp })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isConnected = true;
                this.demoMode = false; // Exit demo mode if was active
                this.updateStatus('connected', 'Connected');
                document.getElementById('connectBtn').disabled = true;
                document.getElementById('disconnectBtn').disabled = false;
                document.getElementById('demoModeBtn').disabled = true;
                document.getElementById('demoModeIndicator').style.display = 'none';
                
                // Show mode selection after successful connection
                this.showModeSelection();
                
                // Load preferred mode if exists
                const preferredMode = localStorage.getItem('preferredMode');
                if (preferredMode && (preferredMode === 'remote' || preferredMode === 'joystick')) {
                    this.selectMode(preferredMode);
                }
            } else {
                throw new Error(data.error || 'Connection failed');
            }
        } catch (error) {
            this.updateStatus('disconnected', `Error: ${error.message}`);
            document.getElementById('connectBtn').disabled = false;
            alert(`Connection failed: ${error.message}\n\nMake sure the server is running: node server.js`);
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await fetch(`${this.serverUrl}/disconnect`, {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
        
        this.isConnected = false;
        this.demoMode = false;
        this.currentMode = null;
        this.updateStatus('disconnected', 'Disconnected');
        document.getElementById('connectBtn').disabled = false;
        document.getElementById('disconnectBtn').disabled = true;
        document.getElementById('demoModeBtn').disabled = false;
        document.getElementById('demoModeIndicator').style.display = 'none';
        this.setControlsEnabled(false);
        
        // Hide all sections
        document.getElementById('gamingControllerSection').style.display = 'none';
        document.getElementById('remoteControlSection').style.display = 'none';
        document.getElementById('buttonsSection').style.display = 'none';
        document.getElementById('modeSwitcher').style.display = 'none';
        this.hideModeSelection();
    }

    enableDemoMode() {
        this.demoMode = true;
        this.isConnected = false; // Not actually connected
        this.updateStatus('connected', 'Demo Mode');
        document.getElementById('connectBtn').disabled = true;
        document.getElementById('disconnectBtn').disabled = false;
        document.getElementById('demoModeBtn').disabled = true;
        document.getElementById('demoModeIndicator').style.display = 'block';
        
        // Show mode selection
        this.showModeSelection();
        
        // Load preferred mode if exists
        const preferredMode = localStorage.getItem('preferredMode');
        if (preferredMode && (preferredMode === 'remote' || preferredMode === 'joystick')) {
            this.selectMode(preferredMode);
        }
    }

    showDemoFeedback(button, keyCode) {
        // Visual feedback for demo mode
        const originalBg = button.style.backgroundColor;
        const originalTransform = button.style.transform;
        
        // Highlight button
        button.style.backgroundColor = '#4CAF50';
        button.style.transform = 'scale(0.95)';
        
        // Show toast notification
        this.showToast(`Demo: ${keyCode.replace('KEYCODE_', '')}`);
        
        // Reset after animation
        setTimeout(() => {
            button.style.backgroundColor = originalBg;
            button.style.transform = originalTransform;
        }, 200);
    }

    showToast(message) {
        // Remove existing toast if any
        const existingToast = document.getElementById('demoToast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.id = 'demoToast';
        toast.className = 'demo-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    }

    async sendKeyEvent(keyCode) {
        if (!this.isConnected && !this.demoMode) {
            alert('Not connected to TV');
            return;
        }
        
        if (this.demoMode) {
            // In demo mode, just show feedback
            return;
        }
        
        try {
            const response = await fetch(`${this.serverUrl}/keyevent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keyCode })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.error('Key event failed:', data.error);
            }
        } catch (error) {
            console.error('Error sending key event:', error);
            alert('Failed to send key event. Connection may be lost.');
            this.disconnect();
        }
    }

    updateStatus(type, message) {
        const statusEl = document.getElementById('status');
        if (this.demoMode && type === 'connected') {
            statusEl.className = 'status connected';
            statusEl.textContent = 'Demo Mode';
        } else {
            statusEl.className = `status ${type}`;
            statusEl.textContent = message;
        }
    }

    setControlsEnabled(enabled) {
        // Enable if connected OR in demo mode
        const shouldEnable = enabled || this.demoMode;
        
        // Only enable buttons for the current mode
        if (this.currentMode === 'joystick') {
            const joystickButtons = document.querySelectorAll('#gamingControllerSection .dpad-btn, .action-btn, .shoulder-btn, .center-btn');
            joystickButtons.forEach(btn => {
                btn.disabled = !shouldEnable;
            });
            
            const canvas = document.getElementById('joystickCanvas');
            canvas.style.opacity = shouldEnable ? '1' : '0.5';
            canvas.style.cursor = shouldEnable ? 'crosshair' : 'not-allowed';
        } else if (this.currentMode === 'remote') {
            const remoteButtons = document.querySelectorAll('#remoteControlSection .dpad-btn, #buttonsSection .control-btn');
            remoteButtons.forEach(btn => {
                btn.disabled = !shouldEnable;
            });
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TVRemote();
});

