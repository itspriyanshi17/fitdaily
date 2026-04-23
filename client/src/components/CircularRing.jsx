import React from 'react';
import useCountUp from '../hooks/useCountUp';

const CircularRing = ({ 
  value = 0, 
  max = 100, 
  size = 120, 
  strokeWidth = 10, 
  color = 'var(--color-primary)', 
  children,
  label = '',
  sublabel = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeValue = Math.min(value, max);
  const percent = max > 0 ? safeValue / max : 0;
  const offset = circumference - percent * circumference;
  const displayValue = useCountUp(safeValue, 1000);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring */}
        <circle
          className="transition-all duration-1000 ease-out animate-ring"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ '--offset': offset, strokeDashoffset: circumference }}
          strokeLinecap="round"
          filter={`drop-shadow(0 0 8px ${color})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {children || (
          <>
            <span className="text-2xl font-bold">{displayValue}</span>
            {label && <span className="text-xs text-[var(--text-secondary)]">{label}</span>}
            {sublabel && <span className="text-[10px] text-[var(--text-muted)]">{sublabel}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default CircularRing;
