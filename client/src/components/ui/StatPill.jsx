import React from 'react';

const colors = {
  teal: 'bg-[var(--accent-teal-dim)] border-[rgba(0,212,170,0.3)]',
  purple: 'bg-[var(--accent-purple-dim)] border-[rgba(124,58,237,0.3)]',
  amber: 'bg-[var(--accent-amber-dim)] border-[rgba(245,158,11,0.3)]',
  rose: 'bg-[var(--accent-rose-dim)] border-[rgba(244,63,94,0.3)]',
  blue: 'bg-[var(--accent-blue-dim)] border-[rgba(59,130,246,0.3)]',
};

const StatPill = ({ icon: Icon, value, label, color = 'teal' }) => (
  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${colors[color]}`}>
    {Icon ? <Icon size={14} /> : null}
    <span>{value}</span>
    <span className="text-[var(--text-secondary)]">{label}</span>
  </span>
);

export default StatPill;
