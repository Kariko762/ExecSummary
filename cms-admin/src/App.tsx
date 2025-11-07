import { useState, useEffect } from 'react';
import { FileText, Lightbulb, Building2, Upload, Trash2, ExternalLink, RefreshCw, CheckCircle, AlertCircle, TrendingUp, Plus, Shield, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { CMSHeader } from './components/CMSHeader';
import EditorModal from './components/EditorModalV2';
import EngineGlossaryModal from './components/EngineGlossaryModal';
import summaryTemplate from './templates/summary-template.json';
import './App.css';

const API_URL = 'http://localhost:3001/api';

type Section = 'summaries' | 'executive-iq' | 'organizations' | 'performance' | 'import';

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
  const [activeSection, setActiveSection] = useState<Section>('summaries');
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [executiveIQ, setExecutiveIQ] = useState<ExecutiveIQ[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'summaries' | 'executive-iq' | 'organizations' | 'performance'>('summaries');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalDataType, setModalDataType] = useState<'summaries' | 'executive-iq' | 'organizations' | 'performance'>('summaries');
  const [showNewSummaryModal, setShowNewSummaryModal] = useState(false);
  const [newSummaryName, setNewSummaryName] = useState('');
  const [creationMode, setCreationMode] = useState<'template' | 'clone'>('template');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [showEngineGlossary, setShowEngineGlossary] = useState(false);

  useEffect(() => {
    if (activeSection !== 'import') {
      fetchData();
    }
  }, [activeSection]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeSection === 'summaries' ? 'summaries' 
        : activeSection === 'executive-iq' ? 'executive-iq' 
        : activeSection === 'performance' ? 'performance'
        : 'organizations';
      
      const response = await fetch(`${API_URL}/${endpoint}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (activeSection === 'summaries') setSummaries(data);
      if (activeSection === 'executive-iq') setExecutiveIQ(data);
      if (activeSection === 'organizations') setOrganizations(data);
      if (activeSection === 'performance') setPerformances(data);
      
      showNotification('success', 'Data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
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

  const handleEditItem = (item: any, type: 'summaries' | 'executive-iq' | 'organizations' | 'performance') => {
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
      const response = await fetch(`${API_URL}/${endpoint}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
        sourceData = summaryTemplate;
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
        status: 'draft'
      };

      // POST to create new summary
      const response = await fetch(`${API_URL}/summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSummary),
      });

      if (response.ok) {
        showNotification('success', `New summary ${creationMode === 'clone' ? 'cloned' : 'created'} successfully!`);
        setShowNewSummaryModal(false);
        setNewSummaryName('');
        setSelectedSourceId('');
        setCreationMode('template');
        
        // Open in editor
        setSelectedItem(newSummary);
        setModalDataType('summaries');
        setModalOpen(true);
        
        // Refresh the list
        fetchData();
      } else {
        showNotification('error', 'Failed to create summary');
      }
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

    let items: any[] = [];
    if (activeSection === 'summaries') items = summaries; // Show ALL summaries in CMS (including drafts)
    if (activeSection === 'executive-iq') items = executiveIQ;
    if (activeSection === 'organizations') items = organizations;
    if (activeSection === 'performance') items = performances;

    if (items.length === 0) {
      return (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-roobert-medium mb-2">
            No items found
          </p>
          <p className="text-sm text-gray-400">
            Upload a JSON file from the Import Data section to get started.
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Manage {activeSection.replace('-', ' ')} data. Total items: <span className="font-roobert-bold">{items.length}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
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
                      {activeSection === 'summaries' && <FileText className="w-5 h-5 text-white" />}
                      {activeSection === 'executive-iq' && <Lightbulb className="w-5 h-5 text-white" />}
                      {activeSection === 'organizations' && <Building2 className="w-5 h-5 text-white" />}
                      {activeSection === 'performance' && <TrendingUp className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-roobert-semibold text-lg text-gray-900 dark:text-white">
                          {item.quarter || item.name || item.displayName} {item.year || ''}
                        </h3>
                        {activeSection === 'summaries' && item.status && (
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
                    {item.title || (item.demoStudio ? `${item.demoStudio.demosRegistered} Demos Registered` : `Updated: ${item.lastUpdated}`)}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.date && (
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-roobert-medium">
                        {item.date}
                      </div>
                    )}
                    {activeSection === 'summaries' && (
                      <>
                        {item.protectionEnabled !== false ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-roobert-medium">
                            <Shield className="w-3 h-3" />
                            Protected {calculateSummaryCompletion(item)}%
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
                  onClick={() => handleEditItem(item, activeSection as 'summaries' | 'executive-iq' | 'organizations' | 'performance')}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-navy to-fis-eggplant text-white text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 font-roobert-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Edit
                </button>
                <a
                  href={`${API_URL}/${activeSection === 'summaries' ? 'summaries' : activeSection === 'executive-iq' ? 'executive-iq' : activeSection === 'performance' ? 'performance' : 'organizations'}/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg glass border border-white/20 hover:border-fis-eggplant hover:scale-110 transition-all"
                  title="View Raw JSON"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-red-500/90 text-white hover:bg-red-600 hover:scale-110 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

  return (
    <ThemeProvider>
      <PresentationProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant transition-colors duration-500">
          <CMSHeader onOpenEngineGlossary={() => setShowEngineGlossary(true)} />
          
          {/* Notification */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 right-4 z-[100] glass-strong rounded-xl p-4 border-2 border-white/20 shadow-2xl max-w-md"
              >
                <div className="flex items-start gap-3">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                  )}
                  <p className="text-gray-900 dark:text-white font-roobert-medium">{notification.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-roobert-heavy text-fis-navy dark:text-white mb-3">
                  Content Management System
                </h1>
                <p className="text-lg md:text-xl font-roobert-medium" style={{ color: '#4bcd3e' }}>
                  Manage Your Executive Dashboard Data
                </p>
              </motion.div>

              {/* Navigation Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12"
              >
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      animate={{ scale: isActive ? 1.05 : 1, opacity: 1 }}
                      onClick={() => setActiveSection(item.id)}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className={`
                        rounded-xl p-4 text-center transition-all duration-300 outline-none
                        ${isActive 
                          ? 'bg-fis-navy border-2 border-fis-eggplant card-shadow-hover' 
                          : 'glass card-shadow hover:card-shadow-hover border-2 border-transparent hover:border-fis-eggplant'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2
                        ${isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`} />
                      </div>
                      <h3 className={`font-roobert-semibold text-sm mb-1 ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {item.label}
                      </h3>
                      <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                        {item.id === 'summaries' && 'Weekly reports'}
                        {item.id === 'executive-iq' && 'IQ articles'}
                        {item.id === 'organizations' && 'Org data'}
                        {item.id === 'performance' && 'Metrics'}
                        {item.id === 'import' && 'Upload files'}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Main Content Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-strong rounded-2xl p-8 card-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
                      {navigationItems.find(item => item.id === activeSection)?.label}
                    </h2>
                    
                    {activeSection !== 'import' && (
                      <div className="flex items-center gap-3">
                        {activeSection === 'summaries' && (
                          <button
                            onClick={() => setShowNewSummaryModal(true)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white hover:shadow-lg transition-all flex items-center gap-2 font-roobert-semibold"
                          >
                            <Plus className="w-4 h-4" />
                            New Summary
                          </button>
                        )}
                        <button
                          onClick={fetchData}
                          className="px-4 py-2 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all flex items-center gap-2 text-gray-700 dark:text-gray-200 font-roobert-medium"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Refresh
                        </button>
                      </div>
                    )}
                  </div>
                  
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
                        Create New Summary
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        It will be created as a draft.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                          disabled
                          value="default"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed opacity-75"
                        >
                          <option value="default">Default Template</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Additional templates coming soon
                        </p>
                      </div>
                    )}

                    {/* Clone Source Selector */}
                    {creationMode === 'clone' && (
                      <div>
                        <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                          Select Source Summary
                        </label>
                        <select
                          value={selectedSourceId}
                          onChange={(e) => setSelectedSourceId(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white"
                        >
                          <option value="">-- Select a summary to clone --</option>
                          {summaries.map((summary) => (
                            <option key={summary.id} value={summary.id}>
                              {summary.quarter} {summary.year} - {summary.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Summary Name */}
                    <div>
                      <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                        Summary Name
                      </label>
                      <input
                        type="text"
                        value={newSummaryName}
                        onChange={(e) => setNewSummaryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateNewSummary()}
                        placeholder="e.g., Demo Services Group - Weekly Update"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleCreateNewSummary}
                        disabled={!newSummaryName.trim() || (creationMode === 'clone' && !selectedSourceId)}
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
          />

          {/* Engine Glossary Modal */}
          <EngineGlossaryModal
            isOpen={showEngineGlossary}
            onClose={() => setShowEngineGlossary(false)}
          />
        </div>
      </PresentationProvider>
    </ThemeProvider>
  );
}

export default App;
