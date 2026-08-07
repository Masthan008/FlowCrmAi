import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Plus, Search, Trash2, Loader2, CheckCircle2, Truck, Package, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { orderApi } from '../services/orderApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  customerName?: string;
  createdAt: string;
}

export default function Orders() {
  const breadcrumbs = [{ label: 'Lead-to-Cash' }, { label: 'Customer Orders' }];
  const toast = useToast();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [total, setTotal] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.list();
      const raw = res.data.data?.items || res.data.data || [];
      const mapped = raw.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: o.status || 'confirmed',
        total: o.total || 0,
        customerName: o.customer ? `${o.customer.firstName} ${o.customer.lastName}` : 'Enterprise Client',
        createdAt: o.createdAt ? o.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      }));
      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    try {
      await orderApi.create({ orderNumber, total: Number(total) || 0 });
      toast.success('Order Created! 🎉', `Order "${orderNumber}" has been registered.`);
      setShowAddModal(false);
      setOrderNumber('');
      setTotal('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create order.');
    }
  };

  const handleDelete = async (id: string, orderNum: string) => {
    if (confirm(`Delete order "${orderNum}"?`)) {
      try {
        await orderApi.delete(id);
        toast.success('Order Deleted', 'Order removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete order.');
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await orderApi.updateStatus(id, status);
      toast.success('Status Updated', `Order is now "${status}".`);
      loadData();
    } catch (err) {
      toast.error('Update Failed', 'Failed to update order status.');
    }
  };

  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': case 'processing': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': case 'refunded': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filtered = items.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter;
    const matchQuery =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const totalOrderValue = (items || []).reduce((acc, curr) => acc + curr.total, 0);
  const deliveredCount = (items || []).filter(o => o.status === 'delivered' || o.status === 'completed').length;
  const processingCount = (items || []).filter(o => o.status === 'confirmed' || o.status === 'processing' || o.status === 'shipped').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 select-none font-sans pb-16"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-glossy-sm">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-850 tracking-tight font-display mt-1">
            Customer Orders & Fulfillment Engine
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track order status, convert approved quotes, and trigger automated invoice fulfillment.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Order</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Order Value</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">₹{totalOrderValue.toLocaleString('en-IN')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">{items.length} Orders</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Logged customer contracts</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Fulfillment in Progress</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{processingCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Processing & Shipped</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Active logistics pipeline</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Delivered & Reconciled</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{deliveredCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Fulfilled</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Completed order fulfillment</p>
        </SpotlightCard>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-extrabold capitalize rounded-xl transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-brand-550 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing Order Ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={items.length === 0 ? 'No Customer Orders' : 'No Matching Orders'}
              description={items.length === 0 ? 'Create orders or convert approved quotes into official contracts.' : 'Try adjusting search or status filter.'}
              icon={<ShoppingCart className="w-12 h-12 text-slate-300" />}
              actionLabel={items.length === 0 ? 'Create First Order' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Order Number</th>
                  <th className="px-5 py-3.5">Customer / Account</th>
                  <th className="px-5 py-3.5">Contract Total</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((o) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-850 flex items-center gap-2">
                      <Package className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{o.orderNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{o.customerName}</td>
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-850 text-sm">₹{o.total?.toLocaleString('en-IN') || 0}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${getStatusColor(o.status)}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{o.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'delivered')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button onClick={() => handleDelete(o.id, o.orderNumber)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Create Customer Order</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Order Number / Reference *</label>
                <input type="text" required placeholder="ORD-2026-8801" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Total Contract Value (₹) *</label>
                <input type="number" required placeholder="125000" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!orderNumber.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Register Order</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
