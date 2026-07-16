import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Receipt, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { api } from '../services/api';

interface Invoice {
  id: string;
  invoiceNumber: string;
  subject: string;
  amount: number;
  company: string;
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled';
  dueDate: string;
  createdAt: string;
}

export const Invoices: React.FC = () => {
  const breadcrumbs = [{ label: 'Invoices' }];
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price: number }[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'invoiceNumber' | 'company' | 'createdAt'>('invoiceNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Form states
  const [subject, setSubject] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'unpaid' | 'paid'>('unpaid');

  const companyIdParam = searchParams.get('companyId') || '';

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products
      const prodRes = await api.get('/products');
      const prods = prodRes.data.data?.items || [];
      setProducts(prods);

      // Load companies
      const compRes = await api.get('/companies');
      const comps = compRes.data.data?.items || [];
      setCompanies(comps);

      // Load invoices
      let invoicesRes;
      if (companyIdParam) {
        invoicesRes = await api.get(`/companies/${companyIdParam}/invoices`);
      } else {
        invoicesRes = await api.get('/invoices');
      }
      const items = invoicesRes.data.data?.items || invoicesRes.data.data || [];
      const mapped = items.map((i: any) => {
        let displayStatus: 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled' = 'Unpaid';
        if (i.status === 'paid') displayStatus = 'Paid';
        else if (i.status === 'overdue') displayStatus = 'Overdue';
        else if (i.status === 'cancelled') displayStatus = 'Cancelled';

        return {
          id: i.id,
          invoiceNumber: i.number,
          subject: i.subject || 'Billing Invoice',
          amount: i.total || i.subtotal || 0,
          company: i.customer?.company?.name || i.customer?.name || 'Standard Account',
          status: displayStatus,
          dueDate: i.dueDate ? i.dueDate.split('T')[0] : '',
          createdAt: i.createdAt ? i.createdAt.split('T')[0] : '',
        };
      });
      setInvoices(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch billing invoices.');
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

  // Ensure default category and product exist
  const getOrCreateDefaultProduct = async () => {
    let activeProds = products;
    if (products.length === 0) {
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

  const handleAddInvoice = async (e: React.FormEvent) => {
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
          unitPrice: Number(amount) || prodObj.price || 999,
        }
      ];

      // 3. Dispatch POST Invoice
      const calculatedDueDate = dueDate 
        ? new Date(dueDate).toISOString() 
        : new Date(Date.now() + 30 * 24 * 3600000).toISOString();

      await api.post('/invoices', {
        customerId,
        dueDate: calculatedDueDate,
        taxRate: 5,
        discount: 0,
        items,
        subject,
      });

      toast.success('Invoice Registered', 'Billing invoice registered.');
      setShowAddModal(false);
      setSubject('');
      setAmount('');
      setSelectedCompanyId('');
      setSelectedProductId('');
      setQuantity('1');
      setDueDate('');
      setStatus('unpaid');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Invoice Error', err.response?.data?.message || 'Failed to save invoice.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const backendStatus = newStatus.toLowerCase();
      await api.put(`/invoices/${id}`, { status: backendStatus });
      toast.success('Status Updated', `Invoice status changed to ${newStatus}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to update invoice status.');
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (confirm(`Remove billing invoice "${num}"?`)) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success('Invoice Removed', 'Billing invoice record deleted.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete invoice.');
      }
    }
  };

  const handleSort = (field: 'invoiceNumber' | 'company' | 'createdAt') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'unpaid': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'cancelled': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-slate-50 text-slate-655 border-slate-200';
    }
  };

  const filteredInvoices = invoices.filter(i =>
    i.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortBy === 'invoiceNumber' || sortBy === 'company') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Invoices</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Invoice</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading billing invoices...</p>
          </div>
        ) : (
          <>
            {invoices.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex max-w-sm relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search billing invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                  />
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-450 font-bold uppercase text-[9px] tracking-wider">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="invoiceNumber">Invoice No</option>
                    <option value="company">Client Name</option>
                    <option value="createdAt">Date Created</option>
                  </select>
                  <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as any)}
                    className="px-3 py-1.5 border border-slate-200 bg-white rounded-xl font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            )}

            {sortedInvoices.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={invoices.length === 0 ? "No Invoices Registered" : "No Matches Found"}
                  description={invoices.length === 0 ? "Generate billing invoices, track invoice status, and record payments." : "Adjust search filter inputs."}
                  icon={<Receipt className="w-12 h-12 text-slate-300" />}
                  actionLabel={invoices.length === 0 ? "New Invoice" : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('invoiceNumber')}>
                        Invoice Number {sortBy === 'invoiceNumber' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('company')}>
                        Client Account {sortBy === 'company' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2.5">Billing Amount</th>
                      <th className="px-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors" onClick={() => handleSort('createdAt')}>
                        Date Created {sortBy === 'createdAt' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {sortedInvoices.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-855 dark:text-slate-100 font-mono">{i.invoiceNumber}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{i.subject}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{i.company}</td>
                        <td className="px-4 py-3 font-black text-slate-855 dark:text-slate-100">${i.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-450 font-semibold">{i.dueDate}</td>
                        <td className="px-4 py-3">
                          <select
                            value={i.status.toLowerCase()}
                            onChange={(e) => handleUpdateStatus(i.id, e.target.value)}
                            className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusBadge(i.status)} bg-white focus:outline-none cursor-pointer`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(i.id, i.invoiceNumber)}
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

      {/* NEW INVOICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Billing Invoice</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Set billing details and invoice parameters.</p>

            <form onSubmit={handleAddInvoice} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Billing Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly hosting integration support fees"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Billing Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
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
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
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
                        if (prObj) setAmount(String(prObj.price));
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
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Invoices;
