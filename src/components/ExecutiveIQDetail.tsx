import { motion, AnimatePresence } from 'framer-motion';
import { ExecutiveIQ } from '../types';
import { X } from 'lucide-react';
import { RenderFactory } from '../renderers/RenderFactory';
import { useEffect } from 'react';

interface ExecutiveIQDetailProps {
  article: ExecutiveIQ;
  onClose: () => void;
}

export const ExecutiveIQDetail: React.FC<ExecutiveIQDetailProps> = ({ article, onClose }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
                {article.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(article.date).toLocaleDateString('en-US', { 
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
            {/* Executive Summary */}
            {(article as any)._enabled_executiveSummary !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Executive Summary
                </h3>
                <RenderFactory
                  fieldKey="executiveSummary"
                  value={article.executiveSummary}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._executiveSummary_type || 'textarea',
                    fields: (article as any)._executiveSummary_fields
                  }}
                />
              </section>
            )}

            {/* Key Takeaways */}
            {(article as any)._enabled_keyTakeaways !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Key Takeaways
                </h3>
                <RenderFactory
                  fieldKey="keyTakeaways"
                  value={article.keyTakeaways}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._keyTakeaways_type || 'list',
                    fields: (article as any)._keyTakeaways_fields
                  }}
                />
              </section>
            )}

            {/* Strategic Implications */}
            {(article as any)._enabled_strategicImplications !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Strategic Implications
                </h3>
                <RenderFactory
                  fieldKey="strategicImplications"
                  value={article.strategicImplications}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._strategicImplications_type || 'list',
                    fields: (article as any)._strategicImplications_fields
                  }}
                />
              </section>
            )}

            {/* Recommendations */}
            {(article as any)._enabled_recommendations !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Recommendations
                </h3>
                <RenderFactory
                  fieldKey="recommendations"
                  value={article.recommendations}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._recommendations_type || 'list',
                    fields: (article as any)._recommendations_fields
                  }}
                />
              </section>
            )}

            {/* Trend Analysis - Using NestedCards */}
            {article.trendAnalysis && (article as any)._enabled_trendAnalysis !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  {article.trendAnalysis.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {article.trendAnalysis.subtitle}
                </p>
                <RenderFactory
                  fieldKey="trendAnalysis"
                  value={article.trendAnalysis.categories}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._trendAnalysis_type || 'nestedCards',
                    fields: (article as any)._trendAnalysis_fields
                  }}
                />
              </section>
            )}

            {/* Supporting Data - Using NestedCards */}
            {article.supportingData && article.supportingData.length > 0 && (article as any)._enabled_supportingData !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Supporting Data
                </h3>
                <RenderFactory
                  fieldKey="supportingData"
                  value={article.supportingData}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._supportingData_type || 'nestedCards',
                    fields: (article as any)._supportingData_fields
                  }}
                />
              </section>
            )}

            {/* Related Initiatives */}
            {article.relatedInitiatives && article.relatedInitiatives.length > 0 && (article as any)._enabled_relatedInitiatives !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Related Initiatives
                </h3>
                <RenderFactory
                  fieldKey="relatedInitiatives"
                  value={article.relatedInitiatives}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._relatedInitiatives_type || 'list',
                    fields: (article as any)._relatedInitiatives_fields
                  }}
                />
              </section>
            )}

            {/* Outlook */}
            {(article as any)._enabled_outlook !== false && (
              <section>
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  Outlook
                </h3>
                <RenderFactory
                  fieldKey="outlook"
                  value={article.outlook}
                  onChange={() => {}}
                  mode="display"
                  schema={{
                    renderAs: (article as any)._outlook_type || 'textarea',
                    fields: (article as any)._outlook_fields
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
