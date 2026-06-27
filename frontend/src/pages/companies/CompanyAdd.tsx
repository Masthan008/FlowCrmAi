import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft, ArrowRight, Save, Info, Briefcase, Mail,
  MapPin, CreditCard, FileText, Tags, CheckCircle
} from 'lucide-react';
import { useCompanyStore } from '../../store/companyStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { COMPANY_STATUSES, COMPANY_TYPES, COMPANY_PRIORITIES } from '../../types/company';

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  legalName: z.string().max(200).optional().or(z.literal('')),
  displayName: z.string().max(200).optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal('')),
  companyType: z.string().optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  subIndustry: z.string().max(100).optional().or(z.literal('')),
  businessCategory: z.string().max(100).optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  primaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  secondaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  primaryPhone: z.string().optional().or(z.literal('')),
  secondaryPhone: z.string().optional().or(z.literal('')),
  whatsApp: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  taxNumber: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  panNumber: z.string().optional().or(z.literal('')),
  foundedYear: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  annualRevenue: z.coerce.number().min(0).optional().nullable(),
  employeeCount: z.coerce.number().int().min(0).optional().nullable(),
  ownershipType: z.string().optional().or(z.literal('')),
  currency: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  primaryLanguage: z.string().optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  addressLine1: z.string().max(200).optional().or(z.literal('')),
  addressLine2: z.string().max(200).optional().or(z.literal('')),
  billingAddress: z.string().max(500).optional().or(z.literal('')),
  shippingAddress: z.string().max(500).optional().or(z.literal('')),
  status: z.string().optional(),
  priority: z.string().optional(),
  rating: z.coerce.number().int().min(0).max(5).optional(),
  description: z.string().max(5000).optional().or(z.literal('')),
  tags: z.string().optional(),
});

type CompanyFormFields = z.infer<typeof companyFormSchema>;

const formSections = [
  { id: 'basic', label: 'Basic Information', icon: Info },
  { id: 'business', label: 'Business Details', icon: Briefcase },
  { id: 'contact', label: 'Contact Information', icon: Mail },
  { id: 'tax', label: 'Tax Information', icon: CreditCard },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'preferences', label: 'Preferences', icon: FileText },
];

export const CompanyAdd: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { createCompany } = useCompanyStore();
  const [activeSection, setActiveSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<CompanyFormFields>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      status: 'Prospect',
      priority: 'Medium',
      currency: 'USD',
      timezone: 'UTC',
      primaryLanguage: 'en',
      rating: 0,
    },
  });

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList([...tagsList, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTagsList(tagsList.filter((t) => t !== tag));
  };

  const nextSection = async () => {
    const sectionFields: Record<string, (keyof CompanyFormFields)[]> = {
      basic: ['name', 'legalName', 'displayName', 'companyType', 'website'],
      business: ['industry', 'subIndustry', 'businessCategory', 'foundedYear', 'annualRevenue', 'employeeCount', 'ownershipType'],
      contact: ['primaryEmail', 'secondaryEmail', 'primaryPhone', 'secondaryPhone', 'whatsApp'],
      tax: ['gstNumber', 'taxNumber', 'registrationNumber', 'panNumber'],
      address: ['country', 'state', 'city', 'postalCode', 'addressLine1', 'addressLine2', 'billingAddress', 'shippingAddress'],
      preferences: ['currency', 'timezone', 'primaryLanguage', 'status', 'priority', 'rating', 'description'],
    };

    const currentKey = formSections[activeSection].id;
    const fields = sectionFields[currentKey] || [];
    const valid = await trigger(fields as any);
    if (valid && activeSection < formSections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const prevSection = () => {
    if (activeSection > 0) setActiveSection(activeSection - 1);
  };

  const onSubmit = async (data: CompanyFormFields) => {
    setSubmitting(true);
    try {
      const payload = { ...data, tags: tagsList.length > 0 ? tagsList : undefined };
      await createCompany(payload as any);
      toast.success('Company Created', `${data.name} has been registered successfully.`);
      navigate('/companies');
    } catch (err: any) {
      toast.error('Creation Failed', err?.response?.data?.message || 'Failed to create company.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-100';
  const labelClass = 'text-[10px] font-bold text-slate-500 uppercase block mb-1';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[{ label: 'Companies', href: '/companies' }, { label: 'New Company' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Create Company</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/companies')} className="text-xs">
          <ArrowLeft size={14} /> Back
        </Button>
      </div>

      <div className="bg-white border border-slate-150 rounded-3xl shadow-glossy-lg overflow-hidden">
        <div className="p-1.5 bg-slate-50/30 border-b border-slate-100 flex gap-1 overflow-x-auto no-scrollbar">
          {formSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(idx)}
                className={`px-3 py-2 text-[11px] font-bold transition-all rounded-xl whitespace-nowrap flex items-center gap-1.5 ${
                  idx === activeSection
                    ? 'bg-slate-800 text-white shadow-glossy-sm'
                    : idx < activeSection
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                {idx < activeSection ? <CheckCircle size={13} /> : <Icon size={13} />}
                {section.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {activeSection === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                  <Info size={16} /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Company Name *</label>
                    <input {...register('name')} placeholder="e.g. Acme Corporation" className={inputClass} />
                    {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Legal Name</label>
                    <input {...register('legalName')} placeholder="Legal registered name" className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Display Name</label>
                    <input {...register('displayName')} placeholder="Display name (optional)" className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Company Type</label>
                    <select {...register('companyType')} className={inputClass}>
                      <option value="">Select type...</option>
                      {COMPANY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Website</label>
                    <input {...register('website')} placeholder="https://acme.com" className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelClass}>Logo URL</label>
                    <input {...register('logo')} placeholder="https://logo.url/logo.png" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Briefcase size={16} /> Business Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Industry</label>
                  <input {...register('industry')} placeholder="e.g. Technology" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Sub Industry</label>
                  <input {...register('subIndustry')} placeholder="e.g. SaaS" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Business Category</label>
                  <input {...register('businessCategory')} placeholder="e.g. B2B" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Ownership Type</label>
                  <input {...register('ownershipType')} placeholder="e.g. Private" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Founded Year</label>
                  <input type="number" {...register('foundedYear')} placeholder="e.g. 2015" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Annual Revenue (USD)</label>
                  <input type="number" {...register('annualRevenue')} placeholder="e.g. 5000000" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Employee Count</label>
                  <input type="number" {...register('employeeCount')} placeholder="e.g. 250" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Mail size={16} /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Primary Email</label>
                  <input {...register('primaryEmail')} placeholder="contact@company.com" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Secondary Email</label>
                  <input {...register('secondaryEmail')} placeholder="info@company.com" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Primary Phone</label>
                  <input {...register('primaryPhone')} placeholder="+1 555 123 4567" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Secondary Phone</label>
                  <input {...register('secondaryPhone')} placeholder="+1 555 987 6543" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>WhatsApp</label>
                  <input {...register('whatsApp')} placeholder="+1 555 555 5555" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <CreditCard size={16} /> Tax Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>GST Number</label>
                  <input {...register('gstNumber')} placeholder="e.g. GSTIN123456" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Tax Number</label>
                  <input {...register('taxNumber')} placeholder="e.g. TAX-ABC-123" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Registration Number</label>
                  <input {...register('registrationNumber')} placeholder="e.g. REG-001234" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>PAN Number</label>
                  <input {...register('panNumber')} placeholder="e.g. PAN-ABCDE1234F" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <MapPin size={16} /> Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Country</label>
                  <input {...register('country')} placeholder="e.g. United States" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>State</label>
                  <input {...register('state')} placeholder="e.g. California" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>City</label>
                  <input {...register('city')} placeholder="e.g. San Francisco" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Postal Code</label>
                  <input {...register('postalCode')} placeholder="e.g. 94105" className={inputClass} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClass}>Address Line 1</label>
                  <input {...register('addressLine1')} placeholder="123 Main Street" className={inputClass} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClass}>Address Line 2</label>
                  <input {...register('addressLine2')} placeholder="Suite 400" className={inputClass} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClass}>Billing Address</label>
                  <textarea {...register('billingAddress')} rows={2} placeholder="Full billing address" className={`${inputClass} resize-none`} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className={labelClass}>Shipping Address</label>
                  <textarea {...register('shippingAddress')} rows={2} placeholder="Full shipping address" className={`${inputClass} resize-none`} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 5 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <FileText size={16} /> Preferences & Description
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Status</label>
                  <select {...register('status')} className={inputClass}>
                    {COMPANY_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Priority</label>
                  <select {...register('priority')} className={inputClass}>
                    {COMPANY_PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Rating (0-5)</label>
                  <input type="number" min={0} max={5} {...register('rating')} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Currency</label>
                  <input {...register('currency')} placeholder="USD" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Timezone</label>
                  <input {...register('timezone')} placeholder="UTC" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Primary Language</label>
                  <input {...register('primaryLanguage')} placeholder="en" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Description</label>
                <textarea {...register('description')} rows={3} placeholder="Company description..." className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Tags</label>
                <div className="flex items-center gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Type a tag and press Enter"
                    className={inputClass}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addTag} className="text-xs">
                    <Tags size={14} /> Add
                  </Button>
                </div>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsList.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={activeSection === 0 ? () => navigate('/companies') : prevSection}
              className="text-xs"
            >
              <ArrowLeft size={14} /> {activeSection === 0 ? 'Cancel' : 'Previous'}
            </Button>
            <div className="flex items-center gap-2">
              {activeSection < formSections.length - 1 ? (
                <Button type="button" variant="primary" size="sm" onClick={nextSection} className="text-xs">
                  Next <ArrowRight size={14} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                  className="text-xs bg-slate-800"
                >
                  <Save size={14} /> Create Company
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyAdd;
