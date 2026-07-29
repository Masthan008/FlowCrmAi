import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Video, User, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';

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

  const [events, setEvents] = useState<MeetingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60'); // Minutes
  const [type, setType] = useState<'Video Call' | 'In-Person' | 'Outbound Call'>('Video Call');

  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // Default June 2026

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch employees safely
      try {
        const empRes = await api.get('/companies/employees');
        const emps = empRes.data.data || [];
        setEmployees(emps);
        if (emps.length > 0) {
          setSelectedEmployeeId(emps[0].id);
        }
      } catch (err) {
        console.warn('Failed to load employees list for calendar', err);
      }

      // Fetch companies safely
      try {
        const compRes = await api.get('/companies');
        const comps = compRes.data.data?.items || [];
        setCompanies(comps);
        if (comps.length > 0) {
          setSelectedCompanyId(comps[0].id);
        }
      } catch (err) {
        console.warn('Failed to load companies list for calendar', err);
      }

      // Fetch meetings
      const meetingsRes = await api.get('/meetings');
      const meetings = meetingsRes.data.data?.items || [];
      const mapped = meetings.map((m: any) => {
        const start = new Date(m.startTime);
        const hours = start.getHours();
        const mins = start.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMins = String(mins).padStart(2, '0');
        const displayTime = `${displayHours}:${displayMins} ${ampm}`;

        return {
          id: m.id,
          title: m.title || 'Scheduled Meeting',
          contactName: m.customer?.name || m.customer?.company?.name || 'Client Contact',
          date: m.startTime.split('T')[0],
          time: displayTime,
          type: (m.location || 'Video Call') as any,
        };
      });
      setEvents(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch calendar scheduler.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try {
      // 1. Resolve company customer ID
      let customerId = null;
      if (selectedCompanyId) {
        const custRes = await api.get(`/companies/${selectedCompanyId}/customer`);
        customerId = custRes.data.data?.id || null;
      }

      // 2. Ensure organizer employee ID
      let organizerId = selectedEmployeeId;
      if (!organizerId && employees.length > 0) {
        organizerId = employees[0].id;
      }
      if (!organizerId) {
        toast.error('No Employee Available', 'Please seed or add employees first.');
        return;
      }

      // 3. Calculate start & end ISO datetimes
      const startDateTime = new Date(`${date}T${time || '10:00'}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (Number(duration) || 60) * 60 * 1000);

      await api.post('/meetings', {
        organizerId,
        customerId,
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: type,
        description: `Scheduled via calendar interface.`
      });

      toast.success('Event Scheduled', `Meeting "${title}" added to calendar.`);
      setShowAddModal(false);
      setTitle('');
      setSelectedCompanyId('');
      setDate('');
      setTime('10:00');
      setDuration('60');
      setType('Video Call');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Schedule Failed', err.response?.data?.message || 'Failed to book meeting slot.');
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let startDayOffset = new Date(year, month, 1).getDay();
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
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
              <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading calendar schedule...</p>
            </div>
          ) : (
            <>
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
                            className="bg-brand-550/10 border border-brand-550/20 text-brand-700 px-1 py-0.5 rounded text-[8px] truncate font-bold cursor-pointer hover:bg-brand-100"
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
            </>
          )}
        </div>

        {/* Sidebar listings (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-slate-855 dark:text-slate-100 text-xs uppercase tracking-wide">Upcoming Events</h3>
            
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-slate-450 font-semibold text-center py-4">No events scheduled.</p>
              ) : (
                events.map((e) => (
                  <div key={e.id} className="p-3 border border-slate-150 rounded-2xl bg-white hover:shadow-glossy-sm transition-shadow space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Clock size={11} /> {e.time}</span>
                      <span>{e.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">{e.title}</h4>
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-50">
                      <span className="flex items-center gap-1 text-slate-500 font-semibold"><User size={10} /> {e.contactName}</span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-650 border border-slate-200 rounded text-[8px] font-bold uppercase">{e.type}</span>
                    </div>
                  </div>
                ))
              )}
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time Slot *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duration (mins) *</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Company Account</label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="">Choose Company...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Organizer (Employee)</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
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
                  disabled={!title.trim() || !date}
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
