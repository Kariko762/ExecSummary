/**
 * LINK TO SECTION MODAL
 * 
 * Modal for linking/unlinking notes to sections.
 * Shows all available sections with checkboxes for multi-selection.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Calendar, Folder, CheckCircle, Circle } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'project' | 'custom';
  status: 'active' | 'archived' | 'draft';
  noteCount?: number;
  color: string;
}

interface LinkToSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  currentSectionIds: string[];
  sections: Section[];
  onUpdateLinks: (sectionIds: string[]) => Promise<void>;
}

export default function LinkToSectionModal({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  currentSectionIds,
  sections,
  onUpdateLinks
}: LinkToSectionModalProps) {
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize selected sections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSectionIds([...currentSectionIds]);
      setSearchQuery('');
    }
  }, [isOpen, currentSectionIds]);

  // Filter active sections only
  const activeSections = sections.filter(s => s.status === 'active');

  // Search filtering
  const filteredSections = activeSections.filter(section =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setSelectedSectionIds(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateLinks(selectedSectionIds);
      onClose();
    } catch (error) {
      console.error('Failed to update section links:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate changes
  const addedCount = selectedSectionIds.filter(id => !currentSectionIds.includes(id)).length;
  const removedCount = currentSectionIds.filter(id => !selectedSectionIds.includes(id)).length;
  const hasChanges = addedCount > 0 || removedCount > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-roobert-semibold text-gray-900 dark:text-white">
                Link to Sections
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                "{noteTitle}"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No sections found' : 'No active sections available'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSections.map(section => {
                  const isSelected = selectedSectionIds.includes(section.id);
                  const wasOriginallyLinked = currentSectionIds.includes(section.id);
                  
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-fis-eggplant bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className="mt-0.5">
                          {isSelected ? (
                            <CheckCircle className="w-5 h-5 text-fis-eggplant" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Section Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-roobert-semibold text-gray-900 dark:text-white">
                              {section.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              isSelected ? 'bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {section.type}
                            </span>
                            {wasOriginallyLinked && !isSelected && (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                (will be removed)
                              </span>
                            )}
                            {!wasOriginallyLinked && isSelected && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                (will be added)
                              </span>
                            )}
                          </div>
                          {section.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {section.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span>{section.noteCount || 0} notes</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {/* Change Summary */}
            {hasChanges && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <span className="font-roobert-medium">Changes:</span>
                  {addedCount > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      +{addedCount} added
                    </span>
                  )}
                  {removedCount > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      -{removedCount} removed
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
