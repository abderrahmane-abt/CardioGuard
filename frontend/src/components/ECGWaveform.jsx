import React, { useEffect, useRef } from 'react';

export default function ECGWaveform({
  color = '#ef4444',
  height = 50,
  speed = 2.2,
  className = 'w-full',
  strokeWidth = 2,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Standard ECG P-Q-R-S-T wave pattern generator
    const getECGValue = (x) => {
      const cycle = 180; // wave cycle length in pixels
      const pos = (x + offset) % cycle;
      const mid = height / 2;

      // Baseline
      if (pos < 30) return mid;
      // P wave (atrial depolarization)
      if (pos < 50) return mid - Math.sin(((pos - 30) / 20) * Math.PI) * (height * 0.18);
      // PR segment
      if (pos < 70) return mid;
      // Q dip
      if (pos < 75) return mid + ((pos - 70) / 5) * (height * 0.15);
      // R peak (ventricular depolarization - sharp peak)
      if (pos < 85) return mid - ((pos - 75) / 10) * (height * 0.45);
      // S wave (deep valley)
      if (pos < 95) return mid + (height * 0.35) - ((pos - 85) / 10) * (height * 0.7);
      // ST segment
      if (pos < 110) return mid;
      // T wave (ventricular repolarization)
      if (pos < 140) return mid - Math.sin(((pos - 110) / 30) * Math.PI) * (height * 0.25);
      // TP baseline
      return mid;
    };

    const draw = () => {
      offset += speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let x = 0; x < canvas.width; x += 2) {
        const y = getECGValue(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Leading glowing dot at the right edge
      const leadY = getECGValue(canvas.width - 2);
      ctx.beginPath();
      ctx.arc(canvas.width - 2, leadY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [color, height, speed, strokeWidth]);

  return <canvas ref={canvasRef} className={`block ${className}`} style={{ height }} />;
}
