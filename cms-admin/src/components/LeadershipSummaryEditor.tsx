import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertCircle, TrendingUp, AlertTriangle, Plus, Trash2, Save, X, Flag } from 'lucide-react';

interface Ask {
  type: 'approval' | 'decision';
  item: string;
  urgency: 'high' | 'medium' | 'low';
  owner: string;
  deadline: string;
}

interface Priority {
  id: number;
  title: string;
  description: string;
  status: string;
  impact: string;
  borderColor: string;
  statusColor: string;
  impactColor: string;
  owner?: string;
  dueDate?: string;
  details: {
    impact: string;
    likelihood: string;
    actionItems: string[];
  };
}

interface Risk {
  type: string;
  title: string;
  description: string;
  severity: string;
  probability: string;
  impact: string;
  status: string;
  mitigation: string;
  owner: string;
}

interface LeadershipData {
  meta: any;
  metadata: {
    weekStart: string;
    weekEnd: string;
    title: string;
    description: string;
  };
  bluf: {
    bottomLine: string;
    background: string;
    assessment: string;
    recommendation: string;
    asks: Ask[];
  };
  priorities: Priority[];
  risks: Risk[];
}

interface LeadershipSummaryEditorProps {
  data: LeadershipData;
  onSave: (data: LeadershipData) => void;
  onCancel: () => void;
}

type TabType = 'bluf' | 'priorities' | 'risks';

export default function LeadershipSummaryEditor({ data, onSave, onCancel }: LeadershipSummaryEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bluf');
  const [editedData, setEditedData] = useState<LeadershipData>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(editedData);
    setIsSaving(false);
  };

  const handlePublishToggle = () => {
    setEditedData({ ...editedData, _published: !editedData._published } as any);
    setShowPublishModal(false);
  };

  // BLUF handlers
  const updateBlufField = (field: keyof typeof editedData.bluf, value: string) => {
    setEditedData({
      ...editedData,
      bluf: { ...editedData.bluf, [field]: value }
    });
  };

  const addAsk = () => {
    setEditedData({
      ...editedData,
      bluf: {
        ...editedData.bluf,
        asks: [...editedData.bluf.asks, {
          type: 'approval',
          item: '',
          urgency: 'medium',
          owner: '',
          deadline: ''
        }]
      }
    });
  };

  const updateAsk = (index: number, field: keyof Ask, value: string) => {
    const newAsks = [...editedData.bluf.asks];
    newAsks[index] = { ...newAsks[index], [field]: value };
    setEditedData({
      ...editedData,
      bluf: { ...editedData.bluf, asks: newAsks }
    });
  };

  const removeAsk = (index: number) => {
    setEditedData({
      ...editedData,
      bluf: {
        ...editedData.bluf,
        asks: editedData.bluf.asks.filter((_, i) => i !== index)
      }
    });
  };

  // Priority handlers
  const addPriority = () => {
    const newId = Math.max(...editedData.priorities.map(p => p.id), 0) + 1;
    setEditedData({
      ...editedData,
      priorities: [...editedData.priorities, {
        id: newId,
        title: '',
        description: '',
        status: 'In Progress',
        impact: 'High Impact',
        borderColor: 'var(--accent-blue)',
        statusColor: 'blue',
        impactColor: 'purple',
        details: {
          impact: '',
          likelihood: '',
          actionItems: []
        }
      }]
    });
  };

  const updatePriority = (index: number, field: keyof Priority, value: any) => {
    const newPriorities = [...editedData.priorities];
    newPriorities[index] = { ...newPriorities[index], [field]: value };
    setEditedData({
      ...editedData,
      priorities: newPriorities
    });
  };

  const removePriority = (index: number) => {
    setEditedData({
      ...editedData,
      priorities: editedData.priorities.filter((_, i) => i !== index)
    });
  };

  const addActionItem = (priorityIndex: number) => {
    const newPriorities = [...editedData.priorities];
    newPriorities[priorityIndex].details.actionItems.push('');
    setEditedData({
      ...editedData,
      priorities: newPriorities
    });
  };

  const updateActionItem = (priorityIndex: number, itemIndex: number, value: string) => {
    const newPriorities = [...editedData.priorities];
    newPriorities[priorityIndex].details.actionItems[itemIndex] = value;
    setEditedData({
      ...editedData,
      priorities: newPriorities
    });
  };

  const removeActionItem = (priorityIndex: number, itemIndex: number) => {
    const newPriorities = [...editedData.priorities];
    newPriorities[priorityIndex].details.actionItems = 
      newPriorities[priorityIndex].details.actionItems.filter((_, i) => i !== itemIndex);
    setEditedData({
      ...editedData,
      priorities: newPriorities
    });
  };

  // Risk handlers
  const addRisk = () => {
    setEditedData({
      ...editedData,
      risks: [...editedData.risks, {
        type: 'medium-impact',
        title: '',
        description: '',
        severity: 'Medium',
        probability: 'Medium',
        status: 'Open',
        mitigation: '',
        owner: ''
      }]
    });
  };

  const updateRisk = (index: number, field: keyof Risk, value: string) => {
    const newRisks = [...editedData.risks];
    newRisks[index] = { ...newRisks[index], [field]: value };
    setEditedData({
      ...editedData,
      risks: newRisks
    });
  };

  const removeRisk = (index: number) => {
    setEditedData({
      ...editedData,
      risks: editedData.risks.filter((_, i) => i !== index)
    });
  };

  const tabs = [
    { id: 'bluf' as TabType, label: 'Executive Summary (BLUF)', icon: Target, color: 'from-fis-eggplant to-fis-raspberry' },
    { id: 'priorities' as TabType, label: 'Prioritization', icon: TrendingUp, color: 'from-blue-600 to-purple-600' },
    { id: 'risks' as TabType, label: 'Risks', icon: AlertTriangle, color: 'from-red-600 to-orange-600' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-roobert-bold text-white mb-1">
                Edit Leadership Summary
              </h1>
              <p className="text-sm text-gray-400 font-roobert-light">
                {editedData.metadata.title} • {editedData.metadata.weekStart} - {editedData.metadata.weekEnd}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Visibility Toggle */}
              <button
                onClick={() => setShowPublishModal(true)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                  (editedData as any)._published
                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                    : 'bg-white/20 border-white/10 text-white/60 hover:bg-white/30'
                }`}
                title={(editedData as any)._published ? 'Published - Visible on frontend and CMS' : 'Unpublished - Only visible in CMS'}
              >
                {(editedData as any)._published ? (
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
                disabled={isSaving}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Save Changes"
              >
                <Save className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 font-roobert-semibold transition-all ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-300'
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
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* BLUF Tab */}
              {activeTab === 'bluf' && (
                <div className="space-y-6">
                  {/* Bottom Line */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-roobert-bold text-sm">
                        1
                      </div>
                      <h3 className="text-lg font-roobert-bold text-white">Bottom Line Up Front</h3>
                    </div>
                    <textarea
                      value={editedData.bluf.bottomLine}
                      onChange={(e) => updateBlufField('bottomLine', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                      placeholder="Key takeaways (use bullet points with newlines)"
                    />
                  </div>

                  {/* Background */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-roobert-bold text-sm">
                        2
                      </div>
                      <h3 className="text-lg font-roobert-bold text-white">Background</h3>
                    </div>
                    <textarea
                      value={editedData.bluf.background}
                      onChange={(e) => updateBlufField('background', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Context and background information (bullet points)"
                    />
                  </div>

                  {/* Assessment */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-roobert-bold text-sm">
                        3
                      </div>
                      <h3 className="text-lg font-roobert-bold text-white">Assessment</h3>
                    </div>
                    <textarea
                      value={editedData.bluf.assessment}
                      onChange={(e) => updateBlufField('assessment', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      placeholder="Detailed assessment (use **bold** for emphasis)"
                    />
                  </div>

                  {/* Recommendation */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center text-white font-roobert-bold text-sm">
                        4
                      </div>
                      <h3 className="text-lg font-roobert-bold text-white">Recommendation</h3>
                    </div>
                    <textarea
                      value={editedData.bluf.recommendation}
                      onChange={(e) => updateBlufField('recommendation', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      placeholder="Recommendations (bullet points)"
                    />
                  </div>

                  {/* Asks */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-roobert-bold text-sm">
                          5
                        </div>
                        <h3 className="text-lg font-roobert-bold text-white">Asks</h3>
                      </div>
                      <button
                        onClick={addAsk}
                        className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-roobert-medium text-sm transition-all"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Ask
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {editedData.bluf.asks.map((ask, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-roobert-medium text-gray-400 mb-1">Type</label>
                                  <select
                                    value={ask.type}
                                    onChange={(e) => updateAsk(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                  >
                                    <option value="approval" className="bg-gray-900 text-white">Approval</option>
                                    <option value="decision" className="bg-gray-900 text-white">Decision</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-roobert-medium text-gray-400 mb-1">Urgency</label>
                                  <select
                                    value={ask.urgency}
                                    onChange={(e) => updateAsk(index, 'urgency', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                  >
                                    <option value="high" className="bg-gray-900 text-white">High</option>
                                    <option value="medium" className="bg-gray-900 text-white">Medium</option>
                                    <option value="low" className="bg-gray-900 text-white">Low</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-roobert-medium text-gray-400 mb-1">Ask Description</label>
                                <input
                                  type="text"
                                  value={ask.item}
                                  onChange={(e) => updateAsk(index, 'item', e.target.value)}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                  placeholder="What are you asking for?"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-roobert-medium text-gray-400 mb-1">Owner</label>
                                  <input
                                    type="text"
                                    value={ask.owner}
                                    onChange={(e) => updateAsk(index, 'owner', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    placeholder="Who owns this?"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-roobert-medium text-gray-400 mb-1">Deadline</label>
                                  <input
                                    type="text"
                                    value={ask.deadline}
                                    onChange={(e) => updateAsk(index, 'deadline', e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    placeholder="e.g., Feb 5"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeAsk(index)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {editedData.bluf.asks.length === 0 && (
                        <div className="text-center py-8 text-gray-500 font-roobert-light">
                          No asks yet. Click "Add Ask" to create one.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Priorities Tab */}
              {activeTab === 'priorities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-roobert-bold text-white">This Week's Priorities</h2>
                    <button
                      onClick={addPriority}
                      className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-roobert-medium transition-all"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Priority
                    </button>
                  </div>

                  {editedData.priorities.map((priority, index) => (
                    <div key={priority.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-roobert-bold text-sm">
                            #{priority.id}
                          </div>
                          <h3 className="text-lg font-roobert-bold text-white">Priority {priority.id}</h3>
                        </div>
                        <button
                          onClick={() => removePriority(index)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Title</label>
                            <input
                              type="text"
                              value={priority.title}
                              onChange={(e) => updatePriority(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Priority title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Status</label>
                            <select
                              value={priority.status}
                              onChange={(e) => updatePriority(index, 'status', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                              <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                              <option value="Blocked" className="bg-gray-900 text-white">Blocked</option>
                              <option value="Completed" className="bg-gray-900 text-white">Completed</option>
                              <option value="Not Started" className="bg-gray-900 text-white">Not Started</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Description</label>
                          <textarea
                            value={priority.description}
                            onChange={(e) => updatePriority(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="Describe this priority"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Impact Details</label>
                            <input
                              type="text"
                              value={priority.details.impact}
                              onChange={(e) => {
                                const newPriorities = [...editedData.priorities];
                                newPriorities[index].details.impact = e.target.value;
                                setEditedData({ ...editedData, priorities: newPriorities });
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Describe the impact"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Likelihood</label>
                            <input
                              type="text"
                              value={priority.details.likelihood}
                              onChange={(e) => {
                                const newPriorities = [...editedData.priorities];
                                newPriorities[index].details.likelihood = e.target.value;
                                setEditedData({ ...editedData, priorities: newPriorities });
                              }}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Likelihood of success"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Owner</label>
                            <input
                              type="text"
                              value={priority.owner || ''}
                              onChange={(e) => updatePriority(index, 'owner', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="Who owns this priority?"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Due Date</label>
                            <input
                              type="text"
                              value={priority.dueDate || ''}
                              onChange={(e) => updatePriority(index, 'dueDate', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              placeholder="e.g., February, Q1 2026, Immediate"
                            />
                          </div>
                        </div>

                        {/* Action Items */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-roobert-medium text-gray-400">Action Items</label>
                            <button
                              onClick={() => addActionItem(index)}
                              className="px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-roobert-medium transition-all"
                            >
                              <Plus className="w-3 h-3 inline mr-1" />
                              Add Item
                            </button>
                          </div>
                          <div className="space-y-2">
                            {priority.details.actionItems.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => updateActionItem(index, itemIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                  placeholder="Action item"
                                />
                                <button
                                  onClick={() => removeActionItem(index, itemIndex)}
                                  className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {editedData.priorities.length === 0 && (
                    <div className="text-center py-12 text-gray-500 font-roobert-light">
                      No priorities yet. Click "Add Priority" to create one.
                    </div>
                  )}
                </div>
              )}

              {/* Risks Tab */}
              {activeTab === 'risks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-roobert-bold text-white">Risk Registry</h2>
                    <button
                      onClick={addRisk}
                      className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-roobert-medium transition-all"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add Risk
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {editedData.risks.map((risk, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-roobert-bold text-white">Risk {index + 1}</h3>
                          </div>
                          <button
                            onClick={() => removeRisk(index)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Title</label>
                            <input
                              type="text"
                              value={risk.title}
                              onChange={(e) => updateRisk(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              placeholder="Risk title"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Description</label>
                            <textarea
                              value={risk.description}
                              onChange={(e) => updateRisk(index, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                              placeholder="Describe the risk"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Impact</label>
                            <textarea
                              value={risk.impact || ''}
                              onChange={(e) => updateRisk(index, 'impact', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                              placeholder="What is the impact if this risk occurs?"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Severity</label>
                              <select
                                value={risk.severity}
                                onChange={(e) => updateRisk(index, 'severity', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              >
                                <option value="Low" className="bg-gray-900 text-white">Low</option>
                                <option value="Medium" className="bg-gray-900 text-white">Medium</option>
                                <option value="High" className="bg-gray-900 text-white">High</option>
                                <option value="Critical" className="bg-gray-900 text-white">Critical</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Probability</label>
                              <select
                                value={risk.probability}
                                onChange={(e) => updateRisk(index, 'probability', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              >
                                <option value="Low" className="bg-gray-900 text-white">Low</option>
                                <option value="Medium" className="bg-gray-900 text-white">Medium</option>
                                <option value="High" className="bg-gray-900 text-white">High</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Status</label>
                            <select
                              value={risk.status}
                              onChange={(e) => updateRisk(index, 'status', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-900 border border-white/10 rounded-lg text-white font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                              <option value="Open" className="bg-gray-900 text-white">Open</option>
                              <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                              <option value="Mitigated" className="bg-gray-900 text-white">Mitigated</option>
                              <option value="Closed" className="bg-gray-900 text-white">Closed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Mitigation Strategy</label>
                            <textarea
                              value={risk.mitigation}
                              onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                              placeholder="How will this be mitigated?"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-400 mb-2">Owner</label>
                            <input
                              type="text"
                              value={risk.owner}
                              onChange={(e) => updateRisk(index, 'owner', e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 font-roobert-regular focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              placeholder="Who owns this risk?"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editedData.risks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 font-roobert-light">
                      No risks yet. Click "Add Risk" to create one.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Publish/Unpublish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[10001]">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1a] rounded-xl shadow-2xl border border-white/20 p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                (editedData as any)._published ? 'bg-orange-500/20' : 'bg-green-500/20'
              }`}>
                <Flag className={`w-5 h-5 ${
                  (editedData as any)._published ? 'text-orange-400' : 'text-green-400'
                }`} />
              </div>
              <div>
                <h4 className="text-lg font-roobert-semibold text-white">
                  {(editedData as any)._published ? 'Unpublish Leadership Summary?' : 'Publish Leadership Summary?'}
                </h4>
                <p className="text-sm text-white/60 mt-1">
                  {(editedData as any)._published 
                    ? 'This will hide the summary from the frontend. Only CMS users will see it.' 
                    : 'This will make the summary visible on the frontend to all users.'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePublishToggle}
                className={`w-full px-4 py-3 text-white font-roobert-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  (editedData as any)._published 
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-[#4bcd3e] hover:bg-[#3db032]'
                }`}
              >
                <Flag className="w-4 h-4" />
                {(editedData as any)._published ? 'Unpublish' : 'Publish'}
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
      )}
    </div>
  );
}
