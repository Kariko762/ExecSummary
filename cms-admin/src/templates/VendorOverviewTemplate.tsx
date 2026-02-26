import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, TrendingUp, Clock, Target, Zap } from 'lucide-react';

// DATA STRUCTURE - This will be replaced by AI or inline editing
const VENDOR_OVERVIEW_DATA = {
  metadata: {
    vendorName: 'coast',
    title: 'Technology Overview',
    period: 'Q1 2026'
  },
  
  heroMetrics: [
    {
      id: 'visualization',
      icon: 'sparkles',
      value: 'API Visualization',
      label: 'Backend to Frontend UI Generation',
      iconColor: 'text-cyan-400'
    },
    {
      id: 'stories',
      icon: 'target',
      value: 'Interactive Stories',
      label: 'End-to-End Product Journeys',
      iconColor: 'text-blue-400'
    },
    {
      id: 'gtm',
      icon: 'trending',
      value: 'GTM Enablement',
      label: 'Multi-Channel Demo Support',
      iconColor: 'text-purple-400'
    },
    {
      id: 'technical',
      icon: 'zap',
      value: 'Technical Demos',
      label: 'API-First Focus',
      iconColor: 'text-cyan-400'
    }
  ],

  storytellingIndex: {
    overallScore: 89,
    maxScore: 100,
    title: 'THE API PRODUCT STORYTELLING INDEX',
    subtitle: 'Turning complex APIs into interactive, realistic product demos drives faster sales cycles and higher win rates by helping buyers truly understand backend value.',
    segments: [
      { name: 'Demo Realism', score: 84 },
      { name: 'Pre-Sales Efficiency', score: 85 },
      { name: 'Sales Engagement', score: 85 },
      { name: 'Buyer Detonation', score: 88 },
      { name: 'Buyer Velocity', score: 79 },
      { name: 'Pipeline Conversion', score: 70 },
      { name: 'GTM Impact', score: 89 }
    ]
  },

  featureCards: [
    {
      title: 'Visualize Backend Workflows',
      icon: 'workflow',
      color: 'cyan',
      features: [
        'Generate UI from APIs',
        'Simulate Requests, Headers, Payloads',
        'Data Mapping & Transformation',
        'Make APIs Feel Like Real Product Journeys'
      ]
    },
    {
      title: 'Build Interactive Product Stories',
      icon: 'story',
      color: 'blue',
      features: [
        'Create End-to-End Technical Journeys',
        'Use Cases & Personas Library',
        'Dynamic Workflow Orchestration',
        'Conditional Logic & State Management'
      ]
    },
    {
      title: 'Enable API + Technical GTM',
      icon: 'gtm',
      color: 'purple',
      features: [
        'Sales Demos',
        'Interactive Marketing Content',
        'Self-Serve Buyer Experiences',
        'Solution Engineering',
        'Implementation Previews'
      ]
    }
  ],

  problemsSolved: [
    {
      title: 'Complex Backend Visibility',
      description: 'APIs and backend workflows are invisible to buyers - impossible to demo value without complex setup',
      icon: 'eye'
    },
    {
      title: 'Demo Prep Time',
      description: 'Pre-sales teams spend hours building custom environments for each prospect interaction',
      icon: 'clock'
    },
    {
      title: 'Technical Storytelling',
      description: 'Struggle to translate technical capabilities into compelling business value narratives',
      icon: 'message'
    },
    {
      title: 'API-First GTM Gap',
      description: 'Traditional demo tools built for UI products fail to showcase backend/API value propositions',
      icon: 'code'
    }
  ],

  gtmHighlights: [
    {
      title: 'Sales Demos',
      description: 'Enable reps to deliver interactive product demos without engineering support',
      icon: 'users'
    },
    {
      title: 'Marketing Content',
      description: 'Create interactive product tours and walkthroughs for website and campaigns',
      icon: 'megaphone'
    },
    {
      title: 'Self-Serve Experiences',
      description: 'Let buyers explore product capabilities on their own timeline',
      icon: 'rocket'
    },
    {
      title: 'Solution Engineering',
      description: 'Accelerate POCs and technical validation with realistic sandbox environments',
      icon: 'wrench'
    },
    {
      title: 'Implementation Previews',
      description: 'Show prospects exactly how integration will work before they commit',
      icon: 'check-circle'
    }
  ],

  gtmScore: {
    score: 89,
    label: 'DEMO-READY',
    recommendation: 'CONTINUE',
    details: [
      { label: '77% → 115 Days', sublabel: 'Execute Prometheus Uplift' },
      { label: '2x', sublabel: 'Uplift many conv', icon: 'trending' },
      { label: 'Extraction activates anti 88% upsell action', sublabel: '' }
    ]
  },

  licenseEfficiency: {
    total: 370,
    utilized: 2995000,
    utilizationPercent: 418,
    optimizationPercent: 12,
    optimizationLabel: 'Impressive capacity-heavy'
  },

  executiveSummary: 'Coast empowers API-first companies to create compelling, interactive reference demos of palpable backend workflows. This ingenuity accelerates win rates, velar easing sales engineers\' hundreds of prep/hours-fix accelerating deal velocity.'
};

// Main Component
export default function VendorOverviewTemplate() {
  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <VendorOverviewHeader data={VENDOR_OVERVIEW_DATA.metadata} />
        
        {/* Hero Metrics */}
        <HeroMetrics data={VENDOR_OVERVIEW_DATA.heroMetrics} />
        
        {/* Storytelling Index */}
        <StorytellingIndex data={VENDOR_OVERVIEW_DATA.storytellingIndex} />
        
        {/* Feature Cards */}
        <FeatureCards data={VENDOR_OVERVIEW_DATA.featureCards} />
        
        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-6">
          <ProblemsSolved data={VENDOR_OVERVIEW_DATA.problemsSolved} />
          <GTMHighlights data={VENDOR_OVERVIEW_DATA.gtmHighlights} />
        </div>
      </div>
    </div>
  );
}

// Header Component
function VendorOverviewHeader({ data }: { data: typeof VENDOR_OVERVIEW_DATA.metadata }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-xl font-roobert-bold text-white">{data.vendorName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-2xl font-roobert-medium text-white">{data.vendorName}</h1>
          <p className="text-sm text-white/70 font-roobert-light">{data.title}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-roobert-medium text-white">{data.title}</div>
      </div>
    </div>
  );
}

// Hero Metrics Component
function HeroMetrics({ data }: { data: typeof VENDOR_OVERVIEW_DATA.heroMetrics }) {
  const iconMap: Record<string, any> = {
    sparkles: Sparkles,
    check: CheckCircle2,
    clock: Clock,
    zap: Zap,
    target: Target,
    trending: TrendingUp
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {data.map((metric) => {
        const Icon = iconMap[metric.icon];
        return (
          <motion.div
            key={metric.id}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-3">
              <Icon className={`w-5 h-5 ${metric.iconColor}`} />
            </div>
            <div className="text-3xl font-roobert-bold text-white mb-2">
              {metric.value}
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
          <p className="text-[9px] text-white/50 font-roobert-light">/ Facts finding titles</p>
        </div>
      </div>

      {/* Score Display */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-white/60 font-roobert-light">Nate Calls Pipeline</div>
          <div className="text-sm text-white font-roobert-medium">33%</div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-roobert-bold text-white">£{(18700000 / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-green-400 font-roobert-medium">+$141/lic</div>
        </div>
        <div className="text-center py-2 px-4 bg-white/10 rounded text-[10px] text-white/60 font-roobert-light">
          Are items in progress - 10- convur naris
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
