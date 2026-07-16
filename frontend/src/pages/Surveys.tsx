import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BarChart3, Plus, Search, Trash2, Loader2, Play, XCircle, ClipboardList } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { surveyApi } from '../services/surveyApi';

interface Survey {
  id: string;
  title: string;
  questionCount: number;
  responseCount: number;
  status: 'draft' | 'active' | 'closed';
  nps: number | null;
  createdAt: string;
}

export const Surveys: React.FC = () => {
  const breadcrumbs = [{ label: 'Surveys' }];
  const toast = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await surveyApi.getSurveys();
      const items = res.data.data?.items || [];
      const mapped = items.map((s: any) => ({
        id: s.id,
        title: s.title,
        questionCount: s.questions?.length || 0,
        responseCount: s.responseCount || 0,
        status: s.status || 'draft',
        nps: s.nps ?? null,
        createdAt: s.createdAt ? s.createdAt.split('T')[0] : '',
      }));
      setSurveys(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch surveys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await surveyApi.createSurvey({ title });
      toast.success('Survey Created', `${title} created.`);
      setShowAddModal(false);
      setTitle('');
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create survey.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, surveyTitle: string) => {
    try {
      if (currentStatus === 'draft' || currentStatus === 'closed') {
        await surveyApi.activateSurvey(id);
        toast.success('Survey Activated', `${surveyTitle} is now live.`);
      } else {
        await surveyApi.closeSurvey(id);
        toast.success('Survey Closed', `${surveyTitle} has been closed.`);
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Update Failed', 'Failed to update survey status.');
    }
  };

  const handleDelete = async (id: string, surveyTitle: string) => {
    if (confirm(`Delete survey "${surveyTitle}"?`)) {
      try {
        await surveyApi.deleteSurvey(id);
        toast.success('Survey Deleted', 'Survey removed.');
        loadData();
      } catch (err) {
        console.error(err);
        toast.error('Delete Failed', 'Failed to delete survey.');
      }
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: 'bg-slate-50 text-slate-500 border-slate-200',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      closed: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return map[status] || map.draft;
  };

  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Surveys</h1>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto"
        >
          <Plus size={14} />
          <span>New Survey</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading surveys...</p>
          </div>
        ) : (
          <>
            {surveys.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search surveys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs"
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={surveys.length === 0 ? 'No Surveys' : 'No Matches Found'}
                  description={surveys.length === 0 ? 'Create NPS and customer satisfaction surveys.' : 'Adjust your search query.'}
                  icon={<ClipboardList className="w-12 h-12 text-slate-300" />}
                  actionLabel={surveys.length === 0 ? 'New Survey' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Questions</th>
                      <th className="px-4 py-2.5">Responses</th>
                      <th className="px-4 py-2.5">NPS</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{s.title}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{s.questionCount}</td>
                        <td className="px-4 py-3 text-slate-500">{s.responseCount}</td>
                        <td className="px-4 py-3">
                          {s.nps !== null ? (
                            <span className={`font-black ${s.nps >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {s.nps}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${statusBadge(s.status)}`}>
                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{s.createdAt}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {s.status !== 'closed' && (
                              <button
                                onClick={() => handleToggleStatus(s.id, s.status, s.title)}
                                className={`p-1 rounded-lg ${
                                  s.status === 'active'
                                    ? 'hover:bg-amber-50 hover:text-amber-600 text-slate-400'
                                    : 'hover:bg-emerald-50 hover:text-emerald-600 text-slate-400'
                                }`}
                                title={s.status === 'active' ? 'Close' : 'Activate'}
                              >
                                {s.status === 'active' ? <XCircle size={13} /> : <Play size={13} />}
                              </button>
                            )}
                            <button onClick={() => handleDelete(s.id, s.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400">
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
            <h3 className="font-bold text-slate-800 text-sm mb-1">Create Survey</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Design a new customer survey.</p>
            <form onSubmit={handleAdd} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Survey Title *</label>
                <input type="text" required placeholder="Q4 Customer Satisfaction" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!title.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Survey</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys;
