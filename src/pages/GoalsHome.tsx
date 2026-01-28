import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Users, X, Download, Maximize2, Minimize2, Loader2, LayoutGrid, List, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

interface Goal {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  owner: string;
  status: string;
  priority: string;
  progress?: number;
  targetDate?: string;
  smartGoal?: {
    statement: string;
  };
  indicators?: {
    leading: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
    lagging: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
  };
  linkedAssets?: number;
  linkedInitiatives?: number;
  linkedTasks?: number;
  icon?: string;
  color?: string;
}

interface GoalsHomeProps {
  onSelectGoal?: (goal: any) => void;
}

export default function GoalsHome({ onSelectGoal }: GoalsHomeProps) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/goals');
      const data = await response.json();
      
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalClick = async (id: string) => {
    if (onSelectGoal) {
      try {
        const response = await fetch(`http://localhost:3001/api/goals/${id}`);
        const data = await response.json();
        onSelectGoal(data);
      } catch (error) {
        console.error('Failed to fetch goal:', error);
      }
    }
  };

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        quality: 1,
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `strategic-goals-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get grid columns based on modal width
  const _gridCols = isFullscreen || modalWidth === 95 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading strategic goals...</p>
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
      {/* Header Section - Purple/Navy Gradient Background */}
      <div className={`relative bg-gradient-to-br from-purple-900 via-fis-eggplant to-fis-navy overflow-hidden ${isFullscreen ? '' : 'rounded-t-2xl'}`}>
        {/* SVG Target/Goal Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="goal-pattern-header" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Target/Goal patterns */}
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.3" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" className="text-white" strokeWidth="1.5" opacity="0.3" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.3" />
                <circle cx="10" cy="10" r="3" fill="currentColor" className="text-white" opacity="0.2" />
                <circle cx="90" cy="90" r="3" fill="currentColor" className="text-white" opacity="0.2" />
                <path d="M20,80 L30,70 M30,80 L20,70" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.2" />
                <path d="M75,20 L85,10 M85,20 L75,10" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goal-pattern-header)" />
          </svg>
        </div>

        <div className="relative w-full px-4 2xl:px-6 py-4 2xl:py-8">
          <div className="flex items-center justify-between mb-2 2xl:mb-4">
            <div className="flex items-center gap-2 2xl:gap-3">
              <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Target className="w-5 h-5 2xl:w-6 2xl:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5 text-white">
                  Strategic Goals
                </h1>
                <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                  {goals.length} Total Goals • Updated {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Header Controls */}
            <div className="flex items-center gap-2">
              {/* View Toggle Button */}
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
              
              {/* Export Button */}
              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all disabled:opacity-50"
                title="Export to Image"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                )}
              </button>
              
              {/* Width Toggle */}
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
              
              {/* Close Button */}
              <button
                onClick={() => navigate('/')}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title="Close"
              >
                <X className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Statistics Row - Hidden on mobile, visible on 2xl screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden 2xl:grid grid-cols-1 md:grid-cols-5 gap-3"
          >
            {/* High Priority Goals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-orange-300">
                {goals.filter(g => g.priority === 'high' || g.priority === 'critical').length}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">High Priority</div>
            </div>
            
            {/* At Risk Goals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-red-300">
                {goals.filter(g => g.status === 'at-risk' || g.status === 'blocked').length}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">At Risk</div>
            </div>
            
            {/* On Track Goals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-blue-300">
                {goals.filter(g => g.status === 'in-progress' || g.status === 'on-track').length}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">On Track</div>
            </div>
            
            {/* Achieved Goals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-green-300">
                {goals.filter(g => g.status === 'achieved' || g.status === 'complete').length}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Achieved</div>
            </div>
            
            {/* Goals with KPIs */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-purple-300">
                {goals.filter(g => 
                  (g.indicators?.leading && g.indicators.leading.length > 0) || 
                  (g.indicators?.lagging && g.indicators.lagging.length > 0)
                ).length}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">With KPIs</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section - White Background with Subtle Pattern */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {/* SVG Target Pattern Background - Light Grey */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="goal-pattern-content" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Target/Goal patterns */}
                <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" className="text-purple-600" strokeWidth="1.5" opacity="0.4" />
                <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" className="text-purple-600" strokeWidth="1" opacity="0.4" />
                <circle cx="8" cy="8" r="2" fill="currentColor" className="text-purple-600" />
                <circle cx="72" cy="72" r="2" fill="currentColor" className="text-purple-600" />
                <path d="M16,64 L24,56 M24,64 L16,56" stroke="currentColor" className="text-purple-600" strokeWidth="1.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goal-pattern-content)" />
          </svg>
        </div>

        <div className="relative px-6 py-8">
          {goals.length > 0 ? (
            <div className={viewMode === 'grid' ? `grid grid-cols-1 md:grid-cols-2 gap-6 ${
              isFullscreen || modalWidth === 95 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }` : 'flex flex-col gap-4'}>
              {goals.map((goal, index) => (
                viewMode === 'grid' ? (
                  <motion.div
                    key={goal.id}
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
                    onClick={() => handleGoalClick(goal.id)}
                    className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
                  >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 transition-all duration-500 rounded-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {goal.name}
                    </h3>
                    
                    {goal.shortName && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-2">
                        {goal.shortName}
                      </span>
                    )}

                    {goal.smartGoal?.statement && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-roobert-light">
                        {goal.smartGoal.statement}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {goal.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-roobert-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Key Metrics Preview */}
                    {goal.indicators?.leading && goal.indicators.leading.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {goal.indicators.leading.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-roobert-medium truncate">{metric.name}</div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white truncate">
                              {metric.current}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">→ {metric.target}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats Footer */}
                    <div className="flex items-center gap-2 flex-wrap text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-roobert-medium capitalize">
                        {goal.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.status === 'complete' || goal.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        goal.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        goal.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        goal.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.priority === 'high' || goal.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
                    
                    {/* Owner & Linked Items Footer */}
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      {goal.owner && (
                        <span className="flex items-center gap-1 font-roobert-medium">
                          <Users className="w-3 h-3" />
                          {goal.owner}
                        </span>
                      )}
                      <div className="flex items-center gap-3 font-roobert-medium">
                        <span>{goal.linkedInitiatives || 0} Initiative{(goal.linkedInitiatives || 0) !== 1 ? 's' : ''}</span>
                        <span>{goal.linkedTasks || 0} Task{(goal.linkedTasks || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                ) : (
                  // List View - Row Tiles
                  <motion.div
                    key={goal.id}
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
                    onClick={() => handleGoalClick(goal.id)}
                    className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 transition-all duration-500 rounded-xl" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                      {/* Top Row - Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {goal.name}
                          </h3>
                          {goal.shortName && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex-shrink-0">
                              {goal.shortName}
                            </span>
                          )}
                        </div>
                        
                        {goal.smartGoal?.statement && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-roobert-light mb-3">
                            {goal.smartGoal.statement}
                          </p>
                        )}

                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-roobert-medium capitalize">
                            {goal.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                            goal.status === 'complete' || goal.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            goal.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            goal.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                            goal.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {goal.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                            goal.priority === 'high' || goal.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            {goal.priority}
                          </span>
                          {goal.owner && (
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-roobert-medium">
                              <Users className="w-3 h-3" />
                              {goal.owner}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row - Executive Dashboard Data Boxes */}
                      <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex items-center gap-3 flex-wrap flex-1">
                          {/* Target Date Box */}
                          {goal.targetDate && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 min-w-[120px]">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] text-blue-700 dark:text-blue-300 font-roobert-medium">Target</span>
                              </div>
                              <div className="text-sm font-roobert-bold text-blue-900 dark:text-blue-100">
                                {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          )}

                          {/* Leading Indicator Box - Green Section */}
                          {goal.indicators?.leading && goal.indicators.leading.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 min-w-[140px]">
                              <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                                <span className="text-[10px] text-green-700 dark:text-green-300 font-roobert-medium truncate">
                                  {goal.indicators.leading[0].name}
                                </span>
                              </div>
                              <div className="text-sm font-roobert-bold text-green-900 dark:text-green-100 truncate">
                                {goal.indicators.leading[0].current} → {goal.indicators.leading[0].target} {goal.indicators.leading[0].unit}
                              </div>
                            </div>
                          )}

                          {/* Lagging Indicator Box - Orange Section */}
                          {goal.indicators?.lagging && goal.indicators.lagging.length > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 min-w-[120px]">
                              <div className="text-[10px] text-orange-700 dark:text-orange-300 font-roobert-medium mb-1 truncate">
                                {goal.indicators.lagging[0].name}
                              </div>
                              <div className="text-sm font-roobert-bold text-orange-900 dark:text-orange-100 truncate">
                                {goal.indicators.lagging[0].current}/{goal.indicators.lagging[0].target} {goal.indicators.lagging[0].unit}
                              </div>
                            </div>
                          )}

                          {/* Initiatives Count Box */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 min-w-[100px]">
                            <div className="text-[10px] text-purple-700 dark:text-purple-300 font-roobert-medium mb-1">Initiatives</div>
                            <div className="text-sm font-roobert-bold text-purple-900 dark:text-purple-100">
                              {goal.linkedInitiatives || 0}
                            </div>
                          </div>

                          {/* Tasks Count Box */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-w-[90px]">
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 font-roobert-medium mb-1">Tasks</div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                              {goal.linkedTasks || 0}
                            </div>
                          </div>
                        </div>

                        {/* Progress Box - Right Aligned with Fixed Width */}
                        {goal.progress !== undefined && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 w-[180px] flex-shrink-0">
                            <div className="text-[10px] text-purple-700 dark:text-purple-300 font-roobert-medium mb-1">Progress</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-purple-200 dark:bg-purple-800/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-roobert-bold text-purple-900 dark:text-purple-100 whitespace-nowrap">{goal.progress}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                No Goals Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Strategic goals will appear here once they are created.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
