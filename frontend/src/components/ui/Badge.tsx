import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'neutral',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border tracking-wide select-none';
  
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200/60',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
