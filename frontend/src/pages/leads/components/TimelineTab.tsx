import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import {
  UserPlus,
  Pencil,
  Activity,
  UserCheck,
  Calendar,
  CheckCircle,
  Paperclip,
  FileText,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import type { LeadTimeline } from '../../../types/lead';
import useLeadStore from '../../../store/leadStore';

interface TimelineTabProps {
  leadId: string;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'LEAD_CREATED':
      return <UserPlus size={14} className="text-emerald-600" />;
    case 'LEAD_UPDATED':
      return <Pencil size={14} className="text-blue-600" />;
    case 'STATUS_CHANGED':
      return <Activity size={14} className="text-violet-600" />;
    case 'OWNER_CHANGED':
      return <UserCheck size={14} className="text-purple-600" />;
    case 'MEETING_SCHEDULED':
      return <Calendar size={14} className="text-orange-600" />;
    case 'TASK_CREATED':
      return <CheckCircle size={14} className="text-indigo-600" />;
    case 'FILE_UPLOADED':
      return <Paperclip size={14} className="text-teal-600" />;
    case 'NOTE_ADDED':
      return <FileText size={14} className="text-amber-600" />;
    case 'EMAIL_SENT':
      return <Mail size={14} className="text-sky-600" />;
    case 'CALL_LOGGED':
      return <Phone size={14} className="text-green-600" />;
    case 'WON':
    case 'DEAL_CONVERTED':
      return <Sparkles size={14} className="text-amber-500 fill-amber-500" />;
    case 'LOST':
      return <AlertCircle size={14} className="text-rose-600" />;
    case 'FILE_DELETED':
    case 'NOTE_DELETED':
    case 'ACTIVITY_DELETED':
      return <XCircle size={14} className="text-red-500" />;
    default:
      return <Activity size={14} className="text-slate-600" />;
  }
};

const getEventBg = (type: string) => {
  switch (type) {
    case 'LEAD_CREATED':
      return 'bg-emerald-50 border-emerald-200';
    case 'LEAD_UPDATED':
      return 'bg-blue-50 border-blue-200';
    case 'STATUS_CHANGED':
      return 'bg-violet-50 border-violet-200';
    case 'OWNER_CHANGED':
      return 'bg-purple-50 border-purple-200';
    case 'MEETING_SCHEDULED':
      return 'bg-orange-50 border-orange-200';
    case 'TASK_CREATED':
      return 'bg-indigo-50 border-indigo-200';
    case 'FILE_UPLOADED':
      return 'bg-teal-50 border-teal-200';
    case 'NOTE_ADDED':
      return 'bg-amber-50 border-amber-200';
    case 'EMAIL_SENT':
      return 'bg-sky-50 border-sky-200';
    case 'CALL_LOGGED':
      return 'bg-green-50 border-green-200';
    case 'WON':
    case 'DEAL_CONVERTED':
      return 'bg-amber-50 border-amber-200';
    case 'LOST':
      return 'bg-rose-50 border-rose-200';
    default:
      return 'bg-slate-50 border-slate-200';
  }
};

export const TimelineTab: React.FC<TimelineTabProps> = ({ leadId }) => {
  const { timeline, fetchTimeline, tabLoading } = useLeadStore();
  const [search, setSearch] = useState('');
  const loading = tabLoading.Timeline;

  useEffect(() => {
    fetchTimeline(leadId);
  }, [leadId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTimeline(leadId, { search });
  };

  const handleRefresh = () => {
    fetchTimeline(leadId, { search });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search timeline events..."
            className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
          />
        </div>
        <Button variant="glass" type="submit" size="sm" className="rounded-xl flex items-center gap-1.5">
          Search
        </Button>
        <button
          type="button"
          onClick={handleRefresh}
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 transition-all rounded-xl shadow-sm text-slate-500"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </form>

      {/* Timeline Tree */}
      <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
        {loading ? (
          // Timeline skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative space-y-2">
              <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
              <Skeleton className="h-4 w-28 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ))
        ) : timeline.length > 0 ? (
          timeline.map((event) => (
            <div key={event.id} className="relative group transition-all duration-300">
              {/* Node Icon */}
              <div
                className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-110 duration-200 ${getEventBg(
                  event.type
                )}`}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Event Content Card */}
              <div className="bg-white/70 hover:bg-white border border-slate-200/50 hover:border-slate-200 hover:shadow-md transition-all duration-300 p-4 rounded-2xl shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">{event.title}</h4>
                  <span className="text-xs text-slate-400 font-semibold font-mono">
                    {new Date(event.eventDate).toLocaleString()}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 whitespace-pre-wrap">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-50">
                  <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <ShieldAlert size={10} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Log: {event.createdBy || 'System'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Premium Empty State */
          <div className="py-12 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl border border-dashed border-slate-200/80 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
              <Activity size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Timeline Logs Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              No chronological events have been logged for this lead yet. Log notes or add activities to generate events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
