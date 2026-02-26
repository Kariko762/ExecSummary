import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, X, Save, Edit3, Download, Loader2, Maximize2, Minimize2,
  Monitor, Smartphone, Plus, Trash2, Target, Shield,
  HandCoins, Link as LinkIcon, ChevronRight
} from 'lucide-react';
import html2canvas from 'html2canvas';

// Business Unit Configuration
const BUSINESS_UNITS: Record<string, { name: string; shortName: string; color: string; darkColor: string }> = {
  'banking-int': { name: 'Banking International', shortName: 'BI', color: '#8B5CF6', darkColor: '#7C3AED' },
  'banking-na': { name: 'Banking North America', shortName: 'BNA', color: '#EC4899', darkColor: '#DB2777' },
  'capital-markets': { name: 'Capital Markets', shortName: 'CM', color: '#14B8A6', darkColor: '#0D9488' },
  'payments': { name: 'Payments', shortName: 'PAY', color: '#F59E0B', darkColor: '#D97706' },
  'cross-bu': { name: 'Cross-BU', shortName: 'CBU', color: '#6366F1', darkColor: '#4F46E5' }
};

// Type Definitions for New Structure
interface BUSummary {
  buId: string;
  buName: string;
  title: string;
  author: string;
  role: string;
  date: string;
  blufPoints: string[];      // Bottom Line Up Front bullet points
  background: string[];       // Background paragraphs (one per bluf point)
  recommendations: string[];  // Recommendations list
}

interface Ask {
  id: string;
  title: string;
  description: string;
  requestedFrom: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
}

interface Priority {
  id: string;
  title: string;
  description: string;
  businessUnits: string[];
  priority: number;
  targetDate: string;
  owner: string;
  status: 'not-started' | 'in-progress' | 'complete';
}

interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
  status: 'open' | 'monitoring' | 'mitigated' | 'closed';
}

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'document' | 'dashboard' | 'presentation' | 'other';
}

interface Props {
  onClose: () => void;
}

export default function LeadershipBUSummaryEditorV2({ onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSummaryId, setCurrentSummaryId] = useState<string>('');
  
  // Metadata
  const [weekOf, setWeekOf] = useState<string>('');
  const [quarter, setQuarter] = useState<string>('');
  const [createdBy, setCreatedBy] = useState<string>('');
  const [createdDate, setCreatedDate] = useState<string>('');
  
  // Multi-BU Summaries
  const [buSummaries, setBuSummaries] = useState<BUSummary[]>([
    {
      buId: 'banking-int',
      buName: 'Banking International',
      title: 'Week Summary',
      author: 'Regional Leadership Team',
      role: 'Banking International Leadership',
      date: new Date().toISOString().split('T')[0],
      blufPoints: ['Key point #1', 'Key point #2', 'Key point #3'],
      background: ['Background context 1...', 'Background context 2...', 'Background context 3...'],
      recommendations: ['Recommendation #1', 'Recommendation #2', 'Recommendation #3']
    }
  ]);
  
  const [asks, setAsks] = useState<Ask[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [links, setLinks] = useState<ResourceLink[]>([]);

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
      link.download = `leadership-summary-${new Date().toISOString().split('T')[0]}.png`;
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
        console.log('🔄 Fetching weekly summaries...');
        const response = await fetch('http://localhost:3001/api/content/list/leadership-bu');
        if (!response.ok) throw new Error('Failed to load summaries');
        
        const result = await response.json();
        const summaries = result.content || [];
        
        if (summaries.length > 0) {
          const summaryData = summaries[0];
          setCurrentSummaryId(summaryData.id || 'weekly-summary-feb-24-2026');
          
          // Load multi-BU format if available
          if (summaryData.summaries && Array.isArray(summaryData.summaries)) {
            console.log('✅ Loading multi-BU format');
            setBuSummaries(summaryData.summaries.map((s: any) => ({
              buId: s.buId,
              buName: s.buName,
              title: s.title,
              author: s.author,
              role: s.role,
              date: s.date,
              blufPoints: s.highlights || [],
              background: Array.isArray(s.background) ? s.background : (s.summary ? [s.summary] : []),
              recommendations: s.recommendations || []
            })));
            
            setWeekOf(summaryData.weekOf || '');
            setQuarter(summaryData.quarter || '');
            setCreatedBy(summaryData.createdBy || '');
            setCreatedDate(summaryData.createdDate || '');
          }
          
          setAsks(summaryData.asks || []);
          setPriorities(summaryData.priorities || summaryData.crossBUPriorities || []);
          setRisks(summaryData.risks || summaryData.crossBURisks || []);
          setLinks(summaryData.links || []);
        }
      } catch (error) {
        console.error('❌ Error loading summary data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      const data = {
        id: currentSummaryId,
        _templateName: 'leadership-bu-summary-v2',
        title: `Leadership Summary - ${weekOf}`,
        status: 'published',
        _contentTag: 'leadership-bu-summary',
        _published: true,
        weekOf,
        quarter,
        createdBy,
        createdDate,
        summaries: buSummaries,
        asks,
        priorities,
        risks,
        links
      };

      console.log('💾 Saving to:', currentSummaryId);
      const response = await fetch(`http://localhost:3001/api/content/leadership-bu/${currentSummaryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Save successful');
        alert('Leadership Summary saved successfully!');
        setIsEditMode(false);
      } else {
        console.error('❌ Save failed:', response.status);
        alert('Failed to save');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Save failed: ' + error);
    }
  };

  // BU Summary Management
  const addBU = () => {
    const newBU: BUSummary = {
      buId: 'banking-int',
      buName: 'Banking International',
      title: 'Week Summary',
      author: 'Leadership Team',
      role: 'Business Unit Leadership',
      date: new Date().toISOString().split('T')[0],
      blufPoints: ['New point'],
      background: ['New background'],
      recommendations: ['New recommendation']
    };
    setBuSummaries([...buSummaries, newBU]);
  };

  const removeBU = (index: number) => {
    setBuSummaries(buSummaries.filter((_, i) => i !== index));
  };

  const updateBU = (index: number, field: keyof BUSummary, value: any) => {
    const updated = [...buSummaries];
    updated[index] = { ...updated[index], [field]: value };
    setBuSummaries(updated);
  };

  const addBLUFPoint = (buIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].blufPoints.push('New point');
    setBuSummaries(updated);
  };

  const removeBLUFPoint = (buIndex: number, pointIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].blufPoints.splice(pointIndex, 1);
    setBuSummaries(updated);
  };

  const updateBLUFPoint = (buIndex: number, pointIndex: number, value: string) => {
    const updated = [...buSummaries];
    updated[buIndex].blufPoints[pointIndex] = value;
    setBuSummaries(updated);
  };

  const addBackgroundPoint = (buIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].background.push('New background context');
    setBuSummaries(updated);
  };

  const removeBackgroundPoint = (buIndex: number, pointIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].background.splice(pointIndex, 1);
    setBuSummaries(updated);
  };

  const updateBackgroundPoint = (buIndex: number, pointIndex: number, value: string) => {
    const updated = [...buSummaries];
    updated[buIndex].background[pointIndex] = value;
    setBuSummaries(updated);
  };

  const addRecommendation = (buIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].recommendations.push('New recommendation');
    setBuSummaries(updated);
  };

  const removeRecommendation = (buIndex: number, recIndex: number) => {
    const updated = [...buSummaries];
    updated[buIndex].recommendations.splice(recIndex, 1);
    setBuSummaries(updated);
  };

  const updateRecommendation = (buIndex: number, recIndex: number, value: string) => {
    const updated = [...buSummaries];
    updated[buIndex].recommendations[recIndex] = value;
    setBuSummaries(updated);
  };

  // Ask Management
  const addAsk = () => {
    const newAsk: Ask = {
      id: `ask-${Date.now()}`,
      title: 'New Ask',
      description: '',
      requestedFrom: '',
      targetDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending'
    };
    setAsks([...asks, newAsk]);
  };

  const removeAsk = (id: string) => {
    setAsks(asks.filter(a => a.id !== id));
  };

  const updateAsk = (id: string, field: keyof Ask, value: any) => {
    setAsks(asks.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  // Priority Management
  const addPriority = () => {
    const newPriority: Priority = {
      id: `priority-${Date.now()}`,
      title: 'New Priority',
      description: '',
      businessUnits: [],
      priority: 1,
      targetDate: new Date().toISOString().split('T')[0],
      owner: '',
      status: 'not-started'
    };
    setPriorities([...priorities, newPriority]);
  };

  const removePriority = (id: string) => {
    setPriorities(priorities.filter(p => p.id !== id));
  };

  const updatePriority = (id: string, field: keyof Priority, value: any) => {
    setPriorities(priorities.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Risk Management
  const addRisk = () => {
    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      title: 'New Risk',
      description: '',
      impact: 'medium',
      likelihood: 'medium',
      mitigation: '',
      owner: '',
      status: 'open'
    };
    setRisks([...risks, newRisk]);
  };

  const removeRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const updateRisk = (id: string, field: keyof Risk, value: any) => {
    setRisks(risks.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Link Management
  const addLink = () => {
    const newLink: ResourceLink = {
      id: `link-${Date.now()}`,
      title: 'New Link',
      url: '',
      description: '',
      category: 'document'
    };
    setLinks([...links, newLink]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const updateLink = (id: string, field: keyof ResourceLink, value: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-slate-900 shadow-2xl border border-slate-700/20 flex flex-col transition-all duration-300 ${
          viewSize === 100 ? 'w-full h-full' : viewSize === 95 ? 'w-[95vw] h-[95vh]' : 'w-[75vw] h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-roobert-bold text-white">Leadership Summary Editor V2</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Multi-BU Compact Layout</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800/30 p-1 mr-2">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 text-xs font-roobert-medium transition-all ${
                  viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 text-xs font-roobert-medium transition-all ${
                  viewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Edit/Save Toggle */}
            <button
              onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
              className={`p-2 transition-all ${
                isEditMode 
                  ? 'bg-emerald-600/80 text-white hover:bg-emerald-700/90' 
                  : 'hover:bg-slate-800/30 text-slate-400 hover:text-white'
              }`}
              title={isEditMode ? 'Save Changes' : 'Edit Mode'}
            >
              {isEditMode ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </button>

            {/* Expand/Size Toggle */}
            <button
              onClick={cycleViewSize}
              className="p-2 hover:bg-slate-800/30 transition-all text-slate-400 hover:text-white"
              title={viewSize === 75 ? 'Expand to 95%' : viewSize === 95 ? 'Fullscreen' : 'Collapse to 75%'}
            >
              {viewSize === 100 ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 hover:bg-slate-800/30 transition-all text-slate-400 hover:text-white disabled:opacity-50"
              title="Export to PNG"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800/30 transition-all text-slate-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" ref={contentRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-fis-raspberry mx-auto mb-4" />
                <p className="text-slate-400 font-roobert-medium">Loading summary data...</p>
              </div>
            </div>
          ) : (
            <div className={`mx-auto space-y-6 ${viewMode === 'mobile' ? 'max-w-md' : 'max-w-7xl'}`}>
              {/* Title Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-roobert-bold text-white mb-2">
                  Leadership Executive Summary
                </h1>
                <p className="text-xl text-slate-400 font-roobert-light">
                  {weekOf || 'Week of February 24, 2026'} • {quarter || 'Q1 2026'}
                </p>
                {isEditMode && (
                  <div className="flex gap-4 justify-center mt-4">
                    <input
                      type="text"
                      value={weekOf}
                      onChange={(e) => setWeekOf(e.target.value)}
                      placeholder="Week of..."
                      className="bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm"
                    />
                    <input
                      type="text"
                      value={quarter}
                      onChange={(e) => setQuarter(e.target.value)}
                      placeholder="Q1 2026"
                      className="bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Business Unit Summaries */}
              {buSummaries.map((bu, buIndex) => {
                const buConfig = BUSINESS_UNITS[bu.buId];
                return (
                  <div key={buIndex} className="bg-slate-800/20 border border-slate-700/20 overflow-hidden mb-8">
                    {/* BU Header */}
                    <div 
                      className="px-5 py-3 relative"
                      style={{ 
                        background: `linear-gradient(135deg, ${buConfig.color}99, ${buConfig.darkColor}99)`,
                        backgroundColor: '#1e293b'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white font-roobert-bold text-sm">{buConfig.shortName}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-roobert-bold text-white">{bu.buName}</h3>
                            <p className="text-sm text-white/80 font-roobert-light">{bu.author}</p>
                          </div>
                        </div>
                        {isEditMode && (
                          <button
                            onClick={() => removeBU(buIndex)}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Headers for columns */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-roobert-bold text-emerald-400 uppercase tracking-wide">Bottom Line Up Front</h4>
                          {isEditMode && (
                            <button
                              onClick={() => addBLUFPoint(buIndex)}
                              className="p-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-roobert-bold text-blue-400 uppercase tracking-wide">Background</h4>
                          {isEditMode && (
                            <button
                              onClick={() => addBackgroundPoint(buIndex)}
                              className="p-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-roobert-bold text-purple-400 uppercase tracking-wide">Recommendations</h4>
                          {isEditMode && (
                            <button
                              onClick={() => addRecommendation(buIndex)}
                              className="p-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content rows - each row contains aligned BLUF, Background, and Recommendation */}
                      {Array.from({ length: Math.max(bu.blufPoints.length, bu.background.length, bu.recommendations.length) }).map((_, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 lg:items-stretch">
                          {/* BLUF Point */}
                          <div className="bg-slate-900/20 border border-slate-700/20 p-4 flex flex-col relative">
                            {/* Arrow to Background */}
                            <div className="hidden lg:block absolute -right-[1.575rem] top-1/2 -translate-y-1/2 z-10">
                              <ChevronRight className="w-8 h-8 text-emerald-400" style={{ opacity: 0.15 }} />
                            </div>
                            {bu.blufPoints[rowIndex] !== undefined ? (
                              <div className="flex items-start gap-2 flex-1">
                                <span className="text-emerald-400 text-sm mt-1">•</span>
                                {isEditMode ? (
                                  <div className="flex-1 flex gap-1">
                                    <input
                                      type="text"
                                      value={bu.blufPoints[rowIndex]}
                                      onChange={(e) => updateBLUFPoint(buIndex, rowIndex, e.target.value)}
                                      className="flex-1 bg-slate-800/30 border border-slate-600/30 px-2 py-1 text-white text-sm"
                                    />
                                    <button
                                      onClick={() => removeBLUFPoint(buIndex, rowIndex)}
                                      className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-300 font-roobert-light flex-1">{bu.blufPoints[rowIndex]}</p>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500 italic">No entry</div>
                            )}
                          </div>

                          {/* Background */}
                          <div className="bg-slate-900/20 border border-slate-700/20 p-4 flex flex-col relative">
                            {/* Arrow to Recommendations */}
                            <div className="hidden lg:block absolute -right-[1.575rem] top-1/2 -translate-y-1/2 z-10">
                              <ChevronRight className="w-8 h-8 text-blue-400" style={{ opacity: 0.15 }} />
                            </div>
                            {bu.background[rowIndex] !== undefined ? (
                              isEditMode ? (
                                <div className="flex gap-1 flex-1">
                                  <textarea
                                    value={bu.background[rowIndex]}
                                    onChange={(e) => updateBackgroundPoint(buIndex, rowIndex, e.target.value)}
                                    className="flex-1 bg-slate-800/30 border border-slate-600/30 px-2 py-1 text-white text-sm"
                                    rows={3}
                                    placeholder="Background context..."
                                  />
                                  <button
                                    onClick={() => removeBackgroundPoint(buIndex, rowIndex)}
                                    className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white h-fit"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-300 font-roobert-light whitespace-pre-wrap flex-1">{bu.background[rowIndex]}</p>
                              )
                            ) : (
                              <div className="text-sm text-slate-500 italic">No entry</div>
                            )}
                          </div>

                          {/* Recommendation */}
                          <div className="bg-slate-900/20 border border-slate-700/20 p-4 flex flex-col">
                            {bu.recommendations[rowIndex] !== undefined ? (
                              <div className="flex items-start gap-2 flex-1">
                                <span className="text-purple-400 text-sm mt-1">{rowIndex + 1}.</span>
                                {isEditMode ? (
                                  <div className="flex-1 flex gap-1">
                                    <input
                                      type="text"
                                      value={bu.recommendations[rowIndex]}
                                      onChange={(e) => updateRecommendation(buIndex, rowIndex, e.target.value)}
                                      className="flex-1 bg-slate-800/30 border border-slate-600/30 px-2 py-1 text-white text-sm"
                                    />
                                    <button
                                      onClick={() => removeRecommendation(buIndex, rowIndex)}
                                      className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-300 font-roobert-light flex-1">{bu.recommendations[rowIndex]}</p>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-500 italic">No entry</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {isEditMode && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={addBU}
                    className="px-4 py-2 bg-purple-600/80 hover:bg-purple-700/90 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Business Unit
                  </button>
                </div>
              )}

              {/* ROW 2: Asks */}
              <div className="bg-slate-800/20 border border-slate-700/20 overflow-hidden">
                <div 
                  className="px-5 py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.6), rgba(217, 119, 6, 0.6))',
                    backgroundColor: '#1e293b'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm ">
                        <HandCoins className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-roobert-bold text-white">Asks</h3>
                        <p className="text-sm text-white/80 font-roobert-light">Approvals and support needed</p>
                      </div>
                    </div>
                    {isEditMode && (
                      <button onClick={addAsk} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Ask
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {asks.length === 0 && !isEditMode && (
                    <p className="text-slate-500 text-sm italic">No asks</p>
                  )}
                  {asks.map((ask) => (
                    <div key={ask.id} className="bg-slate-900/20 border border-slate-700/20 p-4">
                      {isEditMode ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={ask.title}
                              onChange={(e) => updateAsk(ask.id, 'title', e.target.value)}
                              className="flex-1 bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm"
                              placeholder="Ask title"
                            />
                            <button onClick={() => removeAsk(ask.id)} className="p-2 bg-red-600/80 hover:bg-red-700/90 text-white">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            value={ask.description}
                            onChange={(e) => updateAsk(ask.id, 'description', e.target.value)}
                            className="w-full bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm"
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <select value={ask.priority} onChange={(e) => updateAsk(ask.id, 'priority', e.target.value)} className="bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm">
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>
                            <select value={ask.status} onChange={(e) => updateAsk(ask.id, 'status', e.target.value)} className="bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm">
                              <option value="pending">Pending</option>
                              <option value="in-review">In Review</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <input type="text" value={ask.requestedFrom} onChange={(e) => updateAsk(ask.id, 'requestedFrom', e.target.value)} className="flex-1 bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm" placeholder="Requested from" />
                            <input type="date" value={ask.targetDate} onChange={(e) => updateAsk(ask.id, 'targetDate', e.target.value)} className="bg-slate-800/30 border border-slate-600/30 px-3 py-2 text-white text-sm" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="text-base font-roobert-semibold text-white flex-1">{ask.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1  ${
                                ask.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                ask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {ask.priority.toUpperCase()}
                              </span>
                              <span className={`text-xs px-2 py-1  ${
                                ask.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                ask.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                ask.status === 'in-review' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {ask.status.toUpperCase().replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 font-roobert-light mb-3">{ask.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>From: <span className="text-slate-400">{ask.requestedFrom}</span></span>
                            <span>•</span>
                            <span>Target: <span className="text-slate-400">{new Date(ask.targetDate).toLocaleDateString()}</span></span>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ROW 3: Prioritization | Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prioritization */}
                <div className="bg-slate-800/20 border border-slate-700/20 overflow-hidden">
                  <div 
                    className="px-5 py-3"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.6), rgba(5, 150, 105, 0.6))',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm ">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-roobert-bold text-white">Prioritization</h3>
                          <p className="text-sm text-white/80 font-roobert-light">Key initiatives</p>
                        </div>
                      </div>
                      {isEditMode && (
                        <button onClick={addPriority} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white  text-xs flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {priorities.length === 0 && !isEditMode && (
                      <p className="text-slate-500 text-sm italic">No priorities</p>
                    )}
                    {priorities.sort((a, b) => a.priority - b.priority).map((priority) => (
                      <div key={priority.id} className="bg-slate-900/20 border border-slate-700/20 p-3">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input type="number" value={priority.priority} onChange={(e) => updatePriority(priority.id, 'priority', parseInt(e.target.value))} className="w-16 bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="P#" />
                              <input type="text" value={priority.title} onChange={(e) => updatePriority(priority.id, 'title', e.target.value)} className="flex-1 bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Title" />
                              <button onClick={() => removePriority(priority.id)} className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white ">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <textarea value={priority.description} onChange={(e) => updatePriority(priority.id, 'description', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Description" rows={2} />
                            <div className="flex gap-2">
                              <select value={priority.status} onChange={(e) => updatePriority(priority.id, 'status', e.target.value)} className="bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs">
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="complete">Complete</option>
                              </select>
                              <input type="text" value={priority.owner} onChange={(e) => updatePriority(priority.id, 'owner', e.target.value)} className="flex-1 bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs" placeholder="Owner" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2 mb-2">
                              <div className="w-6 h-6  flex items-center justify-center font-roobert-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))' }}>
                                {priority.priority}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-roobert-semibold text-white mb-1">{priority.title}</h4>
                                <p className="text-xs text-slate-400 font-roobert-light">{priority.description}</p>
                              </div>
                              <span className={`text-xs px-2 py-1  ${
                                priority.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                                priority.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {priority.status.toUpperCase().replace('-', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Owner: <span className="text-slate-400">{priority.owner}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                <div className="bg-slate-800/20 border border-slate-700/20 overflow-hidden">
                  <div 
                    className="px-5 py-3"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.6), rgba(220, 38, 38, 0.6))',
                      backgroundColor: '#1e293b'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm ">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-roobert-bold text-white">Risks</h3>
                          <p className="text-sm text-white/80 font-roobert-light">Key risks & mitigation</p>
                        </div>
                      </div>
                      {isEditMode && (
                        <button onClick={addRisk} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white  text-xs flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {risks.length === 0 && !isEditMode && (
                      <p className="text-slate-500 text-sm italic">No risks</p>
                    )}
                    {risks.map((risk) => (
                      <div key={risk.id} className="bg-slate-900/20 border border-slate-700/20 p-3">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input type="text" value={risk.title} onChange={(e) => updateRisk(risk.id, 'title', e.target.value)} className="flex-1 bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Risk title" />
                              <button onClick={() => removeRisk(risk.id)} className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white ">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <textarea value={risk.description} onChange={(e) => updateRisk(risk.id, 'description', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Description" rows={2} />
                            <textarea value={risk.mitigation} onChange={(e) => updateRisk(risk.id, 'mitigation', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Mitigation" rows={2} />
                            <div className="flex gap-2">
                              <select value={risk.impact} onChange={(e) => updateRisk(risk.id, 'impact', e.target.value)} className="bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs">
                                <option value="high">High Impact</option>
                                <option value="medium">Medium Impact</option>
                                <option value="low">Low Impact</option>
                              </select>
                              <select value={risk.likelihood} onChange={(e) => updateRisk(risk.id, 'likelihood', e.target.value)} className="bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs">
                                <option value="high">High Likelihood</option>
                                <option value="medium">Medium Likelihood</option>
                                <option value="low">Low Likelihood</option>
                              </select>
                              <select value={risk.status} onChange={(e) => updateRisk(risk.id, 'status', e.target.value)} className="bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs">
                                <option value="open">Open</option>
                                <option value="monitoring">Monitoring</option>
                                <option value="mitigated">Mitigated</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-roobert-semibold text-white flex-1">{risk.title}</h4>
                              <span className={`text-xs px-2 py-1  ${
                                risk.status === 'mitigated' ? 'bg-green-500/20 text-green-400' :
                                risk.status === 'monitoring' ? 'bg-yellow-500/20 text-yellow-400' :
                                risk.status === 'closed' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {risk.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-roobert-light mb-2">{risk.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1  ${
                                risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                Impact: {risk.impact.toUpperCase()}
                              </span>
                              <span className={`text-xs px-2 py-1  ${
                                risk.likelihood === 'high' ? 'bg-red-500/20 text-red-400' :
                                risk.likelihood === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                Likelihood: {risk.likelihood.toUpperCase()}
                              </span>
                            </div>
                            <div className="bg-slate-800/50  p-2">
                              <p className="text-xs text-emerald-400 font-roobert-light">{risk.mitigation}</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 4: Links */}
              <div className="bg-slate-800/20 border border-slate-700/20 overflow-hidden">
                <div 
                  className="px-5 py-3"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.6), rgba(8, 145, 178, 0.6))',
                    backgroundColor: '#1e293b'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm ">
                        <LinkIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-roobert-bold text-white">Resources & Links</h3>
                        <p className="text-sm text-white/80 font-roobert-light">Supporting documents and dashboards</p>
                      </div>
                    </div>
                    {isEditMode && (
                      <button onClick={addLink} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white  text-xs flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Link
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  {links.length === 0 && !isEditMode && (
                    <p className="text-slate-500 text-sm italic">No links</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {links.map((link) => (
                      <div key={link.id} className="bg-slate-900/20 border border-slate-700/20 p-3">
                        {isEditMode ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input type="text" value={link.title} onChange={(e) => updateLink(link.id, 'title', e.target.value)} className="flex-1 bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Title" />
                              <button onClick={() => removeLink(link.id)} className="p-1 bg-red-600/80 hover:bg-red-700/90 text-white ">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input type="url" value={link.url} onChange={(e) => updateLink(link.id, 'url', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="URL" />
                            <textarea value={link.description} onChange={(e) => updateLink(link.id, 'description', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-sm" placeholder="Description" rows={2} />
                            <select value={link.category} onChange={(e) => updateLink(link.id, 'category', e.target.value)} className="w-full bg-slate-800/30 border border-slate-600/30  px-2 py-1 text-white text-xs">
                              <option value="document">Document</option>
                              <option value="dashboard">Dashboard</option>
                              <option value="presentation">Presentation</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-sm font-roobert-semibold text-white mb-1">{link.title}</h4>
                            <p className="text-xs text-slate-400 font-roobert-light mb-2">{link.description}</p>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 break-all"
                            >
                              {link.url}
                            </a>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1  bg-slate-700 text-slate-300">
                                {link.category}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
