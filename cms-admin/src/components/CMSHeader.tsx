import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Database, Menu, Settings, ChevronDown, FileText, Lightbulb, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import APIDashboardModal from './APIDashboardModal';

export const CMSHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const [showAPIDashboard, setShowAPIDashboard] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', searchQuery);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/FIS-Logo.png" 
              alt="FIS Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                ContentIQ
              </h1>
              <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                Executive Dashboard CMS
              </p>
            </div>
          </motion.div>

          {/* Navigation Menu */}
          <div className="relative ml-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass hover:glass-strong transition-all"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isNavDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNavDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu - SOLID BACKGROUND */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-3">
                      {/* Demo Services Group Header */}
                      <div className="px-3 py-2 mb-2">
                        <div className="text-xs font-roobert-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Demo Services Group
                        </div>
                      </div>
                      
                      {/* Divider */}
                      <div className="h-px bg-gray-200 dark:bg-gray-700 mb-2" />

                      {/* Menu Items */}
                      <div className="space-y-1">
                        {/* Executive Summary Dashboard */}
                        <a
                          href="http://localhost:5174"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Executive Summary Dashboard</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Performance dashboards & updates</div>
                          </div>
                        </a>

                        {/* Strategic Initiatives */}
                        <a
                          href="http://localhost:5174/strategic-initiatives"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                          onClick={() => setIsNavDropdownOpen(false)}
                        >
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Strategic Initiatives</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Executive project summaries</div>
                          </div>
                        </a>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-fis-eggplant/30 to-transparent my-2" />

                        {/* CMS Admin - ACTIVE */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-fis-eggplant/20 text-fis-eggplant dark:bg-fis-eggplant/30 dark:text-purple-300">
                          <div className="p-2 rounded-lg bg-fis-eggplant/30 dark:bg-fis-eggplant/40">
                            <Settings className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">CMS Admin</div>
                            <div className="text-xs text-fis-eggplant/70 dark:text-purple-400/70">Content management system</div>
                          </div>
                        </div>

                        {/* API Dashboard */}
                        <button
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setShowAPIDashboard(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-left"
                        >
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <Database className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">API Dashboard</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Health checks & testing</div>
                          </div>
                        </button>

                        {/* System Settings Placeholder */}
                        <button
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            // TODO: Open system settings modal
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <Settings className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm text-gray-500 dark:text-gray-500">System Settings</div>
                            <div className="text-xs text-gray-400">Coming soon</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content..."
                className="w-full pl-10 pr-4 py-2 rounded-lg glass border-0 focus:ring-2 focus:ring-fis-eggplant text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowAPIDashboard(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-600 dark:text-green-400 text-sm font-roobert-medium transition-all cursor-pointer border border-green-500/30"
              title="Click to view API dashboard"
            >
              ● Backend Connected
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:glass-strong transition-all"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* API Dashboard Modal */}
      <APIDashboardModal 
        isOpen={showAPIDashboard} 
        onClose={() => setShowAPIDashboard(false)} 
      />
    </motion.header>
  );
};
