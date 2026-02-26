import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Target, TrendingUp, Box, DollarSign, Plus, Trash2, Flag } from 'lucide-react';

interface VendorSummaryEditorProps {
  data: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  showNotification?: (type: 'success' | 'error', message: string) => void;
}

type TabId = 'overview' | 'metrics' | 'features' | 'financial';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Target, color: 'from-fis-eggplant to-fis-raspberry' },
  { id: 'metrics', label: 'Metrics & Index', icon: TrendingUp, color: 'from-blue-600 to-cyan-500' },
  { id: 'features', label: 'Feature Cards', icon: Box, color: 'from-purple-600 to-blue-500' },
  { id: 'financial', label: 'Financial & GTM', icon: DollarSign, color: 'from-green-600 to-emerald-500' }
] as const;

export default function VendorSummaryEditor({ data, onSave, onCancel, showNotification }: VendorSummaryEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [formData, setFormData] = useState(() => {
    console.log('[VendorSummaryEditor] Initial data:', data);
    console.log('[VendorSummaryEditor] Initial _published value:', data._published);
    // Initialize _published to false if undefined
    return {
      ...data,
      _published: data._published ?? false
    };
  });
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Track modal state changes
  useEffect(() => {
    console.log('[VendorSummaryEditor] showPublishModal changed to:', showPublishModal);
  }, [showPublishModal]);

  const handleSave = () => {
    onSave(formData);
  };

  const handlePublishToggle = () => {
    console.log('[VendorSummaryEditor] handlePublishToggle called');
    const newPublishedState = !formData._published;
    console.log('[VendorSummaryEditor] Current state:', formData._published, '→ New state:', newPublishedState);
    setFormData({ ...formData, _published: newPublishedState });
    setShowPublishModal(false);
    showNotification?.(
      'success',
      `Vendor summary ${newPublishedState ? 'published' : 'unpublished'} successfully`
    );
  };

  const updateField = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const updateArrayItem = (path: string[], index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current[index][field] = value;
      return newData;
    });
  };

  const addArrayItem = (path: string[], defaultItem: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.push(defaultItem);
      return newData;
    });
  };

  const removeArrayItem = (path: string[], index: number) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (const key of path) {
        current = current[key];
      }
      current.splice(index, 1);
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {console.log('[VendorSummaryEditor] 🔄 COMPONENT RENDERING - showPublishModal:', showPublishModal)}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-2xl font-roobert-bold text-white">Edit Vendor Summary</h2>
          <div className="flex items-center gap-3">
            {/* Visibility Toggle */}
            <button
              onClick={() => {
                console.log('[VendorSummaryEditor] Publish button clicked');
                console.log('[VendorSummaryEditor] Current formData._published:', formData._published);
                console.log('[VendorSummaryEditor] Setting showPublishModal to true');
                setShowPublishModal(true);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                formData._published
                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                  : 'bg-white/20 border-white/10 text-white/60 hover:bg-white/30'
              }`}
              title={formData._published ? 'Published - Visible on frontend and CMS' : 'Unpublished - Only visible in CMS'}
            >
              {formData._published ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-roobert-medium">Published</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="font-roobert-medium">Draft</span>
                </>
              )}
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Save Changes"
            >
              <Save className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`relative px-6 py-3 rounded-t-lg font-roobert-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.color}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab formData={formData} updateField={updateField} />}
              {activeTab === 'metrics' && (
                <MetricsTab
                  formData={formData}
                  updateField={updateField}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              )}
              {activeTab === 'features' && (
                <FeaturesTab
                  formData={formData}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              )}
              {activeTab === 'financial' && (
                <FinancialTab
                  formData={formData}
                  updateField={updateField}
                  updateArrayItem={updateArrayItem}
                  addArrayItem={addArrayItem}
                  removeArrayItem={removeArrayItem}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Publish/Unpublish Confirmation Modal */}
      {console.log('[VendorSummaryEditor] Rendering modal check - showPublishModal:', showPublishModal)}
      <AnimatePresence>
        {showPublishModal && (() => {
          console.log('[VendorSummaryEditor] 🔴 MODAL IS RENDERING');
          return (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10001]"
              onClick={(e) => {
                console.log('[VendorSummaryEditor] Modal overlay clicked');
                if (e.target === e.currentTarget) {
                  console.log('[VendorSummaryEditor] Closing modal (clicked outside)');
                  setShowPublishModal(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1a] rounded-xl shadow-2xl border border-white/20 p-6 max-w-md w-full mx-4"
                onClick={(e) => {
                  console.log('[VendorSummaryEditor] Modal content clicked (preventing close)');
                  e.stopPropagation();
                }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    formData._published ? 'bg-orange-500/20' : 'bg-green-500/20'
                  }`}>
                    <Flag className={`w-5 h-5 ${
                      formData._published ? 'text-orange-400' : 'text-green-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-roobert-semibold text-white">
                      {formData._published ? 'Unpublish Vendor Summary?' : 'Publish Vendor Summary?'}
                    </h4>
                    <p className="text-sm text-white/60 mt-1">
                      {formData._published 
                        ? 'This will hide the vendor summary from the frontend. Only CMS users will see it.' 
                        : 'This will make the vendor summary visible on the frontend to all users.'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePublishToggle}
                    className={`w-full px-4 py-3 text-white font-roobert-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      formData._published 
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-[#4bcd3e] hover:bg-[#3db032]'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {formData._published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-roobert-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ formData, updateField }: any) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-roobert-bold text-sm">
            1
          </div>
          <h3 className="text-lg font-roobert-bold text-white">Vendor Metadata</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Vendor Name</label>
            <input
              type="text"
              value={formData.metadata.vendorName}
              onChange={(e) => updateField(['metadata', 'vendorName'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fis-raspberry"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Title</label>
            <input
              type="text"
              value={formData.metadata.title}
              onChange={(e) => updateField(['metadata', 'title'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fis-raspberry"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Period</label>
            <input
              type="text"
              value={formData.metadata.period}
              onChange={(e) => updateField(['metadata', 'period'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fis-raspberry"
              placeholder="Q1 2026"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-roobert-bold text-sm">
            2
          </div>
          <h3 className="text-lg font-roobert-bold text-white">Executive Summary</h3>
        </div>
        
        <textarea
          value={formData.executiveSummary}
          onChange={(e) => updateField(['executiveSummary'], e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-fis-raspberry resize-none"
          placeholder="Brief executive summary of the vendor..."
        />
      </div>
    </div>
  );
}

// Metrics Tab Component
function MetricsTab({ formData, updateField, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero Metrics */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-roobert-bold text-white">Hero Metrics</h3>
          <button
            onClick={() => addArrayItem(['heroMetrics'], { id: `metric-${Date.now()}`, icon: 'sparkles', value: '0', label: 'New Metric', iconColor: 'text-cyan-400' })}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-roobert-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Metric
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {formData.heroMetrics.map((metric: any, idx: number) => (
            <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 relative group">
              <button
                onClick={() => removeArrayItem(['heroMetrics'], idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-roobert-medium text-white/70 mb-1">Icon</label>
                  <select
                    value={metric.icon}
                    onChange={(e) => updateArrayItem(['heroMetrics'], idx, 'icon', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 text-white text-sm rounded border border-white/10 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="sparkles" className="bg-gray-900 text-white">Sparkles</option>
                    <option value="check" className="bg-gray-900 text-white">Check</option>
                    <option value="clock" className="bg-gray-900 text-white">Clock</option>
                    <option value="zap" className="bg-gray-900 text-white">Zap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-roobert-medium text-white/70 mb-1">Value</label>
                  <input
                    type="text"
                    value={metric.value}
                    onChange={(e) => updateArrayItem(['heroMetrics'], idx, 'value', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-roobert-medium text-white/70 mb-1">Label</label>
                  <input
                    type="text"
                    value={metric.label}
                    onChange={(e) => updateArrayItem(['heroMetrics'], idx, 'label', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storytelling Index */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-roobert-bold text-white mb-4">Storytelling Index</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Overall Score</label>
            <input
              type="number"
              value={formData.storytellingIndex.overallScore}
              onChange={(e) => updateField(['storytellingIndex', 'overallScore'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Max Score</label>
            <input
              type="number"
              value={formData.storytellingIndex.maxScore}
              onChange={(e) => updateField(['storytellingIndex', 'maxScore'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Title</label>
            <input
              type="text"
              value={formData.storytellingIndex.title}
              onChange={(e) => updateField(['storytellingIndex', 'title'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Subtitle</label>
            <textarea
              value={formData.storytellingIndex.subtitle}
              onChange={(e) => updateField(['storytellingIndex', 'subtitle'], e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {formData.storytellingIndex.segments.map((segment: any, idx: number) => (
            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <label className="block text-xs font-roobert-medium text-white/70 mb-1">{segment.name}</label>
              <input
                type="number"
                value={segment.score}
                onChange={(e) => updateArrayItem(['storytellingIndex', 'segments'], idx, 'score', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Features Tab Component
function FeaturesTab({ formData, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-roobert-bold text-white">Feature Cards</h3>
        <button
          onClick={() => addArrayItem(['featureCards'], { title: 'New Feature', icon: 'workflow', color: 'cyan', features: [] })}
          className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-roobert-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {formData.featureCards.map((card: any, idx: number) => (
          <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10 relative group">
            <button
              onClick={() => removeArrayItem(['featureCards'], idx)}
              className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-roobert-medium text-white/70 mb-2">Title</label>
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateArrayItem(['featureCards'], idx, 'title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-white/70 mb-2">Color</label>
                <select
                  value={card.color}
                  onChange={(e) => updateArrayItem(['featureCards'], idx, 'color', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-white/10"
                >
                  <option value="cyan" className="bg-gray-900 text-white">Cyan</option>
                  <option value="blue" className="bg-gray-900 text-white">Blue</option>
                  <option value="purple" className="bg-gray-900 text-white">Purple</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-roobert-medium text-white/70 mb-2">Features (one per line)</label>
              <textarea
                value={card.features.join('\n')}
                onChange={(e) => updateArrayItem(['featureCards'], idx, 'features', e.target.value.split('\n').filter((f: string) => f.trim()))}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none font-mono text-sm"
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Financial Tab Component
function FinancialTab({ formData, updateField, updateArrayItem, addArrayItem, removeArrayItem }: any) {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Spend Breakdown */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-roobert-bold text-white mb-4">Spend Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Total (£)</label>
            <input
              type="number"
              value={formData.spendBreakdown.total}
              onChange={(e) => updateField(['spendBreakdown', 'total'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Usage API (£)</label>
            <input
              type="number"
              value={formData.spendBreakdown.usageAPI}
              onChange={(e) => updateField(['spendBreakdown', 'usageAPI'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Self-Hosted (£)</label>
            <input
              type="number"
              value={formData.spendBreakdown.selfHosted}
              onChange={(e) => updateField(['spendBreakdown', 'selfHosted'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">PII-Secure (£)</label>
            <input
              type="number"
              value={formData.spendBreakdown.piiSecure}
              onChange={(e) => updateField(['spendBreakdown', 'piiSecure'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* License Efficiency */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-roobert-bold text-white mb-4">License Efficiency</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Total Licenses</label>
            <input
              type="number"
              value={formData.licenseEfficiency.total}
              onChange={(e) => updateField(['licenseEfficiency', 'total'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Optimization %</label>
            <input
              type="number"
              value={formData.licenseEfficiency.optimizationPercent}
              onChange={(e) => updateField(['licenseEfficiency', 'optimizationPercent'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Optimization Label</label>
            <input
              type="text"
              value={formData.licenseEfficiency.optimizationLabel}
              onChange={(e) => updateField(['licenseEfficiency', 'optimizationLabel'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Pipeline Impact */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-roobert-bold text-white mb-4">Pipeline & Revenue Impact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">New Calls (£)</label>
            <input
              type="number"
              value={formData.pipelineImpact.newCalls}
              onChange={(e) => updateField(['pipelineImpact', 'newCalls'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Closed Won (£)</label>
            <input
              type="number"
              value={formData.pipelineImpact.closedWon}
              onChange={(e) => updateField(['pipelineImpact', 'closedWon'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Win Rate %</label>
            <input
              type="number"
              step="0.1"
              value={formData.pipelineImpact.winRate}
              onChange={(e) => updateField(['pipelineImpact', 'winRate'], parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Note</label>
            <textarea
              value={formData.pipelineImpact.note}
              onChange={(e) => updateField(['pipelineImpact', 'note'], e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* GTM Score */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-roobert-bold text-white mb-4">GTM Score</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Score</label>
            <input
              type="number"
              value={formData.gtmScore.score}
              onChange={(e) => updateField(['gtmScore', 'score'], parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Label</label>
            <input
              type="text"
              value={formData.gtmScore.label}
              onChange={(e) => updateField(['gtmScore', 'label'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-white/70 mb-2">Recommendation</label>
            <input
              type="text"
              value={formData.gtmScore.recommendation}
              onChange={(e) => updateField(['gtmScore', 'recommendation'], e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-roobert-medium text-white/70">Score Details</label>
            <button
              onClick={() => addArrayItem(['gtmScore', 'details'], { label: 'New Detail', sublabel: '', icon: '' })}
              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-xs font-roobert-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          {formData.gtmScore.details.map((detail: any, idx: number) => (
            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10 relative group">
              <button
                onClick={() => removeArrayItem(['gtmScore', 'details'], idx)}
                className="absolute top-2 right-2 p-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={detail.label}
                    onChange={(e) => updateArrayItem(['gtmScore', 'details'], idx, 'label', e.target.value)}
                    placeholder="Label"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={detail.sublabel}
                    onChange={(e) => updateArrayItem(['gtmScore', 'details'], idx, 'sublabel', e.target.value)}
                    placeholder="Sublabel"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
