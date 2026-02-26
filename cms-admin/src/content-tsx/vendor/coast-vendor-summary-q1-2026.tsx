import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, TrendingUp, Clock, Target, Zap, HelpCircle, X, Download, Loader2 } from 'lucide-react';
import contentData from '../../../../backend/data/content/vendor/coast-vendor-summary-q1-2026.json';
import { domToPng } from 'modern-screenshot';

// Export metadata for ContentEditor
export const CONTENT_META = contentData.meta;

// Props interface
interface VendorOverviewProps {
  data?: typeof contentData;
  editMode?: boolean;
  onSave?: (data: any) => void;
}

// Main Component
export default function CoastVendorSummary({ data = contentData, editMode = false, onSave }: VendorOverviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    
    try {
      const scrollableDiv = contentRef.current;
      
      const originalStyles = {
        overflow: scrollableDiv.style.overflow,
        maxHeight: scrollableDiv.style.maxHeight,
        height: scrollableDiv.style.height,
      };
      
      scrollableDiv.style.overflow = 'visible';
      scrollableDiv.style.maxHeight = 'none';
      scrollableDiv.style.height = 'auto';
      
      await new Promise(resolve => setTimeout(resolve, 200));

      const captureOptions = {
        scale: 2,
        backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        width: scrollableDiv.scrollWidth,
        height: scrollableDiv.scrollHeight,
      };

      const dataUrl = await domToPng(scrollableDiv, captureOptions);

      scrollableDiv.style.overflow = originalStyles.overflow;
      scrollableDiv.style.maxHeight = originalStyles.maxHeight;
      scrollableDiv.style.height = originalStyles.height;

      const link = document.createElement('a');
      link.download = `coast-vendor-overview-${new Date().toISOString().split('T')[0]}.png`;
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
    <div ref={contentRef} className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <VendorOverviewHeader data={data.metadata} onExport={handleExportImage} isExporting={isExporting} />
        
        {/* Hero Metrics */}
        <HeroMetrics data={data.heroMetrics} />
        
        {/* Storytelling Index */}
        <StorytellingIndex data={data.storytellingIndex} />
        
        {/* Feature Cards */}
        <FeatureCards data={data.featureCards} />
        
        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-6">
          <ProblemsSolved data={data.problemsSolved} />
          <GTMHighlights data={data.gtmHighlights} />
        </div>
      </div>
    </div>
  );
}

// Header Component
function VendorOverviewHeader({ data, onExport, isExporting }: { 
  data: typeof contentData.metadata,
  onExport?: () => void,
  isExporting?: boolean 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img 
          src="/vendor-logos/Coast.png" 
          alt="Coast" 
          className="h-12 w-auto object-contain"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-roobert-medium text-white">{data.title}</div>
        </div>
        <button
          onClick={onExport}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
          title="Export as Image"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

// Hero Metrics Component
function HeroMetrics({ data }: { data: typeof contentData.heroMetrics }) {
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
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${metric.iconColor}`} />
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
function StorytellingIndex({ data }: { data: typeof contentData.storytellingIndex }) {
  const [showIndexInfoModal, setShowIndexInfoModal] = useState(false);

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-roobert-bold text-white tracking-wide">
              {data.title}
            </h3>
            <button
              onClick={() => setShowIndexInfoModal(true)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors group"
              title="How is the Storytelling Index calculated?"
            >
              <HelpCircle className="w-4 h-4 text-white/50 group-hover:text-cyan-400 transition-colors" />
            </button>
          </div>
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
            <div className="text-[11px] font-roobert-light text-white/70 leading-tight">
              {segment.name}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs font-roobert-light text-white/60 leading-relaxed">
        * {data.subtitle}
      </p>
    </div>

      {/* Storytelling Index Info Modal */}
      <AnimatePresence>
        {showIndexInfoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden border border-white/10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-600/20 to-blue-600/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-roobert-bold text-white">Storytelling Index Calculation</h2>
                </div>
                <button
                  onClick={() => setShowIndexInfoModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Introduction */}
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h3 className="text-base font-roobert-bold text-white mb-3">What is the API Product Storytelling Index?</h3>
                  <p className="text-sm text-white/70 font-roobert-light leading-relaxed">
                    The Storytelling Index measures how effectively a vendor enables teams to communicate complex backend 
                    and API capabilities through interactive, realistic product demonstrations. The index evaluates 7 key 
                    dimensions of demo quality and sales impact, with scores ranging from <span className="text-cyan-400 font-roobert-medium">0-100</span>.
                  </p>
                </div>

                {/* The 7 Segments */}
                <div className="space-y-4">
                  <h3 className="text-base font-roobert-bold text-white">The 7 Index Components</h3>
                  
                  <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-cyan-400 mb-2">1. Demo Realism</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      How accurately demos simulate real API behavior, data flows, and backend processes. Measured by 
                      technical depth, data authenticity, and workflow completeness.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-blue-400 mb-2">2. Pre-Sales Efficiency</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Time savings for sales engineers through reusable demo environments, pre-built use cases, 
                      and reduced custom demo development effort.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-purple-400 mb-2">3. Sales Engagement</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Prospect interaction quality measured by demo completion rates, time spent in demos, 
                      and follow-up meeting conversion rates.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-600/10 to-pink-500/5 border border-pink-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-pink-400 mb-2">4. Buyer Detonation</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Ability to trigger "aha moments" where prospects understand product value. Tracked through 
                      demo sharing, internal champion activation, and expansion into buyer organizations.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-600/10 to-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-orange-400 mb-2">5. Buyer Velocity</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Speed from first demo to technical validation. Measures how quickly demos move prospects 
                      through evaluation stages and reduce sales cycle length.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-yellow-400 mb-2">6. Pipeline Conversion</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Win rate improvement for opportunities where demos were used versus traditional 
                      discovery methods. Directly correlates demo quality to closed revenue.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-600/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-green-400 mb-2">7. GTM Impact</h4>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Broader go-to-market effectiveness including marketing content reuse, self-serve adoption, 
                      partner enablement, and post-sale implementation acceleration.
                    </p>
                  </div>
                </div>

                {/* Scoring Methodology */}
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h3 className="text-base font-roobert-bold text-white mb-4">How Scores Are Calculated</h3>
                  <div className="space-y-3 text-sm text-white/70 font-roobert-light leading-relaxed">
                    <p>
                      Each of the 7 components is scored independently on a 0-100 scale using a combination of:
                    </p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span><span className="text-white font-roobert-medium">Quantitative metrics</span> - Demo completion rates, time savings, win rates, cycle times</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span><span className="text-white font-roobert-medium">Usage analytics</span> - Platform adoption, demo frequency, feature utilization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span><span className="text-white font-roobert-medium">Sales feedback</span> - SE satisfaction scores, buyer feedback, ease-of-use ratings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span><span className="text-white font-roobert-medium">Revenue correlation</span> - Attribution analysis linking demos to closed deals</span>
                      </li>
                    </ul>
                    <p className="pt-2">
                      The <span className="text-cyan-400 font-roobert-medium">Overall Index Score</span> is calculated as a weighted 
                      average emphasizing buyer impact (components 3-6) over operational efficiency (1-2, 7).
                    </p>
                  </div>
                </div>

                {/* Update Frequency */}
                <div className="bg-gradient-to-br from-cyan-600/10 to-blue-600/5 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-roobert-bold text-cyan-400">Update Frequency</h4>
                  </div>
                  <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                    Index scores are recalculated <span className="text-white font-roobert-medium">monthly</span> using 
                    rolling 90-day performance data. Major vendor reviews occur quarterly with deep-dive analysis 
                    of each component's trend and recommendations for improvement.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-gray-900 to-gray-800">
                <button
                  onClick={() => setShowIndexInfoModal(false)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-roobert-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Feature Cards Component
function FeatureCards({ data }: { data: typeof contentData.featureCards }) {
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
function ProblemsSolved({ data }: { data: typeof contentData.problemsSolved }) {
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
function GTMHighlights({ data }: { data: typeof contentData.gtmHighlights }) {
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
function GTMScore({ data, pipeline }: { 
  data: typeof contentData.gtmScore,
  pipeline: typeof contentData.pipelineImpact
}) {
  const [showGTMInfoModal, setShowGTMInfoModal] = useState(false);

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded bg-purple-500/20">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-roobert-bold text-white">Total GTM Score</h3>
              <button
                onClick={() => setShowGTMInfoModal(true)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors group"
                title="How is GTM Score calculated?"
              >
                <HelpCircle className="w-4 h-4 text-white/50 group-hover:text-purple-400 transition-colors" />
              </button>
            </div>
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
            <div className="text-lg font-roobert-bold text-white">£{(pipeline.newCalls / 1000000).toFixed(1)}M</div>
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

      {/* GTM Score Info Modal */}
      <AnimatePresence>
        {showGTMInfoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden border border-white/10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-blue-600/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-roobert-bold text-white">GTM Score Calculation</h2>
                </div>
                <button
                  onClick={() => setShowGTMInfoModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Introduction */}
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h3 className="text-base font-roobert-bold text-white mb-3">What is GTM Score?</h3>
                  <p className="text-sm text-white/70 font-roobert-light leading-relaxed">
                    The GTM (Go-To-Market) Score is a composite metric that evaluates vendor performance across 
                    sales enablement, pipeline impact, and revenue generation. Scores range from <span className="text-cyan-400 font-roobert-medium">0-100</span>, 
                    with higher scores indicating stronger vendor alignment with business objectives.
                  </p>
                </div>

                {/* Calculation Components */}
                <div className="space-y-4">
                  <h3 className="text-base font-roobert-bold text-white">Score Components</h3>
                  
                  <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-roobert-bold text-cyan-400">Pipeline Influence</h4>
                      <span className="text-xs font-roobert-medium text-white/70">40% Weight</span>
                    </div>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Measures new pipeline generated through vendor tools. Calculated as: 
                      <span className="block mt-1 font-mono text-cyan-400">(New Calls ÷ Total Pipeline) × 100 × 0.40</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-roobert-bold text-blue-400">Conversion Efficiency</h4>
                      <span className="text-xs font-roobert-medium text-white/70">30% Weight</span>
                    </div>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Win rate improvement attributed to vendor capabilities:
                      <span className="block mt-1 font-mono text-blue-400">(Win Rate % ÷ Baseline Win Rate %) × 100 × 0.30</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-roobert-bold text-purple-400">License Utilization</h4>
                      <span className="text-xs font-roobert-medium text-white/70">20% Weight</span>
                    </div>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Efficiency of license deployment and adoption:
                      <span className="block mt-1 font-mono text-purple-400">(Utilized Licenses ÷ Total Licenses) × 100 × 0.20</span>
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-600/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-roobert-bold text-green-400">Revenue per License</h4>
                      <span className="text-xs font-roobert-medium text-white/70">10% Weight</span>
                    </div>
                    <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                      Cost efficiency and ROI measurement:
                      <span className="block mt-1 font-mono text-green-400">(Closed Won ÷ License Cost) × Benchmark Factor × 0.10</span>
                    </p>
                  </div>
                </div>

                {/* Score Bands */}
                <div className="bg-white/5 rounded-lg p-5 border border-white/10">
                  <h3 className="text-base font-roobert-bold text-white mb-4">Score Interpretation</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs font-roobert-bold text-green-400">
                          80-100
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-roobert-medium text-white">Excellent</div>
                        <div className="text-xs text-white/60 font-roobert-light">Continue investment, expand usage</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs font-roobert-bold text-blue-400">
                          60-79
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-roobert-medium text-white">Good</div>
                        <div className="text-xs text-white/60 font-roobert-light">Optimize utilization, maintain current level</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs font-roobert-bold text-yellow-400">
                          40-59
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-roobert-medium text-white">Review</div>
                        <div className="text-xs text-white/60 font-roobert-light">Assess value, identify improvement areas</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 text-center">
                        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs font-roobert-bold text-red-400">
                          0-39
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-roobert-medium text-white">Underperforming</div>
                        <div className="text-xs text-white/60 font-roobert-light">Immediate action required, consider alternatives</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Update Frequency */}
                <div className="bg-gradient-to-br from-orange-600/10 to-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-roobert-bold text-orange-400">Update Frequency</h4>
                  </div>
                  <p className="text-xs text-white/60 font-roobert-light leading-relaxed">
                    GTM Scores are recalculated <span className="text-white font-roobert-medium">monthly</span> using 
                    trailing 90-day performance data. Quarterly reviews include deep-dive analysis and vendor 
                    business reviews for strategic planning.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-gray-900 to-gray-800">
                <button
                  onClick={() => setShowGTMInfoModal(false)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white rounded-lg font-roobert-medium text-sm hover:opacity-90 transition-opacity"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
