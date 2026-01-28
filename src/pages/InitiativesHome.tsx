import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Users, Maximize2, Minimize2, Download, X, Loader2, LayoutGrid, List, Target, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';
import ViewInitiativeModal from '../components/ViewInitiativeModal';

interface Initiative {
  id: string;
  name: string;
  shortName?: string;
  icon?: string;
  category: string;
  status: string;
  priority: string;
  progress?: number;
  owner?: string;
  sponsor?: string;
  startDate?: string;
  endDate?: string;
  linkedAssets?: number;
  linkedGoals?: string[];
  smartGoal?: {
    statement?: string;
    measurable?: {
      metrics?: string[];
    };
  };
  budget?: {
    total?: number;
    allocated?: number;
    spent?: number;
    currency?: string;
  };
  businessCase?: {
    problem?: string;
    opportunity?: string;
    solution?: string;
    roi?: string;
    paybackPeriod?: string;
  };
  [key: string]: any; // For additional properties
}

export default function InitiativesHome() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInitiative, setSelectedInitiative] = useState<any | null>(null);
  const [linkedGoals, setLinkedGoals] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/initiatives');
      const data = await response.json();
      if (data.success) {
        setInitiatives(data.initiatives);
      }
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiativeClick = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/initiatives/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedInitiative(data.initiative);
        setLinkedGoals(data.linkedGoals || []);
      }
    } catch (error) {
      console.error('Error fetching initiative details:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedInitiative(null);
    setLinkedGoals([]);
  };

  const handleExportImage = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    
    try {
      const contentContainer = contentRef.current;
      const scrollableDiv = contentContainer.querySelector('.overflow-y-auto') as HTMLElement;
      
      if (!scrollableDiv) {
        throw new Error('Could not find scrollable content');
      }
      
      const originalStyles = {
        containerOverflow: contentContainer.style.overflow,
        containerMaxHeight: contentContainer.style.maxHeight,
        containerHeight: contentContainer.style.height,
        scrollOverflow: scrollableDiv.style.overflow,
        scrollMaxHeight: scrollableDiv.style.maxHeight,
        scrollHeight: scrollableDiv.style.height,
      };
      
      contentContainer.style.overflow = 'visible';
      contentContainer.style.maxHeight = 'none';
      contentContainer.style.height = 'auto';
      scrollableDiv.style.overflow = 'visible';
      scrollableDiv.style.maxHeight = 'none';
      scrollableDiv.style.height = 'auto';
      
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await domToPng(contentContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: contentContainer.scrollWidth,
        height: contentContainer.scrollHeight,
      });

      contentContainer.style.overflow = originalStyles.containerOverflow;
      contentContainer.style.maxHeight = originalStyles.containerMaxHeight;
      contentContainer.style.height = originalStyles.containerHeight;
      scrollableDiv.style.overflow = originalStyles.scrollOverflow;
      scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
      scrollableDiv.style.height = originalStyles.scrollHeight;

      const link = document.createElement('a');
      link.download = `initiatives-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fis-navy dark:border-fis-raspberry mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        ref={contentRef}
        className={`bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : modalWidth === 95
              ? 'w-[95vw] h-[90vh] rounded-2xl'
              : 'w-[75vw] h-[90vh] rounded-2xl'
        }`}
      >
      {/* Header with Navy/Raspberry Gradient - Fixed */}
      <div className="relative overflow-hidden flex-shrink-0">
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="initiatives-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
                <pattern id="initiatives-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#initiatives-grid)" />
              <rect width="100%" height="100%" fill="url(#initiatives-lines)" />
            </svg>
          </div>

          {/* Floating Shapes */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
          />

          {/* Header Content */}
          <div className="relative px-4 2xl:px-6 py-4 2xl:py-8">
            <div className="flex items-center justify-between mb-2 2xl:mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 2xl:gap-3"
            >
              <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Rocket className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
              <div>
                <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5">
                  Strategic Initiatives
                </h1>
                <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                  Key projects driving organizational transformation
                </p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              >
                {viewMode === 'grid' ? (
                  <List className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                ) : (
                  <LayoutGrid className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                )}
              </button>
              <button
                onClick={handleExportImage}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title="Export as Image"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                )}
              </button>
              <button
                onClick={() => {
                  if (isFullscreen) {
                    setIsFullscreen(false);
                    setModalWidth(75);
                  } else if (modalWidth === 75) {
                    setModalWidth(95);
                  } else {
                    setIsFullscreen(true);
                  }
                }}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title={isFullscreen ? 'Exit Fullscreen (75%)' : modalWidth === 75 ? 'Wider View (95%)' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />}
              </button>
              <button
                onClick={() => navigate('/')}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title="Close"
              >
                <X className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
              </button>
            </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden 2xl:grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold text-orange-300">
                  {initiatives.filter(i => i.priority === 'high' || i.priority === 'critical').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">High Priority</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold text-red-300">
                  {initiatives.filter(i => i.status === 'blocked').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">Blocked</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold text-yellow-300">
                  {initiatives.filter(i => i.status === 'at-risk' || i.status === 'on-hold').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">Delayed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold text-blue-300">
                  {initiatives.filter(i => i.status === 'in-progress').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">In Progress</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold text-green-300">
                  {initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">Complete</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="relative px-6 py-8">
          {initiatives.length > 0 ? (
            <div className={viewMode === 'grid' ? `grid grid-cols-1 md:grid-cols-2 gap-6 ${
              isFullscreen || modalWidth === 95 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }` : 'flex flex-col gap-4'}>
              {initiatives.map((initiative, index) => (
                viewMode === 'grid' ? (
                  // Grid View - Square Tiles
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.08,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    onClick={() => handleInitiativeClick(initiative.id)}
                    className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
                  >
                    {/* Gradient Overlay on Hover - Navy to Raspberry */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/0 via-fis-navy/0 to-fis-raspberry/0 group-hover:from-blue-900/10 group-hover:via-fis-navy/5 group-hover:to-fis-raspberry/10 transition-all duration-500 rounded-xl" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 group-hover:text-fis-navy dark:group-hover:text-fis-raspberry transition-colors">
                        {initiative.name}
                      </h3>
                      
                      {initiative.shortName && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
                          {initiative.shortName}
                        </span>
                      )}

                      {initiative.smartGoal?.statement && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-roobert-light">
                          {initiative.smartGoal.statement}
                        </p>
                      )}

                      {/* Progress Bar - Navy to Raspberry gradient */}
                      {initiative.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-roobert-semibold text-gray-900 dark:text-white">{initiative.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-fis-navy to-fis-raspberry transition-all"
                              style={{ width: `${initiative.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Key Metrics Preview */}
                      {initiative.smartGoal?.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {initiative.smartGoal.measurable.metrics.slice(0, 2).map((metric, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-roobert-medium truncate">
                                {metric.split(':')[0]}
                              </div>
                              <div className="text-sm font-roobert-bold text-gray-900 dark:text-white truncate">
                                {metric.split(':')[1] || metric}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stats Footer */}
                      <div className="flex items-center gap-2 flex-wrap text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-roobert-medium capitalize">
                          {initiative.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                          initiative.status === 'complete' || initiative.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          initiative.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          initiative.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                          initiative.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {initiative.status.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                          initiative.priority === 'high' || initiative.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                          initiative.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {initiative.priority}
                        </span>
                      </div>
                      
                      {/* Owner & Sponsor Footer */}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                        {initiative.owner && (
                          <div className="flex items-center gap-1 font-roobert-medium">
                            <Users className="w-3 h-3" />
                            <span className="font-roobert-semibold text-gray-700 dark:text-gray-300">Owner:</span> {initiative.owner}
                          </div>
                        )}
                        {initiative.sponsor && (
                          <div className="flex items-center gap-1 font-roobert-medium">
                            <span className="font-roobert-semibold text-gray-700 dark:text-gray-300">Sponsor:</span> {initiative.sponsor}
                          </div>
                        )}
                        {(initiative.linkedGoals !== undefined && initiative.linkedGoals.length > 0) || initiative.linkedAssets !== undefined ? (
                          <div className="flex items-center gap-3">
                            {initiative.linkedGoals !== undefined && initiative.linkedGoals.length > 0 && (
                              <span className="font-roobert-medium">
                                {initiative.linkedGoals.length} linked goal{initiative.linkedGoals.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {initiative.linkedAssets !== undefined && (
                              <span className="font-roobert-medium">
                                {initiative.linkedAssets} asset{initiative.linkedAssets !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // List View - Row Tiles
                  <motion.div
                    key={initiative.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      x: 4, 
                      scale: 1.01,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    onClick={() => handleInitiativeClick(initiative.id)}
                    className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/0 via-fis-navy/0 to-fis-raspberry/0 group-hover:from-blue-900/10 group-hover:via-fis-navy/5 group-hover:to-fis-raspberry/10 transition-all duration-500 rounded-xl" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                      {/* Top Row - Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white group-hover:text-fis-navy dark:group-hover:text-fis-raspberry transition-colors">
                            {initiative.name}
                          </h3>
                          {initiative.shortName && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex-shrink-0">
                              {initiative.shortName}
                            </span>
                          )}
                        </div>
                        
                        {initiative.smartGoal?.statement && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-roobert-light mb-3">
                            {initiative.smartGoal.statement}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-roobert-medium capitalize">
                            {initiative.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                            initiative.status === 'complete' || initiative.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            initiative.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            initiative.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                            initiative.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {initiative.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                            initiative.priority === 'high' || initiative.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            initiative.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {initiative.priority}
                          </span>
                          {initiative.owner && (
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-roobert-medium">
                              <Users className="w-3 h-3" />
                              {initiative.owner}
                            </span>
                          )}
                          {initiative.sponsor && (
                            <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-roobert-medium">
                              Sponsor: {initiative.sponsor}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row - Executive Dashboard Data Boxes */}
                      <div className="flex items-center gap-3 flex-wrap border-t border-gray-200 dark:border-gray-700 pt-3">
                        {/* Timeline */}
                        {(initiative.startDate || initiative.endDate) && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 min-w-[140px]">
                            <div className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 mb-1 font-roobert-medium">
                              <Calendar className="w-3 h-3" />
                              Timeline
                            </div>
                            {initiative.startDate && (
                              <div className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">
                                {new Date(initiative.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>
                            )}
                            {initiative.endDate && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                → {new Date(initiative.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Budget */}
                        {initiative.budget?.total && (
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 min-w-[120px]">
                            <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 mb-1 font-roobert-medium">
                              <DollarSign className="w-3 h-3" />
                              Budget
                            </div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                              ${(initiative.budget.total / 1000).toFixed(0)}K
                            </div>
                            {initiative.businessCase?.roi && (
                              <div className="text-[10px] text-green-600 dark:text-green-400 font-roobert-medium">
                                ROI: {initiative.businessCase.roi}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Progress */}
                        {initiative.progress !== undefined && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800 min-w-[130px]">
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 mb-1 font-roobert-medium">Progress</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-fis-navy to-fis-raspberry transition-all"
                                  style={{ width: `${initiative.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">{initiative.progress}%</span>
                            </div>
                          </div>
                        )}

                        {/* Key Metric Highlight */}
                        {initiative.smartGoal?.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800 min-w-[120px]">
                            <div className="text-[10px] text-orange-600 dark:text-orange-400 mb-1 font-roobert-medium truncate">
                              {initiative.smartGoal.measurable.metrics[0].split(':')[0]}
                            </div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white truncate">
                              {initiative.smartGoal.measurable.metrics[0].split(':')[1] || initiative.smartGoal.measurable.metrics[0]}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 min-w-[100px]">
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-roobert-medium">Linked</div>
                          <div className="flex flex-col gap-0.5 text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">
                            {initiative.linkedGoals !== undefined && initiative.linkedGoals.length > 0 && (
                              <div>{initiative.linkedGoals.length} Goal{initiative.linkedGoals.length !== 1 ? 's' : ''}</div>
                            )}
                            {initiative.linkedAssets !== undefined && initiative.linkedAssets > 0 && (
                              <div>{initiative.linkedAssets} Asset{initiative.linkedAssets !== 1 ? 's' : ''}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                No Initiatives Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Strategic initiatives will appear here once they are created.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedInitiative && (
        <ViewInitiativeModal
          initiative={selectedInitiative}
          linkedGoals={linkedGoals}
          onClose={handleCloseModal}
        />
      )}
      </div>
    </div>
  );
}
