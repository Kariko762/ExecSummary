import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Users, Calendar, TrendingUp, CheckCircle2, Circle, Clock, Download, Loader2, Maximize2, Minimize2, ChevronDown, ChevronUp, Rocket, CheckSquare, FileText } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

interface Goal {
  id: string;
  name: string;
  title?: string;
  shortName: string;
  category: string;
  owner: string;
  coOwners?: string[];
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'at-risk' | 'blocked' | 'achieved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; ownership: string };
    relevant: { croAlignment: string[]; rationale?: string[] };
    timeBound: { timeline: Array<{ phase: string; deliverable: string; dueDate: string; status: string }> };
  };
  
  indicators: {
    leading: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
    lagging: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
  };
  
  progress: number;
  color: string;
  icon: string;
  linkedAssets: number;
  createdDate: string;
  lastUpdated: string;
  targetDate: string;
}

interface ViewGoalModalProps {
  goal: Goal;
  onClose: () => void;
}

const ViewGoalModal: React.FC<ViewGoalModalProps> = ({ goal, onClose }) => {
  console.log('🏁 ViewGoalModal MOUNTED - Goal:', goal?.title);
  
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95 | 100>(75);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // Linked content state
  const [linkedContent, setLinkedContent] = useState<{
    initiativeTasks: Array<{ initiative: any; tasks: any[] }>;
    generalTasks: any[];
    notes: any[];
  }>({ initiativeTasks: [], generalTasks: [], notes: [] });
  const [linkedContentLoading, setLinkedContentLoading] = useState(true);
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    tasksAndInitiatives: false,
    notes: false
  });

  // Fetch linked content
  useEffect(() => {
    const fetchLinkedContent = async () => {
      if (!goal?.id) return;
      
      try {
        setLinkedContentLoading(true);
        const response = await fetch(`http://localhost:3001/api/goals/${goal.id}/linked/all`);
        const data = await response.json();
        
        if (data.success) {
          setLinkedContent(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch linked content:', error);
      } finally {
        setLinkedContentLoading(false);
      }
    };
    
    fetchLinkedContent();
  }, [goal?.id]);
  
  const toggleSection = (section: 'tasksAndInitiatives' | 'notes') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  console.log('📍 ViewGoalModal - modalContentRef defined:', modalContentRef);
  console.log('📍 ViewGoalModal - handleExportImage function will be defined next');

  const handleExportImage = async () => {
    console.log('🚨 EXPORT BUTTON CLICKED!');
    console.log('🚨 modalContentRef.current:', modalContentRef.current);
    
    if (!modalContentRef.current) {
      console.log('🚨 NO REF - ABORTING');
      return;
    }

    setIsExporting(true);
    console.log('🖼️ Starting export...');
    
    try {
      const modalContainer = modalContentRef.current;
      console.log('📦 Modal container:', modalContainer);
      
      // Find the scrollable content div inside the modal
      const scrollableDiv = modalContainer.querySelector('.overflow-y-auto') as HTMLElement;
      console.log('📜 Scrollable div:', scrollableDiv);
      
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
      
      console.log('💾 Original styles saved');
      
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
      
      console.log('🔓 Constraints removed, waiting for layout...');
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('📏 Final dimensions:', {
        scrollWidth: modalContainer.scrollWidth,
        scrollHeight: modalContainer.scrollHeight,
        offsetWidth: modalContainer.offsetWidth,
        offsetHeight: modalContainer.offsetHeight
      });

      // Capture the entire modal with full expanded content
      const dataUrl = await domToPng(modalContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: modalContainer.scrollWidth,
        height: modalContainer.scrollHeight,
      });

      console.log('✅ Image captured');

      // Restore original styles AND classes
      modalContainer.className = originalStyles.containerClass;
      modalContainer.style.overflow = originalStyles.containerOverflow;
      modalContainer.style.maxHeight = originalStyles.containerMaxHeight;
      modalContainer.style.height = originalStyles.containerHeight;
      scrollableDiv.style.overflow = originalStyles.scrollOverflow;
      scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
      scrollableDiv.style.height = originalStyles.scrollHeight;

      const link = document.createElement('a');
      link.download = `goal-${goal.id}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      console.log('💾 Download triggered');
    } catch (error) {
      console.error('❌ Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    efficiency: { bg: '', text: '', border: '' }, // Will use inline styles
    quality: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    customer: { bg: '', text: '', border: '' }, // Will use inline styles
    cost: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    innovation: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    'not-started': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    'in-progress': { bg: '', text: '' }, // Will use inline styles with brand-primary
    'completed': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
    'achieved': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
    'on-hold': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
    'at-risk': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
    'blocked': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' }
  };

  const priorityColors: Record<string, { bg: string; text: string }> = {
    low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    medium: { bg: '', text: '' }, // Will use inline styles with brand-primary
    high: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
    critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' }
  };

  const colors = categoryColors[goal.category] || categoryColors.efficiency;

  // Helper to get category styles
  const getCategoryStyle = (category: string) => {
    if (category === 'efficiency') {
      return {
        backgroundColor: 'rgba(67, 28, 91, 0.05)',
        color: 'var(--brand-primary)',
        border: '1px solid rgba(67, 28, 91, 0.2)'
      };
    } else if (category === 'customer') {
      return {
        backgroundColor: 'rgba(178, 26, 83, 0.05)',
        color: 'var(--brand-secondary)',
        border: '1px solid rgba(178, 26, 83, 0.2)'
      };
    }
    return {};
  };

  // Helper to get status badge styles
  const getStatusStyle = (status: string) => {
    if (status === 'in-progress') {
      return {
        backgroundColor: 'rgba(67, 28, 91, 0.1)',
        color: 'var(--brand-primary)'
      };
    }
    return {};
  };

  // Helper to get priority badge styles
  const getPriorityStyle = (priority: string) => {
    if (priority === 'medium') {
      return {
        backgroundColor: 'rgba(67, 28, 91, 0.1)',
        color: 'var(--brand-primary)'
      };
    }
    return {};
  };

  // Helper to get progress bar color
  const getProgressBarStyle = (category: string, progress: number) => {
    let backgroundColor = 'var(--brand-primary)';
    if (category === 'customer') backgroundColor = 'var(--brand-secondary)';
    else if (category === 'quality') backgroundColor = '#16a34a';
    else if (category === 'cost') backgroundColor = '#ea580c';
    else if (category === 'innovation') backgroundColor = '#ec4899';
    
    return { width: `${progress}%`, backgroundColor };
  };

  const calculateProgress = (baseline: string, current: string, target: string): number => {
    const parseValue = (str: string): number => {
      const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const b = parseValue(baseline);
    const c = parseValue(current);
    const t = parseValue(target);

    if (t === b) return 100;
    
    const progress = ((c - b) / (t - b)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  console.log('🎨 ViewGoalModal - About to render JSX with Export button');
  console.log('🎨 ViewGoalModal - isExporting state:', isExporting);
  console.log('🎨 ViewGoalModal - handleExportImage function exists:', typeof handleExportImage);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
        onClick={onClose}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          <motion.div
            ref={modalContentRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col rounded-xl ${modalWidth === 75 ? 'w-[75vw]' : modalWidth === 95 ? 'w-[95vw]' : 'w-full'} h-[calc(100vh-2rem)]`}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="border-b p-6" style={goal.category === 'efficiency' || goal.category === 'customer' ? { ...getCategoryStyle(goal.category), border: '1px solid rgba(67, 28, 91, 0.2)', borderBottom: '1px solid #e5e7eb' } : { backgroundColor: colors.bg.includes('bg-') ? undefined : colors.bg }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg border ${goal.category !== 'efficiency' && goal.category !== 'customer' ? `${colors.bg} ${colors.text} ${colors.border}` : ''}`} style={goal.category === 'efficiency' || goal.category === 'customer' ? getCategoryStyle(goal.category) : {}}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${goal.category !== 'efficiency' && goal.category !== 'customer' ? `${colors.bg} ${colors.text} ${colors.border}` : ''}`} style={goal.category === 'efficiency' || goal.category === 'customer' ? getCategoryStyle(goal.category) : {}}>
                      {goal.shortName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${goal.status !== 'in-progress' ? `${statusColors[goal.status].bg} ${statusColors[goal.status].text}` : ''}`} style={goal.status === 'in-progress' ? getStatusStyle(goal.status) : {}}>
                      {goal.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${goal.priority !== 'medium' ? `${priorityColors[goal.priority].bg} ${priorityColors[goal.priority].text}` : ''}`} style={goal.priority === 'medium' ? getPriorityStyle(goal.priority) : {}}>
                      {goal.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {goal.owner}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex items-center gap-2">
                {/* Export Button */}
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Export as Image"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                
                {/* Width Toggle - Cycles 75% -> 95% -> 100% */}
                <button
                  onClick={() => {
                    if (modalWidth === 75) setModalWidth(95);
                    else if (modalWidth === 95) setModalWidth(100);
                    else setModalWidth(75);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={`Current: ${modalWidth}% - Click to resize`}
                >
                  {modalWidth === 100 ? (
                    <Minimize2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={getProgressBarStyle(goal.category, goal.progress)}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* SMART Goal Statement */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                SMART Goal Statement
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed p-4 rounded-lg" style={{ backgroundColor: 'rgba(67, 28, 91, 0.05)', border: '1px solid rgba(67, 28, 91, 0.2)' }}>
                {goal.smartGoal.statement}
              </p>
            </section>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Objectives */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📍 Specific Objectives</h3>
                  <ul className="space-y-2">
                    {goal.smartGoal.specific.objectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />

                {/* Metrics */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📊 Measurable Metrics</h3>
                  <ul className="space-y-2">
                    {goal.smartGoal.measurable.metrics.map((metric, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 p-2 rounded" style={{ backgroundColor: 'rgba(67, 28, 91, 0.05)', border: '1px solid rgba(67, 28, 91, 0.2)' }}>
                        {metric}
                      </li>
                    ))}
                  </ul>
                </section>

                <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />

                {/* CRO Alignment */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">🎯 CRO Impact Areas</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {goal.smartGoal.relevant.croAlignment.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'rgba(178, 26, 83, 0.1)', color: 'var(--brand-secondary)' }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Resources */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">💪 Resources & Ownership</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Resources:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.smartGoal.achievable.resources}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Ownership:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{goal.smartGoal.achievable.ownership}</p>
                    </div>
                    {goal.coOwners && goal.coOwners.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Co-Owners:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {goal.coOwners.map((owner, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(67, 28, 91, 0.1)', color: 'var(--brand-primary)' }}>
                              {owner}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <hr className="border-t border-gray-300 dark:border-gray-600 my-4" />

                {/* Strategic Alignment */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📍 Strategic Alignment</h3>
                  {goal.smartGoal.relevant.rationale && goal.smartGoal.relevant.rationale.length > 0 ? (
                    <ul className="space-y-1.5">
                      {goal.smartGoal.relevant.rationale.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-pink-600 dark:text-pink-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No strategic alignment rationale provided</p>
                  )}
                </section>
              </div>
            </div>

            {/* Horizontal Rule */}
            <hr className="border-t border-gray-300 dark:border-gray-600 my-6" />

            {/* Indicators */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                Performance Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Leading Indicators */}
                <div>
                  <h4 className="text-sm font-bold text-green-700 dark:text-green-300 mb-3 uppercase">Leading Indicators</h4>
                  <div className="space-y-3">
                    {goal.indicators.leading.map((indicator, idx) => {
                      const progress = calculateProgress(indicator.baseline, indicator.current, indicator.target);
                      return (
                        <div key={idx} className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{indicator.name}</span>
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-2 mb-2">
                            <div
                              className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Base: {indicator.baseline}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">Current: {indicator.current}</span>
                            <span>Target: {indicator.target}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lagging Indicators */}
                <div>
                  <h4 className="text-sm font-bold mb-3 uppercase" style={{ color: 'var(--brand-primary)' }}>Lagging Indicators</h4>
                  <div className="space-y-3">
                    {goal.indicators.lagging.map((indicator, idx) => {
                      const progress = calculateProgress(indicator.baseline, indicator.current, indicator.target);
                      return (
                        <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(67, 28, 91, 0.05)', border: '1px solid rgba(67, 28, 91, 0.2)' }}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{indicator.name}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--brand-primary)' }}>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full rounded-full h-2 mb-2" style={{ backgroundColor: 'rgba(67, 28, 91, 0.2)' }}>
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%`, backgroundColor: 'var(--brand-primary)' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Base: {indicator.baseline}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">Current: {indicator.current}</span>
                            <span>Target: {indicator.target}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Horizontal Rule */}
            <hr className="border-t border-gray-300 dark:border-gray-600 my-6" />

            {/* Milestones */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Milestones & Deliverables
              </h3>
              <div className="space-y-3">
                {goal.smartGoal.timeBound.timeline.map((milestone, idx) => {
                  const isCompleted = milestone.status === 'completed';
                  const isInProgress = milestone.status === 'in-progress';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                          : isInProgress
                          ? ''
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                      style={isInProgress ? { backgroundColor: 'rgba(67, 28, 91, 0.05)', border: '1px solid rgba(67, 28, 91, 0.2)' } : {}}
                    >
                      <div className="flex items-start gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        ) : isInProgress ? (
                          <Circle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary)' }} />
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
                                ? ''
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            style={isInProgress ? { backgroundColor: 'rgba(67, 28, 91, 0.1)', color: 'var(--brand-primary)' } : {}}
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

            {/* Linked Assets */}
            {goal.linkedAssets > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔗 Linked Assets</h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(178, 26, 83, 0.05)', border: '1px solid rgba(178, 26, 83, 0.2)' }}>
                  <p className="text-sm" style={{ color: 'var(--brand-secondary)' }}>
                    This goal is linked to <span className="font-bold">{goal.linkedAssets}</span> content asset{goal.linkedAssets !== 1 ? 's' : ''} across your templates.
                  </p>
                </div>
              </section>
            )}

            {/* Horizontal Rule - Always show before linked content */}
            {!linkedContentLoading && (
              <hr className="border-t border-gray-300 dark:border-gray-600 my-6" />
            )}

            {/* Linked Content Sections */}
            {!linkedContentLoading && (
              <>
                {/* Tasks and Initiatives Section - ALWAYS SHOW */}
                <section>
                  <button
                    onClick={() => toggleSection('tasksAndInitiatives')}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Tasks & Initiatives ({linkedContent.initiativeTasks.reduce((sum, group) => sum + group.tasks.length, 0) + linkedContent.generalTasks.length})
                        </h3>
                      </div>
                      {expandedSections.tasksAndInitiatives ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.tasksAndInitiatives && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {linkedContent.initiativeTasks.length === 0 && linkedContent.generalTasks.length === 0 ? (
                            <div className="mt-3 text-center py-12">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <CheckSquare className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500 dark:text-gray-400 mb-2">No initiatives or tasks linked yet</p>
                              <p className="text-sm text-gray-400 dark:text-gray-500">
                                Link tasks to this goal from the Task Editor
                              </p>
                            </div>
                          ) : (
                          <div className="mt-3 space-y-6">
                            {/* Initiative Groups */}
                            {linkedContent.initiativeTasks.map(group => (
                              <div key={group.initiative.id} className="space-y-3">
                                {/* Initiative Header */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                                  <Rocket className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {group.initiative.name}
                                  </h4>
                                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                
                                {/* Tasks under this initiative */}
                                <div className="ml-6 space-y-2">
                                  {group.tasks.map((task: any) => {
                                    const statusColor = 
                                      task.status === 'Complete' ? 'green' :
                                      task.status === 'At Risk' ? 'red' :
                                      task.status === 'On Track' ? 'blue' : 'gray';
                                    
                                    return (
                                      <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <h5 className="font-semibold text-gray-900 dark:text-white flex-1">{task.title}</h5>
                                          <span className={`ml-2 w-3 h-3 rounded-full bg-${statusColor}-500 flex-shrink-0 mt-1`} title={task.status}></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                          {task.owner && (
                                            <span className="flex items-center gap-1">
                                              <Users className="w-3 h-3" />
                                              {task.owner}
                                            </span>
                                          )}
                                          {task.targetDate && (
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              Due: {task.targetDate}
                                            </span>
                                          )}
                                        </div>
                                        {task.percentage !== undefined && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                              <span className="font-semibold text-gray-900 dark:text-white">{task.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full bg-${statusColor}-500`}
                                                style={{ width: `${task.percentage}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {/* General Tasks Section */}
                            {linkedContent.generalTasks.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    General Tasks
                                  </h4>
                                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {linkedContent.generalTasks.length} task{linkedContent.generalTasks.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                
                                <div className="ml-6 space-y-2">
                                  {linkedContent.generalTasks.slice(0, 10).map((task: any) => {
                                    const statusColor = 
                                      task.status === 'Complete' ? 'green' :
                                      task.status === 'At Risk' ? 'red' :
                                      task.status === 'On Track' ? 'blue' : 'gray';
                                    
                                    return (
                                      <div
                                        key={task.id}
                                        className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <h5 className="font-semibold text-gray-900 dark:text-white flex-1">{task.title}</h5>
                                          <span className={`ml-2 w-3 h-3 rounded-full bg-${statusColor}-500 flex-shrink-0 mt-1`} title={task.status}></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                          {task.owner && (
                                            <span className="flex items-center gap-1">
                                              <Users className="w-3 h-3" />
                                              {task.owner}
                                            </span>
                                          )}
                                          {task.targetDate && (
                                            <span className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              Due: {task.targetDate}
                                            </span>
                                          )}
                                        </div>
                                        {task.percentage !== undefined && (
                                          <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                              <span className="font-semibold text-gray-900 dark:text-white">{task.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                              <div
                                                className={`h-2 rounded-full bg-${statusColor}-500`}
                                                style={{ width: `${task.percentage}%` }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {linkedContent.generalTasks.length > 10 && (
                                    <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-2">
                                      View All {linkedContent.generalTasks.length} General Tasks →
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                {/* Linked Notes */}
                {linkedContent.notes.length > 0 && (
                  <section>
                    <button
                      onClick={() => toggleSection('notes')}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Linked Notes ({linkedContent.notes.length})
                        </h3>
                      </div>
                      {expandedSections.notes ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedSections.notes && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            {linkedContent.notes.slice(0, 5).map((note: any) => (
                              <div
                                key={note.id}
                                className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{note.title}</h4>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{note.date}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                  {note.content}
                                </p>
                                {note.tags && note.tags.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {note.tags.slice(0, 3).map((tag: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                            {linkedContent.notes.length > 5 && (
                              <button className="w-full text-center text-sm text-amber-600 dark:text-amber-400 hover:underline py-2">
                                View All {linkedContent.notes.length} Notes →
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400" style={{ marginLeft: '20px' }}>
                <span>📅 Created: <strong className="text-gray-900 dark:text-white">{new Date(goal.createdDate).toLocaleDateString()}</strong></span>
                <span>🔄 Updated: <strong className="text-gray-900 dark:text-white">{new Date(goal.lastUpdated).toLocaleDateString()}</strong></span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewGoalModal;
