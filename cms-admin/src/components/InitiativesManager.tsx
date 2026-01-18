import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Rocket, TrendingUp, Target, AlertTriangle, DollarSign, Users, Link, Shield, CheckCircle, Clock, Package, ChevronRight, Download, Settings, Sparkles } from 'lucide-react';
import InitiativeEditorModal from './InitiativeEditorModal';
import ViewInitiativeModal from './ViewInitiativeModal';
import AIInitiativeBuilderWizard from './AIInitiativeBuilderWizard';

interface Initiative {
  id: string;
  name: string;
  shortName: string;
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;
  coOwners?: string[];
  sponsor: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; teamSize: string };
    relevant: { croAlignment: string[]; strategicThemes: string[] };
    timeBound: { timeline: Array<{ phase: string; deliverable: string; dueDate: string; status: string }> };
  };
  businessCase: {
    problem: string;
    opportunity: string;
    solution: string;
    roi: string;
    paybackPeriod: string;
  };
  budget: {
    total: number;
    spent: number;
  };
  topRisks: Array<{ risk: string; level: string; mitigation: string }>;
  stakeholders: Array<{ name: string; role: string; supportLevel: string }>;
  color: string;
  icon: string;
  createdDate: string;
  lastUpdated: string;
  startDate: string;
  endDate: string;
}

interface Goal {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
}

interface InitiativesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function InitiativesManager({ isOpen, onClose, showNotification }: InitiativesManagerProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<any | null>(null);
  const [linkedGoals, setLinkedGoals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'dependencies' | 'resources' | 'risks' | 'governance'>('overview');
  const [showAIBuilder, setShowAIBuilder] = useState(false);

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

  const handleCreateInitiative = () => {
    const newInitiative: Initiative = {
      id: '',
      name: '',
      shortName: '',
      category: 'innovation',
      owner: '',
      coOwners: [],
      sponsor: '',
      status: 'planning',
      priority: 'medium',
      progress: 0,
      projectStage: 'discovery',
      linkedGoals: [],
      smartGoal: {
        statement: '',
        specific: { objectives: [''] },
        measurable: { metrics: [''] },
        achievable: { resources: '', teamSize: '' },
        relevant: { croAlignment: [''], strategicThemes: [''] },
        timeBound: { timeline: [{ phase: 'Phase 1', deliverable: '', dueDate: '', status: 'not-started' }] }
      },
      businessCase: {
        problem: '',
        opportunity: '',
        solution: '',
        roi: '',
        paybackPeriod: ''
      },
      budget: {
        total: 0,
        spent: 0
      },
      topRisks: [],
      stakeholders: [],
      color: '#EC4899',
      icon: '🚀',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: ''
    };
    setEditingInitiative(newInitiative);
    setShowEditor(true);
  };

  const handleSaveInitiative = async (initiativeData: Initiative) => {
    if (!initiativeData) return;

    try {
      if (!initiativeData.id) {
        initiativeData.id = initiativeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const url = initiativeData.createdDate === new Date().toISOString().split('T')[0]
        ? 'http://localhost:3001/api/initiatives'
        : `http://localhost:3001/api/initiatives/${initiativeData.id}`;

      const method = initiativeData.createdDate === new Date().toISOString().split('T')[0] ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initiativeData)
      });

      if (response.ok) {
        showNotification?.('success', 'Initiative saved successfully');
        fetchInitiatives();
        setShowEditor(false);
        setEditingInitiative(null);
      }
    } catch (error) {
      console.error('Failed to save initiative:', error);
      showNotification?.('error', 'Failed to save initiative');
    }
  };

  const handleDeleteInitiative = async (id: string) => {
    if (!confirm('Are you sure you want to delete this initiative?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/initiatives/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification?.('success', 'Initiative deleted successfully');
        fetchInitiatives();
      }
    } catch (error) {
      console.error('Failed to delete initiative:', error);
      showNotification?.('error', 'Failed to delete initiative');
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

  const handleCloseViewModal = () => {
    setSelectedInitiative(null);
    setLinkedGoals([]);
  };

  const handleEditInitiative = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setShowEditor(true);
  };

  const handleExportInitiative = async (initiative: Initiative) => {
    try {
      const dataStr = JSON.stringify(initiative, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `initiative-${initiative.id}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification?.('success', `Exported "${initiative.name}"`);
    } catch (error) {
      console.error('Failed to export initiative:', error);
      showNotification?.('error', 'Failed to export initiative');
    }
  };

  const handleAIInitiativeCreate = (initiativeData: any) => {
    // Set the AI-generated initiative as the editing initiative and open editor
    setEditingInitiative(initiativeData);
    setShowEditor(true);
  };

  const handleExportAllInitiatives = async () => {
    try {
      const dataStr = JSON.stringify(initiatives, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `initiatives-all-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification?.('success', `Exported ${initiatives.length} initiative(s)`);
    } catch (error) {
      console.error('Failed to export initiatives:', error);
      showNotification?.('error', 'Failed to export initiatives');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'at-risk': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'on-hold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={() => !showEditor && !selectedInitiative && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-7xl mx-4 h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navy/Raspberry Gradient Header - IDENTICAL TO FRONTEND */}
          <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
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
                    onClick={() => setShowAIBuilder(true)}
                    className="px-2 2xl:px-3 py-1 2xl:py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs 2xl:text-sm font-roobert-medium transition-all flex items-center gap-1 2xl:gap-1.5"
                    title="AI Initiative Builder"
                  >
                    <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                    <span className="hidden lg:inline">AI Builder</span>
                    <span className="lg:hidden">AI</span>
                  </button>
                  <button
                    onClick={handleExportAllInitiatives}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    title="Export All Initiatives"
                  >
                    <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                  </button>
                  <button
                    onClick={handleCreateInitiative}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    title="New Initiative"
                  >
                    <Plus className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                  >
                    <X className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden 2xl:grid grid-cols-1 md:grid-cols-3 gap-2 2xl:gap-3"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 2xl:p-3 border border-white/20">
                  <div className="text-lg 2xl:text-xl font-roobert-bold">{initiatives.length}</div>
                  <div className="text-white/80 text-[10px] 2xl:text-[11px] font-roobert-medium">Total Initiatives</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 2xl:p-3 border border-white/20">
                  <div className="text-lg 2xl:text-lg 2xl:text-xl font-roobert-bold">
                    {initiatives.filter(i => i.status === 'in-progress').length}
                  </div>
                  <div className="text-white/80 text-[10px] 2xl:text-[11px] font-roobert-medium">In Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 2xl:p-3 border border-white/20">
                  <div className="text-white/80 text-[10px] 2xl:text-[11px] font-roobert-medium mb-1 2xl:mb-2">Status Overview</div>
                  <div className="h-5 2xl:h-6 bg-white/10 rounded-full overflow-hidden flex mb-1 2xl:mb-2">
                    {initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length > 0 && (
                      <div 
                        className="bg-green-500 hover:bg-green-600 transition-colors" 
                        style={{ width: `${(initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length / initiatives.length) * 100}%` }}
                        title={`Completed: ${initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length}`}
                      />
                    )}
                    {initiatives.filter(i => i.status === 'in-progress').length > 0 && (
                      <div 
                        className="bg-blue-500 hover:bg-blue-600 transition-colors" 
                        style={{ width: `${(initiatives.filter(i => i.status === 'in-progress').length / initiatives.length) * 100}%` }}
                        title={`In Progress: ${initiatives.filter(i => i.status === 'in-progress').length}`}
                      />
                    )}
                    {initiatives.filter(i => i.status === 'at-risk').length > 0 && (
                      <div 
                        className="bg-orange-500 hover:bg-orange-600 transition-colors" 
                        style={{ width: `${(initiatives.filter(i => i.status === 'at-risk').length / initiatives.length) * 100}%` }}
                        title={`At Risk: ${initiatives.filter(i => i.status === 'at-risk').length}`}
                      />
                    )}
                    {initiatives.filter(i => i.status === 'on-hold').length > 0 && (
                      <div 
                        className="bg-yellow-500 hover:bg-yellow-600 transition-colors" 
                        style={{ width: `${(initiatives.filter(i => i.status === 'on-hold').length / initiatives.length) * 100}%` }}
                        title={`On Hold: ${initiatives.filter(i => i.status === 'on-hold').length}`}
                      />
                    )}
                    {initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length > 0 && (
                      <div 
                        className="bg-gray-500 hover:bg-gray-600 transition-colors" 
                        style={{ width: `${(initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length / initiatives.length) * 100}%` }}
                        title={`Planning: ${initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/70">
                    <span>{initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length} Done</span>
                    <span>{initiatives.filter(i => i.status === 'at-risk').length} At Risk</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Content - IDENTICAL CARD LAYOUT */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fis-navy dark:border-fis-raspberry mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading initiatives...</p>
                </div>
              </div>
            ) : initiatives.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                  No Initiatives Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Strategic initiatives will appear here once they are created.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initiatives.map((initiative, index) => (
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
                    
                    {/* Admin Controls Overlay - Top Right */}
                    <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExportInitiative(initiative); }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors shadow-sm"
                        title="Export Initiative"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditInitiative(initiative); }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        title="Edit Initiative"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteInitiative(initiative.id); }}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                        title="Delete Initiative"
                      >
                        <X className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>

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
                          {initiative.smartGoal.measurable.metrics.slice(0, 2).map((metric: string, idx: number) => (
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
                          initiative.status === 'complete' || initiative.status === 'completed' || initiative.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
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
                      
                      {/* Owner & Assets Footer */}
                      {(initiative.owner || initiative.linkedGoals !== undefined) && (
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          {initiative.owner && (
                            <span className="flex items-center gap-1 font-roobert-medium">
                              <Users className="w-3 h-3" />
                              {initiative.owner}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {initiative.linkedGoals !== undefined && initiative.linkedGoals.length > 0 && (
                              <span className="font-roobert-medium">
                                {initiative.linkedGoals.length} goal{initiative.linkedGoals.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Editor Modal */}
          {showEditor && editingInitiative && (
            <InitiativeEditorModal
              initiative={editingInitiative}
              goals={goals}
              onSave={handleSaveInitiative}
              onClose={() => {
                setShowEditor(false);
                setEditingInitiative(null);
              }}
              isNew={editingInitiative.createdDate === new Date().toISOString().split('T')[0]}
            />
          )}

          {/* View Initiative Modal */}
          {selectedInitiative && (
            <ViewInitiativeModal
              initiative={selectedInitiative}
              linkedGoals={linkedGoals}
              onClose={handleCloseViewModal}
            />
          )}

          {/* AI Initiative Builder Wizard */}
          <AIInitiativeBuilderWizard
            isOpen={showAIBuilder}
            onClose={() => setShowAIBuilder(false)}
            onCreateInitiative={handleAIInitiativeCreate}
            showNotification={showNotification}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
