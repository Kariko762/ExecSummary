import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Rocket, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Target,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  Settings,
  ArrowUpDown,
  Edit2
} from 'lucide-react';
import InitiativeDetailsModal from './InitiativeDetailsModal';
import InitiativeEditorModal from './InitiativeEditorModal';

interface Initiative {
  id: string;
  name: string;
  shortName: string;
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];
  _published?: boolean;
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; teamSize: string };
    relevant: { croAlignment: string[]; strategicThemes: string[] };
    timeBound: { timeline: Array<{ phase: string; deliverable: string; dueDate: string; status: string }> };
  };
  startDate: string;
  endDate: string;
}

interface InitiativesHeroProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiativeClick?: (id: string) => void;
}

type PrioritizationMode = 'priority' | 'progress' | 'status' | 'recent' | 'deadline';

const InitiativesHero: React.FC<InitiativesHeroProps> = ({ isOpen, onClose, onInitiativeClick }) => {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [prioritizedIds, setPrioritizedIds] = useState<string[]>([]);
  const [showPrioritizeModal, setShowPrioritizeModal] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [linkedGoals, setLinkedGoals] = useState<any[]>([]);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchInitiatives();
      fetchGoals();
    }
  }, [isOpen]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/initiatives');
      if (response.ok) {
        const data = await response.json();
        setInitiatives(data.initiatives || []);
        
        // Load prioritized IDs from backend API
        try {
          const priorityResponse = await fetch('http://localhost:3001/api/initiatives/settings/priority-order');
          if (priorityResponse.ok) {
            const priorityData = await priorityResponse.json();
            setPrioritizedIds(priorityData.priorityOrder || []);
          }
        } catch (err) {
          console.error('Failed to fetch priority order:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const handleEditInitiative = async (initiative: Initiative) => {
    setSelectedInitiative(null); // Close details modal
    setEditingInitiative(initiative);
  };

  const handleSaveInitiative = async (initiativeData: any) => {
    try {
      const url = `http://localhost:3001/api/initiatives/${initiativeData.id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initiativeData)
      });

      if (response.ok) {
        fetchInitiatives();
        setEditingInitiative(null);
      }
    } catch (error) {
      console.error('Failed to save initiative:', error);
    }
  };

  // Calculate stats
  const stats = {
    total: initiatives.length,
    highPriority: initiatives.filter(i => i.priority === 'high' || i.priority === 'critical').length,
    blocked: initiatives.filter(i => i.status === 'blocked' || i.status === 'at-risk').length,
    inProgress: initiatives.filter(i => i.status === 'in-progress').length,
    completed: initiatives.filter(i => i.status === 'completed').length
  };

  // Get prioritized initiatives
  const prioritizedInitiatives = prioritizedIds
    .map(id => initiatives.find(i => i.id === id))
    .filter(Boolean) as Initiative[];

  const heroInitiative = prioritizedInitiatives[0];
  const featuredInitiatives = prioritizedInitiatives.slice(1, 5);

  // Save priority order
  const savePriorityOrder = async (order: string[]) => {
    try {
      // Save to backend API (persistent storage)
      await fetch('http://localhost:3001/api/initiatives/settings/priority-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityOrder: order })
      });
    } catch (error) {
      console.error('Failed to save priority order:', error);
    }
  };

  // Move initiative to prioritized (max 5)
  const moveToFeatured = (id: string) => {
    if (!prioritizedIds.includes(id) && prioritizedIds.length < 5) {
      const newOrder = [...prioritizedIds, id];
      setPrioritizedIds(newOrder);
      savePriorityOrder(newOrder);
    }
  };

  // Remove from prioritized
  const removeFromFeatured = (id: string) => {
    const newOrder = prioritizedIds.filter(pid => pid !== id);
    setPrioritizedIds(newOrder);
    savePriorityOrder(newOrder);
  };

  // Move up in priority
  const moveUp = (id: string) => {
    const index = prioritizedIds.indexOf(id);
    if (index > 0) {
      const newOrder = [...prioritizedIds];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      setPrioritizedIds(newOrder);
      savePriorityOrder(newOrder);
    }
  };

  // Move down in priority
  const moveDown = (id: string) => {
    const index = prioritizedIds.indexOf(id);
    if (index < prioritizedIds.length - 1) {
      const newOrder = [...prioritizedIds];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      setPrioritizedIds(newOrder);
      savePriorityOrder(newOrder);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'at-risk': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'blocked': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
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

  const handleCloseDetailsModal = () => {
    setSelectedInitiative(null);
    setLinkedGoals([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-[95vw] h-[95vh] bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#1a2744] via-[#0f172a] to-[#0a0f1a] border-b border-white/10">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>

            <div className="relative px-6 py-4">
              <div className="flex items-center justify-between gap-6">
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <Rocket className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h1 className="text-lg font-roobert-bold text-white leading-none">Strategic Initiatives</h1>
                    <p className="text-white/40 text-xs font-roobert-light">Driving organizational transformation</p>
                  </div>
                </div>

                {/* Inline Metrics */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-white">{stats.total}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">Total</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-orange-300">{stats.highPriority}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">High Priority</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-red-300">{stats.blocked}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">At Risk</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-blue-300">{stats.inProgress}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">In Progress</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-green-300">{stats.completed}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">Completed</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrioritizeModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-roobert-medium transition-all flex items-center gap-2"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Prioritize
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-blue-300/60">Loading initiatives...</p>
                </div>
              </div>
            ) : initiatives.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Rocket className="w-16 h-16 text-blue-300/20 mx-auto mb-4" />
                  <h3 className="text-lg font-roobert-semibold text-white mb-2">No Initiatives Available</h3>
                  <p className="text-blue-300/60">Strategic initiatives will appear here once created.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Large Hero Card */}
                  {heroInitiative && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="lg:col-span-2 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-6 cursor-pointer group hover:border-white/20 transition-all shadow-lg relative"
                      onClick={() => handleInitiativeClick(heroInitiative.id)}
                    >
                      {/* Title with inline priority badge and tags */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className="w-6 h-6 rounded-full bg-blue-500/80 flex items-center justify-center text-white font-roobert-bold text-[10px] shadow-md flex-shrink-0">
                          #1
                        </div>
                        <h2 className="text-2xl font-roobert-bold text-white group-hover:text-white/90 transition-colors">
                          {heroInitiative.name}
                        </h2>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium border ${
                          heroInitiative._published 
                            ? 'bg-green-500/10 text-green-300 border-green-500/30'
                            : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                        }`}>
                          {heroInitiative._published ? 'Published' : 'Draft'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium border capitalize ${getStatusColor(heroInitiative.status)}`}>
                          {heroInitiative.status?.replace('-', ' ') || 'Unknown'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium border ${getPriorityColor(heroInitiative.priority)}`}>
                          {heroInitiative.priority || 'Medium'}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-roobert-medium bg-white/5 text-white/80 border border-white/10 capitalize">
                          {heroInitiative.projectStage}
                        </span>
                      </div>

                      {/* SMART Goal Statement */}
                      {heroInitiative.smartGoal?.statement && (
                        <p className="text-sm text-white/70 mb-4 font-roobert-light leading-relaxed">
                          {heroInitiative.smartGoal.statement}
                        </p>
                      )}

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-white/40">Progress</span>
                          <span className="font-roobert-semibold text-white">{heroInitiative.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${heroInitiative.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          />
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      {heroInitiative.smartGoal?.measurable?.metrics && heroInitiative.smartGoal.measurable.metrics.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {heroInitiative.smartGoal.measurable.metrics.slice(0, 3).map((metric: string, idx: number) => {
                            const parts = metric.split(':');
                            const label = parts[0]?.trim() || 'Metric';
                            const value = parts[1]?.trim() || metric;
                            return (
                              <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-[10px] text-white/50 mb-1 font-roobert-medium uppercase tracking-wide">
                                  {label}
                                </div>
                                <div className="text-lg font-roobert-bold text-white">
                                  {value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs text-white/60 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          {heroInitiative.category && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-roobert-medium bg-white/10 text-white/80 border border-white/20 capitalize">
                              {heroInitiative.category}
                            </span>
                          )}
                          {heroInitiative.owner && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              {heroInitiative.owner}
                            </span>
                          )}
                          {heroInitiative.linkedGoals && heroInitiative.linkedGoals.length > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5" />
                              {heroInitiative.linkedGoals.length} goal{heroInitiative.linkedGoals.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {(heroInitiative.startDate || heroInitiative.endDate) && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {heroInitiative.startDate && new Date(heroInitiative.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {heroInitiative.startDate && heroInitiative.endDate && ' - '}
                            {heroInitiative.endDate && new Date(heroInitiative.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Featured Initiatives */}
                  <div className="space-y-4">
                    {featuredInitiatives.map((initiative, idx) => (
                      <motion.div
                        key={initiative.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10 p-3 cursor-pointer group hover:border-white/20 transition-all relative"
                        onClick={() => handleInitiativeClick(initiative.id)}
                      >
                        {/* Priority Number Badge */}
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500/80 flex items-center justify-center text-white font-roobert-bold text-[10px] shadow-md">
                          #{idx + 2}
                        </div>

                        {/* Row 1: Title + Tags */}
                        <div className="flex items-center gap-2 mb-2 pr-8">
                          <h3 className="text-sm font-roobert-semibold text-white group-hover:text-white/90 transition-colors truncate flex-1">
                            {initiative.name}
                          </h3>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-roobert-medium border whitespace-nowrap ${
                            initiative._published 
                              ? 'bg-green-500/10 text-green-300 border-green-500/30'
                              : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                          }`}>
                            {initiative._published ? 'Published' : 'Draft'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-roobert-medium border whitespace-nowrap capitalize ${getStatusColor(initiative.status)}`}>
                            {initiative.status?.replace('-', ' ') || 'Unknown'}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-roobert-medium border whitespace-nowrap ${getPriorityColor(initiative.priority)}`}>
                            {initiative.priority || 'Medium'}
                          </span>
                        </div>

                        {/* Row 2: Progress Bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${initiative.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-white/60 font-roobert-medium min-w-[32px] text-right">{initiative.progress}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* All Initiatives Table */}
                <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10">
                    <h3 className="text-lg font-roobert-semibold text-white">All Initiatives</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/[0.02] border-b border-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Visibility</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Owner</th>
                          <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Goals</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {initiatives.map((initiative, idx) => (
                          <motion.tr
                            key={initiative.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                            onClick={() => handleInitiativeClick(initiative.id)}
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-roobert-semibold text-white">{initiative.name}</div>
                                {initiative.shortName && (
                                  <div className="text-xs text-blue-300/40 mt-0.5">{initiative.shortName}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 capitalize">
                                {initiative.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border ${
                                initiative._published 
                                  ? 'bg-green-500/10 text-green-300 border-green-500/30'
                                  : 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                              }`}>
                                {initiative._published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border capitalize ${getStatusColor(initiative.status)}`}>
                                {initiative.status?.replace('-', ' ') || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border capitalize ${getPriorityColor(initiative.priority)}`}>
                                {initiative.priority || 'Medium'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-blue-950/50 rounded-full overflow-hidden border border-blue-500/20">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                    style={{ width: `${initiative.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-roobert-semibold text-blue-300 w-10 text-right">{initiative.progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-blue-300/60">
                                <Users className="w-3.5 h-3.5" />
                                {initiative.owner || 'Unassigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-blue-300/60">
                                <Target className="w-3.5 h-3.5" />
                                {initiative.linkedGoals?.length || 0}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prioritization Modal */}
          {showPrioritizeModal && (
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowPrioritizeModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-[#1a2f4f] to-[#0f1f3a] rounded-xl border border-blue-500/30 w-[90vw] h-[80vh] shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
                  <h3 className="text-xl font-roobert-semibold text-white">Prioritize Initiatives</h3>
                  <button
                    onClick={() => setShowPrioritizeModal(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 h-full">
                    {/* All Initiatives - Left */}
                    <div className="bg-white/[0.03] rounded-xl border border-white/10 flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <h4 className="text-sm font-roobert-semibold text-white">
                          All Initiatives ({initiatives.filter(i => !prioritizedIds.includes(i.id)).length})
                        </h4>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {initiatives
                          .filter(i => !prioritizedIds.includes(i.id))
                          .map((initiative) => (
                            <div
                              key={initiative.id}
                              className="bg-white/[0.03] rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-roobert-semibold text-white truncate">
                                    {initiative.shortName || initiative.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-roobert-medium border capitalize ${getStatusColor(initiative.status)}`}>
                                      {initiative.status?.replace('-', ' ') || 'Unknown'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-roobert-medium border ${getPriorityColor(initiative.priority)}`}>
                                      {initiative.priority || 'Medium'}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => moveToFeatured(initiative.id)}
                                  disabled={prioritizedIds.length >= 5}
                                  className="ml-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={prioritizedIds.length >= 5 ? "Max 5 priorities reached" : "Add to featured"}
                                >
                                  <ChevronRight className="w-4 h-4 text-blue-400" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center justify-center">
                      <div className="h-full w-px bg-blue-500/20"></div>
                    </div>

                    {/* Prioritized Initiatives - Right */}
                    <div className="bg-white/[0.03] rounded-xl border border-white/10 flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-roobert-semibold text-white">
                            Featured ({prioritizedIds.length}/5)
                          </h4>
                          {prioritizedIds.length >= 5 && (
                            <span className="text-xs text-orange-300">Max reached</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {prioritizedInitiatives.map((initiative, index) => (
                          <div
                            key={initiative.id}
                            className="bg-white/[0.05] rounded-lg p-3 border border-white/20 hover:border-white/30 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => moveUp(initiative.id)}
                                  disabled={index === 0}
                                  className="p-1 rounded hover:bg-blue-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                                <button
                                  onClick={() => moveDown(initiative.id)}
                                  disabled={index === prioritizedInitiatives.length - 1}
                                  className="p-1 rounded hover:bg-blue-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-roobert-bold text-blue-400">#{index + 1}</span>
                                  <div className="text-sm font-roobert-semibold text-white truncate">
                                    {initiative.shortName || initiative.name}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-roobert-medium border capitalize ${getStatusColor(initiative.status)}`}>
                                    {initiative.status?.replace('-', ' ') || 'Unknown'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-roobert-medium border ${getPriorityColor(initiative.priority)}`}>
                                    {initiative.priority || 'Medium'}
                                  </span>
                                  <span className="text-xs text-blue-300/50">{initiative.progress}%</span>
                                </div>
                              </div>

                              <button
                                onClick={() => removeFromFeatured(initiative.id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                                title="Remove from featured"
                              >
                                <ChevronLeft className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {prioritizedInitiatives.length === 0 && (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-blue-300/40 text-sm">
                              <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p>No initiatives prioritized yet</p>
                              <p className="text-xs mt-1">Click → on initiatives to add them</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-blue-500/20">
                  <div className="text-sm text-blue-300/60">
                    Changes are saved automatically
                  </div>
                  <button
                    onClick={() => setShowPrioritizeModal(false)}
                    className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm font-roobert-medium transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Initiative Details Modal */}
      {selectedInitiative && (
        <InitiativeDetailsModal
          initiative={selectedInitiative}
          linkedGoals={linkedGoals}
          onClose={handleCloseDetailsModal}
          onEdit={() => handleEditInitiative(selectedInitiative)}
        />
      )}

      {/* Initiative Editor Modal */}
      {editingInitiative && (
        <InitiativeEditorModal
          initiative={editingInitiative}
          goals={goals}
          onSave={handleSaveInitiative}
          onClose={() => setEditingInitiative(null)}
          isNew={false}
        />
      )}
    </AnimatePresence>
  );
};

export default InitiativesHero;
