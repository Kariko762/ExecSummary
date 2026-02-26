import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, X, Save, Edit3, Download, Loader2, Maximize2, Minimize2,
  Monitor, Smartphone, Plus, Trash2, Eye
} from 'lucide-react';
import html2canvas from 'html2canvas';
import ExecutiveHome from '../pages/ExecutiveHome';

// Business Unit Configuration
interface BusinessUnit {
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

interface WeeklyMetadata {
  weekOf: string;
  quarter: string;
  author: string;
  lastUpdated: string;
}

interface Props {
  onClose: () => void;
}

export default function ExecutiveHomeEditor({ onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Metadata
  const [metadata, setMetadata] = useState<WeeklyMetadata>({
    weekOf: '',
    quarter: '',
    author: '',
    lastUpdated: ''
  });
  
  // Business Units
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
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
      link.download = `executive-home-${new Date().toISOString().split('T')[0]}.png`;
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
        console.log('🔄 Fetching executive home data...');
        const response = await fetch('http://localhost:3001/api/weekly-bu-summary');
        if (!response.ok) throw new Error('Failed to load data');
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Data loaded:', result);
          
          // Load metadata
          setMetadata({
            weekOf: result.meta?.weekOf || '',
            quarter: result.meta?.quarter || '',
            author: result.meta?.author || '',
            lastUpdated: result.meta?.lastUpdated || new Date().toISOString()
          });
          
          // Load business units
          const buArray = Object.keys(result.businessUnits || {}).map(key => ({
            id: key,
            ...result.businessUnits[key]
          }));
          setBusinessUnits(buArray);
        }
      } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Failed to load executive home data');
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
      console.log('💾 Saving executive home data...');
      
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
      
      const payload = {
        meta: {
          ...metadata,
          lastUpdated: new Date().toISOString()
        },
        businessUnits: businessUnitsObj
      };
      
      const response = await fetch('http://localhost:3001/api/weekly-bu-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      console.log('✅ Data saved successfully');
      alert('Executive home data saved successfully!');
      setIsEditMode(false);
    } catch (error) {
      console.error('❌ Error saving:', error);
      alert('Failed to save executive home data');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new business unit
  const handleAddBU = () => {
    const newBU: BusinessUnit = {
      id: `bu-${Date.now()}`,
      name: 'New Business Unit',
      shortName: 'NBU',
      color: 'blue',
      stats: {
        revenue: '$0M',
        growth: '+0%',
        activeProjects: 0,
        teamSize: 0
      }
    };
    setBusinessUnits([...businessUnits, newBU]);
    setSelectedBUIndex(businessUnits.length);
  };

  // Remove business unit
  const handleRemoveBU = (index: number) => {
    if (confirm('Are you sure you want to remove this business unit?')) {
      const updated = businessUnits.filter((_, idx) => idx !== index);
      setBusinessUnits(updated);
      if (selectedBUIndex >= updated.length) {
        setSelectedBUIndex(Math.max(0, updated.length - 1));
      }
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
          ...updated[index][parent as keyof BusinessUnit],
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
          <p className="text-white">Loading Executive Home Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-roobert-bold text-white">Executive Home Editor</h2>
          <div className="text-sm text-slate-400">
            Week of {metadata.weekOf} • {metadata.quarter}
          </div>
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
             <Monitor className="w-5 h-5" />}
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
            title={isEditMode ? 'Save Changes' : 'Edit Mode'}
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
            title="Export to PNG"
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
            title="Close Editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor Panel (30%) */}
        {isEditMode && (
          <div className="w-[30%] bg-slate-800 border-r border-slate-700 overflow-y-auto p-6">
            <h3 className="text-lg font-roobert-bold text-white mb-6">Configuration</h3>
            
            {/* Metadata Section */}
            <div className="mb-8 bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-sm font-roobert-medium text-white mb-4 uppercase tracking-wide">Metadata</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Week Of</label>
                  <input
                    type="date"
                    value={metadata.weekOf}
                    onChange={(e) => setMetadata({ ...metadata, weekOf: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Quarter</label>
                  <input
                    type="text"
                    value={metadata.quarter}
                    onChange={(e) => setMetadata({ ...metadata, quarter: e.target.value })}
                    placeholder="e.g., Q1 2026"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Author</label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Units Section */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-roobert-medium text-white uppercase tracking-wide">Business Units</h4>
                <button
                  onClick={handleAddBU}
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  title="Add Business Unit"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* BU Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {businessUnits.map((bu, idx) => (
                  <button
                    key={bu.id}
                    onClick={() => setSelectedBUIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedBUIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {bu.shortName}
                  </button>
                ))}
              </div>

              {/* Selected BU Editor */}
              {businessUnits[selectedBUIndex] && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">ID</label>
                    <input
                      type="text"
                      value={businessUnits[selectedBUIndex].id}
                      onChange={(e) => updateBU(selectedBUIndex, 'id', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={businessUnits[selectedBUIndex].name}
                      onChange={(e) => updateBU(selectedBUIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Short Name</label>
                    <input
                      type="text"
                      value={businessUnits[selectedBUIndex].shortName}
                      onChange={(e) => updateBU(selectedBUIndex, 'shortName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Color</label>
                    <select
                      value={businessUnits[selectedBUIndex].color}
                      onChange={(e) => updateBU(selectedBUIndex, 'color', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="cyan">Cyan</option>
                      <option value="green">Green</option>
                      <option value="orange">Orange</option>
                      <option value="pink">Pink</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h5 className="text-sm text-slate-300 mb-3">Stats</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Revenue</label>
                        <input
                          type="text"
                          value={businessUnits[selectedBUIndex].stats.revenue}
                          onChange={(e) => updateBU(selectedBUIndex, 'stats.revenue', e.target.value)}
                          placeholder="e.g., $2.4B"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Growth</label>
                        <input
                          type="text"
                          value={businessUnits[selectedBUIndex].stats.growth}
                          onChange={(e) => updateBU(selectedBUIndex, 'stats.growth', e.target.value)}
                          placeholder="e.g., +12%"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Active Projects</label>
                        <input
                          type="number"
                          value={businessUnits[selectedBUIndex].stats.activeProjects}
                          onChange={(e) => updateBU(selectedBUIndex, 'stats.activeProjects', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Team Size</label>
                        <input
                          type="number"
                          value={businessUnits[selectedBUIndex].stats.teamSize}
                          onChange={(e) => updateBU(selectedBUIndex, 'stats.teamSize', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveBU(selectedBUIndex)}
                    className="w-full mt-4 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove Business Unit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Preview Panel */}
        <div className={`flex-1 bg-slate-900 overflow-y-auto ${isEditMode ? '' : 'w-full'}`}>
          <div className="flex items-center justify-center min-h-full p-6">
            <div
              ref={contentRef}
              style={{
                width: viewSize === 100 ? '100%' : viewSize === 95 ? '95%' : '75%',
                transition: 'width 0.3s ease'
              }}
              className="bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] rounded-lg shadow-2xl overflow-hidden"
            >
              <ExecutiveHome />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
