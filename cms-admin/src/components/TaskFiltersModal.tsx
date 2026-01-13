/**
 * TASK FILTERS MODAL
 * Preview modal for testing task connector filters
 */

import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { TaskConnectorRenderer } from '../renderers/assetRenderTasks';

interface Task {
  id: string;
  title: string;
  owner?: string;
  businessUnit?: string;
  product?: string;
  status?: 'On Track' | 'At Risk' | 'Off Track' | 'Completed';
  priority?: 'High' | 'Medium' | 'Low';
  percentage?: number;
  targetDate?: string;
  tags?: string[];
  goalId?: string;
}

interface TaskFiltersModalProps {
  filters: any;
  layout: any;
  onClose: () => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskFiltersModal: React.FC<TaskFiltersModalProps> = ({
  filters,
  layout,
  onClose,
  onTaskClick
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-tertiary)] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-roobert-semibold text-white">Task Connector Preview</h2>
              <p className="text-sm text-white/80 mt-1 font-roobert-regular">
                Testing filters - Click any task to view details
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.status?.length > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Status: {filters.status.join(', ')}
              </div>
            )}
            {filters.priority?.length > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Priority: {filters.priority.join(', ')}
              </div>
            )}
            {filters.businessUnit?.length > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Business Unit: {filters.businessUnit.join(', ')}
              </div>
            )}
            {filters.product?.length > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Product: {filters.product.join(', ')}
              </div>
            )}
            {filters.owner?.length > 0 && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Owner: {filters.owner.join(', ')}
              </div>
            )}
            {filters.goalId && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                Goal Filter Active
              </div>
            )}
            {!filters.status?.length && !filters.priority?.length && !filters.businessUnit?.length && 
             !filters.product?.length && !filters.owner?.length && !filters.goalId && (
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-roobert-medium text-white">
                No filters applied - showing all tasks
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <TaskConnectorRenderer
            data={{ filters, layout }}
            onTaskClick={onTaskClick}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-regular">
              Sort: {layout.sortBy || 'targetDate'} ({layout.sortOrder || 'asc'}) • Layout controlled by template builder
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-roobert-medium text-sm transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskFiltersModal;
