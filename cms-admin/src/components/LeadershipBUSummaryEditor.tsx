import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Maximize2, Minimize2, Download, X, Loader2, Building2, TrendingUp, Monitor, Smartphone, HandCoins, Shield, Edit3, Save, Plus, Trash2, RefreshCw } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

// Business Unit Configuration
const BUSINESS_UNITS = {
  'banking-int': {
    id: 'banking-int',
    name: 'Banking (Int.)',
    shortName: 'INT',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
    darkColor: '#1E3A8A'
  },
  'banking-na': {
    id: 'banking-na',
    name: 'Banking (NA)',
    shortName: 'NA',
    color: '#10B981',
    lightColor: '#D1FAE5',
    darkColor: '#065F46'
  },
  'capital-markets': {
    id: 'capital-markets',
    name: 'Capital Markets',
    shortName: 'CM',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
    darkColor: '#5B21B6'
  },
  'payments': {
    id: 'payments',
    name: 'Payments',
    shortName: 'PAY',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
    darkColor: '#92400E'
  },
  'cross-bu': {
    id: 'cross-bu',
    name: 'Cross-BU',
    shortName: 'XBU',
    color: '#EF4444',
    lightColor: '#FEE2E2',
    darkColor: '#991B1B'
  }
} as const;

// Interfaces
interface BUBottomLineItem {
  id: string;
  title: string;
  background: string;
  recommendation: string;
  deliverable: string;
  priority: 'high' | 'medium' | 'low';
  status: 'on-track' | 'at-risk' | 'blocked' | 'complete';
}

interface BUSection {
  buId: keyof typeof BUSINESS_UNITS;
  items: BUBottomLineItem[];
}

interface CrossBUPriority {
  id: string;
  title: string;
  description: string;
  businessUnits: (keyof typeof BUSINESS_UNITS)[];
  priority: number;
  targetDate: string;
  owner: string;
  status: 'not-started' | 'in-progress' | 'complete';
}

interface Ask {
  id: string;
  title: string;
  description: string;
  businessUnits: (keyof typeof BUSINESS_UNITS)[];
  requestedFrom: string;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
}

interface CrossBURisk {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string;
  owner: string;
  status: 'open' | 'monitoring' | 'mitigated' | 'closed';
}

interface Props {
  onClose: () => void;
}

export default function LeadershipBUSummaryEditor({ onClose }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewSize, setViewSize] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSummaryId, setCurrentSummaryId] = useState<string>('');
  const [currentMetadata, setCurrentMetadata] = useState<any>(null);
  const [availableSummaries, setAvailableSummaries] = useState<any[]>([]);
  
  const cycleViewSize = () => {
    if (viewSize === 75) setViewSize(95);
    else if (viewSize === 95) setViewSize(100);
    else setViewSize(75);
  };

  // Sample Data - Will be replaced by API data
  const [buSections, setBuSections] = useState<BUSection[]>([
    {
      buId: 'banking-int',
      items: [
        {
          id: '1',
          title: 'MUFG $6M+ Demo AI Endpoint Build kicked off for Credit Assessment',
          background: 'Major Japanese banking client requested AI-powered credit assessment demonstration following Q4 2025 strategic review. Build requires 3-month timeline with dedicated engineering resources.',
          recommendation: 'Proceed with rapid prototype development using existing ML models. Allocate 2 senior engineers and coordinate with MUFG relationship team weekly.',
          deliverable: 'Working prototype demo by March 15, 2026 for stakeholder review',
          priority: 'high',
          status: 'on-track'
        }
      ]
    },
    { buId: 'banking-na', items: [] },
    { buId: 'capital-markets', items: [] },
    { buId: 'payments', items: [] },
    { buId: 'cross-bu', items: [] }
  ]);

  const [asks, setAsks] = useState<Ask[]>([
    {
      id: 'ask-1',
      title: 'Budget Approval for Q2 Demo Infrastructure Expansion',
      description: 'Requesting $450K budget allocation for scaling demo environments to support 40% increase in pipeline demos expected in Q2 2026.',
      businessUnits: ['banking-int', 'banking-na', 'capital-markets', 'payments'],
      requestedFrom: 'CFO / Finance Leadership',
      targetDate: '2026-02-28',
      priority: 'high',
      status: 'in-review'
    }
  ]);

  const [crossBURisks, setCrossBURisks] = useState<CrossBURisk[]>([
    {
      id: 'risk-1',
      title: 'Coast MSA Expiration Could Cause Service Interruption',
      description: 'Unsigned MSA renewal creates risk of platform access loss by Feb 15, impacting 25+ active demos and Q1 pipeline.',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Daily escalation to CFO office. Backup plan to migrate critical demos to Tiled if MSA lapses.',
      owner: 'Jason Hanscomb',
      status: 'monitoring'
    }
  ]);

  const [crossBUPriorities, setCrossBUPriorities] = useState<CrossBUPriority[]>([
    {
      id: 'p1',
      title: 'Q1 Demo Asset Standardization Initiative',
      description: 'Establish unified demo asset library with consistent branding, faster deployment, and cross-BU reusability',
      businessUnits: ['banking-int', 'banking-na', 'capital-markets', 'payments'],
      priority: 1,
      targetDate: '2026-03-31',
      owner: 'Demo Engineering Team',
      status: 'in-progress'
    }
  ]);

  // Load existing data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Fetching BU summaries...');
        const response = await fetch('http://localhost:3001/api/content/list/leadership-bu');
        if (!response.ok) throw new Error('Failed to load BU summaries');
        
        const result = await response.json();
        console.log('📦 API Response:', result);
        const summaries = result.content || [];
        console.log('📋 Summaries found:', summaries.length);
        
        // Store all available summaries
        setAvailableSummaries(summaries);
        
        if (summaries && summaries.length > 0) {
          // Load the first summary (data is already in the response)
          const summaryData = summaries[0];
          console.log('✅ Loading summary:', summaryData.id);
          console.log('📊 BU Sections:', summaryData.buSections);
          setCurrentSummaryId(summaryData.id || 'bu-summary-feb-11-2026');
          setCurrentMetadata(summaryData.metadata || {});
          
          // Convert array format to BUSection object format
          const loadedBUSections: BUSection[] = [
            { buId: 'banking-int', items: [] },
            { buId: 'banking-na', items: [] },
            { buId: 'capital-markets', items: [] },
            { buId: 'payments', items: [] },
            { buId: 'cross-bu', items: [] }
          ];
          
          // If buSections is an array, map it to the sections
          if (Array.isArray(summaryData.buSections)) {
            summaryData.buSections.forEach((section: any) => {
              const matchingSection = loadedBUSections.find(s => s.buId === section.buId);
              if (matchingSection) {
                matchingSection.items = section.items || [];
                console.log(`  ✓ Loaded ${section.items?.length || 0} items for ${section.buId}`);
              }
            });
          }
          
          console.log('🎯 Final sections:', loadedBUSections);
          setBuSections(loadedBUSections);
          setAsks(summaryData.asks || []);
          setCrossBUPriorities(summaryData.crossBUPriorities || []);
          setCrossBURisks(summaryData.crossBURisks || []);
          console.log('✨ Data loaded successfully');
        } else {
          console.log('⚠️ No summaries found');
        }
      } catch (error) {
        console.error('❌ Error loading BU summary data:', error);
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
        _templateName: 'leadership-bu-summary',
        title: currentMetadata?.title || 'Leadership BU Summary',
        status: 'published',
        _contentTag: 'leadership-bu-summary',
        _published: true,
        metadata: currentMetadata || {
          weekStart: new Date().toISOString().split('T')[0],
          weekEnd: new Date().toISOString().split('T')[0],
          title: 'Leadership BU Summary',
          description: 'Business Unit focused executive summary'
        },
        buSections,
        asks,
        crossBUPriorities,
        crossBURisks
      };

      console.log('💾 Saving to:', currentSummaryId);
      console.log('📦 Data:', data);

      // Update the existing file
      const response = await fetch(`http://localhost:3001/api/content/leadership-bu/${currentSummaryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Save successful');
        alert('Leadership BU Summary saved successfully!');
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
  // Load a specific summary by ID
  const loadSummaryById = async (summaryId: string) => {
    try {
      setIsLoading(true);
      const summaryData = availableSummaries.find(s => s.id === summaryId);
      if (!summaryData) {
        console.error('❌ Summary not found:', summaryId);
        return;
      }

      console.log('✅ Loading summary:', summaryData.id);
      setCurrentSummaryId(summaryData.id);
      setCurrentMetadata(summaryData.metadata || {});

      // Convert array format to BUSection object format
      const loadedBUSections: BUSection[] = [
        { buId: 'banking-int', items: [] },
        { buId: 'banking-na', items: [] },
        { buId: 'capital-markets', items: [] },
        { buId: 'payments', items: [] },
        { buId: 'cross-bu', items: [] }
      ];

      if (Array.isArray(summaryData.buSections)) {
        summaryData.buSections.forEach((section: any) => {
          const matchingSection = loadedBUSections.find(s => s.buId === section.buId);
          if (matchingSection) {
            matchingSection.items = section.items || [];
          }
        });
      }

      setBuSections(loadedBUSections);
      setAsks(summaryData.asks || []);
      setCrossBUPriorities(summaryData.crossBUPriorities || []);
      setCrossBURisks(summaryData.crossBURisks || []);
      console.log('✨ Summary loaded successfully');
    } catch (error) {
      console.error('❌ Error loading summary:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const addBUItem = (buId: keyof typeof BUSINESS_UNITS) => {
    const newItem: BUBottomLineItem = {
      id: `item-${Date.now()}`,
      title: '',
      background: '',
      recommendation: '',
      deliverable: '',
      priority: 'medium',
      status: 'on-track'
    };
    
    setBuSections(sections => 
      sections.map(s => 
        s.buId === buId 
          ? { ...s, items: [...s.items, newItem] }
          : s
      )
    );
  };

  const removeBUItem = (buId: keyof typeof BUSINESS_UNITS, itemId: string) => {
    setBuSections(sections =>
      sections.map(s =>
        s.buId === buId
          ? { ...s, items: s.items.filter(item => item.id !== itemId) }
          : s
      )
    );
  };

  const updateBUItem = (
    buId: keyof typeof BUSINESS_UNITS,
    itemId: string,
    field: keyof BUBottomLineItem,
    value: any
  ) => {
    setBuSections(sections =>
      sections.map(s =>
        s.buId === buId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : s
      )
    );
  };

  // Asks helper functions
  const addAsk = () => {
    const newAsk: any = {
      id: `ask-${Date.now()}`,
      title: '',
      description: '',
      businessUnits: [],
      requestedFrom: '',
      targetDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'pending'
    };
    setAsks([...asks, newAsk]);
  };

  const removeAsk = (askId: string) => {
    setAsks(asks.filter(ask => ask.id !== askId));
  };

  const updateAsk = (askId: string, field: string, value: any) => {
    setAsks(asks.map(ask => 
      ask.id === askId ? { ...ask, [field]: value } : ask
    ));
  };

  // Priorities helper functions
  const addPriority = () => {
    const newPriority: any = {
      id: `p${crossBUPriorities.length + 1}`,
      title: '',
      description: '',
      businessUnits: [],
      priority: crossBUPriorities.length + 1,
      targetDate: new Date().toISOString().split('T')[0],
      owner: '',
      status: 'not-started'
    };
    setCrossBUPriorities([...crossBUPriorities, newPriority]);
  };

  const removePriority = (priorityId: string) => {
    setCrossBUPriorities(crossBUPriorities.filter(p => p.id !== priorityId));
  };

  const updatePriority = (priorityId: string, field: string, value: any) => {
    setCrossBUPriorities(crossBUPriorities.map(priority => 
      priority.id === priorityId ? { ...priority, [field]: value } : priority
    ));
  };

  // Risks helper functions
  const addRisk = () => {
    const newRisk: any = {
      id: `risk-${Date.now()}`,
      title: '',
      description: '',
      impact: 'medium',
      likelihood: 'medium',
      mitigation: '',
      owner: '',
      status: 'open'
    };
    setCrossBURisks([...crossBURisks, newRisk]);
  };

  const removeRisk = (riskId: string) => {
    setCrossBURisks(crossBURisks.filter(risk => risk.id !== riskId));
  };

  const updateRisk = (riskId: string, field: string, value: any) => {
    setCrossBURisks(crossBURisks.map(risk => 
      risk.id === riskId ? { ...risk, [field]: value } : risk
    ));
  };

  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    
    // Save current scroll position and overflow state
    const scrollTop = contentRef.current.scrollTop;
    const originalOverflow = contentRef.current.style.overflow;
    const originalHeight = contentRef.current.style.height;
    
    try {
      // Remove scroll and let content expand to full height
      contentRef.current.style.overflow = 'visible';
      contentRef.current.style.height = 'auto';
      contentRef.current.scrollTop = 0;
      
      // Small delay to let layout settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        fetch: { requestInit: { cache: 'force-cache' } }
      });
      
      const link = document.createElement('a');
      link.download = `leadership-bu-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      // Restore scroll and overflow
      if (contentRef.current) {
        contentRef.current.style.overflow = originalOverflow;
        contentRef.current.style.height = originalHeight;
        contentRef.current.scrollTop = scrollTop;
      }
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 flex flex-col transition-all duration-300 ${
          viewSize === 100 ? 'w-full h-full' : viewSize === 95 ? 'w-[95vw] h-[95vh]' : 'w-[75vw] h-[90vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-roobert-bold text-white">Leadership Executive Summary Editor</h2>
                <p className="text-sm text-slate-400 font-roobert-light">Business Unit View</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={currentSummaryId}
                  onChange={(e) => loadSummaryById(e.target.value)}
                  disabled={isEditMode}
                  className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm font-roobert-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {availableSummaries.length === 0 ? (
                    <option value="">No summaries found</option>
                  ) : (
                    availableSummaries.map(summary => (
                      <option key={summary.id} value={summary.id}>
                        {summary.metadata?.title || summary.title || summary.id} ({summary.metadata?.weekStart || 'No date'})
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={() => loadSummaryById(currentSummaryId)}
                  disabled={isEditMode}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reload from file"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1 mr-2">
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1.5 rounded text-xs font-roobert-medium transition-all ${
                  viewMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1.5 rounded text-xs font-roobert-medium transition-all ${
                  viewMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Edit/Save Toggle */}
            <button
              onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
              className={`p-2 rounded-lg transition-all ${
                isEditMode 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isEditMode ? 'Save Changes' : 'Edit Mode'}
            >
              {isEditMode ? <Save className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </button>

            {/* Expand/Size Toggle */}
            <button
              onClick={cycleViewSize}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
              title={viewSize === 75 ? 'Expand to 95%' : viewSize === 95 ? 'Fullscreen' : 'Collapse to 75%'}
            >
              {viewSize === 100 ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white disabled:opacity-50"
              title="Export to PNG"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
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
                <p className="text-slate-400 font-roobert-medium">Loading BU Summary data...</p>
              </div>
            </div>
          ) : (
            <div className={`mx-auto space-y-6 ${viewMode === 'mobile' ? 'max-w-md' : 'max-w-7xl'}`}>
              {/* Title Header */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-roobert-bold text-white mb-2">
                  Leadership Business Unit Summary
                </h1>
                <p className="text-xl text-slate-400 font-roobert-light">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            
            {/* Business Unit Sections */}
            {buSections.map((section) => {
              const bu = BUSINESS_UNITS[section.buId];
              return (
              <div key={section.buId} className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
                {/* BU Header with color */}
                <div 
                  className="px-5 py-3"
                  style={{ background: `linear-gradient(135deg, ${bu.color}, ${bu.darkColor})` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white font-roobert-bold text-sm">{bu.shortName}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-roobert-bold text-white">{bu.name}</h3>
                        <p className="text-sm text-white/80 font-roobert-light">{section.items.length} item{section.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => addBUItem(section.buId)}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                {section.items.length === 0 && !isEditMode && (
                  <p className="text-slate-500 text-sm italic">No items</p>
                )}
                
                {section.items.map((item) => (
                  <div key={item.id} className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateBUItem(section.buId, item.id, 'title', e.target.value)}
                            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                            placeholder="Title (punchy single sentence)"
                          />
                          <button
                            onClick={() => removeBUItem(section.buId, item.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={item.background}
                          onChange={(e) => updateBUItem(section.buId, item.id, 'background', e.target.value)}
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                          rows={2}
                          placeholder="Background (expanded context)"
                        />
                        <textarea
                          value={item.recommendation}
                          onChange={(e) => updateBUItem(section.buId, item.id, 'recommendation', e.target.value)}
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                          rows={2}
                          placeholder="Recommendation (decision/action)"
                        />
                        <input
                          type="text"
                          value={item.deliverable}
                          onChange={(e) => updateBUItem(section.buId, item.id, 'deliverable', e.target.value)}
                          className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                          placeholder="Deliverable (what and when)"
                        />
                        <div className="flex gap-2">
                          <select
                            value={item.priority}
                            onChange={(e) => updateBUItem(section.buId, item.id, 'priority', e.target.value)}
                            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                          >
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                          <select
                            value={item.status}
                            onChange={(e) => updateBUItem(section.buId, item.id, 'status', e.target.value)}
                            className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 text-sm"
                          >
                            <option value="on-track">On Track</option>
                            <option value="at-risk">At Risk</option>
                            <option value="blocked">Blocked</option>
                            <option value="complete">Complete</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-roobert-semibold text-white flex-1">{item.title}</h4>
                          <div className="flex gap-2 items-center">
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.priority.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.status === 'on-track' ? 'bg-green-500/20 text-green-400' :
                              item.status === 'at-risk' ? 'bg-orange-500/20 text-orange-400' :
                              item.status === 'blocked' ? 'bg-red-500/20 text-red-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300"><strong>Background:</strong> {item.background}</p>
                        <p className="text-sm text-slate-300"><strong>Recommendation:</strong> {item.recommendation}</p>
                        <p className="text-sm text-emerald-400"><strong>Deliverable:</strong> {item.deliverable}</p>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </div>
            );
            })}
            
            {/* Asks Section */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
              <div 
                className="px-5 py-3"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
                      <HandCoins className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-roobert-bold text-white">Asks</h3>
                      <p className="text-sm text-white/80 font-roobert-light">Approvals and support needed from leadership</p>
                    </div>
                  </div>
                  {isEditMode && (
                    <button onClick={addAsk} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs flex items-center gap-1">
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
                  <div key={ask.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ask.title}
                            onChange={(e) => updateAsk(ask.id, 'title', e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                            placeholder="Ask title"
                          />
                          <button onClick={() => removeAsk(ask.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={ask.description}
                          onChange={(e) => updateAsk(ask.id, 'description', e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <select value={ask.priority} onChange={(e) => updateAsk(ask.id, 'priority', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="low">Low Priority</option>
                          </select>
                          <select value={ask.status} onChange={(e) => updateAsk(ask.id, 'status', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="pending">Pending</option>
                            <option value="in-review">In Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <input type="text" value={ask.requestedFrom} onChange={(e) => updateAsk(ask.id, 'requestedFrom', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm" placeholder="Requested from" />
                          <input type="date" value={ask.targetDate} onChange={(e) => updateAsk(ask.id, 'targetDate', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="text-base font-roobert-semibold text-white flex-1">{ask.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              ask.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              ask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {ask.priority.toUpperCase()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
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

            {/* Cross-BU Priorities Section */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
              <div 
                className="px-5 py-3"
                style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-roobert-bold text-white">Cross-BU Priorities</h3>
                      <p className="text-sm text-white/80 font-roobert-light">Strategic initiatives spanning multiple business units</p>
                    </div>
                  </div>
                  {isEditMode && (
                    <button onClick={addPriority} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Priority
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {crossBUPriorities.length === 0 && !isEditMode && (
                  <p className="text-slate-500 text-sm italic">No priorities</p>
                )}
                {crossBUPriorities.sort((a, b) => a.priority - b.priority).map((priority) => (
                  <div key={priority.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input type="number" value={priority.priority} onChange={(e) => updatePriority(priority.id, 'priority', parseInt(e.target.value))} className="w-16 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="P#" />
                          <input type="text" value={priority.title} onChange={(e) => updatePriority(priority.id, 'title', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Priority title" />
                          <button onClick={() => removePriority(priority.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea value={priority.description} onChange={(e) => updatePriority(priority.id, 'description', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Description" rows={2} />
                        <div className="flex gap-2">
                          <select value={priority.status} onChange={(e) => updatePriority(priority.id, 'status', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="complete">Complete</option>
                          </select>
                          <input type="text" value={priority.owner} onChange={(e) => updatePriority(priority.id, 'owner', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm" placeholder="Owner" />
                          <input type="date" value={priority.targetDate} onChange={(e) => updatePriority(priority.id, 'targetDate', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--brand-primary)' }}>
                            {priority.priority}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-roobert-semibold text-white mb-1">{priority.title}</h4>
                            <p className="text-sm text-slate-400 font-roobert-light">{priority.description}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            priority.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                            priority.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {priority.status.toUpperCase().replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Owner: <span className="text-slate-400">{priority.owner}</span></span>
                          <span>•</span>
                          <span>Target: <span className="text-slate-400">{new Date(priority.targetDate).toLocaleDateString()}</span></span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cross-BU Risks Section */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/40 overflow-hidden">
              <div 
                className="px-5 py-3"
                style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-roobert-bold text-white">Cross-BU Risks</h3>
                      <p className="text-sm text-white/80 font-roobert-light">Key risks and mitigation strategies</p>
                    </div>
                  </div>
                  {isEditMode && (
                    <button onClick={addRisk} className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-xs flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Risk
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                {crossBURisks.length === 0 && !isEditMode && (
                  <p className="text-slate-500 text-sm italic">No risks</p>
                )}
                {crossBURisks.map((risk) => (
                  <div key={risk.id} className="bg-slate-900/50 rounded-lg border border-slate-700/40 p-4">
                    {isEditMode ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input type="text" value={risk.title} onChange={(e) => updateRisk(risk.id, 'title', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Risk title" />
                          <button onClick={() => removeRisk(risk.id)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea value={risk.description} onChange={(e) => updateRisk(risk.id, 'description', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Description" rows={2} />
                        <textarea value={risk.mitigation} onChange={(e) => updateRisk(risk.id, 'mitigation', e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Mitigation strategy" rows={2} />
                        <div className="flex gap-2">
                          <select value={risk.impact} onChange={(e) => updateRisk(risk.id, 'impact', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="high">High Impact</option>
                            <option value="medium">Medium Impact</option>
                            <option value="low">Low Impact</option>
                          </select>
                          <select value={risk.likelihood} onChange={(e) => updateRisk(risk.id, 'likelihood', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="high">High Likelihood</option>
                            <option value="medium">Medium Likelihood</option>
                            <option value="low">Low Likelihood</option>
                          </select>
                          <select value={risk.status} onChange={(e) => updateRisk(risk.id, 'status', e.target.value)} className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                            <option value="open">Open</option>
                            <option value="monitoring">Monitoring</option>
                            <option value="mitigated">Mitigated</option>
                            <option value="closed">Closed</option>
                          </select>
                          <input type="text" value={risk.owner} onChange={(e) => updateRisk(risk.id, 'owner', e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm" placeholder="Owner" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="text-base font-roobert-semibold text-white flex-1">{risk.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            risk.status === 'mitigated' ? 'bg-green-500/20 text-green-400' :
                            risk.status === 'monitoring' ? 'bg-yellow-500/20 text-yellow-400' :
                            risk.status === 'closed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {risk.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 font-roobert-light mb-3">{risk.description}</p>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Impact:</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                              risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {risk.impact.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-slate-600">•</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Likelihood:</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              risk.likelihood === 'high' ? 'bg-red-500/20 text-red-400' :
                              risk.likelihood === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {risk.likelihood.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
                          <h5 className="text-xs font-roobert-bold text-emerald-400 uppercase tracking-wide mb-1">Mitigation Strategy</h5>
                          <p className="text-sm text-slate-300 font-roobert-light">{risk.mitigation}</p>
                        </div>
                        <div className="text-xs text-slate-500">
                          Owner: <span className="text-slate-400">{risk.owner}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
