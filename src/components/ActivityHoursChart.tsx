import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ActivityHoursChartProps {
  hoursByLOB: {
    capitalMarkets: { support: number; prep: number; demo: number; };
    banking: { support: number; prep: number; demo: number; };
  };
}

export function ActivityHoursChart({ hoursByLOB }: ActivityHoursChartProps) {
  const data = [
    {
      name: 'Capital Markets',
      Support: hoursByLOB.capitalMarkets.support,
      Prep: hoursByLOB.capitalMarkets.prep,
      Demo: hoursByLOB.capitalMarkets.demo,
    },
    {
      name: 'Banking',
      Support: hoursByLOB.banking.support,
      Prep: hoursByLOB.banking.prep,
      Demo: hoursByLOB.banking.demo,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-xl font-roobert-semibold mb-4 text-gray-900 dark:text-white">
        Activity Hours by Line of Business (YTD)
      </h3>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} style={{ cursor: 'default' }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '14px', fontFamily: 'Roobert' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '14px', fontFamily: 'Roobert' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontFamily: 'Roobert'
            }}
            formatter={(value: number) => `${value.toLocaleString()} hrs`}
            cursor={false}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'Roobert', fontSize: '14px' }}
          />
          <Bar dataKey="Support" stackId="a" fill="#B21A53" radius={[0, 0, 0, 0]} activeBar={false} />
          <Bar dataKey="Prep" stackId="a" fill="#431C5B" radius={[0, 0, 0, 0]} activeBar={false} />
          <Bar dataKey="Demo" stackId="a" fill="#1D1F48" radius={[4, 4, 0, 0]} activeBar={false} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-purple-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="font-roobert-semibold text-fis-eggplant dark:text-purple-300 mb-1">
            Capital Markets Total
          </div>
          <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
            {(hoursByLOB.capitalMarkets.support + hoursByLOB.capitalMarkets.prep + hoursByLOB.capitalMarkets.demo).toLocaleString()} hrs
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Support: {hoursByLOB.capitalMarkets.support.toLocaleString()} | 
            Prep: {hoursByLOB.capitalMarkets.prep.toLocaleString()} | 
            Demo: {hoursByLOB.capitalMarkets.demo.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="font-roobert-semibold text-fis-navy dark:text-blue-300 mb-1">
            Banking Total
          </div>
          <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
            {(hoursByLOB.banking.support + hoursByLOB.banking.prep + hoursByLOB.banking.demo).toLocaleString()} hrs
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Support: {hoursByLOB.banking.support.toLocaleString()} | 
            Prep: {hoursByLOB.banking.prep.toLocaleString()} | 
            Demo: {hoursByLOB.banking.demo.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
