import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Search, History, User, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { LeadHistory } from '../../../types/lead';
import useLeadStore from '../../../store/leadStore';

interface HistoryTabProps {
  leadId: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ leadId }) => {
  const { history, fetchHistory, tabLoading } = useLeadStore();
  const [search, setSearch] = useState('');
  const loading = tabLoading.History;

  useEffect(() => {
    fetchHistory(leadId);
  }, [leadId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(leadId, { search });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit changes..."
            className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
          />
        </div>
        <Button variant="glass" type="submit" size="sm" className="rounded-xl">
          Filter Log
        </Button>
      </form>

      {/* Log Entries */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
        ) : history.length > 0 ? (
          history.map((log) => (
            <Card
              key={log.id}
              className="p-4 bg-white/75 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Audit Action Info */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 flex-wrap">
                      <span>{log.action}</span>
                      {log.fieldName && (
                        <>
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                            {log.fieldName}
                          </span>
                        </>
                      )}
                    </h4>

                    {/* Old vs New Value comparison */}
                    {log.oldValue || log.newValue ? (
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-slate-600 font-semibold bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 max-w-lg">
                        <span className="text-slate-400 line-through truncate max-w-[180px]" title={log.oldValue || ''}>
                          {log.oldValue || 'None'}
                        </span>
                        <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-blue-700 truncate max-w-[180px] font-bold" title={log.newValue || ''}>
                          {log.newValue || 'None'}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Audit Author & Date */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <span className="flex items-center gap-1">
                    <User size={10} className="text-slate-300" />
                    {log.userId ? 'User Context' : 'System Agent'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} className="text-slate-300" />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl border border-dashed border-slate-200/80 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <History size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No History Available</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              No audit log actions recorded for this lead record yet. Changes will appear as they occur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
