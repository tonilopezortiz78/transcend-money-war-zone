const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const BinanceTradeStream = require('./binanceStream');
const TradeAnalyzer = require('./tradeAnalyzer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize trade analyzer
const tradeAnalyzer = new TradeAnalyzer();

// Initialize Binance stream
const binanceStream = new BinanceTradeStream();

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to new client
    socket.emit('initialData', {
        metrics: tradeAnalyzer.getMetrics(),
        recentTrades: tradeAnalyzer.getRecentTrades(),
        topBuyers: tradeAnalyzer.getTopBuyers(),
        topSellers: tradeAnalyzer.getTopSellers()
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Handle incoming trade data
binanceStream.on('trade', (trade) => {
    // Analyze the trade
    const analyzedTrade = tradeAnalyzer.processTrade(trade);
    
    // Broadcast to all clients
    io.emit('newTrade', analyzedTrade);
    io.emit('metricsUpdate', tradeAnalyzer.getMetrics());
});

// Start the stream
binanceStream.start();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Crypto War Zone server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log('🔥 Cyberpunk Bitcoin futures battle visualization active!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Crypto War Zone...');
    binanceStream.stop();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
