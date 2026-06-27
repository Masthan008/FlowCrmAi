import React, { useState } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Briefcase, Plus, Search, Trash2, Tag, CalendarDays, DollarSign } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: string;
  company: string;
  closeDate: string;
  createdAt: string;
}

export const Deals: React.FC = () => {
  const breadcrumbs = [{ label: 'Deals' }];
  const toast = useToast();

  const [deals, setDeals] = useState<Deal[]>([
    { id: '1', name: 'Cloud Migration Partnership', value: 85000, stage: 'Proposal Sent', company: 'Google LLC', closeDate: '2026-07-15', createdAt: '2026-05-10' },
    { id: '2', name: 'Enterprise SaaS Licensing', value: 120000, stage: 'Negotiation', company: 'Microsoft Corp', closeDate: '2026-08-01', createdAt: '2026-05-20' },
    { id: '3', name: 'Hardware Upgrade Delivery', value: 45000, stage: 'Closed Won', company: 'Apple Inc', closeDate: '2026-06-05', createdAt: '2026-04-15' },
    { id: '4', name: 'Social Ads Campaign Suite', value: 25000, stage: 'Closed Lost', company: 'Meta Platforms', closeDate: '2026-05-30', createdAt: '2026-04-01' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Prospecting');
  const [company, setCompany] = useState('');
  const [closeDate, setCloseDate] = useState('');

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value) return;

    const newDeal: Deal = {
      id: String(Date.now()),
      name,
      value: Number(value),
      stage,
      company: company || 'Self Account',
      closeDate: closeDate || new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDeals([newDeal, ...deals]);
    toast.success('Deal Created', `Opportunity ${name} registered successfully.`);
    setShowAddModal(false);

    setName('');
    setValue('');
    setStage('Prospecting');
    setCompany('');
    setCloseDate('');
  };

  const handleDelete = (id: string, dealName: string) => {
    if (confirm(`Delete opportunity "${dealName}"?`)) {
      setDeals(deals.filter(d => d.id !== id));
      toast.success('Deal Deleted', 'Opportunity removed.');
    }
  };

  const filteredDeals = deals.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageBadge = (st: string) => {
    switch (st) {
      case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Closed Lost': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Negotiation': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Deals</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Deal</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {deals.length > 0 && (
          <div className="flex max-w-sm relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
            />
          </div>
        )}

        {filteredDeals.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={deals.length === 0 ? "No Active Deals" : "No Matches Found"}
              description={deals.length === 0 ? "Track your sales pipeline. Create new deal structures and forecast revenue." : "Adjust search filter inputs."}
              icon={<Briefcase className="w-12 h-12 text-slate-300" />}
              actionLabel={deals.length === 0 ? "New Deal" : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                  <th className="px-4 py-2.5">Deal Name</th>
                  <th className="px-4 py-2.5">Company Account</th>
                  <th className="px-4 py-2.5">Pipeline Stage</th>
                  <th className="px-4 py-2.5">Contract Value</th>
                  <th className="px-4 py-2.5">Close Date</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                {filteredDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{d.company}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStageBadge(d.stage)}`}>
                        {d.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-650">${d.value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-450 font-semibold">{d.closeDate}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
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

      {/* NEW DEAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Deal Opportunity</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set contract values and pipeline details.</p>

            <form onSubmit={handleAddDeal} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Opportunity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Service upgrade"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Contract Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Close Date</label>
                  <input
                    type="date"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Prospecting">Prospecting</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

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
                  disabled={!name.trim() || !value}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Deal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Deals;
