import React, { useEffect, useState } from 'react';
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
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Priority badge colors
const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

// Quick filter definitions
const quickFilters = [
  { label: 'All Leads', key: 'all', icon: Users2 },
  { label: 'New', key: 'new', icon: Plus },
  { label: 'Qualified', key: 'qualified', icon: Target },
  { label: 'Won', key: 'won', icon: Trophy },
  { label: 'Lost', key: 'lost', icon: XCircle },
  { label: 'High Priority', key: 'high-priority', icon: TrendingUp },
];

const Leads: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    leads,
    statistics,
    statuses,
    loading,
    error,
    filters,
    pagination,
    fetchLeads,
    fetchStatistics,
    fetchStatuses,
    setFilters,
    setPage,
    setSort,
    deleteLead,
    clearError,
  } = useLeadStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [colVisibility, setColVisibility] = useState<Record<string, boolean>>({
    leadNumber: true,
    fullName: true,
    companyName: true,
    email: true,
    phone: true,
    status: true,
    priority: true,
    assignedTo: true,
    source: true,
    value: true,
    expectedClosingDate: false,
    createdAt: true,
    actions: true,
  });
  const [showColMenu, setShowColMenu] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchStatistics();
    fetchStatuses();
  }, []);

  // Search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search: searchQuery || undefined });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleQuickFilter = (key: string) => {
    setActiveQuickFilter(key);
    if (key === 'all') {
      setFilters({ status: undefined, priority: undefined });
    } else if (key === 'high-priority') {
      setFilters({ status: undefined, priority: 'High' });
    } else {
      const matchedStatus = statuses.find(
        (s) => s.name.toLowerCase() === key.toLowerCase()
      );
      if (matchedStatus) {
        setFilters({ status: matchedStatus.id, priority: undefined });
      }
    }
  };

  const handleSort = (column: string) => {
    const currentSort = filters.sortBy;
    const currentDir = filters.sortDir || 'desc';
    if (currentSort === column) {
      setSort(column, currentDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column, 'desc');
    }
  };

  const handleDeleteConfirm = async () => {
    if (leadToDelete) {
      await deleteLead(leadToDelete);
      setDeleteModalOpen(false);
      setLeadToDelete(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
          />
        ))}
      </div>
    );
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column)
      return <div className="w-3.5 h-3.5" />;
    return filters.sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-brand-600" />
    ) : (
      <ChevronDown size={14} className="text-brand-600" />
    );
  };

  const breadcrumbs = [{ label: 'Leads' }];

  const columns = [
    { key: 'leadNumber', label: 'Lead #', sortable: true },
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'assignedTo', label: 'Owner', sortable: false },
    { key: 'source', label: 'Source', sortable: false },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'expectedClosingDate', label: 'Expected Close', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const visibleColumns = columns.filter((c) => colVisibility[c.key]);

  // Statistics cards
  const statsCards = [
    {
      label: 'Total Leads',
      value: statistics?.totalLeads ?? 0,
      icon: Users2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Qualified',
      value: statistics?.qualifiedLeads ?? 0,
      icon: Target,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
    {
      label: 'Won',
      value: statistics?.wonLeads ?? 0,
      icon: Trophy,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Lost',
      value: statistics?.lostLeads ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Conversion',
      value: `${statistics?.conversionRate ?? 0}%`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Avg. Value',
      value: `$${(statistics?.averageValue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Lead Management
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Track and manage your sales pipeline prospects
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/leads/new')}
            className="flex items-center gap-2 shadow-md"
          >
            <Plus size={16} />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((card) => (
          <Card key={card.label} className="p-4 hover:shadow-glossy-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={15} className="text-slate-400 mr-1" />
        {quickFilters.map((qf) => (
          <button
            key={qf.key}
            onClick={() => handleQuickFilter(qf.key)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border
              ${
                activeQuickFilter === qf.key
                  ? 'bg-brand-550 text-white border-brand-550 shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }
            `}
          >
            <qf.icon size={13} />
            {qf.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Search & Column Visibility Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Input
            icon={<Search size={16} />}
            placeholder="Search leads by name, email, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 pl-9 rounded-xl border-slate-200/80 bg-white"
          />
        </div>
        <div className="relative ml-auto">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowColMenu(!showColMenu)}
            className="flex items-center gap-2 border-slate-200/80 hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} />
            Columns
          </Button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-slate-100 shadow-glossy-md p-2 z-20">
                <p className="text-xs font-semibold text-slate-400 px-2 py-1.5 uppercase tracking-wide">
                  Toggle Columns
                </p>
                <div className="h-px bg-slate-100 my-1" />
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {columns
                    .filter((c) => c.key !== 'actions')
                    .map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={colVisibility[col.key]}
                          onChange={(e) =>
                            setColVisibility((prev) => ({
                              ...prev,
                              [col.key]: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-brand-550 focus:ring-brand-100"
                        />
                        {col.label}
                      </label>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      {loading && leads.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          title="No Leads Found"
          description={
            searchQuery || activeQuickFilter !== 'all'
              ? 'No leads match your current filters. Try adjusting your search or filters.'
              : 'Start building your pipeline by adding your first lead.'
          }
          icon={<Users2 className="w-12 h-12 text-slate-300" />}
          actionLabel={!searchQuery && activeQuickFilter === 'all' ? 'Create Lead' : undefined}
          onAction={
            !searchQuery && activeQuickFilter === 'all'
              ? () => navigate('/leads/new')
              : undefined
          }
        />
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/70 backdrop-blur-md shadow-glossy-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70">
                    {visibleColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none ${
                          col.sortable ? 'cursor-pointer hover:text-slate-700' : ''
                        } sticky top-0 bg-slate-50/70 backdrop-blur-sm`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.sortable && <SortIcon column={col.key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      {colVisibility.leadNumber && (
                        <td className="py-3.5 px-4 text-sm font-mono text-slate-500">
                          {lead.leadNumber}
                        </td>
                      )}
                      {colVisibility.fullName && (
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {lead.fullName}
                            </p>
                            {lead.jobTitle && (
                              <p className="text-xs text-slate-400">{lead.jobTitle}</p>
                            )}
                          </div>
                        </td>
                      )}
                      {colVisibility.companyName && (
                        <td className="py-3.5 px-4 text-sm text-slate-600">
                          {lead.companyName || '—'}
                        </td>
                      )}
                      {colVisibility.email && (
                        <td className="py-3.5 px-4 text-sm text-slate-600">
                          {lead.email || '—'}
                        </td>
                      )}
                      {colVisibility.phone && (
                        <td className="py-3.5 px-4 text-sm text-slate-600">
                          {lead.phone || '—'}
                        </td>
                      )}
                      {colVisibility.status && (
                        <td className="py-3.5 px-4">
                          {lead.status ? (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border"
                              style={{
                                backgroundColor: `${lead.status.color}15`,
                                color: lead.status.color,
                                borderColor: `${lead.status.color}30`,
                              }}
                            >
                              {lead.status.name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      )}
                      {colVisibility.priority && (
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              priorityColors[lead.priority] || priorityColors.Medium
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </td>
                      )}
                      {colVisibility.assignedTo && (
                        <td className="py-3.5 px-4 text-sm text-slate-600">
                          {lead.assignedTo
                            ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                            : '—'}
                        </td>
                      )}
                      {colVisibility.source && (
                        <td className="py-3.5 px-4 text-sm text-slate-600">
                          {lead.source?.name || '—'}
                        </td>
                      )}
                      {colVisibility.value && (
                        <td className="py-3.5 px-4 text-sm font-semibold text-slate-700">
                          ${lead.value.toLocaleString()}
                        </td>
                      )}
                      {colVisibility.expectedClosingDate && (
                        <td className="py-3.5 px-4 text-sm text-slate-500">
                          {lead.expectedClosingDate
                            ? new Date(lead.expectedClosingDate).toLocaleDateString()
                            : '—'}
                        </td>
                      )}
                      {colVisibility.createdAt && (
                        <td className="py-3.5 px-4 text-sm text-slate-500">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      )}
                      {colVisibility.actions && (
                        <td className="py-3.5 px-4">
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="View"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => navigate(`/leads/${lead.id}/edit`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setLeadToDelete(lead.id);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 text-slate-500">
            <div className="text-xs font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
              {pagination.totalItems} leads
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
              >
                <ChevronsLeft size={16} />
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-200/80">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => setPage(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border-slate-200/80 hover:bg-slate-50"
              >
                <ChevronsRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLeadToDelete(null);
        }}
        title="Delete Lead"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this lead? This action can be undone later if needed.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                setLeadToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;
