import { useState, useEffect } from 'react';
import { FileText, Lightbulb, Building2, Upload, Trash2, ExternalLink, RefreshCw, CheckCircle, AlertCircle, TrendingUp, Plus, Shield, ShieldOff, BookOpen, FolderOpen, GitBranch, Grid3x3, List, MessageCircle, StickyNote, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { AuthProvider } from './contexts/AuthContext';
import CMSHeader from './components/CMSHeader';
import CMSv2Dashboard from './components/CMSv2Dashboard';
import EditorModal from './components/EditorModalV2';
import LeadershipSummaryEditor from './components/LeadershipSummaryEditor';
import LeadershipBUSummaryEditor from './components/LeadershipBUSummaryEditor';
import LeadershipBUSummaryEditorV2 from './components/LeadershipBUSummaryEditorV2';
import VendorEditor from './components/VendorEditor';
import VendorOverviewEditor from './components/VendorOverviewEditor';
import VendorPerf from './components/VendorPerf';
import VendorPerformanceV2 from './components/VendorPerformanceV2';
import VendorPerformanceEditorV2 from './components/VendorPerformanceEditorV2';
import VendorPerfEditor from './components/VendorPerfEditor';
import MultiVendorDashboardEditor from './components/MultiVendorDashboardEditor';
import VendorFeatureBreakdownEditor from './components/VendorFeatureBreakdownEditor';
import PerformanceDashboardEditor from './components/PerformanceDashboardEditor';
import ExecutiveHomeEditor from './components/ExecutiveHomeEditor';
import BusinessUnitEditor from './components/BusinessUnitEditor';
import VendorDashboardEditor from './components/VendorDashboardEditor';
import AssetDashboardManager from './components/AssetDashboardManager';
import AssetLibrary from './components/AssetLibrary';
import DesignSystemManager from './components/DesignSystemManager';
import DesignSystemInjector from './components/DesignSystemInjector';
import SystemSettingsManager from './components/SystemSettingsManager';
import DataSourcesManager from './components/DataSourcesManager';
import TemplateBuilder from './components/TemplateBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import CommentsPanel from './components/CommentsPanel';
import GoalsManager from './components/GoalsManager';
import GoalsHighLevel from './components/GoalsHighLevel';
import Goals from './pages/dark-theme/Goals';
import BudgetFinance from './components/BudgetFinance';
import BudgetFinanceEditor from './components/BudgetFinanceEditor';
import InitiativesManager from './components/InitiativesManager';
import InitiativesHero from './components/InitiativesHero';
import InitiativesGantt from './pages/InitiativesGantt';
import InitiativesGanttV2 from './pages/InitiativesGanttV2';
import BudgetPage from './pages/BudgetPage';
import PlatformOverview from './components/PlatformOverview';
import TimelineNotesManager from './components/TimelineNotesManager';
import { TaskEditorModal } from './components/TaskEditorModal';
import { AllTasksModal } from './components/AllTasksModal';
import AiWeeklySummaryModal from './components/AiWeeklySummaryModal';
import AIExecutiveSummaryWizard from './components/AIExecutiveSummaryWizard';
import weeklyLeadershipSummaryTemplate from './templates/weekly-leadership-summary-template.json';
import ContentEditor from './components/ContentEditor';
import PeopleManager from './components/PeopleManager';
import VendorManager from './components/VendorManager';
import OrgIQ from './pages/OrgIQ';
import './App.css';

const API_URL = 'http://localhost:3001/api';

type Section = 'all-content' | 'import';

interface Summary {
  id: string;
  quarter: string;
  year: number;
  title: string;
  date: string;
}

interface ExecutiveIQ {
  id: string;
  quarter: string;
  year: number;
  title: string;
  category: string;
  date: string;
}

interface Organization {
  id: string;
  name: string;
  lastUpdated: string;
}

interface Performance {
  id: string;
  date: string;
  displayName: string;
  demoStudio: {
    demosRegistered: number;
    demosLinkedToDeals: number;
    wonACV: number;
    conversionRate: number;
  };
}

function App() {
  const [cmsVersion, setCmsVersion] = useState<'v1' | 'v2'>('v2'); // Default to v2
  const [activeSection, setActiveSection] = useState<Section>('all-content');
  const [activeTagFilter, setActiveTagFilter] = useState<string>(''); // For filtering content by tag
  const [allContent, setAllContent] = useState<any[]>([]); // Unified content list (filtered)
  const [allContentUnfiltered, setAllContentUnfiltered] = useState<any[]>([]); // Complete unfiltered list for cloning
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'content'>('content');
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLeadershipEditor, setShowLeadershipEditor] = useState(false);
  const [showLeadershipBUEditor, setShowLeadershipBUEditor] = useState(false);
  const [showLeadershipBUEditorV2, setShowLeadershipBUEditorV2] = useState(false);
  const [showVendorSummary, setShowVendorSummary] = useState(false);
  const [showVendorOverview, setShowVendorOverview] = useState(false);
  const [showMultiVendorDashboard, setShowMultiVendorDashboard] = useState(false);
  const [showVendorFeatureBreakdown, setShowVendorFeatureBreakdown] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showNewSummaryModal, setShowNewSummaryModal] = useState(false);
  const [newSummaryName, setNewSummaryName] = useState('');
  const [creationMode, setCreationMode] = useState<'template' | 'clone'>('template');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [modalType, setModalType] = useState<'one-pager' | 'tabbed'>('one-pager');
  const [showAssetReference, setShowAssetReference] = useState(false);
  const [assetReferenceType, setAssetReferenceType] = useState<string | undefined>();
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showStyleScheme, setShowStyleScheme] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showDataSources, setShowDataSources] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showOrgIQ, setShowOrgIQ] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showGoalsHighLevel, setShowGoalsHighLevel] = useState(false);
  const [showGoalsDark, setShowGoalsDark] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | undefined>(undefined);
  const [showBudgetFinance, setShowBudgetFinance] = useState(false);
  const [showBudgetFinanceEditor, setShowBudgetFinanceEditor] = useState(false);
  const [showInitiatives, setShowInitiatives] = useState(false);
  const [showInitiativesHero, setShowInitiativesHero] = useState(false);
  const [showInitiativesGantt, setShowInitiativesGantt] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showPlatformOverview, setShowPlatformOverview] = useState(false);
  const [showTimelineNotes, setShowTimelineNotes] = useState(false);
  const [autoOpenAddNote, setAutoOpenAddNote] = useState(false);
  const [autoOpenNewInitiative, setAutoOpenNewInitiative] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  const [showAiWeeklySummary, setShowAiWeeklySummary] = useState(false);
  const [showAiExecutiveSummaryWizard, setShowAiExecutiveSummaryWizard] = useState(false);
  const [showNewLeadershipSummaryModal, setShowNewLeadershipSummaryModal] = useState(false);
  const [leadershipCreateMode, setLeadershipCreateMode] = useState<'blank' | 'duplicate' | 'ai'>('blank');
  const [leadershipDuplicateId, setLeadershipDuplicateId] = useState('');
  const [leadershipFilename, setLeadershipFilename] = useState('');
  const [isCreatingLeadershipSummary, setIsCreatingLeadershipSummary] = useState(false);
  const [editingTask, setEditingTask] = useState<any>();
  const [timelineNotes, setTimelineNotes] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [requireAuth, setRequireAuth] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showComments, setShowComments] = useState(false);
  const [activeCommentContent, setActiveCommentContent] = useState<{id: string, type: string, title: string} | null>(null);
  const [vendorActiveTab, setVendorActiveTab] = useState<'summaries' | 'performance'>('summaries');
  const [showVendorPerf, setShowVendorPerf] = useState(false);
  const [showVendorPerfEditor, setShowVendorPerfEditor] = useState(false);
  const [showVendorPerfView, setShowVendorPerfView] = useState(false);
  const [selectedVendorPerf, setSelectedVendorPerf] = useState<any>(null);
  const [showExecutiveHomeEditor, setShowExecutiveHomeEditor] = useState(false);
  const [showBusinessUnitEditor, setShowBusinessUnitEditor] = useState(false);
  const [showVendorDashboardEditor, setShowVendorDashboardEditor] = useState(false);
  const [showAssetDashboardEditor, setShowAssetDashboardEditor] = useState(false);
  const [showPeopleManager, setShowPeopleManager] = useState(false);
  const [showVendorManager, setShowVendorManager] = useState(false);
  
  // Tenant content creation states
  const [contentCreationType, setContentCreationType] = useState<'timeline' | 'performance' | 'organization' | 'initiative' | 'announcement' | 'vendor'>('timeline');
  const [selectedOrgSlug, setSelectedOrgSlug] = useState<string>('');
  const [selectedInitiativeSlug, setSelectedInitiativeSlug] = useState<string>('');
  const [tenantOrganizations, setTenantOrganizations] = useState<any[]>([]);
  const [tenantInitiatives, setTenantInitiatives] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, item: any} | null>(null);
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);

  // Check system settings for auth requirement
  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setRequireAuth(parsed.authentication?.cmsAdmin?.requireLogin || false);
    }
  }, []);

  // Fetch notes and tasks when AI Weekly Summary modal opens
  useEffect(() => {
    if (showAiWeeklySummary) {
      fetchNotesAndTasks();
    }
  }, [showAiWeeklySummary]);

  const fetchNotesAndTasks = async () => {
    try {
      const [notesRes, tasksRes] = await Promise.all([
        fetch('http://localhost:3001/api/timeline-notes'),
        fetch('http://localhost:3001/api/tasks')
      ]);
      const notesData = await notesRes.json();
      const tasksData = await tasksRes.json();
      // Extract arrays from API response structure
      setTimelineNotes(notesData.notes || notesData || []);
      setAllTasks(tasksData.tasks || tasksData || []);
    } catch (error) {
      console.error('Failed to fetch notes/tasks:', error);
      showNotification('error', 'Failed to load notes and tasks');
    }
  };

  useEffect(() => {
    if (activeSection === 'all-content') {
      fetchAllContent();
    }
  }, [activeSection, activeTagFilter]);

  // Load tags and comments on mount
  useEffect(() => {
    fetchTags();
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments`);
      if (response.ok) {
        const data = await response.json();
        setAllComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const getCommentCount = (contentId: string, contentType: string) => {
    return allComments.filter(c => c.contentId === contentId && c.contentType === contentType).length;
  };

  const openCommentsForContent = (contentId: string, contentType: string, title: string) => {
    setActiveCommentContent({ id: contentId, type: contentType, title });
    setShowComments(true);
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${API_URL}/content-tags`);
      if (response.ok) {
        const data = await response.json();
        // Check if data has tags property or is array directly
        const tagsArray = Array.isArray(data) ? data : (data.tags || []);
        setAvailableTags(tagsArray);
        // Set first tag as default if none selected
        if (!selectedTag && tagsArray.length > 0) {
          setSelectedTag(tagsArray[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      // Always fetch ALL content (unfiltered) to maintain complete list
      const response = await fetch(`${API_URL}/content`);
      if (response.ok) {
        const responseData = await response.json();
        const content = responseData.success ? responseData.content : responseData;
        
        // Add _type field for backwards compatibility with UI
        const enrichedContent = content.map((item: any) => ({
          ...item,
          _type: item._contentTag || 'content' // Use _contentTag as _type for UI
        }));
        
        // Store complete unfiltered list for clone dropdown
        setAllContentUnfiltered(enrichedContent);
        
        // Apply tag filter for display if active
        const filteredContent = activeTagFilter
          ? enrichedContent.filter((item: any) => item._contentTag === activeTagFilter)
          : enrichedContent;
        
        setAllContent(filteredContent);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      showNotification('error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = fetchAllContent; // Alias for backwards compatibility

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setAvailableTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      setAvailableTemplates([]); // Ensure it's always an array
    }
  };

  // Load templates when modal opens
  useEffect(() => {
    if (showNewSummaryModal) {
      fetchTemplates();
      fetchTenants();
    }
  }, [showNewSummaryModal]);

  // Listen for "Follow Goal" events from tasks
  useEffect(() => {
    const handleOpenGoal = (event: any) => {
      setShowGoals(true);
      // TODO: Pass goalId to GoalsManager to open specific goal
    };
    
    window.addEventListener('openGoal', handleOpenGoal as EventListener);
    return () => window.removeEventListener('openGoal', handleOpenGoal as EventListener);
  }, []);

  const fetchTenants = async () => {
    try {
      const [orgsRes, initiativesRes] = await Promise.all([
        fetch('http://localhost:3001/api/tenants?type=org'),
        fetch('http://localhost:3001/api/tenants?type=initiative')
      ]);
      
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        if (orgsData.success && orgsData.tenants) {
          setTenantOrganizations(orgsData.tenants);
        }
      }
      
      if (initiativesRes.ok) {
        const initiativesData = await initiativesRes.json();
        if (initiativesData.success && initiativesData.tenants) {
          setTenantInitiatives(initiativesData.tenants);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
  };

  // Task Handlers
  const handleTaskSave = async (task: any) => {
    try {
      const url = task.id 
        ? `http://localhost:3001/api/tasks/${task.id}` 
        : 'http://localhost:3001/api/tasks';
      const method = task.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });

      if (!response.ok) throw new Error('Failed to save task');
      
      showNotification('success', task.id ? 'Task updated successfully' : 'Task created successfully');
      setShowTaskModal(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Error saving task:', error);
      showNotification('error', 'Failed to save task');
    }
  };

  // Quick Actions Handlers
  const parseWeekRangeFromTitle = (title?: string) => {
    if (!title) return null;

    let match = title.match(/Week of\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/i);
    if (match) return { weekStart: match[1], weekEnd: match[2] };

    match = title.match(/Weekly Leadership Summary\s*-\s*([A-Za-z]{3})\s(\d{2})-(?:([A-Za-z]{3})\s)?(\d{2}),\s(\d{4})/);
    if (!match) return null;

    const monthMap: Record<string, string> = {
      jan: '01',
      feb: '02',
      mar: '03',
      apr: '04',
      may: '05',
      jun: '06',
      jul: '07',
      aug: '08',
      sep: '09',
      oct: '10',
      nov: '11',
      dec: '12'
    };

    const startMonth = monthMap[match[1].toLowerCase()];
    const endMonth = monthMap[(match[3] || match[1]).toLowerCase()];
    const startDay = match[2];
    const endDay = match[4];
    const year = match[5];

    if (!startMonth || !endMonth) return null;

    return {
      weekStart: `${year}-${startMonth}-${startDay}`,
      weekEnd: `${year}-${endMonth}-${endDay}`
    };
  };

  const formatWeeklyTitle = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return `Weekly Leadership Summary - ${start} to ${end}`;
    }

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.toLocaleDateString('en-US', { day: '2-digit' });
    const endDay = endDate.toLocaleDateString('en-US', { day: '2-digit' });
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `Weekly Leadership Summary - ${startMonth} ${startDay}-${endDay}, ${startYear}`;
      }
      return `Weekly Leadership Summary - ${startMonth} ${startDay}-${endMonth} ${endDay}, ${startYear}`;
    }

    return `Weekly Leadership Summary - ${startMonth} ${startDay}, ${startYear}-${endMonth} ${endDay}, ${endYear}`;
  };

  const normalizeLeadershipSummary = (data: any) => {
    const today = new Date().toISOString().split('T')[0];
    const parsedRange = parseWeekRangeFromTitle(data?.title);
    const weekStart = data?.metadata?.weekStart || parsedRange?.weekStart || today;
    const weekEnd = data?.metadata?.weekEnd || parsedRange?.weekEnd || today;

    const highlights = Array.isArray(data?.sections)
      ? data.sections.find((section: any) => section.id === 'highlights')
      : null;
    const highlightItems = highlights?.content?.[0]?.items || [];

    const formattedTitle = data?.metadata?.title || data?.title || formatWeeklyTitle(weekStart, weekEnd);

    return {
      ...data,
      title: formattedTitle,
      metadata: {
        weekStart,
        weekEnd,
        title: formattedTitle,
        description: data?.metadata?.description || 'Executive leadership summary'
      },
      bluf: data?.bluf || {
        bottomLine: highlightItems,
        background: '',
        assessment: '',
        recommendation: '',
        asks: []
      },
      priorities: data?.priorities || [],
      risks: data?.risks || []
    };
  };

  const normalizeLeadershipFilename = (value: string) =>
    value
      .replace(/\.json$/i, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '');

  const buildLeadershipSummaryId = (filename: string) => {
    const normalized = normalizeLeadershipFilename(filename);
    if (!normalized) return '';
    return normalized.startsWith('leadership-summary-')
      ? normalized
      : `leadership-summary-${normalized}`;
  };

  const buildLeadershipSummaryTitle = (filename: string) => {
    const normalized = normalizeLeadershipFilename(filename);
    if (!normalized) return '';
    const withoutPrefix = normalized.replace(/^leadership-summary-/, '');
    const withSpaces = withoutPrefix.replace(/[-_]+/g, ' ').trim();
    return withSpaces
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const leadershipSummaryIdExists = (id: string) =>
    allContentUnfiltered.some((item: any) => (item.id || item.meta?.id) === id);

  const openNewLeadershipSummaryModal = () => {
    setLeadershipCreateMode('blank');
    setLeadershipDuplicateId('');
    setLeadershipFilename('');
    setShowNewLeadershipSummaryModal(true);
  };

  const handleCreateBlankLeadershipSummary = async () => {
    if (isCreatingLeadershipSummary) return;
    const summaryId = buildLeadershipSummaryId(leadershipFilename);
    if (!summaryId) {
      showNotification('error', 'Enter a filename to create the summary');
      return;
    }
    if (leadershipSummaryIdExists(summaryId)) {
      showNotification('error', 'That filename already exists');
      return;
    }
    setIsCreatingLeadershipSummary(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const summaryTitle = buildLeadershipSummaryTitle(leadershipFilename);
      const template = JSON.parse(JSON.stringify(weeklyLeadershipSummaryTemplate));
      const summaryToSave = {
        ...template,
        id: summaryId,
        title: summaryTitle || template.title || `Weekly Leadership Summary - ${today}`,
        date: today,
        status: 'draft',
        _contentTag: 'leadership-summary',
        _published: false,
        metadata: {
          ...template.metadata,
          weekStart: today,
          weekEnd: today,
          title: summaryTitle || template.title || `Weekly Leadership Summary - ${today}`,
          description: template.metadata?.description || 'Executive leadership summary'
        }
      };

      const response = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryToSave)
      });

      if (!response.ok) throw new Error('Failed to create leadership summary');

      showNotification('success', 'Leadership summary created');
      setShowNewLeadershipSummaryModal(false);
      await fetchAllContent();
      setSelectedItem({ ...summaryToSave, _fileExists: true });
      setShowLeadershipEditor(true);
    } catch (error) {
      console.error('Failed to create leadership summary:', error);
      showNotification('error', 'Failed to create leadership summary');
    } finally {
      setIsCreatingLeadershipSummary(false);
    }
  };

  const handleDuplicateLeadershipSummary = async (summaryId: string) => {
    if (!summaryId || isCreatingLeadershipSummary) return;
    const nextSummaryId = buildLeadershipSummaryId(leadershipFilename);
    if (!nextSummaryId) {
      showNotification('error', 'Enter a filename to create the summary');
      return;
    }
    if (leadershipSummaryIdExists(nextSummaryId)) {
      showNotification('error', 'That filename already exists');
      return;
    }
    setIsCreatingLeadershipSummary(true);
    try {
      const response = await fetch(`${API_URL}/content/${summaryId}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      const sourceData = data.content || data;
      const today = new Date().toISOString().split('T')[0];
      const summaryTitle = buildLeadershipSummaryTitle(leadershipFilename);
      const normalized = normalizeLeadershipSummary(sourceData);

      const newSummary = {
        ...normalized,
        id: nextSummaryId,
        title: summaryTitle || normalized.title || `Weekly Leadership Summary - ${today}`,
        date: today,
        status: 'draft',
        _contentTag: 'leadership-summary',
        _published: false,
        meta: {
          ...(normalized.meta || {}),
          id: nextSummaryId,
          title: summaryTitle || normalized.title || `Weekly Leadership Summary - ${today}`,
          date: today,
          status: 'draft'
        }
      };

      const saveResponse = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSummary)
      });

      if (!saveResponse.ok) throw new Error('Failed to duplicate summary');

      showNotification('success', 'Leadership summary duplicated');
      setShowNewLeadershipSummaryModal(false);
      await fetchAllContent();
      setSelectedItem({ ...newSummary, _fileExists: true });
      setShowLeadershipEditor(true);
    } catch (error) {
      console.error('Failed to duplicate leadership summary:', error);
      showNotification('error', 'Failed to duplicate leadership summary');
    } finally {
      setIsCreatingLeadershipSummary(false);
    }
  };


  const handleCreateExecutiveSummary = async (summaryData: any) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const normalized = normalizeLeadershipSummary(summaryData);
      const summaryId = normalized.id || `leadership-summary-${today}-${Date.now().toString(36)}`;
      const summaryToSave = {
        ...normalized,
        id: summaryId,
        title: normalized.title || `Leadership Summary - ${today}`,
        date: normalized.date || today,
        status: normalized.status || 'draft',
        _contentTag: normalized._contentTag || 'leadership-summary',
        _published: normalized._published || false,
        meta: {
          id: summaryId,
          title: normalized.title || `Leadership Summary - ${today}`,
          date: normalized.date || today,
          quarter: normalized.quarter || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          year: normalized.year || new Date().getFullYear(),
          status: normalized.status || 'draft'
        }
      };

      const response = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryToSave)
      });

      if (!response.ok) throw new Error('Failed to create executive summary');

      showNotification('success', 'Executive summary created');
      setShowAiExecutiveSummaryWizard(false);
      await fetchAllContent();

      setSelectedContent({
        id: summaryToSave.id,
        category: 'leadership',
        name: summaryToSave.title
      });
      setShowContentEditor(true);
    } catch (error) {
      console.error('Failed to create executive summary:', error);
      showNotification('error', 'Failed to create executive summary');
    }
  };

  const handleQuickClone = async (tagId: string, tagName: string) => {
    try {
      // Find all content with this tag
      const taggedItems = allContentUnfiltered.filter(
        item => item._contentTag === tagId
      );

      if (taggedItems.length === 0) {
        showNotification('error', `No existing ${tagName} content found to duplicate`);
        return;
      }

      // Sort by date to get the latest
      const latestItem = taggedItems.sort((a, b) => {
        const dateA = new Date(a.date || a.lastUpdated || '').getTime();
        const dateB = new Date(b.date || b.lastUpdated || '').getTime();
        return dateB - dateA;
      })[0];

      // Fetch full content
      const response = await fetch(`${API_URL}/content/${latestItem.id}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      const sourceData = await response.json();

      // Create new ID with today's date
      const today = new Date().toISOString().split('T')[0];
      const newId = `${tagId}-${today}-${Date.now().toString(36)}`;

      // Clone the content with updated date
      const newContent = {
        ...sourceData,
        id: newId,
        date: today,
        title: sourceData.title ? `${sourceData.title} (Copy)` : `New ${tagName}`,
        displayName: sourceData.displayName ? `${sourceData.displayName} (Copy)` : `${tagName} ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        status: 'draft',
        lastUpdated: new Date().toISOString()
      };

      // Save the new content using generic /api/content endpoint
      const saveResponse = await fetch(`${API_URL}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContent)
      });

      if (!saveResponse.ok) throw new Error('Failed to create content');

      // Refresh data
      await fetchData();

      // Open in editor
      setSelectedItem(newContent);
      setModalOpen(true);
      showNotification('success', `${tagName} created from latest content`);
    } catch (error) {
      console.error('Failed to create content:', error);
      showNotification('error', `Failed to create ${tagName}`);
    }
  };

  const handleQuickNewContent = (type: 'timeline' | 'announcement' | 'organization' | 'vendor') => {
    setContentCreationType(type);
    if (type === 'timeline') {
      setSelectedTag(availableTags.find(t => t.id === 'weekly-summary')?.id || availableTags[0]?.id || '');
    } else if (type === 'announcement') {
      setSelectedTag('announcement');
    } else if (type === 'organization') {
      setSelectedTag('organization');
    } else if (type === 'vendor') {
      setSelectedTag('vendor');
    }
    setShowNewSummaryModal(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/import/${importType}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        showNotification('success', 'File imported successfully!');
        setSelectedFile(null);
        // Switch to the imported data type section
        setActiveSection(importType as Section);
      } else {
        showNotification('error', 'Failed to import file');
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('error', 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, item?: any) => {
    // Check if item is published/live
    if (item?.status === 'published') {
      showNotification('error', 'Cannot delete LIVE content. Please unpublish it first.');
      return;
    }

    // Show confirmation modal
    setItemToDelete({id, item});
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    // All content uses unified /api/content/ endpoint
    const endpoint = 'content';

    try {
      const response = await fetch(`${API_URL}/${endpoint}/${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Deleted successfully!');
        // Refresh the appropriate view
        if (activeSection === 'all-content') {
          fetchAllContent();
        } else {
          fetchData();
        }
      } else {
        showNotification('error', 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', 'Delete failed');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleEditItem = (item: any, type: 'content') => {
    // Warn if editing published content
    if (item.status === 'published') {
      setItemToEdit(item);
      setShowEditWarningModal(true);
      return;
    }
    
    // Check if item is leadership-summary - use custom editor
    if (item._contentTag === 'leadership-summary') {
      setSelectedItem({ ...item, _fileExists: true });
      setShowLeadershipEditor(true);
      return;
    }
    
    setSelectedItem({ ...item, _fileExists: true });
    setModalOpen(true);
  };

  const confirmEdit = () => {
    if (itemToEdit) {
      // Check if item is leadership-summary - use custom editor
      if (itemToEdit._contentTag === 'leadership-summary') {
        setSelectedItem({ ...itemToEdit, _fileExists: true });
        setShowLeadershipEditor(true);
        setShowEditWarningModal(false);
        setItemToEdit(null);
        return;
      }
      
      setSelectedItem({ ...itemToEdit, _fileExists: true });
      setModalOpen(true);
      setShowEditWarningModal(false);
      setItemToEdit(null);
    }
  };

  // Format ISO date to readable short format
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If within last week, show relative
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Otherwise show short date
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = now.getFullYear();
    
    return year === currentYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
  };

  // Calculate completion percentage for a summary
  const calculateSummaryCompletion = (summary: any): number => {
    const sectionWeights: { [key: string]: number } = {
      header: 2,
      highlights: 5,
      keyMetrics: 3,
      activityMetrics: 8,
      topAssets: 4,
      weeklyFocus: 5,
      departments: 9,
      initiatives: 8,
      risks: 6,
      issuesAndBlockers: 10,
      outlook: 7,
      sections: 6,
      content: 7,
      keyTakeaways: 5,
      recommendations: 6
    };

    const keys = Object.keys(summary).filter(
      key => !key.startsWith('_') && key !== 'id' && key !== 'status' && 
             key !== 'quarter' && key !== 'year' && key !== 'date' && 
             key !== 'title' && key !== 'displayName' && key !== 'name' && 
             key !== 'category' && key !== 'lastUpdated' && key !== 'protectionEnabled'
    );

    let totalWeight = 0;
    let completedWeight = 0;

    keys.forEach(key => {
      const enabledKey = `_enabled_${key}`;
      const completedKey = `_completed_${key}`;
      const isEnabled = summary[enabledKey] !== false;
      const isCompleted = summary[completedKey] === true;
      const weight = sectionWeights[key] || 5;

      if (isEnabled) {
        totalWeight += weight;
        if (isCompleted) {
          completedWeight += weight;
        }
      }
    });

    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  const handleSaveItem = async (data: any, status: 'draft' | 'published') => {
    try {
      // Use unified content endpoint
      const isNewItem = !data._fileExists;
      const method = isNewItem ? 'POST' : 'PUT';
      const url = isNewItem 
        ? `${API_URL}/content`
        : `${API_URL}/content/${data.id}`;
      
      // Remove the _fileExists flag before saving
      const { _fileExists, ...dataToSave } = data;
      
      // Ensure _contentTag field exists (default to 'content' if not set)
      if (!dataToSave._contentTag) {
        dataToSave._contentTag = 'content';
      }
      
      // DEBUG: Log asset title fields
      const assetTitleFields = Object.keys(dataToSave).filter(k => k.includes('_assetTitle'));
      console.log('🔍 App.tsx - Received data with asset titles:', assetTitleFields);
      assetTitleFields.forEach(field => {
        console.log(`   ${field}: "${dataToSave[field]}"`);
      });
      console.log('🔍 App.tsx - Sending to unified endpoint:', method, url);
      console.log('🔍 App.tsx - Content tag:', dataToSave._contentTag);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔍 App.tsx - Backend response:', responseData);
        showNotification('success', `Saved as ${status}!`);
        // Don't close modal here - let EditorModalV2 decide when to close
        // setModalOpen(false);
        fetchData();
      } else {
        showNotification('error', 'Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      showNotification('error', 'Save failed');
    }
  };

  const handleCreateNewSummary = async () => {
    if (!newSummaryName.trim()) {
      showNotification('error', 'Please enter a name for the summary');
      return;
    }

    if (creationMode === 'clone' && !selectedSourceId) {
      showNotification('error', 'Please select a summary to clone');
      return;
    }

    // Validate tenant selection for org/initiative content
    if (contentCreationType === 'organization' && !selectedOrgSlug) {
      showNotification('error', 'Please select an organization');
      return;
    }

    if (contentCreationType === 'initiative' && !selectedInitiativeSlug) {
      showNotification('error', 'Please select an initiative');
      return;
    }

    try {
      // Generate ID from name and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedName = newSummaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newId = `week-${sanitizedName}-${timestamp}`;

      let sourceData;
      
      // Announcements use a specific template
      if (contentCreationType === 'announcement') {
        try {
          const response = await fetch(`${API_URL}/templates/announcement-template`);
          if (!response.ok) throw new Error('Failed to fetch announcement template');
          const data = await response.json();
          sourceData = data.template;
        } catch (error) {
          console.error('Announcement template fetch error:', error);
          // Fallback to minimal template
          sourceData = {
            id: 'template-new',
            quarter: 'Month Day',
            year: new Date().getFullYear(),
            date: new Date().toISOString().split('T')[0],
            title: 'New Announcement',
            status: 'draft'
          };
        }
      } else if (creationMode === 'template') {
        // Use template
        if (selectedSourceId === 'default' || !selectedSourceId || selectedSourceId === 'default-with-charts') {
          // Fetch the first available template from templates folder
          try {
            const templatesResponse = await fetch(`${API_URL}/templates`);
            if (templatesResponse.ok) {
              const templatesData = await templatesResponse.json();
              const templates = templatesData.templates || [];
              
              if (templates.length > 0) {
                // Use first template found
                const firstTemplateId = templates[0].filename.replace('.json', '');
                const response = await fetch(`${API_URL}/templates/${firstTemplateId}`);
                if (!response.ok) throw new Error('Failed to fetch template');
                const data = await response.json();
                sourceData = data.template;
              } else {
                // No templates found - use minimal fallback
                sourceData = {
                  id: 'template-new',
                  quarter: 'Month Day',
                  year: new Date().getFullYear(),
                  date: new Date().toISOString().split('T')[0],
                  title: 'New Executive Summary',
                  status: 'draft'
                };
              }
            } else {
              throw new Error('Failed to fetch templates list');
            }
          } catch (error) {
            console.error('Template fetch error:', error);
            // Fallback to minimal template
            sourceData = {
              id: 'template-new',
              quarter: 'Month Day',
              year: new Date().getFullYear(),
              date: new Date().toISOString().split('T')[0],
              title: 'New Executive Summary',
              status: 'draft'
            };
          }
        } else {
          // Fetch custom template
          const response = await fetch(`${API_URL}/templates/${selectedSourceId}`);
          if (!response.ok) throw new Error('Failed to fetch template');
          const data = await response.json();
          sourceData = data.template;
        }
      } else {
        // Fetch the selected content to clone from unified endpoint
        const response = await fetch(`${API_URL}/content/${selectedSourceId}`);
        if (!response.ok) throw new Error('Failed to fetch source content');
        sourceData = await response.json();
      }

      // Create new summary from source
      const newSummary = {
        ...sourceData,
        id: newId,
        title: newSummaryName,
        date: timestamp,
        quarter: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        year: new Date().getFullYear(),
        status: 'draft',
        _layout: modalType, // Save the modal type (one-pager or tabbed)
        _contentTag: contentCreationType === 'performance' ? 'performance' 
                   : contentCreationType === 'organization' ? 'organization'
                   : contentCreationType === 'initiative' ? 'initiative'
                   : contentCreationType === 'announcement' ? 'announcement'
                   : contentCreationType === 'vendor' ? 'vendor'
                   : selectedTag, // Timeline uses selected tag
        _fileExists: false // Mark as new - file will be created on first save
      };

      // Add tenant metadata for org/initiative content
      if (contentCreationType === 'organization') {
        newSummary._tenant = {
          type: 'org',
          slug: selectedOrgSlug
        };
      } else if (contentCreationType === 'initiative') {
        newSummary._tenant = {
          type: 'initiative',
          slug: selectedInitiativeSlug
        };
      }

      // Don't POST immediately - open in editor and let user save when ready
      showNotification('success', `Opening new ${creationMode === 'clone' ? 'cloned' : ''} summary in editor...`);
      setShowNewSummaryModal(false);
      setNewSummaryName('');
      setSelectedSourceId('');
      setCreationMode('template');
      setContentCreationType('timeline');
      setSelectedOrgSlug('');
      setSelectedInitiativeSlug('');
      
      // Open in editor
      setSelectedItem(newSummary);
      setModalOpen(true);
    } catch (error) {
      console.error('Create error:', error);
      showNotification('error', 'Failed to create new summary');
    }
  };

  // Navigation items removed - now using Notes system with dynamic content tags

  const renderContent = () => {
    if (activeSection === 'import') {
      return (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border-2 border-fis-raspberry/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-raspberry to-fis-eggplant flex items-center justify-center flex-shrink-0">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                  Import JSON Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Upload JSON template files to import new summaries, articles, or organization data into the system.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleFileUpload} className="glass-strong rounded-2xl p-8 card-shadow border-2 border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3">
                  Upload JSON File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-4 rounded-xl glass border-2 border-white/20 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fis-navy file:text-white file:font-roobert-medium hover:file:bg-fis-eggplant file:cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-roobert-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload & Import Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <RefreshCw className="w-12 h-12 text-fis-raspberry animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-roobert-medium">Loading data...</p>
        </div>
      );
    }

    // Filter content by active tag AND exclude vendors from main view
    let items: any[] = activeTagFilter 
      ? allContent.filter(item => item._contentTag === activeTagFilter)
      : allContent.filter(item => item._contentTag !== 'vendor');

    return (
      <>
        {/* Filter Display - Grid View Only */}
        {viewMode === 'grid' && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-roobert-medium text-gray-600 dark:text-gray-400">
              Filter:
            </span>
            {activeTagFilter ? (
              <button
                onClick={() => setActiveTagFilter('')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white text-sm font-roobert-medium hover:shadow-lg transition-all"
              >
                {availableTags.find(t => t.id === activeTagFilter)?.name || activeTagFilter}
                <span className="text-white/80">×</span>
              </button>
            ) : (
              availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTagFilter(tag.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-roobert-medium transition-all ${
                    tag.color === 'primary' ? 'bg-fis-eggplant/10 text-fis-eggplant dark:text-fis-raspberry hover:bg-fis-eggplant/20'
                    : tag.color === 'secondary' ? 'bg-fis-raspberry/10 text-fis-raspberry hover:bg-fis-raspberry/20'
                    : tag.color === 'tertiary' ? 'bg-fis-navy/10 text-fis-navy dark:text-blue-400 hover:bg-fis-navy/20'
                    : tag.color === 'blue' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20'
                    : tag.color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                    : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20'
                  }`}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>
        )}

        {viewMode === 'grid' ? (
          items.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-roobert-medium mb-2">
                No items found
              </p>
              <p className="text-sm text-gray-400">
                Upload a JSON file from the Import Data section to get started.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const itemTag = availableTags.find(t => t.id === item._contentTag);
            const IconComponent = itemTag?.icon === 'FileText' ? FileText
              : itemTag?.icon === 'Lightbulb' ? Lightbulb
              : itemTag?.icon === 'Building2' ? Building2
              : itemTag?.icon === 'TrendingUp' ? TrendingUp
              : itemTag?.icon === 'BookOpen' ? BookOpen
              : itemTag?.icon === 'FolderOpen' ? FolderOpen
              : FileText;
            
            return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-strong rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 border-2 border-white/20 hover:border-fis-eggplant hover:shadow-2xl group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-roobert-semibold text-lg text-gray-900 dark:text-white">
                          {item.title || item.displayName || item.name || 'Untitled'}
                        </h3>
                        {item.status && (
                          <span className={`px-2 py-0.5 rounded text-xs font-roobert-bold uppercase ${
                            item.status === 'published' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-yellow-500 text-gray-900'
                          }`}>
                            {item.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {item.quarter && item.year ? `${item.quarter} ${item.year}` : (item.date || (item.lastUpdated ? formatDate(item.lastUpdated) : 'No date'))}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tag Badge */}
                    {item._contentTag && (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-roobert-medium ${
                        itemTag?.color === 'primary' ? 'bg-fis-eggplant/10 text-fis-eggplant dark:text-fis-raspberry'
                        : itemTag?.color === 'secondary' ? 'bg-fis-raspberry/10 text-fis-raspberry'
                        : itemTag?.color === 'tertiary' ? 'bg-fis-navy/10 text-fis-navy dark:text-blue-400'
                        : itemTag?.color === 'blue' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : itemTag?.color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                      }`}>
                        {itemTag?.name || item._contentTag}
                      </div>
                    )}
                    
                    {/* Date Badge */}
                    {(item.date || item.lastUpdated) && (
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-roobert-medium">
                        {item.date || formatDate(item.lastUpdated)}
                      </div>
                    )}
                    
                    {/* Draft Completion Badge */}
                    {item.status === 'draft' && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-roobert-medium">
                        {calculateSummaryCompletion(item)}% Complete
                      </div>
                    )}
                    
                    {/* Protection Badge (only for weekly summaries) */}
                    {item._contentTag === 'weekly-summary' && item.status === 'published' && (
                      <>
                        {item.protectionEnabled !== false ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-roobert-medium">
                            <Shield className="w-3 h-3" />
                            Protected
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-roobert-medium">
                            <ShieldOff className="w-3 h-3" />
                            Unprotected
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    const dataType = item._contentTag === 'weekly-summary' ? 'summaries'
                      : item._contentTag === 'executive-iq' ? 'executive-iq'
                      : item._contentTag === 'organizations' ? 'organizations'
                      : item._contentTag === 'performance' ? 'performance'
                      : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                      : item._contentTag === 'kb-categories' ? 'kb-categories'
                      : 'summaries';
                    handleEditItem(item, dataType as any);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-navy to-fis-eggplant text-white text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-roobert-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                      : item._contentTag === 'executive-iq' ? 'executive-iq'
                      : item._contentTag === 'organizations' ? 'organizations'
                      : item._contentTag === 'performance' ? 'performance'
                      : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                      : item._contentTag === 'kb-categories' ? 'kb-categories'
                      : 'summaries';
                    openCommentsForContent(item.id, contentType, item.title || item.name || item.displayName);
                  }}
                  className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 transition-all relative"
                  title="View comments"
                >
                  <MessageCircle className="w-4 h-4" />
                  {(() => {
                    const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                      : item._contentTag === 'executive-iq' ? 'executive-iq'
                      : item._contentTag === 'organizations' ? 'organizations'
                      : item._contentTag === 'performance' ? 'performance'
                      : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                      : item._contentTag === 'kb-categories' ? 'kb-categories'
                      : 'summaries';
                    return getCommentCount(item.id, contentType);
                  })() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {(() => {
                        const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                          : item._contentTag === 'executive-iq' ? 'executive-iq'
                          : item._contentTag === 'organizations' ? 'organizations'
                          : item._contentTag === 'performance' ? 'performance'
                          : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                          : item._contentTag === 'kb-categories' ? 'kb-categories'
                          : 'summaries';
                        return getCommentCount(item.id, contentType);
                      })()}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id, item)}
                  className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-600 hover:scale-110 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
            );
          })}
        </div>
          )
        ) : (
          // Table View
          <div className="flex gap-0 overflow-hidden rounded-2xl border-2 border-white/20">
            {/* Left Sidebar - Vertical Tags */}
            <div className="w-56 bg-gradient-to-b from-fis-eggplant via-fis-raspberry to-fis-navy pl-4 pr-0 py-4 flex flex-col gap-2">
              {/* All Content Button */}
              <button
                onClick={() => setActiveTagFilter('')}
                className={`w-full text-left px-6 py-3 transition-all font-roobert-medium text-sm ${
                  !activeTagFilter
                    ? 'bg-white text-fis-eggplant shadow-lg rounded-l-2xl'
                    : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg mr-4'
                }`}
              >
                All Content
              </button>

              {/* Tag Buttons */}
              {availableTags.map((tag) => {
                const TagIcon = tag.icon === 'FileText' ? FileText
                  : tag.icon === 'Lightbulb' ? Lightbulb
                  : tag.icon === 'Building2' ? Building2
                  : tag.icon === 'TrendingUp' ? TrendingUp
                  : tag.icon === 'BookOpen' ? BookOpen
                  : tag.icon === 'FolderOpen' ? FolderOpen
                  : FileText;

                return (
                  <button
                    key={tag.id}
                    onClick={() => setActiveTagFilter(tag.id)}
                    className={`w-full text-left px-6 py-3 transition-all font-roobert-medium text-sm flex items-center gap-2 ${
                      activeTagFilter === tag.id
                        ? 'bg-white text-fis-eggplant shadow-lg rounded-l-2xl'
                        : 'text-white/80 hover:text-white hover:bg-white/10 rounded-lg mr-4'
                    }`}
                  >
                    <TagIcon className="w-4 h-4" />
                    {tag.name}
                  </button>
                );
              })}
            </div>

            {/* Right Table */}
            <div className="flex-1 bg-gradient-to-b from-fis-eggplant via-fis-raspberry to-fis-navy pl-0 pr-6 py-4 min-h-full">
              <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-r-lg rounded-br-lg p-4 min-h-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">Title</th>
                      <th className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">Date</th>
                      <th className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">Status</th>
                      <th className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">% Complete</th>
                      <th className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">Tag</th>
                      <th className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 font-roobert-medium mb-2">
                            No items found
                          </p>
                          <p className="text-sm text-gray-400">
                            {activeTagFilter ? 'No items in this category. Try a different filter.' : 'Upload a JSON file from the Import Data section to get started.'}
                          </p>
                        </td>
                      </tr>
                    ) : items.map((item) => {
                      const itemTag = availableTags.find(t => t.id === item._contentTag);
                      
                      return (
                        <tr 
                          key={item.id}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-3 pr-4 text-sm font-light text-gray-900 dark:text-gray-100">
                            {item.title || item.displayName || item.name || 'Untitled'}
                          </td>
                          <td className="py-3 pr-4 text-xs font-light text-gray-500 dark:text-gray-400 text-center">
                            {item.date || (item.lastUpdated ? formatDate(item.lastUpdated) : 'N/A')}
                          </td>
                          <td className="py-3 pr-4 text-center">
                            {item.status && (
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-roobert-bold uppercase ${
                                item.status === 'published' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-yellow-500 text-gray-900'
                              }`}>
                                {item.status === 'published' ? 'Live' : 'Draft'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-xs font-light text-gray-600 dark:text-gray-300 text-center align-middle">
                            {item.status === 'draft' ? `${calculateSummaryCompletion(item)}%` : '-'}
                          </td>
                          <td className="py-3 pr-4 text-center">
                            {item._contentTag && (
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-roobert-medium ${
                                itemTag?.color === 'primary' ? 'bg-fis-eggplant/10 text-fis-eggplant dark:text-fis-raspberry'
                                : itemTag?.color === 'secondary' ? 'bg-fis-raspberry/10 text-fis-raspberry'
                                : itemTag?.color === 'tertiary' ? 'bg-fis-navy/10 text-fis-navy dark:text-blue-400'
                                : itemTag?.color === 'blue' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : itemTag?.color === 'green' ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                              }`}>
                                {itemTag?.name || item._contentTag}
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  const dataType = item._contentTag === 'weekly-summary' ? 'summaries'
                                    : item._contentTag === 'executive-iq' ? 'executive-iq'
                                    : item._contentTag === 'organizations' ? 'organizations'
                                    : item._contentTag === 'performance' ? 'performance'
                                    : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                                    : item._contentTag === 'kb-categories' ? 'kb-categories'
                                    : 'summaries';
                                  handleEditItem(item, dataType as any);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-fis-navy to-fis-eggplant text-white text-xs hover:shadow-lg transition-all flex items-center gap-1 font-roobert-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                                    : item._contentTag === 'executive-iq' ? 'executive-iq'
                                    : item._contentTag === 'organizations' ? 'organizations'
                                    : item._contentTag === 'performance' ? 'performance'
                                    : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                                    : item._contentTag === 'kb-categories' ? 'kb-categories'
                                    : 'summaries';
                                  openCommentsForContent(item.id, contentType, item.title || item.name || item.displayName);
                                }}
                                className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all relative"
                                title="View comments"
                              >
                                <MessageCircle className="w-4 h-4" />
                                {(() => {
                                  const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                                    : item._contentTag === 'executive-iq' ? 'executive-iq'
                                    : item._contentTag === 'organizations' ? 'organizations'
                                    : item._contentTag === 'performance' ? 'performance'
                                    : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                                    : item._contentTag === 'kb-categories' ? 'kb-categories'
                                    : 'summaries';
                                  return getCommentCount(item.id, contentType);
                                })() > 0 && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {(() => {
                                      const contentType = item._contentTag === 'weekly-summary' ? 'summaries'
                                        : item._contentTag === 'executive-iq' ? 'executive-iq'
                                        : item._contentTag === 'organizations' ? 'organizations'
                                        : item._contentTag === 'performance' ? 'performance'
                                        : item._contentTag === 'knowledge-base' ? 'knowledge-base'
                                        : item._contentTag === 'kb-categories' ? 'kb-categories'
                                        : 'summaries';
                                      return getCommentCount(item.id, contentType);
                                    })()}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item)}
                                className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-all"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vendors Section - Hero Card Display with Tabs */}
        {!activeTagFilter && viewMode === 'grid' && (() => {
          const vendorItems = allContent.filter(item => item._contentTag === 'vendor');
          const performanceItems = allContent.filter(item => item._contentTag === 'vendor-performance');
          if (vendorItems.length === 0 && performanceItems.length === 0) return null;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <h2 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    Vendor
                  </h2>
                  <div className="flex gap-2 bg-gray-100 dark:bg-slate-800/50 rounded-lg p-1">
                    <button
                      onClick={() => setVendorActiveTab('summaries')}
                      className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                        vendorActiveTab === 'summaries'
                          ? 'bg-white dark:bg-slate-700 text-fis-navy dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Summaries
                    </button>
                    <button
                      onClick={() => setVendorActiveTab('performance')}
                      className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                        vendorActiveTab === 'performance'
                          ? 'bg-white dark:bg-slate-700 text-fis-navy dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Performance
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (vendorActiveTab === 'summaries') {
                      setContentCreationType('vendor');
                      setShowNewSummaryModal(true);
                    } else {
                      setShowVendorPerfEditor(true);
                      setSelectedVendorPerf(null);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-fis-navy/10 hover:bg-fis-navy/20 text-fis-navy dark:text-blue-400 transition-all flex items-center gap-2 font-roobert-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  {vendorActiveTab === 'summaries' ? 'Add Summary' : 'Add Performance'}
                </button>
              </div>

              {/* Summaries Tab Content */}
              {vendorActiveTab === 'summaries' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {vendorItems.map((vendor, index) => {
                  const heroData = vendor.vendorHero || {};
                  const statusColor = heroData.healthStatus === 'On Track' ? 'green'
                    : heroData.healthStatus === 'At Risk' ? 'yellow'
                    : 'red';

                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      onClick={() => handleEditItem(vendor, 'content')}
                      className="relative overflow-hidden rounded-2xl cursor-pointer group"
                      style={{ height: '320px' }}
                    >
                      {/* Hero Background with Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-fis-navy via-fis-eggplant to-fis-raspberry">
                        {heroData.vendorLogo && (
                          <img 
                            src={heroData.vendorLogo} 
                            alt={heroData.vendorName}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                          />
                        )}
                      </div>

                      {/* Dark Gradient Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="relative h-full p-6 flex flex-col justify-between text-white">
                        {/* Top: Status Badge */}
                        <div className="flex justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${
                            statusColor === 'green' ? 'bg-green-500/90' 
                            : statusColor === 'yellow' ? 'bg-yellow-500/90'
                            : 'bg-red-500/90'
                          }`}>
                            {heroData.healthStatus || 'Unknown'}
                          </span>
                        </div>

                        {/* Middle: Vendor Info */}
                        <div className="text-center">
                          <h3 className="text-2xl font-roobert-heavy mb-2">
                            {heroData.vendorName || vendor.title}
                          </h3>
                          {heroData.vendorTagline && (
                            <p className="text-sm text-white/80 font-roobert-light">
                              {heroData.vendorTagline}
                            </p>
                          )}
                        </div>

                        {/* Bottom: Key Metrics */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-2xl font-roobert-bold">
                              {heroData.activeProjects || 0}
                            </div>
                            <div className="text-xs text-white/70 font-roobert-medium">
                              Active
                            </div>
                          </div>
                          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-lg font-roobert-bold">
                              {vendor.status === 'published' ? '🟢' : '⚪'}
                            </div>
                            <div className="text-xs text-white/70 font-roobert-medium">
                              Status
                            </div>
                          </div>
                          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                            <div className="text-sm font-roobert-bold truncate">
                              {heroData.totalBudget || '$0'}
                            </div>
                            <div className="text-xs text-white/70 font-roobert-medium">
                              Budget
                            </div>
                          </div>
                        </div>

                        {/* Hover Effect: View Details */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-roobert-semibold text-lg flex items-center gap-2">
                            View Details <ChevronRight className="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              )}

              {/* Performance Tab Content */}
              {vendorActiveTab === 'performance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {performanceItems.map((perf, index) => (
                    <motion.div
                      key={perf.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        setSelectedVendorPerf(perf);
                        setShowVendorPerfEditor(true);
                      }}
                      className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                          {perf.meta?.vendor || 'Vendor Performance'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${
                          perf._published
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {perf._published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-white/60 font-roobert-medium mb-4">
                        {perf.meta?.quarter} {perf.meta?.year}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-white/50 font-roobert-medium mb-1">
                            Revenue
                          </div>
                          <div className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                            {perf.revenueSupported?.total || '$0'}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-white/50 font-roobert-medium mb-1">
                            Assets
                          </div>
                          <div className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                            {perf.currentAssets?.total || 0}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })()}
      </>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <PresentationProvider>
          {/* Design System CSS Variable Injector - Always mounted */}
          <DesignSystemInjector />
          
          <ProtectedRoute requireAuth={requireAuth} appName="CMS Admin">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant transition-colors duration-500">
              {/* Only show header and toggle in v1 mode */}
              {cmsVersion === 'v1' && (
                <>
                  <CMSHeader 
                    onOpenAssetReference={() => setShowAssetReference(true)}
                    onOpenStyleScheme={() => setShowStyleScheme(true)}
                    onOpenSystemSettings={() => setShowSystemSettings(true)}
                    onOpenDataSources={() => setShowDataSources(true)}
                    onOpenTemplateBuilder={() => setShowTemplateBuilder(true)}
                    onOpenOrgIQ={() => setShowOrgIQ(true)}
                    onOpenPlatformOverview={() => setShowPlatformOverview(true)}
                    onOpenComments={() => setShowComments(true)}
                    onOpenGoals={() => setShowGoals(true)}
                    onOpenInitiatives={() => setShowInitiatives(true)}
                    onOpenInitiativesGantt={() => setShowInitiativesGantt(true)}
                    onOpenBudget={() => setShowBudget(true)}
                    onOpenNotes={() => setShowTimelineNotes(true)}
                    onOpenTasks={() => setShowAllTasksModal(true)}
                    onOpenVendorSummary={() => setShowVendorSummary(true)}
                    onOpenVendorOverview={() => setShowVendorOverview(true)}
                    onOpenMultiVendorDashboard={() => setShowMultiVendorDashboard(true)}
                    onOpenVendorFeatureBreakdown={() => setShowVendorFeatureBreakdown(true)}
                    onOpenPerformanceDashboard={() => setShowPerformanceDashboard(true)}
                  />

                  {/* CMS Version Toggle - Floating Top Right */}
                  <div className="fixed top-24 right-6 z-50">
                    <div className="flex items-center gap-2 bg-slate-800 dark:bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-lg">
                      <button
                        onClick={() => setCmsVersion('v1')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                          cmsVersion === 'v1'
                            ? 'bg-purple-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        CMS v1
                      </button>
                      <button
                        onClick={() => setCmsVersion('v2')}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                          cmsVersion === 'v2'
                            ? 'bg-cyan-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        CMS v2
                      </button>
                    </div>
                  </div>
                </>
              )}
          
              {/* Notification */}
              <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 right-4 z-[200] glass-strong rounded-xl p-4 border-2 border-white/20 shadow-2xl max-w-md"
              >
                <div className="flex items-start gap-3">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                  ) : notification.type === 'error' ? (
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                  ) : notification.type === 'warning' ? (
                    <AlertCircle className="w-6 h-6 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  )}
                  <p className="text-gray-900 dark:text-white font-roobert-medium">{notification.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional Rendering based on CMS Version */}
          {cmsVersion === 'v2' ? (
            <CMSv2Dashboard 
              onOpenEditor={(template) => {
                // Route to ContentEditor for content files
                if (template.editorComponent === 'ContentEditor') {
                  setSelectedContent(template);
                  setShowContentEditor(true);
                } else if (template.editorComponent === 'VendorPerfEditor') {
                  // Load vendor performance data and open view modal
                  fetch(`http://localhost:3001/api/content/${template.id}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.success) {
                        setSelectedVendorPerf(data.content);
                        setShowVendorPerfView(true);
                      } else {
                        showNotification('error', 'Failed to load vendor performance data');
                      }
                    })
                    .catch(err => {
                      console.error('Error loading vendor performance:', err);
                      showNotification('error', 'Error loading vendor performance');
                    });
                } else {
                  // Legacy editors for old templates
                  switch (template.editorComponent) {
                    case 'LeadershipEditor':
                      setShowLeadershipEditor(true);
                      break;
                    case 'VendorEditor':
                      setShowVendorSummary(true);
                      break;
                    case 'VendorOverviewEditor':
                      setShowVendorOverview(true);
                      break;
                    case 'PerformanceDashboardEditor':
                      setShowPerformanceDashboard(true);
                      break;
                    default:
                      showNotification('info', `Opening ${template.name}...`);
                  }
                }
              }}
              onQuickAction={(action) => {
                switch (action) {
                  case 'new-note':
                    setShowTimelineNotes(true);
                    setAutoOpenAddNote(true);
                    showNotification('info', 'Opening new note editor...');
                    break;
                  case 'new-task':
                    setShowTaskModal(true);
                    setEditingTask(undefined);
                    showNotification('info', 'Opening new task creator...');
                    break;
                  case 'new-initiative':
                    setShowInitiatives(true);
                    setAutoOpenNewInitiative(true);
                    showNotification('info', 'Opening new initiative creator...');
                    break;
                  case 'new-leadership':
                    openNewLeadershipSummaryModal();
                    showNotification('info', 'Choose how to create a Leadership Summary');
                    break;
                  case 'new-leadership-bu':
                    setShowLeadershipBUEditor(true);
                    showNotification('info', 'Opening Leadership BU Summary Editor...');
                    break;
                  case 'new-leadership-bu-v2':
                    setShowLeadershipBUEditorV2(true);
                    showNotification('info', 'Opening Leadership Summary V2 (Multi-BU Compact Layout)...');
                    break;
                  case 'new-vendor':
                    showNotification('info', 'Creating new Vendor Summary...');
                    // TODO: Create new vendor summary
                    break;
                  case 'new-performance':
                    showNotification('info', 'Creating new Performance Report...');
                    // TODO: Create new performance report
                    break;
                  case 'ai-exec-summary':
                    setShowAiExecutiveSummaryWizard(true);
                    showNotification('info', 'Opening AI Executive Summary Builder...');
                    break;
                  case 'executive-home':
                    setShowExecutiveHomeEditor(true);
                    showNotification('info', 'Opening Executive Home Editor...');
                    break;
                  case 'edit-business-unit':
                    setShowBusinessUnitEditor(true);
                    showNotification('info', 'Opening Business Unit Editor...');
                    break;
                  case 'vendor-dashboard':
                    setShowVendorDashboardEditor(true);
                    showNotification('info', 'Opening Vendor Dashboard Editor...');
                    break;
                  case 'asset-dashboard':
                    setShowAssetDashboardEditor(true);
                    showNotification('info', 'Opening Asset Dashboard Editor...');
                    break;
                  case 'manage-people':
                    setShowPeopleManager(true);
                    showNotification('info', 'Opening People Manager...');
                    break;
                  case 'manage-vendors':
                    setShowVendorManager(true);
                    showNotification('info', 'Opening Vendor Manager...');
                    break;
                  default:
                    showNotification('info', `Action: ${action}`);
                }
              }}
              onOpenGoals={() => setShowGoals(true)}
              onOpenGoalsHighLevel={() => setShowGoalsHighLevel(true)}
              onOpenGoalsDark={() => setShowGoalsDark(true)}
              onOpenInitiatives={() => setShowInitiatives(true)}
              onOpenInitiativesGantt={() => setShowInitiativesGantt(true)}
              onOpenInitiativesHero={() => setShowInitiativesHero(true)}
              onOpenBudget={() => setShowBudget(true)}
              onOpenBudgetFinance={() => setShowBudgetFinance(true)}
              onOpenNotes={() => setShowTimelineNotes(true)}
              onOpenTasks={() => setShowAllTasksModal(true)}
              onOpenPlatformOverview={() => setShowPlatformOverview(true)}
              onOpenOrgIQ={() => setShowOrgIQ(true)}
              onOpenTemplateBuilder={() => setShowTemplateBuilder(true)}
              onOpenSystemSettings={() => setShowSystemSettings(true)}
              onOpenDataSources={() => setShowDataSources(true)}
              onOpenAssetReference={() => setShowAssetReference(true)}
              onOpenStyleScheme={() => setShowStyleScheme(true)}
            />
          ) : (
          <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Top Action Bar - Stats + Action Buttons (only for all-content section) */}
              {activeSection === 'all-content' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between">
                    {/* Stats - Left Side */}
                    <p className="text-gray-600 dark:text-gray-300">
                      {activeTagFilter 
                        ? `Showing ${availableTags.find(t => t.id === activeTagFilter)?.name || 'filtered'} content` 
                        : 'Showing all content'}. Total items: <span className="font-roobert-bold">{allContent.filter(item => activeTagFilter ? item._contentTag === activeTagFilter : true).length}</span>
                    </p>

                    {/* Action Buttons - Right Side */}
                    <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className="flex items-center bg-white/50 dark:bg-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-fis-eggplant text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded transition-all ${
                        viewMode === 'table' 
                          ? 'bg-fis-eggplant text-white' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={fetchData}
                    className="px-4 py-2 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all flex items-center gap-2 text-gray-700 dark:text-gray-200 font-roobert-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>

                  {/* Import Button */}
                  <button
                    onClick={() => {
                      setActiveSection('import');
                      setActiveTagFilter('');
                    }}
                    className="px-4 py-2 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-all font-roobert-semibold text-sm"
                  >
                    Import
                  </button>

                  {/* New Button */}
                  {activeSection === 'all-content' && (
                    <button
                      onClick={() => setShowNewSummaryModal(true)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white hover:shadow-lg transition-all flex items-center gap-2 font-roobert-semibold text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New
                    </button>
                  )}
                </div>
                </div>
                </motion.div>
              )}

              {/* Main Content Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-strong rounded-2xl p-6 card-shadow"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
          )}
          {/* End CMS Version Conditional */}

          {/* New Summary Modal */}
          <AnimatePresence>
            {showNewSummaryModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                onClick={() => setShowNewSummaryModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                        Create New Content
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Select content type and create as draft
                      </p>
                    </div>
                  </div>

                  {/* Content Type Tabs */}
                  <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button
                      onClick={() => {
                        setContentCreationType('timeline');
                        setSelectedTag(availableTags.find(t => t.id === 'weekly-summary')?.id || availableTags[0]?.id || '');
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'timeline'
                          ? 'text-fis-eggplant dark:text-fis-raspberry'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Timeline
                      {contentCreationType === 'timeline' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fis-eggplant dark:bg-fis-raspberry" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setContentCreationType('performance');
                        setSelectedTag('performance'); // Auto-tag as 'performance'
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'performance'
                          ? 'text-fis-eggplant dark:text-fis-raspberry'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Performance
                      {contentCreationType === 'performance' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fis-eggplant dark:bg-fis-raspberry" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setContentCreationType('organization');
                        setSelectedTag('organization'); // Auto-tag as 'organization'
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'organization'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Organization
                      {contentCreationType === 'organization' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setContentCreationType('initiative');
                        setSelectedTag('initiative'); // Auto-tag as 'initiative'
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'initiative'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Initiative
                      {contentCreationType === 'initiative' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setContentCreationType('announcement');
                        setSelectedTag('announcement'); // Auto-tag as 'announcement'
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'announcement'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Announcement
                      {contentCreationType === 'announcement' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setContentCreationType('vendor');
                        setSelectedTag('vendor'); // Auto-tag as 'vendor'
                      }}
                      className={`px-3 py-2 font-roobert-semibold text-xs transition-all relative whitespace-nowrap ${
                        contentCreationType === 'vendor'
                          ? 'text-fis-navy dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      Vendor
                      {contentCreationType === 'vendor' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-fis-navy dark:bg-blue-400" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Organization/Initiative Selector */}
                    {(contentCreationType === 'organization' || contentCreationType === 'initiative') && (
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Select {contentCreationType === 'organization' ? 'Organization' : 'Initiative'}
                        </label>
                        <select
                          value={contentCreationType === 'organization' ? selectedOrgSlug : selectedInitiativeSlug}
                          onChange={(e) => contentCreationType === 'organization' ? setSelectedOrgSlug(e.target.value) : setSelectedInitiativeSlug(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select {contentCreationType === 'organization' ? 'Organization' : 'Initiative'} --</option>
                          {(contentCreationType === 'organization' ? tenantOrganizations : tenantInitiatives).map((item) => (
                            <option key={item.id} value={item.slug}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Content Tag - Timeline: Selectable | Others: Auto-assigned (locked) */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Content Tag
                      </label>
                      
                      {/* Timeline: User can select tag (only weekly-summary and executive-iq) */}
                      {contentCreationType === 'timeline' && (
                        <select
                          value={selectedTag}
                          onChange={(e) => setSelectedTag(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                        >
                          {availableTags
                            .filter(tag => ['weekly-summary', 'executive-iq'].includes(tag.id))
                            .map((tag) => (
                              <option key={tag.id} value={tag.id}>
                                {tag.name}
                              </option>
                            ))}
                        </select>
                      )}

                      {/* Performance/Org/Initiative: Auto-assigned (locked) */}
                      {contentCreationType === 'performance' && (
                        <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white flex items-center justify-between">
                          <span className="font-roobert-medium">Performance</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-md">Auto-assigned</span>
                        </div>
                      )}

                      {contentCreationType === 'organization' && (
                        <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white flex items-center justify-between">
                          <span className="font-roobert-medium">Organization</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-md">Auto-assigned</span>
                        </div>
                      )}

                      {contentCreationType === 'initiative' && (
                        <div className="px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 text-gray-900 dark:text-white flex items-center justify-between">
                          <span className="font-roobert-medium">Initiative</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-md">Auto-assigned</span>
                        </div>
                      )}

                      {contentCreationType === 'announcement' && (
                        <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-gray-900 dark:text-white flex items-center justify-between">
                          <span className="font-roobert-medium">Announcement</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-md">Auto-assigned</span>
                        </div>
                      )}

                      {contentCreationType === 'vendor' && (
                        <div className="px-4 py-3 rounded-lg bg-fis-navy/10 dark:bg-blue-900/20 border-2 border-fis-navy/20 dark:border-blue-800 text-gray-900 dark:text-white flex items-center justify-between">
                          <span className="font-roobert-medium">Vendor</span>
                          <span className="text-xs text-fis-navy dark:text-blue-400 bg-fis-navy/10 dark:bg-blue-900/40 px-2 py-1 rounded-md">Auto-assigned</span>
                        </div>
                      )}
                    </div>

                    {/* Content Type & Creation Method - Combined Row (Hidden for Announcements) */}
                    {contentCreationType !== 'announcement' && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Content Type Toggle */}
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Content Type
                        </label>
                        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                          <button
                            type="button"
                            onClick={() => setModalType('one-pager')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-roobert-medium transition-all relative z-10 ${
                              modalType === 'one-pager'
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            One-Pager
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalType('tabbed')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-roobert-medium transition-all relative z-10 ${
                              modalType === 'tabbed'
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Tabbed
                          </button>
                          {/* Sliding background */}
                          <div
                            className="absolute top-1 bottom-1 bg-fis-eggplant dark:bg-fis-raspberry rounded-md transition-all duration-200 ease-out"
                            style={{
                              left: modalType === 'one-pager' ? '4px' : '50%',
                              right: modalType === 'one-pager' ? '50%' : '4px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Creation Method Toggle */}
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Creation Method
                        </label>
                        <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                          <button
                            type="button"
                            onClick={() => {
                              setCreationMode('template');
                              setSelectedSourceId('');
                            }}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-roobert-medium transition-all relative z-10 ${
                              creationMode === 'template'
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Template
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreationMode('clone')}
                            className={`flex-1 px-3 py-2 rounded-md text-sm font-roobert-medium transition-all relative z-10 ${
                              creationMode === 'clone'
                                ? 'text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            Clone
                          </button>
                          {/* Sliding background */}
                          <div
                            className="absolute top-1 bottom-1 bg-fis-eggplant dark:bg-fis-raspberry rounded-md transition-all duration-200 ease-out"
                            style={{
                              left: creationMode === 'template' ? '4px' : '50%',
                              right: creationMode === 'template' ? '50%' : '4px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Template Selector (conditional for non-announcements only) */}
                    {contentCreationType !== 'announcement' && creationMode === 'template' && (
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Select Template
                        </label>
                        <select
                          value={selectedSourceId}
                          onChange={(e) => setSelectedSourceId(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select a template --</option>
                          {availableTemplates
                            .filter(template => !template.id.startsWith('announcement-'))
                            .map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                        {availableTemplates.filter(template => !template.id.startsWith('announcement-')).length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            No custom templates yet. Use Template Builder to create one.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Clone Source Selector (Not for announcements) */}
                    {contentCreationType !== 'announcement' && creationMode === 'clone' && (
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Select Content
                        </label>
                        <select
                          value={selectedSourceId}
                          onChange={(e) => setSelectedSourceId(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select content to clone --</option>
                          {/* Sort by tag, then by title - always show ALL content regardless of filters */}
                          {[...allContentUnfiltered].sort((a, b) => {
                            const tagCompare = (a._contentTag || 'zzz').localeCompare(b._contentTag || 'zzz');
                            if (tagCompare !== 0) return tagCompare;
                            return (a.title || a.displayName || a.name || '').localeCompare(b.title || b.displayName || b.name || '');
                          }).map((item) => (
                            <option key={item.id} value={item.id}>
                              [{item._contentTag || 'unknown'}] {item.title || item.displayName || item.name || item.id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Content Name */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Content Name
                      </label>
                      <input
                        type="text"
                        value={newSummaryName}
                        onChange={(e) => setNewSummaryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateNewSummary()}
                        placeholder="e.g., Demo Services Group - Weekly Update"
                        className={`w-full px-4 py-3 rounded-lg border-2 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          newSummaryName.trim() && allContent.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase())
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        autoFocus
                      />
                      {newSummaryName.trim() && allContent.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase()) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          A summary with this name already exists
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleCreateNewSummary}
                        disabled={
                          !newSummaryName.trim() || 
                          (creationMode === 'clone' && !selectedSourceId) || 
                          (contentCreationType === 'organization' && !selectedOrgSlug) ||
                          (contentCreationType === 'initiative' && !selectedInitiativeSlug) ||
                          allContent.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase())
                        }
                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create & Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowNewSummaryModal(false);
                          setNewSummaryName('');
                          setSelectedSourceId('');
                          setCreationMode('template');
                          setContentCreationType('timeline');
                          setSelectedOrgSlug('');
                          setSelectedInitiativeSlug('');
                          // Reset to first available tag
                          if (availableTags.length > 0) {
                            setSelectedTag(availableTags[0].id);
                          }
                        }}
                        className="px-6 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-fis-eggplant font-roobert-semibold text-gray-700 dark:text-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor Modal */}
          <EditorModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            data={selectedItem}
            dataType={selectedItem?._contentTag || 'content'}
            onSave={handleSaveItem}
            showNotification={showNotification}
          />

          {/* Leadership Editor (Custom for leadership-summary content) */}
          {showLeadershipEditor && selectedItem && (
            <LeadershipSummaryEditor
              data={selectedItem}
              onSave={async (data) => {
                await handleSaveItem(data, data.status || 'draft');
                setShowLeadershipEditor(false);
                const nextId = data?.id || selectedItem?.id;
                if (nextId) {
                  setSelectedContent({
                    id: nextId,
                    category: 'leadership',
                    name: data?.title || selectedItem?.title || 'Leadership Summary'
                  });
                  setShowContentEditor(true);
                }
              }}
              onClose={() => setShowLeadershipEditor(false)}
              isNewContent={!selectedItem.id}
            />
          )}

          {/* Leadership BU Summary Editor */}
          {showLeadershipBUEditor && (
            <LeadershipBUSummaryEditor
              onClose={() => setShowLeadershipBUEditor(false)}
            />
          )}

          {/* Leadership BU Summary Editor V2 */}
          {showLeadershipBUEditorV2 && (
            <LeadershipBUSummaryEditorV2
              onClose={() => setShowLeadershipBUEditorV2(false)}
            />
          )}

          {/* Vendor Summary Editor */}
          <AnimatePresence>
            {showVendorSummary && (
              <VendorEditor
                onClose={() => setShowVendorSummary(false)}
              />
            )}
          </AnimatePresence>

          {/* Vendor Overview Editor */}
          <AnimatePresence>
            {showVendorOverview && (
              <VendorOverviewEditor
                onClose={() => setShowVendorOverview(false)}
              />
            )}
          </AnimatePresence>

          {/* Multi-Vendor Dashboard Editor */}
          <AnimatePresence>
            {showMultiVendorDashboard && (
              <MultiVendorDashboardEditor
                onClose={() => setShowMultiVendorDashboard(false)}
              />
            )}
          </AnimatePresence>

          {/* Vendor Feature Breakdown Editor */}
          <AnimatePresence>
            {showVendorFeatureBreakdown && (
              <VendorFeatureBreakdownEditor
                onClose={() => setShowVendorFeatureBreakdown(false)}
              />
            )}
          </AnimatePresence>

          {/* Performance Dashboard Editor */}
          <AnimatePresence>
            {showPerformanceDashboard && (
              <PerformanceDashboardEditor
                onClose={() => setShowPerformanceDashboard(false)}
              />
            )}
          </AnimatePresence>

          {/* Executive Home Editor */}
          <AnimatePresence>
            {showExecutiveHomeEditor && (
              <ExecutiveHomeEditor
                onClose={() => setShowExecutiveHomeEditor(false)}
              />
            )}
          </AnimatePresence>

          {/* Business Unit Editor */}
          <AnimatePresence>
            {showBusinessUnitEditor && (
              <BusinessUnitEditor
                onClose={() => setShowBusinessUnitEditor(false)}
              />
            )}
          </AnimatePresence>

          {/* Vendor Dashboard Editor */}
          <AnimatePresence>
            {showVendorDashboardEditor && (
              <VendorDashboardEditor
                onClose={() => setShowVendorDashboardEditor(false)}
              />
            )}
          </AnimatePresence>

          {/* Asset Dashboard Manager */}
          <AnimatePresence>
            {showAssetDashboardEditor && (
              <AssetDashboardManager
                onNotification={showNotification}
                onClose={() => setShowAssetDashboardEditor(false)}
              />
            )}
          </AnimatePresence>

          {/* Asset Library Modal */}
          <AssetLibrary
            isOpen={showAssetReference}
            onClose={() => setShowAssetReference(false)}
            initialAssetType={assetReferenceType}
          />

          {/* Template Builder */}
          {showTemplateBuilder && (
            <div className="fixed inset-0 z-[100]">
              <TemplateBuilder 
                onBack={() => setShowTemplateBuilder(false)}
                showNotification={showNotification}
              />
            </div>
          )}

          {/* OrgIQ Page */}
          {showOrgIQ && (
            <div className="fixed inset-0 z-[100]">
              <div className="relative h-full">
                <button
                  onClick={() => setShowOrgIQ(false)}
                  className="absolute top-4 right-4 z-10 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  ← Back to CMS
                </button>
                <OrgIQ />
              </div>
            </div>
          )}

          {/* People Manager */}
          {showPeopleManager && (
            <PeopleManager 
              onNotification={showNotification}
              onClose={() => setShowPeopleManager(false)}
            />
          )}

          {/* Vendor Manager */}
          {showVendorManager && (
            <VendorManager 
              onNotification={showNotification}
              onClose={() => setShowVendorManager(false)}
            />
          )}

          {/* Style Scheme Manager */}
          {showStyleScheme && (
            <div className="fixed inset-0 z-[60]">
              <DesignSystemManager 
                onClose={() => setShowStyleScheme(false)}
                onNotification={showNotification}
              />
            </div>
          )}

          {/* System Settings Manager */}
          {showSystemSettings && (
            <div className="fixed inset-0 z-[60]">
              <SystemSettingsManager 
                onClose={() => {
                  setShowSystemSettings(false);
                  // Refresh tags and content after closing settings (in case tags were added/modified)
                  fetchTags();
                  fetchAllContent();
                }}
                onNotification={showNotification}
              />
            </div>
          )}

          {/* Data Sources Manager */}
          {showDataSources && (
            <DataSourcesManager
              onClose={() => setShowDataSources(false)}
              showNotification={showNotification}
            />
          )}

          {/* Goals Manager */}
          {showGoals && (
            <GoalsManager
              isOpen={showGoals}
              onClose={() => {
                setShowGoals(false);
                setEditGoalId(undefined);
              }}
              showNotification={showNotification}
              initialGoalId={editGoalId}
            />
          )}

          {/* Goals High Level Executive Summary */}
          {showGoalsHighLevel && (
            <GoalsHighLevel
              isOpen={showGoalsHighLevel}
              onClose={() => setShowGoalsHighLevel(false)}
            />
          )}

          {/* Goals Dark Theme - Full Screen */}
          {showGoalsDark && (
            <Goals 
              onClose={() => setShowGoalsDark(false)}
              onOpenGoalsManager={(goalId) => {
                setEditGoalId(goalId);
                setShowGoalsDark(false);
                setShowGoals(true);
              }}
            />
          )}

          {/* Budget & Finance View */}
          {showBudgetFinance && (
            <BudgetFinance
              isOpen={showBudgetFinance}
              onClose={() => setShowBudgetFinance(false)}
              onEdit={() => {
                setShowBudgetFinance(false);
                setShowBudgetFinanceEditor(true);
              }}
              showEdit={true}
            />
          )}

          {/* Budget & Finance Editor */}
          {showBudgetFinanceEditor && (
            <BudgetFinanceEditor
              isOpen={showBudgetFinanceEditor}
              onClose={() => setShowBudgetFinanceEditor(false)}
              showNotification={showNotification}
            />
          )}

          {/* Vendor Performance View */}
          {showVendorPerf && (
            <VendorPerformanceV2
              data={selectedVendorPerf}
              onClose={() => {
                setShowVendorPerf(false);
                setSelectedVendorPerf(null);
              }}
            />
          )}

          {/* Vendor Performance Editor */}
          {showVendorPerfView && selectedVendorPerf && (
            <VendorPerformanceV2
              data={selectedVendorPerf}
              onClose={() => {
                setShowVendorPerfView(false);
                setSelectedVendorPerf(null);
              }}
              onEdit={() => {
                setShowVendorPerfView(false);
                setShowVendorPerfEditor(true);
              }}
            />
          )}

          {showVendorPerfEditor && (
            <VendorPerformanceEditorV2
              data={selectedVendorPerf}
              onClose={() => {
                setShowVendorPerfEditor(false);
                setSelectedVendorPerf(null);
              }}
              onSave={async (data) => {
                try {
                  // Add metadata if not present
                  const saveData = {
                    ...data,
                    _contentTag: 'vendor-performance',
                    _published: true,
                    meta: {
                      ...data.meta,
                      id: data.meta?.id || `${data.meta?.vendor?.toLowerCase()}-performance-${data.meta?.quarter?.toLowerCase()}-${data.meta?.year}`,
                      title: `${data.meta?.vendor} Performance Metrics V2`,
                      createdAt: data.meta?.createdAt || new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                  };

                  const method = saveData.meta?.id ? 'PUT' : 'POST';
                  const endpoint = saveData.meta?.id 
                    ? `http://localhost:3001/api/content/${saveData.meta.id}`
                    : 'http://localhost:3001/api/content';

                  const response = await fetch(endpoint, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(saveData),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    showNotification('success', 'Vendor performance data saved successfully!');
                    setShowVendorPerfEditor(false);
                    setSelectedVendorPerf(null);
                    // Refresh vendor performance list if needed
                  } else {
                    showNotification('error', 'Failed to save vendor performance data');
                  }
                } catch (error) {
                  console.error('Error saving vendor performance:', error);
                  showNotification('error', 'Error saving vendor performance data');
                }
              }}
            />
          )}

          {/* Initiatives Manager */}
          {showInitiatives && (
            <InitiativesManager
              isOpen={showInitiatives}
              onClose={() => setShowInitiatives(false)}
              showNotification={showNotification}
              autoOpenNewInitiative={autoOpenNewInitiative}
              onAutoOpenConsumed={() => setAutoOpenNewInitiative(false)}
            />
          )}

          {/* Initiatives Gantt Chart */}
          {showInitiativesGantt && (
            <InitiativesGanttV2 onClose={() => setShowInitiativesGantt(false)} />
          )}

          {/* Initiatives Hero View */}
          {showInitiativesHero && (
            <InitiativesHero
              isOpen={showInitiativesHero}
              onClose={() => setShowInitiativesHero(false)}
              onInitiativeClick={(id) => {
                console.log('Open initiative details:', id);
                // TODO: Open initiative details modal
              }}
            />
          )}

          {/* Budget Page */}
          {showBudget && (
            <BudgetPage
              isOpen={showBudget}
              onClose={() => setShowBudget(false)}
              showNotification={showNotification}
            />
          )}

          {/* Platform Overview */}
          {showPlatformOverview && (
            <PlatformOverview onClose={() => setShowPlatformOverview(false)} />
          )}

          {/* Content Editor - New v2 Content Editor */}
          {showContentEditor && selectedContent && (
            <ContentEditor
              contentId={selectedContent.id}
              category={selectedContent.category}
              contentTitle={selectedContent.name}
              onClose={() => {
                setShowContentEditor(false);
                setSelectedContent(null);
              }}
              showNotification={showNotification}
            />
          )}

          {/* Timeline Notes Manager */}
          {showTimelineNotes && (
            <TimelineNotesManager
              onClose={() => {
                setShowTimelineNotes(false);
                setAutoOpenAddNote(false);
              }}
              showNotification={showNotification}
              autoOpenAddModal={autoOpenAddNote}
            />
          )}

          {/* Task Editor Modal */}
          {showTaskModal && (
            <TaskEditorModal
              task={editingTask}
              onSave={handleTaskSave}
              onClose={() => {
                setShowTaskModal(false);
                setEditingTask(undefined);
              }}
            />
          )}

          {/* Comments Panel */}
          <CommentsPanel
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            contentId={activeCommentContent?.id || null}
            contentType={activeCommentContent?.type || null}
            contentTitle={activeCommentContent?.title}
            onCommentChange={fetchComments}
          />

          {/* All Tasks Modal */}
          {showAllTasksModal && (
            <AllTasksModal
              onClose={() => setShowAllTasksModal(false)}
              onEditTask={(task) => {
                setEditingTask(task);
                setShowTaskModal(true);
              }}
              onCreateTask={() => {
                setEditingTask(undefined);
                setShowTaskModal(true);
              }}
              onOpenNotes={() => {
                setShowAllTasksModal(false);
                setShowTimelineNotes(true);
              }}
            />
          )}

          {/* New Leadership Summary Modal */}
          <AnimatePresence>
            {showNewLeadershipSummaryModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
                onClick={() => setShowNewLeadershipSummaryModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  onClick={(event) => event.stopPropagation()}
                  className="bg-slate-900 text-white rounded-2xl p-6 max-w-xl w-full border border-slate-700/60 shadow-2xl"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center flex-shrink-0 shadow-lg shadow-fis-raspberry/30">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-roobert-heavy text-white mb-1">
                        New Leadership Summary
                      </h3>
                      <p className="text-sm text-slate-300">
                        Choose how you want to create this summary.
                      </p>
                    </div>
                  </div>

                      <div className="mb-4">
                        <label className="text-sm font-roobert-semibold text-white">Filename</label>
                        <input
                          type="text"
                          value={leadershipFilename}
                          onChange={(event) => setLeadershipFilename(event.target.value)}
                          placeholder="leadership-summary-2026-02-10"
                          className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-700/70 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fis-raspberry/60"
                        />
                        <div className="mt-2 text-xs text-slate-300">
                          Saved as {buildLeadershipSummaryId(leadershipFilename) || 'leadership-summary-<name>'}.json
                        </div>
                        {leadershipCreateMode !== 'ai' && leadershipFilename.trim() === '' && (
                          <div className="mt-2 text-xs text-rose-300">Filename is required for blank or duplicate.</div>
                        )}
                        {leadershipCreateMode !== 'ai' &&
                          leadershipFilename.trim() !== '' &&
                          leadershipSummaryIdExists(buildLeadershipSummaryId(leadershipFilename)) && (
                            <div className="mt-2 text-xs text-rose-300">That filename already exists.</div>
                          )}
                      </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-slate-700/60 rounded-lg cursor-pointer bg-slate-900/70 hover:bg-slate-800/60 transition-colors">
                      <input
                        type="radio"
                        name="leadership-create-mode"
                        checked={leadershipCreateMode === 'blank'}
                        onChange={() => setLeadershipCreateMode('blank')}
                        className="mt-1 accent-fis-raspberry"
                      />
                      <div>
                        <div className="text-sm font-roobert-semibold text-white">Blank summary</div>
                        <div className="text-xs text-slate-300">Start from an empty leadership summary template.</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-slate-700/60 rounded-lg cursor-pointer bg-slate-900/70 hover:bg-slate-800/60 transition-colors">
                      <input
                        type="radio"
                        name="leadership-create-mode"
                        checked={leadershipCreateMode === 'duplicate'}
                        onChange={() => setLeadershipCreateMode('duplicate')}
                        className="mt-1 accent-fis-raspberry"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-roobert-semibold text-white">Duplicate existing</div>
                        <div className="text-xs text-slate-300 mb-2">Pick a prior summary to copy.</div>
                        {leadershipCreateMode === 'duplicate' && (
                          <select
                            value={leadershipDuplicateId}
                            onChange={(event) => setLeadershipDuplicateId(event.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-700/70 bg-slate-900 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fis-raspberry/60"
                          >
                            <option value="">Select a summary...</option>
                            {allContentUnfiltered
                              .filter((item: any) => item._contentTag === 'leadership-summary')
                              .map((item: any) => ({
                                id: item.id || item.meta?.id,
                                title: item.title || item.meta?.title || 'Untitled Summary',
                                status: item.status || item.meta?.status || 'draft'
                              }))
                              .filter((item: any) => item.id)
                              .map((item: any) => (
                                <option key={item.id} value={item.id}>
                                  {item.title} ({item.status})
                                </option>
                              ))}
                          </select>
                        )}
                      </div>
                    </label>

                      <label className="flex items-start gap-3 p-3 border border-slate-700/60 rounded-lg cursor-pointer bg-slate-900/70 hover:bg-slate-800/60 transition-colors">
                      <input
                        type="radio"
                        name="leadership-create-mode"
                        checked={leadershipCreateMode === 'ai'}
                        onChange={() => setLeadershipCreateMode('ai')}
                          className="mt-1 accent-fis-raspberry"
                      />
                      <div>
                          <div className="text-sm font-roobert-semibold text-white">AI Builder</div>
                          <div className="text-xs text-slate-300">Launch the AI Weekly Summary builder.</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowNewLeadershipSummaryModal(false)}
                        className="px-4 py-2 rounded-lg border border-slate-700/70 text-slate-200 font-roobert-medium hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={
                        isCreatingLeadershipSummary ||
                        (leadershipCreateMode !== 'ai' && leadershipFilename.trim() === '') ||
                        (leadershipCreateMode !== 'ai' &&
                          leadershipSummaryIdExists(buildLeadershipSummaryId(leadershipFilename))) ||
                        (leadershipCreateMode === 'duplicate' && !leadershipDuplicateId)
                      }
                      onClick={() => {
                        if (leadershipCreateMode === 'blank') {
                          handleCreateBlankLeadershipSummary();
                        } else if (leadershipCreateMode === 'duplicate') {
                          handleDuplicateLeadershipSummary(leadershipDuplicateId);
                        } else {
                          setShowNewLeadershipSummaryModal(false);
                          setShowAiWeeklySummary(true);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:opacity-90 disabled:opacity-50 shadow-lg shadow-fis-raspberry/30"
                    >
                      {isCreatingLeadershipSummary ? 'Working...' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Weekly Summary Modal */}
          {showAiWeeklySummary && (
            <AiWeeklySummaryModal
              onClose={() => setShowAiWeeklySummary(false)}
              showNotification={showNotification}
              notes={timelineNotes}
              tasks={allTasks}
            />
          )}

          {/* AI Executive Summary Wizard */}
          {showAiExecutiveSummaryWizard && (
            <AIExecutiveSummaryWizard
              isOpen={showAiExecutiveSummaryWizard}
              onClose={() => setShowAiExecutiveSummaryWizard(false)}
              onCreateSummary={handleCreateExecutiveSummary}
              showNotification={showNotification}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Delete Content
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this item? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-roobert-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Edit Warning Modal */}
          {showEditWarningModal && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Edit Published Content
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        ⚠️ <strong>WARNING:</strong> This content is <span className="text-green-600 dark:text-green-400 font-roobert-semibold">LIVE</span> and published.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Any changes you make will be <strong>immediately visible to users</strong>.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowEditWarningModal(false);
                      setItemToEdit(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmEdit}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-roobert-semibold transition-all"
                  >
                    Continue Editing
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </PresentationProvider>
  </AuthProvider>
</ThemeProvider>
  );
}

export default App;
