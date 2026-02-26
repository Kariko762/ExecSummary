import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize2, Minimize2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

// API Interfaces
interface Task {
  id: string;
  title: string;
  shortName?: string;
  owner: string;
  businessUnit: string;
  product: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: string;
  priority: string;
  linkType?: 'goal' | 'initiative' | 'general';
  description?: string;
  milestones?: string;
  risks?: string;
  dependencies?: string;
  initiativeId?: string;
}

interface GanttTask {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  status: string;
  progress: number;
  startWeek: number;
  duration: number;
  color: string;
  category: string;
  linkType: 'goal' | 'initiative' | 'general';
  startDate: string;
  targetDate: string;
  description?: string;
  milestones?: string;
  risks?: string;
  dependencies?: string;
}

export default function InitiativesGantt() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [modalSize, setModalSize] = useState<'75' | '95' | 'full'>('95');

  // Modal size classes
  const getModalClasses = () => {
    switch (modalSize) {
      case '75':
        return 'w-[75vw] h-[75vh]';
      case '95':
        return 'w-[95vw] h-[95vh]';
      case 'full':
        return 'w-screen h-screen';
      default:
        return 'w-[95vw] h-[95vh]';
    }
  };

  // Export to PNG
  const handleExportImage = async () => {
    if (!contentRef.current) return;

    try {
      const dataUrl = await domToPng(contentRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `initiatives-gantt-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`${getModalClasses()} bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
      >
        {/* HEADER */}
        <div className="relative flex-shrink-0 px-6 py-4 flex items-center justify-between text-white" style={{
          background: 'linear-gradient(135deg, #581c87 0%, #e91e63 50%, #581c87 100%)',
        }}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gantt-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
                <pattern id="gantt-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gantt-grid)" />
              <rect width="100%" height="100%" fill="url(#gantt-lines)" />
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
            className="absolute top-4 left-20 w-24 h-24 bg-white/5 rounded-full blur-2xl"
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
            className="absolute bottom-4 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"
          />

          {/* Left: Title & Icon */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-roobert-bold text-white">Q1 2026 Strategic Initiatives</h2>
              <p className="text-sm text-white/80 font-roobert-light">Project Timeline & Dependencies</p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Export Button - Icon Only */}
            <button
              onClick={handleExportImage}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              title="Export to PNG"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Cycling Size Button */}
            <button
              onClick={() => {
                if (modalSize === '75') {
                  setModalSize('95');
                } else if (modalSize === '95') {
                  setModalSize('full');
                } else {
                  setModalSize('75');
                }
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              title={modalSize === '75' ? 'Wider View (95%)' : modalSize === '95' ? 'Fullscreen' : 'Exit Fullscreen (75%)'}
            >
              {modalSize === 'full' ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800" ref={contentRef}>
          <div className="p-3">
            {/* Gantt Chart Container */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
              <GanttChartContent />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Initiative Interface
interface Initiative {
  id: string;
  name: string;
  shortName: string;
  status: string;
}

// Gantt Chart Component
function GanttChartContent() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [initiativeMap, setInitiativeMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'quarter' | 'half' | 'year'>('quarter');
  const VISIBLE_WEEKS = viewMode === 'quarter' ? 13 : viewMode === 'half' ? 26 : 52;

  // Fetch initiatives and tasks from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch initiatives first
        const initResponse = await fetch('http://localhost:3001/api/initiatives');
        const initData = await initResponse.json();
        
        if (initData.initiatives && Array.isArray(initData.initiatives)) {
          setInitiatives(initData.initiatives);
          
          // Create lookup map: initiativeId → shortName
          const map = new Map<string, string>();
          initData.initiatives.forEach((init: Initiative) => {
            console.log('Mapping initiative:', init.id, '→', init.shortName);
            map.set(init.id, init.shortName);
          });
          console.log('InitiativeMap created with', map.size, 'entries');
          setInitiativeMap(map);
        }
        
        // Fetch tasks
        const response = await fetch('http://localhost:3001/api/tasks');
        const data = await response.json();
        
        if (data.tasks && Array.isArray(data.tasks)) {
          // Transform API tasks to gantt format
          const ganttTasks = data.tasks
            .filter((task: Task) => task.startDate && task.targetDate) // Only tasks with dates
            .map((task: Task) => transformTaskToGantt(task));
          
          setTasks(ganttTasks);
          
          // Start with all categories collapsed
          setExpandedCategories(new Set());
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save task handler
  const handleSaveTask = async (updatedTask: TaskEditorTask) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (response.ok) {
        // Refresh tasks list
        const fetchData = async () => {
          const response = await fetch('http://localhost:3001/api/tasks');
          const data = await response.json();
          if (data.tasks && Array.isArray(data.tasks)) {
            const ganttTasks = data.tasks
              .filter((task: Task) => task.startDate && task.targetDate)
              .map((task: Task) => transformTaskToGantt(task));
            setTasks(ganttTasks);
          }
        };
        await fetchData();
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // Generate short name from full title
  const generateShortName = (title: string): string => {
    // If title is already short (< 40 chars), use as-is
    if (title.length <= 40) return title;
    
    // Remove common prefixes and simplify
    let cleaned = title
      .replace(/^(Implement|Build|Create|Deploy|Configure|Setup|Update|Migrate|Develop|Design|Integrate|Test|Review|Document|Analyze|Optimize|Enhance|Fix|Add|Remove|Complete|Establish|Enable|Install|Execute|Prepare|Research|Validate|Verify|Define|Plan|Monitor|Manage|Support|Investigate|Assess|Coordinate|Launch|Deliver|Conduct|Perform|Generate|Process|Automate|Streamline|Refactor|Consolidate|Standardize|Modernize|Transform|Upgrade|Maintain|Improve|Expand|Scale|Extend|Customize|Schedule|Track|Measure|Audit|Evaluate|Identify|Resolve|Debug|Troubleshoot|Archive|Backup|Restore|Patch|Release|Publish|Distribute|Communicate|Train|Onboard|Document|Report|Present|Demonstrate)\s+/i, '')
      .replace(/\s+(for|to|in|on|at|with|from|by|of|or|but|the|a|an)\s+/gi, ' ')
      .replace(/\s+and\s+/gi, ' & ');
    
    // Truncate and add ellipsis
    if (cleaned.length > 40) {
      cleaned = cleaned.substring(0, 37) + '...';
    }
    
    return cleaned;
  };

  // Transform API task to gantt task format
  const transformTaskToGantt = (task: Task): GanttTask => {
    const startDate = new Date(task.startDate);
    const targetDate = new Date(task.targetDate);
    const baselineDate = new Date('2026-01-01'); // Q1 2026 starts here
    
    // Calculate week number from baseline
    const weekStart = Math.floor((startDate.getTime() - baselineDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekEnd = Math.floor((targetDate.getTime() - baselineDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const duration = Math.max(1, weekEnd - weekStart);
    
    // Determine color based on status
    let color = '#6b7280'; // Default gray
    let statusKey = 'scheduled';
    
    if (task.status === 'Complete' || task.percentage === 100) {
      color = '#10b981'; // Green
      statusKey = 'complete';
    } else if (task.status === 'On Track' || task.status === 'In Progress') {
      color = '#3b82f6'; // Blue
      statusKey = 'active';
    } else if (task.status === 'At Risk' || task.status === 'Blocked') {
      color = '#ef4444'; // Red
      statusKey = 'at-risk';
    }
    
    // Generate shortName if not provided
    const shortName = task.shortName || generateShortName(task.title);
    
    return {
      id: task.id,
      name: task.title,
      shortName: shortName,
      owner: `${task.owner} (${formatDate(task.startDate)} - ${formatDate(task.targetDate)})`,
      status: statusKey,
      progress: task.percentage || 0,
      startWeek: Math.max(0, weekStart),
      duration,
      color,
      category: task.initiativeId || 'General Tasks',
      linkType: task.linkType || 'general',
      startDate: task.startDate,
      targetDate: task.targetDate,
      description: task.description,
      milestones: task.milestones,
      risks: task.risks,
      dependencies: task.dependencies,
    };
  };

  // Format date to short format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Timeline navigation functions
  const navigateTimelineBackward = () => {
    setTimelineOffset(Math.max(0, timelineOffset - 2)); // Move back 2 weeks
  };

  const navigateTimelineForward = () => {
    const timeline = generateTimeline();
    const totalWeeks = timeline.reduce((sum, month) => sum + month.weeks.length, 0);
    setTimelineOffset(Math.min(totalWeeks - VISIBLE_WEEKS, timelineOffset + 2)); // Move forward 2 weeks
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Generate timeline columns (Full Year 2026 - 52 weeks)
  const generateTimeline = () => {
    const baseDate = new Date('2026-01-01');
    const getWeekStartDate = (weekNum: number) => {
      const weekDate = new Date(baseDate);
      weekDate.setDate(baseDate.getDate() + (weekNum - 1) * 7);
      return `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
    };

    const months = [
      { name: 'JAN', weeks: ['W1', 'W2', 'W3', 'W4', 'W5'], dates: [1, 2, 3, 4, 5].map(getWeekStartDate) },
      { name: 'FEB', weeks: ['W6', 'W7', 'W8', 'W9'], dates: [6, 7, 8, 9].map(getWeekStartDate) },
      { name: 'MAR', weeks: ['W10', 'W11', 'W12', 'W13'], dates: [10, 11, 12, 13].map(getWeekStartDate) },
      { name: 'APR', weeks: ['W14', 'W15', 'W16', 'W17', 'W18'], dates: [14, 15, 16, 17, 18].map(getWeekStartDate) },
      { name: 'MAY', weeks: ['W19', 'W20', 'W21', 'W22'], dates: [19, 20, 21, 22].map(getWeekStartDate) },
      { name: 'JUN', weeks: ['W23', 'W24', 'W25', 'W26', 'W27'], dates: [23, 24, 25, 26, 27].map(getWeekStartDate) },
      { name: 'JUL', weeks: ['W28', 'W29', 'W30', 'W31'], dates: [28, 29, 30, 31].map(getWeekStartDate) },
      { name: 'AUG', weeks: ['W32', 'W33', 'W34', 'W35', 'W36'], dates: [32, 33, 34, 35, 36].map(getWeekStartDate) },
      { name: 'SEP', weeks: ['W37', 'W38', 'W39', 'W40'], dates: [37, 38, 39, 40].map(getWeekStartDate) },
      { name: 'OCT', weeks: ['W41', 'W42', 'W43', 'W44', 'W45'], dates: [41, 42, 43, 44, 45].map(getWeekStartDate) },
      { name: 'NOV', weeks: ['W46', 'W47', 'W48', 'W49'], dates: [46, 47, 48, 49].map(getWeekStartDate) },
      { name: 'DEC', weeks: ['W50', 'W51', 'W52'], dates: [50, 51, 52].map(getWeekStartDate) },
    ];
    return months;
  };

  const timeline = generateTimeline();
  const totalWeeks = timeline.reduce((sum, month) => sum + month.weeks.length, 0);

  // Get RAG status for initiative based on tasks
  const getInitiativeRAG = (initiativeTasks: GanttTask[]): { status: string; color: string; label: string } => {
    if (initiativeTasks.length === 0) return { status: 'gray', color: '#9ca3af', label: 'N/A' };
    
    const atRiskCount = initiativeTasks.filter(t => t.status === 'at-risk').length;
    const completeCount = initiativeTasks.filter(t => t.status === 'complete').length;
    const totalCount = initiativeTasks.length;
    
    // Red: Any at-risk tasks
    if (atRiskCount > 0) return { status: 'red', color: '#ef4444', label: 'At Risk' };
    
    // Green: All complete
    if (completeCount === totalCount) return { status: 'green', color: '#10b981', label: 'Complete' };
    
    // Amber: In progress
    return { status: 'amber', color: '#f59e0b', label: 'On Track' };
  };

  // Group tasks by Initiative
  const groupTasksByCategory = () => {
    // Group by Initiative ID
    const byInitiative: { [initiative: string]: GanttTask[] } = {};
    
    tasks.forEach(task => {
      const initiative = task.category || 'General Tasks';
      if (!byInitiative[initiative]) {
        byInitiative[initiative] = [];
      }
      byInitiative[initiative].push(task);
    });
    
    // Create final grouped structure
    const result: Array<{
      category: string;
      taskCount: number;
      tasks: GanttTask[];
      isSubCategory?: boolean;
      parentCategory?: string;
    }> = [];
    
    // Sort initiatives alphabetically, but keep "General Tasks" last
    const sortedInitiatives = Object.keys(byInitiative).sort((a, b) => {
      if (a === 'General Tasks') return 1;
      if (b === 'General Tasks') return -1;
      return a.localeCompare(b);
    });
    
    sortedInitiatives.forEach(initiative => {
      const initiativeTasks = byInitiative[initiative];
      
      // Add initiative with tasks directly (no nesting)
      result.push({
        category: initiative,
        taskCount: initiativeTasks.length,
        tasks: initiativeTasks,
        isSubCategory: false,
      });
    });
    
    return result;
  };

  const projects = groupTasksByCategory();

  if (loading) {
    return (
      <div className="w-full p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="w-full p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">No tasks found with dates in Q1 2026.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Gantt Chart Grid */}
      <div className="overflow-hidden">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="grid grid-cols-[300px_80px_1fr] border-b border-gray-200 dark:border-gray-700" style={{ borderRadius: '0' }}>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700" style={{ backgroundColor: '#1D1F48' }}>
              <span className="text-xs font-roobert-bold uppercase text-white">Initiatives / Tasks</span>
            </div>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700 text-center" style={{ backgroundColor: '#1D1F48' }}>
              <span className="text-xs font-roobert-bold uppercase text-white">Status</span>
            </div>
            <div className="relative" style={{ backgroundColor: '#1D1F48' }}>
              <div className="grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${VISIBLE_WEEKS}, 1fr)` }}>
              {timeline.slice(0, Math.ceil(timeline.length)).flatMap((month, monthIdx) => 
                month.weeks.map((week, weekIdx) => {
                  const globalWeekIdx = timeline.slice(0, monthIdx).reduce((sum, m) => sum + m.weeks.length, 0) + weekIdx;
                  if (globalWeekIdx < timelineOffset || globalWeekIdx >= timelineOffset + VISIBLE_WEEKS) return null;
                  return (
                    <div
                      key={`${monthIdx}-${weekIdx}`}
                      className="p-2 text-center border-r border-white/10"
                      style={{ backgroundColor: '#1D1F48' }}
                    >
                      {weekIdx === 0 && globalWeekIdx >= timelineOffset && (
                        <div className="text-xs font-roobert-bold text-white mb-1">
                          {month.name}
                        </div>
                      )}
                      <div className="text-[9px] font-roobert-medium text-white/60 mb-0.5">
                        {month.dates[weekIdx]}
                      </div>
                      <div className="text-[10px] font-roobert-medium text-white/80">
                        {week}
                      </div>
                    </div>
                  );
                })
              ).filter(Boolean)}
            </div>
            </div>
          </div>

          {/* Timeline Navigation Row */}
          <div className="grid grid-cols-[300px_80px_1fr] border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <span className="text-[10px] font-roobert-medium text-gray-600 dark:text-gray-400">View:</span>
              <button
                onClick={() => {
                  setViewMode('quarter');
                  setTimelineOffset(0);
                }}
                className={`px-2 py-1 text-[10px] font-roobert-bold rounded transition-colors ${
                  viewMode === 'quarter'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => {
                  setViewMode('half');
                  setTimelineOffset(0);
                }}
                className={`px-2 py-1 text-[10px] font-roobert-bold rounded transition-colors ${
                  viewMode === 'half'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Half Year
              </button>
            </div>
            <div className="border-r border-gray-200 dark:border-gray-700"></div>
            <div className="p-2 flex items-center justify-center gap-2">
              <button
                onClick={navigateTimelineBackward}
                disabled={timelineOffset === 0}
                className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-roobert-medium text-gray-700 dark:text-gray-300"
                title="Previous 2 weeks"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={navigateTimelineForward}
                disabled={timelineOffset >= totalWeeks - VISIBLE_WEEKS}
                className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-roobert-medium text-gray-700 dark:text-gray-300"
                title="Next 2 weeks"
              >
                Next
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Project Rows */}
          {projects.map((project, projectIdx) => (
            <div key={projectIdx}>
              {/* Category Header (BU Level or SubCategory Level) */}
              <div className={`grid grid-cols-[300px_80px_1fr] border-b border-gray-200 dark:border-gray-700`}>
                <button
                  onClick={() => toggleCategory(project.category)}
                  className="flex items-center gap-2 p-2 border-r border-gray-200 dark:border-gray-700 text-left transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#3e428d' }}
                >
                  {project.tasks.length > 0 && (
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform flex-shrink-0 text-white ${
                        expandedCategories.has(project.category) ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                  <span className="text-xs text-white font-roobert-bold">
                    {initiativeMap.get(project.category) || project.category}
                  </span>
                  {project.taskCount > 0 && (
                    <span className="text-sm font-roobert-bold text-white ml-auto px-2 py-0.5 bg-white/20 rounded">
                      {project.taskCount}
                    </span>
                  )}
                </button>
                {/* RAG Status Column */}
                <div className="flex items-center border-r border-gray-200 dark:border-gray-700 px-3 py-2"
                  style={{ backgroundColor: (() => {
                    const rag = getInitiativeRAG(project.tasks);
                    return rag.color;
                  })() }}>
                  <span className="text-[10px] font-roobert-medium text-white">
                    {getInitiativeRAG(project.tasks).label}
                  </span>
                </div>
                {/* Timeline with aggregate bar */}
                <div className="relative bg-white dark:bg-gray-900 h-12">
                  <div className="relative grid overflow-hidden h-full" style={{ gridTemplateColumns: `repeat(${VISIBLE_WEEKS}, 1fr)` }}>
                    {Array.from({ length: VISIBLE_WEEKS }).map((_, idx) => (
                      <div
                        key={idx}
                        className="border-r border-gray-100 dark:border-gray-700 h-full"
                      ></div>
                    ))}
                    {/* Aggregate initiative timeline bar */}
                    {!expandedCategories.has(project.category) && (() => {
                      if (project.tasks.length === 0) return null;
                      const minStart = Math.min(...project.tasks.map(t => t.startWeek));
                      const maxEnd = Math.max(...project.tasks.map(t => t.startWeek + t.duration));
                      const duration = maxEnd - minStart;
                      const avgProgress = Math.round(project.tasks.reduce((sum, t) => sum + t.progress, 0) / project.tasks.length);
                      const allComplete = project.tasks.every(t => t.status === 'complete');
                      
                      if (minStart >= timelineOffset + VISIBLE_WEEKS || maxEnd <= timelineOffset) return null;
                      
                      return (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-5 rounded-md overflow-hidden shadow-sm"
                          style={{
                            left: `calc(${Math.max(0, ((minStart - timelineOffset) / VISIBLE_WEEKS) * 100)}% + 5px)`,
                            width: `calc(${Math.min(
                              ((duration / VISIBLE_WEEKS) * 100),
                              (((maxEnd - timelineOffset) / VISIBLE_WEEKS) * 100)
                            )}% - 10px)`,
                            backgroundColor: allComplete ? '#d1fae5' : 'var(--brand-primary-high-2)',
                            border: allComplete ? '2px solid #059669' : '1px solid var(--brand-primary-high-1)',
                          }}
                        >
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${avgProgress}%`,
                              backgroundColor: allComplete ? '#10b981' : 'var(--brand-primary-high-1)',
                            }}
                          ></div>
                          <span className="absolute inset-y-0 left-0 flex items-center text-[10px] font-roobert-bold text-white pl-5 pointer-events-none">
                            {avgProgress}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              {expandedCategories.has(project.category) &&
                project.tasks.map((task, taskIdx) => (
                  <div
                    key={taskIdx}
                    onClick={() => {
                      setSelectedTask({ ...task, category: project.category });
                    }}
                    className="grid grid-cols-[300px_80px_1fr] border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    {/* Task Info */}
                    <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white mb-1">
                        {task.shortName}
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 font-roobert-light">
                        {task.owner}
                      </div>
                    </div>

                    {/* RAG Status Column */}
                    <div className="flex items-center justify-center border-r border-gray-200 dark:border-gray-700">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: task.color }}
                        title={task.status}
                      />
                    </div>

                    {/* Timeline Bar */}
                    <div className="relative grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${VISIBLE_WEEKS}, 1fr)` }}>
                      {Array.from({ length: VISIBLE_WEEKS }).map((_, idx) => {
                        const globalWeekIdx = timelineOffset + idx;
                        return (
                          <div
                            key={idx}
                            className="border-r border-gray-100 dark:border-gray-700 h-full"
                          ></div>
                        );
                      })}
                      {/* Only render bar if it's in visible range */}
                      {task.startWeek < timelineOffset + VISIBLE_WEEKS && task.startWeek + task.duration > timelineOffset && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-7 rounded-md overflow-hidden shadow-sm"
                          style={{
                            left: `calc(${Math.max(0, ((task.startWeek - timelineOffset) / VISIBLE_WEEKS) * 100)}% + 5px)`,
                            width: `calc(${Math.min(
                              ((task.duration / VISIBLE_WEEKS) * 100),
                              (((task.startWeek + task.duration - timelineOffset) / VISIBLE_WEEKS) * 100)
                            )}% - 10px)`,
                            backgroundColor: task.status === 'complete' 
                              ? '#d1fae5' 
                              : 'var(--brand-primary-high-2)',
                            border: task.status === 'complete'
                              ? '2px solid #059669'
                              : task.status === 'at-risk'
                              ? '2px solid var(--accent-red)'
                              : task.status === 'active'
                              ? '1px solid var(--brand-primary)'
                              : '1px solid #D1D5DB',
                          }}
                        >
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: task.status === 'complete'
                                ? '#10b981'
                                : 'var(--brand-primary-high-1)',
                            }}
                          ></div>
                          <span className="absolute inset-y-0 left-0 flex items-center text-xs font-roobert-bold text-white pl-5 pointer-events-none">
                            {task.progress}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Task Editor Modal */}
      {selectedTask && (
        <TaskEditorModal
          task={selectedTask as unknown as TaskEditorTask}
          onSave={handleSaveTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
