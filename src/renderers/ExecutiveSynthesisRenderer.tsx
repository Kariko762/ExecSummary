import React from 'react';
import { Briefcase, AlertTriangle, Lightbulb, Target, Hand } from 'lucide-react';

// Note: Frontend version - isEditMode always false, no onChange support

interface Ask {
  type: 'budget' | 'decision' | 'resource' | 'approval' | 'escalation';
  item: string;
  urgency?: 'low' | 'medium' | 'high';
  owner?: string;
  deadline?: string;
}

interface ExecutiveSynthesisData {
  context?: string;
  problem?: string;
  solution?: string;
  recommendation?: string;
  asks?: Ask[];
}

interface ExecutiveSynthesisRendererProps {
  data?: ExecutiveSynthesisData;
  isEditMode?: boolean;
}

export const ExecutiveSynthesisRenderer: React.FC<ExecutiveSynthesisRendererProps> = ({ 
  data,
  isEditMode = false 
}) => {
  // Handle undefined data
  if (!data) {
    return null;
  }

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

  if (!data.context && !data.problem && !data.solution && !data.recommendation && !data.asks?.length) {
    if (isEditMode) {
      return (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
          <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-roobert-medium">Executive Synthesis not configured</p>
          <p className="text-xs mt-1">Add Context, Problem, Solution, Recommendation, and Asks in the properties panel</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        className="px-6 py-4 rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-roobert-bold text-white">Executive Synthesis</h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* 1. Context */}
        {data.context && (
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-tertiary)' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--brand-tertiary)' }}
                >
                  1
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4" style={{ color: 'var(--brand-tertiary)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--brand-tertiary)' }}>
                    Context
                  </h4>
                </div>
                <p className="text-base text-gray-700 leading-relaxed font-roobert-regular">
                  {data.context}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Problem */}
        {data.problem && (
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red, #ef4444)' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--accent-red, #ef4444)' }}
                >
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--accent-red, #ef4444)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-red, #ef4444)' }}>
                    Problem Definition
                  </h4>
                </div>
                <p className="text-base text-gray-700 leading-relaxed font-roobert-regular">
                  {data.problem}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Solution */}
        {data.solution && (
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white"
                  style={{ background: 'var(--accent-blue)' }}
                >
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
                  <h4 className="text-sm font-roobert-bold uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
                    Solution
                  </h4>
                </div>
                <p className="text-base text-gray-700 leading-relaxed font-roobert-regular">
                  {data.solution}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Recommendation */}
        {data.recommendation && (
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white"
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
                <p className="text-base text-gray-700 leading-relaxed font-roobert-semibold">
                  {data.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Asks */}
        {data.asks && data.asks.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-secondary)' }}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-roobert-bold text-white"
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
                <div className="space-y-3">
                  {data.asks.map((ask, idx) => (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveSynthesisRenderer;
