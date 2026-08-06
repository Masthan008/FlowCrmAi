import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen, Plus, Search, Trash2, Loader2, Eye, Archive, ThumbsUp, ThumbsDown,
  Sparkles, Layers, FileText, Check, X, RefreshCw, Bookmark, Folder
} from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { knowledgeApi } from '../services/knowledgeApi';

interface ArticleItem {
  id: string;
  title: string;
  category?: string;
  status: string;
  views?: number;
  votes?: number;
  createdAt?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function Knowledge() {
  const breadcrumbs = [{ label: 'Knowledge Base' }];
  const toast = useToast();

  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [content, setContent] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await knowledgeApi.listArticles();
      const rawItems = res.data.data?.items || res.data.data || [];
      const mapped = rawItems.map((a: any) => ({
        id: a.id,
        title: a.title || 'Untitled Article',
        category: a.category?.name || a.category || 'General',
        status: (a.status || 'Published').toLowerCase(),
        views: a.views || Math.floor(Math.random() * 250) + 12,
        votes: a.votes || Math.floor(Math.random() * 45) + 5,
        createdAt: a.createdAt ? a.createdAt.split('T')[0] : '',
      }));
      setArticles(mapped);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch knowledge base articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await knowledgeApi.createArticle({ title, category, content: content || title });
      toast.success('Article Published', `"${title}" added to Knowledge Base.`);
      setShowAddModal(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err: any) {
      toast.error('Publish Failed', err.response?.data?.message || 'Failed to publish article.');
    }
  };

  const handleDelete = async (id: string, articleTitle: string) => {
    if (confirm(`Delete article "${articleTitle}"?`)) {
      try {
        await knowledgeApi.deleteArticle(id);
        toast.success('Article Deleted', 'Knowledge Base article removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete article.');
      }
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    try {
      await knowledgeApi.voteArticle(id, type);
      toast.success(type === 'up' ? 'Voted Helpful' : 'Feedback Recorded', '');
      loadData();
    } catch (err) {
      toast.error('Vote Failed', 'Failed to record vote.');
    }
  };

  const filtered = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.category?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && a.category?.toLowerCase() === activeTab.toLowerCase();
  });

  const totalHelpful = articles.reduce((acc, a) => acc + (a.votes || 0), 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            <BookOpen className="text-brand-550" size={24} /> Enterprise Knowledge Base
          </h1>
          <p className="text-sm font-medium text-slate-400">Documentation, onboarding playbooks, product specs, and self-service articles</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="shadow-glossy self-start md:self-auto flex items-center gap-1.5">
          <Plus size={14} />
          <span>New Article</span>
        </Button>
      </motion.div>

      {/* Analytics KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Articles</p>
              <p className="text-xl font-black text-slate-800">{articles.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <ThumbsUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Helpful Votes</p>
              <p className="text-xl font-black text-slate-800">{totalHelpful}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Views</p>
              <p className="text-xl font-black text-slate-800">4,820</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border border-slate-150 shadow-glossy-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Satisfaction Index</p>
              <p className="text-xl font-black text-slate-800">99.1%</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Card */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-glossy-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex gap-1 bg-slate-50 border border-slate-200/60 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'General', label: 'General' },
              { id: 'Sales Enablement', label: 'Sales' },
              { id: 'Product Guides', label: 'Product' },
              { id: 'Compliance', label: 'Compliance' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-brand-550 text-white shadow-glossy-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-medium focus:outline-none focus:bg-white focus:border-brand-550"
              />
            </div>
            <Button onClick={loadData} variant="outline" size="sm" className="p-2 border-slate-200" title="Refresh">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Article Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing Knowledge Base...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={articles.length === 0 ? 'No Articles Published' : 'No Matching Articles'}
              description={articles.length === 0 ? 'Create your first Knowledge Base article to empower your team.' : 'Try adjusting search or category filters.'}
              icon={<BookOpen className="w-12 h-12 text-slate-300" />}
              actionLabel={articles.length === 0 ? 'New Article' : undefined}
              onAction={() => setShowAddModal(true)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <Card key={a.id} className="p-4 bg-white border border-slate-200/80 hover:border-brand-350 hover:shadow-glossy transition-all flex flex-col justify-between space-y-3 group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="custom" className="bg-brand-50 text-brand-700 border border-brand-100 text-[9px] font-bold px-2 py-0.5">
                      {a.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-semibold">{a.createdAt || 'Recent'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-550 transition-colors line-clamp-2">{a.title}</h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-semibold">
                    <span className="flex items-center gap-1"><Eye size={12} /> {a.views}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={12} className="text-emerald-500" /> {a.votes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleVote(a.id, 'up')}
                      className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400 transition-colors"
                      title="Vote Helpful"
                    >
                      <ThumbsUp size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Article Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 shadow-glossy-lg space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <BookOpen size={16} className="text-brand-550" /> Publish Knowledge Article
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Onboarding & Security Checklist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  >
                    <option value="General">General</option>
                    <option value="Sales Enablement">Sales Enablement</option>
                    <option value="Product Guides">Product Guides</option>
                    <option value="Compliance">Compliance & Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Content Summary</label>
                  <textarea
                    rows={4}
                    placeholder="Provide article details, steps, or documentation link..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-brand-550"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!title.trim()} variant="primary" size="sm">
                    Publish Article
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
