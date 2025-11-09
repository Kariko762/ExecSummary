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
import { timelineItems, isExecutiveSummary } from './data/timeline-loader';
import { TimelineItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [selectedSummary, setSelectedSummary] = useState<TimelineItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [requireAuth, setRequireAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  const filteredSummaries = timelineItems.filter(summary => {
    const searchLower = searchQuery.toLowerCase();
    const baseMatch = 
      summary.title.toLowerCase().includes(searchLower) ||
      summary.quarter.toLowerCase().includes(searchLower) ||
      summary.year.toString().includes(searchLower);
    
    if (isExecutiveSummary(summary)) {
      return baseMatch || summary.highlights.some(h => h.toLowerCase().includes(searchLower));
    }
    return baseMatch;
  });

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fis-eggplant border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-roobert-medium">
            Loading...
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
            <Header onSearch={setSearchQuery} />
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
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-roobert-heavy text-fis-navy dark:text-white mb-3">
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

                          {/* Organization Dashboard */}
                          <motion.section
                            id="organizations"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mb-12"
                          >
                            <OrganizationDashboard />
                          </motion.section>

                          {/* Summary Cards Grid */}
                          <motion.section
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <div className="flex items-center justify-between mb-8">
                              <h2 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
                                {searchQuery ? 'Search Results' : 'All Summaries'}
                              </h2>
                              <span className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">
                                {filteredSummaries.length} {filteredSummaries.length === 1 ? 'summary' : 'summaries'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                              {filteredSummaries.filter(isExecutiveSummary).map((summary, index) => (
                                <SummaryCard
                                  key={summary.id}
                                  summary={summary}
                                  onClick={() => setSelectedSummary(summary)}
                                  index={index}
                                />
                              ))}
                            </div>

                            {filteredSummaries.length === 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 glass-strong rounded-2xl"
                              >
                                <p className="text-2xl font-roobert-medium text-gray-500 dark:text-gray-400">
                                  No summaries found matching "{searchQuery}"
                                </p>
                              </motion.div>
                            )}
                          </motion.section>
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
            </main>
          </div>
        </PresentationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
