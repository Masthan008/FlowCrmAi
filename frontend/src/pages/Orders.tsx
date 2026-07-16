import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { orderApi } from '../services/orderApi';

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function Orders() {
  const breadcrumbs = [{ label: 'Orders' }];
  const toast = useToast();

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [total, setTotal] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await orderApi.list();
      setItems(res.data.data?.items || []);
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
      toast.success('Order Created', `Order "${orderNumber}" has been created.`);
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
        toast.success('Order Deleted', 'Order has been removed.');
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
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'confirmed': case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'delivered': case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': case 'refunded': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filtered = items.filter(o =>
    o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Orders</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
          <Plus size={14} />
          <span>New Order</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading orders...</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={items.length === 0 ? 'No Orders' : 'No Matches Found'}
                  description={items.length === 0 ? 'Create your first order.' : 'Adjust search parameters.'}
                  icon={<ShoppingCart className="w-12 h-12 text-slate-300" />}
                  actionLabel={items.length === 0 ? 'New Order' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Order #</th>
                      <th className="px-4 py-2.5">Total</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 font-mono">{o.orderNumber}</td>
                        <td className="px-4 py-3 font-black text-slate-850 dark:text-slate-100">${o.total?.toLocaleString() || 0}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${getStatusColor(o.status)} cursor-pointer`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{o.createdAt?.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDelete(o.id, o.orderNumber)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Delete"><Trash2 size={13} /></button>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Order</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Create a new order record.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Order Number *</label>
                <input type="text" required placeholder="e.g. ORD-001" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Total ($)</label>
                <input type="number" placeholder="499.99" value={total} onChange={(e) => setTotal(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!orderNumber.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Order</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
