import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertCircle, Image } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import VendorOverviewTemplate from '../templates/VendorOverviewTemplate';

interface VendorOverviewEditorProps {
  onClose: () => void;
}

export default function VendorOverviewEditor({ onClose }: VendorOverviewEditorProps) {
  const [showSaveWarning, setShowSaveWarning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const container = contentRef.current;
      
      // Store original styles
      const originalStyles = {
        overflow: container.style.overflow,
        maxHeight: container.style.maxHeight,
        height: container.style.height,
      };
      
      // Remove all scroll and height constraints
      container.style.overflow = 'visible';
      container.style.maxHeight = 'none';
      container.style.height = 'auto';
      
      // Wait for layout to settle and fonts to render
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture the entire content with full expanded height
      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#1e293b',
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
      
      // Restore original styles
      container.style.overflow = originalStyles.overflow;
      container.style.maxHeight = originalStyles.maxHeight;
      container.style.height = originalStyles.height;
      
      // Download the image
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `vendor-overview-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Full Screen Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 z-[101] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-roobert-bold text-white">
              Technology Overview
            </h2>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-roobert-medium rounded">
              PREVIEW
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Export to Image */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportImage}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50"
              title="Export as image"
            >
              <Image className="w-4 h-4" />
              <span className="text-sm font-roobert-medium">{isExporting ? 'Exporting...' : 'Export Image'}</span>
            </motion.button>

            {/* Save Button (disabled for now) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveWarning(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 cursor-not-allowed"
              title="Save functionality coming soon"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-roobert-medium">Save</span>
            </motion.button>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-roobert-medium">Close</span>
            </motion.button>
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="flex-1 overflow-auto">
          <VendorOverviewTemplate />
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 border-t border-white/10 bg-gray-800/50">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <AlertCircle className="w-4 h-4" />
            <span>
              This is a preview of the technology overview template. Inline editing and save functionality coming soon.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Save Warning Modal */}
      {showSaveWarning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-[102] flex items-center justify-center"
          onClick={() => setShowSaveWarning(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-xl p-6 max-w-md shadow-2xl border border-white/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-roobert-bold text-white mb-2">
                  Save Not Available Yet
                </h3>
                <p className="text-sm text-white/70 font-roobert-light">
                  The technology overview template is currently in preview mode. Inline editing and save functionality will be added in the next update.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSaveWarning(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-roobert-medium transition-colors"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
