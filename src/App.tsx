import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { Dashboard } from './components/Dashboard';
import { ContentModal } from './components/ContentModal';
import { Timeline } from './components/Timeline';
import { StickyNav } from './components/StickyNav';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { StrategicInitiativesDashboard } from './components/StrategicInitiativesDashboard';
import { KnowledgeBaseDashboard } from './components/KnowledgeBaseDashboard';
import { SchemaTest } from './components/SchemaTest';
import LoginPage from './components/LoginPage';
import { timelineItems, isExecutiveSummary, loadTimelineData } from './data/timeline-loader';
import { TimelineItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Target, AlertCircle, ChevronRight, Calendar, FileText, CheckCircle2 } from 'lucide-react';

function App() {
  const [selectedSummary, setSelectedSummary] = useState<TimelineItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requireAuth, setRequireAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [performanceDate, setPerformanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Feature flags from System Settings
  const [organizationsEnabled, setOrganizationsEnabled] = useState(true);
  const [initiativesEnabled, setInitiativesEnabled] = useState(true);
  
  // Organizations and Initiatives data
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [orgContent, setOrgContent] = useState<Map<string, any>>(new Map());
  const [initiativeContent, setInitiativeContent] = useState<Map<string, any>>(new Map());

  // Load timeline data from backend API
  useEffect(() => {
    loadTimelineData().then(() => {
      setIsLoadingData(false);
    });
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
    fetch('http://localhost:3001/api/organizations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.organizations) {
          setOrganizations(data.organizations);
          // Fetch latest content for each org
          data.organizations.forEach((org: any) => {
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
    fetch('http://localhost:3001/api/initiatives')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.initiatives) {
          setInitiatives(data.initiatives);
          // Fetch latest content for each initiative
          data.initiatives.forEach((init: any) => {
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
            />
            <StickyNav />
            
            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  {/* Main Dashboard Route */}
                  <Route path="/" element={
                    <AnimatePresence mode="wait">
                      {selectedSummary ? (
                        <ContentModal
                          content={selectedSummary}
                          onClose={() => setSelectedSummary(null)}
                        />
                      ) : (
                        <>
                          {/* Hero Section */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-8"
                          >
                            <h1 className="text-3xl md:text-4xl font-roobert-heavy text-fis-navy dark:text-white mb-3">
                              Executive Summary Dashboard
                            </h1>
                            <p className="text-lg md:text-xl font-roobert-medium text-fis-green dark:text-green-400">
                              Demo Services Group | RevOps
                            </p>
                          </motion.div>

                          {/* Timeline */}
                          <section id="timeline" className="mb-12">
                          <Timeline
                            summaries={timelineItems}
                            onSelectSummary={setSelectedSummary}
                            selectedTag={selectedTag}
                            onTagChange={setSelectedTag}
                          />
                          </section>

                          {/* Performance Dashboard */}
                          <motion.section
                            id="performance"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-12"
                          >
                            <Dashboard />
                          </motion.section>

                          {/* Organizations Section */}
                          {organizationsEnabled && organizations.length > 0 && (
                            <motion.section
                              id="organizations"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="mb-12"
                            >
                              {/* Centered Header */}
                              <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-primary)' }}>
                                    <Building2 className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <h2 className="text-3xl font-roobert-heavy mb-2" style={{ color: 'var(--text-primary)' }}>
                                  Organization Overview
                                </h2>
                                <p className="text-sm font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                                  Real-time status across all lines of business
                                </p>
                              </div>
                              
                              {/* 2x2 Grid for Organizations */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                                      className="rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                                      style={{ 
                                        background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(147, 197, 253, 0.2) 50%, rgba(219, 234, 254, 0.1) 100%)',
                                        boxShadow: '0 4px 20px rgba(96, 165, 250, 0.15)'
                                      }}
                                    >
                                      {/* Geometric SVG Background Pattern */}
                                      <div className="absolute inset-0 opacity-50">
                                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                          <defs>
                                            <linearGradient id={`org-fade-${org.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 0.7 }} />
                                              <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 0 }} />
                                            </linearGradient>
                                          </defs>
                                          {/* Geometric shapes */}
                                          <circle cx="10%" cy="10%" r="80" fill={`url(#org-fade-${org.id})`} />
                                          <rect x="70%" y="5%" width="60" height="60" fill={`url(#org-fade-${org.id})`} transform="rotate(45)" />
                                          <polygon points="90,150 120,190 60,190" fill={`url(#org-fade-${org.id})`} transform="translate(200, 0)" />
                                          <circle cx="85%" cy="85%" r="100" fill={`url(#org-fade-${org.id})`} />
                                        </svg>
                                      </div>
                                      
                                      {/* Content with relative positioning */}
                                      <div className="relative z-10">
                                      
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
                                        <div className="bg-white/40 rounded-lg p-3 backdrop-blur-sm">
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
                                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                                        <span className="text-xs font-roobert-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                          Click for details
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" />
                                      </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.section>
                          )}

                          {/* Initiatives Section */}
                          {initiativesEnabled && initiatives.length > 0 && (
                            <motion.section
                              id="initiatives"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                              className="mb-12"
                            >
                              {/* Centered Header */}
                              <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center gap-3 mb-3">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'var(--brand-secondary)' }}>
                                    <Target className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <h2 className="text-3xl font-roobert-heavy mb-2" style={{ color: 'var(--text-primary)' }}>
                                  Strategic Initiatives
                                </h2>
                                <p className="text-sm font-roobert-light" style={{ color: 'var(--text-secondary)' }}>
                                  Key enterprise transformation programs
                                </p>
                              </div>
                              
                              {/* Single Row - 4 per row */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {initiatives.map((initiative) => {
                                  const content = initiativeContent.get(initiative.slug);
                                  const hasRisk = content?.risks?.some((r: any) => r.severity === 'high' || r.severity === 'medium');
                                  const riskLevel = content?.risks?.find((r: any) => r.severity === 'high') ? 'high' : 
                                                   content?.risks?.find((r: any) => r.severity === 'medium') ? 'medium' : 'low';
                                  
                                  // Extract metrics from content  
                                  const projects = content?.project_milestones?.length || 0;
                                  const openTickets = 0; // Will be populated when template updated
                                  const blockers = content?.risks?.filter((r: any) => r.severity === 'high').length || 0;
                                  
                                  return (
                                    <motion.div
                                      key={initiative.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      whileHover={{ scale: 1.02, y: -4 }}
                                      onClick={() => content && setSelectedSummary(content)}
                                      className="rounded-2xl p-6 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
                                      style={{ 
                                        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(196, 181, 253, 0.2) 50%, rgba(237, 233, 254, 0.1) 100%)',
                                        boxShadow: '0 4px 20px rgba(167, 139, 250, 0.15)'
                                      }}
                                    >
                                      {/* Geometric SVG Background Pattern */}
                                      <div className="absolute inset-0 opacity-40">
                                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                          <defs>
                                            <linearGradient id={`init-fade-${initiative.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                              <stop offset="0%" style={{ stopColor: '#6b21a8', stopOpacity: 0.6 }} />
                                              <stop offset="100%" style={{ stopColor: '#6b21a8', stopOpacity: 0 }} />
                                            </linearGradient>
                                          </defs>
                                          {/* Geometric shapes - different pattern than orgs */}
                                          <circle cx="10%" cy="10%" r="70" fill={`url(#init-fade-${initiative.id})`} />
                                          <circle cx="85%" cy="15%" r="60" fill={`url(#init-fade-${initiative.id})`} />
                                          <polygon points="0,0 50,0 25,50" fill={`url(#init-fade-${initiative.id})`} transform="translate(20, 150)" />
                                          <polygon points="100,0 150,25 150,75 100,100 50,75 50,25" fill={`url(#init-fade-${initiative.id})`} transform="translate(280, 140)" />
                                        </svg>
                                      </div>
                                      
                                      {/* Content with relative positioning */}
                                      <div className="relative z-10">
                                      {/* Shine effect on hover */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                      
                                      {/* Content */}
                                      <div className="relative z-10 text-white">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                          <div className="flex-1">
                                            <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900">
                                              {initiative.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 font-roobert-light line-clamp-2">
                                              {initiative.description}
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
                                      </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </motion.section>
                          )}


                        </>
                      )}
                    </AnimatePresence>
                  } />

                  {/* Strategic Initiatives Route */}
                  <Route path="/strategic-initiatives" element={
                    <StrategicInitiativesDashboard />
                  } />

                  {/* Knowledge Base Route */}
                  <Route path="/knowledge-base" element={
                    <KnowledgeBaseDashboard />
                  } />

                  {/* Schema Test Route */}
                  <Route path="/schema-test" element={
                    <SchemaTest />
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
