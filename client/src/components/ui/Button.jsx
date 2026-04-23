import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-white/10 rounded-full',
  danger: 'rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white border border-rose-400/40',
};

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const classes = `${variants[variant] || variants.primary} inline-flex items-center justify-center gap-2 px-4 py-2 font-semibold transition-all active:scale-[.97] ${className}`;
  return <button className={classes} {...props} />;
};

export default Button;
