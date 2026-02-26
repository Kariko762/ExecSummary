import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Camera, FileDown, Maximize2, Minimize2, Target, TrendingUp, Zap, Globe, BarChart3, CheckCircle, ChevronDown } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';

interface GoalsHighLevelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOALS_DATA = {
  northStar: "Transform Demos into an AI-Enabled, Scalable revenue accelerator that shortens sales cycles, showcases differentiated product value, and reduces presales friction",
  
  mission: "Empower sales and presales teams with intelligent automation, rapid demo provisioning, and scalable demo infrastructure that eliminates friction and accelerates deal velocity.",
  
  targetOutcomes: [
    {
      title: "OPERATIONAL EXCELLENCE",
      icon: Zap,
      color: "blue",
      metrics: [
        "Cut prep hours 40% for strategic products",
        "Increase customer-facing hours by 15%",
        "Improve demo quality and establish baselines for AI-enabled products",
        "Onboard 10 strategic products with Copilot tailored to demo intelligence"
      ]
    },
    {
      title: "REVENUE GENERATION",
      icon: TrendingUp,
      color: "green",
      metrics: [
        "Launch digital demo pipeline for priority portfolios",
        "Enable self-serve demos and collect adoption metrics for strategic products",
        "Increase win-rate with demo-led deals and establish new baseline"
      ]
    },
    {
      title: "EXECUTIVE TRANSPARENCY",
      icon: BarChart3,
      color: "purple",
      metrics: [
        "100% demo-to-opportunity attribution in CRM",
        "Quarterly ROI reports with full cost-per-demo visibility",
        "Monthly executive performance packs (12/year)"
      ]
    },
    {
      title: "GLOBAL SCALE",
      icon: Globe,
      color: "orange",
      metrics: [
        "Deliver localized demo experiences for priority regions",
        "Publish localized assets for Banking & Capital Markets strategic products",
        "Establish regional performance baselines and measure impact"
      ]
    }
  ],

  goals: [
    {
      id: 1,
      title: "AUTOMATE & GOVERN THE DEMO PLATFORM",
      icon: "🤖",
      color: "#3b82f6",
      tags: ["AI Enabled", "Demo at Scale", "Reduces PreSales Friction"],
      statement: "By Dec 31, 2026, reduce demo prep hours for strategic products by 40%; onboard 10 strategic products with Copilot tailored to demo intelligence; implement rapid provisioning for priority portfolios; establish verified asset baselines and retire outdated assets; measure and track time-to-demo improvements.",
      keyResults: [
        "Reduce prep hours by 40% for strategic products",
        "Onboard 10 strategic products with Copilot demo intelligence",
        "Implement rapid demo provisioning for priority portfolios",
        "Establish verified asset inventory and governance framework",
        "Measure time-to-demo reduction and establish baseline",
        "Retire outdated assets from strategic portfolios"
      ],
      alignment: {
        commercial: "Frictionless operations; accelerate profitable growth",
        revops: "AI-first engine; simplify comp/territories; Copilot adoption"
      }
    },
    {
      id: 2,
      title: "SHIFT CAPACITY TO REVENUE-FACING ACTIVITIES",
      icon: "📈",
      color: "#10b981",
      tags: ["Revenue Accelerator", "Showcases Product Value", "Shorten Sales Cycles"],
      statement: "By Dec 31, 2026, increase customer-facing hours by 15% through automation; improve prep-to-present efficiency for strategic products; expand deal support capacity; establish demo-led win rate baselines; implement NPS feedback collection and measure satisfaction improvements.",
      keyResults: [
        "Increase customer-facing hours by 15%",
        "Improve prep-to-present ratio for strategic products",
        "Expand support to priority deals across businesses",
        "Establish demo-led win rate baseline and track improvements",
        "Implement NPS feedback collection across all demos",
        "Collect measurable satisfaction data and identify improvement areas"
      ],
      alignment: {
        commercial: "Beat TAM growth; faster revenue conversion; pricing discipline",
        revops: "Reduce forecast surprise; protect recurring revenue; executive reporting"
      }
    },
    {
      id: 3,
      title: "BUILD A DEMO-LED DIGITAL PIPELINE ENGINE",
      icon: "🚀",
      color: "#8b5cf6",
      tags: ["AI Enabled", "Revenue Accelerator"],
      statement: "By Dec 31, 2026, launch 10 self-service demos for strategic products; deploy Tiled microsites for priority portfolios; establish digital pipeline tracking; measure lead generation, demo requests, and conversion metrics; enable seller adoption and track usage data.",
      keyResults: [
        "Launch 10 self-service demos for strategic products",
        "Deploy 15-20 Tiled microsites for priority products",
        "Establish lead generation and demo request tracking",
        "Measure pipeline influence and establish attribution baselines",
        "Track seller adoption metrics for priority portfolios",
        "Integration Demo engagement cycle to StoreFront for 2-3 products"
      ],
      alignment: {
        commercial: "Global growth engine; new routes to market; enterprise 2x pace",
        revops: "Digital storefront; Copilot adoption; pipeline generation & transparency"
      }
    },
    {
      id: 4,
      title: "DELIVER EXECUTIVE DEMO INTELLIGENCE & ROI ATTRIBUTION",
      icon: "📊",
      color: "#f59e0b",
      tags: ["Revenue Accelerator", "Shorten Sales Cycles"],
      statement: "By Dec 31, 2026, deliver executive demo dashboard with quarterly reporting; implement NPS/feedback instrumentation; establish CRM integration for demo-to-opportunity attribution; build cost-per-demo tracking; automate reporting workflows and reduce manual effort.",
      keyResults: [
        "Launch executive demo dashboard with key metrics",
        "Deliver quarterly executive reports (4 in 2026)",
        "Establish CRM integration for strategic products",
        "Implement demo-to-opportunity attribution tracking",
        "Build cost-per-demo visibility framework",
        "Reduce manual reporting effort by 50%+"
      ],
      alignment: {
        commercial: "Market-savvy team; pricing/ACV mix decisions; flagship clients",
        revops: "Radical transparency; forecast confidence; automated yield model"
      }
    },
    {
      id: 5,
      title: "STRATEGIC LOCALIZATION FOR PRIORITY PORTFOLIOS",
      icon: "🌍",
      color: "#ec4899",
      tags: ["Demo at Scale", "Showcases Product Value", "AI Enabled"],
      statement: "By Dec 31, 2026, localize high-impact demos for 3-4 priority regions; publish localized assets; establish regional adoption tracking; measure regional performance and identify improvement opportunities.",
      keyResults: [
        "Deliver localized demos for 3-4 strategic regions/languages",
        "Publish 20-30 localized assets for Banking & Capital Markets",
        "Establish regional adoption tracking and baselines",
        "Measure regional win rate performance for demo-led deals",
        "Focus 75%+ of localized content on strategic portfolios",
        "Collect feedback and refine localization approach"
      ],
      alignment: {
        commercial: "Redefine market leadership in Banking & Capital Markets; beat TAM growth",
        revops: "Cross-sell/whitespace models; partnership/alliance revenue"
      }
    }
  ],

  quarterlyRoadmap: [
    {
      quarter: "Q1 2026",
      title: "DESIGN & BASELINES",
      deliverables: [
        "Automation architecture & AI/Copilot rollout",
        "Asset discovery & governance framework",
        "Attribution data model & executive metrics design",
        "Platform selection (self-serve, storefront, Tiled)",
        "Define priority regions/languages for localization"
      ]
    },
    {
      quarter: "Q2 2026",
      title: "BUILD & MVP",
      deliverables: [
        "Rapid provisioning MVP & standard templates",
        "Dashboard MVP live with CRM integration",
        "First localized assets (Strategic Products)",
        "Pilot microsites & self-serve demos",
        "Prep-to-present capacity reallocation begins"
      ]
    },
    {
      quarter: "Q3 2026",
      title: "SCALE & ADOPTION",
      deliverables: [
        "Expand automated environments & verified assets",
        "Seller enablement (microsites, narratives, self-serve)",
        "NPS live on SharePoint / SNOW",
        "Demo-to-revenue attribution operational",
        "Multilingual demo support enabled"
      ]
    },
    {
      quarter: "Q4 2026",
      title: "OPTIMIZE & PROVE ROI",
      deliverables: [
        "Hit prep reduction & presentation hour targets",
        "Establish adoption baselines for self-serve demos and Copilot usage",
        "Quarterly ROI reporting cadence established",
        "Regional localization scaled globally",
        "Digital storefront transactions live (2-3 lines)"
      ]
    }
  ]
};

export default function GoalsHighLevel({ isOpen, onClose }: GoalsHighLevelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScreenshot = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a'
      });
      
      const link = document.createElement('a');
      link.download = `demo-services-2026-goals-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`demo-services-2026-goals-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 flex flex-col ${
          isFullscreen ? 'w-full h-full' : 'w-[95vw] h-[95vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">2026 Strategic Goals</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Demo Services Group - Executive Summary</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="p-2 bg-transparent hover:bg-white/5 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
              </button>
              
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-10 min-w-[180px]">
                  <button
                    onClick={() => {
                      handleScreenshot();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-sm font-roobert-medium">Screenshot (PNG)</span>
                  </button>
                  <button
                    onClick={() => {
                      handlePDFExport();
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <FileDown className="w-4 h-4" />
                    <span className="text-sm font-roobert-medium">PDF Document</span>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div ref={contentRef} className="max-w-7xl mx-auto space-y-8 bg-slate-900 p-8">
            
            {/* North Star Vision */}
            <div className="bg-gradient-to-r from-blue-600/20 via-slate-600/20 to-blue-800/20 border-2 border-blue-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-slate-500/5 backdrop-blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full mb-4">
                  <span className="text-xs font-roobert-bold text-blue-300 uppercase tracking-wider">North Star Vision</span>
                </div>
                <h2 className="text-3xl font-roobert-bold text-white leading-tight mb-2">
                  {GOALS_DATA.northStar}
                </h2>
                <p className="text-sm text-blue-300/80 font-roobert-light italic">RevOps Leadership Strategic Vision</p>
              </div>
            </div>
            
            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <div>
                <h3 className="text-sm font-roobert-bold text-blue-400 uppercase tracking-wider mb-2">Mission 2026</h3>
                <p className="text-lg font-roobert-medium text-white leading-relaxed">{GOALS_DATA.mission}</p>
              </div>
            </div>

            {/* Target Outcomes */}
            <div>
              <h3 className="text-2xl font-roobert-bold text-white mb-6">2026 Target Outcomes</h3>
              <div className="grid grid-cols-2 gap-4">
                {GOALS_DATA.targetOutcomes.map((outcome, idx) => {
                  const colorClasses = {
                    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                    green: 'bg-green-500/10 border-green-500/20 text-green-400',
                    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                  }[outcome.color];

                  return (
                    <div key={idx} className={`${colorClasses} border rounded-xl p-5`}>
                      <div className="mb-4">
                        <h4 className="text-sm font-roobert-bold uppercase tracking-wide">{outcome.title}</h4>
                      </div>
                      <ul className="space-y-2">
                        {outcome.metrics.map((metric, mIdx) => (
                          <li key={mIdx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-sm font-roobert-light">{metric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Goals */}
            <div>
              <h3 className="text-2xl font-roobert-bold text-white mb-6">Strategic Goals</h3>
              <div className="space-y-4">
                {GOALS_DATA.goals.map((goal) => (
                  <div key={goal.id} className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
                    <div className="mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-roobert-bold text-white mb-2">{goal.title}</h4>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {goal.tags.map((tag, tagIdx) => {
                            const tagColors = {
                              'AI Enabled': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                              'Revenue Accelerator': 'bg-green-500/20 text-green-300 border-green-500/30',
                              'Demo at Scale': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                              'Shorten Sales Cycles': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                              'Reduces PreSales Friction': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                              'Showcases Product Value': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                            }[tag] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                            
                            return (
                              <span key={tagIdx} className={`px-2.5 py-1 rounded-md border text-xs font-roobert-medium ${tagColors}`}>
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                        
                        <p className="text-sm font-roobert-light text-slate-300 leading-relaxed mb-4">{goal.statement}</p>
                        
                        {/* Key Results */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {goal.keyResults.map((result, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 mt-2" />
                              <span className="text-xs font-roobert-medium text-slate-300">{result}</span>
                            </div>
                          ))}
                        </div>

                        {/* Alignment */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/40">
                          <div>
                            <div className="text-xs font-roobert-bold text-blue-400 uppercase tracking-wide mb-1">Commercial Office</div>
                            <div className="text-xs font-roobert-light text-slate-400">{goal.alignment.commercial}</div>
                          </div>
                          <div>
                            <div className="text-xs font-roobert-bold text-purple-400 uppercase tracking-wide mb-1">RevOps</div>
                            <div className="text-xs font-roobert-light text-slate-400">{goal.alignment.revops}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quarterly Roadmap */}
            <div>
              <h3 className="text-2xl font-roobert-bold text-white mb-6">2026 Quarterly Roadmap</h3>
              <div className="grid grid-cols-4 gap-4">
                {GOALS_DATA.quarterlyRoadmap.map((quarter, idx) => (
                  <div key={idx} className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-5 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <div className="text-xs font-roobert-bold text-blue-400 uppercase tracking-wider mb-1">{quarter.quarter}</div>
                      <div className="text-sm font-roobert-semibold text-white">{quarter.title}</div>
                    </div>
                    <ul className="space-y-2">
                      {quarter.deliverables.map((deliverable, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                          <span className="text-xs font-roobert-light text-slate-300 leading-snug">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-slate-700/40">
              <p className="text-xs text-slate-500 font-roobert-light">
                Demo Services Group Strategic Plan | Generated {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

          </div>
        </div>

        {isExporting && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-white font-roobert-medium">Exporting...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
