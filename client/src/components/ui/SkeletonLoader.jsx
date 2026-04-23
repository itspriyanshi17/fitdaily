import React from 'react';

const variants = {
  card: 'h-28 rounded-[var(--radius-lg)]',
  text: 'h-4 rounded-md',
  circle: 'h-12 w-12 rounded-full',
  bar: 'h-2 rounded-full',
};

const SkeletonLoader = ({ variant = 'card', className = '' }) => (
  <div className={`animate-pulse bg-white/10 ${variants[variant]} ${className}`} />
);

export default SkeletonLoader;
