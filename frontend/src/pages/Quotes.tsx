import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Search, Trash2, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface Quote {
  id: string;
  quoteNumber: string;
  subject: string;
  value: number;
  company: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  expiryDate: string;
  createdAt: string;
}

export const Quotes: React.FC = () => {
  const breadcrumbs = [{ label: 'Quotes' }];
  const toast = useToast();

  const [quotes, setQuotes] = useState<Quote[]>([
    { id: '1', quoteNumber: 'QT-2026-001', subject: 'Cloud Hosting Integration Estimate', value: 8500, company: 'Google LLC', status: 'Sent', expiryDate: '2026-07-20', createdAt: '2026-06-01' },
    { id: '2', quoteNumber: 'QT-2026-002', subject: 'Custom Server License Deal Block', value: 145000, company: 'Microsoft Corp', status: 'Accepted', expiryDate: '2026-08-05', createdAt: '2026-06-10' },
    { id: '3', quoteNumber: 'QT-2026-003', subject: 'Hardware Replacements Bundle Quote', value: 18000, company: 'Apple Inc', status: 'Draft', expiryDate: '2026-07-15', createdAt: '2026-06-25' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [value, setValue] = useState('');
  const [company, setCompany] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent'>('Draft');

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !value) return;

    const num = `QT-2026-${String(quotes.length + 1).padStart(3, '0')}`;
    const newQuote: Quote = {
      id: String(Date.now()),
      quoteNumber: num,
      subject,
      value: Number(value),
      company: company || 'Self Account',
      status,
      expiryDate: expiryDate || new Date(Date.now() + 15 * 24 * 3600000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuotes([newQuote, ...quotes]);
    toast.success('Quote Registered', `Commercial quote ${num} registered.`);
    setShowAddModal(false);

    setSubject('');
    setValue('');
    setCompany('');
    setExpiryDate('');
    setStatus('Draft');
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Delete quote "${num}"?`)) {
      setQuotes(quotes.filter(q => q.id !== id));
      toast.success('Quote Removed', 'Quote definition deleted.');
    }
  };

  const filteredQuotes = quotes.filter(q =>
    q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Expired': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Quotes</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Quote</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {quotes.length > 0 && (
          <div className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search quotes by number, subject, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
            />
          </div>
        )}

        {filteredQuotes.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={quotes.length === 0 ? "No Quotes Created" : "No Matches Found"}
              description={quotes.length === 0 ? "Issue pricing proposal quotes and convert deals to invoices." : "Adjust search filter inputs."}
              icon={<FileText className="w-12 h-12 text-slate-300" />}
              actionLabel={quotes.length === 0 ? "New Quote" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="px-4 py-2.5">Quote Number</th>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5">Client Account</th>
                  <th className="px-4 py-2.5">Value</th>
                  <th className="px-4 py-2.5">Expiry Date</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-100 font-mono">{q.quoteNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{q.subject}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{q.company}</td>
                    <td className="px-4 py-3 font-bold text-emerald-650">${q.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-450 font-semibold">{q.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusBadge(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(q.id, q.quoteNumber)}
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

      {/* NEW QUOTE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Pricing Proposal Quote</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set pricing details and quote parameters.</p>

            <form onSubmit={handleAddQuote} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Proposal Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud API Migration Bundle Setup"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="9999"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
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
                  disabled={!subject.trim() || !value}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Quote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Quotes;
