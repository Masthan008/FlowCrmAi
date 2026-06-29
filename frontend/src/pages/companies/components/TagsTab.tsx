import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCompanyStore } from '../../../store/companyStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Plus, X, Tag, Tags, Check, Search } from 'lucide-react';
import type { CompanyTag, CompanyTagMapping } from '../../../types/company';

interface TagsTabProps {
  companyId: string;
}

const TAG_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

export const TagsTab: React.FC<TagsTabProps> = ({ companyId }) => {
  const {
    tags, companyTags, fetchTags, fetchCompanyTags,
    createTag, deleteTag, assignTags, removeTag,
  } = useCompanyStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTags(), fetchCompanyTags(companyId)]);
      setLoading(false);
    };
    load();
  }, [companyId, fetchTags, fetchCompanyTags]);

  const assignedTagIds = new Set(companyTags.map((ct) => ct.tagId));

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setSaving(true);
    await createTag({ name: newTagName.trim(), color: newTagColor, description: newTagDescription.trim() || null });
    setSaving(false);
    setShowCreateModal(false);
    setNewTagName('');
    setNewTagColor('#3b82f6');
    setNewTagDescription('');
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Delete this tag?')) return;
    await deleteTag(tagId);
  };

  const openAssign = () => {
    setSelectedTagIds([]);
    setSearchQuery('');
    setShowAssignModal(true);
  };

  const toggleAssignSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleAssign = async () => {
    if (selectedTagIds.length === 0) return;
    setSaving(true);
    await assignTags(companyId, selectedTagIds);
    setSaving(false);
    setShowAssignModal(false);
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTag(companyId, tagId);
  };

  const filteredTags = tags.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Tags ({tags.length})</h3>
        <div className="flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={openAssign}>
            <Plus size={14} className="mr-1" /> Assign Tags
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Tag size={14} className="mr-1" /> Create Tag
          </Button>
        </div>
      </div>

      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Company Tags</CardTitle>
          <CardDescription>Tags assigned to this company</CardDescription>
        </CardHeader>
        <CardContent>
          {companyTags.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-4">No tags assigned to this company.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {companyTags.map((ct) => (
                <span
                  key={ct.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${ct.tag.color || '#3b82f6'}15`,
                    color: ct.tag.color || '#3b82f6',
                    borderColor: `${ct.tag.color || '#3b82f6'}30`,
                  }}
                >
                  {ct.tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(ct.tagId)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>All Tags</CardTitle>
          <CardDescription>System-wide tag library</CardDescription>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-4">No tags created yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{
                    backgroundColor: `${tag.color || '#3b82f6'}15`,
                    color: tag.color || '#3b82f6',
                    borderColor: `${tag.color || '#3b82f6'}30`,
                  }}
                >
                  {tag.name}
                  <span className="text-[10px] opacity-60">({tag.usageCount})</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="hover:opacity-70 transition-opacity ml-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Tag">
        <div className="space-y-4">
          <Input
            label="Tag Name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name"
          />
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</label>
            <div className="flex gap-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${newTagColor === color ? 'border-slate-700 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
          </div>
          <Input
            label="Description"
            value={newTagDescription}
            onChange={(e) => setNewTagDescription(e.target.value)}
            placeholder="Optional description"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateTag} isLoading={saving}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Tags" size="lg">
        <div className="space-y-4">
          <Input
            icon={<Search size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags..."
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No tags match your search.</p>
            ) : (
              filteredTags.map((tag) => {
                const isAssigned = assignedTagIds.has(tag.id);
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={isAssigned}
                    onClick={() => !isAssigned && toggleAssignSelection(tag.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isAssigned
                        ? 'opacity-40 cursor-not-allowed bg-slate-50'
                        : isSelected
                          ? 'bg-brand-50 border border-brand-200'
                          : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color || '#3b82f6' }}
                    />
                    <span className={`flex-1 text-left font-medium ${isSelected ? 'text-brand-700' : 'text-slate-700'}`}>
                      {tag.name}
                    </span>
                    {isAssigned && <span className="text-[10px] text-slate-400 font-semibold">Assigned</span>}
                    {isSelected && !isAssigned && <Check size={14} className="text-brand-550" />}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssign} isLoading={saving} disabled={selectedTagIds.length === 0}>
              Assign ({selectedTagIds.length})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TagsTab;
