import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Users, Plus, Search, Trash2, Mail, Shield, UserCheck } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Suspended' | 'Pending';
  createdAt: string;
}

export const Team: React.FC = () => {
  const breadcrumbs = [{ label: 'Team Members' }];
  const toast = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', firstName: 'Alex', lastName: 'Mercer', email: 'admin@flowcrm.ai', role: 'Super Admin', department: 'Executive', status: 'Active', createdAt: '2026-01-01' },
    { id: '2', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@flowcrm.ai', role: 'Sales Manager', department: 'Sales', status: 'Active', createdAt: '2026-02-15' },
    { id: '3', firstName: 'John', lastName: 'Doe', email: 'john@flowcrm.ai', role: 'Sales Executive', department: 'Sales', status: 'Active', createdAt: '2026-03-10' },
    { id: '4', firstName: 'Jane', lastName: 'Smith', email: 'jane@flowcrm.ai', role: 'Support Agent', department: 'Customer Success', status: 'Pending', createdAt: '2026-05-20' }
  ]);

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const newMember: TeamMember = {
      id: String(Date.now()),
      firstName,
      lastName,
      email,
      role,
      department,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTeamMembers([...teamMembers, newMember]);
    toast.success('Member Added', `${firstName} has been invited as ${role}.`);
    setShowAddModal(false);

    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('Sales Executive');
    setDepartment('Sales');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Suspend access for "${name}"?`)) {
      setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, status: 'Suspended' } : m));
      toast.success('Access Suspended', 'Team member status set to Suspended.');
    }
  };

  const handleActivate = (id: string, name: string) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, status: 'Active' } : m));
    toast.success('Access Activated', `Team member ${name} is now Active.`);
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
        {teamMembers.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="flex max-w-sm relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search team members by name, email, department, role..."
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
              title="No Team Members Found"
              description="Invite agents, configure system roles, and track active sessions."
              icon={<Users className="w-12 h-12 text-slate-300" />}
              actionLabel="Invite Member"
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
                  <th className="px-4 py-2.5">System Role</th>
                  <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('department')}>
                    Department {sortBy === 'department' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('createdAt')}>
                    Joined Date {sortBy === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {sortedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{m.firstName} {m.lastName}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${m.email}`} className="text-brand-600 hover:underline flex items-center gap-1">
                        <Mail size={11} className="text-slate-400" /> {m.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700">{m.role}</td>
                    <td className="px-4 py-3">{m.department}</td>
                    <td className="px-4 py-3 font-bold text-slate-450">{m.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                        m.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        m.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.status === 'Pending' && (
                          <button
                            onClick={() => handleActivate(m.id, `${m.firstName} ${m.lastName}`)}
                            className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400"
                            title="Activate Member"
                          >
                            <UserCheck size={13} />
                          </button>
                        )}
                        {m.status === 'Active' && (
                          <button
                            onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                            className="p-1 hover:bg-rose-50 hover:text-rose-650 rounded-lg text-slate-400"
                            title="Suspend Access"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Invite Team Member</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Add team member to workspace and assign role controls.</p>

            <form onSubmit={handleAddMember} className="space-y-3.5 text-slate-700 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
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
                    placeholder="e.g. Doe"
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
                  placeholder="name@flowcrm.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Support">Support Agent</option>
                    <option value="Marketing">Marketing Coordinator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
