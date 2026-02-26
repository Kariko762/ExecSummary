import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Download, Loader2 } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import contentData from '../../../../backend/data/content/leadership/weekly-summary-jan-20-2026.json';

// Export metadata for CMS
export const CONTENT_META = contentData.meta;

// Type definitions
interface LeadershipSummaryProps {
  data?: typeof contentData;
  editMode?: boolean;
  onSave?: (data: any) => void;
}

export default function WeeklySummaryJan202026({ data = contentData, editMode = false, onSave }: LeadershipSummaryProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Metrics states
  const [demoHoursYTD, setDemoHoursYTD] = useState<number>(0);
  const [pendingAsks, setPendingAsks] = useState<number>(0);
  const [tasksInProgress, setTasksInProgress] = useState<number>(0);
  const [activeInitiatives, setActiveInitiatives] = useState<number>(0);
  const [criticalIssues, setCriticalIssues] = useState<number>(0);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Fetch metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoadingMetrics(true);
        const [notesRes, tasksRes, initiativesRes] = await Promise.all([
          fetch('http://localhost:3001/api/notes'),
          fetch('http://localhost:3001/api/tasks'),
          fetch('http://localhost:3001/api/initiatives')
        ]);

        const notes = await notesRes.json();
        const tasks = await tasksRes.json();
        const initiatives = await initiativesRes.json();

        const currentYear = new Date().getFullYear();
        const demoNotes = notes.filter((note: any) => {
          const noteDate = new Date(note.date);
          const isCurrentYear = noteDate.getFullYear() === currentYear;
          const hasDemoTag = note.tags?.some((tag: string) => 
            tag.toLowerCase().includes('demo performance') || 
            tag.toLowerCase().includes('kai')
          );
          const hasDemoActivity = note.activityType && [
            'Demo Preparation',
            'Demo Presentation', 
            'Demo Support'
          ].includes(note.activityType);
          return isCurrentYear && (hasDemoTag || hasDemoActivity);
        });
        
        setDemoHoursYTD(demoNotes.length);
        setPendingAsks(data.bluf.asks?.length || 0);
        setTasksInProgress(tasks.filter((t: any) => t.status === 'In Progress').length);
        setActiveInitiatives(initiatives.filter((i: any) => i.status === 'In Progress').length);
        setCriticalIssues(tasks.filter((t: any) => t.priority === 'Critical' && (t.status === 'In Progress' || t.status === 'Blocked')).length);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setDemoHoursYTD(0);
        setPendingAsks(data.bluf.asks?.length || 0);
        setTasksInProgress(0);
        setActiveInitiatives(0);
        setCriticalIssues(data.risks?.length || 0);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [data]);

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await domToPng(contentRef.current, {
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
        backgroundColor: '#f9fafb',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      const link = document.createElement('a');
      link.download = `leadership-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderBulletList = (text: string, bulletColor: string = 'text-gray-600') => {
    return text.split('\n').filter(line => line.trim()).map((line, idx) => (
      <li key={idx} className="flex items-start gap-2">
        <span className={`${bulletColor} mt-0.5 flex-shrink-0`}>•</span>
        <span className="text-gray-700 dark:text-gray-300 font-roobert-regular" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </li>
    ));
  };

  return (
    <div ref={contentRef} className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header with Navy/Raspberry Gradient */}
      <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leadership-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
              <pattern id="leadership-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leadership-grid)" />
            <rect width="100%" height="100%" fill="url(#leadership-lines)" />
          </svg>
        </div>

        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
        />

        <div className="relative px-4 2xl:px-6 py-4 2xl:py-8">
          <div className="flex items-center justify-between mb-2 2xl:mb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 2xl:gap-3"
            >
              <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Target className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
              <div>
                <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5">
                  {data.metadata.title}
                </h1>
                <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                  {data.metadata.description}
                </p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportImage}
                className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                title="Export as Image"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden 2xl:grid grid-cols-1 md:grid-cols-5 gap-3"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-green-300">
                {isLoadingMetrics ? '...' : demoHoursYTD}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Demo Hours YTD</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-blue-300">
                {isLoadingMetrics ? '...' : tasksInProgress}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Tasks In-Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-yellow-300">
                {isLoadingMetrics ? '...' : activeInitiatives}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Active Initiatives</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-orange-300">
                {isLoadingMetrics ? '...' : pendingAsks}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Pending Asks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="text-xl font-roobert-bold text-red-300">
                {isLoadingMetrics ? '...' : criticalIssues}
              </div>
              <div className="text-white/80 text-[11px] font-roobert-medium">Critical Issues</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative px-6 py-8">
        {/* Executive Summary (BLUF) Section */}
        <div className="mb-6">
          <div 
            className="px-4 py-2.5 rounded-lg mb-4"
            style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-roobert-bold text-white">Executive Summary (BLUF)</h3>
            </div>
          </div>

          <div className="space-y-3">
            {/* Bottom Line */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-green)' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-green)' }}>
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--accent-green)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-green)' }}>
                      BOTTOM LINE UP FRONT
                    </h4>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <ul className="space-y-1.5 ml-1">
                      {renderBulletList(data.bluf.bottomLine, 'text-green-600')}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Background */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-tertiary)' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--brand-tertiary)' }}>
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--brand-tertiary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-tertiary)' }}>
                      Background
                    </h4>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <ul className="space-y-1.5 ml-1">
                      {renderBulletList(data.bluf.background, 'text-purple-600')}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-blue)' }}>
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                      Assessment
                    </h4>
                  </div>
                  <div className="text-sm leading-relaxed space-y-3">
                    <div dangerouslySetInnerHTML={{ __html: data.bluf.assessment.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>
                      Recommendation
                    </h4>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <ul className="space-y-1.5 ml-1">
                      {renderBulletList(data.bluf.recommendation, 'text-purple-600')}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Asks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-orange)' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-orange)' }}>
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--accent-orange)' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-orange)' }}>
                      Asks
                    </h4>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <div className="space-y-2">
                      {data.bluf.asks.map((ask, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span 
                            className={`px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white mt-0.5 flex-shrink-0`}
                            style={{ 
                              background: ask.urgency === 'high' ? 'var(--accent-red)' : 
                                         ask.urgency === 'medium' ? 'var(--accent-orange)' : 
                                         'var(--accent-blue)' 
                            }}
                          >
                            {ask.urgency}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300 font-roobert-regular">
                            {ask.item} <span className="text-xs text-gray-500">({ask.owner} - {ask.deadline})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priorities Section */}
        <div className="mb-6 mt-8">
          <div 
            className="px-4 py-2.5 rounded-lg mb-4"
            style={{ background: 'linear-gradient(135deg, var(--brand-secondary), var(--accent-blue))' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" />
                </svg>
              </div>
              <h3 className="text-base font-roobert-bold text-white">This Week's Priorities</h3>
            </div>
          </div>

          <div className="space-y-4">
            {data.priorities.map((priority) => (
              <div key={priority.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative" 
                   style={{ borderLeftColor: priority.borderColor }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-sm font-roobert-bold rounded-lg text-white" 
                          style={{ background: priority.borderColor }}>
                      #{priority.id}
                    </span>
                    <span className={`px-2 py-0.5 bg-${priority.statusColor}-100 dark:bg-${priority.statusColor}-900/30 text-${priority.statusColor}-800 dark:text-${priority.statusColor}-300 text-[10px] font-roobert-bold rounded uppercase`}>
                      {priority.status}
                    </span>
                    <span className={`px-2 py-0.5 bg-${priority.impactColor}-100 dark:bg-${priority.impactColor}-900/30 text-${priority.impactColor}-800 dark:text-${priority.impactColor}-300 text-[10px] font-roobert-bold rounded uppercase`}>
                      {priority.impact}
                    </span>
                  </div>
                </div>
                
                <h4 className="text-base font-roobert-bold text-gray-900 dark:text-white mb-2">
                  {priority.title}
                </h4>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-3">
                  {priority.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{priority.details.impact}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Likelihood:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{priority.details.likelihood}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Action Items:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {priority.details.actionItems.map((item, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks Section */}
        <div className="mb-6 mt-8">
          <div 
            className="px-4 py-2.5 rounded-lg mb-4"
            style={{ background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))' }}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-roobert-bold text-white">Risks</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {data.risks.map((risk, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative" 
                   style={{ 
                     borderLeftColor: risk.severity === 'High' ? 'var(--accent-red)' : 'var(--accent-orange)',
                     backgroundColor: risk.severity === 'High' ? 'rgba(239, 68, 68, 0.03)' : 'rgba(251, 146, 60, 0.03)'
                   }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                          style={{ background: risk.severity === 'High' ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                      {risk.severity}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                      {risk.probability}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] font-roobert-bold rounded uppercase">
                    {risk.status}
                  </span>
                </div>
                
                <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2">
                  {risk.title}
                </h4>
                
                <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-3">
                  {risk.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{risk.description}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Mitigation:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{risk.mitigation}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Owner:</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">{risk.owner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
