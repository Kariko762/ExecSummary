import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, X, Save, Edit3, Loader2, Plus, Trash2, DollarSign, Users, Package
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  lastLogin: string;
  status: string;
  licenseStartMonth?: string;
}

interface BUData {
  name: string;
  allocated: number;
  consumed: number;
  percentage: number;
  status: string;
}

interface VendorPerformance {
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
    businessUnits: BUData[];
  };
  detailedData?: {
    users: Record<string, User[]>;
    assets: Record<string, any[]>;
  };
}

interface Props {
  onClose: () => void;
}

export default function VendorDashboardEditor({ onClose }: Props) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [vendors, setVendors] = useState<VendorPerformance[]>([]);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState<number>(0);

  // Load existing data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/content?tag=vendor-performance');
        if (!response.ok) throw new Error('Failed to load data');
        
        const result = await response.json();
        
        if (result.success && result.content) {
          setVendors(result.content);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load vendor data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data back to API
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Save each vendor document
      for (const vendor of vendors) {
        const response = await fetch('http://localhost:3001/api/content/vendor-performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendor)
        });
        
        if (!response.ok) throw new Error(`Failed to save ${vendor.meta.vendor}`);
      }
      
      alert('Vendor dashboard data saved successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save vendor data');
    } finally {
      setIsSaving(false);
    }
  };

  // Update vendor field
  const updateVendor = (index: number, field: string, value: any) => {
    const updated = [...vendors];
    const parts = field.split('.');
    
    if (parts.length === 1) {
      updated[index] = { ...updated[index], [field]: value };
    } else if (parts.length === 2) {
      updated[index] = {
        ...updated[index],
        [parts[0]]: {
          ...updated[index][parts[0] as keyof VendorPerformance],
          [parts[1]]: value
        }
      };
    } else if (parts.length === 3) {
      const [parent, child, grandchild] = parts;
      updated[index] = {
        ...updated[index],
        [parent]: {
          ...(updated[index][parent as keyof VendorPerformance] as any),
          [child]: {
            ...((updated[index][parent as keyof VendorPerformance] as any)?.[child] || {}),
            [grandchild]: value
          }
        }
      };
    }
    
    setVendors(updated);
  };

  // Add new BU to vendor
  const addBUToVendor = (vendorIndex: number) => {
    const updated = [...vendors];
    if (!updated[vendorIndex].licenseConsumption) {
      updated[vendorIndex].licenseConsumption = {
        totalAllocated: 0,
        totalConsumed: 0,
        utilizationRate: 0,
        businessUnits: []
      };
    }
    
    updated[vendorIndex].licenseConsumption!.businessUnits.push({
      name: 'New BU',
      allocated: 0,
      consumed: 0,
      percentage: 0,
      status: 'Under Utilized'
    });
    
    setVendors(updated);
  };

  // Remove BU from vendor
  const removeBUFromVendor = (vendorIndex: number, buIndex: number) => {
    const updated = [...vendors];
    updated[vendorIndex].licenseConsumption!.businessUnits.splice(buIndex, 1);
    setVendors(updated);
  };

  // Update BU in vendor
  const updateBUInVendor = (vendorIndex: number, buIndex: number, field: string, value: any) => {
    const updated = [...vendors];
    updated[vendorIndex].licenseConsumption!.businessUnits[buIndex] = {
      ...updated[vendorIndex].licenseConsumption!.businessUnits[buIndex],
      [field]: value
    };
    setVendors(updated);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Vendor Dashboard Editor...</p>
        </div>
      </div>
    );
  }

  const selectedVendor = vendors[selectedVendorIndex];

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShoppingBag className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-roobert-bold text-white">Vendor Dashboard Editor</h2>
          <div className="text-sm text-slate-400">
            {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Edit/Save Toggle */}
          <button
            onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              isEditMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditMode ? (
              <Save className="w-5 h-5" />
            ) : (
              <Edit3 className="w-5 h-5" />
            )}
            {isSaving ? 'Saving...' : isEditMode ? 'Save All Vendors' : 'Edit'}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Vendor List */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-roobert-medium text-slate-400 uppercase tracking-wide mb-3">Vendors</h3>
            <div className="space-y-2">
              {vendors.map((vendor, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVendorIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedVendorIndex === idx
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-medium">{vendor.meta.vendor}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {vendor.meta.quarter} {vendor.meta.year}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right: Editor & Preview */}
        <div className="flex-1 overflow-y-auto">
          {selectedVendor && (
            <div className="p-8">
              {/* Vendor Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-roobert-bold text-white mb-2">{selectedVendor.meta.vendor}</h2>
                <p className="text-slate-400">{selectedVendor.meta.quarter} {selectedVendor.meta.year}</p>
              </div>

              {/* Edit Mode: Forms */}
              {isEditMode ? (
                <div className="space-y-8">
                  {/* Contracting Spend */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-6">
                      <DollarSign size={20} className="text-green-400" />
                      <h3 className="text-lg font-roobert-semibold text-white">Contracting Spend</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Current Spend</label>
                        <input
                          type="text"
                          value={selectedVendor.contractingSpend?.currentSpend || ''}
                          onChange={(e) => updateVendor(selectedVendorIndex, 'contractingSpend.currentSpend', e.target.value)}
                          placeholder="e.g., $245K"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Annual Commitment</label>
                        <input
                          type="text"
                          value={selectedVendor.contractingSpend?.annualCommitment || ''}
                          onChange={(e) => updateVendor(selectedVendorIndex, 'contractingSpend.annualCommitment', e.target.value)}
                          placeholder="e.g., $500K"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* License Consumption */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-6">
                      <Users size={20} className="text-blue-400" />
                      <h3 className="text-lg font-roobert-semibold text-white">License Consumption</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Total Allocated</label>
                        <input
                          type="number"
                          value={selectedVendor.licenseConsumption?.totalAllocated || 0}
                          onChange={(e) => updateVendor(selectedVendorIndex, 'licenseConsumption.totalAllocated', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Total Consumed</label>
                        <input
                          type="number"
                          value={selectedVendor.licenseConsumption?.totalConsumed || 0}
                          onChange={(e) => updateVendor(selectedVendorIndex, 'licenseConsumption.totalConsumed', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Utilization Rate (%)</label>
                        <input
                          type="number"
                          value={selectedVendor.licenseConsumption?.utilizationRate || 0}
                          onChange={(e) => updateVendor(selectedVendorIndex, 'licenseConsumption.utilizationRate', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Business Units */}
                    <div className="border-t border-slate-600 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-roobert-medium text-white uppercase tracking-wide">Business Units</h4>
                        <button
                          onClick={() => addBUToVendor(selectedVendorIndex)}
                          className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add BU
                        </button>
                      </div>

                      <div className="space-y-3">
                        {selectedVendor.licenseConsumption?.businessUnits.map((bu, buIdx) => (
                          <div key={buIdx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                            <div className="grid grid-cols-5 gap-3 mb-2">
                              <div className="col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">BU Name</label>
                                <input
                                  type="text"
                                  value={bu.name}
                                  onChange={(e) => updateBUInVendor(selectedVendorIndex, buIdx, 'name', e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Allocated</label>
                                <input
                                  type="number"
                                  value={bu.allocated}
                                  onChange={(e) => updateBUInVendor(selectedVendorIndex, buIdx, 'allocated', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Consumed</label>
                                <input
                                  type="number"
                                  value={bu.consumed}
                                  onChange={(e) => updateBUInVendor(selectedVendorIndex, buIdx, 'consumed', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">%</label>
                                <input
                                  type="number"
                                  value={bu.percentage}
                                  onChange={(e) => updateBUInVendor(selectedVendorIndex, buIdx, 'percentage', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <select
                                value={bu.status}
                                onChange={(e) => updateBUInVendor(selectedVendorIndex, buIdx, 'status', e.target.value)}
                                className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="Under Utilized">Under Utilized</option>
                                <option value="Good">Good</option>
                                <option value="At Capacity">At Capacity</option>
                                <option value="Over Capacity">Over Capacity</option>
                              </select>
                              <button
                                onClick={() => removeBUFromVendor(selectedVendorIndex, buIdx)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                title="Remove BU"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* View Mode: Preview */
                <div className="space-y-6">
                  {/* Spend Card */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign size={20} className="text-green-400" />
                      <h3 className="text-lg font-roobert-semibold text-white">Contracting Spend</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Current Spend</p>
                        <p className="text-2xl font-bold text-white">{selectedVendor.contractingSpend?.currentSpend || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Annual Commitment</p>
                        <p className="text-2xl font-bold text-white">{selectedVendor.contractingSpend?.annualCommitment || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* License Card */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <Users size={20} className="text-blue-400" />
                      <h3 className="text-lg font-roobert-semibold text-white">License Consumption</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400 mb-1">Allocated</p>
                        <p className="text-2xl font-bold text-white">{selectedVendor.licenseConsumption?.totalAllocated || 0}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400 mb-1">Consumed</p>
                        <p className="text-2xl font-bold text-blue-400">{selectedVendor.licenseConsumption?.totalConsumed || 0}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400 mb-1">Utilization</p>
                        <p className="text-2xl font-bold text-purple-400">{selectedVendor.licenseConsumption?.utilizationRate || 0}%</p>
                      </div>
                    </div>

                    {/* BU List */}
                    <div className="space-y-2">
                      {selectedVendor.licenseConsumption?.businessUnits.map((bu, idx) => (
                        <div key={idx} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{bu.name}</p>
                            <p className="text-sm text-slate-400">{bu.consumed} / {bu.allocated} licenses ({bu.percentage}%)</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bu.status === 'Good' ? 'bg-green-500/20 text-green-400' :
                            bu.status === 'Under Utilized' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {bu.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
