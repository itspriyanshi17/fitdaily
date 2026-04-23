import React from 'react';

const GlassCard = ({ className = '', children }) => (
  <div className={`glass-card ${className}`}>{children}</div>
);

export default GlassCard;
