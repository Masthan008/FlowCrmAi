import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-500 tracking-wide uppercase px-0.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`glass-input w-full text-sm text-slate-700 py-2.5 ${
              icon ? 'pl-10' : 'pl-4'
            } pr-4 border ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200/80 focus:border-brand-550 focus:ring-brand-100'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-medium text-red-500 px-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
