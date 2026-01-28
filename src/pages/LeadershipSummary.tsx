import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Maximize2, Minimize2, Download, X, Loader2, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';

// Interfaces for data
interface TimelineNote {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  category?: string;
  noteType?: string[];
  activityType?: string;
  linkType?: string;
  goalId?: string;
  initiativeId?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Complete' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface Initiative {
  id: string;
  name: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Complete' | 'Cancelled';
}

export default function LeadershipSummary() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Data states
  const [demoHoursYTD, setDemoHoursYTD] = useState<number>(0);
  const [pendingAsks, setPendingAsks] = useState<number>(0);
  const [tasksInProgress, setTasksInProgress] = useState<number>(0);
  const [activeInitiatives, setActiveInitiatives] = useState<number>(0);
  const [criticalIssues, setCriticalIssues] = useState<number>(0);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Fetch and calculate metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoadingMetrics(true);

        // Fetch all data in parallel
        const [notesRes, tasksRes, initiativesRes] = await Promise.all([
          fetch('http://localhost:3001/api/notes'),
          fetch('http://localhost:3001/api/tasks'),
          fetch('http://localhost:3001/api/initiatives')
        ]);

        const notes: TimelineNote[] = await notesRes.json();
        const tasks: Task[] = await tasksRes.json();
        const initiatives: Initiative[] = await initiativesRes.json();

        // 1. Demo Hours YTD - from Notes with specific tags and activity types
        const currentYear = new Date().getFullYear();
        const demoNotes = notes.filter(note => {
          const noteDate = new Date(note.date);
          const isCurrentYear = noteDate.getFullYear() === currentYear;
          
          // Check for Demo Performance or KAI tags
          const hasDemoTag = note.tags?.some(tag => 
            tag.toLowerCase().includes('demo performance') || 
            tag.toLowerCase().includes('kai')
          );
          
          // Check for Demo activity types (if activityType field exists)
          const hasDemoActivity = note.activityType && [
            'Demo Preparation',
            'Demo Presentation', 
            'Demo Support'
          ].includes(note.activityType);
          
          return isCurrentYear && (hasDemoTag || hasDemoActivity);
        });
        
        // Assuming each demo note represents 1 hour (adjust logic as needed)
        setDemoHoursYTD(demoNotes.length);

        // 2. Pending Asks - hardcoded for now from summary (can be dynamic later)
        setPendingAsks(3); // This matches the hardcoded "Asks" in the summary

        // 3. Tasks In-Progress
        const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
        setTasksInProgress(inProgressTasks.length);

        // 4. Active Initiatives - Planning or In Progress
        const active = initiatives.filter(init => 
          init.status === 'Planning' || init.status === 'In Progress'
        );
        setActiveInitiatives(active.length);

        // 5. Critical Issues - Critical tasks + risks from summary
        const criticalTasks = tasks.filter(task => task.priority === 'Critical');
        const risksCount = 2; // Hardcoded from DesktopRisksSection (2 risks shown)
        setCriticalIssues(criticalTasks.length + risksCount);

      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleExportImage = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    
    try {
      let targetElement: HTMLElement;
      let originalStyles: any = {};
      
      if (viewMode === 'mobile') {
        // For mobile, capture only the centered content area
        const mobileContent = contentRef.current.querySelector('.flex.flex-col') as HTMLElement;
        if (!mobileContent) {
          throw new Error('Could not find mobile content');
        }
        
        targetElement = mobileContent;
        
        // Store and modify styles for full capture
        originalStyles = {
          overflow: targetElement.style.overflow,
          maxHeight: targetElement.style.maxHeight,
          height: targetElement.style.height,
        };
        
        targetElement.style.overflow = 'visible';
        targetElement.style.maxHeight = 'none';
        targetElement.style.height = 'auto';
        
      } else {
        // Desktop mode - capture entire content
        const scrollableDiv = contentRef.current.querySelector('.overflow-y-auto') as HTMLElement;
        if (!scrollableDiv) {
          throw new Error('Could not find scrollable content');
        }
        
        targetElement = contentRef.current;
        
        originalStyles = {
          containerOverflow: contentRef.current.style.overflow,
          containerMaxHeight: contentRef.current.style.maxHeight,
          containerHeight: contentRef.current.style.height,
          scrollOverflow: scrollableDiv.style.overflow,
          scrollMaxHeight: scrollableDiv.style.maxHeight,
          scrollHeight: scrollableDiv.style.height,
        };
        
        contentRef.current.style.overflow = 'visible';
        contentRef.current.style.maxHeight = 'none';
        contentRef.current.style.height = 'auto';
        scrollableDiv.style.overflow = 'visible';
        scrollableDiv.style.maxHeight = 'none';
        scrollableDiv.style.height = 'auto';
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));

      const captureOptions = {
        scale: 2,
        backgroundColor: '#ffffff',
        width: viewMode === 'mobile' ? 666 : targetElement.scrollWidth,
        height: targetElement.scrollHeight,
      };

      const dataUrl = await domToPng(targetElement, captureOptions);

      // Restore styles
      if (viewMode === 'mobile') {
        targetElement.style.overflow = originalStyles.overflow;
        targetElement.style.maxHeight = originalStyles.maxHeight;
        targetElement.style.height = originalStyles.height;
      } else {
        contentRef.current.style.overflow = originalStyles.containerOverflow;
        contentRef.current.style.maxHeight = originalStyles.containerMaxHeight;
        contentRef.current.style.height = originalStyles.containerHeight;
        const scrollableDiv = contentRef.current.querySelector('.overflow-y-auto') as HTMLElement;
        if (scrollableDiv) {
          scrollableDiv.style.overflow = originalStyles.scrollOverflow;
          scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
          scrollableDiv.style.height = originalStyles.scrollHeight;
        }
      }

      const link = document.createElement('a');
      const fileName = viewMode === 'mobile' 
        ? `leadership-summary-mobile-${new Date().toISOString().split('T')[0]}.png`
        : `leadership-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
        {/* Header with Navy/Raspberry Gradient - Desktop Only */}
        {viewMode === 'desktop' && (
          <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white flex-shrink-0">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="leadership-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                  <pattern id="leadership-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#leadership-grid)" />
                <rect width="100%" height="100%" fill="url(#leadership-lines)" />
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
                    <Target className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5">
                      Leadership Summary
                    </h1>
                    <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                      Weekly executive briefing for Pre-Sales leadership
                    </p>
                  </div>
                </motion.div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('mobile')}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    title="Switch to Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
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

              {/* Summary Stats - Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden 2xl:grid grid-cols-1 md:grid-cols-5 gap-3"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-green-300">
                    {isLoadingMetrics ? '...' : demoHoursYTD}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Demo Hours YTD</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-blue-300">
                    {isLoadingMetrics ? '...' : tasksInProgress}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Tasks In-Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-yellow-300">
                    {isLoadingMetrics ? '...' : activeInitiatives}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Active Initiatives</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-orange-300">
                    {isLoadingMetrics ? '...' : pendingAsks}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Pending Asks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-red-300">
                    {isLoadingMetrics ? '...' : criticalIssues}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Critical Issues</div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {viewMode === 'desktop' ? (
            <div className="relative px-6 py-8">
              <DesktopBLUFSection />
              <DesktopPrioritizationSection />
              <DesktopRisksSection />
              <DesktopLinksSection navigate={navigate} />
            </div>
          ) : (
            <div className="flex flex-col">
              {/* ROW 1: Mobile Controls - Thin row with buttons only */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-end gap-2 flex-shrink-0">
                <button
                  onClick={() => setViewMode('desktop')}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title="Switch to Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={handleExportImage}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title="Export as Image"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
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
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title={isFullscreen ? 'Exit Fullscreen' : modalWidth === 75 ? 'Wider View' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" /> : <Maximize2 className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* ROW 2: Mobile Header - Title & Stats */}
              <div className="bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry flex-shrink-0">
                <div className="max-w-2xl mx-auto px-[50px] py-4">
                  {/* Title Row */}
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-roobert-bold text-white">Leadership Summary</h2>
                  </div>

                  {/* Stats Grid - 4 columns */}
                  <div className="grid grid-cols-4 gap-3">
                    {/* Initiatives */}
                    <div>
                      <div className="text-white/80 text-[10px] font-roobert-medium uppercase mb-1.5 text-center">Initiatives</div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-roobert-bold text-yellow-300 text-center">
                          {isLoadingMetrics ? '...' : activeInitiatives}
                        </div>
                      </div>
                    </div>

                    {/* Asks */}
                    <div>
                      <div className="text-white/80 text-[10px] font-roobert-medium uppercase mb-1.5 text-center">Asks</div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-roobert-bold text-orange-300 text-center">
                          {isLoadingMetrics ? '...' : pendingAsks}
                        </div>
                      </div>
                    </div>

                    {/* Critical */}
                    <div>
                      <div className="text-white/80 text-[10px] font-roobert-medium uppercase mb-1.5 text-center">Critical</div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-roobert-bold text-red-300 text-center">
                          {isLoadingMetrics ? '...' : criticalIssues}
                        </div>
                      </div>
                    </div>

                    {/* Demos */}
                    <div>
                      <div className="text-white/80 text-[10px] font-roobert-medium uppercase mb-1.5 text-center">Demos YTD</div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-lg font-roobert-bold text-purple-300 text-center">
                          {isLoadingMetrics ? '...' : demoHoursYTD}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: BLUF & Prioritization Sections - Scrollable */}
              <div className="flex-1 overflow-y-auto py-4">
                <MobileBLUFSection />
                <MobilePrioritizationSection />
                <MobileRisksSection />
                <MobileLinksSection navigate={navigate} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Risks Section Component
function DesktopRisksSection() {
  return (
    <div className="space-y-3 mt-8">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Risks</h3>
        </div>
      </div>

      {/* Risk Items Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Risk 1 - Coast MSA Renewal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-red)' }}>
                High
              </span>
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                Medium Probability
              </span>
            </div>
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
              Open
            </span>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2">
            Coast MSA Renewal
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-3">
            2026 MSA renewal pending Finance approval. Without renewal, all Banking demo capabilities are at risk of immediate shutdown.
          </p>
          
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Complete loss of Banking product demo platform access</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Mitigation:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Urgent Finance meetings and escalation to CFO if needed</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Owner:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Robert Rossetti / Finance</span>
            </div>
          </div>
        </div>

        {/* Risk 2 - AI Endpoint Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(251, 146, 60, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-orange)' }}>
                Medium
              </span>
              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                Medium Probability
              </span>
            </div>
            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
              Open
            </span>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2">
            AI Endpoint Authentication
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-3">
            Azure OpenAI authentication policies blocking MUFG Credit Assessment endpoint deployment. Network Security Architecture team engagement required.
          </p>
          
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Delays $6M+ MUFG deal and AI demo capabilities</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Mitigation:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Urgent engagement with Network Security Architecture team to resolve policy conflicts</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Owner:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Technical Architecture Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Links Section Component
function DesktopLinksSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-3 mt-8">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Links to Additional Content</h3>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Published Summary */}
        <button
          onClick={() => window.open('/', '_blank')}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-transparent hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--brand-primary)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-roobert-bold text-gray-900 dark:text-white mb-1 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Published Summary
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">
                View the full published executive summary
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Initiatives Page */}
        <button
          onClick={() => navigate('/initiatives')}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-transparent hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-roobert-bold text-gray-900 dark:text-white mb-1 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Initiatives
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">
                View all active and planned initiatives
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Goals Page */}
        <button
          onClick={() => navigate('/goals')}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-transparent hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-600">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-roobert-bold text-gray-900 dark:text-white mb-1 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Goals
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">
                Track progress on strategic goals
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Gantt Chart */}
        <button
          onClick={() => navigate('/initiatives-gantt')}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-transparent hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--brand-secondary)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-roobert-bold text-gray-900 dark:text-white mb-1 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Initiatives Gantt
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">
                Q1 2026 timeline view of all initiatives
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// Desktop BLUF Section Component
function DesktopBLUFSection() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Executive Summary (BLUF)</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. BOTTOM LINE UP FRONT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red, #ef4444)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-red, #ef4444)' }}
              >
                1
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-red, #ef4444)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-red, #ef4444)' }}>
                  Bottom Line Up Front
                </h4>
              </div>
              <div className="text-sm leading-relaxed space-y-1">
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      Kicked off <strong>$6M+ MUFG Demo AI Endpoint Build</strong> (Credit Assessment)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      Successful <strong>CBK Coast demo review</strong> with LoB
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      Request to <strong>deprioritize E6 demo asset access</strong> due to TSYS acquisition
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Demo Asset and Visibility (Banking NA)</strong> High Priority
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Coast MSA Renewal still Pending</strong> with Finance (Robert Rossetti)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Executive Summary Platform</strong> final testing in progress ready for launch
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BACKGROUND */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-tertiary)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--brand-tertiary)' }}
              >
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--brand-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-tertiary)' }}>
                  Background
                </h4>
              </div>
              <div className="text-sm leading-relaxed">
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                      MUFG Credit Assessment strategic deal requiring Azure OpenAI endpoint deployment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                      Demo Asset and Visibility initiative driven by need for status view across Banking NA demo systems, expanding to Capital Markets and Banking
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                      TSYS acquisition driving International Issuing Hub strategy realignment, deprioritizing E6 integration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                      Executive Summary platform completing final testing phase before production deployment
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                      2026 goals and initiatives drafted, awaiting RevOps review and publication
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ASSESSMENT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-blue)' }}
              >
                3
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                  Assessment
                </h4>
              </div>
              <div className="text-sm leading-relaxed space-y-3">
                <div>
                  <p className="font-roobert-semibold text-gray-900 dark:text-white mb-1">1. Strategic Progress:</p>
                  <ul className="space-y-1 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                        Executive Summary platform within <strong>final testing phase</strong> before launch
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-roobert-semibold text-gray-900 dark:text-white mb-1">2. Cross-Team Collaboration:</p>
                  <ul className="space-y-1 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                        <strong>Open Sessions approved</strong> with Sales Growth Office leadership for improved communication
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                        TSYS demo alignment clarified available assets (<strong>TS2, Center Suite, Prime</strong>)
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-roobert-semibold text-gray-900 dark:text-white mb-1">3. Critical Risks:</p>
                  <ul className="space-y-1 ml-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                        <strong>Azure OpenAI authentication misalignment</strong> for MUFG deployment (subscription vs token-based)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                        Coast MSA renewal pending with Finance, impacting <strong>automation roadmap</strong> and $6M+ deal
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RECOMMENDATION */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--brand-primary)' }}
              >
                4
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>
                  Recommendation
                </h4>
              </div>
              <div className="text-sm leading-relaxed">
                <ul className="space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Push forward with Demo Asset Data Collation</strong> and meetings with Pre-Sales Managers
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Urgent engagement with Network Security Architecture Team</strong> on Azure AI authentication policies for MUFG
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Push Finance to respond</strong> on Coast Renewal
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                      <strong>Get Executive Summary Platform deployed by End of Week</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 5. ASKS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-secondary)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--brand-secondary)' }}
              >
                5
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" style={{ color: 'var(--brand-secondary)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-secondary)' }}>
                  Asks
                </h4>
              </div>
              <div className="space-y-2">
                {/* Ask 1: Azure OpenAI Authentication - High Priority */}
                <div 
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                      Azure OpenAI Authentication Decision
                    </p>
                    <span 
                      className="px-2 py-0.5 text-xs font-roobert-bold rounded uppercase whitespace-nowrap"
                      style={{ background: 'var(--accent-red)', color: 'white' }}
                    >
                      High
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light mb-2">
                    Approve exception or remediation path for Azure OpenAI authentication (subscription vs token-based) for MUFG deployment
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">AI Governance / Security</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Jan 28, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Ask 2: Coast MSA Renewal - High Priority */}
                <div 
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                      Coast MSA Renewal Approval
                    </p>
                    <span 
                      className="px-2 py-0.5 text-xs font-roobert-bold rounded uppercase whitespace-nowrap"
                      style={{ background: 'var(--accent-red)', color: 'white' }}
                    >
                      High
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light mb-2">
                    Approve and execute Coast MSA renewal to avoid disruption to demo automation factory
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Procurement / Legal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Feb 1, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Ask 3: IIH Demo Strategy - Medium Priority */}
                <div 
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                      International Issuing Hub Strategy Confirmation
                    </p>
                    <span 
                      className="px-2 py-0.5 text-xs font-roobert-bold rounded uppercase whitespace-nowrap"
                      style={{ background: 'var(--accent-orange)', color: 'white' }}
                    >
                      Medium
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light mb-2">
                    Confirm revised International Issuing Hub demo strategy post-TSYS acquisition (de-prioritize E6, align to TSYS assets)
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">RevOps Leadership</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Feb 5, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Ask 4: Platform Standards Resources - Medium Priority */}
                <div 
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                      Platform Standards Resource Assignment
                    </p>
                    <span 
                      className="px-2 py-0.5 text-xs font-roobert-bold rounded uppercase whitespace-nowrap"
                      style={{ background: 'var(--accent-orange)', color: 'white' }}
                    >
                      Medium
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light mb-2">
                    Assign dedicated stakeholders to support platform standards and asset registry schema definition
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Pre-Sales Leadership</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-roobert-light">Feb 5, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Prioritization Section Component
function DesktopPrioritizationSection() {
  return (
    <div className="space-y-3 mt-8">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Prioritization</h3>
          <span className="text-white/70 text-xs font-roobert-light ml-2">Current Strategic Priorities</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Priority 1 - Demo Asset Visibility */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          
          {/* ROW 1: Priority Number + Title */}
          <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                   style={{ background: 'var(--accent-red)' }}>
                1
              </div>
            </div>
            <div className="flex-1 px-4 py-3">
              <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                Demo Asset Visibility
              </h3>
            </div>
          </div>

          {/* ROW 2: Two Columns */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Column 1: Description + Impact */}
            <div className="space-y-3">
              {/* Description / Why Priority */}
              <div>
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Description / Why It's a Priority
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  Comprehensive status view of all demo assets needed across Banking NA, Capital Markets, and Banking teams. Critical for resource planning and demo delivery.
                </p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-red-800 dark:text-red-300 mb-1">
                  Impact to Sales/Pre-Sales/Revenue
                </h4>
                <p className="text-sm text-red-900 dark:text-red-200 font-roobert-medium">
                  Lack of visibility leads to duplicated efforts, missed opportunities, and inability to scale demo capabilities effectively.
                </p>
              </div>
            </div>

            {/* Column 2: Tags + Milestones */}
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-roobert-bold rounded uppercase">
                  In Progress
                </span>
                <span className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                      style={{ background: 'var(--accent-red)' }}>
                  High Priority
                </span>
                <a href="#" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-roobert-medium rounded hover:bg-purple-200 transition-colors">
                  → Asset Management
                </a>
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-1">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Milestones & Deliverables
                </h4>
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Schedule meetings with Pre-Sales Managers</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Conduct asset data collation sessions</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Deploy asset visibility dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Details */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Owner: Pre-Sales Leadership</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Business Unit: Banking NA / CM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Due: Feb 7, 2026</span>
            </div>
          </div>
        </div>

        {/* Priority 2 - Coast MSA Renewal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          
          {/* ROW 1: Priority Number + Title */}
          <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                   style={{ background: 'var(--accent-red)' }}>
                2
              </div>
            </div>
            <div className="flex-1 px-4 py-3">
              <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                Coast MSA Renewal
              </h3>
            </div>
          </div>

          {/* ROW 2: Two Columns */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Column 1: Description + Impact */}
            <div className="space-y-3">
              {/* Description / Why Priority */}
              <div>
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Description / Why It's a Priority
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  2026 MSA renewal critical for continued access to Tiled Platform and all Banking demo capabilities. Requires Finance approval and expedited processing to avoid service disruption.
                </p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-red-800 dark:text-red-300 mb-1">
                  Impact to Sales/Pre-Sales/Revenue
                </h4>
                <p className="text-sm text-red-900 dark:text-red-200 font-roobert-medium">
                  Without renewal, complete loss of Banking product demonstration capabilities. Unable to support sales pipeline activities.
                </p>
              </div>
            </div>

            {/* Column 2: Tags + Milestones */}
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-roobert-bold rounded uppercase">
                  Pending
                </span>
                <span className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                      style={{ background: 'var(--accent-red)' }}>
                  High Priority
                </span>
                <a href="#" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-roobert-medium rounded hover:bg-purple-200 transition-colors">
                  → Finance Procurement
                </a>
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-1">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Milestones & Deliverables
                </h4>
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Finance review and approval</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Follow-up meetings scheduled</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Contract signed and executed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Details */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Owner: Robert Rossetti</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Business Unit: Capital Markets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Due: Jan 31, 2026</span>
            </div>
          </div>
        </div>

        {/* Priority 3 - MUFG AI Endpoint */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(245, 158, 11, 0.03)' 
             }}>
          
          {/* ROW 1: Priority Number + Title */}
          <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                   style={{ background: 'var(--accent-orange)' }}>
                3
              </div>
            </div>
            <div className="flex-1 px-4 py-3">
              <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                MUFG AI Endpoint
              </h3>
            </div>
          </div>

          {/* ROW 2: Two Columns */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Column 1: Description + Impact */}
            <div className="space-y-3">
              {/* Description / Why Priority */}
              <div>
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Description / Why It's a Priority
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  $6M+ MUFG Credit Assessment Azure OpenAI endpoint deployment blocked by authentication policy conflicts. Urgent engagement needed with Network Security Architecture team.
                </p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-orange-800 dark:text-orange-300 mb-1">
                  Impact to Sales/Pre-Sales/Revenue
                </h4>
                <p className="text-sm text-orange-900 dark:text-orange-200 font-roobert-medium">
                  Delays $6M+ deal and prevents demonstration of AI-powered credit assessment capabilities to key prospect.
                </p>
              </div>
            </div>

            {/* Column 2: Tags + Milestones */}
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-roobert-bold rounded uppercase">
                  Blocked
                </span>
                <span className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                      style={{ background: 'var(--accent-orange)' }}>
                  Medium Priority
                </span>
                <a href="#" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-roobert-medium rounded hover:bg-purple-200 transition-colors">
                  → Azure AI / MUFG
                </a>
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-1">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Milestones & Deliverables
                </h4>
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Network Security Architecture engagement</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Azure authentication policy resolution</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Endpoint deployment completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Details */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Owner: Technical Architecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Business Unit: Banking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Due: Feb 5, 2026</span>
            </div>
          </div>
        </div>
      </div>

        {/* Priority 4 - Weekly Open Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(245, 158, 11, 0.03)' 
             }}>
          
          {/* ROW 1: Priority Number + Title */}
          <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                   style={{ background: 'var(--accent-orange)' }}>
                4
              </div>
            </div>
            <div className="flex-1 px-4 py-3">
              <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                Setup and Communicate Weekly Open Sessions
              </h3>
            </div>
          </div>

          {/* ROW 2: Two Columns */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Column 1: Description + Impact */}
            <div className="space-y-3">
              {/* Description / Why Priority */}
              <div>
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Description / Why It's a Priority
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  Establish regular weekly open sessions for team collaboration, knowledge sharing, and alignment on demo strategies and initiatives across all business units.
                </p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-orange-800 dark:text-orange-300 mb-1">
                  Impact to Sales/Pre-Sales/Revenue
                </h4>
                <p className="text-sm text-orange-900 dark:text-orange-200 font-roobert-medium">
                  Improves cross-team collaboration and ensures consistent messaging and demo best practices across all teams.
                </p>
              </div>
            </div>

            {/* Column 2: Tags + Milestones */}
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-roobert-bold rounded uppercase">
                  In Progress
                </span>
                <span className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                      style={{ background: 'var(--accent-orange)' }}>
                  Medium Priority
                </span>
                <a href="#" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-roobert-medium rounded hover:bg-purple-200 transition-colors">
                  → Team Collaboration
                </a>
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-1">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Milestones & Deliverables
                </h4>
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Schedule weekly session times</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Communicate to all team members</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Launch first session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Details */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Owner: Demo Services Leadership</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Business Unit: All Teams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Due: Feb 3, 2026</span>
            </div>
          </div>
        </div>

        {/* Priority 5 - Executive Summary Platform Deployment */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden" 
             style={{ 
               borderLeftColor: 'var(--accent-green)', 
               backgroundColor: 'rgba(34, 197, 94, 0.03)' 
             }}>
          
          {/* ROW 1: Priority Number + Title */}
          <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                   style={{ background: 'var(--accent-green)' }}>
                5
              </div>
            </div>
            <div className="flex-1 px-4 py-3">
              <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                Executive Summary Platform Deployment
              </h3>
            </div>
          </div>

          {/* ROW 2: Two Columns */}
          <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Column 1: Description + Impact */}
            <div className="space-y-3">
              {/* Description / Why Priority */}
              <div>
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                  Description / Why It's a Priority
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  Complete final testing phase and deploy Executive Summary platform by end of week to enable leadership visibility and streamlined reporting workflows.
                </p>
              </div>

              {/* Impact */}
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-green-800 dark:text-green-300 mb-1">
                  Impact to Sales/Pre-Sales/Revenue
                </h4>
                <p className="text-sm text-green-900 dark:text-green-200 font-roobert-medium">
                  Provides leadership with real-time visibility into demo initiatives, accelerating decision-making and resource allocation.
                </p>
              </div>
            </div>

            {/* Column 2: Tags + Milestones */}
            <div className="space-y-3">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-roobert-bold rounded uppercase">
                  In Progress
                </span>
                <span className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                      style={{ background: 'var(--accent-green)' }}>
                  Low Priority
                </span>
                <a href="#" className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-roobert-medium rounded hover:bg-purple-200 transition-colors">
                  → Platform Launch
                </a>
              </div>

              {/* Milestones */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex-1">
                <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  Milestones & Deliverables
                </h4>
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Final testing completed</p>
                  </div>
                  <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Production deployment</p>
                  </div>
                  <div className="pb-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-medium">Leadership walkthrough sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Details */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Owner: Platform Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Business Unit: Leadership</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-roobert-medium">Due: Jan 31, 2026</span>
            </div>
          </div>
        </div>
      </div>
  );
}

// Mobile Risks Section Component
function MobileRisksSection() {
  return (
    <div className="max-w-2xl mx-auto space-y-3 px-4 mt-6">
      {/* Header */}
      <div 
        className="px-3 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-sm font-roobert-bold text-white">Risks</h3>
        </div>
      </div>

      {/* Risk Items */}
      <div className="space-y-2.5">
        {/* Risk 1 - Coast MSA Renewal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-red)' }}>
                High
              </span>
              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                Medium Probability
              </span>
            </div>
            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
              Open
            </span>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            Coast MSA Renewal
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            2026 MSA renewal pending Finance approval. Without renewal, all Banking demo capabilities are at risk of immediate shutdown.
          </p>
          
          <div className="space-y-1.5">
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Complete loss of Banking product demo platform access</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Mitigation:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Urgent Finance meetings and escalation to CFO if needed</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Owner:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Robert Rossetti / Finance</span>
            </div>
          </div>
        </div>

        {/* Risk 2 - AI Endpoint Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(251, 146, 60, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-orange)' }}>
                Medium
              </span>
              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                Medium Probability
              </span>
            </div>
            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
              Open
            </span>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            AI Endpoint Authentication
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Azure OpenAI authentication policies blocking MUFG Credit Assessment endpoint deployment. Network Security Architecture team engagement required.
          </p>
          
          <div className="space-y-1.5">
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Delays $6M+ MUFG deal and AI demo capabilities</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Mitigation:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Urgent engagement with Network Security Architecture team to resolve policy conflicts</span>
            </div>
            <div className="text-xs">
              <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Owner:</span>
              <span className="ml-1 text-gray-700 dark:text-gray-300">Technical Architecture Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Links Section Component
function MobileLinksSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div 
        className="px-3 py-2 rounded-lg mb-3"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          <h3 className="text-sm font-roobert-bold text-white">Links to Additional Content</h3>
        </div>
      </div>

      {/* Links Stack */}
      <div className="space-y-2">
        {/* Published Summary */}
        <button
          onClick={() => window.open('/', '_blank')}
          className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded" style={{ background: 'var(--brand-primary)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Published Summary
              </h4>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Initiatives */}
        <button
          onClick={() => navigate('/initiatives')}
          className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-blue-600">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Initiatives
              </h4>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Goals */}
        <button
          onClick={() => navigate('/goals')}
          className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-green-600">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Goals
              </h4>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {/* Gantt Chart */}
        <button
          onClick={() => navigate('/initiatives-gantt')}
          className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded" style={{ background: 'var(--brand-secondary)' }}>
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Initiatives Gantt
              </h4>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

// Mobile BLUF Section Component
function MobileBLUFSection() {
  return (
    <div className="max-w-2xl mx-auto space-y-3 px-4">
      {/* Header */}
      <div 
        className="px-3 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-sm font-roobert-bold text-white">Executive Summary (BLUF)</h3>
        </div>
      </div>

      {/* 1. BOTTOM LINE UP FRONT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red, #ef4444)' }}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
              style={{ background: 'var(--accent-red, #ef4444)' }}
            >
              1
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-red, #ef4444)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-xs font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-red, #ef4444)' }}>
                Bottom Line Up Front
              </h4>
            </div>
            <div className="text-xs leading-relaxed space-y-1">
              <ul className="space-y-1 ml-0.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-green-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>$6M+ MUFG AI Endpoint</strong> kicked off
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-green-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>CBK Coast demo</strong> review successful
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-yellow-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>E6 deprioritized</strong> (TSYS acquisition)
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Demo Visibility</strong> (Banking NA) priority
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Coast MSA pending</strong> (Finance)
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Exec Summary</strong> final testing
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BACKGROUND */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-tertiary)' }}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
              style={{ background: 'var(--brand-tertiary)' }}
            >
              2
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--brand-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h4 className="text-xs font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-tertiary)' }}>
                Background
              </h4>
            </div>
            <div className="text-xs leading-relaxed">
              <ul className="space-y-1 ml-0.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    MUFG $6M+ Azure OpenAI deployment
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    Demo visibility initiative (Banking NA → CM/Banking)
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    TSYS acquisition = IIH realignment, E6 deprioritized
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    Exec Summary platform final testing
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    2026 goals drafted, RevOps review pending
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSESSMENT */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
              style={{ background: 'var(--accent-blue)' }}
            >
              3
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
              </svg>
              <h4 className="text-xs font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                Assessment
              </h4>
            </div>
            <div className="text-xs leading-relaxed space-y-2">
              <div>
                <p className="font-roobert-semibold text-gray-900 dark:text-white mb-0.5">Progress:</p>
                <p className="text-gray-700 dark:text-gray-300 font-roobert-light">Exec Summary testing phase</p>
              </div>
              <div>
                <p className="font-roobert-semibold text-gray-900 dark:text-white mb-0.5">Collaboration:</p>
                <p className="text-gray-700 dark:text-gray-300 font-roobert-light">Open Sessions approved, TSYS assets clarified</p>
              </div>
              <div>
                <p className="font-roobert-semibold text-gray-900 dark:text-white mb-0.5">Risks:</p>
                <p className="text-gray-700 dark:text-gray-300 font-roobert-light">Azure auth mismatch, Coast MSA pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECOMMENDATION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
              style={{ background: 'var(--brand-primary)' }}
            >
              4
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--brand-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-xs font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>
                Recommendation
              </h4>
            </div>
            <div className="text-xs leading-relaxed">
              <ul className="space-y-1 ml-0.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Demo Asset Data</strong> + Pre-Sales meetings
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Urgent:</strong> Network Security on Azure auth
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Push Finance</strong> on Coast renewal
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0 text-xs">•</span>
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-light">
                    <strong>Deploy Exec Summary</strong> by EoW
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ASKS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-secondary)' }}>
        <div className="flex gap-2.5">
          <div className="flex-shrink-0">
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
              style={{ background: 'var(--brand-secondary)' }}
            >
              5
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--brand-secondary)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <h4 className="text-xs font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-secondary)' }}>
                Asks
              </h4>
            </div>
            <div className="space-y-1.5">
              {/* Ask 1: Azure OpenAI Auth */}
              <div 
                className="rounded-lg p-2"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">
                    Azure OpenAI Auth
                  </p>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase whitespace-nowrap"
                    style={{ background: 'var(--accent-red)', color: 'white' }}
                  >
                    High
                  </span>
                </div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-roobert-light mb-1">
                  Approve exception for MUFG
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="font-roobert-light">AI Gov / Security</span>
                  <span>•</span>
                  <span className="font-roobert-light">Jan 28</span>
                </div>
              </div>

              {/* Ask 2: Coast MSA */}
              <div 
                className="rounded-lg p-2"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">
                    Coast MSA Renewal
                  </p>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase whitespace-nowrap"
                    style={{ background: 'var(--accent-red)', color: 'white' }}
                  >
                    High
                  </span>
                </div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-roobert-light mb-1">
                  Approve to protect automation
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="font-roobert-light">Procurement / Legal</span>
                  <span>•</span>
                  <span className="font-roobert-light">Feb 1</span>
                </div>
              </div>

              {/* Ask 3: IIH Strategy */}
              <div 
                className="rounded-lg p-2"
                style={{ background: 'rgba(245, 158, 11, 0.1)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">
                    IIH Strategy
                  </p>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase whitespace-nowrap"
                    style={{ background: 'var(--accent-orange)', color: 'white' }}
                  >
                    Med
                  </span>
                </div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-roobert-light mb-1">
                  Confirm post-TSYS alignment
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="font-roobert-light">RevOps</span>
                  <span>•</span>
                  <span className="font-roobert-light">Feb 5</span>
                </div>
              </div>

              {/* Ask 4: Platform Standards Resources */}
              <div 
                className="rounded-lg p-2"
                style={{ background: 'rgba(245, 158, 11, 0.1)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">
                    Platform Standards
                  </p>
                  <span 
                    className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase whitespace-nowrap"
                    style={{ background: 'var(--accent-orange)', color: 'white' }}
                  >
                    Med
                  </span>
                </div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-roobert-light mb-1">
                  Assign stakeholders for schema
                </p>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                  <span className="font-roobert-light">Pre-Sales</span>
                  <span>•</span>
                  <span className="font-roobert-light">Feb 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Prioritization Section Component
function MobilePrioritizationSection() {
  return (
    <div className="max-w-2xl mx-auto space-y-3 px-4 mt-6">
      {/* Header */}
      <div 
        className="px-3 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          </div>
          <h3 className="text-sm font-roobert-bold text-white">Prioritization</h3>
        </div>
      </div>

      {/* Priority Items */}
      <div className="space-y-2.5">
        {/* Priority 1 - HIGH */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-roobert-bold rounded">
              1
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-[10px] font-roobert-bold rounded uppercase">
                In Progress
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-red)' }}>
                High
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            Coast 2026 MSA Renewal
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Budget expires January 2026. Without renewal, LoBs lose access to entire Tiled Platform.
          </p>
          
          <div className="flex items-start gap-1 mb-2 p-1.5 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="text-red-600 dark:text-red-400 text-xs">💥</span>
            <p className="text-xs text-red-800 dark:text-red-300 font-roobert-medium">
              Demo capability shutdown
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="font-roobert-medium">👤 J. Hanscome</span>
            <span className="font-roobert-medium">📅 Jan 31</span>
            <span className="font-roobert-medium">🏢 Cap Markets</span>
          </div>
        </div>

        {/* Priority 2 - HIGH */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-red)', 
               backgroundColor: 'rgba(239, 68, 68, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-roobert-bold rounded">
              2
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
                Blocked
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-red)' }}>
                High
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            E6 Demo Access Agreement
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Legal review required for Banking Ecosphere governance framework.
          </p>
          
          <div className="flex items-start gap-1 mb-2 p-1.5 bg-red-50 dark:bg-red-900/20 rounded">
            <span className="text-red-600 dark:text-red-400 text-xs">💥</span>
            <p className="text-xs text-red-800 dark:text-red-300 font-roobert-medium">
              Blocks Banking demos
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="font-roobert-medium">👤 C. Batteley</span>
            <span className="font-roobert-medium">📅 Feb 7</span>
            <span className="font-roobert-medium">🏢 E6 Banking</span>
          </div>
        </div>

        {/* Priority 3 - MEDIUM */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(245, 158, 11, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-roobert-bold rounded">
              3
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-[10px] font-roobert-bold rounded uppercase">
                On Track
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-orange)' }}>
                Medium
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            2026 Demo Strategy
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Final operating model for demo tools to support CM roadmap.
          </p>
          
          <div className="flex items-start gap-1 mb-2 p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded">
            <span className="text-orange-600 dark:text-orange-400 text-xs">💥</span>
            <p className="text-xs text-orange-800 dark:text-orange-300 font-roobert-medium">
              Delays deployment
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="font-roobert-medium">👤 Robert & Marlo</span>
            <span className="font-roobert-medium">📅 Feb 14</span>
            <span className="font-roobert-medium">🏢 Cap Markets</span>
          </div>
        </div>

        {/* Priority 4 - MEDIUM */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-orange)', 
               backgroundColor: 'rgba(245, 158, 11, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-roobert-bold rounded">
              4
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-[10px] font-roobert-bold rounded uppercase">
                Not Started
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-orange)' }}>
                Medium
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            Vendor Template Rollout
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Deploy new vendor-facing executive summary framework.
          </p>
          
          <div className="flex items-start gap-1 mb-2 p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded">
            <span className="text-orange-600 dark:text-orange-400 text-xs">💥</span>
            <p className="text-xs text-orange-800 dark:text-orange-300 font-roobert-medium">
              Better stakeholder comms
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="font-roobert-medium">👤 Demo Services</span>
            <span className="font-roobert-medium">📅 Feb 28</span>
            <span className="font-roobert-medium">🏢 Pre-Sales</span>
          </div>
        </div>

        {/* Priority 5 - LOW */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4 relative" 
             style={{ 
               borderLeftColor: 'var(--accent-green)', 
               backgroundColor: 'rgba(34, 197, 94, 0.03)' 
             }}>
          <div className="flex items-start justify-between mb-2">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-roobert-bold rounded">
              5
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-[10px] font-roobert-bold rounded uppercase">
                On Track
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: 'var(--accent-green)' }}>
                Low
              </span>
            </div>
          </div>
          
          <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-1.5">
            India TPO Payroll Resolution
          </h4>
          
          <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-2">
            Support team member through payroll dispute resolution.
          </p>
          
          <div className="flex items-start gap-1 mb-2 p-1.5 bg-green-50 dark:bg-green-900/20 rounded">
            <span className="text-green-600 dark:text-green-400 text-xs">💥</span>
            <p className="text-xs text-green-800 dark:text-green-300 font-roobert-medium">
              Team morale/retention
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
            <span className="font-roobert-medium">👤 HR / Mgmt</span>
            <span className="font-roobert-medium">📅 Ongoing</span>
            <span className="font-roobert-medium">🏢 Demo Services</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop Components
function BLUFPoint({ type, text }: { type: 'success' | 'warning' | 'info' | 'critical'; text: string }) {
  const styles = {
    success: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
    warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
    critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
  };
  
  const badges = {
    success: '🟢',
    warning: '🟡',
    info: '🔵',
    critical: '🔴'
  };

  return (
    <div className={`border-l-4 ${styles[type]} p-4 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 mt-0.5">{badges[type]}</span>
        <p className="text-base font-roobert-regular text-gray-900 dark:text-white leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}

function BackgroundItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-blue-600 dark:text-blue-400 mt-1.5 flex-shrink-0">•</span>
      <span className="text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">{text}</span>
    </li>
  );
}

function AssessmentItem({ status, area, finding }: { status: 'positive' | 'concern' | 'neutral' | 'critical'; area: string; finding: string }) {
  const statusColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    concern: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    neutral: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  return (
    <div className="border-l-4 border-l-purple-500 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-r-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
        <h4 className="font-roobert-semibold text-gray-900 dark:text-white">{area}</h4>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">{finding}</p>
    </div>
  );
}

function RecommendationItem({ priority, action, owner, timeline }: { priority: number; action: string; owner: string; timeline: string }) {
  return (
    <div className="flex items-start gap-4 border-l-4 border-l-green-500 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-r-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-roobert-bold text-sm">
        {priority}
      </div>
      <div className="flex-1">
        <p className="font-roobert-medium text-gray-900 dark:text-white mb-2">{action}</p>
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-roobert-semibold">Owner:</span> {owner}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-roobert-semibold">Timeline:</span> {timeline}
          </span>
        </div>
      </div>
    </div>
  );
}

function AskCard({ urgency, title, description, impact }: { urgency: 'high' | 'medium' | 'low'; title: string; description: string; impact: string }) {
  const urgencyColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
    medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
  };

  return (
    <div className={`border-2 ${urgencyColors[urgency]} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-roobert-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-roobert-bold ${urgencyColors[urgency]}`}>
          {urgency.toUpperCase()}
        </span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light mb-3">{description}</p>
      <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded">
        <span className="font-roobert-semibold">Impact:</span> {impact}
      </div>
    </div>
  );
}

// Mobile Components
function MobileBLUFPoint({ type, text }: { type: 'success' | 'warning' | 'info' | 'critical'; text: string }) {
  const badges = {
    success: '🟢',
    warning: '🟡',
    info: '🔵',
    critical: '🔴'
  };

  return (
    <div className="flex items-start gap-2">
      <span className="text-lg flex-shrink-0">{badges[type]}</span>
      <p className="text-sm font-roobert-regular text-gray-900 dark:text-white leading-snug">
        {text}
      </p>
    </div>
  );
}

function MobileBackgroundItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
      <span className="text-gray-700 dark:text-gray-300 font-roobert-light leading-snug">{text}</span>
    </li>
  );
}

function MobileAssessmentItem({ status, area, finding }: { status: 'positive' | 'concern' | 'neutral' | 'critical'; area: string; finding: string }) {
  const statusColors = {
    positive: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    concern: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    neutral: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
  };

  return (
    <div className="border-l-2 border-l-purple-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-r">
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-bold ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
        <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white">{area}</h4>
      </div>
      <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-snug">{finding}</p>
    </div>
  );
}

function MobileRecommendationItem({ priority, action, timeline }: { priority: number; action: string; timeline: string }) {
  return (
    <div className="flex items-start gap-2 border-l-2 border-l-green-500 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-r">
      <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-roobert-bold text-xs">
        {priority}
      </div>
      <div className="flex-1">
        <p className="text-sm font-roobert-medium text-gray-900 dark:text-white mb-1">{action}</p>
        <span className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">{timeline}</span>
      </div>
    </div>
  );
}

function MobileAskCard({ urgency, title, impact }: { urgency: 'high' | 'medium' | 'low'; title: string; impact: string }) {
  const urgencyColors = {
    high: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10',
    medium: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10',
    low: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10'
  };
  
  const badgeColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
  };

  return (
    <div className={`border-2 ${urgencyColors[urgency]} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-bold ${badgeColors[urgency]}`}>
          {urgency.toUpperCase()}
        </span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">{impact}</p>
    </div>
  );
}
