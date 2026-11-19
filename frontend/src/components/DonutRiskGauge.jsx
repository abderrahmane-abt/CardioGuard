import React from 'react';
import { motion } from 'framer-motion';

export default function DonutRiskGauge({ probability = 0.18, riskLevel = 'low', size = 150 }) {
  const pct = Math.round(probability * 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const colorStyles = {
    low: {
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      text: 'text-emerald-400',
      label: 'Low Risk',
      bgRing: '#064e3b',
    },
    moderate: {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      text: 'text-amber-400',
      label: 'Moderate Risk',
      bgRing: '#78350f',
    },
    high: {
      stroke: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.45)',
      text: 'text-rose-500',
      label: 'High Risk',
      bgRing: '#4c0519',
    },
    critical: {
      stroke: '#dc2626',
      glow: 'rgba(220, 38, 38, 0.6)',
      text: 'text-red-500',
      label: 'Critical Risk',
      bgRing: '#450a0a',
    },
  };

  const style = colorStyles[riskLevel] || colorStyles.low;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={style.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 10px ${style.glow})` }}
        />
      </svg>
      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-3xl font-extrabold ${style.text} tracking-tight`}>{pct}%</span>
        <span className="text-[10px] text-cardio-muted uppercase font-semibold tracking-wider -mt-0.5">
          Risk Score
        </span>
      </div>
    </div>
  );
}
