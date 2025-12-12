import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ChartColors } from '../design-system';

interface ActivityHoursChartProps {
  hoursByLOB: {
    capitalMarkets: { support: number; prep: number; demo: number; };
    banking: { support: number; prep: number; demo: number; };
  };
}

export function ActivityHoursChart({ hoursByLOB }: ActivityHoursChartProps) {
  const data = [
    {
      name: 'Banking',
      Support: hoursByLOB.banking.support,
      Prep: hoursByLOB.banking.prep,
      Demo: hoursByLOB.banking.demo,
    },
    {
      name: 'Capital Markets',
      Support: hoursByLOB.capitalMarkets.support,
      Prep: hoursByLOB.capitalMarkets.prep,
      Demo: hoursByLOB.capitalMarkets.demo,
    },
  ];

  const capitalMarketsTotal = hoursByLOB.capitalMarkets.support + hoursByLOB.capitalMarkets.prep + hoursByLOB.capitalMarkets.demo;
  const bankingTotal = hoursByLOB.banking.support + hoursByLOB.banking.prep + hoursByLOB.banking.demo;
  const grandTotal = capitalMarketsTotal + bankingTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-xl font-roobert-semibold mb-4 text-gray-900 dark:text-white">
        Activity Hours by Line of Business (YTD)
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - 2/3 width */}
        <div className="lg:col-span-2 flex items-center">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} style={{ cursor: 'default' }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ChartColors.ui.grid} />
              <XAxis 
                dataKey="name" 
                stroke={ChartColors.ui.axis}
                style={{ fontSize: '14px', fontFamily: 'Roobert' }}
              />
              <YAxis 
                stroke={ChartColors.ui.axis}
                style={{ fontSize: '14px', fontFamily: 'Roobert' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: ChartColors.ui.tooltip.bg,
                  border: `1px solid ${ChartColors.ui.tooltip.border}`,
                  borderRadius: '8px',
                  fontFamily: 'Roobert'
                }}
                formatter={(value: number) => `${value.toLocaleString()} hrs`}
                cursor={false}
              />
              <Legend 
                wrapperStyle={{ fontFamily: 'Roobert', fontSize: '14px' }}
              />
              <Bar dataKey="Support" stackId="a" fill={ChartColors.series.raspberry} radius={[0, 0, 0, 0]} activeBar={false} />
              <Bar dataKey="Prep" stackId="a" fill={ChartColors.series.eggplant} radius={[0, 0, 0, 0]} activeBar={false} />
              <Bar dataKey="Demo" stackId="a" fill={ChartColors.series.navy} radius={[4, 4, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Hours - 1/3 width */}
        <div className="lg:col-span-1 flex flex-col justify-center space-y-3 -mt-8">
          <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="font-roobert-semibold text-fis-navy dark:text-blue-300 mb-1">
              Banking
            </div>
            <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              {bankingTotal.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="font-roobert-semibold text-fis-eggplant dark:text-purple-300 mb-1">
              Capital Markets
            </div>
            <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              {capitalMarketsTotal.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-br from-fis-eggplant/10 to-fis-raspberry/10 dark:from-fis-eggplant/20 dark:to-fis-raspberry/20 rounded-lg p-3 border border-fis-eggplant/20">
            <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">
              Grand Total
            </div>
            <div className="text-2xl font-roobert-heavy bg-gradient-to-r from-fis-eggplant to-fis-raspberry bg-clip-text text-transparent">
              {grandTotal.toLocaleString()}
            </div>
            <div className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
              hours (YTD)
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
