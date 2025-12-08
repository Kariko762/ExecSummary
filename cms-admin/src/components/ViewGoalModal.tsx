import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Users, Calendar, TrendingUp, CheckCircle2, Circle, Clock, Download, Loader2 } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

interface Goal {
  id: string;
  name: string;
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
    relevant: { croAlignment: string[] };
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
    efficiency: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    quality: { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    customer: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    cost: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    innovation: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    'not-started': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
    'completed': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
    'achieved': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
    'on-hold': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
    'at-risk': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
    'blocked': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' }
  };

  const priorityColors: Record<string, { bg: string; text: string }> = {
    low: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
    high: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
    critical: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' }
  };

  const colors = categoryColors[goal.category] || categoryColors.efficiency;

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalContentRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${colors.bg} ${colors.border} border-b p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`${colors.bg} ${colors.text} p-3 rounded-lg border ${colors.border}`}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{goal.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {goal.shortName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[goal.status].bg} ${statusColors[goal.status].text}`}>
                      {goal.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[goal.priority].bg} ${priorityColors[goal.priority].text}`}>
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
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${colors.bg.replace('50', '500').replace('dark:bg-', 'dark:bg-')}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* SMART Goal Statement */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                SMART Goal Statement
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
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

                {/* Metrics */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📊 Measurable Metrics</h3>
                  <ul className="space-y-2">
                    {goal.smartGoal.measurable.metrics.map((metric, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200 dark:border-blue-800">
                        {metric}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* CRO Alignment */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">🎯 CRO Impact Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {goal.smartGoal.relevant.croAlignment.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
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
                            <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                              {owner}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Dates */}
                <section>
                  <h3 className="text-md font-bold text-gray-900 dark:text-white mb-3">📅 Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(goal.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(goal.lastUpdated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
                      <span className="text-green-700 dark:text-green-300 font-semibold">Target Date:</span>
                      <span className="font-bold text-green-900 dark:text-green-100">{new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

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
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-3 uppercase">Lagging Indicators</h4>
                  <div className="space-y-3">
                    {goal.indicators.lagging.map((indicator, idx) => {
                      const progress = calculateProgress(indicator.baseline, indicator.current, indicator.target);
                      return (
                        <div key={idx} className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{indicator.name}</span>
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
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
              </div>
            </section>

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

            {/* Linked Assets */}
            {goal.linkedAssets > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">🔗 Linked Assets</h3>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    This goal is linked to <span className="font-bold">{goal.linkedAssets}</span> content asset{goal.linkedAssets !== 1 ? 's' : ''} across your templates.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export as Image
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewGoalModal;
