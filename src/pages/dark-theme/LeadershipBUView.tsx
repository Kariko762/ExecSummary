import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X, Building2, Target, HandCoins, TrendingUp, Shield } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

// Business Unit Configuration
const BUSINESS_UNITS = {
  'banking-int': {
    id: 'banking-int',
    name: 'Banking (Int.)',
    shortName: 'INT',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
    darkColor: '#1E3A8A'
  },
  'banking-na': {
    id: 'banking-na',
    name: 'Banking (NA)',
    shortName: 'NA',
    color: '#10B981',
    lightColor: '#D1FAE5',
    darkColor: '#065F46'
  },
  'capital-markets': {
    id: 'capital-markets',
    name: 'Capital Markets',
    shortName: 'CM',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    darkColor: '#5B21B6'
  },
  'payments': {
    id: 'payments',
    name: 'Payments',
    shortName: 'PAY',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    darkColor: '#92400E'
  },
  'cross-bu': {
    id: 'cross-bu',
    name: 'Cross-BU',
    shortName: 'XBU',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    darkColor: '#991B1B'
  }
} as const;

// Interfaces
interface BUBottomLineItem {
  id: string;
  title: string;
  background: string;
  recommendation: string;
  deliverable: string;
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'blocked' | 'complete' | 'in-progress';
}

interface BUSection {
  buId: keyof typeof BUSINESS_UNITS;
  items: BUBottomLineItem[];
}

interface Ask {
  id: string;
  title: string;
  description: string;
  businessUnits?: (keyof typeof BUSINESS_UNITS)[];
  requestedFrom: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
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

interface LeadershipBUViewProps {
  data: any;
  onClose: () => void;
}

export default function LeadershipBUView({ data, onClose }: LeadershipBUViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const buSections: BUSection[] = data.buSections || [];
  const asks: Ask[] = data.asks || [];
  const crossBUPriorities: CrossBUPriority[] = data.crossBUPriorities || [];
  const crossBURisks: CrossBURisk[] = data.crossBURisks || [];
  const metadata = data.metadata || {};

  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a'
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
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 flex flex-col w-[90vw] h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-roobert-bold text-white">{metadata.title || 'Leadership BU Summary'}</h2>
              <p className="text-sm text-slate-400 font-roobert-light">
                {metadata.description || 'Business Unit View'} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white disabled:opacity-50"
              title="Export to PNG"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Business Unit Sections */}
            {buSections.map((section) => (
              <BUSection key={section.buId} section={section} />
            ))}

            {/* Asks Section */}
            {asks.length > 0 && <AsksSection asks={asks} />}

            {/* Cross-BU Priorities */}
            {crossBUPriorities.length > 0 && <CrossBUPrioritiesSection priorities={crossBUPriorities} />}

            {/* Cross-BU Risks */}
            {crossBURisks.length > 0 && <CrossBURisksSection risks={crossBURisks} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// BU Section Component
function BUSection({ section }: { section: BUSection }) {
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

            {/* Details */}
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
function AsksSection({ asks }: { asks: Ask[] }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      <div 
        className="px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
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

            {ask.businessUnits && ask.businessUnits.length > 0 && (
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
            )}

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
function CrossBUPrioritiesSection({ priorities }: { priorities: CrossBUPriority[] }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      <div 
        className="px-5 py-3"
        style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}
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
function CrossBURisksSection({ risks }: { risks: CrossBURisk[] }) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
      <div 
        className="px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
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

      <div className="p-4 space-y-3">
        {risks.map((risk) => (
          <div key={risk.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h4 className="text-base font-roobert-semibold text-white flex-1">{risk.title}</h4>
              <RiskStatusBadge status={risk.status} />
            </div>

            <p className="text-sm text-slate-400 font-roobert-light leading-relaxed mb-3">{risk.description}</p>

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

            <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-roobert-bold text-emerald-400 uppercase tracking-wide mb-1">Mitigation Strategy</h5>
              <p className="text-sm text-slate-300 font-roobert-light leading-relaxed">{risk.mitigation}</p>
            </div>

            <div className="text-xs text-slate-500 font-roobert-light">
              Owner: <span className="text-slate-400 font-roobert-medium">{risk.owner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Badge Components
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

function StatusBadge({ status }: { status: 'on-track' | 'at-risk' | 'blocked' | 'complete' | 'in-progress' }) {
  const config = {
    'on-track': { color: 'bg-emerald-500/20 text-emerald-400', label: 'On Track', icon: '✓' },
    'at-risk': { color: 'bg-amber-500/20 text-amber-400', label: 'At Risk', icon: '⚠' },
    'blocked': { color: 'bg-red-500/20 text-red-400', label: 'Blocked', icon: '⚫' },
    'complete': { color: 'bg-blue-500/20 text-blue-400', label: 'Complete', icon: '✓' },
    'in-progress': { color: 'bg-purple-500/20 text-purple-400', label: 'In Progress', icon: '▶' }
  };

  const s = config[status] || config['on-track']; // Fallback to on-track if status not found

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${s.color} flex items-center gap-1`}>
      <span>{s.icon}</span>
      {s.label}
    </span>
  );
}

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
