import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Building2, User, Package, TrendingUp, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface VendorPerformanceEditorV2Props {
  data: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function VendorPerformanceEditorV2({ data, onClose, onSave }: VendorPerformanceEditorV2Props) {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      meta: { vendor: '', quarter: 'Q1', year: 2026 },
      revenueSupported: { total: '$0M' },
      contractingSpend: { currentSpend: '$0K' },
      licenseUnitCost: 0,
      licenseTermModel: 'Monthly',
      licenseConsumption: {
        totalAllocated: 0,
        totalConsumed: 0,
        utilizationRate: 0,
        businessUnits: []
      },
      currentAssets: {
        total: 0,
        byBusinessUnit: [],
        demosPerformed: []
      },
      detailedData: {
        users: {},
        assets: {},
        deals: {}
      }
    };

    // Merge incoming data with defaults to ensure detailedData exists
    if (data) {
      return {
        ...defaultData,
        ...data,
        detailedData: {
          users: data.detailedData?.users || {},
          assets: data.detailedData?.assets || {},
          deals: data.detailedData?.deals || {}
        }
      };
    }

    return defaultData;
  });

  const [selectedBU, setSelectedBU] = useState<string>('Capital Markets');
  const BUSINESS_UNITS = ['Capital Markets', 'Banking NA', 'Banking International', 'Payments', 'FIS General'];

  const handleSave = () => {
    onSave(formData);
  };

  // Update meta fields
  const updateMeta = (field: string, value: any) => {
    setFormData({
      ...formData,
      meta: { ...formData.meta, [field]: value }
    });
  };

  // Update revenue
  const updateRevenue = (value: string) => {
    setFormData({
      ...formData,
      revenueSupported: { ...formData.revenueSupported, total: value }
    });
  };

  // Update spend
  const updateSpend = (value: string) => {
    setFormData({
      ...formData,
      contractingSpend: { ...formData.contractingSpend, currentSpend: value }
    });
  };

  // Update license unit cost
  const updateLicenseUnitCost = (value: number) => {
    setFormData({
      ...formData,
      licenseUnitCost: value
    });
  };

  // Update license term model
  const updateLicenseTermModel = (value: string) => {
    setFormData({
      ...formData,
      licenseTermModel: value
    });
  };

  // Calculate months active in current year (2026) - includes start month
  const calculateMonthsActive = (licenseStartMonth: string, status: string): number => {
    if (status === 'Inactive' || !licenseStartMonth) return 0;
    
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

  // Calculate individual user cost for the year
  const calculateUserCost = (licenseStartMonth: string, status: string): number => {
    if (status === 'Inactive') return 0;
    
    const monthlyCost = formData.licenseUnitCost || 0;
    const termModel = formData.licenseTermModel || 'Monthly';
    
    if (termModel === 'Yearly') {
      // Yearly: full year cost if active at any point
      return monthlyCost * 12;
    } else {
      // Monthly: cost based on months active in current year
      const monthsActive = calculateMonthsActive(licenseStartMonth, status);
      return monthlyCost * monthsActive;
    }
  };

  // Calculate total users across all BUs
  const totalUsers = Object.values(formData.detailedData?.users || {}).reduce(
    (sum, users: any) => sum + (users?.length || 0), 0
  );

  // Calculate total assets across all BUs
  const totalAssets = Object.values(formData.detailedData?.assets || {}).reduce(
    (sum, assets: any) => sum + (assets?.length || 0), 0
  );

  // Calculate total spend by summing individual user costs (in dollars)
  const calculatedSpendDollars = Object.entries(formData.detailedData?.users || {}).reduce(
    (total, [bu, users]: [string, any]) => {
      const buTotal = (users || []).reduce((sum: number, user: any) => 
        sum + calculateUserCost(user.licenseStartMonth, user.status || 'Active'), 0
      );
      return total + buTotal;
    }, 0
  );

  // Smart formatter for spend display
  const formatSpend = (dollars: number): string => {
    if (dollars >= 1000) {
      return `$${(dollars / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(dollars)}`;
  };

  // Add user to BU
  const addUser = (bu: string) => {
    const users = formData.detailedData.users[bu] || [];
    const newUser = { 
      name: '', 
      email: '', 
      lastLogin: 'Today',
      status: 'Active',
      licenseStartMonth: new Date().toISOString().slice(0, 7), // Format: "2026-02"
      ...(bu === 'FIS General' ? { businessUnit: '' } : {})
    };
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        users: {
          ...formData.detailedData.users,
          [bu]: [...users, newUser]
        }
      }
    });
  };

  // Update user
  const updateUser = (bu: string, idx: number, field: string, value: string) => {
    const users = [...(formData.detailedData.users[bu] || [])];
    users[idx] = { ...users[idx], [field]: value };
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        users: { ...formData.detailedData.users, [bu]: users }
      }
    });
  };

  // Delete user
  const deleteUser = (bu: string, idx: number) => {
    const users = [...(formData.detailedData.users[bu] || [])];
    users.splice(idx, 1);
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        users: { ...formData.detailedData.users, [bu]: users }
      }
    });
  };

  // Add asset to BU
  const addAsset = (bu: string) => {
    const assets = formData.detailedData.assets[bu] || [];
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        assets: {
          ...formData.detailedData.assets,
          [bu]: [...assets, { name: '', created: '', ytdDemos: 0, status: 'Draft' }]
        }
      }
    });
  };

  // Update asset
  const updateAsset = (bu: string, idx: number, field: string, value: any) => {
    const assets = [...(formData.detailedData.assets[bu] || [])];
    assets[idx] = { ...assets[idx], [field]: value };
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        assets: { ...formData.detailedData.assets, [bu]: assets }
      }
    });
  };

  // Delete asset
  const deleteAsset = (bu: string, idx: number) => {
    const assets = [...(formData.detailedData.assets[bu] || [])];
    assets.splice(idx, 1);
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        assets: { ...formData.detailedData.assets, [bu]: assets }
      }
    });
  };

  // Add deal to BU
  const addDeal = (bu: string) => {
    const deals = formData.detailedData.deals[bu] || [];
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        deals: {
          ...formData.detailedData.deals,
          [bu]: [...deals, { oid: '', client: '', product: '', value: '', stage: 'Proposal' }]
        }
      }
    });
  };

  // Update deal
  const updateDeal = (bu: string, idx: number, field: string, value: string) => {
    const deals = [...(formData.detailedData.deals[bu] || [])];
    deals[idx] = { ...deals[idx], [field]: value };
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        deals: { ...formData.detailedData.deals, [bu]: deals }
      }
    });
  };

  // Delete deal
  const deleteDeal = (bu: string, idx: number) => {
    const deals = [...(formData.detailedData.deals[bu] || [])];
    deals.splice(idx, 1);
    setFormData({
      ...formData,
      detailedData: {
        ...formData.detailedData,
        deals: { ...formData.detailedData.deals, [bu]: deals }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-slate-900/50">
          <div>
            <h2 className="text-3xl font-roobert-heavy text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#4bcd3e]" />
              Edit Vendor Performance Data
            </h2>
            <p className="text-sm text-white/50 font-roobert-light mt-1">
              Manage users, assets, and deals for each business unit
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-[#4bcd3e] hover:bg-[#3dad2f] text-white rounded-xl font-roobert-semibold flex items-center gap-2 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Meta Information */}
          <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-roobert-bold text-white mb-4">Meta Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2">Vendor</label>
                <input
                  type="text"
                  value={formData.meta?.vendor || ''}
                  onChange={(e) => updateMeta('vendor', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                  placeholder="e.g., Coast"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2">Quarter</label>
                <select
                  value={formData.meta?.quarter || 'Q1'}
                  onChange={(e) => updateMeta('quarter', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                >
                  <option value="Q1" className="bg-slate-800 text-white">Q1</option>
                  <option value="Q2" className="bg-slate-800 text-white">Q2</option>
                  <option value="Q3" className="bg-slate-800 text-white">Q3</option>
                  <option value="Q4" className="bg-slate-800 text-white">Q4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2">Year</label>
                <input
                  type="number"
                  value={formData.meta?.year || 2026}
                  onChange={(e) => updateMeta('year', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                />
              </div>
            </div>
          </div>

          {/* High-Level Metrics */}
          <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-roobert-bold text-white mb-4">High-Level Metrics</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Revenue
                </label>
                <input
                  type="text"
                  value={formData.revenueSupported?.total || ''}
                  onChange={(e) => updateRevenue(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                  placeholder="e.g., $18.7M"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  License Cost Per Month ($/user)
                </label>
                <input
                  type="number"
                  value={formData.licenseUnitCost || 0}
                  onChange={(e) => updateLicenseUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                  placeholder="e.g., 8 for $8/month"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  License Term Model
                </label>
                <select
                  value={formData.licenseTermModel || 'Monthly'}
                  onChange={(e) => updateLicenseTermModel(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                >
                  <option value="Monthly" className="bg-slate-800 text-white">Monthly</option>
                  <option value="Yearly" className="bg-slate-800 text-white">Yearly</option>
                </select>
                <p className="text-xs text-white/40 mt-1">
                  {formData.licenseTermModel === 'Yearly' 
                    ? 'Full year cost if active anytime' 
                    : 'Cost per active month in 2026'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-roobert-semibold text-white/70 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Current Spend (optional override)
                </label>
                <input
                  type="text"
                  value={formData.contractingSpend?.currentSpend || ''}
                  onChange={(e) => updateSpend(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#4bcd3e]"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
            
            {/* Calculated Metrics Display */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-xs text-purple-400 font-roobert-semibold uppercase mb-1">Total Users</div>
                <div className="text-2xl font-roobert-bold text-white">{totalUsers}</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                <div className="text-xs text-orange-400 font-roobert-semibold uppercase mb-1">Total Assets</div>
                <div className="text-2xl font-roobert-bold text-white">{totalAssets}</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-xs text-green-400 font-roobert-semibold uppercase mb-1">Calculated Spend</div>
                <div className="text-2xl font-roobert-bold text-white">{formatSpend(calculatedSpendDollars)}</div>
                <div className="text-[10px] text-white/40 mt-1">
                  {formData.licenseTermModel === 'Yearly' ? '📅 Yearly billing' : '📆 Monthly billing'}
                </div>
              </div>
            </div>
          </div>

          {/* BU Tabs */}
          <div className="bg-slate-800/30 rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-roobert-bold text-white mb-4">Business Unit Details</h3>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {BUSINESS_UNITS.map((bu) => (
                <button
                  key={bu}
                  onClick={() => setSelectedBU(bu)}
                  className={`px-4 py-2 rounded-lg font-roobert-semibold text-sm transition-all ${
                    selectedBU === bu
                      ? 'bg-[#4bcd3e] text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {bu}
                </button>
              ))}
            </div>

            {/* Users Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-roobert-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Users ({(formData.detailedData.users[selectedBU] || []).length})
                </h4>
                <button
                  onClick={() => addUser(selectedBU)}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-roobert-semibold text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
              {/* Column Headers */}
              <div className="flex items-center gap-3 px-3 pb-2 mb-2 border-b border-white/10 text-xs font-roobert-semibold text-white/50">
                <div className="flex gap-2 flex-1">
                  <div className="flex-1">Name</div>
                  <div className="flex-1">Email</div>
                  <div className="w-28">Status</div>
                  <div className="w-36">Start Month</div>
                  {selectedBU === 'FIS General' && <div className="w-36">Business Unit</div>}
                  <div className="w-28">Last Login</div>
                  <div className="w-20 text-blue-400/70 text-center" title="Months active in 2026">Months</div>
                  <div className="w-24 text-green-400/70 text-center" title="User cost for 2026">YTD Cost</div>
                </div>
                <div className="w-10"></div>
              </div>
              <div className="space-y-2">
                {(formData.detailedData.users[selectedBU] || []).map((user: any, idx: number) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 flex-1">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={user.name}
                            onChange={(e) => updateUser(selectedBU, idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                            placeholder="Name"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) => updateUser(selectedBU, idx, 'email', e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                            placeholder="Email"
                          />
                        </div>
                        <div className="w-28">
                          <select
                            value={user.status || 'Active'}
                            onChange={(e) => updateUser(selectedBU, idx, 'status', e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                          >
                            <option value="Active" className="bg-slate-800 text-white">Active</option>
                            <option value="Inactive" className="bg-slate-800 text-white">Inactive</option>
                          </select>
                        </div>
                        <div className="w-36">
                          <input
                            type="month"
                            value={user.licenseStartMonth || user.licenseStartDate?.slice(0, 7) || ''}
                            onChange={(e) => updateUser(selectedBU, idx, 'licenseStartMonth', e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                            title="License Start Month"
                          />
                        </div>
                        {selectedBU === 'FIS General' && (
                          <input
                            type="text"
                            value={user.businessUnit || ''}
                            onChange={(e) => updateUser(selectedBU, idx, 'businessUnit', e.target.value)}
                            className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                            placeholder="Business Unit"
                          />
                        )}
                        <div className="w-28">
                          <input
                            type="text"
                            value={user.lastLogin}
                            onChange={(e) => updateUser(selectedBU, idx, 'lastLogin', e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                            placeholder="Last Login"
                          />
                        </div>
                        {/* Calculated readonly columns */}
                        <div className="w-20">
                          <input
                            type="text"
                            value={calculateMonthsActive(user.licenseStartMonth || user.licenseStartDate?.slice(0, 7) || '', user.status || 'Active')}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-900/50 border border-white/5 rounded text-white/60 text-sm text-center cursor-not-allowed"
                            title="Months Active in 2026"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="text"
                            value={`$${calculateUserCost(user.licenseStartMonth || user.licenseStartDate?.slice(0, 7) || '', user.status || 'Active').toFixed(0)}`}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-900/50 border border-green-500/20 rounded text-green-400 text-sm text-center cursor-not-allowed font-roobert-semibold"
                            title="YTD Cost for this user"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteUser(selectedBU, idx)}
                        className="p-2 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assets Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-roobert-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Assets ({(formData.detailedData.assets[selectedBU] || []).length})
                </h4>
                <button
                  onClick={() => addAsset(selectedBU)}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-roobert-semibold text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Asset
                </button>
              </div>
              <div className="space-y-2">
                {(formData.detailedData.assets[selectedBU] || []).map((asset: any, idx: number) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center gap-3">
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => updateAsset(selectedBU, idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="Asset Name"
                    />
                    <input
                      type="text"
                      value={asset.created}
                      onChange={(e) => updateAsset(selectedBU, idx, 'created', e.target.value)}
                      className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="Created"
                    />
                    <input
                      type="number"
                      value={asset.ytdDemos}
                      onChange={(e) => updateAsset(selectedBU, idx, 'ytdDemos', parseInt(e.target.value))}
                      className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="YTD"
                    />
                    <select
                      value={asset.status}
                      onChange={(e) => updateAsset(selectedBU, idx, 'status', e.target.value)}
                      className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                    >
                      <option value="Published" className="bg-slate-800 text-white">Published</option>
                      <option value="Draft" className="bg-slate-800 text-white">Draft</option>
                    </select>
                    <button
                      onClick={() => deleteAsset(selectedBU, idx)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-roobert-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Deals ({(formData.detailedData.deals[selectedBU] || []).length})
                </h4>
                <button
                  onClick={() => addDeal(selectedBU)}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-roobert-semibold text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Deal
                </button>
              </div>
              <div className="space-y-2">
                {(formData.detailedData.deals[selectedBU] || []).map((deal: any, idx: number) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 flex items-center gap-3">
                    <input
                      type="text"
                      value={deal.oid}
                      onChange={(e) => updateDeal(selectedBU, idx, 'oid', e.target.value)}
                      className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="OID"
                    />
                    <input
                      type="text"
                      value={deal.client}
                      onChange={(e) => updateDeal(selectedBU, idx, 'client', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="Client"
                    />
                    <input
                      type="text"
                      value={deal.product}
                      onChange={(e) => updateDeal(selectedBU, idx, 'product', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="Product"
                    />
                    <input
                      type="text"
                      value={deal.value}
                      onChange={(e) => updateDeal(selectedBU, idx, 'value', e.target.value)}
                      className="w-28 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                      placeholder="Value"
                    />
                    <select
                      value={deal.stage}
                      onChange={(e) => updateDeal(selectedBU, idx, 'stage', e.target.value)}
                      className="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#4bcd3e]"
                    >
                      <option value="Closed-Won" className="bg-slate-800 text-white">Closed-Won</option>
                      <option value="Proposal" className="bg-slate-800 text-white">Proposal</option>
                      <option value="Negotiation" className="bg-slate-800 text-white">Negotiation</option>
                    </select>
                    <button
                      onClick={() => deleteDeal(selectedBU, idx)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
