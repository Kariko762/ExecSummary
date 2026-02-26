import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, X, Save, Edit3, Download, Loader2, Maximize2, Minimize2, Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface BusinessUnitConfig {
  id: string;
  name: string;
  shortName: string;
  color: string;
  stats: {
    revenue: string;
    growth: string;
    activeProjects: number;
    teamSize: number;
  };
}

interface Props {
  onClose: () => void;
}

export default function BusinessUnitEditor({ onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [businessUnits, setBusinessUnits] = useState<BusinessUnitConfig[]>([]);
  const [selectedBUIndex, setSelectedBUIndex] = useState<number>(0);

  const cycleViewSize = () => {
    if (viewSize === 75) setViewSize(95);
    else if (viewSize === 95) setViewSize(100);
    else setViewSize(75);
  };

  // Export to PNG
  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `bu-config-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Load existing data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/weekly-bu-summary');
        if (!response.ok) throw new Error('Failed to load data');
        
        const result = await response.json();
        
        if (result.success) {
          const buArray = Object.keys(result.businessUnits || {}).map(key => ({
            id: key,
            ...result.businessUnits[key]
          }));
          setBusinessUnits(buArray);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load business unit data');
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
      
      // Convert business units array back to object
      const businessUnitsObj = businessUnits.reduce((acc, bu) => {
        acc[bu.id] = {
          name: bu.name,
          shortName: bu.shortName,
          color: bu.color,
          stats: bu.stats
        };
        return acc;
      }, {} as Record<string, any>);
      
      // First, fetch current data
      const getCurrentResponse = await fetch('http://localhost:3001/api/weekly-bu-summary');
      const currentData = await getCurrentResponse.json();
      
      // Merge with updated BU configs
      const payload = {
        ...currentData,
        businessUnits: businessUnitsObj
      };
      
      const response = await fetch('http://localhost:3001/api/weekly-bu-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      alert('Business unit configuration saved successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save business unit configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Update business unit
  const updateBU = (index: number, field: string, value: any) => {
    const updated = [...businessUnits];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: {
          ...updated[index][parent as keyof BusinessUnitConfig],
          [child]: value
        }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setBusinessUnits(updated);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Business Unit Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-roobert-bold text-white">Business Unit Configuration Editor</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Size Toggle */}
          <button
            onClick={cycleViewSize}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title={`Current: ${viewSize}% - Click to cycle`}
          >
            {viewSize === 75 ? <Minimize2 className="w-5 h-5" /> : 
             viewSize === 95 ? <Maximize2 className="w-5 h-5" /> : 
             <Eye className="w-5 h-5" />}
          </button>

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
            {isSaving ? 'Saving...' : isEditMode ? 'Save' : 'Edit'}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor Panel */}
        {isEditMode && (
          <div className="w-[35%] bg-slate-800 border-r border-slate-700 overflow-y-auto p-6">
            <h3 className="text-lg font-roobert-bold text-white mb-6">Business Unit Configuration</h3>
            
            {/* BU Selector */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-3">Select Business Unit</label>
              <div className="flex flex-wrap gap-2">
                {businessUnits.map((bu, idx) => (
                  <button
                    key={bu.id}
                    onClick={() => setSelectedBUIndex(idx)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedBUIndex === idx
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {bu.shortName}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected BU Editor */}
            {businessUnits[selectedBUIndex] && (
              <div className="space-y-6 bg-slate-700/50 rounded-lg p-5">
                <div>
                  <h4 className="text-sm font-roobert-medium text-white mb-4 uppercase tracking-wide">
                    {businessUnits[selectedBUIndex].name}
                  </h4>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">ID (URL slug)</label>
                  <input
                    type="text"
                    value={businessUnits[selectedBUIndex].id}
                    onChange={(e) => updateBU(selectedBUIndex, 'id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Used in URLs: /executive-home/{businessUnits[selectedBUIndex].id}</p>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={businessUnits[selectedBUIndex].name}
                    onChange={(e) => updateBU(selectedBUIndex, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Short Name / Abbreviation</label>
                  <input
                    type="text"
                    value={businessUnits[selectedBUIndex].shortName}
                    onChange={(e) => updateBU(selectedBUIndex, 'shortName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Theme Color</label>
                  <select
                    value={businessUnits[selectedBUIndex].color}
                    onChange={(e) => updateBU(selectedBUIndex, 'color', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="cyan">Cyan</option>
                    <option value="green">Green</option>
                    <option value="orange">Orange</option>
                    <option value="pink">Pink</option>
                  </select>
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-${businessUnits[selectedBUIndex].color}-500 border border-slate-600`}></div>
                    <span className="text-sm text-slate-400">Preview</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <h5 className="text-sm font-roobert-medium text-white mb-4 uppercase tracking-wide">Statistics</h5>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Revenue</label>
                      <input
                        type="text"
                        value={businessUnits[selectedBUIndex].stats.revenue}
                        onChange={(e) => updateBU(selectedBUIndex, 'stats.revenue', e.target.value)}
                        placeholder="e.g., $2.4B"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Growth Rate</label>
                      <input
                        type="text"
                        value={businessUnits[selectedBUIndex].stats.growth}
                        onChange={(e) => updateBU(selectedBUIndex, 'stats.growth', e.target.value)}
                        placeholder="e.g., +12%"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Active Projects</label>
                      <input
                        type="number"
                        value={businessUnits[selectedBUIndex].stats.activeProjects}
                        onChange={(e) => updateBU(selectedBUIndex, 'stats.activeProjects', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-2">Team Size</label>
                      <input
                        type="number"
                        value={businessUnits[selectedBUIndex].stats.teamSize}
                        onChange={(e) => updateBU(selectedBUIndex, 'stats.teamSize', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: Preview Panel */}
        <div className={`flex-1 bg-slate-900 overflow-y-auto ${isEditMode ? '' : 'w-full'}`}>
          <div className="p-8">
            <div
              ref={contentRef}
              style={{
                width: viewSize === 100 ? '100%' : viewSize === 95 ? '95%' : '75%',
                transition: 'width 0.3s ease',
                margin: '0 auto'
              }}
            >
              {/* BU Configuration Preview */}
              <div className="bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] rounded-xl p-8">
                <h2 className="text-2xl font-roobert-bold text-white mb-8">Business Unit Configuration Preview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businessUnits.map((bu, idx) => (
                    <div
                      key={bu.id}
                      className={`bg-slate-800/50 border rounded-xl p-6 cursor-pointer transition-all hover:scale-105 ${
                        selectedBUIndex === idx ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-700'
                      }`}
                      onClick={() => setSelectedBUIndex(idx)}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-${bu.color}-500/20 border border-${bu.color}-500/30 flex items-center justify-center`}>
                          <Building2 className={`w-6 h-6 text-${bu.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-roobert-semibold text-white">{bu.shortName}</h3>
                          <p className="text-sm text-slate-400">{bu.name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1">Revenue</p>
                          <p className="text-white font-medium">{bu.stats.revenue}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1">Growth</p>
                          <p className="text-green-400 font-medium">{bu.stats.growth}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1">Projects</p>
                          <p className="text-white font-medium">{bu.stats.activeProjects}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1">Team Size</p>
                          <p className="text-white font-medium">{bu.stats.teamSize}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
