import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';

interface Quote {
  id: string;
  quoteNumber: string;
  subject: string;
  value: number;
  company: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired' | 'Declined';
  expiryDate: string;
  createdAt: string;
}

export const Quotes: React.FC = () => {
  const breadcrumbs = [{ label: 'Quotes' }];
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [value, setValue] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent'>('Draft');

  const companyIdParam = searchParams.get('companyId') || '';

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products safely
      try {
        const prodRes = await api.get('/products');
        const prods = prodRes.data.data?.items || [];
        setProducts(prods);
      } catch (err) {
        console.warn('Failed to load products list for quotes modal', err);
      }

      // Load companies safely
      try {
        const compRes = await api.get('/companies');
        const comps = compRes.data.data?.items || [];
        setCompanies(comps);
      } catch (err) {
        console.warn('Failed to load companies list for quotes modal', err);
      }

      // Load quotes
      let quotesRes;
      if (companyIdParam) {
        quotesRes = await api.get(`/companies/${companyIdParam}/quotes`);
      } else {
        quotesRes = await api.get('/quotes');
      }
      const items = quotesRes.data.data?.items || quotesRes.data.data || [];
      const mapped = items.map((q: any) => ({
        id: q.id,
        quoteNumber: q.number,
        subject: q.subject || 'Pricing Proposal',
        value: q.total || q.subtotal || 0,
        company: q.customer?.company?.name || q.customer?.name || 'Standard Account',
        status: q.status ? (q.status.charAt(0).toUpperCase() + q.status.slice(1)) : 'Draft',
        expiryDate: q.validUntil ? q.validUntil.split('T')[0] : '',
        createdAt: q.createdAt ? q.createdAt.split('T')[0] : '',
      }));
      setQuotes(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch quotes directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyIdParam]);

  useEffect(() => {
    const isNew = searchParams.get('new') === 'true';
    if (isNew) {
      if (companyIdParam) {
        setSelectedCompanyId(companyIdParam);
      }
      setShowAddModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('new');
      newParams.delete('companyId');
      newParams.delete('companyName');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Ensure default categories and products exist
  const getOrCreateDefaultProduct = async () => {
    let activeProds = products;
    if (products.length === 0) {
      // Create category first
      let catId;
      try {
        const catRes = await api.get('/products/categories');
        const cats = catRes.data.data || [];
        if (cats.length === 0) {
          const newCat = await api.post('/products/categories', { name: 'General', description: 'General Category' });
          catId = newCat.data.data.id;
        } else {
          catId = cats[0].id;
        }

        // Create product
        const newProd = await api.post('/products', {
          name: 'CRM Premium Subscription Plan',
          sku: `FCRM-PROD-${Date.now()}`,
          price: 999,
          categoryId: catId,
          isActive: true
        });
        const createdProd = newProd.data.data;
        activeProds = [createdProd];
        setProducts(activeProds);
      } catch (err) {
        console.error('Failed to create default catalog:', err);
      }
    }
    return activeProds;
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    try {
      // 1. Resolve company customer ID
      let targetCompanyId = selectedCompanyId;
      if (!targetCompanyId && companies.length > 0) {
        targetCompanyId = companies[0].id;
      }
      if (!targetCompanyId) {
        toast.error('No Company Selected', 'Please select or add a company first.');
        return;
      }

      const custRes = await api.get(`/companies/${targetCompanyId}/customer`);
      const customerId = custRes.data.data?.id;
      if (!customerId) {
        toast.error('Customer Resolve Failed', 'Could not link company customer profile.');
        return;
      }

      // 2. Ensure product catalog item
      const activeProds = await getOrCreateDefaultProduct();
      let targetProdId = selectedProductId;
      if (!targetProdId && activeProds.length > 0) {
        targetProdId = activeProds[0].id;
      }
      if (!targetProdId) {
        toast.error('No Product Available', 'Please add catalog products first.');
        return;
      }

      const prodObj = activeProds.find(p => p.id === targetProdId) || activeProds[0];
      const items = [
        {
          productId: prodObj.id,
          quantity: Number(quantity) || 1,
          unitPrice: Number(value) || prodObj.price || 999,
        }
      ];

      // 3. Dispatch POST Quote
      const validUntil = expiryDate 
        ? new Date(expiryDate).toISOString() 
        : new Date(Date.now() + 15 * 24 * 3600000).toISOString();

      await api.post('/quotes', {
        customerId,
        validUntil,
        taxRate: 5,
        discount: 0,
        items,
        subject,
      });

      toast.success('Quote Registered', 'Commercial pricing quote registered.');
      setShowAddModal(false);
      setSubject('');
      setValue('');
      setSelectedCompanyId('');
      setSelectedProductId('');
      setQuantity('1');
      setExpiryDate('');
      setStatus('Draft');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Quote Error', err.response?.data?.message || 'Failed to save quote.');
    }
  };

  const handleDelete = async (id: string, quoteNumber: string) => {
    if (confirm(`Delete quote "${quoteNumber}"?`)) {
      try {
        await api.delete(`/quotes/${id}`);
        toast.success('Quote Removed', 'Pricing quote deleted.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete quote.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'expired': return 'bg-slate-50 text-slate-450 border-slate-100';
      case 'declined': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  };

  const filteredQuotes = quotes.filter(q =>
    q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Quotes</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Quote</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading quotes...</p>
          </div>
        ) : (
          <>
            {quotes.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search quotes by number, subject, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filteredQuotes.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={quotes.length === 0 ? "No Quotes Created" : "No Matches Found"}
                  description={quotes.length === 0 ? "Issue pricing proposal quotes and convert deals to invoices." : "Adjust search filter inputs."}
                  icon={<FileText className="w-12 h-12 text-slate-300" />}
                  actionLabel={quotes.length === 0 ? "New Quote" : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Quote Number</th>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Client Account</th>
                      <th className="px-4 py-2.5">Value</th>
                      <th className="px-4 py-2.5">Expiry Date</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-100 font-mono">{q.quoteNumber}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{q.subject}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{q.company}</td>
                        <td className="px-4 py-3 font-bold text-emerald-650">${q.value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-450 font-semibold">{q.expiryDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusBadge(q.status)}`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(q.id, q.quoteNumber)}
                            className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* NEW QUOTE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Pricing Proposal Quote</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set pricing details and quote parameters.</p>

            <form onSubmit={handleAddQuote} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Proposal Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud API Migration Bundle Setup"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Estimated Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="9999"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Company Account</label>
                  {companyIdParam ? (
                    <input
                      type="text"
                      disabled
                      value={companies.find(c => c.id === companyIdParam)?.name || 'Linked Company'}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-semibold"
                    />
                  ) : (
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                    >
                      <option value="">Select Company...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                  </select>
                </div>
              </div>

              {products.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Product Catalog *</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const prObj = products.find(p => p.id === e.target.value);
                        if (prObj) setValue(String(prObj.price));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                    >
                      <option value="">Choose product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Quantity *</label>
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!subject.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Quote
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Quotes;
