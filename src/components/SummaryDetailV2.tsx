import { motion } from 'framer-motion';
import { X, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useRef } from 'react';
import { RenderFactory } from '../renderers/RenderFactory';
import html2canvas from 'html2canvas';

interface SummaryDetailV2Props {
  summary: any;
  onClose: () => void;
}

export const SummaryDetailV2: React.FC<SummaryDetailV2Props> = ({ summary, onClose }) => {
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Get all content sections dynamically (excluding metadata)
  const getContentSections = () => {
    const metadataKeys = ['id', 'quarter', 'year', 'date', 'title', 'displayName', 'name', 'category', 'lastUpdated', 'status', 'protectionEnabled'];
    const excludePrefixes = ['_enabled_', '_completed_', '_locked_', '_template_'];
    const excludeSuffixes = ['_schema', '_type', '_fields', '_config', '_columnSpan'];
    const excludeContains = ['_chartConfig'];
    
    return Object.keys(summary)
      .filter(key => {
        if (metadataKeys.includes(key)) return false;
        if (excludePrefixes.some(prefix => key.startsWith(prefix))) return false;
        if (excludeSuffixes.some(suffix => key.endsWith(suffix))) return false;
        if (excludeContains.some(pattern => key.includes(pattern))) return false;
        return true;
      })
      .map(key => ({
        id: key,
        title: formatSectionTitle(key),
        enabled: summary[`_enabled_${key}`] !== false,
        type: summary[`_${key}_type`] || 'text',
        data: summary[key],
        columnSpan: summary[`_${key}_columnSpan`] || 1 // Default to 1 column
      }))
      .filter(section => section.enabled && section.data !== undefined && section.data !== null);
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Organize sections into rows based on column spans (max 4 columns per row)
  const organizeSectionsIntoRows = (sections: any[]) => {
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let currentRowColumns = 0;

    sections.forEach(section => {
      const columnSpan = Math.min(section.columnSpan || 1, 4); // Cap at 4 columns
      
      // If adding this section would exceed 4 columns, start a new row
      if (currentRowColumns + columnSpan > 4) {
        if (currentRow.length > 0) {
          rows.push(currentRow);
        }
        currentRow = [section];
        currentRowColumns = columnSpan;
      } else {
        currentRow.push(section);
        currentRowColumns += columnSpan;
      }
    });

    // Add the last row if it has sections
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const contentSections = getContentSections();
  const sectionRows = organizeSectionsIntoRows(contentSections);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    try {
      // Temporarily expand all sections for full screenshot
      const allSectionIds = contentSections.map(s => s.id);
      setExpandedSections(new Set(allSectionIds));
      
      // Wait for animations
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `executive-summary-${summary.quarter.replace(/\s+/g, '-').toLowerCase()}-${summary.year}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsHeaderCompact(scrollTop > 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div 
          className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 relative rounded-t-3xl z-10 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
          animate={{
            paddingTop: isHeaderCompact ? '1rem' : '2rem',
            paddingBottom: isHeaderCompact ? '1rem' : '2rem',
            paddingLeft: '2rem',
            paddingRight: '2rem'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <motion.div
            animate={{
              fontSize: isHeaderCompact ? '1.25rem' : '1.875rem',
            }}
            className="font-roobert-heavy text-gray-900 dark:text-white"
          >
            {summary.quarter} {summary.year}
          </motion.div>

          {!isHeaderCompact && (
            <motion.h2 
              initial={{ opacity: 1, height: 'auto' }}
              animate={{ 
                opacity: isHeaderCompact ? 0 : 1,
                height: isHeaderCompact ? 0 : 'auto',
                marginTop: isHeaderCompact ? 0 : '1.5rem'
              }}
              className="text-2xl font-roobert-medium text-gray-700 dark:text-gray-300 overflow-hidden"
            >
              {summary.title}
            </motion.h2>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white text-sm font-roobert-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download as Image'}
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <div 
          className="flex-1 p-8 space-y-6 overflow-y-auto bg-white dark:bg-gray-900"
          onScroll={handleScroll}
          ref={contentRef}
        >
          {sectionRows.map((row, rowIndex) => (
            <div 
              key={`row-${rowIndex}`}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {row.map((section, sectionIndex) => {
                const columnSpan = Math.min(section.columnSpan || 1, 4);
                const colSpanClass = 
                  columnSpan === 4 ? 'md:col-span-4' :
                  columnSpan === 3 ? 'md:col-span-3' :
                  columnSpan === 2 ? 'md:col-span-2' :
                  'md:col-span-1';

                return (
                  <motion.section
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (rowIndex * row.length + sectionIndex) * 0.05 }}
                    className={`bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden ${colSpanClass}`}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-all"
                    >
                      <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Section Content */}
                    {expandedSections.has(section.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-gray-200 dark:border-gray-700 p-6"
                      >
                        <RenderFactory
                          fieldKey={section.id}
                          value={section.data}
                          onChange={() => {}} // Read-only in display mode
                          mode="display"
                          schema={{
                            renderAs: section.type,
                            fields: summary[`_${section.id}_fields`],
                            chartConfig: summary[`_${section.id}_chartConfig`],
                            hrConfig: summary[`_${section.id}_hrConfig`]
                          }}
                        />
                      </motion.div>
                    )}
                  </motion.section>
                );
              })}
            </div>
          ))}

          {contentSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 font-roobert-medium">
                No content sections available
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
