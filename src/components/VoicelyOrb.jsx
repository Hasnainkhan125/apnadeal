// src/components/VoicelyOrb.jsx — glowing purple voice orb
import React, { useEffect, useRef } from "react";

const VoicelyOrb = ({ size = 260, active = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const S = size;
    canvas.width = S * DPR;
    canvas.height = S * DPR;
    canvas.style.width = `${S}px`;
    canvas.style.height = `${S}px`;
    ctx.scale(DPR, DPR);

    let raf;
    const start = performance.now();

    const draw = (now) => {
      const t = (now - start) * 0.001;
      ctx.clearRect(0, 0, S, S);
      const cx = S / 2;
      const cy = S / 2;

      // Outer purple glow aura
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, S / 2);
      aura.addColorStop(0, "rgba(180,80,255,0.55)");
      aura.addColorStop(0.35, "rgba(140,60,230,0.35)");
      aura.addColorStop(0.7, "rgba(90,30,180,0.12)");
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, S / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw ~7 concentric wavy rings (the "wireframe" bloom)
      const ringCount = 7;
      for (let r = 0; r < ringCount; r++) {
        const baseR = S * 0.13 + r * S * 0.028;
        const phase = t * (0.6 + r * 0.08) + r * 0.7;
        const alpha = 0.7 - r * 0.07;
        const purple = 200 - r * 10;
        const blue = 255 - r * 5;

        ctx.beginPath();
        const steps = 180;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          // Wave distortion
          const wave =
            Math.sin(a * 3 + phase) * (S * 0.012 + r * S * 0.002) +
            Math.cos(a * 5 - phase * 1.3) * (S * 0.008 + r * S * 0.0015) +
            Math.sin(a * 8 + phase * 0.7) * (S * 0.004 + r * S * 0.001);

          const rr = baseR + wave + Math.sin(phase) * S * 0.01;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${purple}, 90, ${blue}, ${alpha})`;
        ctx.lineWidth = 1.6 - r * 0.1;
        ctx.stroke();
      }

      // Inner core (bright center)
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.14);
      core.addColorStop(0, "rgba(255,220,255,0.95)");
      core.addColorStop(0.4, "rgba(200,140,255,0.7)");
      core.addColorStop(1, "rgba(140,60,230,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.14, 0, Math.PI * 2);
      ctx.fill();

      // Vertical waveform bars in center
      const bars = 5;
      const barMaxH = S * 0.075;
      const barW = S * 0.012;
      const gap = S * 0.028;
      const totalW = bars * barW + (bars - 1) * gap;
      const startX = cx - totalW / 2;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      for (let i = 0; i < bars; i++) {
        const phase = t * 2.2 + i * 0.6;
        const h = barMaxH * (0.35 + Math.abs(Math.sin(phase)) * 0.65);
        const x = startX + i * (barW + gap);
        const y = cy - h / 2;
        const radius = barW / 2;
        // rounded rect
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barW - radius, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
        ctx.lineTo(x + barW, y + h - radius);
        ctx.quadraticCurveTo(x + barW, y + h, x + barW - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: size,
        height: size,
        filter: "drop-shadow(0 0 40px rgba(160,80,255,0.55))",
      }}
    />
  );
};

export default VoicelyOrb;