import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  Target, 
  Lightbulb,
  Users,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { StrategicInitiative } from '../types';
import { RichText } from '../utils/expressionParser';
import html2canvas from 'html2canvas';

interface StrategicInitiativeModalProps {
  initiative: StrategicInitiative | null;
  onClose: () => void;
}

export const StrategicInitiativeModal: React.FC<StrategicInitiativeModalProps> = ({ 
  initiative, 
  onClose 
}) => {
  const [activeSection, setActiveSection] = useState('current-status');
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Prevent background scroll when modal is open and handle scroll behavior
  useEffect(() => {
    if (initiative) {
      document.body.style.overflow = 'hidden';
      
      const modalContent = document.querySelector('.initiative-content');
      if (modalContent) {
        const handleScroll = () => {
          const scrollTop = modalContent.scrollTop;
          
          // Compact header after 50px
          setIsHeaderCompact(scrollTop > 50);
          
          // Update active section based on scroll position
          const sections = [
            'current-status', 'executive-summary', 'problem-statement', 'smart-goals',
            'proposed-solution', 'roi', 'swot', 'budget', 'timeline', 'resources',
            'risk-assessment', 'kpis', 'governance', 'dependencies'
          ];
          
          for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
              const rect = element.getBoundingClientRect();
              if (rect.top <= 250 && rect.bottom >= 250) {
                setActiveSection(sectionId);
                break;
              }
            }
          }
        };
        
        modalContent.addEventListener('scroll', handleScroll);
        return () => {
          modalContent.removeEventListener('scroll', handleScroll);
          document.body.style.overflow = 'unset';
        };
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initiative]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const modalContent = document.querySelector('.initiative-content');
    if (element && modalContent) {
      const elementTop = element.offsetTop;
      const offset = 180; // Adjust for sticky header and nav
      modalContent.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  const handleExportImage = async () => {
    if (!initiative) return;
    
    const contentDiv = document.querySelector('.initiative-content') as HTMLElement;
    const modalContainer = document.querySelector('.initiative-modal-container') as HTMLElement;
    
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
          const fileName = `strategic-initiative-${initiative.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
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

  if (!initiative) return null;

  // Build navigation menu dynamically based on available sections
  const availableSections = [
    initiative.currentStatus && { id: 'current-status', label: 'Current Status' },
    initiative.executiveSummary && { id: 'executive-summary', label: 'Executive Summary' },
    initiative.problemStatement && { id: 'problem-statement', label: 'Problem Statement' },
    initiative.smartGoals && { id: 'smart-goals', label: 'SMART Goals' },
    initiative.proposedSolution && { id: 'proposed-solution', label: 'Proposed Solution' },
    initiative.roi && { id: 'roi', label: 'ROI Analysis' },
    initiative.swotAnalysis && { id: 'swot', label: 'SWOT Analysis' },
    initiative.budget && { id: 'budget', label: 'Budget' },
    initiative.timeline && { id: 'timeline', label: 'Timeline' },
    initiative.resources && { id: 'resources', label: 'Resources' },
    initiative.riskAssessment && { id: 'risk-assessment', label: 'Risk Assessment' },
    initiative.kpis && { id: 'kpis', label: 'KPIs & Metrics' },
    initiative.governance && { id: 'governance', label: 'Governance' },
    initiative.dependencies && { id: 'dependencies', label: 'Dependencies' },
  ].filter(Boolean) as { id: string; label: string }[];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'concept': return 'bg-purple-500/20 text-purple-600';
      case 'pilot': return 'bg-blue-500/20 text-blue-600';
      case 'mvp': return 'bg-cyan-500/20 text-cyan-600';
      case 'scaling': return 'bg-orange-500/20 text-orange-600';
      case 'production': return 'bg-fis-green/20 text-fis-green';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getSupportLevelColor = (level: string) => {
    switch (level) {
      case 'champion': return 'text-fis-green bg-fis-green/20';
      case 'supportive': return 'text-blue-500 bg-blue-500/20';
      case 'neutral': return 'text-yellow-500 bg-yellow-500/20';
      case 'resistant': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl max-w-7xl w-full max-h-[90vh] flex flex-col shadow-2xl initiative-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <motion.div 
            className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 relative rounded-t-3xl z-10 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
            animate={{
              paddingTop: isHeaderCompact ? '1rem' : '1.5rem',
              paddingBottom: isHeaderCompact ? '1rem' : '1.5rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem'
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

            <div className="flex items-start gap-4">
              <motion.div 
                className="rounded-2xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center flex-shrink-0"
                animate={{
                  width: isHeaderCompact ? '3rem' : '4rem',
                  height: isHeaderCompact ? '3rem' : '4rem'
                }}
              >
                <Target className={isHeaderCompact ? "w-6 h-6 text-white" : "w-8 h-8 text-white"} />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {initiative.currentStatus && (
                    <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${getStageColor(initiative.currentStatus.projectStage)}`}>
                      {initiative.currentStatus.projectStage.toUpperCase()}
                    </span>
                  )}
                  {!isHeaderCompact && (
                    <motion.span 
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isHeaderCompact ? 0 : 1 }}
                      className="text-sm text-gray-500 dark:text-gray-400"
                    >
                      Last Updated: {new Date(initiative.lastUpdated).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </motion.span>
                  )}
                </div>
                <motion.h2 
                  className="font-roobert-heavy text-gray-900 dark:text-white"
                  animate={{
                    fontSize: isHeaderCompact ? '1.25rem' : '1.875rem',
                    marginBottom: isHeaderCompact ? '0' : '0.5rem'
                  }}
                >
                  {initiative.title}
                </motion.h2>
                {!isHeaderCompact && initiative.currentStatus && (
                  <motion.p 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHeaderCompact ? 0 : 1 }}
                    className="text-sm text-gray-600 dark:text-gray-400 font-roobert-regular"
                  >
                    {initiative.currentStatus.urgencyTiming}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area with Side Nav */}
          <div className="flex-1 flex overflow-hidden">
            {/* Vertical Side Navigation - Always Visible */}
            <motion.nav
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0 w-48 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 py-4 pl-6 overflow-y-auto"
            >
              <div className="space-y-1">
                {availableSections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    animate={{
                      x: activeSection === section.id ? -25 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`w-full px-3 py-2.5 rounded-r-lg text-xs font-roobert-medium text-left transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-fis-eggplant to-fis-navy text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </motion.nav>

            {/* CONTENT */}
            <div className="initiative-content flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 1. CURRENT STATUS */}
            {initiative.currentStatus && (
            <section id="current-status">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-fis-raspberry" />
                CURRENT STATUS
              </h3>

              {/* Progress to Date */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Progress to Date
                </h4>
                <div className="space-y-3">
                  {initiative.currentStatus.progressToDate.map((progress, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gradient-to-br from-green-50 via-green-100/50 to-fis-green/10 dark:bg-gray-800/50 p-4 rounded-xl border border-green-200/50 dark:border-gray-700">
                      <CheckCircle className="w-5 h-5 text-fis-green flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        {progress}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stakeholder Engagement */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Stakeholder Engagement
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initiative.currentStatus.stakeholderEngagement.map((stakeholder, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-fis-eggplant" />
                          <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm">
                            {stakeholder.name}
                          </h5>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{stakeholder.role}</p>
                      <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getSupportLevelColor(stakeholder.supportLevel)}`}>
                        {stakeholder.supportLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges Encountered */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Challenges Encountered
                </h4>
                <div className="space-y-3">
                  {initiative.currentStatus.challengesEncountered.map((challenge, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-orange-100/30 dark:bg-gray-800/50 p-4 rounded-xl border border-yellow-200/50 dark:border-gray-700">
                      <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        {challenge}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 2. EXECUTIVE SUMMARY */}
            {initiative.executiveSummary && (
            <section id="executive-summary">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-fis-navy" />
                EXECUTIVE SUMMARY
              </h3>

              {/* Overview */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-6 rounded-xl border border-blue-200/50 dark:border-gray-700 mb-6">
                <p className="text-base text-gray-700 dark:text-gray-300 font-roobert-regular leading-relaxed">
                  {initiative.executiveSummary.overview}
                </p>
              </div>

              {/* Strategic Alignment */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Strategic Alignment
                </h4>
                <div className="space-y-3">
                  {initiative.executiveSummary.strategicAlignment.map((alignment, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        <RichText>{alignment}</RichText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Key Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initiative.executiveSummary.benefits.map((benefit, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 via-green-100/50 to-fis-green/10 dark:bg-gray-800/50 p-4 rounded-xl border border-green-200/50 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        <RichText>{benefit}</RichText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Outcomes */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Expected Outcomes
                </h4>
                <div className="space-y-2">
                  {initiative.executiveSummary.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-gray-300 dark:border-gray-700">
                      <Target className="w-4 h-4 text-fis-raspberry flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        {outcome}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 3. PROBLEM STATEMENT */}
            {initiative.problemStatement && (
            <section id="problem-statement">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                PROBLEM STATEMENT
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Issue */}
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                    The Issue
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    {initiative.problemStatement.issue}
                  </p>
                </div>

                {/* Business Impact */}
                <div className="bg-gradient-to-br from-red-50 via-red-100/50 to-orange-100/30 dark:bg-gray-800/50 p-6 rounded-xl border border-red-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Business Impact
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    <RichText>{initiative.problemStatement.businessImpact}</RichText>
                  </p>
                </div>

                {/* Market Context */}
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Market Context
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    {initiative.problemStatement.marketContext}
                  </p>
                </div>

                {/* Operational Context */}
                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Operational Context
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    {initiative.problemStatement.operationalContext}
                  </p>
                </div>
              </div>
            </section>
            )}

            {/* 4. SMART GOALS */}
            {initiative.smartGoals && (
            <section id="smart-goals">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-fis-eggplant" />
                SMART GOALS
              </h3>

              <div className="space-y-6">
                {/* Specific */}
                <div className="bg-gradient-to-br from-purple-50 via-purple-100/50 to-fis-eggplant/10 dark:bg-gray-800/50 p-5 rounded-xl border border-purple-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-eggplant dark:text-purple-300 mb-3">
                    Specific
                  </h4>
                  <ul className="space-y-2">
                    {initiative.smartGoals.specific.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-eggplant mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Measurable */}
                <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-5 rounded-xl border border-blue-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-navy dark:text-blue-300 mb-3">
                    Measurable
                  </h4>
                  <ul className="space-y-2">
                    {initiative.smartGoals.measurable.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-navy mt-1">•</span>
                        <span><RichText>{goal}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Achievable */}
                <div className="bg-gradient-to-br from-green-50 via-green-100/50 to-fis-green/10 dark:bg-gray-800/50 p-5 rounded-xl border border-green-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-green dark:text-green-300 mb-3">
                    Achievable
                  </h4>
                  <ul className="space-y-2">
                    {initiative.smartGoals.achievable.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-green mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Relevant */}
                <div className="bg-gradient-to-br from-orange-50 via-orange-100/50 to-fis-raspberry/10 dark:bg-gray-800/50 p-5 rounded-xl border border-orange-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-raspberry dark:text-orange-300 mb-3">
                    Relevant
                  </h4>
                  <ul className="space-y-2">
                    {initiative.smartGoals.relevant.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-raspberry mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Time-bound */}
                <div className="bg-gradient-to-br from-cyan-50 via-cyan-100/50 to-cyan-200/20 dark:bg-gray-800/50 p-5 rounded-xl border border-cyan-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-cyan-700 dark:text-cyan-300 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time-bound
                  </h4>
                  <ul className="space-y-2">
                    {initiative.smartGoals.timeBound.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-cyan-700 mt-1">•</span>
                        <span><RichText>{goal}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
            )}

            {/* 5. PROPOSED SOLUTION */}
            {initiative.proposedSolution && (
            <section id="proposed-solution">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                PROPOSED SOLUTION
              </h3>

              {/* Description */}
              <div className="bg-gradient-to-br from-yellow-50 via-yellow-100/50 to-amber-100/30 dark:bg-gray-800/50 p-6 rounded-xl border border-yellow-200/50 dark:border-gray-700 mb-6">
                <p className="text-base text-gray-700 dark:text-gray-300 font-roobert-regular leading-relaxed">
                  {initiative.proposedSolution.description}
                </p>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Key Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initiative.proposedSolution.keyFeatures.map((feature, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        <RichText>{feature}</RichText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Innovations */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Innovations
                </h4>
                <div className="space-y-3">
                  {initiative.proposedSolution.innovations.map((innovation, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gradient-to-br from-purple-50 via-purple-100/50 to-fis-eggplant/10 dark:bg-gray-800/50 p-4 rounded-xl border border-purple-200/50 dark:border-gray-700">
                      <Lightbulb className="w-5 h-5 text-fis-eggplant flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        <RichText>{innovation}</RichText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives Considered */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Alternatives Considered
                </h4>
                <div className="space-y-4">
                  {initiative.proposedSolution.alternativesConsidered.map((alternative, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <h5 className="font-roobert-semibold text-gray-900 dark:text-white mb-3">
                        {alternative.name}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-roobert-semibold text-green-600 dark:text-green-400 mb-2">PROS</p>
                          <ul className="space-y-1">
                            {alternative.pros.map((pro, idx) => (
                              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                                <span className="text-green-500">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-roobert-semibold text-red-600 dark:text-red-400 mb-2">CONS</p>
                          <ul className="space-y-1">
                            {alternative.cons.map((con, idx) => (
                              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                                <span className="text-red-500">✗</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Rationale:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{alternative.rationale}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 6. RETURN ON INVESTMENT (ROI) */}
            {initiative.roi && (
            <section id="roi">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-fis-green" />
                RETURN ON INVESTMENT (ROI)
              </h3>

              {/* Financial Benefits */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Financial Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initiative.roi.financialBenefits.map((benefit, index) => (
                    <div key={index} className="bg-gradient-to-br from-green-50 via-green-100/50 to-fis-green/10 dark:bg-gray-800/50 p-5 rounded-xl border border-green-200/50 dark:border-gray-700">
                      <div className="text-3xl font-roobert-heavy text-fis-green mb-2">
                        ${(benefit.amount / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-1">
                        {benefit.description}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {benefit.timeframe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Benefits */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Strategic Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {initiative.roi.strategicBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700">
                      <CheckCircle className="w-4 h-4 text-fis-green flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                        <RichText>{benefit}</RichText>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payback Period & Long-term Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-6 rounded-xl border border-blue-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-navy dark:text-blue-300 mb-2">
                    Payback Period
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    {initiative.roi.paybackPeriod}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 via-purple-100/50 to-fis-eggplant/10 dark:bg-gray-800/50 p-6 rounded-xl border border-purple-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-eggplant dark:text-purple-300 mb-2">
                    Long-term Value
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                    {initiative.roi.longTermValue}
                  </p>
                </div>
              </div>
            </section>
            )}

            {/* 7. SWOT ANALYSIS */}
            {initiative.swotAnalysis && (
            <section id="swot">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-fis-raspberry" />
                SWOT ANALYSIS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-gradient-to-br from-green-50 via-green-100/50 to-fis-green/10 dark:bg-gray-800/50 p-6 rounded-xl border border-green-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-green dark:text-green-300 mb-4">
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {initiative.swotAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-green mt-1">✓</span>
                        <span><RichText>{strength}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-gradient-to-br from-red-50 via-red-100/50 to-orange-100/30 dark:bg-gray-800/50 p-6 rounded-xl border border-red-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-red-600 dark:text-red-300 mb-4">
                    Weaknesses
                  </h4>
                  <ul className="space-y-2">
                    {initiative.swotAnalysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-red-500 mt-1">✗</span>
                        <span><RichText>{weakness}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-6 rounded-xl border border-blue-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-fis-navy dark:text-blue-300 mb-4">
                    Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {initiative.swotAnalysis.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-fis-navy mt-1">→</span>
                        <span><RichText>{opportunity}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-gradient-to-br from-orange-50 via-orange-100/50 to-yellow-100/30 dark:bg-gray-800/50 p-6 rounded-xl border border-orange-200/50 dark:border-gray-700">
                  <h4 className="text-lg font-roobert-bold text-orange-600 dark:text-orange-300 mb-4">
                    Threats
                  </h4>
                  <ul className="space-y-2">
                    {initiative.swotAnalysis.threats.map((threat, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-orange-600 mt-1">⚠</span>
                        <span><RichText>{threat}</RichText></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
            )}

            {/* 8. BUDGET REQUEST */}
            {initiative.budget && (
            <section id="budget">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-fis-navy" />
                BUDGET REQUEST
              </h3>

              {/* Total Funding */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-8 rounded-xl border border-blue-200/50 dark:border-gray-700 mb-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Funding Required</p>
                <div className="text-5xl font-roobert-heavy text-fis-navy dark:text-blue-300">
                  ${(initiative.budget.totalFunding / 1000000).toFixed(2)}M
                </div>
              </div>

              {/* Budget Breakdown */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Budget Breakdown
                </h4>
                <div className="space-y-3">
                  {initiative.budget.breakdown.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {item.category}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xl font-roobert-bold text-fis-navy dark:text-blue-300">
                          ${(item.amount / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-500">
                          {((item.amount / (initiative.budget?.totalFunding || 1)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">One-time Costs</p>
                  <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                    ${(initiative.budget.oneTimeCosts / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recurring Costs</p>
                  <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                    ${(initiative.budget.recurringCosts / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Contingency</p>
                  <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                    ${(initiative.budget.contingency / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* 9. PROJECT TIMELINE */}
            {initiative.timeline && (
            <section id="timeline">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-fis-raspberry" />
                PROJECT TIMELINE & MILESTONES
              </h3>

              {/* Timeline Dates */}
              <div className="bg-gradient-to-r from-fis-eggplant/10 via-fis-raspberry/10 to-fis-navy/10 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-300 dark:border-gray-700 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                    <p className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      {new Date(initiative.timeline.startDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">End Date</p>
                    <p className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                      {new Date(initiative.timeline.endDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Project Phases
                </h4>
                <div className="space-y-4">
                  {initiative.timeline.phases.map((phase, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white">
                          {phase.name}
                        </h5>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(phase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(phase.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Deliverables:</p>
                        <ul className="space-y-1">
                          {phase.deliverables.map((deliverable, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="text-fis-green">•</span>
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {phase.dependencies.length > 0 && (
                        <div>
                          <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Dependencies:</p>
                          <div className="flex flex-wrap gap-2">
                            {phase.dependencies.map((dep, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Key Milestones
                </h4>
                <div className="space-y-3">
                  {initiative.timeline.milestones.map((milestone, index) => {
                    const statusColors = {
                      completed: 'border-fis-green bg-fis-green/10',
                      'on-track': 'border-blue-500 bg-blue-500/10',
                      'at-risk': 'border-yellow-500 bg-yellow-500/10',
                      delayed: 'border-red-500 bg-red-500/10'
                    };
                    return (
                      <div key={index} className={`bg-white dark:bg-gray-800/50 p-4 rounded-xl border-2 ${statusColors[milestone.status]} shadow-sm`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-roobert-semibold text-gray-900 dark:text-white mb-1">
                              {milestone.name}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {milestone.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(milestone.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${
                            milestone.status === 'completed' ? 'text-fis-green bg-fis-green/20' :
                            milestone.status === 'on-track' ? 'text-blue-500 bg-blue-500/20' :
                            milestone.status === 'at-risk' ? 'text-yellow-500 bg-yellow-500/20' :
                            'text-red-500 bg-red-500/20'
                          }`}>
                            {milestone.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            )}

            {/* 10. RESOURCE REQUIREMENTS */}
            {initiative.resources && (
            <section id="resources">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-fis-eggplant" />
                RESOURCE REQUIREMENTS
              </h3>

              {/* Internal Staffing */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Internal Staffing
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initiative.resources.internalStaffing.map((staff, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white">
                          {staff.role}
                        </h5>
                        <span className="text-lg font-roobert-bold text-fis-eggplant">
                          {staff.count}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Duration: {staff.duration}
                      </p>
                      <div>
                        <p className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Required Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {staff.expertise.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-fis-eggplant/10 text-fis-eggplant px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Vendors */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  External Vendors
                </h4>
                <div className="space-y-3">
                  {initiative.resources.externalVendors.map((vendor, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {vendor.vendor}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {vendor.service} • {vendor.duration}
                        </p>
                      </div>
                      <div className="text-lg font-roobert-bold text-fis-navy dark:text-blue-300">
                        ${(vendor.cost / 1000).toFixed(0)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools & Platforms */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Tools & Platforms
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initiative.resources.toolsPlatforms.map((tool, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white text-sm">
                          {tool.tool}
                        </h5>
                        <span className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                          ${(tool.cost / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tool.purpose}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 11. RISK ASSESSMENT */}
            {initiative.riskAssessment && (
            <section id="risk-assessment">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                RISK ASSESSMENT & MITIGATION
              </h3>

              {/* Overall Risk Level */}
              <div className={`p-6 rounded-xl border-2 mb-6 text-center ${
                initiative.riskAssessment.overallRiskLevel === 'critical' ? 'bg-red-500/10 border-red-500' :
                initiative.riskAssessment.overallRiskLevel === 'high' ? 'bg-orange-500/10 border-orange-500' :
                initiative.riskAssessment.overallRiskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                'bg-green-500/10 border-fis-green'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Overall Risk Level</p>
                <div className={`text-3xl font-roobert-heavy uppercase ${
                  initiative.riskAssessment.overallRiskLevel === 'critical' ? 'text-red-500' :
                  initiative.riskAssessment.overallRiskLevel === 'high' ? 'text-orange-500' :
                  initiative.riskAssessment.overallRiskLevel === 'medium' ? 'text-yellow-600' :
                  'text-fis-green'
                }`}>
                  {initiative.riskAssessment.overallRiskLevel}
                </div>
              </div>

              {/* Individual Risks */}
              <div className="space-y-4">
                {initiative.riskAssessment.risks.map((risk, index) => {
                  const getLikelihoodColor = (likelihood: string) => {
                    switch (likelihood) {
                      case 'high': return 'text-red-500 bg-red-500/20';
                      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
                      case 'low': return 'text-green-500 bg-green-500/20';
                      default: return 'text-gray-500 bg-gray-500/20';
                    }
                  };
                  const getImpactColor = (impact: string) => {
                    switch (impact) {
                      case 'critical': return 'text-red-600 bg-red-600/20';
                      case 'high': return 'text-orange-500 bg-orange-500/20';
                      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
                      case 'low': return 'text-blue-500 bg-blue-500/20';
                      default: return 'text-gray-500 bg-gray-500/20';
                    }
                  };

                  return (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-roobert-semibold text-gray-900 dark:text-white flex-1">
                          {risk.risk}
                        </h5>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getLikelihoodColor(risk.likelihood)}`}>
                            {risk.likelihood} likelihood
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getImpactColor(risk.impact)}`}>
                            {risk.impact} impact
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-roobert-semibold text-green-600 dark:text-green-400 mb-1">Mitigation Strategy</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{risk.mitigation}</p>
                        </div>
                        <div>
                          <p className="text-xs font-roobert-semibold text-blue-600 dark:text-blue-400 mb-1">Contingency Plan</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">{risk.contingency}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>Owner: {risk.owner}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            )}

            {/* 12. KPIS & SUCCESS METRICS */}
            {initiative.kpis && (
            <section id="kpis">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-fis-raspberry" />
                KPIS & SUCCESS METRICS
              </h3>

              {/* Leading Indicators */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Leading Indicators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initiative.kpis.leadingIndicators.map((kpi, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-5 rounded-xl border border-blue-200/50 dark:border-gray-700">
                      <h5 className="font-roobert-bold text-fis-navy dark:text-blue-300 mb-2">
                        {kpi.name}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {kpi.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Target</p>
                          <p className="font-roobert-semibold text-gray-900 dark:text-white">{kpi.target}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Measurement</p>
                          <p className="font-roobert-semibold text-gray-900 dark:text-white">{kpi.measurement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lagging Indicators */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Lagging Indicators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initiative.kpis.laggingIndicators.map((kpi, index) => (
                    <div key={index} className="bg-gradient-to-br from-purple-50 via-purple-100/50 to-fis-eggplant/10 dark:bg-gray-800/50 p-5 rounded-xl border border-purple-200/50 dark:border-gray-700">
                      <h5 className="font-roobert-bold text-fis-eggplant dark:text-purple-300 mb-2">
                        {kpi.name}
                      </h5>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {kpi.description}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Target</p>
                          <p className="font-roobert-semibold text-gray-900 dark:text-white">{kpi.target}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 mb-1">Measurement</p>
                          <p className="font-roobert-semibold text-gray-900 dark:text-white">{kpi.measurement}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tracking Frequency</p>
                  <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                    {initiative.kpis.trackingFrequency}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-300 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reporting Owner</p>
                  <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                    {initiative.kpis.reportingOwner}
                  </p>
                </div>
              </div>
            </section>
            )}

            {/* 13. GOVERNANCE & OVERSIGHT */}
            {initiative.governance && (
            <section id="governance">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-fis-navy" />
                GOVERNANCE & OVERSIGHT
              </h3>

              {/* Sponsor */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-fis-navy/10 dark:bg-gray-800/50 p-6 rounded-xl border border-blue-200/50 dark:border-gray-700 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Executive Sponsor</p>
                <p className="text-2xl font-roobert-bold text-fis-navy dark:text-blue-300">
                  {initiative.governance.sponsor}
                </p>
              </div>

              {/* Stakeholders */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Key Stakeholders
                </h4>
                <div className="flex flex-wrap gap-2">
                  {initiative.governance.stakeholders.map((stakeholder, index) => (
                    <span key={index} className="bg-white dark:bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-roobert-medium text-gray-900 dark:text-white">
                      {stakeholder}
                    </span>
                  ))}
                </div>
              </div>

              {/* Governance Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700">
                  <h5 className="font-roobert-semibold text-gray-900 dark:text-white mb-3">Decision-Making Structure</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {initiative.governance.decisionMakingStructure}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-300 dark:border-gray-700">
                  <h5 className="font-roobert-semibold text-gray-900 dark:text-white mb-3">Reporting Cadence</h5>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {initiative.governance.reportingCadence}
                  </p>
                </div>
              </div>

              {/* Escalation Path */}
              <div className="mt-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Escalation Path
                </h4>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  {initiative.governance.escalationPath.map((level, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-fis-eggplant to-fis-raspberry text-white px-4 py-2 rounded-lg text-sm font-roobert-semibold whitespace-nowrap">
                        {level}
                      </div>
                      {index < (initiative.governance?.escalationPath.length || 0) - 1 && (
                        <span className="text-gray-400 hidden md:block">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 14. DEPENDENCIES & ASSUMPTIONS */}
            {initiative.dependencies && (
            <section id="dependencies">
              <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-orange-500" />
                DEPENDENCIES & ASSUMPTIONS
              </h3>

              {/* External Dependencies */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  External Dependencies
                </h4>
                <div className="space-y-3">
                  {initiative.dependencies.externalDependencies.map((dep, index) => {
                    const statusColors = {
                      secured: 'border-fis-green bg-fis-green/10',
                      pending: 'border-yellow-500 bg-yellow-500/10',
                      'at-risk': 'border-red-500 bg-red-500/10'
                    };
                    return (
                      <div key={index} className={`bg-white dark:bg-gray-800/50 p-4 rounded-xl border-2 ${statusColors[dep.status]} shadow-sm`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-roobert-semibold text-gray-900 dark:text-white flex-1">
                            {dep.dependency}
                          </h5>
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ml-2 ${
                            dep.status === 'secured' ? 'text-fis-green bg-fis-green/20' :
                            dep.status === 'pending' ? 'text-yellow-600 bg-yellow-500/20' :
                            'text-red-500 bg-red-500/20'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span>Owner: {dep.owner}</span>
                          <span>•</span>
                          <span>Required by: {new Date(dep.requiredBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Internal Dependencies */}
              <div className="mb-6">
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Internal Dependencies
                </h4>
                <div className="space-y-3">
                  {initiative.dependencies.internalDependencies.map((dep, index) => {
                    const statusColors = {
                      secured: 'border-fis-green bg-fis-green/10',
                      pending: 'border-yellow-500 bg-yellow-500/10',
                      'at-risk': 'border-red-500 bg-red-500/10'
                    };
                    return (
                      <div key={index} className={`bg-white dark:bg-gray-800/50 p-4 rounded-xl border-2 ${statusColors[dep.status]} shadow-sm`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-roobert-semibold text-gray-900 dark:text-white flex-1">
                            {dep.dependency}
                          </h5>
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ml-2 ${
                            dep.status === 'secured' ? 'text-fis-green bg-fis-green/20' :
                            dep.status === 'pending' ? 'text-yellow-600 bg-yellow-500/20' :
                            'text-red-500 bg-red-500/20'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                          <span>Owner: {dep.owner}</span>
                          <span>•</span>
                          <span>Required by: {new Date(dep.requiredBy).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assumptions */}
              <div>
                <h4 className="text-lg font-roobert-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Key Assumptions
                </h4>
                <div className="space-y-3">
                  {initiative.dependencies.assumptions.map((assumption, index) => {
                    const statusColors = {
                      validated: 'border-fis-green bg-fis-green/10',
                      unvalidated: 'border-yellow-500 bg-yellow-500/10',
                      invalid: 'border-red-500 bg-red-500/10'
                    };
                    return (
                      <div key={index} className={`bg-white dark:bg-gray-800/50 p-4 rounded-xl border-2 ${statusColors[assumption.validationStatus]} shadow-sm`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-roobert-semibold text-gray-900 dark:text-white flex-1">
                            {assumption.assumption}
                          </h5>
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ml-2 ${
                            assumption.validationStatus === 'validated' ? 'text-fis-green bg-fis-green/20' :
                            assumption.validationStatus === 'unvalidated' ? 'text-yellow-600 bg-yellow-500/20' :
                            'text-red-500 bg-red-500/20'
                          }`}>
                            {assumption.validationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-roobert-semibold">Impact:</span> {assumption.impact}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            )}

          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
