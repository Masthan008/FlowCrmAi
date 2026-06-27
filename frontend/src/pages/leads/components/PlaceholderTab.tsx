import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Mail,
  Calendar,
  CheckSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface PlaceholderTabProps {
  tabName: 'Emails' | 'Meetings' | 'Tasks';
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ tabName }) => {
  const renderEmailPlaceholder = () => (
    <div className="space-y-6">
      {/* Architecture Ready Announcement Banner */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl">
            <Mail size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Sync Architecture Active</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Ready to connect with SMTP, Google Workspace, and Microsoft 365.
            </p>
          </div>
        </div>
        <Button variant="glass" size="sm" className="rounded-xl flex items-center gap-1">
          Configure Sync
          <ExternalLink size={12} />
        </Button>
      </Card>

      {/* Mock Email Threads */}
      <div className="space-y-4">
        {[
          {
            subject: 'Re: Project Proposal & Pricing Review',
            recipient: 'sarah.connor@cyberdyne.com',
            status: 'Delivered',
            date: 'Yesterday at 4:32 PM',
            body: 'Hi Sarah, following up on our call, here is the updated SLA contract with the 15% enterprise discount applied. Let me know if the terms look good.',
            attachments: ['Cyberdyne_Proposal_V2.pdf'],
          },
          {
            subject: 'Welcome to FlowCRM — Demo Scheduled',
            recipient: 'sarah.connor@cyberdyne.com',
            status: 'Read',
            date: 'June 25, 2026',
            body: 'Thank you for reaching out. We have locked in our technical demo session for next Monday. Let us know if you need any adjustments.',
            attachments: [],
          },
        ].map((email, idx) => (
          <Card key={idx} className="p-5 bg-white/70 border border-slate-200/50 hover:border-slate-200 transition-all rounded-2xl shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">{email.subject}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  <span>To: {email.recipient}</span>
                  <span>•</span>
                  <span>{email.date}</span>
                </div>
              </div>
              <Badge variant="glass" className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                email.status === 'Read' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {email.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
              {email.body}
            </p>
            {email.attachments.length > 0 && (
              <div className="flex gap-2">
                {email.attachments.map((attach, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-500">
                    <Mail size={10} />
                    {attach}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMeetingPlaceholder = () => (
    <div className="space-y-6">
      {/* Google Calendar / Outlook Banner */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 text-white rounded-xl">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Calendar Sync Active</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Bidirectional real-time sync with Google Calendar and Microsoft Outlook is pre-configured.
            </p>
          </div>
        </div>
        <Button variant="glass" size="sm" className="rounded-xl flex items-center gap-1">
          Link Calendar
          <ExternalLink size={12} />
        </Button>
      </Card>

      {/* Mock Meetings list */}
      <div className="space-y-4">
        {[
          {
            title: 'SLA Contract Negotiation Call',
            status: 'Upcoming',
            time: 'Monday, 10:00 AM - 10:45 AM',
            location: 'Microsoft Teams Link',
            notes: 'Final review of SLA clauses, payment terms, and support details before signing.',
            participants: ['Sarah Connor (Client)', 'Alex Mercer (Owner)'],
          },
          {
            title: 'Initial Discovery & Product Demo',
            status: 'Completed',
            time: 'June 24, 2:00 PM - 3:00 PM',
            location: 'Google Meet',
            notes: 'Demonstrated CRM pipelines, custom widgets, and security protocols. Sarah showed positive feedback.',
            participants: ['Sarah Connor (Client)', 'Alex Mercer (Owner)', 'James Cole (Sales Mgr)'],
          },
        ].map((meeting, idx) => (
          <Card key={idx} className="p-5 bg-white/70 border border-slate-200/50 hover:border-slate-200 transition-all rounded-2xl shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">{meeting.title}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                  <span className="flex items-center gap-1"><Clock size={10} /> {meeting.time}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {meeting.location}</span>
                </div>
              </div>
              <Badge variant="glass" className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${
                meeting.status === 'Upcoming' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                {meeting.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-3">
              {meeting.notes}
            </p>
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
              <Users size={10} className="text-slate-300" />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Participants:</span>
              <div className="flex gap-1.5 flex-wrap">
                {meeting.participants.map((part, i) => (
                  <span key={i} className="text-[9px] font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600">
                    {part}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTaskPlaceholder = () => (
    <div className="space-y-6">
      {/* Tasks Overview */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl">
            <CheckSquare size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Automatic Tasks & Triggers</h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tasks are synced with the CRM Pipelines. Automated follow-ups will be created based on rules.
            </p>
          </div>
        </div>
        <Button variant="glass" size="sm" className="rounded-xl flex items-center gap-1">
          Automation Rules
          <ChevronRight size={12} />
        </Button>
      </Card>

      {/* Tasks checklist */}
      <div className="space-y-3">
        {[
          { text: 'Send updated SLA contract proposal', priority: 'High', date: 'June 29, 2026', status: 'Pending' },
          { text: 'Verify tax identification number of company', priority: 'Medium', date: 'June 30, 2026', status: 'Pending' },
          { text: 'Complete technical compliance sheet questionnaires', priority: 'High', date: 'June 26, 2026', status: 'Overdue' },
          { text: 'Schedule discovery meeting call with Sarah', priority: 'Low', date: 'Completed', status: 'Completed' },
        ].map((task, idx) => (
          <Card key={idx} className="p-4 bg-white/70 border border-slate-200/50 flex items-center justify-between gap-4 rounded-xl shadow-sm hover:bg-white transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
              }`}>
                {task.status === 'Completed' && <Check size={10} strokeWidth={3} />}
              </div>
              <div>
                <span className={`text-xs font-semibold ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.text}
                </span>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  <span className={task.status === 'Overdue' ? 'text-red-500 flex items-center gap-0.5' : ''}>
                    {task.status === 'Overdue' && <AlertTriangle size={10} />}
                    {task.date}
                  </span>
                  <span>•</span>
                  <span>Priority: {task.priority}</span>
                </div>
              </div>
            </div>
            <Badge variant="glass" className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${
              task.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : task.status === 'Overdue'
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {task.status}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );

  switch (tabName) {
    case 'Emails':
      return renderEmailPlaceholder();
    case 'Meetings':
      return renderMeetingPlaceholder();
    case 'Tasks':
      return renderTaskPlaceholder();
    default:
      return null;
  }
};
export default PlaceholderTab;
