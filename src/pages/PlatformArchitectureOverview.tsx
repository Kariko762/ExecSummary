import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';
import { 
  Maximize2, Minimize2, Download, Loader2, 
  Target, Rocket, CheckSquare, BarChart3, 
  Sparkles, Eye, TrendingUp, Users, Zap, Shield,
  Brain, Clock, Network, ArrowRight, ChevronDown
} from 'lucide-react';

export default function PlatformArchitectureOverview() {
  const [activeTab, setActiveTab] = useState<'platform' | 'ai'>('platform');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75); // 75vw or 95vw
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!contentRef.current || isExporting) return;
    
    setIsExporting(true);
    
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        style: {
          overflow: 'visible',
          maxHeight: 'none'
        }
      });
      
      const link = document.createElement('a');
      link.download = `platform-architecture-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const contentHierarchy = [
    {
      level: 1,
      title: 'Strategic Goals',
      icon: <Target className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'Enterprise-wide business objectives aligned to revenue growth and market competitiveness',
      capabilities: [
        '**Align** organizational priorities to Commercial Office revenue targets',
        '**Accelerate** strategic execution with real-time progress visibility',
        '**Quantify** business impact through leading and lagging indicator tracking',
        '**Drive** accountability across cross-functional teams and business units'
      ],
      aiFeatures: [
        '**AI Goal Builder Wizard** - 4-step guided creation from business challenge to structured SMART goal',
        '**Intelligent Metric Suggestions** - Recommends KPIs based on goal type and industry standards',
        '**Progress Forecasting** - Predicts completion likelihood based on linked initiative velocity'
      ]
    },
    {
      level: 2,
      title: 'Strategic Initiatives',
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'Revenue-driving programs with full budget visibility and ROI tracking',
      capabilities: [
        '**Optimize** resource allocation with Capex/Opex transparency and multi-year forecasting',
        '**Accelerate** time-to-market through visual timeline planning and dependency management',
        '**Mitigate** execution risk with proactive stakeholder engagement and change management',
        '**Scale** incrementally—publish early wins while building comprehensive program detail'
      ],
      aiFeatures: [
        '**Template Generation** - AI converts initiative brief into 14-section framework',
        '**Risk Identification** - Scans initiative details to suggest potential blockers',
        '**Resource Optimization** - Recommends staffing levels based on scope and timeline',
        '**Gantt Auto-Generation** - Creates task breakdown from initiative description'
      ]
    },
    {
      level: 3,
      title: 'Execution & Knowledge',
      icon: <CheckSquare className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      textColor: 'text-green-600 dark:text-green-400',
      description: 'Granular work tracking with knowledge capture to reduce rep ramp time and preserve sales continuity',
      capabilities: [
        '**Ensure** full traceability from strategic goals through initiatives to individual deliverables',
        '**Optimize** resource deployment with dynamic filtering by priority, owner, and business unit',
        '**Monitor** execution velocity with real-time progress tracking and milestone alerts',
        '**Preserve** sales continuity—capture decisions, context, and winning strategies to accelerate new rep onboarding'
      ],
      aiFeatures: [
        '**Smart Task Breakdown** - AI suggests subtasks and dependencies from high-level description',
        '**Priority Scoring** - Analyzes urgency, impact, and dependencies to recommend priority',
        '**Bottleneck Detection** - Identifies blocked tasks and suggests resolution paths',
        '**Notes are MANUAL** - Human-generated insights and context (no AI manipulation)'
      ]
    },
    {
      level: 4,
      title: 'Executive Intelligence',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      description: 'Board-ready insights with AI-generated BLUF (Bottom Line Up Front) for rapid strategic decision-making',
      capabilities: [
        '**Synthesize** cross-functional metrics into BLUF executive narratives with automated trend analysis',
        '**Identify** performance variances and emerging opportunities through quarter-over-quarter comparison',
        '**Communicate** strategic progress with presentation-ready visualizations and KPI dashboards',
        '**Enable** informed decision-making with PDF/PNG exports optimized for board and leadership reviews'
      ],
      aiFeatures: [
        '**AI-Generated BLUF (Bottom Line Up Front)** - Automatically creates executive summary narratives from platform data',
        '**Highlight Extraction** - Identifies key wins and achievements automatically for leadership visibility',
        '**Risk Rollup** - Surfaces critical risks from initiative and task levels into executive view',
        '**Insight Generation** - Provides data-driven recommendations for next quarter strategic priorities'
      ]
    }
  ];

  const platformBenefits = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Competitive Intelligence & Transparency',
      description: 'Real-time performance visibility enables faster response to market dynamics and competitive threats',
      metrics: [
        '**Accelerate decision velocity** with instant access to cross-functional performance data',
        '**Eliminate reporting delays**—leadership sees live dashboards, not stale weekly reports',
        '**Break organizational silos** to enable coordinated responses to market opportunities'
      ]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Driven Operational Efficiency',
      description: 'Harness emerging AI technologies to redirect leadership time from reporting to strategic action',
      metrics: [
        '**Reclaim 17+ hours weekly** per executive through AI-generated summaries and insights',
        '**Scale organizational bandwidth**—AI provides proactive risk alerts and recommendations',
        '**Reduce cost-to-serve** for executive reporting while improving quality and timeliness'
      ]
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Predictive Business Intelligence',
      description: 'Surface revenue-impacting patterns and resource constraints before they affect pipeline performance',
      metrics: [
        '**Forecast initiative delivery risk** using AI-driven predictive analytics',
        '**Prevent resource bottlenecks** with early warning signals on capacity constraints',
        '**Correlate strategic investments to business outcomes**—prove ROI on every dollar spent'
      ]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Enterprise-Wide Strategic Alignment',
      description: 'Unified platform ensures Sales, PreSales, and Commercial teams operate from single source of truth',
      metrics: [
        '**Eliminate version control chaos**—one platform, one truth, zero conflicting reports',
        '**Enable role-specific views**—CRO sees revenue metrics, teams see execution tasks',
        '**Drive accountability** with transparent ownership at every organizational level'
      ]
    }
  ];

  const aiWorkflow = [
    {
      step: 1,
      input: 'Business Challenge',
      process: 'AI Goal Builder Wizard',
      output: 'SMART Goal with Metrics',
      time: '5 min vs 2 hours'
    },
    {
      step: 2,
      input: 'Initiative Brief',
      process: 'AI Template Generator',
      output: '14-Section Initiative Plan',
      time: '10 min vs 4 hours'
    },
    {
      step: 3,
      input: 'High-Level Description',
      process: 'AI Task Breakdown',
      output: 'Gantt Chart with Dependencies',
      time: '15 min vs 3 hours'
    },
    {
      step: 4,
      input: 'Platform Data',
      process: 'AI Executive Synthesis',
      output: 'Quarterly Summary Report',
      time: '20 min vs 8 hours'
    }
  ];

  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-roobert-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant py-8">
      <div 
        ref={contentRef}
        className={`${
          isFullscreen 
            ? 'w-full rounded-none' 
            : modalWidth === 95
              ? 'w-[95vw] rounded-xl'
              : 'w-[75vw] rounded-xl'
        } transition-all duration-300 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-fis-navy to-fis-eggplant dark:from-gray-950 dark:to-purple-950">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-roobert-bold text-white mb-2">
                  Platform Architecture Overview
                </h1>
                <p className="text-white/80 font-roobert-light">
                  Accelerating commercial excellence through AI-driven transparency and real-time executive intelligence
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                  title="Export to PNG"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
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
                  className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200"
                  title={isFullscreen ? 'Exit Fullscreen (75%)' : modalWidth === 75 ? 'Wider View (95%)' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize2 className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('platform')}
                className={`px-6 py-3 rounded-t-lg font-roobert-semibold transition-all duration-200 ${
                  activeTab === 'platform'
                    ? 'bg-white dark:bg-gray-800 text-fis-eggplant dark:text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Platform Overview
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-3 rounded-t-lg font-roobert-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-gray-800 text-fis-eggplant dark:text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Integration & Benefits
              </button>
            </div>
            {/* Horizontal line under tabs */}
            <div className="w-full border-t border-white/20 -mt-[1px]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {activeTab === 'platform' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Platform Purpose */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-fis-eggplant to-fis-raspberry rounded-xl">
                    <Network className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                      Strategic Business Value
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-roobert-light leading-relaxed">
                      This unified executive intelligence platform directly connects strategic objectives to revenue-generating activities, 
                      enabling the Commercial Office to make data-driven decisions in real-time. By leveraging AI to eliminate 80% of manual 
                      reporting effort, leadership gains continuous visibility into Demo Services performance—from pipeline velocity to 
                      win rate optimization—while maintaining the agility to pivot resources toward highest-value opportunities.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                    <h3 className="font-roobert-semibold text-gray-900 dark:text-white mb-1">Transparency First</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      100% visibility from board room to team rooms—no information silos
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                    <h3 className="font-roobert-semibold text-gray-900 dark:text-white mb-1">AI-Native Architecture</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Built to leverage emerging AI at every layer—reduce effort, accelerate insight
                    </p>
                  </div>
                </div>
              </div>

              {/* Platform Flow Visualization */}
              <div className="mb-12">
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                  Platform Flow Visualization
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex flex-col items-center gap-6">
                    <p className="text-center text-gray-600 dark:text-gray-400 font-roobert-light max-w-3xl">
                      The platform architecture creates a continuous intelligence loop: Strategic Goals drive Initiatives, 
                      which generate Tasks & Notes, all feeding the Executive AI Engine to produce board-ready Executive Summaries.
                    </p>
                    <div className="w-full max-w-4xl">
                      <img 
                        src="/platform-flow-with-legend.png" 
                        alt="Platform Flow Diagram showing Goals, Initiatives, Tasks & Notes feeding into Executive AI Engine to produce Executive Summaries"
                        className="w-full h-auto rounded-lg shadow-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Flow Hierarchy */}
              <div>
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                  Content Flow & Hierarchy
                </h2>
                <div className="space-y-6">
                  {contentHierarchy.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="relative"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-200">
                        <div className="flex items-start gap-4">
                          {/* Icon & Level */}
                          <div className="flex flex-col items-center gap-2">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color}`}>
                              <div className="text-white">{item.icon}</div>
                            </div>
                            <span className="text-xs font-roobert-bold text-gray-500 dark:text-gray-400">
                              LEVEL {item.level}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className={`text-xl font-roobert-bold ${item.textColor} mb-2`}>
                              {item.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-roobert-light mb-4">
                              {item.description}
                            </p>

                            {/* Capabilities */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {item.capabilities.map((cap, capIdx) => (
                                <div key={capIdx} className="flex items-start gap-2">
                                  <ChevronDown className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {renderTextWithBold(cap)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Connector Arrow */}
                      {idx < contentHierarchy.length - 1 && (
                        <div className="flex justify-center my-4">
                          <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-600 rotate-90" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Platform Benefits */}
              <div>
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                  Platform Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {platformBenefits.map((benefit, idx) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <div className="text-fis-eggplant dark:text-fis-raspberry mb-4">
                        {benefit.icon}
                      </div>
                      <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-roobert-light">
                        {benefit.description}
                      </p>
                      <ul className="space-y-2">
                        {benefit.metrics.map((metric, metricIdx) => (
                          <li key={metricIdx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>{renderTextWithBold(metric)}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* AI Integration Overview */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                      AI as Strategic Enabler
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">
                      At every platform layer—from strategic goal formulation to executive summary generation—AI augments leadership capacity 
                      by <strong className="font-roobert-bold">eliminating 80% of manual reporting effort</strong>. This isn't automation for 
                      automation's sake: it's a deliberate strategy to redirect senior leadership time from report compilation to strategic 
                      decision-making. AI provides the first draft; executives provide the business judgment.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">
                    <strong className="font-roobert-bold text-purple-600 dark:text-purple-400">Note:</strong> Notes and knowledge 
                    capture remain 100% human-generated to preserve authentic context, decisions, and tribal knowledge.
                  </p>
                </div>
              </div>

              {/* AI-Powered Workflow */}
              <div>
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                  AI-Powered Workflow & Time Savings
                </h2>
                <div className="space-y-4">
                  {aiWorkflow.map((workflow, idx) => (
                    <motion.div
                      key={workflow.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md"
                    >
                      <div className="flex items-center gap-6">
                        {/* Step Number */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center">
                            <span className="text-white font-roobert-bold text-lg">{workflow.step}</span>
                          </div>
                        </div>

                        {/* Workflow */}
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">INPUT</p>
                            <p className="font-roobert-semibold text-gray-900 dark:text-white">{workflow.input}</p>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI PROCESS</p>
                            <p className="font-roobert-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {workflow.process}
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight className="w-5 h-5 text-purple-500" />
                          </div>
                        </div>

                        {/* Output & Time */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">OUTPUT</p>
                          <p className="font-roobert-semibold text-gray-900 dark:text-white mb-2">{workflow.output}</p>
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-roobert-bold text-green-700 dark:text-green-300">
                              {workflow.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Total Time Savings */}
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-1">
                        Total Weekly Time Savings
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        From goal creation to executive summary generation
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-roobert-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        17+ hours
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">per executive update cycle</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Features by Layer */}
              <div>
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
                  AI Features by Platform Layer
                </h2>
                <div className="space-y-4">
                  {contentHierarchy.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color}`}>
                          <div className="text-white">{item.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-roobert-bold ${item.textColor} mb-3`}>
                            {item.title}
                          </h3>
                          <ul className="space-y-2">
                            {item.aiFeatures.map((feature, featureIdx) => (
                              <li key={featureIdx} className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {renderTextWithBold(feature)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Commercial Impact */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700">
                <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                  Commercial Office Impact: Quantified Business Value
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="text-3xl font-roobert-bold text-blue-600 dark:text-blue-400 mb-2">80%</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-semibold mb-1">
                      Leadership Capacity Reclaimed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      17+ hours/week redirected from reporting to strategic initiatives and pipeline acceleration
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="text-3xl font-roobert-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-semibold mb-1">
                      Cross-Functional Transparency
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Instills confidence in Demo Services performance—Sales, PreSales, and Commercial Office unified on real-time data
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="text-3xl font-roobert-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-semibold mb-1">
                      On-Demand Executive Intelligence
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      AI-generated insights available instantly—no waiting for weekly reporting cycles
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
