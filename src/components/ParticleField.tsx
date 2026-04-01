import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 80;
    const CONNECTION_DISTANCE = 120;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = document.documentElement.scrollHeight;
    }
    resize();

    // Reinit on resize
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(document.documentElement);

    function createParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        life: 0,
        maxLife: Math.random() * 1000 + 500,
      };
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife; // stagger initial life
      particles.push(p);
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Get visible area
      const scrollY = window.scrollY;
      const viewTop = scrollY - 100;
      const viewBottom = scrollY + window.innerHeight + 100;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Wrap around
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        // Reset if life exceeded
        if (p.life > p.maxLife) {
          particles[i] = createParticle();
          continue;
        }

        // Only draw if in view
        if (p.y < viewTop || p.y > viewBottom) continue;

        // Fade in/out based on life
        const lifeFraction = p.life / p.maxLife;
        let alpha = p.opacity;
        if (lifeFraction < 0.1) alpha *= lifeFraction / 0.1;
        if (lifeFraction > 0.9) alpha *= (1 - lifeFraction) / 0.1;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx!.fill();
      }

      // Draw connections between nearby visible particles
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.y < viewTop || a.y > viewBottom) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (b.y < viewTop || b.y > viewBottom) continue;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const lineAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.08;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // Check reduced motion preference
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!prefersReduced) {
      animate();
    }

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
