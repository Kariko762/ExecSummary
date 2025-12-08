import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, Upload, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, Lock, Unlock, EyeOff, Code2, Copy, CheckCheck, CheckCircle, Shield, ShieldOff, HelpCircle, AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';
import { summarySchema } from '@shared/schemas/summarySchema';
import { buildFieldSchema, ASSET_LIBRARY } from '../schemas/assetDataStore';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';
import '../renderers/assetRenderEngine.css';
import { ConfirmationModal } from './ConfirmationModal';
import PreviewModal from './PreviewModal';
import AssetLibrary from './AssetLibrary';

interface EditorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: 'summaries' | 'executive-iq' | 'organizations' | 'performance' | 'knowledge-base' | 'kb-categories';
  onSave: (data: any, status: 'draft' | 'published') => void;
  isTestMode?: boolean; // Flag to indicate testing mode (don't prompt to save)
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function EditorModalV2({ 
  isOpen, 
  onClose, 
  data, 
  dataType, 
  onSave,
  isTestMode = false,
  showNotification
}: EditorModalV2Props) {
  const [editedData, setEditedData] = useState<any>(data);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isDirty, setIsDirty] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false); // Track if file has been saved at least once
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showExpressionMenu, setShowExpressionMenu] = useState(false);
  const [copiedExpression, setCopiedExpression] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false); // For unsaved changes warning
  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false); // For publish confirmation
  const [showUnpublishConfirmation, setShowUnpublishConfirmation] = useState(false); // For unpublish confirmation
  const [showAssetReference, setShowAssetReference] = useState(false); // Asset type reference modal
  const [referenceAssetType, setReferenceAssetType] = useState<string | undefined>(undefined); // Which asset type to show
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false); // For section complete/incomplete confirmation
  const [showVisibilityConfirmation, setShowVisibilityConfirmation] = useState(false); // For section enable/disable confirmation
  const [pendingSectionAction, setPendingSectionAction] = useState<{ sectionId: string; action: 'complete' | 'visibility' } | null>(null); // Track pending action
  const [expandedSubsections, setExpandedSubsections] = useState<Set<string>>(new Set()); // Track which subsections are expanded
  const [availableTags, setAvailableTags] = useState<any[]>([]); // Available content tags
  const [availableGoals, setAvailableGoals] = useState<any[]>([]); // Available goals for tagging
  const [showAddSectionModal, setShowAddSectionModal] = useState(false); // Add section modal
  const [selectedAssetType, setSelectedAssetType] = useState<string>('text'); // Selected asset type for new section
  const [selectedColumnLayout, setSelectedColumnLayout] = useState<string>('full'); // Selected column layout: full, 50-50, 70-30, 30-70, 33-33-33
  const [newSectionName, setNewSectionName] = useState<string>(''); // New section name
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null); // Track hovered section for move/delete buttons
  const [showDeleteSectionConfirm, setShowDeleteSectionConfirm] = useState(false); // Delete section confirmation
  const [pendingDeleteSectionId, setPendingDeleteSectionId] = useState<string | null>(null); // Section to delete
  const [showAssetLibraryForSection, setShowAssetLibraryForSection] = useState(false); // Show asset library to add asset to section
  const [showAddAssetModal, setShowAddAssetModal] = useState(false); // Add asset to section modal
  const [newAssetName, setNewAssetName] = useState<string>(''); // New asset display name
  const [selectedAssetForSection, setSelectedAssetForSection] = useState<string>('text'); // Selected asset type to add
  const [showDeleteAssetConfirm, setShowDeleteAssetConfirm] = useState(false); // Delete asset confirmation
  const [pendingDeleteAssetKey, setPendingDeleteAssetKey] = useState<string | null>(null); // Asset to delete

  // Fetch available tags and goals
  useEffect(() => {
    const fetchTagsAndGoals = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch('http://localhost:3001/api/content-tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          const tagsArray = Array.isArray(tagsData) ? tagsData : (tagsData.tags || []);
          console.log('EditorModalV2 - Tags loaded:', tagsArray);
          setAvailableTags(tagsArray);
        }

        // Fetch goals
        const goalsResponse = await fetch('http://localhost:3001/api/goals');
        if (goalsResponse.ok) {
          const goalsData = await goalsResponse.json();
          const goalsArray = goalsData.goals || [];
          console.log('EditorModalV2 - Goals loaded:', goalsArray);
          setAvailableGoals(goalsArray);
        }
      } catch (error) {
        console.error('Failed to fetch tags/goals:', error);
      }
    };
    if (isOpen) {
      fetchTagsAndGoals();
    }
  }, [isOpen]);

  // Section weights (complexity/time required, 1-10)
  const sectionWeights: { [key: string]: number } = {
    header: 2,
    highlights: 5,
    keyMetrics: 3,
    activityMetrics: 8,
    topAssets: 4,
    weeklyFocus: 5,
    departments: 9,
    initiatives: 8,
    risks: 6,
    issuesAndBlockers: 10,
    outlook: 7,
    sections: 6,
    content: 7,
    keyTakeaways: 5,
    recommendations: 6
  };

  // Calculate weighted completion percentage
  const calculateCompletion = (): number => {
    const enabledSections = sections.filter(s => s.enabled);
    if (enabledSections.length === 0) return 0;

    const totalWeight = enabledSections.reduce((sum, s) => {
      const weight = sectionWeights[s.id] || 5;
      return sum + weight;
    }, 0);
    
    const completedWeight = enabledSections
      .filter(s => s.completed)
      .reduce((sum, s) => {
        const weight = sectionWeights[s.id] || 5;
        return sum + weight;
      }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  // Reset editedData when modal opens or data changes
  useEffect(() => {
    if (isOpen && data) {
      setEditedData(data);
      setStatus(data.status || 'draft');
      setProtectionEnabled(data.protectionEnabled !== false); // Default to true
      setIsDirty(false); // Reset dirty flag
      // If _fileExists is explicitly false, it's new content (not yet saved)
      // If _fileExists is true or undefined, assume it exists (loaded from backend)
      setHasBeenSaved(data._fileExists !== false);
      setShowSaveConfirmation(false); // Close any open confirmation
      setShowCloseConfirmation(false); // Close any close confirmation
      setShowExpressionMenu(false); // Close expression menu
      // Set first enabled section as active on load
      const sections = getSectionsFromData(data);
      const firstEnabled = sections.find(s => s.enabled);
      if (firstEnabled) {
        setActiveSectionId(firstEnabled.id);
      }
      // Initialize expanded subsections - expand all indexed fields by default
      const allIndexedFields = Object.keys(data).filter(key => /_\d+$/.test(key) && !key.startsWith('_'));
      setExpandedSubsections(new Set(allIndexedFields));
    }
  }, [data, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Handle Escape key for modal close
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          // If expression menu is open, close it first
          if (showExpressionMenu) {
            setShowExpressionMenu(false);
            e.stopPropagation(); // Prevent closing the modal
          } else {
            handleBeforeClose();
          }
        }
      };
      
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, isDirty, hasBeenSaved, showExpressionMenu]); // Add showExpressionMenu to dependencies

  /**
   * Schema-Driven Section Renderer
   * Core engine: Reads _<sectionId>_type metadata → looks up in assetTypeRegistry → renders
   * 
   * Architecture:
   * - First checks for dynamic type in editedData[`_${sectionId}_type`]
   * - Looks up base schema from assetTypeRegistry
   * - Applies custom fields from editedData[`_${sectionId}_fields`] if present
   * - Falls back to hardcoded summarySchema for backwards compatibility
   */
  const renderSchemaSection = (sectionId: string): React.ReactElement | null => {
    // Check if this section has multiple indexed fields (section2_0, section2_1, etc.)
    const indexedFieldPattern = new RegExp(`^${sectionId}_(\\d+)$`);
    const indexedFields = Object.keys(editedData)
      .filter(key => indexedFieldPattern.test(key) && !key.startsWith('_'))
      .sort(); // Sort to ensure consistent order (0, 1, 2, 3)
    
    // If indexed fields exist (even just one), render them as expandable subsections stacked vertically
    if (indexedFields.length >= 1) {
      return (
        <div className="space-y-3">
          {indexedFields.map((fieldKey, index) => {
            const fieldData = editedData[fieldKey];
            const fieldType = editedData[`_${fieldKey}_type`];
            const itemSchema = editedData[`_${fieldKey}_itemSchema`];
            const customFields = editedData[`_${fieldKey}_fields`]; // Legacy support
            const chartConfig = editedData[`_${fieldKey}_chartConfig`];
            const alignment = editedData[`_${fieldKey}_alignment`] || 'left';
            const columnSpan = editedData[`_${fieldKey}_columnSpan`];
            const layoutZone = editedData[`_${fieldKey}_layoutZone`] || 'full';
            
            if (!fieldType) return null;
            
            const isExpanded = expandedSubsections.has(fieldKey);
            const toggleExpanded = () => {
              setExpandedSubsections(prev => {
                const next = new Set(prev);
                if (next.has(fieldKey)) {
                  next.delete(fieldKey);
                } else {
                  next.add(fieldKey);
                }
                return next;
              });
            };
            
            // Get position label from layoutZone metadata
            const getPositionLabel = (zone: string): string => {
              if (zone === 'full') return 'Full Width';
              if (zone === 'left-50' || zone === 'right-50') return zone === 'left-50' ? 'Left 50%' : 'Right 50%';
              if (zone === 'left-70') return 'Left 70%';
              if (zone === 'right-30') return 'Right 30%';
              if (zone === 'left-30') return 'Left 30%';
              if (zone === 'right-70') return 'Right 70%';
              if (zone === 'left-33') return 'Left 33%';
              if (zone === 'middle-33') return 'Middle 33%';
              if (zone === 'right-33') return 'Right 33%';
              return zone; // Fallback
            };
            
            const positionLabel = getPositionLabel(layoutZone);
            
            // Use itemSchema if available (new format), otherwise use customFields (legacy)
            const baseSchema = itemSchema 
              ? { itemSchema } 
              : (customFields ? { fields: customFields } : {});
            
            const fullBaseSchema = buildFieldSchema(fieldType, baseSchema);
            const factorySchema: any = {
              label: formatSectionTitle(fieldKey),
              renderAs: fieldType,
              ...fullBaseSchema,
              ...(chartConfig ? { chartConfig } : {}),
              alignment: alignment
            };
            
            return (
              <div key={fieldKey} className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden`}>
                {/* Subsection Header */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                  <button
                    onClick={toggleExpanded}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors flex-shrink-0"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <span className="font-roobert-semibold text-sm text-gray-900 dark:text-white truncate">
                    {formatSectionTitle(fieldKey)} {index}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    : {fieldType}
                  </span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openAssetReference(fieldType);
                    }}
                    className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 hover:text-fis-raspberry transition-colors cursor-pointer"
                    title="View asset type reference"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </div>
                    
                    {/* Inline Asset Title Input */}
                    <input
                      type="text"
                      value={editedData[`_${fieldKey}_assetTitle`] || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        const assetTitleKey = `_${fieldKey}_assetTitle`;
                        console.log(`🔍 Setting ${assetTitleKey} = "${e.target.value}"`);
                        setEditedData((prev: any) => ({
                          ...prev,
                          [assetTitleKey]: e.target.value
                        }));
                        setIsDirty(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Asset title (optional)"
                      className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
                      style={{ width: '250px' }}
                    />

                    {/* Goal Tagging Dropdown */}
                    <select
                      value={editedData[`_${fieldKey}_goalTag`] || ''}
                      onChange={(e) => {
                        e.stopPropagation();
                        const goalTagKey = `_${fieldKey}_goalTag`;
                        const value = e.target.value;
                        console.log(`🎯 Tagging asset ${fieldKey} with goal: ${value}`);
                        setEditedData((prev: any) => ({
                          ...prev,
                          [goalTagKey]: value || undefined
                        }));
                        setIsDirty(true);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="px-1.5 py-0.5 rounded text-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry w-44"
                      title="Tag this content with a strategic goal"
                    >
                      <option value="">🎯 None</option>
                      {availableGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.shortName}
                        </option>
                      ))}
                    </select>
                    
                    {/* Asset Title Toggle */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const displayKey = `_${fieldKey}_displayAssetTitle`;
                        setEditedData((prev: any) => ({
                          ...prev,
                          [displayKey]: prev[displayKey] === false ? true : false
                        }));
                        setIsDirty(true);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium transition-colors cursor-pointer ${
                        editedData[`_${fieldKey}_displayAssetTitle`] !== false
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}
                      title={editedData[`_${fieldKey}_displayAssetTitle`] !== false ? 'Asset title visible' : 'Asset title hidden'}
                    >
                      Title {editedData[`_${fieldKey}_displayAssetTitle`] !== false ? '✓' : '✗'}
                    </div>
                    
                    {/* Asset Enable/Disable Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const enabledKey = `_enabled_${fieldKey}`;
                        setEditedData((prev: any) => ({
                          ...prev,
                          [enabledKey]: prev[enabledKey] === false ? true : false
                        }));
                        setIsDirty(true);
                      }}
                      className={`p-1 rounded transition-colors ${
                        editedData[`_enabled_${fieldKey}`] !== false
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      }`}
                      title={editedData[`_enabled_${fieldKey}`] !== false ? 'Disable asset (hide from display)' : 'Enable asset (show in display)'}
                    >
                      {editedData[`_enabled_${fieldKey}`] !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    
                    {/* Alignment Buttons */}
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const alignKey = `_${fieldKey}_alignment`;
                          setEditedData((prev: any) => ({
                            ...prev,
                            [alignKey]: 'left'
                          }));
                          setIsDirty(true);
                        }}
                        className={`p-1 rounded transition-colors ${
                          (editedData[`_${fieldKey}_alignment`] || 'left') === 'left'
                            ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title="Align Left"
                      >
                        <AlignLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const alignKey = `_${fieldKey}_alignment`;
                          setEditedData((prev: any) => ({
                            ...prev,
                            [alignKey]: 'center'
                          }));
                          setIsDirty(true);
                        }}
                        className={`p-1 rounded transition-colors ${
                          editedData[`_${fieldKey}_alignment`] === 'center'
                            ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title="Align Center"
                      >
                        <AlignCenter className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const alignKey = `_${fieldKey}_alignment`;
                          setEditedData((prev: any) => ({
                            ...prev,
                            [alignKey]: 'right'
                          }));
                          setIsDirty(true);
                        }}
                        className={`p-1 rounded transition-colors ${
                          editedData[`_${fieldKey}_alignment`] === 'right'
                            ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title="Align Right"
                      >
                        <AlignRight className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Delete Asset Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteAssetKey(fieldKey);
                        setShowDeleteAssetConfirm(true);
                      }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete this asset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                      {positionLabel}
                    </span>
                    
                    {/* Goal Tag Badge */}
                    {editedData[`_${fieldKey}_goalTag`] && (() => {
                      const goalId = editedData[`_${fieldKey}_goalTag`];
                      const goal = availableGoals.find(g => g.id === goalId);
                      return goal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roobert-medium bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry">
                          🎯 {goal.shortName}
                        </span>
                      ) : null;
                    })()}
                    
                    {/* Disabled Badge */}
                    {editedData[`_enabled_${fieldKey}`] === false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roobert-medium bg-red-500/20 text-red-600 dark:text-red-400">
                        <EyeOff className="w-2.5 h-2.5" />
                        Hidden
                      </span>
                    )}
                </div>
                
                {/* Subsection Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3">
                        <AssetRenderEngine
                          type={fieldType}
                          data={fieldData}
                          onChange={(newValue) => {
                            setEditedData((prev: any) => ({
                              ...prev,
                              [fieldKey]: newValue
                            }));
                            setIsDirty(true);
                          }}
                          mode="edit"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Single field - original logic
    const sectionData = editedData[sectionId];
    const sectionType = editedData[`_${sectionId}_type`];
    const itemSchema = editedData[`_${sectionId}_itemSchema`];
    const customFields = editedData[`_${sectionId}_fields`]; // Legacy support
    
    // Special handling for standard_header - render metadata fields
    if (sectionId === 'standard_header') {
      return (
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Document ID
              <span className="ml-2 text-xs font-normal text-gray-500">(read-only)</span>
            </label>
            <input
              type="text"
              value={editedData.id || ''}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-500 font-mono text-sm cursor-not-allowed"
              placeholder="week-mmm-dd-yyyy"
            />
          </div>
          
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quarter/Period
            </label>
            <input
              type="text"
              value={editedData.quarter || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({ ...prev, quarter: e.target.value }));
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Oct 31 or Q4"
            />
          </div>
          
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <input
              type="number"
              value={editedData.year || new Date().getFullYear()}
              onChange={(e) => {
                setEditedData((prev: any) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }));
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={editedData.date || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({ ...prev, date: e.target.value }));
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={editedData.title || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({ ...prev, title: e.target.value }));
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Organization - Weekly Executive Update"
            />
          </div>
          
          <div>
            <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
              Content Tag
            </label>
            <select
              value={editedData._contentTag || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({ ...prev, _contentTag: e.target.value }));
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">-- Select a tag --</option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
            {availableTags.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                No tags available. Create one in System Settings.
              </p>
            )}
          </div>
        </div>
      );
    }
    
    // Try dynamic schema first (from templates) - NEW APPROACH
    if (sectionType) {
      // Build schema from asset type registry + custom fields
      const chartConfig = editedData[`_${sectionId}_chartConfig`];
      const alignment = editedData[`_${sectionId}_alignment`] || 'left';
      
      // Use itemSchema if available (new format), otherwise use customFields (legacy)
      const baseSchema = itemSchema 
        ? { itemSchema } 
        : (customFields ? { fields: customFields } : {});
      
      const fullBaseSchema = buildFieldSchema(sectionType, baseSchema);
      
      // For the factorySchema, merge itemSchema properties at the top level for simple types
      // but keep nested structure for complex types
      let factorySchema: any = {
        label: formatSectionTitle(sectionId),
        renderAs: sectionType,
        enabled: true,  // Always enable fields in edit mode
        ...fullBaseSchema,
        ...(chartConfig ? { chartConfig } : {}),
        alignment: alignment
      };
      
      // If itemSchema exists and renderAs is a simple type, merge itemSchema properties at top level
      if (itemSchema && ['text', 'textarea', 'number', 'richText', 'expression', 'quote', 'codeBlock', 'keyValueList'].includes(sectionType)) {
        // For simple types, take properties from itemSchema and put them at the top level
        factorySchema = {
          ...factorySchema,
          label: itemSchema.label || factorySchema.label,
          placeholder: itemSchema.placeholder,
          helpText: itemSchema.helpText,
          required: itemSchema.required,
          // Remove itemSchema from the top level for simple types
          itemSchema: undefined
        };
      } else if (itemSchema && ['object', 'objectForm', 'keyValue', 'image', 'video', 'embeddedVideo', 'statusBoard'].includes(sectionType)) {
        // For complex types that need fields, merge fields from itemSchema
        factorySchema = {
          ...factorySchema,
          label: itemSchema.label || factorySchema.label,
          fields: itemSchema.fields || factorySchema.fields,
          helpText: itemSchema.helpText,
          required: itemSchema.required
        };
      }
      
      console.log(`[EditorModalV2] Rendering section "${sectionId}" with:`, {
        sectionType,
        sectionData,
        factorySchema,
        mode: 'edit'
      });
      
      // Get layout zone and asset title for single assets
      const layoutZone = editedData[`_${sectionId}_layoutZone`] || 'full';
      const getPositionLabel = (zone: string): string => {
        if (zone === 'full') return 'Full Width';
        if (zone === 'left-50' || zone === 'right-50') return zone === 'left-50' ? 'Left 50%' : 'Right 50%';
        if (zone === 'left-70') return 'Left 70%';
        if (zone === 'right-30') return 'Right 30%';
        if (zone === 'left-30') return 'Left 30%';
        if (zone === 'right-70') return 'Right 70%';
        if (zone === 'left-33') return 'Left 33%';
        if (zone === 'middle-33') return 'Middle 33%';
        if (zone === 'right-33') return 'Right 33%';
        return zone;
      };
      const positionLabel = getPositionLabel(layoutZone);
      
      return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Asset Header with Controls */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
            <span className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
              {formatSectionTitle(sectionId)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              : {sectionType}
            </span>
            <div
              onClick={() => openAssetReference(sectionType)}
              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 hover:text-fis-raspberry transition-colors cursor-pointer"
              title="View asset type reference"
            >
              <HelpCircle className="w-3 h-3" />
            </div>
            
            {/* Asset Title Input */}
            <input
              type="text"
              value={editedData[`_${sectionId}_assetTitle`] || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({
                  ...prev,
                  [`_${sectionId}_assetTitle`]: e.target.value
                }));
                setIsDirty(true);
              }}
              placeholder="Asset title (optional)"
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
              style={{ width: '220px' }}
            />
            
            {/* Goal Tagging Dropdown */}
            <select
              value={editedData[`_${sectionId}_goalTag`] || ''}
              onChange={(e) => {
                const goalTagKey = `_${sectionId}_goalTag`;
                const value = e.target.value;
                console.log(`🎯 Tagging section ${sectionId} with goal: ${value}`);
                setEditedData((prev: any) => ({
                  ...prev,
                  [goalTagKey]: value || undefined
                }));
                setIsDirty(true);
              }}
              className="px-1.5 py-0.5 rounded text-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry w-44"
              title="Tag this content with a strategic goal"
            >
              <option value="">🎯 None</option>
              {availableGoals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.shortName}
                </option>
              ))}
            </select>
            
            {/* Asset Title Toggle */}
            <div
              onClick={() => {
                const displayKey = `_${sectionId}_displayAssetTitle`;
                setEditedData((prev: any) => ({
                  ...prev,
                  [displayKey]: prev[displayKey] === false ? true : false
                }));
                setIsDirty(true);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium transition-colors cursor-pointer ${
                editedData[`_${sectionId}_displayAssetTitle`] !== false
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
              title={editedData[`_${sectionId}_displayAssetTitle`] !== false ? 'Asset title visible' : 'Asset title hidden'}
            >
              Title {editedData[`_${sectionId}_displayAssetTitle`] !== false ? '✓' : '✗'}
            </div>
            
            {/* Asset Enable/Disable Toggle */}
            <button
              onClick={() => {
                const enabledKey = `_enabled_${sectionId}`;
                setEditedData((prev: any) => ({
                  ...prev,
                  [enabledKey]: prev[enabledKey] === false ? true : false
                }));
                setIsDirty(true);
              }}
              className={`p-1 rounded transition-colors ${
                editedData[`_enabled_${sectionId}`] !== false
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
              }`}
              title={editedData[`_enabled_${sectionId}`] !== false ? 'Disable asset (hide from display)' : 'Enable asset (show in display)'}
            >
              {editedData[`_enabled_${sectionId}`] !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            
            {/* Alignment Buttons */}
            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'left'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  (editedData[`_${sectionId}_alignment`] || 'left') === 'left'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'center'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  editedData[`_${sectionId}_alignment`] === 'center'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'right'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  editedData[`_${sectionId}_alignment`] === 'right'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Right"
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>
            
            {/* Delete Asset Button */}
            <button
              onClick={() => {
                setPendingDeleteAssetKey(sectionId);
                setShowDeleteAssetConfirm(true);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete this asset"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {positionLabel}
            </span>
            
            {/* Disabled Badge */}
            {editedData[`_enabled_${sectionId}`] === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roobert-medium bg-red-500/20 text-red-600 dark:text-red-400">
                <EyeOff className="w-2.5 h-2.5" />
                Hidden
              </span>
            )}
          </div>
          
          {/* Asset Content */}
          <div className="p-4">
            <AssetRenderEngine
              type={sectionType}
              data={sectionData}
              onChange={(newValue) => {
                setEditedData((prev: any) => ({
                  ...prev,
                  [sectionId]: newValue
                }));
                setIsDirty(true);
              }}
              mode="edit"
            />
          </div>
        </div>
      );
    }
    
    // Try old embedded schema format for backwards compatibility
    const legacySchema = editedData[`_${sectionId}_schema`];
    if (legacySchema) {
      const factorySchema: any = {
        label: legacySchema.label || formatSectionTitle(sectionId),
        renderAs: legacySchema.renderAs || legacySchema.type,
        helpText: legacySchema.helpText,
        required: legacySchema.required
      };
      
      if (legacySchema.itemSchema?.fields) {
        factorySchema.fields = legacySchema.itemSchema.fields;
      } else if (legacySchema.fields) {
        factorySchema.fields = legacySchema.fields;
      }
      
      const legacyType = legacySchema.renderAs || legacySchema.type || 'text';
      
      // Get layout zone and asset title for legacy single assets
      const layoutZone = editedData[`_${sectionId}_layoutZone`] || 'full';
      const getPositionLabel = (zone: string): string => {
        if (zone === 'full') return 'Full Width';
        if (zone === 'left-50' || zone === 'right-50') return zone === 'left-50' ? 'Left 50%' : 'Right 50%';
        if (zone === 'left-70') return 'Left 70%';
        if (zone === 'right-30') return 'Right 30%';
        if (zone === 'left-30') return 'Left 30%';
        if (zone === 'right-70') return 'Right 70%';
        if (zone === 'left-33') return 'Left 33%';
        if (zone === 'middle-33') return 'Middle 33%';
        if (zone === 'right-33') return 'Right 33%';
        return zone;
      };
      const positionLabel = getPositionLabel(layoutZone);
      
      return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          {/* Asset Header with Controls */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
            <span className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
              {formatSectionTitle(sectionId)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              : {legacyType}
            </span>
            <div
              onClick={() => openAssetReference(legacyType)}
              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-400 hover:text-fis-raspberry transition-colors cursor-pointer"
              title="View asset type reference"
            >
              <HelpCircle className="w-3 h-3" />
            </div>
            
            {/* Asset Title Input */}
            <input
              type="text"
              value={editedData[`_${sectionId}_assetTitle`] || ''}
              onChange={(e) => {
                setEditedData((prev: any) => ({
                  ...prev,
                  [`_${sectionId}_assetTitle`]: e.target.value
                }));
                setIsDirty(true);
              }}
              placeholder="Asset title (optional)"
              className="px-2 py-0.5 rounded text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
              style={{ width: '220px' }}
            />
            
            {/* Goal Tagging Dropdown */}
            <select
              value={editedData[`_${sectionId}_goalTag`] || ''}
              onChange={(e) => {
                const goalTagKey = `_${sectionId}_goalTag`;
                const value = e.target.value;
                console.log(`🎯 Tagging legacy section ${sectionId} with goal: ${value}`);
                setEditedData((prev: any) => ({
                  ...prev,
                  [goalTagKey]: value || undefined
                }));
                setIsDirty(true);
              }}
              className="px-1.5 py-0.5 rounded text-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry w-44"
              title="Tag this content with a strategic goal"
            >
              <option value="">🎯 None</option>
              {availableGoals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.shortName}
                </option>
              ))}
            </select>
            
            {/* Asset Title Toggle */}
            <div
              onClick={() => {
                const displayKey = `_${sectionId}_displayAssetTitle`;
                setEditedData((prev: any) => ({
                  ...prev,
                  [displayKey]: prev[displayKey] === false ? true : false
                }));
                setIsDirty(true);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium transition-colors cursor-pointer ${
                editedData[`_${sectionId}_displayAssetTitle`] !== false
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
              title={editedData[`_${sectionId}_displayAssetTitle`] !== false ? 'Asset title visible' : 'Asset title hidden'}
            >
              Title {editedData[`_${sectionId}_displayAssetTitle`] !== false ? '✓' : '✗'}
            </div>
            
            {/* Asset Enable/Disable Toggle */}
            <button
              onClick={() => {
                const enabledKey = `_enabled_${sectionId}`;
                setEditedData((prev: any) => ({
                  ...prev,
                  [enabledKey]: prev[enabledKey] === false ? true : false
                }));
                setIsDirty(true);
              }}
              className={`p-1 rounded transition-colors ${
                editedData[`_enabled_${sectionId}`] !== false
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
              }`}
              title={editedData[`_enabled_${sectionId}`] !== false ? 'Disable asset (hide from display)' : 'Enable asset (show in display)'}
            >
              {editedData[`_enabled_${sectionId}`] !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            
            {/* Alignment Buttons */}
            <div className="flex gap-0.5">
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'left'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  (editedData[`_${sectionId}_alignment`] || 'left') === 'left'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Left"
              >
                <AlignLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'center'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  editedData[`_${sectionId}_alignment`] === 'center'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Center"
              >
                <AlignCenter className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [`_${sectionId}_alignment`]: 'right'
                  }));
                  setIsDirty(true);
                }}
                className={`p-1 rounded transition-colors ${
                  editedData[`_${sectionId}_alignment`] === 'right'
                    ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align Right"
              >
                <AlignRight className="w-3 h-3" />
              </button>
            </div>
            
            {/* Delete Asset Button */}
            <button
              onClick={() => {
                setPendingDeleteAssetKey(sectionId);
                setShowDeleteAssetConfirm(true);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete this asset"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {positionLabel}
            </span>
            
            {/* Disabled Badge */}
            {editedData[`_enabled_${sectionId}`] === false && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roobert-medium bg-red-500/20 text-red-600 dark:text-red-400">
                <EyeOff className="w-2.5 h-2.5" />
                Hidden
              </span>
            )}
          </div>
          
          {/* Asset Content */}
          <div className="p-4">
            <AssetRenderEngine
              type={legacyType}
              data={sectionData}
              onChange={(newValue) => {
                setEditedData((prev: any) => ({
                  ...prev,
                  [sectionId]: newValue
                }));
                setIsDirty(true);
              }}
              mode="edit"
            />
          </div>
        </div>
      );
    }
    
    // Fallback to hardcoded summarySchema for legacy summaries
    const schemaSection = summarySchema.sections?.find(s => s.id === sectionId);
    if (!schemaSection) {
      return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 italic">
          No schema defined for "{sectionId}". Add type metadata to enable rendering.
        </div>
      );
    }

    return (
      <div className="space-y-4 p-4">
        {Object.entries(schemaSection.fields).map(([fieldKey, fieldSchema]) => {
          const fieldType = (fieldSchema as any).renderAs || (fieldSchema as any).type || 'text';
          return (
            <div key={fieldKey}>
              <AssetRenderEngine
                type={fieldType}
                data={sectionData}
                onChange={(newValue) => {
                  setEditedData((prev: any) => ({
                    ...prev,
                    [sectionId]: newValue
                  }));
                  setIsDirty(true);
                }}
                mode="edit"
              />
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Get all sections from data
   * Helper function to avoid dependency issues
   */
  const getSectionsFromData = (sourceData: any) => {
    if (!sourceData) return [];
    
    console.log('getSectionsFromData called with:', sourceData);
    
    const sections = [];
    
    // Always add Standard Header section first if we have header fields
    if (sourceData.id || sourceData.quarter || sourceData.year || sourceData.date || sourceData.title) {
      sections.push({
        id: 'standard_header',
        title: 'Standard Header',
        enabled: true,
        completed: sourceData._completed_standard_header === true,
        locked: sourceData._completed_standard_header === true || sourceData._locked_standard_header === true,
        content: {
          id: sourceData.id,
          quarter: sourceData.quarter,
          year: sourceData.year,
          date: sourceData.date,
          title: sourceData.title
        }
      });
    }
    
    const metadataKeys = ['id', 'quarter', 'year', 'date', 'title', 'displayName', 'name', 'category', 'lastUpdated', 'status', 'protectionEnabled', '_contentTag'];
    const excludePrefixes = ['_enabled_', '_completed_', '_locked_', '_template_'];
    const excludeSuffixes = ['_schema', '_type', '_fields', '_config', '_columnSpan', '_itemSchema'];
    const excludeContains = ['_chartConfig']; // Exclude dynamic chart config keys
    const excludeExact = ['_enabled', '_completed', '_locked', '_fileExists']; // Exclude these exact keys
    
    const allKeys = Object.keys(sourceData)
      .filter(key => {
        // Exclude metadata keys
        if (metadataKeys.includes(key)) return false;
        // Exclude exact matches
        if (excludeExact.includes(key)) return false;
        // Exclude keys with metadata prefixes (these start with underscore but are metadata)
        if (excludePrefixes.some(prefix => key.startsWith(prefix))) return false;
        // Exclude keys with metadata suffixes (like _schema, _type, _fields)
        if (excludeSuffixes.some(suffix => key.endsWith(suffix))) return false;
        // Exclude keys that contain certain patterns (like _chartConfig)
        if (excludeContains.some(pattern => key.includes(pattern))) return false;
        // NOW exclude content sections starting with underscore (after all metadata checks)
        // This catches things like "_TextSection", "_LayoutZone", etc. that are layout metadata
        if (key.startsWith('_')) return false;
        return true;
      });
    
    // Group indexed fields (section2_0, section2_1) under their parent section (section2)
    // Only treat as indexed if the suffix is a small number (0-9), not a random ID like 1762678245566
    const sectionGroups = new Map<string, string[]>();
    const indexedFieldPattern = /^(.+)_(\d+)$/;
    
    allKeys.forEach(key => {
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
    
    // Create sections from groups
    const contentSections = Array.from(sectionGroups.entries()).map(([baseName, fieldKeys]) => {
      // For multi-field sections, use the base name for enabled/completed checks
      const completed = sourceData[`_completed_${baseName}`] === true;
      const manuallyLocked = sourceData[`_locked_${baseName}`] === true;
      
      return {
        id: baseName, // Use base name (section2) not indexed key (section2_0)
        title: formatSectionTitle(baseName),
        enabled: sourceData[`_enabled_${baseName}`] !== false,
        completed: completed,
        locked: completed || manuallyLocked,
        content: fieldKeys.length === 1 ? sourceData[fieldKeys[0]] : fieldKeys.map(k => sourceData[k])
      };
    })
    // Filter out HR/divider sections from navigation (they're display-only, not editable)
    .filter(section => {
      const sectionType = sourceData[`_${section.id}_type`];
      return sectionType !== 'hr';
    });
    
    console.log('Sections generated:', [...sections, ...contentSections]);
    
    return [...sections, ...contentSections];
  };

  /**
   * Get all sections from data
   * Dynamically discovers sections instead of hardcoding
   */
  const getSections = () => {
    return getSectionsFromData(editedData);
  };

  const formatSectionTitle = (key: string): string => {
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
  };

  const moveSectionUp = (sectionId: string) => {
    const sections = getSections();
    const contentSections = sections.filter(s => s.id !== 'standard_header');
    const index = contentSections.findIndex(s => s.id === sectionId);
    if (index <= 0) return; // Can't move first item up
    
    // Get all section keys
    const sectionKeys = contentSections.map(s => s.id);
    
    // Swap positions
    [sectionKeys[index - 1], sectionKeys[index]] = [sectionKeys[index], sectionKeys[index - 1]];
    
    // Rebuild data object with reordered keys
    const newData: any = {};
    
    // First copy all non-section keys (metadata, header fields)
    Object.keys(editedData).forEach(key => {
      const isContentSection = contentSections.some(s => s.id === key);
      const isSectionMetadata = contentSections.some(s => 
        key.startsWith(`_${s.id}_`) || 
        key === `_enabled_${s.id}` || 
        key === `_completed_${s.id}` || 
        key === `_locked_${s.id}`
      );
      
      if (!isContentSection && !isSectionMetadata) {
        newData[key] = editedData[key];
      }
    });
    
    // Then add sections in new order with their metadata
    sectionKeys.forEach(key => {
      newData[key] = editedData[key];
      
      // Copy all metadata for this section
      Object.keys(editedData).forEach(metaKey => {
        if (metaKey.startsWith(`_${key}_`) || 
            metaKey === `_enabled_${key}` || 
            metaKey === `_completed_${key}` || 
            metaKey === `_locked_${key}`) {
          newData[metaKey] = editedData[metaKey];
        }
      });
    });
    
    setEditedData(newData);
    setIsDirty(true);
    showNotification?.('success', 'Section moved up');
  };

  const moveSectionDown = (sectionId: string) => {
    const sections = getSections();
    const contentSections = sections.filter(s => s.id !== 'standard_header');
    const index = contentSections.findIndex(s => s.id === sectionId);
    if (index < 0 || index >= contentSections.length - 1) return; // Can't move last item down
    
    // Get all section keys
    const sectionKeys = contentSections.map(s => s.id);
    
    // Swap positions
    [sectionKeys[index], sectionKeys[index + 1]] = [sectionKeys[index + 1], sectionKeys[index]];
    
    // Rebuild data object with reordered keys
    const newData: any = {};
    
    // First copy all non-section keys (metadata, header fields)
    Object.keys(editedData).forEach(key => {
      const isContentSection = contentSections.some(s => s.id === key);
      const isSectionMetadata = contentSections.some(s => 
        key.startsWith(`_${s.id}_`) || 
        key === `_enabled_${s.id}` || 
        key === `_completed_${s.id}` || 
        key === `_locked_${s.id}`
      );
      
      if (!isContentSection && !isSectionMetadata) {
        newData[key] = editedData[key];
      }
    });
    
    // Then add sections in new order with their metadata
    sectionKeys.forEach(key => {
      newData[key] = editedData[key];
      
      // Copy all metadata for this section
      Object.keys(editedData).forEach(metaKey => {
        if (metaKey.startsWith(`_${key}_`) || 
            metaKey === `_enabled_${key}` || 
            metaKey === `_completed_${key}` || 
            metaKey === `_locked_${key}`) {
          newData[metaKey] = editedData[metaKey];
        }
      });
    });
    
    setEditedData(newData);
    setIsDirty(true);
    showNotification?.('success', 'Section moved down');
  };

  const deleteSection = (sectionId: string) => {
    const newData = { ...editedData };
    
    // Remove section data and all metadata
    delete newData[sectionId];
    delete newData[`_${sectionId}_type`];
    delete newData[`_${sectionId}_columnLayout`];
    delete newData[`_${sectionId}_assetTitle`];
    delete newData[`_${sectionId}_enabled`];
    delete newData[`_${sectionId}_completed`];
    delete newData[`_${sectionId}_locked`];
    delete newData[`_enabled_${sectionId}`];
    delete newData[`_completed_${sectionId}`];
    delete newData[`_locked_${sectionId}`];
    
    // Remove all indexed assets (section_0, section_1, etc.) and their metadata
    const indexedPattern = new RegExp(`^${sectionId}_(\\d+)$`);
    Object.keys(newData).forEach(key => {
      // Check if this is an indexed asset for this section
      if (indexedPattern.test(key)) {
        delete newData[key];
        delete newData[`_${key}_type`];
        delete newData[`_${key}_assetTitle`];
      }
    });
    
    setEditedData(newData);
    setIsDirty(true);
    
    // If deleted section was active, switch to first available section
    if (activeSectionId === sectionId) {
      const sections = getSectionsFromData(newData);
      const firstEnabled = sections.find(s => s.enabled);
      if (firstEnabled) {
        setActiveSectionId(firstEnabled.id);
      }
    }
    
    showNotification?.('success', 'Section deleted');
  };

  const confirmDeleteSection = () => {
    if (pendingDeleteSectionId) {
      deleteSection(pendingDeleteSectionId);
      setShowDeleteSectionConfirm(false);
      setPendingDeleteSectionId(null);
    }
  };

  const deleteAsset = (assetKey: string) => {
    console.log('🗑️ deleteAsset called with:', assetKey);
    const newData = { ...editedData };
    
    // Check if this is an indexed asset (e.g., section_0, section_1)
    const indexedMatch = assetKey.match(/^(.+)_(\d+)$/);
    console.log('Indexed match:', indexedMatch);
    
    if (indexedMatch) {
      const [, baseName, indexStr] = indexedMatch;
      const deletedIndex = parseInt(indexStr);
      console.log(`Deleting indexed asset: baseName="${baseName}", index=${deletedIndex}`);
      
      // Get all indexed assets for this section
      const indexedPattern = new RegExp(`^${baseName}_(\\d+)$`);
      const allIndexed = Object.keys(newData)
        .filter(k => indexedPattern.test(k))
        .sort((a, b) => {
          const aIdx = parseInt(a.match(indexedPattern)![1]);
          const bIdx = parseInt(b.match(indexedPattern)![1]);
          return aIdx - bIdx;
        });
      
      console.log(`All indexed assets for "${baseName}":`, allIndexed);
      console.log(`Total count: ${allIndexed.length}`);
      
      // If this is the only indexed asset, convert back to single format
      if (allIndexed.length === 1) {
        console.log('⚠️ Only one indexed asset - deleting it and leaving section empty');
        // Just delete the indexed asset and its metadata
        delete newData[assetKey];
        delete newData[`_${assetKey}_type`];
        delete newData[`_${assetKey}_assetTitle`];
        delete newData[`_${assetKey}_layoutZone`];
        delete newData[`_${assetKey}_alignment`];
        delete newData[`_enabled_${assetKey}`];
        delete newData[`_${assetKey}_displayAssetTitle`];
        
        console.log('✅ Deleted last indexed asset, section metadata preserved');
        // Leave section metadata intact (don't delete _columnLayout, _enabled_section, etc.)
        // Section remains valid but empty, ready for new assets
      } else {
        console.log(`📦 Re-indexing ${allIndexed.length} assets, removing ${assetKey}`);
        // Re-index: collect all assets except the deleted one
        const assetsToKeep = allIndexed.filter(key => key !== assetKey);
        console.log('Assets to keep:', assetsToKeep);
        
        // IMPORTANT: Save the data BEFORE deleting
        const savedAssets = assetsToKeep.map(key => ({
          key,
          data: editedData[key],
          type: editedData[`_${key}_type`],
          assetTitle: editedData[`_${key}_assetTitle`],
          layoutZone: editedData[`_${key}_layoutZone`],
          alignment: editedData[`_${key}_alignment`],
          enabled: editedData[`_enabled_${key}`],
          displayAssetTitle: editedData[`_${key}_displayAssetTitle`]
        }));
        
        console.log('💾 Saved assets before deletion:', savedAssets);
        console.log('First saved asset data:', savedAssets[0]);
        
        // Delete all old indexed assets and metadata
        allIndexed.forEach(key => {
          delete newData[key];
          delete newData[`_${key}_type`];
          delete newData[`_${key}_assetTitle`];
          delete newData[`_${key}_layoutZone`];
          delete newData[`_${key}_alignment`];
          delete newData[`_enabled_${key}`];
          delete newData[`_${key}_displayAssetTitle`];
        });
        
        console.log('Deleted all old indexed assets');
        
        // Re-add remaining assets with new indices
        savedAssets.forEach((asset, newIndex) => {
          const newKey = `${baseName}_${newIndex}`;
          newData[newKey] = asset.data;
          newData[`_${newKey}_type`] = asset.type;
          newData[`_${newKey}_assetTitle`] = asset.assetTitle;
          newData[`_${newKey}_layoutZone`] = asset.layoutZone;
          if (asset.alignment) {
            newData[`_${newKey}_alignment`] = asset.alignment;
          }
          if (asset.enabled !== undefined) {
            newData[`_enabled_${newKey}`] = asset.enabled;
          }
          if (asset.displayAssetTitle !== undefined) {
            newData[`_${newKey}_displayAssetTitle`] = asset.displayAssetTitle;
          }
        });
        console.log('✅ Re-indexed remaining assets');
      }
    } else {
      console.log('Deleting single (non-indexed) asset:', assetKey);
      // Single (non-indexed) asset - just delete it
      delete newData[assetKey];
      delete newData[`_${assetKey}_type`];
      delete newData[`_${assetKey}_assetTitle`];
      delete newData[`_${assetKey}_layoutZone`];
      delete newData[`_${assetKey}_alignment`];
      delete newData[`_enabled_${assetKey}`];
      delete newData[`_${assetKey}_displayAssetTitle`];
      console.log('✅ Deleted single asset');
    }
    
    console.log('Final data keys:', Object.keys(newData).filter(k => k.includes('implementation')));
    setEditedData(newData);
    setIsDirty(true);
    showNotification?.('success', 'Asset deleted');
  };

  const confirmDeleteAsset = () => {
    if (pendingDeleteAssetKey) {
      deleteAsset(pendingDeleteAssetKey);
      setShowDeleteAssetConfirm(false);
      setPendingDeleteAssetKey(null);
    }
  };

  const addAssetToSection = () => {
    if (!activeSectionId) return;
    
    if (!newAssetName.trim()) {
      showNotification?.('error', 'Please enter an asset name');
      return;
    }
    
    const asset = ASSET_LIBRARY.find(a => a.type === selectedAssetForSection);
    if (!asset) return;
    
    // Get section's column layout
    const sectionLayout = editedData[`_${activeSectionId}_columnLayout`] || 'full';
    
    // Helper function to calculate layoutZone based on column layout and index
    const getLayoutZone = (index: number, layout: string): string => {
      if (layout === 'full') return 'full';
      if (layout === '50-50') return index === 0 ? 'left-50' : 'right-50';
      if (layout === '70-30') return index === 0 ? 'left-70' : 'right-30';
      if (layout === '30-70') return index === 0 ? 'left-30' : 'right-70';
      if (layout === '33-33-33') {
        if (index === 0) return 'left-33';
        if (index === 1) return 'middle-33';
        return 'right-33';
      }
      return 'full';
    };
    
    // Check if section already has data
    const currentData = editedData[activeSectionId];
    
    // Build new data object preserving key order
    const newData: any = {};
    const keysToDelete = new Set<string>();
    const newKeysToAdd: { [key: string]: any } = {};
    
    // If section is empty or undefined, initialize with asset data
    if (!currentData) {
      newKeysToAdd[activeSectionId] = asset.exampleData;
      newKeysToAdd[`_${activeSectionId}_type`] = asset.type;
      newKeysToAdd[`_${activeSectionId}_assetTitle`] = newAssetName;
      newKeysToAdd[`_${activeSectionId}_layoutZone`] = getLayoutZone(0, sectionLayout);
    } else {
      // Section has data - need to convert to indexed format if not already
      // Check if it's already indexed (has _0, _1, etc.)
      const indexedPattern = new RegExp(`^${activeSectionId}_(\\d+)$`);
      const existingIndexed = Object.keys(editedData).filter(k => indexedPattern.test(k));
      
      if (existingIndexed.length > 0) {
        // Already indexed - add new index
        const maxIndex = Math.max(...existingIndexed.map(k => parseInt(k.match(indexedPattern)![1])));
        const newIndex = maxIndex + 1;
        const newKey = `${activeSectionId}_${newIndex}`;
        
        newKeysToAdd[newKey] = asset.exampleData;
        newKeysToAdd[`_${newKey}_type`] = asset.type;
        newKeysToAdd[`_${newKey}_assetTitle`] = newAssetName;
        newKeysToAdd[`_${newKey}_layoutZone`] = getLayoutZone(newIndex, sectionLayout);
      } else {
        // Convert single item to indexed format
        const existingData = editedData[activeSectionId];
        const existingType = editedData[`_${activeSectionId}_type`];
        const existingTitle = editedData[`_${activeSectionId}_assetTitle`] || formatSectionTitle(activeSectionId);
        const existingLayoutZone = editedData[`_${activeSectionId}_layoutZone`];
        const existingGoalTag = editedData[`_${activeSectionId}_goalTag`];
        const existingDisplayAssetTitle = editedData[`_${activeSectionId}_displayAssetTitle`];
        const existingAlignment = editedData[`_${activeSectionId}_alignment`];
        
        // Mark old single item for deletion
        keysToDelete.add(activeSectionId);
        keysToDelete.add(`_${activeSectionId}_type`);
        keysToDelete.add(`_${activeSectionId}_assetTitle`);
        keysToDelete.add(`_${activeSectionId}_layoutZone`);
        keysToDelete.add(`_${activeSectionId}_goalTag`);
        keysToDelete.add(`_${activeSectionId}_displayAssetTitle`);
        keysToDelete.add(`_${activeSectionId}_alignment`);
        
        // Add as index 0 with ALL metadata preserved
        newKeysToAdd[`${activeSectionId}_0`] = existingData;
        newKeysToAdd[`_${activeSectionId}_0_type`] = existingType;
        newKeysToAdd[`_${activeSectionId}_0_assetTitle`] = existingTitle;
        newKeysToAdd[`_${activeSectionId}_0_layoutZone`] = existingLayoutZone || getLayoutZone(0, sectionLayout);
        if (existingGoalTag) newKeysToAdd[`_${activeSectionId}_0_goalTag`] = existingGoalTag;
        if (existingDisplayAssetTitle !== undefined) newKeysToAdd[`_${activeSectionId}_0_displayAssetTitle`] = existingDisplayAssetTitle;
        if (existingAlignment) newKeysToAdd[`_${activeSectionId}_0_alignment`] = existingAlignment;
        
        // Add new as index 1
        newKeysToAdd[`${activeSectionId}_1`] = asset.exampleData;
        newKeysToAdd[`_${activeSectionId}_1_type`] = asset.type;
        newKeysToAdd[`_${activeSectionId}_1_assetTitle`] = newAssetName;
        newKeysToAdd[`_${activeSectionId}_1_layoutZone`] = getLayoutZone(1, sectionLayout);
      }
    }
    
    // Rebuild data preserving key order: copy all keys except deleted ones, then add new keys
    Object.keys(editedData).forEach(key => {
      if (!keysToDelete.has(key)) {
        newData[key] = editedData[key];
      }
      // Insert new keys right after we've copied keys for this section
      if (key === activeSectionId || key.startsWith(`_${activeSectionId}_`)) {
        Object.keys(newKeysToAdd).forEach(newKey => {
          if (!newData[newKey]) {
            newData[newKey] = newKeysToAdd[newKey];
          }
        });
      }
    });
    
    // Add any new keys that weren't inserted yet (for empty section case)
    Object.keys(newKeysToAdd).forEach(newKey => {
      if (!newData[newKey]) {
        newData[newKey] = newKeysToAdd[newKey];
      }
    });
    
    setEditedData(newData);
    setIsDirty(true);
    setShowAddAssetModal(false);
    
    showNotification?.('success', `Asset "${newAssetName}" added to section`);
  };

  const addNewSection = (position: 'above' | 'below' | 'bottom') => {
    if (!newSectionName.trim()) {
      showNotification?.('error', 'Please enter a section name');
      return;
    }
    
    // Generate section ID from name (sanitize)
    const sectionId = newSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    
    // Check if section ID already exists
    if (editedData[sectionId]) {
      showNotification?.('error', 'A section with this name already exists');
      return;
    }
    
    // Get all current section keys in order (excluding metadata)
    const sections = getSections();
    const sectionKeys = sections.filter(s => s.id !== 'standard_header').map(s => s.id);
    
    // Create new data object with sections in correct order
    const newData: any = {};
    
    // First, copy all non-section keys (metadata, header fields, etc.)
    Object.keys(editedData).forEach(key => {
      if (!sectionKeys.includes(key) && !key.startsWith(`_${key}_`) && !key.startsWith('_enabled_') && !key.startsWith('_completed_') && !key.startsWith('_locked_')) {
        newData[key] = editedData[key];
      }
    });
    
    // Determine insertion index
    let insertIndex = sectionKeys.length; // default to bottom
    if (position === 'above' && activeSectionId) {
      insertIndex = sectionKeys.indexOf(activeSectionId);
    } else if (position === 'below' && activeSectionId) {
      insertIndex = sectionKeys.indexOf(activeSectionId) + 1;
    }
    
    // Insert new section key at correct position
    const newSectionKeys = [...sectionKeys];
    newSectionKeys.splice(insertIndex, 0, sectionId);
    
    // Rebuild data object in correct order
    newSectionKeys.forEach(key => {
      // Copy section data
      newData[key] = key === sectionId ? '' : editedData[key];
      
      // Copy section metadata
      Object.keys(editedData).forEach(metaKey => {
        if (metaKey.startsWith(`_${key}_`) || metaKey === `_enabled_${key}` || metaKey === `_completed_${key}` || metaKey === `_locked_${key}`) {
          newData[metaKey] = editedData[metaKey];
        }
      });
    });
    
    // Add new section metadata
    newData[`_${sectionId}_type`] = 'text';
    newData[`_${sectionId}_columnLayout`] = selectedColumnLayout; // Save column layout
    newData[`_enabled_${sectionId}`] = true;
    newData[`_completed_${sectionId}`] = false;
    newData[`_locked_${sectionId}`] = false;
    
    setEditedData(newData);
    setIsDirty(true);
    setShowAddSectionModal(false);
    setActiveSectionId(sectionId);
    
    showNotification?.('success', `Section "${newSectionName}" added`);
  };

  const handleSaveDraft = () => {
    setShowSaveConfirmation(true);
  };

  const handleSaveAndClose = () => {
    // Pass the edited data with _fileExists flag if it's new
    const dataToSave = hasBeenSaved 
      ? editedData 
      : { ...editedData, _fileExists: false };
    
    // DEBUG: Log all _assetTitle fields being saved
    const assetTitleFields = Object.keys(dataToSave).filter(k => k.includes('_assetTitle'));
    console.log('🔍 EditorModalV2 - Saving data with asset titles:', assetTitleFields);
    assetTitleFields.forEach(field => {
      console.log(`   ${field}: "${dataToSave[field]}"`);
    });
    
    // Preserve current status (published or draft)
    onSave({ ...dataToSave, status }, status);
    setIsDirty(false);
    setHasBeenSaved(true); // Mark as saved
    onClose();
  };

  const handleSaveAndContinue = () => {
    // Pass the edited data with _fileExists flag if it's new
    const dataToSave = hasBeenSaved 
      ? editedData 
      : { ...editedData, _fileExists: false };
    
    // Preserve current status (published or draft)
    onSave({ ...dataToSave, status }, status);
    setIsDirty(false);
    setHasBeenSaved(true); // Mark as saved
  };

  const handlePublish = () => {
    const completionPercentage = calculateCompletion();
    
    // Check protection system
    if (protectionEnabled && completionPercentage < 100) {
      // Show modal instead of alert
      setShowPublishConfirmation(true);
      return;
    }
    
    // Show confirmation modal
    setShowPublishConfirmation(true);
  };

  const handleConfirmPublish = () => {
    // Pass the edited data with _fileExists flag if it's new
    const dataToSave = hasBeenSaved 
      ? editedData 
      : { ...editedData, _fileExists: false };
    
    onSave({ ...dataToSave, status: 'published', protectionEnabled }, 'published');
    setStatus('published');
    setIsDirty(false);
    setHasBeenSaved(true); // Mark as saved
    setShowPublishConfirmation(false);
  };

  const handleUnpublish = () => {
    // Show confirmation before unpublishing
    setShowUnpublishConfirmation(true);
  };

  const handleConfirmUnpublish = () => {
    // Change from published back to draft
    const dataToSave = editedData;
    onSave({ ...dataToSave, status: 'draft' }, 'draft');
    setStatus('draft'); // Update local status to draft
    setIsDirty(false);
    setShowUnpublishConfirmation(false);
  };

  // Handle close with unsaved changes check
  const handleBeforeClose = () => {
    // In test mode, close immediately without prompting
    if (isTestMode) {
      onClose();
      return;
    }

    // Warn if:
    // 1. There are unsaved changes (isDirty = true), OR
    // 2. It's new content that was never saved (hasBeenSaved = false)
    // This ensures new content warns even if no edits were made yet
    if (isDirty || !hasBeenSaved) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  // Confirm close without saving
  const handleCloseWithoutSaving = () => {
    setShowCloseConfirmation(false);
    onClose();
  };

  // Save and close from confirmation
  const handleSaveBeforeClose = () => {
    setShowCloseConfirmation(false);
    handleSaveAndClose();
  };

  const navigateToPrevSection = () => {
    const enabledSections = sections.filter(s => s.enabled);
    const currentIndex = enabledSections.findIndex(s => s.id === activeSectionId);
    if (currentIndex > 0) {
      setActiveSectionId(enabledSections[currentIndex - 1].id);
    }
  };

  const navigateToNextSection = () => {
    const enabledSections = sections.filter(s => s.enabled);
    const currentIndex = enabledSections.findIndex(s => s.id === activeSectionId);
    if (currentIndex < enabledSections.length - 1) {
      setActiveSectionId(enabledSections[currentIndex + 1].id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedExpression(text);
      // Auto-close the expression panel after a brief delay
      setTimeout(() => {
        setShowExpressionMenu(false);
        setCopiedExpression(null);
      }, 800);
    });
  };

  const renderExpressionCategory = (title: string, expressions: Array<{ syntax: string; desc: string; preview: string }>) => {
    return (
      <div className="mb-5">
        <h4 className="text-base font-roobert-heavy text-fis-eggplant dark:text-fis-raspberry px-2 py-2 mb-3 border-b-2 border-fis-eggplant/20 dark:border-fis-raspberry/20">{title}</h4>
        <div className="space-y-1.5">
          {expressions.map((expr, idx) => (
            <button
              key={idx}
              onClick={() => copyToClipboard(expr.syntax)}
              className="w-full flex flex-col px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group text-left border border-transparent hover:border-fis-raspberry/20"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">{expr.desc}</span>
                <div className="flex-shrink-0 ml-2">
                  {copiedExpression === expr.syntax ? (
                    <CheckCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-fis-raspberry transition-colors" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium">Preview:</span>
                <span className="text-sm text-fis-eggplant dark:text-fis-eggplant font-roobert-semibold">{expr.preview}</span>
              </div>
              <code className="text-xs text-fis-raspberry dark:text-fis-raspberry font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{expr.syntax}</code>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const openAssetReference = (assetType?: string) => {
    setReferenceAssetType(assetType);
    setShowAssetReference(true);
  };

  const toggleComplete = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Show confirmation modal
    setPendingSectionAction({ sectionId, action: 'complete' });
    setShowCompleteConfirmation(true);
  };

  const confirmToggleComplete = () => {
    if (!pendingSectionAction || pendingSectionAction.action !== 'complete') return;
    
    const sectionId = pendingSectionAction.sectionId;
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsDirty(true);
    
    const newCompleted = !section.completed;
    
    // Update edited data with flag - auto lock/unlock based on completion
    setEditedData((prev: any) => ({
      ...prev,
      [`_completed_${sectionId}`]: newCompleted
    }));
    
    // Show notification using central system
    if (showNotification) {
      showNotification(
        'success', 
        newCompleted 
          ? `Section "${section.title}" marked as complete and locked.`
          : `Section "${section.title}" marked as incomplete and unlocked.`
      );
    }

    // Close modal and clear pending action
    setShowCompleteConfirmation(false);
    setPendingSectionAction(null);
  };

  const toggleLock = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Can't manually lock/unlock completed sections
    if (section.completed) return;
    
    setIsDirty(true);
    setEditedData((prev: any) => ({
      ...prev,
      [`_locked_${sectionId}`]: !section.locked
    }));
  };

  const toggleEnabled = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Show confirmation modal
    setPendingSectionAction({ sectionId, action: 'visibility' });
    setShowVisibilityConfirmation(true);
  };

  const confirmToggleEnabled = () => {
    if (!pendingSectionAction || pendingSectionAction.action !== 'visibility') return;
    
    const sectionId = pendingSectionAction.sectionId;
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setIsDirty(true);
    
    // Update edited data with flag
    setEditedData((prev: any) => ({
      ...prev,
      [`_enabled_${sectionId}`]: !section.enabled
    }));
    
    // If disabling the active section, navigate to next enabled section
    if (section.enabled && activeSectionId === sectionId) {
      const enabledSections = sections.filter(s => s.enabled && s.id !== sectionId);
      if (enabledSections.length > 0) {
        setActiveSectionId(enabledSections[0].id);
      }
    }

    // Close modal and clear pending action
    setShowVisibilityConfirmation(false);
    setPendingSectionAction(null);
  };

  const sections = getSections();
  const activeSection = sections.find(s => s.id === activeSectionId);
  const enabledSections = sections.filter(s => s.enabled);
  const activeSectionIndex = enabledSections.findIndex(s => s.id === activeSectionId);
  const canGoPrev = activeSectionIndex > 0;
  const canGoNext = activeSectionIndex < enabledSections.length - 1;
  const completionPercentage = calculateCompletion();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-7xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#431C5B] to-[#B21A53]">
            <div>
              <h2 className="text-xl font-roobert-heavy text-white">
                {data?.displayName || data?.date || data?.title || 'Edit Content'}
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Schema-Driven Editor • {dataType.replace('-', ' ')}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-roobert-medium ${
                  status === 'published' 
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {status === 'published' ? '● LIVE' : '● DRAFT'}
                </span>
                {isDirty ? (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-orange-500/20 text-orange-600 border border-orange-500/30">
                    ⚠️ Unsaved changes
                  </span>
                ) : hasBeenSaved ? (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-green-500/20 text-green-600">
                    ✓ Saved
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-gray-500/20 text-gray-600">
                    ● Not yet saved
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Completion Donut Chart */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  {/* Background circle */}
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-white/30"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                      className={`transition-all duration-500 ${
                        completionPercentage === 100 
                          ? 'text-green-500' 
                          : completionPercentage >= 50 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-roobert-bold text-white">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-roobert-semibold text-white">Completion</p>
                  <p className="text-xs text-white/70">
                    {sections.filter(s => s.enabled && s.completed).length}/{sections.filter(s => s.enabled).length} sections
                  </p>
                </div>
              </div>

              {/* Protection Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProtectionEnabled(!protectionEnabled)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    protectionEnabled
                      ? 'border-green-400/60 bg-green-400/25 text-green-300 hover:bg-green-400/40'
                      : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={protectionEnabled ? 'Protection ON: Must reach 100% to publish' : 'Protection OFF: Can publish anytime'}
                >
                  {protectionEnabled ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                  <span className="text-xs font-roobert-semibold">
                    {protectionEnabled ? 'Protected' : 'Unprotected'}
                  </span>
                </button>
              </div>

              <button
                onClick={handleBeforeClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Close editor"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Live Warning Banner */}
          {status === 'published' && (
            <div className="bg-red-500/10 border-b-2 border-red-500/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-roobert-bold text-lg">!</span>
                </div>
                <div>
                  <p className="text-sm font-roobert-bold text-red-600 dark:text-red-400">
                    ⚠️ WARNING: This content is LIVE and published
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">
                    Any changes you save will be immediately visible to all users.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar with Chevron Navigation */}
          <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={!isDirty}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fis-navy text-white font-roobert-medium hover:bg-fis-eggplant transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-roobert-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title="Preview content with validation checks"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              {status === 'published' ? (
                <button
                  onClick={handleUnpublish}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-roobert-medium transition-all"
                  title="Return to draft status"
                >
                  <Upload className="w-4 h-4 rotate-180" />
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-medium hover:shadow-lg transition-all"
                  title={protectionEnabled && calculateCompletion() < 100 ? `Cannot publish: ${calculateCompletion()}% complete` : 'Publish content'}
                >
                  <Upload className="w-4 h-4" />
                  Publish
                </button>
              )}
              <button
                onClick={() => setShowExpressionMenu(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-fis-raspberry text-fis-raspberry font-roobert-medium hover:bg-fis-raspberry/10 transition-colors"
              >
                <Code2 className="w-4 h-4" />
                Expressions
              </button>
            </div>

            {/* Chevron Section Navigation */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={navigateToPrevSection}
                disabled={!canGoPrev}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous section"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-roobert-medium text-sm px-3 min-w-[200px] text-center">
                {activeSection?.title || 'No Section'}
              </span>
              <button
                onClick={navigateToNextSection}
                disabled={!canGoNext}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next section"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content: Sidebar + Single Section View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-roobert-heavy text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sections
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddSectionModal(true);
                      setNewSectionName('');
                      setSelectedColumnLayout('full');
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-fis-raspberry transition-colors"
                    title="Add new section"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredSectionId(section.id)}
                      onMouseLeave={() => setHoveredSectionId(null)}
                    >
                      <button
                        onClick={() => setActiveSectionId(section.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-roobert-medium transition-all ${
                          activeSectionId === section.id
                            ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                            : section.enabled
                            ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1 truncate">{section.title}</span>
                          <div className="flex items-center gap-1.5 ml-2">
                            {!section.enabled && (
                              <EyeOff className={`w-3 h-3 ${
                                activeSectionId === section.id 
                                  ? 'text-white/70' 
                                  : 'text-gray-400 dark:text-gray-600'
                              }`} />
                            )}
                            {section.locked && !section.completed && (
                              <Lock className={`w-3 h-3 ${
                                activeSectionId === section.id 
                                  ? 'text-white/70' 
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                            )}
                            {section.completed && (
                              <Check className={`w-3.5 h-3.5 ${
                                activeSectionId === section.id 
                                  ? 'text-white' 
                                  : 'text-green-600 dark:text-green-400'
                              }`} />
                            )}
                          </div>
                        </div>
                      </button>
                      {/* Hover Actions */}
                      {hoveredSectionId === section.id && section.id !== 'standard_header' && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSectionUp(section.id); }}
                            disabled={index === 0}
                            className="p-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSectionDown(section.id); }}
                            disabled={index === sections.length - 1}
                            className="p-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setPendingDeleteSectionId(section.id);
                              setShowDeleteSectionConfirm(true);
                            }}
                            className="p-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                            title="Delete section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Single Section Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
              <AnimatePresence mode="wait">
                {activeSection ? (
                  <motion.div
                    key={activeSection.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-5xl mx-auto"
                  >
                    {/* Section Header */}
                    <div className="mb-2">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                            {activeSection.title}
                          </h2>
                          {editedData[`_${activeSection.id}_type`] && (
                            <>
                              <span className="text-sm font-roobert-regular text-gray-400 dark:text-gray-500">
                                {editedData[`_${activeSection.id}_type`]}
                              </span>
                              <button
                                onClick={() => openAssetReference(editedData[`_${activeSection.id}_type`])}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-fis-raspberry transition-colors"
                                title="View asset type reference"
                              >
                                <HelpCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Section Controls */}
                        <div className="flex items-center gap-1.5">
                          {/* Add Asset Button */}
                          <button
                            onClick={() => {
                              setShowAddAssetModal(true);
                              setNewAssetName('');
                              setSelectedAssetForSection('text');
                            }}
                            className="p-1.5 rounded-lg transition-colors bg-fis-eggplant hover:bg-fis-raspberry text-white"
                            title="Add Asset to Section"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          
                          {/* Complete/Incomplete Toggle - only show if enabled */}
                          {activeSection.enabled && (
                            <button
                              onClick={() => toggleComplete(activeSection.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                activeSection.completed
                                  ? 'bg-fis-green/30 text-fis-green hover:bg-fis-green/40'
                                  : 'bg-fis-green/20 text-fis-green hover:bg-fis-green/30'
                              }`}
                              title={activeSection.completed ? 'Return to Draft' : 'Mark as Complete'}
                            >
                              {activeSection.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                          )}
                          
                          {/* Lock/Unlock Toggle - only show if not completed */}
                          {!activeSection.completed && (
                            <button
                              onClick={() => toggleLock(activeSection.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                activeSection.locked
                                  ? 'bg-fis-green/20 text-fis-green hover:bg-fis-green/30'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                              }`}
                              title={activeSection.locked ? 'Unlock section' : 'Lock section'}
                            >
                              {activeSection.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          )}
                          
                          {/* Enable/Disable Toggle */}
                          <button
                            onClick={() => toggleEnabled(activeSection.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              activeSection.enabled
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                            }`}
                            title={activeSection.enabled ? 'Disable section (hide from display)' : 'Enable section (show in display)'}
                          >
                            {activeSection.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          
                          {/* Display Title Toggle */}
                          <button
                            onClick={() => {
                              const displayTitleKey = `_${activeSection.id}_displayTitle`;
                              const currentValue = editedData[displayTitleKey];
                              setEditedData((prev: any) => ({
                                ...prev,
                                [displayTitleKey]: currentValue === false ? true : false
                              }));
                              setIsDirty(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
                              editedData[`_${activeSection.id}_displayTitle`] !== false
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                            }`}
                            title={editedData[`_${activeSection.id}_displayTitle`] !== false ? 'Hide section title in preview' : 'Show section title in preview'}
                          >
                            <span className="text-sm font-bold leading-none w-4 h-4 flex items-center justify-center">
                              {editedData[`_${activeSection.id}_displayTitle`] !== false ? 'T' : 'T̶'}
                            </span>
                          </button>
                          
                          {/* Alignment Buttons - Sets alignment for ALL assets in section */}
                          {(() => {
                            // Determine current alignment state for highlighting
                            const indexedFieldPattern = new RegExp(`^${activeSection.id}_(\\d+)$`);
                            const indexedFields = Object.keys(editedData).filter(key => indexedFieldPattern.test(key) && !key.startsWith('_'));
                            
                            let currentAlignment = 'left'; // default
                            if (indexedFields.length > 1) {
                              // Multi-field: check first field's alignment (after setting all, they should match)
                              currentAlignment = editedData[`_${indexedFields[0]}_alignment`] || 'left';
                            } else {
                              // Single-field: check section alignment
                              currentAlignment = editedData[`_${activeSection.id}_alignment`] || 'left';
                            }
                            
                            return (
                              <>
                                <button
                                  onClick={() => {
                                    setEditedData((prev: any) => {
                                      const updates: any = {};
                                      if (indexedFields.length > 1) {
                                        indexedFields.forEach(fieldKey => {
                                          updates[`_${fieldKey}_alignment`] = 'left';
                                        });
                                      } else {
                                        updates[`_${activeSection.id}_alignment`] = 'left';
                                      }
                                      return { ...prev, ...updates };
                                    });
                                    setIsDirty(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    currentAlignment === 'left'
                                      ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  }`}
                                  title="Align Left (all assets in section)"
                                >
                                  <AlignLeft className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditedData((prev: any) => {
                                      const updates: any = {};
                                      if (indexedFields.length > 1) {
                                        indexedFields.forEach(fieldKey => {
                                          updates[`_${fieldKey}_alignment`] = 'center';
                                        });
                                      } else {
                                        updates[`_${activeSection.id}_alignment`] = 'center';
                                      }
                                      return { ...prev, ...updates };
                                    });
                                    setIsDirty(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    currentAlignment === 'center'
                                      ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  }`}
                                  title="Align Center (all assets in section)"
                                >
                                  <AlignCenter className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditedData((prev: any) => {
                                      const updates: any = {};
                                      if (indexedFields.length > 1) {
                                        indexedFields.forEach(fieldKey => {
                                          updates[`_${fieldKey}_alignment`] = 'right';
                                        });
                                      } else {
                                        updates[`_${activeSection.id}_alignment`] = 'right';
                                      }
                                      return { ...prev, ...updates };
                                    });
                                    setIsDirty(true);
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    currentAlignment === 'right'
                                      ? 'bg-fis-eggplant/20 dark:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  }`}
                                  title="Align Right (all assets in section)"
                                >
                                  <AlignRight className="w-4 h-4" />
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {!activeSection.enabled && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/20 text-red-600 dark:text-red-400">
                          <EyeOff className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                      {activeSection.completed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-green-500/20 text-green-600 dark:text-green-400 ml-2">
                          <span className="w-1.5 h-1.5 bg-green-600 dark:bg-green-400 rounded-full"></span>
                          Complete
                        </span>
                      )}
                      {activeSection.locked && !activeSection.completed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 ml-2">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </div>

                    {/* Section Label Editor */}
                    <div className="mt-4 mb-2">
                      <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Section Display Title
                      </label>
                      <input
                        type="text"
                        value={editedData[`_${activeSection.id}_label`] || activeSection.title}
                        onChange={(e) => {
                          setEditedData((prev: any) => ({
                            ...prev,
                            [`_${activeSection.id}_label`]: e.target.value
                          }));
                          setIsDirty(true);
                        }}
                        placeholder={activeSection.title}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Leave blank to use auto-generated title: "{activeSection.title}"
                      </p>
                    </div>

                    {/* Schema-Driven Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-[5px] border border-gray-200 dark:border-gray-700 relative min-h-[400px]">
                      {renderSchemaSection(activeSection.id)}
                      
                      {/* Overlay for locked sections - covers entire preview area */}
                      {activeSection.locked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-fis-navy/90 via-fis-eggplant/80 to-fis-navy/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
                          <div className="text-center px-8 py-10 glass-strong rounded-2xl border-2 border-fis-raspberry/50 backdrop-blur-md shadow-2xl max-w-md">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fis-raspberry to-fis-eggplant flex items-center justify-center shadow-lg">
                              <Lock className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-lg font-roobert-bold text-white mb-2">
                              {activeSection.completed ? 'Section Marked Complete' : 'Section Locked'}
                            </p>
                            <p className="text-sm text-white/90 font-roobert-medium">
                              {activeSection.completed 
                                ? 'Currently locked for editing'
                                : 'This section is locked'
                              }
                            </p>
                            <p className="text-xs text-white/70 mt-2">
                              {activeSection.completed 
                                ? 'Mark as incomplete to unlock and edit'
                                : 'Unlock this section to make changes'
                              }
                            </p>
                          </div>
                          
                          {/* Small sections: Compact badge overlay */}
                          <div className="sm:hidden inline-flex items-center gap-2 px-4 py-2 glass-strong rounded-full border-2 border-fis-raspberry/50 shadow-lg">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fis-raspberry to-fis-eggplant flex items-center justify-center">
                              <Lock className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-roobert-bold text-white">
                              {activeSection.completed ? 'Complete' : 'Locked'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>Select a section from the sidebar to begin editing</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Expression Engine Panel */}
        <AnimatePresence>
          {showExpressionMenu && (
            <div className="fixed inset-0 z-[70] flex items-center justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowExpressionMenu(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-roobert-heavy text-white">Expression Engine</h3>
                    <p className="text-xs text-white/80 mt-0.5">Click any expression to copy</p>
                  </div>
                  <button
                    onClick={() => setShowExpressionMenu(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Expression Categories */}
                <div className="p-4 space-y-4">
                  {renderExpressionCategory('Currency & Numbers', [
                    { syntax: '{{currency:1500000}}', desc: 'Currency', preview: '$1.5M' },
                    { syntax: '{{short:2500}}', desc: 'Short Number', preview: '2.5K' },
                    { syntax: '{{percent:15.5}}', desc: 'Percentage', preview: '↗ 15.5%' },
                    { syntax: '{{delta:+12}}', desc: 'Delta/Change', preview: '↗ +12' },
                  ])}

                  {renderExpressionCategory('Badges', [
                    { syntax: '{{badge:success}}', desc: 'Success', preview: '✓ Success' },
                    { syntax: '{{badge:completed}}', desc: 'Completed', preview: '✓ Completed' },
                    { syntax: '{{badge:warning}}', desc: 'Warning', preview: '⚠ Warning' },
                    { syntax: '{{badge:critical}}', desc: 'Critical', preview: '● Critical' },
                    { syntax: '{{badge:info}}', desc: 'Info', preview: 'ℹ Info' },
                    { syntax: '{{badge:new}}', desc: 'New', preview: '⚡ New' },
                    { syntax: '{{badge:priority}}', desc: 'Priority', preview: '🚩 Priority' },
                  ])}

                  {renderExpressionCategory('Trends', [
                    { syntax: '{{trend:up}}', desc: 'Trending Up', preview: '↗' },
                    { syntax: '{{trend:down}}', desc: 'Trending Down', preview: '↘' },
                    { syntax: '{{trend:flat}}', desc: 'Flat', preview: '→' },
                  ])}

                  {renderExpressionCategory('Icons', [
                    { syntax: '{{icon:check}}', desc: 'Check', preview: '✓' },
                    { syntax: '{{icon:alert}}', desc: 'Alert', preview: '⚠' },
                    { syntax: '{{icon:star}}', desc: 'Star', preview: '⭐' },
                    { syntax: '{{icon:rocket}}', desc: 'Rocket', preview: '🚀' },
                    { syntax: '{{icon:target}}', desc: 'Target', preview: '🎯' },
                    { syntax: '{{icon:zap}}', desc: 'Lightning', preview: '⚡' },
                    { syntax: '{{icon:award}}', desc: 'Award', preview: '🏆' },
                    { syntax: '{{icon:heart}}', desc: 'Heart', preview: '❤️' },
                    { syntax: '{{icon:thumbsup}}', desc: 'Thumbs Up', preview: '👍' },
                    { syntax: '{{icon:bell}}', desc: 'Bell', preview: '🔔' },
                    { syntax: '{{icon:flag}}', desc: 'Flag', preview: '🚩' },
                    { syntax: '{{icon:activity}}', desc: 'Activity', preview: '📊' },
                    { syntax: '{{icon:chart}}', desc: 'Chart', preview: '📈' },
                    { syntax: '{{icon:trending}}', desc: 'Trending', preview: '📈' },
                  ])}

                  {renderExpressionCategory('Text Styling', [
                    { syntax: '[[bold]]text[[/bold]]', desc: 'Bold Text', preview: 'Bold' },
                    { syntax: '[[highlight]]text[[/highlight]]', desc: 'Highlight', preview: 'Highlight' },
                    { syntax: '[[positive]]text[[/positive]]', desc: 'Positive (Green)', preview: 'Positive' },
                    { syntax: '[[negative]]text[[/negative]]', desc: 'Negative (Red)', preview: 'Negative' },
                  ])}

                  {renderExpressionCategory('Links & Dates', [
                    { syntax: '{{link:url|text}}', desc: 'Link', preview: 'Link Text' },
                    { syntax: '{{date:2024-10-31}}', desc: 'Date', preview: 'Oct 31' },
                    { syntax: '{{metric:263|demos|chart}}', desc: 'Metric Box', preview: '📊 263 demos' },
                  ])}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Copy Confirmation Toast */}
        <AnimatePresence>
          {copiedExpression && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-4 shadow-2xl border-2 border-green-400/50"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-roobert-bold text-sm">Copied to clipboard!</p>
                  <code className="text-xs font-mono opacity-90">{copiedExpression}</code>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Draft Confirmation Modal */}
        <ConfirmationModal
          isOpen={showSaveConfirmation}
          onClose={() => setShowSaveConfirmation(false)}
          title="Save Draft"
          message="Would you like to save and continue editing, or save and close?"
          type="info"
          buttons={[
            {
              label: 'Save & Close',
              action: handleSaveAndClose,
              variant: 'primary',
              closeAfter: true
            },
            {
              label: 'Save & Continue',
              action: handleSaveAndContinue,
              variant: 'secondary',
              closeAfter: true
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Unsaved Changes Warning Modal */}
        <ConfirmationModal
          isOpen={showCloseConfirmation}
          onClose={() => setShowCloseConfirmation(false)}
          title={!hasBeenSaved ? "Discard New Content?" : "Unsaved Changes"}
          message={
            !hasBeenSaved 
              ? "This content has never been saved. If you close now, it will be lost forever. Are you sure?" 
              : "You have unsaved changes. Are you sure you want to close without saving?"
          }
          type="warning"
          buttons={
            !hasBeenSaved 
              ? [
                  {
                    label: 'Save & Close',
                    action: handleSaveBeforeClose,
                    variant: 'primary',
                    closeAfter: true
                  },
                  {
                    label: 'Discard',
                    action: handleCloseWithoutSaving,
                    variant: 'danger',
                    closeAfter: true
                  },
                  {
                    label: 'Keep Editing',
                    action: () => {},
                    variant: 'secondary',
                    closeAfter: true
                  }
                ]
              : [
                  {
                    label: 'Save & Close',
                    action: handleSaveBeforeClose,
                    variant: 'primary',
                    closeAfter: true
                  },
                  {
                    label: 'Discard & Close',
                    action: handleCloseWithoutSaving,
                    variant: 'danger',
                    closeAfter: true
                  },
                  {
                    label: 'Cancel',
                    action: () => {},
                    variant: 'secondary',
                    closeAfter: true
                  }
                ]
          }
        />

        {/* Publish Confirmation Modal */}
        <ConfirmationModal
          isOpen={showPublishConfirmation}
          onClose={() => setShowPublishConfirmation(false)}
          title={
            protectionEnabled && calculateCompletion() < 100
              ? "Cannot Publish - Incomplete Content"
              : "Publish Content?"
          }
          message={
            protectionEnabled && calculateCompletion() < 100
              ? `Protection is enabled and this content is only ${calculateCompletion()}% complete. You must complete all enabled sections before publishing.`
              : `This content is ${calculateCompletion()}% complete and ready to publish. It will be immediately visible to all users. Are you sure you want to publish?`
          }
          type={
            protectionEnabled && calculateCompletion() < 100
              ? "warning"
              : "info"
          }
          buttons={
            protectionEnabled && calculateCompletion() < 100
              ? [
                  {
                    label: 'OK',
                    action: () => {},
                    variant: 'secondary',
                    closeAfter: true
                  }
                ]
              : [
                  {
                    label: 'Publish Now',
                    action: handleConfirmPublish,
                    variant: 'primary',
                    closeAfter: true
                  },
                  {
                    label: 'Cancel',
                    action: () => {},
                    variant: 'secondary',
                    closeAfter: true
                  }
                ]
          }
        />

        {/* Unpublish Confirmation Modal */}
        <ConfirmationModal
          isOpen={showUnpublishConfirmation}
          onClose={() => setShowUnpublishConfirmation(false)}
          title="⚠️ Unpublish This Content?"
          message="This will REMOVE this content from the published view immediately. Users will no longer be able to see it. Are you sure you want to unpublish?"
          type="warning"
          buttons={[
            {
              label: 'Yes, Unpublish Now',
              action: handleConfirmUnpublish,
              variant: 'danger',
              closeAfter: false
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          data={editedData}
          dataType={dataType}
        />

        {/* Section Complete/Incomplete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showCompleteConfirmation}
          onClose={() => {
            setShowCompleteConfirmation(false);
            setPendingSectionAction(null);
          }}
          title={pendingSectionAction ? 
            (sections.find(s => s.id === pendingSectionAction.sectionId)?.completed ? 
              '🔓 Mark Section as Incomplete?' : 
              '✅ Mark Section as Complete?'
            ) : ''}
          message={pendingSectionAction ? 
            (sections.find(s => s.id === pendingSectionAction.sectionId)?.completed ? 
              'This will unlock the section and allow further editing. Are you sure you want to mark this section as incomplete?' : 
              'This will lock the section to prevent further changes. Are you sure you want to mark this section as complete?'
            ) : ''}
          type="info"
          buttons={[
            {
              label: pendingSectionAction && sections.find(s => s.id === pendingSectionAction.sectionId)?.completed ? 
                'Yes, Mark Incomplete' : 'Yes, Mark Complete',
              action: confirmToggleComplete,
              variant: 'primary',
              closeAfter: false
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Section Visibility Confirmation Modal */}
        <ConfirmationModal
          isOpen={showVisibilityConfirmation}
          onClose={() => {
            setShowVisibilityConfirmation(false);
            setPendingSectionAction(null);
          }}
          title={pendingSectionAction ? 
            (sections.find(s => s.id === pendingSectionAction.sectionId)?.enabled ? 
              '� Disable This Section?' : 
              '✅ Enable This Section?'
            ) : ''}
          message={pendingSectionAction ? 
            (sections.find(s => s.id === pendingSectionAction.sectionId)?.enabled ? 
              'This section will be disabled and hidden from the published display. It will remain accessible in the editor so you can re-enable it later. Are you sure?' : 
              'This section will be enabled and shown in the published display, making it visible to users. Are you sure?'
            ) : ''}
          type="info"
          buttons={[
            {
              label: pendingSectionAction && sections.find(s => s.id === pendingSectionAction.sectionId)?.enabled ? 
                'Yes, Disable Section' : 'Yes, Enable Section',
              action: confirmToggleEnabled,
              variant: 'primary',
              closeAfter: false
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Asset Library Modal */}
        <AssetLibrary
          isOpen={showAssetReference}
          onClose={() => setShowAssetReference(false)}
          initialAssetType={referenceAssetType}
        />

        {/* Add Section Modal */}
        {showAddSectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xl"
            >
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                Add New Section
              </h3>
              
              {/* Section Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Key Metrics, Executive Summary"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-fis-raspberry focus:border-transparent"
                  autoFocus
                />
              </div>
              
              {/* Column Layout Selector */}
              <div className="mb-6">
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-3">
                  Column Layout
                </label>
                <div className="flex gap-3 justify-center">
                  {/* Full Width */}
                  <button
                    onClick={() => setSelectedColumnLayout('full')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColumnLayout === 'full'
                        ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                    title="Full Width"
                  >
                    <div className="w-16 h-12 border-2 border-current rounded"></div>
                    <span className="text-xs font-roobert-medium">Full</span>
                  </button>

                  {/* 50/50 */}
                  <button
                    onClick={() => setSelectedColumnLayout('50-50')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColumnLayout === '50-50'
                        ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                    title="50/50 Split"
                  >
                    <div className="flex gap-1 w-16 h-12">
                      <div className="flex-1 border-2 border-current rounded"></div>
                      <div className="flex-1 border-2 border-current rounded"></div>
                    </div>
                    <span className="text-xs font-roobert-medium">50/50</span>
                  </button>

                  {/* 70/30 */}
                  <button
                    onClick={() => setSelectedColumnLayout('70-30')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColumnLayout === '70-30'
                        ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                    title="70/30 Split"
                  >
                    <div className="flex gap-1 w-16 h-12">
                      <div className="flex-[7] border-2 border-current rounded"></div>
                      <div className="flex-[3] border-2 border-current rounded"></div>
                    </div>
                    <span className="text-xs font-roobert-medium">70/30</span>
                  </button>

                  {/* 30/70 */}
                  <button
                    onClick={() => setSelectedColumnLayout('30-70')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColumnLayout === '30-70'
                        ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                    title="30/70 Split"
                  >
                    <div className="flex gap-1 w-16 h-12">
                      <div className="flex-[3] border-2 border-current rounded"></div>
                      <div className="flex-[7] border-2 border-current rounded"></div>
                    </div>
                    <span className="text-xs font-roobert-medium">30/70</span>
                  </button>

                  {/* 33/33/33 */}
                  <button
                    onClick={() => setSelectedColumnLayout('33-33-33')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedColumnLayout === '33-33-33'
                        ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                    title="Three Equal Columns"
                  >
                    <div className="flex gap-1 w-16 h-12">
                      <div className="flex-1 border-2 border-current rounded"></div>
                      <div className="flex-1 border-2 border-current rounded"></div>
                      <div className="flex-1 border-2 border-current rounded"></div>
                    </div>
                    <span className="text-xs font-roobert-medium">33/33/33</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addNewSection('above')}
                  className="flex-1 px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg font-roobert-medium transition-colors text-sm"
                >
                  Add Above
                </button>
                <button
                  onClick={() => addNewSection('below')}
                  className="flex-1 px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg font-roobert-medium transition-colors text-sm"
                >
                  Add Below
                </button>
                <button
                  onClick={() => addNewSection('bottom')}
                  className="flex-1 px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg font-roobert-medium transition-colors text-sm"
                >
                  Add to Bottom
                </button>
              </div>

              <button
                onClick={() => setShowAddSectionModal(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-roobert-medium transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}

        {/* Delete Section Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteSectionConfirm}
          onClose={() => {
            setShowDeleteSectionConfirm(false);
            setPendingDeleteSectionId(null);
          }}
          title="🗑️ Delete Section?"
          message={`Are you sure you want to delete the section "${pendingDeleteSectionId ? formatSectionTitle(pendingDeleteSectionId) : ''}"? This action cannot be undone.`}
          type="warning"
          buttons={[
            {
              label: 'Yes, Delete Section',
              action: confirmDeleteSection,
              variant: 'danger',
              closeAfter: false
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Delete Asset Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteAssetConfirm}
          onClose={() => {
            setShowDeleteAssetConfirm(false);
            setPendingDeleteAssetKey(null);
          }}
          title="🗑️ Delete Asset?"
          message={`Are you sure you want to delete this asset${pendingDeleteAssetKey ? (() => {
            const assetTitle = editedData[`_${pendingDeleteAssetKey}_assetTitle`];
            if (assetTitle) return ` "${assetTitle}"`;
            // For non-indexed assets, check the section title
            const indexedMatch = pendingDeleteAssetKey.match(/^(.+)_(\d+)$/);
            if (indexedMatch) {
              const index = indexedMatch[2];
              return ` (${formatSectionTitle(pendingDeleteAssetKey.split('_').slice(0, -1).join('_'))} #${parseInt(index) + 1})`;
            }
            return ` "${formatSectionTitle(pendingDeleteAssetKey)}"`;
          })() : ''}? This action cannot be undone.`}
          type="warning"
          buttons={[
            {
              label: 'Yes, Delete Asset',
              action: confirmDeleteAsset,
              variant: 'danger',
              closeAfter: false
            },
            {
              label: 'Cancel',
              action: () => {},
              variant: 'secondary',
              closeAfter: true
            }
          ]}
        />

        {/* Add Asset to Section Modal */}
        {showAddAssetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={(e) => {
            // Allow clicks to pass through to Asset Library if it's open
            if (showAssetLibraryForSection) return;
            // Close modal if clicking on backdrop
            if (e.target === e.currentTarget) setShowAddAssetModal(false);
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                Add Asset to Section
              </h3>
              
              {/* Asset Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Display Name
                </label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  placeholder="e.g., Revenue Metrics, Risk Assessment"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-fis-raspberry focus:border-transparent"
                  autoFocus
                />
              </div>
              
              {/* Asset Type Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                    Asset Type
                  </label>
                  <button
                    onClick={() => {
                      setShowAssetLibraryForSection(true);
                    }}
                    className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-medium flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    View Asset Reference
                  </button>
                </div>
                <select
                  value={selectedAssetForSection}
                  onChange={(e) => setSelectedAssetForSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-fis-raspberry focus:border-transparent"
                >
                  {(() => {
                    // Filter assets based on section layout
                    const sectionLayout = selectedColumnLayout || 'full';
                    const isFullWidth = sectionLayout === 'full';
                    
                    // Full width sections can use any asset
                    // Multi-column sections should only use multi-column compatible assets
                    const filteredAssets = isFullWidth 
                      ? ASSET_LIBRARY
                      : ASSET_LIBRARY.filter(asset => {
                          // Multi-column compatible assets (typically basic/lists/charts)
                          const multiColumnCategories = ['basic', 'lists', 'charts', 'rich'];
                          return multiColumnCategories.includes(asset.category || '');
                        });
                    
                    // Group assets by category
                    const groupedAssets: { [key: string]: typeof filteredAssets } = {};
                    filteredAssets.forEach(asset => {
                      const category = asset.category || 'other';
                      if (!groupedAssets[category]) {
                        groupedAssets[category] = [];
                      }
                      groupedAssets[category].push(asset);
                    });
                    
                    // Category display names
                    const categoryNames: { [key: string]: string } = {
                      'basic': 'Text',
                      'lists': 'Lists',
                      'charts': 'Charts',
                      'cards': 'Cards',
                      'complex': 'Complex',
                      'rich': 'Rich Content',
                      'media': 'Media',
                      'other': 'Other'
                    };
                    
                    // Render grouped options
                    return Object.entries(groupedAssets).map(([category, assets]) => (
                      <optgroup key={category} label={categoryNames[category] || category.toUpperCase()}>
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.type}>
                            {asset.name}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {selectedColumnLayout === 'full' 
                    ? 'All asset types available for full-width layout'
                    : 'Showing multi-column compatible assets only'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={addAssetToSection}
                  className="flex-1 px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg font-roobert-medium transition-colors"
                >
                  Add Asset
                </button>
                <button
                  onClick={() => setShowAddAssetModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-roobert-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Asset Library Reference (can be opened from Add Asset Modal) */}
        <AssetLibrary
          isOpen={showAssetLibraryForSection}
          onClose={() => setShowAssetLibraryForSection(false)}
        />
      </div>
    </AnimatePresence>
  );
}
