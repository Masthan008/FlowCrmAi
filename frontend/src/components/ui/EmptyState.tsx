import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description = "There are no records to display at this time.",
  icon = <Inbox className="w-12 h-12 text-slate-300" />,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-card border border-slate-100/60 max-w-lg mx-auto my-6">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/40 mb-4 shadow-glossy-sm">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
