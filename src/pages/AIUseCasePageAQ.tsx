import React, { useState, useRef } from 'react';
import { domToPng } from 'modern-screenshot';
import { 
  Download, 
  Sparkles, 
  MessageSquare, 
  Video, 
  Bot, 
  FileText, 
  ImageIcon, 
  Brain, 
  Zap, 
  Target,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Maximize2,
  Minimize2,
  Workflow,
  GitBranch,
  Shield,
  BookOpen,
  Microscope,
  FileCheck,
  Globe,
  FileDown
} from 'lucide-react';

// Precision AQ Brand Colors (from official logo SVG)
const PAQ_COLORS = {
  magenta: '#CB009F',  // Official logo magenta
  navy: '#0F1822',     // Official logo navy
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  greenAccent: '#8BC53F',
};

export default function AIUseCasePageAQ() {
  const [isExporting, setIsExporting] = useState(false);
  const [screenSize, setScreenSize] = useState<75 | 95 | 100>(100);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const cycleScreenSize = () => {
    if (screenSize === 75) setScreenSize(95);
    else if (screenSize === 95) setScreenSize(100);
    else setScreenSize(75);
  };

  const handleExport = async () => {
    if (!contentRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const element = contentRef.current;
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      const originalMaxHeight = element.style.maxHeight;

      element.style.overflow = 'visible';
      element.style.height = 'auto';
      element.style.maxHeight = 'none';

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;

      const link = document.createElement('a');
      link.download = `precision-aq-ai-use-cases-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePDFExport = () => {
    // Trigger print - CSS media queries handle showing/hiding content
    window.print();
  };

  const precisionPipelines = [
    {
      title: 'Medical Education Factory',
      subtitle: 'Evidence → Learning Platform',
      icon: BookOpen,
      description: 'Clinical data → Structured knowledge → Modular learning → SCORM packages → Learning platform',
      compound: 'Learning content regenerates as evidence evolves',
      color: PAQ_COLORS.magenta
    },
    {
      title: 'Omnichannel Campaign Engine',
      subtitle: 'Strategy → Persona → Channel',
      icon: Globe,
      description: 'Core narrative → Persona translation → Channel adaptation → Compliance check → Asset production',
      compound: 'One truth → infinite compliant expressions',
      color: PAQ_COLORS.magenta
    },
    {
      title: 'Evidence-to-Access Pipeline',
      subtitle: 'HEOR → Market Access Assets',
      icon: Microscope,
      description: 'Clinical outcomes → Value narrative → Payer artifacts → Stakeholder framing → Update loop',
      compound: 'New evidence updates all downstream materials',
      color: PAQ_COLORS.magenta
    },
    {
      title: 'MLR & Governance Automation',
      subtitle: 'Scale with Safety',
      icon: Shield,
      description: 'Policy extraction → Preflight compliance → Reviewer packs → Approval routing → Post-publish audit',
      compound: 'Compliance becomes a system, not a bottleneck',
      color: PAQ_COLORS.magenta
    },
    {
      title: 'SME Knowledge Capture Engine',
      subtitle: 'Tribal Knowledge → Scalable IP',
      icon: Brain,
      description: 'Guided interviews → Knowledge structuring → Content generation → Delivery channels → Drift detection',
      compound: 'Turn expertise into institutional memory',
      color: PAQ_COLORS.magenta
    },
    {
      title: 'Digital Learning Platform Builder',
      subtitle: 'Story → Course → Experience',
      icon: Workflow,
      description: 'Learning analysis → Journey design → Experience design → Content production → Optimization loop',
      compound: 'Operating a digital learning factory',
      color: PAQ_COLORS.magenta
    }
  ];

  const useCases = [
    {
      category: 'Content Creation',
      icon: FileText,
      color: PAQ_COLORS.magenta,
      iconBg: `${PAQ_COLORS.magenta}33`,
      iconColor: PAQ_COLORS.magenta,
      items: [
        {
          title: 'Executive Follow-Up Emails',
          description: 'Transform meeting notes into polished, executive-ready follow-up communications',
          icon: MessageSquare,
          use: 'Upload meeting transcripts or voice memos → AI generates structured emails with action items, decisions, and next steps',
          time: 'Rapid turnaround',
          impact: 'Professional tone, never miss key points'
        },
        {
          title: 'Video Script Generation',
          description: 'Transform marketing scripts into 8-second AI video segments for Sora 2 and Veo 3.1',
          icon: Video,
          use: 'Marketing writes full script → AI breaks into 8-sec segments → outlines visual elements → generates video prompts → creates video in Sora/Veo',
          time: 'Significantly accelerated',
          impact: 'Professional video production at scale'
        },
        {
          title: 'Infographic Design Briefs',
          description: 'Generate data-driven infographic concepts and copy from raw data',
          icon: ImageIcon,
          use: 'Upload data/stats → AI creates visual hierarchy, callouts, and design recommendations',
          time: 'Same-day delivery',
          impact: 'Data storytelling, visual engagement'
        }
      ]
    },
    {
      category: 'Knowledge & Support',
      icon: Brain,
      color: PAQ_COLORS.magenta,
      iconBg: `${PAQ_COLORS.magenta}33`,
      iconColor: PAQ_COLORS.magenta,
      items: [
        {
          title: 'Policy Chatbots',
          description: 'Deploy AI bots trained on company policies for instant, accurate answers',
          icon: Bot,
          use: 'Train on HR policies, compliance docs, benefits → Employees get 24/7 instant answers to policy questions',
          time: 'Immediate responses',
          impact: 'Reduced HR workload, improved compliance'
        },
        {
          title: 'SharePoint Copilot Integration',
          description: 'Link Copilot to corporate SharePoint for intelligent content summaries',
          icon: FileText,
          use: 'Connect to document libraries → Ask "Summarize Q4 strategy docs" or "Find all mentions of Project X"',
          time: 'Instant retrieval',
          impact: 'Knowledge accessibility, faster decisions'
        },
        {
          title: 'Training Module Summarization',
          description: 'Auto-generate executive summaries of lengthy training content',
          icon: Brain,
          use: 'Upload course materials → AI creates condensed learning guides, key takeaways, and quiz questions',
          time: 'Rapid generation',
          impact: 'Improved retention, scalable learning'
        }
      ]
    },
    {
      category: 'Revenue Operations',
      icon: TrendingUp,
      color: PAQ_COLORS.magenta,
      iconBg: `${PAQ_COLORS.magenta}33`,
      iconColor: PAQ_COLORS.greenAccent,
      items: [
        {
          title: 'Proposal Personalization',
          description: 'Customize RFP responses and proposals based on prospect data',
          icon: Target,
          use: 'Input prospect info + template → AI tailors messaging, case studies, and pricing narratives',
          time: 'Quick customization',
          impact: 'Higher win rates, consistent quality'
        },
        {
          title: 'Sales Enablement Content',
          description: 'Generate battlecards, objection handlers, and one-pagers from product docs',
          icon: Zap,
          use: 'Upload technical specs → AI creates sales-friendly summaries, competitive positioning, and talk tracks',
          time: 'Same-day readiness',
          impact: 'Faster onboarding, better conversations'
        },
        {
          title: 'Performance Report Narratives',
          description: 'Convert sales data into executive-ready performance stories',
          icon: BarChart3,
          use: 'Connect to CRM/BI → AI generates insights, trend analysis, and recommendation narratives',
          time: 'Automated reporting',
          impact: 'Data-driven decisions, clear insights'
        }
      ]
    }
  ];

  const bestPractices = [
    { icon: CheckCircle2, text: 'Always validate AI outputs against source evidence and clinical data' },
    { icon: CheckCircle2, text: 'Maintain MLR approval workflows for all HCP-facing content' },
    { icon: CheckCircle2, text: 'Use AI for first drafts, medical/legal teams for final review' },
    { icon: CheckCircle2, text: 'Track compliance metrics alongside time savings' },
    { icon: CheckCircle2, text: 'Build prompt libraries that encode regulatory guardrails' }
  ];

  const quickWins = [
    { title: 'Week 1', action: 'Draft medical education module from SME interview', impact: 'Accelerate content creation' },
    { title: 'Week 2', action: 'Generate MLR-ready content with compliance preflight', impact: 'Streamline review cycles' },
    { title: 'Week 3', action: 'Build evidence table from clinical data', impact: 'Multiply evidence reuse' },
    { title: 'Week 4', action: 'Create multi-channel campaign from core narrative', impact: 'Consistent messaging at scale' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-auto">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Hide main content during print */
            .main-content-wrapper {
              display: none !important;
            }
            
            /* Show PDF content during print */
            .pdf-content-wrapper {
              display: block !important;
            }
            
            .pdf-page {
              page-break-after: always;
              page-break-inside: avoid;
            }
            
            .pdf-page:last-child {
              page-break-after: auto;
            }
          }
        `}
      </style>
      {/* Main Content - Hidden during print */}
      <div className="main-content-wrapper" style={{ display: showPDFPreview ? 'none' : 'block' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-gray-200" style={{ backgroundColor: PAQ_COLORS.white }}>
        <div className="max-w-[1600px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/vendor-logos/precision-aq-logo-full-color.svg" 
                alt="Precision AQ" 
                className="h-12"
                style={{ height: '48px' }}
              />
            </div>
            
            {/* Export Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPDFPreview(!showPDFPreview)}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: showPDFPreview ? PAQ_COLORS.greenAccent : PAQ_COLORS.magenta }}
                title={showPDFPreview ? "Hide PDF Preview" : "Show PDF Preview"}
              >
                <FileText className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={cycleScreenSize}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: PAQ_COLORS.magenta }}
                title={screenSize === 75 ? 'Expand to 95%' : screenSize === 95 ? 'Fullscreen' : 'Collapse to 75%'}
              >
                {screenSize === 100 ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
              </button>
              <button
                onClick={handlePDFExport}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: PAQ_COLORS.navy }}
                title="Export PDF (5 pages)"
              >
                <FileDown className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="p-2 rounded-lg transition-all disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: PAQ_COLORS.magenta }}
                title={isExporting ? 'Exporting...' : 'Export PNG'}
              >
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div 
        ref={contentRef}
        className="max-w-[1600px] mx-auto p-8 space-y-8"
        style={{ 
          transform: `scale(${screenSize / 100})`,
          transformOrigin: 'top center',
          width: screenSize === 100 ? '100%' : `${100 / (screenSize / 100)}%`
        }}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl border p-12" style={{ backgroundColor: PAQ_COLORS.navy, borderColor: `${PAQ_COLORS.navy}33` }}>
          <div className="absolute top-0 right-0 w-1/2 h-full" style={{ background: `linear-gradient(to left, ${PAQ_COLORS.magenta}15, transparent)` }} />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: `${PAQ_COLORS.magenta}20`, border: `1px solid ${PAQ_COLORS.magenta}40` }}>
              <Microscope className="w-4 h-4" style={{ color: PAQ_COLORS.magenta }} />
              <span className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.magenta }}>Medical Affairs & Market Access</span>
            </div>
            <h2 className="text-4xl font-roobert-bold text-white mb-4 leading-tight">
              AI-Powered Productivity for <span style={{ color: PAQ_COLORS.magenta }}>Healthcare Content Teams</span>
            </h2>
            <p className="text-lg text-white leading-relaxed mb-8" style={{ opacity: 0.8 }}>
              Modern pharmaceutical and medical device companies are leveraging AI pipelines to transform evidence into compliant, 
              multi-channel content at scale. This guide showcases proven workflows across Medical Education, Market Access, 
              MLR Governance, and Digital Learning teams.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>~40%<sup className="text-lg">¹</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Faster writing tasks with AI assistance</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>3.5x<sup className="text-lg">²</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Faster content production with AI workflows</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>65%<sup className="text-lg">³</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Of organizations now using GenAI regularly</div>
              </div>
            </div>
          </div>
        </div>

        {/* Precision AQ Showcase - Multi-Step Pipelines */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.magenta }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GitBranch className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">Precision AQ Multi-Step Pipelines</h3>
                <p className="text-white/90 text-sm">Game-changing workflows that compound value through artifact chains</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            {precisionPipelines.map((pipeline, idx) => {
              const Icon = pipeline.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all group"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${pipeline.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: pipeline.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-roobert-bold mb-1" style={{ color: PAQ_COLORS.navy }}>{pipeline.title}</h4>
                      <p className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.magenta }}>{pipeline.subtitle}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-3 mb-3 border" style={{ backgroundColor: `${PAQ_COLORS.navy}05`, borderColor: `${PAQ_COLORS.navy}10` }}>
                    <div className="text-xs font-roobert-semibold uppercase mb-2" style={{ color: `${PAQ_COLORS.navy}66` }}>Pipeline Flow</div>
                    <p className="text-sm leading-relaxed" style={{ color: `${PAQ_COLORS.navy}CC` }}>{pipeline.description}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                    <p className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.greenAccent }}>Why it compounds: <span className="font-roobert-regular" style={{ color: `${PAQ_COLORS.navy}99` }}>{pipeline.compound}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.navy }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">AI as Pipelines, Not Vending Machines</h3>
                <p className="text-white/90 text-sm">Understanding the difference between tactical accelerators and transformative workflows</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            <div className="grid grid-cols-2 gap-6">
              {/* Single-Step AI */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PAQ_COLORS.navy}10` }}>
                    <Zap className="w-5 h-5" style={{ color: PAQ_COLORS.navy }} />
                  </div>
                  <h4 className="text-xl font-roobert-bold" style={{ color: PAQ_COLORS.navy }}>Single-Step AI</h4>
                </div>
                <p className="text-sm mb-4" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  Tactical accelerators that speed up existing tasks. Useful for immediate productivity gains but don't fundamentally change your operating model.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: `${PAQ_COLORS.navy}66` }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>Draft email from notes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: `${PAQ_COLORS.navy}66` }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>Summarize document</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: `${PAQ_COLORS.navy}66` }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>Generate quiz questions</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: `${PAQ_COLORS.navy}20` }}>
                  <p className="text-xs font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}66` }}>VALUE: Speed + cost reduction</p>
                </div>
              </div>

              {/* Multi-Step Pipelines */}
              <div className="bg-white rounded-xl border p-6" style={{ borderColor: PAQ_COLORS.magenta }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                    <GitBranch className="w-5 h-5" style={{ color: PAQ_COLORS.magenta }} />
                  </div>
                  <h4 className="text-xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>Multi-Step Pipelines</h4>
                </div>
                <p className="text-sm mb-4" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  Transformative workflows where each step produces artifacts that make downstream steps faster, higher quality, and more automatable. The unlock is compound value.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>Evidence → Structured truth set → Multi-channel assets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>SME interview → Playbook → Interactive copilot</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                    <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}CC` }}>Policy docs → Machine rules → Auto-compliance</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t" style={{ borderColor: `${PAQ_COLORS.magenta}40` }}>
                  <p className="text-xs font-roobert-semibold" style={{ color: PAQ_COLORS.magenta }}>VALUE: Operating model transformation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Workflow Example */}
        <div className="bg-white border rounded-2xl overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.magenta }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">Featured Workflow: AI Video Production</h3>
                <p className="text-white/90 text-sm">Step-by-step example using Sora 2 / Veo 3.1</p>
              </div>
            </div>
          </div>
          
          <div className="p-8" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            <div className="mb-6">
              <p className="leading-relaxed" style={{ color: `${PAQ_COLORS.navy}CC` }}>
                <strong style={{ color: PAQ_COLORS.navy }}>Challenge:</strong> Modern AI video tools like Sora 2 and Veo 3.1 have an 8-second limit per clip. 
                Traditional marketing scripts need to be restructured for this format while maintaining narrative flow and visual impact.
              </p>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-roobert-bold text-white text-lg" style={{ backgroundColor: PAQ_COLORS.magenta }}>
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>Marketing Team Creates Original Script</h4>
                  <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <p className="text-sm italic" style={{ color: `${PAQ_COLORS.navy}99` }}>
                      "Our new platform revolutionizes customer engagement through AI-powered insights, real-time analytics, 
                      and seamless integration with your existing tools. Join thousands of companies transforming their workflows..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-roobert-bold text-white text-lg" style={{ backgroundColor: PAQ_COLORS.magenta }}>
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>AI Reorganizes Into 8-Second Segments</h4>
                  <div className="bg-white rounded-lg p-4 border space-y-2" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-start gap-2">
                      <span className="font-roobert-semibold text-xs" style={{ color: PAQ_COLORS.magenta }}>Segment 1:</span>
                      <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>"Our new platform revolutionizes customer engagement through AI-powered insights"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-roobert-semibold text-xs" style={{ color: PAQ_COLORS.magenta }}>Segment 2:</span>
                      <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>"Real-time analytics and seamless integration with your existing tools"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-roobert-semibold text-xs" style={{ color: PAQ_COLORS.magenta }}>Segment 3:</span>
                      <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>"Join thousands of companies transforming their workflows"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-roobert-bold text-white text-lg" style={{ backgroundColor: PAQ_COLORS.magenta }}>
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>AI Outlines Visual Elements for Each Segment</h4>
                  <div className="bg-white rounded-lg p-4 border space-y-3" style={{ borderColor: '#E5E7EB' }}>
                    <div>
                      <div className="text-xs font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.magenta }}>SEGMENT 1 VISUALS:</div>
                      <p className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Dashboard interface with AI brain icon animating in center, data particles flowing, modern tech aesthetic</p>
                    </div>
                    <div>
                      <div className="text-xs font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.magenta }}>SEGMENT 2 VISUALS:</div>
                      <p className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Split screen showing analytics charts on left, existing software logos connecting on right with glowing lines</p>
                    </div>
                    <div>
                      <div className="text-xs font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.magenta }}>SEGMENT 3 VISUALS:</div>
                      <p className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Global map with company logos appearing as glowing pins, counter showing growing numbers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-roobert-bold text-white text-lg" style={{ backgroundColor: PAQ_COLORS.magenta }}>
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>AI Generates Video Prompts</h4>
                  <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#E5E7EB' }}>
                    <p className="text-xs font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.magenta }}>SORA 2 / VEO 3.1 PROMPT:</p>
                    <p className="text-sm font-mono" style={{ color: `${PAQ_COLORS.navy}99` }}>
                      "Professional tech commercial style, modern dashboard interface with holographic AI brain icon materializing in center, 
                      blue and purple data particles flowing outward, sleek glass morphism design, 8K quality, cinematic lighting, 
                      depth of field, brand colors: navy blue and electric purple, duration: 8 seconds"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outcome */}
            <div className="mt-6 rounded-lg p-6 border" style={{ backgroundColor: `${PAQ_COLORS.magenta}10`, borderColor: `${PAQ_COLORS.magenta}33` }}>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: PAQ_COLORS.greenAccent }} />
                <div>
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>Outcome</h4>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: `${PAQ_COLORS.navy}CC` }}>
                    Manual storyboarding, prompt writing, and iteration that traditionally requires significant time investment can be dramatically accelerated. 
                    The marketing team receives production-ready video segments that maintain brand consistency and narrative flow.
                  </p>
                  <p className="text-sm font-roobert-semibold mb-3" style={{ color: PAQ_COLORS.magenta }}>
                    This is a multi-step pipeline: each artifact (segments, visuals, prompts) compounds to make the next step faster and better.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: PAQ_COLORS.magenta }} />
                      <span style={{ color: `${PAQ_COLORS.navy}CC` }}><strong style={{ color: PAQ_COLORS.magenta }}>Dramatic time savings</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" style={{ color: PAQ_COLORS.greenAccent }} />
                      <span style={{ color: `${PAQ_COLORS.navy}CC` }}><strong style={{ color: PAQ_COLORS.greenAccent }}>Professional quality</strong> at scale</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Use Case Categories */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.navy }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">Beyond Healthcare: General AI Use Cases</h3>
                <p className="text-white/90 text-sm">Inspire innovative thinking across all business functions</p>
              </div>
            </div>
          </div>
        </div>

        {useCases.map((category, catIdx) => {
          const CategoryIcon = category.icon;
          return (
            <div key={catIdx} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
              {/* Category Header with Gradient */}
              <div className="p-6" style={{ backgroundColor: PAQ_COLORS.magenta }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CategoryIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-roobert-bold text-white">{category.category}</h3>
                    <p className="text-white/90 text-sm">{category.items.length} AI-powered use cases</p>
                  </div>
                </div>
              </div>

              {/* Use Cases Grid */}
              <div className="p-6 grid grid-cols-1 gap-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
                {category.items.map((item, itemIdx) => {
                const ItemIcon = item.icon;
                  return (
                    <div 
                      key={itemIdx} 
                      className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all group"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      <div className="flex items-start gap-6">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: category.iconBg }}>
                          <ItemIcon className="w-8 h-8" style={{ color: category.iconColor }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h4 className="text-xl font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>{item.title}</h4>
                          <p className="mb-4 leading-relaxed" style={{ color: `${PAQ_COLORS.navy}99` }}>{item.description}</p>
                          
                          {/* How to Use */}
                          <div className="rounded-lg p-4 mb-4 border" style={{ backgroundColor: `${PAQ_COLORS.navy}05`, borderColor: `${PAQ_COLORS.navy}15` }}>
                            <div className="flex items-start gap-3">
                              <ArrowRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                              <div>
                                <div className="text-xs font-roobert-semibold uppercase mb-1" style={{ color: `${PAQ_COLORS.navy}66` }}>How to Use</div>
                                <div className="text-sm leading-relaxed" style={{ color: `${PAQ_COLORS.navy}CC` }}>{item.use}</div>
                              </div>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" style={{ color: PAQ_COLORS.magenta }} />
                              <span className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.magenta }}>{item.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4" style={{ color: PAQ_COLORS.greenAccent }} />
                              <span className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>{item.impact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Best Practices Section */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.navy }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">Best Practices & Guardrails</h3>
                <p className="text-white/90 text-sm">Healthcare-specific AI implementation guidelines</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            {bestPractices.map((practice, idx) => {
              const Icon = practice.icon;
              return (
                <div key={idx} className="flex items-start gap-4 bg-white rounded-lg p-4 border" style={{ borderColor: '#E5E7EB' }}>
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PAQ_COLORS.greenAccent }} />
                  <span className="leading-relaxed" style={{ color: `${PAQ_COLORS.navy}CC` }}>{practice.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Wins Timeline */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.magenta }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">30-Day Healthcare AI Roadmap</h3>
                <p className="text-white/90 text-sm">Start with pharma-specific quick wins</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            <div className="grid grid-cols-4 gap-6">
              {quickWins.map((week, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all group" style={{ borderColor: '#E5E7EB' }}>
                    <div className="text-sm font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.magenta }}>{week.title}</div>
                    <div className="text-lg font-roobert-bold mb-3" style={{ color: PAQ_COLORS.navy }}>{week.action}</div>
                    <div className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.greenAccent }}>{week.impact}</div>
                  </div>
                  {idx < quickWins.length - 1 && (
                    <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center z-10" style={{ borderColor: PAQ_COLORS.magenta }}>
                      <ArrowRight className="w-3 h-3" style={{ color: PAQ_COLORS.magenta }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden rounded-2xl p-12 text-center" style={{ backgroundColor: PAQ_COLORS.magenta }}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          <div className="relative z-10">
            <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-3xl font-roobert-bold text-white mb-4">Ready to Transform Your Healthcare Content Workflow?</h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start with one pipeline this week. Measure the compound value. Scale what works.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                <span className="text-white font-roobert-semibold">Questions? Reach out to eLearning, L&D team</span>
              </div>
            </div>
          </div>
        </div>

        {/* How This Document Was Made */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.navy }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Workflow className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">How This Document Was Made</h3>
                <p className="text-white/90 text-sm">AI-powered workflow demonstration</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            <div className="bg-white rounded-xl border p-6 space-y-3" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                  <span className="font-roobert-bold text-sm" style={{ color: PAQ_COLORS.magenta }}>1</span>
                </div>
                <div>
                  <div className="font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.navy }}>Research</div>
                  <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Copilot Research AI Agent</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                  <span className="font-roobert-bold text-sm" style={{ color: PAQ_COLORS.magenta }}>2</span>
                </div>
                <div>
                  <div className="font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.navy }}>Framing</div>
                  <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Copilot 365</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                  <span className="font-roobert-bold text-sm" style={{ color: PAQ_COLORS.magenta }}>3</span>
                </div>
                <div>
                  <div className="font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.navy }}>Branding and Company Research</div>
                  <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Claude Sonnet 4.5 (Copilot for GitHub)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                  <span className="font-roobert-bold text-sm" style={{ color: PAQ_COLORS.magenta }}>4</span>
                </div>
                <div>
                  <div className="font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.navy }}>Page Design and Research Summary</div>
                  <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Claude Sonnet 4.5 (Copilot for GitHub)</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                  <span className="font-roobert-bold text-sm" style={{ color: PAQ_COLORS.magenta }}>5</span>
                </div>
                <div>
                  <div className="font-roobert-semibold mb-1" style={{ color: PAQ_COLORS.navy }}>Review and Update</div>
                  <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Claude Sonnet 4.5 (Copilot for GitHub)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.navy }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">References</h3>
                <p className="text-white/90 text-sm">Research sources and citations</p>
              </div>
            </div>
          </div>
          <div className="p-6" style={{ backgroundColor: PAQ_COLORS.lightGray }}>
            <div className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: '#E5E7EB' }}>
              <div>
                <div className="font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.navy }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>1</sup> Generative AI increases professional writing productivity by ~40% and improves quality by ~18%
                </div>
                <p className="text-sm mb-2" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  In controlled experiments, professionals using generative AI completed writing tasks significantly faster while producing higher-quality outputs than those without AI assistance.
                </p>
                <a 
                  href="https://www.science.org/doi/10.1126/science.adh2586" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-roobert-semibold hover:underline"
                  style={{ color: PAQ_COLORS.magenta }}
                >
                  https://www.science.org/doi/10.1126/science.adh2586 ↗
                </a>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: `${PAQ_COLORS.navy}20` }}>
                <div className="font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.navy }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>2</sup> Marketing teams using AI create content 3.5x faster with higher engagement
                </div>
                <p className="text-sm mb-2" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  HubSpot's 2024 State of Marketing report found that AI-powered content creation workflows deliver significantly faster production times while improving quality metrics and audience engagement.
                </p>
                <a 
                  href="https://www.hubspot.com/state-of-marketing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-roobert-semibold hover:underline"
                  style={{ color: PAQ_COLORS.magenta }}
                >
                  https://www.hubspot.com/state-of-marketing ↗
                </a>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: `${PAQ_COLORS.navy}20` }}>
                <div className="font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.navy }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>3</sup> 65% of organisations are now regularly using generative AI
                </div>
                <p className="text-sm mb-2" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  McKinsey's 2024 State of AI survey shows rapid mainstream adoption of generative AI across enterprises.
                </p>
                <a 
                  href="https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-2024" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-roobert-semibold hover:underline"
                  style={{ color: PAQ_COLORS.magenta }}
                >
                  https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-2024 ↗
                </a>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: `${PAQ_COLORS.navy}20` }}>
                <div className="font-roobert-semibold mb-2" style={{ color: PAQ_COLORS.navy }}>Additional Research Sources</div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}CC` }}>Customer support productivity lift (~14%)</div>
                    <a href="https://www.nber.org/papers/w31161" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PAQ_COLORS.magenta }}>
                      https://www.nber.org/papers/w31161 ↗
                    </a>
                  </div>
                  <div>
                    <div className="font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}CC` }}>GenAI economic potential ($2.6T–$4.4T annually)</div>
                    <a href="https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PAQ_COLORS.magenta }}>
                      McKinsey: Economic Potential of Generative AI ↗
                    </a>
                  </div>
                  <div>
                    <div className="font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}CC` }}>AI global economic impact projection ($15.7T by 2030)</div>
                    <a href="https://www.pwc.com/m1/en/publications/potential-impact-artificial-intelligence-middle-east.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PAQ_COLORS.magenta }}>
                      PwC: AI Economic Impact ↗
                    </a>
                  </div>
                  <div>
                    <div className="font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}CC` }}>AI adoption acceleration (55% to 78%)</div>
                    <a href="https://hai.stanford.edu/ai-index/2025-ai-index-report" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PAQ_COLORS.magenta }}>
                      Stanford AI Index 2025 ↗
                    </a>
                  </div>
                  <div>
                    <div className="font-roobert-semibold" style={{ color: `${PAQ_COLORS.navy}CC` }}>AI ROI challenges and strategy importance</div>
                    <a href="https://www.deloitte.com/uk/en/issues/generative-ai/ai-roi-the-paradox-of-rising-investment-and-elusive-returns.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: PAQ_COLORS.magenta }}>
                      Deloitte: AI ROI Paradox ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-sm" style={{ color: `${PAQ_COLORS.navy}66` }}>
            AI Use Cases Guide • Healthcare Content Teams • {new Date().getFullYear()} • Precision AQ
          </p>
        </div>
      </div>
      </div>

      {/* PDF Export Content - Hidden on screen, visible during print */}
      <div ref={pdfRef} className="pdf-content-wrapper" style={{ display: showPDFPreview ? 'block' : 'none' }}>
        {/* Page 1: Header + Hero + Precision AQ Pipelines */}
        <div className="pdf-page" style={{ padding: '15mm 12mm', backgroundColor: PAQ_COLORS.white }}>
          {/* Compact Header with Logo */}
          <div style={{ marginBottom: '15px', paddingBottom: '8px', borderBottom: '1px solid #E5E7EB' }}>
            <img 
              src="/vendor-logos/precision-aq-logo-full-color.svg" 
              alt="Precision AQ" 
              style={{ height: '32px' }}
            />
          </div>

          {/* Title Panel (Hero) */}
          <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'inline-block', backgroundColor: `${PAQ_COLORS.magenta}33`, border: `1px solid ${PAQ_COLORS.magenta}66`, borderRadius: '20px', padding: '8px 16px', marginBottom: '20px' }}>
              <span style={{ color: PAQ_COLORS.magenta, fontSize: '14px', fontWeight: '600' }}>AI-Driven Digital Content</span>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'white', marginBottom: '16px', lineHeight: '1.2' }}>
              AI-Powered Productivity for <span style={{ color: PAQ_COLORS.magenta }}>Healthcare Content Teams</span>
            </h1>
            <p style={{ fontSize: '16px', color: 'white', opacity: 0.9, marginBottom: '30px', lineHeight: '1.6' }}>
              Modern pharmaceutical and medical device companies are leveraging AI pipelines to transform evidence into compliant, 
              multi-channel content at scale.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', flex: '1' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: PAQ_COLORS.magenta }}>~40%¹</div>
                <div style={{ fontSize: '12px', color: 'white', opacity: 0.8 }}>Faster writing tasks with AI</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', flex: '1' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: PAQ_COLORS.magenta }}>3.5x²</div>
                <div style={{ fontSize: '12px', color: 'white', opacity: 0.8 }}>Faster content production</div>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', flex: '1' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: PAQ_COLORS.magenta }}>65%³</div>
                <div style={{ fontSize: '12px', color: 'white', opacity: 0.8 }}>Organizations using GenAI</div>
              </div>
            </div>
          </div>

          {/* Precision AQ Multi-Step Pipelines Header */}
          <div style={{ backgroundColor: PAQ_COLORS.magenta, borderRadius: '8px 8px 0 0', padding: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>Precision AQ Multi-Step Pipelines</h2>
            <p style={{ color: 'white', opacity: 0.9, fontSize: '12px', marginTop: '4px' }}>Game-changing workflows that compound value through artifact chains</p>
          </div>
          
          {/* Pipelines Grid - All 6 Pipelines */}
          <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '0 0 8px 8px', padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {precisionPipelines.slice(0, 2).map((pipeline, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '4px' }}>{pipeline.title}</h4>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: PAQ_COLORS.magenta, marginBottom: '8px' }}>{pipeline.subtitle}</p>
                  <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4', marginBottom: '8px' }}>{pipeline.description}</p>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: PAQ_COLORS.greenAccent }}>✓ {pipeline.compound}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {precisionPipelines.slice(2, 4).map((pipeline, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '4px' }}>{pipeline.title}</h4>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: PAQ_COLORS.magenta, marginBottom: '8px' }}>{pipeline.subtitle}</p>
                  <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4', marginBottom: '8px' }}>{pipeline.description}</p>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: PAQ_COLORS.greenAccent }}>✓ {pipeline.compound}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {precisionPipelines.slice(4, 6).map((pipeline, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '4px' }}>{pipeline.title}</h4>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: PAQ_COLORS.magenta, marginBottom: '8px' }}>{pipeline.subtitle}</p>
                  <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4', marginBottom: '8px' }}>{pipeline.description}</p>
                  <p style={{ fontSize: '10px', fontWeight: '600', color: PAQ_COLORS.greenAccent }}>✓ {pipeline.compound}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}66` }}>
              AI Use Cases Guide • eLearning, L&D • 2026 • Precision AQ
            </p>
          </div>
        </div>

        {/* Page 2: AI as Pipelines, Not Vending Machines */}
        <div className="pdf-page" style={{ padding: '15mm 12mm', backgroundColor: PAQ_COLORS.white }}>
          <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>AI as Pipelines, Not Vending Machines</h2>
            <p style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Understanding the difference between tactical accelerators and transformative workflows</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Single-Step AI */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '12px' }}>Single-Step AI</h3>
              <p style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}99`, marginBottom: '16px', lineHeight: '1.5' }}>
                Tactical accelerators that speed up existing tasks. Useful for immediate productivity gains but don't fundamentally change your operating model.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '8px' }}>→ Draft email from notes</div>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '8px' }}>→ Summarize document</div>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC` }}>→ Generate quiz questions</div>
              </div>
              <div style={{ paddingTop: '16px', borderTop: `1px solid ${PAQ_COLORS.navy}20` }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: `${PAQ_COLORS.navy}66` }}>VALUE: Speed + cost reduction</p>
              </div>
            </div>

            {/* Multi-Step Pipelines */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: `2px solid ${PAQ_COLORS.magenta}`, padding: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: PAQ_COLORS.magenta, marginBottom: '12px' }}>Multi-Step Pipelines</h3>
              <p style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}99`, marginBottom: '16px', lineHeight: '1.5' }}>
                Transformative workflows where each step produces artifacts that make downstream steps faster, higher quality, and more automatable. The unlock is compound value.
              </p>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '8px' }}>✓ Evidence → Structured truth set → Multi-channel assets</div>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '8px' }}>✓ SME interview → Playbook → Interactive copilot</div>
                <div style={{ fontSize: '13px', color: `${PAQ_COLORS.navy}CC` }}>✓ Policy docs → Machine rules → Auto-compliance</div>
              </div>
              <div style={{ paddingTop: '16px', borderTop: `1px solid ${PAQ_COLORS.magenta}40` }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: PAQ_COLORS.magenta }}>VALUE: Operating model transformation</p>
              </div>
            </div>
          </div>

          {/* Featured Workflow Example */}
          <div style={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginTop: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: PAQ_COLORS.magenta }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Featured Workflow: AI Video Production</h3>
              <p style={{ color: 'white', opacity: 0.9, fontSize: '10px' }}>Step-by-step example using Sora 2 / Veo 3.1</p>
            </div>
            
            <div style={{ padding: '12px', backgroundColor: PAQ_COLORS.lightGray }}>
              <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '12px', lineHeight: '1.4' }}>
                <span style={{ color: PAQ_COLORS.navy, fontSize: '10px' }}>Challenge:</span> <span style={{ fontSize: '10px' }}>Modern AI video tools like Sora 2 and Veo 3.1 have an 8-second limit per clip. Traditional marketing scripts need to be restructured for this format while maintaining narrative flow and visual impact.</span>
              </div>

              {/* Workflow Steps - Expanded */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Step 1 */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: PAQ_COLORS.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>1</span>
                    </div>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: PAQ_COLORS.navy }}>Marketing Team Creates Original Script</h4>
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4' }}>
                    <div style={{ fontSize: '10px' }}><span style={{ fontSize: '10px' }}>"Our new platform revolutionizes customer engagement through AI-powered insights, real-time analytics, and seamless integration with your existing tools. Join thousands of companies transforming their workflows..."</span></div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: PAQ_COLORS.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>2</span>
                    </div>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: PAQ_COLORS.navy }}>AI Reorganizes Into 8-Second Segments</h4>
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '4px', fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 1:</span> <span style={{ fontSize: '10px' }}>"Our new platform revolutionizes customer engagement through AI-powered insights"</span></div>
                    <div style={{ marginBottom: '4px', fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 2:</span> <span style={{ fontSize: '10px' }}>"Real-time analytics and seamless integration with your existing tools"</span></div>
                    <div style={{ fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 3:</span> <span style={{ fontSize: '10px' }}>"Join thousands of companies transforming their workflows"</span></div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: PAQ_COLORS.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>3</span>
                    </div>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: PAQ_COLORS.navy }}>AI Outlines Visual Elements</h4>
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '4px', fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 1:</span> <span style={{ fontSize: '10px' }}>Dashboard interface with AI brain icon animating in center, data particles flowing, modern tech aesthetic</span></div>
                    <div style={{ marginBottom: '4px', fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 2:</span> <span style={{ fontSize: '10px' }}>Split screen showing analytics charts on left, software logos connecting with glowing lines</span></div>
                    <div style={{ fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>Seg 3:</span> <span style={{ fontSize: '10px' }}>Global map with company logos appearing as glowing pins, counter showing growing numbers</span></div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: PAQ_COLORS.magenta, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>4</span>
                    </div>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: PAQ_COLORS.navy }}>AI Generates Video Prompts</h4>
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.4' }}>
                    <div style={{ backgroundColor: `${PAQ_COLORS.navy}05`, borderRadius: '6px', padding: '8px', marginBottom: '0', fontSize: '10px' }}>
                      <div style={{ marginBottom: '4px', fontSize: '10px' }}><span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>SORA 2 / VEO 3.1 PROMPT:</span></div>
                      <div style={{ fontSize: '10px' }}><span style={{ fontSize: '10px' }}>"Professional tech commercial style, modern dashboard interface with holographic AI brain icon materializing in center, blue and purple data particles flowing outward, sleek glassmorphism design, 8K quality, cinematic lighting, depth of field, brand colors: navy blue and electric purple, duration: 8 seconds"</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Outcome */}
              <div style={{ marginTop: '10px', borderRadius: '8px', padding: '10px', backgroundColor: `${PAQ_COLORS.magenta}10`, border: `1px solid ${PAQ_COLORS.magenta}33` }}>
                <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '6px', lineHeight: '1.4' }}>
                  <span style={{ color: PAQ_COLORS.navy, fontSize: '10px' }}>Outcome:</span> <span style={{ fontSize: '10px' }}>Manual storyboarding traditionally requiring significant time investment can be dramatically accelerated. The marketing team receives production-ready video segments that maintain brand consistency and narrative flow.</span>
                </div>
                <div style={{ fontSize: '10px', color: PAQ_COLORS.magenta, marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px' }}>This is a multi-step pipeline: each artifact compounds to make the next step faster and better.</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                  <span style={{ color: PAQ_COLORS.magenta, fontSize: '10px' }}>✓ Dramatic time savings</span>
                  <span style={{ color: PAQ_COLORS.greenAccent, fontSize: '10px' }}>✓ Professional quality at scale</span>
                </div>
              </div>
            </div>
          </div>
        
        {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}66` }}>
              AI Use Cases Guide • eLearning, L&D • 2026 • Precision AQ
            </p>
          </div>
        </div>        

        {/* Page 3: Beyond Healthcare - General AI Use Cases (Part 1) */}
        <div className="pdf-page" style={{ padding: '10mm 12mm', backgroundColor: PAQ_COLORS.white }}>
        <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Beyond Healthcare: General AI Use Cases</h2>
          <p style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Inspire innovative thinking across all business functions</p>
        </div>

        {useCases.slice(0, 2).map((category, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '12px' }}>
            <div style={{ backgroundColor: PAQ_COLORS.magenta, borderRadius: '8px 8px 0 0', padding: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{category.category}</h3>
            </div>
            <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '0 0 8px 8px', padding: '10px' }}>
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px', marginBottom: itemIdx < category.items.length - 1 ? '8px' : '0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '11px', color: `${PAQ_COLORS.navy}99`, marginBottom: '8px', lineHeight: '1.4' }}>{item.description}</p>
                  <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '6px' }}>→ {item.use}</p>
                  <div style={{ fontSize: '10px', color: PAQ_COLORS.greenAccent }}>✓ {item.impact}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}66` }}>
            AI Use Cases Guide • eLearning, L&D • 2026 • Precision AQ
          </p>
        </div>
        </div>

        {/* Page 4: Revenue Operations */}
        <div className="pdf-page" style={{ padding: '10mm 12mm', backgroundColor: PAQ_COLORS.white }}>
        {useCases.slice(2, 3).map((category, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '12px' }}>
            <div style={{ backgroundColor: PAQ_COLORS.magenta, borderRadius: '8px 8px 0 0', padding: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>{category.category}</h3>
            </div>
            <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '0 0 8px 8px', padding: '10px' }}>
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '10px', marginBottom: itemIdx < category.items.length - 1 ? '8px' : '0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '11px', color: `${PAQ_COLORS.navy}99`, marginBottom: '8px', lineHeight: '1.4' }}>{item.description}</p>
                  <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '6px' }}>→ {item.use}</p>
                  <div style={{ fontSize: '10px', color: PAQ_COLORS.greenAccent }}>✓ {item.impact}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Best Practices & Guardrails */}
        <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '16px', marginBottom: '16px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Best Practices & Guardrails</h2>
          <p style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>Healthcare-specific AI implementation guidelines</p>
        </div>

        <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '12px', padding: '12px' }}>
          {bestPractices.map((practice, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px', marginBottom: idx < bestPractices.length - 1 ? '10px' : '0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ color: PAQ_COLORS.greenAccent, fontSize: '16px', flexShrink: 0 }}>✓</div>
              <span style={{ fontSize: '14px', color: `${PAQ_COLORS.navy}CC`, lineHeight: '1.5' }}>{practice.text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '12px', backgroundColor: PAQ_COLORS.magenta, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>Ready to Transform Your Healthcare Content Workflow?</h3>
          <p style={{ fontSize: '13px', color: 'white', opacity: 0.9, marginBottom: '12px' }}>
            Start with one pipeline this week. Measure the compound value. Scale what works.
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 16px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: 'white', fontWeight: '600', fontSize: '12px' }}>Questions? Reach out to eLearning, L&D team</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}66` }}>
            AI Use Cases Guide • eLearning, L&D • 2026 • Precision AQ
          </p>
        </div>
        </div>

        {/* Page 5: How This Document Was Made */}
        <div className="pdf-page" style={{ padding: '15mm 12mm', backgroundColor: PAQ_COLORS.white }}>
          <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>How This Document Was Made</h2>
            <p style={{ color: 'white', opacity: 0.9, fontSize: '14px' }}>AI-powered workflow demonstration</p>
          </div>

          <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { num: '1', title: 'Research', tool: 'Copilot Research AI Agent' },
                  { num: '2', title: 'Framing', tool: 'Copilot 365' },
                  { num: '3', title: 'Branding and Company Research', tool: 'Claude Sonnet 4.5 (Copilot for GitHub)' },
                  { num: '4', title: 'Page Design and Research Summary', tool: 'Claude Sonnet 4.5 (Copilot for GitHub)' },
                  { num: '5', title: 'Review and Update', tool: 'Claude Sonnet 4.5 (Copilot for GitHub)' }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: `${PAQ_COLORS.magenta}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: '700', fontSize: '11px', color: PAQ_COLORS.magenta }}>{step.num}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: PAQ_COLORS.navy, fontSize: '10px', marginBottom: '1px' }}>{step.title}</div>
                      <div style={{ fontSize: '9px', color: `${PAQ_COLORS.navy}99` }}>{step.tool}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost & Time Comparison */}
          <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: PAQ_COLORS.navy, marginBottom: '10px' }}>Cost & Time Comparison</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {/* AI-Powered Approach */}
                <div style={{ backgroundColor: `${PAQ_COLORS.greenAccent}10`, borderRadius: '8px', padding: '10px', border: `1px solid ${PAQ_COLORS.greenAccent}40` }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: PAQ_COLORS.greenAccent, marginBottom: '8px' }}>✓ AI-POWERED APPROACH</div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>Time:</strong> 4.5 hours
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>Labor Cost:</strong> $164 (Digital Content Creator @ $76,000/year)
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>AI Tools:</strong> $2 (tokens) + $65/month (GitHub Copilot + Copilot 365)
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: PAQ_COLORS.greenAccent, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${PAQ_COLORS.greenAccent}40` }}>
                    Total: $166 (one-time labor)
                  </div>
                </div>

                {/* Traditional Approach */}
                <div style={{ backgroundColor: `${PAQ_COLORS.navy}05`, borderRadius: '8px', padding: '10px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: `${PAQ_COLORS.navy}CC`, marginBottom: '8px' }}>TRADITIONAL APPROACH</div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>Time:</strong> ~25 hours (estimated)
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>Writer:</strong> $764 (@ $63,500/year)
                  </div>
                  <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC`, marginBottom: '4px' }}>
                    <strong style={{ color: PAQ_COLORS.navy }}>Content Creator:</strong> $913 (@ $76,000/year)
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: PAQ_COLORS.navy, marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${PAQ_COLORS.navy}20` }}>
                    Total: $1,677
                  </div>
                </div>
              </div>

              {/* Savings Summary */}
              <div style={{ backgroundColor: `${PAQ_COLORS.magenta}10`, borderRadius: '8px', padding: '10px', border: `1px solid ${PAQ_COLORS.magenta}40`, textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: PAQ_COLORS.magenta, marginBottom: '6px' }}>
                  💡 SAVINGS: $1,511 (90% cost reduction) • 20.5 hours saved (82% time reduction)
                </div>
                <div style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}CC` }}>
                  Research, design, and production completed in a single morning vs. days of traditional work
                </div>
              </div>
            </div>
          </div>

          {/* References */}
          <div style={{ backgroundColor: PAQ_COLORS.navy, borderRadius: '12px', padding: '12px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>References</h3>
            <p style={{ color: 'white', opacity: 0.9, fontSize: '12px' }}>Research sources and citations</p>
          </div>

          <div style={{ backgroundColor: PAQ_COLORS.lightGray, borderRadius: '12px', padding: '12px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>1</sup> Generative AI increases writing productivity by ~40%
                </div>
                <p style={{ fontSize: '10px', color: PAQ_COLORS.magenta }}>https://www.science.org/doi/10.1126/science.adh2586</p>
              </div>
              <div style={{ marginBottom: '12px', paddingTop: '12px', borderTop: `1px solid ${PAQ_COLORS.navy}20` }}>
                <div style={{ fontWeight: '600', color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>2</sup> Marketing teams create content 3.5x faster with AI
                </div>
                <p style={{ fontSize: '10px', color: PAQ_COLORS.magenta }}>https://www.hubspot.com/state-of-marketing</p>
              </div>
              <div style={{ paddingTop: '12px', borderTop: `1px solid ${PAQ_COLORS.navy}20` }}>
                <div style={{ fontWeight: '600', color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
                  <sup style={{ color: PAQ_COLORS.magenta }}>3</sup> 65% of organisations using generative AI regularly
                </div>
                <p style={{ fontSize: '10px', color: PAQ_COLORS.magenta }}>https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-2024</p>
              </div>

              <div style={{ paddingTop: '12px', borderTop: `1px solid ${PAQ_COLORS.navy}20` }}>
                <div style={{ fontWeight: '600', color: PAQ_COLORS.navy, fontSize: '11px', marginBottom: '6px' }}>Additional Research Sources</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '9px' }}>
                  <div>
                    <div style={{ color: `${PAQ_COLORS.navy}CC`, marginBottom: '2px' }}>Customer support productivity lift (~14%)</div>
                    <div style={{ color: PAQ_COLORS.magenta }}>https://www.nber.org/papers/w31161</div>
                  </div>
                  <div>
                    <div style={{ color: `${PAQ_COLORS.navy}CC`, marginBottom: '2px' }}>GenAI economic potential ($2.6T–$4.4T annually)</div>
                    <div style={{ color: PAQ_COLORS.magenta }}>McKinsey: Economic Potential of Generative AI</div>
                  </div>
                  <div>
                    <div style={{ color: `${PAQ_COLORS.navy}CC`, marginBottom: '2px' }}>AI global economic impact projection ($15.7T by 2030)</div>
                    <div style={{ color: PAQ_COLORS.magenta }}>PwC: AI Economic Impact</div>
                  </div>
                  <div>
                    <div style={{ color: `${PAQ_COLORS.navy}CC`, marginBottom: '2px' }}>AI adoption acceleration (55% to 78%)</div>
                    <div style={{ color: PAQ_COLORS.magenta }}>Stanford AI Index 2025</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ color: `${PAQ_COLORS.navy}CC`, marginBottom: '2px' }}>AI ROI challenges and strategy importance</div>
                    <div style={{ color: PAQ_COLORS.magenta }}>Deloitte: AI ROI Paradox</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '10px', color: `${PAQ_COLORS.navy}66` }}>
              AI Use Cases Guide • eLearning, L&D • 2026 • Precision AQ
            </p>
          </div>
        </div>
        </div>
    </div>
  );
}