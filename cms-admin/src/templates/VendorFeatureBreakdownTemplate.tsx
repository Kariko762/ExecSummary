import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Workflow, 
  Layers, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Zap,
  ChevronRight
} from 'lucide-react';

// Vendor feature breakdown data structure matching Coast image exactly
const VENDOR_FEATURE_DATA = {
  metadata: {
    vendorName: 'coast',
    title: 'API Product Storytelling for Modern GTM',
    subtitle: 'Turning complex technical products into scalable buyer experiences'
  },
  whatCoastDoes: {
    title: 'What Coast Does',
    description: 'Coast is an API Product Storytelling Platform that transforms backend and technical systems into interactive, visual, buyer-ready product experiences.',
    features: [
      { icon: Eye, text: 'Visualize APIs & Workflows' },
      { icon: Workflow, text: 'Orchestrate Technical Journeys' },
      { icon: Layers, text: 'Scale Interactive Product Demos' },
      { icon: MessageSquare, text: 'Tell Clear Technical Value Stories' }
    ],
    tagline: 'Turn backend complexity into GTM velocity',
    badges: [
      { text: 'Eon' },
      { text: 'Scalable/Reusable' },
      { text: 'Engineering-Free' }
    ],
    footer: 'Turn backend complexity into GTM velocity'
  },
  coreProblem: {
    title: 'The Core GTM Problem Coast Solves',
    subtitle: 'Modern B2B products are increasingly:',
    challenges: ['API-first', 'Integration-driven', 'Workflow-centric', 'Backend-heavy'],
    resultingProblems: {
      title: 'Resulting Business Problems',
      issues: [
        'Technical value is hard to see',
        'Demos are slow and expensive to build',
        'SEs become demo engineers',
        'Sales cycles drag and stall'
      ]
    }
  },
  whyLeadersMove: {
    title: 'Why GTM Leaders Move to Demo Platforms',
    subtitle: 'Coast is the next-gen platform for modern GTM challenges.',
    challenges: [
      { icon: CheckCircle, text: 'API-first Products' },
      { icon: XCircle, text: 'Demo Bottlenecks' },
      { icon: XCircle, text: 'Differentiation Needs' },
      { icon: XCircle, text: 'Longer Sales Cycles' }
    ],
    stat: {
      value: '79%',
      text: 'of B2B buyers want to self-educate on product deeply before engaging sales.',
      source: 'Forrester 2324'
    },
    circles: [
      { value: '81%', label: 'say issues visualizing value slow deals', source: 'G2 Buyer/Vendor' },
      { value: '71%', label: 'see carla speed challenge with custom demos', source: 'G2 AoR experience' }
    ]
  },
  gtmSupport: {
    title: 'Coast Supports Your GTM Motion',
    columns: [
      {
        icon: TrendingUp,
        title: 'Sales Teams',
        items: ['Interactive Technical Demos', 'Scale Playbooks', 'Enablement Builds']
      },
      {
        icon: Users,
        title: 'Solution Engineers',
        items: ['Configurable Win-a-Deal', 'Integration APIs', 'Morrow Processing']
      }
    ]
  },
  buyerDemands: {
    title: 'The Modern B2B Buyer Demands',
    columns: [
      {
        icon: TrendingUp,
        title: 'Sales Teams',
        items: ['Interactive Technical Demos', 'Sales Room Builds', 'Engineering-Free Wiring']
      },
      {
        icon: Users,
        title: 'Marketing',
        items: ['Self-Service Industry Narratives', 'Reusable Placemats Addressers', 'Personalized Sharing-flow']
      },
      {
        icon: Users,
        title: 'Self-Serve Users',
        items: ['Hands-On Sandbox Experiences', 'Interactive demos', 'Speed up GTM by 20%+']
      }
    ]
  },
  totalImpact: {
    title: 'Total GTM Impact',
    metrics: [
      { value: '47', unit: 'days', label: 'faster sales cycles' },
      { value: '1,610', unit: 'h', label: 'SE & sales engineering time saved' },
      { value: '79%', label: 'of B2B buyers want more interactive, self-service options pre-sale' },
      { value: '58%', label: 'Say a technical demo is the most important sales touchpoint' }
    ]
  }
};

export default function VendorFeatureBreakdownTemplate() {
  return (
    <div className="min-h-screen bg-[#1a2332] text-white p-6">
      {/* Header */}
      <VendorHeader />

      {/* Top 3 Columns */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <WhatCoastDoesSection />
        <CoreProblemSection />
        <WhyLeadersMoveSection />
      </div>

      {/* GTM Support Section */}
      <GTMSupportSection />

      {/* Buyer Demands Section */}
      <BuyerDemandsSection />

      {/* Total Impact Section */}
      <TotalImpactSection />
    </div>
  );
}

function VendorHeader() {
  const { metadata } = VENDOR_FEATURE_DATA;
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <h1 className="text-2xl font-bold text-white">{metadata.vendorName}</h1>
        <div className="h-6 w-px bg-slate-600 mx-1" />
        <h2 className="text-xl font-light text-slate-300">{metadata.title}</h2>
      </div>
      <p className="text-slate-400 text-xs ml-11">{metadata.subtitle}</p>
    </div>
  );
}

function WhatCoastDoesSection() {
  const { whatCoastDoes } = VENDOR_FEATURE_DATA;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-base font-bold mb-2 text-cyan-400">{whatCoastDoes.title}</h3>
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{whatCoastDoes.description}</p>

      <div className="space-y-2 mb-3">
        {whatCoastDoes.features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-xs text-slate-200">{feature.text}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-700">
        <p className="text-xs text-cyan-400 italic mb-2">{whatCoastDoes.tagline}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {whatCoastDoes.badges.map((badge, idx) => (
            <div key={idx} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600">
              {badge.text}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
        <p className="text-xs font-medium text-cyan-300 text-center">{whatCoastDoes.footer}</p>
      </div>
    </div>
  );
}

function CoreProblemSection() {
  const { coreProblem } = VENDOR_FEATURE_DATA;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-base font-bold mb-2 text-orange-400">{coreProblem.title}</h3>
      <p className="text-xs text-slate-300 mb-2">{coreProblem.subtitle}</p>

      <ul className="space-y-1 mb-3">
        {coreProblem.challenges.map((challenge, idx) => (
          <li key={idx} className="text-xs text-slate-200 flex items-center gap-2">
            <span className="w-1 h-1 bg-orange-400 rounded-full" />
            {challenge}
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-slate-700">
        <h4 className="text-xs font-bold mb-2 text-orange-400">{coreProblem.resultingProblems.title}</h4>
        <div className="space-y-1.5">
          {coreProblem.resultingProblems.issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <XCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-slate-300">{issue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhyLeadersMoveSection() {
  const { whyLeadersMove } = VENDOR_FEATURE_DATA;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-base font-bold mb-2 text-purple-400">{whyLeadersMove.title}</h3>
      <p className="text-xs text-slate-300 mb-2">{whyLeadersMove.subtitle}</p>

      <div className="space-y-1 mb-3">
        {whyLeadersMove.challenges.map((challenge, idx) => {
          const Icon = challenge.icon;
          return (
            <div key={idx} className="flex items-center gap-1.5">
              <Icon className={`w-3 h-3 ${Icon === CheckCircle ? 'text-green-400' : 'text-red-400'}`} />
              <span className="text-xs text-slate-200">{challenge.text}</span>
            </div>
          );
        })}
      </div>

      {/* Large Statistic */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 mb-3">
        <div className="text-4xl font-bold text-purple-300 mb-1">{whyLeadersMove.stat.value}</div>
        <p className="text-xs text-slate-300 leading-snug mb-1">{whyLeadersMove.stat.text}</p>
        <p className="text-xs text-slate-500">{whyLeadersMove.stat.source}</p>
      </div>

      {/* Circular Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {whyLeadersMove.circles.map((circle, idx) => (
          <div key={idx} className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-1.5">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-700" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                  className="text-purple-400"
                  strokeDasharray={`${2 * Math.PI * 28 * (parseInt(circle.value) / 100)} ${2 * Math.PI * 28}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-purple-300">{circle.value}</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-tight mb-0.5">{circle.label}</p>
            <p className="text-xs text-slate-500">{circle.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GTMSupportSection() {
  const { gtmSupport } = VENDOR_FEATURE_DATA;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
      <h3 className="text-base font-bold mb-3 text-blue-400">{gtmSupport.title}</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {gtmSupport.columns.map((col, idx) => {
          const Icon = col.icon;
          return (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-slate-200">{col.title}</h4>
              </div>
              <ul className="space-y-1">
                {col.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuyerDemandsSection() {
  const { buyerDemands } = VENDOR_FEATURE_DATA;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
      <h3 className="text-base font-bold mb-3 text-green-400">{buyerDemands.title}</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {buyerDemands.columns.map((col, idx) => {
          const Icon = col.icon;
          return (
            <div key={idx} className="bg-slate-700/30 rounded p-3 border border-slate-600">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-bold text-slate-200">{col.title}</h4>
              </div>
              <ul className="space-y-1">
                {col.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="w-1 h-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TotalImpactSection() {
  const { totalImpact } = VENDOR_FEATURE_DATA;
  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-bold mb-4 text-cyan-400">{totalImpact.title}</h3>
        
        <div className="grid grid-cols-4 gap-4">
          {totalImpact.metrics.map((metric, idx) => (
            <div key={idx} className="text-center">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-cyan-300">{metric.value}</span>
                {metric.unit && <span className="text-lg text-slate-400">{metric.unit}</span>}
              </div>
              <p className="text-xs text-slate-300 leading-tight">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-lg p-4 border border-cyan-500/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-cyan-300">Ready to Transform Your Technical GTM?</h4>
          </div>
          <p className="text-xs text-slate-300 mb-3">Talk to us about how Coast can be your strategic partner for API-first GTM success.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded font-bold text-white text-sm flex items-center justify-center gap-2"
          >
            CONTINUE
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/40">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-purple-300">Ready to Transform Your Technical GTM?</h4>
          </div>
          <p className="text-xs text-slate-300 mb-3">Talk to us about how Coast can be your strategic partner for API-first GTM success.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded font-bold text-white text-sm flex items-center justify-center gap-2"
          >
            CONTINUE
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </>
  );
}
