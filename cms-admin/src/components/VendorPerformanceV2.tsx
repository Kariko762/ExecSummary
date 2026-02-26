import React, { useState, useRef } from 'react';
import { X, Download, TrendingUp, DollarSign, Users, Package, BarChart3, Building2, FileText, User, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { domToPng } from 'modern-screenshot';

interface VendorPerformanceV2Props {
  data?: any;
  vendor?: string;
  onClose: () => void;
  onEdit?: () => void;
}

interface BUMetrics {
  name: string;
  spend?: number;
  spendPercentage?: number;
  licenses: {
    allocated: number;
    consumed: number;
    percentage: number;
  };
  assets: {
    published: number;
    draft: number;
    total: number;
  };
  revenue?: {
    supported: number;
    roi: number;
  };
  demos?: number;
}

const BUSINESS_UNITS = [
  'All',
  'Banking International',
  'Banking NA',
  'Capital Markets',
  'Payments'
];

const ACTUAL_BUS = [
  'Banking International',
  'Banking NA',
  'Capital Markets',
  'Payments'
];

const BU_COLORS = {
  'Banking International': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', accent: 'bg-blue-500' },
  'Banking NA': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', accent: 'bg-green-500' },
  'Capital Markets': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', accent: 'bg-purple-500' },
  'Payments': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', accent: 'bg-orange-500' }
};

export default function VendorPerformanceV2({ data, vendor, onClose, onEdit }: VendorPerformanceV2Props) {
  const [selectedBU, setSelectedBU] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [yearlyGrowth, setYearlyGrowth] = useState(20); // Default 20% annual growth
  const [q1Growth, setQ1Growth] = useState(5);
  const [q2Growth, setQ2Growth] = useState(5);
  const [q3Growth, setQ3Growth] = useState(5);
  const [q4Growth, setQ4Growth] = useState(5);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const { revenueSupported, contractingSpend, licenseConsumption, currentAssets, detailedData } = data;

  // Get license unit cost (default to calculating from total spend if not provided)
  const licenseUnitCost = data.licenseUnitCost || 
    (licenseConsumption?.totalConsumed > 0 
      ? parseFloat(contractingSpend?.currentSpend?.replace(/[$K,]/g, '')) / licenseConsumption.totalConsumed 
      : 0);

  // Helper: Calculate months active in current year (2026) - includes start month
  const calculateMonthsActive = (licenseStartMonth: string): number => {
    if (!licenseStartMonth) return 0;
    
    const [year, month] = licenseStartMonth.split('-').map(Number);
    const currentDate = new Date(); // Feb 12, 2026
    const currentYear = 2026;
    const currentMonth = currentDate.getMonth() + 1; // 1-based (Feb = 2)
    
    // If started before 2026, count from January 2026
    if (year < currentYear) {
      return currentMonth; // Jan through current month
    }
    
    // If started in 2026, count from start month to current month (inclusive)
    if (year === currentYear) {
      return Math.max(0, currentMonth - month + 1);
    }
    
    // Started in future, no months yet
    return 0;
  };

  // Helper: Calculate individual user cost for the year
  const calculateUserCost = (user: any): number => {
    if (user.status === 'Inactive') return 0;
    
    const termModel = data.licenseTermModel || 'Monthly';
    const startMonth = user.licenseStartMonth || user.licenseStartDate?.slice(0, 7) || '';
    
    if (termModel === 'Yearly') {
      // Yearly: full year cost if active at any point
      return licenseUnitCost * 12;
    } else {
      // Monthly: cost based on months active in current year
      const monthsActive = calculateMonthsActive(startMonth);
      return licenseUnitCost * monthsActive;
    }
  };

  // Calculate BU metrics (only for actual BUs, not 'All')
  const buMetrics: BUMetrics[] = ACTUAL_BUS.map(buName => {
    // Get all users for this BU
    const allUsers = detailedData?.users?.[buName] || [];
    const activeUsers = allUsers.filter((u: any) => u.status === 'Active');
    const userCount = activeUsers.length;
    
    // Count actual assets from detailedData
    const buAssets = detailedData?.assets?.[buName] || [];
    const publishedCount = buAssets.filter((a: any) => a.status === 'Published').length;
    const draftCount = buAssets.filter((a: any) => a.status === 'Draft').length;
    const totalAssets = buAssets.length;
    
    // Calculate spend: sum individual user costs (in dollars)
    const buSpend = allUsers.reduce((sum: number, user: any) => 
      sum + calculateUserCost(user), 0
    );
    
    // Calculate revenue per BU based on demos performed
    const demoData = currentAssets?.demosPerformed?.find((bu: any) => bu.name === buName);
    const totalDemos = currentAssets?.demosPerformed?.reduce((sum: number, bu: any) => sum + bu.count, 0) || 1;
    const buDemoPercentage = (demoData?.count || 0) / totalDemos;
    const totalRevenue = parseFloat(revenueSupported?.total?.replace(/[$M,]/g, '')) || 0;
    const buRevenue = totalRevenue * buDemoPercentage;
    const roi = buSpend > 0 ? (buRevenue / (buSpend / 1000000)) : 0; // Convert dollars to M

    return {
      name: buName,
      spend: buSpend,
      spendPercentage: 0,
      licenses: {
        allocated: 0,
        consumed: userCount,
        percentage: 0
      },
      assets: {
        published: publishedCount,
        draft: draftCount,
        total: totalAssets
      },
      revenue: {
        supported: buRevenue,
        roi: roi
      },
      demos: demoData?.count || 0
    };
  });

  const totalMetrics = {
    spend: buMetrics.reduce((sum, bu) => sum + bu.spend, 0),
    licenses: buMetrics.reduce((sum, bu) => sum + bu.licenses.consumed, 0),
    assets: buMetrics.reduce((sum, bu) => sum + bu.assets.total, 0),
    revenue: parseFloat(revenueSupported?.total?.replace(/[$M,]/g, '')) || 0,
    utilization: licenseConsumption?.utilizationRate || 0
  };

  // Smart formatter for spend display
  const formatSpend = (dollars: number): string => {
    if (dollars >= 1000) {
      return `$${(dollars / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(dollars)}`;
  };

  // BU tag mapping
  const BU_TAGS: { [key: string]: string } = {
    'Banking International': 'INT',
    'Banking NA': 'NA',
    'Capital Markets': 'CM',
    'Payments': 'PMT'
  };

  // Filter BU metrics based on selected tab
  const displayedBUs = selectedBU === 'All' ? buMetrics : buMetrics.filter(bu => bu.name === selectedBU);

  // Aggregate metrics for "All" view
  const aggregatedMetrics = {
    licenses: {
      consumed: buMetrics.reduce((sum, bu) => sum + bu.licenses.consumed, 0),
      allocated: buMetrics.reduce((sum, bu) => sum + bu.licenses.allocated, 0),
      percentage: 0
    },
    assets: {
      published: buMetrics.reduce((sum, bu) => sum + bu.assets.published, 0),
      draft: buMetrics.reduce((sum, bu) => sum + bu.assets.draft, 0),
      total: buMetrics.reduce((sum, bu) => sum + bu.assets.total, 0)
    },
    demos: buMetrics.reduce((sum, bu) => sum + (bu.demos || 0), 0)
  };

  // Use aggregated or specific BU data
  const currentData = selectedBU === 'All' ? aggregatedMetrics : displayedBUs[0];

  // Forecasting calculations
  const getCurrentMonthlySpend = () => {
    if (selectedBU === 'All') {
      return totalMetrics.spend / 2; // YTD spend / 2 months = monthly avg
    }
    return (displayedBUs[0]?.spend || 0) / 2;
  };

  const getActiveUserCount = () => {
    if (selectedBU === 'All') {
      return totalMetrics.licenses;
    }
    return displayedBUs[0]?.licenses.consumed || 0;
  };

  const calculateRunRateForecast = () => {
    const monthlySpend = getCurrentMonthlySpend();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, idx) => ({
      month,
      actual: idx < 2 ? monthlySpend : null, // Jan, Feb are actual
      forecast: idx >= 2 ? monthlySpend : null // Rest are forecast
    }));
  };

  const calculateScenarioForecast = (useQuarterly: boolean) => {
    const currentUsers = getActiveUserCount();
    const monthlyCost = data.licenseUnitCost || 8;
    const termModel = data.licenseTermModel || 'Monthly';
    const startMonth = new Date().getMonth() + 1; // Feb = 2
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let cumulativeUsers = currentUsers;
    
    return months.map((month, idx) => {
      let users = currentUsers;
      let spend = 0;
      
      if (idx < 2) {
        // Actual months (Jan, Feb)
        users = currentUsers;
        spend = getCurrentMonthlySpend();
      } else {
        // Forecast months
        if (useQuarterly) {
          // Apply quarterly growth
          const quarter = Math.floor(idx / 3);
          const growthRates = [q1Growth, q2Growth, q3Growth, q4Growth];
          const monthsInQuarter = idx % 3;
          
          if (monthsInQuarter === 0) {
            cumulativeUsers = Math.round(cumulativeUsers * (1 + growthRates[quarter] / 100));
          }
          users = cumulativeUsers;
        } else {
          // Apply yearly growth evenly
          const monthlyGrowthRate = yearlyGrowth / 12 / 100;
          users = Math.round(currentUsers * Math.pow(1 + monthlyGrowthRate, idx - 1));
        }
        
        // Calculate spend based on term model
        if (termModel === 'Yearly') {
          spend = users * monthlyCost * 12 / 12; // Spread annual cost
        } else {
          spend = users * monthlyCost;
        }
      }
      
      return { month, users, spend };
    });
  };

  const runRateData = calculateRunRateForecast();
  const yearlyScenario = calculateScenarioForecast(false);
  const quarterlyScenario = calculateScenarioForecast(true);

  const getAnnualProjection = (scenario: any[]) => {
    return scenario.reduce((sum, m) => sum + (m.spend || 0), 0);
  };

  // Export handler
  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
      });
      
      const link = document.createElement('a');
      const buName = selectedBU === 'All' ? 'All-BUs' : selectedBU.replace(/\s+/g, '-');
      link.download = `${data.meta?.vendor}-${buName}-${data.meta?.quarter}-${data.meta?.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-roobert-heavy text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#4bcd3e]" />
              {data.meta?.vendor || vendor} Performance by Business Unit
            </h2>
            <p className="text-sm text-white/60 font-roobert-medium mt-1">
              {data.meta?.quarter} {data.meta?.year} • Business Unit Breakdown
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title={isExporting ? 'Exporting...' : 'Export to PNG'}
            >
              <Download className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-4 py-2 bg-[#4bcd3e] hover:bg-[#3dad2f] text-white rounded-lg transition-colors font-roobert-semibold flex items-center gap-2"
                title="Edit Performance Data"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-slate-900/30">
          <div className="flex items-center gap-2 overflow-x-auto">
            {BUSINESS_UNITS.map(bu => (
              <button
                key={bu}
                onClick={() => { setSelectedBU(bu); setShowForecast(false); }}
                className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all whitespace-nowrap ${
                  selectedBU === bu
                    ? 'bg-[#4bcd3e] text-slate-900'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {bu === 'Banking International' ? 'Banking (Int)' : 
                 bu === 'Banking NA' ? 'Banking (NA)' : bu}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all flex items-center gap-2 ${
              showForecast
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showForecast ? 'Hide Forecast' : 'Show Forecast'}
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-900">
          
          {!showForecast ? (
          <>
            {/* Overview Metrics - Show for all tabs */}
            <div className="grid grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-xs font-roobert-semibold text-white/60 uppercase tracking-wide">
                  {selectedBU === 'All' ? 'Total Revenue' : 'Revenue'}
                </span>
              </div>
              <div className="text-2xl font-roobert-bold text-white">
                {selectedBU === 'All' 
                  ? `$${totalMetrics.revenue.toFixed(1)}M`
                  : `$${displayedBUs[0]?.revenue?.supported.toFixed(2)}M`
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-roobert-semibold text-white/60 uppercase tracking-wide">
                  {selectedBU === 'All' ? 'Total Spend' : 'Spend'}
                </span>
              </div>
              <div className="text-2xl font-roobert-bold text-white">
                {selectedBU === 'All' 
                  ? formatSpend(totalMetrics.spend)
                  : formatSpend(displayedBUs[0]?.spend || 0)
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-roobert-semibold text-white/60 uppercase tracking-wide">Licenses</span>
              </div>
              <div className="text-2xl font-roobert-bold text-white">
                {selectedBU === 'All' 
                  ? totalMetrics.licenses
                  : displayedBUs[0]?.licenses.consumed
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span className="text-xs font-roobert-semibold text-white/60 uppercase tracking-wide">Assets</span>
              </div>
              <div className="text-2xl font-roobert-bold text-white">
                {selectedBU === 'All' 
                  ? totalMetrics.assets
                  : displayedBUs[0]?.assets.total
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-400" />
                <span className="text-xs font-roobert-semibold text-white/60 uppercase tracking-wide">ROI</span>
              </div>
              <div className="text-2xl font-roobert-bold text-white">
                {selectedBU === 'All' 
                  ? `${(buMetrics.reduce((sum, bu) => sum + (bu.revenue?.roi || 0), 0) / buMetrics.length).toFixed(1)}x`
                  : `${displayedBUs[0]?.revenue?.roi.toFixed(1)}x`
                }
              </div>
            </div>
          </div>
          </>
          ) : (
          <>
            {/* FORECAST VIEW */}
            <div className="space-y-6">
              {/* Forecast Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-roobert-bold text-white mb-1">Spend Forecast Analysis</h3>
                  <p className="text-sm text-white/60">
                    {selectedBU === 'All' ? 'All Business Units' : selectedBU} • Projections based on current usage
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/40">Current Active Users</div>
                  <div className="text-3xl font-roobert-bold text-white">{getActiveUserCount()}</div>
                </div>
              </div>

              {/* Current State Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-xs font-roobert-semibold text-blue-400 uppercase mb-1">YTD Spend</div>
                  <div className="text-2xl font-roobert-bold text-white">{formatSpend(selectedBU === 'All' ? totalMetrics.spend : displayedBUs[0]?.spend || 0)}</div>
                  <div className="text-xs text-white/40 mt-1">Jan - Feb 2026</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-xs font-roobert-semibold text-purple-400 uppercase mb-1">Monthly Avg</div>
                  <div className="text-2xl font-roobert-bold text-white">{formatSpend(getCurrentMonthlySpend())}</div>
                  <div className="text-xs text-white/40 mt-1">Per month run rate</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                  <div className="text-xs font-roobert-semibold text-green-400 uppercase mb-1">Run Rate Projection</div>
                  <div className="text-2xl font-roobert-bold text-white">{formatSpend(getCurrentMonthlySpend() * 12)}</div>
                  <div className="text-xs text-white/40 mt-1">Annual (no growth)</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                  <div className="text-xs font-roobert-semibold text-orange-400 uppercase mb-1">License Cost</div>
                  <div className="text-2xl font-roobert-bold text-white">${data.licenseUnitCost || 8}</div>
                  <div className="text-xs text-white/40 mt-1">{data.licenseTermModel || 'Monthly'} billing</div>
                </div>
              </div>

              {/* Multi-Scenario Forecasting */}
              <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
                <h4 className="text-lg font-roobert-bold text-white mb-2">Growth Scenario Planning</h4>
                <p className="text-sm text-white/60 mb-6">Adjust growth rates to model different expansion scenarios</p>

                {/* Scenario Controls */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Yearly Growth */}
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-roobert-semibold text-white">Annual Growth Rate</label>
                      <span className="text-lg font-roobert-bold text-blue-400">{yearlyGrowth}%</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="100"
                      step="5"
                      value={yearlyGrowth}
                      onChange={(e) => setYearlyGrowth(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(yearlyGrowth + 20) / 1.2}%, rgba(255,255,255,0.1) ${(yearlyGrowth + 20) / 1.2}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-white/40 mt-2">
                      <span>-20%</span>
                      <span>0%</span>
                      <span>+100%</span>
                    </div>
                    <div className="mt-3 text-xs text-white/60">
                      Projected Year-End Users: <span className="font-roobert-bold text-white">{Math.round(getActiveUserCount() * (1 + yearlyGrowth / 100))}</span>
                    </div>
                  </div>

                  {/* Quarterly Growth */}
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
                    <label className="text-sm font-roobert-semibold text-white mb-3 block">Quarterly Growth Rates</label>
                    <div className="space-y-2">
                      {[{ label: 'Q1', value: q1Growth, setter: setQ1Growth },
                        { label: 'Q2', value: q2Growth, setter: setQ2Growth },
                        { label: 'Q3', value: q3Growth, setter: setQ3Growth },
                        { label: 'Q4', value: q4Growth, setter: setQ4Growth }].map((q) => (
                        <div key={q.label} className="flex items-center gap-3">
                          <span className="text-xs text-white/60 w-8">{q.label}</span>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            step="5"
                            value={q.value}
                            onChange={(e) => q.setter(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-roobert-bold text-purple-400 w-10 text-right">{q.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scenario Comparison */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
                    <div className="text-xs text-green-400 font-roobert-semibold uppercase mb-1">Conservative (No Growth)</div>
                    <div className="text-2xl font-roobert-bold text-white">{formatSpend(getCurrentMonthlySpend() * 12)}</div>
                    <div className="text-xs text-white/60 mt-2">Annual Projection</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="text-xs text-blue-400 font-roobert-semibold uppercase mb-1">Annual Growth ({yearlyGrowth}%)</div>
                    <div className="text-2xl font-roobert-bold text-white">{formatSpend(getAnnualProjection(yearlyScenario))}</div>
                    <div className="text-xs text-white/60 mt-2">Linear expansion model</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
                    <div className="text-xs text-purple-400 font-roobert-semibold uppercase mb-1">Quarterly Model</div>
                    <div className="text-2xl font-roobert-bold text-white">{formatSpend(getAnnualProjection(quarterlyScenario))}</div>
                    <div className="text-xs text-white/60 mt-2">Custom quarter-by-quarter</div>
                  </div>
                </div>

                {/* Detailed Monthly Breakdown Toggle */}
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-roobert-semibold text-white/70 hover:text-white transition-colors">
                    View Detailed Monthly Breakdown ▾
                  </summary>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-3 text-xs font-roobert-semibold text-white/60">Month</th>
                          <th className="text-right py-2 px-3 text-xs font-roobert-semibold text-white/60">Users (Annual)</th>
                          <th className="text-right py-2 px-3 text-xs font-roobert-semibold text-white/60">Spend (Annual)</th>
                          <th className="text-right py-2 px-3 text-xs font-roobert-semibold text-white/60">Users (Quarterly)</th>
                          <th className="text-right py-2 px-3 text-xs font-roobert-semibold text-white/60">Spend (Quarterly)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyScenario.map((item, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-3 text-white/80 font-roobert-semibold">{item.month}</td>
                            <td className="py-2 px-3 text-right text-white/60">{item.users}</td>
                            <td className="py-2 px-3 text-right text-white/60">{formatSpend(item.spend)}</td>
                            <td className="py-2 px-3 text-right text-purple-400">{quarterlyScenario[idx].users}</td>
                            <td className="py-2 px-3 text-right text-purple-400">{formatSpend(quarterlyScenario[idx].spend)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-white/20 font-roobert-bold">
                          <td className="py-3 px-3 text-white">Total</td>
                          <td className="py-3 px-3 text-right text-white">{yearlyScenario[11].users}</td>
                          <td className="py-3 px-3 text-right text-white">{formatSpend(getAnnualProjection(yearlyScenario))}</td>
                          <td className="py-3 px-3 text-right text-purple-400">{quarterlyScenario[11].users}</td>
                          <td className="py-3 px-3 text-right text-purple-400">{formatSpend(getAnnualProjection(quarterlyScenario))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>

              {/* Commitment Tracker (if available) */}
              {data.contractingSpend?.annualCommitment && (
                <div className="bg-gradient-to-br from-orange-500/10 to-red-600/5 border border-orange-500/20 rounded-xl p-6">
                  <h4 className="text-lg font-roobert-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Contract Commitment Tracker
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-white/60 mb-1">Annual Commitment</div>
                      <div className="text-xl font-roobert-bold text-white">{data.contractingSpend.annualCommitment}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Projected Spend (Run Rate)</div>
                      <div className="text-xl font-roobert-bold text-blue-400">{formatSpend(getCurrentMonthlySpend() * 12)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/60 mb-1">Status</div>
                      <div className={`text-xl font-roobert-bold ${
                        getCurrentMonthlySpend() * 12 > parseFloat(data.contractingSpend.annualCommitment.replace(/[^0-9]/g, ''))
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}>
                        {getCurrentMonthlySpend() * 12 > parseFloat(data.contractingSpend.annualCommitment.replace(/[^0-9]/g, ''))
                          ? 'Over Commitment'
                          : 'On Track'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
          )}

          {/* Detailed View for Selected BU or All BUs */}
          {currentData && (
            <div className="space-y-6">
              
              {/* ROW 2: Users and Assets - Two Columns */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Column 1: Users List */}
                <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-roobert-bold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Active Users ({currentData.licenses.consumed})
                  </h3>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {(() => {
                      // Get users for selected BU(s)
                      let users: any[] = [];
                      if (selectedBU === 'All' && detailedData?.users) {
                        // Combine all BU users with BU tag
                        users = Object.entries(detailedData.users).flatMap(([buName, buUsers]: [string, any]) =>
                          buUsers.map((user: any) => ({ ...user, buTag: buName }))
                        );
                      } else if (detailedData?.users?.[selectedBU]) {
                        users = detailedData.users[selectedBU];
                      }
                      
                      if (users.length === 0) {
                        return (
                          <div className="text-center py-8 text-white/40">
                            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No users added yet</p>
                          </div>
                        );
                      }
                      
                      return users.map((user, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <User className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs font-roobert-semibold text-white truncate">{user.name}</span>
                                {user.status && (
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-semibold flex-shrink-0 ${
                                    user.status === 'Active' 
                                      ? 'bg-green-500/20 text-green-300' 
                                      : 'bg-red-500/20 text-red-300'
                                  }`}>
                                    {user.status}
                                  </span>
                                )}
                                {selectedBU === 'All' && user.buTag && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-roobert-semibold bg-purple-500/20 text-purple-300 flex-shrink-0">
                                    {user.buTag === 'FIS General' && user.businessUnit ? user.businessUnit : BU_TAGS[user.buTag] || user.buTag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-[10px] text-white/50 truncate max-w-[140px]">
                                {user.email}
                              </div>
                              {(user.licenseStartMonth || user.licenseStartDate) && (
                                <div className="text-[10px] text-white/40">
                                  Started: <span className="text-white/60">{user.licenseStartMonth || user.licenseStartDate?.slice(0, 7)}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-white/50">
                                Last: <span className="text-white/70">{user.lastLogin}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Column 2: Assets List */}
                <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-roobert-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Assets ({currentData.assets.total})
                  </h3>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {(() => {
                      // Get assets for selected BU(s)
                      let assets: any[] = [];
                      if (selectedBU === 'All' && detailedData?.assets) {
                        // Combine all BU assets with BU tag
                        assets = Object.entries(detailedData.assets).flatMap(([buName, buAssets]: [string, any]) =>
                          buAssets.map((asset: any) => ({ ...asset, buTag: buName }))
                        );
                      } else if (detailedData?.assets?.[selectedBU]) {
                        assets = detailedData.assets[selectedBU];
                      }
                      
                      if (assets.length === 0) {
                        return (
                          <div className="text-center py-8 text-white/40">
                            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No assets added yet</p>
                          </div>
                        );
                      }
                      
                      return assets.map((asset, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Package className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs font-roobert-semibold text-white/80 truncate">{asset.name}</span>
                                {selectedBU === 'All' && asset.buTag && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-roobert-semibold bg-orange-500/20 text-orange-300 flex-shrink-0">
                                    {BU_TAGS[asset.buTag] || asset.buTag}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <div className="text-[10px] text-white/50">
                                Created: <span className="text-white/70">{asset.created}</span>
                              </div>
                              <div className="text-[10px] text-white/50">
                                YTD: <span className="font-roobert-semibold text-white/80">{asset.ytdDemos}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-roobert-semibold ${
                                asset.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {asset.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* ROW 3: Deals Table - Full Width */}
              <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-roobert-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Revenue Supported - Deal Pipeline
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-xs font-roobert-semibold text-white/70 uppercase tracking-wide pb-3">OID</th>
                        <th className="text-left text-xs font-roobert-semibold text-white/70 uppercase tracking-wide pb-3">Client</th>
                        <th className="text-left text-xs font-roobert-semibold text-white/70 uppercase tracking-wide pb-3">Product</th>
                        <th className="text-right text-xs font-roobert-semibold text-white/70 uppercase tracking-wide pb-3">Value</th>
                        <th className="text-center text-xs font-roobert-semibold text-white/70 uppercase tracking-wide pb-3">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(() => {
                        // Get deals for selected BU(s)
                        let deals: any[] = [];
                        if (selectedBU === 'All' && detailedData?.deals) {
                          // Combine all BU deals
                          deals = Object.values(detailedData.deals).flat().slice(0, 8);
                        } else if (detailedData?.deals?.[selectedBU]) {
                          deals = detailedData.deals[selectedBU];
                        }
                        
                        if (deals.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-white/40">
                                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No deals added yet</p>
                              </td>
                            </tr>
                          );
                        }
                        
                        return deals.map((deal, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-3 text-sm font-roobert-medium text-white/80">{deal.oid}</td>
                            <td className="py-3 text-sm text-white/70">{deal.client}</td>
                            <td className="py-3 text-sm text-white/70">{deal.product}</td>
                            <td className="py-3 text-sm text-right font-roobert-semibold text-green-400">{deal.value}</td>
                            <td className="py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-roobert-semibold ${
                                deal.stage === 'Closed-Won' ? 'bg-green-500/20 text-green-400' :
                                deal.stage === 'Proposal' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {deal.stage}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* All BUs Summary View */}
          {selectedBU === 'All' && (
            <div className="space-y-6">
              <div className="pt-4">
                <h3 className="text-xl font-roobert-bold text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#4bcd3e]" />
                  Business Unit Comparison
                </h3>
                <p className="text-sm text-white/50 font-roobert-light">
                  Side-by-side comparison of all business units
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {buMetrics.map((bu) => {
                  const colors = BU_COLORS[bu.name as keyof typeof BU_COLORS];
                  
                  return (
                    <div key={bu.name} className={`${colors.bg} border ${colors.border} rounded-xl p-5`}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${colors.accent}`} />
                        <h4 className="text-sm font-roobert-bold text-white">{bu.name}</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-white/50 font-roobert-light">Spend</div>
                          <div className="text-lg font-roobert-bold text-white">{formatSpend(bu.spend || 0)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 font-roobert-light">ROI</div>
                          <div className="text-lg font-roobert-bold text-green-400">{bu.revenue?.roi.toFixed(1)}x</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 font-roobert-light">Licenses</div>
                          <div className="text-lg font-roobert-bold text-white">{bu.licenses.consumed}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 font-roobert-light">Assets</div>
                          <div className="text-lg font-roobert-bold text-white">{bu.assets.total}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/50 font-roobert-light">Revenue</div>
                          <div className="text-lg font-roobert-bold text-white">${bu.revenue?.supported.toFixed(2)}M</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
