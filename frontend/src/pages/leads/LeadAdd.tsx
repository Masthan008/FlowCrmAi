import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useLeadStore } from '../../store/leadStore';
import {
  Save,
  X,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { LeadFormData } from '../../types/lead';

const LeadAdd: React.FC = () => {
  const navigate = useNavigate();
  const { sources, statuses, loading, error, fetchSources, fetchStatuses, createLead, clearError } =
    useLeadStore();

  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    companyName: '',
    jobTitle: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    sourceId: '',
    statusId: '',
    priority: 'Medium',
    rating: 0,
    value: 0,
    expectedClosingDate: '',
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSources();
    fetchStatuses();
  }, []);

  const handleChange = (field: keyof LeadFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'URL must start with http:// or https://';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      await createLead(formData);
      navigate('/leads');
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const fieldErrors: Record<string, string> = {};
        serverErrors.forEach((e: any) => {
          if (e.field) fieldErrors[e.field] = e.message;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setValidationErrors((prev) => ({ ...prev, ...fieldErrors }));
          return;
        }
      }
    }
  };

  const renderStarPicker = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => handleChange('rating', formData.rating === i ? 0 : i)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={20}
            className={
              i <= (formData.rating || 0)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 hover:text-amber-300'
            }
          />
        </button>
      ))}
    </div>
  );

  const breadcrumbs = [
    { label: 'Leads', href: '/leads' },
    { label: 'New Lead' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <Breadcrumb items={breadcrumbs} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">Create New Lead</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Add a new prospect to your sales pipeline
            </p>
          </div>
          <Button variant="glass" size="sm" onClick={() => navigate('/leads')}>
            <X size={16} className="mr-1.5" />
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-50 rounded-xl">
              <User size={18} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className={validationErrors.firstName ? 'border-red-300' : ''}
              />
              {validationErrors.firstName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className={validationErrors.lastName ? 'border-red-300' : ''}
              />
              {validationErrors.lastName && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <Input
                icon={<Mail size={15} />}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                className={validationErrors.email ? 'border-red-300' : ''}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Phone
              </label>
              <Input
                icon={<Phone size={15} />}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Alternate Phone
              </label>
              <Input
                icon={<Phone size={15} />}
                value={formData.alternatePhone}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </Card>

        {/* Company Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-violet-50 rounded-xl">
              <Building2 size={18} className="text-violet-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Company Name
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Industry
              </label>
              <Input
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="e.g. Technology, Healthcare"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Website
              </label>
              <Input
                icon={<Globe size={15} />}
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className={validationErrors.website ? 'border-red-300' : ''}
              />
              {validationErrors.website && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.website}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Job Title
              </label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                placeholder="e.g. CTO, VP of Sales"
              />
            </div>
          </div>
        </Card>

        {/* Lead Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-cyan-50 rounded-xl">
              <Star size={18} className="text-cyan-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Lead Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Lead Source
              </label>
              <Select
                value={formData.sourceId || ''}
                onChange={(e) => handleChange('sourceId', e.target.value)}
                options={[
                  { label: 'Select source...', value: '' },
                  ...sources.map((s) => ({ label: s.name, value: s.id })),
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Lead Status
              </label>
              <Select
                value={formData.statusId || ''}
                onChange={(e) => handleChange('statusId', e.target.value)}
                options={[
                  { label: 'Select status...', value: '' },
                  ...statuses.map((s) => ({ label: s.name, value: s.id })),
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Priority
              </label>
              <Select
                value={formData.priority || 'Medium'}
                onChange={(e) => handleChange('priority', e.target.value)}
                options={[
                  { label: 'Critical', value: 'Critical' },
                  { label: 'High', value: 'High' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'Low', value: 'Low' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Rating
              </label>
              {renderStarPicker()}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Estimated Value ($)
              </label>
              <Input
                type="number"
                min={0}
                value={formData.value || ''}
                onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Expected Closing Date
              </label>
              <Input
                type="date"
                value={formData.expectedClosingDate?.split('T')[0] || ''}
                onChange={(e) =>
                  handleChange(
                    'expectedClosingDate',
                    e.target.value ? new Date(e.target.value).toISOString() : ''
                  )
                }
              />
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <MapPin size={18} className="text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Address</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Street Address
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                State / Province
              </label>
              <Input
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Country
              </label>
              <Input
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Postal Code
              </label>
              <Input
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>
        </Card>

        {/* Notes & Description */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-amber-50 rounded-xl">
              <FileText size={18} className="text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Notes & Description</h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add any notes or description about this lead..."
              rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200/80 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all resize-none"
            />
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="glass" size="md" onClick={() => navigate('/leads')} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save Lead
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadAdd;
