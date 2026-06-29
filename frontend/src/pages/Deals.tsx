import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Users, Building2, Phone, Mail, FileText,
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
  visible: { transition: { staggerChildren: 0.04 } },
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
    if (!formData.customerId) errs.customerId = 'Customer is required';
    if (!formData.stageId) errs.stageId = 'Stage is required';
    if (!formData.pipelineId) errs.pipelineId = 'Pipeline is required';
    setFormErrors(errs);
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
    setFormData({
      name: '', opportunityName: '', customerId: '', companyId: '',
      primaryContactId: '', leadId: '', pipelineId: '', stageId: '',
      assignedToId: '', status: 'Open', priority: 'Medium',
      probability: 0, value: 0, expectedRevenue: 0,
      expectedCloseDate: '', currency: 'USD', source: 'Other',
      industry: '', businessType: '', description: '', tags: [],
    });
    setSelectedPipeline(null);
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
      {formStep === 1 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText size={14} className="text-brand-550" /> Basic Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Deal Name *</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" placeholder="Enter deal name" />
              {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Opportunity Name</label>
              <input value={formData.opportunityName} onChange={e => setFormData({...formData, opportunityName: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Source</label>
              <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="Other">Other</option><option value="Referral">Referral</option>
                <option value="Website">Website</option><option value="Email">Email</option>
                <option value="Call">Call</option><option value="Social">Social</option>
                <option value="Partner">Partner</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Customer *</label>
              <select value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {formErrors.customerId && <p className="text-[10px] text-red-500 mt-1">{formErrors.customerId}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Company</label>
              <select value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Primary Contact</label>
              <select value={formData.primaryContactId} onChange={e => setFormData({...formData, primaryContactId: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Contact</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Lead</label>
              <select value={formData.leadId} onChange={e => setFormData({...formData, leadId: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Lead</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.fullName} ({l.leadNumber})</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {formStep === 2 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-550" /> Pipeline & Financial
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pipeline *</label>
              <select value={formData.pipelineId} onChange={e => {
                const p = pipelines.find(pl => pl.id === e.target.value);
                setSelectedPipeline(p || null);
                setFormData({...formData, pipelineId: e.target.value, stageId: ''});
              }}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Pipeline</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {formErrors.pipelineId && <p className="text-[10px] text-red-500 mt-1">{formErrors.pipelineId}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Stage *</label>
              <select value={formData.stageId} onChange={e => setFormData({...formData, stageId: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="">Select Stage</option>
                {getStageOptions().map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.probability}%)</option>)}
              </select>
              {formErrors.stageId && <p className="text-[10px] text-red-500 mt-1">{formErrors.stageId}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Value</label>
              <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Expected Revenue</label>
              <input type="number" value={formData.expectedRevenue} onChange={e => setFormData({...formData, expectedRevenue: Number(e.target.value)})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Probability (%)</label>
              <input type="number" min={0} max={100} value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Expected Close Date</label>
              <input type="date" value={formData.expectedCloseDate} onChange={e => setFormData({...formData, expectedCloseDate: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Currency</label>
              <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="USD">USD</option><option value="EUR">EUR</option>
                <option value="GBP">GBP</option><option value="INR">INR</option>
                <option value="JPY">JPY</option><option value="AUD">AUD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="Open">Open</option><option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option><option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option><option value="Lost">Lost</option>
                <option value="Cancelled">Cancelled</option><option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
                <option value="Low">Low</option><option value="Medium">Medium</option>
                <option value="High">High</option><option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Tag size={14} className="text-brand-550" /> Additional Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Industry</label>
              <input value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Business Type</label>
              <input value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})}
                className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Deal Owner</label>
            <select value={formData.assignedToId} onChange={e => setFormData({...formData, assignedToId: e.target.value})}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60">
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {formData.tags.map((t: string) => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-semibold border border-brand-100">
                  {t} <button onClick={() => removeTag(t)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-grow px-3 py-2 text-sm border rounded-xl bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-brand-100/60" placeholder="Type tag and press Enter" />
              <Button type="button" variant="secondary" size="sm" onClick={addTag}><Plus size={14} /></Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <button key={s} onClick={() => setFormStep(s)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${formStep === s ? 'bg-brand-550 text-white' : 'bg-slate-100 text-slate-500'}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {formStep > 1 && <Button type="button" variant="secondary" size="sm" onClick={() => setFormStep(s => s - 1)}>Previous</Button>}
          {formStep < 3 ? (
            <Button type="button" variant="primary" size="sm" onClick={() => setFormStep(s => s + 1)}>Next</Button>
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={editingDeal ? handleUpdate : handleCreate}>
              {editingDeal ? 'Save Changes' : 'Create Deal'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const dealDetail = deals.find(d => d.id === viewDeal);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      <motion.div variants={itemVariants} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mt-1">Deals</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage sales opportunities and pipeline revenue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={() => setShowFilterPanel(!showFilterPanel)}>
            <Filter size={14} className="mr-1.5" /> Filters
          </Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={14} className="mr-1.5" /> New Deal
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading && !statistics ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : (
          <>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-xl"><Briefcase size={16} className="text-blue-600" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Total</p><p className="text-lg font-bold text-slate-800">{statistics?.totalDeals || 0}</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-50 rounded-xl"><TrendingUp size={16} className="text-emerald-600" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Open</p><p className="text-lg font-bold text-slate-800">{statistics?.openDeals || 0}</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-amber-50 rounded-xl"><DollarSign size={16} className="text-amber-600" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Pipeline</p><p className="text-lg font-bold text-slate-800">${(statistics?.pipelineValue || 0).toLocaleString()}</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-violet-50 rounded-xl"><BarChart3 size={16} className="text-violet-600" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Avg Value</p><p className="text-lg font-bold text-slate-800">${(statistics?.averageDealValue || 0).toLocaleString()}</p></div></div></Card>
          </>
        )}
      </motion.div>

      {/* Quick Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
        {quickTabs.map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-brand-550 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
            }`}>{tab.label}</button>
        ))}
      </motion.div>

      {/* Search + Actions Bar */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals by name, company, contact..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:border-brand-550 focus:ring-4 focus:ring-brand-100/80 transition-all font-medium text-slate-600" />
        </form>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="text-[10px] font-semibold text-slate-500">{selectedIds.length} selected</span>
            <Button variant="secondary" size="sm" onClick={() => setShowBulkStatus(true)}><Check size={12} className="mr-1" /> Status</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowBulkOwner(true)}><UserCheck size={12} className="mr-1" /> Owner</Button>
            <button onClick={clearSelection} className="text-slate-400 hover:text-slate-600 p-1"><X size={14} /></button>
          </div>
        )}
      </motion.div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white border border-slate-150 rounded-2xl shadow-glossy-sm space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Advanced Filters</span><button onClick={() => setShowFilterPanel(false)}><X size={14} className="text-slate-400" /></button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-[10px] font-semibold text-slate-500 block mb-1">Status</label><select value={filters.status || ''} onChange={e => setFilters({ status: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-xs border rounded-xl bg-slate-50/50"><option value="">All</option><option>Open</option><option>Qualified</option><option>Proposal Sent</option><option>Negotiation</option><option>Won</option><option>Lost</option><option>Cancelled</option><option>On Hold</option><option>Archived</option></select></div>
            <div><label className="text-[10px] font-semibold text-slate-500 block mb-1">Priority</label><select value={filters.priority || ''} onChange={e => setFilters({ priority: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-xs border rounded-xl bg-slate-50/50"><option value="">All</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
            <div><label className="text-[10px] font-semibold text-slate-500 block mb-1">Pipeline</label><select value={filters.pipelineId || ''} onChange={e => setFilters({ pipelineId: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-xs border rounded-xl bg-slate-50/50"><option value="">All</option>{pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="text-[10px] font-semibold text-slate-500 block mb-1">Owner</label><select value={filters.ownerId || ''} onChange={e => setFilters({ ownerId: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-xs border rounded-xl bg-slate-50/50"><option value="">All</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
          </div>
        </motion.div>
      )}

      {/* Deals Table */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-glossy-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-3 text-left w-10">
                  <input type="checkbox" checked={allSelected} onChange={() => toggleAllSelection()}
                    className="rounded border-slate-300 text-brand-550 focus:ring-brand-100" />
                </th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deal</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pipeline</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Prob</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Value</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Close</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && deals.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50"><td colSpan={12} className="p-4"><Skeleton className="h-8 rounded-xl" /></td></tr>
                ))
              ) : error && deals.length === 0 ? (
                <tr><td colSpan={12} className="p-12 text-center">
                  <ShieldAlert size={32} className="text-rose-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-rose-500">Failed to load deals</p>
                  <p className="text-xs text-rose-400 mt-1">{error}</p>
                </td></tr>
              ) : deals.length === 0 ? (
                <tr><td colSpan={12} className="p-16 text-center">
                  <Briefcase size={40} className="text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-700">No Deals Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {filters.search ? 'No deals match your search criteria.' : 'Start by creating your first sales opportunity.'}
                  </p>
                  {!filters.search && (
                    <Button variant="primary" size="sm" className="mt-4" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                      <Plus size={14} className="mr-1.5" /> Create Deal
                    </Button>
                  )}
                </td></tr>
              ) : (
                filteredDeals.map((deal) => {
                  const isSelected = selectedIds.includes(deal.id);
                  return (
                    <tr key={deal.id} className={`border-b border-slate-50 hover:bg-slate-25/50 transition-all ${isSelected ? 'bg-brand-25/30' : ''}`}>
                      <td className="p-3"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(deal.id)}
                        className="rounded border-slate-300 text-brand-550 focus:ring-brand-100" /></td>
                      <td className="p-3">
                        <button onClick={() => handleView(deal)} className="text-left">
                          <p className="text-xs font-bold text-slate-800 hover:text-brand-550 transition-colors">{deal.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold">{deal.dealNumber}</p>
                        </button>
                      </td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{deal.company?.name || '-'}</td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{deal.primaryContact?.fullName || '-'}</td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{deal.assignedTo ? `${deal.assignedTo.firstName} ${deal.assignedTo.lastName}` : '-'}</td>
                      <td className="p-3 text-xs text-slate-600 font-medium">{deal.pipeline?.name || '-'}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">{deal.stage?.name || '-'}</span></td>
                      <td className="p-3 text-xs font-bold text-right">
                        <span className={`${deal.probability >= 70 ? 'text-emerald-600' : deal.probability >= 40 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {deal.probability}%
                        </span>
                      </td>
                      <td className="p-3 text-xs font-bold text-slate-800 text-right">${(deal.value || 0).toLocaleString()}</td>
                      <td className="p-3 text-[10px] text-slate-500">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '-'}</td>
                      <td className="p-3"><Badge variant="custom" className={`${statusColors[deal.status] || 'bg-slate-50 text-slate-600'} text-[10px]`}>{deal.status}</Badge></td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleView(deal)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all" title="View"><Eye size={13} /></button>
                          <button onClick={() => handleEdit(deal)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all" title="Edit"><Edit2 size={13} /></button>
                          <button onClick={() => setDeleteConfirm(deal.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all" title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-25/50">
            <span className="text-[10px] font-semibold text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} items)
            </span>
            <div className="flex items-center gap-1">
              <button disabled={pagination.page <= 1} onClick={() => setPage(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={14} /></button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, pagination.page - 2);
                const pageNum = start + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${pageNum === pagination.page ? 'bg-brand-550 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {pageNum}</button>
                );
              })}
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => setPage(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-150 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create/Edit Modal */}
      {showCreateModal || editingDeal ? (
        <Modal onClose={() => { setShowCreateModal(false); setEditingDeal(null); resetForm(); }} title={editingDeal ? 'Edit Deal' : 'Create New Deal'} size="lg">
          {renderForm()}
        </Modal>
      ) : null}

      {/* View Deal Modal */}
      {viewDeal && dealDetail && (
        <Modal onClose={() => setViewDeal(null)} title={dealDetail.name} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-[9px] font-bold text-slate-500 uppercase">Status</p><Badge variant="custom" className={`${statusColors[dealDetail.status] || ''} mt-1 text-[11px]`}>{dealDetail.status}</Badge></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-[9px] font-bold text-slate-500 uppercase">Priority</p><Badge variant="custom" className={`${priorityColors[dealDetail.priority] || ''} mt-1 text-[11px]`}>{dealDetail.priority}</Badge></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-[9px] font-bold text-slate-500 uppercase">Value</p><p className="text-sm font-bold text-slate-800 mt-1">${(dealDetail.value || 0).toLocaleString()}</p></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-[9px] font-bold text-slate-500 uppercase">Probability</p><p className="text-sm font-bold text-slate-800 mt-1">{dealDetail.probability}%</p></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Company</p><p className="text-sm font-semibold text-slate-700">{dealDetail.company?.name || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Primary Contact</p><p className="text-sm font-semibold text-slate-700">{dealDetail.primaryContact?.fullName || '-'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Deal Owner</p><p className="text-sm font-semibold text-slate-700">{dealDetail.assignedTo ? `${dealDetail.assignedTo.firstName} ${dealDetail.assignedTo.lastName}` : 'Unassigned'}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Close</p><p className="text-sm font-semibold text-slate-700">{dealDetail.expectedCloseDate ? new Date(dealDetail.expectedCloseDate).toLocaleDateString() : '-'}</p></div>
            </div>
            {dealDetail.description && (
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Description</p><p className="text-sm text-slate-600">{dealDetail.description}</p></div>
            )}
            {dealDetail.tags && dealDetail.tags.length > 0 && (
              <div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tags</p><div className="flex flex-wrap gap-1.5">{dealDetail.tags.map((t: string) => (
                <span key={t} className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-lg text-[10px] font-semibold border border-brand-100">{t}</span>
              ))}</div></div>
            )}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => { setViewDeal(null); handleEdit(dealDetail); }}>
                <Edit2 size={13} className="mr-1.5" /> Edit Deal
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewDeal(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)} title="Confirm Deletion" size="sm">
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete this deal? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </Modal>
      )}

      {/* Bulk Status Modal */}
      {showBulkStatus && (
        <Modal onClose={() => setShowBulkStatus(false)} title={`Update ${selectedIds.length} Deals`} size="sm">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">New Status</label>
            <select value={bulkStatusVal} onChange={e => setBulkStatusVal(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50">
              <option>Open</option><option>Qualified</option><option>Proposal Sent</option>
              <option>Negotiation</option><option>Won</option><option>Lost</option>
              <option>Cancelled</option><option>On Hold</option><option>Archived</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowBulkStatus(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleBulkStatus}>Update Status</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Owner Modal */}
      {showBulkOwner && (
        <Modal onClose={() => setShowBulkOwner(false)} title={`Reassign ${selectedIds.length} Deals`} size="sm">
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">New Owner</label>
            <select value={bulkOwnerVal} onChange={e => setBulkOwnerVal(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-slate-50/50">
              <option value="">Select Owner</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowBulkOwner(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleBulkOwner}>Reassign</Button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default Deals;
