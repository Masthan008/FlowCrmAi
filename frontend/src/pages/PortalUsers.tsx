import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Users, Plus, Search, Trash2, Loader2, Edit3, ShieldCheck, Key, Building2, UserCheck } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { portalApi } from '../services/portalApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

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
  const breadcrumbs = [{ label: 'Customer Management' }, { label: 'Customer Portal Access' }];
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
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || 'Enterprise Customer',
        email: u.email || 'customer@company.com',
        company: u.company || u.customer?.name || 'Acme Global',
        isActive: u.isActive ?? true,
        lastLogin: u.lastLogin ? u.lastLogin.split('T')[0] : 'Today',
        createdAt: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
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
        toast.success('Portal Account Saved! 🎉', `${name} updated.`);
      } else {
        await portalApi.createUser({ name, email, company, password: password || null });
        toast.success('Portal User Provisioned! 🎉', `${name} added to portal.`);
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
        toast.success('User Removed', 'Portal account deleted.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete user.');
      }
    }
  };

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = (users || []).filter(u => u.isActive).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 select-none font-sans pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight font-display mt-1">
            Customer Portal User Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Provision client login accounts for self-service invoices, ticket management, and contract reviews.
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Provision Portal User</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Portal Accounts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{users.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Customer Access</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Provisioned client logins</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Client Logins</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Self-Service Active</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Active customer portal users</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Portal Security Standard</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">JWT + TOTP</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Encrypted</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Multi-tenant boundary protected</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850">Portal User Directory</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search user name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Customer Portal Users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={users.length === 0 ? 'No Portal Accounts Provisioned' : 'No Matching Users'}
              description={users.length === 0 ? 'Provision customer portal access for your client account contacts.' : 'Try adjusting search query.'}
              icon={<Users className="w-12 h-12 text-slate-300" />}
              actionLabel={users.length === 0 ? 'Provision First User' : undefined}
              onAction={() => { resetForm(); setShowAddModal(true); }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">User Name</th>
                  <th className="px-5 py-3.5">Work Email</th>
                  <th className="px-5 py-3.5">Client Organization</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{u.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{u.email}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">{u.company}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        ACTIVE PORTAL
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{u.lastLogin}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Edit Portal User">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">{editingUser ? 'Edit Portal Account' : 'Provision Portal Account'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Customer Full Name *</label>
                <input type="text" required placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Work Email Address *</label>
                <input type="email" required placeholder="rahul@clientcompany.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Client Organization</label>
                <input type="text" placeholder="Apex Technologies" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Temporary Password</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim() || !email.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Save Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PortalUsers;
