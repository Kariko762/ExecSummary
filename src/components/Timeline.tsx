import { motion } from 'framer-motion';
import { ExecutiveSummary } from '../types';
import { Calendar, TrendingUp } from 'lucide-react';

interface TimelineProps {
  summaries: ExecutiveSummary[];
  onSelectSummary: (summary: ExecutiveSummary) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ summaries, onSelectSummary }) => {
  return (
    <section className="mb-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl md:text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
          Timeline
        </h2>
        <p className="text-base md:text-lg font-roobert-light text-gray-600 dark:text-gray-400">
          Navigate through quarterly milestones
        </p>
      </motion.div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-fis-eggplant via-fis-navy to-fis-eggplant rounded-full" />

        {/* Timeline Items */}
        <div className="flex overflow-x-auto pb-8 pt-4 gap-6 hide-scrollbar">
          {summaries.map((summary, index) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={() => onSelectSummary(summary)}
              className="flex-shrink-0 cursor-pointer relative"
              style={{ width: '280px' }}
            >
              {/* Timeline Dot */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-fis-eggplant to-fis-navy shadow-lg flex items-center justify-center z-10 ring-4 ring-white dark:ring-gray-900">
                <Calendar className="w-4 h-4 text-white" />
              </div>

              {/* Card */}
              <div className="mt-20 glass-strong card-shadow hover:card-shadow-hover rounded-xl p-5 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                      {summary.quarter}
                    </h3>
                    <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">
                      {summary.year}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-roobert-heavy text-green-600 dark:text-green-400">
                      +{summary.keyMetrics.growth}%
                    </span>
                  </div>
                </div>

                <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-300 line-clamp-2">
                  {summary.title}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-roobert-light text-gray-500 dark:text-gray-400">
                      Revenue
                    </span>
                    <span className="font-roobert-heavy text-gray-900 dark:text-white">
                      ${(summary.keyMetrics.revenue / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
