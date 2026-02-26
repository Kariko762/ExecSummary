import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users, Target, PieChart, BarChart3 } from 'lucide-react';

interface WeeklyData {
  week: string;
  businessUnit: string;
  demoSupportHours: number;
  demoPrepHours: number;
  demoPresentationVirtualHours: number;
  demoPresentationPhysicalHours: number;
}

interface PerformanceData {
  id: string;
  title: string;
  period: string;
  lastUpdated: string;
  weeklyData: WeeklyData[];
}

type BusinessUnit = 'All' | 'Capital Markets' | 'Banking International' | 'Banking North America';

export default function PerformanceDashboard() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [selectedBU, setSelectedBU] = useState<BusinessUnit>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/performance-dashboard');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
      </div>
    );
  }

  // Filter data by business unit
  const filteredData = selectedBU === 'All' 
    ? data.weeklyData 
    : data.weeklyData.filter(d => d.businessUnit === selectedBU);

  // Calculate totals and analytics
  const totalSupport = filteredData.reduce((sum, d) => sum + d.demoSupportHours, 0);
  const totalPrep = filteredData.reduce((sum, d) => sum + d.demoPrepHours, 0);
  const totalVirtual = filteredData.reduce((sum, d) => sum + d.demoPresentationVirtualHours, 0);
  const totalPhysical = filteredData.reduce((sum, d) => sum + d.demoPresentationPhysicalHours, 0);
  const totalPresentation = totalVirtual + totalPhysical;
  const totalHours = totalSupport + totalPrep + totalPresentation;

  // Calculate percentages
  const supportPercent = totalHours > 0 ? Math.round((totalSupport / totalHours) * 100) : 0;
  const prepPercent = totalHours > 0 ? Math.round((totalPrep / totalHours) * 100) : 0;
  const presentationPercent = totalHours > 0 ? Math.round((totalPresentation / totalHours) * 100) : 0;
  const virtualPercent = totalPresentation > 0 ? Math.round((totalVirtual / totalPresentation) * 100) : 0;
  const physicalPercent = totalPresentation > 0 ? Math.round((totalPhysical / totalPresentation) * 100) : 0;

  // Calculate ratios
  const prepToPresentationRatio = totalPresentation > 0 ? (totalPrep / totalPresentation).toFixed(2) : '0';
  const supportToPrepRatio = totalPrep > 0 ? (totalSupport / totalPrep).toFixed(2) : '0';

  const businessUnits: BusinessUnit[] = ['All', 'Capital Markets', 'Banking International', 'Banking North America'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Compact Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 py-4 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl font-roobert-bold text-white">Performance Dashboard</h1>
                <p className="text-xs text-slate-400 font-roobert-light">{data.period} • Updated {new Date(data.lastUpdated).toLocaleDateString()}</p>
              </div>
            </div>
            
            {/* Business Unit Filters */}
            <div className="flex items-center gap-2">
              {businessUnits.map((bu) => (
                <motion.button
                  key={bu}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBU(bu)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-roobert-medium transition-all ${
                    selectedBU === bu
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bu}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Content - Fits in 1080px height */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        
        {/* Hero Metrics - 2x2 Grid */}
        <div className="grid grid-cols-4 gap-3">
          <HeroMetric
            icon={Clock}
            value={totalHours.toLocaleString()}
            label="Total Hours"
            sublabel="All Activities"
            color="cyan"
          />
          <HeroMetric
            icon={TrendingUp}
            value={`${prepPercent}%`}
            label="Preparation Time"
            sublabel={`${totalPrep}h total`}
            color="blue"
          />
          <HeroMetric
            icon={Users}
            value={`${presentationPercent}%`}
            label="Presentation Time"
            sublabel={`${totalPresentation}h total`}
            color="purple"
          />
          <HeroMetric
            icon={Target}
            value={`${virtualPercent}%`}
            label="Virtual Demos"
            sublabel={`${totalVirtual}h of ${totalPresentation}h`}
            color="green"
          />
        </div>

        {/* Main Analytics Grid - 3 Columns */}
        <div className="grid grid-cols-3 gap-4">
          
          {/* Activity Breakdown */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-roobert-bold text-white mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              Activity Breakdown
            </h3>
            
            {/* Donut Chart */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="14" />
                  {/* Support */}
                  <circle 
                    cx="50" cy="50" r="35" fill="none" stroke="rgba(34, 211, 238, 0.9)" strokeWidth="14"
                    strokeDasharray={`${supportPercent * 2.2} ${220 - supportPercent * 2.2}`}
                  />
                  {/* Prep */}
                  <circle 
                    cx="50" cy="50" r="35" fill="none" stroke="rgba(59, 130, 246, 0.9)" strokeWidth="14"
                    strokeDasharray={`${prepPercent * 2.2} ${220 - prepPercent * 2.2}`}
                    strokeDashoffset={-supportPercent * 2.2}
                  />
                  {/* Presentation */}
                  <circle 
                    cx="50" cy="50" r="35" fill="none" stroke="rgba(168, 85, 247, 0.9)" strokeWidth="14"
                    strokeDasharray={`${presentationPercent * 2.2} ${220 - presentationPercent * 2.2}`}
                    strokeDashoffset={-(supportPercent + prepPercent) * 2.2}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-slate-400 font-roobert-light">Total</div>
                    <div className="text-lg font-roobert-bold text-white">{totalHours}h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                  <span className="text-slate-300 font-roobert-light">Support</span>
                </div>
                <span className="text-white font-roobert-medium">{supportPercent}% ({totalSupport}h)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                  <span className="text-slate-300 font-roobert-light">Preparation</span>
                </div>
                <span className="text-white font-roobert-medium">{prepPercent}% ({totalPrep}h)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                  <span className="text-slate-300 font-roobert-light">Presentation</span>
                </div>
                <span className="text-white font-roobert-medium">{presentationPercent}% ({totalPresentation}h)</span>
              </div>
            </div>
          </div>

          {/* Key Ratios */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-roobert-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Key Ratios
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-3xl font-roobert-bold text-cyan-400">{prepToPresentationRatio}</div>
                  <div className="text-xs text-slate-400 font-roobert-light">:1</div>
                </div>
                <div className="text-xs text-slate-300 font-roobert-light">Prep to Presentation</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {totalPrep}h prep / {totalPresentation}h presentation
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-3xl font-roobert-bold text-blue-400">{supportToPrepRatio}</div>
                  <div className="text-xs text-slate-400 font-roobert-light">:1</div>
                </div>
                <div className="text-xs text-slate-300 font-roobert-light">Support to Prep</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {totalSupport}h support / {totalPrep}h prep
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-300 font-roobert-light">Demo Efficiency</span>
                  <span className="text-white font-roobert-medium">
                    {totalPresentation > 0 ? ((totalPresentation / (totalSupport + totalPrep)) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${totalPresentation > 0 ? ((totalPresentation / (totalSupport + totalPrep)) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Mode */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-roobert-bold text-white mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Delivery Mode
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-roobert-light">Virtual Presentations</span>
                  <span className="text-sm font-roobert-bold text-purple-400">{virtualPercent}%</span>
                </div>
                <div className="h-8 bg-slate-700 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400"
                    style={{ width: `${virtualPercent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-roobert-medium text-white">
                    {totalVirtual}h
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-300 font-roobert-light">Physical Presentations</span>
                  <span className="text-sm font-roobert-bold text-green-400">{physicalPercent}%</span>
                </div>
                <div className="h-8 bg-slate-700 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-green-600 to-green-400"
                    style={{ width: `${physicalPercent}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-roobert-medium text-white">
                    {totalPhysical}h
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-400 mb-2 font-roobert-light">Total Presentation Hours</div>
                <div className="text-2xl font-roobert-bold text-white">{totalPresentation}h</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {virtualPercent}% virtual • {physicalPercent}% physical
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Unit Breakdown Table (if All selected) */}
        {selectedBU === 'All' && (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-sm font-roobert-bold text-white mb-3">Business Unit Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400 font-roobert-medium">Business Unit</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Support</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Prep</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Virtual</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Physical</th>
                    <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {['Capital Markets', 'Banking International', 'Banking North America'].map((bu) => {
                    const buData = data.weeklyData.filter(d => d.businessUnit === bu);
                    const buSupport = buData.reduce((sum, d) => sum + d.demoSupportHours, 0);
                    const buPrep = buData.reduce((sum, d) => sum + d.demoPrepHours, 0);
                    const buVirtual = buData.reduce((sum, d) => sum + d.demoPresentationVirtualHours, 0);
                    const buPhysical = buData.reduce((sum, d) => sum + d.demoPresentationPhysicalHours, 0);
                    const buTotal = buSupport + buPrep + buVirtual + buPhysical;

                    return (
                      <tr key={bu} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                        <td className="py-2 px-3 text-slate-200 font-roobert-medium">{bu}</td>
                        <td className="text-right py-2 px-3 text-cyan-400 font-roobert-medium">{buSupport}h</td>
                        <td className="text-right py-2 px-3 text-blue-400 font-roobert-medium">{buPrep}h</td>
                        <td className="text-right py-2 px-3 text-purple-400 font-roobert-medium">{buVirtual}h</td>
                        <td className="text-right py-2 px-3 text-green-400 font-roobert-medium">{buPhysical}h</td>
                        <td className="text-right py-2 px-3 text-white font-roobert-bold">{buTotal}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface HeroMetricProps {
  icon: any;
  value: string;
  label: string;
  sublabel: string;
  color: 'cyan' | 'blue' | 'purple' | 'green';
}

function HeroMetric({ icon: Icon, value, label, sublabel, color }: HeroMetricProps) {
  const colorMap = {
    cyan: 'from-cyan-600/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-600/20 to-purple-500/10 border-purple-500/30 text-purple-400',
    green: 'from-green-600/20 to-green-500/10 border-green-500/30 text-green-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorMap[color]} border backdrop-blur-sm rounded-xl p-3`}
    >
      <div className="flex items-start gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorMap[color].split(' ')[3]}`} />
      </div>
      <div className="text-2xl font-roobert-bold text-white mb-1">{value}</div>
      <div className="text-xs font-roobert-medium text-white/90">{label}</div>
      <div className="text-[10px] text-white/60 font-roobert-light mt-0.5">{sublabel}</div>
    </motion.div>
  );
}
