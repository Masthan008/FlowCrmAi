import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DollarSign, Plus, Search, Trash2, Loader2, CheckCircle, Undo2, XCircle, CreditCard, Sparkles, TrendingUp, Calendar, Clock, User } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { expenseApi } from '../services/expenseApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'reimbursed' | 'rejected';
  employeeName: string;
  date: string;
  createdAt: string;
}

export const Expenses: React.FC = () => {
  const breadcrumbs = [{ label: 'Financial Management' }, { label: 'Expense Tracker' }];
  const toast = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Travel');
  const [employeeName, setEmployeeName] = useState('');
  const [date, setDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await expenseApi.getExpenses();
      const items = res.data.data?.items || [];
      const mapped = items.map((e: any) => ({
        id: e.id,
        title: e.description || e.title || 'Expense Record',
        amount: e.amount || 0,
        category: e.category?.name || (typeof e.category === 'string' ? e.category : 'General'),
        status: (e.status || 'pending').toLowerCase(),
        employeeName: e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : (e.employeeName || 'Corporate'),
        date: e.date ? e.date.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: e.createdAt ? e.createdAt.split('T')[0] : '',
      }));
      setExpenses(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    try {
      await expenseApi.createExpense({ title, amount: Number(amount), category, employeeName, date });
      toast.success('Expense Logged! 🎉', `${title} recorded.`);
      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setCategory('Travel');
      setEmployeeName('');
      setDate('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create expense.');
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reimburse' | 'reject', title: string) => {
    try {
      if (action === 'approve') await expenseApi.approveExpense(id);
      else if (action === 'reimburse') await expenseApi.reimburseExpense(id);
      else await expenseApi.rejectExpense(id);
      toast.success('Status Updated', `${title} ${action}d.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Action Failed', `Failed to ${action} expense.`);
    }
  };

  const handleDelete = async (id: string, expenseTitle: string) => {
    if (confirm(`Delete expense "${expenseTitle}"?`)) {
      try {
        await expenseApi.deleteExpense(id);
        toast.success('Expense Deleted', 'Record removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete expense.');
      }
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      reimbursed: 'bg-brand-50 text-brand-700 border-brand-200/80',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    };
    return map[status] || map.pending;
  };

  const filtered = expenses.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const totalAmount = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
  const pendingAmount = (expenses || []).filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const approvedAmount = (expenses || []).filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((acc, curr) => acc + curr.amount, 0);

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
            Expense & Reimbursement Tracker
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitor corporate spending, process employee reimbursements, and audit financial claims.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Record New Expense</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Claims Value</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">{expenses.length} Entries</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Logged expenses overall</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Pending Approvals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">₹{pendingAmount.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">Awaiting Audit</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Requires manager action</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Approved & Reimbursed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">₹{approvedAmount.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Settled Claims</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Verified corporate expenditures</p>
        </SpotlightCard>
      </div>

      {/* Main Expense Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            {['all', 'pending', 'approved', 'reimbursed', 'rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Expense Ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={expenses.length === 0 ? 'No Expense Claims' : 'No Matching Claims'}
              description={expenses.length === 0 ? 'Log your team travel, software, and corporate spending here.' : 'Try adjusting your status tab or search query.'}
              icon={<DollarSign className="w-12 h-12 text-slate-300" />}
              actionLabel={expenses.length === 0 ? 'Record First Expense' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Expense Item</th>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((e) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850">{e.title}</td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{e.employeeName}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{e.category}</td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{e.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${statusBadge(e.status)}`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{e.date}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {e.status === 'pending' && (
                          <>
                            <button onClick={() => handleAction(e.id, 'approve', e.title)} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Approve Claim">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => handleAction(e.id, 'reject', e.title)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Reject Claim">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {e.status === 'approved' && (
                          <button onClick={() => handleAction(e.id, 'reimburse', e.title)} className="p-1.5 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Mark Reimbursed">
                            <Undo2 size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(e.id, e.title)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Record Corporate Expense</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Expense Title *</label>
                <input type="text" required placeholder="Client dinner / SaaS subscription" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Amount (₹) *</label>
                  <input type="number" required placeholder="2500" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Expense Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Employee Name</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                  <option value="Travel">Travel & Transportation</option>
                  <option value="Meals">Meals & Client Entertainment</option>
                  <option value="Software">Software & SaaS Licenses</option>
                  <option value="Hardware">Hardware & Equipment</option>
                  <option value="Marketing">Marketing & Ads</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!title.trim() || !amount} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenses;
