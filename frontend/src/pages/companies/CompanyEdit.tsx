import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCompanyStore } from '../../store/companyStore';
import { useToast } from '../../components/ui/ToastProvider';
import { Button } from '../../components/ui/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { COMPANY_STATUSES, COMPANY_TYPES, COMPANY_PRIORITIES } from '../../types/company';

export const CompanyEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentCompany, fetchCompany, updateCompany, clearCurrentCompany, loading, error } = useCompanyStore();

  const [formData, setFormData] = useState<any>({});
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompany(id);
    }
    return () => { clearCurrentCompany(); };
  }, [id]);

  useEffect(() => {
    if (currentCompany) {
      setFormData({ ...currentCompany, tags: currentCompany.tags || [] });
    }
  }, [currentCompany]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !(formData.tags || []).includes(trimmed)) {
      handleChange('tags', [...(formData.tags || []), trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    handleChange('tags', (formData.tags || []).filter((t: string) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.companyNumber;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.deletedAt;
      delete payload.version;
      delete payload.createdBy;
      delete payload.updatedBy;
      delete payload.owner;
      delete payload.parentCompany;

      await updateCompany(id, payload);
      toast.success('Company Updated', 'Company record has been updated.');
      navigate(`/companies/${id}`);
    } catch (err: any) {
      toast.error('Update Failed', err?.response?.data?.message || 'Failed to update company.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !currentCompany) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !currentCompany) {
    return (
      <div className="bg-white/80 border border-slate-150 p-12 rounded-3xl text-center shadow-glossy-lg max-w-md mx-auto mt-12">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Company Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'The requested company does not exist.'}</p>
        <Link to="/companies"><Button className="bg-brand-550 text-white font-bold text-xs px-4 py-2 rounded-xl">Back to Companies</Button></Link>
      </div>
    );
  }

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-brand-100';
  const labelClass = 'text-[10px] font-bold text-slate-500 uppercase block mb-1';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={[
            { label: 'Companies', href: '/companies' },
            { label: currentCompany.companyNumber, href: `/companies/${id}` },
            { label: 'Edit' }
          ]} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Edit Company</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/companies/${id}`)} className="text-xs">
          <ArrowLeft size={14} /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-150 rounded-3xl shadow-glossy-lg p-6 space-y-8">
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Company Name *</label>
              <input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Legal Name</label>
              <input value={formData.legalName || ''} onChange={(e) => handleChange('legalName', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Display Name</label>
              <input value={formData.displayName || ''} onChange={(e) => handleChange('displayName', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Company Type</label>
              <select value={formData.companyType || ''} onChange={(e) => handleChange('companyType', e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {COMPANY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Website</label>
              <input value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Industry</label>
              <input value={formData.industry || ''} onChange={(e) => handleChange('industry', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Sub Industry</label>
              <input value={formData.subIndustry || ''} onChange={(e) => handleChange('subIndustry', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Business Category</label>
              <input value={formData.businessCategory || ''} onChange={(e) => handleChange('businessCategory', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Founded Year</label>
              <input type="number" value={formData.foundedYear || ''} onChange={(e) => handleChange('foundedYear', e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Annual Revenue (USD)</label>
              <input type="number" value={formData.annualRevenue || ''} onChange={(e) => handleChange('annualRevenue', e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Employee Count</label>
              <input type="number" value={formData.employeeCount || ''} onChange={(e) => handleChange('employeeCount', e.target.value ? Number(e.target.value) : null)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Ownership Type</label>
              <input value={formData.ownershipType || ''} onChange={(e) => handleChange('ownershipType', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Contact & Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Primary Email</label>
              <input value={formData.primaryEmail || ''} onChange={(e) => handleChange('primaryEmail', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Secondary Email</label>
              <input value={formData.secondaryEmail || ''} onChange={(e) => handleChange('secondaryEmail', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Primary Phone</label>
              <input value={formData.primaryPhone || ''} onChange={(e) => handleChange('primaryPhone', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Secondary Phone</label>
              <input value={formData.secondaryPhone || ''} onChange={(e) => handleChange('secondaryPhone', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>WhatsApp</label>
              <input value={formData.whatsApp || ''} onChange={(e) => handleChange('whatsApp', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>GST Number</label>
              <input value={formData.gstNumber || ''} onChange={(e) => handleChange('gstNumber', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Tax Number</label>
              <input value={formData.taxNumber || ''} onChange={(e) => handleChange('taxNumber', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Registration Number</label>
              <input value={formData.registrationNumber || ''} onChange={(e) => handleChange('registrationNumber', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>PAN Number</label>
              <input value={formData.panNumber || ''} onChange={(e) => handleChange('panNumber', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Country</label>
              <input value={formData.country || ''} onChange={(e) => handleChange('country', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>State</label>
              <input value={formData.state || ''} onChange={(e) => handleChange('state', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>City</label>
              <input value={formData.city || ''} onChange={(e) => handleChange('city', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Postal Code</label>
              <input value={formData.postalCode || ''} onChange={(e) => handleChange('postalCode', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input value={formData.addressLine1 || ''} onChange={(e) => handleChange('addressLine1', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Address Line 2</label>
              <input value={formData.addressLine2 || ''} onChange={(e) => handleChange('addressLine2', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Billing Address</label>
              <textarea value={formData.billingAddress || ''} onChange={(e) => handleChange('billingAddress', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={labelClass}>Shipping Address</label>
              <textarea value={formData.shippingAddress || ''} onChange={(e) => handleChange('shippingAddress', e.target.value)} rows={2} className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Status</label>
              <select value={formData.status || 'Prospect'} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
                {COMPANY_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Priority</label>
              <select value={formData.priority || 'Medium'} onChange={(e) => handleChange('priority', e.target.value)} className={inputClass}>
                {COMPANY_PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Rating</label>
              <input type="number" min={0} max={5} value={formData.rating ?? 0} onChange={(e) => handleChange('rating', Number(e.target.value))} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Currency</label>
              <input value={formData.currency || 'USD'} onChange={(e) => handleChange('currency', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Timezone</label>
              <input value={formData.timezone || 'UTC'} onChange={(e) => handleChange('timezone', e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Language</label>
              <input value={formData.primaryLanguage || 'en'} onChange={(e) => handleChange('primaryLanguage', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <label className={labelClass}>Description</label>
            <textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="mt-4 space-y-1">
            <label className={labelClass}>Tags</label>
            <div className="flex items-center gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag..." className={inputClass} />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} className="text-xs">Add</Button>
            </div>
            {(formData.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(formData.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate(`/companies/${id}`)} className="text-xs">Cancel</Button>
          <Button type="submit" variant="primary" size="sm" isLoading={submitting} className="text-xs bg-slate-800">
            <Save size={14} /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyEdit;
