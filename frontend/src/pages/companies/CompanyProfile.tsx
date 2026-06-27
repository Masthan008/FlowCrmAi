import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Building2, Globe, Mail, Phone, MapPin,
  Edit2, Trash2, Archive, UserCheck, Star,
  AlertCircle, Clock, FileText,
  CreditCard, Briefcase
} from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';

export const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentCompany, fetchCompany, deleteCompany, clearCurrentCompany, loading, error, employees, fetchEmployees } = useCompanyStore();

  const [selectedTab, setSelectedTab] = useState('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetOwnerId, setTargetOwnerId] = useState('');

  useEffect(() => {
    if (id) {
      fetchCompany(id);
      fetchEmployees();
    }
    return () => { clearCurrentCompany(); };
  }, [id]);

  useEffect(() => {
    if (currentCompany) {
      setTargetOwnerId(currentCompany.ownerId || '');
    }
  }, [currentCompany]);

  const handleDelete = async () => {
    if (!currentCompany) return;
    if (confirm(`Delete company "${currentCompany.name}"?`)) {
      try {
        await deleteCompany(currentCompany.id);
        toast.success('Company Deleted', `${currentCompany.name} has been deleted.`);
        navigate('/companies');
      } catch {
        toast.error('Delete Failed', 'Failed to delete company.');
      }
    }
  };

  const handleArchive = async () => {
    if (!currentCompany) return;
    try {
      const { updateCompany } = useCompanyStore.getState();
      await updateCompany(currentCompany.id, { status: 'Archived' } as any);
      toast.success('Company Archived', 'Status changed to Archived.');
      fetchCompany(currentCompany.id);
    } catch {
      toast.error('Archive Failed', 'Failed to archive company.');
    }
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

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatRevenue = (val?: number) => {
    if (!val) return '-';
    if (val >= 10000000) return `$${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `$${(val / 100000).toFixed(1)}L`;
    return `$${(val / 1000).toFixed(0)}K`;
  };

  if (loading && !currentCompany) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4"><Skeleton className="h-[400px] w-full" /></div>
          <div className="lg:col-span-8"><Skeleton className="h-[500px] w-full" /></div>
        </div>
      </div>
    );
  }

  if (error || !currentCompany) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Company Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'The requested company was not found.'}</p>
        <Link to="/companies"><Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Companies</Button></Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'business', label: 'Business Info' },
    { id: 'contact', label: 'Contact & Tax' },
    { id: 'address', label: 'Address' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/companies" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <Breadcrumb items={[{ label: 'Companies', href: '/companies' }, { label: currentCompany.companyNumber }]} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/companies/${currentCompany.id}/edit`)} className="text-xs">
            <Edit2 size={14} /> Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={handleArchive} className="text-xs">
            <Archive size={14} /> Archive
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete} className="text-xs">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg space-y-5">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-2xl text-brand-650 uppercase shadow-glossy-sm">
                {currentCompany.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">{currentCompany.displayName || currentCompany.name}</h2>
                {currentCompany.industry && (
                  <p className="text-xs text-slate-450 font-bold mt-0.5 flex items-center justify-center gap-1">
                    <Briefcase size={12} /> {currentCompany.industry}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(currentCompany.status)}`}>
                  {currentCompany.status}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityColor(currentCompany.priority)}`}>
                  {currentCompany.priority}
                </span>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Code</span>
                <span className="font-mono font-bold text-slate-600">{currentCompany.companyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Owner</span>
                <span className="font-semibold">
                  {currentCompany.owner ? `${currentCompany.owner.firstName} ${currentCompany.owner.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Created</span>
                <span className="font-semibold text-slate-500">{new Date(currentCompany.createdAt).toLocaleDateString()}</span>
              </div>
              {currentCompany.foundedYear && (
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">Founded</span>
                  <span className="font-semibold">{currentCompany.foundedYear}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 select-none">
              <a href={currentCompany.website ? `https://${currentCompany.website}` : '#'}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Globe size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Website</span>
              </a>
              <a href={currentCompany.primaryEmail ? `mailto:${currentCompany.primaryEmail}` : '#'}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Mail size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Email</span>
              </a>
              <a href={currentCompany.primaryPhone ? `tel:${currentCompany.primaryPhone}` : '#'}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-all gap-1"
              >
                <Phone size={14} className="text-slate-650" />
                <span className="text-[8px] font-bold text-slate-500 uppercase">Call</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)} className="w-full justify-center text-xs">
                <UserCheck size={12} /> Assign
              </Button>
              <Link to={`/companies/${currentCompany.id}/edit`}>
                <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                  <Edit2 size={12} /> Edit
                </Button>
              </Link>
            </div>

            {currentCompany.tags && currentCompany.tags.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {currentCompany.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-150 rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap ${
                  selectedTab === tab.id ? 'bg-slate-800 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-glossy-lg min-h-[400px]">
            {selectedTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-xs text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <Building2 size={14} /> Company Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Company Name</span>
                      <p className="font-semibold text-slate-750 mt-0.5">{currentCompany.name}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Type</span>
                      <p className="font-semibold mt-0.5">{currentCompany.companyType || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Industry</span>
                      <p className="font-semibold mt-0.5">{currentCompany.industry || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Employees</span>
                      <p className="font-semibold mt-0.5">{currentCompany.employeeCount?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span>
                      <p className="font-semibold mt-0.5">{formatRevenue(currentCompany.annualRevenue)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Website</span>
                      <p className="font-semibold mt-0.5">{currentCompany.website ? (
                        <a href={`https://${currentCompany.website}`} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{currentCompany.website}</a>
                      ) : '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Rating</span>
                      <p className="font-semibold mt-0.5 flex items-center gap-1">
                        {currentCompany.rating ? (
                          Array.from({ length: currentCompany.rating }, (_, i) => <Star key={i} size={12} className="text-amber-400 fill-amber-400" />)
                        ) : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Parent Company</span>
                      <p className="font-semibold mt-0.5">{currentCompany.parentCompany?.name || '-'}</p>
                    </div>
                  </div>
                </div>

                {currentCompany.description && (
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Description</h4>
                    <p className="text-slate-600 leading-relaxed">{currentCompany.description}</p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <Clock size={14} /> Audit Trail
                  </h4>
                  <div className="space-y-1 text-[10px] text-slate-400 font-semibold font-mono">
                    <div>UUID: {currentCompany.id}</div>
                    <div>Version: {currentCompany.version}</div>
                    <div>Created By: {currentCompany.createdBy || 'system'}</div>
                    <div>Last Updated: {new Date(currentCompany.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'business' && (
              <div className="space-y-5 animate-fade-in text-xs text-slate-700">
                <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <Briefcase size={14} /> Business Information
                </h4>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Legal Name</span>
                    <p className="font-semibold mt-0.5">{currentCompany.legalName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Display Name</span>
                    <p className="font-semibold mt-0.5">{currentCompany.displayName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Company Type</span>
                    <p className="font-semibold mt-0.5">{currentCompany.companyType || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Sub Industry</span>
                    <p className="font-semibold mt-0.5">{currentCompany.subIndustry || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Business Category</span>
                    <p className="font-semibold mt-0.5">{currentCompany.businessCategory || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Ownership Type</span>
                    <p className="font-semibold mt-0.5">{currentCompany.ownershipType || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Founded Year</span>
                    <p className="font-semibold mt-0.5">{currentCompany.foundedYear || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Employee Count</span>
                    <p className="font-semibold mt-0.5">{currentCompany.employeeCount?.toLocaleString() || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Annual Revenue</span>
                    <p className="font-semibold mt-0.5">{formatRevenue(currentCompany.annualRevenue)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Parent Company</span>
                    <p className="font-semibold mt-0.5">{currentCompany.parentCompany?.name || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'contact' && (
              <div className="space-y-5 animate-fade-in text-xs text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <Mail size={14} /> Communication Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Primary Email</span>
                      <p className="font-semibold mt-0.5">{currentCompany.primaryEmail || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Secondary Email</span>
                      <p className="font-semibold mt-0.5">{currentCompany.secondaryEmail || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Primary Phone</span>
                      <p className="font-semibold mt-0.5">{currentCompany.primaryPhone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Secondary Phone</span>
                      <p className="font-semibold mt-0.5">{currentCompany.secondaryPhone || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp</span>
                      <p className="font-semibold mt-0.5">{currentCompany.whatsApp || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Website</span>
                      <p className="font-semibold mt-0.5">{currentCompany.website || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <CreditCard size={14} /> Tax Details
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">GST Number</span>
                      <p className="font-semibold mt-0.5">{currentCompany.gstNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Tax Number</span>
                      <p className="font-semibold mt-0.5">{currentCompany.taxNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Registration Number</span>
                      <p className="font-semibold mt-0.5">{currentCompany.registrationNumber || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">PAN Number</span>
                      <p className="font-semibold mt-0.5">{currentCompany.panNumber || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'address' && (
              <div className="space-y-5 animate-fade-in text-xs text-slate-700">
                <div>
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <MapPin size={14} /> Registered Address
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Country</span>
                      <p className="font-semibold mt-0.5">{currentCompany.country || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">State</span>
                      <p className="font-semibold mt-0.5">{currentCompany.state || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">City</span>
                      <p className="font-semibold mt-0.5">{currentCompany.city || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Postal Code</span>
                      <p className="font-semibold mt-0.5">{currentCompany.postalCode || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 1</span>
                      <p className="font-semibold mt-0.5">{currentCompany.addressLine1 || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Address Line 2</span>
                      <p className="font-semibold mt-0.5">{currentCompany.addressLine2 || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                    <FileText size={14} /> Billing & Shipping
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Billing Address</span>
                      <p className="font-semibold mt-0.5 text-slate-600">{currentCompany.billingAddress || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Shipping Address</span>
                      <p className="font-semibold mt-0.5 text-slate-600">{currentCompany.shippingAddress || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Assign Owner</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Reassign company account owner.</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Employee</label>
                <select
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  <option value="">Select owner...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(false)} className="text-xs">Cancel</Button>
                <Button variant="primary" size="sm" onClick={async () => {
                  try {
                    const { updateCompany } = useCompanyStore.getState();
                    await updateCompany(currentCompany!.id, { ownerId: targetOwnerId } as any);
                    toast.success('Owner Assigned', 'Company owner updated.');
                    setShowAssignModal(false);
                    fetchCompany(currentCompany!.id);
                  } catch {
                    toast.error('Failed', 'Owner assignment failed.');
                  }
                }} disabled={!targetOwnerId} className="text-xs">Assign</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
