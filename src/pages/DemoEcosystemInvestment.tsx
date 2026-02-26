import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Zap, BarChart3, CheckCircle2, ArrowRight, Sparkles, Video, MousePointer, Grid3x3, Crown } from 'lucide-react';

const DemoEcosystemInvestment: React.FC = () => {
  return (
    <>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            background: white !important;
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
          
          /* Page breaks */
          .print\\:break-before {
            page-break-before: always;
            break-before: page;
          }
          
          .print\\:break-after {
            page-break-after: always;
            break-after: page;
          }
          
          .print\\:break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Remove shadows and effects for cleaner print */
          .shadow-lg, .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }
          
          .backdrop-blur-sm {
            backdrop-filter: none !important;
          }
          
          .transition-all, .hover\\:border-green-500\\/50, .hover\\:border-purple-500\\/50,
          .hover\\:border-blue-500\\/50, .hover\\:border-slate-600\\/50,
          .hover\\:border-\\[\\#4bcd3e\\]\\/50, .hover\\:border-\\[\\#4bcd3e\\]\\/70 {
            transition: none !important;
          }
          
          /* Ensure borders are visible */
          .border {
            border-width: 1px !important;
          }
          
          /* Optimize spacing for print */
          .py-6 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          .px-4 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          .mb-6 {
            margin-bottom: 0.75rem !important;
          }
          
          .gap-3, .gap-4 {
            gap: 0.5rem !important;
          }
          
          /* Make gradients solid for print */
          .bg-gradient-to-br,
          .bg-gradient-to-r {
            background: #1a1a2e !important;
          }
          
          /* Ensure text is readable */
          .text-transparent {
            background-clip: text !important;
            -webkit-background-clip: text !important;
          }
          
          /* Print-friendly colors */
          .bg-gray-900, .bg-slate-900 {
            background-color: #1a1a2e !important;
          }
          
          /* Reduce excessive whitespace */
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-fis-navy to-fis-eggplant py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-roobert-semibold mb-3">
            <Sparkles className="w-3 h-3" />
            Strategic Investment Proposal
          </div>
          
          <h1 className="text-3xl md:text-4xl font-roobert-heavy mb-2 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400 bg-clip-text text-transparent">
            Demo Technology Ecosystem
          </h1>
          
          <p className="text-base md:text-lg font-roobert-medium text-white mb-3">
            Transforming Demo Operations into a Unified Sales Engine
          </p>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-sm font-roobert-light text-gray-300 leading-relaxed">
              Scale our integrated demo technology ecosystem from isolated, LoB-driven implementations into an enterprise-grade, 
              AI-powered sales acceleration platform that reaches buyers earlier, reduces cycles, and standardizes storytelling across FIS.
            </p>
          </div>
        </motion.div>

        {/* Investment Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 print:break-inside-avoid"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 hover:border-purple-500/50 transition-all print:break-inside-avoid">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-roobert-bold mb-1 text-white">
              $483K+
            </div>
            <div className="text-xs font-roobert-medium text-gray-400">
              Total Investment
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 hover:border-green-500/50 transition-all print:break-inside-avoid">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-roobert-bold mb-1 text-green-400">
              10-20%
            </div>
            <div className="text-xs font-roobert-medium text-gray-400">
              Cycle Reduction Target
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 hover:border-blue-500/50 transition-all print:break-inside-avoid">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-roobert-bold mb-1 text-blue-400">
              510+
            </div>
            <div className="text-xs font-roobert-medium text-gray-400">
              License Expansion
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-2">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="text-xl font-roobert-bold mb-1 text-white">
              1 FTE
            </div>
            <div className="text-xs font-roobert-medium text-gray-400">
              Demo Enablement Lead
            </div>
          </div>
        </motion.div>

        {/* Strategic Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 rounded-xl p-4 md:p-6 mb-6 text-white shadow-2xl border border-white/10 print:break-inside-avoid"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-roobert-heavy">The Unified Vision</h2>
          </div>
          
          <p className="text-sm font-roobert-light leading-relaxed mb-3 text-white/90">
            We are transitioning from standalone demo tools to a single, unified, narrative-driven sales engine. 
            By integrating Coast, Synthesia, and Tiled, we enable:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-roobert-semibold text-sm mb-0.5">Self-Guided Buyer Journeys</div>
                <div className="text-xs text-white/80 font-roobert-light">On-demand content before first meetings</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-roobert-semibold text-sm mb-0.5">Embedded Video Explainers</div>
                <div className="text-xs text-white/80 font-roobert-light">Inside interactive demo experiences</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-roobert-semibold text-sm mb-0.5">Digital Sales Rooms</div>
                <div className="text-xs text-white/80 font-roobert-light">Throughout entire opportunity lifecycle</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-roobert-semibold text-sm mb-0.5">Consistent Storytelling</div>
                <div className="text-xs text-white/80 font-roobert-light">Reusable across all business units</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 print:break-inside-avoid">
          {/* Coast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/10 hover:border-slate-600/50 transition-all print:break-inside-avoid"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-3">
              <MousePointer className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-lg font-roobert-bold mb-2 text-white">
              Coast
            </h3>
            
            <div className="mb-3">
              <div className="text-xs font-roobert-semibold text-gray-400 mb-1">THE ENGINE</div>
              <div className="text-xl font-roobert-heavy mb-1 text-slate-400">
                $200K
              </div>
              <div className="text-xs font-roobert-light text-gray-400">
                20 Additional Demos or Enterprise Agreement
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-slate-400">Solo Capabilities</div>
                <ul className="space-y-1 text-xs font-roobert-light text-gray-300">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-500" />
                    <span>Clickable guided demos showing real workflows</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-500" />
                    <span>Deal-specific builds for major pursuits</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-500" />
                    <span>AI-generated demo data</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-[#4bcd3e]">Integrated Use</div>
                <ul className="space-y-1 text-xs font-roobert-light text-gray-300">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Embed Synthesia videos inside flows</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Package into Tiled microsites</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Narrative-driven demo experiences</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-roobert-semibold text-gray-400 uppercase tracking-wide mb-1">
                Current State
              </div>
              <div className="text-xs font-roobert-light text-gray-300">
                2026: $783,740 across pre-sales (Banking-heavy)<br/>
                2027: $1,033,740 minimum (TSYS acquisition impact)
              </div>
            </div>
          </motion.div>

          {/* Synthesia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/10 hover:border-purple-500/50 transition-all print:break-inside-avoid"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-lg font-roobert-bold mb-2 text-white">
              Synthesia
            </h3>
            
            <div className="mb-3">
              <div className="text-xs font-roobert-semibold text-gray-400 mb-1">THE STORYTELLER</div>
              <div className="text-xl font-roobert-heavy mb-1 text-purple-400">
                $129.6K
              </div>
              <div className="text-xs font-roobert-light text-gray-400">
                60 Additional Licenses (40 → 100)
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-purple-400">Solo Capabilities</div>
                <ul className="space-y-1 text-xs font-roobert-light text-gray-300">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                    <span>Follow-up videos reinforcing outcomes</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                    <span>Sales leave-behinds as product explainers</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                    <span>Multilingual localization</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-[#4bcd3e]">Integrated Use</div>
                <ul className="space-y-1 text-xs font-roobert-light text-gray-300">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Embedded video moments in Coast</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Video-led introductions in Tiled hubs</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>24/7 autonomous digital selling</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-roobert-semibold text-gray-400 uppercase tracking-wide mb-1">
                Allocation
              </div>
              <div className="text-xs font-roobert-light text-gray-300">
                Banking NA: 10 • International: 15<br/>
                Capital Markets: 60 • Payments: 10<br/>
                RevOps/Enablement: 5
              </div>
            </div>
          </motion.div>

          {/* Tiled */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-slate-900/50 via-gray-900/40 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/20 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-3">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            
            <h3 className="text-lg font-roobert-bold mb-2 text-white">
              Tiled
            </h3>
            
            <div className="mb-3">
              <div className="text-xs font-roobert-semibold text-gray-400 mb-1">THE CONTAINER</div>
              
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-roobert-light text-gray-400">Tiled (320 licenses)</div>
                  <div className="text-sm font-roobert-semibold text-white">$32.6K</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-roobert-light text-gray-400">Figma (10 licenses)</div>
                  <div className="text-sm font-roobert-semibold text-white">$11K</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#4bcd3e]/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-roobert-bold text-white">Total</div>
                  <div className="text-xl font-roobert-heavy text-white">$43.6K</div>
                </div>
                <div className="text-xs font-roobert-light text-[#4bcd3e] mt-1">
                  Designs and Controls Tiled Master Templates
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-slate-400">Solo Capabilities</div>
                <ul className="space-y-1 text-xs font-roobert-light text-white">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Pre-meeting digital packs</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Interactive proposal/POV hubs</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Engagement analytics tracking</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-roobert-semibold text-xs mb-1 text-[#4bcd3e]">Integrated Use</div>
                <ul className="space-y-1 text-xs font-roobert-light text-gray-300">
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Coast demos embedded in microsites</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Synthesia greetings guide customers</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#4bcd3e]" />
                    <span>Shareable buying experiences</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-roobert-semibold text-gray-400 uppercase tracking-wide mb-1">
                Allocation
              </div>
              <div className="text-xs font-roobert-light text-gray-300">
                All Pre-Sales teams receive access
              </div>
            </div>
          </motion.div>
        </div>

        {/* Demo Enablement Lead */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-xl p-4 shadow-xl border-2 border-[#4bcd3e]/50 mb-6 hover:border-[#4bcd3e]/70 transition-all print:break-inside-avoid"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-roobert-bold text-white">
                  Demo Enablement Lead
                </h3>
                <span className="px-2 py-0.5 bg-purple-500/20 rounded-full text-xs font-roobert-semibold text-purple-400">
                  1 FTE • $110,000
                </span>
              </div>
              
              <p className="text-xs font-roobert-light text-gray-300 mb-3 leading-relaxed">
                The strategic glue ensuring ecosystem scalability. This role provides governance, quality control, 
                demo standards alignment, and coordinates workflows across GTM, Sales, and Product teams.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-400" />
                  <div className="text-xs">
                    <div className="font-roobert-semibold text-white">Governance & Quality</div>
                    <div className="font-roobert-light text-gray-400">Standards and templates</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-400" />
                  <div className="text-xs">
                    <div className="font-roobert-semibold text-white">Integration Management</div>
                    <div className="font-roobert-light text-gray-400">Coast + Synthesia + Tiled workflows</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-400" />
                  <div className="text-xs">
                    <div className="font-roobert-semibold text-white">Cross-Team Coordination</div>
                    <div className="font-roobert-light text-gray-400">GTM, Sales, Product alignment</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-400" />
                  <div className="text-xs">
                    <div className="font-roobert-semibold text-white">Strategy Ownership</div>
                    <div className="font-roobert-light text-gray-400">Global "Demo Enabled" vision</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/10 mb-6 print:break-inside-avoid"
        >
          <h3 className="text-lg font-roobert-bold mb-3 text-white">
            Investment Breakdown
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
              <div className="flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-roobert-semibold text-xs text-white">Coast Expansion</div>
                  <div className="text-xs font-roobert-light text-gray-400">20 additional demos or enterprise agreement</div>
                </div>
              </div>
              <div className="text-sm font-roobert-bold text-slate-400">
                $200,000+
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-roobert-semibold text-xs text-white">Synthesia Expansion</div>
                  <div className="text-xs font-roobert-light text-gray-400">+60 licenses (40 → 100)</div>
                </div>
              </div>
              <div className="text-sm font-roobert-bold text-purple-400">
                $129,600
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-700/10 rounded-lg border border-slate-600/30 hover:border-[#4bcd3e]/50 transition-all">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-roobert-semibold text-xs text-white">Tiled Expansion</div>
                  <div className="text-xs font-roobert-light text-gray-400">+320 licenses (80 → 400)</div>
                </div>
              </div>
              <div className="text-sm font-roobert-bold text-white">
                $32,640
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-700/10 rounded-lg border border-slate-600/30 hover:border-[#4bcd3e]/50 transition-all ml-6">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-[#4bcd3e]" />
                <div>
                  <div className="font-roobert-semibold text-xs text-slate-300">Figma for Tiled</div>
                  <div className="text-xs font-roobert-light text-gray-400">Designs and Controls Tiled Master Templates</div>
                </div>
              </div>
              <div className="text-sm font-roobert-bold text-slate-300">
                $11,000
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-700/10 rounded-lg border-2 border-slate-600/50 hover:border-[#4bcd3e]/70 transition-all">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-roobert-semibold text-xs text-white">Demo Enablement Lead</div>
                  <div className="text-xs font-roobert-light text-gray-400">1 FTE - Governance & Integration</div>
                </div>
              </div>
              <div className="text-sm font-roobert-bold text-white">
                $110,000
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-lg border-2 border-[#4bcd3e]/50 mt-2 hover:border-[#4bcd3e]/70 transition-all">
              <div className="font-roobert-bold text-sm text-white">
                Total Investment
              </div>
              <div className="text-xl font-roobert-heavy text-white">
                $483,240+
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/10 mb-6 print:break-inside-avoid"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-roobert-bold text-white">
              Success Metrics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-green-500/10 backdrop-blur-sm rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all">
              <div className="text-xs font-roobert-semibold text-green-400 uppercase tracking-wide mb-1">
                Adoption & Usage
              </div>
              <div className="space-y-1 text-xs font-roobert-light text-gray-300">
                <div>• 70%+ active usage</div>
                <div>• Template circulation</div>
                <div>• Share rate metrics</div>
              </div>
            </div>

            <div className="p-3 bg-slate-700/10 backdrop-blur-sm rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all">
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Buyer Engagement
              </div>
              <div className="space-y-1 text-xs font-roobert-light text-gray-300">
                <div>• Time-on-demo</div>
                <div>• Video playthrough rates</div>
                <div>• Repeat visitor %</div>
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 backdrop-blur-sm rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all">
              <div className="text-xs font-roobert-semibold text-purple-400 uppercase tracking-wide mb-1">
                Sales Impact
              </div>
              <div className="space-y-1 text-xs font-roobert-light text-gray-300">
                <div>• 10-20% cycle reduction</div>
                <div>• Conversion uplift</div>
                <div>• Win-rate improvement</div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 backdrop-blur-sm rounded-lg border border-amber-500/30 hover:border-amber-400/50 transition-all">
              <div className="text-xs font-roobert-semibold text-amber-400 uppercase tracking-wide mb-1">
                Operational Efficiency
              </div>
              <div className="space-y-1 text-xs font-roobert-light text-gray-300">
                <div>• Hours saved</div>
                <div>• Asset reuse rate</div>
                <div>• Reduced support needs</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Closing Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 rounded-xl p-6 text-center text-white shadow-2xl border border-white/10"
        >
          <Target className="w-8 h-8 mx-auto mb-3 text-white" />
          
          <h2 className="text-xl font-roobert-heavy mb-2">
            Transforming Demo Operations
          </h2>
          
          <p className="text-sm font-roobert-light leading-relaxed max-w-4xl mx-auto text-white/90 mb-4">
            This investment transforms our demo approach from isolated, resource-heavy tool usage into a unified, 
            AI-powered, globally consistent ecosystem that reaches buyers earlier, reduces sales cycles, 
            increases conversion, scales without additional headcount, and standardizes product storytelling across FIS.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="font-roobert-semibold text-xs">Earlier Buyer Engagement</span>
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="font-roobert-semibold text-xs">Faster Sales Cycles</span>
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="font-roobert-semibold text-xs">Higher Conversion</span>
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="font-roobert-semibold text-xs">Global Consistency</span>
            </div>
          </div>
        </motion.div>

        {/* The Research Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-6 print:break-before print:break-inside-avoid"
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-roobert-heavy mb-1 text-white">
              The Research
            </h2>
            <p className="text-sm font-roobert-light text-gray-300">
              Data-driven insights on interactive demos and digital-first strategies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:break-inside-avoid">
            {/* Stat Card 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                68%
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Faster Purchase Decisions
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                Buyers who engage with interactive demos make purchase decisions 68% faster than those following traditional sales cycles
              </p>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                3.2x
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Higher Win Rates
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                Sales teams using digital buyers guides achieve 3.2x higher win rates compared to traditional demo approaches
              </p>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                54%
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Earlier Engagement
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                Interactive content reaches buyers 54% earlier in their journey, before competitors enter the conversation
              </p>
            </motion.div>

            {/* Stat Card 4 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                89%
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Self-Service Preference
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                B2B buyers prefer self-service demos and digital content over scheduled sales calls during early research
              </p>
            </motion.div>

            {/* Stat Card 5 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                40%
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Cycle Time Reduction
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                Companies implementing digital-first demo strategies report 30-40% reduction in average sales cycle duration
              </p>
            </motion.div>

            {/* Stat Card 6 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6 }}
              className="bg-gradient-to-br from-slate-900/30 via-gray-900/20 to-slate-900/30 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/10 hover:border-[#4bcd3e]/50 transition-all print:break-inside-avoid"
            >
              <div className="text-3xl font-roobert-heavy text-[#4bcd3e] mb-1">
                4.8x
              </div>
              <div className="text-xs font-roobert-semibold text-slate-400 uppercase tracking-wide mb-1">
                Stakeholder Reach
              </div>
              <p className="text-xs font-roobert-light text-gray-300 leading-relaxed">
                Interactive demos shared internally reach 4.8x more stakeholders than live demos, accelerating consensus building
              </p>
            </motion.div>
          </div>

          {/* Research Source Attribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.7 }}
            className="mt-3 text-center"
          >
            <p className="text-xs font-roobert-light text-gray-500 italic">\n              Sources: Gartner Digital Buying Research 2023-2024, Forrester B2B Buying Journey Study, 
              SiriusDecisions Demand Generation Benchmark Report, Consensus Sales Velocity Study
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default DemoEcosystemInvestment;
