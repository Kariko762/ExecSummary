import { motion } from 'framer-motion';
import { 
  X, Target, Zap, Settings, Layout, Presentation,
  BarChart3, PieChart, MousePointerClick, Shield,
  FileText, Users, TrendingUp, CheckCircle, Clock, Sparkles, Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';

interface PlatformOverviewProps {
  onClose: () => void;
}

export default function PlatformOverview({ onClose }: PlatformOverviewProps) {
  const [activeSection, setActiveSection] = useState('impact');

  useEffect(() => {
    // Add print styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .print-hide { display: none !important; }
        body { background: white !important; }
        * { color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    // Scroll spy to update active section
    const handleScroll = () => {
      const contentDiv = document.getElementById('platform-overview-content');
      if (!contentDiv) return;

      const scrollPosition = contentDiv.scrollTop + 100; // Account for sticky nav bar
      
      const sections = ['impact', 'frontend', 'cms', 'assets', 'benefits'];
      
      // Find which section is currently in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const sectionTop = section.offsetTop - contentDiv.offsetTop;
          if (scrollPosition >= sectionTop - 50) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    const contentDiv = document.getElementById('platform-overview-content');
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll);
      // Initial call to set active section on load
      handleScroll();
      return () => contentDiv.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const sections = [
    { id: 'impact', label: 'Impact at a Glance', icon: Zap },
    { id: 'frontend', label: 'Frontend Features', icon: Presentation },
    { id: 'cms', label: 'CMS Backend', icon: Settings },
    { id: 'assets', label: 'Visual Assets', icon: Layout },
    { id: 'benefits', label: 'Strategic Value', icon: Target },
  ];

  const scrollToSection = (sectionId: string) => {
    const contentDiv = document.getElementById('platform-overview-content');
    const element = document.getElementById(sectionId);
    
    if (element && contentDiv) {
      const navHeight = 60; // Height of sticky navigation bar
      const elementPosition = element.offsetTop - contentDiv.offsetTop;
      const offsetPosition = elementPosition - navHeight;

      contentDiv.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update active section immediately on click
      setActiveSection(sectionId);
    }
  };

  const handleExport = async () => {
    const wrapper = document.getElementById('platform-overview-full');
    const contentElement = document.getElementById('platform-overview-content');
    
    if (!wrapper || !contentElement) return;

    try {
      console.log('📸 Starting screenshot export...');
      
      // Store original styles
      const originalWrapperOverflow = wrapper.style.overflow;
      const originalContentHeight = contentElement.style.height;
      const originalContentOverflow = contentElement.style.overflow;
      
      // Temporarily make everything visible
      wrapper.style.overflow = 'visible';
      contentElement.style.height = 'auto';
      contentElement.style.overflow = 'visible';
      
      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Calculate full height
      const fullHeight = wrapper.scrollHeight;
      const fullWidth = wrapper.scrollWidth;
      
      console.log(`Capturing ${fullWidth}x${fullHeight}px...`);
      
      // Capture the full wrapper
      const dataUrl = await domToPng(wrapper, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
      });
      
      // Restore original styles
      wrapper.style.overflow = originalWrapperOverflow;
      contentElement.style.height = originalContentHeight;
      contentElement.style.overflow = originalContentOverflow;
      
      console.log('✅ Screenshot captured, downloading...');
      
      // Download the image
      const link = document.createElement('a');
      link.download = `platform-overview-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      console.log('✅ Export complete!');
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export image');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 overflow-hidden" id="platform-overview-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-fis-navy to-fis-eggplant text-white py-5 shadow-2xl border-b border-fis-eggplant/30">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/FIS-Logo.png" alt="FIS Logo" className="h-10" />
            <div>
              <h1 className="text-2xl font-roobert-bold">Executive Summary Platform</h1>
              <p className="text-xs text-white/80 mt-0.5">Visual Communication & Performance Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3 print-hide mr-2">
            <button
              onClick={handleExport}
              className="p-2 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/30 shadow-lg"
              title="Export as PNG"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20 hover:border-white/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-88px)] overflow-y-auto" id="platform-overview-content">
        {/* Sticky Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-8">
            <nav className="flex gap-1 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-roobert-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? 'border-fis-eggplant text-fis-eggplant dark:text-fis-raspberry dark:border-fis-raspberry'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
            
            {/* IMPACT AT A GLANCE */}
            <section id="impact" className="scroll-mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h2 className="text-4xl font-roobert-bold bg-gradient-to-r from-fis-eggplant to-fis-navy bg-clip-text text-transparent mb-4">
                  Centralized Executive Communications
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Streamline, standardize, and elevate your leadership messaging
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200/50 dark:border-green-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                  <div className="text-2xl font-roobert-bold text-green-600 dark:text-green-400">Visually</div>
                  <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mt-1">Engaging & Interactive</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border-2 border-blue-200/50 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <div className="text-2xl font-roobert-bold text-blue-600 dark:text-blue-400">100%</div>
                  <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mt-1">Brand Consistency</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-6 rounded-xl border-2 border-purple-200/50 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <div className="text-2xl font-roobert-bold text-purple-600 dark:text-purple-400">Real-Time</div>
                  <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mt-1">Updates & Tracking</div>
                </div>
              </div>
            </section>

            {/* FRONTEND FEATURES */}
            <section id="frontend" className="scroll-mt-8">
              <h2 className="text-3xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                Frontend Features
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Premium executive dashboard with professional visualizations and interactive elements
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Presentation className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      3D Cards & Glassmorphism
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Premium card animations with hover effects, shadow depth, and modern glassmorphism design
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Interactive Data Visualizations
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Revenue charts, growth metrics, radial progress, pie charts, and bar charts with custom tooltips
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Interactive Timeline
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Horizontal timeline navigation through quarterly summaries with visual progress indicators
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Organization Dashboard
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Track performance across business units with KPIs, projects, demos, and hours tracking
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Strategic Initiatives
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Comprehensive initiative tracking with 14+ flexible sections, SMART goals, and milestone timelines
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Presentation className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Presentation Mode
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Full-screen mode perfect for board meetings, with dark/light theme switching
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      100% Offline Capable
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    All assets bundled locally - no internet required, fully responsive on all devices
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Print & Export Support
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Generate beautiful PDF reports, export goals as images for presentations
                  </p>
                </div>
              </div>
            </section>

            {/* CMS BACKEND FEATURES */}
            <section id="cms" className="scroll-mt-8">
              <h2 className="text-3xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                CMS Backend Features
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Powerful content management system with visual editing, template building, and goal tracking
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointerClick className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Drag-and-Drop Template Builder
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Visual template creation with 22+ asset types. Drag assets from palette, configure properties, preview live
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Goal Setting & Tracking
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Create custom goals with icons, colors, descriptions. Tag content to goals for strategic alignment
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Visual Content Editor
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Modal-based editor with real-time preview, completion tracking, and section enable/disable controls
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Protection System
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Weighted completion tracking prevents incomplete publishing. Visual progress donut with color-coded status
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Template System
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Create from instructional templates or clone existing summaries. Track base template used
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Draft/Live Status Management
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Clear visual indicators with badges, warnings for published content, auto-save with dirty state tracking
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Content Tagging System
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    6 tag categories (Weekly Summaries, Executive IQ, Organizations). Click to filter in Grid or Table view
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Dual View Modes
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Toggle between Grid (cards) and Table (professional data table with sidebar navigation)
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Authentication System
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    JWT-based login with role-based permissions (admin, editor, viewer), bcrypt password hashing
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-purple-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:border-fis-eggplant/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
                      Design System Manager
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Centralized color, typography, and spacing configuration with semantic CSS variables
                  </p>
                </div>
              </div>
            </section>

            {/* VISUAL ASSETS LIBRARY */}
            <section id="assets" className="scroll-mt-8">
              <h2 className="text-3xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                Visual Assets Library
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                22 professional asset types for creating rich, data-driven executive summaries
              </p>

              <div className="space-y-6">
                {/* Basic Text Assets */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-roobert-semibold text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Basic Text & Rich Content (4 assets)
                  </h3>
                  <div className="flex gap-4">
                    {/* Example Asset - 20% */}
                    <div className="w-1/5 flex-shrink-0">
                      <div className="bg-purple-100/50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700 p-3 py-4 h-full flex flex-col justify-center gap-3">
                        {/* Quote Block */}
                        <div className="border-l-4 border-purple-900 dark:border-purple-950 rounded-l-lg bg-white dark:bg-gray-800 p-2">
                          <div className="text-[9px] italic text-gray-700 dark:text-gray-300">Strong momentum across Demo Services Group with key wins.</div>
                        </div>
                        {/* Code Block */}
                        <div className="bg-purple-900 dark:bg-purple-950 rounded-lg p-2">
                          <div className="text-[9px] font-mono text-gray-100">const example = "code snippet";</div>
                        </div>
                      </div>
                    </div>
                    {/* Asset Grid - 80% */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-xs font-roobert-semibold text-purple-700 dark:text-purple-400 mb-1">Text</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Single-line text</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-xs font-roobert-semibold text-purple-700 dark:text-purple-400 mb-1">Textarea</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Multi-line paragraphs</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-xs font-roobert-semibold text-purple-700 dark:text-purple-400 mb-1">Rich Text</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Bold, italic, highlights</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-xs font-roobert-semibold text-purple-700 dark:text-purple-400 mb-1">Quote</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Highlighted quotes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lists */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-roobert-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Lists & Structured Data (6 assets)
                  </h3>
                  <div className="flex gap-4">
                    {/* Example Asset - 20% */}
                    <div className="w-1/5 flex-shrink-0">
                      <div className="bg-blue-100/50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 p-3 h-full flex flex-col justify-between gap-2">
                        {/* Progress Bar List */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-[9px] font-roobert-semibold text-gray-900 dark:text-gray-100">Banking NA Microsite</div>
                              <div className="text-[7px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">On Track</div>
                            </div>
                            <div className="text-[8px] text-gray-600 dark:text-gray-400 mb-1">Demo Business</div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '75%'}}></div>
                            </div>
                            <div className="text-[7px] text-gray-500 dark:text-gray-500 mt-0.5">75% complete</div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-[9px] font-roobert-semibold text-gray-900 dark:text-gray-100">SNOW Migration</div>
                              <div className="text-[7px] px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">On Track</div>
                            </div>
                            <div className="text-[8px] text-gray-600 dark:text-gray-400 mb-1">Demo Operations</div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                            </div>
                            <div className="text-[7px] text-gray-500 dark:text-gray-500 mt-0.5">85% complete</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Asset Grid - 80% */}
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Highlights List</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Numbered pink badges</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Bullet List</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Simple bullet points</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Checklist Items</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Checkbox indicators</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Progress Bar List</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Tasks with % bars</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Key-Value List</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Label: Value pairs</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="text-xs font-roobert-semibold text-blue-700 dark:text-blue-400 mb-1">Nested Cards</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Hierarchical data</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-roobert-semibold text-green-900 dark:text-green-300 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Charts & Metrics (5 assets)
                  </h3>
                  <div className="flex gap-4">
                    {/* Example Asset - 20% */}
                    <div className="w-1/5 flex-shrink-0">
                      <div className="bg-green-100/50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700 p-3 h-full flex flex-col items-center justify-center">
                        {/* Multi-ring Radial Chart */}
                        <div className="relative w-24 h-24">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Background circles */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                            <circle cx="50" cy="50" r="25" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                            <circle cx="50" cy="50" r="15" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                            
                            {/* Outer ring - Strategic Initiatives (green) - 270 degrees */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="6" 
                              strokeDasharray="212 70" 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                              strokeLinecap="round" />
                            
                            {/* Second ring - GTM Support (blue) - 300 degrees */}
                            <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="6" 
                              strokeDasharray="183 37" 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                              strokeLinecap="round" />
                            
                            {/* Third ring - Demo Operations (pink) - 240 degrees */}
                            <circle cx="50" cy="50" r="25" fill="none" stroke="#ec4899" strokeWidth="6" 
                              strokeDasharray="104 53" 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                              strokeLinecap="round" />
                            
                            {/* Inner ring - Demo Enablement (purple) - 200 degrees */}
                            <circle cx="50" cy="50" r="15" fill="none" stroke="#8b5cf6" strokeWidth="6" 
                              strokeDasharray="52 42" 
                              strokeDashoffset="0" 
                              transform="rotate(-90 50 50)" 
                              strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-purple-500"></div>
                            <span className="text-[7px] text-gray-700 dark:text-gray-300">Demo Enablement</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-pink-500"></div>
                            <span className="text-[7px] text-gray-700 dark:text-gray-300">Demo Operations</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-blue-500"></div>
                            <span className="text-[7px] text-gray-700 dark:text-gray-300">GTM Support</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-green-500"></div>
                            <span className="text-[7px] text-gray-700 dark:text-gray-300">Strategic Initiatives</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Asset Grid - 80% */}
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-xs font-roobert-semibold text-green-700 dark:text-green-400 mb-1">Metric Card</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">KPI displays</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-xs font-roobert-semibold text-green-700 dark:text-green-400 mb-1">Radial Progress</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Circular charts</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-xs font-roobert-semibold text-green-700 dark:text-green-400 mb-1">Pie Chart</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Data distribution</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-xs font-roobert-semibold text-green-700 dark:text-green-400 mb-1">Bar Chart</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Comparative data</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="text-xs font-roobert-semibold text-green-700 dark:text-green-400 mb-1">Line Chart</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Trends over time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complex Visualizations */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-roobert-semibold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Complex Visualizations (5 assets)
                  </h3>
                  <div className="flex gap-4">
                    {/* Example Asset - 20% */}
                    <div className="w-1/5 flex-shrink-0">
                      <div className="bg-orange-100/50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700 p-2 h-full flex flex-col justify-between">
                        {/* Status Board - 3 columns */}
                        <div className="grid grid-cols-3 gap-1">
                          {/* On Track */}
                          <div className="bg-green-50 dark:bg-green-900/20 rounded p-1.5">
                            <div className="text-[7px] font-roobert-semibold text-green-700 dark:text-green-300 border-b border-green-200 dark:border-green-800 pb-0.5 mb-1">On Track</div>
                            <div className="space-y-1">
                              <div className="text-[7px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-1">Demo improvements ongoing</div>
                              <div className="text-[7px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-1">New deployment process</div>
                            </div>
                          </div>
                          {/* Blocked */}
                          <div className="bg-red-50 dark:bg-red-900/20 rounded p-1.5">
                            <div className="text-[7px] font-roobert-semibold text-red-700 dark:text-red-300 border-b border-red-200 dark:border-red-800 pb-0.5 mb-1">Blocked</div>
                            <div className="space-y-1">
                              <div className="text-[7px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-1">Shift Payment Audit Trail</div>
                            </div>
                          </div>
                          {/* Completed */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-1.5">
                            <div className="text-[7px] font-roobert-semibold text-blue-700 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800 pb-0.5 mb-1">Completed</div>
                            <div className="space-y-1">
                              <div className="text-[7px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-1">Team shift recording</div>
                              <div className="text-[7px] text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded p-1">Payment issues resolved</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Asset Grid - 80% */}
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="text-xs font-roobert-semibold text-orange-700 dark:text-orange-400 mb-1">Status Board</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Multi-column status</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="text-xs font-roobert-semibold text-orange-700 dark:text-orange-400 mb-1">Timeline</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Event sequences</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="text-xs font-roobert-semibold text-orange-700 dark:text-orange-400 mb-1">Risk Card</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Risk assessment</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="text-xs font-roobert-semibold text-orange-700 dark:text-orange-400 mb-1">Two-Column</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Side-by-side</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="text-xs font-roobert-semibold text-orange-700 dark:text-orange-400 mb-1">Category List</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Grouped items</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utility Assets */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Utility Assets (3 assets)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-400 mb-1">Horizontal Rule</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Section dividers with brand colors</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-400 mb-1">Number Display</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Large formatted numbers</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-400 mb-1">Multi-Column Spacer</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Layout spacing control</div>
                    </div>
                  </div>
                </div>

                {/* Assets In-Development */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <h3 className="text-lg font-roobert-semibold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Assets In-Development (3 assets)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      <div className="text-xs font-roobert-semibold text-indigo-700 dark:text-indigo-400 mb-1">Financial Forecast</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Multi-period projections</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      <div className="text-xs font-roobert-semibold text-indigo-700 dark:text-indigo-400 mb-1">Budget Analysis</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Variance tracking</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
                      <div className="text-xs font-roobert-semibold text-indigo-700 dark:text-indigo-400 mb-1">Interactive Org Charts</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Hierarchical structures</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STRATEGIC VALUE & BENEFITS */}
            <section id="benefits" className="scroll-mt-8">
              <h2 className="text-3xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                Strategic Communication & Performance Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                How this platform helps leadership communicate effectively and track organizational performance
              </p>

              <div className="space-y-4">
                {/* Executive Communication */}
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Presentation className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-roobert-semibold text-purple-900 dark:text-purple-300 mb-2">
                        Executive Leadership Communication
                      </h3>
                      <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Consistent Messaging:</strong> Standardized templates ensure leadership communicates with unified voice and brand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Visual Storytelling:</strong> Replace dense spreadsheets with engaging charts, timelines, and progress indicators</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Board-Ready Presentations:</strong> Full-screen presentation mode with professional design for stakeholder meetings</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Performance Tracking */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2">
                        Real-Time Performance Tracking
                      </h3>
                      <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Live KPI Monitoring:</strong> Track revenue, customer growth, NPS scores, and custom metrics in real-time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Cross-Unit Visibility:</strong> Monitor performance across business units (Banking, Capital Markets, Payments) in one dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Progress Indicators:</strong> Visual completion tracking with weighted sections and color-coded status (Green/Yellow/Red)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Strategic Alignment */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-roobert-semibold text-green-900 dark:text-green-300 mb-2">
                        Strategic Goals & Initiative Tracking
                      </h3>
                      <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Goal-Based Content Tagging:</strong> Create strategic goals, tag all content to goals, visualize alignment across organization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Initiative Management:</strong> Track 14+ aspects of strategic initiatives including SMART goals, milestones, risks, and dependencies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Stakeholder Visibility:</strong> Clear owner identification, timeline tracking, and resource allocation transparency</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Efficiency & Speed */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-roobert-semibold text-orange-900 dark:text-orange-300 mb-2">
                        Operational Efficiency
                      </h3>
                      <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Centralized Platform:</strong> Single source of truth for all executive communications and performance data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Template Standardization:</strong> Ensure consistent messaging and branding across all leadership communications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <span><strong>Streamlined Workflow:</strong> Efficient content creation with auto-save, draft protection, and reusable templates</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final CTA */}
              <div className="mt-8 bg-gradient-to-r from-fis-navy to-fis-eggplant p-6 rounded-xl text-white text-center">
                <h3 className="text-xl font-roobert-bold mb-2">
                  Unified Platform for Executive Excellence
                </h3>
                <p className="text-sm text-white/90 mb-4">
                  Centralize communications · Standardize messaging · Elevate impact
                </p>
                <div className="flex justify-center gap-12">
                  <div className="text-center">
                    <div className="text-xl font-roobert-bold">One Platform</div>
                    <div className="text-xs text-white/70">All Communications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-roobert-bold">Consistent</div>
                    <div className="text-xs text-white/70">Brand & Messaging</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-roobert-bold">Real-Time</div>
                    <div className="text-xs text-white/70">Performance Tracking</div>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
