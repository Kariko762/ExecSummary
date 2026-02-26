/**
 * TIMELINE NOTES MANAGER
 * 
 * Date-based notes system with:
 * - 2-week view (default showing 14 days back from today)
 * - Navigate back to 28 days, 56 days, etc.
 * - Week sections with 2-column masonry layout (odd/even notes)
 * - Left sidebar date navigator with scroll-to functionality
 * - Drag notes between days
 * - Duplicate notes to link to other days
 * - Add note defaults to today with changeable date
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronLeft, ChevronRight, Calendar, Copy, GripVertical,
  Trash2, Edit, X, Check, MoreVertical, Circle, CircleDot, Sparkles, ListChecks, ClipboardList, Maximize2, Minimize2
} from 'lucide-react';
import AiWeeklySummaryModal from './AiWeeklySummaryModal';
import { TaskEditorModal } from './TaskEditorModal';

interface TimelineNote {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string YYYY-MM-DD
  category: 'environment-health' | 'data-operations' | 'platform-integration' | 'high-value-deals' | 'poc-trial-support' | 'sales-enablement' | 'expansion-ops' | 'process-automation' | 'capacity-planning' | 'documentation' | 'revenue-at-risk' | 'critical-blocker' | 'strategic-milestone' | 'product-intelligence' | 'key-highlight' | 'goal-progression' | 'big-win' | 'deal-support' | 'new-project' | 'general'; // Old categories for backward compatibility
  tags: string[];
  tag?: string; // Single tag ID for initiative/context tracking
  noteType?: string[]; // Multi-select note types (status/urgency + CRO impact)
  linkType?: 'goal' | 'initiative' | 'task' | 'general'; // What this note links to
  goalId?: string; // Strategic Goal ID
  initiativeId?: string; // Initiative/Project ID
  taskId?: string; // Task ID
  createdAt: string;
  updatedAt: string;
}

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

const ALL_NOTE_TYPES = [...Object.values(NOTE_TYPE_STATUS), ...Object.values(NOTE_TYPE_CRO)];

const NOTE_TYPE_DISPLAY_MAP = Object.fromEntries(
  ALL_NOTE_TYPES.map(type => [type.id, type])
);

interface TaskStep {
  id: string;
  step: string;
  state: 'Pending' | 'Scheduled' | 'In-Progress' | 'Cancelled' | 'Complete';
}

interface Task {
  id: string;
  title: string;
  owner: string;
  team: string;
  businessUnit: string;
  product: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: 'On Track' | 'At Risk' | 'Blocked' | 'Complete';
  budget: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  milestones: string;
  risks: string;
  dependencies: string;
  steps: TaskStep[];
  tags?: string[];
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

interface TimelineNotesManagerProps {
  onClose: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  autoOpenAddModal?: boolean;
}

// Default fallback categories (used if API fails)
const DEFAULT_CATEGORY_CONFIG = {
  'environment-health': { label: 'Environment Health', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  'data-operations': { label: 'Data Operations', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  'platform-integration': { label: 'Platform Integration', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800' },
  'high-value-deals': { label: 'High-Value Deals', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  'poc-trial-support': { label: 'POC/Trial Support', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800' },
  'sales-enablement': { label: 'Sales Enablement', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  'expansion-ops': { label: 'Expansion Ops', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  'process-automation': { label: 'Process Automation', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800' },
  'capacity-planning': { label: 'Capacity Planning', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/20', border: 'border-slate-200 dark:border-slate-800' },
  'documentation': { label: 'Documentation', color: 'text-white/70', bg: 'bg-gray-800/50/20', border: 'border-gray-200 dark:border-gray-800' },
  'revenue-at-risk': { label: 'Revenue at Risk', color: 'text-red-400 hover:text-red-300', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  'critical-blocker': { label: 'Critical Blocker', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  'strategic-milestone': { label: 'Strategic Milestone', color: 'text-fis-eggplant dark:text-fis-raspberry', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  'product-intelligence': { label: 'Product Intelligence', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800' },
  'general': { label: 'General', color: 'text-white/70', bg: 'bg-gray-800/50/20', border: 'border-gray-200 dark:border-gray-800' }
};

export default function TimelineNotesManager({ onClose, showNotification, autoOpenAddModal }: TimelineNotesManagerProps) {
  const [notes, setNotes] = useState<TimelineNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<any[]>([]);
  const [goals, setGoals] = useState<Array<{ id: string; name: string; shortName: string; color: string }>>([]);
  const [initiatives, setInitiatives] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [categoryConfig, setCategoryConfig] = useState<any>(DEFAULT_CATEGORY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [daysBack, setDaysBack] = useState(14); // Start with 2 weeks
  const [showAddModal, setShowAddModal] = useState(autoOpenAddModal || false);
  const [prePopulatedNoteData, setPrePopulatedNoteData] = useState<{ taskId?: string; initiativeId?: string; linkType?: string } | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [editingNote, setEditingNote] = useState<TimelineNote | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedNote, setDraggedNote] = useState<TimelineNote | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [deleteConfirmNote, setDeleteConfirmNote] = useState<TimelineNote | null>(null);
  const [screenSize, setScreenSize] = useState<75 | 95 | 100>(95);

  // Fetch note tags (categories)
  const fetchNoteTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/note-tags');
      const tags = await response.json();
      setNoteTags(tags);

      // Build dynamic category config from tags
      const config: any = {};
      tags.forEach((tag: any) => {
        config[tag.id] = {
          label: tag.name,
          color: `text-${tag.color}-600 dark:text-${tag.color}-400`,
          bg: `bg-${tag.color}-50 dark:bg-${tag.color}-900/20`,
          border: `border-${tag.color}-200 dark:border-${tag.color}-800`
        };
      });
      setCategoryConfig(config);
    } catch (error) {
      console.error('Failed to fetch note tags:', error);
      // Fall back to default config
      setCategoryConfig(DEFAULT_CATEGORY_CONFIG);
    }
  };

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/timeline-notes');
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      showNotification('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      showNotification('error', 'Failed to load tasks');
    }
  };

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tags');
      const data = await response.json();
      if (data.success) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  // Fetch goals from API
  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/goals');
      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  // Fetch initiatives from API
  const fetchInitiatives = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/initiatives');
      const data = await response.json();
      if (data.success) {
        setInitiatives(data.initiatives || []);
      }
    } catch (error) {
      console.error('Failed to fetch initiatives:', error);
    }
  };

  useEffect(() => {
    fetchNoteTags();
    fetchNotes();
    fetchTasks();
    fetchTags();
    fetchGoals();
    fetchInitiatives();
  }, []);

  // Listen for custom event to open New Note modal from Gantt
  useEffect(() => {
    const handleOpenNoteModal = (event: any) => {
      const { taskId, initiativeId, linkType } = event.detail || {};
      
      // Store the pre-populated data
      setPrePopulatedNoteData({ taskId, initiativeId, linkType });
      
      // Open the modal
      setShowAddModal(true);
    };

    window.addEventListener('openNewNoteModal', handleOpenNoteModal);
    
    return () => {
      window.removeEventListener('openNewNoteModal', handleOpenNoteModal);
    };
  }, []);

  // Generate date range (from today back X days)
  const getDateRange = () => {
    const today = new Date();
    const dates: Date[] = [];
    
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    return dates;
  };

  // Refs for scrolling to dates
  const dateRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Scroll to specific date
  const scrollToDate = (dateStr: string) => {
    const element = dateRefs.current[dateStr];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Check if date has notes
  const dateHasNotes = (date: Date) => {
    const dateStr = formatDate(date, 'iso');
    return notes.some(note => note.date === dateStr);
  };

  // Group dates by week (for week headers only)
  const getWeekGroups = () => {
    const dates = getDateRange();
    const weeks: { weekLabel: string; startDate: Date; endDate: Date; weekNotes: TimelineNote[]; weekTasks: Task[] }[] = [];
    
    let currentWeek: Date[] = [];
    let currentWeekStart: Date | null = null;
    let currentWeekEnd: Date | null = null;
    
    dates.forEach((date, index) => {
      if (currentWeek.length === 0) {
        currentWeekStart = date;
      }
      
      currentWeek.push(date);
      
      // End of week (Sunday) or last date
      if (date.getDay() === 0 || index === dates.length - 1) {
        currentWeekEnd = currentWeek[currentWeek.length - 1];
        
        // Get all notes for this week
        // currentWeekStart is the most recent (closest to today)
        // currentWeekEnd is the oldest in this week
        const mostRecentDate = formatDate(currentWeekStart!, 'iso');
        const oldestDate = formatDate(currentWeekEnd, 'iso');
        const weekNotes = notes.filter(note => note.date >= oldestDate && note.date <= mostRecentDate);
        const weekTasks = tasks.filter(task => 
          (task.startDate >= oldestDate && task.startDate <= mostRecentDate) ||
          (task.targetDate && task.targetDate >= oldestDate && task.targetDate <= mostRecentDate)
        );
        
        weeks.push({
          weekLabel: `Week of ${formatDate(currentWeekEnd, 'short')} - ${formatDate(currentWeekStart!, 'short')}`,
          startDate: currentWeekStart!,
          endDate: currentWeekEnd,
          weekNotes: weekNotes.sort((a, b) => b.date.localeCompare(a.date)), // Sort by date descending
          weekTasks: weekTasks.sort((a, b) => b.startDate.localeCompare(a.startDate))
        });
        currentWeek = [];
        currentWeekStart = null;
      }
    });
    
    return weeks;
  };

  // Format date
  const formatDate = (date: Date, format: 'full' | 'short' | 'iso' = 'full') => {
    if (format === 'iso') {
      return date.toISOString().split('T')[0];
    }
    if (format === 'short') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get notes for a specific date
  const getNotesForDate = (date: Date) => {
    const dateStr = formatDate(date, 'iso');
    return notes.filter(note => note.date === dateStr);
  };

  // Add note
  const handleAddNote = async (note: Omit<TimelineNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/timeline-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      
      const data = await response.json();
      if (data.success) {
        setNotes([...notes, data.note]);
        showNotification('success', 'Note added successfully');
        setShowAddModal(false);
        setPrePopulatedNoteData(null); // Clear pre-populated data
        
        // Notify Gantt to refresh notes if the note is linked to a task
        if (note.taskId) {
          window.dispatchEvent(new CustomEvent('noteAdded', { detail: { taskId: note.taskId } }));
        }
      }
    } catch (error) {
      console.error('Failed to add note:', error);
      showNotification('error', 'Failed to add note');
    }
  };

  // Update note
  const handleUpdateNote = async (note: TimelineNote) => {
    try {
      const response = await fetch(`http://localhost:3001/api/timeline-notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      
      const data = await response.json();
      if (data.success) {
        setNotes(notes.map(n => n.id === note.id ? data.note : n));
        showNotification('success', 'Note updated successfully');
        setEditingNote(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      showNotification('error', 'Failed to update note');
    }
  };

  // Add task
  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      
      const data = await response.json();
      if (data.success) {
        setTasks([...tasks, data.task]);
        showNotification('success', 'Task created successfully');
        setShowAddTaskModal(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      showNotification('error', 'Failed to create task');
    }
  };

  // Update task
  const handleUpdateTask = async (task: Task) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      
      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(t => t.id === task.id ? data.task : t));
        showNotification('success', 'Task updated successfully');
        setEditingTask(null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      showNotification('error', 'Failed to update task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setTasks(tasks.filter(t => t.id !== taskId));
        showNotification('success', 'Task deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      showNotification('error', 'Failed to delete task');
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/timeline-notes/${noteId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setNotes(notes.filter(n => n.id !== noteId));
        setDeleteConfirmNote(null);
        showNotification('success', 'Note deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      showNotification('error', 'Failed to delete note');
    }
  };

  // Duplicate note to another date
  const handleDuplicateNote = async (note: TimelineNote, targetDate: string) => {
    try {
      const duplicatedNote = {
        ...note,
        id: undefined,
        date: targetDate,
        createdAt: undefined,
        updatedAt: undefined
      };
      
      await handleAddNote(duplicatedNote);
    } catch (error) {
      console.error('Failed to duplicate note:', error);
      showNotification('error', 'Failed to duplicate note');
    }
  };

  // Drag handlers
  const handleDragStart = (note: TimelineNote) => {
    setDraggedNote(note);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    
    if (draggedNote && draggedNote.date !== targetDate) {
      const updatedNote = { ...draggedNote, date: targetDate };
      await handleUpdateNote(updatedNote);
    }
    
    setDraggedNote(null);
    setDragOverDate(null);
  };

  // Navigate timeline
  const handleShowMore = () => {
    setDaysBack(prev => prev + 14); // Add 2 more weeks
  };

  const handleShowLess = () => {
    setDaysBack(prev => Math.max(14, prev - 14)); // Minimum 2 weeks
  };

  const weeks = getWeekGroups();
  const today = formatDate(new Date(), 'iso');

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`bg-gray-900/95 backdrop-blur-sm border border-white/10 shadow-2xl w-full flex flex-col ${
        screenSize === 75 ? 'max-w-6xl h-[90vh] rounded-xl' : 
        screenSize === 95 ? 'max-w-[95vw] h-[90vh] rounded-xl' : 
        'max-w-full h-screen rounded-none'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-900 to-gray-900">
          <div>
            <h2 className="text-2xl font-roobert-bold text-white">
              Timeline Notes
            </h2>
            <p className="text-sm text-white/70 mt-1">
              Showing {daysBack} days ({Math.ceil(daysBack / 7)} weeks)
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Cycling Size Button */}
            <button
              onClick={() => {
                if (screenSize === 75) {
                  setScreenSize(95);
                } else if (screenSize === 95) {
                  setScreenSize(100);
                } else {
                  setScreenSize(75);
                }
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
              title={screenSize === 75 ? 'Wider View (95%)' : screenSize === 95 ? 'Fullscreen (100%)' : 'Exit Fullscreen (75%)'}
            >
              {screenSize === 100 ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShowLess}
                disabled={daysBack === 14}
                className="p-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-roobert-medium text-white/90 px-2">
                {daysBack} days
              </span>
              <button
                onClick={handleShowMore}
                className="p-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* AI Weekly Summary */}
            <button
              onClick={() => setShowAiSummary(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-roobert-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-5 h-5" />
              AI: Weekly Summary
            </button>

            {/* Add Note */}
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm"
              title="Add Note"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Timeline Content - Sidebar + Main */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Date Navigator */}
          <div className="w-32 border-r border-white/10 bg-white/5 overflow-y-auto">
            <div className="p-3 space-y-1">
              {getDateRange().map((date) => {
                const dateStr = formatDate(date, 'iso');
                const hasNotes = dateHasNotes(date);
                const isToday = dateStr === today;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => scrollToDate(dateStr)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                      isToday
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : hasNotes
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-white/5 text-white/50'
                    }`}
                  >
                    {hasNotes ? (
                      <CircleDot className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-roobert-semibold">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content - 2-Column Masonry by Week */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="mb-8">
                {/* Week Header */}
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-roobert-bold text-white">
                    {week.weekLabel}
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                  <span className="text-sm text-white/70">
                    {week.weekNotes.length} {week.weekNotes.length === 1 ? 'note' : 'notes'}
                  </span>
                </div>

                {/* 2-Column Masonry Layout */}
                {(() => {
                  // Only show notes, not tasks
                  const mergedItems = [
                    ...week.weekNotes.map(note => ({ type: 'note' as const, date: note.date, item: note }))
                  ].sort((a, b) => b.date.localeCompare(a.date));

                  return mergedItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column - Odd items (1st, 3rd, 5th...) */}
                      <div className="space-y-4">
                        {mergedItems
                          .filter((_, index) => index % 2 === 0)
                          .map((item, idx) => (
                            item.type === 'note' ? (
                              <NoteCard
                                key={`note-${item.item.id}`}
                                note={item.item}
                                dateRefs={dateRefs}
                                today={today}
                                draggedNote={draggedNote}
                                availableTags={tags}
                                categoryConfig={categoryConfig}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onEdit={setEditingNote}
                                onDelete={setDeleteConfirmNote}
                              />
                            ) : (
                              <div
                                key={`task-${item.item.id}`}
                                className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-lg shadow-md border-l-4 border-blue-500 dark:border-blue-400 p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                onClick={() => setEditingTask(item.item)}
                              >
                                {/* Task Header with Icon */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.item.title}</h3>
                                    <p className="text-sm text-white/60">
                                      {item.item.startDate} {item.item.targetDate && `→ ${item.item.targetDate}`}
                                    </p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                    item.item.status === 'On Track' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    item.item.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    item.item.status === 'Blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  }`}>
                                    {item.item.status}
                                  </div>
                                </div>

                                {/* Task Progress */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white/70">Progress</span>
                                    <span className="font-medium text-white">{item.item.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${item.item.percentage}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Task Details */}
                                <div className="space-y-2 text-sm">
                                  {item.item.owner && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Owner:</span>
                                      <span className="text-white">{item.item.owner}</span>
                                    </div>
                                  )}
                                  {item.item.priority && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Priority:</span>
                                      <span className={`font-medium ${
                                        item.item.priority === 'High' ? 'text-red-400 hover:text-red-300' :
                                        item.item.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-green-600 dark:text-green-400'
                                      }`}>{item.item.priority}</span>
                                    </div>
                                  )}
                                  {item.item.steps && item.item.steps.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Steps:</span>
                                      <span className="text-white">
                                        {item.item.steps.filter(s => s.state === 'Complete').length} / {item.item.steps.length}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          ))}
                      </div>

                      {/* Right Column - Even items (2nd, 4th, 6th...) */}
                      <div className="space-y-4">
                        {mergedItems
                          .filter((_, index) => index % 2 === 1)
                          .map((item, idx) => (
                            item.type === 'note' ? (
                              <NoteCard
                                key={`note-${item.item.id}`}
                                note={item.item}
                                dateRefs={dateRefs}
                                today={today}
                                draggedNote={draggedNote}
                                availableTags={tags}
                                categoryConfig={categoryConfig}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onEdit={setEditingNote}
                                onDelete={setDeleteConfirmNote}
                              />
                            ) : (
                              <div
                                key={`task-${item.item.id}`}
                                className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-lg shadow-md border-l-4 border-blue-500 dark:border-blue-400 p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                                onClick={() => setEditingTask(item.item)}
                              >
                                {/* Task Header with Icon */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                                    <ClipboardList className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.item.title}</h3>
                                    <p className="text-sm text-white/60">
                                      {item.item.startDate} {item.item.targetDate && `→ ${item.item.targetDate}`}
                                    </p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                    item.item.status === 'On Track' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    item.item.status === 'At Risk' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    item.item.status === 'Blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  }`}>
                                    {item.item.status}
                                  </div>
                                </div>

                                {/* Task Progress */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-white/70">Progress</span>
                                    <span className="font-medium text-white">{item.item.percentage}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${item.item.percentage}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Task Details */}
                                <div className="space-y-2 text-sm">
                                  {item.item.owner && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Owner:</span>
                                      <span className="text-white">{item.item.owner}</span>
                                    </div>
                                  )}
                                  {item.item.priority && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Priority:</span>
                                      <span className={`font-medium ${
                                        item.item.priority === 'High' ? 'text-red-400 hover:text-red-300' :
                                        item.item.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                        'text-green-600 dark:text-green-400'
                                      }`}>{item.item.priority}</span>
                                    </div>
                                  )}
                                  {item.item.steps && item.item.steps.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-white/60">Steps:</span>
                                      <span className="text-white">
                                        {item.item.steps.filter(s => s.state === 'Complete').length} / {item.item.steps.length}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                      No notes or tasks this week
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <AddNoteModal
          defaultDate={today}
          availableTags={tags}
          categoryConfig={categoryConfig}
          availableGoals={goals}
          availableInitiatives={initiatives}
          availableTasks={tasks}
          initialData={prePopulatedNoteData}
          onSave={handleAddNote}
          onClose={() => {
            setShowAddModal(false);
            setPrePopulatedNoteData(null); // Clear pre-populated data
          }}
        />
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          availableTags={tags}
          categoryConfig={categoryConfig}
          availableGoals={goals}
          availableInitiatives={initiatives}
          availableTasks={tasks}
          onSave={handleUpdateNote}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmNote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400 hover:text-red-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-roobert-bold text-white mb-1">
                  Delete Note
                </h3>
                <p className="text-sm text-white/70">
                  Are you sure you want to delete "{deleteConfirmNote.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmNote(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-white/90 hover:bg-gray-200 dark:hover:bg-gray-600 font-roobert-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirmNote.id)}
                className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 font-roobert-semibold"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Weekly Summary Modal */}
      {showAiSummary && (
        <AiWeeklySummaryModal
          onClose={() => setShowAiSummary(false)}
          showNotification={showNotification}
          notes={notes}
          tasks={tasks}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <TaskEditorModal
          onSave={handleAddTask}
          onClose={() => setShowAddTaskModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskEditorModal
          task={editingTask}
          onSave={handleUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

// Note Card Component
function NoteCard({
  note,
  dateRefs,
  today,
  draggedNote,
  availableTags,
  categoryConfig,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete
}: {
  note: TimelineNote;
  dateRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  today: string;
  draggedNote: TimelineNote | null;
  availableTags: Tag[];
  categoryConfig: any;
  onDragStart: (note: TimelineNote) => void;
  onDragEnd: () => void;
  onEdit: (note: TimelineNote) => void;
  onDelete: (note: TimelineNote) => void;
}) {
  const isToday = note.date === today;
  const isDragging = draggedNote?.id === note.id;
  const noteTag = note.tag ? availableTags.find(t => t.id === note.tag) : null;
  
  return (
    <div
      ref={(el) => {
        if (!dateRefs.current[note.date]) {
          dateRefs.current[note.date] = el;
        }
      }}
      draggable
      onDragStart={() => onDragStart(note)}
      onDragEnd={onDragEnd}
      className={`p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 border border-white/10 cursor-move hover:shadow-lg hover:shadow-purple-500/20 transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      {/* Note Header */}
      <div className="flex items-start gap-3 mb-3">
        <GripVertical className="w-5 h-5 text-white/50 mt-1 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-roobert-bold text-white mb-1">
            {note.title}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
            title="Edit note"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <div className="text-sm text-white/80 whitespace-pre-wrap mb-3">
        {note.content}
      </div>

      {/* Date and Category at Bottom */}
      <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
        <Calendar className="w-3 h-3" />
        <span>
          {new Date(note.date).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        {isToday && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-roobert-semibold">
            Today
          </span>
        )}
        <span className={`px-2 py-0.5 rounded-full ${(categoryConfig[note.category] || categoryConfig['general']).bg} ${(categoryConfig[note.category] || categoryConfig['general']).color} text-[10px] font-roobert-medium border border-white/20`}>
          #{(categoryConfig[note.category] || categoryConfig['general']).label}
        </span>
        {noteTag && (
          <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-roobert-semibold" style={{ backgroundColor: noteTag.color }}>
            🏷️ {noteTag.name}
          </span>
        )}
        {/* Note Types */}
        {note.noteType && note.noteType.length > 0 && note.noteType.map((typeId) => {
          const noteTypeInfo = NOTE_TYPE_DISPLAY_MAP[typeId];
          return noteTypeInfo ? (
            <span key={typeId} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 text-[10px] font-roobert-semibold">
              {noteTypeInfo.label}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}

// Add Note Modal Component
function AddNoteModal({ 
  defaultDate, 
  availableTags,
  categoryConfig,
  availableGoals,
  availableInitiatives,
  availableTasks,
  initialData,
  onSave, 
  onClose 
}: { 
  defaultDate: string;
  availableTags: Tag[];
  categoryConfig: any;
  availableGoals: Array<{ id: string; name: string; shortName: string; color: string }>;
  availableInitiatives: Array<{ id: string; name: string; slug: string }>;
  availableTasks: Task[];
  initialData?: { taskId?: string; initiativeId?: string; linkType?: string } | null;
  onSave: (note: Omit<TimelineNote, 'id' | 'createdAt' | 'updatedAt'>) => void; 
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<TimelineNote['category']>('documentation');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedNoteTypes, setSelectedNoteTypes] = useState<string[]>([]);
  const [linkType, setLinkType] = useState<'goal' | 'initiative' | 'task' | 'general'>(
    (initialData?.linkType as any) || 'general'
  );
  const [goalId, setGoalId] = useState<string>('');
  const [initiativeId, setInitiativeId] = useState<string>(initialData?.initiativeId || '');
  const [taskId, setTaskId] = useState<string>(initialData?.taskId || '');
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [showTypePanel, setShowTypePanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8B5CF6');

  const toggleNoteType = (typeId: string) => {
    setSelectedNoteTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      content: content.trim(),
      date,
      category,
      tags,
      tag: selectedTag || undefined,
      noteType: selectedNoteTypes.length > 0 ? selectedNoteTypes : undefined,
      linkType: linkType !== 'general' ? linkType : undefined,
      goalId: linkType === 'goal' ? goalId : undefined,
      initiativeId: linkType === 'initiative' ? initiativeId : undefined,
      taskId: (linkType === 'task' || (linkType === 'initiative' && taskId)) ? taskId : undefined
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor
        })
      });

      const data = await response.json();
      if (data.success) {
        availableTags.push(data.tag);
        setSelectedTag(data.tag.id);
        setNewTagName('');
        setNewTagColor('#8B5CF6');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative overflow-visible">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-roobert-bold text-white">
            Add New Note
          </h3>

          {/* TAG and TYPE buttons - top right */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                setShowTagPanel(!showTagPanel);
                setShowTypePanel(false);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all text-xs font-roobert-semibold"
            >
              Tag
            </motion.button>

            <motion.button
              onClick={() => {
                setShowTypePanel(!showTypePanel);
                setShowTagPanel(false);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all text-xs font-roobert-semibold"
            >
              Type {selectedNoteTypes.length > 0 && `(${selectedNoteTypes.length})`}
            </motion.button>
          </div>
        </div>

        {/* Tag Panel Slide-Out */}
        <AnimatePresence>
          {showTagPanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 to-slate-800 backdrop-blur-sm border-l border-white/10 shadow-2xl z-20 flex flex-col overflow-hidden"
            >
              {/* Tag Panel Header */}
              <div className="p-4 border-b border-white/10 bg-gray-900/95 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-roobert-semibold text-white">Select Tag</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-roobert-medium text-xs transition-colors"
                    >
                      Create Tag
                    </button>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Create Tag Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-roobert-medium text-white">
                      Create Tag
                    </h4>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-roobert-regular text-white/70">
                        Tag Colour
                      </label>
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                    placeholder="Tag name..."
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-roobert-regular bg-gray-800/50 text-white placeholder-white/50"
                  />
                </div>

                {/* Current Tag */}
                {selectedTag && (
                  <div>
                    <h4 className="text-sm font-roobert-medium text-white mb-2">
                      Current Tag
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const tag = availableTags.find(t => t.id === selectedTag);
                        if (!tag) return null;
                        return (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 rounded-lg"
                            style={{ backgroundColor: `${tag.color}20` }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-roobert-medium" style={{ color: tag.color }}>
                                {tag.name}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedTag('')}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div>
                  <div className="space-y-1">
                    {availableTags.length === 0 ? (
                      <div className="text-sm text-white/60 text-center py-4">
                        No tags yet. Create one above!
                      </div>
                    ) : (
                      availableTags.map(tag => {
                        const isSelected = selectedTag === tag.id;
                        return (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTag(tag.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-gray-700/50'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm font-roobert-regular text-white flex-1 text-left">
                              {tag.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TYPE Panel Slide-Out */}
        <AnimatePresence>
          {showTypePanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-96 bg-gray-800/95 backdrop-blur-sm border-l border-white/10 shadow-2xl rounded-r-xl p-4 overflow-y-auto z-20"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-roobert-bold text-white">
                  Select Note Types
                </h4>
                <button
                  onClick={() => setShowTypePanel(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STATUS / URGENCY Section */}
              <div className="mb-6">
                <div className="text-xs font-roobert-semibold text-white/70 uppercase tracking-wide mb-3">
                  Status / Urgency
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(NOTE_TYPE_STATUS).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleNoteType(type.id)}
                      className={`
                        px-2 py-2 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center min-w-[90px]
                        ${selectedNoteTypes.includes(type.id)
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry border-fis-eggplant text-white shadow-lg scale-105'
                          : 'bg-gray-700/50 border-white/20 text-white hover:border-purple-400 hover:bg-gray-700/80 hover:scale-102'
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
                <div className="text-xs font-roobert-semibold text-white/70 uppercase tracking-wide mb-3">
                  CRO Impact
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(NOTE_TYPE_CRO).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleNoteType(type.id)}
                      className={`
                        px-2 py-2 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center min-w-[90px]
                        ${selectedNoteTypes.includes(type.id)
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry border-fis-eggplant text-white shadow-lg scale-105'
                          : 'bg-gray-700/50 border-white/20 text-white hover:border-purple-400 hover:bg-gray-700/80 hover:scale-102'
                        }
                      `}
                    >
                      <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All Button */}
              {selectedNoteTypes.length > 0 && (
                <button
                  onClick={() => setSelectedNoteTypes([])}
                  className="w-full py-2 px-4 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700/80 transition-colors text-sm font-roobert-medium"
                >
                  Clear All ({selectedNoteTypes.length})
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white [color-scheme:dark]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white"
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white resize-none"
            />
          </div>

          {/* Link Note To */}
          <div className="space-y-3">
            <label className="block text-sm font-roobert-medium text-white/90">
              Link Note To
            </label>
            
            {/* Link Type Toggle */}
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  value="general"
                  checked={linkType === 'general'}
                  onChange={() => {
                    setLinkType('general');
                    setGoalId('');
                    setInitiativeId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="text-sm text-white/90">General</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  value="goal"
                  checked={linkType === 'goal'}
                  onChange={() => {
                    setLinkType('goal');
                    setInitiativeId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-white/90">Strategic Goal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  value="initiative"
                  checked={linkType === 'initiative'}
                  onChange={() => {
                    setLinkType('initiative');
                    setGoalId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-pink-600"
                />
                <span className="text-sm text-white/90">Initiative (Project)</span>
              </label>
            </div>

            {/* Conditional Dropdowns */}
            {linkType === 'goal' && (
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
              >
                <option value="">Select a strategic goal...</option>
                {availableGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.name}</option>
                ))}
              </select>
            )}

            {linkType === 'initiative' && (
              <>
                <select
                  value={initiativeId}
                  onChange={(e) => {
                    setInitiativeId(e.target.value);
                    setTaskId(''); // Reset task when initiative changes
                  }}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
                >
                  <option value="">Select an initiative...</option>
                  {availableInitiatives.map(initiative => (
                    <option key={initiative.id} value={initiative.id}>{initiative.name}</option>
                  ))}
                </select>
                
                {initiativeId && (
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200 mt-2"
                  >
                    <option value="">Select a task (optional)...</option>
                    {availableTasks
                      .filter(task => task.initiativeId === initiativeId)
                      .map(task => (
                        <option key={task.id} value={task.id}>{task.shortName || task.title}</option>
                      ))}
                  </select>
                )}
              </>
            )}

            {linkType === 'task' && (
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
              >
                <option value="">Select a task...</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Bottom Section: Metadata/Tags on left, Actions on right */}
        <div className="flex items-end justify-between gap-4 mt-6">
          {/* Left: Selected Tags/Types and Metadata */}
          <div className="flex-1 space-y-3">
            {/* Selected Tag and Types */}
            {(selectedTag || selectedNoteTypes.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {selectedTag && (() => {
                  const tag = availableTags.find(t => t.id === selectedTag);
                  return tag ? (
                    <span className="px-2 py-1 rounded-full text-white text-xs font-roobert-medium" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </span>
                  ) : null;
                })()}
                {selectedNoteTypes.map((typeId) => {
                  const noteTypeInfo = NOTE_TYPE_DISPLAY_MAP[typeId];
                  return noteTypeInfo ? (
                    <span key={typeId} className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 text-xs font-roobert-semibold">
                      {noteTypeInfo.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex gap-4 text-xs text-white/60">
              <div>Creating new note...</div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/10 font-roobert-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-roobert-semibold transition-colors"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Note Modal Component
function EditNoteModal({ 
  note,
  availableTags,
  categoryConfig,
  availableGoals,
  availableInitiatives,
  availableTasks,
  onSave, 
  onClose 
}: { 
  note: TimelineNote;
  availableTags: Tag[];
  categoryConfig: any;
  availableGoals: Array<{ id: string; name: string; shortName: string; color: string }>;
  availableInitiatives: Array<{ id: string; name: string; slug: string }>;
  availableTasks: Task[];
  onSave: (note: TimelineNote) => void; 
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [date, setDate] = useState(note.date);
  const [category, setCategory] = useState(note.category);
  const [selectedTag, setSelectedTag] = useState<string>(note.tag || '');
  const [selectedNoteTypes, setSelectedNoteTypes] = useState<string[]>(note.noteType || []);
  const [linkType, setLinkType] = useState<'goal' | 'initiative' | 'task' | 'general'>(note.linkType || 'general');
  const [goalId, setGoalId] = useState<string>(note.goalId || '');
  const [initiativeId, setInitiativeId] = useState<string>(note.initiativeId || '');
  const [taskId, setTaskId] = useState<string>(note.taskId || '');
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [showTypePanel, setShowTypePanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#8B5CF6');

  const toggleNoteType = (typeId: string) => {
    setSelectedNoteTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim(),
      date,
      category,
      tag: selectedTag || undefined,
      noteType: selectedNoteTypes.length > 0 ? selectedNoteTypes : undefined,
      linkType: linkType !== 'general' ? linkType : undefined,
      goalId: linkType === 'goal' ? goalId : undefined,
      initiativeId: linkType === 'initiative' ? initiativeId : undefined,
      taskId: (linkType === 'task' || (linkType === 'initiative' && taskId)) ? taskId : undefined
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor
        })
      });

      const data = await response.json();
      if (data.success) {
        availableTags.push(data.tag);
        setSelectedTag(data.tag.id);
        setNewTagName('');
        setNewTagColor('#8B5CF6');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative overflow-visible">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-roobert-bold text-white">
            Edit Note
          </h3>

          {/* TAG and TYPE buttons - top right */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => {
                setShowTagPanel(!showTagPanel);
                setShowTypePanel(false);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all text-xs font-roobert-semibold"
            >
              Tag
            </motion.button>

            <motion.button
              onClick={() => {
                setShowTypePanel(!showTypePanel);
                setShowTagPanel(false);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all text-xs font-roobert-semibold"
            >
              Type {selectedNoteTypes.length > 0 && `(${selectedNoteTypes.length})`}
            </motion.button>
          </div>
        </div>

        {/* Tag Panel Slide-Out */}
        <AnimatePresence>
          {showTagPanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 to-slate-800 backdrop-blur-sm border-l border-white/10 shadow-2xl z-20 flex flex-col overflow-hidden"
            >
              {/* Tag Panel Header */}
              <div className="p-4 border-b border-white/10 bg-gray-900/95 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-roobert-semibold text-white">Select Tag</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-roobert-medium text-xs transition-colors"
                    >
                      Create Tag
                    </button>
                    <button
                      onClick={() => setShowTagPanel(false)}
                      className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Create Tag Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-roobert-medium text-white">
                      Create Tag
                    </h4>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-roobert-regular text-white/70">
                        Tag Colour
                      </label>
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-white/10"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                    placeholder="Tag name..."
                    className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-roobert-regular bg-gray-800/50 text-white placeholder-white/50"
                  />
                </div>

                {/* Current Tag */}
                {selectedTag && (
                  <div>
                    <h4 className="text-sm font-roobert-medium text-white mb-2">
                      Current Tag
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const tag = availableTags.find(t => t.id === selectedTag);
                        if (!tag) return null;
                        return (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 rounded-lg"
                            style={{ backgroundColor: `${tag.color}20` }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-roobert-medium" style={{ color: tag.color }}>
                                {tag.name}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedTag('')}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div>
                  <div className="space-y-1">
                    {availableTags.length === 0 ? (
                      <div className="text-sm text-white/60 text-center py-4">
                        No tags yet. Create one above!
                      </div>
                    ) : (
                      availableTags.map(tag => {
                        const isSelected = selectedTag === tag.id;
                        return (
                          <button
                            key={tag.id}
                            onClick={() => setSelectedTag(tag.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-gray-700/50'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm font-roobert-regular text-white flex-1 text-left">
                              {tag.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TYPE Panel Slide-Out */}
        <AnimatePresence>
          {showTypePanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-96 bg-gray-800/95 backdrop-blur-sm border-l border-white/10 shadow-2xl rounded-r-xl p-4 overflow-y-auto z-20"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-roobert-bold text-white">
                  Select Note Types
                </h4>
                <button
                  onClick={() => setShowTypePanel(false)}
                  className="p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STATUS / URGENCY Section */}
              <div className="mb-6">
                <div className="text-xs font-roobert-semibold text-white/70 uppercase tracking-wide mb-3">
                  Status / Urgency
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(NOTE_TYPE_STATUS).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleNoteType(type.id)}
                      className={`
                        px-2 py-2 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center min-w-[90px]
                        ${selectedNoteTypes.includes(type.id)
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry border-fis-eggplant text-white shadow-lg scale-105'
                          : 'bg-gray-700/50 border-white/20 text-white hover:border-purple-400 hover:bg-gray-700/80 hover:scale-102'
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
                <div className="text-xs font-roobert-semibold text-white/70 uppercase tracking-wide mb-3">
                  CRO Impact
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(NOTE_TYPE_CRO).map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleNoteType(type.id)}
                      className={`
                        px-2 py-2 rounded-lg border-2 transition-all duration-200
                        flex items-center justify-center min-w-[90px]
                        ${selectedNoteTypes.includes(type.id)
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry border-fis-eggplant text-white shadow-lg scale-105'
                          : 'bg-gray-700/50 border-white/20 text-white hover:border-purple-400 hover:bg-gray-700/80 hover:scale-102'
                        }
                      `}
                    >
                      <span className="text-xs font-roobert-medium text-center leading-tight">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear All Button */}
              {selectedNoteTypes.length > 0 && (
                <button
                  onClick={() => setSelectedNoteTypes([])}
                  className="w-full py-2 px-4 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700/80 transition-colors text-sm font-roobert-medium"
                >
                  Clear All ({selectedNoteTypes.length})
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white [color-scheme:dark]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-roobert-medium text-white/90 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content..."
              rows={6}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white resize-none"
            />
          </div>

          {/* Link Note To */}
          <div className="space-y-3">
            <label className="block text-sm font-roobert-medium text-white/90">
              Link Note To
            </label>
            
            {/* Link Type Toggle */}
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkTypeEdit"
                  value="general"
                  checked={linkType === 'general'}
                  onChange={() => {
                    setLinkType('general');
                    setGoalId('');
                    setInitiativeId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-gray-600"
                />
                <span className="text-sm text-white/90">General</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkTypeEdit"
                  value="goal"
                  checked={linkType === 'goal'}
                  onChange={() => {
                    setLinkType('goal');
                    setInitiativeId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-white/90">Strategic Goal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkTypeEdit"
                  value="initiative"
                  checked={linkType === 'initiative'}
                  onChange={() => {
                    setLinkType('initiative');
                    setGoalId('');
                    setTaskId('');
                  }}
                  className="w-4 h-4 text-pink-600"
                />
                <span className="text-sm text-white/90">Initiative (Project)</span>
              </label>
            </div>

            {/* Conditional Dropdowns */}
            {linkType === 'goal' && (
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
              >
                <option value="">Select a strategic goal...</option>
                {availableGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.name}</option>
                ))}
              </select>
            )}

            {linkType === 'initiative' && (
              <>
                <select
                  value={initiativeId}
                  onChange={(e) => {
                    setInitiativeId(e.target.value);
                    setTaskId(''); // Reset task when initiative changes
                  }}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
                >
                  <option value="">Select an initiative...</option>
                  {availableInitiatives.map(initiative => (
                    <option key={initiative.id} value={initiative.id}>{initiative.name}</option>
                  ))}
                </select>
                
                {initiativeId && (
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200 mt-2"
                  >
                    <option value="">Select a task (optional)...</option>
                    {availableTasks
                      .filter(task => task.initiativeId === initiativeId)
                      .map(task => (
                        <option key={task.id} value={task.id}>{task.shortName || task.title}</option>
                      ))}
                  </select>
                )}
              </>
            )}

            {linkType === 'task' && (
              <select
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-slate-200"
              >
                <option value="">Select a task...</option>
                {availableTasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Bottom Section: Metadata/Tags on left, Actions on right */}
        <div className="flex items-end justify-between gap-4 mt-6">
          {/* Left: Selected Tag/Types and Metadata */}
          <div className="flex-1 space-y-3">
            {/* Selected Tag and Types */}
            {(selectedTag || selectedNoteTypes.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {selectedTag && (() => {
                  const tag = availableTags.find(t => t.id === selectedTag);
                  return tag ? (
                    <span className="px-2 py-1 rounded-full text-white text-xs font-roobert-medium" style={{ backgroundColor: tag.color }}>
                      {tag.name}
                    </span>
                  ) : null;
                })()}
                {selectedNoteTypes.map((typeId) => {
                  const noteTypeInfo = NOTE_TYPE_DISPLAY_MAP[typeId];
                  return noteTypeInfo ? (
                    <span key={typeId} className="px-2 py-1 rounded-full bg-fis-eggplant/10 dark:bg-fis-raspberry/10 text-fis-eggplant dark:text-fis-raspberry border border-fis-eggplant/20 dark:border-fis-raspberry/20 text-xs font-roobert-semibold">
                      {noteTypeInfo.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex gap-4 text-xs text-white/60">
              <div>Created: {new Date(note.createdAt).toLocaleString()}</div>
              <div>Modified: {new Date(note.updatedAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white/90 hover:bg-white/10 font-roobert-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-roobert-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Editor Modal
function TaskEditorModalWrapper({ task, onSave, onClose }: { task?: Task, onSave: (task: Task) => void, onClose: () => void }) {
  return <TaskEditorModal task={task} onSave={onSave} onClose={onClose} />;
}
