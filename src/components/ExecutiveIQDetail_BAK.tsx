import { motion } from 'framer-motion';
import { ExecutiveIQ } from '../types';
import { X, Lightbulb, Target, Sparkles, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { renderWithExpressions } from '../utils/expressionParser';
import html2canvas from 'html2canvas';

interface ExecutiveIQDetailProps {
  article: ExecutiveIQ;
  onClose: () => void;
}

export const ExecutiveIQDetail: React.FC<ExecutiveIQDetailProps> = ({ article, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showNav, setShowNav] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.classList.contains('execiq-content')) {
        const scrollTop = target.scrollTop;
        
        setIsHeaderCompact(scrollTop > 50);
        setShowNav(scrollTop > 100);
        
        const sections = ['overview', 'implications', 'recommendations', 'trends', 'data'];
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

    const contentDiv = document.querySelector('.execiq-content');
    contentDiv?.addEventListener('scroll', handleScroll);
    return () => contentDiv?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const contentDiv = document.querySelector('.execiq-content');
    const element = document.getElementById(sectionId);
    
    if (contentDiv && element) {
      const elementTop = element.offsetTop - 180;
      const maxScroll = contentDiv.scrollHeight - contentDiv.clientHeight;
      
      if (elementTop > maxScroll) {
        contentDiv.scrollTo({ top: contentDiv.scrollHeight, behavior: 'smooth' });
      } else {
        contentDiv.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  };

  const getCategoryColor = () => {
    switch (article.category) {
      case 'strategy': return 'from-fis-eggplant to-fis-raspberry';
      case 'innovation': return 'from-fis-navy to-blue-500';
      case 'market-insight': return 'from-fis-green to-emerald-500';
      case 'thought-leadership': return 'from-purple-500 to-fis-eggplant';
      case 'transformation': return 'from-fis-raspberry to-orange-500';
      default: return 'from-fis-eggplant to-fis-navy';
    }
  };

  const getCategoryLabel = () => {
    return article.category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleExportImage = async () => {
    const contentDiv = document.querySelector('.execiq-content') as HTMLElement;
    const modalContainer = document.querySelector('.execiq-modal-container') as HTMLElement;
    
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
        scale: 2, // Higher quality
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
          const fileName = `${article.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${article.date}.png`;
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto print:static print:bg-white"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen py-8 px-4 print:py-0 print:px-0"
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print-content print:max-w-full print:rounded-none print:shadow-none print:max-h-none print:overflow-visible execiq-modal-container">
          {/* Header */}
          <motion.div 
            className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 relative rounded-t-3xl z-10 border-b border-gray-200 dark:border-gray-800 transition-all duration-300 print-header print:static print:rounded-none"
            animate={{
              paddingTop: isHeaderCompact ? '1rem' : '2rem',
              paddingBottom: isHeaderCompact ? '1rem' : '2rem',
              paddingLeft: '2rem',
              paddingRight: '2rem'
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all no-print"
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
                className={`rounded-2xl bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center`}
                animate={{
                  width: isHeaderCompact ? '3rem' : '4rem',
                  height: isHeaderCompact ? '3rem' : '4rem'
                }}
              >
                <Lightbulb className={isHeaderCompact ? "w-6 h-6 text-white" : "w-8 h-8 text-white"} />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <motion.h1 
                    className="font-roobert-heavy text-gray-900 dark:text-white"
                    animate={{
                      fontSize: isHeaderCompact ? '1.5rem' : '2.25rem',
                      marginBottom: isHeaderCompact ? '0' : '0.5rem'
                    }}
                  >
                    {article.quarter} {article.year}
                  </motion.h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold bg-gradient-to-r ${getCategoryColor()} text-white`}>
                    {getCategoryLabel()}
                  </span>
                </div>
                {!isHeaderCompact && (
                  <motion.p 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHeaderCompact ? 0 : 1 }}
                    className="text-gray-600 dark:text-gray-400 font-roobert-light"
                  >
                    {new Date(article.date).toLocaleDateString('en-US', {
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
                {article.title}
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
                  { id: 'overview', label: 'Overview & Takeaways' },
                  { id: 'implications', label: 'Strategic Implications' },
                  { id: 'recommendations', label: 'Recommendations' },
                  { id: 'trends', label: 'Trend Analysis' },
                  { id: 'data', label: 'Supporting Data' },
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

          <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white dark:bg-gray-900 execiq-content print-content print:overflow-visible print:space-y-2 print:p-0">
            {/* Executive Summary */}
            <section id="overview" className="print-section">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Executive Summary
              </h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6 print-card">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-roobert-light">
                  {renderWithExpressions(article.executiveSummary)}
                </p>
              </div>
            </section>

            {/* Key Takeaways */}
            <section className="print-section">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Key Takeaways
              </h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6 space-y-2 print-card">
                {article.keyTakeaways.map((takeaway, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 print-list-item"
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <span className="text-white text-xs font-roobert-heavy">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1">
                      {renderWithExpressions(takeaway)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Strategic Implications */}
            <section id="implications" className="print-section">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-fis-eggplant" />
                Strategic Implications
              </h3>
              <div className="space-y-2 print-grid">
                {article.strategicImplications.map((implication, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 rounded-full bg-fis-eggplant/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-fis-eggplant text-xs font-roobert-heavy">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                        {renderWithExpressions(implication)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section id="recommendations" className="print-section">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Recommendations
              </h3>
              <div className="space-y-2 print-grid">
                {article.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-sm font-roobert-heavy">{index + 1}</span>
                      </div>
                      <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1">
                        {renderWithExpressions(recommendation)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Trend Analysis */}
            {article.trendAnalysis && (
              <section id="trends" className="print-section">
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
                  {article.trendAnalysis.title}
                </h3>
                <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-400 mb-6">
                  {article.trendAnalysis.subtitle}
                </p>
                
                <div className="space-y-6">
                  {article.trendAnalysis.categories.map((category, catIndex) => (
                    <motion.div
                      key={catIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                      className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6"
                    >
                      <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center text-white text-sm`}>
                          {catIndex + 1}
                        </span>
                        {category.name}
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 font-roobert-semibold text-gray-700 dark:text-gray-300">Metric</th>
                              <th className="text-center py-2 px-3 font-roobert-semibold text-gray-700 dark:text-gray-300">2023</th>
                              <th className="text-center py-2 px-3 font-roobert-semibold text-gray-700 dark:text-gray-300">2024</th>
                              <th className="text-center py-2 px-3 font-roobert-semibold text-gray-700 dark:text-gray-300">Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.trends.map((trend, trendIndex) => (
                              <tr 
                                key={trendIndex}
                                className="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                              >
                                <td className="py-3 px-3 font-roobert-light text-gray-700 dark:text-gray-300">
                                  {trend.metric}
                                </td>
                                <td className="py-3 px-3 text-center font-roobert-medium text-gray-600 dark:text-gray-400">
                                  {trend.value2023}
                                </td>
                                <td className="py-3 px-3 text-center font-roobert-medium text-gray-900 dark:text-white">
                                  {renderWithExpressions(trend.value2024)}
                                </td>
                                <td className="py-3 px-3 text-center text-xs font-roobert-light text-gray-600 dark:text-gray-400">
                                  {renderWithExpressions(trend.change)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Supporting Data */}
            {article.supportingData && article.supportingData.length > 0 && (
              <section id="data" className="print-section">
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Supporting Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {article.supportingData.map((chart, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6"
                    >
                      <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                        {chart.chartTitle}
                      </h4>
                      <div className="space-y-3">
                        {chart.data.map((item, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                                {item.label}
                              </span>
                              <span className="text-sm font-roobert-bold text-fis-eggplant dark:text-purple-400">
                                {item.value}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ delay: (index * 0.2) + (i * 0.1), duration: 0.8 }}
                                className={`h-full bg-gradient-to-r ${getCategoryColor()} rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Initiatives */}
            {article.relatedInitiatives && article.relatedInitiatives.length > 0 && (
              <section className="print-section">
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Related Initiatives
                </h3>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6">
                  <div className="flex flex-wrap gap-2">
                    {article.relatedInitiatives.map((initiative, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        {initiative}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Outlook */}
            <section className="print-section">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Outlook
              </h3>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6 print-card">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center flex-shrink-0`}>
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 leading-relaxed">
                    {renderWithExpressions(article.outlook)}
                  </p>
                </div>
              </div>
            </section>

            {/* Print Footer */}
            <div className="print-footer hidden">
              <p>Digital First GTM Strategy | {new Date(article.date).toLocaleDateString()} | Confidential</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
