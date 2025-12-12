/**
 * CREATE/EDIT SECTION MODAL
 * 
 * Modal for creating and editing sections (Weekly Updates, Quarterly Reports, etc.)
 * Features:
 * - Section name and description
 * - Type selection (weekly, monthly, quarterly, project, custom)
 * - Date range picker
 * - Color picker for visual organization
 * - Status selection (active, draft, archived)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Folder, AlertCircle } from 'lucide-react';

interface Section {
  id?: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'project' | 'custom';
  startDate?: string;
  endDate?: string;
  status: 'active' | 'archived' | 'draft';
  color: string;
  icon: string;
}

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: Section) => Promise<void>;
  existingSection?: Section | null;
}

const SECTION_TYPES = [
  { value: 'weekly', label: 'Weekly Update', description: 'Weekly progress reports' },
  { value: 'monthly', label: 'Monthly Report', description: 'Monthly summaries' },
  { value: 'quarterly', label: 'Quarterly Review', description: 'Quarterly business reviews' },
  { value: 'project', label: 'Project Report', description: 'Project-specific updates' },
  { value: 'custom', label: 'Custom', description: 'Custom report type' }
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' }
];

export default function CreateSectionModal({ isOpen, onClose, onSave, existingSection }: CreateSectionModalProps) {
  const [formData, setFormData] = useState<Section>({
    name: '',
    description: '',
    type: 'weekly',
    status: 'active',
    color: 'blue',
    icon: 'calendar'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load existing section data
  useEffect(() => {
    if (existingSection) {
      setFormData({
        ...existingSection
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'weekly',
        status: 'active',
        color: 'blue',
        icon: 'calendar'
      });
    }
    setErrors({});
  }, [existingSection, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Section name is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save section:', error);
      setErrors({ submit: 'Failed to save section. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Section, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-roobert-heavy text-white">
                    {existingSection ? 'Edit Section' : 'Create New Section'}
                  </h2>
                  <p className="text-sm text-white/80">
                    {existingSection ? 'Update section details' : 'Create a new collection for your notes'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Section Name */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Section Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Weekly Update Dec 9-13"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this section..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Section Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SECTION_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.type === type.value
                        ? 'border-fis-eggplant bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Color Theme
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('color', color.value)}
                    className={`w-10 h-10 rounded-lg ${color.class} transition-all ${
                      formData.color === color.value
                        ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500'
                        : 'hover:scale-110'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                Status
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('status', 'active')}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                    formData.status === 'active'
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('status', 'draft')}
                  className={`flex-1 px-4 py-2 border-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                    formData.status === 'draft'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving...' : existingSection ? 'Update Section' : 'Create Section'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
