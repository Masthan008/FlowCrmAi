import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Video, User } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface MeetingEvent {
  id: string;
  title: string;
  contactName: string;
  date: string; // e.g. "2026-06-15"
  time: string;
  type: 'Video Call' | 'In-Person' | 'Outbound Call';
}

export const Calendar: React.FC = () => {
  const breadcrumbs = [{ label: 'Calendar' }];
  const toast = useToast();

  const [events, setEvents] = useState<MeetingEvent[]>([
    { id: '1', title: 'Onboarding System Overview', contactName: 'Alex Mercer', date: '2026-06-15', time: '10:00 AM', type: 'Video Call' },
    { id: '2', title: 'Contract Proposal Scoping', contactName: 'Sarah Connor', date: '2026-06-18', time: '02:00 PM', type: 'In-Person' },
    { id: '3', title: 'Renewal Review Call', contactName: 'John Doe', date: '2026-06-25', time: '11:30 AM', type: 'Video Call' },
    { id: '4', title: 'Pricing Q&A Sync', contactName: 'Jane Smith', date: '2026-06-28', time: '04:00 PM', type: 'Video Call' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [contactName, setContactName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'Video Call' | 'In-Person' | 'Outbound Call'>('Video Call');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactName.trim() || !date) return;

    const newEvent: MeetingEvent = {
      id: String(Date.now()),
      title,
      contactName,
      date,
      time: time || '12:00 PM',
      type
    };

    setEvents([...events, newEvent]);
    toast.success('Event Scheduled', `Meeting "${title}" added to calendar.`);
    setShowAddModal(false);

    setTitle('');
    setContactName('');
    setDate('');
    setTime('');
    setType('Video Call');
  };

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // Default June 2026

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Mon-Sun grid offset where Mon=0, Tue=1, ..., Sun=6
  let startDayOffset = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1
  startDayOffset = startDayOffset === 0 ? 6 : startDayOffset - 1;

  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptyDaysBefore = Array.from({ length: startDayOffset }, (_, i) => i);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 text-slate-700 text-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Calendar</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>Schedule Event</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid layout (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 space-y-4">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-sm font-bold text-slate-855 dark:text-slate-100">{monthNames[month]} {year}</h3>
            <div className="flex gap-1.5">
              <button onClick={handlePrevMonth} className="p-1 border border-slate-150 rounded-lg hover:bg-slate-50"><ChevronLeft size={14} /></button>
              <button onClick={handleNextMonth} className="p-1 border border-slate-150 rounded-lg hover:bg-slate-50"><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 uppercase pb-2 border-b border-slate-100 dark:border-slate-800 select-none">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 min-h-[300px]">
            {emptyDaysBefore.map((idx) => (
              <div key={`empty-${idx}`} className="p-2 border border-transparent rounded-xl min-h-[50px]" />
            ))}
            {daysInMonth.map((day) => {
              const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === formattedDate);
              return (
                <div key={day} className="p-2 border border-slate-100/50 dark:border-slate-800 rounded-xl min-h-[50px] flex flex-col justify-between hover:bg-slate-50/50">
                  <span className="font-bold text-slate-800 dark:text-slate-350 self-end text-[10px]">{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.map(e => (
                      <div
                        key={e.id}
                        onClick={() => toast.info('Event Info', `${e.title} with ${e.contactName} at ${e.time}`)}
                        className="bg-brand-50 border border-brand-100 text-brand-700 px-1 py-0.5 rounded text-[8px] truncate font-bold cursor-pointer hover:bg-brand-100"
                        title={e.title}
                      >
                        {e.time.split(' ')[0]} {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar listings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-slate-855 dark:text-slate-100 text-xs uppercase tracking-wide">Upcoming Events</h3>
            
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="p-3 border border-slate-150 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1"><Clock size={11} /> {e.time}</span>
                    <span>{e.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">{e.title}</h4>
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-50">
                    <span className="flex items-center gap-1 text-slate-500 font-semibold"><User size={10} /> {e.contactName}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{e.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* SCHEDULE MEETING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Schedule Calendar Event</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set up event details and target time frames.</p>

            <form onSubmit={handleAddEvent} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales SLA Pitch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Meeting Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Video Call">Video Call</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Outbound Call">Outbound Call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Client Link *</label>
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
                  Schedule Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Calendar;
