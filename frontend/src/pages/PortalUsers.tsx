import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Users, Plus, Search, Trash2, Loader2, Edit3 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { portalApi } from '../services/portalApi';

interface PortalUser {
  id: string;
  name: string;
  email: string;
  company: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

export const PortalUsers: React.FC = () => {
  const breadcrumbs = [{ label: 'Portal Users' }];
  const toast = useToast();

  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await portalApi.getUsers();
      const items = res.data.data?.items || [];
      const mapped = items.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        company: u.company || '-',
        isActive: u.isActive,
        lastLogin: u.lastLogin ? u.lastLogin.split('T')[0] : 'Never',
        createdAt: u.createdAt ? u.createdAt.split('T')[0] : '',
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch portal users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setCompany('');
    setPassword('');
    setEditingUser(null);
  };

  const openEdit = (user: PortalUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setCompany(user.company === '-' ? '' : user.company);
    setPassword('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    try {
      if (editingUser) {
        await portalApi.updateUser(editingUser.id, { name, email, company });
        toast.success('User Updated', `${name} updated successfully.`);
      } else {
        await portalApi.createUser({ name, email, company, password });
        toast.success('User Created', `${name} added to portal.`);
      }
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(editingUser ? 'Update Failed' : 'Create Failed', err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id: string, userName: string) => {
    if (confirm(`Remove portal user "${userName}"?`)) {
      try {
        await portalApi.deleteUser(id);
        toast.success('User Removed', 'Portal user deleted.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete user.');
      }
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Portal Users</h1>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New User</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading portal users...</p>
          </div>
        ) : (
          <>
            {users.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={users.length === 0 ? 'No Portal Users' : 'No Matches Found'}
                  description={users.length === 0 ? 'Invite customers to access the self-service portal.' : 'Adjust your search query.'}
                  icon={<Users className="w-12 h-12 text-slate-300" />}
                  actionLabel={users.length === 0 ? 'New User' : undefined}
                  onAction={() => { resetForm(); setShowAddModal(true); }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Company</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Last Login</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{u.email}</td>
                        <td className="px-4 py-3 text-slate-500">{u.company}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                            u.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{u.lastLogin}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1 hover:bg-sky-50 hover:text-sky-600 rounded-lg text-slate-400"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">{editingUser ? 'Edit Portal User' : 'Add Portal User'}</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">{editingUser ? 'Update user details.' : 'Invite a new customer to the portal.'}</p>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name *</label>
                <input type="text" required placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email *</label>
                <input type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Company</label>
                <input type="text" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                  <input type="password" placeholder="Leave blank for auto-generate" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
              )}
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!name.trim() || !email.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalUsers;
