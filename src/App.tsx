import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { renderWithExpressions } from './utils/expressionParser';
import { Dashboard } from './components/Dashboard';
import { ContentModal } from './components/ContentModal';
import { ContentModalFixedMenu } from './components/ContentModalFixedMenu';
import ViewGoalModal from './components/ViewGoalModal';
import { Timeline } from './components/Timeline';
import { StickyNav } from './components/StickyNav';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { StrategicInitiativesDashboard } from './components/StrategicInitiativesDashboard';
import { KnowledgeBaseDashboard } from './components/KnowledgeBaseDashboard';
import { SchemaTest } from './components/SchemaTest';
import { DesignSystemTest } from './pages/DesignSystemTest';
import GoalsHome from './pages/GoalsHome';
import InitiativesHome from './pages/InitiativesHome';
import TechnologiesHome from './pages/TechnologiesHome';
import TechnologyStackOverview from './pages/TechnologyStackOverview';
import PlatformArchitectureOverview from './pages/PlatformArchitectureOverview';
import PlatformOverview from './components/PlatformOverview';
import CardStyleGallery from './components/CardStyleGallery';
import LoginPage from './components/LoginPage';
import { timelineItems, isExecutiveSummary, loadTimelineData } from './data/timeline-loader';
import { TimelineItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Target, AlertCircle, ChevronRight, CheckCircle2, ChevronLeft, FileText, Cpu } from 'lucide-react';

// Wrapper component to conditionally show StickyNav
function AppContent() {
  const location = useLocation();
  
  // Routes that should not show the sticky nav
  const noStickyNavRoutes = [
    '/technology-stack-overview',
    '/platform-architecture-overview',
    '/goals',
    '/initiatives',
    '/technologies',
    '/strategic-initiatives',
    '/knowledge-base',
    '/platform-overview',
    '/card-styles',
    '/schema-test',
    '/design-test'
  ];
  
  const shouldShowStickyNav = !noStickyNavRoutes.includes(location.pathname);
  
  return shouldShowStickyNav ? <StickyNav /> : null;
}

function App() {
  const [selectedSummary, setSelectedSummary] = useState<TimelineItem | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requireAuth, setRequireAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [initiativesScrollIndex, setInitiativesScrollIndex] = useState(0);
  
  // Feature flags from System Settings
  const [organizationsEnabled, setOrganizationsEnabled] = useState(true);
  const [initiativesEnabled, setInitiativesEnabled] = useState(true);
  
  // Organizations and Initiatives data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [orgContent, setOrgContent] = useState<Map<string, any>>(new Map());
  const [initiativeContent, setInitiativeContent] = useState<Map<string, any>>(new Map());
  const [goalContent, setGoalContent] = useState<Map<string, any>>(new Map());

  // Load timeline data from backend API
  useEffect(() => {
    loadTimelineData()
      .then(() => {
        console.log('Timeline data loaded successfully');
        setIsLoadingData(false);
      })
      .catch((error) => {
        console.error('Failed to load timeline data:', error);
        setIsLoadingData(false); // Still proceed even if it fails
      });
  }, []);

  // Load announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content?tag=announcement');
        const data = await response.json();
        
        if (data.success && data.content) {
          const mappedAnnouncements = data.content
            .filter((item: any) => item.status === 'published')
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              message: item.details || item.summary || item.sections?.[0]?.content || '',
              date: new Date(item.date || item._template_created),
              priority: item.priority || 'low'
            }))
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
            .slice(0, 3); // Only show 3 most recent on dashboard
          
          setAnnouncements(mappedAnnouncements);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Load feature flags from localStorage
  useEffect(() => {
    const orgsEnabled = localStorage.getItem('organizationsEnabled');
    const initsEnabled = localStorage.getItem('initiativesEnabled');
    
    if (orgsEnabled !== null) setOrganizationsEnabled(orgsEnabled === 'true');
    if (initsEnabled !== null) setInitiativesEnabled(initsEnabled === 'true');
  }, []);

  // Load organizations and initiatives registries
  useEffect(() => {
    // Load organizations
    fetch('http://localhost:3001/api/tenants?type=org')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tenants) {
          setOrganizations(data.tenants);
          // Fetch latest content for each org
          data.tenants.forEach((org: any) => {
            fetch(`http://localhost:3001/api/content?tenant=${org.slug}&tenantType=org`)
              .then(res => res.json())
              .then(contentData => {
                if (contentData.success && contentData.content?.length > 0) {
                  // Get most recent content
                  const latest = contentData.content.sort((a: any, b: any) => 
                    new Date(b.date || b._template_updated).getTime() - new Date(a.date || a._template_updated).getTime()
                  )[0];
                  setOrgContent(prev => new Map(prev).set(org.slug, latest));
                }
              });
          });
        }
      })
      .catch(err => console.error('Failed to load organizations:', err));

    // Load initiatives
    fetch('http://localhost:3001/api/tenants?type=initiative')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tenants) {
          setInitiatives(data.tenants);
          // Fetch latest content for each initiative
          data.tenants.forEach((init: any) => {
            fetch(`http://localhost:3001/api/content?tenant=${init.slug}&tenantType=initiative`)
              .then(res => res.json())
              .then(contentData => {
                if (contentData.success && contentData.content?.length > 0) {
                  // Get most recent content
                  const latest = contentData.content.sort((a: any, b: any) => 
                    new Date(b.date || b._template_updated).getTime() - new Date(a.date || a._template_updated).getTime()
                  )[0];
                  setInitiativeContent(prev => new Map(prev).set(init.slug, latest));
                }
              });
          });
        }
      })
      .catch(err => console.error('Failed to load initiatives:', err));

    // Load goals from dedicated goals API
    fetch('http://localhost:3001/api/goals')
      .then(res => res.json())
      .then(data => {
        if (data.goals && Array.isArray(data.goals)) {
          // Transform goals to match the same structure as initiatives
          const transformedGoals = data.goals.map((goal: any) => ({
            id: goal.id,
            slug: goal.id,
            name: goal.title || goal.name,
            description: goal.description || '',
            category: goal.category
          }));
          setGoals(transformedGoals);
          
          // Goals don't have separate content - they ARE the content
          // Store the goal data itself in goalContent
          data.goals.forEach((goal: any) => {
            setGoalContent(prev => new Map(prev).set(goal.id, goal));
          });
        }
      })
      .catch(err => console.error('Failed to load goals:', err));
  }, []);

  // Check system settings for auth requirement and authentication status
  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const authRequired = parsed.authentication?.parentApp?.requireLogin || false;
      setRequireAuth(authRequired);
      
      if (authRequired) {
        // Check if user is authenticated
        const token = localStorage.getItem('auth_token');
        const session = localStorage.getItem('auth_session');
        
        if (token && session) {
          const sessionData = JSON.parse(session);
          // Check if session is not expired
          if (new Date(sessionData.expiresAt) > new Date()) {
            setIsAuthenticated(true);
          }
        }
      } else {
        // If auth not required, mark as authenticated
        setIsAuthenticated(true);
      }
    } else {
      // No settings, allow access
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_session');
    setIsAuthenticated(false);
  };

  const filteredSummaries = timelineItems.filter(summary => {
    if (!summary || !summary.title) return false;
    
    // Tag filter
    const contentTag = (summary as any)._contentTag;
    if (selectedTag !== 'all' && contentTag !== selectedTag) return false;
    
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const baseMatch = 
      summary.title.toLowerCase().includes(searchLower) ||
      (summary.quarter || '').toLowerCase().includes(searchLower) ||
      (summary.year || '').toString().includes(searchLower);
    
    if (isExecutiveSummary(summary)) {
      return baseMatch || (summary.highlights || []).some(h => h.toLowerCase().includes(searchLower));
    }
    return baseMatch;
  });

  // Show loading while checking auth or loading data
  if (isCheckingAuth || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fis-eggplant border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-roobert-medium">
            {isCheckingAuth ? 'Loading...' : 'Loading content from API...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login page if auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Router>
      <ThemeProvider>
        <PresentationProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant transition-colors duration-500">
            <Header 
              onSearch={setSearchQuery} 
              isAuthenticated={requireAuth && isAuthenticated}
              onLogout={handleLogout}
              onSelectContent={setSelectedSummary}
            />
            <AppContent />
            
            {/* Global Modals - Render outside Routes */}
            <AnimatePresence mode="wait">
              {selectedGoal ? (
                <ViewGoalModal
                  goal={selectedGoal}
                  onClose={() => setSelectedGoal(null)}
                />
              ) : selectedSummary ? (
                selectedSummary._layout === 'tabbed' ? (
                  <ContentModalFixedMenu
                    content={selectedSummary}
                    onClose={() => setSelectedSummary(null)}
                  />
                ) : (
                  <ContentModal
                    content={selectedSummary}
                    onClose={() => setSelectedSummary(null)}
                  />
                )
              ) : null}
            </AnimatePresence>
            
            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  {/* Main Dashboard Route */}
                  <Route path="/" element={
                    <>
                          {/* Hero Section */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-6"
                          >
                            <h1 className="text-2xl md:text-3xl font-roobert-heavy text-fis-navy dark:text-white mb-2">
                              Executive Summary Dashboard
                            </h1>
                            <p className="text-base md:text-lg font-roobert-medium text-fis-green dark:text-green-400">
                              Demo Services Group | RevOps
                            </p>
                          </motion.div>

                          {/* Timeline */}
                          <section id="timeline" className="mb-0">
                          <Timeline
                            summaries={timelineItems}
                            onSelectSummary={setSelectedSummary}
                            selectedTag={selectedTag}
                            onTagChange={setSelectedTag}
                          />
                          </section>

                          {/* Decorative HR */}
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="relative h-px -mt-4 mb-6 overflow-hidden rounded-full"
                            style={{ 
                              background: 'linear-gradient(90deg, transparent, rgba(3,30,75,0.75), rgba(178,26,83,0.6), rgba(3,30,75,0.75), transparent)'
                            }}
                          >
                            <div 
                              className="absolute inset-0 animate-pulse"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                animation: 'shimmer 3s infinite'
                              }}
                            />
                          </motion.div>

                          {/* Performance Dashboard */}
                          <motion.section
                            id="performance"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6"
                          >
                            <Dashboard />
                          </motion.section>

                          {/* Additional Content Section */}
                          <motion.section
                            id="additional-content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="pt-2 mb-8"
                          >
                            {/* Centered Header */}
                            <div className="text-center mb-6">
                              <div className="inline-flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-tertiary)' }}>
                                  <FileText className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-roobert-heavy" style={{ color: 'var(--text-primary)' }}>
                                  Additional Content
                                </h2>
                              </div>
                              <p className="text-xs font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                                Explore strategic goals, initiatives, and technology solutions
                              </p>
                            </div>
                            
                            {/* 3 Content Tiles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                              {/* Strategic Goals Tile */}
                              <Link to="/goals" className="h-full">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ scale: 1.05, y: -4 }}
                                  className="h-full rounded-xl p-6 transition-all cursor-pointer group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-2xl border border-purple-200 dark:border-purple-700"
                                >
                                  <div className="flex flex-col items-center text-center h-full justify-between">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)' }}>
                                      <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                      Goals
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light mb-4">
                                      Browse and track all goals and objectives
                                    </p>
                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-roobert-semibold group-hover:gap-3 transition-all">
                                      <span>Explore Goals</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>

                              {/* Strategic Initiatives Tile */}
                              <Link to="/strategic-initiatives" className="h-full">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  whileHover={{ scale: 1.05, y: -4 }}
                                  className="h-full rounded-xl p-6 transition-all cursor-pointer group relative bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 hover:shadow-2xl border border-pink-200 dark:border-pink-700"
                                >
                                  <div className="flex flex-col items-center text-center h-full justify-between">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                                      <Target className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-2 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
                                      Initiatives
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light mb-4">
                                      View transformation programs and key projects
                                    </p>
                                    <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 text-sm font-roobert-semibold group-hover:gap-3 transition-all">
                                      <span>Explore Initiatives</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>

                              {/* Technologies Tile */}
                              <Link to="/technologies" className="h-full">
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  whileHover={{ scale: 1.05, y: -4 }}
                                  className="h-full rounded-xl p-6 transition-all cursor-pointer group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-2xl border border-blue-200 dark:border-blue-700"
                                >
                                  <div className="flex flex-col items-center text-center h-full justify-between">
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                                      <Cpu className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                                      Technologies
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light mb-4">
                                      Discover vendor summaries and tech solutions
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-roobert-semibold group-hover:gap-3 transition-all">
                                      <span>Explore Technologies</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </div>
                                  </div>
                                </motion.div>
                              </Link>
                            </div>
                          </motion.section>

                          {/* Organizations Section - Hidden */}
                          {false && organizationsEnabled && organizations.length > 0 && (
                            <motion.section
                              id="organizations"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="pt-2 mb-8"
                            >
                              {/* Centered Header */}
                              <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-3 mb-1">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-primary)' }}>
                                    <Building2 className="w-5 h-5 text-white" />
                                  </div>
                                  <h2 className="text-2xl font-roobert-heavy" style={{ color: 'var(--text-primary)' }}>
                                    Organization Overview
                                  </h2>
                                </div>
                                <p className="text-xs font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                                  Real-time status across all lines of business
                                </p>
                              </div>
                              
                              {/* 2x2 Grid for Organizations */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                                {organizations.map((org) => {
                                  const content = orgContent.get(org.slug);
                                  const hasRisk = content?.risks?.some((r: any) => r.severity === 'high' || r.severity === 'medium');
                                  const riskLevel = content?.risks?.find((r: any) => r.severity === 'high') ? 'high' : 
                                                   content?.risks?.find((r: any) => r.severity === 'medium') ? 'medium' : 'low';
                                  
                                  // Extract metrics from content
                                  const projects = content?.project_milestones?.length || 0;
                                  const openTickets = 0; // Will be populated when template updated
                                  const blockers = content?.risks?.filter((r: any) => r.severity === 'high').length || 0;
                                  
                                  return (
                                    <motion.div
                                      key={org.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      whileHover={{ scale: 1.02, y: -4 }}
                                      onClick={() => content && setSelectedSummary(content)}
                                      className="rounded-xl p-4 transition-all cursor-pointer group relative bg-white dark:bg-gray-800 hover:shadow-2xl"
                                      style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(96, 165, 250, 0.1)' }}
                                    >
                                      {/* Top-right status indicator replaced with badge */}
                                      <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-roobert-semibold ${
                                          riskLevel === 'high' ? 'bg-red-500/90 text-white' :
                                          riskLevel === 'medium' ? 'bg-yellow-500/90 text-white' :
                                          'bg-green-500/90 text-white'
                                        }`}>
                                          {riskLevel === 'high' ? 'At Risk' : riskLevel === 'medium' ? '1 At Risk' : 'All On Track'}
                                        </div>
                                      </div>

                                      {/* Organization Header */}
                                      <div className="mb-6">
                                        <h3 className="text-2xl font-roobert-heavy text-gray-900 mb-1">
                                          {org.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 font-roobert-light">
                                          Updated {content?.date ? new Date(content.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'No updates'}
                                        </p>
                                      </div>

                                      {/* Stats Grid - 3 metrics */}
                                      <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                          <div className="text-xs text-gray-600 mb-1 font-roobert-light">
                                            Projects
                                          </div>
                                          <div className="text-2xl font-roobert-heavy text-gray-900">
                                            {projects}
                                          </div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-xs text-gray-600 mb-1 font-roobert-light">
                                            Open Tickets
                                          </div>
                                          <div className="text-2xl font-roobert-heavy text-gray-900">
                                            {openTickets}
                                          </div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-xs text-gray-600 mb-1 font-roobert-light">
                                            Blockers
                                          </div>
                                          <div className="text-2xl font-roobert-heavy text-gray-900">
                                            {blockers}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Latest Update Preview */}
                                      {content && (
                                        <div className="bg-white/40 dark:bg-gray-700/40 rounded-lg p-2 backdrop-blur-sm">
                                          <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-roobert-medium text-gray-900 line-clamp-2">
                                                {content.highlights?.[0] || content.title || 'Latest update available'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Click for Details */}
                                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300 dark:border-gray-700">
                                        <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                          Click for details
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.section>
                          )}

                          {/* Initiatives and Goals Section - Hidden */}
                          {false && initiativesEnabled && (initiatives.length > 0 || goals.length > 0) && (() => {
                            const allItems = [...initiatives.map((item: any) => ({ ...item, itemType: 'Initiative' })), ...goals.map((item: any) => ({ ...item, itemType: 'Goal' }))];
                            const itemsPerPage = 3;
                            const visibleItems = allItems.slice(initiativesScrollIndex, initiativesScrollIndex + itemsPerPage);
                            
                            return (
                            <motion.section
                              id="initiatives"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="mb-12"
                            >
                              {/* Centered Header */}
                              <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-3 mb-1">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-secondary)' }}>
                                    <Target className="w-5 h-5 text-white" />
                                  </div>
                                  <h2 className="text-2xl font-roobert-heavy" style={{ color: 'var(--text-primary)' }}>
                                    Initiatives and Goals
                                  </h2>
                                </div>
                                <p className="text-xs font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                                  Key enterprise transformation programs and strategic objectives
                                </p>
                              </div>
                              
                              {/* Scroll Controls */}
                              {allItems.length > itemsPerPage && (
                                <div className="flex items-center justify-between mb-4">
                                  <button
                                    onClick={() => setInitiativesScrollIndex((prev: number) => Math.max(0, prev - itemsPerPage))}
                                    disabled={initiativesScrollIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-sm font-roobert-medium">Previous</span>
                                  </button>
                                  <span className="text-sm text-gray-600 dark:text-gray-400 font-roobert-medium">
                                    Showing {initiativesScrollIndex + 1}-{Math.min(initiativesScrollIndex + itemsPerPage, allItems.length)} of {allItems.length}
                                  </span>
                                  <button
                                    onClick={() => setInitiativesScrollIndex((prev: number) => Math.min(Math.ceil(allItems.length / itemsPerPage) * itemsPerPage - itemsPerPage, prev + itemsPerPage))}
                                    disabled={initiativesScrollIndex >= Math.ceil(allItems.length / itemsPerPage) * itemsPerPage - itemsPerPage}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                  >
                                    <span className="text-sm font-roobert-medium">Next</span>
                                    <ChevronRight className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                              
                              {/* 3 Items per row */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visibleItems.map((item) => {
                                  const content = item.itemType === 'Initiative' ? initiativeContent.get(item.slug) : goalContent.get(item.slug);
                                  const hasRisk = content?.risks?.some((r: any) => r.severity === 'high' || r.severity === 'medium');
                                  const riskLevel = content?.risks?.find((r: any) => r.severity === 'high') ? 'high' : 
                                                   content?.risks?.find((r: any) => r.severity === 'medium') ? 'medium' : 'low';
                                  
                                  // Extract metrics from content  
                                  const projects = content?.project_milestones?.length || 0;
                                  const openTickets = 0; // Will be populated when template updated
                                  const blockers = content?.risks?.filter((r: any) => r.severity === 'high').length || 0;
                                  
                                  // Extract goals from content
                                  const goals = content?.goals || (content?.sections?.find((s: any) => s.key === 'goals')?.multiFieldData) || [];
                                  
                                  return (
                                    <motion.div
                                      key={item.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      whileHover={{ scale: 1.02, y: -4 }}
                                      onClick={() => {
                                        if (item.itemType === 'Goal') {
                                          setSelectedGoal(content);
                                        } else {
                                          content && setSelectedSummary(content);
                                        }
                                      }}
                                      className="rounded-xl p-4 transition-all cursor-pointer group relative overflow-hidden shadow-lg hover:shadow-2xl"
                                      style={{
                                        background: riskLevel === 'high' 
                                          ? 'radial-gradient(circle at top right, rgba(178, 26, 83, 0.08) 0%, rgba(178, 26, 83, 0.03) 40%, transparent 100%), white'
                                          : riskLevel === 'medium'
                                          ? 'radial-gradient(circle at top right, rgba(67, 28, 91, 0.08) 0%, rgba(67, 28, 91, 0.03) 40%, transparent 100%), white'
                                          : 'radial-gradient(circle at top right, rgba(0, 162, 90, 0.08) 0%, rgba(0, 162, 90, 0.02) 50%, transparent 100%), white'
                                      }}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-roobert-semibold" 
                                                    style={{ 
                                                      background: item.itemType === 'Goal' ? 'var(--accent-green)' : 'var(--brand-secondary)',
                                                      color: 'white' 
                                                    }}>
                                                {item.itemType}
                                              </span>
                                            </div>
                                            <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900">
                                              {item.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 font-roobert-light line-clamp-2">
                                              {item.description}
                                            </p>
                                          </div>
                                          <ChevronRight className="w-5 h-5 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-gray-900" />
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                          <div className="rounded-lg p-3 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.4)' }}>
                                            <div className="text-2xl font-roobert-heavy text-gray-900">{projects}</div>
                                            <div className="text-xs text-gray-600 font-roobert-light mt-1">Projects</div>
                                          </div>
                                          <div className="rounded-lg p-3 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.4)' }}>
                                            <div className="text-2xl font-roobert-heavy text-gray-900">{openTickets}</div>
                                            <div className="text-xs text-gray-600 font-roobert-light mt-1">Open Tickets</div>
                                          </div>
                                          <div className="rounded-lg p-3 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.4)' }}>
                                            <div className="text-2xl font-roobert-heavy text-gray-900">{blockers}</div>
                                            <div className="text-xs text-gray-600 font-roobert-light mt-1">Blockers</div>
                                          </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center justify-between">
                                          {riskLevel === 'high' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium" 
                                                  style={{ background: 'var(--accent-red)', color: 'white' }}>
                                              <AlertCircle className="w-3 h-3" />
                                              At Risk
                                            </span>
                                          ) : riskLevel === 'medium' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium"
                                                  style={{ background: 'var(--accent-yellow)', color: 'white' }}>
                                              <AlertCircle className="w-3 h-3" />
                                              Monitoring
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium"
                                                  style={{ background: 'var(--accent-green)', color: 'white' }}>
                                              <CheckCircle2 className="w-3 h-3" />
                                              On Track
                                            </span>
                                          )}
                                          
                                          <span className="text-xs text-gray-600 font-roobert-light">
                                            {content?.template_metadata?.lastModified ? 
                                              new Date(content.template_metadata.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                              : 'No updates'}
                                          </span>
                                        </div>
                                    </motion.div>
                                  );
                                })}
                              </div>

                              {/* Pagination Dots */}
                              {allItems.length > itemsPerPage && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                  {Array.from({ length: Math.ceil(allItems.length / itemsPerPage) }).map((_, pageIndex) => {
                                    const isActive = Math.floor(initiativesScrollIndex / itemsPerPage) === pageIndex;
                                    return (
                                      <button
                                        key={pageIndex}
                                        onClick={() => setInitiativesScrollIndex(pageIndex * itemsPerPage)}
                                        className="w-3 h-3 rounded-full transition-all hover:scale-110"
                                        style={{
                                          backgroundColor: isActive ? 'var(--brand-tertiary)' : 'transparent',
                                          border: isActive ? 'none' : '2px solid var(--border-strong)'
                                        }}
                                        aria-label={`Go to page ${pageIndex + 1}`}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </motion.section>
                            );
                          })()}


                        </>
                  } />

                  {/* Initiatives and Goals Route */}
                  <Route path="/strategic-initiatives" element={
                    <StrategicInitiativesDashboard />
                  } />

                  {/* Knowledge Base Route */}
                  <Route path="/knowledge-base" element={
                    <KnowledgeBaseDashboard />
                  } />

                  {/* Platform Overview Route */}
                  <Route path="/platform-overview" element={
                    <PlatformOverview onClose={() => window.history.back()} />
                  } />

                  {/* Card Style Gallery Route */}
                  <Route path="/card-styles" element={
                    <CardStyleGallery onClose={() => window.history.back()} />
                  } />

                  {/* Schema Test Route */}
                  <Route path="/schema-test" element={
                    <SchemaTest />
                  } />

                  {/* Design System Test Route */}
                  <Route path="/design-test" element={
                    <DesignSystemTest />
                  } />

                  {/* Goals Home Route */}
                  <Route path="/goals" element={
                    <GoalsHome onSelectGoal={setSelectedGoal} />
                  } />

                  {/* Initiatives Home Route */}
                  <Route path="/initiatives" element={
                    <InitiativesHome />
                  } />

                  {/* Technologies Home Route */}
                  <Route path="/technologies" element={
                    <TechnologiesHome onSelectContent={setSelectedSummary} />
                  } />
                  
                  {/* Technology Stack Overview Route */}
                  <Route path="/technology-stack-overview" element={
                    <TechnologyStackOverview />
                  } />
                  
                  {/* Platform Architecture Overview Route */}
                  <Route path="/platform-architecture-overview" element={
                    <PlatformArchitectureOverview />
                  } />
                </Routes>
              </div>

              {/* Footer */}
              <footer className="mt-16 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Brand Section */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
                        Executive Summary
                      </h3>
                      <p className="text-sm font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                        Streamlined insights and performance tracking for executive leadership.
                      </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h4 className="text-sm font-roobert-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        Quick Links
                      </h4>
                      <ul className="space-y-2 text-sm font-roobert-light">
                        <li>
                          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                            Back to Top
                          </button>
                        </li>
                        <li>
                          <button onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                            Timeline
                          </button>
                        </li>
                        <li>
                          <button onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                            Performance Dashboard
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Info */}
                    <div>
                      <h4 className="text-sm font-roobert-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                        System Info
                      </h4>
                      <ul className="space-y-2 text-sm font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                        <li>Version 2.0</li>
                        <li>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</li>
                      </ul>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                    <p className="text-xs font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                      © {new Date().getFullYear()} Executive Summary Platform. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </PresentationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
