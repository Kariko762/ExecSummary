import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface TopAssetsChartProps {
  topAssets: Array<{
    name: string;
    count: number;
    category: string;
  }>;
}

export function TopAssetsChart({ topAssets }: TopAssetsChartProps) {
  const colors = ['#431C5B', '#1D1F48', '#B21A53', '#3bcd3e', '#403040'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-xl font-roobert-semibold mb-4 text-gray-900 dark:text-white">
        Top 5 Demo Studio Assets by Usage
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={topAssets} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          style={{ cursor: 'default' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '14px', fontFamily: 'Roobert' }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontFamily: 'Roobert' }}
            width={150}
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
          <Bar dataKey="count" radius={[0, 8, 8, 0]} activeBar={false}>
            {topAssets.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Total demos across top 5 assets: <span className="font-roobert-semibold text-fis-eggplant dark:text-purple-300">
          {topAssets.reduce((sum, asset) => sum + asset.count, 0)}
        </span></span>
      </div>
    </motion.div>
  );
}
