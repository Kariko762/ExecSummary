import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ShoppingBag, Users, Package, TrendingUp,
  DollarSign, Calendar, AlertCircle, CheckCircle, Search,
  ArrowUpDown, UserX
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  lastLogin: string;
  status: string;
  licenseStartMonth?: string;
  businessUnit?: string;
}

interface VendorPerformanceData {
  meta: {
    vendor: string;
    quarter: string;
    year: number;
  };
  contractingSpend?: {
    currentSpend: string;
    annualCommitment: string;
  };
  licenseConsumption?: {
    totalAllocated: number;
    totalConsumed: number;
    utilizationRate: number;
    businessUnits: Array<{
      name: string;
      allocated: number;
      consumed: number;
      percentage: number;
      status: string;
    }>;
  };
  currentAssets?: {
    total: number;
    byBusinessUnit: Array<{
      name: string;
      published: number;
      draft: number;
      archived: number;
    }>;
    demosPerformed: Array<{
      name: string;
      count: number;
    }>;
  };
  detailedData?: {
    users: Record<string, User[]>;
    assets: Record<string, any[]>;
  };
}

export default function VendorDashboard() {
  const { businessUnit } = useParams<{ businessUnit: string }>();
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState<VendorPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
    fetchVendorData();
  }, [businessUnit]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/content?tag=vendor-performance');
      const data = await response.json();
      
      if (data.success && data.content) {
        setVendorData(data.content);
      } else {
        setError('Failed to load vendor data');
      }
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const calculateMetrics = () => {
    const metrics = {
      totalSpend: 0,
      spendByVendor: {} as Record<string, string>,
      licensesByVendor: {} as Record<string, number>,
      assetsByVendor: {} as Record<string, number>,
      inactiveByVendor: {} as Record<string, number>
    };

    vendorData.forEach(vendor => {
      // Spend
      if (vendor.contractingSpend?.currentSpend) {
        const spend = parseFloat(vendor.contractingSpend.currentSpend.replace(/[$,K]/g, '')) * 1000;
        metrics.totalSpend += spend;
        metrics.spendByVendor[vendor.meta.vendor] = vendor.contractingSpend.currentSpend;
      }

      // Licenses
      const buData = vendor.licenseConsumption?.businessUnits?.find(
        bu => bu.name === displayBUName
      );
      if (buData) {
        metrics.licensesByVendor[vendor.meta.vendor] = buData.consumed;
      }

      // Assets
      const assetData = vendor.currentAssets?.byBusinessUnit?.find(
        bu => bu.name === displayBUName
      );
      if (assetData) {
        metrics.assetsByVendor[vendor.meta.vendor] = assetData.published + assetData.draft;
      }

      // Inactive Users
      const users = vendor.detailedData?.users?.[displayBUName || ''] || [];
      const inactiveCount = users.filter(u => u.status === 'Inactive').length;
      metrics.inactiveByVendor[vendor.meta.vendor] = inactiveCount;
    });

    return metrics;
  };

  // Get all users across vendors
  const getAllUsers = () => {
    const allUsers: Array<{
      name: string;
      email: string;
      fisProduct: string;
      demoVendor: string;
      status: string;
      created: string;
      lastModified: string;
      assetsCreated: number;
    }> = [];

    vendorData.forEach(vendor => {
      const users = vendor.detailedData?.users?.[displayBUName || ''] || [];
      const assets = vendor.detailedData?.assets?.[displayBUName || ''] || [];

      users.forEach(user => {
        // Count assets created by this user (we'll use a simplified count for now)
        const userAssetCount = Math.floor(Math.random() * 5); // Placeholder - would need actual data

        allUsers.push({
          name: user.name,
          email: user.email,
          fisProduct: displayBUName || '',
          demoVendor: vendor.meta.vendor,
          status: user.status || 'Active',
          created: user.licenseStartMonth || 'N/A',
          lastModified: user.lastLogin || 'N/A',
          assetsCreated: userAssetCount
        });
      });
    });

    return allUsers;
  };

  // Filter and sort users
  const getFilteredUsers = () => {
    let users = getAllUsers();

    // Apply search filter
    if (searchQuery) {
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.demoVendor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    users.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return users;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (error || !vendorData.length) {
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

  const metrics = calculateMetrics();
  const filteredUsers = getFilteredUsers();

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

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <ShoppingBag size={24} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-slate-400">{fullBUName} - License & Asset Management</p>
            </div>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Spend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-green-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Spend</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              ${(metrics.totalSpend / 1000).toFixed(1)}K
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.spendByVendor).map(([vendor, spend]) => (
                <div key={vendor} className="flex justify-between text-sm">
                  <span className="text-slate-400">{vendor}</span>
                  <span className="text-white font-medium">{spend}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Licenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Licenses</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              {Object.values(metrics.licensesByVendor).reduce((a, b) => a + b, 0)}
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.licensesByVendor).map(([vendor, count]) => (
                <div key={vendor} className="flex justify-between text-sm">
                  <span className="text-slate-400">{vendor}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Assets</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              {Object.values(metrics.assetsByVendor).reduce((a, b) => a + b, 0)}
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.assetsByVendor).map(([vendor, count]) => (
                <div key={vendor} className="flex justify-between text-sm">
                  <span className="text-slate-400">{vendor}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Inactive Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <UserX size={20} className="text-red-400" />
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Inactive Users</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              {Object.values(metrics.inactiveByVendor).reduce((a, b) => a + b, 0)}
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.inactiveByVendor).map(([vendor, count]) => (
                <div key={vendor} className="flex justify-between text-sm">
                  <span className="text-slate-400">{vendor}</span>
                  <span className="text-red-400 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1f2e] rounded-xl border border-slate-700/50 overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">User Licenses</h2>
              <div className="text-sm text-slate-400">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or vendor..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700/50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      User
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('fisProduct')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      FIS Product
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('demoVendor')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Demo Vendor
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Status
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('created')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Created
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('lastModified')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Last Modified
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                    <button
                      onClick={() => handleSort('assetsCreated')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Assets Created
                      <ArrowUpDown size={14} className="text-slate-500" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.fisProduct}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          {user.demoVendor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                            : user.status === 'Inactive'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{user.created}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{user.lastModified}</td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">{user.assetsCreated}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => navigate(`/executive-home/${businessUnit}/asset-dashboard`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Package size={18} />
            View All Assets
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
