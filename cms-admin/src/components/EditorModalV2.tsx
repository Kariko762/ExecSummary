import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, Upload, ChevronLeft, ChevronRight, Check, Lock, Unlock, EyeOff, Code2, Copy, CheckCheck, CheckCircle, Shield, ShieldOff } from 'lucide-react';
import { summarySchema } from '@shared/schemas/summarySchema';
import { RenderFactory } from '@renderers/RenderFactory';
import { ConfirmationModal } from './ConfirmationModal';
import PreviewModal from './PreviewModal';

interface EditorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: 'summaries' | 'executive-iq' | 'organizations' | 'performance';
  onSave: (data: any, status: 'draft' | 'published') => void;
}

export default function EditorModalV2({ 
  isOpen, 
  onClose, 
  data, 
  dataType, 
  onSave 
}: EditorModalV2Props) {
  const [editedData, setEditedData] = useState<any>(data);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isDirty, setIsDirty] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showExpressionMenu, setShowExpressionMenu] = useState(false);
  const [copiedExpression, setCopiedExpression] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      setShowSaveConfirmation(false); // Close any open confirmation
      setShowExpressionMenu(false); // Close expression menu
      // Set first enabled section as active on load
      const sections = getSectionsFromData(data);
      const firstEnabled = sections.find(s => s.enabled);
      if (firstEnabled) {
        setActiveSectionId(firstEnabled.id);
      }
    }
  }, [data, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Schema-Driven Section Renderer
   * Core engine: Reads schema → picks renderer → handles data
   */
  const renderSchemaSection = (sectionId: string): React.ReactElement | null => {
    const schemaSection = summarySchema.sections?.find(s => s.id === sectionId);
    if (!schemaSection) {
      // No schema found - render generic fallback
      return (
        <div className="p-4 text-sm text-gray-500 dark:text-gray-400 italic">
          No schema defined for "{sectionId}". Add to schema to enable rendering.
        </div>
      );
    }

    const sectionData = editedData[sectionId];

    return (
      <div className="space-y-4 p-4">
        {Object.entries(schemaSection.fields).map(([fieldKey, fieldSchema]) => (
          <div key={fieldKey}>
            <RenderFactory
              fieldKey={fieldKey}
              schema={fieldSchema as any}
              value={sectionData}
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
        ))}
      </div>
    );
  };

  /**
   * Get all sections from data
   * Helper function to avoid dependency issues
   */
  const getSectionsFromData = (sourceData: any) => {
    if (!sourceData) return [];
    
    const metadataKeys = ['id', 'quarter', 'year', 'date', 'title', 'displayName', 'name', 'category', 'lastUpdated', 'status'];
    const excludeKeys = [...metadataKeys, '_enabled_', '_completed_', '_locked_'];
    
    return Object.keys(sourceData)
      .filter(key => !excludeKeys.some(exclude => key.startsWith(exclude)))
      .map(key => {
        const completed = sourceData[`_completed_${key}`] === true;
        const manuallyLocked = sourceData[`_locked_${key}`] === true;
        return {
          id: key,
          title: formatSectionTitle(key),
          enabled: sourceData[`_enabled_${key}`] !== false,
          completed: completed,
          locked: completed || manuallyLocked, // Auto-lock if completed, or manually locked
          content: sourceData[key]
        };
      });
  };

  /**
   * Get all sections from data
   * Dynamically discovers sections instead of hardcoding
   */
  const getSections = () => {
    return getSectionsFromData(editedData);
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .split(/(?=[A-Z])|_|-/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSaveDraft = () => {
    setShowSaveConfirmation(true);
  };

  const handleSaveAndClose = () => {
    onSave({ ...editedData, status: 'draft' }, 'draft');
    setStatus('draft');
    setIsDirty(false);
    onClose();
  };

  const handleSaveAndContinue = () => {
    onSave({ ...editedData, status: 'draft' }, 'draft');
    setStatus('draft');
    setIsDirty(false);
  };

  const handlePublish = () => {
    const completionPercentage = calculateCompletion();
    
    if (protectionEnabled && completionPercentage < 100) {
      alert(`Cannot publish: Protection is enabled and completion is only ${completionPercentage}%. Complete all sections to publish.`);
      return;
    }
    
    if (window.confirm('Publish this content? It will be visible to all users.')) {
      onSave({ ...editedData, status: 'published', protectionEnabled }, 'published');
      setStatus('published');
      setIsDirty(false);
    }
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

  const toggleComplete = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const action = section.completed ? 'mark as incomplete' : 'mark as complete';
    if (window.confirm(`Are you sure you want to ${action} this section? ${!section.completed ? 'This will lock the section.' : 'This will unlock the section.'}`)) {
      setIsDirty(true);
      
      const newCompleted = !section.completed;
      
      // Update edited data with flag - auto lock/unlock based on completion
      setEditedData((prev: any) => ({
        ...prev,
        [`_completed_${sectionId}`]: newCompleted
      }));
    }
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

    const action = section.enabled ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${action} this section? ${section.enabled ? 'It will be hidden from the display.' : 'It will be shown in the display.'}`)) {
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
    }
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-fis-eggplant/10 to-fis-raspberry/10">
            <div>
              <h2 className="text-xl font-roobert-heavy text-gray-900 dark:text-white">
                {data?.displayName || data?.date || data?.title || 'Edit Content'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                {isDirty && (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-orange-500/20 text-orange-600">
                    Unsaved Changes
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
                      className="text-gray-200 dark:text-gray-700"
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
                    <span className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">Completion</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                      ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
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
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
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
                disabled
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-roobert-medium transition-colors opacity-50 cursor-not-allowed"
                title="Preview temporarily disabled - validation integration in progress"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-medium hover:shadow-lg transition-all"
              >
                <Upload className="w-4 h-4" />
                Publish
              </button>
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
                <h3 className="text-xs font-roobert-heavy text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Sections
                </h3>
                <div className="space-y-1">
                  {sections.filter(s => s.enabled).map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-roobert-medium transition-all ${
                        activeSectionId === section.id
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1 truncate">{section.title}</span>
                        <div className="flex items-center gap-1.5 ml-2">
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
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                          {activeSection.title}
                        </h2>
                        
                        {/* Section Controls */}
                        <div className="flex items-center gap-1.5">
                          {/* Complete/Incomplete Toggle */}
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
                            className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            title="Disable section (hide from display)"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {activeSection.completed && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-green-500/20 text-green-600 dark:text-green-400">
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

                    {/* Schema-Driven Content */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      {activeSection.locked ? (
                        <div className="text-center py-12">
                          <Lock className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                          <p className="text-gray-600 dark:text-gray-400 font-roobert-medium">
                            This section is locked
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {activeSection.completed 
                              ? 'Mark as incomplete to unlock and edit'
                              : 'Unlock this section to make changes'
                            }
                          </p>
                        </div>
                      ) : (
                        renderSchemaSection(activeSection.id)
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

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          data={editedData}
          dataType={dataType}
        />
      </div>
    </AnimatePresence>
  );
}
