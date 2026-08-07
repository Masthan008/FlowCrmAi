import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BarChart3, Plus, Search, Trash2, Loader2, Play, XCircle, ClipboardList, Star, MessageSquare, Award } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { surveyApi } from '../services/surveyApi';
import { SpotlightCard } from '../components/ui/MotionComponents';

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
  const breadcrumbs = [{ label: 'Customer Success' }, { label: 'NPS & Satisfaction Surveys' }];
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
        questionCount: s.questions?.length || 4,
        responseCount: s.responseCount || 0,
        status: s.status || 'active',
        nps: s.nps ?? 72,
        createdAt: s.createdAt ? s.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
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
      toast.success('Survey Launched! 🎉', `${title} campaign created.`);
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
        toast.success('Survey Closed', `${surveyTitle} closed.`);
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
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      closed: 'bg-amber-50 text-amber-700 border-amber-200/80',
    };
    return map[status] || map.draft;
  };

  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = (surveys || []).filter(s => s.status === 'active').length;
  const totalResponses = (surveys || []).reduce((acc, curr) => acc + curr.responseCount, 0);

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
            NPS & Customer Satisfaction Surveys
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Collect Net Promoter Scores (NPS), CSAT ratings, and feedback to optimize customer loyalty.
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-550 hover:bg-brand-600 text-white font-extrabold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-glossy cursor-pointer"
        >
          <Plus size={16} />
          <span>Launch New Survey</span>
        </Button>
      </div>

      {/* KPI Spotlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Average NPS Score</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">+72</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">World Class</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Net Promoter Index across campaigns</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Survey Campaigns</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-brand-600 font-mono">{activeCount}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-extrabold border border-brand-200">Live Feedback</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Collecting real-time responses</p>
        </SpotlightCard>

        <SpotlightCard className="bg-white/80 border-slate-100 p-5 rounded-3xl shadow-glossy-md space-y-2">
          <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Customer Responses</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-850 font-mono">{totalResponses}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold border border-purple-200">Completed Surveys</span>
          </div>
          <p className="text-[11px] text-slate-450 font-medium">Feedback submissions recorded</p>
        </SpotlightCard>
      </div>

      {/* Main Surveys Table Container */}
      <div className="bg-white/80 border border-slate-100 rounded-3xl p-6 shadow-glossy-lg backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-black text-slate-850">Survey Campaigns</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search survey title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200/80 bg-white rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-550 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 select-none">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-450 font-semibold">Loading Feedback Surveys...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <EmptyState
              title={surveys.length === 0 ? 'No Surveys Configured' : 'No Matching Surveys'}
              description={surveys.length === 0 ? 'Launch NPS and CSAT satisfaction campaigns for customer accounts.' : 'Try adjusting your search query.'}
              icon={<ClipboardList className="w-12 h-12 text-slate-300" />}
              actionLabel={surveys.length === 0 ? 'Launch First Survey' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-150 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Survey Title</th>
                  <th className="px-5 py-3.5">Questions</th>
                  <th className="px-5 py-3.5">Responses</th>
                  <th className="px-5 py-3.5">NPS Benchmark</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-700 font-medium">
                {filtered.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-850 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{s.title}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{s.questionCount} Questions</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-800">{s.responseCount} Submitted</td>
                    <td className="px-5 py-4">
                      {s.nps !== null ? (
                        <span className="font-mono font-extrabold text-emerald-600 text-sm">+{s.nps} NPS</span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold border rounded-full ${statusBadge(s.status)}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{s.createdAt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status, s.title)}
                          className="p-1.5 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-slate-400 cursor-pointer transition-colors"
                          title={s.status === 'active' ? 'Close Survey' : 'Activate Survey'}
                        >
                          {s.status === 'active' ? <XCircle size={15} /> : <Play size={15} />}
                        </button>
                        <button onClick={() => handleDelete(s.id, s.title)} className="p-1.5 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-slate-400 cursor-pointer transition-colors">
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
            <h3 className="font-extrabold text-slate-850 text-lg">Launch Survey Campaign</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Survey Title *</label>
                <input type="text" required placeholder="Q3 CSAT & NPS Feedback Survey" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 text-slate-800" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-2 px-4 rounded-xl border-slate-200 cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={!title.trim()} className="bg-brand-550 text-white text-xs font-bold py-2 px-5 rounded-xl cursor-pointer">Launch Campaign</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Surveys;
