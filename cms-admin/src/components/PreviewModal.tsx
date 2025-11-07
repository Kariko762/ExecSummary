import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Code } from 'lucide-react';
import { SummaryDetail } from '../../../src/components/SummaryDetail';
import { OrganizationModal } from '../../../src/components/OrganizationModal';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { PresentationProvider } from '../../../src/contexts/PresentationContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: 'summaries' | 'executive-iq' | 'organizations' | 'performance';
}

type TabType = 'visual' | 'json';

export default function PreviewModal({ isOpen, onClose, data, dataType }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('visual');

  if (!isOpen) return null;

  // For visual preview, render the component directly - SummaryDetail handles draft mode internally
  if (activeTab === 'visual') {
    return (
      <>
        {/* Main Content - Full Screen */}
        <div className="fixed inset-0 z-[80]">
          {dataType === 'summaries' && (
            <ThemeProvider>
              <PresentationProvider>
                <SummaryDetail summary={data} onClose={onClose} />
              </PresentationProvider>
            </ThemeProvider>
          )}

          {dataType === 'organizations' && (
            <ThemeProvider>
              <PresentationProvider>
                <OrganizationModal organization={data} onClose={onClose} />
              </PresentationProvider>
            </ThemeProvider>
          )}

          {(dataType === 'executive-iq' || dataType === 'performance') && (
            <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 pt-24">
                <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Preview for {dataType} coming soon. For now, use the JSON tab to view data.
                  </p>
                </div>
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                  {data?.title || data?.name || 'Content'}
                </h2>
                <pre className="text-sm bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // For JSON tab, show modal view
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[95vw] h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-fis-eggplant/20"
        >
          {/* Header */}
          <div className="no-print flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
            <div>
              <h2 className="text-xl font-roobert-bold text-white">
                Preview
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                {data?.title || data?.displayName || data?.name || 'Content Preview'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="no-print flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => setActiveTab('visual')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Eye className="w-4 h-4" />
              Visual Preview
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-all bg-fis-eggplant text-white shadow-lg"
            >
              <Code className="w-4 h-4" />
              JSON Data
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'json' && (
              <div className="h-full overflow-y-auto p-4">
                <div className="glass-strong rounded-xl p-4 border-2 border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                      JSON Structure
                    </h3>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry text-xs font-roobert-medium transition-all"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
