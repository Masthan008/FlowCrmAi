import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Receipt, Plus, Search, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface Invoice {
  id: string;
  invoiceNumber: string;
  subject: string;
  amount: number;
  company: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  createdAt: string;
}

export const Invoices: React.FC = () => {
  const breadcrumbs = [{ label: 'Invoices' }];
  const toast = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', invoiceNumber: 'INV-2026-001', subject: 'Cloud Hosting Setup Support Plan', amount: 8500, company: 'Google LLC', status: 'Paid', dueDate: '2026-07-01', createdAt: '2026-06-01' },
    { id: '2', invoiceNumber: 'INV-2026-002', subject: 'Custom Enterprise License Block', amount: 145000, company: 'Microsoft Corp', status: 'Sent', dueDate: '2026-08-01', createdAt: '2026-06-10' },
    { id: '3', invoiceNumber: 'INV-2026-003', subject: 'Hardware Upgrade Delivery Bundle', amount: 18000, company: 'Apple Inc', status: 'Overdue', dueDate: '2026-06-25', createdAt: '2026-05-25' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [amount, setAmount] = useState('');
  const [company, setCompany] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent'>('Draft');

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !amount) return;

    const num = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: String(Date.now()),
      invoiceNumber: num,
      subject,
      amount: Number(amount),
      company: company || 'Self Account',
      status,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setInvoices([newInvoice, ...invoices]);
    toast.success('Invoice Registered', `Billing invoice ${num} registered.`);
    setShowAddModal(false);

    setSubject('');
    setAmount('');
    setCompany('');
    setDueDate('');
    setStatus('Draft');
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Remove billing invoice "${num}"?`)) {
      setInvoices(invoices.filter(i => i.id !== id));
      toast.success('Invoice Removed', 'Billing invoice record deleted.');
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Overdue': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Invoices</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Invoice</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {invoices.length > 0 && (
          <div className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search billing invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
            />
          </div>
        )}

        {filteredInvoices.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={invoices.length === 0 ? "No Invoices Registered" : "No Matches Found"}
              description={invoices.length === 0 ? "Generate billing invoices, track invoice status, and record payments." : "Adjust search filter inputs."}
              icon={<Receipt className="w-12 h-12 text-slate-300" />}
              actionLabel={invoices.length === 0 ? "New Invoice" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="px-4 py-2.5">Invoice Number</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Client Account</th>
                  <th className="px-4 py-2.5">Billing Amount</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {filteredInvoices.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-100 font-mono">{i.invoiceNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{i.subject}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{i.company}</td>
                    <td className="px-4 py-3 font-black text-slate-850 dark:text-slate-100">${i.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-450 font-semibold">{i.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusBadge(i.status)}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(i.id, i.invoiceNumber)}
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

      {/* NEW INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Billing Invoice</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set billing details and invoice parameters.</p>

            <form onSubmit={handleAddInvoice} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Billing Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly hosting integration support fees"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Billing Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Company Account</label>
                  <input
                    type="text"
                    placeholder="Google LLC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
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
                  disabled={!subject.trim() || !amount}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
