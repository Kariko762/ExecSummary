import React, { useState, useRef } from 'react';
import { X, Search, Plus, ChevronRight, ChevronDown, Calendar, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  owner: string;
  ownerInitials: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'delayed' | 'at-risk';
  children?: Task[];
  isExpanded?: boolean;
  description?: string;
}

interface Task {
  id: string;
  name: string;
  owner: string;
  ownerInitials: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on-track' | 'delayed' | 'milestone';
  description?: string;
  dependencies?: string[];
}

interface InitiativesGanttV2Props {
  onClose?: () => void;
}

// Sample data matching the executive specification
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Go-to-Market Readiness & Strategy',
    owner: 'Clare Davidson',
    ownerInitials: 'CD',
    startDate: '2024-04-19',
    endDate: '2024-05-20',
    progress: 45,
    status: 'on-track',
    isExpanded: true,
    description: 'Strategic initiative to align GTM processes',
    children: [
      { id: '1-1', name: 'Sales Team Onboarding Sessions', owner: 'Clare Davidson', ownerInitials: 'CD', startDate: '2024-04-19', endDate: '2024-05-08', progress: 65, status: 'on-track', description: 'Comprehensive onboarding program' },
      { id: '1-2', name: 'GTM Strategy Workshop', owner: 'Brian P.', ownerInitials: 'BP', startDate: '2024-05-20', endDate: '2024-05-20', progress: 0, status: 'milestone', description: 'Executive strategy alignment session' },
    ]
  },
  {
    id: '2',
    name: 'Pipeline Expansion & Optimization',
    owner: 'Nick S.',
    ownerInitials: 'NS',
    startDate: '2024-05-02',
    endDate: '2024-08-03',
    progress: 72,
    status: 'on-track',
    isExpanded: true,
    description: 'Accelerate pipeline growth through marketing',
    children: [
      { id: '2-1', name: 'Expand Inbound Marketing Campaigns', owner: 'Gillian I.', ownerInitials: 'GI', startDate: '2024-05-02', endDate: '2024-08-03', progress: 72, status: 'on-track', description: 'Multi-channel inbound strategy' },
    ]
  },
  {
    id: '3',
    name: 'Product Demo Automation Initiative',
    owner: 'Claire D.',
    ownerInitials: 'CD',
    startDate: '2024-04-10',
    endDate: '2024-05-20',
    progress: 85,
    status: 'delayed',
    isExpanded: true,
    description: 'Automate demo delivery process',
    children: [
      { id: '3-1', name: 'Coast MSA Renewal', owner: 'Claire D.', ownerInitials: 'CD', startDate: '2024-05-10', endDate: '2024-05-20', progress: 40, status: 'delayed', description: 'Master services agreement renewal' },
    ]
  },
  {
    id: '4',
    name: 'Content Enablement & Self-Service',
    owner: 'Driain M.',
    ownerInitials: 'DM',
    startDate: '2024-06-15',
    endDate: '2024-08-06',
    progress: 30,
    status: 'on-track',
    isExpanded: true,
    description: 'Enable self-service content access',
    children: [
      { id: '4-1', name: 'Duxvox Team APIs versioned', owner: 'Tech Team', ownerInitials: 'TT', startDate: '2024-06-15', endDate: '2024-08-06', progress: 30, status: 'on-track', description: 'API versioning and documentation' },
    ]
  },
  {
    id: '5',
    name: 'Executive Summary Platform',
    owner: 'Grady T.',
    ownerInitials: 'GT',
    startDate: '2024-06-09',
    endDate: '2024-08-25',
    progress: 55,
    status: 'on-track',
    isExpanded: true,
    description: 'Modern executive reporting platform',
    children: [
      { id: '5-1', name: 'Data-Driven Distribution Analysis', owner: 'Grady T.', ownerInitials: 'GT', startDate: '2024-06-09', endDate: '2024-08-25', progress: 55, status: 'on-track', description: 'Analytics and distribution insights' },
    ]
  },
  {
    id: '6',
    name: 'Customer Feedback & Iteration',
    owner: 'Anette RC.',
    ownerInitials: 'AR',
    startDate: '2024-07-15',
    endDate: '2024-08-15',
    progress: 20,
    status: 'at-risk',
    isExpanded: false,
    description: 'Customer feedback integration',
    children: [
      { id: '6-1', name: 'Updated H3 page campaign', owner: 'Anette RC.', ownerInitials: 'AR', startDate: '2024-07-15', endDate: '2024-08-15', progress: 20, status: 'on-track', description: 'Homepage refresh campaign' },
    ]
  },
];

export default function InitiativesGanttV2({ onClose }: InitiativesGanttV2Props) {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'quarter'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | Project | null>(null);
  const [hoveredTask, setHoveredTask] = useState<{ task: Task | Project; x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'task' | 'notes'>('task');
  const [loading, setLoading] = useState(true);
  
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // Fetch tasks and initiatives from API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch initiatives first
        const initiativesResponse = await fetch('http://localhost:3001/api/initiatives');
        const initiativesData = await initiativesResponse.json();
        
        // Create initiative lookup map (only published initiatives)
        const initiativeLookup = new Map<string, any>();
        if (initiativesData.initiatives && Array.isArray(initiativesData.initiatives)) {
          initiativesData.initiatives
            .filter((init: any) => init._published) // Only show published initiatives
            .forEach((init: any) => {
              initiativeLookup.set(init.id || init._id, {
                name: init.name || init.title,
                owner: init.owner,
                description: init.description
              });
            });
        }
        
        // Fetch tasks
        const response = await fetch('http://localhost:3001/api/tasks');
        const data = await response.json();
        
        if (data.tasks && Array.isArray(data.tasks)) {
          // Group tasks by initiative (only tasks from published initiatives)
          const initiativeMap = new Map<string, any>();
          
          // Pre-populate map with all published initiatives (even if they have no tasks)
          initiativeLookup.forEach((initiativeInfo, initiativeId) => {
            initiativeMap.set(initiativeId, {
              id: initiativeId,
              name: initiativeInfo.name,
              owner: initiativeInfo.owner || 'Unassigned',
              ownerInitials: ((initiativeInfo.owner || 'U').split(' ').map((n: string) => n[0]).join('')),
              startDate: null,
              endDate: null,
              progress: 0,
              status: 'on-track' as const,
              isExpanded: false,
              description: initiativeInfo.description || initiativeInfo.name,
              children: []
            });
          });
          
          data.tasks.forEach((task: any) => {
            const initiativeId = task.initiativeId || 'general';
            
            // Skip tasks from unpublished initiatives
            if (initiativeId !== 'general' && !initiativeLookup.has(initiativeId)) {
              return;
            }
            
            const initiativeInfo = initiativeLookup.get(initiativeId);
            const initiativeName = initiativeInfo?.name || task.category || 'General Tasks';
            
            if (!initiativeMap.has(initiativeId)) {
              initiativeMap.set(initiativeId, {
                id: initiativeId,
                name: initiativeName,
                owner: initiativeInfo?.owner || task.owner || 'Unassigned',
                ownerInitials: ((initiativeInfo?.owner || task.owner || 'U').split(' ').map((n: string) => n[0]).join('')),
                startDate: task.startDate,
                endDate: task.targetDate || task.endDate,
                progress: 0,
                status: 'on-track' as const,
                isExpanded: false,
                description: initiativeInfo?.description || initiativeName,
                children: []
              });
            }
            
            const initiative = initiativeMap.get(initiativeId);
            if (initiative && task.startDate && (task.targetDate || task.endDate)) {
              initiative.children.push({
                id: task.id || task._id,
                name: task.title || task.name,
                owner: task.owner || 'Unassigned',
                ownerInitials: (task.owner || 'U').split(' ').map((n: string) => n[0]).join(''),
                startDate: task.startDate,
                endDate: task.targetDate || task.endDate,
                progress: task.percentage || task.progress || 0,
                status: task.status === 'complete' ? 'milestone' : task.status === 'at-risk' ? 'delayed' : 'on-track',
                description: task.description,
                dependencies: task.dependencies ? [task.dependencies] : []
              });
              
              // Update initiative dates to encompass all tasks
              if (!initiative.startDate || new Date(task.startDate) < new Date(initiative.startDate)) {
                initiative.startDate = task.startDate;
              }
              const taskEnd = task.targetDate || task.endDate;
              if (!initiative.endDate || new Date(taskEnd) > new Date(initiative.endDate)) {
                initiative.endDate = taskEnd;
              }
              
              // Calculate initiative progress as average
              const totalProgress = initiative.children.reduce((sum: number, t: any) => sum + (t.progress || 0), 0);
              initiative.progress = Math.round(totalProgress / initiative.children.length);
            }
          });
          
          const projectsData = Array.from(initiativeMap.values());
          setProjects(projectsData.length > 0 ? projectsData : sampleProjects);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        // Keep sample data on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate metrics
  const metrics = {
    activeProjects: projects.filter(p => p.status === 'on-track').length,
    delayedProjects: projects.filter(p => p.status === 'delayed' || p.status === 'at-risk').length,
    upcomingMilestones: projects.flatMap(p => p.children || []).filter(t => t.status === 'milestone').length,
  };

  // Synchronized scroll handler
  const handleScroll = (source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    
    if (source === 'left' && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = scrollTop;
    } else if (source === 'right' && leftScrollRef.current) {
      leftScrollRef.current.scrollTop = scrollTop;
    }
  };

  // Calculate timeline weeks starting from 2026 Week 1
  const getWeekColumns = () => {
    const weeks = [];
    
    // Start from 2026-01-06 (Monday of Week 1 in 2026)
    const startDate = new Date('2026-01-06');
    
    // Generate 52 weeks for full year
    let currentDate = new Date(startDate);
    let weekNum = 1;
    
    for (let i = 0; i < 52; i++) {
      const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
      const year = currentDate.getFullYear();
      
      weeks.push({
        weekNum: weekNum.toString(),
        month: `${month} ${year}`,
        label: `W${weekNum}`,
        startDate: new Date(currentDate),
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
      weekNum++;
    }
    
    return weeks;
  };

  const weeks = getWeekColumns();

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const step = 4; // Move by 4 weeks
    if (direction === 'prev') {
      setTimelineOffset(Math.max(0, timelineOffset - step));
    } else {
      setTimelineOffset(Math.min(weeks.length - 21, timelineOffset + step));
    }
  };

  // Get visible weeks
  const visibleWeeks = weeks.slice(timelineOffset, timelineOffset + 21);

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, isExpanded: !p.isExpanded } : p
    ));
  };

  // Calculate task position on timeline
  const getTaskPosition = (task: Task | Project, visibleWeeksArray: any[]) => {
    if (!task || !task.startDate || !task.endDate || visibleWeeksArray.length === 0) return null;
    
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const viewStart = new Date(visibleWeeksArray[0].startDate);
    const viewEnd = new Date(visibleWeeksArray[visibleWeeksArray.length - 1].startDate);
    
    // Calculate position relative to the visible window
    const startCol = Math.floor((taskStart.getTime() - viewStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const endCol = Math.ceil((taskEnd.getTime() - viewStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const span = Math.max(1, endCol - startCol);
    
    // Only return position if task is at least partially visible in current view
    if (taskEnd < viewStart || taskStart > viewEnd) return null;
    
    // Clamp to visible range
    const clampedStart = Math.max(0, startCol);
    const clampedEnd = Math.min(visibleWeeksArray.length, endCol);
    const clampedSpan = clampedEnd - clampedStart;
    
    if (clampedSpan <= 0) return null;
    
    return { start: clampedStart, span: clampedSpan };
  };

  // Get status color (executive muted palette)
  const getStatusColor = (status: string, isProgress = false) => {
    switch (status) {
      case 'on-track':
        return isProgress ? 'bg-[#5EEAD4]/90' : 'bg-[#5EEAD4]/70';
      case 'delayed':
        return isProgress ? 'bg-[#FBBF24]' : 'bg-[#FBBF24]/80';
      case 'at-risk':
        return isProgress ? 'bg-red-400' : 'bg-red-400/80';
      case 'milestone':
        return 'bg-[#A78BFA]';
      default:
        return 'bg-gray-500/70';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-[95vw] h-[95vh] bg-gradient-to-br from-[#1e3a5f] via-[#1a2f4f] to-[#0f172a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-white/5 bg-slate-900/30 backdrop-blur-sm px-8 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-roobert-semibold text-white">Initiatives Timeline</h1>
              <p className="text-sm text-white/60 font-roobert-light mt-1">Track progress across all strategic initiatives</p>
            </div>

            {/* Metrics Strip (Compact) */}
            <div className="flex-1 flex items-center gap-3 px-6">
              {/* Active Projects */}
              <div className="flex-1 bg-[#5EEAD4]/10 border border-[#5EEAD4]/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#5EEAD4]/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-[#5EEAD4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/50 font-roobert-light uppercase tracking-wide">Active Projects</p>
                    <p className="text-xl font-roobert-semibold text-[#5EEAD4]">{metrics.activeProjects}</p>
                  </div>
                </div>
              </div>

              {/* Delayed Projects */}
              <div className="flex-1 bg-[#FBBF24]/10 border border-[#FBBF24]/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#FBBF24]/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/50 font-roobert-light uppercase tracking-wide">Delayed / At Risk</p>
                    <p className="text-xl font-roobert-semibold text-[#FBBF24]">{metrics.delayedProjects}</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className="flex-1 bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#A78BFA]/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/50 font-roobert-light uppercase tracking-wide">Upcoming Milestones</p>
                    <p className="text-xl font-roobert-semibold text-[#A78BFA]">{metrics.upcomingMilestones}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Gantt Container */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT COLUMN: Project List (30-35% width) */}
          <div className="w-[35%] border-r border-white/5 bg-slate-900/20 flex flex-col">
            {/* Column Header */}
            <div className="flex-shrink-0 px-6 border-b border-white/5 bg-slate-900/30 flex items-center" style={{ height: '56px' }}>
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-roobert-semibold text-white/70 uppercase tracking-wide">Project / Task</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => navigateTimeline('prev')}
                    disabled={timelineOffset === 0}
                    className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white/60 rotate-180" />
                  </button>
                  <button 
                    onClick={() => navigateTimeline('next')}
                    disabled={timelineOffset >= weeks.length - 21}
                    className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Project List (Scrollable) */}
            <div 
              ref={leftScrollRef}
              onScroll={handleScroll('left')}
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            >
              {projects.map((project) => (
                <div key={project.id}>
                  {/* Project Row */}
                  <div 
                    className="px-6 border-b border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group flex items-center"
                    style={{ height: '48px' }}
                    onClick={() => {
                      setProjects(prev => prev.map(p => 
                        p.id === project.id ? { ...p, isExpanded: !p.isExpanded } : p
                      ));
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <ChevronRight 
                        className={`w-4 h-4 text-white/60 transition-transform ${project.isExpanded ? 'rotate-90' : ''}`} 
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <p className="text-sm font-roobert-semibold text-white">{project.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'on-track' ? 'bg-[#5EEAD4]/20 text-[#5EEAD4]' :
                          project.status === 'delayed' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {project.status === 'on-track' ? 'On Track' : 
                           project.status === 'delayed' ? 'Delayed' : 'At Risk'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Child Tasks */}
                  {project.isExpanded && project.children?.map((task) => (
                    <div 
                      key={task.id}
                      className="px-6 pl-14 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex items-center"
                      style={{ height: '48px' }}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <p className="text-sm text-white/80 font-roobert-light">{task.name}</p>
                        {task.status === 'milestone' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#A78BFA]/20 text-[#A78BFA]">
                            Milestone
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-roobert-light mt-1 ml-4">{task.owner}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Timeline Grid (65-70% width) */}
          <div className="flex-1 flex flex-col bg-slate-900/10">
            {/* Timeline Grid Container - shared width for header and content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Timeline Header */}
              <div className="flex-shrink-0 border-b border-white/5 bg-slate-900/30 overflow-y-scroll" style={{ height: '56px', scrollbarGutter: 'stable' }}>
                <div className="grid h-full items-center" style={{ gridTemplateColumns: `repeat(${visibleWeeks.length}, 1fr)` }}>
                  {visibleWeeks.map((week, idx) => (
                    <div 
                      key={idx}
                      className="px-1 py-2 text-center border-r border-white/5 last:border-r-0 h-full flex flex-col justify-center"
                    >
                      <div className="text-[10px] font-roobert-medium text-white/70 leading-tight">W{week.weekNum}</div>
                      <div className="text-[10px] text-white/40 font-roobert-light leading-tight mt-0.5">{week.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Grid (Scrollable) */}
              <div 
                ref={rightScrollRef}
                onScroll={handleScroll('right')}
                className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
              {projects.map((project) => (
                <div key={project.id}>
                  {/* Project Bar Row */}
                  <div 
                    className="relative border-b border-white/5 bg-white/5"
                    style={{ height: '48px', display: 'grid', gridTemplateColumns: `repeat(${visibleWeeks.length}, 1fr)` }}
                  >
                    {/* Grid Lines */}
                    {visibleWeeks.map((_, idx) => (
                      <div key={idx} className="border-r border-white/5 last:border-r-0" />
                    ))}
                    
                    {/* Project Bar */}
                    {(() => {
                      const position = getTaskPosition(project, visibleWeeks);
                      if (!position) return null;
                      
                      return (
                        <div
                          className="absolute top-2 h-8 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          style={{
                            left: `${(position.start / visibleWeeks.length) * 100}%`,
                            width: `${(position.span / visibleWeeks.length) * 100}%`,
                          }}
                          onMouseEnter={(e) => setHoveredTask({ task: project, x: e.clientX, y: e.clientY })}
                          onMouseLeave={() => setHoveredTask(null)}
                          onClick={() => setSelectedTask(project)}
                        >
                          <div className={`h-full relative ${getStatusColor(project.status)}`}>
                            {/* Progress Overlay */}
                            <div 
                              className={`absolute inset-0 ${getStatusColor(project.status, true)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                            {/* Text Label */}
                            <div className="absolute inset-0 flex items-center px-3 text-white text-xs font-roobert-medium">
                              {project.progress}%
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Child Task Rows */}
                  {project.isExpanded && project.children?.map((task) => (
                    <div 
                      key={task.id}
                      className="relative border-b border-white/5"
                      style={{ height: '48px', display: 'grid', gridTemplateColumns: `repeat(${visibleWeeks.length}, 1fr)` }}
                    >
                      {/* Grid Lines */}
                      {visibleWeeks.map((_, idx) => (
                        <div key={idx} className="border-r border-white/5 last:border-r-0" />
                      ))}
                      
                      {/* Task Bar */}
                      {(() => {
                        const position = getTaskPosition(task, visibleWeeks);
                        if (!position) return null;
                        
                        return (
                          <div
                            className="absolute top-2 h-6 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              left: `${(position.start / visibleWeeks.length) * 100}%`,
                              width: `${(position.span / visibleWeeks.length) * 100}%`,
                            }}
                            onMouseEnter={(e) => setHoveredTask({ task, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setHoveredTask(null)}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className={`h-full relative ${getStatusColor(task.status)}`}>
                              {task.status !== 'milestone' && (
                                <>
                                  {/* Progress Overlay */}
                                  <div 
                                    className={`absolute inset-0 ${getStatusColor(task.status, true)}`}
                                    style={{ width: `${task.progress}%` }}
                                  />
                                  {/* Text Label */}
                                  <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-roobert-light">
                                    {task.progress}%
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredTask && (
          <div
            className="fixed z-50 bg-slate-900 border border-white/20 rounded-lg shadow-2xl p-4 max-w-sm pointer-events-none"
            style={{ left: hoveredTask.x + 10, top: hoveredTask.y + 10 }}
          >
            <h4 className="text-sm font-roobert-semibold text-white mb-2">{hoveredTask.task.name}</h4>
            <div className="space-y-1 text-xs text-white/70 font-roobert-light">
              <p><span className="text-white/50">Owner:</span> {hoveredTask.task.owner}</p>
              <p><span className="text-white/50">Progress:</span> {hoveredTask.task.progress}%</p>
              <p><span className="text-white/50">Dates:</span> {hoveredTask.task.startDate} → {hoveredTask.task.endDate}</p>
              {hoveredTask.task.description && (
                <p className="pt-2 border-t border-white/10"><span className="text-white/50">Description:</span> {hoveredTask.task.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Side Panel */}
        {(selectedTask || isAddingTask) && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-[500px] bg-slate-900 border-l border-white/20 shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-roobert-semibold text-white">
                  {selectedTask?.name || ''}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedTask(null);
                      setIsEditing(false);
                      setIsAddingTask(false);
                      setEditedTask(null);
                    }} 
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status, Progress, Owner Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">Status</label>
                    <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${
                      selectedTask?.status === 'on-track' ? 'bg-[#5EEAD4]/20 text-[#5EEAD4]' :
                      selectedTask?.status === 'delayed' ? 'bg-[#FBBF24]/20 text-[#FBBF24]' :
                      selectedTask?.status === 'milestone' ? 'bg-[#A78BFA]/20 text-[#A78BFA]' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      {selectedTask?.status === 'on-track' ? 'On Track' : 
                       selectedTask?.status === 'delayed' ? 'Delayed' :
                       selectedTask?.status === 'milestone' ? 'Milestone' : 'At Risk'}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">Progress</label>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-white mb-1">
                        <span className="font-roobert-medium">{selectedTask?.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStatusColor(selectedTask?.status || 'at-risk', true)}`}
                          style={{ width: `${selectedTask?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                {selectedTask && (
                  <div>
                    <p className="text-xs text-white/50 font-roobert-light uppercase tracking-wide">Owner</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 rounded-full bg-fis-eggplant/30 flex items-center justify-center text-white text-sm font-roobert-medium">
                        {selectedTask.ownerInitials}
                      </div>
                      <p className="text-sm text-white">{selectedTask.owner}</p>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">Start Date</label>
                    {selectedTask && (
                      <p className="text-sm text-white mt-1">{selectedTask.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">End Date</label>
                    {selectedTask && (
                      <p className="text-sm text-white mt-1">{selectedTask.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedTask?.description && (
                  <div>
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">Description</label>
                    <p className="mt-1 text-sm text-white/80 font-roobert-light leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {/* Dependencies */}
                {selectedTask && 'dependencies' in selectedTask && selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                  <div>
                    <label className="block text-xs text-white/50 font-roobert-light uppercase tracking-wide mb-2">Dependencies</label>
                    <div className="mt-2 space-y-1">
                      {selectedTask.dependencies.map((dep, idx) => (
                        <div key={idx} className="text-xs text-white/70 font-roobert-light px-2 py-1 bg-white/5 rounded">
                          {dep}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
