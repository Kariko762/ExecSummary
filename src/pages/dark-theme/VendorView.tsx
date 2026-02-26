import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, TrendingUp, Target, CheckCircle2, Sparkles, Clock, Zap } from 'lucide-react';

interface VendorViewProps {
  data?: any;
  vendor?: string | null;
  onClose: () => void;
}

// Sample data - will be replaced with API data later
const VENDOR_OVERVIEW_DATA = {
  vendorName: 'Coast',
  title: 'Technology Overview - Q1 2026',
  heroMetrics: [
    {
      id: 'visualization',
      label: 'API Visualization',
      value: '12,000+',
      icon: 'sparkles',
      iconColor: 'text-cyan-400'
    },
    {
      id: 'stories',
      label: 'Interactive Stories',
      value: '450',
      icon: 'check',
      iconColor: 'text-green-400'
    },
    {
      id: 'enablement',
      label: 'GTM Enablement',
      value: '33%',
      icon: 'trending',
      iconColor: 'text-purple-400'
    },
    {
      id: 'demos',
      label: 'Technical Demos',
      value: '89',
      icon: 'zap',
      iconColor: 'text-yellow-400'
    }
  ],
  storytellingIndex: {
    title: 'Storytelling Index',
    subtitle: 'Aggregates backend visibility, interactive stories, self-serve environments, GTM alignment, and technical enablement.',
    overallScore: 89,
    maxScore: 100,
    segments: [
      { name: 'Backend Visibility', score: 95 },
      { name: 'API Stories', score: 92 },
      { name: 'Self-Serve', score: 88 },
      { name: 'Product GTM', score: 85 },
      { name: 'Sales Enable', score: 87 },
      { name: 'Tech Demos', score: 90 },
      { name: 'User Adoption', score: 91 }
    ]
  },
  featureCards: [
    {
      title: 'Visualize Backend Workflows',
      color: 'cyan',
      features: [
        'Map API calls to user journeys',
        'Identify integration bottlenecks',
        'Create technical product docs',
        'Build developer onboarding flows'
      ]
    },
    {
      title: 'Build Interactive Product Stories',
      color: 'blue',
      features: [
        'No-code story builder for PMs',
        'Embed live API demos',
        'Version control for narratives',
        'Multi-channel distribution'
      ]
    },
    {
      title: 'Enable API + Technical GTM',
      color: 'purple',
      features: [
        'Self-serve sandbox environments',
        'Pre-built integration scenarios',
        'Technical sales playbooks',
        'ROI calculators with API metrics'
      ]
    }
  ],
  problemsSolved: [
    {
      title: 'Backend complexity invisible to sales',
      description: 'Sales teams struggled to articulate technical value without engineering support. Coast visualizes API workflows in simple diagrams non-technical teams can use in pitches.'
    },
    {
      title: 'Static product docs outdated',
      description: 'Traditional docs became stale within weeks. Coast\'s interactive stories auto-update with API changes, ensuring demos always reflect current capabilities.'
    },
    {
      title: 'Long demo setup times',
      description: 'Engineering spent days building custom environments for each prospect. Coast\'s self-serve sandboxes provision in minutes with real data.'
    },
    {
      title: 'GTM missed technical buyers',
      description: 'Marketing focused on business users while technical decision-makers needed depth. Coast enabled parallel technical + business narratives.'
    }
  ],
  gtmHighlights: [
    {
      title: 'Developer Documentation Portal',
      description: 'Product teams use Coast to auto-generate API docs with interactive examples, reducing support tickets by 40%.'
    },
    {
      title: 'Sales Engineering Enablement',
      description: 'SEs build reusable demo environments for common use cases, cutting demo prep time from 3 days to 30 minutes.'
    },
    {
      title: 'Partner Integration Kits',
      description: 'Partnerships team creates self-serve integration guides, enabling 3x more partner launches per quarter.'
    },
    {
      title: 'Customer Success Onboarding',
      description: 'CS teams share interactive workflows during implementation, improving time-to-value by 50%.'
    },
    {
      title: 'Product Marketing Campaigns',
      description: 'PMM embeds live API demos in launch campaigns, increasing trial-to-paid conversion by 27%.'
    }
  ],
  gtmScore: {
    score: 89,
    label: 'GTM Maturity',
    recommendation: 'Strategic',
    details: [
      { label: 'Active Use Cases', sublabel: '5 teams', icon: true },
      { label: 'Pipeline Influence', sublabel: '$18.7M', icon: true },
      { label: 'Demo Conversion', sublabel: '27%', icon: true }
    ]
  },
  licenseEfficiency: {
    assigned: 150,
    active: 138,
    utilization: 92
  },
  executiveSummary: `Coast has become the central platform for translating technical complexity into business value across product, sales, and marketing teams. The storytelling capabilities enable non-technical stakeholders to create compelling API-driven narratives without engineering bottlenecks, directly contributing to $18.7M in influenced pipeline (33% of total).

Key adoption drivers: backend workflow visualization (95/100 score), interactive product storytelling (92/100), and self-serve demo environments (88/100). Five core teams actively leverage Coast for developer docs, sales engineering, partner integrations, customer success, and product marketing.

Strategic value extends beyond immediate ROI - Coast is becoming the "translation layer" between engineering depth and GTM accessibility, enabling parallel technical + business narratives that resonate with both developer and executive buyers.

Recommendation: Expand to regional sales teams and product lines. Invest in Enterprise tier for advanced analytics, white-label capabilities, and dedicated technical account management.`
};

// ============================================================================
// HELPER COMPONENTS (Must be defined before main component)
// ============================================================================

// Vendor Header Component
function VendorOverviewHeader({ data }: { data: any }) {
  const vendorName = data?.metadata?.vendorName || data?.vendorName || 'Vendor';
  const logo = data?.metadata?.logo || data?.logo;
  const title = data?.metadata?.title || data?.title || 'Technology Overview';
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {logo ? (
          <img 
            src={logo} 
            alt={`${vendorName} logo`} 
            className="h-12 object-contain"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-xl font-roobert-bold text-white">{vendorName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-lg font-roobert-medium text-white">{title}</div>
      </div>
    </div>
  );
}

// Hero Metrics Component
function HeroMetrics({ data }: { data: any }) {
  const iconMap: Record<string, any> = {
    sparkles: Sparkles,
    check: CheckCircle2,
    clock: Clock,
    zap: Zap,
    target: Target,
    trending: TrendingUp
  };

  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((metric: any) => {
        const Icon = iconMap[metric.icon] || Target;
        return (
          <motion.div
            key={metric.id}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${metric.iconColor || 'text-cyan-400'}`} />
              <div className="text-lg font-roobert-bold text-white">
                {metric.value}
              </div>
            </div>
            <div className="text-xs font-roobert-light text-white/70 leading-tight">
              {metric.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Storytelling Index Component
function StorytellingIndex({ data }: { data: typeof VENDOR_OVERVIEW_DATA.storytellingIndex }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-roobert-bold text-white tracking-wide">
          {data.title}
        </h3>
        <div className="text-5xl font-roobert-bold text-cyan-400">
          {data.overallScore}<span className="text-white/40">/{data.maxScore}</span>
        </div>
      </div>
      
      {/* Segmented Bar */}
      <div className="grid grid-cols-7 gap-1 mb-4 h-3 rounded-lg overflow-hidden">
        {data.segments.map((segment, idx) => (
          <div
            key={idx}
            className="h-full"
            style={{
              background: `linear-gradient(135deg, rgba(34, 211, 238, ${0.3 + idx * 0.08}) 0%, rgba(59, 130, 246, ${0.4 + idx * 0.08}) 100%)`
            }}
          />
        ))}
      </div>

      {/* Segment Labels */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {data.segments.map((segment, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xl font-roobert-bold text-white mb-1">
              {segment.score}%
            </div>
            <div className="text-[9px] font-roobert-light text-white/70 leading-tight">
              {segment.name}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-roobert-light text-white/60 leading-relaxed">
        * {data.subtitle}
      </p>
    </div>
  );
}

// Feature Cards Component
function FeatureCards({ data }: { data: typeof VENDOR_OVERVIEW_DATA.featureCards }) {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-600/20 to-cyan-500/10 border-cyan-500/30',
    blue: 'from-blue-600/20 to-blue-500/10 border-blue-500/30',
    purple: 'from-purple-600/20 to-purple-500/10 border-purple-500/30'
  };

  const iconColorMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {data.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${colorMap[card.color]} border backdrop-blur-sm rounded-lg p-5`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-white/10`}>
              <Target className={`w-5 h-5 ${iconColorMap[card.color]}`} />
            </div>
            <h3 className="text-base font-roobert-bold text-white">{card.title}</h3>
          </div>
          <ul className="space-y-2">
            {card.features.map((feature, fidx) => (
              <li key={fidx} className="flex items-start gap-2 text-sm text-white/80 font-roobert-light">
                <span className={`mt-1 ${iconColorMap[card.color]}`}>•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Problems Solved Component
function ProblemsSolved({ data }: { data: typeof VENDOR_OVERVIEW_DATA.problemsSolved }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded bg-red-500/20">
          <Target className="w-4 h-4 text-red-400" />
        </div>
        <h3 className="text-base font-roobert-bold text-white">Problems Solved</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((problem, idx) => (
          <div key={idx} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg bg-white/5">
                <div className="w-4 h-4 rounded-full bg-red-400/20 border border-red-400/30" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-roobert-semibold text-white mb-1">
                  {problem.title}
                </h4>
                <p className="text-xs text-white/70 font-roobert-light leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GTM Highlights Component
function GTMHighlights({ data }: { data: typeof VENDOR_OVERVIEW_DATA.gtmHighlights }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded bg-green-500/20">
          <Target className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-roobert-bold text-white">GTM Use Cases</h3>
          <p className="text-xs text-white/60 font-roobert-light">Key reasons teams adopt Coast</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((useCase, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="mt-0.5 p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-semibold text-white mb-1">
                {useCase.title}
              </h4>
              <p className="text-xs text-white/70 font-roobert-light leading-relaxed">
                {useCase.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GTM Score Component
function GTMScore({ data, license }: { 
  data: typeof VENDOR_OVERVIEW_DATA.gtmScore,
  license: typeof VENDOR_OVERVIEW_DATA.licenseEfficiency
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded bg-purple-500/20">
          <Target className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-roobert-bold text-white">Total GTM Score</h3>
          <p className="text-[9px] text-white/50 font-roobert-light">Aggregate value metrics</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        {data.details.map((detail, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="text-white/70 font-roobert-light">{detail.label}</span>
            <div className="flex items-center gap-2">
              {detail.icon && <TrendingUp className="w-3 h-3 text-cyan-400" />}
              <span className="text-white font-roobert-medium">{detail.sublabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Score */}
      <div className="pt-4 border-t border-white/10">
        <div className="text-xs text-white/60 font-roobert-light mb-2">Total GTM Score</div>
        <div className="flex items-center justify-between">
          <div className="text-5xl font-roobert-bold text-cyan-400">{data.score}</div>
          <div className="text-right">
            <div className="text-sm font-roobert-medium text-white/80 mb-1">{data.label}</div>
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs font-roobert-bold text-green-400">
              {data.recommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Executive Summary Component
function ExecutiveSummary({ content }: { content: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <h3 className="text-base font-roobert-bold text-white mb-4">Executive Summary</h3>
      <div className="text-sm text-white/80 font-roobert-light leading-relaxed space-y-3">
        {content.split('\n\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VendorView({ data: propData, vendor, onClose }: VendorViewProps) {
  // Use prop data if provided, otherwise fallback to sample data
  const data = propData || VENDOR_OVERVIEW_DATA;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleExport = () => {
    window.print();
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1f2e] w-full h-full flex flex-col overflow-hidden"
      >
        {/* Header with Export/Close buttons */}
        <div className="relative bg-[#1e2533] text-white flex-shrink-0 border-b border-white/10">
          <div className="relative px-8 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-roobert-medium text-white">
                  Vendor Summary - {data?.metadata?.vendorName || data?.vendorName || 'Vendor'}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-20 py-8">
            <div className="space-y-6">
              {/* Vendor Header */}
              <VendorOverviewHeader data={data} />

              {/* ROW 1: Hero Metrics - 4 cards across */}
              <HeroMetrics data={data.heroMetrics} />

              {/* ROW 2: Executive Summary - Full Width */}
              <ExecutiveSummary content={data.executiveSummary} />

              {/* ROW 3: Feature Cards - 3 columns */}
              <FeatureCards data={data.featureCards} />

              {/* ROW 4: Bullet Lists - Problems Solved + GTM Highlights */}
              <div className="grid grid-cols-2 gap-6">
                <ProblemsSolved data={data.problemsSolved} />
                <GTMHighlights data={data.gtmHighlights} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
