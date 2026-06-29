import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Edit2,
  Trash2,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Globe,
  Contact as ContactIcon,
  Sparkles,
  Archive,
  ChevronLeft,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Tags,
  CheckSquare,
  Square
} from 'lucide-react';

import { useContactStore } from '../store/contactStore';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/ToastProvider';
import { Button } from '../components/ui/Button';
import { Breadcrumb } from '../components/ui/Breadcrumb';

// Validation for form
const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  profilePhoto: z.string().url('Invalid image URL').optional().or(z.literal('')),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  jobTitle: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  companyId: z.string().optional(),
  leadId: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  secondaryEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  whatsApp: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  status: z.string().default('Active'),
  ownerId: z.string().optional(),
  preferredLanguage: z.string().default('en'),
  preferredContactMethod: z.string().default('Email'),
  timezone: z.string().default('UTC'),
  description: z.string().max(5000).optional(),
});

type ContactFormFields = z.infer<typeof contactFormSchema>;

export const Contacts: React.FC = () => {
  const toast = useToast();
  const { user } = useAuthStore();
  const {
    contacts,
    statistics,
    loading,
    error,
    filters,
    pagination,
    selectedIds,
    employees,
    companies,
    leads,
    fetchContacts,
    fetchStatistics,
    fetchEmployees,
    fetchCompanies,
    fetchLeads,
    createContact,
    updateContact,
    deleteContact,
    bulkUpdateStatus,
    bulkUpdateOwner,
    setFilters,
    setPage,
    toggleSelection,
    toggleAllSelection,
    clearSelection
  } = useContactStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkOwnerModal, setShowBulkOwnerModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('Active');
  const [bulkOwnerId, setBulkOwnerId] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'professional' | 'communication' | 'address' | 'social' | 'preferences'>('basic');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [visibleColumns, setVisibleColumns] = useState({
    contactNumber: true,
    photo: true,
    name: true,
    company: true,
    email: true,
    phone: true,
    owner: true,
    status: true,
    createdAt: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isDirty }
  } = useForm<ContactFormFields>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      status: 'Active',
      preferredLanguage: 'en',
      preferredContactMethod: 'Email',
      timezone: 'UTC'
    }
  });

  // Load initial data
  useEffect(() => {
    fetchContacts();
    fetchStatistics();
    fetchEmployees();
    fetchCompanies();
    fetchLeads();
  }, []);

  // Sync quick filters tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newFilters: Record<string, any> = {
      vip: tab === 'vip' ? true : undefined,
      recentlyAdded: tab === 'recently' ? true : undefined,
      customerOnly: tab === 'customer' ? true : undefined,
      partnerOnly: tab === 'partner' ? true : undefined,
      inactiveOnly: tab === 'inactive' ? true : undefined,
      archivedOnly: tab === 'archived' ? true : undefined,
      myContactsOnly: tab === 'my' ? true : undefined,
      status: undefined, // Reset explicit dropdown status filter
    };
    setFilters(newFilters);
  };

  // Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  // Autosave draft form to localStorage
  const formValues = watch();
  useEffect(() => {
    if (showAddEditModal && !editingContactId && isDirty) {
      localStorage.setItem('flowcrm_contact_draft', JSON.stringify({ values: formValues, tags: formTags }));
    }
  }, [formValues, formTags, showAddEditModal, editingContactId, isDirty]);

  // Load draft
  const loadDraft = () => {
    const draft = localStorage.getItem('flowcrm_contact_draft');
    if (draft) {
      try {
        const { values, tags } = JSON.parse(draft);
        reset(values);
        setFormTags(tags || []);
        toast.info('Draft Restored', 'We loaded your unsaved draft values.');
      } catch (err) {
        console.error('Failed to parse draft', err);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('flowcrm_contact_draft');
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingContactId(null);
    reset({
      firstName: '',
      middleName: '',
      lastName: '',
      profilePhoto: '',
      gender: '',
      dateOfBirth: '',
      jobTitle: '',
      department: '',
      companyId: '',
      leadId: '',
      email: '',
      secondaryEmail: '',
      phone: '',
      alternatePhone: '',
      whatsApp: '',
      website: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      country: '',
      state: '',
      city: '',
      postalCode: '',
      addressLine1: '',
      addressLine2: '',
      status: 'Active',
      ownerId: employees[0]?.id || '',
      preferredLanguage: 'en',
      preferredContactMethod: 'Email',
      timezone: 'UTC',
      description: '',
    });
    setFormTags([]);
    setActiveFormTab('basic');
    setShowAddEditModal(true);
    
    // Suggest loading draft if exists
    if (localStorage.getItem('flowcrm_contact_draft')) {
      setTimeout(() => {
        if (confirm('You have an unsaved draft. Would you like to load it?')) {
          loadDraft();
        }
      }, 300);
    }
  };

  // Open modal for Edit
  const handleOpenEdit = (contact: any) => {
    setEditingContactId(contact.id);
    reset({
      firstName: contact.firstName,
      middleName: contact.middleName || '',
      lastName: contact.lastName,
      profilePhoto: contact.profilePhoto || '',
      gender: contact.gender || '',
      dateOfBirth: contact.dateOfBirth ? new Date(contact.dateOfBirth).toISOString().split('T')[0] : '',
      jobTitle: contact.jobTitle || '',
      department: contact.department || '',
      companyId: contact.companyId || '',
      leadId: contact.leadId || '',
      email: contact.email || '',
      secondaryEmail: contact.secondaryEmail || '',
      phone: contact.phone || '',
      alternatePhone: contact.alternatePhone || '',
      whatsApp: contact.whatsApp || '',
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      twitter: contact.twitter || '',
      facebook: contact.facebook || '',
      instagram: contact.instagram || '',
      country: contact.country || '',
      state: contact.state || '',
      city: contact.city || '',
      postalCode: contact.postalCode || '',
      addressLine1: contact.addressLine1 || '',
      addressLine2: contact.addressLine2 || '',
      status: contact.status,
      ownerId: contact.ownerId || '',
      preferredLanguage: contact.preferredLanguage || 'en',
      preferredContactMethod: contact.preferredContactMethod || 'Email',
      timezone: contact.timezone || 'UTC',
      description: contact.description || '',
    });
    setFormTags(contact.tags || []);
    setActiveFormTab('basic');
    setShowAddEditModal(true);
  };

  // Save Contact
  const onSubmitContact = async (data: ContactFormFields) => {
    try {
      const payload = {
        ...data,
        tags: formTags,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined,
      };

      if (editingContactId) {
        await updateContact(editingContactId, payload);
        toast.success('Contact Updated', 'Contact updated successfully.');
      } else {
        await createContact(payload);
        toast.success('Contact Created', 'New contact added successfully.');
        clearDraft();
      }
      setShowAddEditModal(false);
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        serverErrors.forEach((e: any) => {
          if (e.field) setError(e.field as any, { message: e.message });
        });
      } else {
        toast.error('Operation Failed', err.response?.data?.message || 'Error occurred while saving contact');
      }
    }
  };

  // Soft delete contact
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteContact(id);
        toast.success('Contact Deleted', `${name} deleted successfully.`);
      } catch (err) {
        toast.error('Deletion Failed', 'Failed to delete contact.');
      }
    }
  };

  // Tag list support
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setFormTags(formTags.filter((tag) => tag !== t));
  };

  // Bulk operation actions
  const handleBulkStatusSubmit = async () => {
    try {
      await bulkUpdateStatus(selectedIds, bulkStatus);
      toast.success('Bulk Status Updated', `Updated status to ${bulkStatus} for selected contacts.`);
      setShowBulkStatusModal(false);
      clearSelection();
    } catch (err) {
      toast.error('Bulk Update Failed', 'Failed to bulk update status.');
    }
  };

  const handleBulkOwnerSubmit = async () => {
    try {
      await bulkUpdateOwner(selectedIds, bulkOwnerId);
      toast.success('Bulk Owner Assigned', `Owner assigned successfully.`);
      setShowBulkOwnerModal(false);
      clearSelection();
    } catch (err) {
      toast.error('Bulk Update Failed', 'Failed to bulk update owner.');
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast.info('No Data', 'There is no contact record to export.');
      return;
    }

    const headers = ['Contact Number', 'Full Name', 'Job Title', 'Department', 'Company', 'Email', 'Phone', 'Owner', 'Status', 'Created At'];
    const rows = contacts.map(c => [
      c.contactNumber,
      c.fullName,
      c.jobTitle || '',
      c.department || '',
      c.company?.name || '',
      c.email || '',
      c.phone || '',
      c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : '',
      c.status,
      new Date(c.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success('Export Successful', 'Contacts CSV file downloaded.');
  };

  // Badge styler helper
  const getStatusBadge = (status: string) => {
    let classes = 'bg-slate-100 text-slate-700 border-slate-200';
    switch (status) {
      case 'Active':
        classes = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Inactive':
        classes = 'bg-rose-50 text-rose-700 border-rose-200';
        break;
      case 'VIP':
        classes = 'bg-purple-50 text-purple-700 border-purple-200';
        break;
      case 'Prospect':
        classes = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'Customer':
        classes = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Partner':
        classes = 'bg-teal-50 text-teal-700 border-teal-200';
        break;
      case 'Vendor':
        classes = 'bg-cyan-50 text-cyan-700 border-cyan-200';
        break;
      case 'Former Customer':
        classes = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'Archived':
        classes = 'bg-slate-100 text-slate-600 border-slate-350';
        break;
    }
    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-bold border rounded-full ${classes}`}>
        {status}
      </span>
    );
  };

  // Determine if all selected on page
  const allIdsOnPage = contacts.map(c => c.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedIds.includes(id));

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={[{ label: 'Contacts' }]} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              <ContactIcon className="w-6 h-6 text-brand-550" />
              Contacts Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your customer book, corporate relationships, partners, and communications.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
            >
              <Download size={14} />
              Export CSV
            </Button>
            <Button
              onClick={handleOpenCreate}
              className="bg-brand-550 hover:bg-brand-600 text-white font-bold text-xs py-2 rounded-xl flex items-center gap-1.5 shadow-glossy shadow-brand-100"
            >
              <Plus size={14} />
              Add Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Contacts</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{statistics.totalContacts}</h3>
          </div>
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Contacts</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{statistics.activeContacts}</h3>
          </div>
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">VIP Contacts</span>
            <h3 className="text-xl font-bold text-purple-700 mt-1">{statistics.vipContacts}</h3>
          </div>
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Customers</span>
            <h3 className="text-xl font-bold text-blue-700 mt-1">{statistics.customerContacts}</h3>
          </div>
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Partners</span>
            <h3 className="text-xl font-bold text-teal-700 mt-1">{statistics.partnerContacts}</h3>
          </div>
          <div className="bg-white/80 border border-slate-100/80 p-4 rounded-2xl shadow-glossy shadow-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Recently Added</span>
            <h3 className="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1">
              {statistics.recentlyAdded}
              <Sparkles size={12} className="text-emerald-500 animate-pulse" />
            </h3>
          </div>
        </div>
      )}

      {/* Main Glass Workspace */}
      <div className="bg-white/80 border border-slate-150 rounded-3xl shadow-glossy-lg overflow-hidden">
        
        {/* Quick Filter tabs bar */}
        <div className="border-b border-slate-100 px-6 py-2 bg-slate-50/50 flex flex-wrap gap-2 items-center">
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'my', label: 'My Contacts' },
            { id: 'vip', label: 'VIP' },
            { id: 'customer', label: 'Customers' },
            { id: 'partner', label: 'Partners' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'recently', label: 'Recently Added' },
            { id: 'archived', label: 'Archived' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold transition-all rounded-xl border ${
                activeTab === tab.id
                  ? 'bg-white border-slate-200 text-brand-600 shadow-glossy-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="p-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-brand-100/50 focus:border-brand-550 transition-all text-xs font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Owner dropdown filter */}
            <select
              value={filters.owner || ''}
              onChange={(e) => setFilters({ owner: e.target.value || undefined })}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white"
            >
              <option value="">All Owners</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>

            {/* Status dropdown filter */}
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="VIP">VIP</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Partner">Partner</option>
              <option value="Vendor">Vendor</option>
              <option value="Former Customer">Former Customer</option>
              <option value="Archived">Archived</option>
            </select>

            {/* Clear Filters */}
            {(filters.search || filters.status || filters.owner || filters.vip || filters.customerOnly || filters.partnerOnly || filters.inactiveOnly || filters.archivedOnly || filters.myContactsOnly || filters.recentlyAdded) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setFilters({
                    search: undefined,
                    status: undefined,
                    owner: undefined,
                    vip: undefined,
                    recentlyAdded: undefined,
                    customerOnly: undefined,
                    partnerOnly: undefined,
                    inactiveOnly: undefined,
                    archivedOnly: undefined,
                    myContactsOnly: undefined,
                  });
                }}
                className="text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="mx-6 mb-4 p-3 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center justify-between animate-fade-in">
            <span className="text-xs text-brand-700 font-bold">
              {selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowBulkStatusModal(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                Change Status
              </Button>
              <Button
                onClick={() => setShowBulkOwnerModal(true)}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                Assign Owner
              </Button>
              <Button
                variant="ghost"
                onClick={clearSelection}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Deselect
              </Button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="animate-spin text-brand-550 w-8 h-8" />
              <p className="text-xs font-medium">Fetching contacts details...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 select-none">
              <ShieldAlert className="w-12 h-12 text-rose-350 mx-auto mb-3" />
              <h4 className="font-bold text-sm">Failed to Load Contacts</h4>
              <p className="text-xs text-rose-400 mt-1">{error}</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <ContactIcon className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-base font-bold text-slate-800">
                {filters.search ? 'No Search Results' : 'No Contacts Available'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {filters.search 
                  ? 'No records match your query. Try refinement or clearing your searches.'
                  : 'Start building out your business directory. Create contacts to manage records.'}
              </p>
              {!filters.search && (
                <Button
                  onClick={handleOpenCreate}
                  className="bg-brand-550 text-white font-bold text-xs mt-6 px-4 py-2 rounded-xl"
                >
                  Create Contact
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider select-none">
                  <th className="pl-6 py-3 w-10">
                    <button onClick={toggleAllSelection} className="text-slate-400 focus:outline-none">
                      {isAllSelected ? <CheckSquare size={16} className="text-brand-550" /> : <Square size={16} />}
                    </button>
                  </th>
                  {visibleColumns.contactNumber && <th className="px-4 py-3">Number</th>}
                  {visibleColumns.photo && <th className="px-4 py-3 w-12 text-center">Photo</th>}
                  {visibleColumns.name && <th className="px-4 py-3">Name</th>}
                  {visibleColumns.company && <th className="px-4 py-3">Company</th>}
                  {visibleColumns.email && <th className="px-4 py-3">Email</th>}
                  {visibleColumns.phone && <th className="px-4 py-3">Phone</th>}
                  {visibleColumns.owner && <th className="px-4 py-3">Owner</th>}
                  {visibleColumns.status && <th className="px-4 py-3">Status</th>}
                  {visibleColumns.createdAt && <th className="px-6 py-3">Created</th>}
                  <th className="pr-6 py-3 w-16 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-slate-700 text-xs font-medium">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="pl-6 py-4">
                      <button onClick={() => toggleSelection(contact.id)} className="text-slate-400 focus:outline-none">
                        {selectedIds.includes(contact.id) ? <CheckSquare size={16} className="text-brand-550" /> : <Square size={16} />}
                      </button>
                    </td>
                    {visibleColumns.contactNumber && (
                      <td className="px-4 py-4 font-bold text-slate-500 font-mono">
                        {contact.contactNumber}
                      </td>
                    )}
                    {visibleColumns.photo && (
                      <td className="px-4 py-4 text-center">
                        {contact.profilePhoto ? (
                          <img
                            src={contact.profilePhoto}
                            alt={contact.fullName}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-100 shadow-glossy-sm"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-600 uppercase">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <Link
                            to={`/contacts/${contact.id}`}
                            className="font-bold text-slate-800 hover:text-brand-600 transition-colors"
                          >
                            {contact.fullName}
                          </Link>
                          {contact.jobTitle && (
                            <span className="text-[10px] text-slate-400 font-semibold">{contact.jobTitle}</span>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.company && (
                      <td className="px-4 py-4 text-slate-600">
                        {contact.company?.name || <span className="text-slate-300 font-semibold">-</span>}
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className="px-4 py-4 text-slate-500 font-medium">
                        {contact.email || <span className="text-slate-350">-</span>}
                      </td>
                    )}
                    {visibleColumns.phone && (
                      <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">
                        {contact.phone || <span className="text-slate-350">-</span>}
                      </td>
                    )}
                    {visibleColumns.owner && (
                      <td className="px-4 py-4 text-slate-600 font-medium">
                        {contact.owner ? `${contact.owner.firstName} ${contact.owner.lastName}` : <span className="text-slate-300 font-semibold">-</span>}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-4">
                        {getStatusBadge(contact.status)}
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="px-6 py-4 text-slate-400 font-semibold whitespace-nowrap">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                    )}
                    <td className="pr-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors inline-block"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(contact)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id, contact.fullName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Row */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} items)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
                className="p-1 border-slate-200 rounded-lg bg-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
                className="p-1 border-slate-200 rounded-lg bg-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-glossy-lg overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingContactId ? 'Edit Contact' : 'Create Contact'}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {editingContactId ? 'Update this record fields details.' : 'Provide fields in sections to create a customer contact.'}
                </p>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tabs for Sectional Form */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/20 select-none overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'professional', label: 'Professional' },
                { id: 'communication', label: 'Communication' },
                { id: 'address', label: 'Address' },
                { id: 'social', label: 'Social Profiles' },
                { id: 'preferences', label: 'Preferences' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeFormTab === tab.id
                      ? 'border-brand-550 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit(onSubmitContact)} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* SECTION: BASIC INFO */}
              {activeFormTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">First Name *</label>
                      <input
                        type="text"
                        {...register('firstName')}
                        className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 ${errors.firstName ? 'border-rose-300' : 'border-slate-150'}`}
                      />
                      {errors.firstName && <span className="text-[10px] text-rose-500 font-semibold">{errors.firstName.message}</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Middle Name</label>
                      <input
                        type="text"
                        {...register('middleName')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Last Name *</label>
                      <input
                        type="text"
                        {...register('lastName')}
                        className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 ${errors.lastName ? 'border-rose-300' : 'border-slate-150'}`}
                      />
                      {errors.lastName && <span className="text-[10px] text-rose-500 font-semibold">{errors.lastName.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Gender</label>
                      <select
                        {...register('gender')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        {...register('dateOfBirth')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Category (Status) *</label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 font-semibold text-slate-700"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="VIP">VIP</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Customer">Customer</option>
                      <option value="Partner">Partner</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Former Customer">Former Customer</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Profile Photo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      {...register('profilePhoto')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Description / Notes</label>
                    <textarea
                      rows={3}
                      {...register('description')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: PROFESSIONAL */}
              {activeFormTab === 'professional' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Director"
                        {...register('jobTitle')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Sales"
                        {...register('department')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Associated Company</label>
                      <select
                        {...register('companyId')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      >
                        <option value="">Select Company (optional)</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Lead Reference</label>
                      <select
                        {...register('leadId')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      >
                        <option value="">Select Lead (optional)</option>
                        {leads.map(l => (
                          <option key={l.id} value={l.id}>{l.fullName} ({l.leadNumber})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags list editing */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                      <Tags size={12} />
                      Tags
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="px-3 py-1.5 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold rounded-xl"
                      >
                        Add Tag
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formTags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </span>
                      ))}
                      {formTags.length === 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold italic">No tags configured</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: COMMUNICATION */}
              {activeFormTab === 'communication' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Primary Email</label>
                      <input
                        type="email"
                        {...register('email')}
                        className={`w-full px-3 py-2 text-xs border rounded-xl bg-slate-50/50 ${errors.email ? 'border-rose-300' : 'border-slate-150'}`}
                      />
                      {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email.message}</span>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Secondary Email</label>
                      <input
                        type="email"
                        {...register('secondaryEmail')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Primary Phone</label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Alternate Phone</label>
                      <input
                        type="tel"
                        {...register('alternatePhone')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">WhatsApp</label>
                      <input
                        type="text"
                        {...register('whatsApp')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Website URL</label>
                      <input
                        type="text"
                        placeholder="https://company.com"
                        {...register('website')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: ADDRESS */}
              {activeFormTab === 'address' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Address Line 1</label>
                    <input
                      type="text"
                      {...register('addressLine1')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Address Line 2</label>
                    <input
                      type="text"
                      {...register('addressLine2')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">City</label>
                      <input
                        type="text"
                        {...register('city')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">State</label>
                      <input
                        type="text"
                        {...register('state')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Country</label>
                      <input
                        type="text"
                        {...register('country')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Postal Code</label>
                      <input
                        type="text"
                        {...register('postalCode')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: SOCIALS */}
              {activeFormTab === 'social' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">LinkedIn Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/in/username"
                      {...register('linkedin')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Twitter Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/username"
                      {...register('twitter')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Facebook Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/username"
                      {...register('facebook')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Instagram Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/username"
                      {...register('instagram')}
                      className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: PREFERENCES */}
              {activeFormTab === 'preferences' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Status *</label>
                      <select
                        {...register('status')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50 font-semibold text-slate-700"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="VIP">VIP</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Customer">Customer</option>
                        <option value="Partner">Partner</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Former Customer">Former Customer</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Contact Owner *</label>
                      <select
                        {...register('ownerId')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Preferred Language</label>
                      <input
                        type="text"
                        {...register('preferredLanguage')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Preferred Method</label>
                      <select
                        {...register('preferredContactMethod')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      >
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="SMS">SMS</option>
                        <option value="Meeting">Meeting</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Timezone</label>
                      <input
                        type="text"
                        {...register('timezone')}
                        className="w-full px-3 py-2 text-xs border border-slate-150 rounded-xl bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
              <div className="flex gap-2">
                {!editingContactId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadDraft}
                    className="border-slate-200 text-slate-500 text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Restore Draft
                  </Button>
                )}
                {!editingContactId && localStorage.getItem('flowcrm_contact_draft') && (
                  <button
                    type="button"
                    onClick={() => {
                      clearDraft();
                      toast.info('Draft Cleared', 'Autosaved draft removed.');
                    }}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
                  >
                    Clear Draft
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddEditModal(false)}
                  className="border-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmitContact)}
                  className="bg-brand-550 text-white hover:bg-brand-600 text-xs font-bold px-4 py-2 rounded-xl shadow-glossy shadow-brand-100"
                >
                  Save Contact
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Update Status (Bulk)</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set status for {selectedIds.length} selected contacts.</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="VIP">VIP</option>
                  <option value="Prospect">Prospect</option>
                  <option value="Customer">Customer</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Former Customer">Former Customer</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkStatusModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkStatusSubmit}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Apply Change
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Owner Assignment Modal */}
      {showBulkOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Bulk Assign Owner</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Assign {selectedIds.length} contacts to a new system owner.</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">New Owner</label>
                <select
                  value={bulkOwnerId}
                  onChange={(e) => setBulkOwnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50"
                >
                  <option value="">Select Owner</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkOwnerModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkOwnerSubmit}
                  disabled={!bulkOwnerId}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50"
                >
                  Reassign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
