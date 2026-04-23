import React from 'react';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, subtitle, ctaLabel, onCta }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    {Icon ? <Icon size={42} className="mb-3 text-[var(--text-muted)]" /> : null}
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
    {ctaLabel ? <Button variant="secondary" className="mt-4" onClick={onCta}>{ctaLabel}</Button> : null}
  </div>
);

export default EmptyState;
