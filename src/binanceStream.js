const WebSocket = require('ws');
const EventEmitter = require('events');

class BinanceTradeStream extends EventEmitter {
    constructor() {
        super();
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        
        // Binance Futures WebSocket endpoint for BTC/USDT trades
        this.wsUrl = 'wss://fstream.binance.com/ws/btcusdt@aggTrade';
    }
    
    start() {
        console.log('🔌 Connecting to Binance Futures WebSocket...');
        this.connect();
    }
    
    connect() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.on('open', () => {
                console.log('✅ Connected to Binance Futures WebSocket');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.emit('connected');
            });
            
            this.ws.on('message', (data) => {
                try {
                    const trade = JSON.parse(data);
                    console.log('📦 Raw trade received:', JSON.stringify(trade, null, 2));
                    this.processTrade(trade);
                } catch (error) {
                    console.error('❌ Error parsing trade data:', error);
                }
            });
            
            this.ws.on('close', (code, reason) => {
                console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
                this.isConnected = false;
                this.handleReconnect();
            });
            
            this.ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
                this.isConnected = false;
            });
            
        } catch (error) {
            console.error('❌ Failed to connect to WebSocket:', error);
            this.handleReconnect();
        }
    }
    
    processTrade(rawTrade) {
        // Transform Binance trade data to our format
        const trade = {
            id: rawTrade.a, // Aggregate trade ID
            price: parseFloat(rawTrade.p), // Price
            quantity: parseFloat(rawTrade.q), // Quantity
            timestamp: rawTrade.T, // Trade time
            isBuyerMaker: rawTrade.m, // Is buyer the maker (false = buyer initiated, true = seller initiated)
            usdtVolume: parseFloat(rawTrade.p) * parseFloat(rawTrade.q), // Calculate USDT volume
            symbol: 'BTCUSDT',
            tradeTime: new Date(rawTrade.T).toISOString()
        };
        
        // Classify trade as buyer or seller initiated
        trade.side = trade.isBuyerMaker ? 'SELL' : 'BUY';
        trade.isWhale = trade.usdtVolume >= 100000; // Whale threshold: $100k+
        trade.isBigTrade = trade.usdtVolume >= 50000; // Big trade threshold: $50k+
        
        this.emit('trade', trade);
    }
    
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached. Manual restart required.');
            this.emit('maxReconnectAttemptsReached');
        }
    }
    
    stop() {
        console.log('🛑 Stopping Binance WebSocket connection...');
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
    
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            wsUrl: this.wsUrl
        };
    }
}

module.exports = BinanceTradeStream;
