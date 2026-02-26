import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Award,
  Calendar
} from 'lucide-react';

// Multi-vendor performance data structure
const MULTI_VENDOR_DATA = {
  metadata: {
    title: 'MULTI-VENDOR PERFORMANCE DASHBOARD',
    subtitle: 'Demo Automation & Sales Enablement | Revenue Generation | Q4 FY2025',
    description: 'Measuring our Q4 tech investment across Coast, Fabricum, Synthesia, and Tiled to drive pipeline impact, productivity, and scalable demos.',
    period: 'Q4 FY2025'
  },
  heroMetrics: [
    {
      icon: DollarSign,
      value: '£1.12M',
      label: 'Total Spend',
      details: ['Licenses £775K', 'Services £345K'],
      color: 'cyan'
    },
    {
      icon: Users,
      value: '5,960',
      label: 'Demos Executed',
      change: '+180%',
      subtext: 'vs baseline',
      color: 'blue'
    },
    {
      icon: Clock,
      value: '6,740',
      unit: 'hours',
      subtext: 'saved',
      label: 'Productivity Gained',
      note: '(Asset reuse + prep automation)',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      value: '£11.4M',
      label: 'Influenced Wins',
      subValue: '£33.7M',
      subLabel: 'influenced pipeline',
      color: 'green'
    }
  ],
  vendorPerformance: [
    {
      name: 'Coast',
      logo: '🌊',
      demosExecuted: 1540,
      activeUsers: 0,
      influencedRevenue: '£3.1M',
      pipelineImpact: '£3.1M',
      color: 'cyan',
      barSegments: [
        { value: 1540, color: 'bg-cyan-400' },
        { value: 0, color: 'bg-cyan-600/40' }
      ]
    },
    {
      name: 'Fabricum',
      logo: '🔷',
      demosExecuted: 2020,
      activeUsers: 6040,
      influencedRevenue: '£3.5M',
      pipelineImpact: '£3.5M',
      color: 'blue',
      barSegments: [
        { value: 2020, color: 'bg-blue-400' },
        { value: 6040, color: 'bg-blue-600/60' }
      ]
    },
    {
      name: 'Synthesia',
      logo: '◉',
      demosExecuted: 800,
      activeUsers: 800,
      influencedRevenue: '£1.8M',
      pipelineImpact: '£1.8M',
      color: 'purple',
      barSegments: [
        { value: 800, color: 'bg-purple-400' },
        { value: 800, color: 'bg-purple-600/40' }
      ]
    },
    {
      name: 'Tiled',
      logo: '🔲',
      demosExecuted: 1600,
      activeUsers: 720,
      influencedRevenue: '£3.0M',
      pipelineImpact: '£3.0M',
      color: 'slate',
      barSegments: [
        { value: 1600, color: 'bg-slate-400' },
        { value: 720, color: 'bg-slate-600/40' }
      ]
    }
  ],
  productivity: {
    assetReuseRate: { coast: 57, fabricum: 0, synthesia: 0, tiled: 0 },
    avgPrepTime: { value: 65, change: '+65%', note: 'or 9.6 vs baseline' },
    automationDeflection: { 
      value: 2260, 
      unit: 'Hours saved', 
      note: 'Omnidictable demo trade context',
      percentage: 86,
      aiNote: 'Assisted demos tailored using AI generation'
    }
  },
  unitEconomics: {
    costPerDemo: '£188',
    costPerLicense: '£3,288',
    costPerDemoAsset: '£455',
    costPerDollarInfluencedWin: '£51'
  },
  platformAdoption: [
    {
      name: 'Coast',
      logo: '🌊',
      users: 120,
      growth: '+650%',
      utilization: 85,
      color: 'cyan'
    },
    {
      name: 'Fabricum',
      logo: '🔷',
      users: 220,
      growth: '+963%',
      utilization: 87.5,
      color: 'blue'
    },
    {
      name: 'Synthesia',
      logo: '◉',
      users: 75,
      growth: '+150%',
      utilization: 87,
      color: 'purple'
    },
    {
      name: 'Tiled',
      logo: '🔲',
      users: 110,
      growth: '+100%',
      utilization: 90.91,
      color: 'slate'
    }
  ],
  vendorOverview: [
    {
      name: 'Coast',
      logo: '🌊',
      tagline: 'Guide Journeys',
      color: 'cyan'
    },
    {
      name: 'FABRICUM',
      logo: '🔷',
      tagline: 'Demo Automation',
      color: 'blue'
    },
    {
      name: 'Synthesia',
      logo: '◉',
      tagline: 'AI Content Generation',
      color: 'purple'
    },
    {
      name: 'Tiled',
      logo: '🔲',
      tagline: 'Humanist Storyboards',
      color: 'slate'
    }
  ],
  salesImpact: {
    influencedWins: '£11.4M',
    influencedPipeline: '£33.7M',
    winRate: { value: 11, unit: 'pts lift', note: '(Demo-attributed)' }
  },
  keyStats: [
    { icon: Activity, label: 'Uptime', value: '99.97M', color: 'green', badge: '4-NINES' },
    { icon: Award, label: 'HR Certification', value: '£6.2M', note: 'influenced acceleration', badge: 'CSAT (User Satisfaction)' },
    { icon: AlertCircle, label: 'Uptime', value: 'Hidden17', color: 'red', badge: 'Uptime' },
    { icon: CheckCircle2, label: 'Incident Count', value: '0 / 3', color: 'green' },
    { icon: Clock, label: 'Time to Resolution', value: '5.4hr', color: 'blue' },
    { icon: Target, label: 'CSAT', value: '4.7/5', note: '(User Satisfaction)', color: 'purple' }
  ],
  executiveOutlook: [
    'Summarise Q1 vendor performance via panel dashboard',
    'Expand Tiled into account, based exec demo program (~40 licenses)',
    'Optimize content registry schema for improved inventory management and reporting.'
  ]
};

export default function MultiVendorDashboardTemplate() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      {/* Header */}
      <DashboardHeader />

      {/* Hero Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {MULTI_VENDOR_DATA.heroMetrics.map((metric, idx) => (
          <HeroMetricCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Demos Executed & Wins */}
        <div className="col-span-8 space-y-6">
          <DemosExecutedSection />
          <ProductivityGainedSection />
          <PlatformAdoptionSection />
          <VendorOverviewSection />
        </div>

        {/* Right Column - Stats */}
        <div className="col-span-4 space-y-6">
          <UnitEconomicsSection />
          <SalesImpactSection />
          <KeyStatsSection />
          <ExecutiveOutlookSection />
        </div>
      </div>
    </div>
  );
}

function DashboardHeader() {
  const { metadata } = MULTI_VENDOR_DATA;
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">{metadata.title}</h1>
      <p className="text-cyan-300 text-lg mb-3">{metadata.subtitle}</p>
      <p className="text-slate-300 text-sm max-w-4xl">{metadata.description}</p>
    </div>
  );
}

function HeroMetricCard({ metric }: { metric: any }) {
  const Icon = metric.icon;
  const colorMap: Record<string, string> = {
    cyan: 'bg-cyan-500/20 border-cyan-500/40',
    blue: 'bg-blue-500/20 border-blue-500/40',
    purple: 'bg-purple-500/20 border-purple-500/40',
    green: 'bg-green-500/20 border-green-500/40'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${colorMap[metric.color]} border backdrop-blur-sm rounded-xl p-5`}
    >
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-6 h-6 text-${metric.color}-400`} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{metric.value}</span>
            {metric.unit && <span className="text-sm text-slate-400">{metric.unit}</span>}
          </div>
          {metric.change && (
            <div className="text-green-400 text-sm font-medium mt-1">{metric.change} <span className="text-slate-400">{metric.subtext}</span></div>
          )}
          {metric.subtext && !metric.change && (
            <div className="text-slate-400 text-sm">{metric.subtext}</div>
          )}
        </div>
      </div>
      <div className="text-sm font-medium text-slate-300 mb-1">{metric.label}</div>
      {metric.details && (
        <div className="text-xs text-slate-400 space-y-0.5">
          {metric.details.map((detail: string, idx: number) => (
            <div key={idx}>• {detail}</div>
          ))}
        </div>
      )}
      {metric.note && <div className="text-xs text-slate-400 mt-1">{metric.note}</div>}
      {metric.subValue && (
        <div className="mt-2 text-lg">
          <span className="font-bold text-slate-200">{metric.subValue}</span>
          <span className="text-xs text-slate-400 ml-2">{metric.subLabel}</span>
        </div>
      )}
    </motion.div>
  );
}

function DemosExecutedSection() {
  const { vendorPerformance } = MULTI_VENDOR_DATA;
  const maxValue = Math.max(...vendorPerformance.map(v => v.demosExecuted + v.activeUsers));

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Demos Executed & Wins</h2>
      
      <div className="space-y-4">
        {vendorPerformance.map((vendor, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{vendor.logo}</span>
                <span className="font-medium">{vendor.name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-300">{vendor.demosExecuted.toLocaleString()}</span>
                {vendor.activeUsers > 0 && (
                  <>
                    <span className="text-slate-500">{vendor.activeUsers.toLocaleString()}</span>
                    <span className="text-yellow-400">{vendor.influencedRevenue}</span>
                  </>
                )}
                <span className="font-bold text-slate-200">{vendor.pipelineImpact}</span>
              </div>
            </div>
            
            {/* Horizontal bar */}
            <div className="flex gap-1 h-8 rounded overflow-hidden">
              {vendor.barSegments.map((segment, segIdx) => (
                <div
                  key={segIdx}
                  className={segment.color}
                  style={{ width: `${(segment.value / maxValue) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
        
        <div className="text-center text-xs text-slate-400 mt-4">
          → +274 active users (end of period)
        </div>
      </div>
    </div>
  );
}

function ProductivityGainedSection() {
  const { productivity } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Productivity Gained</h2>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Asset Reuse Rate */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                className="text-cyan-400"
                strokeDasharray={`${2 * Math.PI * 40 * 0.57} ${2 * Math.PI * 40}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">57%</span>
            </div>
          </div>
          <div className="text-sm font-medium">Asset Reuse Rate</div>
          <div className="text-xs text-slate-400 mt-1">🌊 Coast</div>
        </div>

        {/* Average Prep Time */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                className="text-yellow-400"
                strokeDasharray={`${2 * Math.PI * 40 * 0.65} ${2 * Math.PI * 40}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">+65%</span>
            </div>
          </div>
          <div className="text-sm font-medium">Average Prep Time</div>
          <div className="text-xs text-slate-400 mt-1">or 9.6 or ★</div>
        </div>

        {/* Automation Deflection */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
              <circle 
                cx="48" 
                cy="48" 
                r="40" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                className="text-blue-400"
                strokeDasharray={`${2 * Math.PI * 40 * 0.86} ${2 * Math.PI * 40}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-6 h-6 mx-auto mb-1" />
              </div>
            </div>
          </div>
          <div className="text-lg font-bold text-cyan-300">{productivity.automationDeflection.value}</div>
          <div className="text-xs text-slate-400">{productivity.automationDeflection.unit}</div>
          <div className="text-xs text-slate-500 mt-1">{productivity.automationDeflection.note}</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="text-2xl font-bold">86%</div>
        <div className="text-xs text-slate-400">Automation Deflection</div>
        <div className="text-xs text-slate-500 mt-1">{productivity.automationDeflection.aiNote}</div>
      </div>
    </div>
  );
}

function PlatformAdoptionSection() {
  const { platformAdoption } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Platform Adoption</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {platformAdoption.map((platform, idx) => (
          <div key={idx} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{platform.logo}</span>
              <span className="font-medium">{platform.name}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{platform.users}</div>
            <div className="text-xs text-green-400 mb-2">{platform.growth}</div>
            <div className="space-y-1">
              <div className="text-lg font-bold">{platform.utilization}%</div>
              <div className="text-xs text-slate-400">UTILIZATION</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorOverviewSection() {
  const { vendorOverview } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Vendor Overview</h2>
      
      <div className="grid grid-cols-4 gap-4">
        {vendorOverview.map((vendor, idx) => (
          <div key={idx} className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-4xl mb-3">{vendor.logo}</div>
            <div className="font-bold mb-1">{vendor.name}</div>
            <div className="text-xs text-slate-400">{vendor.tagline}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnitEconomicsSection() {
  const { unitEconomics } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Unit Economics</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Cost Per Demo Executed</span>
          <span className="font-bold">{unitEconomics.costPerDemo}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Cost Per License</span>
          <span className="font-bold">{unitEconomics.costPerLicense}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Cost Per Demo Asset</span>
          <span className="font-bold">{unitEconomics.costPerDemoAsset}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-sm text-slate-300">Cost Per Dollar Influenced Win</span>
          <span className="font-bold text-green-400">{unitEconomics.costPerDollarInfluencedWin}</span>
        </div>
      </div>
    </div>
  );
}

function SalesImpactSection() {
  const { salesImpact } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Sales Impact</h2>
      
      {/* Horizontal bars */}
      <div className="space-y-3 mb-4">
        <div className="space-y-1">
          <div className="h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded" />
          <div className="text-right text-sm font-bold">{salesImpact.influencedPipeline}</div>
        </div>
        <div className="space-y-1">
          <div className="h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded" style={{ width: '34%' }} />
          <div className="text-right text-sm font-bold">{salesImpact.influencedWins}</div>
        </div>
      </div>

      <div className="text-center pt-3 border-t border-white/10">
        <div className="text-sm text-slate-300 mb-1">Win Rate</div>
        <div className="flex items-baseline justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-2xl font-bold text-green-400">{salesImpact.winRate.value}</span>
          <span className="text-sm text-slate-400">{salesImpact.winRate.unit}</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">{salesImpact.winRate.note}</div>
      </div>
    </div>
  );
}

function KeyStatsSection() {
  const { keyStats } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Key Pivoting Stats:</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {keyStats.slice(0, 2).map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="text-center p-3 bg-white/5 rounded-lg">
              <Icon className={`w-5 h-5 mx-auto mb-2 text-${stat.color}-400`} />
              <div className="text-lg font-bold">{stat.value}</div>
              {stat.badge && <div className="text-xs text-slate-400 mt-1">{stat.badge}</div>}
              {stat.note && <div className="text-xs text-slate-500 mt-1">{stat.note}</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        {keyStats.slice(2).map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white/5 rounded">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-slate-300">{stat.label}</span>
              </div>
              <span className="font-bold">{stat.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecutiveOutlookSection() {
  const { executiveOutlook } = MULTI_VENDOR_DATA;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-4">Executive Outlook</h2>
      
      <ul className="space-y-2 text-sm text-slate-300">
        {executiveOutlook.map((item, idx) => (
          <li key={idx} className="flex gap-2">
            <span className="text-cyan-400">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
