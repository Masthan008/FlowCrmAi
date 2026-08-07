import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Monitor, Plus, Search, Trash2, Loader2, UserCheck, Archive, HardDrive, Laptop, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { assetApi } from '../services/assetApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  assignedTo: string;
  status: 'available' | 'assigned' | 'retired';
  purchaseDate: string;
  createdAt: string;
}

export const Assets: React.FC = () => {
  const breadcrumbs = [{ label: 'IT & Infrastructure' }, { label: 'Asset Management' }];
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await assetApi.getAssets();
      const items = res.data.data?.items || [];
      const mapped = items.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type || 'Hardware',
        serialNumber: a.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        assignedTo: a.assignedTo || '-',
        status: a.status || 'available',
        purchaseDate: a.purchaseDate ? a.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: a.createdAt ? a.createdAt.split('T')[0] : '',
      }));
      setAssets(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch IT assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await assetApi.createAsset({ name, type, serialNumber, purchaseDate });
      toast.success('Asset Registered! 🎉', `${name} added to inventory.`);
      setShowAddModal(false);
      setName('');
      setType('Laptop');
      setSerialNumber('');
      setPurchaseDate('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create asset.');
    }
  };

  const handleAssign = async (asset: Asset) => {
    const assignee = prompt(`Assign "${asset.name}" to employee name:`);
    if (!assignee?.trim()) return;
    try {
      await assetApi.assignAsset(asset.id, { assignedTo: assignee });
      toast.success('Asset Assigned', `${asset.name} assigned to ${assignee}.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Assign Failed', 'Failed to assign asset.');
    }
  };

  const handleRetire = async (id: string, assetName: string) => {
    if (confirm(`Retire asset "${assetName}"?`)) {
      try {
        await assetApi.retireAsset(id);
        toast.success('Asset Retired', `${assetName} retired.`);
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Retire Failed', 'Failed to retire asset.');
      }
    }
  };

  const handleDelete = async (id: string, assetName: string) => {
    if (confirm(`Delete asset "${assetName}"?`)) {
      try {
        await assetApi.deleteAsset(id);
        toast.success('Asset Deleted', 'Asset record removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete asset.');
      }
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      assigned: 'bg-brand-50 text-brand-700 border-brand-200/80',
      retired: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[status] || map.available;
  };

  const filtered = assets.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchQuery =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const availableCount = (assets || []).filter(a => a.status === 'available').length;
  const assignedCount = (assets || []).filter(a => a.status === 'assigned').length;

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
            IT & Hardware Asset Inventory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track laptops, workstations, mobile devices, licenses, and employee assignments.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Register New Asset</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Hardware Assets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{assets.length}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Registered</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Corporate IT hardware</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Assignments</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{assignedCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">In Use</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Assigned to team members</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Available Inventory</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{availableCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">Ready to Deploy</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">In stock in IT bay</p>
        </SpotlightCard>
      </div>

      {/* Main Assets Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1.5 rounded-2xl">
            {['all', 'available', 'assigned', 'retired'].map(st => (
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

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by asset, SN, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Synchronizing IT Inventory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={assets.length === 0 ? 'No Assets Registered' : 'No Matching Assets'}
              description={assets.length === 0 ? 'Log your corporate hardware assets, laptops, and mobile devices.' : 'Try adjusting your search query.'}
              icon={<Monitor className="w-12 h-12 text-slate-300" />}
              actionLabel={assets.length === 0 ? 'Register First Asset' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Asset Name</th>
                  <th className="px-5 py-3.5">Category Type</th>
                  <th className="px-5 py-3.5">Serial Number</th>
                  <th className="px-5 py-3.5">Assigned Employee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Purchase Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((a) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{a.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{a.type}</td>
                    <td className="px-5 py-4 font-mono text-slate-500">{a.serialNumber}</td>
                    <td className="px-5 py-4 text-slate-800 font-bold">{a.assignedTo}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${statusBadge(a.status)}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{a.purchaseDate}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleAssign(a)} className="p-1.5 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Assign to Employee">
                          <UserCheck size={15} />
                        </button>
                        {a.status !== 'retired' && (
                          <button onClick={() => handleRetire(a.id, a.name)} className="p-1.5 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-slate-400 cursor-pointer transition-colors" title="Retire Asset">
                            <Archive size={15} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(a.id, a.name)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-glossy-lg space-y-4">
            <h3 className="font-extrabold text-slate-850 text-lg">Register Hardware Asset</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Asset Name *</label>
                <input type="text" required placeholder="MacBook Pro M3 / Dell XPS 15" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Category Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800">
                    <option value="Laptop">Laptop / Workstation</option>
                    <option value="Desktop">Desktop Tower</option>
                    <option value="Monitor">Display Monitor</option>
                    <option value="Mobile">Mobile / Tablet</option>
                    <option value="Server">Server Rack</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Serial Number (S/N)</label>
                <input type="text" placeholder="e.g. C02G1234MD6R" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Register Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Assets;
