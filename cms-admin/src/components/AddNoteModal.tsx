/**
 * ADD/EDIT NOTE MODAL
 * 
 * Create or edit notes with:
 * - Title and markdown content
 * - Category selection
 * - Link to Organization/Initiative/Goal
 * - Add to sections
 * - Tags
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Star, Target, Trophy, Briefcase, Rocket, List,
  Building2, TrendingUp, Folder, Tag, Plus, Trash2, AlertCircle
} from 'lucide-react';

interface Note {
  id?: string;
  title: string;
  content: string;
  category: 'key-highlight' | 'goal-progression' | 'big-win' | 'deal-support' | 'new-project' | 'general';
  linkedTo: {
    type: 'organization' | 'initiative' | 'goal';
    id: string;
    slug: string;
    name: string;
  } | null;
  taskId?: string; // NEW: Link to specific task
  sectionIds: string[];
  tags: string[];
  author: string;
}

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => Promise<void>;
  existingNote?: Note | null;
  sections: Array<{ id: string; name: string; status: string }>;
  initiatives?: Array<{ id: string; name: string; slug: string }>;
  goals?: Array<{ id: string; title: string; slug: string; name?: string }>;
  tasks?: Array<{ id: string; title: string; goalId?: string; initiativeId?: string }>;
  categoryConfig?: any; // Dynamic category config from parent
}

// Default fallback categories (used if not provided)
const DEFAULT_CATEGORY_CONFIG = {
  'key-highlight': { label: 'Key Highlight', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'goal-progression': { label: 'Goal Progression', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
  'big-win': { label: 'Big Win', icon: Trophy, color: 'text-green-500', bg: 'bg-green-50' },
  'deal-support': { label: 'Deal Support', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50' },
  'new-project': { label: 'New Project', icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'general': { label: 'General', icon: List, color: 'text-gray-500', bg: 'bg-gray-50' }
};

export default function AddNoteModal({
  isOpen,
  onClose,
  onSave,
  existingNote,
  sections,
  initiatives = [],
  goals = [],
  tasks = [],
  categoryConfig = DEFAULT_CATEGORY_CONFIG
}: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Note['category']>('general');
  const [linkedType, setLinkedType] = useState<'none' | 'initiative' | 'goal'>('none');
  const [linkedId, setLinkedId] = useState('');
  const [taskId, setTaskId] = useState(''); // NEW
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Load existing note if editing
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setCategory(existingNote.category);
      setSelectedSections(existingNote.sectionIds);
      setTags(existingNote.tags);
      setTaskId(existingNote.taskId || '');
      
      if (existingNote.linkedTo) {
        setLinkedType(existingNote.linkedTo.type as 'initiative' | 'goal');
        setLinkedId(existingNote.linkedTo.id);
      }
    } else {
      // Reset for new note
      setTitle('');
      setContent('');
      setCategory('general');
      setLinkedType('none');
      setLinkedId('');
      setTaskId('');
      setSelectedSections([]);
      setTags([]);
    }
    setError(null);
  }, [existingNote, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Build linked object
      let linkedTo = null;
      if (linkedType !== 'none' && linkedId) {
        let linkedItem;
        let slug = '';
        let name = '';

        if (linkedType === 'initiative') {
          linkedItem = initiatives.find(i => i.id === linkedId);
          slug = linkedItem?.slug || '';
          name = linkedItem?.name || '';
        } else if (linkedType === 'goal') {
          linkedItem = goals.find(g => g.id === linkedId);
          slug = linkedItem?.slug || '';
          name = linkedItem?.title || '';
        }

        linkedTo = {
          type: linkedType,
          id: linkedId,
          slug,
          name
        };
      }

      const note: Note = {
        ...(existingNote?.id && { id: existingNote.id }),
        title: title.trim(),
        content: content.trim(),
        category,
        linkedTo,
        ...(taskId && { taskId }), // Add taskId if selected
        sectionIds: selectedSections,
        tags,
        author: 'System' // TODO: Get from auth context
      };

      await onSave(note);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (!isOpen) return null;

  const activeSections = sections.filter(s => s.status === 'active');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
            {existingNote ? 'Edit Note' : 'Create Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = category === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key as Note['category'])}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-fis-eggplant bg-fis-eggplant/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-sm font-roobert-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white">
                Content * (Markdown supported)
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    activeTab === 'write'
                      ? 'bg-fis-eggplant text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-fis-eggplant text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            
            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter note content using markdown formatting..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            ) : (
              <div className="w-full min-h-[200px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="prose dark:prose-invert max-w-none text-sm">
                  {content || <span className="text-gray-400 italic">No content to preview</span>}
                </div>
              </div>
            )}
          </div>

          {/* Link to Goal/Initiative */}
          <div>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Link to Goal or Initiative
            </label>
            
            {/* Radio buttons for Goal vs Initiative */}
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="noteLinkedType"
                  value="none"
                  checked={linkedType === 'none'}
                  onChange={() => {
                    setLinkedType('none');
                    setLinkedId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">None</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="noteLinkedType"
                  value="goal"
                  checked={linkedType === 'goal'}
                  onChange={() => {
                    setLinkedType('goal');
                    setLinkedId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Strategic Goal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="noteLinkedType"
                  value="initiative"
                  checked={linkedType === 'initiative'}
                  onChange={() => {
                    setLinkedType('initiative');
                    setLinkedId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-pink-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Initiative</span>
              </label>
            </div>

            {/* Goal/Initiative Dropdown */}
            {linkedType !== 'none' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Select {linkedType === 'goal' ? 'Goal' : 'Initiative'}
                  </label>
                  <select
                    value={linkedId}
                    onChange={(e) => {
                      setLinkedId(e.target.value);
                      setTaskId(''); // Reset task when changing goal/initiative
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select {linkedType}...</option>
                    {linkedType === 'initiative' &&
                      initiatives.map(init => (
                        <option key={init.id} value={init.id}>{init.name}</option>
                      ))}
                    {linkedType === 'goal' &&
                      goals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.title || goal.name}</option>
                      ))}
                  </select>
                </div>

                {/* Task Dropdown - filtered by selected goal/initiative */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Link to Task (Optional)
                  </label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    disabled={!linkedId}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">No specific task</option>
                    {tasks
                      .filter(task => 
                        linkedType === 'goal' ? task.goalId === linkedId : task.initiativeId === linkedId
                      )
                      .map(task => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Link to Object - REMOVED, keeping for backwards compat */}
          <div style={{ display: 'none' }}>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Link to (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={linkedType}
                onChange={(e) => {
                  setLinkedType(e.target.value as any);
                  setLinkedId('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="none">None</option>
                <option value="initiative">Initiative</option>
                <option value="goal">Goal</option>
              </select>

              {linkedType !== 'none' && (
                <select
                  value={linkedId}
                  onChange={(e) => setLinkedId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select {linkedType}...</option>
                  {linkedType === 'initiative' &&
                    initiatives.map(init => (
                      <option key={init.id} value={init.id}>{init.name}</option>
                    ))}
                  {linkedType === 'goal' &&
                    goals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Add to Sections */}
          <div>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Add to Sections
            </label>
            {activeSections.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No active sections available</p>
            ) : (
              <div className="space-y-2">
                {activeSections.map(section => (
                  <label
                    key={section.id}
                    className="flex items-center gap-3 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="w-4 h-4 text-fis-eggplant rounded"
                    />
                    <Folder className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                      {section.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
