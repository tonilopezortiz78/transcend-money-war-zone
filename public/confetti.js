// Confetti Animation System for Whale Trades
class ConfettiSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isActive = false;
        
        this.init();
    }
    
    init() {
        // Create confetti canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.style.display = 'none';
        
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle(x, y, emoji, type = 'normal') {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: Math.random() * -18 - 5,
            gravity: 0.4,
            life: 1.0,
            decay: Math.random() * 0.015 + 0.008,
            size: Math.random() * 20 + 25, // Larger for emojis
            emoji: emoji,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15,
            type: type,
            bounce: 0.7,
            hasHitGround: false
        };
    }
    
    launchConfetti(tradeType = 'buy') {
        this.canvas.style.display = 'block';
        this.isActive = true;
        
        // Choose emojis based on trade type - simplified and clearer
        const emojis = tradeType === 'buy' ? 
            ['💵', '💲','🤑'] : // Simple dollar emojis for aggressive buyers
            ['🔥','💥', '🪙']; // Fire, crash, and coin emojis for sellers
        
        // Single explosive burst from center
        const centerX = window.innerWidth * 0.5;
        const centerY = window.innerHeight * 0.4;
        
        // One main explosion with fewer particles for better performance
        for (let i = 0; i < 30; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            this.particles.push(this.createParticle(centerX, centerY, emoji, 'explosion'));
        }
        
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update physics
            particle.vy += particle.gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.life -= particle.decay;
            
            // Bounce effect when hitting ground
            if (particle.y > this.canvas.height - 50 && !particle.hasHitGround && particle.vy > 0) {
                particle.vy *= -particle.bounce;
                particle.vx *= 0.8; // Friction
                particle.hasHitGround = true;
            }
            
            // Remove dead particles
            if (particle.life <= 0 || (particle.y > this.canvas.height + 100)) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Draw emoji particle
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.globalAlpha = particle.life;
            
            // Set font size based on particle size
            this.ctx.font = `${particle.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add glow effect for dramatic impact
            this.ctx.shadowColor = particle.type === 'explosion' ? '#ffff00' : '#ffffff';
            this.ctx.shadowBlur = 10;
            
            // Draw the emoji
            this.ctx.fillText(particle.emoji, 0, 0);
            
            this.ctx.restore();
        }
        
        // Continue animation if particles exist
        if (this.particles.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    }
    
    stop() {
        this.isActive = false;
        this.canvas.style.display = 'none';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.particles = [];
    }
    
    // Fireworks effect for mega whales
    launchFireworks(type = 'buy') {
        this.canvas.style.display = 'block';
        this.isActive = true;
        
        const colors = type === 'buy' ? 
            ['#00ff00', '#00ffff', '#ffff00'] : 
            ['#ff0000', '#ff6600', '#ffff00'];
        
        // Create firework explosions
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight * 0.5 + window.innerHeight * 0.1;
                
                for (let j = 0; j < 30; j++) {
                    const angle = (Math.PI * 2 * j) / 30;
                    const speed = Math.random() * 8 + 4;
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    
                    const particle = this.createParticle(x, y, color);
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                    particle.gravity = 0.1;
                    particle.size = Math.random() * 6 + 3;
                    
                    this.particles.push(particle);
                }
            }, i * 300);
        }
        
        this.animate();
    }
}

// Initialize confetti system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.confettiSystem = new ConfettiSystem();
});
