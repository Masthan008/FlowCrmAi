import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while fetching data. Please try again later.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-100 rounded-2xl max-w-lg mx-auto my-6">
      <div className="p-3 bg-red-100/60 border border-red-200/50 rounded-2xl mb-4 text-red-600 shadow-glossy-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="glass"
          onClick={onRetry}
          className="flex items-center gap-2 border-red-200 text-red-700 bg-white/80 hover:bg-red-50 focus:ring-red-100"
        >
          <RotateCcw size={14} />
          Retry Request
        </Button>
      )}
    </div>
  );
};
