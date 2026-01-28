import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Presentation, Search, Menu, X, ChevronDown, ChevronRight, FileText, Lightbulb, Download, Settings, BookOpen, LogOut, Bell, Target, Cpu, CheckSquare, Rocket, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePresentation } from '../contexts/PresentationContext';
import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { renderWithExpressions } from '../utils/expressionParser';
import { domToPng } from 'modern-screenshot';

interface HeaderProps {
  onSearch: (query: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onSelectContent?: (content: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, isAuthenticated = false, onLogout, onSelectContent }) => {
  const { theme, toggleTheme } = useTheme();
  const { isPresentationMode, togglePresentationMode } = usePresentation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isTechnologiesOpen, setIsTechnologiesOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [technologiesMenu, setTechnologiesMenu] = useState<any[]>([]);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const announcementsRef = useRef<HTMLDivElement>(null);

  // Load custom logo from system settings
  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setCustomLogo(parsed.customLogo || null);
    }
  }, []);

  // Load announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content?tag=announcement');
        const data = await response.json();
        
        if (data.success && data.content) {
          // Map content to announcement format
          const mappedAnnouncements = data.content
            .filter((item: any) => item.status === 'published')
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              message: item.details || item.summary || item.sections?.[0]?.content || '',
              date: new Date(item.date || item._template_created),
              priority: item.priority || 'low',
              read: false
            }))
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime());
          
          setAnnouncements(mappedAnnouncements);
          setUnreadCount(mappedAnnouncements.length);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Load technologies menu
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/technologies-menu');
        const data = await response.json();
        if (data.success) {
          setTechnologiesMenu(data.items);
        }
      } catch (error) {
        console.error('Failed to fetch technologies menu:', error);
      }
    };
    
    fetchTechnologies();
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
        setIsTechnologiesOpen(false);
      }
      if (announcementsRef.current && !announcementsRef.current.contains(event.target as Node)) {
        setIsAnnouncementsOpen(false);
      }
    };

    if (isNavDropdownOpen || isAnnouncementsOpen) {
      // Small delay to prevent immediate closure when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isNavDropdownOpen, isAnnouncementsOpen]);

  // Handle ESC key to close navigation menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isNavDropdownOpen) {
          setIsNavDropdownOpen(false);
        }
        if (isAnnouncementsOpen) {
          setIsAnnouncementsOpen(false);
        }
      }
    };

    if (isNavDropdownOpen || isAnnouncementsOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isNavDropdownOpen, isAnnouncementsOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleExportDashboard = async () => {
    try {
      // Capture the entire viewport including header and main content
      const body = document.body;
      
      if (!body) {
        alert('Content not found');
        return;
      }

      // Use modern-screenshot instead of html2canvas (supports oklch colors)
      const dataUrl = await domToPng(body, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      // Download the image
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `executive-dashboard-${timestamp}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export dashboard. Error: ' + (error as Error).message);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 no-print"
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
              <h1 className="text-xl font-roobert-heavy text-gray-900 dark:text-white">
                Executive Summary
              </h1>
              <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                Command Center
              </p>
            </div>
          </motion.div>

          {/* Navigation Menu */}
          <div className="relative hidden md:block ml-6" ref={menuRef}>
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
                  className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
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
                        {/* Executive Summary */}
                        <Link
                          to="/"
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/' 
                              ? 'bg-fis-eggplant/20 text-fis-eggplant dark:bg-fis-eggplant/30 dark:text-purple-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/' 
                              ? 'bg-fis-eggplant/30 dark:bg-fis-eggplant/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Executive Summary</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Leadership dashboard and insights</div>
                          </div>
                        </Link>

                        {/* Initiatives */}
                        <Link
                          to="/initiatives"
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/initiatives' 
                              ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/initiatives' 
                              ? 'bg-pink-200 dark:bg-pink-800/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <Rocket className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Initiatives</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Transformation programs and projects</div>
                          </div>
                        </Link>

                        {/* Goals */}
                        <Link
                          to="/goals"
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/goals' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/goals' 
                              ? 'bg-purple-200 dark:bg-purple-800/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <Target className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Goals</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Strategic objectives and targets</div>
                          </div>
                        </Link>

                        {/* Budget */}
                        <Link
                          to="/budget"
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/budget' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/budget' 
                              ? 'bg-emerald-200 dark:bg-emerald-800/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Budget</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Financial forecasts and actuals</div>
                          </div>
                        </Link>

                        {/* Technologies button (slideout renders outside modal) */}
                        <button
                          onMouseEnter={() => setIsTechnologiesOpen(true)}
                          onClick={() => setIsTechnologiesOpen(!isTechnologiesOpen)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/technologies' || isTechnologiesOpen
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/technologies' || isTechnologiesOpen
                              ? 'bg-blue-200 dark:bg-blue-800/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-roobert-semibold text-sm">Technologies</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Vendor summaries and solutions</div>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${isTechnologiesOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Task List */}
                        <Link
                          to="/knowledge-base"
                          onClick={() => {
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/knowledge-base' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/knowledge-base' 
                              ? 'bg-green-200 dark:bg-green-800/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <CheckSquare className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Task List</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Action items and knowledge base</div>
                          </div>
                        </Link>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-fis-eggplant/30 to-transparent my-2" />

                        {/* Platform Overview */}
                        <Link
                          to="/platform-overview"
                          onClick={() => setIsNavDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            location.pathname === '/platform-overview' 
                              ? 'bg-fis-eggplant/20 text-fis-eggplant dark:bg-fis-eggplant/30 dark:text-purple-300' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            location.pathname === '/platform-overview' 
                              ? 'bg-fis-eggplant/30 dark:bg-fis-eggplant/40' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">Platform Overview</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Executive platform showcase</div>
                          </div>
                        </Link>

                        {/* CMS Admin Link */}
                        <a
                          href="http://localhost:5173"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <Settings className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-roobert-semibold text-sm">CMS Admin</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Content management system</div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </motion.div>
              )}
            </AnimatePresence>

            {/* Technologies Slideout - Rendered OUTSIDE the nav modal */}
            <AnimatePresence>
              {isTechnologiesOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onMouseLeave={() => setIsTechnologiesOpen(false)}
                  className="absolute left-[320px] top-[calc(100%+8px+200px)] w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[60]"
                >
                  <div className="p-3">
                    <div className="px-3 py-2 mb-2">
                      <div className="text-xs font-roobert-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Technology Summaries
                      </div>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-2" />
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {technologiesMenu.map((tech) => (
                        <button
                          key={tech.id}
                          onClick={async () => {
                            console.log('Technology clicked:', tech);
                            setIsNavDropdownOpen(false);
                            setIsTechnologiesOpen(false);
                            if (tech.contentId) {
                              try {
                                console.log('Fetching content:', tech.contentId);
                                const response = await fetch(`http://localhost:3001/api/content/${tech.contentId}`);
                                const data = await response.json();
                                console.log('Content data received:', data);
                                if (onSelectContent) {
                                  // API returns content directly, not wrapped in {success, content}
                                  console.log('Opening content modal with:', data);
                                  onSelectContent(data);
                                }
                              } catch (error) {
                                console.error('Failed to fetch content:', error);
                              }
                            } else {
                              console.log('No contentId for tech:', tech.name);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-all"
                        >
                          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-roobert-medium">{tech.name}</span>
                        </button>
                      ))}
                      {technologiesMenu.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No technologies available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search summaries..."
                className="w-full pl-10 pr-4 py-2 rounded-lg glass border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Announcements Bell */}
            <div className="relative" ref={announcementsRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAnnouncementsOpen(!isAnnouncementsOpen)}
                className="relative p-2 rounded-lg glass hover:glass-strong transition-all"
                title="Announcements"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Announcements Dropdown */}
              <AnimatePresence>
                {isAnnouncementsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                          Announcements
                        </h3>
                        <button
                          onClick={() => setIsAnnouncementsOpen(false)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-roobert-medium">No announcements</p>
                            <p className="text-sm">You're all caught up!</p>
                          </div>
                        ) : (
                          announcements.map((announcement) => (
                            <motion.div
                              key={announcement.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                announcement.read
                                  ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                              }`}
                              onClick={() => {
                                // Mark as read
                                setAnnouncements(prev => 
                                  prev.map(a => 
                                    a.id === announcement.id ? { ...a, read: true } : a
                                  )
                                );
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                                  {renderWithExpressions(announcement.title)}
                                </h4>
                                <div className={`w-2 h-2 rounded-full ${
                                  announcement.priority === 'high' ? 'bg-red-500' :
                                  announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {renderWithExpressions(announcement.message)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {announcement.date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {!announcement.read && (
                                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {announcements.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
                              setUnreadCount(0);
                            }}
                            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          >
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleExportDashboard}
              className="p-2 rounded-lg glass hover:glass-strong transition-all"
              title="Export Dashboard as Image"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePresentationMode}
              className="p-2 rounded-lg glass hover:glass-strong transition-all"
              title="Toggle Presentation Mode"
            >
              <Presentation className={`w-5 h-5 ${isPresentationMode ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
            </motion.button>

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

            {/* Logout Button - Show only when authenticated */}
            {isAuthenticated && onLogout && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all border border-red-500/30"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-roobert-medium">Logout</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg glass"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-white/20 dark:border-white/10"
          >
            {/* Mobile Navigation */}
            <div className="mb-4">
              {/* Demo Services Group Header */}
              <div className="px-4 py-2 mb-2">
                <div className="text-xs font-roobert-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Demo Services Group
                </div>
              </div>
              
              {/* Divider */}
              <div className="h-px bg-gray-200 dark:bg-gray-700 mb-2 mx-4" />

              {/* Menu Items */}
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === '/' 
                      ? 'bg-fis-eggplant/20 text-fis-eggplant dark:bg-fis-eggplant/30 dark:text-purple-300' 
                      : 'hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-roobert-semibold text-sm">Executive Summary Dashboard</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Performance dashboards</div>
                  </div>
                </Link>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-fis-eggplant/30 to-transparent my-2 mx-4" />

                {/* CMS Admin Link */}
                <a
                  href="http://localhost:5173"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-white"
                >
                  <Settings className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-roobert-semibold text-sm">CMS Admin</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Content management</div>
                  </div>
                </a>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search summaries..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg glass border-0 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
            </form>

            <div className="flex items-center justify-center space-x-4">
              {/* Mobile Announcements Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsAnnouncementsOpen(!isAnnouncementsOpen)}
                  className="relative flex items-center space-x-2 px-4 py-2 rounded-lg glass"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">Announcements</span>
                </button>
              </div>

              <button
                onClick={handleExportDashboard}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg glass"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Export</span>
              </button>

              <button
                onClick={togglePresentationMode}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg glass"
              >
                <Presentation className={`w-5 h-5 ${isPresentationMode ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">Presentation</span>
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg glass"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>

            {/* Mobile Announcements Dropdown */}
            <AnimatePresence>
              {isAnnouncementsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                        Announcements
                      </h3>
                      <button
                        onClick={() => setIsAnnouncementsOpen(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {announcements.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="font-roobert-medium">No announcements</p>
                          <p className="text-sm">You're all caught up!</p>
                        </div>
                      ) : (
                        announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className={`p-3 rounded-lg border transition-all ${
                              announcement.read
                                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            }`}
                            onClick={() => {
                              // Mark as read
                              setAnnouncements(prev => 
                                prev.map(a => 
                                  a.id === announcement.id ? { ...a, read: true } : a
                                )
                              );
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                                {renderWithExpressions(announcement.title)}
                              </h4>
                              <div className={`w-2 h-2 rounded-full ${
                                announcement.priority === 'high' ? 'bg-red-500' :
                                announcement.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {renderWithExpressions(announcement.message)}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {announcement.date.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {!announcement.read && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {announcements.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
                            setUnreadCount(0);
                          }}
                          className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Logout Button */}
            {isAuthenticated && onLogout && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 transition-all border border-red-500/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-roobert-medium">Logout</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};
