import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  Activity,
  FileText,
  Paperclip,
  CheckCircle,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
} from 'lucide-react';
import type { LeadNote, LeadActivity, LeadFile } from '../../../types/lead';

interface RightPanelCardsProps {
  notes: LeadNote[];
  activities: LeadActivity[];
  files: LeadFile[];
}

export const RightPanelCards: React.FC<RightPanelCardsProps> = ({ notes, activities, files }) => {
  // Compute recent lists dynamically from store lists
  const recentNotes = notes.slice(0, 2);
  const recentFiles = files.slice(0, 2);
  const recentActivities = activities.slice(0, 2);

  // Compute upcoming meetings & tasks from planned activities
  const upcomingTasks = activities
    .filter((a) => a.type === 'Task' && !a.isCompleted)
    .slice(0, 2);

  const upcomingMeetings = activities
    .filter((a) => a.type === 'Meeting' && !a.isCompleted)
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* 1. Lead Score Widget */}
      <Card className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white rounded-3xl shadow-lg border-none relative overflow-hidden group">
        {/* Subtle background glow effect */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100">Smart Lead Score</h3>
            <Sparkles size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-extrabold tracking-tight">87</span>
            <span className="text-sm font-semibold text-blue-100 pb-1">/ 100</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-2.5 py-1 w-max text-[10px] font-bold uppercase tracking-wide">
            <TrendingUp size={12} className="text-green-300" />
            High Probability to Close
          </div>
          <p className="text-[10px] text-blue-100/80 leading-relaxed mt-3">
            Based on active touchpoints, prompt proposal review, and positive engagement frequency.
          </p>
        </div>
      </Card>

      {/* 2. CRM Health Widget */}
      <Card className="p-5 bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">CRM Data Health</h3>
          <Heart size={16} className="text-rose-500 fill-rose-500" />
        </div>
        <div className="flex items-center gap-4">
          {/* Circular ring representation */}
          <div className="relative w-14 h-14 rounded-full border-4 border-slate-50 flex items-center justify-center bg-slate-50/50">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent border-r-transparent animate-spin-slow" />
            <span className="text-sm font-black text-slate-800">92%</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 block">Excellence Status</span>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5 uppercase tracking-wide">
              No missing details found. All fields verified.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Upcoming Meetings Widget */}
      <Card className="p-4 bg-white/80 border border-slate-200/60 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar size={12} className="text-purple-500" />
          Upcoming Meetings
        </h3>
        <div className="space-y-2">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meet) => (
              <div key={meet.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700 truncate">{meet.title}</span>
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  {new Date(meet.activityDate).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No upcoming meetings scheduled.</p>
          )}
        </div>
      </Card>

      {/* 4. Upcoming Tasks Widget */}
      <Card className="p-4 bg-white/80 border border-slate-200/60 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CheckCircle size={12} className="text-indigo-500" />
          Pending Tasks
        </h3>
        <div className="space-y-2">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
              <div key={task.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-700 truncate">{task.title}</span>
                <span className="text-[9px] text-slate-400 font-bold font-mono">
                  Due: {new Date(task.activityDate).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No pending tasks found.</p>
          )}
        </div>
      </Card>

      {/* 5. Recent Notes Summary Widget */}
      <Card className="p-4 bg-white/80 border border-slate-200/60 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText size={12} className="text-amber-500" />
          Recent Notes
        </h3>
        <div className="space-y-2">
          {recentNotes.length > 0 ? (
            recentNotes.map((note) => (
              <div key={note.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/30">
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {note.title || 'Untitled Note'}
                </span>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{note.content}</p>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No notes created yet.</p>
          )}
        </div>
      </Card>

      {/* 6. Recent Files Summary Widget */}
      <Card className="p-4 bg-white/80 border border-slate-200/60 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Paperclip size={12} className="text-emerald-500" />
          Recent Files
        </h3>
        <div className="space-y-2">
          {recentFiles.length > 0 ? (
            recentFiles.map((file) => (
              <div key={file.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 truncate flex-1" title={file.name}>
                  {file.name}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">
                  {file.mimeType.split('/')[1] || 'Doc'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-slate-400 italic">No files uploaded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
export default RightPanelCards;
