import React, { useState, useEffect } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BookOpen, Plus, Search, Trash2, Loader2, Eye, Archive, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';
import { knowledgeApi } from '../services/knowledgeApi';

interface Article {
  id: string;
  title: string;
  category?: { name: string };
  status: string;
  createdAt: string;
}

export default function Knowledge() {
  const breadcrumbs = [{ label: 'Knowledge Base' }];
  const toast = useToast();

  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await knowledgeApi.listArticles();
      setItems(res.data.data?.items || []);
    } catch (err) {
      console.error(err);
      toast.error('Load Failed', 'Failed to fetch articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await knowledgeApi.createArticle({ title, content });
      toast.success('Article Created', `"${title}" has been created.`);
      setShowAddModal(false);
      setTitle('');
      setContent('');
      loadData();
    } catch (err: any) {
      toast.error('Create Failed', err.response?.data?.message || 'Failed to create article.');
    }
  };

  const handleDelete = async (id: string, articleTitle: string) => {
    if (confirm(`Delete article "${articleTitle}"?`)) {
      try {
        await knowledgeApi.deleteArticle(id);
        toast.success('Article Deleted', 'Article has been removed.');
        loadData();
      } catch (err) {
        toast.error('Delete Failed', 'Failed to delete article.');
      }
    }
  };

  const handlePublish = async (id: string, articleTitle: string) => {
    try {
      await knowledgeApi.publishArticle(id);
      toast.success('Article Published', `"${articleTitle}" is now live.`);
      loadData();
    } catch (err) {
      toast.error('Publish Failed', 'Failed to publish article.');
    }
  };

  const handleArchive = async (id: string, articleTitle: string) => {
    try {
      await knowledgeApi.archiveArticle(id);
      toast.success('Article Archived', `"${articleTitle}" has been archived.`);
      loadData();
    } catch (err) {
      toast.error('Archive Failed', 'Failed to archive article.');
    }
  };

  const filtered = items.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Breadcrumb items={breadcrumbs} />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Knowledge Base</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-glossy self-start md:self-auto">
          <Plus size={14} />
          <span>New Article</span>
        </Button>
      </div>

      <div className="glass-card p-6 min-h-[400px] space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
            <Loader2 className="w-8 h-8 text-brand-550 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading articles...</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="flex max-w-sm relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-slate-50/50 rounded-xl text-xs" />
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <EmptyState
                  title={items.length === 0 ? 'No Articles' : 'No Matches Found'}
                  description={items.length === 0 ? 'Create your first knowledge base article.' : 'Adjust search parameters.'}
                  icon={<BookOpen className="w-12 h-12 text-slate-300" />}
                  actionLabel={items.length === 0 ? 'New Article' : undefined}
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase select-none">
                      <th className="px-4 py-2.5">Title</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655 font-medium">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{a.title}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold">{a.category?.name || 'General'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-full ${a.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : a.status === 'draft' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>{a.status}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{a.createdAt?.split('T')[0]}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {a.status !== 'published' && (
                              <button onClick={() => handlePublish(a.id, a.title)} className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg text-slate-400" title="Publish"><Eye size={13} /></button>
                            )}
                            {a.status !== 'archived' && (
                              <button onClick={() => handleArchive(a.id, a.title)} className="p-1 hover:bg-amber-50 hover:text-amber-600 rounded-lg text-slate-400" title="Archive"><Archive size={13} /></button>
                            )}
                            <button onClick={() => handleDelete(a.id, a.title)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400" title="Delete"><Trash2 size={13} /></button>
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
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-glossy-lg">
            <h3 className="font-bold text-slate-800 text-sm mb-1">New Article</h3>
            <p className="text-[10px] text-slate-400 font-medium mb-4">Write a knowledge base article.</p>
            <form onSubmit={handleCreate} className="space-y-3.5 text-slate-700 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Title *</label>
                <input type="text" required placeholder="e.g. How to Reset Password" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Content</label>
                <textarea placeholder="Write article content..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 resize-none" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="text-xs font-bold py-1.5 px-3 rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" disabled={!title.trim()} className="bg-brand-550 text-white text-xs font-bold py-1.5 px-3 rounded-xl">Create Article</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
