/**
 * QUICK ACTIONS MENU
 * 
 * Floating side panel with quick action shortcuts for common CMS tasks.
 * Categories: Notes, Performance, Content Creation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ChevronRight, StickyNote, Plus, Folder, FolderOpen, Tag,
  TrendingUp, Copy, FileText, Lightbulb, Rocket, Calendar, Building2, ClipboardList, Sparkles
} from 'lucide-react';

interface ContentTag {
  id: string;
  name: string;
  color: string;
  icon: string;
  enableQuickClone?: boolean;
}

interface QuickActionsMenuProps {
  onNewNote: () => void;
  onNewSection?: () => void;
  onQuickClone: (tagId: string, tagName: string) => void;
  onNewContent: (type: 'timeline' | 'announcement' | 'organization' | 'vendor') => void;
  onTimelineNotes?: () => void;
  onNewTask?: () => void;
  onAllTasks?: () => void;
  onWeeklyLeadership?: () => void;
  onPerformanceView?: () => void;
}

export default function QuickActionsMenu({
  onNewNote,
  onNewSection,
  onQuickClone,
  onNewContent,
  onTimelineNotes,
  onNewTask,
  onAllTasks,
  onWeeklyLeadership,
  onPerformanceView
}: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quickCloneTags, setQuickCloneTags] = useState<ContentTag[]>([]);

  // Fetch tags with Quick Clone enabled
  const fetchQuickCloneTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/content-tags');
      const tags = await response.json();
      setQuickCloneTags(tags.filter((tag: ContentTag) => tag.enableQuickClone));
    } catch (error) {
      console.error('Failed to fetch quick clone tags:', error);
    }
  };

  // Fetch on mount
  React.useEffect(() => {
    fetchQuickCloneTags();
  }, []);

  // Refetch when menu opens
  React.useEffect(() => {
    if (isOpen) {
      fetchQuickCloneTags();
    }
  }, [isOpen]);

  // Keyboard shortcut: Ctrl+Q to toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Toggle Button - Fixed to right side */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isOpen ? 'Close Quick Actions' : 'Open Quick Actions (Ctrl+Q)'}
      >
        <div className="text-white p-3 rounded-l-xl shadow-2xl" style={{ background: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))' }}>
          {isOpen ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
        </div>
      </motion.button>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[99]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-[100] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 p-6 text-white" style={{ background: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-roobert-heavy">Quick Actions</h2>
                    <p className="text-xs text-white/80">Fast shortcuts for common tasks</p>
                  </div>
                </div>
              </div>

              {/* Actions List */}
              <div className="p-4 space-y-4">
                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Column 1: Admin */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <ClipboardList className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-roobert-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Admin
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onNewNote();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <StickyNote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            Add Note
                          </div>
                        </div>
                      </button>

                      {onNewTask && (
                        <button
                          onClick={() => {
                            onNewTask();
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                            <ClipboardList className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                              Add Task
                            </div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Rocket className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            Add Initiative
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            Add Goal
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-roobert-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Content
                      </h3>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            New Leadership Summary
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            New Vendor Summary
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            New Performance Report
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onNewContent('vendor');
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                          <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white truncate">
                            New Article
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="mt-6 p-4 rounded-lg border" style={{ 
                  background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--brand-primary) 10%, transparent), color-mix(in srgb, var(--brand-secondary) 10%, transparent))',
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)'
                }}>
                  <div className="flex items-start gap-2">
                    <Rocket className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <div className="text-xs font-roobert-bold mb-1" style={{ color: 'var(--brand-primary)' }}>
                        Pro Tip
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Use keyboard shortcut <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-mono text-xs">Ctrl+Q</kbd> to toggle this menu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
