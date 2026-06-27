import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Activity, Plus, Search, Trash2, Clock, Phone, Mail, Calendar } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface ActivityItem {
  id: string;
  type: 'Call' | 'Meeting' | 'Email' | 'WhatsApp';
  title: string;
  contactName: string;
  date: string;
  time: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
}

export const Activities: React.FC = () => {
  const breadcrumbs = [{ label: 'Activities' }];
  const toast = useToast();

  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: '1', type: 'Call', title: 'Introductory Qualification Call', contactName: 'Alex Mercer', date: '2026-06-28', time: '10:00 AM', status: 'Planned' },
    { id: '2', type: 'Meeting', title: 'Contract Negotiations Proposal', contactName: 'Sarah Connor', date: '2026-06-29', time: '02:30 PM', status: 'Planned' },
    { id: '3', type: 'Email', title: 'Follow-up Pricing Agreement PDF', contactName: 'John Doe', date: '2026-06-27', time: '09:15 AM', status: 'Completed' },
    { id: '4', type: 'WhatsApp', title: 'Address details checkpoint', contactName: 'Jane Smith', date: '2026-06-26', time: '11:00 AM', status: 'Completed' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Call' | 'Meeting' | 'Email' | 'WhatsApp'>('Call');
  const [contactName, setContactName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim() || !date) return;

    const newAct: ActivityItem = {
      id: String(Date.now()),
      type,
      title,
      contactName,
      date,
      time: time || '12:00 PM',
      status: 'Planned'
    };

    setActivities([newAct, ...activities]);
    toast.success('Activity Logged', `Planned activity "${title}" created successfully.`);
    setShowAddModal(false);

    setTitle('');
    setType('Call');
    setContactName('');
    setDate('');
    setTime('');
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Remove activity "${label}"?`)) {
      setActivities(activities.filter(a => a.id !== id));
      toast.success('Activity Deleted', 'Logged event removed.');
    }
  };

  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (t: string) => {
    switch (t) {
      case 'Call': return <Phone size={13} className="text-blue-500" />;
      case 'Meeting': return <Calendar size={13} className="text-amber-500" />;
      case 'Email': return <Mail size={13} className="text-purple-500" />;
      default: return <Activity size={13} className="text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Activities log</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Activity</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {activities.length > 0 && (
          <div className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logged activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
            />
          </div>
        )}

        {filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={activities.length === 0 ? "No Activities Logged" : "No Matches Found"}
              description={activities.length === 0 ? "Schedule discovery calls, emails, and meetings with contacts." : "Adjust search filter inputs."}
              icon={<Activity className="w-12 h-12 text-slate-300" />}
              actionLabel={activities.length === 0 ? "New Activity" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="px-4 py-2.5">Channel</th>
                  <th className="px-4 py-2.5">Activity Title</th>
                  <th className="px-4 py-2.5">Contact Link</th>
                  <th className="px-4 py-2.5">Date & Time</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {filteredActivities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 flex items-center gap-1.5 font-bold">
                      {getIcon(a.type)}
                      <span className="text-[10px] text-slate-600 uppercase">{a.type}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{a.title}</td>
                    <td className="px-4 py-3 text-slate-550 font-semibold">{a.contactName}</td>
                    <td className="px-4 py-3 text-slate-450 font-semibold">
                      {a.date} at {a.time}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        a.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NEW ACTIVITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Log / Plan Activity</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set up activity title, target date and client links.</p>

            <form onSubmit={handleAddActivity} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discuss onboarding SLA parameters"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Activity Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Linked Contact *</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Time Slot</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || !contactName.trim() || !date}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Activities;
