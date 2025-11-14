import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Code, Shield, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';
import { useEffect, useState } from 'react';
import { validateSection } from '../schemas/validationSchema';

interface ContentModalProps {
  content: any; // The content object (Organization, ExecutiveIQ, Initiative, etc.)
  onClose: () => void;
}

type PreviewTab = 'visual' | 'json' | 'validation';

interface ValidationCheck {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  section?: string; // Optional: which section this check belongs to
}

export const ContentModal: React.FC<ContentModalProps> = ({ content, onClose }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>('visual');
  const [isValidating, setIsValidating] = useState(false);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);

  // Detect if this is a draft
  const isDraft = content?.status === 'draft';

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Validation function - uses schema-based validation
  const runValidation = () => {
    console.log('🔍 Running schema-based validation...', { content });
    setIsValidating(true);
    const checks: ValidationCheck[] = [];

    // Step 1: Global checks
    checks.push({ 
      field: 'Global: ID', 
      message: content.id ? `✓ ID found: ${content.id}` : '✗ Missing ID', 
      severity: content.id ? 'success' : 'error' 
    });
    checks.push({ 
      field: 'Global: Title/Name', 
      message: (content.title || content.name) ? `✓ Title: ${content.title || content.name}` : '✗ Missing title/name', 
      severity: (content.title || content.name) ? 'success' : 'error' 
    });

    // Step 2: Split JSON into sections
    const sections = Object.keys(content).filter(key => 
      !key.startsWith('_') && 
      !['id', 'title', 'name', 'date', 'lastUpdated', 'updatedAt', 'tags', 'category', 'quarter', 'year', 'status'].includes(key)
    );

    console.log('📋 Sections found:', sections);

    // Step 3: For each section, identify _type and run validation
    sections.forEach((sectionKey) => {
      const typeKey = `_${sectionKey}_type`;
      const enabledKey = `_enabled_${sectionKey}`;
      const sectionType = content[typeKey];
      const sectionData = content[sectionKey];
      const isEnabled = content[enabledKey] !== false;

      const sectionLabel = formatLabel(sectionKey);

      // Check 1: _type metadata exists
      if (!sectionType) {
        checks.push({
          field: `${sectionLabel}: Metadata _type`,
          message: '✗ Missing _type metadata',
          severity: 'error',
          section: sectionKey
        });
        return; // Skip further validation for this section
      }

      checks.push({
        field: `${sectionLabel}: Metadata _type`,
        message: `✓ Found: "${sectionType}"`,
        severity: 'success',
        section: sectionKey
      });

      // Check 2: _enabled metadata
      checks.push({
        field: `${sectionLabel}: Metadata _enabled`,
        message: `✓ Found: ${isEnabled}`,
        severity: 'success',
        section: sectionKey
      });

      // Step 4: Locate validation schema for this type and run validation
      console.log(`🔍 Validating section "${sectionKey}" with type "${sectionType}"`);
      const validationResults = validateSection(sectionKey, sectionData, sectionType, content);

      // Step 5: Add validation results to checks
      validationResults.forEach(result => {
        checks.push({
          field: `${sectionLabel}: ${result.field}`,
          message: result.message,
          severity: result.severity,
          section: sectionKey
        });
      });
    });

    console.log('✅ Validation complete:', { checks });
    setTimeout(() => {
      setValidationChecks(checks);
      setIsValidating(false);
    }, 300);
  };

  // Run validation when switching to validation tab
  useEffect(() => {
    console.log('📍 Effect triggered:', { activePreviewTab, isDraft });
    if (activePreviewTab === 'validation') {
      runValidation();
    }
  }, [activePreviewTab, content]);

  if (!content) return null;

  // Extract display metadata
  const title = content.title || content.name || 'Untitled';
  const date = content.date || content.lastUpdated || content.updatedAt;
  
  // Get all sections by finding keys that have corresponding _type metadata
  const sections: Array<{ key: string; label: string; data: any; type: string; fields?: any; itemSchema?: any; chartConfig?: any; subtitle?: string; isMultiField?: boolean; multiFieldData?: any[]; displayTitle?: boolean }> = [];
  
  // First pass: Identify all data keys with _type metadata
  const allDataKeys = Object.keys(content).filter((key) => {
    if (key.startsWith('_') || ['id', 'title', 'name', 'date', 'lastUpdated', 'updatedAt', 'tags', 'category', 'quarter', 'year', 'status', 'protectionEnabled'].includes(key)) {
      return false;
    }
    const typeKey = `_${key}_type`;
    const enabledKey = `_enabled_${key}`;
    return content[typeKey] && content[enabledKey] !== false;
  });
  
  // Group indexed fields (section2_0, section2_1) under their parent section (section2)
  // Only treat as indexed if the suffix is a small number (0-9), not a random ID like 1762678245566
  const sectionGroups = new Map<string, string[]>();
  const indexedFieldPattern = /^(.+)_(\d+)$/;
  
  allDataKeys.forEach(key => {
    const match = key.match(indexedFieldPattern);
    if (match) {
      const [, baseName, indexStr] = match;
      const index = parseInt(indexStr, 10);
      
      // Only treat as indexed field if index is small (0-9)
      // Large numbers (like 1762678245566) are random IDs, not indices
      if (index < 10) {
        if (!sectionGroups.has(baseName)) {
          sectionGroups.set(baseName, []);
        }
        sectionGroups.get(baseName)!.push(key);
      } else {
        // Large index number = random ID, not an indexed field
        sectionGroups.set(key, [key]);
      }
    } else {
      // Non-indexed field - add as single-item group
      sectionGroups.set(key, [key]);
    }
  });
  
  // Build sections from groups
  sectionGroups.forEach((fieldKeys, baseName) => {
    if (fieldKeys.length === 1) {
      // Single field - original logic
      const key = fieldKeys[0];
      const typeKey = `_${key}_type`;
      const fieldsKey = `_${key}_fields`;
      const chartConfigKey = `_${key}_chartConfig`;
      const rawData = content[key];
      let actualData = rawData;
      let subtitle: string | undefined;
      
      // Handle special object structures that contain arrays
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
        if (rawData.categories && Array.isArray(rawData.categories)) {
          actualData = rawData.categories;
          subtitle = rawData.subtitle;
        }
      }
      
      sections.push({
        key,
        label: content[`_${key}_label`] || formatLabel(key),
        data: actualData,
        type: content[typeKey],
        fields: content[fieldsKey], // Legacy support
        itemSchema: content[`_${key}_itemSchema`], // New format
        chartConfig: content[chartConfigKey],
        subtitle,
        displayTitle: content[`_${key}_displayTitle`] !== false // Default to true
      });
    } else {
      // Multiple fields - create multi-field section
      const multiFieldData = fieldKeys.sort().map(fieldKey => ({
        key: fieldKey,
        type: content[`_${fieldKey}_type`],
        data: content[fieldKey],
        fields: content[`_${fieldKey}_fields`],
        itemSchema: content[`_${fieldKey}_itemSchema`],
        chartConfig: content[`_${fieldKey}_chartConfig`],
        layoutZone: content[`_${fieldKey}_layoutZone`] || 'full',
        assetTitle: content[`_${fieldKey}_assetTitle`] || '',
        displayAssetTitle: content[`_${fieldKey}_displayAssetTitle`] !== false
      }));
      
      sections.push({
        key: baseName,
        label: content[`_${baseName}_label`] || formatLabel(baseName),
        data: null, // Not used for multi-field
        type: 'multiField', // Special type
        isMultiField: true,
        multiFieldData,
        displayTitle: content[`_${baseName}_displayTitle`] !== false // Default to true
      });
    }
  });

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
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draft Preview Control Bar - Only shown in draft mode */}
          {isDraft && (
            <div className="no-print flex-shrink-0 sticky top-0 z-20 bg-gradient-to-r from-fis-eggplant to-fis-raspberry shadow-2xl rounded-t-3xl">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-roobert-bold text-white">Preview Mode - DRAFT</h3>
                    <p className="text-xs text-white/80">{title}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePreviewTab('visual')}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'visual'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all`}
                  >
                    <Eye className="w-4 h-4" />
                    Visual
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('json')}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'json'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all`}
                  >
                    <Code className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('validation')}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'validation'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all`}
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Validate
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors ml-2"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show Validation view if in draft mode and validation tab is active */}
          {isDraft && activePreviewTab === 'validation' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant">
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
                    JSON Validation Report
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isValidating ? 'Running comprehensive validation checks...' : `${validationChecks.length} checks completed`}
                  </p>
                </div>

                {/* Validation Results */}
                <div className="space-y-6">
                  {(() => {
                    // Get global checks first
                    const globalChecks = validationChecks.filter(c => !c.section);
                    // Get unique sections
                    const sections = [...new Set(validationChecks.filter(c => c.section).map(c => c.section))];
                    
                    return (
                      <>
                        {/* Global Checks */}
                        {globalChecks.length > 0 && (
                          <div className="glass-strong rounded-xl p-6 border-2 border-white/20">
                            <h5 className="font-roobert-bold text-lg text-gray-900 dark:text-white mb-4">
                              Global Metadata
                            </h5>
                            
                            {/* Two column grid */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Left: Checks */}
                              <div className="space-y-2">
                                {globalChecks.map((check, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm">
                                    {check.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
                                    {check.severity === 'error' && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
                                    {check.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />}
                                    {check.severity === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
                                    <div className="flex-1">
                                      <div className="font-roobert-medium text-gray-900 dark:text-white">
                                        {check.field}
                                      </div>
                                      <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                                        {check.message}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Right: JSON */}
                              <div>
                                <div className="bg-gray-900 dark:bg-black rounded-lg p-3 max-h-[200px] overflow-auto">
                                  <pre className="text-xs font-mono text-green-400">
{JSON.stringify({
  id: content.id,
  title: content.title,
  name: content.name,
  date: content.date,
  status: content.status
}, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Section Checks */}
                        {sections.map((section) => {
                          const sectionChecks = validationChecks.filter(c => c.section === section);
                          const hasErrors = sectionChecks.some(c => c.severity === 'error');
                          const hasWarnings = sectionChecks.some(c => c.severity === 'warning');
                          const allSuccess = sectionChecks.every(c => c.severity === 'success');

                          // Get relevant JSON for this section
                          const sectionJson = {
                            [section as string]: content[section as string],
                            [`_${section}_type`]: content[`_${section}_type`],
                            [`_enabled_${section}`]: content[`_enabled_${section}`],
                            [`_${section}_fields`]: content[`_${section}_fields`],
                            [`_${section}_chartConfig`]: content[`_${section}_chartConfig`]
                          };
                          // Remove undefined values
                          Object.keys(sectionJson).forEach(key => {
                            if (sectionJson[key] === undefined) delete sectionJson[key];
                          });

                          return (
                            <div 
                              key={section} 
                              className={`glass-strong rounded-xl p-6 border-2 ${
                                hasErrors ? 'border-red-500/30' : 
                                hasWarnings ? 'border-yellow-500/30' : 
                                allSuccess ? 'border-green-500/30' : 
                                'border-white/20'
                              }`}
                            >
                              <h5 className="font-roobert-bold text-lg text-gray-900 dark:text-white mb-4">
                                {formatLabel(section as string)}
                              </h5>
                              
                              {/* Two column grid */}
                              <div className="grid grid-cols-2 gap-6">
                                {/* Left: Checks */}
                                <div className="space-y-2">
                                  {sectionChecks.map((check, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      {check.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
                                      {check.severity === 'error' && <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
                                      {check.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />}
                                      {check.severity === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
                                      <div className="flex-1">
                                        <div className="font-roobert-medium text-gray-900 dark:text-white">
                                          {check.field.replace(`${formatLabel(section as string)}: `, '')}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                                          {check.message}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Right: JSON for this section */}
                                <div>
                                  <div className="bg-gray-900 dark:bg-black rounded-lg p-3 max-h-[400px] overflow-auto">
                                    <pre className="text-xs font-mono text-green-400">
                                      {JSON.stringify(sectionJson, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : isDraft && activePreviewTab === 'json' ? (
            /* JSON view for draft mode */
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
                    JSON Data
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Raw JSON structure of the content
                  </p>
                </div>

                <div className="glass-strong rounded-xl p-4 border-2 border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                      JSON Structure
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(content, null, 2));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry text-xs font-roobert-medium transition-all"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="text-xs font-mono bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto max-h-[60vh] overflow-y-auto">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* Normal visual view (works for both draft and published) */
            <>
              {/* Header - Only shown if NOT in draft mode */}
              {!isDraft && (
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10 rounded-t-3xl flex-shrink-0">
                  <div>
                    <h2 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                      {title}
                    </h2>
                    {date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}

              {/* Content Sections */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-gray-900">
                {sections.map((section) => (
                  <section key={section.key}>
                    {section.displayTitle !== false && (
                      <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4">
                        {section.label}
                      </h3>
                    )}
                    {section.subtitle && section.displayTitle !== false && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {section.subtitle}
                      </p>
                    )}
                    
                    {/* Multi-field section: Render in grid with layout zones */}
                    {section.isMultiField && section.multiFieldData ? (
                      <div className="grid gap-6 items-center w-full" style={{
                        gridTemplateColumns: section.multiFieldData.map((field: any) => {
                          const zone = field.layoutZone || 'full';
                          if (zone.includes('left-70')) return '2.33fr';
                          if (zone.includes('right-30')) return '1fr';
                          if (zone.includes('left-33')) return '1fr';
                          if (zone.includes('middle-33')) return '1fr';
                          if (zone.includes('right-33')) return '1fr';
                          if (zone.includes('left-50')) return '1fr';
                          if (zone.includes('right-50')) return '1fr';
                          return '1fr';
                        }).join(' ')
                      }}>
                        {section.multiFieldData.map((field: any, index: number) => (
                          <div key={field.key} className="flex flex-col self-center">
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
                        ))}
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
                
                {sections.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No content sections configured for this item.
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to convert camelCase/snake_case to Title Case
function formatLabel(key: string): string {
  // Remove trailing underscores and numbers (e.g., "_1_2_" or "_0")
  let cleaned = key.replace(/_\d+_?$/g, '').replace(/_$/g, '');
  
  // Replace underscores with spaces
  cleaned = cleaned.replace(/_/g, ' ');
  
  // Split on capital letters for camelCase
  const words = cleaned.split(/(?=[A-Z])/).join(' ').split(' ');
  
  // Capitalize each word
  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// OLD formatLabel function below (keeping for reference)
function formatLabelOld(key: string): string {
  return key
    // Insert space before capital letters
    .replace(/([A-Z])/g, ' $1')
    // Capitalize first letter
    .replace(/^./, (str) => str.toUpperCase())
    // Trim any extra spaces
    .trim();
}
