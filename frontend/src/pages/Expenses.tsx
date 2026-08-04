import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { DollarSign, Plus, Search, Trash2, Loader2, CheckCircle, Undo2, XCircle } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { expenseApi } from '../services/expenseApi';

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
  const breadcrumbs = [{ label: 'Expenses' }];
  const toast = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
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
        amount: e.amount,
        category: e.category?.name || (typeof e.category === 'string' ? e.category : 'General'),
        status: (e.status || 'pending').toLowerCase(),
        employeeName: e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : (e.employeeName || '-'),
        date: e.date ? e.date.split('T')[0] : '',
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
      toast.success('Expense Created', `${title} recorded.`);
      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setCategory('');
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
      toast.success('Updated', `${title} ${action}d.`);
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
        toast.success('Expense Deleted', 'Expense removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete expense.');
      }
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      reimbursed: 'bg-blue-50 text-blue-700 border-blue-100',
      rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return map[status] || map.pending;
  };

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Expenses</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Expense</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading expenses...</p>
          </div>
        ) : (
          <>
            {expenses.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={expenses.length === 0 ? 'No Expenses' : 'No Matches Found'}
                  description={expenses.length === 0 ? 'Track employee expenses and manage reimbursements.' : 'Adjust your search query.'}
                  icon={<DollarSign className="w-12 h-12 text-slate-300" />}
                  actionLabel={expenses.length === 0 ? 'New Expense' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Employee</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{e.title}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{e.employeeName}</td>
                        <td className="px-4 py-3 text-slate-500">{e.category}</td>
                        <td className="px-4 py-3 font-black text-slate-850 dark:text-slate-100">${e.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${statusBadge(e.status)}`}>
                            {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{e.date}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {e.status === 'pending' && (
                              <>
                                <button onClick={() => handleAction(e.id, 'approve', e.title)} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Approve">
                                  <CheckCircle size={13} />
                                </button>
                                <button onClick={() => handleAction(e.id, 'reject', e.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Reject">
                                  <XCircle size={13} />
                                </button>
                              </>
                            )}
                            {e.status === 'approved' && (
                              <button onClick={() => handleAction(e.id, 'reimburse', e.title)} className="p-1 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400" title="Reimburse">
                                <Undo2 size={13} />
                              </button>
                            )}
                            <button onClick={() => handleDelete(e.id, e.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400">
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Record Expense</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Log a new expense entry.</p>
            <form onSubmit={handleAdd} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Title *</label>
                <input type="text" required placeholder="Team lunch" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Amount ($) *</label>
                  <input type="number" required placeholder="150" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Employee</label>
                <input type="text" placeholder="John Doe" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                <input type="text" placeholder="Travel" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!title.trim() || !amount} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
