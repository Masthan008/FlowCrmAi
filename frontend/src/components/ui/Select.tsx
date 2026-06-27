import React, { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || Math.random().toString(36).substring(2, 9);

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-500 tracking-wide uppercase px-0.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`glass-select w-full text-sm text-slate-700 py-2.5 px-4 border appearance-none ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200/80 focus:border-brand-550 focus:ring-brand-100'
          } ${className}`}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem',
            backgroundRepeat: 'no-repeat'
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs font-medium text-red-500 px-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
