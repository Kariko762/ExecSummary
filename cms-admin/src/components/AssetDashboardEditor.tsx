import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package, X, Save, Edit3, Loader2, Plus, Trash2, Server, Cpu
} from 'lucide-react';

interface Host {
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
  hosts: Host[];
}

interface AssetsByBU {
  [businessUnit: string]: InfrastructureAsset[];
}

interface Props {
  onClose: () => void;
}

export default function AssetDashboardEditor({ onClose }: Props) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [assetsByBU, setAssetsByBU] = useState<AssetsByBU>({});
  const [selectedBU, setSelectedBU] = useState<string>('');
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number>(0);

  // Load existing data (mock for now - would need real API endpoint)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // For now, load from extended attributes API to get BU list
        const response = await fetch('http://localhost:3001/api/weekly-bu-summary');
        if (!response.ok) throw new Error('Failed to load data');
        
        const result = await response.json();
        
        if (result.success) {
          // Initialize with mock infrastructure data for each BU
          const mockData: AssetsByBU = {};
          
          Object.keys(result.businessUnits || {}).forEach(buId => {
            mockData[buId] = [
              {
                name: 'Demo Environment 1',
                url: `https://demo-${buId}.fis.com`,
                status: 'Live',
                created: '2025-11',
                lastModified: '2026-02-20',
                hosts: [
                  { hostname: `${buId}-web01.fis.com`, role: 'Web Host', ip: '192.168.1.10' },
                  { hostname: `${buId}-db01.fis.com`, role: 'Database', ip: '192.168.1.11' }
                ]
              }
            ];
          });
          
          setAssetsByBU(mockData);
          setSelectedBU(Object.keys(mockData)[0] || '');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load asset data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data back to API (would need dedicated endpoint)
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // This would need a dedicated API endpoint for infrastructure assets
      console.log('Saving asset data:', assetsByBU);
      
      // Placeholder - would POST to /api/infrastructure-assets
      alert('Asset dashboard data saved successfully!\n(Note: This requires a dedicated API endpoint)');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save asset data');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new asset to BU
  const addAssetToBU = () => {
    if (!selectedBU) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU].push({
      name: 'New Environment',
      url: 'https://new-env.fis.com',
      status: 'Draft',
      created: new Date().toISOString().split('T')[0],
      hosts: []
    });
    
    setAssetsByBU(updated);
    setSelectedAssetIndex(updated[selectedBU].length - 1);
  };

  // Remove asset from BU
  const removeAssetFromBU = (index: number) => {
    if (!selectedBU || !confirm('Are you sure you want to remove this asset?')) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU].splice(index, 1);
    setAssetsByBU(updated);
    
    if (selectedAssetIndex >= updated[selectedBU].length) {
      setSelectedAssetIndex(Math.max(0, updated[selectedBU].length - 1));
    }
  };

  // Update asset
  const updateAsset = (field: string, value: any) => {
    if (!selectedBU) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU][selectedAssetIndex] = {
      ...updated[selectedBU][selectedAssetIndex],
      [field]: value
    };
    setAssetsByBU(updated);
  };

  // Add host to asset
  const addHostToAsset = () => {
    if (!selectedBU) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU][selectedAssetIndex].hosts.push({
      hostname: 'new-host.fis.com',
      role: 'Web Host',
      ip: '192.168.1.1'
    });
    setAssetsByBU(updated);
  };

  // Remove host from asset
  const removeHostFromAsset = (hostIndex: number) => {
    if (!selectedBU) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU][selectedAssetIndex].hosts.splice(hostIndex, 1);
    setAssetsByBU(updated);
  };

  // Update host
  const updateHost = (hostIndex: number, field: string, value: string) => {
    if (!selectedBU) return;
    
    const updated = { ...assetsByBU };
    updated[selectedBU][selectedAssetIndex].hosts[hostIndex] = {
      ...updated[selectedBU][selectedAssetIndex].hosts[hostIndex],
      [field]: value
    };
    setAssetsByBU(updated);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Asset Dashboard Editor...</p>
        </div>
      </div>
    );
  }

  const businessUnits = Object.keys(assetsByBU);
  const currentAssets = selectedBU ? assetsByBU[selectedBU] : [];
  const currentAsset = currentAssets[selectedAssetIndex];

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Package className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-roobert-bold text-white">Asset Dashboard Editor</h2>
          <div className="text-sm text-slate-400">
            Infrastructure & Demo Environments
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
            {isSaving ? 'Saving...' : isEditMode ? 'Save All Assets' : 'Edit'}
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
        {/* Left: BU & Asset List */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          <div className="p-4">
            {/* BU Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-roobert-medium text-slate-400 uppercase tracking-wide mb-3">Business Unit</h3>
              <select
                value={selectedBU}
                onChange={(e) => {
                  setSelectedBU(e.target.value);
                  setSelectedAssetIndex(0);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {businessUnits.map(buId => (
                  <option key={buId} value={buId}>{buId}</option>
                ))}
              </select>
            </div>

            {/* Asset List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-roobert-medium text-slate-400 uppercase tracking-wide">Assets</h3>
                {isEditMode && (
                  <button
                    onClick={addAssetToBU}
                    className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    title="Add Asset"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {currentAssets.map((asset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAssetIndex(idx)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      selectedAssetIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">{asset.name}</div>
                    <div className="text-xs opacity-75 mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${
                        asset.status === 'Live' ? 'bg-green-500/30' : 'bg-yellow-500/30'
                      }`}>
                        {asset.status}
                      </span>
                      <span>{asset.hosts.length} hosts</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Asset Editor/Preview */}
        <div className="flex-1 overflow-y-auto">
          {currentAsset ? (
            <div className="p-8">
              {/* Asset Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Server size={24} className="text-blue-400" />
                  <h2 className="text-3xl font-roobert-bold text-white">{currentAsset.name}</h2>
                </div>
                <p className="text-slate-400">{currentAsset.url}</p>
              </div>

              {/* Edit Mode: Forms */}
              {isEditMode ? (
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-roobert-semibold text-white mb-6">Basic Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-2">Environment Name</label>
                        <input
                          type="text"
                          value={currentAsset.name}
                          onChange={(e) => updateAsset('name', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-300 mb-2">URL</label>
                        <input
                          type="text"
                          value={currentAsset.url}
                          onChange={(e) => updateAsset('url', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Status</label>
                          <select
                            value={currentAsset.status}
                            onChange={(e) => updateAsset('status', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Live">Live</option>
                            <option value="Draft">Draft</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Offline">Offline</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Created Date</label>
                          <input
                            type="text"
                            value={currentAsset.created}
                            onChange={(e) => updateAsset('created', e.target.value)}
                            placeholder="YYYY-MM"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-slate-300 mb-2">Last Modified</label>
                          <input
                            type="text"
                            value={currentAsset.lastModified || ''}
                            onChange={(e) => updateAsset('lastModified', e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hosts */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-roobert-semibold text-white">Hosts</h3>
                      <button
                        onClick={addHostToAsset}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Host
                      </button>
                    </div>

                    <div className="space-y-4">
                      {currentAsset.hosts.map((host, hostIdx) => (
                        <div key={hostIdx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Hostname</label>
                              <input
                                type="text"
                                value={host.hostname}
                                onChange={(e) => updateHost(hostIdx, 'hostname', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Role</label>
                              <select
                                value={host.role}
                                onChange={(e) => updateHost(hostIdx, 'role', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="Web Host">Web Host</option>
                                <option value="App Server">App Server</option>
                                <option value="Database">Database</option>
                                <option value="Cache">Cache</option>
                                <option value="Load Balancer">Load Balancer</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">IP Address</label>
                              <input
                                type="text"
                                value={host.ip}
                                onChange={(e) => updateHost(hostIdx, 'ip', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeHostFromAsset(hostIdx)}
                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove Host
                          </button>
                        </div>
                      ))}

                      {currentAsset.hosts.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          No hosts configured. Click "Add Host" to get started.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delete Asset */}
                  <button
                    onClick={() => removeAssetFromBU(selectedAssetIndex)}
                    className="w-full px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Remove Asset
                  </button>
                </div>
              ) : (
                /* View Mode: Preview */
                <div className="space-y-6">
                  {/* Info Card */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          currentAsset.status === 'Live' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {currentAsset.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Created</p>
                        <p className="text-white font-medium">{currentAsset.created}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">Last Modified</p>
                        <p className="text-white font-medium">{currentAsset.lastModified || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">URL</p>
                      <a href={currentAsset.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                        {currentAsset.url}
                      </a>
                    </div>
                  </div>

                  {/* Hosts Card */}
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-roobert-semibold text-white mb-4">Hosts ({currentAsset.hosts.length})</h3>
                    <div className="space-y-3">
                      {currentAsset.hosts.map((host, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                          <div className="flex items-start gap-3">
                            <Cpu size={18} className="text-purple-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">{host.hostname}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-slate-400">Role: <span className="text-slate-300">{host.role}</span></span>
                                <span className="text-slate-400">IP: <span className="text-slate-300 font-mono">{host.ip}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {currentAsset.hosts.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                          No hosts configured
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select an asset to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
