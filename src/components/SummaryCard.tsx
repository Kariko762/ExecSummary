import { motion } from 'framer-motion';
import { ExecutiveSummary } from '../types';
import { TrendingUp, Users, DollarSign, ThumbsUp, Calendar } from 'lucide-react';
import { renderWithExpressions } from '../utils/expressionParser';

interface SummaryCardProps {
  summary: ExecutiveSummary;
  onClick: () => void;
  index: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onClick, index }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="glass card-shadow hover:card-shadow-hover rounded-2xl p-6 cursor-pointer transition-all duration-300 group"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">
              {summary.quarter} {summary.year}
            </h3>
            <p className="text-xs font-roobert-light text-gray-400 dark:text-gray-500">
              {new Date(summary.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        
        <motion.div
          className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-roobert-medium"
          whileHover={{ scale: 1.1 }}
        >
          +{summary.keyMetrics.growth}%
        </motion.div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-fis-raspberry group-hover:to-fis-eggplant transition-all">
        {summary.title}
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-fis-eggplant" />
            <span className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">Revenue</span>
          </div>
          <p className="text-lg font-roobert-heavy text-gray-900 dark:text-white">
            {formatCurrency(summary.keyMetrics.revenue)}
          </p>
        </div>

        <div className="glass rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-4 h-4 text-fis-navy" />
            <span className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">Customers</span>
          </div>
          <p className="text-lg font-roobert-heavy text-gray-900 dark:text-white">
            {formatNumber(summary.keyMetrics.customers)}
          </p>
        </div>

        <div className="glass rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-fis-green" />
            <span className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">Growth</span>
          </div>
          <p className="text-lg font-roobert-heavy text-gray-900 dark:text-white">
            {summary.keyMetrics.growth}%
          </p>
        </div>

        <div className="glass rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-fis-eggplant" />
            <span className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">NPS</span>
          </div>
          <p className="text-lg font-roobert-heavy text-gray-900 dark:text-white">
            {summary.keyMetrics.satisfaction}
          </p>
        </div>
      </div>

      {/* Highlights Preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Key Highlights
        </h4>
        {summary.highlights.slice(0, 3).map((highlight, i) => (
          <div key={i} className="flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-fis-eggplant mt-2 flex-shrink-0" />
            <div className="text-sm font-roobert-light text-gray-600 dark:text-gray-300 line-clamp-1">
              {renderWithExpressions(highlight)}
            </div>
          </div>
        ))}
      </div>

      {/* View Details Arrow */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-sm font-roobert-medium text-fis-eggplant dark:text-purple-400">
          View Full Summary
        </span>
        <motion.svg
          className="w-5 h-5 text-fis-eggplant dark:text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ x: 0 }}
          animate={{ x: 5 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </motion.svg>
      </div>
    </motion.div>
  );
};
