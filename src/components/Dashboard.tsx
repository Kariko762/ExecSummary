import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';

export const Dashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPerformance = performanceData[currentIndex];
  const hasPerformanceData = performanceData.length > 0 && currentPerformance;

  // Load performance data from backend
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content?tag=performance');
        const data = await response.json();
        
        // Filter for published template-based performance (not legacy demoStudio format)
        const publishedTemplateData = data.filter((item: any) => 
          item.status === 'published' && !item.demoStudio
        );
        
        // Sort by date (newest first)
        const sortedData = publishedTemplateData.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setPerformanceData(sortedData);
      } catch (error) {
        console.error('Failed to load performance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformanceData();
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev < performanceData.length - 1 ? prev + 1 : prev));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Parse sections from current performance data (same logic as ContentModal)
  const parseSections = () => {
    if (!currentPerformance) return [];

    const sections: any[] = [];
    const processedPrefixes = new Set<string>();

    // Get all keys that start with underscore (metadata keys)
    const metadataKeys = Object.keys(currentPerformance).filter(key => key.startsWith('_'));
    
    // Extract base names (section prefixes)
    metadataKeys.forEach(key => {
      // Match patterns like _sectionName_type or _sectionName_0_type
      const typeMatch = key.match(/^_(.+?)(?:_\d+)?_type$/);
      if (typeMatch) {
        const baseName = typeMatch[1];
        if (!processedPrefixes.has(baseName)) {
          processedPrefixes.add(baseName);

          // Check if enabled
          const enabledKey = `_enabled_${baseName}`;
          const isEnabled = currentPerformance[enabledKey] !== false;
          if (!isEnabled) return;

          // Get all field keys for this base name (e.g., sectionName_0, sectionName_1)
          const fieldKeys = Object.keys(currentPerformance).filter(k => {
            const pattern = new RegExp(`^${baseName}_\\d+$`);
            return pattern.test(k) || k === baseName;
          }).filter(k => !k.startsWith('_'));

          if (fieldKeys.length === 0) {
            // No data fields found - skip
            return;
          }

          if (fieldKeys.length === 1 && fieldKeys[0] === baseName) {
            // Single field - simple section
            const typeKey = `_${baseName}_type`;
            const fieldsKey = `_${baseName}_fields`;
            const chartConfigKey = `_${baseName}_chartConfig`;

            sections.push({
              key: baseName,
              label: formatLabel(baseName),
              data: currentPerformance[baseName],
              type: currentPerformance[typeKey],
              fields: currentPerformance[fieldsKey],
              chartConfig: currentPerformance[chartConfigKey],
              displayTitle: currentPerformance[`_${baseName}_displayTitle`] !== false
            });
          } else {
            // Multiple fields - multi-field section
            const multiFieldData = fieldKeys.sort().map(fieldKey => ({
              key: fieldKey,
              type: currentPerformance[`_${fieldKey}_type`],
              data: currentPerformance[fieldKey],
              fields: currentPerformance[`_${fieldKey}_fields`],
              chartConfig: currentPerformance[`_${fieldKey}_chartConfig`],
              layoutZone: currentPerformance[`_${fieldKey}_layoutZone`] || 'full',
              assetTitle: currentPerformance[`_${fieldKey}_assetTitle`] || '',
              displayAssetTitle: currentPerformance[`_${fieldKey}_displayAssetTitle`] !== false,
              alignment: currentPerformance[`_${fieldKey}_alignment`] || 'left'
            }));
            
            sections.push({
              key: baseName,
              label: formatLabel(baseName),
              data: null,
              type: 'multiField',
              isMultiField: true,
              multiFieldData,
              displayTitle: currentPerformance[`_${baseName}_displayTitle`] !== false
            });
          }
        }
      }
    });

    return sections;
  };

  const sections = parseSections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-4xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
          Performance Dashboard
        </h2>
        {currentPerformance?.title && (
          <p className="text-lg font-roobert-light text-gray-600 dark:text-gray-400">
            {currentPerformance.title}
          </p>
        )}
      </motion.div>

      {/* Performance Navigator */}
      {hasPerformanceData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <button
            onClick={goToPrevious}
            disabled={currentIndex === performanceData.length - 1}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="View older performance data"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className="text-xl font-roobert-semibold text-gray-900 dark:text-white px-6">
              {currentPerformance.displayName || new Date(currentPerformance.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            <div className="text-xs font-roobert-regular text-gray-500 dark:text-gray-400">
              {currentIndex + 1} of {performanceData.length} reports
            </div>
          </div>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="View newer performance data"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </motion.div>
      )}

      {/* Content Sections - Dynamically rendered using AssetRenderEngine */}
      {hasPerformanceData && sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.key}>
              {section.displayTitle !== false && (
                <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                  {section.label}
                </h3>
              )}
              
              {/* Multi-field section: Render in grid with layout zones */}
              {section.isMultiField && section.multiFieldData ? (
                <div className="flex flex-col gap-6 w-full">
                  {(() => {
                    const rows: any[][] = [];
                    let currentRow: any[] = [];
                    let currentRowType: string | null = null;

                    section.multiFieldData.forEach((field: any) => {
                      const zone = field.layoutZone || 'full';
                      
                      let rowType = 'full';
                      if (zone.includes('left-70') || zone.includes('right-30')) {
                        rowType = '70-30';
                      } else if (zone.includes('left-50') || zone.includes('right-50')) {
                        rowType = '50-50';
                      } else if (zone.includes('left-33') || zone.includes('middle-33') || zone.includes('right-33')) {
                        rowType = '33-33-33';
                      }

                      if (
                        (currentRowType && currentRowType !== rowType) ||
                        rowType === 'full' ||
                        (currentRowType === '70-30' && currentRow.length >= 2) ||
                        (currentRowType === '50-50' && currentRow.length >= 2) ||
                        (currentRowType === '33-33-33' && currentRow.length >= 3)
                      ) {
                        if (currentRow.length > 0) {
                          rows.push([...currentRow]);
                        }
                        currentRow = [];
                        currentRowType = null;
                      }

                      currentRow.push(field);
                      currentRowType = rowType;

                      if (rowType === 'full') {
                        rows.push([...currentRow]);
                        currentRow = [];
                        currentRowType = null;
                      }
                    });

                    if (currentRow.length > 0) {
                      rows.push(currentRow);
                    }

                    return rows.map((row, rowIndex) => {
                      const firstZone = row[0]?.layoutZone || 'full';
                      let gridCols = 'grid-cols-1';
                      let itemsAlign = '';
                      
                      if (firstZone.includes('left-33') || firstZone.includes('middle-33') || firstZone.includes('right-33')) {
                        gridCols = 'grid-cols-3';
                        itemsAlign = 'items-center';
                      } else if (firstZone.includes('left-50') || firstZone.includes('right-50')) {
                        gridCols = 'grid-cols-2';
                      } else if (firstZone.includes('left-70') || firstZone.includes('right-30')) {
                        gridCols = 'grid-cols-[2.33fr_1fr]';
                      }

                      return (
                        <div key={rowIndex} className={`grid ${gridCols} gap-6 ${itemsAlign} w-full`}>
                          {row.map((field: any, fieldIndex: number) => {
                            const alignment = field.alignment || 'left';
                            const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
                            // Apply margin to right column in 70-30 layout, but NOT in 33-33-33 layout
                            const isRightInTwoCol = field.layoutZone && field.layoutZone.includes('right-30');
                            
                            return (
                              <div key={field.key} className={`flex flex-col ${alignmentClass} ${isRightInTwoCol ? 'mt-28' : ''}`}>
                                {field.displayAssetTitle && field.assetTitle && (
                                  <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    {field.assetTitle}
                                  </h4>
                                )}
                                <AssetRenderEngine
                                  type={field.type}
                                  data={field.data}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                /* Single field section: Render normally */
                <AssetRenderEngine
                  type={section.type}
                  data={section.data}
                />
              )}
            </section>
          ))}
        </div>
      )}

      {/* No sections message */}
      {hasPerformanceData && sections.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No content sections configured for this performance report.
        </div>
      )}
    </div>
  );
};

// Helper function to convert camelCase/snake_case to Title Case
function formatLabel(key: string): string {
  let cleaned = key.replace(/_\d+_?$/g, '').replace(/_$/g, '');
  cleaned = cleaned.replace(/_/g, ' ');
  const words = cleaned.split(/(?=[A-Z])/).join(' ').split(' ');
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
