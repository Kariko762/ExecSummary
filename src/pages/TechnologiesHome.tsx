import { useState, useEffect } from 'react';
import { Cpu, ExternalLink, ChevronRight, Layers, Zap, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface TechnologyMenuItem {
  id: string;
  name: string;
  contentId: string | null;
  order: number;
}

interface VendorSummary {
  id: string;
  title: string;
  date?: string;
  _contentTag: string;
}

interface TechnologiesHomeProps {
  onSelectContent?: (content: any) => void;
}

export default function TechnologiesHome({ onSelectContent }: TechnologiesHomeProps) {
  const [technologies, setTechnologies] = useState<TechnologyMenuItem[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<Map<string, VendorSummary>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch technologies menu
      const menuResponse = await fetch('http://localhost:3001/api/technologies-menu');
      const menuData = await menuResponse.json();
      
      // Fetch all vendor summaries
      const contentResponse = await fetch('http://localhost:3001/api/content');
      const contentData = await contentResponse.json();
      
      if (menuData.success && contentData.success) {
        setTechnologies(menuData.items);
        
        // Build a map of vendor summaries by ID
        const vendorsMap = new Map<string, VendorSummary>();
        contentData.content
          .filter((c: any) => c._contentTag === 'vendor-summary')
          .forEach((vendor: VendorSummary) => {
            vendorsMap.set(vendor.id, vendor);
          });
        
        setVendorSummaries(vendorsMap);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTechnologyClick = async (tech: TechnologyMenuItem) => {
    console.log('Technology tile clicked:', tech);
    if (tech.contentId) {
      try {
        console.log('Fetching content:', tech.contentId);
        const response = await fetch(`http://localhost:3001/api/content/${tech.contentId}`);
        const data = await response.json();
        console.log('Content data received:', data);
        if (onSelectContent) {
          console.log('Calling onSelectContent with:', data);
          onSelectContent(data);
        } else {
          console.log('onSelectContent is not defined');
        }
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    } else {
      console.log('No contentId for tech:', tech.name);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading technologies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section - Navy Background */}
      <div className="relative bg-fis-navy dark:bg-gray-950 overflow-hidden rounded-t-xl">
        {/* SVG Tech Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tech-pattern-header" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Chip/Circuit patterns */}
                <circle cx="10" cy="10" r="2" fill="currentColor" className="text-white" />
                <circle cx="90" cy="90" r="2" fill="currentColor" className="text-white" />
                <rect x="45" y="45" width="10" height="10" fill="currentColor" className="text-white" opacity="0.3" />
                <path d="M20,20 L30,20 M25,15 L25,25" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.2" />
                <path d="M70,30 L80,30 M75,25 L75,35" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.2" />
                <circle cx="60" cy="70" r="3" fill="none" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.2" />
                <rect x="15" y="60" width="8" height="8" fill="none" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-pattern-header)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-roobert-semibold text-white">
                Technologies
              </h1>
              <p className="text-white/70 mt-1">
                Browse vendor summaries and technology solutions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>{technologies.length} Technologies</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>{technologies.filter(t => t.contentId).length} with Vendor Summaries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - White Background with Grey Tech Pattern */}
      <div className="relative bg-white dark:bg-gray-900">
        {/* SVG Tech Pattern Background - Light Grey */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tech-pattern-content" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Tech icons and circuit patterns */}
                <circle cx="8" cy="8" r="1.5" fill="currentColor" className="text-gray-600" />
                <circle cx="72" cy="72" r="1.5" fill="currentColor" className="text-gray-600" />
                <rect x="36" y="36" width="8" height="8" fill="currentColor" className="text-gray-600" opacity="0.3" />
                <path d="M16,16 L24,16 M20,12 L20,20" stroke="currentColor" className="text-gray-600" strokeWidth="1" opacity="0.4" />
                <path d="M56,24 L64,24 M60,20 L60,28" stroke="currentColor" className="text-gray-600" strokeWidth="1" opacity="0.4" />
                <circle cx="48" cy="56" r="2.5" fill="none" stroke="currentColor" className="text-gray-600" strokeWidth="1" opacity="0.3" />
                <rect x="12" y="48" width="6" height="6" fill="none" stroke="currentColor" className="text-gray-600" strokeWidth="1" opacity="0.3" />
                <path d="M30,60 L34,60 L34,64 L38,64" stroke="currentColor" className="text-gray-600" strokeWidth="0.5" opacity="0.2" />
                <circle cx="28" cy="36" r="1" fill="currentColor" className="text-gray-600" opacity="0.5" />
                <circle cx="52" cy="12" r="1" fill="currentColor" className="text-gray-600" opacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-pattern-content)" />
          </svg>
        </div>

      {/* Technologies Grid */}
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {technologies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => {
              const vendorSummary = tech.contentId ? vendorSummaries.get(tech.contentId) : null;
              const hasContent = !!vendorSummary;
              
              return (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
                  whileHover={hasContent ? { y: -8, scale: 1.02 } : {}}
                  onClick={() => hasContent && handleTechnologyClick(tech)}
                  className={`relative rounded-2xl p-6 transition-all overflow-hidden backdrop-blur-sm ${
                    hasContent 
                      ? 'cursor-pointer group bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500' 
                      : 'opacity-60 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Gradient Overlay for Active Cards */}
                  {hasContent && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  )}

                  <div className="relative">
                    {/* Icon and Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl transition-all ${
                        hasContent 
                          ? 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 group-hover:scale-110 group-hover:rotate-3'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <Cpu className={`w-6 h-6 ${
                          hasContent 
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500'
                        }`} />
                      </div>
                      {hasContent && (
                        <motion.div
                          initial={{ rotate: 0 }}
                          whileHover={{ rotate: 45, x: 4 }}
                          className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg"
                        >
                          <ChevronRight className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-roobert-bold mb-3 ${
                      hasContent 
                        ? 'text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 dark:group-hover:from-blue-400 dark:group-hover:to-purple-400 transition-all'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {tech.name}
                    </h3>

                    {/* Content */}
                    {hasContent ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {vendorSummary.title}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs font-roobert-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            Active Partnership
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-roobert-medium">View Vendor Summary</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No vendor summary available
                        </p>
                        <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                          Coming Soon
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Cpu className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
              No Technologies Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Technologies will appear here once they are added to the menu.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
