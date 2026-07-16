import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Users, Plus, Search, Trash2, Mail, Shield, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Suspended';
  createdAt: string;
}

export const Team: React.FC = () => {
  const breadcrumbs = [{ label: 'Team Members' }];
  const toast = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'createdAt'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Sales Executive');
  const [department, setDepartment] = useState('Sales');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      const items = res.data.data || [];
      const mapped = items.map((m: any) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        role: m.designation || 'Sales Representative',
        department: m.department || 'Sales',
        status: m.deletedAt ? 'Suspended' : 'Active',
        createdAt: m.createdAt ? m.createdAt.split('T')[0] : '',
      }));
      setTeamMembers(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    try {
      await api.post('/users', {
        firstName,
        lastName,
        email,
        department,
        designation: role,
      });

      toast.success('Member Added', `${firstName} has been invited as ${role}.`);
      setShowAddModal(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('Sales Executive');
      setDepartment('Sales');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Add Failed', err.response?.data?.message || 'Failed to add team member.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Suspend access for "${name}"?`)) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Access Suspended', 'Team member access suspended.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Action Failed', 'Failed to suspend access.');
      }
    }
  };

  const handleSort = (field: 'name' | 'department' | 'createdAt') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const filteredMembers = teamMembers.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'department') {
      return sortDir === 'asc' ? a.department.localeCompare(b.department) : b.department.localeCompare(a.department);
    } else {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Team Members</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>Invite Member</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading team members...</p>
          </div>
        ) : (
          <>
            {teamMembers.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex max-w-sm relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search team members by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                  />
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="name">Name</option>
                    <option value="department">Department</option>
                    <option value="createdAt">Date of Joining</option>
                  </select>
                  <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}

            {sortedMembers.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={teamMembers.length === 0 ? "No Team Members Invited" : "No Matches Found"}
                  description={teamMembers.length === 0 ? "Add team members, assign execution roles, and track status." : "Adjust search filter inputs."}
                  icon={<Users className="w-12 h-12 text-slate-300" />}
                  actionLabel={teamMembers.length === 0 ? "Invite Member" : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('name')}>
                        Name {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2.5">Email Address</th>
                      <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('department')}>
                        Department {sortBy === 'department' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2.5">Role / Title</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {sortedMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-100">{m.firstName} {m.lastName}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{m.email}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{m.department}</td>
                        <td className="px-4 py-3 text-slate-800 font-bold">{m.role}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                            m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {m.status === 'Active' && (
                            <button
                              onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                              className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                              title="Suspend Access"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* INVITE MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Invite Team Member</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set name, email, department, and role permissions.</p>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-slate-700 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Connor"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Customer Success">Customer Success</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Workspace Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Support Agent">Support Agent</option>
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
                  disabled={!firstName.trim() || !lastName.trim() || !email.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Invite Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Team;
