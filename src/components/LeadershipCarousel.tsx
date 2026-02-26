import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User, Calendar, ExternalLink } from 'lucide-react';

interface LeadershipSummary {
  id: string;
  title: string;
  author: string;
  role: string;
  date: string;
  summary: string;
  highlights: string[];
  priorities: string[];
}

interface LeadershipCarouselProps {
  summaries: LeadershipSummary[];
  color: string;
  onViewDetails?: (summary: LeadershipSummary) => void;
}

const colorMap: Record<string, { accent: string; bg: string; border: string }> = {
  blue: { accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  cyan: { accent: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  purple: { accent: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  green: { accent: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  orange: { accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' }
};

export const LeadershipCarousel: React.FC<LeadershipCarouselProps> = ({
  summaries,
  color,
  onViewDetails
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const colors = colorMap[color] || colorMap.blue;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? summaries.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === summaries.length - 1 ? 0 : prev + 1));
  };

  if (!summaries || summaries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No leadership summaries available
      </div>
    );
  }

  const currentSummary = summaries[currentIndex];

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      {summaries.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                     bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-2
                     transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                     bg-gray-800/80 hover:bg-gray-700 text-white rounded-full p-2
                     transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Summary Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`border ${colors.border} ${colors.bg} rounded-xl p-6 backdrop-blur-sm`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {currentSummary.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User size={14} />
                <span>{currentSummary.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(currentSummary.date).toLocaleDateString()}</span>
              </div>
            </div>
            <p className={`text-xs mt-1 ${colors.accent}`}>{currentSummary.role}</p>
          </div>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(currentSummary)}
              className={`${colors.accent} hover:underline flex items-center gap-1 text-sm`}
            >
              View Details
              <ExternalLink size={14} />
            </button>
          )}
        </div>

        {/* Summary */}
        <p className="text-gray-300 mb-4 leading-relaxed">
          {currentSummary.summary}
        </p>

        {/* Highlights & Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Highlights */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Key Highlights</h4>
            <ul className="space-y-1">
              {currentSummary.highlights.slice(0, 3).map((highlight, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className={`${colors.accent} mt-1`}>•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Priorities */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Priorities</h4>
            <ul className="space-y-1">
              {currentSummary.priorities.slice(0, 3).map((priority, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className={`${colors.accent} mt-1`}>→</span>
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pagination Dots */}
        {summaries.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {summaries.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex
                    ? `${colors.bg} w-6`
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
