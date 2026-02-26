import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

interface LeadershipTemplateProps {
  data?: any;
  onExportReady?: (handler: () => void) => void;
  contentRef?: React.RefObject<HTMLDivElement>;
}

// Component
export default function LeadershipTemplate({ data: propData, onExportReady, contentRef: parentContentRef }: LeadershipTemplateProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const localContentRef = useRef<HTMLDivElement>(null);
  const contentRef = parentContentRef || localContentRef;

  // Use prop data if provided, otherwise fallback to default
  const data = propData || {
    metadata: {
      weekStart: '2026-01-20',
      weekEnd: '2026-01-26',
      generatedBy: 'AI Assistant',
      title: 'Weekly Leadership Summary'
    },
    bluf: {
      bottomLine: ['Key point 1', 'Key point 2', 'Key point 3'],
      background: 'Background context...',
      assessment: 'Current assessment...',
      recommendation: 'Recommendations...',
      asks: [
        { item: 'Ask 1', urgency: 'high', owner: 'Leadership' }
      ]
    },
    priorities: [],
    risks: []
  };

  // Parse BLUF data - handle both string and array formats
  const parseBLUF = (blufData: any) => {
    if (!blufData) return { bottomLine: [], background: '', assessment: '', recommendations: [], asks: [] };
    
    // Handle bottomLine (string with newlines -> array)
    const bottomLine = typeof blufData.bottomLine === 'string' 
      ? blufData.bottomLine.split('\n').filter((line: string) => line.trim())
      : blufData.bottomLine || [];

    // Handle recommendations (string with newlines -> array OR use recommendation field)
    let recommendations = [];
    if (blufData.recommendations) {
      recommendations = typeof blufData.recommendations === 'string'
        ? blufData.recommendations.split('\n').filter((line: string) => line.trim())
        : blufData.recommendations;
    } else if (blufData.recommendation) {
      recommendations = typeof blufData.recommendation === 'string'
        ? blufData.recommendation.split('\n').filter((line: string) => line.trim())
        : [blufData.recommendation];
    }

    return {
      bottomLine,
      background: blufData.background || '',
      assessment: blufData.assessment || '',
      recommendations,
      asks: blufData.asks || []
    };
  };

  const blufData = parseBLUF(data.bluf);
  const prioritization = data.priorities || data.prioritization || [];
  const risks = data.risks || [];

  // Register export handler with parent
  useEffect(() => {
    if (onExportReady) {
      onExportReady(() => exportToImage);
    }
  }, [onExportReady]);

  // Export function using modern-screenshot
  const exportToImage = async () => {
    if (!contentRef.current) return;
    
    try {
      const weekStart = data.metadata?.weekStart || '';
      const weekEnd = data.metadata?.weekEnd || '';
      
      // Capture the full scrollable content
      const dataUrl = await domToPng(contentRef.current, {
        backgroundColor: isDarkMode ? '#1a1f2e' : '#f9fafb',
        scale: 2, // 2x for high resolution
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });
      
      // Download the image
      const link = document.createElement('a');
      link.download = `leadership-summary-${weekStart.replace(/\s/g, '-').toLowerCase()}-${weekEnd.replace(/\s/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting screenshot:', error);
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1f2e] p-6 transition-colors duration-300">
        <div ref={contentRef} className="max-w-7xl mx-auto space-y-8">
          {/* BLUF Section */}
          <DesktopBLUFSection blufData={blufData} />
          
          {/* Prioritization Section - only show if there's data */}
          {prioritization && prioritization.length > 0 && (
            <DesktopPrioritizationSection data={prioritization} />
          )}
          
          {/* Risks Section - only show if there's data */}
          {risks && risks.length > 0 && (
            <DesktopRisksSection risks={risks} />
          )}
        </div>
      </div>
    </div>
  );
}

// BLUF Section Component
function DesktopBLUFSection({ blufData }: { blufData: any }) {
  const toBulletItems = (value: string | string[]) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .flatMap(item => String(item).split('\n'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(Boolean);
    }

    return value
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  };

  const backgroundItems = toBulletItems(blufData.background);
  const assessmentItems = toBulletItems(blufData.assessment);
  const recommendationItems = toBulletItems(blufData.recommendations || blufData.recommendation);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Executive Summary (BLUF)</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. BOTTOM LINE UP FRONT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-red)' }}
              >
                1
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-red)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-red)' }}>
                  Bottom Line Up Front
                </h4>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                {blufData.bottomLine.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-fis-eggplant dark:text-fis-raspberry mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. BACKGROUND */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-blue)' }}
              >
                2
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                  Background
                </h4>
              </div>
              {backgroundItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                  {backgroundItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  {blufData.background}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. ASSESSMENT */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-purple)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-purple)' }}
              >
                3
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-purple)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-purple)' }}>
                  Assessment
                </h4>
              </div>
              {assessmentItems.length > 0 ? (
                <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                  {assessmentItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                  {blufData.assessment}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4. RECOMMENDATIONS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-green)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-green)' }}
              >
                4
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4" style={{ color: 'var(--accent-green)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-green)' }}>
                  Recommendations
                </h4>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                {(recommendationItems.length > 0
                  ? recommendationItems
                  : blufData.recommendations || [])
                  .map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 5. ASKS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-orange)' }}>
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                style={{ background: 'var(--accent-orange)' }}
              >
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
              <div className="space-y-2">
                {blufData.asks.map((ask: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white shrink-0" 
                          style={{ background: ask.urgency === 'High' ? 'var(--accent-red)' : ask.urgency === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                      {ask.urgency}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                      {ask.item} <span className="text-gray-500 dark:text-gray-400">({ask.owner})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Prioritization Section Component
function DesktopPrioritizationSection({ data }: { data: any[] }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-roobert-bold text-white">Prioritization</h3>
        </div>
      </div>

      {/* Priority Items */}
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4" 
               style={{ borderLeftColor: item.priority === 'High' ? 'var(--accent-red)' : item.priority === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-base font-roobert-bold text-gray-900 dark:text-white">
                {item.title}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                    style={{ background: item.priority === 'High' ? 'var(--accent-red)' : item.priority === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                {item.priority}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light mb-3">
              {item.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {item.impact && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Impact</div>
                  <div className="text-sm text-gray-900 dark:text-white font-roobert-light">{item.impact}</div>
                </div>
              )}
              {item.status && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Status</div>
                  <div className="text-sm text-gray-900 dark:text-white font-roobert-light">{item.status}</div>
                </div>
              )}
              {(item.linkedGoal || item.details?.linkedGoal) && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Linked Goal</div>
                  <div className="text-sm text-fis-eggplant dark:text-fis-raspberry font-roobert-medium">{item.linkedGoal || item.details?.linkedGoal}</div>
                </div>
              )}
              {(item.linkedInitiative || item.details?.linkedInitiative) && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Linked Initiative</div>
                  <div className="text-sm text-fis-eggplant dark:text-fis-raspberry font-roobert-medium">{item.linkedInitiative || item.details?.linkedInitiative}</div>
                </div>
              )}
            </div>

            {/* Deliverables section (if data exists) */}
            {(item.deliverables || item.details?.actionItems) && (item.deliverables?.length > 0 || item.details?.actionItems?.length > 0) && (
              <div className="mb-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Deliverables</div>
                <ul className="space-y-0.5">
                  {(item.deliverables || item.details?.actionItems || []).map((deliverable: string, didx: number) => (
                    <li key={didx} className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light flex items-center gap-1.5">
                      <span className="text-fis-eggplant dark:text-fis-raspberry">•</span>
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
              <div className="text-gray-600 dark:text-gray-400 font-roobert-light">
                Owner: <span className="text-gray-900 dark:text-white font-roobert-medium">{item.owner || 'Unassigned'}</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-roobert-light">
                Due: <span className="text-gray-900 dark:text-white font-roobert-medium">{item.dueDate || item.details?.deadline || 'TBD'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Risks Section Component
function DesktopRisksSection({ risks }: { risks: any[] }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-roobert-bold text-white">Risks</h3>
        </div>
      </div>

      {/* Risk Items Grid */}
      <div className="grid grid-cols-2 gap-4">
        {risks.map((risk: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative" 
               style={{ 
                 borderLeftColor: risk.severity === 'High' ? 'var(--accent-red)' : risk.severity === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-yellow)',
                 backgroundColor: risk.severity === 'High' ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
               }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                      style={{ background: risk.severity === 'High' ? 'var(--accent-red)' : risk.severity === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-yellow)' }}>
                  {risk.severity}
                </span>
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">
                  {risk.probability} Probability
                </span>
              </div>
            </div>
            <h4 className="text-base font-roobert-bold text-gray-900 dark:text-white mb-2">
              {risk.title}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light mb-3">
              {risk.description}
            </p>
            <div className="space-y-2 mb-3">
              {risk.impact && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium min-w-[60px]">Impact:</span>
                  <span className="text-xs text-gray-900 dark:text-white font-roobert-light">{risk.impact}</span>
                </div>
              )}
              {risk.owner && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium min-w-[60px]">Owner:</span>
                  <span className="text-xs text-gray-900 dark:text-white font-roobert-light">{risk.owner}</span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Mitigation Plan</div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light">{risk.mitigation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
