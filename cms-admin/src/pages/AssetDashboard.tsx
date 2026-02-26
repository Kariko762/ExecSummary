import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Package, Search, Filter, Calendar,
  TrendingUp, AlertCircle, CheckCircle, Clock, ExternalLink,
  Server, Cpu, ChevronDown, ChevronRight, Globe, HardDrive
} from 'lucide-react';

interface TechnologyAsset {
  name: string;
  created: string;
  ytdDemos: number;
  status: string;
  vendor?: string;
  type: 'technology';
}

interface InfrastructureHost {
  hostname: string;
  role: string;
  ip: string;
}

interface InfrastructureAsset {
  name: string;
  url: string;
  status: string;
  created: string;
  lastModified?: string;
  hosts: InfrastructureHost[];
  type: 'infrastructure';
}

interface VendorPerformanceData {
  meta: {
    vendor: string;
    quarter: string;
   year: number;
  };
  detailedData?: {
    assets: Record<string, any[]>;
  };
}

export default function AssetDashboard() {
  const { businessUnit } = useParams<{ businessUnit: string }>();
  const navigate = useNavigate();
  const [technologyAssets, setTechnologyAssets] = useState<TechnologyAsset[]>([]);
  const [infrastructureAssets, setInfrastructureAssets] = useState<InfrastructureAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'technology' | 'infrastructure'>('technology');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedEnvs, setExpandedEnvs] = useState<Set<string>>(new Set());
  
  // Map route param to display name
  const buNameMap: Record<string, string> = {
    'banking-north-america': 'Banking NA',
    'banking-international': 'Banking International',
    'capital-markets': 'Capital Markets',
    'payments': 'Payments'
  };

  const displayBUName = buNameMap[businessUnit || ''] || businessUnit;
  const fullBUName = businessUnit?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    fetchAssetData();
  }, [businessUnit]);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/content?tag=vendor-performance');
      const data = await response.json();
      
      if (data.success && data.content) {
        // Technology Assets - from vendor performance data
        const techAssets: TechnologyAsset[] = [];
        
        data.content.forEach((vendor: any) => {
          const buAssets = vendor.detailedData?.assets?.[displayBUName || ''];
          if (buAssets && Array.isArray(buAssets)) {
            buAssets.forEach((asset: any) => {
              techAssets.push({
                ...asset,
                vendor: vendor.meta.vendor,
                type: 'technology'
              });
            });
          }
        });
        
        setTechnologyAssets(techAssets);
        
        // Infrastructure Assets - Mock data (would come from a different API endpoint in production)
        const infraAssets: InfrastructureAsset[] = generateMockInfrastructure(displayBUName || '');
        setInfrastructureAssets(infraAssets);
      } else {
        setError('Failed to load asset data');
      }
    } catch (err) {
      console.error('Error fetching asset data:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const generateMockInfrastructure = (bu: string): InfrastructureAsset[] => {
    const environments: InfrastructureAsset[] = [];
    
    // Different mock data based on BU
    if (bu === 'Banking NA') {
      environments.push(
        {
          name: 'Credit Risk North America Demo 1',
          url: 'https://cr-na-demo01.fis.com',
          status: 'Live',
          created: '2025-11',
          lastModified: '2026-02-20',
          type: 'infrastructure',
          hosts: [
            { hostname: 'cr-na-web01.fis.com', role: 'Web Host', ip: '192.168.1.58' },
            { hostname: 'cr-na-db01.fis.com', role: 'Database', ip: '192.168.1.59' }
          ]
        },
        {
          name: 'Retail Banking Suite',
          url: 'https://retail-banking.fis.com',
          status: 'Live',
          created: '2025-09',
          lastModified: '2026-02-15',
          type: 'infrastructure',
          hosts: [
            { hostname: 'retail-web01.fis.com', role: 'Web Host', ip: '10.50.2.101' },
            { hostname: 'retail-app01.fis.com', role: 'App Server', ip: '10.50.2.102' },
            { hostname: 'retail-db01.fis.com', role: 'Database', ip: '10.50.2.103' }
          ]
        },
        {
          name: 'Loan Origination Dev',
          url: 'https://loan-dev.fis.com',
          status: 'Draft',
          created: '2026-02',
          type: 'infrastructure',
          hosts: [
            { hostname: 'loan-dev-web01.fis.com', role: 'Web Host', ip: '10.60.1.20' }
          ]
        }
      );
    } else if (bu === 'Capital Markets') {
      environments.push(
        {
          name: 'Trading Platform Demo',
          url: 'https://trading-demo.fis.com',
          status: 'Live',
          created: '2025-10',
          lastModified: '2026-02-18',
          type: 'infrastructure',
          hosts: [
            { hostname: 'trading-web01.fis.com', role: 'Web Host', ip: '172.16.5.10' },
            { hostname: 'trading-app01.fis.com', role: 'App Server', ip: '172.16.5.11' },
            { hostname: 'trading-db01.fis.com', role: 'Database', ip: '172.16.5.12' }
          ]
        },
        {
          name: 'Risk Analytics Dashboard',
          url: 'https://risk-analytics.fis.com',
          status: 'Live',
          created: '2025-12',
          lastModified: '2026-02-22',
          type: 'infrastructure',
          hosts: [
            { hostname: 'risk-web01.fis.com', role: 'Web Host', ip: '172.16.6.20' },
            { hostname: 'risk-db01.fis.com', role: 'Database', ip: '172.16.6.21' }
          ]
        }
      );
    }
    
    return environments;
  };

  const toggleEnvironment = (envName: string) => {
    const newExpanded = new Set(expandedEnvs);
    if (newExpanded.has(envName)) {
      newExpanded.delete(envName);
    } else {
      newExpanded.add(envName);
    }
    setExpandedEnvs(newExpanded);
  };

  const getFilteredTechnologyAssets = () => {
    let filtered = technologyAssets;
    
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => 
        asset.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    return filtered;
  };

  const getFilteredInfrastructureAssets = () => {
    let filtered = infrastructureAssets;
    
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => 
        asset.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    return filtered;
  };

  const techStats = {
    total: technologyAssets.length,
    live: technologyAssets.filter(a => a.status === 'Published').length,
    draft: technologyAssets.filter(a => a.status === 'Draft').length
  };

  const infraStats = {
    total: infrastructureAssets.length,
    live: infrastructureAssets.filter(a => a.status === 'Live').length,
    draft: infrastructureAssets.filter(a => a.status === 'Draft').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/executive-home/${businessUnit}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredTech = getFilteredTechnologyAssets();
  const filteredInfra = getFilteredInfrastructureAssets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/executive-home/${businessUnit}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            <span>Back to {fullBUName} Dashboard</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <Package size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Asset Dashboard</h1>
              <p className="text-slate-400">{fullBUName} - Demo Technologies & Infrastructure</p>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Assets</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              {techStats.total + infraStats.total}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Demo Tools</span>
                <span className="text-white font-medium">{techStats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Demo Infrastructure</span>
                <span className="text-white font-medium">{infraStats.total}</span>
              </div>
            </div>
          </motion.div>

          {/* Live Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Live Assets</h3>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-4">
              {techStats.live + infraStats.live}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Technologies</span>
                <span className="text-green-400 font-medium">{techStats.live}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Infrastructure</span>
                <span className="text-green-400 font-medium">{infraStats.live}</span>
              </div>
            </div>
          </motion.div>

          {/* Draft/Development */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-yellow-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">In Draft / Development</h3>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-4">
              {techStats.draft + infraStats.draft}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Technologies</span>
                <span className="text-yellow-400 font-medium">{techStats.draft}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Infrastructure</span>
                <span className="text-yellow-400 font-medium">{infraStats.draft}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters & Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6 mb-6"
        >
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('technology')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'technology'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cpu size={18} />
                <span>Demo Technologies</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                  {techStats.total}
                </span>
              </div>
              {activeTab === 'technology' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'infrastructure'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Server size={18} />
                <span>Demo Infrastructure</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                  {infraStats.total}
                </span>
              </div>
              {activeTab === 'infrastructure' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                />
              )}
            </button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value={activeTab === 'technology' ? 'published' : 'live'}>
                {activeTab === 'technology' ? 'Published' : 'Live'}
              </option>
              <option value="draft">Draft / Development</option>
            </select>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'technology' ? (
            <motion.div
              key="technology"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {filteredTech.length === 0 ? (
                <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-12 text-center">
                  <Cpu size={48} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No Technologies Found</h3>
                  <p className="text-slate-500">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTech.map((asset, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-5 hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <Cpu size={18} className="text-blue-400 flex-shrink-0" />
                            <h3 className="text-lg font-semibold text-white truncate">
                              {asset.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              asset.status === 'Published'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {asset.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Package size={14} />
                              <span>{asset.vendor}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Created {asset.created}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp size={14} />
                              <span>{asset.ytdDemos} demos YTD</span>
                            </div>
                          </div>
                        </div>

                        {asset.status === 'Published' && (
                          <button className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                            <ExternalLink size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="infrastructure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {filteredInfra.length === 0 ? (
                <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-12 text-center">
                  <Server size={48} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No Infrastructure Found</h3>
                  <p className="text-slate-500">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInfra.map((env, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 overflow-hidden"
                    >
                      {/* Environment Header */}
                      <button
                        onClick={() => toggleEnvironment(env.name)}
                        className="w-full p-5 hover:bg-slate-800/30 transition-all text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {expandedEnvs.has(env.name) ? (
                              <ChevronDown size={20} className="text-slate-400 flex-shrink-0 mt-1" />
                            ) : (
                              <ChevronRight size={20} className="text-slate-400 flex-shrink-0 mt-1" />
                            )}
                            <Server size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {env.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  env.status === 'Live'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {env.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Globe size={14} />
                                  <span className="truncate">{env.url}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>Created {env.created}</span>
                                </div>
                                {env.lastModified && (
                                  <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>Updated {env.lastModified}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">
                              {env.hosts.length} {env.hosts.length === 1 ? 'host' : 'hosts'}
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {expandedEnvs.has(env.name) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-700/50 bg-slate-800/20"
                          >
                            <div className="p-5 space-y-4">
                              {/* URL */}
                              <div className="flex items-start gap-3">
                                <Globe size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                                <div>
                                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">URL</div>
                                  <a
                                    href={env.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                                  >
                                    {env.url}
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>

                              {/* Hosts */}
                              <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Hosts</div>
                                <div className="space-y-3">
                                  {env.hosts.map((host, hostIdx) => (
                                    <div
                                      key={hostIdx}
                                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                                    >
                                      <div className="flex items-start gap-3">
                                        <HardDrive size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <div className="text-sm font-medium text-white mb-1">
                                              {host.hostname}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                              <div>
                                                <span className="text-slate-500">Role: </span>
                                                <span className="text-slate-300">{host.role}</span>
                                              </div>
                                              <div>
                                                <span className="text-slate-500">IP: </span>
                                                <span className="text-slate-300 font-mono">{host.ip}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => navigate(`/executive-home/${businessUnit}/vendor-dashboard`)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            View Vendor Dashboard
          </button>
          <button
            onClick={() => navigate(`/executive-home/${businessUnit}`)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
