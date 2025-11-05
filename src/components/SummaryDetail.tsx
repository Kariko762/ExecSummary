import { motion } from 'framer-motion';
import { ExecutiveSummary } from '../types';
import { X, TrendingUp, Users, DollarSign, ThumbsUp, Calendar, Target, AlertTriangle, CheckCircle2, Clock, Download } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { WeeklyFocus } from './WeeklyFocus';
import { IssuesBlockers } from './IssuesBlockers';
import { useState, useEffect } from 'react';
import { renderWithExpressions } from '../utils/expressionParser';
import html2canvas from 'html2canvas';

interface SummaryDetailProps {
  summary: ExecutiveSummary;
  onClose: () => void;
}

export const SummaryDetail: React.FC<SummaryDetailProps> = ({ summary, onClose }) => {
  const [activeSection, setActiveSection] = useState('metrics');
  const [showNav, setShowNav] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.classList.contains('summary-content')) {
        const scrollTop = target.scrollTop;
        
        // Shrink header after 50px scroll
        setIsHeaderCompact(scrollTop > 50);
        
        // Show nav after 100px scroll (after header shrinks)
        setShowNav(scrollTop > 100);
        
        // Update active section based on scroll position
        const sections = ['metrics', 'performance', 'focus', 'issues', 'risks'];
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= 300) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    const contentDiv = document.querySelector('.summary-content');
    contentDiv?.addEventListener('scroll', handleScroll);
    return () => contentDiv?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const contentDiv = document.querySelector('.summary-content');
    const element = document.getElementById(sectionId);
    
    if (contentDiv && element) {
      const elementTop = element.offsetTop - 180; // Account for header + nav
      const maxScroll = contentDiv.scrollHeight - contentDiv.clientHeight;
      
      // If we can't scroll far enough to put the element at the top (high resolution/tall viewport),
      // scroll to the bottom to show the element
      if (elementTop > maxScroll) {
        contentDiv.scrollTo({ top: contentDiv.scrollHeight, behavior: 'smooth' });
      } else {
        // Normal scroll to anchor position
        contentDiv.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      case 'on-track':
        return 'text-[#3bcd3e] dark:text-[#3bcd3e] bg-[#3bcd3e]/20';
      case 'at-risk':
        return 'text-fis-raspberry dark:text-fis-raspberry bg-fis-raspberry/20';
      case 'delayed':
        return 'text-fis-eggplant dark:text-fis-eggplant bg-fis-eggplant/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'on-track':
        return <TrendingUp className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'delayed':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const departmentChartData = summary.departments.map((dept) => ({
    name: dept.name,
    performance: dept.performance,
    fill: dept.performance >= 90 ? '#10B981' : dept.performance >= 80 ? '#3B82F6' : '#F59E0B',
  }));

  const handleExportImage = async () => {
    const contentDiv = document.querySelector('.summary-content') as HTMLElement;
    const modalContainer = document.querySelector('.summary-modal-container') as HTMLElement;
    
    if (!contentDiv || !modalContainer) return;

    try {
      // Temporarily expand the container to full height
      const originalMaxHeight = modalContainer.style.maxHeight;
      const originalOverflow = contentDiv.style.overflow;
      
      modalContainer.style.maxHeight = 'none';
      contentDiv.style.overflow = 'visible';
      contentDiv.style.maxHeight = 'none';

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the full content
      const canvas = await html2canvas(modalContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: contentDiv.scrollHeight,
      });

      // Restore original styles
      modalContainer.style.maxHeight = originalMaxHeight;
      contentDiv.style.overflow = originalOverflow;
      contentDiv.style.maxHeight = '';

      // Convert to image and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `executive-summary-${summary.quarter.replace(/\s+/g, '-').toLowerCase()}-${summary.year}.png`;
          link.download = fileName;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen py-8 px-4"
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col summary-modal-container">
          {/* Header */}
          <motion.div 
            className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 relative rounded-t-3xl z-10 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
            animate={{
              paddingTop: isHeaderCompact ? '1rem' : '2rem',
              paddingBottom: isHeaderCompact ? '1rem' : '2rem',
              paddingLeft: '2rem',
              paddingRight: '2rem'
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={handleExportImage}
              className="absolute top-4 right-16 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              title="Export as Image"
            >
              <Download className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="flex items-center space-x-4">
              <motion.div 
                className="rounded-2xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center"
                animate={{
                  width: isHeaderCompact ? '3rem' : '4rem',
                  height: isHeaderCompact ? '3rem' : '4rem'
                }}
              >
                <Calendar className={isHeaderCompact ? "w-6 h-6 text-white" : "w-8 h-8 text-white"} />
              </motion.div>
              <div className="flex-1">
                <motion.h1 
                  className="font-roobert-heavy text-gray-900 dark:text-white"
                  animate={{
                    fontSize: isHeaderCompact ? '1.5rem' : '2.25rem',
                    marginBottom: isHeaderCompact ? '0' : '0.5rem'
                  }}
                >
                  {summary.quarter} {summary.year}
                </motion.h1>
                {!isHeaderCompact && (
                  <motion.p 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHeaderCompact ? 0 : 1 }}
                    className="text-gray-600 dark:text-gray-400 font-roobert-light"
                  >
                    {new Date(summary.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </motion.p>
                )}
              </div>
            </div>

            {!isHeaderCompact && (
              <motion.h2 
                initial={{ opacity: 1, height: 'auto' }}
                animate={{ 
                  opacity: isHeaderCompact ? 0 : 1,
                  height: isHeaderCompact ? 0 : 'auto',
                  marginTop: isHeaderCompact ? 0 : '1.5rem'
                }}
                className="text-2xl font-roobert-medium text-gray-700 dark:text-gray-300 overflow-hidden"
              >
                {summary.title}
              </motion.h2>
            )}
          </motion.div>

          {/* Sticky Navigation */}
          {showNav && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 z-10 px-8 py-3 no-print"
            >
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'metrics', label: 'Metrics & Highlights' },
                  { id: 'performance', label: 'Performance & Initiatives' },
                  { id: 'focus', label: 'This Week\'s Focus' },
                  { id: 'issues', label: 'Issues & Blockers' },
                  { id: 'risks', label: 'Risks & Mitigation' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-roobert-medium whitespace-nowrap transition-all ${
                      activeSection === section.id
                        ? 'bg-fis-eggplant text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}

          <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white dark:bg-gray-900 summary-content">
            {/* Key Metrics */}
            <section id="metrics">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Revenue
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatCurrency(summary.keyMetrics.revenue)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-navy/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-fis-navy" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Customers
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatNumber(summary.keyMetrics.customers)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-green/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-fis-green" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Growth
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    +{summary.keyMetrics.growth}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <ThumbsUp className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    NPS Score
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {summary.keyMetrics.satisfaction}
                  </p>
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Key Highlights
              </h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6 space-y-3">
                {summary.highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-fis-raspberry flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-roobert-heavy">
                        {index + 1}
                      </span>
                    </div>
                    <div className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1">
                      {renderWithExpressions(highlight)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Departments & Initiatives Grid */}
            <div id="performance" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Department Performance */}
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Department Performance
                </h3>
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={departmentChartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="performance"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3 mt-6">
                    {summary.departments.map((dept) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                dept.performance >= 90
                                  ? '#10B981'
                                  : dept.performance >= 80
                                  ? '#3B82F6'
                                  : '#F59E0B',
                            }}
                          />
                          <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                            {dept.name}
                          </span>
                        </div>
                        <span className="text-sm font-roobert-heavy text-gray-900 dark:text-white">
                          {dept.performance}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Strategic Initiatives */}
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Strategic Initiatives
                </h3>
                <div className="space-y-3">
                  {summary.initiatives.map((initiative) => {
                    const getProgressBarColor = (status: string) => {
                      switch (status) {
                        case 'on-track':
                          return 'bg-[#3bcd3e]';
                        case 'at-risk':
                          return 'bg-fis-raspberry';
                        case 'delayed':
                          return 'bg-fis-eggplant';
                        default:
                          return 'bg-gradient-to-r from-fis-eggplant to-fis-navy';
                      }
                    };
                    
                    return (
                      <div key={initiative.name} className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white mb-1">
                              {initiative.name}
                            </h4>
                            <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                              {initiative.owner}
                            </p>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-roobert-medium ${getStatusColor(initiative.status)}`}>
                            {getStatusIcon(initiative.status)}
                            <span className="capitalize">{initiative.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${initiative.progress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(initiative.status)}`}
                          />
                        </div>
                        <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 mt-2">
                          {initiative.progress}% complete
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Weekly Focus - Show if available */}
            {summary.weeklyFocus && summary.weeklyFocus.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                </div>
                <section id="focus">
                  <WeeklyFocus focusItems={summary.weeklyFocus} />
                </section>
              </>
            )}

            {/* Issues & Blockers - Show if available */}
            {summary.issuesAndBlockers && summary.issuesAndBlockers.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                </div>
                <section id="issues">
                  <IssuesBlockers issues={summary.issuesAndBlockers} />
                </section>
              </>
            )}

            {/* Risks & Mitigation */}
            <section id="risks">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Risks & Mitigation
              </h3>
              <div className="space-y-4">
                {summary.risks.map((risk, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white">
                            {risk.description}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-roobert-medium ${getSeverityColor(risk.severity)}`}>
                            {risk.severity} severity
                          </span>
                        </div>
                        <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-400">
                          <span className="font-roobert-medium">Mitigation: </span>
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Outlook */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Outlook
              </h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary.outlook}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
