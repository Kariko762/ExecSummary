import { useState, useRef } from 'react';
import { Cpu, Layers, TrendingUp, Users, CheckCircle2, XCircle, Target, Shield, Globe, Maximize2, Minimize2, Download, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

type TabType = 'technical' | 'business';

interface Tool {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
}

export default function TechnologyStackOverview() {
  const [activeTab, setActiveTab] = useState<TabType>('technical');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75); // 75vw or 95vw
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    
    try {
      const container = contentRef.current;
      
      // Store original styles
      const originalOverflow = container.style.overflow;
      
      // Temporarily remove scroll restrictions for full capture
      container.style.overflow = 'visible';
      
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await domToPng(container, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: container.scrollWidth,
        height: container.scrollHeight,
      });

      // Restore original styles
      container.style.overflow = originalOverflow;

      const link = document.createElement('a');
      link.download = `technology-stack-overview-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const tools: Tool[] = [
    { id: 'coast', name: 'Coast', role: 'Demo Automation & Delivery', icon: '🎯', color: 'blue' },
    { id: 'synthesia', name: 'Synthesia', role: 'AI Video Generation', icon: '🎬', color: 'purple' },
    { id: 'tiled', name: 'Tiled', role: 'Centralized Microsites', icon: '🏗️', color: 'indigo' },
    { id: 'figma', name: 'Figma', role: 'Design System', icon: '🎨', color: 'pink' },
    { id: 'powtoon', name: 'Powtoon', role: 'Marketing Video Creation', icon: '📹', color: 'green' }
  ];

  // Map tools to their vendor content IDs (if they exist)
  const vendorContentMap: Record<string, string> = {
    'Coast': 'coast-vendor-summary-q1-2026', // Coast Vendor Summary - Q1 2026
    // Add more as vendor pages are created
    // 'Synthesia': 'synthesia-vendor-summary',
    // 'Tiled': 'tiled-vendor-summary',
  };

  const handleToolClick = async (toolName: string) => {
    const contentId = vendorContentMap[toolName];
    if (!contentId) {
      console.log(`No vendor page for ${toolName} yet`);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/content/${contentId}`);
      const _data = await response.json();
      
      // Open in new window/tab (or you could use a modal)
      window.open(`#/technologies`, '_blank');
      
      // Alternative: Use a callback if you want to open in modal
      // if (onSelectContent) {
      //   onSelectContent(data);
      // }
    } catch (error) {
      console.error(`Failed to fetch ${toolName} vendor content:`, error);
    }
  };

  const revenueStages = [
    {
      stage: 'Top of Funnel',
      goal: 'Create interest, build trust, provide on-demand access to knowledge',
      tools: ['Powtoon', 'Synthesia', 'Coast', 'Tiled'],
      impact: '**Accelerated Sales Velocity** — Brand-led storytelling and scalable explainer videos enable self-service buyer education',
      details: [
        'Powtoon & Synthesia: Marketing videos and AI-generated content explain value quickly',
        'Coast: General or personalized demo experiences before initial conversations increase buyer knowledge, speed up discovery and qualification while breeding trust',
        'Tiled: On-demand sales content platform allows clients to access resources at their own pace, building trust and highlighting additional ways we can support their needs'
      ]
    },
    {
      stage: 'Mid-Funnel',
      goal: 'Deliver hyper-personalized, persona-based selling without demo prep overhead',
      tools: ['Coast', 'Synthesia', 'Tiled', 'Figma'],
      impact: '**Reduced Time-to-Value (TTV)** — Personalized, tailored demos delivered with minimal prep time maximize efficiency',
      details: [
        'Spend more time on hyper-specific use cases without additional work cycles building them',
        'Persona-based selling shows exactly how tools affect day-to-day operations for buyers and their customers',
        'Figma ensures consistent, high-quality design across all personalized experiences'
      ]
    },
    {
      stage: 'Late Funnel',
      goal: 'Provide executive-visible data, ROI analysis, and build C-level confidence',
      tools: ['Coast', 'Tiled', 'Synthesia'],
      impact: '**Risk Mitigation & Executive Confidence** — ROI data and strategic value presentation reduce deal friction',
      details: [
        'Tiled: Curated executive microsites with business case, ROI calculators, and strategic narratives',
        'Coast: Executive-focused demo flows highlighting business outcomes vs technical features',
        'Synthesia: Personalized executive briefings and value summaries at scale'
      ]
    },
    {
      stage: 'Bottom of Funnel',
      goal: 'Deliver comprehensive proof with personalized Digital Sales Rooms (DSR)',
      tools: ['Tiled', 'Coast', 'Synthesia'],
      impact: '**Accelerated Close Velocity** — Complete DSR with personalized proof points and social proof reduces risk and expedites decisions',
      details: [
        'Complete Digital Sales Room with all personalized content and demos in one place',
        'Real-world use cases and customer testimonials show where others have benefited',
        'SE-independent execution reduces bottlenecks and accelerates close',
        'Curated proof points reduce risk and build final-stage confidence'
      ]
    },
    {
      stage: 'Post-Sale & Expansion',
      goal: 'Enable adoption, onboarding, training, and expansion opportunities',
      tools: ['Synthesia', 'Coast', 'Tiled', 'Powtoon'],
      impact: '**Increased NRR & Reduced Churn** — Reusable education and training resources improve adoption, reduce support costs, and enable expansion',
      details: [
        'Seller enablement and training resources at scale',
        'Post-contract knowledge base and onboarding guides',
        'Customer success microsites with ongoing education and expansion content',
        'Living customer hub supports adoption, upsell, and renewal conversations'
      ]
    }
  ];

  const toolMatrix = [
    {
      tool: 'Coast',
      primaryRole: 'Demo Automation & Delivery',
      functionality: ['**Live & guided demos**', '**API-driven, data-accurate** demos', '**Reusable demo flows**', 'Supports technical products'],
      whatItIsNot: ['Not a marketing video tool', 'Not a static walkthrough'],
      whyWeNeedIt: 'Enables **scalable, accurate, repeatable demos** without heavy SE involvement — accelerating sales velocity and reducing time-to-value',
      connections: ['Consumes videos from Synthesia & Powtoon', 'Embedded or launched via Tiled']
    },
    {
      tool: 'Synthesia',
      primaryRole: 'AI Video Generation (Demo-Grade)',
      functionality: ['**AI avatar videos** from text', '**Scalable personalization**', '**API-generated videos**', '**Fast iteration** for updates'],
      whatItIsNot: ['Not interactive demos', 'Not marketing animation'],
      whyWeNeedIt: 'Creates narration, explainers, and walkthrough layers that **enhance demos without video production overhead** — enabling personalization at scale',
      connections: ['Feeds AI videos into Coast demos', 'Can be embedded in Tiled microsites']
    },
    {
      tool: 'Tiled',
      primaryRole: 'Centralized Microsites & Content Experiences',
      functionality: ['**Interactive microsites**', '**Personalized buyer journeys**', '**Engagement analytics**', '**GTM content orchestration**'],
      whatItIsNot: ['Not a demo engine', 'Not a design tool'],
      whyWeNeedIt: '**The Delivery System** — acts as the single front door for buyers, sellers, and execs. Without Tiled, high-quality content from Figma and Synthesia stays trapped in silos',
      connections: ['Hosts Coast demos', 'Hosts Synthesia videos', 'Designed using Figma']
    },
    {
      tool: 'Figma',
      primaryRole: 'Design System & Experience Design',
      functionality: ['**UI/UX design**', '**Layouts for microsites**', '**Brand-consistent components**', '**Rapid iteration**'],
      whatItIsNot: ['Not a delivery platform', 'Not customer-facing'],
      whyWeNeedIt: 'Ensures Tiled experiences are high-quality, on-brand, and intentional — **eliminates development bottleneck** and enables **design-to-live in minutes**, supporting adoption at scale without overhead',
      connections: ['Design-to-live deployment into Tiled']
    },
    {
      tool: 'Powtoon',
      primaryRole: 'Marketing Video Creation',
      functionality: ['**Animated marketing videos**', '**Campaign, brand, and awareness** content', '**Non-technical storytelling**'],
      whatItIsNot: ['Not demo-accurate', 'Not API-driven', 'Not personalized at scale'],
      whyWeNeedIt: 'Serves **top-of-funnel marketing needs** that are intentionally separate from demo engineering — reducing production overhead while maintaining brand consistency',
      connections: ['Standalone', 'Optional embed into Tiled for campaigns']
    }
  ];

  const risks = [
    {
      type: 'Strategic Risk',
      items: ['Slower response to market and product changes', 'Inability to personalize at scale', 'Over-reliance on scarce SE resources']
    },
    {
      type: 'Revenue Risk',
      items: ['Longer sales cycles', 'Inconsistent demo quality', 'Reduced win rates in competitive deals']
    },
    {
      type: 'Talent & Cost Risk',
      items: ['Burnout of demo engineers', 'Higher cost per demo', 'Difficulty hiring modern demo talent']
    },
    {
      type: 'Perception Risk',
      items: ['Buyers expect self-guided demos', 'On-demand proof expected', 'Polished digital experiences standard']
    }
  ];

  const getToolColor = (toolName: string) => {
    const tool = tools.find(t => t.name === toolName);
    if (!tool) return 'gray';
    return tool.color;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; badge: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', badge: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
      green: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-800/50', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700', badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }
    };
    return colors[color] || colors.gray;
  };

  // Helper to render text with **bold** markdown
  const renderTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-roobert-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant py-8">
      <div ref={contentRef} className={`${
        isFullscreen 
          ? 'w-full rounded-none' 
          : modalWidth === 95
            ? 'w-[95vw] rounded-xl'
            : 'w-[75vw] rounded-xl'
      } transition-all duration-300 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-fis-navy to-fis-eggplant dark:from-gray-950 dark:to-purple-950">
          <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-roobert-semibold text-white">
                  Demo & GTM Tooling Stack
                </h1>
                <p className="text-white/70 mt-1">
                  Complete overview of our revenue technology ecosystem
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors disabled:opacity-50"
                title="Export as Image"
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
                className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 transition-colors"
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
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('technical')}
              className={`relative py-4 px-2 font-roobert-semibold text-sm transition-colors ${
                activeTab === 'technical'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>Technical Overview & Use Cases</span>
              </div>
              {activeTab === 'technical' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`relative py-4 px-2 font-roobert-semibold text-sm transition-colors ${
                activeTab === 'business'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Business Justification & ROI</span>
              </div>
              {activeTab === 'business' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {activeTab === 'technical' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Executive Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                    This is not overlap — it's a pipeline
                  </h2>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    Each tool owns a distinct layer of the revenue experience. One tool cannot replace another.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                {tools.map((tool) => {
                  const colors = getColorClasses(tool.color);
                  return (
                    <div key={tool.id} className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
                      <div className="text-2xl mb-2">{tool.icon}</div>
                      <div className={`text-sm font-roobert-semibold ${colors.text} mb-1`}>{tool.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{tool.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tool Matrix */}
            <div>
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                Tool Capabilities & Integration Map
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {toolMatrix.map((item) => {
                  const tool = tools.find(t => t.name === item.tool);
                  const colors = getColorClasses(tool?.color || 'gray');
                  const hasVendorPage = !!vendorContentMap[item.tool];
                  
                  return (
                    <div 
                      key={item.tool} 
                      className={`${colors.bg} rounded-xl p-6 border ${colors.border} relative`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{tool?.icon}</div>
                          <div>
                            <h3 className={`text-xl font-roobert-bold ${colors.text}`}>{item.tool}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.primaryRole}</p>
                          </div>
                        </div>
                        {hasVendorPage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToolClick(item.tool);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200"
                            title="View Vendor Overview"
                          >
                            <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">Details</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Core Functionality */}
                        <div>
                          <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            Core Functionality
                          </h4>
                          <ul className="space-y-1">
                            {item.functionality.map((func, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                                <span>{renderTextWithBold(func)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* What It Is Not */}
                        <div>
                          <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            What It Is Not
                          </h4>
                          <ul className="space-y-1">
                            {item.whatItIsNot.map((not, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                                <span>{not}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">Why We Need It</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{renderTextWithBold(item.whyWeNeedIt)}</p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 uppercase">Connects to:</span>
                          {item.connections.map((conn, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded text-xs font-roobert-medium ${colors.badge}`}>
                              {conn}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Integration Flow */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-6">How Tools Work Together</h2>
              <div className="flex items-center justify-center">
                <img 
                  src="/tool-flow-diagram.png" 
                  alt="Tool Integration Flow Diagram" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'business' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Revenue Lifecycle Mapping */}
            <div>
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                Revenue Stage Deployment Matrix
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This stack supports the entire revenue motion — not just demos.
              </p>
              <div className="space-y-4">
                {revenueStages.map((stage, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-roobert-bold flex items-center justify-center text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">{stage.stage}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="font-roobert-semibold">Goal:</span> {stage.goal}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {stage.tools.map((toolName) => {
                            const color = getToolColor(toolName);
                            const colors = getColorClasses(color);
                            return (
                              <span key={toolName} className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${colors.badge}`}>
                                {toolName}
                              </span>
                            );
                          })}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 mb-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-roobert-semibold text-gray-900 dark:text-white">Impact:</span> {renderTextWithBold(stage.impact)}
                          </p>
                        </div>
                        {stage.details && stage.details.length > 0 && (
                          <div className="space-y-1.5">
                            {stage.details.map((detail, detailIdx) => (
                              <div key={detailIdx} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 flex-shrink-0" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">{detail}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive & Market Risk */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                    Risk of Not Investing
                  </h2>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    Your competitors are not choosing one tool — they are assembling stacks that cover all layers.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {risks.map((risk, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h3 className="text-sm font-roobert-bold text-red-600 dark:text-red-400 mb-2">{risk.type}</h3>
                    <ul className="space-y-1">
                      {risk.items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Reality */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                    Market Reality
                  </h2>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-4">
                    Across enterprise SaaS and platform companies:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">Demo automation is replacing one-off SE-led demos</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Supports PLG motions, global scale, and lower cost per opportunity</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">AI-generated video is becoming standard</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">Enables personalization at scale, faster updates, and reduced production costs</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">Interactive microsites are replacing traditional assets</div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">No more static PDFs, disconnected sales assets, or email attachment sprawl. Modern B2B buyers demand self-service experiences \u2014 this stack enables that buyer-led journey.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Positioning */}
            <div className="bg-gradient-to-r from-fis-navy to-fis-eggplant dark:from-gray-950 dark:to-purple-950 rounded-xl p-6 border border-blue-300 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Users className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-roobert-bold text-white mb-3">
                    Executive-Level Positioning
                  </h2>
                  <div className="space-y-3 text-white/90">
                    <p className="text-sm font-roobert-semibold">
                      "This is not about buying tools."
                    </p>
                    <p className="text-sm">
                      It's about building a modern, scalable revenue and demo capability that our competitors are already investing in.
                    </p>
                    <p className="text-sm">
                      Each tool covers a distinct layer — awareness, explanation, proof, and orchestration — and removing any one of them creates friction, cost, or risk elsewhere.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* One-Line Summary */}
            <div>
              <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-4">
                One-Line Summary Per Tool
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'Powtoon', summary: 'Scalable marketing storytelling', color: 'green' },
                  { name: 'Synthesia', summary: 'AI-powered explanation at global scale', color: 'purple' },
                  { name: 'Coast', summary: 'Accurate, repeatable, API-driven demos', color: 'blue' },
                  { name: 'Tiled', summary: 'Centralized buyer and seller experience', color: 'indigo' },
                  { name: 'Figma', summary: 'Design governance and experience quality', color: 'pink' }
                ].map((item) => {
                  const colors = getColorClasses(item.color);
                  return (
                    <div key={item.name} className={`flex items-center gap-3 ${colors.bg} rounded-lg p-3 border ${colors.border}`}>
                      <span className={`text-sm font-roobert-bold ${colors.text} min-w-[100px]`}>{item.name}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.summary}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}
