import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PresentationProvider } from './contexts/PresentationContext';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { Dashboard } from './components/Dashboard';
import { SummaryDetail } from './components/SummaryDetail';
import { Timeline } from './components/Timeline';
import { StickyNav } from './components/StickyNav';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { executiveSummaries } from './data/summaries-loader';
import { ExecutiveSummary } from './types';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [selectedSummary, setSelectedSummary] = useState<ExecutiveSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSummaries = executiveSummaries.filter(summary => {
    const searchLower = searchQuery.toLowerCase();
    return (
      summary.title.toLowerCase().includes(searchLower) ||
      summary.quarter.toLowerCase().includes(searchLower) ||
      summary.year.toString().includes(searchLower) ||
      summary.highlights.some(h => h.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Router>
      <ThemeProvider>
        <PresentationProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant transition-colors duration-500">
            <Header onSearch={setSearchQuery} />
            <StickyNav />
            
            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  {selectedSummary ? (
                    <SummaryDetail
                      summary={selectedSummary}
                      onClose={() => setSelectedSummary(null)}
                    />
                  ) : (
                    <>
                      {/* Hero Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                      >
                        <h1 className="text-5xl md:text-6xl font-roobert-heavy text-fis-navy dark:text-white mb-4">
                          Executive Summary Dashboard
                        </h1>
                        <p className="text-xl font-roobert-medium" style={{ color: '#4bcd3e' }}>
                          Demo Services Group | RevOps
                        </p>
                      </motion.div>

                      {/* Timeline */}
                      <section id="timeline" className="mb-16">
                        <Timeline
                          summaries={executiveSummaries}
                          onSelectSummary={setSelectedSummary}
                        />
                      </section>

                      {/* Performance Dashboard */}
                      <motion.section
                        id="performance"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-16"
                      >
                        <Dashboard />
                      </motion.section>

                      {/* Organization Dashboard */}
                      <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-16"
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
                          {filteredSummaries.map((summary, index) => (
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
              </div>
            </main>
          </div>
        </PresentationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
