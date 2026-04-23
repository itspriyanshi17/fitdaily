import React from 'react';

const gradientMap = {
  teal: 'linear-gradient(90deg, #00d4aa, #5eead4)',
  blue: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  amber: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
  rose: 'linear-gradient(90deg, #f43f5e, #fb7185)',
  purple: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
};

const ProgressBar = ({ value = 0, max = 100, color = 'teal', animated = true, showLabel = false }) => {
  const safeValue = Math.max(0, Math.min(value, max));
  const percent = max > 0 ? Math.round((safeValue / max) * 100) : 0;
  const bg = gradientMap[color] || color;

  return (
    <div className="w-full">
      <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="relative h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: bg,
            transition: animated ? 'width 0.8s ease' : 'none',
          }}
        >
          {animated && <span className="absolute inset-0 bg-white/20" style={{ animation: 'shimmer 1.4s linear infinite' }} />}
        </div>
      </div>
      {showLabel && <p className="mt-1 text-xs text-[var(--text-secondary)]">{percent}%</p>}
    </div>
  );
};

export default ProgressBar;
