import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusinessUnitCard } from '../components/BusinessUnitCard';
import { 
  Building2,
  TrendingUp,
  Users,
  Target,
  FileText,
  Briefcase,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface BusinessUnit {
  id: string;
  name: string;
  shortName: string;
  color: string;
  stats: {
    revenue: string;
    growth: string;
    activeProjects: number;
    teamSize: number;
  };
}

interface WeeklySummaryData {
  meta: {
    weekOf: string;
    quarter: string;
    author: string;
    lastUpdated: string;
  };
  businessUnits: Record<string, BusinessUnit>;
}

const ExecutiveHome: React.FC = () => {
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/weekly-bu-summary');
      const data = await response.json();
      
      if (data.success) {
        setWeeklyData(data);
        
        // Convert business units object to array
        const buArray = Object.keys(data.businessUnits).map(key => ({
          id: key,
          ...data.businessUnits[key]
        }));
        
        setBusinessUnits(buArray);
      } else {
        setError('Failed to load business unit data');
      }
    } catch (err) {
      console.error('Error fetching weekly summary:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Executive Home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchWeeklyData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={40} className="text-blue-400" />
            <div>
              <h1 className="text-4xl font-bold">Executive Home</h1>
              <p className="text-gray-400 mt-1">
                Week of {weeklyData?.meta.weekOf ? new Date(weeklyData.meta.weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} • {weeklyData?.meta.quarter}
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-300">
            Select a business unit to view detailed summaries, tasks, and performance metrics.
          </p>
        </motion.div>

        {/* Business Units Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users size={24} className="text-purple-400" />
            Business Units
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessUnits.map((bu, index) => (
              <motion.div
                key={bu.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <BusinessUnitCard
                  id={bu.id}
                  name={bu.name}
                  shortName={bu.shortName}
                  color={bu.color}
                  stats={bu.stats}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Company-Wide Sections - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Articles & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-green-400" />
              <h2 className="text-2xl font-semibold">Articles & Resources</h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Q1 2026 Strategic Initiatives', date: 'Feb 20, 2026', type: 'Strategy' },
                { title: 'Digital Transformation Roadmap', date: 'Feb 18, 2026', type: 'Planning' },
                { title: 'Market Analysis Report', date: 'Feb 15, 2026', type: 'Research' },
                { title: 'Technology Investment Review', date: 'Feb 12, 2026', type: 'Financial' }
              ].map((article, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg cursor-pointer
                           hover:border-slate-600 hover:bg-slate-800/70 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{article.title}</h3>
                      <p className="text-xs text-slate-400">{article.type} • {article.date}</p>
                    </div>
                    <span className="text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded">
                      {article.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Vendor & Financial Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Briefcase size={24} className="text-orange-400" />
              <h2 className="text-2xl font-semibold">Vendor & Financial</h2>
            </div>
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <DollarSign size={20} className="text-blue-400 mb-2" />
                  <div className="text-2xl font-semibold text-white">$24.5M</div>
                  <div className="text-xs text-slate-400">Total Licenses</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <TrendingUp size={20} className="text-purple-400 mb-2" />
                  <div className="text-2xl font-semibold text-white">+12.4%</div>
                  <div className="text-xs text-slate-400">YoY Growth</div>
                </div>
              </div>

              {/* Recent Updates */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Updates</h3>
                {[
                  { vendor: 'Microsoft Azure', status: 'Renewed', color: 'green' },
                  { vendor: 'Bloomberg Terminal', status: 'Under Review', color: 'yellow' },
                  { vendor: 'Salesforce', status: 'Active', color: 'green' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="text-white text-sm">{item.vendor}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.color === 'green' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Goals & Initiatives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-cyan-400" />
              <h2 className="text-2xl font-semibold">Goals & Initiatives</h2>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Digital Transformation', progress: 78, status: 'On Track' },
                { title: 'Cloud Migration', progress: 92, status: 'Ahead' },
                { title: 'AI Integration', progress: 45, status: 'In Progress' },
                { title: 'Market Expansion', progress: 61, status: 'On Track' }
              ].map((goal, idx) => (
                <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{goal.title}</h3>
                    <span className="text-xs text-cyan-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{goal.status}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Company Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-pink-400" />
              <h2 className="text-2xl font-semibold">Company Performance</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Revenue', value: '$14.2B', change: '+10.8%', color: 'blue' },
                { label: 'Active Projects', value: '109', change: '+15', color: 'purple' },
                { label: 'Team Members', value: '2,082', change: '+127', color: 'green' },
                { label: 'Client Satisfaction', value: '94%', change: '+3%', color: 'pink' }
              ].map((metric, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
                  <div className="text-2xl font-semibold text-white mb-1">{metric.value}</div>
                  <p className={`text-xs ${
                    metric.color === 'blue' ? 'text-blue-400' :
                    metric.color === 'purple' ? 'text-purple-400' :
                    metric.color === 'green' ? 'text-green-400' :
                    'text-pink-400'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHome;
