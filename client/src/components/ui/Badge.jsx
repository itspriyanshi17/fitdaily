import React from 'react';

const styleMap = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  info: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
};

const Badge = ({ variant = 'info', children }) => (
  <span className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${styleMap[variant]}`}>
    {children}
  </span>
);

export default Badge;
