import { useState, useEffect } from 'react';
import { FileText, Lightbulb, Building2, Upload, Trash2, ExternalLink, RefreshCw, CheckCircle, AlertCircle, TrendingUp, Plus, Shield, ShieldOff, BookOpen, FolderOpen, GitBranch, Grid3x3, List, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { AuthProvider } from './contexts/AuthContext';
import CMSHeader from './components/CMSHeader';
import EditorModal from './components/EditorModalV2';
import { AssetTypeReferenceModal } from './components/AssetTypeReferenceModal';
import DesignSystemManager from './components/DesignSystemManager';
import DesignSystemInjector from './components/DesignSystemInjector';
import SystemSettingsManager from './components/SystemSettingsManager';
import TemplateBuilder from './components/TemplateBuilder';
import ProtectedRoute from './components/ProtectedRoute';
import CommentsPanel from './components/CommentsPanel';
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
  const [activeSection, setActiveSection] = useState<Section>('all-content');
  const [activeTagFilter, setActiveTagFilter] = useState<string>(''); // For filtering content by tag
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [executiveIQ, setExecutiveIQ] = useState<ExecutiveIQ[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [kbArticles, setKbArticles] = useState<any[]>([]);
  const [kbCategories, setKbCategories] = useState<any[]>([]);
  const [allContent, setAllContent] = useState<any[]>([]); // Unified content list
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'summaries' | 'executive-iq' | 'organizations' | 'performance'>('summaries');
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info' | 'warning', message: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalDataType, setModalDataType] = useState<'summaries' | 'executive-iq' | 'organizations' | 'performance' | 'knowledge-base' | 'kb-categories'>('summaries');
  const [showNewSummaryModal, setShowNewSummaryModal] = useState(false);
  const [newSummaryName, setNewSummaryName] = useState('');
  const [creationMode, setCreationMode] = useState<'template' | 'clone'>('template');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [modalType, setModalType] = useState<'one-pager' | 'tabbed'>('one-pager');
  const [showAssetReference, setShowAssetReference] = useState(false);
  const [assetReferenceType, setAssetReferenceType] = useState<string | undefined>();
  const [showStyleScheme, setShowStyleScheme] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [requireAuth, setRequireAuth] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showComments, setShowComments] = useState(false);
  const [activeCommentContent, setActiveCommentContent] = useState<{id: string, type: string, title: string} | null>(null);
  const [allComments, setAllComments] = useState<any[]>([]);

  // Check system settings for auth requirement
  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setRequireAuth(parsed.authentication?.cmsAdmin?.requireLogin || false);
    }
  }, []);

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
      // Fetch all content types in parallel
      const [summariesRes, executiveIQRes, organizationsRes, performancesRes, kbArticlesRes, kbCategoriesRes] = await Promise.all([
        fetch(`${API_URL}/summaries`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/executive-iq`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/organizations`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/performance`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/knowledge-base`).then(r => r.ok ? r.json() : []),
        fetch(`${API_URL}/kb-categories`).then(r => r.ok ? r.json() : [])
      ]);

      // Store in separate state for backwards compatibility
      setSummaries(summariesRes);
      setExecutiveIQ(executiveIQRes);
      setOrganizations(organizationsRes);
      setPerformances(performancesRes);
      setKbArticles(kbArticlesRes);
      setKbCategories(kbCategoriesRes);

      // Combine all content into unified list
      const combined = [
        ...summariesRes,
        ...executiveIQRes,
        ...organizationsRes,
        ...performancesRes,
        ...kbArticlesRes,
        ...kbCategoriesRes
      ];
      setAllContent(combined);

      // Only show notification on initial load or manual refresh, not on filter changes
      // showNotification('success', `Loaded ${combined.length} items`);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('error', 'Failed to load data');
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

  // Load templates when modal opens
  useEffect(() => {
    if (showNewSummaryModal) {
      fetchTemplates();
    }
  }, [showNewSummaryModal]);

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message });
  };

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    const endpoint = activeSection === 'summaries' ? 'summaries' 
      : activeSection === 'executive-iq' ? 'executive-iq' 
      : activeSection === 'performance' ? 'performance'
      : activeSection === 'knowledge-base' ? 'knowledge-base'
      : activeSection === 'kb-categories' ? 'kb-categories'
      : 'organizations';

    try {
      const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification('success', 'Deleted successfully!');
        fetchData();
      } else {
        showNotification('error', 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', 'Delete failed');
    }
  };

  const handleEditItem = (item: any, type: 'summaries' | 'executive-iq' | 'organizations' | 'performance' | 'knowledge-base' | 'kb-categories') => {
    // Warn if editing a live summary
    if (type === 'summaries' && item.status === 'published') {
      if (!confirm('⚠️ WARNING: This summary is LIVE and published.\n\nAny changes you make will be immediately visible to users.\n\nDo you want to continue editing?')) {
        return;
      }
    }
    
    setSelectedItem(item);
    setModalDataType(type);
    setModalOpen(true);
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
    const endpoint = modalDataType;
    
    try {
      // Check if this is a new item (no file exists yet) or an update
      const isNewItem = !data._fileExists; // We'll add this flag when creating new items
      const method = isNewItem ? 'POST' : 'PUT';
      const url = isNewItem 
        ? `${API_URL}/${endpoint}`
        : `${API_URL}/${endpoint}/${data.id}`;
      
      // Remove the _fileExists flag before saving
      const { _fileExists, ...dataToSave } = data;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
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

    try {
      // Generate ID from name and timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const sanitizedName = newSummaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newId = `week-${sanitizedName}-${timestamp}`;

      let sourceData;
      
      if (creationMode === 'template') {
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
        // Fetch the selected summary to clone
        const response = await fetch(`${API_URL}/summaries/${selectedSourceId}`);
        if (!response.ok) throw new Error('Failed to fetch source summary');
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
        _contentTag: selectedTag, // Add selected tag
        _fileExists: false // Mark as new - file will be created on first save
      };

      // Don't POST immediately - open in editor and let user save when ready
      showNotification('success', `Opening new ${creationMode === 'clone' ? 'cloned' : ''} summary in editor...`);
      setShowNewSummaryModal(false);
      setNewSummaryName('');
      setSelectedSourceId('');
      setCreationMode('template');
      
      // Open in editor
      setSelectedItem(newSummary);
      setModalDataType('summaries');
      setModalOpen(true);
    } catch (error) {
      console.error('Create error:', error);
      showNotification('error', 'Failed to create new summary');
    }
  };

  const navigationItems = [
    { id: 'summaries' as Section, label: 'Weekly Summaries', icon: FileText },
    { id: 'executive-iq' as Section, label: 'Executive IQ', icon: Lightbulb },
    { id: 'organizations' as Section, label: 'Organizations', icon: Building2 },
    { id: 'performance' as Section, label: 'Performance', icon: TrendingUp },
    { id: 'knowledge-base' as Section, label: 'Knowledge Base', icon: BookOpen },
    { id: 'kb-categories' as Section, label: 'KB Categories', icon: FolderOpen },
    { id: 'import' as Section, label: 'Import Data', icon: Upload },
  ];

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
                  Select Data Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportType('summaries')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importType === 'summaries'
                        ? 'bg-gradient-to-br from-fis-eggplant to-fis-raspberry border-fis-raspberry text-white'
                        : 'glass border-white/20 hover:border-fis-eggplant text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-roobert-medium">Summaries</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType('executive-iq')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importType === 'executive-iq'
                        ? 'bg-gradient-to-br from-fis-eggplant to-fis-raspberry border-fis-raspberry text-white'
                        : 'glass border-white/20 hover:border-fis-eggplant text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Lightbulb className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-roobert-medium">ExecutiveIQ</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType('organizations')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importType === 'organizations'
                        ? 'bg-gradient-to-br from-fis-eggplant to-fis-raspberry border-fis-raspberry text-white'
                        : 'glass border-white/20 hover:border-fis-eggplant text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-roobert-medium">Organizations</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportType('performance')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importType === 'performance'
                        ? 'bg-gradient-to-br from-fis-eggplant to-fis-raspberry border-fis-raspberry text-white'
                        : 'glass border-white/20 hover:border-fis-eggplant text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-roobert-medium">Performance</div>
                  </button>
                </div>
              </div>
              
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

    // Filter content by active tag
    let items: any[] = activeTagFilter 
      ? allContent.filter(item => item._contentTag === activeTagFilter)
      : allContent;

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
                          {item.quarter || item.name || item.displayName} {item.year || ''}
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
                    {item.title || (item.demoStudio ? `${item.demoStudio.demosRegistered} Demos Registered` : item.lastUpdated ? formatDate(item.lastUpdated) : 'No description')}
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
                  onClick={() => handleDelete(item.id)}
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
                      <th className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 pb-3 pr-4">Name</th>
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
                            {item.quarter || item.name || item.displayName} {item.year || ''}
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
                                onClick={() => handleDelete(item.id)}
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
              <CMSHeader 
                onOpenAssetReference={() => setShowAssetReference(true)}
                onOpenStyleScheme={() => setShowStyleScheme(true)}
                onOpenSystemSettings={() => setShowSystemSettings(true)}
                onOpenTemplateBuilder={() => setShowTemplateBuilder(true)}
                onOpenComments={() => setShowComments(true)}
              />
          
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
                    className={`px-4 py-2 rounded-lg transition-all font-roobert-semibold text-sm ${
                      activeSection === 'import'
                        ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-lg'
                        : 'bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200'
                    }`}
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
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center flex-shrink-0">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                        Create New Content
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        It will be created as a draft.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Content Tag Selection */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Content Tag
                      </label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                      >
                        {availableTags.map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                      </select>
                      {availableTags.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          No tags available. Create one in System Settings.
                        </p>
                      )}
                    </div>

                    {/* Content Type Selection */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Content Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setModalType('one-pager')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-roobert-medium ${
                            modalType === 'one-pager'
                              ? 'bg-fis-eggplant border-fis-eggplant text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-fis-eggplant'
                          }`}
                        >
                          One-Pager
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalType('tabbed')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-roobert-medium ${
                            modalType === 'tabbed'
                              ? 'bg-fis-eggplant border-fis-eggplant text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-fis-eggplant'
                          }`}
                        >
                          Tabbed Page
                        </button>
                      </div>
                    </div>

                    {/* Mode Toggle */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Creation Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCreationMode('template');
                            setSelectedSourceId('');
                          }}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-roobert-medium ${
                            creationMode === 'template'
                              ? 'bg-fis-eggplant border-fis-eggplant text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-fis-eggplant'
                          }`}
                        >
                          From Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreationMode('clone')}
                          className={`px-4 py-2 rounded-lg border-2 transition-all font-roobert-medium ${
                            creationMode === 'clone'
                              ? 'bg-fis-eggplant border-fis-eggplant text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-fis-eggplant'
                          }`}
                        >
                          Clone Existing
                        </button>
                      </div>
                    </div>

                    {/* Template Selector */}
                    {creationMode === 'template' && (
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
                          {availableTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                        {availableTemplates.length === 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            No custom templates yet. Use Template Builder to create one.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Clone Source Selector */}
                    {creationMode === 'clone' && (
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
                          {summaries.map((summary) => (
                            <option key={summary.id} value={summary.id}>
                              {summary.quarter} {summary.year} - {summary.title}
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
                          newSummaryName.trim() && summaries.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase())
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        autoFocus
                      />
                      {newSummaryName.trim() && summaries.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase()) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          A summary with this name already exists
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleCreateNewSummary}
                        disabled={!newSummaryName.trim() || (creationMode === 'clone' && !selectedSourceId) || summaries.some(s => s.title.toLowerCase() === newSummaryName.trim().toLowerCase())}
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
            dataType={modalDataType}
            onSave={handleSaveItem}
            showNotification={showNotification}
          />

          {/* Asset Type Reference Modal */}
          <AssetTypeReferenceModal
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

          {/* Comments Panel */}
          <CommentsPanel
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            contentId={activeCommentContent?.id || null}
            contentType={activeCommentContent?.type || null}
            contentTitle={activeCommentContent?.title}
            onCommentChange={fetchComments}
          />
            </div>
          </ProtectedRoute>
        </PresentationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
