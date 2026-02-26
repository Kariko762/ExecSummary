import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, ExternalLink, 
  Package, ShoppingBag, Clock, Ticket, Box, CheckSquare,
  AlertCircle, PlayCircle, Wrench, Monitor
} from 'lucide-react';
import { BUGanttTimeline } from '../components/BUGanttTimeline';

interface BusinessUnitData {
  name: string;
  shortName: string;
  color: string;
  stats: {
    revenue: string;
    growth: string;
    activeProjects: number;
    teamSize: number;
  };
  leadershipSummaries: any[];
  tasks: any[];
  vendorStats: {
    licenses: any[];
    assets: any[];
  };
}

export default function BusinessUnitDashboard() {
  const { businessUnit } = useParams<{ businessUnit: string }>();
  const navigate = useNavigate();
  const [buData, setBuData] = useState<BusinessUnitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLeadershipIndex, setCurrentLeadershipIndex] = useState(0);

  useEffect(() => {
    fetchBusinessUnitData();
  }, [businessUnit]);

  const fetchBusinessUnitData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:3001/api/weekly-bu-summary/${businessUnit}`);
      const data = await response.json();
      
      if (data.success && data.businessUnit) {
        setBuData(data.businessUnit);
      } else {
        setError(data.error || 'Business unit not found');
      }
    } catch (err) {
      console.error('Error fetching business unit data:', err);
      setError('Failed to load business unit data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading business unit data...</p>
        </div>
      </div>
    );
  }

  if (error || !buData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/executive-home')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, { accent: string; bg: string }> = {
    blue: { accent: 'text-blue-400', bg: 'bg-slate-800/50' },
    cyan: { accent: 'text-cyan-400', bg: 'bg-slate-800/50' },
    purple: { accent: 'text-purple-400', bg: 'bg-slate-800/50' },
    green: { accent: 'text-green-400', bg: 'bg-slate-800/50' },
    orange: { accent: 'text-orange-400', bg: 'bg-slate-800/50' }
  };

  const colors = colorMap[buData.color] || colorMap.blue;

  const handlePreviousLeadership = () => {
    setCurrentLeadershipIndex((prev) => 
      prev === 0 ? buData.leadershipSummaries.length - 1 : prev - 1
    );
  };

  const handleNextLeadership = () => {
    setCurrentLeadershipIndex((prev) => 
      prev === buData.leadershipSummaries.length - 1 ? 0 : prev + 1
    );
  };

  const currentLeadership = buData.leadershipSummaries[currentLeadershipIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/executive-home')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            <span>Back to Business Units</span>
          </button>

          {/* BU Title and Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left: Title (takes 3 columns on large screens) */}
            <div className="lg:col-span-3">
              <h1 className="text-4xl font-bold mb-2">{buData.name}</h1>
              <p className="text-slate-400">Weekly Executive Summary</p>
            </div>

            {/* Right: Stats Grid (takes 9 columns on large screens) */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* HOURS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-blue-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Hours</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Demo Preparation</span>
                    <span className="text-white font-semibold">12.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Demo Support</span>
                    <span className="text-white font-semibold">8.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Demo Presentations</span>
                    <span className="text-white font-semibold">6.5</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Total</span>
                    <span className="text-blue-400 font-bold text-lg">27.0</span>
                  </div>
                </div>
              </div>

              {/* TICKETS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket size={18} className="text-purple-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Tickets</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Open Tickets</span>
                    <span className="text-white font-semibold">14</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Critical / Impacted</span>
                    <span className="text-orange-400 font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Closed Tickets</span>
                    <span className="text-green-400 font-semibold">28</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-300 font-semibold">Resolution Rate</span>
                    <span className="text-purple-400 font-bold text-lg">67%</span>
                  </div>
                </div>
              </div>

              {/* ASSETS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Box size={18} className="text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Assets</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Demo Assets</span>
                    <span className="text-white font-semibold">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Technology Assets</span>
                    <span className="text-white font-semibold">18</span>
                  </div>
                  <div className="pt-1 mt-1">
                    <div className="text-xs text-slate-400 mb-1">Licenses</div>
                    <div className="pl-2 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">• Tiled</span>
                        <span className="text-slate-300 text-xs font-semibold">5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">• Synthesia</span>
                        <span className="text-slate-300 text-xs font-semibold">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">• Coast</span>
                        <span className="text-slate-300 text-xs font-semibold">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TASKS */}
              <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare size={18} className="text-green-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Tasks</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Active Initiatives</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Open Tasks</span>
                    <span className="text-white font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Complete Tasks</span>
                    <span className="text-green-400 font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Pending Deliverables</span>
                    <span className="text-orange-400 font-semibold">7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 1: Leadership Updates (70%) + Quick Links (30%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-10 lg:items-stretch gap-6 mb-8"
        >
          {/* Leadership Updates - 70% */}
          <div className="lg:col-span-7 flex">
            <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6 w-full h-full">
              <h2 className="text-2xl font-semibold mb-4">Leadership Updates</h2>
              
              {buData.leadershipSummaries && buData.leadershipSummaries.length > 0 ? (
                <div className="relative">
                  {/* Navigation Arrows */}
                  {buData.leadershipSummaries.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousLeadership}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                                 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-2
                                 transition-all duration-200 backdrop-blur-sm"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={handleNextLeadership}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                                 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full p-2
                                 transition-all duration-200 backdrop-blur-sm"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Leadership Card */}
                  <motion.div
                    key={currentLeadershipIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {currentLeadership.title}
                        </h3>
                        <div className="text-sm text-slate-400">
                          {currentLeadership.author} | {new Date(currentLeadership.date).toLocaleDateString()}
                        </div>
                        <p className={`hidden min-[1440px]:block text-xs mt-1 ${colors.accent}`}>{currentLeadership.role}</p>
                      </div>
                      <button
                        className={`${colors.accent} hover:underline flex items-center gap-1 text-sm`}
                      >
                        View Full
                        <ExternalLink size={14} />
                      </button>
                    </div>

                    {/* Details (Desktop only) */}
                    <div className="hidden min-[1440px]:block mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Details</h4>
                      <p className="text-slate-300 leading-relaxed text-sm">
                        {currentLeadership.summary}
                      </p>
                    </div>

                    {/* Quick Highlights */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Key Highlights</h4>
                      <ul className="space-y-1">
                        {currentLeadership.highlights.slice(0, 3).map((highlight: string, idx: number) => (
                          <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className={`${colors.accent} mt-1`}>•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pagination Dots */}
                    {buData.leadershipSummaries.length > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        {buData.leadershipSummaries.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentLeadershipIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentLeadershipIndex
                                ? 'bg-white w-6'
                                : 'bg-slate-600 hover:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No leadership summaries available
                </div>
              )}
            </div>
          </div>

          {/* Quick Links - 30% */}
          <div className="lg:col-span-3 flex">
            <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6 w-full h-full">
              <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
              
              <div className="space-y-3">
                {/* Vendor Dashboard */}
                <button
                  onClick={() => navigate(`/executive-home/${businessUnit}/vendor-dashboard`)}
                  className="w-full bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 
                           hover:border-slate-600 rounded-lg p-4 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <ShoppingBag size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-0.5">Vendor Dashboard</div>
                      <div className="text-xs text-slate-400">License & contract management</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </button>

                {/* Asset Dashboard */}
                <button
                  onClick={() => navigate(`/executive-home/${businessUnit}/asset-dashboard`)}
                  className="w-full bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 
                           hover:border-slate-600 rounded-lg p-4 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Package size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-0.5">Asset List</div>
                      <div className="text-xs text-slate-400">Equipment & resource inventory</div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ROW 2: Gantt Timeline (100%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {buData.name} - Initiative Timeline
            </h2>
            <div className="text-slate-400 text-sm mb-4">
              Project timeline and task dependencies for Q1 2026
            </div>
            
            {/* Embedded Gantt Component */}
            <BUGanttTimeline businessUnit={businessUnit || ''} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
