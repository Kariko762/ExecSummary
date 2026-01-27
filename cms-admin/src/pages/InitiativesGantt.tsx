import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize2, Minimize2, ChevronRight, Plus, Edit2, Save, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

// Note Type Constants
const NOTE_TYPE_STATUS = {
  BLOCKER: { id: 'blocker', label: 'Blocker' },
  RISK: { id: 'risk', label: 'Risk' },
  PRIORITY: { id: 'priority', label: 'Priority' },
  HIGHLIGHT: { id: 'highlight', label: 'Highlight' },
  METRIC_UPDATE: { id: 'metric-update', label: 'Metric Update' },
  DEADLINE_DRIVEN: { id: 'deadline-driven', label: 'Deadline Driven' }
};

const NOTE_TYPE_CRO = {
  SALES_PRODUCTIVITY: { id: 'sales-productivity', label: 'Sales Productivity' },
  DEAL_CONVERSION: { id: 'deal-conversion', label: 'Deal Conversion' },
  SALES_CYCLE_DELAYS: { id: 'sales-cycle-delays', label: 'Sales Cycle Delays' },
  PIPELINE_RISK: { id: 'pipeline-risk', label: 'Pipeline Risk' },
  FORECAST_CONFIDENCE: { id: 'forecast-confidence', label: 'Forecast Confidence' },
  CUSTOMER_SAT: { id: 'customer-sat', label: 'Customer Sat' }
};

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

interface InitiativesGanttProps {
  onClose?: () => void;
}

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
  businessUnit?: string;
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

// Initiative Interface
interface Initiative {
  id: string;
  name: string;
  shortName: string;
  status: string;
}

export default function InitiativesGantt({ onClose }: InitiativesGanttProps = {}) {
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
              onClick={() => onClose?.()}
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

// Gantt Chart Component
function GanttChartContent() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'task' | 'notes'>('task');
  const [taskNotes, setTaskNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<any>(null);
  const [noteToEdit, setNoteToEdit] = useState<any>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('');
  const [newNoteTypes, setNewNoteTypes] = useState<string[]>([]);
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [showTypePanel, setShowTypePanel] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [initiativeMap, setInitiativeMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [viewMode, setViewMode] = useState<'quarter' | 'half' | 'year'>('quarter');
  const [groupBy, setGroupBy] = useState<'initiative' | 'businessUnit' | 'endDate'>('initiative');
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
        
        // Fetch tags
        await fetchTags();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tags');
      const data = await response.json();
      if (data.success && data.tags) {
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  // Fetch notes when task is selected and Notes tab is active
  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedTask || activeTab !== 'notes') {
        setTaskNotes([]);
        return;
      }

      try {
        setLoadingNotes(true);
        const response = await fetch(`http://localhost:3001/api/timeline-notes?taskId=${selectedTask.id}`);
        const data = await response.json();
        
        if (data.success && data.notes) {
          // Sort notes by date descending (latest first)
          const sortedNotes = [...data.notes].sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt || 0);
            const dateB = new Date(b.date || b.createdAt || 0);
            return dateB.getTime() - dateA.getTime();
          });
          setTaskNotes(sortedNotes);
        } else {
          setTaskNotes([]);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setTaskNotes([]);
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [selectedTask, activeTab]);

  // Listen for note added events to refresh the notes list
  useEffect(() => {
    const handleNoteAdded = (event: any) => {
      const { taskId } = event.detail || {};
      
      // If the added note is for the currently selected task, refresh
      if (selectedTask && taskId === selectedTask.id) {
        // Refetch notes
        const fetchNotes = async () => {
          try {
            setLoadingNotes(true);
            const response = await fetch(`http://localhost:3001/api/timeline-notes?taskId=${selectedTask.id}`);
            const data = await response.json();
            
            if (data.success && data.notes) {
              setTaskNotes(data.notes);
            }
          } catch (error) {
            console.error('Failed to refresh notes:', error);
          } finally {
            setLoadingNotes(false);
          }
        };
        
        fetchNotes();
      }
    };

    window.addEventListener('noteAdded', handleNoteAdded);
    
    return () => {
      window.removeEventListener('noteAdded', handleNoteAdded);
    };
  }, [selectedTask]);

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
      businessUnit: task.businessUnit,
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

  // Save new note
  const handleSaveNote = async () => {
    if (!newNoteTitle.trim() || !selectedTask) return;

    try {
      const noteData = {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        date: new Date().toISOString().split('T')[0],
        category: 'documentation',
        tag: newNoteTag || undefined,
        noteType: newNoteTypes.length > 0 ? newNoteTypes : undefined,
        linkType: 'initiative',
        initiativeId: selectedTask.category,
        taskId: selectedTask.id
      };

      const response = await fetch('http://localhost:3001/api/timeline-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();
      if (data.success) {
        // Refresh notes - add new note and re-sort
        const updatedNotes = [...taskNotes, data.note].sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setTaskNotes(updatedNotes);
        // Clear form and close modal
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteTag('');
        setNewNoteTypes([]);
        setShowTagPanel(false);
        setShowTypePanel(false);
        setShowAddNoteModal(false);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/timeline-notes/${noteToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTaskNotes(taskNotes.filter(n => n.id !== noteToDelete.id));
        setShowDeleteConfirm(false);
        setNoteToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!newNoteTitle.trim() || !noteToEdit) return;

    try {
      const noteData = {
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        date: noteToEdit.date,
        category: noteToEdit.category || 'documentation',
        tag: newNoteTag || undefined,
        noteType: newNoteTypes.length > 0 ? newNoteTypes : undefined,
        linkType: noteToEdit.linkType,
        initiativeId: noteToEdit.initiativeId,
        taskId: noteToEdit.taskId
      };

      const response = await fetch(`http://localhost:3001/api/timeline-notes/${noteToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      const data = await response.json();
      if (data.success) {
        // Update the note in the list
        const updatedNotes = taskNotes.map(n => 
          n.id === noteToEdit.id ? { ...n, ...data.note } : n
        ).sort((a, b) => {
          const dateA = new Date(a.date || a.createdAt || 0);
          const dateB = new Date(b.date || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setTaskNotes(updatedNotes);
        // Clear form and close modal
        setNewNoteTitle('');
        setNewNoteContent('');
        setNewNoteTag('');
        setNewNoteTypes([]);
        setShowTagPanel(false);
        setShowTypePanel(false);
        setShowEditNoteModal(false);
        setNoteToEdit(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
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

  // Group tasks by selected mode (Initiative, Business Unit, or End Date)
  const groupTasksByCategory = () => {
    const result: Array<{
      category: string;
      taskCount: number;
      tasks: GanttTask[];
      isSubCategory?: boolean;
      parentCategory?: string;
    }> = [];

    if (groupBy === 'initiative') {
      // Group by Initiative ID
      const byInitiative: { [initiative: string]: GanttTask[] } = {};
      
      tasks.forEach(task => {
        const initiative = task.category || 'General Tasks';
        if (!byInitiative[initiative]) {
          byInitiative[initiative] = [];
        }
        byInitiative[initiative].push(task);
      });
      
      // Sort initiatives alphabetically, but keep "General Tasks" last
      const sortedInitiatives = Object.keys(byInitiative).sort((a, b) => {
        if (a === 'General Tasks') return 1;
        if (b === 'General Tasks') return -1;
        return a.localeCompare(b);
      });
      
      sortedInitiatives.forEach(initiative => {
        result.push({
          category: initiative,
          taskCount: byInitiative[initiative].length,
          tasks: byInitiative[initiative],
        });
      });
    } else if (groupBy === 'businessUnit') {
      // Group by Business Unit
      const byBU: { [bu: string]: GanttTask[] } = {};
      
      tasks.forEach(task => {
        // Get business unit(s) from the task (stored in task object after API fetch)
        const taskData = tasks.find(t => t.id === task.id);
        const businessUnits = (taskData as any)?.businessUnit?.split(',').map((bu: string) => bu.trim()) || ['Unassigned'];
        
        businessUnits.forEach((bu: string) => {
          if (!byBU[bu]) {
            byBU[bu] = [];
          }
          byBU[bu].push(task);
        });
      });
      
      // Sort BUs alphabetically, "All" first, "Unassigned" last
      const sortedBUs = Object.keys(byBU).sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        if (a === 'Unassigned') return 1;
        if (b === 'Unassigned') return -1;
        return a.localeCompare(b);
      });
      
      sortedBUs.forEach(bu => {
        result.push({
          category: bu,
          taskCount: byBU[bu].length,
          tasks: byBU[bu],
        });
      });
    } else if (groupBy === 'endDate') {
      // Group by End Date (Month)
      const byMonth: { [month: string]: GanttTask[] } = {};
      
      tasks.forEach(task => {
        const endDate = new Date(task.targetDate);
        const monthKey = `${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;
        
        if (!byMonth[monthKey]) {
          byMonth[monthKey] = [];
        }
        byMonth[monthKey].push(task);
      });
      
      // Sort by date
      const sortedMonths = Object.keys(byMonth).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
      
      sortedMonths.forEach(month => {
        // Sort tasks within each month by target date
        const sortedTasks = byMonth[month].sort((a, b) => {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });
        
        result.push({
          category: month,
          taskCount: byMonth[month].length,
          tasks: sortedTasks,
        });
      });
    }
    
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
    <div className="w-full h-full overflow-y-auto">
      {/* Gantt Chart Grid */}
      <div className="overflow-hidden">
        <div className="min-w-[1200px]">
          {/* Timeline Header */}
          <div className="grid grid-cols-[300px_80px_1fr] border-b border-gray-200 dark:border-gray-700" style={{ borderRadius: '0' }}>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700 flex items-center justify-between" style={{ backgroundColor: '#1D1F48' }}>
              <span className="text-xs font-roobert-bold uppercase text-white">Initiatives / Tasks</span>
              <button
                onClick={() => {
                  setIsAddingTask(true);
                  setIsEditing(true);
                  setEditedTask({
                    id: '',
                    title: '',
                    shortName: '',
                    owner: '',
                    status: 'scheduled',
                    percentage: 0,
                    startDate: '',
                    targetDate: '',
                    description: '',
                    risks: '',
                    dependencies: '',
                    initiativeId: '',
                  });
                  setIsPanelOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-roobert-bold transition-colors"
                title="Add New Task"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
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
              <span className="text-[10px] font-roobert-medium text-gray-600 dark:text-gray-400">Group:</span>
              <button
                onClick={() => setGroupBy('initiative')}
                className={`px-2 py-1 text-[10px] font-roobert-bold rounded transition-colors ${
                  groupBy === 'initiative'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Initiative
              </button>
              <button
                onClick={() => setGroupBy('businessUnit')}
                className={`px-2 py-1 text-[10px] font-roobert-bold rounded transition-colors ${
                  groupBy === 'businessUnit'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Business Unit
              </button>
              <button
                onClick={() => setGroupBy('endDate')}
                className={`px-2 py-1 text-[10px] font-roobert-bold rounded transition-colors ${
                  groupBy === 'endDate'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                End Date
              </button>
            </div>
            <div className="border-r border-gray-200 dark:border-gray-700"></div>
            <div className="p-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
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
                <div className="relative bg-white dark:bg-gray-900 h-10">
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
                      setIsPanelOpen(true);
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

      {/* Slide-out Task Details Panel */}
      {isPanelOpen && selectedTask && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsPanelOpen(false)}
          ></div>

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-1/2 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-pink-900 text-white p-6 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-roobert-bold">{isAddingTask ? 'Add New Task' : isEditing ? 'Edit Task' : 'Task Details'}</h2>
                <div className="flex items-center gap-2">
                  {!isEditing && !isAddingTask && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        // Extract clean owner name without dates and sync progress/percentage fields
                        const cleanOwner = selectedTask.owner?.split(' (')[0] || selectedTask.owner;
                        setEditedTask({
                          ...selectedTask, 
                          owner: cleanOwner,
                          percentage: selectedTask.progress || selectedTask.percentage || 0,
                          progress: selectedTask.progress || selectedTask.percentage || 0,
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-roobert-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Task
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsPanelOpen(false);
                      setIsEditing(false);
                      setIsAddingTask(false);
                      setEditedTask(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('task')}
                  className={`px-4 py-2 text-sm font-roobert-bold rounded-lg transition-colors ${
                    activeTab === 'task'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Task
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-2 text-sm font-roobert-bold rounded-lg transition-colors ${
                    activeTab === 'notes'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Notes
                </button>
                {activeTab === 'notes' && (
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="ml-2 px-4 py-2 text-sm font-roobert-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Note
                  </button>
                )}
              </div>
            </div>

            {/* Panel Content */}
            {activeTab === 'task' && (
            <div className="p-4 space-y-4">
              {/* Task Title */}
              {isEditing || isAddingTask ? (
                <div className="space-y-2">
                  <label className="block text-xs font-roobert-bold uppercase text-gray-500 dark:text-gray-400">Task Name</label>
                  <input
                    type="text"
                    value={editedTask?.title || editedTask?.name || ''}
                    onChange={(e) => setEditedTask({...editedTask, title: e.target.value, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter task name"
                  />
                </div>
              ) : (
                <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white leading-tight">
                    {selectedTask.name || selectedTask.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-roobert-light">
                    {selectedTask.shortName}
                  </p>
                </div>
              )}

              {/* Quick Stats Grid - 3 Columns */}
              {isEditing || isAddingTask ? (
                <div className="grid grid-cols-3 gap-3">
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Status</label>
                    <select
                      value={editedTask?.status || 'scheduled'}
                      onChange={(e) => setEditedTask({...editedTask, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">In Progress</option>
                      <option value="complete">Complete</option>
                      <option value="at-risk">At Risk</option>
                    </select>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedTask?.percentage || 0}
                      onChange={(e) => setEditedTask({...editedTask, percentage: parseInt(e.target.value) || 0, progress: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Initiative */}
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Initiative</label>
                    <select
                      value={editedTask?.initiativeId || ''}
                      onChange={(e) => setEditedTask({...editedTask, initiativeId: e.target.value, category: initiativeMap.get(e.target.value) || 'General Tasks'})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">General Tasks</option>
                      {Array.from(initiativeMap.entries()).map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-3 gap-3">
                {/* Status Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Status</div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-roobert-bold ${
                    selectedTask.status === 'complete' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedTask.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    selectedTask.status === 'at-risk' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {selectedTask.status === 'complete' ? 'Complete' :
                     selectedTask.status === 'active' ? 'In Progress' :
                     selectedTask.status === 'at-risk' ? 'At Risk' :
                     'Scheduled'}
                  </span>
                </div>

                {/* Progress Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Progress</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden"
                         style={{ backgroundColor: selectedTask.color === '#10b981' ? '#d1fae5' : selectedTask.color === '#3b82f6' ? '#dbeafe' : '#fee2e2' }}>
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${selectedTask.progress}%`,
                          backgroundColor: selectedTask.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">
                      {selectedTask.progress}%
                    </span>
                  </div>
                </div>

                {/* Duration Card */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Duration</div>
                  <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                    {selectedTask.duration} weeks
                  </div>
                </div>
              </div>
              )}

              {/* Description */}
              {isEditing || isAddingTask ? (
                <div className="space-y-2">
                  <label className="block text-xs font-roobert-bold uppercase text-gray-500">Description</label>
                  <textarea
                    value={editedTask?.description || ''}
                    onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-light focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Enter task description"
                  />
                </div>
              ) : (
                selectedTask.description && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Description</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>
                )
              )}

              {/* Owner & Business Unit */}
              {isEditing || isAddingTask ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Owner</label>
                    <input
                      type="text"
                      value={editedTask?.owner?.split(' (')[0] || ''}
                      onChange={(e) => setEditedTask({...editedTask, owner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                      placeholder="Task owner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Business Unit</label>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-2 max-h-32 overflow-y-auto">
                      {['All', 'Finance', 'Operations', 'Technology', 'Human Resources', 'Sales', 'Marketing'].map((bu) => {
                        const currentBUs = editedTask?.businessUnit?.split(',').map(b => b.trim()) || [];
                        const isAll = currentBUs.includes('All');
                        const isChecked = bu === 'All' ? isAll : currentBUs.includes(bu);
                        
                        return (
                          <label key={bu} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={bu !== 'All' && isAll}
                              onChange={(e) => {
                                if (bu === 'All') {
                                  setEditedTask({...editedTask, businessUnit: e.target.checked ? 'All' : ''});
                                } else {
                                  let newBUs = currentBUs.filter(b => b !== 'All');
                                  if (e.target.checked) {
                                    newBUs = [...newBUs, bu];
                                  } else {
                                    newBUs = newBUs.filter(b => b !== bu);
                                  }
                                  setEditedTask({...editedTask, businessUnit: newBUs.join(', ')});
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">{bu}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Timeline */}
              {isEditing || isAddingTask ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Start Date</label>
                    <input
                      type="date"
                      value={editedTask?.startDate || ''}
                      onChange={(e) => setEditedTask({...editedTask, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Target Date</label>
                    <input
                      type="date"
                      value={editedTask?.targetDate || ''}
                      onChange={(e) => setEditedTask({...editedTask, targetDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ) : (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-1.5">Owner & Timeline</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                  {(() => {
                    const ownerName = selectedTask.owner?.split(' (')[0] || selectedTask.owner || 'Unassigned';
                    const startDate = selectedTask.startDate ? new Date(selectedTask.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    const endDate = selectedTask.targetDate ? new Date(selectedTask.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    return startDate && endDate ? `${ownerName} (${startDate} - ${endDate})` : ownerName;
                  })()}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>W{selectedTask.startWeek + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>W{selectedTask.startWeek + selectedTask.duration}</span>
                  </div>
                </div>
              </div>
              )}

              {/* Two Column Grid for Risks & Dependencies */}
              {isEditing || isAddingTask ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Risks</label>
                    <textarea
                      value={editedTask?.risks || ''}
                      onChange={(e) => setEditedTask({...editedTask, risks: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-light focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="Identify potential risks"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-roobert-bold uppercase text-gray-500">Dependencies</label>
                    <textarea
                      value={editedTask?.dependencies || ''}
                      onChange={(e) => setEditedTask({...editedTask, dependencies: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-light focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      placeholder="List dependencies"
                    />
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Risks */}
                {selectedTask.risks && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400">Risks</div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedTask.risks}
                    </p>
                  </div>
                )}

                {/* Dependencies */}
                {selectedTask.dependencies && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400">Dependencies</div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedTask.dependencies}
                    </p>
                  </div>
                )}
              </div>
              )}

              {/* Milestones */}
              {!isEditing && !isAddingTask && selectedTask.milestones && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="text-[10px] font-roobert-bold uppercase text-gray-500 dark:text-gray-400 mb-2">Milestones</div>
                  <div className="space-y-1.5">
                    {selectedTask.milestones.split('|').map((milestone: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <svg className="w-3.5 h-3.5 mt-0.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{milestone.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save/Cancel Buttons - Only show in edit mode */}
              {(isEditing || isAddingTask) && (
                <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-end gap-3 -mx-4 -mb-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setIsAddingTask(false);
                      setEditedTask(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-roobert-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      // Save logic here
                      console.log('Saving task:', editedTask);
                      
                      if (isAddingTask) {
                        // POST to create new task
                        try {
                          const response = await fetch('http://localhost:3001/api/tasks', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editedTask),
                          });
                          if (response.ok) {
                            // Refresh tasks
                            const tasksResponse = await fetch('http://localhost:3001/api/tasks');
                            const tasksResponseData = await tasksResponse.json();
                            const tasksArray = Array.isArray(tasksResponseData) ? tasksResponseData : tasksResponseData.tasks || [];
                            const transformedTasks = tasksArray.map(transformTaskToGantt);
                            setTasks(transformedTasks);
                          }
                        } catch (error) {
                          console.error('Error creating task:', error);
                        }
                      } else {
                        // PUT to update existing task
                        try {
                          const response = await fetch(`http://localhost:3001/api/tasks/${editedTask.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editedTask),
                          });
                          if (response.ok) {
                            // Refresh tasks list
                            const tasksResponse = await fetch('http://localhost:3001/api/tasks');
                            const tasksResponseData = await tasksResponse.json();
                            const tasksArray = Array.isArray(tasksResponseData) ? tasksResponseData : tasksResponseData.tasks || [];
                            const transformedTasks = tasksArray.map(transformTaskToGantt);
                            setTasks(transformedTasks);
                          }
                        } catch (error) {
                          console.error('Error updating task:', error);
                        }
                      }
                      
                      setIsEditing(false);
                      setIsAddingTask(false);
                      setIsPanelOpen(false);
                      setEditedTask(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-roobert-bold transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isAddingTask ? 'Create Task' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="p-4">
                {loadingNotes ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p className="font-roobert-medium">Loading notes...</p>
                  </div>
                ) : taskNotes.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <p className="font-roobert-medium">No notes yet</p>
                    <p className="text-sm mt-2">Add notes using the button above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {taskNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 group hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-roobert-semibold text-gray-900 dark:text-white flex-1">
                            {note.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.date).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setNoteToDelete(note);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                                title="Delete note"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setNoteToEdit(note);
                                  setNewNoteTitle(note.title);
                                  setNewNoteContent(note.content || '');
                                  setNewNoteTag(note.tag || '');
                                  setNewNoteTypes(note.noteType || []);
                                  setShowEditNoteModal(true);
                                }}
                                className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded text-purple-600 dark:text-purple-400"
                                title="Edit note"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                          {note.content}
                        </p>
                        {(note.tag || (note.noteType && note.noteType.length > 0)) && (
                          <div className="flex flex-wrap gap-2">
                            {note.tag && (() => {
                              const tag = availableTags.find(t => t.id === note.tag);
                              return tag ? (
                                <span 
                                  className="px-2 py-1 rounded-full text-white text-xs font-roobert-medium" 
                                  style={{ backgroundColor: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              ) : null;
                            })()}
                            {note.noteType && note.noteType.length > 0 && note.noteType.map((typeId: string) => {
                              const statusType = Object.values(NOTE_TYPE_STATUS).find(t => t.id === typeId);
                              const croType = Object.values(NOTE_TYPE_CRO).find(t => t.id === typeId);
                              const noteTypeInfo = statusType || croType;
                              return noteTypeInfo ? (
                                <span
                                  key={typeId}
                                  className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-roobert-medium border border-purple-200 dark:border-purple-800"
                                >
                                  {noteTypeInfo.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                Add Note to Task
              </h3>
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNewNoteTitle('');
                  setNewNoteContent('');
                  setNewNoteTag('');
                  setNewNoteTypes([]);
                  setShowTagPanel(false);
                  setShowTypePanel(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Task:</span>{' '}
                <span className="font-roobert-semibold text-gray-900 dark:text-white">
                  {selectedTask?.name}
                </span>
              </div>

              {/* Selected Tag and Types Display */}
              {(newNoteTag || newNoteTypes.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {newNoteTag && (() => {
                    const tag = availableTags.find(t => t.id === newNoteTag);
                    return tag ? (
                      <span 
                        className="px-3 py-1.5 rounded-full text-white text-xs font-roobert-medium shadow-sm" 
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ) : null;
                  })()}
                  {newNoteTypes.map((typeId) => {
                    const statusType = Object.values(NOTE_TYPE_STATUS).find(t => t.id === typeId);
                    const croType = Object.values(NOTE_TYPE_CRO).find(t => t.id === typeId);
                    const noteTypeInfo = statusType || croType;
                    return noteTypeInfo ? (
                      <span 
                        key={typeId} 
                        className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-pink-900/20 text-purple-700 dark:text-pink-300 border border-purple-200 dark:border-pink-800 text-xs font-roobert-semibold"
                      >
                        {noteTypeInfo.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Note title..."
                  autoFocus
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                  placeholder="Note content..."
                />
              </div>

              {/* Tags & Types Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagPanel(true)}
                  className="bg-purple-600 dark:bg-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-roobert-semibold"
                >
                  Select Tag
                </button>

                <button
                  type="button"
                  onClick={() => setShowTypePanel(true)}
                  className="bg-pink-600 dark:bg-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-roobert-semibold"
                >
                  Select Types
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setNewNoteTag('');
                    setNewNoteTypes([]);
                    setShowTagPanel(false);
                    setShowTypePanel(false);
                  }}
                  className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!newNoteTitle.trim()}
                  className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>

            {/* Tag Selection Nested Modal */}
            {showTagPanel && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-1/2 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      Select Tag
                    </h4>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* Current Tag */}
                    {newNoteTag && (
                      <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">
                          Current Selection
                        </div>
                        {(() => {
                          const tag = availableTags.find(t => t.id === newNoteTag);
                          return tag ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                {tag.name}
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Available Tags */}
                    <div className="space-y-2">
                      <div className="text-sm font-roobert-medium text-gray-600 dark:text-gray-400 mb-2">
                        Available Tags
                      </div>
                      {availableTags.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                          No tags available
                        </div>
                      ) : (
                        availableTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => setNewNoteTag(tag.id)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              newNoteTag === tag.id
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <div className="flex-1">
                                <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                  {tag.name}
                                </div>
                                {tag.description && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {tag.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setNewNoteTag('');
                        setShowTagPanel(false);
                      }}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Type Selection Nested Modal */}
            {showTypePanel && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-1/2 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      Select Note Types
                    </h4>
                    <button
                      onClick={() => setShowTypePanel(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {/* STATUS / URGENCY Section */}
                    <div className="mb-6">
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Status / Urgency
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(NOTE_TYPE_STATUS).map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setNewNoteTypes(prev => 
                                prev.includes(type.id) 
                                  ? prev.filter(t => t !== type.id)
                                  : [...prev, type.id]
                              );
                            }}
                            className={`
                              px-2 py-2 rounded-lg border-2 transition-all duration-200
                              flex items-center justify-center min-w-[90px]
                              ${newNoteTypes.includes(type.id)
                                ? 'bg-purple-600 dark:bg-pink-600 border-purple-600 dark:border-pink-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-pink-400'
                              }
                            `}
                          >
                            <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CRO IMPACT Section */}
                    <div className="mb-6">
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                        CRO Impact
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(NOTE_TYPE_CRO).map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setNewNoteTypes(prev => 
                                prev.includes(type.id) 
                                  ? prev.filter(t => t !== type.id)
                                  : [...prev, type.id]
                              );
                            }}
                            className={`
                              px-2 py-2 rounded-lg border-2 transition-all duration-200
                              flex items-center justify-center min-w-[90px]
                              ${newNoteTypes.includes(type.id)
                                ? 'bg-purple-600 dark:bg-pink-600 border-purple-600 dark:border-pink-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-pink-400'
                              }
                            `}
                          >
                            <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setNewNoteTypes([]);
                        setShowTypePanel(false);
                      }}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowTypePanel(false)}
                      className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && noteToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">
                  Delete Note
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete "<span className="font-roobert-semibold">{noteToDelete.title}</span>"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 text-sm font-roobert-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {showEditNoteModal && noteToEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                Edit Note
              </h3>
              <button
                onClick={() => {
                  setShowEditNoteModal(false);
                  setNoteToEdit(null);
                  setNewNoteTitle('');
                  setNewNoteContent('');
                  setNewNoteTag('');
                  setNewNoteTypes([]);
                  setShowTagPanel(false);
                  setShowTypePanel(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Task:</span>{' '}
                <span className="font-roobert-semibold text-gray-900 dark:text-white">
                  {selectedTask?.name}
                </span>
              </div>

              {/* Selected Tag and Types Display */}
              {(newNoteTag || newNoteTypes.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {newNoteTag && (() => {
                    const tag = availableTags.find(t => t.id === newNoteTag);
                    return tag ? (
                      <span 
                        className="px-3 py-1.5 rounded-full text-white text-xs font-roobert-medium shadow-sm" 
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ) : null;
                  })()}
                  {newNoteTypes.map((typeId) => {
                    const statusType = Object.values(NOTE_TYPE_STATUS).find(t => t.id === typeId);
                    const croType = Object.values(NOTE_TYPE_CRO).find(t => t.id === typeId);
                    const noteTypeInfo = statusType || croType;
                    return noteTypeInfo ? (
                      <span 
                        key={typeId} 
                        className="px-3 py-1.5 rounded-full bg-purple-100 dark:bg-pink-900/20 text-purple-700 dark:text-pink-300 border border-purple-200 dark:border-pink-800 text-xs font-roobert-semibold"
                      >
                        {noteTypeInfo.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder="Note title..."
                  autoFocus
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                  placeholder="Note content..."
                />
              </div>

              {/* Tags & Types Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagPanel(true)}
                  className="bg-purple-600 dark:bg-pink-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-roobert-semibold"
                >
                  Select Tag
                </button>

                <button
                  type="button"
                  onClick={() => setShowTypePanel(true)}
                  className="bg-pink-600 dark:bg-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all text-sm font-roobert-semibold"
                >
                  Select Types
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setNoteToEdit(null);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setNewNoteTag('');
                    setNewNoteTypes([]);
                    setShowTagPanel(false);
                    setShowTypePanel(false);
                  }}
                  className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateNote}
                  disabled={!newNoteTitle.trim()}
                  className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update Note
                </button>
              </div>
            </div>

            {/* Reuse the same Tag and Type panels from Add Note Modal */}
            {/* Tag Selection Nested Modal */}
            {showTagPanel && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-1/2 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      Select Tag
                    </h4>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {newNoteTag && (
                      <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">
                          Current Selection
                        </div>
                        {(() => {
                          const tag = availableTags.find(t => t.id === newNoteTag);
                          return tag ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                {tag.name}
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-sm font-roobert-medium text-gray-600 dark:text-gray-400 mb-2">
                        Available Tags
                      </div>
                      {availableTags.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                          No tags available
                        </div>
                      ) : (
                        availableTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => setNewNoteTag(tag.id)}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              newNoteTag === tag.id
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <div className="flex-1">
                                <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                  {tag.name}
                                </div>
                                {tag.description && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {tag.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setNewNoteTag('');
                        setShowTagPanel(false);
                      }}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Type Selection Nested Modal */}
            {showTypePanel && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 rounded-xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg h-1/2 flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      Select Note Types
                    </h4>
                    <button
                      onClick={() => setShowTypePanel(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="mb-6">
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                        Status / Urgency
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(NOTE_TYPE_STATUS).map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setNewNoteTypes(prev => 
                                prev.includes(type.id) 
                                  ? prev.filter(t => t !== type.id)
                                  : [...prev, type.id]
                              );
                            }}
                            className={`
                              px-2 py-2 rounded-lg border-2 transition-all duration-200
                              flex items-center justify-center min-w-[90px]
                              ${newNoteTypes.includes(type.id)
                                ? 'bg-purple-600 dark:bg-pink-600 border-purple-600 dark:border-pink-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-pink-400'
                              }
                            `}
                          >
                            <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
                        CRO Impact
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(NOTE_TYPE_CRO).map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                              setNewNoteTypes(prev => 
                                prev.includes(type.id) 
                                  ? prev.filter(t => t !== type.id)
                                  : [...prev, type.id]
                              );
                            }}
                            className={`
                              px-2 py-2 rounded-lg border-2 transition-all duration-200
                              flex items-center justify-center min-w-[90px]
                              ${newNoteTypes.includes(type.id)
                                ? 'bg-purple-600 dark:bg-pink-600 border-purple-600 dark:border-pink-600 text-white shadow-lg scale-105'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-pink-400'
                              }
                            `}
                          >
                            <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setNewNoteTypes([]);
                        setShowTypePanel(false);
                      }}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowTypePanel(false)}
                      className="px-4 py-2 text-sm font-roobert-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
