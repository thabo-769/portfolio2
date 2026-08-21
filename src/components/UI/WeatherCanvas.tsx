import React, { useEffect, useRef } from 'react';

interface SnowflakeParticle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swaySpeed: number;
  swayOffset: number;
  opacity: number;
  depth: number;
}

export const WeatherCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Multi-Depth Snowflake Particles
    const snowCount = 130;
    const snowflakes: SnowflakeParticle[] = Array.from({ length: snowCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.6 + 1.0,
      speedY: Math.random() * 1.4 + 0.8,
      speedX: (Math.random() - 0.5) * 0.6,
      swaySpeed: Math.random() * 0.025 + 0.015,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.6 + 0.35,
      depth: Math.random() * 0.5 + 0.5,
    }));

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Render Snowfall Particles
      for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];

        ctx.globalAlpha = flake.opacity;
        ctx.fillStyle = '#FFFFFF';

        // Organic Snowflake circular crystal with smooth lateral sway
        ctx.beginPath();
        const currentSway = Math.sin(time * flake.swaySpeed + flake.swayOffset) * 1.8;
        ctx.arc(flake.x + currentSway, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft outer glow for larger foreground flakes
        if (flake.radius > 2.0) {
          ctx.beginPath();
          ctx.arc(flake.x + currentSway, flake.y, flake.radius * 2.0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fill();
        }

        // Update snowflake position
        flake.y += flake.speedY;
        flake.x += flake.speedX + Math.sin(time * 0.01) * 0.3;

        // Wrap around screen edges seamlessly
        if (flake.y > height + 10) {
          flake.y = -10;
          flake.x = Math.random() * width;
        }
        if (flake.x > width + 10) flake.x = -10;
        if (flake.x < -10) flake.x = width + 10;
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
      {/* 60FPS Ambient Snowfall Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};
