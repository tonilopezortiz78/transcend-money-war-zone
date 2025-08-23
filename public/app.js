// Crypto War Zone - Main Application
class CryptoWarZone {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.soundEnabled = true;
        this.lastWhaleAlert = 0;
        this.whaleAlertCooldown = 5000; // 5 seconds between whale alerts
        
        this.elements = {
            // Metrics
            currentPrice: document.getElementById('current-price'),
            priceChange: document.getElementById('price-change'),
            totalVolume: document.getElementById('total-volume'),
            totalQuantity: document.getElementById('total-quantity'),
            
            // Buyer totals
            buyerTotalVolume: document.getElementById('buyer-total-volume'),
            buyerTotalQuantity: document.getElementById('buyer-total-quantity'),
            
            // Seller totals
            sellerTotalVolume: document.getElementById('seller-total-volume'),
            sellerTotalQuantity: document.getElementById('seller-total-quantity'),
            
            // Last minute totals
            minuteVolume: document.getElementById('minute-volume'),
            minuteQuantity: document.getElementById('minute-quantity'),
            
            // Last minute buyers
            minuteBuyerVolume: document.getElementById('minute-buyer-volume'),
            minuteBuyerQuantity: document.getElementById('minute-buyer-quantity'),
            
            // Last minute sellers
            minuteSellerVolume: document.getElementById('minute-seller-volume'),
            minuteSellerQuantity: document.getElementById('minute-seller-quantity'),
            
            // Battle percentages
            buyerPercentage: document.getElementById('buyer-percentage'),
            sellerPercentage: document.getElementById('seller-percentage'),
            buyerVolumePercentage: document.getElementById('buyer-volume-percentage'),
            sellerVolumePercentage: document.getElementById('seller-volume-percentage'),
            
            // Trade lists
            recentTrades: document.getElementById('recent-trades'),
            topBuyers: document.getElementById('top-buyers'),
            topSellers: document.getElementById('top-sellers'),
            
            // Stats
            totalTrades: document.getElementById('total-trades'),
            buyerCount: document.getElementById('buyer-count'),
            sellerCount: document.getElementById('seller-count'),
            whaleTrades: document.getElementById('whale-trades'),
            bigTrades: document.getElementById('big-trades'),
            connectionStatus: document.getElementById('connection-status'),
            connectedUsers: document.getElementById('connected-users'),
            
            // Whale alert
            whaleAlert: document.getElementById('whale-alert'),
            whaleAmount: document.getElementById('whale-amount'),
            whaleType: document.getElementById('whale-type'),
            
            // Audio
            tradeSound: document.getElementById('trade-sound'),
            whaleSound: document.getElementById('whale-sound'),
            megaWhaleSound: document.getElementById('mega-whale-sound'),
            explosionSound: document.getElementById('explosion-sound')
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Crypto War Zone...');
        
        // Check if Socket.IO is available
        if (typeof io === 'undefined') {
            console.error('❌ Socket.IO not loaded! Retrying in 1 second...');
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        this.connectSocket();
        this.setupEventListeners();
    }
    
    connectSocket() {
        console.log('🔌 FRONTEND: Attempting to connect to Socket.IO...');
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('✅ FRONTEND: Connected to server');
            this.isConnected = true;
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('❌ FRONTEND: Disconnected from server');
            this.isConnected = false;
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('initialData', (data) => {
            console.log('📊 FRONTEND: Received initial data:', data);
            this.updateMetrics(data.metrics);
            this.updateRecentTrades(data.recentTrades);
            this.updateTopBuyers(data.topBuyers);
            this.updateTopSellers(data.topSellers);
            this.updateUserCount(data.connectedUsers || 0);
        });
        
        this.socket.on('newTrade', (trade) => {
            console.log('📦 FRONTEND: Received new trade:', trade);
            this.handleNewTrade(trade);
        });
        
        this.socket.on('metricsUpdate', (metrics) => {
            console.log('📊 FRONTEND: Received metrics update:', metrics);
            this.updateMetrics(metrics);
        });
        
        this.socket.on('userCountUpdate', (data) => {
            console.log('👥 FRONTEND: User count update:', data);
            this.updateUserCount(data.connectedUsers);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('❌ FRONTEND: Socket.IO connection error:', error);
        });
        
        this.socket.on('error', (error) => {
            console.error('❌ FRONTEND: Socket.IO error:', error);
        });
    }
    
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'm':
                    this.toggleSound();
                    break;
                case 'r':
                    this.resetStats();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Click to toggle sound
        document.addEventListener('click', () => {
            if (this.elements.tradeSound.paused) {
                this.enableSound();
            }
        });
    }
    
    handleNewTrade(trade) {
        // Add visual effects based on trade size
        this.addTradeEffects(trade);
        
        // Play sound effects
        this.playTradeSound(trade);
        
        // Show whale alert for massive trades
        if (trade.isWhale && this.shouldShowWhaleAlert()) {
            this.showWhaleAlert(trade);
        }
        
        // Update recent trades list
        this.addToRecentTrades(trade);
        
        // Update top buyers/sellers if applicable
        if (trade.side === 'BUY') {
            this.updateBuyerCount();
        } else {
            this.updateSellerCount();
        }
    }
    
    addTradeEffects(trade) {
        const body = document.body;
        
        // Screen flash for big trades
        if (trade.usdtVolume >= 100000) {
            if (trade.side === 'BUY') {
                body.classList.add('flash-green');
                setTimeout(() => body.classList.remove('flash-green'), 500);
            } else {
                body.classList.add('flash-red');
                setTimeout(() => body.classList.remove('flash-red'), 500);
            }
        }
        
        // Screen shake for whale trades
        if (trade.usdtVolume >= 500000) {
            body.classList.add('shake');
            setTimeout(() => body.classList.remove('shake'), 500);
            
            // Matrix pulse effect
            if (window.matrixRain) {
                window.matrixRain.pulse(trade.usdtVolume / 1000000);
            }
        }
        
        // Glitch effect for mega trades
        if (trade.usdtVolume >= 1000000) {
            if (window.matrixRain) {
                window.matrixRain.glitch();
            }
        }
    }
    
    playTradeSound(trade) {
        if (!this.soundEnabled) return;
        
        try {
            if (trade.usdtVolume >= 1000000) { // Mega whale $1M+
                this.elements.megaWhaleSound.currentTime = 0;
                this.elements.megaWhaleSound.play().catch(() => {});
                this.elements.explosionSound.currentTime = 0;
                setTimeout(() => {
                    this.elements.explosionSound.play().catch(() => {});
                }, 500);
                
                // Launch massive emoji explosion
                if (window.confettiSystem) {
                    window.confettiSystem.launchConfetti(trade.side.toLowerCase());
                    setTimeout(() => {
                        window.confettiSystem.launchFireworks(trade.side.toLowerCase());
                    }, 1000);
                }
            } else if (trade.isWhale) {
                this.elements.whaleSound.currentTime = 0;
                this.elements.whaleSound.play().catch(() => {});
                
                // Launch emoji confetti for whales
                if (window.confettiSystem) {
                    window.confettiSystem.launchConfetti(trade.side.toLowerCase());
                }
            } else {
                this.elements.tradeSound.currentTime = 0;
                this.elements.tradeSound.play().catch(() => {});
            }
        } catch (error) {
            // Sound not available, ignore
        }
    }
    
    shouldShowWhaleAlert() {
        const now = Date.now();
        if (now - this.lastWhaleAlert > this.whaleAlertCooldown) {
            this.lastWhaleAlert = now;
            return true;
        }
        return false;
    }
    
    showWhaleAlert(trade) {
        this.elements.whaleAmount.textContent = trade.formattedVolume;
        
        // Set whale type based on trade side with maximum clarity and dramatic colors
        if (trade.side === 'SELL') {
            this.elements.whaleType.innerHTML = `
                <div style="color: #ff0000; font-size: 1.4rem; font-weight: 900; text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; margin-bottom: 5px;">
                    🔥 AGGRESSIVE SELLER! 🔥
                </div>
                <div style="color: #ff4444; font-size: 1rem; text-shadow: 0 0 15px #ff0000; margin-bottom: 5px;">
                    PANIC DUMP IN PROGRESS!
                </div>
                <div style="color: #ff0000; font-size: 2rem; animation: bounce 0.5s infinite;">
                    ⬇️ SELLING CRYPTO ⬇️
                </div>
            `;
            this.elements.whaleAlert.classList.add('whale-sell');
            this.elements.whaleAlert.classList.remove('whale-buy');
        } else {
            this.elements.whaleType.innerHTML = `
                <div style="color: #00ff00; font-size: 1.4rem; font-weight: 900; text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00; margin-bottom: 5px;">
                    💵 AGGRESSIVE BUYER! 💵
                </div>
                <div style="color: #44ff44; font-size: 1rem; text-shadow: 0 0 15px #00ff00; margin-bottom: 5px;">
                    MASSIVE BUY ORDER!
                </div>
                <div style="color: #00ff00; font-size: 2rem; animation: bounce 0.5s infinite;">
                    ⬆️ BUYING BITCOIN ⬆️
                </div>
            `;
            this.elements.whaleAlert.classList.add('whale-buy');
            this.elements.whaleAlert.classList.remove('whale-sell');
        }
        
        this.elements.whaleAlert.style.display = 'block';
        
        setTimeout(() => {
            this.elements.whaleAlert.style.display = 'none';
        }, 5000); // Increased to 5 seconds for better readability
    }
    
    updateMetrics(metrics) {
        // Price and change
        this.elements.currentPrice.textContent = metrics.formattedCurrentPrice || '$0.00';
        
        // Total volume metrics
        this.elements.totalVolume.textContent = metrics.formattedTotalVolume || '$0';
        this.elements.totalQuantity.textContent = metrics.formattedTotalQuantity || '0 BTC';
        
        // Buyer total metrics
        this.elements.buyerTotalVolume.textContent = metrics.formattedBuyerVolumeUSDT || '$0';
        this.elements.buyerTotalQuantity.textContent = metrics.formattedBuyerQuantityBTC || '0 BTC';
        
        // Seller total metrics
        this.elements.sellerTotalVolume.textContent = metrics.formattedSellerVolumeUSDT || '$0';
        this.elements.sellerTotalQuantity.textContent = metrics.formattedSellerQuantityBTC || '0 BTC';
        
        // Last minute total metrics
        this.elements.minuteVolume.textContent = metrics.formattedLastMinuteVolume || '$0';
        this.elements.minuteQuantity.textContent = metrics.formattedLastMinuteQuantity || '0 BTC';
        
        // Last minute buyer metrics
        this.elements.minuteBuyerVolume.textContent = metrics.formattedLastMinuteBuyerVolume || '$0';
        this.elements.minuteBuyerQuantity.textContent = metrics.formattedLastMinuteBuyerQuantity || '0 BTC';
        
        // Last minute seller metrics
        this.elements.minuteSellerVolume.textContent = metrics.formattedLastMinuteSellerVolume || '$0';
        this.elements.minuteSellerQuantity.textContent = metrics.formattedLastMinuteSellerQuantity || '0 BTC';
        
        // Battle percentages
        this.elements.buyerPercentage.textContent = metrics.buyerPercentage + '%' || '0%';
        this.elements.sellerPercentage.textContent = metrics.sellerPercentage + '%' || '0%';
        this.elements.buyerVolumePercentage.textContent = metrics.buyerVolumePercentage + '%' || '0%';
        this.elements.sellerVolumePercentage.textContent = metrics.sellerVolumePercentage + '%' || '0%';
        
        // Stats
        this.elements.totalTrades.textContent = metrics.totalTrades || 0;
        this.elements.whaleTrades.textContent = metrics.whaleTradesCount || 0;
        this.elements.bigTrades.textContent = metrics.bigTradesCount || 0;
    }
    
    updateRecentTrades(trades) {
        this.elements.recentTrades.innerHTML = '';
        
        trades.forEach(trade => {
            const tradeElement = this.createTradeElement(trade);
            this.elements.recentTrades.appendChild(tradeElement);
        });
    }
    
    addToRecentTrades(trade) {
        const tradeElement = this.createTradeElement(trade);
        this.elements.recentTrades.insertBefore(tradeElement, this.elements.recentTrades.firstChild);
        
        // Remove excess trades (keep only 10)
        while (this.elements.recentTrades.children.length > 10) {
            this.elements.recentTrades.removeChild(this.elements.recentTrades.lastChild);
        }
    }
    
    updateTopBuyers(buyers) {
        this.elements.topBuyers.innerHTML = '';
        
        buyers.forEach((trade, index) => {
            const tradeElement = this.createTopTradeElement(trade, index + 1);
            this.elements.topBuyers.appendChild(tradeElement);
        });
    }
    
    updateTopSellers(sellers) {
        this.elements.topSellers.innerHTML = '';
        
        sellers.forEach((trade, index) => {
            const tradeElement = this.createTopTradeElement(trade, index + 1);
            this.elements.topSellers.appendChild(tradeElement);
        });
    }
    
    createTradeElement(trade) {
        const div = document.createElement('div');
        div.className = `trade-item ${trade.side.toLowerCase()}${trade.isWhale ? ' whale' : ''}`;
        
        div.innerHTML = `
            <div class="trade-header">
                <span class="trade-size ${trade.tradeSize}">${trade.tradeSize}</span>
                <span class="trade-time">${trade.timeAgo || 'now'}</span>
            </div>
            <div class="trade-details">
                <div class="trade-price">${trade.formattedPrice}</div>
                <div class="trade-quantity">${trade.formattedQuantity}</div>
                <div class="trade-volume">${trade.formattedVolume}</div>
            </div>
        `;
        
        return div;
    }
    
    createTopTradeElement(trade, rank) {
        const div = document.createElement('div');
        div.className = `trade-item ${trade.side.toLowerCase()}${trade.isWhale ? ' whale' : ''}`;
        
        div.innerHTML = `
            <div class="trade-header">
                <span class="trade-rank">#${rank}</span>
                <span class="trade-size ${trade.tradeSize}">${trade.tradeSize}</span>
                <span class="trade-time">${trade.timeAgo || 'now'}</span>
            </div>
            <div class="trade-details">
                <div class="trade-price">${trade.formattedPrice}</div>
                <div class="trade-quantity">${trade.formattedQuantity}</div>
                <div class="trade-volume">${trade.formattedVolume}</div>
            </div>
        `;
        
        return div;
    }
    
    updateBuyerCount() {
        const current = parseInt(this.elements.buyerCount.textContent) || 0;
        this.elements.buyerCount.textContent = current + 1;
    }
    
    updateSellerCount() {
        const current = parseInt(this.elements.sellerCount.textContent) || 0;
        this.elements.sellerCount.textContent = current + 1;
    }
    
    updateConnectionStatus(connected) {
        this.elements.connectionStatus.textContent = connected ? 'LIVE' : 'OFFLINE';
        this.elements.connectionStatus.className = connected ? 'stat-value connected' : 'stat-value disconnected';
    }
    
    updateUserCount(count) {
        this.elements.connectedUsers.textContent = count;
        
        // Add visual effect for user count changes
        if (count > 0) {
            this.elements.connectedUsers.classList.add('user-count-pulse');
            setTimeout(() => {
                this.elements.connectedUsers.classList.remove('user-count-pulse');
            }, 1000);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    enableSound() {
        this.soundEnabled = true;
        // Try to play a silent sound to enable audio context
        try {
            this.elements.tradeSound.volume = 0;
            this.elements.tradeSound.play().then(() => {
                this.elements.tradeSound.volume = 1;
            }).catch(() => {});
        } catch (error) {
            // Audio not supported
        }
    }
    
    resetStats() {
        if (confirm('Reset all statistics?')) {
            location.reload();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Starting Crypto War Zone...');
    window.cryptoWarZone = new CryptoWarZone();
    
    // Show keyboard shortcuts on first load
    setTimeout(() => {
        console.log('⌨️  Keyboard shortcuts:');
        console.log('   M - Toggle sound');
        console.log('   R - Reset statistics');
        console.log('   F - Toggle fullscreen');
    }, 2000);
});
