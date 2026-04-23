import React from 'react';

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
      {subtitle ? <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p> : null}
    </div>
    {action}
  </div>
);

export default SectionHeader;
