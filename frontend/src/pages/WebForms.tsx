import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { FileText, Plus, Search, Trash2, Loader2, ToggleLeft, ToggleRight, Code } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { webformApi } from '../services/webformApi';

interface WebForm {
  id: string;
  name: string;
  fields: number;
  isActive: boolean;
  submissionCount: number;
  createdAt: string;
}

export const WebForms: React.FC = () => {
  const breadcrumbs = [{ label: 'Web Forms' }];
  const toast = useToast();

  const [forms, setForms] = useState<WebForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await webformApi.getForms();
      const items = res.data.data?.items || [];
      const mapped = items.map((f: any) => ({
        id: f.id,
        name: f.name,
        fields: f.fields?.length || 0,
        isActive: f.isActive,
        submissionCount: f.submissionCount || 0,
        createdAt: f.createdAt ? f.createdAt.split('T')[0] : '',
      }));
      setForms(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch web forms.');
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
      await webformApi.createForm({ name });
      toast.success('Form Created', `${name} created successfully.`);
      setShowAddModal(false);
      setName('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create form.');
    }
  };

  const handleDelete = async (id: string, formName: string) => {
    if (confirm(`Delete web form "${formName}"?`)) {
      try {
        await webformApi.deleteForm(id);
        toast.success('Form Deleted', 'Web form removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete form.');
      }
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      if (current) {
        await webformApi.deactivateForm(id);
        toast.success('Form Deactivated', 'Form is now inactive.');
      } else {
        await webformApi.activateForm(id);
        toast.success('Form Activated', 'Form is now live.');
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to toggle form status.');
    }
  };

  const handleEmbedCode = async (id: string, formName: string) => {
    try {
      const res = await webformApi.getEmbedCode(id);
      const code = res.data.data?.embedCode || res.data.data || '';
      navigator.clipboard.writeText(code);
      toast.success('Copied', `Embed code for "${formName}" copied to clipboard.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed', 'Could not retrieve embed code.');
    }
  };

  const filtered = forms.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Web Forms</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Form</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading web forms...</p>
          </div>
        ) : (
          <>
            {forms.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={forms.length === 0 ? 'No Web Forms' : 'No Matches Found'}
                  description={forms.length === 0 ? 'Create web-to-lead forms to capture leads from your website.' : 'Adjust your search query.'}
                  icon={<FileText className="w-12 h-12 text-slate-300" />}
                  actionLabel={forms.length === 0 ? 'New Form' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Form Name</th>
                      <th className="px-4 py-2.5">Fields</th>
                      <th className="px-4 py-2.5">Submissions</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{f.name}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{f.fields}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{f.submissionCount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${
                            f.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {f.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{f.createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleActive(f.id, f.isActive)}
                              className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded-lg text-slate-400"
                              title={f.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {f.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                            </button>
                            <button
                              onClick={() => handleEmbedCode(f.id, f.name)}
                              className="p-1 hover:bg-sky-50 hover:text-sky-600 rounded-lg text-slate-400"
                              title="Copy Embed Code"
                            >
                              <Code size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id, f.name)}
                              className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400"
                            >
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Create Web Form</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Define your web-to-lead form.</p>
            <form onSubmit={handleAdd} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Form Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Contact Us Form"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50"
                />
              </div>
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
                  disabled={!name.trim()}
                  className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl"
                >
                  Create Form
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebForms;
