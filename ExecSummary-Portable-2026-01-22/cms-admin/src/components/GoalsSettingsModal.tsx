import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface CroImpactArea {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface GoalsSettingsModalProps {
  categories: Category[];
  croImpactAreas: CroImpactArea[];
  onClose: () => void;
  onRefresh: () => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function GoalsSettingsModal({ 
  categories, 
  croImpactAreas, 
  onClose, 
  onRefresh,
  showNotification 
}: GoalsSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'cro'>('categories');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCroArea, setEditingCroArea] = useState<CroImpactArea | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'cro', id: string, name: string } | null>(null);

  const colorOptions = ['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'indigo', 'teal', 'cyan'];
  
  const emojiOptions = [
    '⚡', '✓', '❤️', '💰', '🚀', '🎯', '📊', '📈', '💡', '🔧',
    '⭐', '🏆', '💪', '🎨', '🔥', '💻', '📱', '🌟', '✨', '🎉',
    '👥', '🤝', '📚', '🎓', '🔍', '⚙️', '🛠️', '📦', '🔐', '🌐',
    '📝', '💬', '🔔', '⏰', '📅', '✅', '❌', '➡️', '⬆️', '📌'
  ];

  // Category handlers
  const handleSaveCategory = async () => {
    if (!editingCategory) return;

    try {
      const isEditing = editingCategory.id && categories.find(c => c.id === editingCategory.id);
      const url = isEditing
        ? `http://localhost:3001/api/goals/categories/${editingCategory.id}`
        : 'http://localhost:3001/api/goals/categories/create';
      
      const method = isEditing ? 'PUT' : 'POST';

      // Don't send empty id when creating
      let payload;
      if (!isEditing && !editingCategory.id) {
        const { id, ...rest } = editingCategory;
        payload = rest;
      } else {
        payload = editingCategory;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification?.('success', `Category ${method === 'POST' ? 'created' : 'updated'} successfully`);
        setEditingCategory(null);
        onRefresh();
      } else {
        showNotification?.('error', 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showNotification?.('error', 'Failed to save category');
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'category') return;
    
    const id = deleteConfirm.id;
    setDeleteConfirm(null);

    if (!id) {
      showNotification?.('error', 'Cannot delete category: invalid ID');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/goals/categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification?.('success', 'Category deleted successfully');
        onRefresh();
      } else {
        showNotification?.('error', 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification?.('error', 'Failed to delete category');
    }
  };

  // CRO Impact Area handlers
  const handleSaveCroArea = async () => {
    if (!editingCroArea) return;

    try {
      const isEditing = editingCroArea.id && croImpactAreas.find(a => a.id === editingCroArea.id);
      const url = isEditing
        ? `http://localhost:3001/api/goals/cro-impact/${editingCroArea.id}`
        : 'http://localhost:3001/api/goals/cro-impact/create';
      
      const method = isEditing ? 'PUT' : 'POST';

      // Don't send empty id when creating
      let payload;
      if (!isEditing && !editingCroArea.id) {
        const { id, ...rest } = editingCroArea;
        payload = rest;
      } else {
        payload = editingCroArea;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showNotification?.('success', `CRO Impact Area ${method === 'POST' ? 'created' : 'updated'} successfully`);
        setEditingCroArea(null);
        onRefresh();
      } else {
        showNotification?.('error', 'Failed to save CRO impact area');
      }
    } catch (error) {
      console.error('Error saving CRO impact area:', error);
      showNotification?.('error', 'Failed to save CRO impact area');
    }
  };

  const confirmDeleteCroArea = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'cro') return;
    
    const id = deleteConfirm.id;
    setDeleteConfirm(null);

    if (!id) {
      showNotification?.('error', 'Cannot delete CRO area: invalid ID');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/goals/cro-impact/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification?.('success', 'CRO impact area deleted successfully');
        onRefresh();
      } else {
        showNotification?.('error', 'Failed to delete CRO impact area');
      }
    } catch (error) {
      console.error('Error deleting CRO impact area:', error);
      showNotification?.('error', 'Failed to delete CRO impact area');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="settings-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Goals Settings</h2>
              <p className="text-white/80 text-xs">Manage categories and CRO impact areas</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'categories'
                  ? 'text-fis-raspberry border-b-2 border-fis-raspberry bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('cro')}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'cro'
                  ? 'text-fis-raspberry border-b-2 border-fis-raspberry bg-white dark:bg-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              CRO Impact Areas ({croImpactAreas.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'categories' ? (
              <div className="space-y-3">
                {/* Add New Category Button */}
                <button
                  onClick={() => setEditingCategory({ id: '', name: '', description: '', icon: '🎯', color: 'blue' })}
                  className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-fis-raspberry hover:bg-fis-raspberry/5 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-fis-raspberry font-roobert-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add New Category
                </button>

                {/* Category List */}
                {categories.map(category => (
                  <div key={category.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{category.description}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs bg-${category.color}-100 dark:bg-${category.color}-900 text-${category.color}-700 dark:text-${category.color}-300`}>
                          {category.color}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCategory({ ...category })}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Add New CRO Impact Area Button */}
                <button
                  onClick={() => setEditingCroArea({ id: '', name: '', description: '', color: 'blue' })}
                  className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-fis-raspberry hover:bg-fis-raspberry/5 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-fis-raspberry font-roobert-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add New CRO Impact Area
                </button>

                {/* CRO Impact Area List */}
                {croImpactAreas.map(area => (
                  <div key={area.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{area.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{area.description}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs bg-${area.color}-100 dark:bg-${area.color}-900 text-${area.color}-700 dark:text-${area.color}-300`}>
                        {area.color}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCroArea({ ...area })}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'cro', id: area.id, name: area.name })}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Category Edit Modal */}
      {editingCategory && (
        <motion.div
          key="edit-category"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]"
          onClick={() => setEditingCategory(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-4 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {editingCategory.id && categories.find(c => c.id === editingCategory.id) ? 'Edit Category' : 'New Category'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Operational Efficiency"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Icon (Emoji) *</label>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                      className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xl text-center"
                      placeholder="⭐"
                      maxLength={2}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                      {showEmojiPicker ? 'Close' : 'Pick'}
                    </button>
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="absolute z-10 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setEditingCategory({ ...editingCategory, icon: emoji });
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color *</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                      className={`h-10 rounded border-2 transition-all ${
                        editingCategory.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      } bg-${color}-500`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CRO Impact Area Edit Modal */}
      {editingCroArea && (
        <motion.div
          key="edit-cro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]"
          onClick={() => setEditingCroArea(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-4 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              {editingCroArea.id && croImpactAreas.find(a => a.id === editingCroArea.id) ? 'Edit CRO Impact Area' : 'New CRO Impact Area'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={editingCroArea.name}
                  onChange={(e) => setEditingCroArea({ ...editingCroArea, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Sales Cycle Delays"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  value={editingCroArea.description}
                  onChange={(e) => setEditingCroArea({ ...editingCroArea, description: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color *</label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingCroArea({ ...editingCroArea, color })}
                      className={`h-10 rounded border-2 transition-all ${
                        editingCroArea.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      } bg-${color}-500`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveCroArea}
                className="flex-1 px-3 py-1.5 text-sm bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setEditingCroArea(null)}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          key="delete-confirm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001]"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-5 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete <span className="font-semibold text-gray-900 dark:text-white">{deleteConfirm.name}</span>? 
                  {deleteConfirm.type === 'category' ? ' Goals using this category' : ' Goals with this CRO impact area'} will need to be updated.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirm.type === 'category' ? confirmDeleteCategory : confirmDeleteCroArea}
                className="flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
