import { motion, AnimatePresence } from 'framer-motion';
import { X, Columns2, Columns3, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { RenderFactory } from '../../../src/renderers/RenderFactory';
import type { FieldSchema } from '../../../src/types/schema';

interface AssetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetName: string;
  schema: FieldSchema;
  exampleData: any;
  supportsMultiColumn?: boolean;
}

type LayoutMode = 'full' | 'two-col' | 'three-col';

export default function AssetPreviewModal({
  isOpen,
  onClose,
  assetName,
  schema,
  exampleData,
  supportsMultiColumn = false
}: AssetPreviewModalProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('full');

  if (!isOpen) return null;

  const renderPreview = (mode: LayoutMode) => {
    const gridClass = mode === 'two-col' 
      ? 'grid grid-cols-2 gap-4' 
      : mode === 'three-col'
      ? 'grid grid-cols-3 gap-4'
      : '';

    return (
      <div className={gridClass}>
        {mode === 'full' ? (
          <div key="preview-full" className="w-full">
            <RenderFactory fieldKey="preview-full" schema={schema} value={exampleData} mode="display" />
          </div>
        ) : (
          // Render the asset multiple times to show how it looks in columns
          // Use key prop to ensure each chart instance has isolated tooltip state
          <>
            <div key="preview-col-1">
              <RenderFactory fieldKey={`preview-${mode}-1`} schema={schema} value={exampleData} mode="display" />
            </div>
            <div key="preview-col-2">
              <RenderFactory fieldKey={`preview-${mode}-2`} schema={schema} value={exampleData} mode="display" />
            </div>
            {mode === 'three-col' && (
              <div key="preview-col-3">
                <RenderFactory fieldKey={`preview-${mode}-3`} schema={schema} value={exampleData} mode="display" />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-roobert-bold text-white">
                Preview: {assetName}
              </h2>
              {supportsMultiColumn && (
                <span className="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-roobert-medium">
                  Multi-Column Support
                </span>
              )}
            </div>

            {/* Layout Toggle Buttons */}
            {supportsMultiColumn && (
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => setLayoutMode('full')}
                  className={`p-2 rounded-lg transition-all ${
                    layoutMode === 'full'
                      ? 'bg-white text-fis-eggplant shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Full Width"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('two-col')}
                  className={`p-2 rounded-lg transition-all ${
                    layoutMode === 'two-col'
                      ? 'bg-white text-fis-eggplant shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="2 Columns"
                >
                  <Columns2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('three-col')}
                  className={`p-2 rounded-lg transition-all ${
                    layoutMode === 'three-col'
                      ? 'bg-white text-fis-eggplant shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="3 Columns"
                >
                  <Columns3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant">
            <div className="max-w-5xl mx-auto">
              {/* Layout Mode Label */}
              {supportsMultiColumn && (
                <div className="mb-4 text-center">
                  <span className="inline-block px-4 py-2 rounded-full glass text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                    {layoutMode === 'full' && 'Full Width Layout'}
                    {layoutMode === 'two-col' && '2 Column Layout'}
                    {layoutMode === 'three-col' && '3 Column Layout'}
                  </span>
                </div>
              )}

              {/* Preview Render */}
              {renderPreview(layoutMode)}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="font-mono">
                Render Type: <span className="text-fis-eggplant dark:text-fis-raspberry font-semibold">{schema.renderAs || schema.type}</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-roobert-medium transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
