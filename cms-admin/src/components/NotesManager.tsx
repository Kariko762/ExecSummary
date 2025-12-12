/**
 * NOTES SYSTEM MANAGER
 * 
 * Multi-section notes system with:
 * - Notes Library: All notes with filtering
 * - Sections: Collections/reports (Weekly, Monthly, Quarterly, Custom)
 * - Many-to-many linking between notes and sections
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, X, Calendar, Building2, Target, TrendingUp,
  MoreVertical, Edit, Trash2, Copy, Link2, Archive, Download, ChevronDown,
  Star, CheckCircle, Trophy, Briefcase, Rocket, List, Folder, Grid
} from 'lucide-react';
import AddNoteModal from './AddNoteModal';
import CreateSectionModal from './CreateSectionModal';
import LinkToSectionModal from './LinkToSectionModal';

// Types
interface Note {
  id: string;
  title: string;
  content: string;
  category: 'key-highlight' | 'goal-progression' | 'big-win' | 'deal-support' | 'new-project' | 'general';
  linkedTo: {
    type: 'organization' | 'initiative' | 'goal';
    id: string;
    slug: string;
    name: string;
  } | null;
  sectionIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
}

interface Section {
  id: string;
  name: string;
  description: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'project' | 'custom';
  startDate?: string;
  endDate?: string;
  status: 'active' | 'archived' | 'draft';
  noteCount?: number;
  createdAt: string;
  updatedAt: string;
  color: string;
  icon: string;
}

interface NotesManagerProps {
  onClose: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  autoOpenNote?: boolean;
  autoOpenSection?: boolean;
}

const CATEGORY_CONFIG = {
  'key-highlight': { label: 'Key Highlight', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'goal-progression': { label: 'Goal Progression', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
  'big-win': { label: 'Big Win', icon: Trophy, color: 'text-green-500', bg: 'bg-green-50' },
  'deal-support': { label: 'Deal Support', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50' },
  'new-project': { label: 'New Project', icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'general': { label: 'General', icon: List, color: 'text-gray-500', bg: 'bg-gray-50' }
};

export default function NotesManager({ onClose, showNotification, autoOpenNote, autoOpenSection }: NotesManagerProps) {
  const [activeView, setActiveView] = useState<'notes' | 'sections'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Auto-open modals from quick actions
  useEffect(() => {
    if (autoOpenNote) {
      setShowCreateNote(true);
    }
    if (autoOpenSection) {
      setShowCreateSection(true);
    }
  }, [autoOpenNote, autoOpenSection]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingNote, setLinkingNote] = useState<Note | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; note: Note } | null>(null);
  const [sectionMenu, setSectionMenu] = useState<string | null>(null);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notes');
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      showNotification('error', 'Failed to load notes');
    }
  };

  // Fetch sections
  const fetchSections = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sections');
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      showNotification('error', 'Failed to load sections');
    }
  };

  // Fetch organizations, initiatives, goals for linking
  const fetchLinkableData = async () => {
    try {
      const [orgsRes, initsRes] = await Promise.all([
        fetch('http://localhost:3001/api/tenants?type=org'),
        fetch('http://localhost:3001/api/tenants?type=initiative')
      ]);

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        if (orgsData.success && orgsData.tenants) {
          setOrganizations(orgsData.tenants);
        }
      }

      if (initsRes.ok) {
        const initsData = await initsRes.json();
        if (initsData.success && initsData.tenants) {
          setInitiatives(initsData.tenants);
        }
      }

      // TODO: Fetch goals when API is ready
    } catch (error) {
      console.error('Failed to fetch linkable data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNotes(), fetchSections(), fetchLinkableData()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get section names for a note
  const getSectionNames = (sectionIds: string[]) => {
    return sectionIds
      .map(id => sections.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Save note (create or update)
  const handleSaveNote = async (note: Note) => {
    try {
      const method = note.id ? 'PUT' : 'POST';
      const url = note.id 
        ? `http://localhost:3001/api/notes/${note.id}`
        : 'http://localhost:3001/api/notes';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      // Refresh notes list
      await fetchNotes();
      await fetchSections(); // Update section note counts
      setShowCreateNote(false);
      setEditingNote(null);
      showNotification('success', note.id ? 'Note updated successfully' : 'Note created successfully');
    } catch (error) {
      console.error('Failed to save note:', error);
      showNotification('error', 'Failed to save note');
      throw error;
    }
  };

  // Open edit modal
  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowCreateNote(true);
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? It will be removed from all sections.')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      await fetchNotes();
      await fetchSections(); // Update section note counts
      showNotification('success', 'Note deleted successfully');
    } catch (error) {
      console.error('Failed to delete note:', error);
      showNotification('error', 'Failed to delete note');
    }
  };

  // Close modal handler
  const handleCloseNoteModal = () => {
    setShowCreateNote(false);
    setEditingNote(null);
  };

  // Open link modal
  const handleShowLinkModal = (note: Note) => {
    setLinkingNote(note);
    setShowLinkModal(true);
    setContextMenu(null);
  };

  // Update note section links
  const handleUpdateLinks = async (noteId: string, newSectionIds: string[]) => {
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const currentSectionIds = note.sectionIds || [];
      
      // Determine which sections to add to and remove from
      const sectionsToAdd = newSectionIds.filter(id => !currentSectionIds.includes(id));
      const sectionsToRemove = currentSectionIds.filter(id => !newSectionIds.includes(id));

      // Add to new sections
      for (const sectionId of sectionsToAdd) {
        await fetch(`http://localhost:3001/api/sections/${sectionId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteIds: [noteId] })
        });
      }

      // Remove from old sections
      for (const sectionId of sectionsToRemove) {
        await fetch(`http://localhost:3001/api/sections/${sectionId}/notes/${noteId}`, {
          method: 'DELETE'
        });
      }

      // Refresh data
      await fetchNotes();
      await fetchSections();
      showNotification('success', 'Section links updated successfully');
    } catch (error) {
      console.error('Failed to update section links:', error);
      showNotification('error', 'Failed to update section links');
      throw error;
    }
  };

  // Handle drag start
  const handleDragStart = (note: Note) => {
    setDraggedNote(note);
  };

  // Handle drag over section
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop on section
  const handleDropOnSection = async (sectionId: string) => {
    if (!draggedNote) return;

    try {
      // Add note to section if not already linked
      if (!draggedNote.sectionIds.includes(sectionId)) {
        await fetch(`http://localhost:3001/api/sections/${sectionId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteIds: [draggedNote.id] })
        });

        await fetchNotes();
        await fetchSections();
        showNotification('success', `Note added to section`);
      }
    } catch (error) {
      console.error('Failed to add note to section:', error);
      showNotification('error', 'Failed to add note to section');
    } finally {
      setDraggedNote(null);
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, note });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Click outside to close context menu
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Click outside to close section menu
  useEffect(() => {
    if (sectionMenu) {
      const handleClick = () => setSectionMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [sectionMenu]);

  // Archive/unarchive section
  const handleToggleArchive = async (sectionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
      const response = await fetch(`http://localhost:3001/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update section status');
      }

      await fetchSections();
      showNotification('success', newStatus === 'archived' ? 'Section archived' : 'Section restored');
    } catch (error) {
      console.error('Failed to update section:', error);
      showNotification('error', 'Failed to update section');
    }
  };

  // Save section
  const handleSaveSection = async (section: any) => {
    try {
      const method = section.id ? 'PUT' : 'POST';
      const url = section.id 
        ? `http://localhost:3001/api/sections/${section.id}`
        : 'http://localhost:3001/api/sections';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(section)
      });

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      // Refresh sections list
      await fetchSections();
      setShowCreateSection(false);
      setEditingSection(null);
      showNotification('success', section.id ? 'Section updated successfully' : 'Section created successfully');
    } catch (error) {
      console.error('Failed to save section:', error);
      showNotification('error', 'Failed to save section');
      throw error;
    }
  };

  // Edit section
  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setShowCreateSection(true);
    setSectionMenu(null);
  };

  // Delete section
  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section? All notes will be unlinked from it.')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/sections/${sectionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchSections();
        await fetchNotes();
        setSectionMenu(null);
        showNotification('success', 'Section deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      showNotification('error', 'Failed to delete section');
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                  Notes System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage notes and create reports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateSection(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                New Section
              </button>
              <button
                onClick={() => setShowCreateNote(true)}
                className="px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveView('notes')}
              className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                activeView === 'notes'
                  ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes Library ({notes.length})
              </div>
            </button>
            <button
              onClick={() => setActiveView('sections')}
              className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                activeView === 'sections'
                  ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Sections ({sections.filter(s => s.status === 'active').length})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeView === 'notes' ? (
          <div className="flex gap-6">
            {/* Main Area - Grouped Notes */}
            <div className="flex-1">
              {/* Search Bar */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Grouped Notes by Section */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading notes...</div>
              ) : (() => {
                // Get active sections (filtered by selectedSections if any selected)
                const activeSections = sections.filter(s => 
                  s.status === 'active' && 
                  (selectedSections.length === 0 || selectedSections.includes(s.id))
                );

                if (activeSections.length === 0 || filteredNotes.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No notes found</p>
                      <button
                        onClick={() => setShowCreateNote(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Create Your First Note
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6">
                    {activeSections.map(section => {
                      // Get notes for this section
                      const sectionNotes = filteredNotes.filter(note => 
                        note.sectionIds.includes(section.id)
                      );

                      if (sectionNotes.length === 0) return null;

                      return (
                        <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                          {/* Section Header */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-${section.color}-100 flex items-center justify-center`}>
                                <Calendar className={`w-4 h-4 text-${section.color}-600`} />
                              </div>
                              <div>
                                <h3 className="font-roobert-semibold text-gray-900 dark:text-white">{section.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{sectionNotes.length} notes</p>
                              </div>
                            </div>
                          </div>

                          {/* Compact Note Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sectionNotes.map(note => {
                              const categoryConfig = CATEGORY_CONFIG[note.category];
                              const CategoryIcon = categoryConfig.icon;
                              
                              return (
                                <motion.div
                                  key={note.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  draggable
                                  onDragStart={() => handleDragStart(note)}
                                  onContextMenu={(e) => handleContextMenu(e, note)}
                                  className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all cursor-move"
                                >
                                  {/* Compact Header */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className={`p-1 rounded ${categoryConfig.bg}`}>
                                      <CategoryIcon className={`w-3 h-3 ${categoryConfig.color}`} />
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleShowLinkModal(note)}
                                        className="p-1 hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/20 rounded transition-colors"
                                        title="Link to sections"
                                      >
                                        <Link2 className="w-3 h-3 text-fis-eggplant dark:text-fis-raspberry" />
                                      </button>
                                      <button
                                        onClick={() => handleEditNote(note)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        title="Edit note"
                                      >
                                        <Edit className="w-3 h-3 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Title */}
                                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                                    {note.title}
                                  </h4>

                                  {/* Content Preview */}
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {note.content}
                                  </p>

                                  {/* Footer */}
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(note.createdAt).toLocaleDateString()}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Right Panel - Section Filter */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-roobert-semibold text-gray-900 dark:text-white">Filter by Section</h3>
                  {selectedSections.length > 0 && (
                    <button
                      onClick={() => setSelectedSections([])}
                      className="text-xs text-fis-eggplant hover:text-fis-raspberry font-roobert-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Show Archived Toggle */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-fis-eggplant focus:ring-fis-eggplant"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Archived</span>
                </label>

                {/* Active Sections */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {sections
                    .filter(s => showArchived || s.status === 'active')
                    .map(section => {
                      const noteCount = notes.filter(n => n.sectionIds.includes(section.id)).length;
                      const isSelected = selectedSections.includes(section.id);
                      const isArchived = section.status === 'archived';

                      return (
                        <div
                          key={section.id}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-fis-eggplant bg-fis-eggplant/5 dark:bg-fis-raspberry/10'
                              : isArchived
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 opacity-60'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSections([...selectedSections, section.id]);
                                } else {
                                  setSelectedSections(selectedSections.filter(id => id !== section.id));
                                }
                              }}
                              className="mt-1 w-4 h-4 rounded border-gray-300 text-fis-eggplant focus:ring-fis-eggplant"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-roobert-semibold ${isArchived ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                  {section.name}
                                </span>
                                {isArchived && (
                                  <Archive className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {noteCount} notes • {section.type}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleToggleArchive(section.id, section.status);
                                  }}
                                  className="text-xs text-fis-eggplant hover:text-fis-raspberry font-roobert-medium"
                                  title={isArchived ? 'Restore section' : 'Archive section'}
                                >
                                  {isArchived ? 'Restore' : 'Archive'}
                                </button>
                              </div>
                            </div>
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Sections View */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading sections...</div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No sections found</p>
                <button
                  onClick={() => setShowCreateSection(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create Your First Section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Sections */}
                <div>
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                    Active Sections
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sections.filter(s => s.status === 'active').map(section => (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDropOnSection(section.id)}
                        className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 hover:shadow-lg transition-all ${
                          draggedNote && !draggedNote.sectionIds.includes(section.id)
                            ? 'border-fis-eggplant shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-${section.color}-100 flex items-center justify-center`}>
                            <Calendar className={`w-5 h-5 text-${section.color}-600`} />
                          </div>
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSectionMenu(sectionMenu === section.id ? null : section.id);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {sectionMenu === section.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSection(section);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Section
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleArchive(section.id, section.status);
                                    setSectionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Archive className="w-4 h-4" />
                                  {section.status === 'archived' ? 'Restore' : 'Archive'} Section
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Section
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                          {section.name}
                        </h3>
                        
                        {section.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {section.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {section.noteCount || 0} notes
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {section.type}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Archived Sections */}
                {sections.filter(s => s.status === 'archived').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                      Archived Sections
                    </h3>
                    <div className="space-y-2">
                      {sections.filter(s => s.status === 'archived').map(section => (
                        <div
                          key={section.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-roobert-medium text-gray-900 dark:text-white">
                              {section.name}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              ({section.noteCount || 0} notes)
                            </span>
                          </div>
                          <Archive className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <AddNoteModal
        isOpen={showCreateNote}
        onClose={handleCloseNoteModal}
        onSave={handleSaveNote}
        existingNote={editingNote}
        sections={sections}
        organizations={organizations}
        initiatives={initiatives}
        goals={goals}
      />

      {/* Create/Edit Section Modal */}
      <CreateSectionModal
        isOpen={showCreateSection}
        onClose={() => {
          setShowCreateSection(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        existingSection={editingSection}
      />

      {/* Link to Section Modal */}
      {linkingNote && (
        <LinkToSectionModal
          isOpen={showLinkModal}
          onClose={() => {
            setShowLinkModal(false);
            setLinkingNote(null);
          }}
          noteId={linkingNote.id}
          noteTitle={linkingNote.title}
          currentSectionIds={linkingNote.sectionIds}
          sections={sections}
          onUpdateLinks={(sectionIds) => handleUpdateLinks(linkingNote.id, sectionIds)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="fixed z-[70] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px]"
          >
            <button
              onClick={() => handleShowLinkModal(contextMenu.note)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Link to Section
            </button>
            <button
              onClick={() => {
                handleEditNote(contextMenu.note);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Note
            </button>
            <button
              onClick={() => {
                handleDeleteNote(contextMenu.note.id);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Note
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
