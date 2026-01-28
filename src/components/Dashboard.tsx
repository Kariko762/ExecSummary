import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';

type PerformanceTab = 'kai' | 'demostudio' | 'coast' | 'tiled';

const TAB_CONFIG = {
  kai: { label: 'Key Activity Insights', file: 'performance_kai' },
  demostudio: { label: 'Demo Studio', file: 'performance_demostudio' },
  coast: { label: 'Coast', file: 'week-vendor-performance-q1-2026-01-23' },
  tiled: { label: 'Tiled', file: 'performance_tiled' }
};

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('kai');
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasPerformanceData = performanceData !== null;

  // Load performance data from backend based on active tab
  useEffect(() => {
    const loadPerformanceData = async () => {
      setIsLoading(true);
      try {
        const filename = TAB_CONFIG[activeTab].file;
        const response = await fetch(`http://localhost:3001/api/content/${filename}`);
        const responseData = await response.json();
        const data = responseData.success ? responseData.content : responseData;
        
        setPerformanceData(data);
      } catch (error) {
        console.error('Failed to load performance data:', error);
        setPerformanceData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformanceData();
  }, [activeTab]);

  // Parse sections from current performance data (same logic as ContentModal)
  const parseSections = () => {
    if (!performanceData) return [];

    const sections: any[] = [];
    const processedPrefixes = new Set<string>();

    // Get all keys that start with underscore (metadata keys)
    const metadataKeys = Object.keys(performanceData).filter(key => key.startsWith('_'));
    
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
          const isEnabled = performanceData[enabledKey] !== false;
          if (!isEnabled) return;

          // Get all field keys for this base name (e.g., sectionName_0, sectionName_1)
          const fieldKeys = Object.keys(performanceData).filter(k => {
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
              data: performanceData[baseName],
              type: performanceData[typeKey],
              fields: performanceData[fieldsKey],
              chartConfig: performanceData[chartConfigKey],
              displayTitle: performanceData[`_${baseName}_displayTitle`] !== false
            });
          } else {
            // Multiple fields - multi-field section
            const multiFieldData = fieldKeys.sort().map(fieldKey => ({
              key: fieldKey,
              type: performanceData[`_${fieldKey}_type`],
              data: performanceData[fieldKey],
              fields: performanceData[`_${fieldKey}_fields`],
              chartConfig: performanceData[`_${fieldKey}_chartConfig`],
              layoutZone: performanceData[`_${fieldKey}_layoutZone`] || 'full',
              assetTitle: performanceData[`_${fieldKey}_assetTitle`] || '',
              displayAssetTitle: performanceData[`_${fieldKey}_displayAssetTitle`] !== false,
              alignment: performanceData[`_${fieldKey}_alignment`] || 'left'
            }));
            
            sections.push({
              key: baseName,
              label: formatLabel(baseName),
              data: null,
              type: 'multiField',
              isMultiField: true,
              multiFieldData,
              displayTitle: performanceData[`_${baseName}_displayTitle`] !== false
            });
          }
        }
      }
    });

    return sections;
  };

  const sections = parseSections();

  return (
    <div className="flex flex-col gap-3 pb-0">
      {/* Glassmorphism Container with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry opacity-95" />
        
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="perf-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#perf-grid)" />
          </svg>
        </div>

        {/* Floating Glassmorphism Shapes */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm bg-white/10 border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-roobert-heavy text-white">
                Performance Dashboard
              </h2>
            </div>
          </motion.div>

          {/* Performance Tabs */}
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 flex-wrap mb-8"
            >
              {(Object.keys(TAB_CONFIG) as PerformanceTab[]).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-8 py-3 rounded-xl font-roobert-semibold text-sm transition-all duration-300 ${
                    activeTab === tabKey
                      ? 'bg-white text-fis-navy shadow-lg shadow-white/20 scale-105'
                      : 'bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 hover:scale-105'
                  }`}
                >
                  {TAB_CONFIG[tabKey].label}
                </button>
              ))}
            </motion.div>
          )}

          {/* Content Sections - Inside the glassmorphism container */}
          {hasPerformanceData && sections.length > 0 && (
            <div className="flex flex-col gap-5 pb-4">
          {sections.map((section) => (
            <section key={section.key}>
              {section.displayTitle !== false && (
                <h3 className="text-lg font-roobert-semibold text-white/90 mb-2">
                  {section.label}
                </h3>
              )}
              
              {/* Multi-field section: Render in grid with layout zones */}
              {section.isMultiField && section.multiFieldData ? (
                <div className="flex flex-col gap-4 w-full">
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
                        <div key={rowIndex} className={`grid ${gridCols} gap-4 ${itemsAlign} w-full`}>
                          {row.map((field: any, fieldIndex: number) => {
                            const alignment = field.alignment || 'left';
                            const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
                            // Apply margin to right column in 70-30 layout, but NOT in 33-33-33 layout
                            const isRightInTwoCol = field.layoutZone && field.layoutZone.includes('right-30');
                            
                            return (
                              <div key={field.key} className={`flex flex-col ${alignmentClass} ${isRightInTwoCol ? 'mt-28' : ''}`}>
                                {field.displayAssetTitle && field.assetTitle && (
                                  <h4 className="text-sm font-roobert-semibold text-white/80 mb-1">
                                    {field.assetTitle}
                                  </h4>
                                )}
                                <AssetRenderEngine
                                  type={field.type}
                                  data={field.data}
                                  contentTag={performanceData?._contentTag}
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
                  contentTag={performanceData?._contentTag}
                />
              )}
            </section>
          ))}
        </div>
      )}

      {/* No sections message */}
      {hasPerformanceData && sections.length === 0 && (
        <div className="text-center py-12 text-white/70">
          No content sections configured for this performance report.
        </div>
      )}
        </div>
      </div>
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
