import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between px-1 text-slate-500 ${className}`}>
      <div className="text-xs font-medium">
        Showing Page {currentPage} of {totalPages || 1}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="glass"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
        >
          <ChevronsLeft size={16} />
        </Button>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
};
