import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const mouse = { x: null, y: null };

    // Update mouse position
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Spawn particles when mouse moves
      for (let i = 0; i < 4; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
    };

    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    let particles = [];
    // Antigravity vibrant signature colors: Blue, Purple, Pink, Orange, Cyan
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // Random spread and shaking velocity
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 2 + 0.5;
        this.vx = Math.cos(angle) * velocity;
        this.vy = Math.sin(angle) * velocity;
        
        // Random particle size
        this.size = Math.random() * 3 + 1.5;
        this.baseSize = this.size;
        
        // Random vibrant color
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Lifespan logic
        this.life = 100; // max life
        this.decay = Math.random() * 2 + 1; // how fast it fades
      }

      update() {
        // Apply shaking/spreading movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Add minimal gravity or float
        this.vy -= 0.02; // slow float upwards
        
        // Decay the life
        this.life -= this.decay;
        
        // Shrink the particle as it decays
        if (this.life < 100) {
           this.size = Math.max(0, this.baseSize * (this.life / 100));
        }
      }

      draw(ctx) {
        ctx.fillStyle = this.color;
        // Make it slightly transparent as it fades
        ctx.globalAlpha = Math.max(0, this.life / 100);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset
      }
    }

    function animate() {
      // Clear entirely each frame (no trails, just distinct moving dots)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles, remove dead ones
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    
    // De-bounce resize
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setSize, 200);
    };
    window.addEventListener('resize', handleResize);

    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-auto"
    />
  );
}
