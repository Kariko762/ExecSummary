import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Maximize2, Minimize2, Download, X, Loader2, Smartphone, Monitor, MoreVertical, Edit2, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';

// =====================================================
// DATA STRUCTURE - Single Source of Truth
// =====================================================
const LEADERSHIP_DATA = {
  metadata: {
    weekStart: '2026-01-20',
    weekEnd: '2026-01-26',
    title: 'Leadership Summary',
    description: 'Weekly executive briefing for Pre-Sales leadership'
  },
  metrics: {
    demoHoursYTD: 0,
    pendingAsks: 3,
    tasksInProgress: 0,
    activeInitiatives: 0,
    criticalIssues: 2
  },
  bluf: {
    bottomLine: [
      { type: 'success' as const, text: 'Kicked off $6M+ MUFG Demo AI Endpoint Build (Credit Assessment)' },
      { type: 'success' as const, text: 'Successful CBK Coast demo review with LoB' },
      { type: 'warning' as const, text: 'Request to deprioritize E6 demo asset access due to TSYS acquisition' },
      { type: 'info' as const, text: 'Demo Asset and Visibility (Banking NA) High Priority' },
      { type: 'critical' as const, text: 'Coast MSA Renewal still Pending with Finance (Robert Rossetti)' },
      { type: 'info' as const, text: 'Executive Summary Platform final testing in progress ready for launch' }
    ],
    background: [
      'MUFG Credit Assessment strategic deal requiring Azure OpenAI endpoint deployment',
      'Demo Asset and Visibility initiative driven by need for status view across Banking NA demo systems, expanding to Capital Markets and Banking',
      'TSYS acquisition driving International Issuing Hub strategy realignment, deprioritizing E6 integration',
      'Executive Summary platform completing final testing phase before production deployment',
      '2026 goals and initiatives drafted, awaiting RevOps review and publication'
    ],
    assessment: {
      strategicProgress: [
        'Executive Summary platform within final testing phase before launch'
      ],
      crossTeamCollaboration: [
        'Open Sessions approved with Sales Growth Office leadership for improved communication',
        'TSYS demo alignment clarified available assets (TS2, Center Suite, Prime)'
      ],
      criticalRisks: [
        'Azure OpenAI authentication misalignment for MUFG deployment (subscription vs token-based)',
        'Coast MSA renewal pending with Finance, impacting automation roadmap and $6M+ deal'
      ]
    },
    recommendations: [
      'Push forward with Demo Asset Data Collation and meetings with Pre-Sales Managers',
      'Urgent engagement with Network Security Architecture Team on Azure AI authentication policies for MUFG',
      'Push Finance to respond on Coast Renewal',
      'Get Executive Summary Platform deployed by End of Week'
    ],
    asks: [
      {
        urgency: 'high' as const,
        title: 'Azure OpenAI Authentication Decision',
        description: 'Approve exception or remediation path for Azure OpenAI authentication (subscription vs token-based) for MUFG deployment',
        impact: 'Blocks $6M+ MUFG deal and delays AI demo capabilities',
        owner: 'AI Governance / Security',
        dueDate: 'Jan 28, 2026'
      },
      {
        urgency: 'high' as const,
        title: 'Coast MSA Renewal Approval',
        description: 'Approve and execute Coast MSA renewal to avoid disruption to demo automation factory',
        impact: 'Complete loss of Banking product demo platform access',
        owner: 'Procurement / Legal',
        dueDate: 'Feb 1, 2026'
      },
      {
        urgency: 'medium' as const,
        title: 'International Issuing Hub Strategy Confirmation',
        description: 'Confirm revised International Issuing Hub demo strategy post-TSYS acquisition (de-prioritize E6, align to TSYS assets)',
        impact: 'Affects demo roadmap and resource allocation',
        owner: 'RevOps Leadership',
        dueDate: 'Feb 5, 2026'
      },
      {
        urgency: 'medium' as const,
        title: 'Platform Standards Resource Assignment',
        description: 'Assign dedicated stakeholders to support platform standards and asset registry schema definition',
        impact: 'Delays standardization and scaling of demo capabilities',
        owner: 'Pre-Sales Leadership',
        dueDate: 'Feb 5, 2026'
      }
    ]
  },
  prioritization: [
    {
      id: 1,
      title: 'Demo Asset Visibility',
      description: 'Comprehensive status view of all demo assets needed across Banking NA, Capital Markets, and Banking teams. Critical for resource planning and demo delivery.',
      impact: 'Lack of visibility leads to duplicated efforts, missed opportunities, and inability to scale demo capabilities effectively.',
      status: 'In Progress',
      priority: 'High',
      tags: ['Asset Management'],
      milestones: [
        'Schedule meetings with Pre-Sales Managers',
        'Conduct asset data collation sessions',
        'Deploy asset visibility dashboard'
      ],
      owner: 'Pre-Sales Leadership',
      businessUnit: 'Banking NA / CM',
      dueDate: 'Feb 7, 2026',
      color: 'red'
    },
    {
      id: 2,
      title: 'Coast MSA Renewal',
      description: '2026 MSA renewal critical for continued access to Tiled Platform and all Banking demo capabilities. Requires Finance approval and expedited processing to avoid service disruption.',
      impact: 'Without renewal, complete loss of Banking product demonstration capabilities. Unable to support sales pipeline activities.',
      status: 'Pending',
      priority: 'High',
      tags: ['Finance Procurement'],
      milestones: [
        'Finance review and approval',
        'Follow-up meetings scheduled',
        'Contract signed and executed'
      ],
      owner: 'Robert Rossetti',
      businessUnit: 'Capital Markets',
      dueDate: 'Jan 31, 2026',
      color: 'red'
    },
    {
      id: 3,
      title: 'MUFG AI Endpoint',
      description: '$6M+ MUFG Credit Assessment Azure OpenAI endpoint deployment blocked by authentication policy conflicts. Urgent engagement needed with Network Security Architecture team.',
      impact: 'Delays $6M+ deal and prevents demonstration of AI-powered credit assessment capabilities to key prospect.',
      status: 'Blocked',
      priority: 'Medium',
      tags: ['Azure AI / MUFG'],
      milestones: [
        'Network Security Architecture engagement',
        'Azure authentication policy resolution',
        'Endpoint deployment completed'
      ],
      owner: 'Technical Architecture',
      businessUnit: 'Banking',
      dueDate: 'Feb 5, 2026',
      color: 'orange'
    },
    {
      id: 4,
      title: 'Setup and Communicate Weekly Open Sessions',
      description: 'Establish regular weekly open sessions for team collaboration, knowledge sharing, and alignment on demo strategies and initiatives across all business units.',
      impact: 'Improves cross-team collaboration and ensures consistent messaging and demo best practices across all teams.',
      status: 'In Progress',
      priority: 'Medium',
      tags: ['Team Collaboration'],
      milestones: [
        'Schedule weekly session times',
        'Communicate to all team members',
        'Launch first session'
      ],
      owner: 'Demo Services Leadership',
      businessUnit: 'All Teams',
      dueDate: 'Feb 3, 2026',
      color: 'orange'
    },
    {
      id: 5,
      title: 'Executive Summary Platform Deployment',
      description: 'Complete final testing phase and deploy Executive Summary platform by end of week to enable leadership visibility and streamlined reporting workflows.',
      impact: 'Provides leadership with real-time visibility into demo initiatives, accelerating decision-making and resource allocation.',
      status: 'In Progress',
      priority: 'Low',
      tags: ['Platform Launch'],
      milestones: [
        'Final testing completed',
        'Production deployment',
        'Leadership walkthrough sessions'
      ],
      owner: 'Platform Team',
      businessUnit: 'Leadership',
      dueDate: 'Jan 31, 2026',
      color: 'green'
    }
  ],
  risks: [
    {
      id: 1,
      title: 'Coast MSA Renewal',
      severity: 'High',
      probability: 'Medium Probability',
      status: 'Open',
      description: '2026 MSA renewal pending Finance approval. Without renewal, all Banking demo capabilities are at risk of immediate shutdown.',
      impact: 'Complete loss of Banking product demo platform access',
      mitigation: 'Urgent Finance meetings and escalation to CFO if needed',
      owner: 'Robert Rossetti / Finance',
      color: 'red'
    },
    {
      id: 2,
      title: 'AI Endpoint Authentication',
      severity: 'Medium',
      probability: 'Medium Probability',
      status: 'Open',
      description: 'Azure OpenAI authentication policies blocking MUFG Credit Assessment endpoint deployment. Network Security Architecture team engagement required.',
      impact: 'Delays $6M+ MUFG deal and AI demo capabilities',
      mitigation: 'Urgent engagement with Network Security Architecture team to resolve policy conflicts',
      owner: 'Technical Architecture Team',
      color: 'orange'
    }
  ]
};

// =====================================================
// EDIT MODE CONTROLS COMPONENT
// =====================================================
interface EditControlsProps {
  onEdit: () => void;
  onDelete: () => void;
  position?: 'top-right' | 'top-left';
}

function SectionEditControls({ onEdit, onDelete, position = 'top-right' }: EditControlsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`absolute ${position === 'top-right' ? 'top-3 right-3' : 'top-3 left-3'} z-10`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all opacity-0 group-hover:opacity-100"
        title="Section Actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]">
          <button
            onClick={() => {
              onEdit();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Section</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this section?')) {
                onDelete();
              }
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT WITH EDIT MODE
// =====================================================
interface LeadershipTemplateProps {
  editMode?: boolean;
  onSave?: (data: typeof LEADERSHIP_DATA) => void;
}

export default function LeadershipTemplateV1({ editMode = false, onSave }: LeadershipTemplateProps) {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Data states - Using local state for editing
  const [localData, setLocalData] = useState(LEADERSHIP_DATA);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Fetch and calculate metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoadingMetrics(true);

        // Fetch all data in parallel
        const [notesRes, tasksRes, initiativesRes] = await Promise.all([
          fetch('http://localhost:3001/api/notes'),
          fetch('http://localhost:3001/api/tasks'),
          fetch('http://localhost:3001/api/initiatives')
        ]);

        const notes = await notesRes.json();
        const tasks = await tasksRes.json();
        const initiatives = await initiativesRes.json();

        // Calculate metrics
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
        
        const inProgressTasks = tasks.filter((task: any) => task.status === 'In Progress');
        const active = initiatives.filter((init: any) => 
          init.status === 'Planning' || init.status === 'In Progress'
        );
        const criticalTasks = tasks.filter((task: any) => task.priority === 'Critical');

        setLocalData(prev => ({
          ...prev,
          metrics: {
            demoHoursYTD: demoNotes.length,
            pendingAsks: 3,
            tasksInProgress: inProgressTasks.length,
            activeInitiatives: active.length,
            criticalIssues: criticalTasks.length + 2
          }
        }));

      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
      setHasUnsavedChanges(false);
    }
  };

  const handleDataChange = (newData: Partial<typeof LEADERSHIP_DATA>) => {
    setLocalData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
  };

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    
    try {
      let targetElement: HTMLElement;
      let originalStyles: any = {};
      
      if (viewMode === 'mobile') {
        const mobileContent = contentRef.current.querySelector('.flex.flex-col') as HTMLElement;
        if (!mobileContent) throw new Error('Could not find mobile content');
        targetElement = mobileContent;
        originalStyles = {
          overflow: targetElement.style.overflow,
          maxHeight: targetElement.style.maxHeight,
          height: targetElement.style.height,
        };
        targetElement.style.overflow = 'visible';
        targetElement.style.maxHeight = 'none';
        targetElement.style.height = 'auto';
      } else {
        const scrollableDiv = contentRef.current.querySelector('.overflow-y-auto') as HTMLElement;
        if (!scrollableDiv) throw new Error('Could not find scrollable content');
        targetElement = contentRef.current;
        originalStyles = {
          containerOverflow: contentRef.current.style.overflow,
          containerMaxHeight: contentRef.current.style.maxHeight,
          containerHeight: contentRef.current.style.height,
          scrollOverflow: scrollableDiv.style.overflow,
          scrollMaxHeight: scrollableDiv.style.maxHeight,
          scrollHeight: scrollableDiv.style.height,
        };
        contentRef.current.style.overflow = 'visible';
        contentRef.current.style.maxHeight = 'none';
        contentRef.current.style.height = 'auto';
        scrollableDiv.style.overflow = 'visible';
        scrollableDiv.style.maxHeight = 'none';
        scrollableDiv.style.height = 'auto';
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const dataUrl = await domToPng(targetElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: viewMode === 'mobile' ? 666 : targetElement.scrollWidth,
        height: targetElement.scrollHeight,
      });

      if (viewMode === 'mobile') {
        targetElement.style.overflow = originalStyles.overflow;
        targetElement.style.maxHeight = originalStyles.maxHeight;
        targetElement.style.height = originalStyles.height;
      } else {
        contentRef.current!.style.overflow = originalStyles.containerOverflow;
        contentRef.current!.style.maxHeight = originalStyles.containerMaxHeight;
        contentRef.current!.style.height = originalStyles.containerHeight;
        const scrollableDiv = contentRef.current!.querySelector('.overflow-y-auto') as HTMLElement;
        if (scrollableDiv) {
          scrollableDiv.style.overflow = originalStyles.scrollOverflow;
          scrollableDiv.style.maxHeight = originalStyles.scrollMaxHeight;
          scrollableDiv.style.height = originalStyles.scrollHeight;
        }
      }

      const link = document.createElement('a');
      const fileName = viewMode === 'mobile' 
        ? `leadership-summary-mobile-${new Date().toISOString().split('T')[0]}.png`
        : `leadership-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.download = fileName;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        ref={contentRef}
        className={`bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : modalWidth === 95
              ? 'w-[95vw] h-[90vh] rounded-2xl'
              : 'w-[75vw] h-[90vh] rounded-2xl'
        }`}
      >
        {/* Header with controls */}
        {viewMode === 'desktop' && (
          <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white flex-shrink-0">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="leadership-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#leadership-grid)" />
              </svg>
            </div>

            <div className="relative px-4 2xl:px-6 py-4 2xl:py-8">
              <div className="flex items-center justify-between mb-2 2xl:mb-4">
                <div className="flex items-center gap-2 2xl:gap-3">
                  <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Target className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0">
                      {localData.metadata.title}
                    </h1>
                    <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                      {localData.metadata.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editMode && hasUnsavedChanges && (
                    <button
                      onClick={handleSave}
                      className="p-1.5 2xl:p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-all flex items-center gap-1.5"
                      title="Save Changes"
                    >
                      <Save className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                      <span className="text-white text-xs 2xl:text-sm font-roobert-medium">Save</span>
                    </button>
                  )}
                  <button
                    onClick={() => setViewMode('mobile')}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    title="Switch to Mobile View"
                  >
                    <Smartphone className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                  </button>
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
                  <button
                    onClick={() => {
                      if (isFullscreen) {
                        setIsFullscreen(false);
                        setModalWidth(75);
                      } else if (modalWidth === 75) {
                        setModalWidth(95);
                      } else {
                        setIsFullscreen(true);
                      }
                    }}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                    title="Close"
                  >
                    <X className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="hidden 2xl:grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-green-300">
                    {isLoadingMetrics ? '...' : localData.metrics.demoHoursYTD}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Demo Hours YTD</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-blue-300">
                    {isLoadingMetrics ? '...' : localData.metrics.tasksInProgress}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Tasks In-Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-yellow-300">
                    {isLoadingMetrics ? '...' : localData.metrics.activeInitiatives}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Active Initiatives</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-orange-300">
                    {isLoadingMetrics ? '...' : localData.metrics.pendingAsks}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Pending Asks</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="text-xl font-roobert-bold text-red-300">
                    {isLoadingMetrics ? '...' : localData.metrics.criticalIssues}
                  </div>
                  <div className="text-white/80 text-[11px] font-roobert-medium">Critical Issues</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Pass editMode prop to all section components */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {viewMode === 'desktop' ? (
            <div className="relative px-6 py-8">
              <DesktopBLUFSection 
                data={localData.bluf} 
                editMode={editMode}
                onChange={(bluf) => handleDataChange({ bluf })}
              />
              <DesktopPrioritizationSection 
                data={localData.prioritization}
                editMode={editMode}
                onChange={(prioritization) => handleDataChange({ prioritization })}
              />
              <DesktopRisksSection 
                data={localData.risks}
                editMode={editMode}
                onChange={(risks) => handleDataChange({ risks })}
              />
              <DesktopLinksSection navigate={navigate} editMode={editMode} />
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Mobile view sections would go here */}
              <div className="p-4 text-center text-gray-500">
                Mobile view sections...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// DESKTOP SECTION COMPONENTS (WITH EDIT MODE)
// =====================================================

interface BLUFSectionProps {
  data: typeof LEADERSHIP_DATA.bluf;
  editMode?: boolean;
  onChange?: (data: typeof LEADERSHIP_DATA.bluf) => void;
}

function DesktopBLUFSection({ data, editMode = false, onChange }: BLUFSectionProps) {
  const [sectionEditMode, setSectionEditMode] = useState(false);

  return (
    <div className={`space-y-3 relative ${editMode ? 'group' : ''}`}>
      {editMode && (
        <SectionEditControls
          onEdit={() => setSectionEditMode(!sectionEditMode)}
          onDelete={() => console.log('Delete BLUF section')}
        />
      )}

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
          {sectionEditMode && (
            <span className="ml-auto text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Bottom Line Up Front - rendered from data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red)' }}>
          <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-red)' }}>
            Bottom Line Up Front
          </h4>
          <ul className="space-y-1.5">
            {data.bottomLine.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`mt-0.5 flex-shrink-0 ${
                  item.type === 'success' ? 'text-green-600' :
                  item.type === 'warning' ? 'text-yellow-600' :
                  item.type === 'critical' ? 'text-red-600' :
                  'text-blue-600'
                }`}>•</span>
                {sectionEditMode ? (
                  <input 
                    type="text" 
                    value={item.text}
                    onChange={(e) => {
                      const newBottomLine = [...data.bottomLine];
                      newBottomLine[idx] = { ...item, text: e.target.value };
                      onChange?.({ ...data, bottomLine: newBottomLine });
                    }}
                    className="flex-1 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-300 font-roobert-regular text-sm">
                    {item.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Background, Assessment, Recommendations, Asks sections would follow similar pattern */}
        {/* Simplified for brevity - add full implementations as needed */}
      </div>
    </div>
  );
}

interface PrioritizationSectionProps {
  data: typeof LEADERSHIP_DATA.prioritization;
  editMode?: boolean;
  onChange?: (data: typeof LEADERSHIP_DATA.prioritization) => void;
}

function DesktopPrioritizationSection({ data, editMode = false, onChange }: PrioritizationSectionProps) {
  const [sectionEditMode, setSectionEditMode] = useState(false);

  return (
    <div className={`space-y-3 mt-8 relative ${editMode ? 'group' : ''}`}>
      {editMode && (
        <SectionEditControls
          onEdit={() => setSectionEditMode(!sectionEditMode)}
          onDelete={() => console.log('Delete Prioritization section')}
        />
      )}

      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Prioritization</h3>
          {sectionEditMode && (
            <span className="ml-auto text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {data.map((priority, idx) => (
          <div 
            key={priority.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 overflow-hidden"
            style={{ 
              borderLeftColor: `var(--accent-${priority.color})`,
              backgroundColor: `rgba(${priority.color === 'red' ? '239, 68, 68' : priority.color === 'orange' ? '245, 158, 11' : '34, 197, 94'}, 0.03)`
            }}
          >
            <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center px-6 py-3 border-r border-gray-200 dark:border-gray-700">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-roobert-bold text-lg text-white"
                  style={{ background: `var(--accent-${priority.color})` }}
                >
                  {priority.id}
                </div>
              </div>
              <div className="flex-1 px-4 py-3">
                {sectionEditMode ? (
                  <input
                    type="text"
                    value={priority.title}
                    onChange={(e) => {
                      const newPriorities = [...data];
                      newPriorities[idx] = { ...priority, title: e.target.value };
                      onChange?.(newPriorities);
                    }}
                    className="text-lg font-roobert-bold bg-transparent border-b border-gray-300 dark:border-gray-600 w-full focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                    {priority.title}
                  </h3>
                )}
              </div>
            </div>

            {/* Priority content grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-roobert-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Description
                  </h4>
                  {sectionEditMode ? (
                    <textarea
                      value={priority.description}
                      onChange={(e) => {
                        const newPriorities = [...data];
                        newPriorities[idx] = { ...priority, description: e.target.value };
                        onChange?.(newPriorities);
                      }}
                      rows={3}
                      className="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                      {priority.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Tags, milestones, etc */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 text-xs font-roobert-bold rounded uppercase ${
                    priority.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                    priority.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  }`}>
                    {priority.status}
                  </span>
                  <span 
                    className="px-3 py-1 text-xs font-roobert-bold rounded uppercase text-white" 
                    style={{ background: `var(--accent-${priority.color})` }}
                  >
                    {priority.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RisksSectionProps {
  data: typeof LEADERSHIP_DATA.risks;
  editMode?: boolean;
  onChange?: (data: typeof LEADERSHIP_DATA.risks) => void;
}

function DesktopRisksSection({ data, editMode = false, onChange }: RisksSectionProps) {
  const [sectionEditMode, setSectionEditMode] = useState(false);

  return (
    <div className={`space-y-3 mt-8 relative ${editMode ? 'group' : ''}`}>
      {editMode && (
        <SectionEditControls
          onEdit={() => setSectionEditMode(!sectionEditMode)}
          onDelete={() => console.log('Delete Risks section')}
        />
      )}

      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Risks</h3>
          {sectionEditMode && (
            <span className="ml-auto text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      {/* Risk Items Grid */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((risk, idx) => (
          <div 
            key={risk.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 relative"
            style={{ 
              borderLeftColor: `var(--accent-${risk.color})`,
              backgroundColor: `rgba(${risk.color === 'red' ? '239, 68, 68' : '245, 158, 11'}, 0.03)`
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" 
                  style={{ background: `var(--accent-${risk.color})` }}
                >
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
            
            {sectionEditMode ? (
              <input
                type="text"
                value={risk.title}
                onChange={(e) => {
                  const newRisks = [...data];
                  newRisks[idx] = { ...risk, title: e.target.value };
                  onChange?.(newRisks);
                }}
                className="text-sm font-roobert-bold bg-transparent border-b border-gray-300 dark:border-gray-600 w-full mb-2 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2">
                {risk.title}
              </h4>
            )}
            
            {sectionEditMode ? (
              <textarea
                value={risk.description}
                onChange={(e) => {
                  const newRisks = [...data];
                  newRisks[idx] = { ...risk, description: e.target.value };
                  onChange?.(newRisks);
                }}
                rows={2}
                className="w-full text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded p-1 mb-2 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed mb-3">
                {risk.description}
              </p>
            )}
            
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-roobert-semibold text-gray-600 dark:text-gray-400">Impact:</span>
                <span className="ml-1 text-gray-700 dark:text-gray-300">{risk.impact}</span>
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
  );
}

interface LinksSectionProps {
  navigate: ReturnType<typeof useNavigate>;
  editMode?: boolean;
}

function DesktopLinksSection({ navigate, editMode = false }: LinksSectionProps) {
  const [sectionEditMode, setSectionEditMode] = useState(false);

  return (
    <div className={`space-y-3 mt-8 relative ${editMode ? 'group' : ''}`}>
      {editMode && (
        <SectionEditControls
          onEdit={() => setSectionEditMode(!sectionEditMode)}
          onDelete={() => console.log('Delete Links section')}
        />
      )}

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
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Links to Additional Content</h3>
          {sectionEditMode && (
            <span className="ml-auto text-xs text-white/70 bg-white/20 px-2 py-1 rounded">
              Edit Mode
            </span>
          )}
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Link cards - simplified, no editing for navigation links */}
        <button
          onClick={() => window.open('/', '_blank')}
          disabled={sectionEditMode}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-2 border-transparent hover:border-fis-eggplant dark:hover:border-fis-raspberry transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--brand-primary)' }}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-roobert-bold text-gray-900 dark:text-white mb-1 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry transition-colors">
                Published Summary
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">
                View the full published executive summary
              </p>
            </div>
          </div>
        </button>

        {/* Additional link cards would go here */}
      </div>
    </div>
  );
}
