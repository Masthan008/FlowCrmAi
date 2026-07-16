import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Monitor, Plus, Search, Trash2, Loader2, UserCheck, Archive } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { assetApi } from '../services/assetApi';

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
  const breadcrumbs = [{ label: 'Assets' }];
  const toast = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
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
        type: a.type || '-',
        serialNumber: a.serialNumber || '-',
        assignedTo: a.assignedTo || '-',
        status: a.status || 'available',
        purchaseDate: a.purchaseDate ? a.purchaseDate.split('T')[0] : '-',
        createdAt: a.createdAt ? a.createdAt.split('T')[0] : '',
      }));
      setAssets(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch assets.');
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
      toast.success('Asset Created', `${name} registered.`);
      setShowAddModal(false);
      setName('');
      setType('');
      setSerialNumber('');
      setPurchaseDate('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create asset.');
    }
  };

  const handleAssign = async (asset: Asset) => {
    const assignee = prompt(`Assign "${asset.name}" to:`);
    if (!assignee?.trim()) return;
    try {
      await assetApi.assignAsset(asset.id, { assignedTo: assignee });
      toast.success('Asset Assigned', `Assigned to ${assignee}.`);
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
        toast.success('Asset Deleted', 'Asset removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete asset.');
      }
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      assigned: 'bg-blue-50 text-blue-700 border-blue-100',
      retired: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    return map[status] || map.available;
  };

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Assets</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Asset</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading assets...</p>
          </div>
        ) : (
          <>
            {assets.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={assets.length === 0 ? 'No Assets' : 'No Matches Found'}
                  description={assets.length === 0 ? 'Track company hardware, software licenses, and equipment.' : 'Adjust your search query.'}
                  icon={<Monitor className="w-12 h-12 text-slate-300" />}
                  actionLabel={assets.length === 0 ? 'New Asset' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Asset Name</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Serial #</th>
                      <th className="px-4 py-2.5">Assigned To</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Purchased</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{a.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{a.type}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono font-bold">{a.serialNumber}</td>
                        <td className="px-4 py-3 text-slate-500">{a.assignedTo}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${statusBadge(a.status)}`}>
                            {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{a.purchaseDate}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {a.status !== 'retired' && (
                              <>
                                <button onClick={() => handleAssign(a)} className="p-1 hover:bg-sky-50 hover:text-sky-600 rounded-lg text-slate-400" title="Assign">
                                  <UserCheck size={13} />
                                </button>
                                <button onClick={() => handleRetire(a.id, a.name)} className="p-1 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400" title="Retire">
                                  <Archive size={13} />
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDelete(a.id, a.name)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400">
                              <Trash2 size={13} />
                            </button>
                          </div>
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Register Asset</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Add a new company asset.</p>
            <form onSubmit={handleAdd} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Asset Name *</label>
                <input type="text" required placeholder="MacBook Pro 16" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                  <input type="text" placeholder="Laptop" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Serial #</label>
                  <input type="text" placeholder="SN-12345" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Purchase Date</label>
                <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!name.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
