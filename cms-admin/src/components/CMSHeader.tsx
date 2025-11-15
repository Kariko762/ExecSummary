import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Database, Menu, Settings, ChevronDown, FileText, Lightbulb, Search, BookOpen, Wrench, ChevronRight, Palette, Grid, Shield, LogOut, User, Check, MessageCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import APIDashboardModal from './APIDashboardModal';

interface CMSHeaderProps {
  onOpenAssetReference?: () => void;
  onOpenStyleScheme?: () => void;
  onOpenTemplateBuilder?: () => void;
  onOpenSystemSettings?: () => void;
  onOpenComments?: () => void;
}

export default function CMSHeader({ onOpenAssetReference, onOpenStyleScheme, onOpenTemplateBuilder, onOpenSystemSettings, onOpenComments }: CMSHeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [showAPIDashboard, setShowAPIDashboard] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [engineSubmenuOpen, setEngineSubmenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load custom logo from system settings
  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setCustomLogo(parsed.customLogo || null);
    }
  }, []);

  // Check backend connectivity
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content', { method: 'HEAD' });
        setBackendConnected(response.ok);
      } catch (error) {
        setBackendConnected(false);
      }
    };
    checkBackend();
    // Recheck every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
        setEngineSubmenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isNavDropdownOpen || isUserMenuOpen) {
      // Small delay to prevent immediate closure when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isNavDropdownOpen, isUserMenuOpen]);

  // Handle ESC key to close navigation menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isNavDropdownOpen) {
          setIsNavDropdownOpen(false);
          setEngineSubmenuOpen(false);
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        }
      }
    };

    if (isNavDropdownOpen || isUserMenuOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isNavDropdownOpen, isUserMenuOpen]);

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
              src={customLogo ? `http://localhost:3001${customLogo}` : "/FIS-Logo.png"}
              alt="Logo" 
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
          <div className="relative ml-6" ref={menuRef}>
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
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-visible z-[52]"
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

                        {/* System Settings */}
                        <button
                          onClick={() => {
                            onOpenSystemSettings?.();
                            setIsNavDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white text-left"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Shield className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">System Settings</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Authentication & security</div>
                          </div>
                        </button>

                        {/* Engine & Templates - WITH SUBMENU */}
                        <div className="relative">
                          <button
                            onMouseEnter={() => setEngineSubmenuOpen(true)}
                            onMouseLeave={() => setEngineSubmenuOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white text-left"
                          >
                            <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                              <Wrench className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-roobert-semibold text-sm">Engine & Templates</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Render engine & builders</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>

                          {/* Submenu - Slides out to the right */}
                          <AnimatePresence>
                            {engineSubmenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                onMouseEnter={() => setEngineSubmenuOpen(true)}
                                onMouseLeave={() => setEngineSubmenuOpen(false)}
                                className="absolute left-full top-0 ml-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[53]"
                              >
                                <div className="p-2">
                                  {/* Asset Reference */}
                                  <button
                                    onClick={() => {
                                      console.log('Asset Reference clicked!');
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                      onOpenAssetReference?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-fis-eggplant/10 dark:hover:bg-fis-eggplant/20 text-gray-900 dark:text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20">
                                      <BookOpen className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Asset Reference</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">All render types & examples</div>
                                    </div>
                                  </button>

                                  {/* Template Builder */}
                                  <button
                                    onClick={() => {
                                      console.log('Template Builder clicked!');
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                      onOpenTemplateBuilder?.();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-fis-eggplant/10 dark:hover:bg-fis-eggplant/20 text-gray-900 dark:text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20">
                                      <Grid className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Template Builder</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">Drag & drop template designer</div>
                                    </div>
                                  </button>

                                  {/* API Dashboard */}
                                  <button
                                    onClick={() => {
                                      setShowAPIDashboard(true);
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-fis-eggplant/10 dark:hover:bg-fis-eggplant/20 text-gray-900 dark:text-white text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-green-500/10">
                                      <Database className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">API Dashboard</div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400">Health checks & testing</div>
                                    </div>
                                  </button>

                                  {/* Design System */}
                                  <button
                                    onClick={() => {
                                      onOpenStyleScheme?.();
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-fis-raspberry/10">
                                      <Palette className="w-4 h-4 text-fis-raspberry" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Design System</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Colors, typography, spacing</div>
                                    </div>
                                  </button>

                                  {/* Knowledge Base Documentation */}
                                  <a
                                    href="/knowledge-base/kb_main.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      setIsNavDropdownOpen(false);
                                      setEngineSubmenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-indigo-500/10">
                                      <BookOpen className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-roobert-semibold text-sm">Documentation</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">CMS Admin knowledge base</div>
                                    </div>
                                  </a>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
          <div className="flex items-center space-x-3">
            {/* API Status */}
            <motion.button
              onClick={() => setShowAPIDashboard(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                backendConnected
                  ? 'border-[var(--accent-green)]/60 bg-[var(--accent-green)]/25 hover:bg-[var(--accent-green)]/40'
                  : 'border-red-400/60 bg-red-400/25 hover:bg-red-400/40'
              }`}
              title={backendConnected ? 'Backend Connected - Click to view API dashboard' : 'Backend Disconnected - Click to view API dashboard'}
            >
              <span className={`text-sm font-roobert-medium ${
                backendConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>API</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                backendConnected
                  ? 'border-[var(--accent-green)] bg-[var(--accent-green)]/30'
                  : 'border-red-500 bg-red-500/30'
              }`}>
                <Check className={`w-3 h-3 ${
                  backendConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </motion.button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass hover:glass-strong transition-all"
              >
                <span className="text-sm font-roobert-medium text-gray-600 dark:text-gray-400">Jason</span>
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    {/* Light/Dark Theme Toggle */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left"
                    >
                      <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </span>
                      {theme === 'light' ? (
                        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-yellow-400" />
                      )}
                    </button>

                    {/* Horizontal Rule */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                    {/* Profile */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        // TODO: Open profile modal/page
                        console.log('Profile clicked');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left"
                    >
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                        Profile
                      </span>
                    </button>

                    {/* Logout */}
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-roobert-medium">
                          Logout
                        </span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
