import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, FileText, Lightbulb, FolderOpen, AlertCircle, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:3001/api';

interface ContentTag {
  id: string;
  name: string;
  color: string;
  icon: string;
  created: string;
  description?: string;
  protected?: boolean;
}

interface TagUsage {
  tagId: string;
  publishedCount: number;
  draftCount: number;
  totalCount: number;
}

const ICON_OPTIONS = [
  { value: 'FileText', label: 'Document', icon: FileText },
  { value: 'Lightbulb', label: 'Lightbulb', icon: Lightbulb },
  { value: 'FolderOpen', label: 'Folder', icon: FolderOpen },
  { value: 'Tag', label: 'Tag', icon: Tag },
  { value: 'Bell', label: 'Bell', icon: Bell },
];

const COLOR_OPTIONS = [
  { value: 'primary', label: 'Primary (Purple)', hex: '#431C5B' },
  { value: 'secondary', label: 'Secondary (Pink)', hex: '#B21A53' },
  { value: 'tertiary', label: 'Tertiary (Navy)', hex: '#1D1F48' },
  { value: 'blue', label: 'Accent Blue', hex: '#3B82F6' },
  { value: 'green', label: 'Accent Green', hex: '#4BCD3E' },
  { value: 'red', label: 'Accent Red', hex: '#EF4444' },
];

export default function ContentTagManager() {
  const [tags, setTags] = useState<ContentTag[]>([]);
  const [tagUsage, setTagUsage] = useState<Record<string, TagUsage>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<ContentTag | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    color: 'purple',
    icon: 'FileText',
    description: ''
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/content-tags`);
      const data = await response.json();
      setTags(data);
      
      // Fetch usage for each tag
      const usagePromises = data.map((tag: ContentTag) =>
        fetch(`${API_URL}/content-tags/${tag.id}/usage`).then(r => r.json())
      );
      const usageResults = await Promise.all(usagePromises);
      const usageMap = usageResults.reduce((acc, usage) => {
        acc[usage.tagId] = usage;
        return acc;
      }, {} as Record<string, TagUsage>);
      setTagUsage(usageMap);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      id: '',
      name: '',
      color: 'purple',
      icon: 'FileText',
      description: ''
    });
    setShowCreateModal(true);
  };

  const handleEdit = (tag: ContentTag) => {
    setSelectedTag(tag);
    setFormData({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      icon: tag.icon,
      description: tag.description || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (tag: ContentTag) => {
    setSelectedTag(tag);
    setShowDeleteModal(true);
  };

  const submitCreate = async () => {
    try {
      const response = await fetch(`${API_URL}/content-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchTags();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const submitEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/content-tags/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchTags();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const submitDelete = async () => {
    if (!selectedTag) return;
    
    try {
      const response = await fetch(`${API_URL}/content-tags/${selectedTag.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchTags();
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = ICON_OPTIONS.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Tag;
  };

  const getColorHex = (colorName: string) => {
    const colorOption = COLOR_OPTIONS.find(opt => opt.value === colorName);
    return colorOption?.hex || '#6B46C1';
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading tags...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">Content Tags</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Organize and categorize your content with custom tags
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-6 py-2.5 min-w-[200px] rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-medium hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      {/* Tags Table */}
      <div className="glass-strong rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Tag
              </th>
              <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-center text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Published
              </th>
              <th className="px-4 py-3 text-center text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Drafts
              </th>
              <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tags.map((tag) => {
              const Icon = getIconComponent(tag.icon);
              const usage = tagUsage[tag.id] || { publishedCount: 0, draftCount: 0, totalCount: 0 };
              const canDelete = usage.totalCount === 0 && !tag.protected;
              
              return (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${getColorHex(tag.color)}20`, color: getColorHex(tag.color) }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-roobert-semibold text-gray-900 dark:text-white">{tag.name}</span>
                          {tag.protected && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-roobert-medium">
                              Protected
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{tag.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {tag.description || '—'}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-roobert-medium">
                      {usage.publishedCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-roobert-medium">
                      {usage.draftCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(tag.created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                        title="Edit tag"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!tag.protected && (
                        <button
                          onClick={() => handleDelete(tag)}
                          disabled={!canDelete}
                          className={`p-2 rounded-lg transition-colors ${
                            canDelete
                              ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          }`}
                          title={!canDelete ? 'Cannot delete tag with content' : 'Delete tag'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {tags.length === 0 && (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No content tags created yet</p>
            <p className="text-xs mt-1">Click "Create Tag" to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-12"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                  {showCreateModal ? 'Create New Tag' : 'Edit Tag'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* LEFT COLUMN - Text Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Tag ID
                    </label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      disabled={showEditModal}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-sm"
                      placeholder="weekly-summary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Weekly Summaries"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      placeholder="Weekly executive summary reports"
                    />
                  </div>
                </div>
                
                {/* RIGHT COLUMN - Icons and Colors */}
                <div className="flex flex-col">
                  {/* Icons - 2x2 grid, no title */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {ICON_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, icon: option.value })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            formData.icon === option.value
                              ? 'border-fis-raspberry bg-fis-raspberry/75'
                              : 'border-gray-300 dark:border-gray-600 hover:border-fis-raspberry/50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mx-auto ${formData.icon === option.value ? 'text-white' : ''}`} />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Colors - 3x2 grid (changed to 2 rows), no title */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`w-full h-8 rounded-lg border-2 transition-all ${
                          formData.color === option.value
                            ? 'border-gray-900 dark:border-white scale-105'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: option.hex }}
                        title={option.label}
                      />
                    ))}
                  </div>
                  
                  {/* Spacer to push button down */}
                  <div className="flex-1 -mb-[3px]"></div>
                  
                  {/* Create button aligned with Description input */}
                  <button
                    onClick={showCreateModal ? submitCreate : submitEdit}
                    disabled={!formData.id || !formData.name}
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {showCreateModal ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedTag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 pt-24"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-red-200 dark:border-red-800 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-1">
                    Delete Tag
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete "<strong>{selectedTag.name}</strong>"? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-roobert-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
