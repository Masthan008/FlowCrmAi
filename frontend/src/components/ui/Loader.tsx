import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`animate-spin rounded-full border-t-brand-550 border-r-transparent border-b-brand-100 border-l-transparent ${sizes[size]}`}
        role="status"
      />
    </div>
  );
};
