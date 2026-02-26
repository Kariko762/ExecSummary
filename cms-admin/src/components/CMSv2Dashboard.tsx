import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, TrendingUp, Eye, Edit2, Trash2, Copy, MoreVertical, 
  Plus, Search, CheckCircle, Clock, AlertCircle, BarChart3, 
  Settings, Moon, Sun, Users, Calendar, ExternalLink, Zap,
  ChevronRight, Download, Upload, ChevronDown, Save, Bell, RefreshCw,
  Menu, Target, StickyNote, Check, Lightbulb, Sparkles, DollarSign, Grid,
  Shield, BookText, BookOpen, Wrench, Database, Palette, Layers, Flag, Building2,
  ShoppingBag
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ArticleView from './ArticleView';
import PerformanceKeyActivities from '../pages/PerformanceKeyActivities';
import ProcessingOverlay from './ProcessingOverlay';
import { useProcessingOverlay } from '../hooks/useProcessingOverlay';

interface TemplateFile {
  id: string;
  name: string;
  shortName?: string;
  category: 'leadership' | 'vendor' | 'performance' | 'article';
  status: 'published' | 'draft' | 'archived';
  lastUpdated: string;
  views?: number;
  editorComponent: string;
  filePath: string;
  isPerformanceReport?: boolean;
  _published?: boolean;
}

interface CMSv2DashboardProps {
  onOpenEditor?: (template: TemplateFile) => void;
  onQuickAction?: (action: string) => void;
  onOpenGoals?: () => void;
  onOpenGoalsHighLevel?: () => void;
  onOpenGoalsDark?: () => void;
  onOpenInitiatives?: () => void;
  onOpenInitiativesGantt?: () => void;
  onOpenInitiativesHero?: () => void;
  onOpenBudget?: () => void;
  onOpenBudgetFinance?: () => void;
  onOpenNotes?: () => void;
  onOpenTasks?: () => void;
  onOpenPlatformOverview?: () => void;
  onOpenOrgIQ?: () => void;
  onOpenTemplateBuilder?: () => void;
  onOpenSystemSettings?: () => void;
  onOpenDataSources?: () => void;
  onOpenAssetReference?: () => void;
  onOpenStyleScheme?: () => void;
}

export default function CMSv2Dashboard({ 
  onOpenEditor, 
  onQuickAction,
  onOpenGoals,
  onOpenGoalsHighLevel,
  onOpenGoalsDark,
  onOpenInitiatives,
  onOpenInitiativesGantt,
  onOpenInitiativesHero,
  onOpenBudget,
  onOpenBudgetFinance,
  onOpenNotes,
  onOpenTasks,
  onOpenPlatformOverview,
  onOpenOrgIQ,
  onOpenTemplateBuilder,
  onOpenSystemSettings,
  onOpenDataSources,
  onOpenAssetReference,
  onOpenStyleScheme
}: CMSv2DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<TemplateFile[]>([]);
  const [stats, setStats] = useState({
    published: 183,
    unpublished: 53,
    weeklyViews: 1453,
    totalTemplates: 629
  });
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [strategySubmenuOpen, setStrategySubmenuOpen] = useState(false);
  const [engineSubmenuOpen, setEngineSubmenuOpen] = useState(false);
  const [showArticleView, setShowArticleView] = useState(false);
  const [showPerformanceView, setShowPerformanceView] = useState(false);
  const [vendorActiveTab, setVendorActiveTab] = useState<'summaries' | 'performance'>('summaries');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TemplateFile | null>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const strategyMenuButtonRef = useRef<HTMLButtonElement>(null);
  const engineMenuButtonRef = useRef<HTMLButtonElement>(null);
  const { isProcessing, message: processingMessage, showProcessing } = useProcessingOverlay();

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Click outside handler to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
        setStrategySubmenuOpen(false);
        setEngineSubmenuOpen(false);
      }
    };

    if (isNavDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isNavDropdownOpen]);

  // Handlers for submenu positioning
  const handleStrategySubmenuOpen = () => {
    setStrategySubmenuOpen(true);
  };

  const handleEngineSubmenuOpen = () => {
    setEngineSubmenuOpen(true);
  };

  const buildLeadershipTemplates = async () => {
    const leadershipTemplates: TemplateFile[] = [];
    try {
      const leadershipResponse = await fetch('http://localhost:3001/api/content/list/leadership');
      const leadershipData = await leadershipResponse.json();

      if (leadershipData.success && leadershipData.content) {
        leadershipData.content.forEach((item: any) => {
          leadershipTemplates.push({
            id: item.id || item.meta?.id,
            name: item.title || item.meta?.title,
            category: 'leadership',
            status: item.meta?.status || item.status || 'published',
            lastUpdated: getRelativeTime(item.meta?.lastModified || item.lastModified || new Date().toISOString()),
            views: item.meta?.views || item.views || 0,
            editorComponent: 'ContentEditor',
            filePath: `/backend/data/content/leadership/${item.id || item.meta?.id}.json`,
            _published: item._published
          });
        });
      }
    } catch (error) {
      console.error('Error loading leadership summaries:', error);
    }

    return leadershipTemplates;
  };

  const refreshLeadershipSummaries = async () => {
    const leadershipTemplates = await buildLeadershipTemplates();
    setTemplates(prev => [
      ...prev.filter(template => template.category !== 'leadership'),
      ...leadershipTemplates
    ]);
  };

  const handleLeadershipRefresh = async () => {
    showProcessing({ message: 'Refreshing leadership summaries...', durationMs: 2000 });
    await refreshLeadershipSummaries();
  };

  const loadTemplates = async () => {
    try {
      // Load real content from content-tsx folder
      const templateFiles: TemplateFile[] = [];

      const leadershipTemplates = await buildLeadershipTemplates();
      templateFiles.push(...leadershipTemplates);

      // Load vendor summaries from API
      try {
        const vendorResponse = await fetch('http://localhost:3001/api/content?tag=vendor-summary');
        const vendorData = await vendorResponse.json();
        
        if (vendorData.success && Array.isArray(vendorData.content)) {
          vendorData.content.forEach((item: any) => {
            templateFiles.push({
              id: item.meta?.id || item._id || `vendor-${Date.now()}`,
              name: item.meta?.title || 'Vendor Summary',
              shortName: item.meta?.title || 'Vendor Summary',
              category: 'vendor',
              status: item._published ? 'published' : 'draft',
              _published: item._published ?? false,
              lastUpdated: '1 day ago',
              views: item.meta?.views || 0,
              editorComponent: 'ContentEditor',
              filePath: `/backend/data/content/vendor/${item.meta?.id}.json`,
              isVendorOverview: true
            });
          });
        }
      } catch (error) {
        console.error('Error loading vendor summaries:', error);
      }

      // Load vendor performance from API
      try {
        const perfResponse = await fetch('http://localhost:3001/api/content?tag=vendor-performance');
        const perfData = await perfResponse.json();
        
        if (perfData.success && Array.isArray(perfData.content)) {
          perfData.content.forEach((item: any) => {
            templateFiles.push({
              id: item.meta?.id || item._id || `vendor-perf-${Date.now()}`,
              name: `${item.meta?.vendor || 'Vendor'} Performance - ${item.meta?.quarter} ${item.meta?.year}`,
              shortName: `${item.meta?.vendor} Performance`,
              category: 'vendor',
              status: item._published ? 'published' : 'draft',
              _published: item._published ?? false,
              lastUpdated: '1 day ago',
              views: 0,
              editorComponent: 'VendorPerfEditor',
              filePath: `/backend/data/content/vendor-performance/${item.meta?.id}.json`,
              isVendorPerformance: true
            });
          });
        }
      } catch (error) {
        console.error('Error loading vendor performance:', error);
      }

      // Add B2B Digital Buyers Guide article
      templateFiles.push({
        id: 'article-b2b-buyers-guide',
        name: 'B2B Digital Buyers Guide Insights: Shaping a Digital-First GTM Strategy',
        shortName: 'B2B Digital Buyers Guide',
        category: 'article',
        status: 'published',
        lastUpdated: '2 months ago',
        views: 92,
        editorComponent: 'ArticleView',
        filePath: '/articles/b2b-digital-buyers-guide',
        _published: false
      });

      // Auto-discover performance reports from backend/data/content/performance folder
      try {
        const performanceResponse = await fetch('http://localhost:3001/api/content/list/performance');
        const performanceData = await performanceResponse.json();
        
        if (performanceData.success && performanceData.files) {
          performanceData.files.forEach((file: any) => {
            templateFiles.push({
              id: file.id,
              name: file.name,
              shortName: file.shortName || file.name,
              category: 'performance',
              status: 'published',
              lastUpdated: file.lastModified ? getRelativeTime(file.lastModified) : '1 day ago',
              views: 0,
              editorComponent: 'PerformanceEditor',
              filePath: file.path,
              isPerformanceReport: true,
              _published: file._published
            });
          });
        }
      } catch (error) {
        console.error('Error loading performance reports:', error);
      }

      setTemplates(templateFiles);
    } catch (error) {
      console.error('Error loading content files:', error);
      setTemplates([]);
    }
  };

  const handleDeleteTemplate = (template: TemplateFile) => {
    if (template.category !== 'leadership') return;
    setTemplateToDelete(template);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/content/${templateToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      setTemplates(prev => prev.filter(item => item.id !== templateToDelete.id));
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Failed to delete leadership summary:', error);
      alert('Failed to delete leadership summary');
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredTemplates = templates.filter(t => {
    return t.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categorizedTemplates = {
    leadership: filteredTemplates.filter(t => t.category === 'leadership'),
    vendor: filteredTemplates.filter(t => t.category === 'vendor' && !(t as any).isVendorPerformance),
    vendorPerformance: filteredTemplates.filter(t => t.category === 'vendor' && (t as any).isVendorPerformance),
    performance: filteredTemplates.filter(t => t.category === 'performance'),
    article: filteredTemplates.filter(t => t.category === 'article')
  };

  const handleEditTemplate = (template: TemplateFile) => {
    if (template.isPerformanceReport) {
      setShowPerformanceView(true);
    } else if (template.editorComponent === 'VendorPerfEditor') {
      // Handle vendor performance - pass the template which contains the file path
      if (onOpenEditor) {
        onOpenEditor(template);
      }
    } else if (onOpenEditor) {
      onOpenEditor(template);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] text-white">
      <ProcessingOverlay isOpen={isProcessing} message={processingMessage} />
      {/* ROW 1 - Header */}
      <div className="px-6 py-3 border-b border-slate-700/30">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-3">
              {/* Navigation Dropdown */}
              <div ref={navDropdownRef} className="relative">
                <motion.button
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/30 transition-all"
                  title="Navigation Menu"
                >
                  <Menu className="w-5 h-5 text-slate-300" />
                </motion.button>

                {/* Navigation Dropdown Menu */}
                <AnimatePresence>
                  {isNavDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full mt-2 w-80 bg-slate-800/95 backdrop-blur-sm rounded-xl border border-slate-700 shadow-2xl overflow-visible z-50"
                    >
                      <div className="p-2">
                        {/* STRATEGY SUBMENU */}
                        <div className="relative">
                          <button
                            ref={strategyMenuButtonRef}
                            onMouseEnter={handleStrategySubmenuOpen}
                            onMouseLeave={() => setStrategySubmenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-purple-500/10 text-white text-left"
                          >
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <div className="font-roobert-semibold text-sm">Strategy</div>
                              <div className="text-xs text-slate-400">Goals, tasks & initiatives</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>
                          
                          {/* Strategy Submenu - Slides out to the right */}
                          <AnimatePresence>
                            {strategySubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                onMouseEnter={handleStrategySubmenuOpen}
                                onMouseLeave={() => setStrategySubmenuOpen(false)}
                                className="absolute left-full ml-2 top-0 w-72 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-[53]"
                              >
                                <div className="p-2">
                                  {/* Timeline Notes */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenNotes?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-yellow-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-yellow-500/10">
                                      <StickyNote className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Timeline Notes</div>
                                      <div className="text-xs text-slate-400">Weekly reports & updates</div>
                                    </div>
                                  </button>

                                  {/* All Tasks */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenTasks?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                      <Check className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">All Tasks</div>
                                      <div className="text-xs text-slate-400">Action items & tracking</div>
                                    </div>
                                  </button>

                                  {/* Initiatives */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenInitiatives?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-pink-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-pink-500/10">
                                      <Lightbulb className="w-4 h-4 text-pink-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Initiatives</div>
                                      <div className="text-xs text-slate-400">Strategic projects</div>
                                    </div>
                                  </button>

                                  {/* Initiatives Gantt */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenInitiativesGantt?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-purple-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                      <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Initiatives Gantt</div>
                                      <div className="text-xs text-slate-400">Q1 2026 timeline view</div>
                                    </div>
                                  </button>

                                  {/* Initiatives Hero View */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenInitiativesHero?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Initiatives Hero</div>
                                      <div className="text-xs text-slate-400">Dashboard & table view</div>
                                    </div>
                                  </button>

                                  {/* Goals */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenGoals?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-green-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-green-500/10">
                                      <Target className="w-4 h-4 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Goals</div>
                                      <div className="text-xs text-slate-400">Strategic objectives</div>
                                    </div>
                                  </button>

                                  {/* Goals High Level */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenGoalsHighLevel?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                      <Flag className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">2026 Goals Executive</div>
                                      <div className="text-xs text-slate-400">High-level strategic view</div>
                                    </div>
                                  </button>

                                  {/* Goals Dark Theme */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenGoalsDark?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-purple-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                      <Target className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Goals (Dark Theme)</div>
                                      <div className="text-xs text-slate-400">Full-screen goals viewer</div>
                                    </div>
                                  </button>

                                  {/* Budget & Finance */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenBudgetFinance?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                      <DollarSign className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Budget & Finance</div>
                                      <div className="text-xs text-slate-400">Budget and forecast management</div>
                                    </div>
                                  </button>

                                  {/* Budget */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenBudget?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-emerald-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10">
                                      <DollarSign className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Budget</div>
                                      <div className="text-xs text-slate-400">Forecast & Actual</div>
                                    </div>
                                  </button>

                                  {/* Template Builder */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setStrategySubmenuOpen(false);
                                      onOpenTemplateBuilder?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-fis-eggplant/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                      <Grid className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Template Builder</div>
                                      <div className="text-xs text-slate-400">Drag & drop designer</div>
                                    </div>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* System Settings */}
                        <button
                          onClick={() => {
                            onOpenSystemSettings?.();
                            setIsNavDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50/10 text-white text-left"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Shield className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">System Settings</div>
                            <div className="text-xs text-slate-400">Authentication & security</div>
                          </div>
                        </button>

                        {/* Platform Showcase */}
                        <button
                          onClick={() => {
                            onOpenPlatformOverview?.();
                            setIsNavDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 text-white text-left"
                        >
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                            <BookText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Platform Showcase</div>
                            <div className="text-xs text-slate-400">Visual capabilities overview</div>
                          </div>
                        </button>

                        {/* Engine & Templates - WITH SUBMENU */}
                        <div className="relative">
                          <button
                            ref={engineMenuButtonRef}
                            onMouseEnter={handleEngineSubmenuOpen}
                            onMouseLeave={() => setEngineSubmenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-slate-700/50 text-white text-left"
                          >
                            <div className="p-2 rounded-lg bg-slate-700/50">
                              <Wrench className="w-5 h-5 text-slate-300" />
                            </div>
                            <div className="flex-1">
                              <div className="font-roobert-semibold text-sm">Engine & Templates</div>
                              <div className="text-xs text-slate-400">Render engine & tools</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </button>

                          {/* Engine Submenu - Slides out to the right */}
                          <AnimatePresence>
                            {engineSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                onMouseEnter={handleEngineSubmenuOpen}
                                onMouseLeave={() => setEngineSubmenuOpen(false)}
                                className="absolute left-full ml-2 top-0 w-72 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-[53]"
                              >
                                <div className="p-2">
                                  {/* Asset Reference */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                      onOpenAssetReference?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-purple-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                                      <BookOpen className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Asset Reference</div>
                                      <div className="text-xs text-slate-400">Live previews, notes & code</div>
                                    </div>
                                  </button>

                                  {/* Platform Showcase */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                      onOpenPlatformOverview?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                                      <BookText className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Platform Showcase</div>
                                      <div className="text-xs text-slate-400">Visual capabilities overview</div>
                                    </div>
                                  </button>

                                  {/* OrgIQ */}
                                  <button
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                      onOpenOrgIQ?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                                      <Target className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">OrgIQ</div>
                                      <div className="text-xs text-slate-400">Organizational intelligence platform</div>
                                    </div>
                                  </button>

                                  {/* Data Sources */}
                                  <button
                                    onClick={() => {
                                      onOpenDataSources?.();
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-orange-500/10 text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-orange-500/10">
                                      <Database className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Data Sources</div>
                                      <div className="text-xs text-slate-400">Manage content data sources</div>
                                    </div>
                                  </button>

                                  {/* Design System */}
                                  <button
                                    onClick={() => {
                                      onOpenStyleScheme?.();
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-all text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-pink-500/10">
                                      <Palette className="w-4 h-4 text-pink-400" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Design System</div>
                                      <div className="text-xs text-slate-400">Colors, typography, spacing</div>
                                    </div>
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logo & Title */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-roobert-bold text-white">
                CMS <span className="text-slate-400">Admin Dashboard</span>
              </h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content items..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Back to v1
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Article View Modal */}
      <AnimatePresence>
        {showArticleView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            <ArticleView onClose={() => setShowArticleView(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance View Modal */}
      <AnimatePresence>
        {showPerformanceView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            <PerformanceKeyActivities 
              isCMSMode={true}
              onEdit={() => {
                setShowPerformanceView(false);
                const perfTemplate = categorizedTemplates.performance.find(t => t.isPerformanceReport);
                if (perfTemplate && onOpenEditor) {
                  onOpenEditor(perfTemplate);
                }
              }}
              onClose={() => setShowPerformanceView(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="px-6 py-4">
        <div className="max-w-[1920px] mx-auto space-y-4">
          
          {/* ROW 2 - 50/50 Split */}
          <div className="grid grid-cols-2 gap-6">
            <ContentPanel
              title="Leadership Summaries"
              templates={categorizedTemplates.leadership}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              onAddNew={() => handleQuickAction('new-leadership')}
              onRefresh={handleLeadershipRefresh}
              addLabel="Add Summary"
              stats={stats}
            />
            
            {/* Vendor Panel with Tabs */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
              {/* Header with title, tabs, and add button */}
              <div className="flex items-center border-b border-slate-700/40">
                {/* Title */}
                <h3 className="px-4 py-2.5 text-sm font-roobert-medium text-white border-r border-slate-700/40">
                  Vendor
                </h3>
                <div className="flex items-center flex-1">
                  {/* Tabs */}
                  <button
                    onClick={() => setVendorActiveTab('summaries')}
                    className={`px-4 py-2.5 text-sm font-roobert-medium transition-all duration-200 border-r border-slate-700/40 ${
                      vendorActiveTab === 'summaries'
                        ? 'text-white bg-[#4bcd3e]/20 border-b-2 border-b-[#4bcd3e]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    Summaries
                  </button>
                  <button
                    onClick={() => setVendorActiveTab('performance')}
                    className={`px-4 py-2.5 text-sm font-roobert-medium transition-all duration-200 ${
                      vendorActiveTab === 'performance'
                        ? 'text-white bg-[#4bcd3e]/20 border-b-2 border-b-[#4bcd3e]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    Performance
                  </button>
                </div>
                {/* Add button */}
                <button
                  onClick={() => onAction?.(vendorActiveTab === 'summaries' ? 'new-vendor' : 'new-performance')}
                  className="p-2.5 hover:bg-white/5 transition-colors group border-l border-slate-700/40"
                  title={vendorActiveTab === 'summaries' ? 'New vendor summary' : 'New performance report'}
                >
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-3">
                <ul className="space-y-1.5">
                  {vendorActiveTab === 'summaries' ? (
                    categorizedTemplates.vendor.length > 0 ? (
                      categorizedTemplates.vendor.map((template: TemplateFile) => (
                        <li key={template.id}>
                          <motion.button
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleEditTemplate(template)}
                            className="w-full flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-slate-200 truncate">
                                  {template.shortName || template.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {template.lastUpdated}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {template._published && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Eye className="w-3 h-3" />
                                  <span className="text-[9px] font-medium">{template.views || 0}</span>
                                </div>
                              )}
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-roobert-bold uppercase tracking-wide ${
                                template._published
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {template._published ? 'Published' : 'Draft'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                          </motion.button>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 italic px-2 py-3 text-center">No vendor summaries yet</li>
                    )
                  ) : (
                    categorizedTemplates.vendorPerformance.length > 0 ? (
                      categorizedTemplates.vendorPerformance.map((template: TemplateFile) => (
                        <li key={template.id}>
                          <motion.button
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleEditTemplate(template)}
                            className="w-full flex items-center justify-between p-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/20 group-hover:bg-orange-500/30 text-orange-400">
                                <BarChart3 className="w-3.5 h-3.5" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-slate-200 truncate">
                                  {template.shortName || template.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {template.lastUpdated}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {template._published && (
                                <div className="flex items-center gap-1 text-slate-400">
                                  <Eye className="w-3 h-3" />
                                  <span className="text-[9px] font-medium">{template.views || 0}</span>
                                </div>
                              )}
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-roobert-bold uppercase tracking-wide ${
                                template._published
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {template._published ? 'Published' : 'Draft'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                          </motion.button>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-500 italic px-2 py-3 text-center">No vendor performance reports yet</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* ROW 3 - 33/33/33 Split */}
          <div className="grid grid-cols-3 gap-6">
            <ContentPanel
              title="Performance Reports"
              templates={categorizedTemplates.performance}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              stats={stats}
            />
            <ContentPanel
              title="Articles"
              templates={categorizedTemplates.article}
              onEdit={handleEditTemplate}
              onViewArticle={() => setShowArticleView(true)}
              onDelete={handleDeleteTemplate}
              stats={stats}
            />
            <QuickActionsPanel 
              onAction={handleQuickAction}
              onOpenTasks={onOpenTasks}
              onOpenNotes={onOpenNotes}
              onOpenGoals={onOpenGoals}
              onOpenInitiativesHero={onOpenInitiativesHero}
              onOpenInitiativesGantt={onOpenInitiativesGantt}
              onOpenBudget={onOpenBudget}
            />
          </div>

          {/* ROW 4 - 50/50 Split */}
          <div className="grid grid-cols-2 gap-6">
            <LogsPanel />
            <APIHealthPanel stats={stats} />
          </div>
        </div>
      </div>

      {showDeleteModal && templateToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-roobert-semibold text-white">Delete Leadership Summary</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-200">
                Are you sure you want to delete
                <span className="font-roobert-semibold"> {templateToDelete.name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-700/50 px-5 py-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTemplateToDelete(null);
                }}
                className="rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTemplate}
                className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: any;
  value: number | string;
  label: string;
  color: 'cyan' | 'orange' | 'blue' | 'purple';
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400'
  };

  const iconColorMap = {
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />
        </div>
        <div>
          <div className="text-2xl font-roobert-bold text-white">{value}</div>
          <div className="text-xs text-slate-400 font-roobert-light">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Content Panel Component (for grid layout)
function ContentPanel({ 
  title, 
  templates, 
  onEdit,
  onDelete,
  onViewArticle,
  onAddNew,
  onRefresh,
  addLabel,
  stats 
}: { 
  title: string;
  templates: TemplateFile[];
  onEdit: (template: TemplateFile) => void;
  onDelete?: (template: TemplateFile) => void;
  onViewArticle?: () => void;
  onAddNew?: () => void;
  onRefresh?: () => void;
  addLabel?: string;
  stats: any;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleItemClick = (template: TemplateFile) => {
    if (title === 'Articles' && onViewArticle) {
      onViewArticle();
    } else {
      onEdit(template);
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Panel Header with Gradient */}
      <div className="px-4 py-2.5 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/40 to-slate-700/30 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-roobert-semibold text-white">{title}</h2>
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
              {templates.length}
            </span>
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </motion.button>
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700/40 rounded-lg shadow-xl z-10"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onAddNew?.();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  {addLabel || 'Add New'}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onRefresh?.();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  Refresh
                </button>
                <button className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50 transition-colors">Export</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Content - Always Visible */}
      <div className="p-2 space-y-1 max-h-[240px] overflow-y-auto">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No items yet</p>
          </div>
        ) : (
          templates.map((template) => (
            <TemplateRow key={template.id} template={template} onEdit={handleItemClick} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

// Quick Actions Panel
function QuickActionsPanel({ 
  onAction,
  onOpenTasks,
  onOpenNotes,
  onOpenGoals,
  onOpenInitiativesHero,
  onOpenInitiativesGantt,
  onOpenBudget
}: { 
  onAction?: (action: string) => void;
  onOpenTasks?: () => void;
  onOpenNotes?: () => void;
  onOpenGoals?: () => void;
  onOpenInitiativesHero?: () => void;
  onOpenInitiativesGantt?: () => void;
  onOpenBudget?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'actions' | 'links'>('actions');
  const adminActions = [
    { icon: Plus, label: 'Add Note', action: 'new-note', color: 'blue' },
    { icon: CheckCircle, label: 'Add Task', action: 'new-task', color: 'green' },
    { icon: TrendingUp, label: 'Add Initiative', action: 'new-initiative', color: 'purple' },
    { icon: BarChart3, label: 'Add Goal', action: 'new-goal', color: 'cyan' },
    { icon: Users, label: 'Manage People', action: 'manage-people', color: 'blue' },
    { icon: ShoppingBag, label: 'Manage Vendors', action: 'manage-vendors', color: 'purple' }
  ];

  const contentActions = [
    { icon: FileText, label: 'New Leadership Summary', action: 'new-leadership', color: 'purple' },
    { icon: Building2, label: 'Leadership BU Summary', action: 'new-leadership-bu', color: 'purple' },
    { icon: Building2, label: 'Leadership Summary V2', action: 'new-leadership-bu-v2', color: 'cyan' },
    { icon: Sparkles, label: 'AI Executive Summary', action: 'ai-exec-summary', color: 'purple' },
    { icon: BarChart3, label: 'New Vendor Summary', action: 'new-vendor', color: 'orange' },
    { icon: TrendingUp, label: 'New Performance Report', action: 'new-performance', color: 'pink' },
    { icon: Plus, label: 'New Article', action: 'new-article', color: 'indigo' },
    { icon: Building2, label: 'Executive Home Config', action: 'executive-home', color: 'purple' },
    { icon: Building2, label: 'Business Unit Editor', action: 'edit-business-unit', color: 'cyan' },
    { icon: BarChart3, label: 'Vendor Dashboard', action: 'vendor-dashboard', color: 'orange' },
    { icon: BarChart3, label: 'Asset Dashboard', action: 'asset-dashboard', color: 'blue' }
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-400',
    green: 'bg-green-500/20 group-hover:bg-green-500/30 text-green-400',
    purple: 'bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400',
    cyan: 'bg-cyan-500/20 group-hover:bg-cyan-500/30 text-cyan-400',
    orange: 'bg-orange-500/20 group-hover:bg-orange-500/30 text-orange-400',
    pink: 'bg-pink-500/20 group-hover:bg-pink-500/30 text-pink-400',
    indigo: 'bg-indigo-500/20 group-hover:bg-indigo-500/30 text-indigo-400'
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header with integrated tabs */}
      <div className="flex items-center border-b border-slate-700/40">
        <div className="flex items-center flex-1">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2.5 text-sm font-roobert-medium transition-all duration-200 border-r border-slate-700/40 ${
              activeTab === 'actions'
                ? 'text-white bg-[#4bcd3e]/20 border-b-2 border-b-[#4bcd3e]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2.5 text-sm font-roobert-medium transition-all duration-200 ${
              activeTab === 'links'
                ? 'text-white bg-[#4bcd3e]/20 border-b-2 border-b-[#4bcd3e]'
                : 'text-white/60 hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            Quick Links
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        {activeTab === 'actions' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Column 1: Admin */}
            <div>
              <h3 className="text-[10px] font-roobert-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Admin</h3>
              <div className="space-y-1.5">
                {adminActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction?.(action.action)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${colorMap[action.color]}`}>
                      <action.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-200">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Column 2: Content */}
            <div>
              <h3 className="text-[10px] font-roobert-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Content</h3>
              <div className="space-y-1.5">
                {contentActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction?.(action.action)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${colorMap[action.color]}`}>
                      <action.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-200">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'links' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Left Column */}
            <div>
              <div className="space-y-1.5">
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenTasks}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-green-500/20 group-hover:bg-green-500/30 text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Tasks</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenNotes}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-blue-500/20 group-hover:bg-blue-500/30 text-blue-400">
                    <StickyNote className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Notes (Timeline)</span>
                </motion.button>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="space-y-1.5">
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenGoals}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-cyan-500/20 group-hover:bg-cyan-500/30 text-cyan-400">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Goals</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenInitiativesHero}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-purple-500/20 group-hover:bg-purple-500/30 text-purple-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Initiatives (Hero)</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenInitiativesGantt}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-indigo-500/20 group-hover:bg-indigo-500/30 text-indigo-400">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Gantt</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenBudget}
                  className="w-full flex items-center gap-2 px-2.5 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 rounded-lg transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-orange-500/20 group-hover:bg-orange-500/30 text-orange-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-200">Budget</span>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Logs Panel - Table Format
function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/change-control?limit=20');
      const data = await response.json();
      
      if (data.success) {
        // Transform backend events to table format
        const transformedLogs = data.events.map((event: any) => {
          const isNew = event.eventType.includes('created');
          const changes = event.metadata?.changes || {};
          const firstChange = Object.keys(changes)[0];
          
          return {
            id: event.id,
            action: isNew ? 'New' : 'Modified',
            item: event.metadata?.title || event.metadata?.name || event.entityType,
            field: firstChange || 'entity',
            oldValue: firstChange && changes[firstChange]?.old ? String(changes[firstChange].old) : '—',
            newValue: firstChange && changes[firstChange]?.new ? String(changes[firstChange].new) : (isNew ? 'Created' : '—'),
            time: formatTimestamp(event.timestamp),
            user: event.user === 'current-user' ? 'Admin' : event.user
          };
        });
        
        setLogs(transformedLogs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      // Fallback to empty array on error
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionBadge = (action: string) => {
    return action === 'New' 
      ? <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30 font-medium">NEW</span>
      : <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] rounded border border-blue-500/30 font-medium">MOD</span>;
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm h-[600px] flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-700/40">
        <h2 className="text-base font-roobert-semibold text-white">Recent Activity Log</h2>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-slate-800/50 sticky top-0 z-10">
            <tr className="border-b border-slate-700/40">
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Action</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Item</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Field</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Old Value</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">New Value</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">When</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr 
                key={log.id}
                className={`border-b border-slate-700/20 hover:bg-slate-800/40 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-800/10' : 'bg-transparent'
                }`}
              >
                <td className="px-3 py-2.5">{getActionBadge(log.action)}</td>
                <td className="px-3 py-2.5 text-xs text-white font-medium">{log.item}</td>
                <td className="px-3 py-2.5 text-xs text-slate-300 font-mono">{log.field}</td>
                <td className="px-3 py-2.5 text-xs text-slate-400">{log.oldValue}</td>
                <td className="px-3 py-2.5 text-xs text-cyan-400 font-medium">{log.newValue}</td>
                <td className="px-3 py-2.5 text-[10px] text-slate-500">{log.time}</td>
                <td className="px-3 py-2.5 text-[10px] text-slate-400">{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// API Health Panel - Detailed Table
function APIHealthPanel({ stats }: { stats: any }) {
  const [apiEndpoints, setApiEndpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPIHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAPIHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAPIHealth = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health-check');
      const data = await response.json();
      
      if (data.success && data.endpoints) {
        const transformedEndpoints = data.endpoints.map((ep: any) => ({
          name: ep.name,
          status: ep.status,
          latency: `${ep.latency}ms`,
          uptime: `${ep.uptime}%`,
          lastTested: formatTimestamp(ep.lastTested),
          lastFailed: ep.lastFailed ? formatTimestamp(ep.lastFailed) : 'Never',
          requests24h: formatNumber(ep.requests24h)
        }));
        setApiEndpoints(transformedEndpoints);
      }
    } catch (error) {
      console.error('Failed to fetch API health:', error);
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const healthyCount = apiEndpoints.filter(e => e.status === 'healthy').length;
  const warningCount = apiEndpoints.filter(e => e.status === 'warning').length;
  const downCount = apiEndpoints.filter(e => e.status === 'down').length;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'healthy':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] rounded border border-green-500/30 font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>HEALTHY</span>;
      case 'warning':
        return <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] rounded border border-orange-500/30 font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>WARNING</span>;
      case 'down':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] rounded border border-red-500/30 font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>DOWN</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-[9px] rounded border border-slate-500/30 font-medium">UNKNOWN</span>;
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm h-[600px] flex flex-col">
      <div className="px-4 py-2.5 border-b border-slate-700/40">
        <h2 className="text-base font-roobert-semibold text-white">API Health Dashboard</h2>
      </div>

      {/* Summary Stats Row */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/40">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-roobert-bold text-green-400">{healthyCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Healthy</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-roobert-bold text-orange-400">{warningCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Warning</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-roobert-bold text-red-400">{downCount}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Down</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-slate-800/50 sticky top-0 z-10">
            <tr className="border-b border-slate-700/40">
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">API Endpoint</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Status</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Latency</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Uptime</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Last Tested</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">Last Failed</th>
              <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">24h Requests</th>
            </tr>
          </thead>
          <tbody>
            {apiEndpoints.map((endpoint, index) => (
              <tr 
                key={endpoint.name}
                className={`border-b border-slate-700/20 hover:bg-slate-800/40 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-800/10' : 'bg-transparent'
                }`}
              >
                <td className="px-3 py-2.5 text-xs text-white font-medium">{endpoint.name}</td>
                <td className="px-3 py-2.5">{getStatusBadge(endpoint.status)}</td>
                <td className="px-3 py-2.5 text-xs text-slate-300">{endpoint.latency}</td>
                <td className="px-3 py-2.5 text-xs text-cyan-400 font-medium">{endpoint.uptime}</td>
                <td className="px-3 py-2.5 text-[10px] text-slate-400">{endpoint.lastTested}</td>
                <td className="px-3 py-2.5 text-[10px] text-slate-400">{endpoint.lastFailed}</td>
                <td className="px-3 py-2.5 text-xs text-slate-300 font-mono">{endpoint.requests24h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ContentSectionProps {
  title: string;
  templates: TemplateFile[];
  onEdit: (template: TemplateFile) => void;
}

function ContentSection({ title, templates, onEdit }: ContentSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayTemplates = showAll ? templates : templates.slice(0, 5);

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <h2 className="text-lg font-roobert-bold text-white">{title}</h2>
        <div className="flex items-center gap-2">
          <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Template List */}
      <div className="divide-y divide-slate-700/30">
        {displayTemplates.map((template) => (
          <TemplateRow key={template.id} template={template} onEdit={onEdit} />
        ))}
      </div>

      {/* View All Button */}
      {templates.length > 5 && (
        <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700/30">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            {showAll ? 'Show Less' : `View All ${templates.length - 5} More`}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>
      )}
    </div>
  );
}

interface TemplateRowProps {
  template: TemplateFile;
  onEdit: (template: TemplateFile) => void;
  onDelete?: (template: TemplateFile) => void;
}

function TemplateRow({ template, onEdit, onDelete }: TemplateRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = (template: TemplateFile) => {
    // Use _published field if available, otherwise fall back to status
    const isPublished = template._published !== undefined ? template._published : template.status === 'published';
    
    if (isPublished) {
      return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">Published</span>;
    } else {
      return <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">Draft</span>;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-3 py-1.5 hover:bg-slate-800/30 transition-colors cursor-pointer rounded-lg"
    >
      <div className="grid grid-cols-[8px_1fr_85px_80px_50px_80px] gap-3 items-center">
        {/* Status Indicator */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
          (template._published !== undefined ? template._published : template.status === 'published') ? 'bg-green-400' : 'bg-orange-400'
        }`} />

        {/* Template Name */}
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">{template.shortName || template.name}</div>
        </div>

        {/* Stage Badge */}
        <div className="flex justify-start">
          {getStatusBadge(template)}
        </div>

        {/* Timestamp */}
        <div className="text-[10px] text-slate-400 text-right">{template.lastUpdated}</div>

        {/* Views (if available) */}
        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
          {template.views !== undefined && (
            <>
              <Eye className="w-3 h-3" />
              <span>{template.views}</span>
            </>
          )}
        </div>

          {/* Actions - Always rendered but opacity controlled */}
          <div className="flex items-center gap-1.5 min-w-[80px] justify-end flex-shrink-0">
            <motion.button
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(template)}
              className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
              style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
            >
              <Edit2 className="w-3 h-3" />
            </motion.button>
            <motion.button
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
              style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
            >
              <Eye className="w-3 h-3" />
            </motion.button>
            {template.category === 'leadership' && onDelete && (
              <motion.button
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.15 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(template);
                }}
                className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
  );
}

function QuickSettings() {
  return (
    <div className="space-y-6">
      {/* Quick Settings Panel */}
      <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-roobert-bold text-white mb-4">Quick Settings</h3>
        
        <div className="space-y-4">
          <SettingRow label="CMS Theme" value="Light" isDark={false} />
          <SettingRow label="API Health" value="Dark" isDark={true} badge="All APIs operational" />
          <SettingRow label="Password Access" value="On" isDark={false} isActive={true} />
          
          <div className="pt-4 border-t border-slate-700/30">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-3 h-3 text-cyan-400" />
              <span>Indexed 2,589 Pages · 31ms</span>
              <Upload className="w-3 h-3 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Articles Preview */}
      <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-roobert-bold text-white mb-4">Articles</h3>
        
        <div className="space-y-3">
          <ArticlePreview 
            title="Forecasting Models Comparison"
            updated="6 days ago"
          />
          <ArticlePreview 
            title="Driving Pipeline with Demo Automation"
            updated="2 weeks ago"
          />
        </div>
      </div>

      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Settings
      </motion.button>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  value: string;
  isDark?: boolean;
  isActive?: boolean;
  badge?: string;
}

function SettingRow({ label, value, isDark, isActive, badge }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-xs text-slate-400">{badge}</span>
        )}
        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
          isDark ? 'bg-slate-800 text-white' : 
          isActive ? 'bg-cyan-500/20 text-cyan-400' : 
          'bg-slate-700 text-slate-300'
        }`}>
          {value}
        </div>
      </div>
    </div>
  );
}

interface ArticlePreviewProps {
  title: string;
  updated: string;
}

function ArticlePreview({ title, updated }: ArticlePreviewProps) {
  return (
    <div className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
      <div className="text-sm font-medium text-white mb-1">{title}</div>
      <div className="text-xs text-slate-400">Updated {updated}</div>
    </div>
  );
}
