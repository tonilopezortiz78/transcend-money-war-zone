// Matrix Rain Effect for Cyberpunk Background
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.animationId = null;
        
        this.init();
        this.resize();
        this.start();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        
        // Initialize drops
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * this.canvas.height;
        }
    }
    
    draw() {
        // Create trailing effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set text properties
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        // Draw characters
        for (let i = 0; i < this.drops.length; i++) {
            const character = this.characters[Math.floor(Math.random() * this.characters.length)];
            const x = i * this.fontSize;
            const y = this.drops[i];
            
            // Add glow effect for some characters
            if (Math.random() > 0.98) {
                this.ctx.shadowColor = '#00ff00';
                this.ctx.shadowBlur = 10;
            } else {
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.fillText(character, x, y);
            
            // Reset drop to top when it reaches bottom
            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            
            // Move drop down
            this.drops[i] += this.fontSize;
        }
    }
    
    animate() {
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    start() {
        if (!this.animationId) {
            this.animate();
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Add cyberpunk glitch effect
    glitch() {
        const originalFillStyle = this.ctx.fillStyle;
        
        // Red glitch
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            Math.random() * 200,
            Math.random() * 50
        );
        
        // Blue glitch
        this.ctx.fillStyle = '#0000ff';
        this.ctx.fillRect(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            Math.random() * 200,
            Math.random() * 50
        );
        
        this.ctx.fillStyle = originalFillStyle;
        
        // Clear glitch after short time
        setTimeout(() => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }, 100);
    }
    
    // Pulse effect for big trades
    pulse(intensity = 1) {
        const originalAlpha = this.ctx.globalAlpha;
        this.ctx.globalAlpha = 0.1 * intensity;
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = originalAlpha;
        
        setTimeout(() => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }, 200);
    }
}

// Initialize matrix rain when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.matrixRain = new MatrixRain();
    
    // Add random glitch effects
    setInterval(() => {
        if (Math.random() > 0.95) {
            window.matrixRain.glitch();
        }
    }, 2000);
});
