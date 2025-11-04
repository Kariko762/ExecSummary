import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { executiveSummaries } from '../data/summaries-loader';
import { Target, Award, Briefcase } from 'lucide-react';
import { ActivityHoursChart } from './ActivityHoursChart';

export const Dashboard: React.FC = () => {
  // Get the latest summary with activity metrics
  const latestSummaryWithActivity = executiveSummaries.find(s => s.activityMetrics);
  const hasActivityMetrics = !!latestSummaryWithActivity;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
          Performance Dashboard
        </h2>
        <p className="text-lg font-roobert-light text-gray-600 dark:text-gray-400">
          Year-over-year growth metrics and trends
        </p>
      </motion.div>

      {/* Demo Studio Metrics - Show when available */}
      {hasActivityMetrics && latestSummaryWithActivity?.activityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-fis-raspberry" />
              </div>
            </div>
            <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-2">
              Demos Registered (YTD)
            </h3>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              {latestSummaryWithActivity.activityMetrics.demoStudio.demosRegistered}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-fis-raspberry" />
              </div>
              <span className="text-sm font-roobert-medium text-fis-green">
                {latestSummaryWithActivity.activityMetrics.demoStudio.conversionRate}%
              </span>
            </div>
            <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-2">
              Linked to Deals (YTD)
            </h3>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              {latestSummaryWithActivity.activityMetrics.demoStudio.demosLinkedToDeals}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-strong rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-fis-raspberry/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-fis-raspberry" />
              </div>
            </div>
            <h3 className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-2">
              Won ACV
            </h3>
            <p className="text-3xl font-roobert-heavy text-gray-900 dark:text-white">
              ${(latestSummaryWithActivity.activityMetrics.demoStudio.wonACV / 1000000).toFixed(2)}M
            </p>
          </motion.div>
        </div>
      )}



      {/* Demo Studio Charts - Show when available */}
      {hasActivityMetrics && latestSummaryWithActivity?.activityMetrics && latestSummaryWithActivity?.topAssets && (
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
                <LineChart data={[
                  { month: 'Jan', demos: 37 },
                  { month: 'Feb', demos: 44 },
                  { month: 'Mar', demos: 58 },
                  { month: 'Apr', demos: 27 },
                  { month: 'May', demos: 21 },
                  { month: 'Jun', demos: 19 },
                  { month: 'Jul', demos: 18 },
                  { month: 'Aug', demos: 16 },
                  { month: 'Sep', demos: 14 },
                  { month: 'Oct', demos: 3 }
                ]}
                style={{ cursor: 'default' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px', fontFamily: 'Roobert' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px', fontFamily: 'Roobert' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontFamily: 'Roobert'
                    }}
                    formatter={(value: number) => [`${value} demos`, 'Count']}
                    cursor={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demos" 
                    stroke="#B21A53" 
                    strokeWidth={3}
                    dot={{ fill: '#B21A53', r: 6 }}
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
                {latestSummaryWithActivity.topAssets.slice(0, 5).map((asset, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-roobert-bold text-white`}
                        style={{ backgroundColor: ['#431C5B', '#1D1F48', '#B21A53', '#3bcd3e', '#403040'][index] }}
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
                    {latestSummaryWithActivity.topAssets.reduce((sum, asset) => sum + asset.count, 0)}
                  </span> demos
                </div>
              </div>
            </motion.div>
          </div>

          {/* Section Divider */}
          <div className="mb-8">
            <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white mb-6">
              Key Activity Insights
            </h3>
          </div>

          {/* Activity Hours Chart */}
          <div className="mb-6">
            <ActivityHoursChart hoursByLOB={latestSummaryWithActivity.activityMetrics.hoursByLOB} />
          </div>
        </>
      )}
    </div>
  );
};
