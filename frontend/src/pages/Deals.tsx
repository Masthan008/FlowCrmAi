import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDealStore } from '../store/dealStore';
import { useToast } from '../components/ui/ToastProvider';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import {
  Briefcase, Plus, Search, Filter, Download, Trash2, Edit2, UserCheck,
  DollarSign, CalendarDays, Tag, TrendingUp, ArrowUpDown, X, Check,
  ChevronLeft, ChevronRight, Loader2, ShieldAlert, Eye,
  BarChart3, ArrowUp, ArrowDown, MoreVertical, Star,
  Users, Building2, Phone, Mail, FileText, Kanban, RefreshCw, Sparkles, CheckCircle2
} from 'lucide-react';

const statusColors: Record<string, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  Qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-200',
  Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
  Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lost: 'bg-red-50 text-red-700 border-red-200',
  Cancelled: 'bg-slate-50 text-slate-500 border-slate-200',
  'On Hold': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export const Deals: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    deals, statistics, loading, error, filters, pagination, selectedIds,
    employees, customers, companies, contacts, leads, pipelines,
    fetchDeals, fetchStatistics, fetchEmployees, fetchCustomers,
    fetchCompanies, fetchContacts, fetchLeads, fetchPipelines,
    createDeal, updateDeal, deleteDeal, setFilters, setPage,
    toggleSelection, toggleAllSelection, clearSelection,
    bulkUpdateStatus, updateStage, bulkUpdateOwner, clearCurrentDeal,
  } = useDealStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [showBulkOwner, setShowBulkOwner] = useState(false);
  const [bulkStatusVal, setBulkStatusVal] = useState('Open');
  const [bulkOwnerVal, setBulkOwnerVal] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '', opportunityName: '', customerId: '', companyId: '',
    primaryContactId: '', leadId: '', pipelineId: '', stageId: '',
    assignedToId: '', status: 'Open', priority: 'Medium',
    probability: 0, value: 0, expectedRevenue: 0,
    expectedCloseDate: '', currency: 'USD', source: 'Other',
    industry: '', businessType: '', description: '', tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [formStep, setFormStep] = useState(1);
  const [viewDeal, setViewDeal] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const breadcrumbs = [{ label: 'Deals' }];

  useEffect(() => {
    fetchDeals();
    fetchStatistics();
    fetchEmployees();
    fetchCustomers();
    fetchCompanies();
    fetchContacts();
    fetchLeads();
    fetchPipelines();
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true' || window.location.pathname.endsWith('/deals/new');
    if (isNew) {
      const coId = searchParams.get('companyId') || '';
      setFormData((prev: any) => ({
        ...prev,
        companyId: coId,
      }));
      resetForm();
      setShowCreateModal(true);
      if (searchParams.get('new') === 'true') {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('new');
        newParams.delete('companyId');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const qf: Record<string, any> = {};
    if (tab === 'my') qf.myDeals = true;
    else if (tab === 'open') qf.open = true;
    else if (tab === 'won') qf.won = true;
    else if (tab === 'lost') qf.lost = true;
    else if (tab === 'closing') qf.closingThisMonth = true;
    else if (tab === 'high-prob') qf.highProbability = true;
    else if (tab === 'high-value') qf.highValue = true;
    else if (tab === 'recent') qf.recentlyCreated = true;
    setFilters(qf);
  };

  const filteredDeals = deals;
  const allSelected = deals.length > 0 && selectedIds.length === deals.length;

  const quickTabs = [
    { id: 'all', label: 'All Deals' },
    { id: 'my', label: 'My Deals' },
    { id: 'open', label: 'Open' },
    { id: 'won', label: 'Won' },
    { id: 'lost', label: 'Lost' },
    { id: 'closing', label: 'Closing' },
    { id: 'high-prob', label: 'High Probability' },
    { id: 'high-value', label: 'High Value' },
    { id: 'recent', label: 'Recent' },
  ];

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Deal name is required';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) {
      if (errs.name || errs.customerId) setFormStep(1);
      else if (errs.pipelineId || errs.stageId) setFormStep(2);
      toast.error('Validation Error', Object.values(errs)[0]);
    }
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      await createDeal(formData);
      toast.success('Deal Created', 'The deal has been created successfully.');
      setShowCreateModal(false);
      resetForm();
      fetchDeals();
      fetchStatistics();
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not create deal.');
    }
  };

  const handleUpdate = async () => {
    if (!editingDeal) return;
    if (!formData.name.trim()) { toast.error('Validation', 'Deal name is required.'); return; }
    try {
      await updateDeal(editingDeal, formData);
      toast.success('Deal Updated', 'Changes saved successfully.');
      setEditingDeal(null);
      resetForm();
      fetchDeals();
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not update deal.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDeal(id);
      toast.success('Deal Deleted', 'The deal has been removed.');
      setDeleteConfirm(null);
      fetchDeals();
      fetchStatistics();
    } catch (err: any) {
      toast.error('Failed', err.response?.data?.message || 'Could not delete deal.');
    }
  };

  const handleBulkStatus = async () => {
    await bulkUpdateStatus(selectedIds, bulkStatusVal);
    toast.success('Status Updated', `${selectedIds.length} deals updated.`);
    setShowBulkStatus(false);
    clearSelection();
    fetchStatistics();
  };

  const handleBulkOwner = async () => {
    await bulkUpdateOwner(selectedIds, bulkOwnerVal);
    toast.success('Owner Updated', `${selectedIds.length} deals reassigned.`);
    setShowBulkOwner(false);
    clearSelection();
  };

  const handleEdit = (deal: any) => {
    setFormData({
      name: deal.name || '',
      opportunityName: deal.opportunityName || '',
      customerId: deal.customerId || '',
      companyId: deal.companyId || '',
      primaryContactId: deal.primaryContactId || '',
      leadId: deal.leadId || '',
      pipelineId: deal.pipelineId || '',
      stageId: deal.stageId || '',
      assignedToId: deal.assignedToId || '',
      status: deal.status || 'Open',
      priority: deal.priority || 'Medium',
      probability: deal.probability || 0,
      value: deal.value || 0,
      expectedRevenue: deal.expectedRevenue || 0,
      expectedCloseDate: deal.expectedCloseDate?.split('T')[0] || '',
      currency: deal.currency || 'USD',
      source: deal.source || 'Other',
      industry: deal.industry || '',
      businessType: deal.businessType || '',
      description: deal.description || '',
      tags: deal.tags || [],
    });
    setSelectedPipeline(pipelines.find(p => p.id === deal.pipelineId) || null);
    setEditingDeal(deal.id);
    setFormStep(1);
  };

  const handleView = (deal: any) => {
    setViewDeal(deal.id);
    setFormData({
      name: deal.name || '',
      opportunityName: deal.opportunityName || '',
      customerId: deal.customerId || '',
      companyId: deal.companyId || '',
      primaryContactId: deal.primaryContactId || '',
      leadId: deal.leadId || '',
      pipelineId: deal.pipelineId || '',
      stageId: deal.stageId || '',
      assignedToId: deal.assignedToId || '',
      status: deal.status || 'Open',
      priority: deal.priority || 'Medium',
      probability: deal.probability || 0,
      value: deal.value || 0,
      expectedRevenue: deal.expectedRevenue || 0,
      expectedCloseDate: deal.expectedCloseDate?.split('T')[0] || '',
      currency: deal.currency || 'USD',
      source: deal.source || 'Other',
      industry: deal.industry || '',
      businessType: deal.businessType || '',
      description: deal.description || '',
      tags: deal.tags || [],
    });
  };

  const resetForm = () => {
    const defaultPipeline = pipelines[0];
    const defaultStage = defaultPipeline?.stages?.[0];
    const defaultCustomer = customers[0];

    setFormData({
      name: '', opportunityName: '', customerId: defaultCustomer?.id || '', companyId: '',
      primaryContactId: '', leadId: '', pipelineId: defaultPipeline?.id || '', stageId: defaultStage?.id || '',
      assignedToId: '', status: 'Open', priority: 'Medium',
      probability: defaultStage?.probability || 0, value: 0, expectedRevenue: 0,
      expectedCloseDate: '', currency: 'USD', source: 'Other',
      industry: '', businessType: '', description: '', tags: [],
    });
    setSelectedPipeline(defaultPipeline || null);
    setFormErrors({});
    setFormStep(1);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };
  const removeTag = (t: string) => setFormData({ ...formData, tags: formData.tags.filter((x: string) => x !== t) });

  const getStageOptions = () => {
    if (selectedPipeline) return selectedPipeline.stages || [];
    if (formData.pipelineId) {
      const p = pipelines.find(pl => pl.id === formData.pipelineId);
      return p?.stages || [];
    }
    return [];
  };

  const renderForm = () => (
    <div className="space-y-5">
      {/* Form Step Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        {[
          { step: 1, label: '1. Basic Information' },
          { step: 2, label: '2. Pipeline & Financial' },
          { step: 3, label: '3. Details & Tags' },
        ].map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setFormStep(s.step)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
              formStep === s.step ? 'bg-brand-550 text-white shadow-glossy-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {formStep === 1 && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Deal Name *</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" placeholder="e.g. Acme Enterprise SaaS Expansion" />
              {formErrors.name && <p className="text-[10px] text-rose-500 font-semibold mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Opportunity Name</label>
              <input value={formData.opportunityName} onChange={e => setFormData({...formData, opportunityName: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Source</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="Other">Other</option><option value="Referral">Referral</option>
                <option value="Website">Website</option><option value="Email">Email</option>
                <option value="Call">Call</option><option value="Social">Social</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Customer</label>
              <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company</label>
              <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Contact</label>
              <select value={formData.primaryContactId} onChange={e => setFormData({...formData, primaryContactId: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lead</label>
              <select value={formData.leadId} onChange={e => setFormData({...formData, leadId: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Lead</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.fullName} ({l.leadNumber})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {formStep === 2 && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pipeline</label>
              <select value={formData.pipelineId} onChange={e => {
                const p = pipelines.find(pl => pl.id === e.target.value);
                setSelectedPipeline(p || null);
                setFormData({...formData, pipelineId: e.target.value, stageId: ''});
              }}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Pipeline</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Stage</label>
              <select value={formData.stageId} onChange={e => setFormData({...formData, stageId: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="">Select Stage</option>
                {getStageOptions().map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Value ($)</label>
              <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Expected Revenue ($)</label>
              <input type="number" value={formData.expectedRevenue} onChange={e => setFormData({...formData, expectedRevenue: Number(e.target.value)})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Expected Close Date</label>
              <input type="date" value={formData.expectedCloseDate} onChange={e => setFormData({...formData, expectedCloseDate: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Currency</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="USD">USD</option><option value="EUR">EUR</option>
                <option value="GBP">GBP</option><option value="INR">INR</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="Open">Open</option><option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option><option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option><option value="Lost">Lost</option>
                <option value="Cancelled">Cancelled</option><option value="On Hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
                <option value="Low">Low</option><option value="Medium">Medium</option>
                <option value="High">High</option><option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Industry</label>
              <input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Business Type</label>
              <input value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Deal Owner</label>
            <select value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550">
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tags.map((t: string) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-semibold border border-brand-100">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-brand-400 hover:text-brand-600"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag and press Enter" className="flex-grow px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50" />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Controls */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div>
          {formStep > 1 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setFormStep(formStep - 1)}>
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => { setShowCreateModal(false); setEditingDeal(null); resetForm(); }}>
            Cancel
          </Button>
          {formStep < 3 ? (
            <Button type="button" variant="primary" size="sm" onClick={() => setFormStep(formStep + 1)}>
              Next Step
            </Button>
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={editingDeal ? handleUpdate : handleCreate}>
              {editingDeal ? 'Update Deal' : 'Save Deal'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const dealDetail = deals.find(d => d.id === viewDeal);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <Briefcase className="text-brand-550" size={24} /> Commercial Deals Hub
          </h1>
          <p className="text-sm font-medium text-slate-400">Manage enterprise opportunities, sales pipelines, and commercial revenue forecasts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/deals/insights')} className="flex items-center gap-1.5 border-slate-200">
            <BarChart3 size={14} className="text-indigo-500" /> Executive Insights
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/deals/workflows')} className="flex items-center gap-1.5 border-slate-200">
            <TrendingUp size={14} className="text-emerald-500" /> Workflows
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/deals/playbooks')} className="flex items-center gap-1.5 border-slate-200">
            <Briefcase size={14} className="text-amber-500" /> Playbooks
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/deals/pipeline')} className="flex items-center gap-1.5 border-slate-200">
            <Kanban size={14} className="text-brand-550" /> Pipeline Board
          </Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={14} className="mr-1.5" /> New Deal
          </Button>
        </div>
      </motion.div>

      {/* KPI Statistics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Briefcase size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Opportunities</p>
              <p className="text-xl font-black text-slate-800">{statistics?.totalDeals || deals.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Open Deals</p>
              <p className="text-xl font-black text-slate-800">{statistics?.openDeals || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Volume</p>
              <p className="text-xl font-black text-slate-800">${(statistics?.pipelineValue || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Deal Size</p>
              <p className="text-xl font-black text-slate-800">${(statistics?.averageDealValue || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Deals Table & Search Card */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4">
        {/* Quick Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
            {quickTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-brand-550 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-550"
              />
            </form>
            <Button onClick={fetchDeals} variant="outline" size="sm" className="p-2 border-slate-200" title="Refresh">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Deals Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading commercial opportunities...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
            <Briefcase className="w-12 h-12 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No Deals Found</h3>
            <p className="text-xs text-slate-400 max-w-sm">Create your first deal or adjust your search parameter filters.</p>
            <Button onClick={() => { resetForm(); setShowCreateModal(true); }} variant="primary" size="sm">
              <Plus size={14} className="mr-1" /> New Deal
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="px-4 py-3">Deal Name</th>
                  <th className="px-4 py-3">Company / Client</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Deal Value</th>
                  <th className="px-4 py-3">Probability</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-25/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800">
                      <button onClick={() => handleView(d)} className="hover:text-brand-550 text-left transition-colors">
                        {d.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{d.company?.name || d.customer?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200">
                        {d.stage?.name || 'Qualification'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">${(d.value || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold">{d.probability || 0}%</td>
                    <td className="px-4 py-3">
                      <Badge variant="custom" className={`${statusColors[d.status] || 'bg-slate-100 text-slate-600'} text-[10px] font-bold px-2 py-0.5`}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleView(d)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="View Deal">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleEdit(d)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-400 transition-colors" title="Edit Deal">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors" title="Delete Deal">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      {showCreateModal || editingDeal ? (
        <Modal onClose={() => { setShowCreateModal(false); setEditingDeal(null); resetForm(); }} title={editingDeal ? 'Edit Deal' : 'Create New Deal'} size="lg">
          {renderForm()}
        </Modal>
      ) : null}

      {/* View Deal Modal */}
      {viewDeal && dealDetail && (
        <Modal onClose={() => setViewDeal(null)} title={dealDetail.name} size="lg">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                <Badge variant="custom" className={`${statusColors[dealDetail.status] || ''} mt-1 text-[10px] font-bold`}>{dealDetail.status}</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Priority</p>
                <Badge variant="custom" className={`${priorityColors[dealDetail.priority] || ''} mt-1 text-[10px] font-bold`}>{dealDetail.priority}</Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Value</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">${(dealDetail.value || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Probability</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{dealDetail.probability}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Company</p><p className="font-semibold text-slate-700">{dealDetail.company?.name || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Primary Contact</p><p className="font-semibold text-slate-700">{dealDetail.primaryContact?.fullName || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Deal Owner</p><p className="font-semibold text-slate-700">{dealDetail.assignedTo ? `${dealDetail.assignedTo.firstName} ${dealDetail.assignedTo.lastName}` : 'Unassigned'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expected Close</p><p className="font-semibold text-slate-700">{dealDetail.expectedCloseDate ? new Date(dealDetail.expectedCloseDate).toLocaleDateString() : '-'}</p></div>
            </div>

            {dealDetail.description && (
              <div className="pt-2 border-t border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</p><p className="text-slate-600 font-medium">{dealDetail.description}</p></div>
            )}

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => { setViewDeal(null); handleEdit(dealDetail); }}>
                <Edit2 size={13} className="mr-1" /> Edit Deal
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewDeal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Confirm Deletion" size="sm">
          <p className="text-xs text-slate-600 mb-4 font-medium">Are you sure you want to delete this deal? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default Deals;
