import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Plus, Filter, Edit2, Trash2,
  Building2, Globe, MapPin, Mail, ChevronLeft, ChevronRight,
  Eye, SlidersHorizontal, Users, TrendingUp, Star,
  DollarSign, Archive, X
} from 'lucide-react';
import { useCompanyStore } from '../store/companyStore';
import { useToast } from '../components/ui/ToastProvider';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

export const Companies: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    companies, statistics, loading, filters, pagination, selectedIds,
    employees, fetchCompanies, fetchStatistics, fetchEmployees,
    deleteCompany, bulkUpdateStatus, bulkUpdateOwner,
    setFilters, setPage, toggleSelection, toggleAllSelection, clearSelection
  } = useCompanyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkOwnerModal, setShowBulkOwnerModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('Prospect');
  const [bulkOwnerId, setBulkOwnerId] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    companyNumber: true, name: true, industry: true, primaryEmail: true,
    owner: true, status: true, annualRevenue: true, employeeCount: true,
    country: true, createdAt: true,
  });

  const columnLabels: Record<string, string> = {
    companyNumber: 'Code', name: 'Company Name', industry: 'Industry',
    primaryEmail: 'Email', owner: 'Owner', status: 'Status',
    annualRevenue: 'Revenue', employeeCount: 'Employees',
    country: 'Country', createdAt: 'Created',
  };

  const quickTabs = [
    { id: 'all', label: 'All Companies', icon: Building2, filter: {} },
    { id: 'my', label: 'My Companies', icon: Users, filter: { myCompaniesOnly: true } },
    { id: 'customers', label: 'Customers', icon: Star, filter: { customersOnly: true } },
    { id: 'partners', label: 'Partners', icon: TrendingUp, filter: { partnersOnly: true } },
    { id: 'prospects', label: 'Prospects', icon: Users, filter: { prospectsOnly: true } },
    { id: 'recent', label: 'Recently Added', icon: Plus, filter: { recentlyAdded: true } },
    { id: 'high_revenue', label: 'High Revenue', icon: DollarSign, filter: { highRevenue: true } },
    { id: 'high_priority', label: 'High Priority', icon: Star, filter: { highPriority: true } },
    { id: 'archived', label: 'Archived', icon: Archive, filter: { archivedOnly: true } },
  ];

  useEffect(() => {
    fetchCompanies();
    fetchStatistics();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [pagination.page, filters]);

  useEffect(() => {
    const resetTabFilters = {
      myCompaniesOnly: undefined,
      customersOnly: undefined,
      partnersOnly: undefined,
      prospectsOnly: undefined,
      recentlyAdded: undefined,
      highRevenue: undefined,
      highPriority: undefined,
      archivedOnly: undefined,
    };
    if (activeTab === 'all') {
      setFilters(resetTabFilters);
    } else {
      const tab = quickTabs.find(t => t.id === activeTab);
      if (tab) {
        setFilters({ ...resetTabFilters, ...tab.filter });
      }
    }
  }, [activeTab]);

  const handleSearch = () => {
    setFilters({ search: searchQuery || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete company "${name}"?`)) {
      try {
        await deleteCompany(id);
        toast.success('Company Deleted', `${name} has been deleted.`);
        fetchStatistics();
      } catch {
        toast.error('Delete Failed', 'Failed to delete company.');
      }
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      await bulkUpdateStatus(selectedIds, bulkStatus);
      toast.success('Status Updated', `${selectedIds.length} companies updated.`);
      setShowBulkStatusModal(false);
      clearSelection();
      fetchStatistics();
    } catch {
      toast.error('Failed', 'Bulk status update failed.');
    }
  };

  const handleBulkOwnerUpdate = async () => {
    try {
      await bulkUpdateOwner(selectedIds, bulkOwnerId);
      toast.success('Owner Updated', `${selectedIds.length} companies reassigned.`);
      setShowBulkOwnerModal(false);
      clearSelection();
    } catch {
      toast.error('Failed', 'Bulk owner update failed.');
    }
  };

  const formatRevenue = (val?: number) => {
    if (!val) return '-';
    if (val >= 10000000) return `$${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `$${(val / 100000).toFixed(1)}L`;
    return `$${(val / 1000).toFixed(0)}K`;
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      'Customer': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'Partner': 'bg-blue-50 text-blue-700 border-blue-100',
      'Prospect': 'bg-amber-50 text-amber-700 border-amber-100',
      'Vendor': 'bg-purple-50 text-purple-700 border-purple-100',
      'Supplier': 'bg-teal-50 text-teal-700 border-teal-100',
      'Distributor': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'Inactive': 'bg-slate-50 text-slate-600 border-slate-200',
      'Archived': 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return map[status] || 'bg-slate-50 text-slate-650 border-slate-200';
  };

  const filteredEmployees = employees;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[{ label: 'Companies' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Companies</h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkStatusModal(true)}
                className="text-xs"
              >
                Update Status ({selectedIds.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBulkOwnerModal(true)}
                className="text-xs"
              >
                Reassign Owner ({selectedIds.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="text-xs"
              >
                <X size={14} /> Clear
              </Button>
            </>
          )}
          <Button
            onClick={() => navigate('/companies/new')}
            size="sm"
            className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy"
          >
            <Plus size={14} />
            <span>Add Company</span>
          </Button>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total', value: statistics.total, color: 'text-slate-800' },
            { label: 'Customers', value: statistics.customers, color: 'text-emerald-600' },
            { label: 'Partners', value: statistics.partners, color: 'text-blue-600' },
            { label: 'Prospects', value: statistics.prospects, color: 'text-amber-600' },
            { label: 'High Revenue', value: statistics.highRevenue, color: 'text-purple-600' },
            { label: 'Active', value: statistics.active, color: 'text-teal-600' },
            { label: 'Inactive', value: statistics.inactive, color: 'text-slate-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-slate-150 rounded-2xl p-3 shadow-glossy-sm text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-lg font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-150 rounded-3xl shadow-glossy-lg overflow-hidden">
        <div className="p-1.5 bg-slate-50/30 border-b border-slate-100 flex gap-1 overflow-x-auto no-scrollbar">
          {quickTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-glossy-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={handleSearch} className="text-xs">
              <Search size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showFilterPanel ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="text-xs"
            >
              <Filter size={14} />
              Filters
            </Button>
            <div className="relative group">
              <Button variant="secondary" size="sm" className="text-xs">
                <SlidersHorizontal size={14} />
                Columns
              </Button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-150 rounded-2xl p-3 shadow-glossy-lg z-30 hidden group-hover:block min-w-[160px]">
                {Object.entries(columnLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 py-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(visibleColumns as any)[key]}
                      onChange={() => setVisibleColumns((prev) => ({ ...prev, [key]: !(prev as any)[key] }))}
                      className="rounded border-slate-350 text-brand-550 focus:ring-brand-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showFilterPanel && (
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ status: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="">All</option>
                <option value="Prospect">Prospect</option>
                <option value="Customer">Customer</option>
                <option value="Partner">Partner</option>
                <option value="Vendor">Vendor</option>
                <option value="Supplier">Supplier</option>
                <option value="Distributor">Distributor</option>
                <option value="Inactive">Inactive</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Industry</label>
              <input
                type="text"
                placeholder="e.g. Technology"
                value={filters.industry || ''}
                onChange={(e) => setFilters({ industry: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Country</label>
              <input
                type="text"
                placeholder="e.g. USA"
                value={filters.country || ''}
                onChange={(e) => setFilters({ country: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ priority: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Min Revenue</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minRevenue || ''}
                onChange={(e) => setFilters({ minRevenue: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Max Revenue</label>
              <input
                type="number"
                placeholder="999999999"
                value={filters.maxRevenue || ''}
                onChange={(e) => setFilters({ maxRevenue: e.target.value || undefined })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              />
            </div>
            {Object.keys(filters).some(k => filters[k as keyof typeof filters]) && (
              <div className="col-span-full flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilters({}); setActiveTab('all'); }}
                  className="text-xs text-rose-600"
                >
                  <X size={14} /> Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title={searchQuery || Object.keys(filters).length > 0 ? 'No Matches Found' : 'No Companies Registered'}
              description={
                searchQuery || Object.keys(filters).length > 0
                  ? 'Adjust your search or filter criteria.'
                  : 'Create your first company account to start managing business relationships.'
              }
              icon={<Building2 className="w-12 h-12 text-slate-300" />}
              actionLabel={!searchQuery && Object.keys(filters).length === 0 ? 'Add Company' : undefined}
              onAction={() => navigate('/companies/new')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none sticky top-0">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === companies.length && companies.length > 0}
                      onChange={toggleAllSelection}
                      className="rounded border-slate-350 text-brand-550 focus:ring-brand-500"
                    />
                  </th>
                  {visibleColumns.companyNumber && <th className="px-4 py-3">Code</th>}
                  {visibleColumns.name && <th className="px-4 py-3">Company Name</th>}
                  {visibleColumns.industry && <th className="px-4 py-3">Industry</th>}
                  {visibleColumns.primaryEmail && <th className="px-4 py-3">Email</th>}
                  {visibleColumns.owner && <th className="px-4 py-3">Owner</th>}
                  {visibleColumns.status && <th className="px-4 py-3 text-center">Status</th>}
                  {visibleColumns.annualRevenue && <th className="px-4 py-3 text-right">Revenue</th>}
                  {visibleColumns.employeeCount && <th className="px-4 py-3 text-right">Employees</th>}
                  {visibleColumns.country && <th className="px-4 py-3">Country</th>}
                  {visibleColumns.createdAt && <th className="px-4 py-3">Created</th>}
                  <th className="px-4 py-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(company.id)}
                        onChange={() => toggleSelection(company.id)}
                        className="rounded border-slate-350 text-brand-550 focus:ring-brand-500"
                      />
                    </td>
                    {visibleColumns.companyNumber && (
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{company.companyNumber}</span>
                      </td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-4 py-3">
                        <Link to={`/companies/${company.id}`} className="flex items-center gap-2.5 group">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-xs text-brand-650 uppercase flex-shrink-0">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                              {company.displayName || company.name}
                            </p>
                            {company.website && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Globe size={10} /> {company.website}
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>
                    )}
                    {visibleColumns.industry && (
                      <td className="px-4 py-3">
                        <span className="text-slate-650">{company.industry || '-'}</span>
                      </td>
                    )}
                    {visibleColumns.primaryEmail && (
                      <td className="px-4 py-3">
                        {company.primaryEmail ? (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail size={11} className="text-slate-400" />
                            {company.primaryEmail}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    {visibleColumns.owner && (
                      <td className="px-4 py-3">
                        {company.owner ? (
                          <span className="text-slate-650 font-semibold">
                            {company.owner.firstName} {company.owner.lastName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.annualRevenue && (
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        {formatRevenue(company.annualRevenue)}
                      </td>
                    )}
                    {visibleColumns.employeeCount && (
                      <td className="px-4 py-3 text-right text-slate-500">
                        {company.employeeCount?.toLocaleString() || '-'}
                      </td>
                    )}
                    {visibleColumns.country && (
                      <td className="px-4 py-3">
                        {company.country ? (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-slate-400" />
                            {company.country}
                          </span>
                        ) : '-'}
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Link
                          to={`/companies/${company.id}`}
                          className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-slate-400 transition-colors"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/companies/${company.id}/edit`}
                          className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg text-slate-400 transition-colors"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(company.id, company.name)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                        >
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

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, pagination.page - 2);
                const pageNum = start + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      pageNum === pagination.page
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Bulk Update Status</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">{selectedIds.length} companies selected.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">New Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  {['Prospect', 'Customer', 'Partner', 'Vendor', 'Supplier', 'Distributor', 'Inactive', 'Archived'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowBulkStatusModal(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleBulkStatusUpdate} className="text-xs">Update Status</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Reassign Owner</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">{selectedIds.length} companies selected.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">New Owner</label>
                <select
                  value={bulkOwnerId}
                  onChange={(e) => setBulkOwnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="">Select owner...</option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowBulkOwnerModal(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleBulkOwnerUpdate} disabled={!bulkOwnerId} className="text-xs">Reassign</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
