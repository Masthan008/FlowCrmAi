import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-brand-550 transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1.5" />
            CRM
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-slate-350 mx-1" />
                {isLast || !item.href ? (
                  <span className="text-xs font-semibold text-slate-700 select-none">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-xs font-semibold text-slate-400 hover:text-brand-550 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
