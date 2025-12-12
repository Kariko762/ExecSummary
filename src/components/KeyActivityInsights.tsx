import { motion } from 'framer-motion';
import { PerformanceData } from '../data/performance-loader';
import { ActivityHoursChart } from './ActivityHoursChart';

interface KeyActivityInsightsProps {
  data: PerformanceData;
}

export function KeyActivityInsights({ data }: KeyActivityInsightsProps) {
  const { capitalMarkets, banking } = data.activityInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
        Key Activity Insights
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Mix Percentages - 1/3 width */}
        <div className="lg:col-span-1 space-y-4">
          {/* Banking */}
          <div className="glass-strong rounded-xl p-3">
            <h4 className="text-lg font-roobert-semibold text-fis-navy dark:text-blue-300 mb-4">
              Banking
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Support %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${banking.supportPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-fis-raspberry rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {banking.supportPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Prep %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${banking.prepPercentage}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-fis-eggplant rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {banking.prepPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Demo %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${banking.demoPercentage}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-fis-navy rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {banking.demoPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Capital Markets */}
          <div className="glass-strong rounded-xl p-3">
            <h4 className="text-lg font-roobert-semibold text-fis-eggplant dark:text-purple-300 mb-4">
              Capital Markets
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Support %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capitalMarkets.supportPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-fis-raspberry rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {capitalMarkets.supportPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Prep %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capitalMarkets.prepPercentage}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-fis-eggplant rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {capitalMarkets.prepPercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                  Demo %
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${capitalMarkets.demoPercentage}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-fis-navy rounded-full"
                    />
                  </div>
                  <span className="text-lg font-roobert-heavy text-gray-900 dark:text-white w-10 text-right">
                    {capitalMarkets.demoPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Hours Chart - 2/3 width */}
        <div className="lg:col-span-2">
          <ActivityHoursChart 
            hoursByLOB={{
              capitalMarkets: {
                support: capitalMarkets.demoSupportHours,
                prep: capitalMarkets.demoPrepHours,
                demo: capitalMarkets.demoHours
              },
              banking: {
                support: banking.demoSupportHours,
                prep: banking.demoPrepHours,
                demo: banking.demoHours
              }
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
