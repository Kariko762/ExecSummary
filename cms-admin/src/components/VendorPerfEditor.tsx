import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface VendorPerfEditorProps {
  performanceId?: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function VendorPerfEditor({ performanceId, onClose, onSave }: VendorPerfEditorProps) {
  const [formData, setFormData] = useState({
    meta: {
      id: '',
      title: '',
      vendor: '',
      quarter: 'Q1',
      year: 2026,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    _contentTag: 'vendor-performance',
    _published: false,
    revenueSupported: {
      total: '',
      breakdown: []
    },
    contractingSpend: {
      currentSpend: '',
      annualCommitment: '',
      contracts: [],
      upcomingRenewals: []
    },
    licenseConsumption: {
      totalAllocated: 0,
      totalConsumed: 0,
      utilizationRate: 0,
      businessUnits: []
    },
    currentAssets: {
      total: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      breakdown: []
    }
  });

  useEffect(() => {
    if (performanceId) {
      // Load existing performance data
      fetch(`http://localhost:3001/api/content/${performanceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.content) {
            setFormData(data.content);
          }
        })
        .catch(console.error);
    }
  }, [performanceId]);

  const handleSave = () => {
    onSave(formData);
  };

  const addRevenueBreakdown = () => {
    setFormData({
      ...formData,
      revenueSupported: {
        ...formData.revenueSupported,
        breakdown: [
          ...formData.revenueSupported.breakdown,
          { category: '', value: '', percentage: 0 }
        ]
      }
    });
  };

  const addBusinessUnit = () => {
    setFormData({
      ...formData,
      licenseConsumption: {
        ...formData.licenseConsumption,
        businessUnits: [
          ...formData.licenseConsumption.businessUnits,
          { name: '', allocated: 0, consumed: 0, percentage: 0, status: 'healthy' }
        ]
      }
    });
  };

  const addAsset = () => {
    setFormData({
      ...formData,
      currentAssets: {
        ...formData.currentAssets,
        breakdown: [
          ...formData.currentAssets.breakdown,
          { type: '', count: 0, description: '' }
        ]
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/40">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-slate-800/50">
          <h2 className="text-2xl font-roobert-heavy text-white">
            {performanceId ? 'Edit' : 'New'} Vendor Performance
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-[#4bcd3e] hover:bg-[#3db830] text-white rounded-lg font-roobert-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900">
          
          {/* Meta Information */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-roobert-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                  Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.meta.vendor}
                  onChange={(e) => setFormData({
                    ...formData,
                    meta: { ...formData.meta, vendor: e.target.value, title: `${e.target.value} Performance Metrics` }
                  })}
                  className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="e.g., Coast"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Quarter
                  </label>
                  <select
                    value={formData.meta.quarter}
                    onChange={(e) => setFormData({
                      ...formData,
                      meta: { ...formData.meta, quarter: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.meta.year}
                    onChange={(e) => setFormData({
                      ...formData,
                      meta: { ...formData.meta, year: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData._published}
                  onChange={(e) => setFormData({ ...formData, _published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-white/20"
                />
                <span className="text-sm font-roobert-medium text-slate-300">
                  Publish to Frontend
                </span>
              </label>
            </div>
            </div>
          </div>

          {/* Revenue Supported */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roobert-semibold text-white">Revenue Supported</h3>
              <button
                onClick={addRevenueBreakdown}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-roobert-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Breakdown
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                Total Revenue
              </label>
              <input
                type="text"
                value={formData.revenueSupported.total}
                onChange={(e) => setFormData({
                  ...formData,
                  revenueSupported: { ...formData.revenueSupported, total: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                placeholder="e.g., $18.7M"
              />
            </div>

            {formData.revenueSupported.breakdown.map((item: any, idx: number) => (
              <div key={idx} className="grid grid-cols-3 gap-3 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                <input
                  type="text"
                  value={item.category}
                  onChange={(e) => {
                    const updated = [...formData.revenueSupported.breakdown];
                    updated[idx] = { ...updated[idx], category: e.target.value };
                    setFormData({
                      ...formData,
                      revenueSupported: { ...formData.revenueSupported, breakdown: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Category"
                />
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => {
                    const updated = [...formData.revenueSupported.breakdown];
                    updated[idx] = { ...updated[idx], value: e.target.value };
                    setFormData({
                      ...formData,
                      revenueSupported: { ...formData.revenueSupported, breakdown: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Value"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.percentage}
                    onChange={(e) => {
                      const updated = [...formData.revenueSupported.breakdown];
                      updated[idx] = { ...updated[idx], percentage: parseInt(e.target.value) };
                      setFormData({
                        ...formData,
                        revenueSupported: { ...formData.revenueSupported, breakdown: updated }
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                    placeholder="%"
                  />
                  <button
                    onClick={() => {
                      const updated = formData.revenueSupported.breakdown.filter((_: any, i: number) => i !== idx);
                      setFormData({
                        ...formData,
                        revenueSupported: { ...formData.revenueSupported, breakdown: updated }
                      });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* Contracting & Spend */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-roobert-semibold text-white mb-4">Contracting & Spend</h3>
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                  Current Spend
                </label>
                <input
                  type="text"
                  value={formData.contractingSpend.currentSpend}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractingSpend: { ...formData.contractingSpend, currentSpend: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="e.g., $150K/year"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                  Annual Commitment
                </label>
                <input
                  type="text"
                  value={formData.contractingSpend.annualCommitment}
                  onChange={(e) => setFormData({
                    ...formData,
                    contractingSpend: { ...formData.contractingSpend, annualCommitment: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="e.g., $150,000"
                />
              </div>
            </div>
            </div>
          </div>

          {/* License Consumption */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roobert-semibold text-white">License Consumption</h3>
              <button
                onClick={addBusinessUnit}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-roobert-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Business Unit
              </button>
            </div>

            {formData.licenseConsumption.businessUnits.map((bu: any, idx: number) => (
              <div key={idx} className="grid grid-cols-5 gap-3 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                <input
                  type="text"
                  value={bu.name}
                  onChange={(e) => {
                    const updated = [...formData.licenseConsumption.businessUnits];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setFormData({
                      ...formData,
                      licenseConsumption: { ...formData.licenseConsumption, businessUnits: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Business Unit"
                />
                <input
                  type="number"
                  value={bu.allocated}
                  onChange={(e) => {
                    const updated = [...formData.licenseConsumption.businessUnits];
                    updated[idx] = { ...updated[idx], allocated: parseInt(e.target.value) };
                    setFormData({
                      ...formData,
                      licenseConsumption: { ...formData.licenseConsumption, businessUnits: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Allocated"
                />
                <input
                  type="number"
                  value={bu.consumed}
                  onChange={(e) => {
                    const updated = [...formData.licenseConsumption.businessUnits];
                    const consumed = parseInt(e.target.value);
                    const percentage = updated[idx].allocated > 0 ? Math.round((consumed / updated[idx].allocated) * 100) : 0;
                    updated[idx] = { ...updated[idx], consumed, percentage };
                    setFormData({
                      ...formData,
                      licenseConsumption: { ...formData.licenseConsumption, businessUnits: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Consumed"
                />
                <input
                  type="number"
                  value={bu.percentage}
                  disabled
                  className="px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-gray-100 dark:bg-slate-700 text-white"
                  placeholder="%"
                />
                <button
                  onClick={() => {
                    const updated = formData.licenseConsumption.businessUnits.filter((_: any, i: number) => i !== idx);
                    setFormData({
                      ...formData,
                      licenseConsumption: { ...formData.licenseConsumption, businessUnits: updated }
                    });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            </div>
          </div>

          {/* Current Assets */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-6 backdrop-blur-sm">
            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roobert-semibold text-white">Current Assets</h3>
              <button
                onClick={addAsset}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-roobert-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Asset Type
              </button>
            </div>

            {formData.currentAssets.breakdown.map((asset: any, idx: number) => (
              <div key={idx} className="grid grid-cols-4 gap-3 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                <input
                  type="text"
                  value={asset.type}
                  onChange={(e) => {
                    const updated = [...formData.currentAssets.breakdown];
                    updated[idx] = { ...updated[idx], type: e.target.value };
                    setFormData({
                      ...formData,
                      currentAssets: { ...formData.currentAssets, breakdown: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Asset Type"
                />
                <input
                  type="number"
                  value={asset.count}
                  onChange={(e) => {
                    const updated = [...formData.currentAssets.breakdown];
                    updated[idx] = { ...updated[idx], count: parseInt(e.target.value) };
                    setFormData({
                      ...formData,
                      currentAssets: { ...formData.currentAssets, breakdown: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Count"
                />
                <input
                  type="text"
                  value={asset.description}
                  onChange={(e) => {
                    const updated = [...formData.currentAssets.breakdown];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    setFormData({
                      ...formData,
                      currentAssets: { ...formData.currentAssets, breakdown: updated }
                    });
                  }}
                  className="px-3 py-2 border border-slate-700/40 rounded-lg bg-slate-800/50 text-white placeholder-slate-400"
                  placeholder="Description"
                />
                <button
                  onClick={() => {
                    const updated = formData.currentAssets.breakdown.filter((_: any, i: number) => i !== idx);
                    setFormData({
                      ...formData,
                      currentAssets: { ...formData.currentAssets, breakdown: updated }
                    });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


