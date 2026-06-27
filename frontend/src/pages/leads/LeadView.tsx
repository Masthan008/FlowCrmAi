import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useLeadStore } from '../../store/leadStore';
import {
  Pencil,
  Trash2,
  ArrowLeft,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  DollarSign,
  CalendarDays,
  Clock,
  FileText,
  Activity,
  MessageSquare,
  Paperclip,
  UserCheck,
  Hash,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

const priorityColors: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const LeadView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLead, loading, error, fetchLead, deleteLead, clearCurrentLead } = useLeadStore();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  useEffect(() => {
    if (id) fetchLead(id);
    return () => clearCurrentLead();
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      await deleteLead(id);
      navigate('/leads');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 py-2.5">
      <div className="p-1.5 bg-slate-50 rounded-lg mt-0.5">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-700 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const breadcrumbs = [
    { label: 'Leads', href: '/leads' },
    { label: currentLead?.fullName || 'Lead Details' },
  ];

  if (loading && !currentLead) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Leads', href: '/leads' }, { label: 'Error' }]} />
        <div className="flex items-center gap-3 p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <Button variant="glass" size="sm" onClick={() => navigate('/leads')} className="ml-auto">
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  if (!currentLead) return null;

  const lead = currentLead;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="text-slate-500" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                  {lead.fullName}
                </h1>
                {lead.status && (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: `${lead.status.color}15`,
                      color: lead.status.color,
                      borderColor: `${lead.status.color}30`,
                    }}
                  >
                    {lead.status.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5 font-mono">{lead.leadNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => navigate(`/leads/${id}/edit`)}
              className="flex items-center gap-1.5"
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Summary */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Lead Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Priority</p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mt-2 ${
                    priorityColors[lead.priority] || priorityColors.Medium
                  }`}
                >
                  {lead.priority}
                </span>
              </div>
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rating</p>
                <div className="mt-2">{renderStars(lead.rating)}</div>
              </div>
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Est. Value</p>
                <p className="text-lg font-bold text-slate-800 mt-1">
                  ${lead.value.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100/60">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Source</p>
                <p className="text-sm font-semibold text-slate-700 mt-2">
                  {lead.source?.name || '—'}
                </p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-violet-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Phone} label="Alternate Phone" value={lead.alternatePhone} />
              <InfoRow icon={Briefcase} label="Job Title" value={lead.jobTitle} />
            </div>
          </Card>

          {/* Company Information */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-cyan-600" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <InfoRow icon={Building2} label="Company" value={lead.companyName} />
              <InfoRow icon={Briefcase} label="Industry" value={lead.industry} />
              <InfoRow icon={Globe} label="Website" value={
                lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : '—'
              } />
            </div>
          </Card>

          {/* Address */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              <InfoRow icon={MapPin} label="Street" value={lead.address} />
              <InfoRow icon={MapPin} label="City" value={lead.city} />
              <InfoRow icon={MapPin} label="State" value={lead.state} />
              <InfoRow icon={MapPin} label="Country" value={lead.country} />
              <InfoRow icon={Hash} label="Postal Code" value={lead.postalCode} />
            </div>
          </Card>

          {/* Description */}
          {lead.description && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-amber-600" />
                Description
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {lead.description}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column — 1/3 width */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              Status
            </h2>
            {lead.status ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100/60">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: lead.status.color }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{lead.status.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No status assigned</p>
            )}
          </Card>

          {/* Owner Card */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UserCheck size={16} className="text-violet-600" />
              Lead Owner
            </h2>
            {lead.assignedTo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100/60">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {lead.assignedTo.firstName[0]}
                  {lead.assignedTo.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{lead.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No owner assigned</p>
            )}
          </Card>

          {/* Expected Close & Dates */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-600" />
              Dates
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Expected Close</span>
                <span className="font-medium text-slate-700">
                  {lead.expectedClosingDate
                    ? new Date(lead.expectedClosingDate).toLocaleDateString()
                    : '—'}
                </span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Created</span>
                <span className="font-medium text-slate-700">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-medium text-slate-700">
                  {new Date(lead.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Placeholders */}
          <Card className="p-6 opacity-60">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-slate-400" />
              Timeline
            </h2>
            <p className="text-xs text-slate-400">Timeline will be available in a future update.</p>
          </Card>

          <Card className="p-6 opacity-60">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-slate-400" />
              Activities
            </h2>
            <p className="text-xs text-slate-400">Activities will be available in a future update.</p>
          </Card>

          <Card className="p-6 opacity-60">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-slate-400" />
              Notes
            </h2>
            <p className="text-xs text-slate-400">Notes will be available in a future update.</p>
          </Card>

          <Card className="p-6 opacity-60">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Paperclip size={16} className="text-slate-400" />
              Files
            </h2>
            <p className="text-xs text-slate-400">File attachments will be available in a future update.</p>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Lead"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{lead.fullName}</strong>? This action can be undone later if needed.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="glass" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Delete Lead'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadView;
