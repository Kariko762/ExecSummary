import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Package, Search, Filter, Calendar,
  TrendingUp, AlertCircle, CheckCircle, Clock, ExternalLink,
  Server, Cpu, ChevronDown, ChevronRight, Globe, HardDrive, Building2
} from 'lucide-react';

interface Host {
  hostname: string;
  role: string;
  ip: string;
}

interface Asset {
  id: string;
  name: string;
  type: 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool';
  classification: string;
  businessUnit: string;
  product: string;
  status: string;
  url: string;
  conditionalFields?: Record<string, any>;
  signalFields?: Record<string, boolean>;
  extendedAttributes?: Record<string, any>;
  hosts?: Host[];
  created: string;
  lastModified: string;
}

interface BusinessUnit {
  id: string;
  name: string;
  parentId: string;
}

export default function AssetDashboard() {
  const { businessUnit } = useParams<{ businessUnit: string }>();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'technology' | 'infrastructure'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedEnvs, setExpandedEnvs] = useState<Set<string>>(new Set());
  
  // Map route param to BU ID
  const buNameMap: Record<string, string> = {
    'banking-north-america': 'bu-banking-north-america',
    'banking-international': 'bu-banking-international',
    'capital-markets': 'bu-capital-markets',
    'payments': 'bu-payments'
  };

  const buId = buNameMap[businessUnit || ''] || '';
  const fullBUName = businessUnit?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    fetchAssetData();
  }, [businessUnit]);

  // Get BU and all its descendants
  const getBUAndDescendants = (targetBuId: string, units: BusinessUnit[]): string[] => {
    const ids = [targetBuId];
    const findChildren = (parentId: string) => {
      units.forEach(unit => {
        if (unit.parentId === parentId) {
          ids.push(unit.id);
          findChildren(unit.id);
        }
      });
    };
    findChildren(targetBuId);
    return ids;
  };

  // Get hierarchy path for an asset (L3 → L4 → L5 → L6 → L7)
  const getHierarchyPath = (asset: Asset): string => {
    if (!asset.businessUnit) return '';
    
    // Find the BU (could be ID or name)
    let targetBU = businessUnits.find(bu => bu.id === asset.businessUnit || bu.name === asset.businessUnit);
    if (!targetBU) return '';
    
    // Build path from current unit up to root
    const path: string[] = [];
    let currentBU: BusinessUnit | null = targetBU;
    
    while (currentBU) {
      // Extract level from ID (e.g., "l3-trading-risk" → "L3")
      const levelMatch = currentBU.id.match(/^(bu|l3|l4|l5|l6|l7)-/);
      if (levelMatch) {
        const level = levelMatch[1].toUpperCase();
        if (level !== 'BU') {
          path.unshift(`${level}: ${currentBU.name}`);
        }
      }
      
      // Move to parent
      if (currentBU.parentId) {
        currentBU = businessUnits.find(bu => bu.id === currentBU!.parentId) || null;
      } else {
        break;
      }
    }
    
    // Add product if available
    if (asset.product) {
      path.push(`Product: ${asset.product}`);
    }
    
    return path.join(' → ');
  };

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 Asset Dashboard: Fetching data for BU:', buId, fullBUName);
      
      // Fetch data in parallel
      const [assetsRes, buRes] = await Promise.all([
        fetch('http://localhost:3001/api/assets'),
        fetch('http://localhost:3001/api/business-units')
      ]);
      
      const assetsData = await assetsRes.json();
      const buData = await buRes.json();
      
      console.log('🔧 API Responses:', {
        assets: { success: assetsData.success, count: assetsData.data?.length, allAssets: assetsData.data },
        bu: { success: buData.success, count: buData.units?.length }
      });
      
      if (assetsData.success && buData.success) {
        setBusinessUnits(buData.units || []);
        
        // Get all BU IDs (this BU + descendants)
        const buIds = getBUAndDescendants(buId, buData.units || []);
        
        // Create mapping of BU names to IDs for filtering
        const buNameToId: Record<string, string> = {};
        (buData.units || []).forEach((unit: BusinessUnit) => {
          buNameToId[unit.name] = unit.id;
        });
        
        console.log('🏢 BU Filtering:', {
          targetBuId: buId,
          buIds,
          buNameToId,
          allAssets: assetsData.data?.length || 0
        });
        
        // Filter assets assigned to this BU or its descendants
        // Assets may use either BU ID or BU name, so check both
        const filteredAssets = (assetsData.data || []).filter((asset: Asset) => {
          if (!asset.businessUnit) return false;
          
          // Check if businessUnit is an ID (starts with 'bu-' or 'l3-' etc)
          if (buIds.includes(asset.businessUnit)) {
            return true;
          }
          
          // Check if businessUnit is a name that maps to one of our BU IDs
          const buIdFromName = buNameToId[asset.businessUnit];
          return buIdFromName && buIds.includes(buIdFromName);
        });
        
        console.log('✅ Filtered Assets:', {
          total: filteredAssets.length,
          demoTech: filteredAssets.filter((a: Asset) => a.type === 'Demo Technology').length,
          liveEnv: filteredAssets.filter((a: Asset) => a.type === 'Live Environment').length,
          assets: filteredAssets.map((a: Asset) => ({ name: a.name, type: a.type, bu: a.businessUnit }))
        });
        
        setAssets(filteredAssets);
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
    let filtered = assets.filter(a => a.type === 'Demo Technology');
    
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.product?.toLowerCase().includes(searchQuery.toLowerCase())
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
    let filtered = assets.filter(a => a.type === 'Live Environment');
    
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.url?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(asset => 
        asset.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    return filtered;
  };

  const technologyAssets = assets.filter(a => a.type === 'Demo Technology');
  const infrastructureAssets = assets.filter(a => a.type === 'Live Environment');

  const techStats = {
    total: technologyAssets.length,
    live: technologyAssets.filter(a => a.status === 'Active' || a.status === 'Published').length,
    draft: technologyAssets.filter(a => a.status === 'Draft').length
  };

  const infraStats = {
    total: infrastructureAssets.length,
    live: infrastructureAssets.filter(a => a.status === 'Active' || a.status === 'Live').length,
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
      <div className="px-6 py-8">
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
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package size={18} />
                <span>All</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                  {techStats.total + infraStats.total}
                </span>
              </div>
              {activeTab === 'all' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                />
              )}
            </button>
            
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
              {activeTab === 'all' && (
                <>
                  <option value="published">Published</option>
                  <option value="live">Live</option>
                </>
              )}
              {activeTab === 'technology' && (
                <option value="published">Published</option>
              )}
              {activeTab === 'infrastructure' && (
                <option value="live">Live</option>
              )}
              <option value="draft">Draft / Development</option>
            </select>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'all' ? (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Technology Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu size={20} className="text-blue-400" />
                  Demo Technologies
                  <span className="text-sm text-slate-400 font-normal">({techStats.total})</span>
                </h2>
                {filteredTech.length === 0 ? (
                  <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-8 text-center">
                    <Cpu size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No technologies found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTech.map((asset, idx) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-3 hover:border-slate-600 transition-all"
                      >
                        <div className="space-y-2">
                          {/* Main Row */}
                          <div className="flex items-center gap-3">
                            {/* Icon */}
                            <Cpu size={18} className="text-blue-400 flex-shrink-0" />
                            
                            {/* Name */}
                            <div className="min-w-[200px]">
                              <h3 className="text-base font-semibold text-white truncate">
                                {asset.name}
                              </h3>
                            </div>
                            
                            {/* Status */}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                              asset.status === 'Active' || asset.status === 'Published'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {asset.status}
                            </span>
                            
                            {/* Product */}
                            {asset.product && (
                              <div className="flex items-center gap-1 text-sm text-slate-400 min-w-[150px]">
                                <Package size={14} className="flex-shrink-0" />
                                <span className="truncate">{asset.product}</span>
                              </div>
                            )}
                            
                            {/* Created */}
                            <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                              <Calendar size={14} />
                              <span>{new Date(asset.created).toLocaleDateString()}</span>
                            </div>
                            
                            {/* YTD Demos */}
                            {asset.conditionalFields?.ytdDemos && (
                              <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                                <TrendingUp size={14} />
                                <span>{asset.conditionalFields.ytdDemos} demos YTD</span>
                              </div>
                            )}
                            
                            {/* External Link */}
                            {(asset.status === 'Active' || asset.status === 'Published') && asset.url && (
                              <a 
                                href={asset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              >
                                <ExternalLink size={18} />
                              </a>
                            )}
                          </div>
                          
                          {/* Hierarchy Row */}
                          {getHierarchyPath(asset) && (
                            <div className="flex items-center gap-2 ml-9 text-xs text-slate-500">
                              <Building2 size={12} className="flex-shrink-0" />
                              <span className="truncate">{getHierarchyPath(asset)}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Infrastructure Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Server size={20} className="text-orange-400" />
                  Demo Infrastructure
                  <span className="text-sm text-slate-400 font-normal">({infraStats.total})</span>
                </h2>
                {filteredInfra.length === 0 ? (
                  <div className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-8 text-center">
                    <Server size={36} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No infrastructure found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInfra.map((env, idx) => (
                      <motion.div
                        key={env.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 overflow-hidden"
                      >
                        {/* Environment Header */}
                        <button
                          onClick={() => toggleEnvironment(env.id)}
                          className="w-full p-3 hover:bg-slate-800/30 transition-all text-left"
                        >
                          <div className="space-y-2">
                            {/* Main Row */}
                            <div className="flex items-center gap-3">
                              {/* Chevron */}
                              {expandedEnvs.has(env.id) ? (
                                <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                              ) : (
                                <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                              )}
                              
                              {/* Icon */}
                              <Server size={18} className="text-orange-400 flex-shrink-0" />
                              
                              {/* Name */}
                              <div className="min-w-[200px]">
                                <h3 className="text-base font-semibold text-white truncate">
                                  {env.name}
                                </h3>
                              </div>
                              
                              {/* Status */}
                              <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                                env.status === 'Active' || env.status === 'Live'
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {env.status}
                              </span>
                              
                              {/* URL */}
                              {env.url && (
                                <div className="flex items-center gap-1 text-sm text-slate-400 min-w-[250px]">
                                  <Globe size={14} className="flex-shrink-0" />
                                  <span className="truncate">{env.url}</span>
                                </div>
                              )}
                              
                              {/* Created */}
                              <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                                <Calendar size={14} />
                                <span>{new Date(env.created).toLocaleDateString()}</span>
                              </div>
                              
                              {/* Updated */}
                              {env.lastModified && (
                                <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                                  <Clock size={14} />
                                  <span>{new Date(env.lastModified).toLocaleDateString()}</span>
                                </div>
                              )}
                              
                              {/* Hosts Count */}
                              <div className="ml-auto flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
                                <span>{env.hosts?.length || 0} {(env.hosts?.length || 0) === 1 ? 'host' : 'hosts'}</span>
                              </div>
                            </div>
                            
                            {/* Hierarchy Row */}
                            {getHierarchyPath(env) && (
                              <div className="flex items-center gap-2 ml-9 text-xs text-slate-500">
                                <Building2 size={12} className="flex-shrink-0" />
                                <span className="truncate">{getHierarchyPath(env)}</span>
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Expandable Details */}
                        <AnimatePresence>
                          {expandedEnvs.has(env.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-slate-700/50 bg-slate-800/20"
                            >
                              <div className="p-5 space-y-4">
                                {/* URL */}
                                {env.url && (
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
                                )}

                                {/* Hosts */}
                                {env.hosts && env.hosts.length > 0 && (
                                  <div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Hosts</div>
                                    <div className="space-y-3">
                                      {env.hosts.map((host, hostIdx) => (
                                        <div
                                          key={hostIdx}
                                          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                                        >
                                          <div className="grid grid-cols-3 gap-4">
                                            <div>
                                              <div className="text-xs text-slate-500 mb-1">Hostname</div>
                                              <div className="text-sm text-white font-mono">{host.hostname}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-slate-500 mb-1">Role</div>
                                              <div className="text-sm text-white">{host.role}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-slate-500 mb-1">IP Address</div>
                                              <div className="text-sm text-white font-mono">{host.ip}</div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'technology' ? (
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
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-3 hover:border-slate-600 transition-all"
                    >
                      <div className="space-y-2">
                        {/* Main Row */}
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <Cpu size={18} className="text-blue-400 flex-shrink-0" />
                          
                          {/* Name */}
                          <div className="min-w-[200px]">
                            <h3 className="text-base font-semibold text-white truncate">
                              {asset.name}
                            </h3>
                          </div>
                          
                          {/* Status */}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            asset.status === 'Active' || asset.status === 'Published'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {asset.status}
                          </span>
                          
                          {/* Product */}
                          {asset.product && (
                            <div className="flex items-center gap-1 text-sm text-slate-400 min-w-[150px]">
                              <Package size={14} className="flex-shrink-0" />
                              <span className="truncate">{asset.product}</span>
                            </div>
                          )}
                          
                          {/* Created */}
                          <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                            <Calendar size={14} />
                            <span>{new Date(asset.created).toLocaleDateString()}</span>
                          </div>
                          
                          {/* YTD Demos */}
                          {asset.conditionalFields?.ytdDemos && (
                            <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                              <TrendingUp size={14} />
                              <span>{asset.conditionalFields.ytdDemos} demos YTD</span>
                            </div>
                          )}
                          
                          {/* External Link */}
                          {(asset.status === 'Active' || asset.status === 'Published') && asset.url && (
                            <a 
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <ExternalLink size={18} />
                            </a>
                          )}
                        </div>
                        
                        {/* Hierarchy Row */}
                        {getHierarchyPath(asset) && (
                          <div className="flex items-center gap-2 ml-9 text-xs text-slate-500">
                            <Building2 size={12} className="flex-shrink-0" />
                            <span className="truncate">{getHierarchyPath(asset)}</span>
                          </div>
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
                      key={env.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 overflow-hidden"
                    >
                      {/* Environment Header */}
                      <button
                        onClick={() => toggleEnvironment(env.id)}
                        className="w-full p-3 hover:bg-slate-800/30 transition-all text-left"
                      >
                        <div className="space-y-2">
                          {/* Main Row */}
                          <div className="flex items-center gap-3">
                            {/* Chevron */}
                            {expandedEnvs.has(env.id) ? (
                              <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                            )}
                            
                            {/* Icon */}
                            <Server size={18} className="text-orange-400 flex-shrink-0" />
                            
                            {/* Name */}
                            <div className="min-w-[200px]">
                              <h3 className="text-base font-semibold text-white truncate">
                                {env.name}
                              </h3>
                            </div>
                            
                            {/* Status */}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                              env.status === 'Active' || env.status === 'Live'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {env.status}
                            </span>
                            
                            {/* URL */}
                            {env.url && (
                              <div className="flex items-center gap-1 text-sm text-slate-400 min-w-[250px]">
                                <Globe size={14} className="flex-shrink-0" />
                                <span className="truncate">{env.url}</span>
                              </div>
                            )}
                            
                            {/* Created */}
                            <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                              <Calendar size={14} />
                              <span>{new Date(env.created).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Updated */}
                            {env.lastModified && (
                              <div className="flex items-center gap-1 text-sm text-slate-400 whitespace-nowrap">
                                <Clock size={14} />
                                <span>{new Date(env.lastModified).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {/* Hosts Count */}
                            <div className="ml-auto flex items-center gap-2 text-sm text-slate-400 whitespace-nowrap">
                              <span>{env.hosts?.length || 0} {(env.hosts?.length || 0) === 1 ? 'host' : 'hosts'}</span>
                            </div>
                          </div>
                          
                          {/* Hierarchy Row */}
                          {getHierarchyPath(env) && (
                            <div className="flex items-center gap-2 ml-9 text-xs text-slate-500">
                              <Building2 size={12} className="flex-shrink-0" />
                              <span className="truncate">{getHierarchyPath(env)}</span>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Expandable Details */}
                      <AnimatePresence>
                        {expandedEnvs.has(env.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-700/50 bg-slate-800/20"
                          >
                            <div className="p-5 space-y-4">
                              {/* URL */}
                              {env.url && (
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
                              )}

                              {/* Hosts */}
                              {env.hosts && env.hosts.length > 0 && (
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
                                    ))}
                                  </div>
                                </div>
                              )}
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
