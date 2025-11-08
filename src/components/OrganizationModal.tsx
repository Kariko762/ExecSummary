import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Organization } from '../types';
import { RenderFactory } from '../renderers/RenderFactory';

interface OrganizationModalProps {
  organization: Organization | null;
  onClose: () => void;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({ organization, onClose }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (organization) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [organization]);

  if (!organization) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10 rounded-t-3xl">
            <div>
              <h2 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                {organization.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated: {new Date(organization.lastUpdated).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto bg-white dark:bg-gray-900" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            {/* Key Highlights - Using RenderFactory */}
            {(organization as any)._enabled_keyHighlights !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Key Highlights
                </h3>
                <RenderFactory
                  fieldKey="keyHighlights"
                  value={organization.keyHighlights}
                  onChange={() => {}} // Read-only in display mode
                  mode="display"
                  schema={{
                    renderAs: (organization as any)._keyHighlights_type || 'list',
                    fields: (organization as any)._keyHighlights_fields
                  }}
                />
              </section>
            )}

            {/* Strategic Projects - Using RenderFactory */}
            {(organization as any)._enabled_strategicProjects !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Strategic Projects
                </h3>
                <RenderFactory
                  fieldKey="strategicProjects"
                  value={organization.strategicProjects}
                  onChange={() => {}} // Read-only in display mode
                  mode="display"
                  schema={{
                    renderAs: (organization as any)._strategicProjects_type || 'nestedCards',
                    fields: (organization as any)._strategicProjects_fields
                  }}
                />
              </section>
            )}

            {/* Support Activities - Using RenderFactory */}
            {(organization as any)._enabled_supportActivities !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Support Activities
                </h3>
                <RenderFactory
                  fieldKey="supportActivities"
                  value={organization.supportActivities}
                  onChange={() => {}} // Read-only in display mode
                  mode="display"
                  schema={{
                    renderAs: (organization as any)._supportActivities_type || 'nestedCards',
                    fields: (organization as any)._supportActivities_fields
                  }}
                />
              </section>
            )}

            {/* Demo Insights - Using RenderFactory */}
            {(organization as any)._enabled_demoInsights !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Demo Studio Insights
                </h3>
                <RenderFactory
                  fieldKey="demoInsights"
                  value={organization.demoInsights}
                  onChange={() => {}} // Read-only in display mode
                  mode="display"
                  schema={{
                    renderAs: (organization as any)._demoInsights_type || 'nestedCards',
                    fields: (organization as any)._demoInsights_fields
                  }}
                />
              </section>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
