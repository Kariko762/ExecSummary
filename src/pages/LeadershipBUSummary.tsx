import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Maximize2, Minimize2, Download, X, Loader2, Building2, TrendingUp, AlertCircle, Monitor, Smartphone, HandCoins, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { domToPng } from 'modern-screenshot';

// Business Unit Configuration
const BUSINESS_UNITS = {
  'banking-int': {
    id: 'banking-int',
    name: 'Banking (Int.)',
    shortName: 'INT',
    color: '#3B82F6', // Blue
    lightColor: '#DBEAFE',
    darkColor: '#1E3A8A'
  },
  'banking-na': {
    id: 'banking-na',
    name: 'Banking (NA)',
    shortName: 'NA',
    color: '#10B981', // Green
    lightColor: '#D1FAE5',
    darkColor: '#065F46'
  },
  'capital-markets': {
    id: 'capital-markets',
    name: 'Capital Markets',
    shortName: 'CM',
    color: '#8B5CF6', // Purple
    lightColor: '#EDE9FE',
    darkColor: '#5B21B6'
  },
  'payments': {
    id: 'payments',
    name: 'Payments',
    shortName: 'PAY',
    color: '#F59E0B', // Amber
    lightColor: '#FEF3C7',
    darkColor: '#92400E'
  },
  'cross-bu': {
    id: 'cross-bu',
    name: 'Cross-BU',
    shortName: 'XBU',
    color: '#EF4444', // Red
    lightColor: '#FEE2E2',
    darkColor: '#991B1B'
  }
} as const;

// Interfaces
interface BUBottomLineItem {
  id: string;
  title: string; // Punchy single sentence
  background: string; // Expanded context
  recommendation: string; // Decision/action
  deliverable: string; // What and when
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'blocked' | 'complete';
}

interface BUSection {
  buId: keyof typeof BUSINESS_UNITS;
  items: BUBottomLineItem[];
}

interface CrossBUPriority {
  id: string;
  title: string;
  description: string;
  businessUnits: (keyof typeof BUSINESS_UNITS)[];
  priority: number;
  targetDate: string;
  owner: string;
  status: 'not-started' | 'in-progress' | 'complete';
}

interface Ask {
  id: string;
  title: string;
  description: string;
  businessUnits: (keyof typeof BUSINESS_UNITS)[];
  requestedFrom: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
}

interface CrossBURisk {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
  status: 'open' | 'monitoring' | 'mitigated' | 'closed';
}

export default function LeadershipBUSummary() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const cycleViewSize = () => {
    if (viewSize === 75) setViewSize(95);
    else if (viewSize === 95) setViewSize(100);
    else setViewSize(75);
  };
  
  // Sample Data - Replace with API calls
  const [buSections] = useState<BUSection[]>([
    {
      buId: 'banking-int',
      items: [
        {
          id: '1',
          title: 'MUFG $6M+ Demo AI Endpoint Build kicked off for Credit Assessment',
          background: 'Major Japanese banking client requested AI-powered credit assessment demonstration following Q4 2025 strategic review. Build requires 3-month timeline with dedicated engineering resources.',
          recommendation: 'Proceed with rapid prototype development using existing ML models. Allocate 2 senior engineers and coordinate with MUFG relationship team weekly.',
          deliverable: 'Working prototype demo by March 15, 2026 for stakeholder review',
          priority: 'high',
          status: 'on-track'
        },
        {
          id: '2',
          title: 'Coast demo asset visibility requires prioritization for Q1 pipeline',
          background: 'Sales team identified gap in demo asset availability for retail banking prospects. Current 3-week lead time impacting deal velocity.',
          recommendation: 'Fast-track 5 core retail banking demos to production. Establish demo asset library with 48-hour deployment SLA.',
          deliverable: 'Demo library live by Feb 28, 2026',
          priority: 'high',
          status: 'at-risk'
        }
      ]
    },
    {
      buId: 'banking-na',
      items: [
        {
          id: '3',
          title: 'CBK Coast demo successfully reviewed and approved by Line of Business',
          background: 'Commercial banking demo showcasing multi-product integration completed stakeholder review cycle with positive feedback from 4 department heads.',
          recommendation: 'Move to production deployment. Schedule training sessions for sales team across 3 regions.',
          deliverable: 'Production deployment by Feb 20, 2026; Training complete by March 5',
          priority: 'medium',
          status: 'on-track'
        }
      ]
    },
    {
      buId: 'capital-markets',
      items: [
        {
          id: '4',
          title: 'E6 demo asset access deprioritized due to TSYS acquisition integration',
          background: 'TSYS acquisition created competing priorities for engineering resources. E6 platform demo originally scheduled for Q1 now conflicts with integration workstreams.',
          recommendation: 'Defer E6 demo to Q2 2026. Redirect resources to TSYS integration demos showcasing unified platform vision.',
          deliverable: 'Revised roadmap communicated by Feb 15, 2026',
          priority: 'low',
          status: 'blocked'
        }
      ]
    },
    {
      buId: 'payments',
      items: [
        {
          id: '5',
          title: 'Real-time payment rails demo platform ready for enterprise clients',
          background: 'New instant payment processing demonstration environment built to showcase sub-second settlement capabilities for Fortune 500 prospects.',
          recommendation: 'Begin controlled rollout to top 10 target accounts. Gather feedback through March for iteration.',
          deliverable: 'First client demo scheduled Feb 25, 2026',
          priority: 'medium',
          status: 'on-track'
        }
      ]
    },
    {
      buId: 'cross-bu',
      items: [
        {
          id: '6',
          title: 'Coast MSA Renewal pending Finance approval (Robert Rossetti)',
          background: 'Annual Master Service Agreement renewal for Coast platform ($850K) requires CFO sign-off. Original approval deadline passed Jan 31.',
          recommendation: 'Escalate to CFO office immediately. Platform critical for Q1 demos - service interruption risk if unsigned by Feb 15.',
          deliverable: 'Signed MSA required by Feb 15, 2026',
          priority: 'high',
          status: 'blocked'
        },
        {
          id: '7',
          title: 'Executive Summary Platform final testing complete and launch ready',
          background: 'New leadership dashboard platform completed development and UAT. All stakeholders signed off on functionality and design.',
          recommendation: 'Schedule launch for Feb 12, 2026. Conduct executive briefing session on Feb 11.',
          deliverable: 'Platform live Feb 12; Executive briefing Feb 11 at 2pm',
          priority: 'medium',
          status: 'complete'
        }
      ]
    }
  ]);

  const [asks] = useState<Ask[]>([
    {
      id: 'ask-1',
      title: 'Budget Approval for Q2 Demo Infrastructure Expansion',
      description: 'Requesting $450K budget allocation for scaling demo environments to support 40% increase in pipeline demos expected in Q2 2026.',
      businessUnits: ['banking-int', 'banking-na', 'capital-markets', 'payments'],
      requestedFrom: 'CFO / Finance Leadership',
      targetDate: '2026-02-28',
      priority: 'high',
      status: 'in-review'
    },
    {
      id: 'ask-2',
      title: 'Engineering Resources for TSYS Integration Demos',
      description: 'Need 2 FTE senior engineers dedicated to building post-acquisition integration demo suite for investor relations and customer communications.',
      businessUnits: ['capital-markets', 'payments'],
      requestedFrom: 'CTO / Engineering Leadership',
      targetDate: '2026-03-15',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'ask-3',
      title: 'Sales Team Training Time Commitment',
      description: 'Requesting commitment from regional sales managers for 8 hours per rep across 120 sales staff for new demo platform training.',
      businessUnits: ['banking-int', 'banking-na', 'payments', 'cross-bu'],
      requestedFrom: 'Chief Revenue Officer / Sales Leadership',
      targetDate: '2026-02-25',
      priority: 'medium',
      status: 'approved'
    }
  ]);

  const [crossBURisks] = useState<CrossBURisk[]>([
    {
      id: 'risk-1',
      title: 'Coast MSA Expiration Could Cause Service Interruption',
      description: 'Unsigned MSA renewal creates risk of platform access loss by Feb 15, impacting 25+ active demos and Q1 pipeline.',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Daily escalation to CFO office. Backup plan to migrate critical demos to Tiled if MSA lapses. Legal engaged on interim access agreement.',
      owner: 'Jason Hanscomb',
      status: 'monitoring'
    },
    {
      id: 'risk-2',
      title: 'TSYS Integration Complexity May Delay Q2 Demo Availability',
      description: 'Post-acquisition technical integration proving more complex than anticipated. Demo environment availability at risk for April investor roadshow.',
      impact: 'high',
      likelihood: 'high',
      mitigation: 'Parallel track: Build standalone TSYS demo while integration continues. Tier 1 priority for engineering resources. Weekly exec sync on progress.',
      owner: 'Engineering Leadership',
      status: 'open'
    },
    {
      id: 'risk-3',
      title: 'Demo Asset Quality Inconsistency Across Products',
      description: 'Lack of standardized demo data and narratives creating inconsistent customer experience and longer demo prep time.',
      impact: 'medium',
      likelihood: 'high',
      mitigation: 'Q1 Demo Asset Standardization Initiative in progress. Template library and best practices guide to be published by March 31.',
      owner: 'Demo Services Group',
      status: 'mitigated'
    }
  ]);

  const [crossBUPriorities] = useState<CrossBUPriority[]>([
    {
      id: 'p1',
      title: 'Q1 Demo Asset Standardization Initiative',
      description: 'Establish unified demo asset library with consistent branding, faster deployment, and cross-BU reusability',
      businessUnits: ['banking-int', 'banking-na', 'capital-markets', 'payments'],
      priority: 1,
      targetDate: '2026-03-31',
      owner: 'Demo Engineering Team',
      status: 'in-progress'
    },
    {
      id: 'p2',
      title: 'Sales Enablement Training Program',
      description: 'Comprehensive demo platform training for sales teams across all business units to improve utilization',
      businessUnits: ['banking-int', 'banking-na', 'payments', 'cross-bu'],
      priority: 2,
      targetDate: '2026-02-28',
      owner: 'Sales Operations',
      status: 'in-progress'
    },
    {
      id: 'p3',
      title: 'TSYS Integration Demo Suite',
      description: 'Build demonstration environment showcasing post-acquisition unified platform capabilities',
      businessUnits: ['capital-markets', 'payments', 'cross-bu'],
      priority: 3,
      targetDate: '2026-04-15',
      owner: 'Integration Team',
      status: 'not-started'
    }
  ]);

  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        fetch: { requestInit: { cache: 'force-cache' } }
      });
      
      const link = document.createElement('a');
      link.download = `leadership-bu-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 flex flex-col transition-all duration-300 ${
          viewSize === 100 ? 'w-full h-full' : viewSize === 95 ? 'w-[95vw] h-[95vh]' : 'w-[75vw] h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-roobert-bold text-white">Leadership Executive Summary</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Business Unit View • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 mr-2">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 rounded text-xs font-roobert-medium transition-all ${
                  viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 rounded text-xs font-roobert-medium transition-all ${
                  viewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Expand/Size Toggle */}
            <button
              onClick={cycleViewSize}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
              title={viewSize === 75 ? 'Expand to 95%' : viewSize === 95 ? 'Fullscreen' : 'Collapse to 75%'}
            >
              {viewSize === 100 ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white disabled:opacity-50"
              title="Export to PNG"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
          <div className={`mx-auto space-y-6 ${viewMode === 'mobile' ? 'max-w-md' : 'max-w-7xl'}`}>
            
            {/* Business Unit Sections */}
            {buSections.map((section) => (
              <BUSection key={section.buId} section={section} viewMode={viewMode} />
            ))}

            {/* Asks Section */}
            <AsksSection asks={asks} viewMode={viewMode} />

            {/* Cross-BU Priorities */}
            <CrossBUPrioritiesSection priorities={crossBUPriorities} viewMode={viewMode} />

            {/* Cross-BU Risks */}
            <CrossBURisksSection risks={crossBURisks} viewMode={viewMode} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// BU Section Component
function BUSection({ section, viewMode }: { section: BUSection; viewMode: 'desktop' | 'mobile' }) {
  const bu = BUSINESS_UNITS[section.buId];

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      {/* BU Header */}
      <div 
        className="px-5 py-3"
        style={{ 
          background: `linear-gradient(135deg, ${bu.color}dd, ${bu.color}99)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center font-roobert-bold text-white text-sm"
            style={{ background: bu.darkColor }}
          >
            {bu.shortName}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-roobert-bold text-white">{bu.name}</h3>
            <p className="text-sm text-white/80 font-roobert-light">{section.items.length} Bottom Line Item{section.items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Bottom Line Items */}
      <div className="p-4 space-y-4">
        {section.items.map((item, index) => (
          <div key={item.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 overflow-hidden">
            {/* Item Header */}
            <div className="px-4 py-3 flex items-start gap-3 bg-slate-800/30">
              <div className="flex-shrink-0 mt-0.5">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center font-roobert-bold text-white text-xs"
                  style={{ background: bu.color }}
                >
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-roobert-semibold text-white leading-relaxed">{item.title}</h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Details - Always Visible */}
            <div className="px-4 pb-4 pt-3 space-y-3">
              {/* Background */}
              <div>
                <h5 className="text-xs font-roobert-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Background
                </h5>
                <p className="text-sm text-slate-300 font-roobert-light leading-relaxed pl-3.5">{item.background}</p>
              </div>

              {/* Recommendation */}
              <div>
                <h5 className="text-xs font-roobert-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Recommendation
                </h5>
                <p className="text-sm text-slate-300 font-roobert-semibold leading-relaxed pl-3.5" style={{ color: bu.color }}>{item.recommendation}</p>
              </div>

              {/* Deliverable */}
              <div>
                <h5 className="text-xs font-roobert-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Deliverable
                </h5>
                <div className="flex items-start gap-2 pl-3.5">
                  <Target className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white font-roobert-semibold">{item.deliverable}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Asks Section
function AsksSection({ asks, viewMode }: { asks: Ask[]; viewMode: 'desktop' | 'mobile' }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-3"
        style={{ 
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
            <HandCoins className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-roobert-bold text-white">Asks</h3>
            <p className="text-sm text-white/80 font-roobert-light">Approvals and support needed from leadership</p>
          </div>
        </div>
      </div>

      {/* Asks List */}
      <div className="p-4 space-y-3">
        {asks.map((ask) => (
          <div key={ask.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="text-base font-roobert-semibold text-white flex-1">{ask.title}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={ask.priority} />
                <AskStatusBadge status={ask.status} />
              </div>
            </div>

            <p className="text-sm text-slate-400 font-roobert-light leading-relaxed mb-3">{ask.description}</p>

            {/* BU Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {ask.businessUnits.map((buId) => {
                const bu = BUSINESS_UNITS[buId];
                return (
                  <span
                    key={buId}
                    className="px-2 py-1 rounded text-xs font-roobert-semibold text-white"
                    style={{ background: bu.color }}
                  >
                    {bu.shortName}
                  </span>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-roobert-light">
              <span>Requested From: <span className="text-slate-400 font-roobert-medium">{ask.requestedFrom}</span></span>
              <span>•</span>
              <span>Target: <span className="text-slate-400 font-roobert-medium">{new Date(ask.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cross-BU Priorities Section
function CrossBUPrioritiesSection({ priorities, viewMode }: { priorities: CrossBUPriority[]; viewMode: 'desktop' | 'mobile' }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-3"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-roobert-bold text-white">Cross-BU Priorities</h3>
            <p className="text-sm text-white/80 font-roobert-light">Strategic initiatives spanning multiple business units</p>
          </div>
        </div>
      </div>

      {/* Priorities List */}
      <div className="p-4 space-y-3">
        {priorities.sort((a, b) => a.priority - b.priority).map((priority) => (
          <div key={priority.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white flex-shrink-0"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {priority.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-roobert-semibold text-white mb-1">{priority.title}</h4>
                  <p className="text-sm text-slate-400 font-roobert-light leading-relaxed">{priority.description}</p>
                </div>
              </div>
              <CrossBUStatusBadge status={priority.status} />
            </div>

            {/* BU Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {priority.businessUnits.map((buId) => {
                const bu = BUSINESS_UNITS[buId];
                return (
                  <span
                    key={buId}
                    className="px-2 py-1 rounded text-xs font-roobert-semibold text-white"
                    style={{ background: bu.color }}
                  >
                    {bu.shortName}
                  </span>
                );
              })}
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-slate-500 font-roobert-light">
              <span>Owner: <span className="text-slate-400 font-roobert-medium">{priority.owner}</span></span>
              <span>•</span>
              <span>Target: <span className="text-slate-400 font-roobert-medium">{new Date(priority.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cross-BU Risks Section
function CrossBURisksSection({ risks, viewMode }: { risks: CrossBURisk[]; viewMode: 'desktop' | 'mobile' }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-3"
        style={{ 
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-roobert-bold text-white">Cross-BU Risks</h3>
            <p className="text-sm text-white/80 font-roobert-light">Key risks and mitigation strategies across business units</p>
          </div>
        </div>
      </div>

      {/* Risks List */}
      <div className="p-4 space-y-3">
        {risks.map((risk) => (
          <div key={risk.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="text-base font-roobert-semibold text-white flex-1">{risk.title}</h4>
              <RiskStatusBadge status={risk.status} />
            </div>

            <p className="text-sm text-slate-400 font-roobert-light leading-relaxed mb-3">{risk.description}</p>

            {/* Risk Metrics */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-roobert-light">Impact:</span>
                <RiskLevelBadge level={risk.impact} />
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-roobert-light">Likelihood:</span>
                <RiskLevelBadge level={risk.likelihood} />
              </div>
            </div>

            {/* Mitigation */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-roobert-bold text-emerald-400 uppercase tracking-wide mb-1">Mitigation Strategy</h5>
              <p className="text-sm text-slate-300 font-roobert-light leading-relaxed">{risk.mitigation}</p>
            </div>

            {/* Owner */}
            <div className="text-xs text-slate-500 font-roobert-light">
              Owner: <span className="text-slate-400 font-roobert-medium">{risk.owner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-roobert-semibold border ${colors[priority]}`}>
      {priority.toUpperCase()}
    </span>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'on-track' | 'at-risk' | 'blocked' | 'complete' }) {
  const config = {
    'on-track': { color: 'bg-emerald-500/20 text-emerald-400', label: 'On Track', icon: '✓' },
    'at-risk': { color: 'bg-amber-500/20 text-amber-400', label: 'At Risk', icon: '⚠' },
    'blocked': { color: 'bg-red-500/20 text-red-400', label: 'Blocked', icon: '⚫' },
    'complete': { color: 'bg-blue-500/20 text-blue-400', label: 'Complete', icon: '✓' }
  };

  const s = config[status];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${s.color} flex items-center gap-1`}>
      <span>{s.icon}</span>
      {s.label}
    </span>
  );
}

// Cross-BU Status Badge
function CrossBUStatusBadge({ status }: { status: 'not-started' | 'in-progress' | 'complete' }) {
  const config = {
    'not-started': { color: 'bg-slate-500/20 text-slate-400', label: 'Not Started' },
    'in-progress': { color: 'bg-purple-500/20 text-purple-400', label: 'In Progress' },
    'complete': { color: 'bg-emerald-500/20 text-emerald-400', label: 'Complete' }
  };

  const s = config[status];

  return (
    <span className={`px-3 py-1.5 rounded-lg text-xs font-roobert-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

// Ask Status Badge
function AskStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' | 'in-review' }) {
  const config = {
    'pending': { color: 'bg-slate-500/20 text-slate-400', label: 'Pending' },
    'in-review': { color: 'bg-amber-500/20 text-amber-400', label: 'In Review' },
    'approved': { color: 'bg-emerald-500/20 text-emerald-400', label: 'Approved' },
    'rejected': { color: 'bg-red-500/20 text-red-400', label: 'Rejected' }
  };

  const s = config[status];

  return (
    <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

// Risk Status Badge
function RiskStatusBadge({ status }: { status: 'open' | 'monitoring' | 'mitigated' | 'closed' }) {
  const config = {
    'open': { color: 'bg-red-500/20 text-red-400', label: 'Open' },
    'monitoring': { color: 'bg-amber-500/20 text-amber-400', label: 'Monitoring' },
    'mitigated': { color: 'bg-blue-500/20 text-blue-400', label: 'Mitigated' },
    'closed': { color: 'bg-emerald-500/20 text-emerald-400', label: 'Closed' }
  };

  const s = config[status];

  return (
    <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${s.color}`}>
      {s.label}
    </span>
  );
}

// Risk Level Badge
function RiskLevelBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    'high': { color: 'bg-red-500/20 text-red-400', label: 'High' },
    'medium': { color: 'bg-amber-500/20 text-amber-400', label: 'Medium' },
    'low': { color: 'bg-emerald-500/20 text-emerald-400', label: 'Low' }
  };

  const c = config[level];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-roobert-semibold ${c.color}`}>
      {c.label}
    </span>
  );
}
