import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import {
  Plus,
  Search,
  Users2,
  TrendingUp,
  Trophy,
  XCircle,
  Target,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  FileDown,
  FileUp,
  GitMerge,
  Archive,
  RefreshCw,
  Columns,
  CheckCircle2,
  Trash,
  Tag,
  Briefcase,
  UserCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-650 border-slate-200',
};

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    leads,
    statistics,
    statuses,
    sources,
    employees,
    savedViews,
    loading,
    error,
    filters,
    pagination,
    selectedIds,
    fetchLeads,
    fetchStatistics,
    fetchStatuses,
    fetchSources,
    fetchEmployees,
    fetchViews,
    saveCustomView,
    deleteCustomView,
    setFilters,
    setPage,
    setSort,
    deleteLead,
    toggleSelection,
    clearSelection,
    bulkUpdateLeads,
    archiveLeadsAction,
    restoreLeadsAction,
    mergeLeadsAction,
    importLeadsAction,
    exportLeadsAction,
    searchLeadsAction,
    filterLeadsAction,
  } = useLeadStore();

  // Search and Advanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Favorites' | 'Archived'>('All');
  
  // Custom Saved Views
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
  const [saveViewModalOpen, setSaveViewModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // AND/OR Filter Builder State
  const [filterBuilderOpen, setFilterBuilderOpen] = useState(false);
  const [filterCondition, setFilterCondition] = useState<'AND' | 'OR'>('AND');
  const [filterRules, setFilterRules] = useState<Array<{ field: string; operator: string; value: any }>>([
    { field: 'priority', operator: 'equals', value: 'High' }
  ]);

  // Column Visibility & Ordering
  const [colVisibility, setColVisibility] = useState<Record<string, boolean>>({
    leadNumber: true,
    fullName: true,
    companyName: true,
    email: true,
    phone: true,
    status: true,
    priority: true,
    value: true,
    createdAt: true,
    tags: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Bulk operation modals
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkField, setBulkField] = useState<'status' | 'priority' | 'owner' | 'rating' | 'tags' | ''>('');
  const [bulkVal, setBulkVal] = useState('');
  const [bulkTagsText, setBulkTagsText] = useState('');

  // CSV Import wizard state
  const [importOpen, setImportOpen] = useState(false);
  const [importFileText, setImportFileText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    industry: '',
    value: '',
    tags: '',
  });
  const [importStep, setImportStep] = useState(1);
  const [importResult, setImportResult] = useState<any>(null);

  // Export Leads options
  const [exportOpen, setExportOpen] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'xlsx' | 'pdf'>('csv');
  const [exportScope, setExportScope] = useState<'selected' | 'filtered' | 'page' | 'all'>('all');

  // Duplicate check and Merge modal
  const [duplicateBannerOpen, setDuplicateBannerOpen] = useState(true);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergePrimaryId, setMergePrimaryId] = useState('');
  const [mergeSecondaryId, setMergeSecondaryId] = useState('');
  const [mergedFields, setMergedFields] = useState<any>({});

  // Single Delete Confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchStatistics();
    fetchStatuses();
    fetchSources();
    fetchEmployees();
    fetchViews();
  }, []);

  // Search input debouncer trigger
  useEffect(() => {
    if (searchQuery.trim()) {
      const delay = setTimeout(() => {
        searchLeadsAction(searchQuery.trim());
      }, 300);
      return () => clearTimeout(delay);
    } else {
      fetchLeads();
    }
  }, [searchQuery]);

  // Tab trigger scoping
  useEffect(() => {
    if (activeTab === 'Archived') {
      // Custom filter parameter for soft archived leads
      setFilters({ status: 'archived' as any });
      fetchLeads();
    } else {
      setFilters({ status: undefined });
      fetchLeads();
    }
  }, [activeTab]);

  // Load selected Saved View filters
  const handleSelectView = (view: any) => {
    setSelectedViewId(view.id);
    if (view.filters) {
      filterLeadsAction(view.filters);
    }
    if (view.columns && view.columns.length > 0) {
      const newColVis = { ...colVisibility };
      Object.keys(newColVis).forEach(k => {
        newColVis[k] = view.columns.includes(k);
      });
      setColVisibility(newColVis);
    }
  };

  // Add rule in custom AND/OR filter builder
  const handleAddRule = () => {
    setFilterRules([...filterRules, { field: 'priority', operator: 'equals', value: '' }]);
  };

  const handleRemoveRule = (idx: number) => {
    setFilterRules(filterRules.filter((_, i) => i !== idx));
  };

  const handleApplyFilters = () => {
    const filtersObj = {
      condition: filterCondition,
      rules: filterRules.filter(r => r.value !== ''),
    };
    filterLeadsAction(filtersObj);
    setFilterBuilderOpen(false);
  };

  const handleSaveView = async () => {
    if (!newViewName.trim()) return;
    const columnsArr = Object.keys(colVisibility).filter(k => colVisibility[k]);
    const filtersObj = {
      condition: filterCondition,
      rules: filterRules.filter(r => r.value !== ''),
    };
    await saveCustomView({
      name: newViewName.trim(),
      filters: filtersObj,
      columns: columnsArr,
    });
    setNewViewName('');
    setSaveViewModalOpen(false);
  };

  // Bulk modify updates
  const handleBulkUpdateSubmit = async () => {
    const payload: any = { ids: selectedIds };
    if (bulkField === 'status') payload.statusId = bulkVal;
    if (bulkField === 'priority') payload.priority = bulkVal;
    if (bulkField === 'rating') payload.rating = parseInt(bulkVal) || 0;
    if (bulkField === 'owner') payload.assignedToId = bulkVal;
    if (bulkField === 'tags') {
      payload.tags = bulkTagsText.split(',').map(t => t.trim()).filter(Boolean);
    }

    await bulkUpdateLeads(payload);
    clearSelection();
    setBulkActionOpen(false);
    setBulkField('');
    setBulkVal('');
    setBulkTagsText('');
  };

  const handleBulkArchive = async () => {
    if (window.confirm(`Archive ${selectedIds.length} leads?`)) {
      await archiveLeadsAction(selectedIds);
      clearSelection();
    }
  };

  const handleBulkRestore = async () => {
    await restoreLeadsAction(selectedIds);
    clearSelection();
  };

  // Export leads dataset helper
  const handleExportSubmit = async () => {
    const params: Record<string, any> = { type: exportType };
    if (exportScope === 'selected') {
      params.selectedIds = selectedIds.join(',');
    } else if (exportScope === 'filtered') {
      params.filters = JSON.stringify({ condition: filterCondition, rules: filterRules });
    } else if (exportScope === 'page') {
      params.pageLeads = leads.map(l => l.id).join(',');
    }

    const data = await exportLeadsAction(params);
    
    // Simulate browser download file
    const headers = ['Lead No', 'Name', 'Company', 'Email', 'Phone', 'Priority', 'Status', 'Value'];
    const rows = data.map((l: any) => [
      l.leadNumber,
      `"${l.fullName}"`,
      `"${l.companyName || ''}"`,
      l.email || '',
      l.phone || '',
      l.priority,
      l.status?.name || '',
      l.value || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `FlowCRM_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setExportOpen(false);
  };

  // CSV uploader step parses helper
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setImportFileText(text);

      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        const headersArr = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        setImportHeaders(headersArr);

        const rowsArr = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/['"]/g, ''));
          const rowObj: any = {};
          headersArr.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });
          return rowObj;
        });

        setImportRows(rowsArr);
        
        // Auto match mapping preview fields
        const initialMapping = { ...fieldMapping };
        Object.keys(initialMapping).forEach(k => {
          const match = headersArr.find(h => h.toLowerCase() === k.toLowerCase());
          if (match) initialMapping[k] = match;
        });
        setFieldMapping(initialMapping);
        setImportStep(2);
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    try {
      const res = await importLeadsAction({
        fileName: importFileName,
        rows: importRows,
        mapping: fieldMapping,
      });
      setImportResult(res);
      setImportStep(3);
    } catch (err: any) {
      setImportResult({ error: err.message || 'Import transaction rolled back.' });
      setImportStep(3);
    }
  };

  // Lead merging parameters
  const handleMergeSubmit = async () => {
    if (!mergePrimaryId || !mergeSecondaryId) return;
    await mergeLeadsAction({
      primaryId: mergePrimaryId,
      secondaryIds: [mergeSecondaryId],
      fieldValues: mergedFields,
    });
    setMergeOpen(false);
    setMergePrimaryId('');
    setMergeSecondaryId('');
    setMergedFields({});
  };

  const startMerge = (lead1Id: string, lead2Id: string) => {
    setMergePrimaryId(lead1Id);
    setMergeSecondaryId(lead2Id);
    const lead1 = leads.find(l => l.id === lead1Id);
    const lead2 = leads.find(l => l.id === lead2Id);
    if (lead1 && lead2) {
      setMergedFields({
        firstName: lead1.firstName,
        lastName: lead1.lastName,
        email: lead1.email || lead2.email,
        phone: lead1.phone || lead2.phone,
        companyName: lead1.companyName || lead2.companyName,
        value: Math.max(lead1.value || 0, lead2.value || 0),
        industry: lead1.industry || lead2.industry,
      });
    }
    setMergeOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete);
      setDeleteOpen(false);
      setLeadToDelete(null);
      fetchLeads();
    }
  };

  // Find duplicates warnings triggers
  const duplicateAlerts = useMemo(() => {
    const alerts: Array<{ lead1: any; lead2: any; reason: string }> = [];
    const emails = new Map();
    const phones = new Map();

    leads.forEach(l => {
      if (l.email) {
        if (emails.has(l.email)) {
          alerts.push({ lead1: emails.get(l.email), lead2: l, reason: 'Duplicate Email' });
        } else {
          emails.set(l.email, l);
        }
      }
      if (l.phone) {
        if (phones.has(l.phone)) {
          alerts.push({ lead1: phones.get(l.phone), lead2: l, reason: 'Duplicate Phone' });
        } else {
          phones.set(l.phone, l);
        }
      }
    });
    return alerts;
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Breadcrumb items={[{ label: 'Sales Leads Workspace' }]} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Advanced Lead Workspace</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
            Enterprise multi filtering, saved layouts, CSV import wizards, and deduplication
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="rounded-xl font-bold border-slate-200 text-xs flex items-center gap-1.5"
          >
            <FileUp size={14} />
            CSV Mapper Import
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setExportOpen(true)}
            className="rounded-xl font-bold border-slate-200 text-xs flex items-center gap-1.5"
          >
            <FileDown size={14} />
            Export Data
          </Button>
          <Button
            onClick={() => navigate('/leads/new')}
            className="rounded-xl flex items-center gap-1.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* DUPLICATE DETECTION NOTICE BANNER */}
      {duplicateAlerts.length > 0 && duplicateBannerOpen && (
        <Card className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold text-amber-800 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>
              Warning: Detected {duplicateAlerts.length} duplicate conflicts in workspace. Take merging actions to unify history logs.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => startMerge(duplicateAlerts[0].lead1.id, duplicateAlerts[0].lead2.id)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm text-[10px]"
            >
              Resolve Merge
            </button>
            <button onClick={() => setDuplicateBannerOpen(false)}>
              <XCircle size={16} className="text-amber-400 hover:text-amber-600" />
            </button>
          </div>
        </Card>
      )}

      {/* STATISTICS PERIOD BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales Leads', val: statistics?.totalLeads || 0, icon: Users2, color: 'text-blue-500' },
          { label: 'Qualified Opportunities', val: statistics?.qualifiedLeads || 0, icon: Target, color: 'text-amber-500' },
          { label: 'Won Conversions', val: statistics?.wonLeads || 0, icon: Trophy, color: 'text-emerald-500' },
          { label: 'Pipeline Forecast Value', val: `$${(statistics?.totalValue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500' },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 ${c.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{c.label}</span>
                <span className="text-xl font-black text-slate-800 block mt-0.5">{c.val}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* FILTER BUILDER, VIEWS TABS & SEARCH ROW */}
      <div className="space-y-4">
        {/* Saved Views tab selector row */}
        <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-slate-100">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-2">List Layouts:</span>
          <button
            onClick={() => {
              setSelectedViewId(null);
              fetchLeads();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              !selectedViewId ? 'bg-blue-50/50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            All Leads Default
          </button>
          
          {savedViews.map((view) => (
            <div key={view.id} className="flex items-center gap-0.5 group">
              <button
                onClick={() => handleSelectView(view)}
                className={`px-3 py-1.5 rounded-l-lg text-xs font-bold transition-all border border-r-0 ${
                  selectedViewId === view.id
                    ? 'bg-blue-50/50 border-blue-200 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {view.name}
              </button>
              <button
                onClick={() => deleteCustomView(view.id)}
                className="px-2 py-1.5 border border-l-0 border-slate-200 rounded-r-lg bg-white hover:bg-red-50 text-slate-350 hover:text-red-600 transition-colors"
              >
                <Trash size={12} />
              </button>
            </div>
          ))}

          <Button
            variant="glass"
            size="sm"
            onClick={() => setSaveViewModalOpen(true)}
            className="rounded-lg text-[10px] font-bold py-1 px-2.5 h-max border-dashed border-slate-300 hover:border-blue-400 text-slate-500"
          >
            + Save View Layout
          </Button>
        </div>

        {/* Global Instant Search Bar & Column configurations */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Instant query (name, email, industry, tags, state, city...)"
              className="pl-9 pr-4 rounded-xl border-slate-200/80 focus:border-blue-400 bg-white/70"
            />
          </div>

          <div className="flex gap-2 justify-end items-center">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setFilterBuilderOpen(true)}
              className="rounded-xl flex items-center gap-1.5 font-bold text-xs"
            >
              <Filter size={14} />
              AND/OR Filter Builder
            </Button>

            <div className="relative">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowColMenu(!showColMenu)}
                className="rounded-xl flex items-center gap-1.5 font-bold text-xs"
              >
                <Columns size={14} />
                Columns Layout
              </Button>

              {showColMenu && (
                <Card className="absolute right-0 mt-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-35 min-w-[160px] space-y-2 text-xs font-semibold text-slate-700">
                  {Object.keys(colVisibility).map((col) => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={colVisibility[col]}
                        onChange={() => setColVisibility(prev => ({ ...prev, [col]: !prev[col] }))}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </Card>
              )}
            </div>

            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterRules([]);
                fetchLeads();
              }}
              className="rounded-xl text-red-500 border-red-100 hover:bg-red-50 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* MASS BULK ACTIONS FLOATING TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200/60 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-blue-800 shadow-md">
          <span>Selected {selectedIds.length} lead records:</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setBulkField('status');
                setBulkActionOpen(true);
              }}
              className="bg-white hover:bg-slate-50 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs py-1 px-3"
            >
              Change Status
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setBulkField('owner');
                setBulkActionOpen(true);
              }}
              className="bg-white hover:bg-slate-50 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs py-1 px-3"
            >
              Assign User
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setBulkField('tags');
                setBulkActionOpen(true);
              }}
              className="bg-white hover:bg-slate-50 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs py-1 px-3"
            >
              Apply Tags
            </Button>
            <Button
              size="sm"
              onClick={handleBulkArchive}
              className="bg-white hover:bg-slate-50 text-blue-800 border border-blue-200 font-bold rounded-xl text-xs py-1 px-3 flex items-center gap-1"
            >
              <Archive size={12} />
              Archive
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={clearSelection}
              className="rounded-xl border-blue-200 text-xs py-1 px-3"
            >
              Clear Checked
            </Button>
          </div>
        </div>
      )}

      {/* CORE LEADS DATA TABLE */}
      <Card className="overflow-hidden border border-slate-200/50 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === leads.length && leads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        leads.forEach(l => {
                          if (!selectedIds.includes(l.id)) toggleSelection(l.id);
                        });
                      } else {
                        clearSelection();
                      }
                    }}
                    className="rounded border-slate-350 text-blue-600 focus:ring-0"
                  />
                </th>
                {colVisibility.leadNumber && <th className="py-3 px-4">Lead ID</th>}
                {colVisibility.fullName && <th className="py-3 px-4">Full Name</th>}
                {colVisibility.companyName && <th className="py-3 px-4">Company</th>}
                {colVisibility.email && <th className="py-3 px-4">Email Address</th>}
                {colVisibility.phone && <th className="py-3 px-4">Phone No</th>}
                {colVisibility.status && <th className="py-3 px-4">CRM Status</th>}
                {colVisibility.priority && <th className="py-3 px-4">Priority</th>}
                {colVisibility.value && <th className="py-3 px-4">Expected Value</th>}
                {colVisibility.tags && <th className="py-3 px-4">Tags</th>}
                {colVisibility.createdAt && <th className="py-3 px-4">Date Created</th>}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="p-4" colSpan={11}>
                      <Skeleton className="h-6 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => {
                  const isChecked = selectedIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className={`hover:bg-white/80 transition-colors group cursor-pointer ${isChecked ? 'bg-blue-50/20' : ''}`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelection(lead.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0"
                        />
                      </td>
                      {colVisibility.leadNumber && (
                        <td className="py-3.5 px-4 font-bold text-slate-500 font-mono tracking-tight">
                          {lead.leadNumber}
                        </td>
                      )}
                      {colVisibility.fullName && (
                        <td className="py-3.5 px-4 font-black text-slate-800 min-w-[140px]">
                          {lead.fullName}
                        </td>
                      )}
                      {colVisibility.companyName && (
                        <td className="py-3.5 px-4 text-slate-650 font-semibold truncate max-w-[150px]">
                          {lead.companyName || <span className="text-slate-300">—</span>}
                        </td>
                      )}
                      {colVisibility.email && (
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {lead.email || <span className="text-slate-300">—</span>}
                        </td>
                      )}
                      {colVisibility.phone && (
                        <td className="py-3.5 px-4 text-slate-450 font-semibold font-mono">
                          {lead.phone || <span className="text-slate-300">—</span>}
                        </td>
                      )}
                      {colVisibility.status && (
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="glass"
                            className="font-bold text-[10px] border px-2 py-0.5 rounded-lg"
                            style={{
                              backgroundColor: `${lead.status?.color}10`,
                              borderColor: `${lead.status?.color}40`,
                              color: lead.status?.color,
                            }}
                          >
                            {lead.status?.name || 'Unassigned'}
                          </Badge>
                        </td>
                      )}
                      {colVisibility.priority && (
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="glass"
                            className={`px-2 py-0.5 border text-[10px] font-bold rounded-lg ${priorityColors[lead.priority] || priorityColors.Medium}`}
                          >
                            {lead.priority}
                          </Badge>
                        </td>
                      )}
                      {colVisibility.value && (
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          ${(lead.value || 0).toLocaleString()}
                        </td>
                      )}
                      {colVisibility.tags && (
                        <td className="py-3.5 px-4">
                          <div className="flex gap-1 flex-wrap max-w-[180px]">
                            {lead.tagMappings && lead.tagMappings.length > 0 ? (
                              lead.tagMappings.map((map: any) => (
                                <span
                                  key={map.tag.id}
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded border shadow-sm"
                                  style={{
                                    backgroundColor: `${map.tag.color}15`,
                                    borderColor: `${map.tag.color}35`,
                                    color: map.tag.color,
                                  }}
                                >
                                  {map.tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </div>
                        </td>
                      )}
                      {colVisibility.createdAt && (
                        <td className="py-3.5 px-4 text-slate-400 font-semibold font-mono">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => navigate(`/leads/${lead.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                            title="360 Profile"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => navigate(`/leads/${lead.id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setLeadToDelete(lead.id);
                              setDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-bold">
                    <p className="text-sm">No sales leads matched criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="glass"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Prev
              </Button>
              <Button
                variant="glass"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* FILTER BUILDER DIALOG */}
      <Modal
        isOpen={filterBuilderOpen}
        onClose={() => setFilterBuilderOpen(false)}
        title="Custom AND/OR Filter Builder"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-650">Match conditions:</span>
            <div className="flex border border-slate-200 rounded-xl overflow-hidden text-xs">
              <button
                onClick={() => setFilterCondition('AND')}
                className={`px-3 py-1.5 font-bold ${filterCondition === 'AND' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}
              >
                AND (All rules)
              </button>
              <button
                onClick={() => setFilterCondition('OR')}
                className={`px-3 py-1.5 font-bold ${filterCondition === 'OR' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}
              >
                OR (Any rule)
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filterRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={rule.field}
                  onChange={(e) => {
                    const next = [...filterRules];
                    next[idx].field = e.target.value;
                    setFilterRules(next);
                  }}
                  className="flex-1 text-xs border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
                >
                  <option value="priority">Priority</option>
                  <option value="industry">Industry</option>
                  <option value="value">Deal Value</option>
                  <option value="city">City</option>
                  <option value="state">State</option>
                  <option value="country">Country</option>
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) => {
                    const next = [...filterRules];
                    next[idx].operator = e.target.value;
                    setFilterRules(next);
                  }}
                  className="w-28 text-xs border border-slate-200 rounded-xl p-2 bg-white font-semibold focus:outline-none"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="gte">Greater Than</option>
                  <option value="lte">Less Than</option>
                </select>

                <Input
                  value={rule.value}
                  onChange={(e) => {
                    const next = [...filterRules];
                    next[idx].value = e.target.value;
                    setFilterRules(next);
                  }}
                  placeholder="Value..."
                  className="flex-1 rounded-xl text-xs bg-white border-slate-200"
                />

                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={handleAddRule}
            className="w-full text-xs font-bold border-dashed border-slate-300 text-slate-500 py-2 rounded-xl"
          >
            + Add Query Rule
          </Button>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="glass" size="sm" onClick={() => setFilterBuilderOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-4"
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </Modal>

      {/* SAVE CUSTOM VIEW MODAL */}
      <Modal
        isOpen={saveViewModalOpen}
        onClose={() => setSaveViewModalOpen(false)}
        title="Save Current Filter Layout View"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            placeholder="e.g. Qualified High Value Leads"
            required
            className="rounded-xl border-slate-200 bg-white"
          />
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setSaveViewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveView}
              disabled={!newViewName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Create View
            </Button>
          </div>
        </div>
      </Modal>

      {/* BULK OPERATIONS EDIT PANEL */}
      <Modal
        isOpen={bulkActionOpen}
        onClose={() => setBulkActionOpen(false)}
        title={`Bulk Update leads ${bulkField}`}
        size="sm"
      >
        <div className="space-y-4">
          {bulkField === 'status' && (
            <select
              value={bulkVal}
              onChange={(e) => setBulkVal(e.target.value)}
              className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="">Select Status</option>
              {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          {bulkField === 'owner' && (
            <select
              value={bulkVal}
              onChange={(e) => setBulkVal(e.target.value)}
              className="w-full text-sm font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="">Select Owner</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          )}

          {bulkField === 'tags' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apply tag names</label>
              <Input
                value={bulkTagsText}
                onChange={(e) => setBulkTagsText(e.target.value)}
                placeholder="Enterprise, VIP, Hot Lead"
                className="rounded-xl border-slate-200 bg-white"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setBulkActionOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdateSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Save bulk updates
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXPORT OPTIONS MODAL */}
      <Modal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export CRM Dataset"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {['csv', 'xlsx', 'pdf'].map(type => (
                <button
                  key={type}
                  onClick={() => setExportType(type as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                    exportType === type ? 'border-blue-500 bg-blue-50/20 text-blue-600' : 'border-slate-200 text-slate-500 bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scope Selection</label>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value as any)}
              className="w-full text-xs font-bold border border-slate-200 bg-white rounded-xl p-2.5 focus:outline-none"
            >
              <option value="all">All Records ({statistics?.totalLeads})</option>
              <option value="selected" disabled={selectedIds.length === 0}>
                Selected Rows ({selectedIds.length})
              </option>
              <option value="filtered">Filtered Results</option>
              <option value="page">Current Page Leads</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="glass" size="sm" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExportSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
            >
              Download Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV IMPORT WIZARD MODAL */}
      <Modal
        isOpen={importOpen}
        onClose={() => {
          setImportOpen(false);
          setImportStep(1);
          setImportResult(null);
        }}
        title="Field Mapping Lead Import Wizard"
        size="md"
      >
        <div className="space-y-4">
          {importStep === 1 && (
            <div className="space-y-4 py-3 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-6">
              <FileUp className="mx-auto text-slate-400" size={32} />
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">Upload CSV Lead Data</span>
                <span className="text-[10px] text-slate-400 block">Accepts general columns and maps them</span>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csv-upload-input"
              />
              <Button
                onClick={() => document.getElementById('csv-upload-input')?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-5"
              >
                Browse CSV File
              </Button>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Map CRM Fields to CSV Column Headers
              </span>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {Object.keys(fieldMapping).map((schemaKey) => (
                  <div key={schemaKey} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-550 capitalize">{schemaKey.replace(/([A-Z])/g, ' $1')}</label>
                    <select
                      value={fieldMapping[schemaKey]}
                      onChange={(e) =>
                        setFieldMapping((prev) => ({ ...prev, [schemaKey]: e.target.value }))
                      }
                      className="w-full text-xs font-semibold border border-slate-200 focus:border-blue-400 bg-white rounded-xl p-2 focus:outline-none"
                    >
                      <option value="">Ignore column</option>
                      {importHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="glass" size="sm" onClick={() => setImportStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Import & Validate
                </Button>
              </div>
            </div>
          )}

          {importStep === 3 && (
            <div className="space-y-4">
              {importResult?.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-750 text-xs font-bold space-y-1">
                  <span>Import failed and was completely rolled back:</span>
                  <span className="block font-mono text-[10px] font-semibold">{importResult.error}</span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold space-y-1.5">
                  <span className="block text-sm">✓ Import operation finished successfully!</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold mt-1 text-emerald-650">
                    <div>Leads Imported: {importResult?.successCount || 0}</div>
                    <div>Duplicate warnings linked: {importResult?.duplicateCount || 0}</div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setImportOpen(false);
                    setImportStep(1);
                    setImportResult(null);
                    fetchLeads();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                >
                  Finish
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* MERGE DUPLICATES SIDE-BY-SIDE VIEW MODAL */}
      <Modal
        isOpen={mergeOpen}
        onClose={() => setMergeOpen(false)}
        title="Merge Duplicate Lead Records"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Consolidating records will transfer all attachments, timelines, notes, and activity records to the primary lead record. Secondary leads will be soft-deleted.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Name</label>
              <Input
                value={mergedFields.firstName || ''}
                onChange={(e) => setMergedFields({ ...mergedFields, firstName: e.target.value })}
                className="rounded-xl border-slate-200 text-xs bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Name</label>
              <Input
                value={mergedFields.lastName || ''}
                onChange={(e) => setMergedFields({ ...mergedFields, lastName: e.target.value })}
                className="rounded-xl border-slate-200 text-xs bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <Input
                value={mergedFields.email || ''}
                onChange={(e) => setMergedFields({ ...mergedFields, email: e.target.value })}
                className="rounded-xl border-slate-200 text-xs bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
              <Input
                value={mergedFields.phone || ''}
                onChange={(e) => setMergedFields({ ...mergedFields, phone: e.target.value })}
                className="rounded-xl border-slate-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="glass" size="sm" onClick={() => setMergeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMergeSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs py-2 px-5"
            >
              Confirm Merge Operations
            </Button>
          </div>
        </div>
      </Modal>

      {/* Single delete lead modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Confirm Lead Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete this lead? All associated activity logs and notes will be permanently archived.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;
export { Leads };
