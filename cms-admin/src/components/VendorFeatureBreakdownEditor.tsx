import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Save, AlertCircle } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import VendorFeatureBreakdownTemplate from '../templates/VendorFeatureBreakdownTemplate';

interface VendorFeatureBreakdownEditorProps {
  onClose: () => void;
}

export default function VendorFeatureBreakdownEditor({ onClose }: VendorFeatureBreakdownEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showSaveWarning, setShowSaveWarning] = useState(false);

  const handleExportImage = async () => {
    if (!contentRef.current) return;

    try {
      const container = contentRef.current;
      
      // Store original styles
      const originalOverflow = container.style.overflow;
      const originalMaxHeight = container.style.maxHeight;
      const originalHeight = container.style.height;
      
      // Temporarily remove constraints
      container.style.overflow = 'visible';
      container.style.maxHeight = 'none';
      container.style.height = 'auto';
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get full dimensions
      const scrollWidth = container.scrollWidth;
      const scrollHeight = container.scrollHeight;
      
      // Capture with full dimensions
      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#0f172a',
        width: scrollWidth,
        height: scrollHeight
      });
      
      // Restore original styles
      container.style.overflow = originalOverflow;
      container.style.maxHeight = originalMaxHeight;
      container.style.height = originalHeight;
      
      // Download
      const link = document.createElement('a');
      link.download = `vendor-feature-breakdown-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 bg-slate-900 rounded-2xl shadow-2xl z-[101] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Vendor Feature Breakdown</h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/30">
              PREVIEW
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportImage}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Export to Image</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveWarning(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600/50 text-slate-400 rounded-lg border border-slate-600/50 cursor-not-allowed"
              disabled
            >
              <Save className="w-4 h-4" />
              <span className="font-medium">Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div ref={contentRef} className="w-full">
            <VendorFeatureBreakdownTemplate />
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <AlertCircle className="w-4 h-4" />
            <span>This is a preview of the vendor feature breakdown. Inline editing and save functionality coming soon.</span>
          </div>
        </div>
      </motion.div>

      {/* Save Warning Modal */}
      <AnimatePresence>
        {showSaveWarning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[102]"
              onClick={() => setShowSaveWarning(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl z-[103] p-6 max-w-md border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Save Not Available Yet</h3>
                  <p className="text-sm text-slate-300">
                    Template persistence and inline editing features are currently in development. 
                    Use the "Export to Image" feature to save a snapshot of your vendor breakdown.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSaveWarning(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  OK
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
