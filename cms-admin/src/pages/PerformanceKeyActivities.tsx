import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Filter, BarChart3, Edit2, X, Plus } from 'lucide-react';

// Types
interface WeekData {
  org: string;
  demoSupport: number;
  demoPreparation: number;
  demoPresentationVirtual: number;
  demoPresentationOnsite: number;
}

interface PerformanceData {
  shortName?: string;
  weeks: {
    [weekLabel: string]: WeekData[];
  };
}

interface PerformanceKeyActivitiesProps {
  isCMSMode?: boolean;
  onEdit?: () => void;
  onClose?: () => void;
}

const PerformanceKeyActivities: React.FC<PerformanceKeyActivitiesProps> = ({ 
  isCMSMode = false,
  onEdit,
  onClose
}) => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<PerformanceData | null>(null);
  const [chartView, setChartView] = useState<'category' | 'bu'>('category');
  const [selectedBU, setSelectedBU] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load data
  useEffect(() => {
    fetch('http://localhost:3001/data/content/performance/performance-key-activities.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load performance data:', err));
  }, []);

  const handleEditClick = () => {
    setEditData(JSON.parse(JSON.stringify(data))); // Deep clone
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/content/performance/performance-key-activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      if (response.ok) {
        setData(editData);
        setEditMode(false);
        alert('Performance data saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save data');
    }
  };

  const handleCancel = () => {
    setEditData(null);
    setEditMode(false);
  };

  const getWeekCommencing = (weekKey: string): string => {
    // Base date: W1 starts on Dec 29, 2025 (Monday)
    const baseDate = new Date('2025-12-29');
    const weekNum = parseInt(weekKey.substring(1));
    const daysToAdd = (weekNum - 1) * 7;
    const weekDate = new Date(baseDate);
    weekDate.setDate(baseDate.getDate() + daysToAdd);
    
    // Format as MMM DD, YYYY
    return weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const addNewWeek = () => {
    if (!editData) return;
    const weekKeys = Object.keys(editData.weeks);
    const lastWeekNum = Math.max(...weekKeys.map(k => parseInt(k.substring(1))));
    const newWeekKey = `W${lastWeekNum + 1}`;
    
    setEditData({
      ...editData,
      weeks: {
        ...editData.weeks,
        [newWeekKey]: [
          { org: 'Capital Markets', demoSupport: 0, demoPreparation: 0, demoPresentationVirtual: 0, demoPresentationOnsite: 0 },
          { org: 'Banking NA', demoSupport: 0, demoPreparation: 0, demoPresentationVirtual: 0, demoPresentationOnsite: 0 },
          { org: 'Int. Banking', demoSupport: 0, demoPreparation: 0, demoPresentationVirtual: 0, demoPresentationOnsite: 0 }
        ]
      }
    });
  };

  const updateWeekData = (weekKey: string, orgIndex: number, field: keyof WeekData, value: number) => {
    if (!editData) return;
    const newWeeks = { ...editData.weeks };
    newWeeks[weekKey][orgIndex] = { ...newWeeks[weekKey][orgIndex], [field]: value };
    setEditData({ ...editData, weeks: newWeeks });
  };

  const deleteWeek = (weekKey: string) => {
    if (!editData) return;
    const newWeeks = { ...editData.weeks };
    delete newWeeks[weekKey];
    setEditData({ ...editData, weeks: newWeeks });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e2f4f] to-[#0f172a] flex items-center justify-center">
        <div className="text-white">Loading performance data...</div>
      </div>
    );
  }

  // Calculate metrics
  const weekLabels = Object.keys(data.weeks);
  const orgs = ['Capital Markets', 'Banking NA', 'Int. Banking'];
  const categories = ['Demo Support', 'Demo Preparation', 'Virtual Presentation', 'On-Site Presentation'];

  // Get latest week data
  const latestWeek = weekLabels[weekLabels.length - 1];
  const latestData = data.weeks[latestWeek];

  // Calculate totals
  const calculateTotals = (weekData: WeekData[]) => {
    const totals = weekData.reduce((acc, org) => {
      acc.support += org.demoSupport;
      acc.prep += org.demoPreparation;
      acc.virtual += org.demoPresentationVirtual;
      acc.onsite += org.demoPresentationOnsite;
      return acc;
    }, { support: 0, prep: 0, virtual: 0, onsite: 0 });

    const total = totals.support + totals.prep + totals.virtual + totals.onsite;
    return {
      ...totals,
      total,
      supportPct: (totals.support / total * 100).toFixed(1),
      prepPct: (totals.prep / total * 100).toFixed(1),
      virtualPct: (totals.virtual / total * 100).toFixed(1),
      onsitePct: (totals.onsite / total * 100).toFixed(1),
      productivePct: ((totals.virtual + totals.onsite) / total * 100).toFixed(1),
      wastePct: ((totals.support + totals.prep) / total * 100).toFixed(1)
    };
  };

  const latestTotals = calculateTotals(latestData);

  // Calculate week-over-week change
  const previousWeek = weekLabels[weekLabels.length - 2];
  const previousTotals = previousWeek ? calculateTotals(data.weeks[previousWeek]) : null;
  const efficiencyDelta = previousTotals 
    ? (parseFloat(latestTotals.productivePct) - parseFloat(previousTotals.productivePct)).toFixed(1)
    : '0.0';

  // Generate insight
  const generateInsight = () => {
    const efficiency = parseFloat(latestTotals.productivePct);
    const waste = parseFloat(latestTotals.wastePct);
    const delta = parseFloat(efficiencyDelta);

    if (efficiency >= 60 && delta > 0) {
      return `Strong performance this week with ${efficiency}% productive hours and a ${Math.abs(delta)}% improvement. Continue focusing on demo delivery while reducing prep time.`;
    } else if (efficiency >= 60) {
      return `Maintaining solid efficiency at ${efficiency}% productive hours. Focus on incremental improvements in reducing support and prep overhead.`;
    } else if (delta > 0) {
      return `Positive trend with ${Math.abs(delta)}% efficiency gain this week. Continue efforts to reduce the ${waste}% of time spent on support and preparation activities.`;
    } else {
      return `Efficiency at ${efficiency}% with ${waste}% non-productive time. Prioritize automation and tooling to reduce support (${latestTotals.supportPct}%) and prep work (${latestTotals.prepPct}%).`;
    }
  };

  // Prepare line chart data
  const getLineChartData = () => {
    if (chartView === 'category') {
      // Show all BUs for selected category (or all categories if "All")
      if (selectedCategory === 'All') {
        // Show all 4 categories aggregated across all BUs
        return weekLabels.map(week => {
          const weekData = data.weeks[week];
          const totals = calculateTotals(weekData);
          return {
            week,
            'Demo Support': totals.support,
            'Demo Preparation': totals.prep,
            'Virtual Presentation': totals.virtual,
            'On-Site Presentation': totals.onsite
          };
        });
      } else {
        // Show selected category broken down by BU
        return weekLabels.map(week => {
          const weekData = data.weeks[week];
          const result: any = { week };
          weekData.forEach(org => {
            const value = selectedCategory === 'Demo Support' ? org.demoSupport :
                         selectedCategory === 'Demo Preparation' ? org.demoPreparation :
                         selectedCategory === 'Virtual Presentation' ? org.demoPresentationVirtual :
                         org.demoPresentationOnsite;
            result[org.org] = value;
          });
          return result;
        });
      }
    } else {
      // View by BU
      if (selectedBU === 'All') {
        // Show all BUs with all categories combined
        return weekLabels.map(week => {
          const weekData = data.weeks[week];
          const result: any = { week };
          weekData.forEach(org => {
            result[org.org] = org.demoSupport + org.demoPreparation + org.demoPresentationVirtual + org.demoPresentationOnsite;
          });
          return result;
        });
      } else {
        // Show selected BU broken down by category
        return weekLabels.map(week => {
          const weekData = data.weeks[week];
          const orgData = weekData.find(o => o.org === selectedBU);
          if (!orgData) return { week };
          return {
            week,
            'Demo Support': orgData.demoSupport,
            'Demo Preparation': orgData.demoPreparation,
            'Virtual Presentation': orgData.demoPresentationVirtual,
            'On-Site Presentation': orgData.demoPresentationOnsite
          };
        });
      }
    }
  };

  const lineChartData = getLineChartData();
  const lineKeys = Object.keys(lineChartData[0] || {}).filter(k => k !== 'week');

  // Color mapping
  const categoryColors: { [key: string]: string } = {
    'Demo Support': '#ef4444', // red
    'Demo Preparation': '#f97316', // orange
    'Virtual Presentation': '#10b981', // green
    'On-Site Presentation': '#14b8a6', // teal
    'Capital Markets': '#8b5cf6', // purple
    'Banking NA': '#06b6d4', // cyan
    'Int. Banking': '#ec4899' // pink
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e2f4f] to-[#0f172a] text-white p-6 overflow-y-auto" style={{ maxHeight: '1080px' }}>
      
      {/* Edit Mode */}
      {editMode && editData ? (
        <div className="max-w-7xl mx-auto">
          {/* Edit Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-roobert-semibold text-white">Edit Performance Data</h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-roobert-medium transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-4 py-2 bg-fis-raspberry hover:bg-fis-raspberry/80 text-white rounded-lg text-sm font-roobert-medium transition-all"
              >
                Save Changes
              </motion.button>
            </div>
          </div>

          {/* Add Week Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addNewWeek}
            className="mb-4 px-4 py-2 bg-fis-eggplant hover:bg-fis-eggplant/80 text-white rounded-lg text-sm font-roobert-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Week
          </motion.button>

          {/* Data Tables by Organization */}
          <div className="space-y-6">
            {['Capital Markets', 'Banking NA', 'Int. Banking'].map((orgName, orgIdx) => (
              <div key={orgName} className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4">
                <h2 className="text-lg font-roobert-semibold mb-3 text-fis-raspberry">{orgName}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-3 font-roobert-medium text-white/60">Week</th>
                        <th className="text-left py-2 px-3 font-roobert-medium text-white/60">W/C</th>
                        <th className="text-right py-2 px-3 font-roobert-medium text-white/60">Demo Support</th>
                        <th className="text-right py-2 px-3 font-roobert-medium text-white/60">Demo Preparation</th>
                        <th className="text-right py-2 px-3 font-roobert-medium text-white/60">Virtual Presentation</th>
                        <th className="text-right py-2 px-3 font-roobert-medium text-white/60">On-Site Presentation</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(editData.weeks).sort().map(weekKey => {
                        const orgData = editData.weeks[weekKey].find(o => o.org === orgName);
                        if (!orgData) return null;
                        const orgIndex = editData.weeks[weekKey].findIndex(o => o.org === orgName);
                        
                        return (
                          <tr key={weekKey} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2 px-3 font-roobert-medium">{weekKey}</td>
                            <td className="py-2 px-3 text-white/60 text-xs font-roobert-light">{getWeekCommencing(weekKey)}</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={orgData.demoSupport}
                                onChange={(e) => updateWeekData(weekKey, orgIndex, 'demoSupport', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right focus:border-fis-raspberry focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={orgData.demoPreparation}
                                onChange={(e) => updateWeekData(weekKey, orgIndex, 'demoPreparation', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right focus:border-fis-raspberry focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={orgData.demoPresentationVirtual}
                                onChange={(e) => updateWeekData(weekKey, orgIndex, 'demoPresentationVirtual', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right focus:border-fis-raspberry focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={orgData.demoPresentationOnsite}
                                onChange={(e) => updateWeekData(weekKey, orgIndex, 'demoPresentationOnsite', parseInt(e.target.value) || 0)}
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right focus:border-fis-raspberry focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => deleteWeek(weekKey)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete week"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* View Mode - Original Dashboard */}
          {/* CMS Mode Controls */}
          {isCMSMode && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditClick}
                className="px-3 py-2 bg-fis-raspberry hover:bg-fis-raspberry/80 text-white rounded-lg flex items-center gap-2 text-sm font-roobert-medium transition-all shadow-lg"
              >
                <Edit2 className="w-4 h-4" />
                Edit Data
              </motion.button>
              {onClose && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-roobert-bold text-white mb-1">GTM Key Activity Performance</h1>
        <p className="text-white/60 text-sm font-roobert-light">Week Ending: {latestWeek}</p>
      </div>

      {/* Top Metrics - 4 Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Productive Hours % */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-roobert-medium uppercase">Productive</span>
            {parseFloat(efficiencyDelta) > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="text-3xl font-roobert-bold text-white mb-1">{latestTotals.productivePct}%</div>
          <div className={`text-xs font-roobert-medium ${parseFloat(efficiencyDelta) > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(efficiencyDelta) > 0 ? '+' : ''}{efficiencyDelta}% WoW
          </div>
        </motion.div>

        {/* Time Drain % */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4 shadow-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-roobert-medium uppercase">Time Drain</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-roobert-bold text-white mb-1">{latestTotals.wastePct}%</div>
          <div className="text-xs text-white/60 font-roobert-medium">
            Support: {latestTotals.supportPct}% | Prep: {latestTotals.prepPct}%
          </div>
        </motion.div>

        {/* Total Hours */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-roobert-medium uppercase">Total Hours</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-roobert-bold text-white mb-1">{latestTotals.total}h</div>
          <div className="text-xs text-white/60 font-roobert-medium">
            Presentation: {latestTotals.virtual + latestTotals.onsite}h
          </div>
        </motion.div>

        {/* Virtual vs On-Site */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-roobert-medium uppercase">Delivery Mix</span>
            <CheckCircle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-lg font-roobert-bold text-white">{latestTotals.virtualPct}%</div>
            <div className="text-xs text-white/60">/</div>
            <div className="text-lg font-roobert-bold text-white">{latestTotals.onsitePct}%</div>
          </div>
          <div className="text-xs text-white/60 font-roobert-medium">Virtual / On-Site</div>
        </motion.div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        
        {/* LEFT: Time Split Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-roobert-semibold text-white">Time Allocation</h3>
          </div>
          
          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-4">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {(() => {
                const total = parseFloat(latestTotals.supportPct) + parseFloat(latestTotals.prepPct) + 
                              parseFloat(latestTotals.virtualPct) + parseFloat(latestTotals.onsitePct);
                const segments = [
                  { value: parseFloat(latestTotals.onsitePct), color: '#14b8a6', label: 'On-Site' },
                  { value: parseFloat(latestTotals.virtualPct), color: '#10b981', label: 'Virtual' },
                  { value: parseFloat(latestTotals.prepPct), color: '#f97316', label: 'Prep' },
                  { value: parseFloat(latestTotals.supportPct), color: '#ef4444', label: 'Support' }
                ];
                
                let currentAngle = -90; // Start at top
                const radius = 60;
                const innerRadius = 40;
                const centerX = 80;
                const centerY = 80;
                
                return segments.map((seg, idx) => {
                  const angle = (seg.value / total) * 360;
                  const startAngle = currentAngle * (Math.PI / 180);
                  const endAngle = (currentAngle + angle) * (Math.PI / 180);
                  
                  const x1 = centerX + radius * Math.cos(startAngle);
                  const y1 = centerY + radius * Math.sin(startAngle);
                  const x2 = centerX + radius * Math.cos(endAngle);
                  const y2 = centerY + radius * Math.sin(endAngle);
                  const x3 = centerX + innerRadius * Math.cos(endAngle);
                  const y3 = centerY + innerRadius * Math.sin(endAngle);
                  const x4 = centerX + innerRadius * Math.cos(startAngle);
                  const y4 = centerY + innerRadius * Math.sin(startAngle);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                    'Z'
                  ].join(' ');
                  
                  currentAngle += angle;
                  
                  return (
                    <path
                      key={idx}
                      d={pathData}
                      fill={seg.color}
                      opacity="0.9"
                      filter="url(#glow)"
                    />
                  );
                });
              })()}
              {/* Center text */}
              <text x="80" y="75" textAnchor="middle" fill="white" fontSize="20" fontFamily="Roobert" fontWeight="bold">
                {latestTotals.productivePct}%
              </text>
              <text x="80" y="90" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="Roobert">
                Productive
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#14b8a6]"></div>
                <span className="text-white/80 font-roobert-medium">On-Site</span>
              </div>
              <span className="text-white font-roobert-semibold">{latestTotals.onsitePct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                <span className="text-white/80 font-roobert-medium">Virtual</span>
              </div>
              <span className="text-white font-roobert-semibold">{latestTotals.virtualPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                <span className="text-white/80 font-roobert-medium">Preparation</span>
              </div>
              <span className="text-white font-roobert-semibold">{latestTotals.prepPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <span className="text-white/80 font-roobert-medium">Support</span>
              </div>
              <span className="text-white font-roobert-semibold">{latestTotals.supportPct}%</span>
            </div>
          </div>
        </motion.div>
        
        {/* MIDDLE: Stacked Bar Chart - Org Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          <h3 className="text-sm font-roobert-semibold text-white mb-3">Organization Breakdown - {latestWeek}</h3>
          
          <div className="space-y-3">
            {latestData.map((org, idx) => {
              const total = org.demoSupport + org.demoPreparation + org.demoPresentationVirtual + org.demoPresentationOnsite;
              const supportPct = (org.demoSupport / total * 100);
              const prepPct = (org.demoPreparation / total * 100);
              const virtualPct = (org.demoPresentationVirtual / total * 100);
              const onsitePct = (org.demoPresentationOnsite / total * 100);

              return (
                <div key={org.org}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-roobert-medium text-white">{org.org}</span>
                    <span className="text-xs text-white/60">{total}h total</span>
                  </div>
                  <div className="h-6 flex rounded overflow-hidden border border-white/10">
                    <div 
                      className="bg-red-500/60 flex items-center justify-center"
                      style={{ width: `${supportPct}%` }}
                      title={`Support: ${org.demoSupport}h (${supportPct.toFixed(1)}%)`}
                    >
                      {supportPct > 8 && <span className="text-[9px] font-roobert-medium text-white">{org.demoSupport}h</span>}
                    </div>
                    <div 
                      className="bg-orange-500/60 flex items-center justify-center"
                      style={{ width: `${prepPct}%` }}
                      title={`Prep: ${org.demoPreparation}h (${prepPct.toFixed(1)}%)`}
                    >
                      {prepPct > 8 && <span className="text-[9px] font-roobert-medium text-white">{org.demoPreparation}h</span>}
                    </div>
                    <div 
                      className="bg-green-500/60 flex items-center justify-center"
                      style={{ width: `${virtualPct}%` }}
                      title={`Virtual: ${org.demoPresentationVirtual}h (${virtualPct.toFixed(1)}%)`}
                    >
                      {virtualPct > 8 && <span className="text-[9px] font-roobert-medium text-white">{org.demoPresentationVirtual}h</span>}
                    </div>
                    <div 
                      className="bg-teal-500/60 flex items-center justify-center"
                      style={{ width: `${onsitePct}%` }}
                      title={`On-Site: ${org.demoPresentationOnsite}h (${onsitePct.toFixed(1)}%)`}
                    >
                      {onsitePct > 8 && <span className="text-[9px] font-roobert-medium text-white">{org.demoPresentationOnsite}h</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/50">Productive: {((virtualPct + onsitePct)).toFixed(1)}%</span>
                    <span className="text-[10px] text-white/50">Time Drain: {((supportPct + prepPct)).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500/60"></div>
              <span className="text-white/70">Support</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500/60"></div>
              <span className="text-white/70">Prep</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500/60"></div>
              <span className="text-white/70">Virtual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-teal-500/60"></div>
              <span className="text-white/70">On-Site</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Multi-Line Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
        >
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-roobert-semibold text-white">Weekly Trend</h3>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-white/5 rounded p-0.5 border border-white/10">
                <button
                  onClick={() => setChartView('category')}
                  className={`px-2 py-1 text-[10px] font-roobert-medium rounded transition-all ${
                    chartView === 'category' ? 'bg-fis-raspberry text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  By Category
                </button>
                <button
                  onClick={() => setChartView('bu')}
                  className={`px-2 py-1 text-[10px] font-roobert-medium rounded transition-all ${
                    chartView === 'bu' ? 'bg-fis-raspberry text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  By BU
                </button>
              </div>

              {/* Filter Dropdown */}
              {chartView === 'category' ? (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded text-white font-roobert-medium [&>option]:bg-[#1a2744] [&>option]:text-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedBU}
                  onChange={(e) => setSelectedBU(e.target.value)}
                  className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded text-white font-roobert-medium [&>option]:bg-[#1a2744] [&>option]:text-white"
                >
                  <option value="All">All BUs</option>
                  {orgs.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Simple Line Chart */}
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 600 200">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((val, idx) => {
                const y = 180 - (val / 100 * 160);
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="600" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x="5" y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Roobert">{val}h</text>
                  </g>
                );
              })}

              {/* Lines */}
              {lineKeys.map((key, keyIdx) => {
                const color = categoryColors[key] || '#8b5cf6';
                const maxValue = Math.max(...lineChartData.map(d => d[key] || 0));
                const points = lineChartData.map((d, idx) => {
                  const x = 60 + (idx / (lineChartData.length - 1)) * 520;
                  const y = 180 - ((d[key] || 0) / (maxValue * 1.1) * 160);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <g key={key}>
                    <polyline
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.8"
                    />
                    {lineChartData.map((d, idx) => {
                      const x = 60 + (idx / (lineChartData.length - 1)) * 520;
                      const y = 180 - ((d[key] || 0) / (maxValue * 1.1) * 160);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={color}
                          opacity="0.9"
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* X-axis labels */}
              {weekLabels.map((week, idx) => {
                const x = 60 + (idx / (weekLabels.length - 1)) * 520;
                return (
                  <text key={week} x={x} y="195" fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="Roobert">
                    {week}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 flex-wrap mt-2 text-[9px]">
            {lineKeys.map(key => (
              <div key={key} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[key] || '#8b5cf6' }}></div>
                <span className="text-white/70">{key}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.04] border border-white/[0.06] rounded-lg p-4 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-roobert-semibold text-white mb-1 uppercase">Data Insights</h4>
            <p className="text-sm text-white/80 font-roobert-light leading-relaxed">
              {generateInsight()}
            </p>
          </div>
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
};

export default PerformanceKeyActivities;
