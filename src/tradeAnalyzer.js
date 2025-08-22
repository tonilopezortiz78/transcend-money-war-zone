class TradeAnalyzer {
    constructor() {
        this.recentTrades = [];
        this.topBuyers = [];
        this.topSellers = [];
        this.metrics = {
            // Total metrics
            totalVolume: 0,
            totalQuantity: 0,
            totalTrades: 0,
            
            // Buyer metrics
            buyerTrades: 0,
            buyerVolumeUSDT: 0,
            buyerQuantityBTC: 0,
            
            // Seller metrics
            sellerTrades: 0,
            sellerVolumeUSDT: 0,
            sellerQuantityBTC: 0,
            
            // Last minute metrics
            lastMinuteVolume: 0,
            lastMinuteQuantity: 0,
            lastMinuteBuyerVolume: 0,
            lastMinuteBuyerQuantity: 0,
            lastMinuteSellerVolume: 0,
            lastMinuteSellerQuantity: 0,
            
            // Price and special trades
            currentPrice: 0,
            priceChange24h: 0,
            whaleTradesCount: 0,
            bigTradesCount: 0
        };
        
        // Keep track of trades in the last minute
        this.lastMinuteTrades = [];
        
        // Maximum items to keep in arrays
        this.maxRecentTrades = 10;
        this.maxTopTrades = 10;
        
        // Start minute tracker
        this.startMinuteTracker();
    }
    
    processTrade(trade) {
        // Update metrics
        this.updateMetrics(trade);
        
        // Add to recent trades (keep only last 10)
        this.recentTrades.unshift(trade);
        if (this.recentTrades.length > this.maxRecentTrades) {
            this.recentTrades.pop();
        }
        
        // Update top buyers/sellers lists
        this.updateTopTrades(trade);
        
        // Add to last minute tracker
        this.lastMinuteTrades.push({
            ...trade,
            addedAt: Date.now()
        });
        
        return {
            ...trade,
            formattedPrice: this.formatPrice(trade.price),
            formattedQuantity: this.formatQuantity(trade.quantity),
            formattedVolume: this.formatVolume(trade.usdtVolume),
            tradeSize: this.getTradeSize(trade.usdtVolume)
        };
    }
    
    updateMetrics(trade) {
        // Update total metrics
        this.metrics.totalVolume += trade.usdtVolume;
        this.metrics.totalQuantity += trade.quantity;
        this.metrics.currentPrice = trade.price;
        this.metrics.totalTrades++;
        
        // Update buyer/seller specific metrics
        if (trade.side === 'BUY') {
            this.metrics.buyerTrades++;
            this.metrics.buyerVolumeUSDT += trade.usdtVolume;
            this.metrics.buyerQuantityBTC += trade.quantity;
        } else {
            this.metrics.sellerTrades++;
            this.metrics.sellerVolumeUSDT += trade.usdtVolume;
            this.metrics.sellerQuantityBTC += trade.quantity;
        }
        
        // Update special trade counters
        if (trade.isWhale) {
            this.metrics.whaleTradesCount++;
        }
        
        if (trade.isBigTrade) {
            this.metrics.bigTradesCount++;
        }
    }
    
    updateTopTrades(trade) {
        if (trade.side === 'BUY') {
            // Add to buyers list
            this.topBuyers.push(trade);
            // Sort by USDT volume descending
            this.topBuyers.sort((a, b) => b.usdtVolume - a.usdtVolume);
            // Keep only top 10
            if (this.topBuyers.length > this.maxTopTrades) {
                this.topBuyers = this.topBuyers.slice(0, this.maxTopTrades);
            }
        } else {
            // Add to sellers list
            this.topSellers.push(trade);
            // Sort by USDT volume descending
            this.topSellers.sort((a, b) => b.usdtVolume - a.usdtVolume);
            // Keep only top 10
            if (this.topSellers.length > this.maxTopTrades) {
                this.topSellers = this.topSellers.slice(0, this.maxTopTrades);
            }
        }
    }
    
    startMinuteTracker() {
        setInterval(() => {
            this.updateLastMinuteMetrics();
        }, 1000); // Update every second
    }
    
    updateLastMinuteMetrics() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000; // 60 seconds ago
        
        // Filter trades from last minute
        this.lastMinuteTrades = this.lastMinuteTrades.filter(trade => 
            trade.addedAt > oneMinuteAgo
        );
        
        // Calculate total last minute metrics
        this.metrics.lastMinuteVolume = this.lastMinuteTrades.reduce(
            (sum, trade) => sum + trade.usdtVolume, 0
        );
        this.metrics.lastMinuteQuantity = this.lastMinuteTrades.reduce(
            (sum, trade) => sum + trade.quantity, 0
        );
        
        // Calculate buyer-specific last minute metrics
        const buyerTrades = this.lastMinuteTrades.filter(trade => trade.side === 'BUY');
        this.metrics.lastMinuteBuyerVolume = buyerTrades.reduce(
            (sum, trade) => sum + trade.usdtVolume, 0
        );
        this.metrics.lastMinuteBuyerQuantity = buyerTrades.reduce(
            (sum, trade) => sum + trade.quantity, 0
        );
        
        // Calculate seller-specific last minute metrics
        const sellerTrades = this.lastMinuteTrades.filter(trade => trade.side === 'SELL');
        this.metrics.lastMinuteSellerVolume = sellerTrades.reduce(
            (sum, trade) => sum + trade.usdtVolume, 0
        );
        this.metrics.lastMinuteSellerQuantity = sellerTrades.reduce(
            (sum, trade) => sum + trade.quantity, 0
        );
    }
    
    getTradeSize(usdtVolume) {
        if (usdtVolume >= 1000000) return 'MEGA'; // $1M+
        if (usdtVolume >= 500000) return 'WHALE'; // $500k+
        if (usdtVolume >= 100000) return 'BIG'; // $100k+
        if (usdtVolume >= 50000) return 'MEDIUM'; // $50k+
        if (usdtVolume >= 10000) return 'SMALL'; // $10k+
        return 'TINY'; // < $10k
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    }
    
    formatQuantity(quantity) {
        return quantity.toFixed(6) + ' BTC';
    }
    
    formatVolume(volume) {
        if (volume >= 1000000) {
            return '$' + (volume / 1000000).toFixed(2) + 'M';
        } else if (volume >= 1000) {
            return '$' + (volume / 1000).toFixed(1) + 'K';
        } else {
            return '$' + volume.toFixed(0);
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            // Formatted total metrics
            formattedTotalVolume: this.formatVolume(this.metrics.totalVolume),
            formattedTotalQuantity: this.formatQuantity(this.metrics.totalQuantity),
            formattedCurrentPrice: this.formatPrice(this.metrics.currentPrice),
            
            // Formatted buyer metrics
            formattedBuyerVolumeUSDT: this.formatVolume(this.metrics.buyerVolumeUSDT),
            formattedBuyerQuantityBTC: this.formatQuantity(this.metrics.buyerQuantityBTC),
            
            // Formatted seller metrics
            formattedSellerVolumeUSDT: this.formatVolume(this.metrics.sellerVolumeUSDT),
            formattedSellerQuantityBTC: this.formatQuantity(this.metrics.sellerQuantityBTC),
            
            // Formatted last minute total metrics
            formattedLastMinuteVolume: this.formatVolume(this.metrics.lastMinuteVolume),
            formattedLastMinuteQuantity: this.formatQuantity(this.metrics.lastMinuteQuantity),
            
            // Formatted last minute buyer metrics
            formattedLastMinuteBuyerVolume: this.formatVolume(this.metrics.lastMinuteBuyerVolume),
            formattedLastMinuteBuyerQuantity: this.formatQuantity(this.metrics.lastMinuteBuyerQuantity),
            
            // Formatted last minute seller metrics
            formattedLastMinuteSellerVolume: this.formatVolume(this.metrics.lastMinuteSellerVolume),
            formattedLastMinuteSellerQuantity: this.formatQuantity(this.metrics.lastMinuteSellerQuantity),
            
            // Percentages
            buyerPercentage: this.metrics.totalTrades > 0 ? 
                ((this.metrics.buyerTrades / this.metrics.totalTrades) * 100).toFixed(1) : 0,
            sellerPercentage: this.metrics.totalTrades > 0 ? 
                ((this.metrics.sellerTrades / this.metrics.totalTrades) * 100).toFixed(1) : 0,
                
            // Volume percentages
            buyerVolumePercentage: this.metrics.totalVolume > 0 ? 
                ((this.metrics.buyerVolumeUSDT / this.metrics.totalVolume) * 100).toFixed(1) : 0,
            sellerVolumePercentage: this.metrics.totalVolume > 0 ? 
                ((this.metrics.sellerVolumeUSDT / this.metrics.totalVolume) * 100).toFixed(1) : 0
        };
    }
    
    getRecentTrades() {
        return this.recentTrades.map(trade => ({
            ...trade,
            formattedPrice: this.formatPrice(trade.price),
            formattedQuantity: this.formatQuantity(trade.quantity),
            formattedVolume: this.formatVolume(trade.usdtVolume),
            tradeSize: this.getTradeSize(trade.usdtVolume),
            timeAgo: this.getTimeAgo(trade.timestamp)
        }));
    }
    
    getTopBuyers() {
        return this.topBuyers.map(trade => ({
            ...trade,
            formattedPrice: this.formatPrice(trade.price),
            formattedQuantity: this.formatQuantity(trade.quantity),
            formattedVolume: this.formatVolume(trade.usdtVolume),
            tradeSize: this.getTradeSize(trade.usdtVolume),
            timeAgo: this.getTimeAgo(trade.timestamp)
        }));
    }
    
    getTopSellers() {
        return this.topSellers.map(trade => ({
            ...trade,
            formattedPrice: this.formatPrice(trade.price),
            formattedQuantity: this.formatQuantity(trade.quantity),
            formattedVolume: this.formatVolume(trade.usdtVolume),
            tradeSize: this.getTradeSize(trade.usdtVolume),
            timeAgo: this.getTimeAgo(trade.timestamp)
        }));
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 1000) return 'now';
        if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        return Math.floor(diff / 3600000) + 'h ago';
    }
    
    reset() {
        this.recentTrades = [];
        this.topBuyers = [];
        this.topSellers = [];
        this.lastMinuteTrades = [];
        this.metrics = {
            // Total metrics
            totalVolume: 0,
            totalQuantity: 0,
            totalTrades: 0,
            
            // Buyer metrics
            buyerTrades: 0,
            buyerVolumeUSDT: 0,
            buyerQuantityBTC: 0,
            
            // Seller metrics
            sellerTrades: 0,
            sellerVolumeUSDT: 0,
            sellerQuantityBTC: 0,
            
            // Last minute metrics
            lastMinuteVolume: 0,
            lastMinuteQuantity: 0,
            lastMinuteBuyerVolume: 0,
            lastMinuteBuyerQuantity: 0,
            lastMinuteSellerVolume: 0,
            lastMinuteSellerQuantity: 0,
            
            // Price and special trades
            currentPrice: 0,
            priceChange24h: 0,
            whaleTradesCount: 0,
            bigTradesCount: 0
        };
    }
}

module.exports = TradeAnalyzer;
