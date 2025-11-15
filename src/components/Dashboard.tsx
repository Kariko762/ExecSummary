import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { performanceData } from '../data/performance-loader';
import { Target, Award, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { KeyActivityInsights } from './KeyActivityInsights';
import { useState } from 'react';
import { ChartColors } from '../design-system';

export const Dashboard: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPerformance = performanceData[currentIndex];
  const hasPerformanceData = performanceData.length > 0 && currentPerformance?.demoStudio;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev < performanceData.length - 1 ? prev + 1 : prev));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Show message if no valid performance data
  if (!hasPerformanceData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-4">
            Performance Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No performance data available. Please check data files in /src/data/performance/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-4xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
          Performance Dashboard
        </h2>
        <p className="text-lg font-roobert-light text-gray-600 dark:text-gray-400">
          Year-over-year growth metrics and trends
        </p>
      </motion.div>

      {/* Performance Navigator */}
      {hasPerformanceData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <button
            onClick={goToPrevious}
            disabled={currentIndex === performanceData.length - 1}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="text-xl font-roobert-semibold text-gray-900 dark:text-white px-6">
            {currentPerformance.displayName}
          </div>
          
          <button
            onClick={goToNext}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </motion.div>
      )}

      {/* Demo Studio Metrics - Show when available */}
      {hasPerformanceData && currentPerformance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-fis-raspberry" />
              </div>
            </div>
            <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-2">
              Demos Registered (YTD)
            </h3>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              {currentPerformance.demoStudio.demosRegistered}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-fis-raspberry" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400">
                Linked to Deals (YTD)
              </h3>
              <span className="text-sm font-roobert-medium text-fis-green">
                {currentPerformance.demoStudio.conversionRate}%
              </span>
            </div>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              {currentPerformance.demoStudio.demosLinkedToDeals}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-2xl p-6 text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-fis-raspberry" />
              </div>
            </div>
            <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-2">
              Won ACV
            </h3>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              ${(currentPerformance.demoStudio.wonACV / 1000000).toFixed(2)}M
            </p>
          </motion.div>
        </div>
      )}

      {/* Demo Studio Charts - Show when available */}
      {hasPerformanceData && currentPerformance.topAssets && (
        <>
          {/* Demos Per Month & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Demos Per Month - 3/4 width */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-strong rounded-2xl p-6 lg:col-span-3"
            >
              <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Demos Per Month (2025)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={currentPerformance.demosPerMonth}
                  style={{ cursor: 'default' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={ChartColors.ui.grid} opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    stroke={ChartColors.ui.axis}
                    style={{ fontSize: '12px', fontFamily: 'Roobert' }}
                  />
                  <YAxis 
                    stroke={ChartColors.ui.axis}
                    style={{ fontSize: '12px', fontFamily: 'Roobert' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: ChartColors.ui.tooltip.bg,
                      border: `1px solid ${ChartColors.ui.tooltip.border}`,
                      borderRadius: '8px',
                      fontFamily: 'Roobert'
                    }}
                    formatter={(value: number) => [`${value} demos`, 'Count']}
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demos" 
                    stroke={ChartColors.series.raspberry}
                    strokeWidth={3}
                    dot={{ fill: ChartColors.series.raspberry, r: 6 }}
                    activeDot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top 5 Demo Products - 1/4 width */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-strong rounded-2xl p-6 lg:col-span-1"
            >
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                Top 5 Demo Products
              </h3>
              <div className="space-y-3">
                {currentPerformance.topAssets.slice(0, 5).map((asset: { name: string; count: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-roobert-bold text-white`}
                        style={{ backgroundColor: ChartColors.paletteExtended[index] }}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs font-roobert-regular text-gray-700 dark:text-gray-300 truncate">
                        {asset.name}
                      </span>
                    </div>
                    <span className="text-sm font-roobert-bold text-gray-900 dark:text-white ml-2">
                      {asset.count}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total: <span className="font-roobert-semibold text-fis-raspberry">
                    {currentPerformance.topAssets.reduce((sum: number, asset: { count: number }) => sum + asset.count, 0)}
                  </span> demos
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Activity Insights */}
          <KeyActivityInsights data={currentPerformance} />
        </>
      )}
    </div>
  );
};
