import React, { useState } from 'react';
import { Briefcase, AlertTriangle, Lightbulb, Target, Hand, Sparkles } from 'lucide-react';
import AiPromptModal from '../components/AiPromptModal';
import { renderWithExpressions } from '../../../src/utils/expressionParser';

interface Ask {
  type: 'budget' | 'decision' | 'resource' | 'approval' | 'escalation';
  item: string;
  urgency?: 'low' | 'medium' | 'high';
  owner?: string;
  deadline?: string;
}

interface ExecutiveSummaryBLUFData {
  bottomLine?: string;
  background?: string;
  assessment?: string;
  recommendation?: string;
  asks?: Ask[];
}

interface ExecutiveSummaryBLUFProps {
  data: ExecutiveSummaryBLUFData;
  isEditMode?: boolean;
  onChange?: (newData: ExecutiveSummaryBLUFData) => void;
}

export const ExecutiveSummaryBLUF: React.FC<ExecutiveSummaryBLUFProps> = ({ 
  data,
  isEditMode = false,
  onChange
}) => {
  const [showAiModal, setShowAiModal] = useState(false);
  
  const updateField = (field: keyof ExecutiveSummaryBLUFData, value: any) => {
    if (onChange) {
      onChange({ ...data, [field]: value });
    }
  };

  const updateAsk = (index: number, updatedAsk: Ask) => {
    if (onChange && data.asks) {
      const newAsks = [...data.asks];
      newAsks[index] = updatedAsk;
      onChange({ ...data, asks: newAsks });
    }
  };

  const addAsk = () => {
    if (onChange) {
      const newAsk: Ask = {
        type: 'decision',
        item: '',
        urgency: 'medium'
      };
      onChange({ ...data, asks: [...(data.asks || []), newAsk] });
    }
  };

  const removeAsk = (index: number) => {
    if (onChange && data.asks) {
      const newAsks = data.asks.filter((_, i) => i !== index);
      onChange({ ...data, asks: newAsks });
    }
  };

  const handleAiDataApply = (aiData: ExecutiveSummaryBLUFData) => {
    if (onChange) {
      // Merge AI data with existing data
      onChange({
        bottomLine: aiData.bottomLine || data.bottomLine,
        background: aiData.background || data.background,
        assessment: aiData.assessment || data.assessment,
        recommendation: aiData.recommendation || data.recommendation,
        asks: aiData.asks || data.asks
      });
    }
  };
  
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'var(--accent-red, #ef4444)';
      case 'medium': return 'var(--accent-orange)';
      case 'low': return 'var(--accent-green)';
      default: return 'var(--brand-primary)';
    }
  };

  const getUrgencyBg = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'rgba(239, 68, 68, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'low': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(67, 28, 91, 0.1)';
    }
  };

  if (!data.bottomLine && !data.background && !data.assessment && !data.recommendation && !data.asks?.length) {
    if (isEditMode) {
      return (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
          <Briefcase className="w-7 h-7 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-roobert-medium">Executive Summary (BLUF) not configured</p>
          <p className="text-xs mt-1">Add Bottom Line, Background, Assessment, and Recommendation in the properties panel</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div 
        className="px-4 py-2.5 rounded-lg"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base font-roobert-bold text-white">Executive Summary (BLUF)</h3>
          </div>
          
          {isEditMode && onChange && (
            <button
              onClick={() => setShowAiModal(true)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all flex items-center gap-1.5 group"
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-roobert-bold text-white">AI Assist</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. Bottom Line */}
        {(isEditMode || data.bottomLine) && (
          <div className="bg-white rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red, #ef4444)' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--accent-red, #ef4444)' }}
                >
                  1
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: 'var(--accent-red, #ef4444)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-red, #ef4444)' }}>
                    Bottom Line Up Front
                  </h4>
                </div>
                {isEditMode ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-roobert-regular text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                    placeholder="The key message or decision needed - stated clearly upfront..."
                    value={data.bottomLine || ''}
                    onChange={(e) => updateField('bottomLine', e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed font-roobert-semibold whitespace-pre-wrap">
                    {renderWithExpressions(data.bottomLine || '')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Background */}
        {(isEditMode || data.background) && (
          <div className="bg-white rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-tertiary)' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--brand-tertiary)' }}
                >
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4" style={{ color: 'var(--brand-tertiary)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-tertiary)' }}>
                    Background
                  </h4>
                </div>
                {isEditMode ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-roobert-regular text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                    placeholder="Supporting context and history leading to this situation..."
                    value={data.background || ''}
                    onChange={(e) => updateField('background', e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed font-roobert-regular whitespace-pre-wrap">
                    {renderWithExpressions(data.background || '')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Assessment */}
        {(isEditMode || data.assessment) && (
          <div className="bg-white rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--accent-blue)' }}
                >
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                    Assessment
                  </h4>
                </div>
                {isEditMode ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-roobert-regular text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Analysis and evaluation of the situation..."
                    value={data.assessment || ''}
                    onChange={(e) => updateField('assessment', e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed font-roobert-regular whitespace-pre-wrap">
                    {renderWithExpressions(data.assessment || '')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. Recommendation */}
        {(isEditMode || data.recommendation) && (
          <div className="bg-white rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  4
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4" style={{ color: 'var(--brand-primary)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-primary)' }}>
                    Recommendation
                  </h4>
                </div>
                {isEditMode ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-roobert-regular text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                    placeholder="What should happen next? Strategic guidance, leadership decision needed..."
                    value={data.recommendation || ''}
                    onChange={(e) => updateField('recommendation', e.target.value)}
                  />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed font-roobert-semibold whitespace-pre-wrap">
                    {renderWithExpressions(data.recommendation || '')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. Asks */}
        {(isEditMode || (data.asks && data.asks.length > 0)) && (
          <div className="bg-white rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-secondary)' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--brand-secondary)' }}
                >
                  5
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Hand className="w-4 h-4" style={{ color: 'var(--brand-secondary)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-secondary)' }}>
                    Asks
                  </h4>
                </div>
                
                {isEditMode ? (
                  <div className="space-y-3">
                    {(data.asks || []).map((ask, idx) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex gap-2">
                          <select
                            className="px-2 py-1 border border-gray-300 rounded text-xs font-roobert-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                            value={ask.type || 'decision'}
                            onChange={(e) => updateAsk(idx, { ...ask, type: e.target.value as Ask['type'] })}
                          >
                            <option value="budget">Budget</option>
                            <option value="decision">Decision</option>
                            <option value="resource">Resource</option>
                            <option value="approval">Approval</option>
                          </select>
                          
                          <select
                            className="px-2 py-1 border border-gray-300 rounded text-xs font-roobert-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
                            value={ask.urgency || 'medium'}
                            onChange={(e) => updateAsk(idx, { ...ask, urgency: e.target.value as Ask['urgency'] })}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          
                          <button
                            onClick={() => removeAsk(idx)}
                            className="ml-auto px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded font-roobert-medium"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-roobert-regular focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="What do you need? Be specific..."
                          value={ask.item || ''}
                          onChange={(e) => updateAsk(idx, { ...ask, item: e.target.value })}
                        />
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm font-roobert-regular focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Owner (optional)"
                            value={ask.owner || ''}
                            onChange={(e) => updateAsk(idx, { ...ask, owner: e.target.value })}
                          />
                          <input
                            type="text"
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm font-roobert-regular focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Deadline (optional)"
                            value={ask.deadline || ''}
                            onChange={(e) => updateAsk(idx, { ...ask, deadline: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={addAsk}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-roobert-medium text-gray-600 hover:border-pink-500 hover:text-pink-500 transition-colors"
                    >
                      + Add Ask
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(data.asks || []).map((ask, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: getUrgencyBg(ask.urgency) }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="px-2 py-0.5 rounded text-xs font-roobert-bold uppercase"
                              style={{ 
                                backgroundColor: getUrgencyBg(ask.urgency),
                                color: getUrgencyColor(ask.urgency),
                                border: `1px solid ${getUrgencyColor(ask.urgency)}`
                              }}
                            >
                              {ask.type}
                            </span>
                            {ask.urgency && (
                              <span 
                                className="px-2 py-0.5 rounded text-xs font-roobert-semibold"
                                style={{ 
                                  backgroundColor: getUrgencyColor(ask.urgency),
                                  color: 'white'
                                }}
                              >
                                {ask.urgency.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 font-roobert-medium mb-1">
                            {ask.item}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {ask.owner && (
                              <span className="font-roobert-regular">
                                👤 {ask.owner}
                              </span>
                            )}
                            {ask.deadline && (
                              <span className="font-roobert-regular">
                                📅 {ask.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Prompt Modal */}
      <AiPromptModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        promptType="bluf"
        userData={data}
        componentName="Executive Summary (BLUF)"
        onApplyData={handleAiDataApply}
      />
    </div>
  );
};

export default ExecutiveSummaryBLUF;
