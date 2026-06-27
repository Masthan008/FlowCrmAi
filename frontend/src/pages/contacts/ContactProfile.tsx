import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Phone,
  Mail,
  MessageSquare,
  Edit2,
  UserCheck,
  Archive,
  Trash2,
  Video,
  Building,
  Contact as ContactIcon,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Activity,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Loader2
} from 'lucide-react';

import { useContactStore } from '../../store/contactStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';

export const ContactProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    currentContact,
    loading,
    error,
    employees,
    companies,
    fetchContact,
    deleteContact,
    updateContact,
    fetchEmployees,
    fetchCompanies,
    clearCurrentContact
  } = useContactStore();

  const [activeTab, setActiveTab] = useState<'summary' | 'professional' | 'communication' | 'company' | 'timeline' | 'activities' | 'notes' | 'documents'>('summary');
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [targetOwnerId, setTargetOwnerId] = useState('');

  useEffect(() => {
    if (id) {
      fetchContact(id);
      fetchEmployees();
      fetchCompanies();
    }
    return () => {
      clearCurrentContact();
    };
  }, [id]);

  // Synchronize assign modal default value
  useEffect(() => {
    if (currentContact) {
      setTargetOwnerId(currentContact.ownerId || '');
    }
  }, [currentContact]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="animate-spin text-brand-550 w-8 h-8" />
        <p className="text-xs font-semibold">Loading premium contact workspace...</p>
      </div>
    );
  }

  if (error || !currentContact) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Workspace Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {error || 'The requested contact does not exist or has been removed from the directory.'}
        </p>
        <Link to="/contacts">
          <Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">
            Back to Contacts
          </Button>
        </Link>
      </div>
    );
  }

  // Quick Action handlers
  const handleCall = () => {
    if (currentContact.phone) {
      window.location.href = `tel:${currentContact.phone}`;
    } else {
      toast.info('No Phone Configured', 'Please update the contact communication fields to add a phone number.');
    }
  };

  const handleEmail = () => {
    if (currentContact.email) {
      window.location.href = `mailto:${currentContact.email}`;
    } else {
      toast.info('No Email Configured', 'Please update the contact communication fields to add an email.');
    }
  };

  const handleMessage = () => {
    if (currentContact.whatsApp) {
      window.open(`https://wa.me/${currentContact.whatsApp.replace(/[^d]/g, '')}`, '_blank');
    } else if (currentContact.phone) {
      window.location.href = `sms:${currentContact.phone}`;
    } else {
      toast.info('No Message Targets', 'Add a phone or WhatsApp number to dispatch a messaging payload.');
    }
  };

  const handleArchive = async () => {
    try {
      await updateContact(currentContact.id, { status: 'Archived' });
      toast.success('Contact Archived', 'Status has been updated to Archived.');
    } catch (err) {
      toast.error('Archiving Failed', 'Failed to archive contact.');
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${currentContact.fullName}? This operation is soft-delete.`)) {
      try {
        await deleteContact(currentContact.id);
        toast.success('Contact Deleted', 'Contact removed successfully.');
        navigate('/contacts');
      } catch (err) {
        toast.error('Deletion Failed', 'Failed to delete contact.');
      }
    }
  };

  const handleAssignOwner = async () => {
    try {
      await updateContact(currentContact.id, { ownerId: targetOwnerId });
      toast.success('Owner Assigned', 'Contact owner updated successfully.');
      setShowAssignOwnerModal(false);
      if (id) fetchContact(id); // Reload
    } catch (err) {
      toast.error('Assignment Failed', 'Failed to reassign contact owner.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'VIP': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Prospect': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Customer': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Partner': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Vendor': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Former Customer': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Archived': return 'bg-slate-100 text-slate-650 border-slate-300';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header back bar */}
      <div className="flex items-center gap-3">
        <Link to="/contacts" className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800">
          <ChevronLeft size={18} />
        </Link>
        <span className="text-[11px] font-bold text-slate-400 font-mono">{currentContact.contactNumber}</span>
        <span className="text-slate-350">|</span>
        <span className="text-xs text-slate-500 font-medium">Contacts Directory Workspace</span>
      </div>

      {/* Main 2-column details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Summary profile card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white/85 backdrop-blur-xl border border-slate-150 rounded-3xl p-6 shadow-glossy-lg text-center space-y-4">
            
            {/* Photo initials */}
            <div className="relative mx-auto w-24 h-24">
              {currentContact.profilePhoto ? (
                <img
                  src={currentContact.profilePhoto}
                  alt={currentContact.fullName}
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-100 shadow-glossy"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-2xl text-brand-600 uppercase shadow-glossy-sm">
                  {currentContact.firstName.charAt(0)}{currentContact.lastName.charAt(0)}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 border-2 border-white px-2 py-0.5 text-[9px] font-bold rounded-full shadow-glossy-sm ${getStatusColor(currentContact.status)}`}>
                {currentContact.status}
              </span>
            </div>

            {/* Basic detail names */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">
                {currentContact.fullName}
              </h2>
              {currentContact.jobTitle && (
                <p className="text-xs text-slate-450 font-semibold">{currentContact.jobTitle}</p>
              )}
              {currentContact.company?.name && (
                <p className="text-[11px] font-bold text-brand-600 mt-1 flex items-center justify-center gap-1">
                  <Building size={11} />
                  {currentContact.company.name}
                </p>
              )}
            </div>

            {/* Quick action buttons row */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={handleCall}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1.5 focus:outline-none"
              >
                <Phone size={14} className="text-slate-650" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Call</span>
              </button>

              <button
                onClick={handleEmail}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1.5 focus:outline-none"
              >
                <Mail size={14} className="text-slate-650" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Email</span>
              </button>

              <button
                onClick={handleMessage}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 transition-all gap-1.5 focus:outline-none"
              >
                <MessageSquare size={14} className="text-slate-650" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Message</span>
              </button>
            </div>

            {/* Divider line */}
            <div className="border-t border-slate-100 pt-4 text-left space-y-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Primary Phone</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.phone || 'Not Configured'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Primary Email</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5 break-all">{currentContact.email || 'Not Configured'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Owner</span>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {currentContact.owner ? `${currentContact.owner.firstName} ${currentContact.owner.lastName}` : 'No Owner Assigned'}
                </p>
              </div>
            </div>

            {/* Direct primary operations actions list */}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
              <Button
                onClick={() => setShowAssignOwnerModal(true)}
                variant="outline"
                className="w-full justify-center border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                Assign Owner
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleArchive}
                  variant="outline"
                  className="w-full justify-center border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Archive size={14} />
                  Archive
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full justify-center border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
              <Button
                disabled
                className="w-full justify-center border-transparent bg-slate-100 hover:bg-slate-100 text-slate-400 font-bold text-xs py-2 rounded-xl flex items-center gap-1.5 cursor-not-allowed mt-2"
              >
                <Video size={14} />
                Video Meeting (Future)
              </Button>
            </div>

          </div>
        </div>

        {/* Right column: Workspace Tabs & Details view */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs bar */}
          <div className="bg-white/80 border border-slate-150 rounded-2xl p-1.5 flex flex-wrap gap-1 select-none">
            {[
              { id: 'summary', label: 'Overview' },
              { id: 'professional', label: 'Professional Info' },
              { id: 'communication', label: 'Communication' },
              { id: 'company', label: 'Company relation' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'activities', label: 'Activities' },
              { id: 'notes', label: 'Notes' },
              { id: 'documents', label: 'Documents' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold transition-all rounded-xl ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-glossy-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="bg-white/80 border border-slate-150 rounded-3xl p-6 shadow-glossy-lg min-h-[400px]">
            
            {/* TAB: SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <ContactIcon size={16} className="text-brand-550" />
                    Profile Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">First Name</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.firstName}</p>
                    </div>
                    {currentContact.middleName && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Middle Name</span>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.middleName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Last Name</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.lastName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Gender</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.gender || 'Not Specified'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {currentContact.dateOfBirth ? new Date(currentContact.dateOfBirth).toLocaleDateString() : 'Not Specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Preferred contact Method</span>
                      <p className="text-xs font-bold text-brand-650 mt-0.5">{currentContact.preferredContactMethod || 'Email'}</p>
                    </div>
                  </div>
                </div>

                {currentContact.description && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Notes / Description</span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50/50 border border-slate-100 p-3 rounded-2xl">
                      {currentContact.description}
                    </p>
                  </div>
                )}

                {currentContact.tags && currentContact.tags.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Tags</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {currentContact.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PROFESSIONAL INFO */}
            {activeTab === 'professional' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Briefcase size={16} className="text-brand-550" />
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Job Title</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.jobTitle || 'Not Configured'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Department</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.department || 'Not Configured'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Associated Lead Reference</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {currentContact.lead ? (
                        <Link to={`/leads/${currentContact.lead.id}`} className="font-bold text-brand-650 hover:underline">
                          {currentContact.lead.fullName} ({currentContact.lead.leadNumber})
                        </Link>
                      ) : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COMMUNICATION */}
            {activeTab === 'communication' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Globe size={16} className="text-brand-550" />
                  Communication Details
                </h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Primary Email</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Secondary Email</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.secondaryEmail || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Primary Phone</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.phone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Alternate Phone</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.alternatePhone || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{currentContact.whatsApp || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Website URL</span>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {currentContact.website ? (
                        <a href={currentContact.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{currentContact.website}</a>
                      ) : '-'}
                    </p>
                  </div>
                </div>

                {/* Social links row */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-3">Social Profiles</span>
                  <div className="flex gap-4">
                    {currentContact.linkedin && (
                      <a href={currentContact.linkedin} target="_blank" rel="noreferrer" className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {currentContact.twitter && (
                      <a href={currentContact.twitter} target="_blank" rel="noreferrer" className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Twitter size={16} />
                      </a>
                    )}
                    {currentContact.facebook && (
                      <a href={currentContact.facebook} target="_blank" rel="noreferrer" className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Facebook size={16} />
                      </a>
                    )}
                    {currentContact.instagram && (
                      <a href={currentContact.instagram} target="_blank" rel="noreferrer" className="p-2 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                        <Instagram size={16} />
                      </a>
                    )}
                    {!currentContact.linkedin && !currentContact.twitter && !currentContact.facebook && !currentContact.instagram && (
                      <span className="text-xs text-slate-400 italic">No social links configured</span>
                    )}
                  </div>
                </div>

                {/* Address block */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Physical Address</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Address Lines</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {currentContact.addressLine1 || ''} {currentContact.addressLine2 ? ', ' + currentContact.addressLine2 : ''}
                        {!currentContact.addressLine1 && !currentContact.addressLine2 && '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">City / State</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {currentContact.city || ''} {currentContact.state ? ', ' + currentContact.state : ''}
                        {!currentContact.city && !currentContact.state && '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">Country / Postal Code</span>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {currentContact.country || ''} {currentContact.postalCode ? ' (' + currentContact.postalCode + ')' : ''}
                        {!currentContact.country && !currentContact.postalCode && '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COMPANY */}
            {activeTab === 'company' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building size={16} className="text-brand-550" />
                  Associated Corporate Record
                </h3>

                {currentContact.company ? (
                  <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-3xl space-y-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Company Name</span>
                      <h4 className="text-base font-black text-slate-800 mt-0.5">{currentContact.company.name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-medium text-slate-600">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Domain</span>
                        <p className="text-slate-700 font-semibold mt-0.5">{currentContact.company.domain || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Industry</span>
                        <p className="text-slate-700 font-semibold mt-0.5">{currentContact.company.industry || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Corporate Phone</span>
                        <p className="text-slate-700 font-semibold mt-0.5">{currentContact.company.phone || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">Account Status</span>
                        <p className="mt-0.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            currentContact.company.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {currentContact.company.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-slate-200 rounded-3xl text-slate-400 select-none">
                    <Building className="mx-auto w-10 h-10 mb-2 opacity-50" />
                    <p className="text-xs font-medium">No corporate record is associated with this contact.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: TIMELINE PLACEHOLDER */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 animate-fade-in text-center py-12">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Timeline Workspace</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Historical communication timeline, activities log, and history feed will appear here in subsequent phases.
                </p>
              </div>
            )}

            {/* TAB: ACTIVITIES PLACEHOLDER */}
            {activeTab === 'activities' && (
              <div className="space-y-4 animate-fade-in text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Activities Workspace</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Scheduling follow-up tasks, calls, and calendar meeting schedules belongs to subsequent prompts.
                </p>
              </div>
            )}

            {/* TAB: NOTES PLACEHOLDER */}
            {activeTab === 'notes' && (
              <div className="space-y-4 animate-fade-in text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Notes Workspace</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Creating notes, annotations, and pinning interaction descriptions belongs to later phases.
                </p>
              </div>
            )}

            {/* TAB: DOCUMENTS PLACEHOLDER */}
            {activeTab === 'documents' && (
              <div className="space-y-4 animate-fade-in text-center py-12">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Documents Workspace</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Uploading corporate files, proposals, and agreements attachments belongs to later phases.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Assign Owner Modal */}
      {showAssignOwnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg select-none animate-scale-up">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Assign Contact Owner</h3>
            <p className="text-[10px] text-slate-450 font-medium mb-4">Select the executive to own this contact record.</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Owner</label>
                <select
                  value={targetOwnerId}
                  onChange={(e) => setTargetOwnerId(e.target.value)}
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
                  onClick={() => setShowAssignOwnerModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignOwner}
                  disabled={!targetOwnerId}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl disabled:opacity-50"
                >
                  Confirm Reassign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContactProfile;
