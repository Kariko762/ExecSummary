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
  FileCheck
} from 'lucide-react';

// Precision AQ Brand Colors (from official logo SVG)
const PAQ_COLORS = {
  magenta: '#CB009F',  // Official logo magenta
  navy: '#0F1822',     // Official logo navy
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  greenAccent: '#8BC53F',
};

export default function AIUseCasePage() {
  const [isExporting, setIsExporting] = useState(false);
  const [screenSize, setScreenSize] = useState<75 | 95 | 100>(100);
  const contentRef = useRef<HTMLDivElement>(null);

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

      // Remove scroll constraints temporarily
      element.style.overflow = 'visible';
      element.style.height = 'auto';
      element.style.maxHeight = 'none';

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Restore original styles
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;

      const link = document.createElement('a');
      link.download = `ai-use-cases-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
          time: '3 min vs 20 min',
          impact: 'Professional tone, never miss key points'
        },
        {
          title: 'Video Script Generation',
          description: 'Transform marketing scripts into 8-second AI video segments for Sora 2 and Veo 3.1',
          icon: Video,
          use: 'Marketing writes full script → AI breaks into 8-sec segments → outlines visual elements → generates video prompts → creates video in Sora/Veo',
          time: '5 min vs 2 hours',
          impact: 'Professional video production at scale'
        },
        {
          title: 'Infographic Design Briefs',
          description: 'Generate data-driven infographic concepts and copy from raw data',
          icon: ImageIcon,
          use: 'Upload data/stats → AI creates visual hierarchy, callouts, and design recommendations',
          time: '10 min vs 1 day',
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
          time: 'Instant vs 2-day email chain',
          impact: 'Reduced HR workload, improved compliance'
        },
        {
          title: 'SharePoint Copilot Integration',
          description: 'Link Copilot to corporate SharePoint for intelligent content summaries',
          icon: FileText,
          use: 'Connect to document libraries → Ask "Summarize Q4 strategy docs" or "Find all mentions of Project X"',
          time: '30 sec vs 2 hours searching',
          impact: 'Knowledge accessibility, faster decisions'
        },
        {
          title: 'Training Module Summarization',
          description: 'Auto-generate executive summaries of lengthy training content',
          icon: Brain,
          use: 'Upload course materials → AI creates condensed learning guides, key takeaways, and quiz questions',
          time: '2 min vs 8 hours',
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
          time: '15 min vs 4 hours',
          impact: 'Higher win rates, consistent quality'
        },
        {
          title: 'Sales Enablement Content',
          description: 'Generate battlecards, objection handlers, and one-pagers from product docs',
          icon: Zap,
          use: 'Upload technical specs → AI creates sales-friendly summaries, competitive positioning, and talk tracks',
          time: '10 min vs 3 days',
          impact: 'Faster onboarding, better conversations'
        },
        {
          title: 'Performance Report Narratives',
          description: 'Convert sales data into executive-ready performance stories',
          icon: BarChart3,
          use: 'Connect to CRM/BI → AI generates insights, trend analysis, and recommendation narratives',
          time: '5 min vs 6 hours',
          impact: 'Data-driven decisions, clear insights'
        }
      ]
    }
  ];

  const bestPractices = [
    { icon: CheckCircle2, text: 'Always review AI output for accuracy and brand voice alignment' },
    { icon: CheckCircle2, text: 'Use AI for first drafts, humans for final polish and context' },
    { icon: CheckCircle2, text: 'Train custom models on your company\'s tone and style guides' },
    { icon: CheckCircle2, text: 'Establish approval workflows for client-facing AI-generated content' },
    { icon: CheckCircle2, text: 'Track time savings to quantify ROI and justify AI investments' }
  ];

  const quickWins = [
    { title: 'Week 1', action: 'Email summaries', impact: 'Reclaim executive time' },
    { title: 'Week 2', action: 'Meeting notes → follow-ups', impact: 'Never miss action items' },
    { title: 'Week 3', action: 'Policy chatbot deployment', impact: 'Instant answers, reduced workload' },
    { title: 'Week 4', action: 'Video script automation', impact: 'Dramatically faster production' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-auto">
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
                onClick={cycleScreenSize}
                className="p-2 rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: PAQ_COLORS.magenta }}
                title={screenSize === 75 ? 'Expand to 95%' : screenSize === 95 ? 'Fullscreen' : 'Collapse to 75%'}
              >
                {screenSize === 100 ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
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
              <Lightbulb className="w-4 h-4" style={{ color: PAQ_COLORS.magenta }} />
              <span className="text-sm font-roobert-semibold" style={{ color: PAQ_COLORS.magenta }}>Knowledge & Innovation</span>
            </div>
            <h2 className="text-4xl font-roobert-bold text-white mb-4 leading-tight">
              Unlock AI-Powered Productivity for <span style={{ color: PAQ_COLORS.magenta }}>Content Teams</span>
            </h2>
            <p className="text-lg text-white leading-relaxed mb-8" style={{ opacity: 0.8 }}>
              Modern digital content creators are leveraging AI to automate repetitive tasks, accelerate content production, 
              and deliver higher-quality outputs. This guide showcases proven use cases across Go-to-Market, Enablement, 
              Revenue Operations, and e-Learning teams.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>~40%<sup className="text-lg">¹</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Faster writing tasks with AI assistance</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>~55%<sup className="text-lg">²</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Faster code completion with GitHub Copilot</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-roobert-bold" style={{ color: PAQ_COLORS.magenta }}>65%<sup className="text-lg">³</sup></div>
                <div className="text-sm text-white" style={{ opacity: 0.7 }}>Of organizations now using GenAI regularly</div>
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

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-roobert-bold text-white text-lg" style={{ backgroundColor: PAQ_COLORS.greenAccent }}>
                  5
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-roobert-bold mb-2" style={{ color: PAQ_COLORS.navy }}>AI Creates Final Video</h4>
                  <div className="rounded-lg p-6 border" style={{ backgroundColor: `${PAQ_COLORS.greenAccent}15`, borderColor: `${PAQ_COLORS.greenAccent}40` }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${PAQ_COLORS.greenAccent}33` }}>
                        <Video className="w-8 h-8" style={{ color: PAQ_COLORS.greenAccent }} />
                      </div>
                      <div>
                        <div className="font-roobert-bold mb-1" style={{ color: PAQ_COLORS.navy }}>3 Video Clips Generated</div>
                        <div className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>Total length: 24 seconds • Ready for editing & assembly</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border text-center" style={{ borderColor: '#E5E7EB' }}>
                        <div className="text-2xl font-roobert-bold" style={{ color: PAQ_COLORS.greenAccent }}>8s</div>
                        <div className="text-xs" style={{ color: `${PAQ_COLORS.navy}99` }}>Segment 1</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border text-center" style={{ borderColor: '#E5E7EB' }}>
                        <div className="text-2xl font-roobert-bold" style={{ color: PAQ_COLORS.greenAccent }}>8s</div>
                        <div className="text-xs" style={{ color: `${PAQ_COLORS.navy}99` }}>Segment 2</div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border text-center" style={{ borderColor: '#E5E7EB' }}>
                        <div className="text-2xl font-roobert-bold" style={{ color: PAQ_COLORS.greenAccent }}>8s</div>
                        <div className="text-xs" style={{ color: `${PAQ_COLORS.navy}99` }}>Segment 3</div>
                      </div>
                    </div>
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
                    What would have taken 2 hours of manual storyboarding, prompt writing, and iteration is completed in 5 minutes. 
                    The marketing team receives production-ready video segments that maintain brand consistency and narrative flow.
                  </p>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: PAQ_COLORS.magenta }} />
                      <span style={{ color: `${PAQ_COLORS.navy}CC` }}><strong style={{ color: PAQ_COLORS.magenta }}>95% time reduction</strong></span>
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

        {/* Use Case Categories */}
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
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold text-white">Best Practices & Guardrails</h3>
                <p className="text-white/90 text-sm">Responsible AI implementation guidelines</p>
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
                <h3 className="text-2xl font-roobert-bold text-white">30-Day Quick Win Roadmap</h3>
                <p className="text-white/90 text-sm">Start small, scale fast</p>
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
            <h3 className="text-3xl font-roobert-bold text-white mb-4">Ready to Transform Your Workflow?</h3>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start with one use case this week. Measure the impact. Scale what works.
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
          <div className="p-6" style={{ backgroundColor: `${PAQ_COLORS.magenta}10` }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${PAQ_COLORS.magenta}20` }}>
                <Sparkles className="w-7 h-7" style={{ color: PAQ_COLORS.magenta }} />
              </div>
              <div>
                <h3 className="text-2xl font-roobert-bold" style={{ color: PAQ_COLORS.navy }}>How This Document Was Made</h3>
                <p className="text-sm" style={{ color: `${PAQ_COLORS.navy}99` }}>AI-powered workflow demonstration</p>
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
                <FileText className="w-7 h-7 text-white" />
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
                  <sup style={{ color: PAQ_COLORS.magenta }}>2</sup> Developers using GitHub Copilot completed coding tasks ~55% faster
                </div>
                <p className="text-sm mb-2" style={{ color: `${PAQ_COLORS.navy}99` }}>
                  GitHub's controlled research showed developers with AI coding assistance finished tasks significantly faster and reported higher satisfaction.
                </p>
                <a 
                  href="https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-roobert-semibold hover:underline"
                  style={{ color: PAQ_COLORS.magenta }}
                >
                  https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/ ↗
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
            AI Use Cases Guide • Digital Content Creators • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
