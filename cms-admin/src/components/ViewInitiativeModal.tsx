import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Users, Calendar, TrendingUp, CheckCircle2, Circle, Clock, Download, Loader2, Maximize2, Minimize2, Target } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { TaskConnectorRenderer } from '../renderers/assetRenderTasks';

interface Initiative {
  id: string;
  name: string;
  shortName?: string;
  slug?: string;
  category: string;
  owner: string;
  coOwners?: string[];
  sponsor?: string;
  status: string;
  priority: string;
  progress?: number;
  projectStage?: string;
  linkedGoals?: string[];
  
  smartGoal?: {
    statement: string;
    specific?: { objectives: string[] };
    measurable?: { metrics: string[] };
    achievable?: { resources: string; teamSize?: string };
    relevant?: { croAlignment: string[]; strategicThemes?: string[] };
    timeBound?: { milestones: Array<{ milestone: string; date: string; status: string }> };
  };
  
  budget?: {
    allocated: string;
    spent: string;
    projected: string;
  };
  
  linkedAssets?: number;
  createdDate: string;
  lastUpdated: string;
  targetDate?: string;
}

interface ViewInitiativeModalProps {
  initiative: Initiative;
  linkedGoals?: any[];
  onClose: () => void;
}

const ViewInitiativeModal: React.FC<ViewInitiativeModalProps> = ({ initiative, linkedGoals = [], onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'smart' | 'milestones' | 'dependencies' | 'performance' | 'resources' | 'risks' | 'tasks' | 'goals'>('overview');
  
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleExportImage = async () => {
    if (!modalContentRef.current) return;

    setIsExporting(true);
    
    try {
      const modalContainer = modalContentRef.current;
      const scrollableDiv = modalContainer.querySelector('.overflow-y-auto') as HTMLElement;
      
      if (!scrollableDiv) {
        throw new Error('Could not find scrollable content');
      }
      
      const originalStyles = {
        containerOverflow: modalContainer.style.overflow,
        containerMaxHeight: modalContainer.style.maxHeight,
        containerHeight: modalContainer.style.height,
        containerClass: modalContainer.className,
        scrollOverflow: scrollableDiv.style.overflow,
        scrollMaxHeight: scrollableDiv.style.maxHeight,
        scrollHeight: scrollableDiv.style.height,
      };
      
      const originalClass = modalContainer.className;
      modalContainer.className = originalClass.replace('max-h-[90vh]', '');
      
      modalContainer.style.overflow = 'visible';
      modalContainer.style.maxHeight = 'none';
      modalContainer.style.height = 'auto';
      scrollableDiv.style.overflow = 'visible';
      scrollableDiv.style.maxHeight = 'none';
      scrollableDiv.style.height = 'auto';
      
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await domToPng(modalContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: modalContainer.scrollWidth,
        height: modalContainer.scrollHeight,
      });

      modalContainer.className = originalStyles.containerClass;
      modalContainer.style.overflow = originalStyles.containerOverflow;
      modalContainer.style.maxHeight = originalStyles.containerMaxHeight;
      modalContainer.style.height = originalStyles.containerHeight;
      scrollableDiv.style.overflow = originalStyles.scrollOverflow;
      scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
      scrollableDiv.style.height = originalStyles.scrollHeight;

      const link = document.createElement('a');
      link.download = `initiative-${initiative.id}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    'not-started': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
    'on-hold': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    'at-risk': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
    'blocked': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  };

  const priorityColors: Record<string, { bg: string; text: string }> = {
    'low': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
    'medium': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    'high': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
    'critical': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
        onClick={onClose}
      >
        <div className={isFullscreen ? "fixed inset-2.5" : "w-full h-full flex items-center justify-center p-4"}>
          <motion.div
            ref={modalContentRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col ${
              isFullscreen 
                ? 'w-full h-full rounded-xl' 
                : 'rounded-xl max-w-6xl w-full h-[90vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Navy/Raspberry Gradient with Animated Background */}
            <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="initiative-modal-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1" fill="currentColor" />
                    </pattern>
                    <pattern id="initiative-modal-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#initiative-modal-grid)" />
                  <rect width="100%" height="100%" fill="url(#initiative-modal-lines)" />
                </svg>
              </div>

              {/* Floating Shapes */}
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"
              />
              <motion.div 
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"
              />

              <div className="relative p-6 border-b border-white/20">
                <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-roobert-bold">{initiative.name}</h2>
                      {initiative.shortName && (
                        <span className="px-3 py-1 rounded-full text-xs font-roobert-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                          {initiative.shortName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-white/90">
                      <span className={`px-2 py-1 rounded text-xs font-roobert-medium ${statusColors[initiative.status]?.bg || 'bg-gray-100'} ${statusColors[initiative.status]?.text || 'text-gray-700'}`}>
                        {initiative.status.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-roobert-medium ${priorityColors[initiative.priority]?.bg || 'bg-gray-100'} ${priorityColors[initiative.priority]?.text || 'text-gray-700'}`}>
                        {initiative.priority.toUpperCase()} PRIORITY
                      </span>
                      {initiative.projectStage && (
                        <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-white/10 text-white">
                          {initiative.projectStage.toUpperCase()}
                        </span>
                      )}
                      <span className="text-sm flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {initiative.owner}
                      </span>
                      {initiative.targetDate && (
                        <span className="text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Target: {new Date(initiative.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={handleExportImage}
                    disabled={isExporting}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                    title="Export as Image"
                  >
                    {isExporting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-6 border-b border-white/20 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                    activeTab === 'overview' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Overview
                  {activeTab === 'overview' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                {initiative.smartGoal?.timeBound?.timeline && initiative.smartGoal.timeBound.timeline.length > 0 && (
                  <button
                    onClick={() => setActiveTab('milestones')}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                      activeTab === 'milestones' 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Milestones
                    {activeTab === 'milestones' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}                  </button>
                )}
                {initiative.dependencies && (initiative.dependencies.internal?.length > 0 || initiative.dependencies.external?.length > 0) && (
                  <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                      activeTab === 'dependencies' 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Dependencies
                    {activeTab === 'dependencies' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )}
                {initiative.indicators && (initiative.indicators.leading?.length > 0 || initiative.indicators.lagging?.length > 0) && (
                  <button
                    onClick={() => setActiveTab('performance')}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                      activeTab === 'performance' 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Performance
                    {activeTab === 'performance' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('resources')}
                  className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                    activeTab === 'resources' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Resources
                  {activeTab === 'resources' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                {(initiative.risks || initiative.topRisks || initiative.successCriteria) && (
                  <button
                    onClick={() => setActiveTab('risks')}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                      activeTab === 'risks' 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Risks & Success
                    {activeTab === 'risks' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                    activeTab === 'tasks' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Tasks
                  {activeTab === 'tasks' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                {linkedGoals && linkedGoals.length > 0 && (
                  <button
                    onClick={() => setActiveTab('goals')}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative whitespace-nowrap ${
                      activeTab === 'goals' 
                        ? 'text-white' 
                        : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    Goals ({linkedGoals.length})
                    {activeTab === 'goals' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Progress */}
                  {initiative.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">Progress</h3>
                        <span className="text-xl font-roobert-bold text-gray-900 dark:text-white">{initiative.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fis-navy to-fis-raspberry transition-all"
                          style={{ width: `${initiative.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Statement */}
                  {initiative.smartGoal?.statement && (
                    <div className="bg-gradient-to-br from-blue-50 to-pink-50 dark:from-blue-950/20 dark:to-pink-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <h3 className="text-xs font-roobert-semibold text-fis-navy dark:text-blue-300 mb-1.5">Initiative Statement</h3>
                      <p className="text-sm text-gray-900 dark:text-white font-roobert-light leading-relaxed">
                        {initiative.smartGoal.statement}
                      </p>
                    </div>
                  )}

                  {/* Business Case */}
                  {initiative.businessCase && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Business Case</h3>
                      
                      {initiative.businessCase.problem && (
                        <div className="mb-2.5">
                          <h4 className="text-[10px] font-roobert-semibold text-red-600 dark:text-red-400 mb-1 uppercase">Problem</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{initiative.businessCase.problem}</p>
                        </div>
                      )}
                      
                      {initiative.businessCase.opportunity && (
                        <div className="mb-2.5">
                          <h4 className="text-[10px] font-roobert-semibold text-blue-600 dark:text-blue-400 mb-1 uppercase">Opportunity</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{initiative.businessCase.opportunity}</p>
                        </div>
                      )}
                      
                      {initiative.businessCase.solution && (
                        <div className="mb-2.5">
                          <h4 className="text-[10px] font-roobert-semibold text-green-600 dark:text-green-400 mb-1 uppercase">Solution</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{initiative.businessCase.solution}</p>
                        </div>
                      )}

                      {(initiative.businessCase.roi || initiative.businessCase.paybackPeriod) && (
                        <div className="grid grid-cols-2 gap-3 mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
                          {initiative.businessCase.roi && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">ROI</p>
                              <p className="text-base font-roobert-bold text-fis-navy dark:text-blue-300">{initiative.businessCase.roi}</p>
                            </div>
                          )}
                          {initiative.businessCase.paybackPeriod && (
                            <div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Payback Period</p>
                              <p className="text-base font-roobert-bold text-fis-navy dark:text-blue-300">{initiative.businessCase.paybackPeriod}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {initiative.businessCase.expectedBenefits && initiative.businessCase.expectedBenefits.length > 0 && (
                        <div className="mt-2.5">
                          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1.5">Expected Benefits</h4>
                          <ul className="space-y-1">
                            {initiative.businessCase.expectedBenefits.map((benefit: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Team & Sponsor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {initiative.owner && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1.5">
                          <Users className="w-3 h-3" />
                          <h4 className="text-[10px] font-roobert-semibold uppercase">Owner</h4>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-roobert-medium">{initiative.owner}</p>
                        {initiative.coOwners && initiative.coOwners.length > 0 && (
                          <div className="mt-1.5">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Co-Owners:</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{initiative.coOwners.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {initiative.sponsor && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 mb-1.5">
                          <Users className="w-3 h-3" />
                          <h4 className="text-[10px] font-roobert-semibold uppercase">Sponsor</h4>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-roobert-medium">{initiative.sponsor}</p>
                      </div>
                    )}
                  </div>

                  {/* Stakeholders */}
                  {initiative.stakeholders && initiative.stakeholders.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-xs font-roobert-semibold text-gray-900 dark:text-white mb-2">Key Stakeholders</h4>
                      <div className="space-y-1.5">
                        {initiative.stakeholders.map((stakeholder: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="text-sm font-roobert-medium text-gray-900 dark:text-white">{stakeholder.name}</p>
                              <p className="text-[10px] text-gray-600 dark:text-gray-400">{stakeholder.role}</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium ${
                              stakeholder.supportLevel === 'champion' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                              stakeholder.supportLevel === 'supporter' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              stakeholder.supportLevel === 'neutral' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            }`}>
                              {stakeholder.supportLevel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}



              {activeTab === 'milestones' && (
                <div className="space-y-4">
                  {/* Milestones Timeline */}
                  {initiative.smartGoal?.timeBound?.timeline && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Project Timeline</h3>
                      <div className="space-y-2.5">
                        {initiative.smartGoal.timeBound.timeline.map((phase: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                            <div className="flex-shrink-0">
                              {phase.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : phase.status === 'in-progress' ? (
                                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-1">{phase.phase}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">{phase.deliverable}</p>
                              <div className="flex items-center gap-2.5 text-xs">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(phase.dueDate).toLocaleDateString()}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium ${
                                  phase.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                  phase.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {phase.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SMART Goal Objectives */}
                  {initiative.smartGoal && (
                    <div className="space-y-4">
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Objectives</h3>
                      
                      {/* Top Row: Specific & Measurable */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Specific Objectives */}
                        {initiative.smartGoal.specific?.objectives && initiative.smartGoal.specific.objectives.length > 0 && (
                          <div>
                            <h4 className="text-sm font-roobert-semibold text-fis-navy dark:text-blue-300 mb-2">Specific Objectives</h4>
                            <ul className="space-y-1.5">
                              {initiative.smartGoal.specific.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-900 dark:text-white font-roobert-light">{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Measurable Metrics */}
                        {initiative.smartGoal.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-roobert-semibold text-fis-navy dark:text-blue-300 mb-2">Measurable Metrics</h4>
                            <ul className="space-y-1.5">
                              {initiative.smartGoal.measurable.metrics.map((metric, idx) => (
                                <li key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
                                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-900 dark:text-white font-roobert-light">{metric}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Achievable & Relevant */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Achievable */}
                        {initiative.smartGoal.achievable && (
                          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                            <h4 className="text-sm font-roobert-semibold text-fis-navy dark:text-green-300 mb-2">Achievable Resources</h4>
                            <p className="text-sm text-gray-900 dark:text-white font-roobert-light mb-1.5">{initiative.smartGoal.achievable.resources}</p>
                            {initiative.smartGoal.achievable.teamSize && (
                              <p className="text-xs text-gray-700 dark:text-gray-300">Team Size: {initiative.smartGoal.achievable.teamSize}</p>
                            )}
                          </div>
                        )}

                        {/* Relevant */}
                        {initiative.smartGoal.relevant && (
                          <div>
                            <h4 className="text-sm font-roobert-semibold text-fis-navy dark:text-blue-300 mb-2">Strategic Alignment</h4>
                            {initiative.smartGoal.relevant.croAlignment && initiative.smartGoal.relevant.croAlignment.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1.5">CRO Impact Areas:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {initiative.smartGoal.relevant.croAlignment.map((area, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-full bg-fis-navy/10 text-fis-navy dark:bg-blue-900/30 dark:text-blue-300 text-xs font-roobert-medium">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {initiative.smartGoal.relevant.strategicThemes && initiative.smartGoal.relevant.strategicThemes.length > 0 && (
                              <div>
                                <p className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1.5">Strategic Themes:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {initiative.smartGoal.relevant.strategicThemes.map((theme, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-full bg-fis-raspberry/10 text-fis-raspberry dark:bg-pink-900/30 dark:text-pink-300 text-xs font-roobert-medium">
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'performance' && initiative.indicators && (
                <div className="space-y-4">
                  {initiative.indicators.leading && initiative.indicators.leading.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Leading Indicators</h3>
                      <div className="grid gap-3">
                        {initiative.indicators.leading.map((indicator: any, idx: number) => (
                          <div key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">{indicator.name}</h4>
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Baseline</p>
                                <p className="text-base font-roobert-bold text-gray-700 dark:text-gray-300">
                                  {indicator.baseline}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Current</p>
                                <p className="text-base font-roobert-bold text-blue-700 dark:text-blue-300">
                                  {indicator.current}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Target</p>
                                <p className="text-base font-roobert-bold text-green-700 dark:text-green-300">
                                  {indicator.target}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Progress</p>
                                <p className="text-base font-roobert-bold text-fis-navy dark:text-blue-400">
                                  {Math.round(((parseFloat(indicator.current) - parseFloat(indicator.baseline)) / (parseFloat(indicator.target) - parseFloat(indicator.baseline))) * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {initiative.indicators.lagging && initiative.indicators.lagging.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Lagging Indicators</h3>
                      <div className="grid gap-3">
                        {initiative.indicators.lagging.map((indicator: any, idx: number) => (
                          <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">{indicator.name}</h4>
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Baseline</p>
                                <p className="text-base font-roobert-bold text-gray-700 dark:text-gray-300">
                                  {indicator.baseline}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Current</p>
                                <p className="text-base font-roobert-bold text-purple-700 dark:text-purple-300">
                                  {indicator.current}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Target</p>
                                <p className="text-base font-roobert-bold text-green-700 dark:text-green-300">
                                  {indicator.target}{indicator.unit}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Progress</p>
                                <p className="text-base font-roobert-bold text-fis-raspberry dark:text-pink-400">
                                  {Math.round(((parseFloat(indicator.current) - parseFloat(indicator.baseline)) / (parseFloat(indicator.target) - parseFloat(indicator.baseline))) * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-4">
                  {/* Team Members */}
                  {initiative.resources?.team && initiative.resources.team.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-3">Team Members</h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        {initiative.resources.team.map((member: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                            <div>
                              <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white">{member.name || `${member.role}${member.count ? ` (${member.count})` : ''}`}</h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                              {member.note && <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{member.note}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-roobert-medium text-fis-navy dark:text-blue-300">{member.allocation}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">{member.commitment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools & Platforms */}
                  {initiative.resources?.tools && initiative.resources.tools.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-3">Tools & Platforms</h3>
                      <div className="flex flex-wrap gap-2">
                        {initiative.resources.tools.map((tool: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-roobert-medium border border-gray-200 dark:border-gray-700">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dependencies' && initiative.dependencies && (
                <div className="space-y-4">
                  {initiative.dependencies.internal && initiative.dependencies.internal.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-blue-600 dark:text-blue-400 mb-3">Internal Dependencies</h3>
                      <div className="space-y-2.5">
                        {initiative.dependencies.internal.map((dep: any, idx: number) => (
                          <div key={idx} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start justify-between mb-1.5">
                              <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm">{dep.on}</h5>
                              <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${
                                dep.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                dep.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {dep.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dep.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                              <span className={`font-roobert-medium ${
                                dep.criticality === 'high' ? 'text-red-600 dark:text-red-400' :
                                dep.criticality === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {dep.criticality} criticality
                              </span>
                              {dep.dueDate && <span>Due: {new Date(dep.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {initiative.dependencies.external && initiative.dependencies.external.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-purple-600 dark:text-purple-400 mb-3">External Dependencies</h3>
                      <div className="space-y-2.5">
                        {initiative.dependencies.external.map((dep: any, idx: number) => (
                          <div key={idx} className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start justify-between mb-1.5">
                              <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm">{dep.on}</h5>
                              <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${
                                dep.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                dep.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}>
                                {dep.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{dep.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                              <span className={`font-roobert-medium ${
                                dep.criticality === 'high' ? 'text-red-600 dark:text-red-400' :
                                dep.criticality === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                                'text-gray-600 dark:text-gray-400'
                              }`}>
                                {dep.criticality} criticality
                              </span>
                              {dep.contractEnd && <span>Contract ends: {new Date(dep.contractEnd).toLocaleDateString()}</span>}
                              {dep.endDate && <span>Ended: {new Date(dep.endDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'risks' && (
                <div className="space-y-4">
                  {/* Top Risks Summary */}
                  {initiative.topRisks && initiative.topRisks.length > 0 && (
                    <div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-3">Top Risks</h3>
                      <div className="space-y-2.5">
                        {initiative.topRisks.map((risk: any, idx: number) => (
                          <div key={idx} className={`rounded-lg p-3 border ${
                            risk.level === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
                            risk.level === 'medium' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' :
                            'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                          }`}>
                            <div className="flex items-start justify-between mb-1.5">
                              <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white">{risk.risk}</h4>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium ${
                                risk.level === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                risk.level === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              }`}>
                                {risk.level} risk
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Success Criteria - 3 Column Grid */}
                  {initiative.successCriteria && (
                    <div className="space-y-3">
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">Success Criteria</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {initiative.successCriteria.technical && initiative.successCriteria.technical.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <h4 className="text-xs font-roobert-semibold text-blue-600 dark:text-blue-400 mb-2">Technical Success</h4>
                            <ul className="space-y-1.5">
                              {initiative.successCriteria.technical.map((criteria: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                  <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {initiative.successCriteria.business && initiative.successCriteria.business.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                            <h4 className="text-xs font-roobert-semibold text-green-600 dark:text-green-400 mb-2">Business Success</h4>
                            <ul className="space-y-1.5">
                              {initiative.successCriteria.business.map((criteria: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                  <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {initiative.successCriteria.adoption && initiative.successCriteria.adoption.length > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                            <h4 className="text-xs font-roobert-semibold text-purple-600 dark:text-purple-400 mb-2">Adoption Success</h4>
                            <ul className="space-y-1.5">
                              {initiative.successCriteria.adoption.map((criteria: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                                  <CheckCircle2 className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {initiative.successCriteria.minimumViableSuccess && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                          <h4 className="text-xs font-roobert-semibold text-green-700 dark:text-green-300 mb-1.5">Minimum Viable Success</h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{initiative.successCriteria.minimumViableSuccess}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'goals' && linkedGoals && linkedGoals.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-2">Linked Strategic Goals</h3>
                  <div className="grid gap-2.5">
                    {linkedGoals.map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-2.5 border border-purple-200 dark:border-purple-800">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-1">{goal.name}</h4>
                          {goal.smartGoal?.statement && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{goal.smartGoal.statement}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-medium ${statusColors[goal.status]?.bg || 'bg-gray-100'} ${statusColors[goal.status]?.text || 'text-gray-700'}`}>
                              {goal.status}
                            </span>
                            {goal.progress !== undefined && (
                              <span className="text-[10px] text-gray-600 dark:text-gray-400">{goal.progress}% complete</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div>
                  <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-3">
                    Tasks Linked to Initiative
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <TaskConnectorRenderer
                      data={{
                        filters: {
                          initiativeId: initiative.id
                        },
                        layout: {
                          sortBy: 'targetDate',
                          sortOrder: 'asc'
                        }
                      }}
                      mode="display"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(initiative.createdDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated: {new Date(initiative.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                {initiative.category && (
                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-roobert-medium capitalize">
                    {initiative.category}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewInitiativeModal;
