import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Code, Shield, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Download, FileImage, FileText, Maximize2, Minimize2, Target, Users, TrendingUp, Circle, Clock, Calendar } from 'lucide-react';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';
import { useEffect, useState, useRef } from 'react';
import { validateSection } from '../schemas/validationSchema';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { TaskEditorModal } from '../../cms-admin/src/components/TaskEditorModal';
import type { Task } from '../../cms-admin/src/components/TaskEditorModal';

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
  console.log('🎬 ContentModal PRODUCTION FRONTEND - Component Rendering', { contentId: content.id || content.name });
  
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>('visual');
  const [isValidating, setIsValidating] = useState(false);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [availableGoals, setAvailableGoals] = useState<any[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isExportingGoal, setIsExportingGoal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exportWrapperRef = useRef<HTMLDivElement>(null); // New ref for the entire exportable area
  const goalModalRef = useRef<HTMLDivElement>(null); // Ref for goal modal export
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyNavRef = useRef<HTMLDivElement>(null);

  // Detect if this is a draft
  const isDraft = content?.status === 'draft';

  // Task click handler for task connector
  const handleTaskClick = (task: any) => {
    setSelectedTask(task as Task);
  };

  // Fetch available goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/goals');
        const data = await response.json();
        console.log('📊 Frontend ContentModal Goals API Response:', data);
        if (data.goals) {
          console.log('✅ Setting availableGoals to:', data.goals.length, 'goals');
          setAvailableGoals(data.goals);
          console.log('✅ setAvailableGoals called - should trigger re-render');
        } else {
          console.warn('⚠️ No goals found in API response:', data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch goals:', error);
      }
    };
    fetchGoals();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showExportMenu]);

  // Sticky nav scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Always show sticky nav (no scroll trigger needed since header is fixed)
    setShowStickyNav(true);

    // No automatic section highlighting - it causes scrolling issues with dynamic content
    // Users can still click menu buttons to navigate
  }, [activePreviewTab, content]);

  // Export functions
  const exportAsImage = async () => {
    console.log('🚀 PRODUCTION Frontend - exportAsImage called!');
    const targetRef = exportWrapperRef.current;
    if (!targetRef) {
      console.error('❌ No exportWrapperRef found!');
      return;
    }
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      console.log('📂 Starting export process...');
      
      // Hide the export button, close button, fullscreen button, and sticky nav temporarily
      const exportBtn = document.querySelector('.export-button');
      const closeBtn = document.querySelector('.close-button');
      const fullscreenBtn = document.querySelector('[title*="fullscreen"]');
      const draftBar = document.querySelector('.draft-bar');
      const stickyNav = document.querySelector('.sticky-nav');
      
      if (exportBtn) (exportBtn as HTMLElement).style.display = 'none';
      if (closeBtn) (closeBtn as HTMLElement).style.display = 'none';
      if (fullscreenBtn) (fullscreenBtn as HTMLElement).style.display = 'none';
      if (draftBar) (draftBar as HTMLElement).style.display = 'none';
      if (stickyNav) (stickyNav as HTMLElement).style.display = 'none';
      
      // Get the scrollable content div AND the modal container with max-h-[90vh]
      const contentDiv = targetRef;
      const modalContainer = contentDiv.closest('[class*="max-h-[90vh]"]') as HTMLElement;
      
      console.log('🔍 Export Debug:', {
        contentDiv,
        modalContainer,
        modalContainerClasses: modalContainer?.className,
        hasMaxHeight: modalContainer?.className?.includes('max-h-[90vh]')
      });
      
      // Store original className of modal container (has max-h-[90vh])
      const originalModalClassName = modalContainer ? modalContainer.className : '';
      
      // Temporarily remove scroll from the scrollable area and set to full height
      const originalOverflow = contentDiv.style.overflow;
      const originalMaxHeight = contentDiv.style.maxHeight;
      const originalHeight = contentDiv.style.height;
      
      contentDiv.style.overflow = 'visible';
      contentDiv.style.maxHeight = 'none';
      contentDiv.style.height = 'auto';
      
      // Remove max-h-[90vh] from modal container className to allow full height
      if (modalContainer) {
        console.log('✅ Removing max-h-[90vh] from modal container');
        modalContainer.className = originalModalClassName.replace('max-h-[90vh]', 'max-h-none');
        console.log('📏 New className:', modalContainer.className);
      } else {
        console.warn('⚠️ Modal container with max-h-[90vh] not found!');
      }
      
      // Small delay to let layout recalculate
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📸 Capturing screenshot with dimensions:', contentDiv.scrollWidth, 'x', contentDiv.scrollHeight);
      
      // Use modern-screenshot which supports oklch colors and captures full content
      const dataUrl = await domToPng(contentDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: contentDiv.scrollWidth,
        height: contentDiv.scrollHeight,
      });
      
      console.log('✅ Screenshot captured, restoring styles...');
      
      // Restore original styles
      contentDiv.style.overflow = originalOverflow;
      contentDiv.style.maxHeight = originalMaxHeight;
      contentDiv.style.height = originalHeight;
      
      // Restore modal container className
      if (modalContainer) {
        modalContainer.className = originalModalClassName;
      }
      
      // Restore buttons
      if (exportBtn) (exportBtn as HTMLElement).style.display = '';
      if (closeBtn) (closeBtn as HTMLElement).style.display = '';
      if (fullscreenBtn) (fullscreenBtn as HTMLElement).style.display = '';
      if (draftBar) (draftBar as HTMLElement).style.display = '';
      if (stickyNav) (stickyNav as HTMLElement).style.display = '';
      
      const link = document.createElement('a');
      const title = content.title || content.name || 'content';
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.png`;
      
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      console.log('✅ Export complete! File:', fileName);
    } catch (error: any) {
      console.error('❌ Error exporting as image:', error);
      alert('Failed to export as image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    const targetRef = exportWrapperRef.current;
    if (!targetRef) return;
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      // Hide buttons and sticky nav temporarily
      const exportBtn = document.querySelector('.export-button');
      const closeBtn = document.querySelector('.close-button');
      const fullscreenBtn = document.querySelector('[title*="fullscreen"]');
      const draftBar = document.querySelector('.draft-bar');
      const stickyNav = document.querySelector('.sticky-nav');
      
      if (exportBtn) (exportBtn as HTMLElement).style.display = 'none';
      if (closeBtn) (closeBtn as HTMLElement).style.display = 'none';
      if (fullscreenBtn) (fullscreenBtn as HTMLElement).style.display = 'none';
      if (draftBar) (draftBar as HTMLElement).style.display = 'none';
      if (stickyNav) (stickyNav as HTMLElement).style.display = 'none';
      
      // Get the wrapper div that includes header + content
      const contentDiv = targetRef;
      
      // Find the scrollable content area inside
      const scrollableContent = scrollContainerRef.current;
      
      // Temporarily remove scroll from the scrollable area and set to full height
      const originalOverflow = scrollableContent ? scrollableContent.style.overflow : '';
      const originalMaxHeight = scrollableContent ? scrollableContent.style.maxHeight : '';
      const originalHeight = scrollableContent ? scrollableContent.style.height : '';
      
      if (scrollableContent) {
        scrollableContent.style.overflow = 'visible';
        scrollableContent.style.maxHeight = 'none';
        scrollableContent.style.height = 'auto';
      }
      
      // Use modern-screenshot to capture full content
      const dataUrl = await domToPng(contentDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: contentDiv.scrollWidth,
        height: contentDiv.scrollHeight,
      });
      
      // Restore original styles
      if (scrollableContent) {
        scrollableContent.style.overflow = originalOverflow;
        scrollableContent.style.maxHeight = originalMaxHeight;
        scrollableContent.style.height = originalHeight;
      }
      
      // Restore buttons
      if (exportBtn) (exportBtn as HTMLElement).style.display = '';
      if (closeBtn) (closeBtn as HTMLElement).style.display = '';
      if (fullscreenBtn) (fullscreenBtn as HTMLElement).style.display = '';
      if (draftBar) (draftBar as HTMLElement).style.display = '';
      if (stickyNav) (stickyNav as HTMLElement).style.display = '';
      
      // Convert to image and get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      
      const title = content.title || content.name || 'content';
      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);
    } catch (error: any) {
      console.error('Error exporting as PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGoalImage = async () => {
    if (!goalModalRef.current) return;

    setIsExportingGoal(true);
    try {
      const modalContainer = goalModalRef.current;
      
      // Hide export and close buttons
      const exportBtn = modalContainer.querySelector('[title="Export as Image"]') as HTMLElement;
      const closeBtn = modalContainer.querySelectorAll('button')[1] as HTMLElement; // X button
      
      if (exportBtn) exportBtn.style.display = 'none';
      if (closeBtn) closeBtn.style.display = 'none';
      
      // Find the scrollable content div
      const scrollableDiv = modalContainer.querySelector('.goal-scrollable-content') as HTMLElement;
      
      if (!scrollableDiv) {
        throw new Error('Could not find scrollable content');
      }
      
      // Store original styles AND classes
      const originalStyles = {
        containerOverflow: modalContainer.style.overflow,
        containerMaxHeight: modalContainer.style.maxHeight,
        containerHeight: modalContainer.style.height,
        containerClass: modalContainer.className,
        scrollOverflow: scrollableDiv.style.overflow,
        scrollMaxHeight: scrollableDiv.style.maxHeight,
        scrollHeight: scrollableDiv.style.height,
      };
      
      // CRITICAL: Remove the max-h-[90vh] constraint by replacing the class
      const originalClass = modalContainer.className;
      modalContainer.className = originalClass.replace('max-h-[90vh]', '');
      
      // Remove all scroll and height constraints
      modalContainer.style.overflow = 'visible';
      modalContainer.style.maxHeight = 'none';
      modalContainer.style.height = 'auto';
      scrollableDiv.style.overflow = 'visible';
      scrollableDiv.style.maxHeight = 'none';
      scrollableDiv.style.height = 'auto';
      
      // Wait for layout to settle (increased from 100ms to 200ms)
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture the entire modal with full expanded content
      const dataUrl = await domToPng(modalContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: modalContainer.scrollWidth,
        height: modalContainer.scrollHeight,
      });

      // Restore original styles AND classes
      modalContainer.className = originalStyles.containerClass;
      modalContainer.style.overflow = originalStyles.containerOverflow;
      modalContainer.style.maxHeight = originalStyles.containerMaxHeight;
      modalContainer.style.height = originalStyles.containerHeight;
      scrollableDiv.style.overflow = originalStyles.scrollOverflow;
      scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
      scrollableDiv.style.height = originalStyles.scrollHeight;

      // Restore buttons
      if (exportBtn) exportBtn.style.display = '';
      if (closeBtn) closeBtn.style.display = '';

      const link = document.createElement('a');
      const goalId = selectedGoal?.id || 'goal';
      link.download = `goal-${goalId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export goal image:', error);
      alert('Failed to export goal image. Please try again.');
    } finally {
      setIsExportingGoal(false);
    }
  };

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-button')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Scroll to section function
  const scrollToSection = (sectionKey: string) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const element = scrollContainer.querySelector(`#section-${sectionKey}`);
    if (element) {
      // Use getBoundingClientRect for accurate positioning
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const navHeight = stickyNavRef.current?.offsetHeight || 0;
      const offset = 24; // Additional spacing
      
      const scrollTop = scrollContainer.scrollTop;
      const targetScrollTop = scrollTop + elementRect.top - containerRect.top - navHeight - offset;
      
      scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  };

  if (!content) return null;

  // Extract display metadata
  const title = content.title || content.name || 'Untitled';
  const date = content.date || content.lastUpdated || content.updatedAt;
  
  // Get all sections by finding keys that have corresponding _type metadata
  const sections: Array<{ key: string; label: string; data: any; type: string; fields?: any; itemSchema?: any; chartConfig?: any; subtitle?: string; isMultiField?: boolean; multiFieldData?: any[]; displayTitle?: boolean; assetTitle?: string; displayAssetTitle?: boolean; goalTag?: string }> = [];
  
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
    // Check if parent section is enabled (for multi-field sections)
    const parentEnabledKey = `_enabled_${baseName}`;
    const isParentEnabled = content[parentEnabledKey] !== false;
    
    // Skip entire section if parent is disabled
    if (!isParentEnabled) {
      return;
    }
    
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
      // BUT: Skip extraction for budgetBreakdown which needs the full object
      const sectionType = content[typeKey];
      if (rawData && typeof rawData === 'object' && !Array.isArray(rawData) && sectionType !== 'budgetBreakdown') {
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
        displayTitle: content[`_${key}_displayTitle`] !== false, // Default to true
        assetTitle: content[`_${key}_assetTitle`],
        displayAssetTitle: content[`_${key}_displayAssetTitle`],
        goalTag: content[`_${key}_goalTag`]
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
        gridPosition: content[`_${fieldKey}_gridPosition`], // Hero grid positioning
        assetTitle: content[`_${fieldKey}_assetTitle`] || '',
        displayAssetTitle: content[`_${fieldKey}_displayAssetTitle`] !== false,
        alignment: content[`_${fieldKey}_alignment`] || 'left',
        goalTag: content[`_${fieldKey}_goalTag`]
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
        className={isFullscreen 
          ? "fixed inset-2.5 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant z-50"
          : "fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={isFullscreen
            ? "w-full h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden rounded-xl"
            : "bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex flex-col"}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draft Preview Control Bar - Only shown in draft mode */}
          {isDraft && (
            <div className="draft-bar no-print flex-shrink-0 sticky top-0 z-20 shadow-2xl rounded-t-3xl" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-roobert-bold text-white">Preview Mode - DRAFT</h3>
                    <p className="text-xs text-white/80">{title}</p>
                  </div>
                </div>

                {/* Tabs and Export */}
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

                  {/* Budget Expand/Collapse Buttons - Only show if content has budgetBreakdown */}
                  {(() => {
                    const hasBudget = Object.keys(content).some(key => {
                      const typeKey = `_${key}_type`;
                      const hasType = content[typeKey] === 'budgetBreakdown';
                      if (hasType) {
                        console.log('🔍 Found budgetBreakdown:', key, typeKey, content[typeKey]);
                      }
                      return hasType;
                    });
                    
                    console.log('🔍 ContentModal - Has budget breakdown:', hasBudget);
                    console.log('🔍 ContentModal - Content keys:', Object.keys(content).filter(k => k.includes('_type')));
                    
                    if (!hasBudget) return null;
                    
                    return (
                      <>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('budget:expandAll'))}
                          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                          title="Expand All Budget Categories"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('budget:collapseAll'))}
                          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                          title="Collapse All Budget Categories"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                          </svg>
                        </button>
                      </>
                    );
                  })()}

                  {/* Export Button with Dropdown */}
                  <div className="relative export-button">
                    <button
                      onClick={() => {
                        console.log('🎯 PRODUCTION FRONTEND - Export dropdown CLICKED!', { showExportMenu, isExporting });
                        setShowExportMenu(!showExportMenu);
                      }}
                      disabled={isExporting}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-roobert-medium flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Export
                    </button>
                    
                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[1000] min-w-[180px]">
                        <button
                          onClick={() => {
                            console.log('🖼️ PRODUCTION FRONTEND - Export as Image CLICKED!');
                            exportAsImage();
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-900 dark:text-white transition-colors"
                        >
                          <FileImage className="w-4 h-4 text-blue-500" />
                          Export as Image
                        </button>
                        <button
                          onClick={exportAsPDF}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-900 dark:text-white transition-colors"
                        >
                          <FileText className="w-4 h-4 text-red-500" />
                          Export as PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fullscreen Toggle Button */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-6 h-6 text-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
                  </button>

                  <button
                    onClick={onClose}
                    className="close-button p-2 rounded-lg hover:bg-white/20 transition-colors ml-2"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show Validation view if in draft mode and validation tab is active */}
          {isDraft && activePreviewTab === 'validation' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-brand-tertiary dark:to-brand-primary">
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
                                      {check.severity === 'info' && <AlertCircle className="w-4 h-4 text-accent-blue dark:text-accent-blue flex-shrink-0 mt-0.5" />}
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
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-brand-tertiary dark:to-brand-primary">
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
                      className="px-3 py-1.5 rounded-lg text-xs font-roobert-medium transition-all"
                      style={{ 
                        backgroundColor: 'rgba(67, 28, 91, 0.1)',
                        color: 'var(--brand-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(67, 28, 91, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(67, 28, 91, 0.1)';
                      }}
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
            <div ref={exportWrapperRef} className="flex flex-col flex-1 overflow-hidden">
              {/* Header - Only shown if NOT in draft mode */}
              {!isDraft && (
                <div className={`sticky top-0 bg-gradient-to-r from-fis-eggplant to-fis-raspberry shadow-lg flex items-center justify-between z-20 flex-shrink-0 ${isFullscreen ? 'p-3' : 'p-6'}`}>
                  <div>
                    <h2 className={`font-roobert-heavy text-white ${isFullscreen ? 'text-xl mb-0' : 'text-3xl mb-1'}`}>
                      {title}
                    </h2>
                    {date && !isFullscreen && (
                      <p className="text-sm text-white/80">
                        {new Date(date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Budget/Forecast Expand/Collapse Buttons - Show if content has budgetBreakdown or forecastBreakdown */}
                    {(() => {
                      const hasBudget = Object.keys(content).some(key => {
                        const typeKey = `_${key}_type`;
                        return content[typeKey] === 'budgetBreakdown';
                      });
                      
                      const hasForecast = Object.keys(content).some(key => {
                        const typeKey = `_${key}_type`;
                        return content[typeKey] === 'forecastBreakdown';
                      });
                      
                      if (!hasBudget && !hasForecast) return null;
                      
                      const eventPrefix = hasBudget ? 'budget' : 'forecast';
                      const label = hasBudget ? 'Budget' : 'Forecast';
                      
                      return (
                        <>
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent(`${eventPrefix}:expandAll`))}
                            className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                            title={`Expand All ${label} Categories`}
                          >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent(`${eventPrefix}:collapseAll`))}
                            className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                            title={`Collapse All ${label} Categories`}
                          >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                            </svg>
                          </button>
                        </>
                      );
                    })()}

                    {/* Export Button with Dropdown */}
                    <div className="relative export-button">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={isExporting}
                        className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white transition-all disabled:opacity-50 flex items-center justify-center"
                        title="Export"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      
                      {showExportMenu && (
                        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[9999] min-w-[180px]">
                          <button
                            onClick={exportAsImage}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-900 dark:text-white transition-colors"
                          >
                            <FileImage className="w-4 h-4 text-accent-blue" />
                            Export as Image
                          </button>
                          <button
                            onClick={exportAsPDF}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-sm text-gray-900 dark:text-white transition-colors"
                          >
                            <FileText className="w-4 h-4 text-red-500" />
                            Export as PDF
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Fullscreen Toggle Button */}
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                    </button>

                    <button
                      onClick={onClose}
                      className="close-button w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              )}

              {/* Content Sections */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {/* Sticky Navigation */}
                <AnimatePresence>
                  {showStickyNav && !isDraft && sections.filter(s => s.type !== 'hr').length > 1 && (
                    <motion.div
                      ref={stickyNavRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className={`sticky-nav sticky top-0 z-20 bg-gradient-to-r from-purple-50 to-pink-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 border-b-2 border-fis-eggplant/20 dark:border-gray-700 shadow-lg ${isFullscreen ? 'px-3 py-1.5' : 'px-6 py-3'}`}
                    >
                      <nav className="flex items-center gap-2 overflow-x-auto pb-1">
                        {sections.filter(section => section.type !== 'hr').map((section) => (
                          <button
                            key={section.key}
                            onClick={() => scrollToSection(section.key)}
                            className={`
                              flex-shrink-0 rounded-lg font-roobert-medium transition-all duration-200
                              ${isFullscreen ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-[10px]'}
                              ${activeSection === `section-${section.key}`
                                ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                                : 'text-gray-800 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                              }
                            `}
                          >
                            {section.label}
                          </button>
                        ))}
                      </nav>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={isFullscreen ? 'p-4 space-y-4' : 'p-6 space-y-8'}>
                {sections.map((section) => {
                  console.log(`🎯 Frontend ContentModal Section "${section.label}":`, { goalTag: section.goalTag, availableGoalsCount: availableGoals.length });
                  
                  return (
                  <section key={section.key} id={`section-${section.key}`} className="relative z-0">
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
                      <div className="flex flex-col gap-6 w-full">
                        {/* Group fields by row based on layoutZone */}
                        {(() => {
                          const rows: any[][] = [];
                          let currentRow: any[] = [];
                          let currentRowType: string | null = null;

                          section.multiFieldData.forEach((field: any) => {
                            const zone = field.layoutZone || 'full';
                            
                            // Determine row type based on zone
                            let rowType = 'full';
                            if (zone.includes('left-70') || zone.includes('right-30')) {
                              rowType = '70-30';
                            } else if (zone.includes('left-30') || zone.includes('right-70')) {
                              rowType = '30-70';
                            } else if (zone.includes('left-50') || zone.includes('right-50')) {
                              rowType = '50-50';
                            } else if (zone.includes('left-33') || zone.includes('middle-33') || zone.includes('right-33')) {
                              rowType = '33-33-33';
                            }

                            // Start new row if:
                            // 1. Row type changes
                            // 2. Full width item
                            // 3. 70-30 or 30-70 row has 2 items
                            // 4. 50-50 row has 2 items
                            // 5. 33-33-33 row has 3 items
                            if (
                              (currentRowType && currentRowType !== rowType) ||
                              rowType === 'full' ||
                              (currentRowType === '70-30' && currentRow.length >= 2) ||
                              (currentRowType === '30-70' && currentRow.length >= 2) ||
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

                            // Full width items complete their own row
                            if (rowType === 'full') {
                              rows.push([...currentRow]);
                              currentRow = [];
                              currentRowType = null;
                            }
                          });

                          // Add remaining row
                          if (currentRow.length > 0) {
                            rows.push(currentRow);
                          }

                          // Check if ALL fields in section are Hero containers (masonry layout)
                          const heroFields = section.multiFieldData || [];
                          const allFieldsHero = heroFields.length > 0 && heroFields.every((f: any) => f.gridPosition);
                          
                          if (allFieldsHero) {
                            console.log('🌟 Rendering Hero Grid with fields:', heroFields);
                            // Hero Masonry Layout - CSS Grid with flexible positioning
                            return (
                              <div className="bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary text-white rounded-2xl p-8 shadow-2xl">
                                <div className="grid grid-cols-8 auto-rows-[120px] gap-4">
                                  {heroFields.map((field: any) => {
                                    // Use gridPosition data for exact positioning
                                    const gridStyle = field.gridPosition ? {
                                      gridColumn: `${field.gridPosition.col + 1} / span ${field.gridPosition.colSpan}`,
                                      gridRow: `${field.gridPosition.row + 1} / span ${field.gridPosition.rowSpan}`
                                    } : {};
                                    
                                    const fieldGoal = field.goalTag ? availableGoals.find(g => g.id === field.goalTag) : null;
                                    
                                    return (
                                      <div key={field.key} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col overflow-hidden hover:bg-white/15 transition-all" style={gridStyle}>
                                        {field.displayAssetTitle && field.assetTitle && (
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-xs font-roobert-semibold text-white/90 truncate">
                                              {field.assetTitle}
                                            </h4>
                                            {fieldGoal && (
                                              <button
                                                onClick={() => {
                                                  setSelectedGoal(fieldGoal);
                                                  setShowGoalModal(true);
                                                }}
                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-md bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
                                                title="Click to view goal details"
                                              >
                                                <span className="text-sm">{fieldGoal.icon || '🎯'}</span>
                                              </button>
                                            )}
                                          </div>
                                        )}
                                        <div className="flex-1 overflow-auto flex items-center justify-center">
                                          <AssetRenderEngine
                                            type={field.type}
                                            data={field.data}
                                            displayMode="hero"
                                            onTaskClick={handleTaskClick}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          // Standard grid layouts (non-Hero)
                          return rows.map((row, rowIndex) => {
                            const firstZone = row[0]?.layoutZone || 'full';
                            const isHeroLayout = firstZone === 'hero';
                            let gridCols = 'grid-cols-1';
                            
                            if (firstZone.includes('left-33') || firstZone.includes('middle-33') || firstZone.includes('right-33')) {
                              gridCols = 'grid-cols-3';
                            } else if (firstZone.includes('left-50') || firstZone.includes('right-50')) {
                              gridCols = 'grid-cols-2';
                            } else if (firstZone.includes('left-70') || firstZone.includes('right-30')) {
                              gridCols = 'grid-cols-[2.33fr_1fr]';
                            } else if (firstZone.includes('left-30') || firstZone.includes('right-70')) {
                              gridCols = 'grid-cols-[1fr_2.33fr]';
                            }

                            // Hero layout special styling
                            const heroClasses = isHeroLayout 
                              ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl p-8 shadow-lg' 
                              : '';

                            return (
                              <div key={rowIndex} className={`grid ${gridCols} gap-6 items-start w-full ${heroClasses}`}>
                                {row.map((field: any, fieldIndex: number) => {
                                  const alignment = field.alignment || 'left';
                                  const alignmentClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
                                  
                                  // Find goal if field has goalTag
                                  const fieldGoal = field.goalTag ? availableGoals.find(g => g.id === field.goalTag) : null;
                                  
                                  return (
                                    <div key={field.key} className={`flex flex-col ${alignmentClass}`}>
                                      {field.displayAssetTitle && field.assetTitle && (
                                        <div className="flex items-center gap-2 mb-3">
                                          <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300">
                                            {field.assetTitle}
                                          </h4>
                                          {fieldGoal && (
                                            <button
                                              onClick={() => {
                                                setSelectedGoal(fieldGoal);
                                                setShowGoalModal(true);
                                              }}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-md hover:underline transition-all cursor-pointer"
                                              style={{
                                                backgroundColor: 'rgba(67, 28, 91, 0.1)',
                                                color: 'var(--brand-primary)'
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(67, 28, 91, 0.2)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(67, 28, 91, 0.1)';
                                              }}
                                              title="Click to view goal details"
                                            >
                                              <span className="text-sm">{fieldGoal.icon || '🎯'}</span>
                                              {fieldGoal.shortName || fieldGoal.name}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      <AssetRenderEngine
                                        type={field.type}
                                        data={field.data}
                                        displayMode={isHeroLayout ? 'connected' : 'spaced'}
                                        onTaskClick={handleTaskClick}
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
                      <div>
                        {section.assetTitle && section.displayAssetTitle !== false && (() => {
                          const assetGoal = section.goalTag ? availableGoals.find(g => g.id === section.goalTag) : null;
                          return (
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300">
                                {section.assetTitle}
                              </h4>
                              {assetGoal && (
                                <button
                                  onClick={() => {
                                    setSelectedGoal(assetGoal);
                                    setShowGoalModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-md bg-brand-primary/10 text-brand-primary dark:bg-brand-secondary/20 dark:text-brand-secondary hover:bg-brand-primary/20 dark:hover:bg-brand-secondary/30 hover:underline transition-all cursor-pointer"
                                  title="Click to view goal details"
                                >
                                  <span className="text-sm">{assetGoal.icon || '🎯'}</span>
                                  {assetGoal.shortName || assetGoal.name}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                        <AssetRenderEngine
                          type={section.type}
                          data={section.data}
                          onTaskClick={handleTaskClick}
                        />
                      </div>
                    )}
                  </section>
                  );
                })}
                </div>
                
                {sections.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No content sections configured for this item.
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Goal Details Modal */}
        <AnimatePresence>
          {showGoalModal && selectedGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
              onClick={() => setShowGoalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                ref={goalModalRef}
              >
                {/* Header */}
                <div className="bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-800 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <Target className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.name}</h2>
                          {selectedGoal.shortName && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              {selectedGoal.shortName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          {selectedGoal.status && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                              {selectedGoal.status.replace('-', ' ').toUpperCase()}
                            </span>
                          )}
                          {selectedGoal.priority && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                              {selectedGoal.priority.toUpperCase()} PRIORITY
                            </span>
                          )}
                          {selectedGoal.owner && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {selectedGoal.owner}
                            </span>
                          )}
                          {selectedGoal.targetDate && (
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Target: {new Date(selectedGoal.targetDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportGoalImage}
                        disabled={isExportingGoal}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Export as Image"
                      >
                        {isExportingGoal ? (
                          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowGoalModal(false)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedGoal.progress !== undefined && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedGoal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500 bg-purple-500 dark:bg-purple-400"
                          style={{ width: `${selectedGoal.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Scrollable Content */}
                <div className="goal-scrollable-content flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-gray-900">
                  {/* SMART Goal Statement */}
                  {selectedGoal.smartGoal?.statement && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        SMART Goal Statement
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        {selectedGoal.smartGoal.statement}
                      </p>
                    </section>
                  )}

                {/* Two-Column Layout */}
                {selectedGoal.smartGoal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Objectives */}
                      {selectedGoal.smartGoal.specific?.objectives && (
                        <section>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📍 Specific Objectives</h3>
                          <ul className="space-y-2">
                            {selectedGoal.smartGoal.specific.objectives.map((obj: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* Metrics */}
                      {selectedGoal.smartGoal.measurable?.metrics && (
                        <section>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📊 Measurable Metrics</h3>
                          <ul className="space-y-2">
                            {selectedGoal.smartGoal.measurable.metrics.map((metric: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                                {metric}
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      {/* CRO Alignment */}
                      {selectedGoal.smartGoal.relevant?.croAlignment && (
                        <section>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">🎯 CRO Impact Areas</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedGoal.smartGoal.relevant.croAlignment.map((area: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Resources */}
                      {selectedGoal.smartGoal.achievable && (
                        <section>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">💪 Resources & Ownership</h3>
                          <div className="space-y-2 text-sm">
                            {selectedGoal.smartGoal.achievable.resources && (
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Resources:</span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedGoal.smartGoal.achievable.resources}</p>
                              </div>
                            )}
                            {selectedGoal.smartGoal.achievable.ownership && (
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Ownership:</span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedGoal.smartGoal.achievable.ownership}</p>
                              </div>
                            )}
                            {selectedGoal.coOwners && selectedGoal.coOwners.length > 0 && (
                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Co-Owners:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {selectedGoal.coOwners.map((owner: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                                      {owner}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </section>
                      )}

                      {/* Dates */}
                      {(selectedGoal.createdDate || selectedGoal.lastUpdated || selectedGoal.targetDate) && (
                        <section>
                          <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📅 Timeline</h3>
                          <div className="space-y-2 text-sm">
                            {selectedGoal.createdDate && (
                              <div className="flex justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedGoal.createdDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {selectedGoal.lastUpdated && (
                              <div className="flex justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedGoal.lastUpdated).toLocaleDateString()}</span>
                              </div>
                            )}
                            {selectedGoal.targetDate && (
                              <div className="flex justify-between bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
                                <span className="text-green-700 dark:text-green-300 font-semibold">Target Date:</span>
                                <span className="font-bold text-green-900 dark:text-green-100">{new Date(selectedGoal.targetDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                )}

                  {/* Milestones */}
                  {selectedGoal.smartGoal?.timeBound?.timeline && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        Milestones & Deliverables
                      </h3>
                      <div className="space-y-3">
                        {selectedGoal.smartGoal.timeBound.timeline.map((milestone: any, idx: number) => {
                          const isCompleted = milestone.status === 'completed' || milestone.status === 'complete';
                          const isInProgress = milestone.status === 'in-progress';
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border ${
                                isCompleted
                                  ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                                  : isInProgress
                                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                ) : isInProgress ? (
                                  <Circle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white">{milestone.phase}</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{milestone.dueDate}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{milestone.deliverable}</p>
                                  <span
                                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                                      isCompleted
                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                        : isInProgress
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {milestone.status.replace('-', ' ').toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Linked Assets */}
                  {selectedGoal.linkedAssets > 0 && (
                    <section>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔗 Linked Assets</h3>
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          This goal is linked to <span className="font-bold">{selectedGoal.linkedAssets}</span> content asset{selectedGoal.linkedAssets !== 1 ? 's' : ''} across your templates.
                        </p>
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task Editor Modal (View Only) */}
      {selectedTask && (
        <TaskEditorModal
          task={selectedTask}
          onSave={() => {}} // No-op in frontend (view-only)
          onClose={() => setSelectedTask(null)}
          viewOnly={true}
        />
      )}
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
