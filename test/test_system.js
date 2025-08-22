// Test System for Crypto War Zone
const BinanceTradeStream = require('../src/binanceStream');
const TradeAnalyzer = require('../src/tradeAnalyzer');

class SystemTester {
    constructor() {
        this.tradeAnalyzer = new TradeAnalyzer();
        this.testResults = [];
    }
    
    async runAllTests() {
        console.log('🧪 Starting Crypto War Zone System Tests...\n');
        
        await this.testTradeAnalyzer();
        await this.testBinanceStream();
        await this.testTradeClassification();
        await this.testMetricsCalculation();
        
        this.printResults();
    }
    
    async testTradeAnalyzer() {
        console.log('📊 Testing Trade Analyzer...');
        
        try {
            // Test trade processing
            const mockTrade = {
                id: 'test123',
                price: 45000,
                quantity: 0.5,
                timestamp: Date.now(),
                isBuyerMaker: false,
                usdtVolume: 22500,
                symbol: 'BTCUSDT',
                side: 'BUY',
                isWhale: false,
                isBigTrade: false
            };
            
            const processedTrade = this.tradeAnalyzer.processTrade(mockTrade);
            
            if (processedTrade && processedTrade.formattedPrice) {
                this.testResults.push({ test: 'Trade Analyzer', status: 'PASS', message: 'Trade processing works correctly' });
            } else {
                this.testResults.push({ test: 'Trade Analyzer', status: 'FAIL', message: 'Trade processing failed' });
            }
            
        } catch (error) {
            this.testResults.push({ test: 'Trade Analyzer', status: 'FAIL', message: error.message });
        }
    }
    
    async testBinanceStream() {
        console.log('🔌 Testing Binance Stream Connection...');
        
        try {
            const stream = new BinanceTradeStream();
            const status = stream.getConnectionStatus();
            
            if (status && status.wsUrl) {
                this.testResults.push({ test: 'Binance Stream', status: 'PASS', message: 'Stream initialization successful' });
            } else {
                this.testResults.push({ test: 'Binance Stream', status: 'FAIL', message: 'Stream initialization failed' });
            }
            
        } catch (error) {
            this.testResults.push({ test: 'Binance Stream', status: 'FAIL', message: error.message });
        }
    }
    
    async testTradeClassification() {
        console.log('🎯 Testing Trade Classification...');
        
        try {
            // Test buyer trade
            const buyerTrade = {
                id: 'buy123',
                price: 45000,
                quantity: 2.5,
                timestamp: Date.now(),
                isBuyerMaker: false, // Buyer initiated
                usdtVolume: 112500,
                symbol: 'BTCUSDT',
                side: 'BUY',
                isWhale: true,
                isBigTrade: true
            };
            
            // Test seller trade
            const sellerTrade = {
                id: 'sell123',
                price: 44900,
                quantity: 1.0,
                timestamp: Date.now(),
                isBuyerMaker: true, // Seller initiated
                usdtVolume: 44900,
                symbol: 'BTCUSDT',
                side: 'SELL',
                isWhale: false,
                isBigTrade: false
            };
            
            const processedBuy = this.tradeAnalyzer.processTrade(buyerTrade);
            const processedSell = this.tradeAnalyzer.processTrade(sellerTrade);
            
            if (processedBuy.side === 'BUY' && processedSell.side === 'SELL') {
                this.testResults.push({ test: 'Trade Classification', status: 'PASS', message: 'Buy/Sell classification works correctly' });
            } else {
                this.testResults.push({ test: 'Trade Classification', status: 'FAIL', message: 'Trade classification failed' });
            }
            
        } catch (error) {
            this.testResults.push({ test: 'Trade Classification', status: 'FAIL', message: error.message });
        }
    }
    
    async testMetricsCalculation() {
        console.log('📈 Testing Metrics Calculation...');
        
        try {
            // Add multiple trades to test metrics
            const trades = [
                { price: 45000, quantity: 1.0, usdtVolume: 45000, side: 'BUY', isWhale: false, isBigTrade: false, timestamp: Date.now() },
                { price: 44950, quantity: 2.0, usdtVolume: 89900, side: 'SELL', isWhale: false, isBigTrade: true, timestamp: Date.now() },
                { price: 45100, quantity: 5.0, usdtVolume: 225500, side: 'BUY', isWhale: true, isBigTrade: true, timestamp: Date.now() }
            ];
            
            trades.forEach(trade => this.tradeAnalyzer.processTrade(trade));
            
            const metrics = this.tradeAnalyzer.getMetrics();
            
            console.log('Debug - Metrics:', {
                totalTrades: metrics.totalTrades,
                totalVolume: metrics.totalVolume,
                buyerVolumeUSDT: metrics.buyerVolumeUSDT,
                sellerVolumeUSDT: metrics.sellerVolumeUSDT,
                buyerTrades: metrics.buyerTrades,
                sellerTrades: metrics.sellerTrades
            });
            
            if (metrics.totalTrades === 3 && metrics.totalVolume > 0 && 
                metrics.buyerVolumeUSDT > 0 && metrics.sellerVolumeUSDT > 0) {
                this.testResults.push({ test: 'Metrics Calculation', status: 'PASS', message: 'Metrics calculation works correctly' });
            } else {
                this.testResults.push({ test: 'Metrics Calculation', status: 'FAIL', message: `Metrics calculation failed - totalTrades: ${metrics.totalTrades}, totalVolume: ${metrics.totalVolume}, buyerVolume: ${metrics.buyerVolumeUSDT}, sellerVolume: ${metrics.sellerVolumeUSDT}` });
            }
            
        } catch (error) {
            this.testResults.push({ test: 'Metrics Calculation', status: 'FAIL', message: error.message });
        }
    }
    
    printResults() {
        console.log('\n🏆 Test Results Summary:');
        console.log('========================');
        
        let passed = 0;
        let failed = 0;
        
        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.message}`);
            
            if (result.status === 'PASS') passed++;
            else failed++;
        });
        
        console.log('\n📊 Summary:');
        console.log(`   Passed: ${passed}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Total:  ${passed + failed}`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed! System is ready for deployment.');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the issues above.');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new SystemTester();
    tester.runAllTests().catch(console.error);
}

module.exports = SystemTester;
