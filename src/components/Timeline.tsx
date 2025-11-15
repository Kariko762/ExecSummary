import { motion } from 'framer-motion';
import { TimelineItem } from '../types';
import { TrendingUp, Lightbulb, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { isExecutiveIQ } from '../data/timeline-loader';
import { useRef, useState } from 'react';

interface TimelineProps {
  summaries: TimelineItem[];
  onSelectSummary: (summary: TimelineItem) => void;
  selectedTag?: string;
  onTagChange?: (tag: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  summaries, 
  onSelectSummary,
  selectedTag = 'all',
  onTagChange 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Scroll by 300px (slightly more than one card)
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      // Update button states after scroll animation
      setTimeout(checkScrollButtons, 300);
    }
  };

  const tags = [
    { value: 'all', label: 'All' },
    { value: 'executive-summary', label: 'Executive Summary' },
    { value: 'executive-iq', label: 'Executive-IQ' },
    { value: 'weekly-summary', label: 'Weekly Summary' },
  ];

  // Filter summaries based on selected tag
  const filteredSummaries = selectedTag === 'all' 
    ? summaries 
    : summaries.filter(s => (s as any)._contentTag === selectedTag);

  return (
    <section className="mb-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
              Timeline
            </h2>
            <p className="text-base md:text-lg font-roobert-light text-gray-600 dark:text-gray-400">
              Navigate through quarterly milestones
            </p>
          </div>
          
          {/* Tag Filter */}
          {onTagChange && (
            <div className="flex items-center gap-2 pr-[5px]">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedTag}
                onChange={(e) => onTagChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-roobert-medium text-sm focus:outline-none focus:ring-2 focus:ring-fis-eggplant"
              >
                {tags.map(tag => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </motion.div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-fis-eggplant via-fis-navy to-fis-eggplant rounded-full" />

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center transition-all ${
            canScrollLeft ? 'opacity-100 hover:scale-110' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-fis-eggplant dark:text-fis-raspberry" />
        </button>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center transition-all ${
            canScrollRight ? 'opacity-100 hover:scale-110' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-6 h-6 text-fis-eggplant dark:text-fis-raspberry" />
        </button>

        {/* Timeline Items */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex overflow-x-auto pb-8 pt-4 px-12 gap-6 hide-scrollbar"
          style={{ width: '90%', margin: '0 auto' }}
        >
          {filteredSummaries.map((summary, index) => {
            const isIQ = isExecutiveIQ(summary);
            const isNew = (summary as any).isNew;
            const TimelineIcon = isIQ ? Lightbulb : FileText;
            const iconBg = isIQ ? 'from-fis-raspberry to-fis-eggplant' : 'from-fis-eggplant to-fis-navy';
            
            return (
              <motion.div
                key={summary.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => onSelectSummary(summary)}
                className="flex-shrink-0 cursor-pointer relative"
                style={{ width: '280px' }}
              >
                {/* Timeline Dot */}
                <div className={`absolute top-[20px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${iconBg} shadow-lg flex items-center justify-center z-10 ring-4 ring-white dark:ring-gray-900`}>
                  <TimelineIcon className="w-4 h-4 text-white" />
                </div>

                {/* NEW Badge - positioned between timeline and card */}
                {isNew && (
                  <div className="absolute top-[60px] left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-roobert-heavy bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg animate-pulse">
                      NEW
                    </span>
                  </div>
                )}

                {/* Card */}
                <div className="mt-20 glass-strong card-shadow hover:card-shadow-hover rounded-xl p-5 transition-all border-2 border-transparent hover:border-fis-eggplant duration-300 h-[200px] flex flex-col relative overflow-hidden">
                  {/* Geometric SVG Background Pattern */}
                  <div className="absolute inset-0 opacity-30">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`timeline-fade-${summary.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#B21A53', stopOpacity: 0.5 }} />
                          <stop offset="100%" style={{ stopColor: '#B21A53', stopOpacity: 0 }} />
                        </linearGradient>
                      </defs>
                      {/* Geometric shapes using raspberry color */}
                      <circle cx="15%" cy="15%" r="50" fill={`url(#timeline-fade-${summary.id})`} />
                      <polygon points="80,10 110,30 110,70 80,90 50,70 50,30" fill={`url(#timeline-fade-${summary.id})`} transform="translate(250, 20)" />
                      <rect x="10%" y="70%" width="45" height="45" fill={`url(#timeline-fade-${summary.id})`} transform="rotate(20)" />
                      <circle cx="85%" cy="80%" r="60" fill={`url(#timeline-fade-${summary.id})`} />
                    </svg>
                  </div>
                  
                  {/* Content with relative positioning */}
                  <div className="relative z-10">
                  {/* Type Tag */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold ${isIQ ? 'bg-fis-raspberry/20 text-fis-raspberry' : 'bg-fis-navy/20 text-fis-navy dark:bg-blue-500/20 dark:text-blue-400'}`}>
                      {isIQ ? 'Executive-IQ' : 'Weekly Summary'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                        {summary.quarter}
                      </h3>
                      <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">
                        {summary.year}
                      </p>
                    </div>
                    {!isIQ && 'keyMetrics' in summary && summary.keyMetrics && (
                      <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-roobert-heavy text-green-600 dark:text-green-400">
                          +{summary.keyMetrics.growth}%
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-300 line-clamp-2 flex-1">
                    {summary.title}
                  </p>

                  {!isIQ && 'keyMetrics' in summary && summary.keyMetrics && (
                    <div className="mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-xs">
                      <span className="font-roobert-light text-gray-500 dark:text-gray-400">
                        Revenue
                      </span>
                      <span className="font-roobert-heavy text-gray-900 dark:text-white">
                        ${(summary.keyMetrics.revenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
