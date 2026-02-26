import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Rocket, 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Initiative {
  id: string;
  name: string;
  shortName: string;
  category: string;
  owner: string;
  sponsor: string;
  status: string;
  priority: string;
  progress: number;
  projectStage: string;
  linkedGoals: string[];
  startDate: string;
  endDate: string;
  
  smartGoal: {
    statement: string;
    specific?: { objectives: string[] };
    measurable?: { metrics: string[] };
    achievable?: { resources: string; teamSize?: string };
    relevant?: { croAlignment: string[]; strategicThemes?: string[] };
    timeBound?: { 
      milestones?: Array<{ milestone: string; date: string; status: string }>;
      timeline?: Array<{ phase: string; deliverable: string; dueDate: string; status: string }>;
    };
  };
  
  budget?: {
    allocated?: string;
    spent?: string;
    projected?: string;
  };
  
  businessCase?: {
    problem?: string;
    opportunity?: string;
    solution?: string;
    roi?: string;
    paybackPeriod?: string;
    expectedBenefits?: string[];
  };
  
  topRisks?: Array<{ risk: string; level: string; mitigation: string }>;
  stakeholders?: Array<{ name: string; role: string; supportLevel: string }>;
}

interface ViewInitiativeModalCleanProps {
  initiative: Initiative;
  linkedGoals?: any[];
  onClose: () => void;
}

export default function ViewInitiativeModalClean({ initiative, linkedGoals = [], onClose }: ViewInitiativeModalCleanProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'performance' | 'resources' | 'risks' | 'tasks' | 'goals'>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'at-risk': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'blocked': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'on-hold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-white/10 text-white/70 border-white/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300';
      case 'medium': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`bg-gradient-to-br from-[#1a2744] via-[#1e2f4f] to-[#0f172a] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'w-full h-full rounded-none' 
              : modalWidth === 95
                ? 'w-[95vw] h-[90vh] rounded-2xl mx-4'
                : 'w-[75vw] h-[90vh] rounded-2xl mx-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#1a2744] via-[#2a3f5f] to-[#1e2f4f] text-white overflow-hidden border-b border-white/10">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="init-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#init-grid)" />
              </svg>
            </div>

            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-roobert-bold">{initiative.name}</h2>
                      {initiative.shortName && (
                        <span className="px-3 py-1 rounded-full text-xs font-roobert-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                          {initiative.shortName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-roobert-medium capitalize border ${getStatusColor(initiative.status)}`}>
                        {initiative.status.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-roobert-medium capitalize border ${getPriorityColor(initiative.priority)}`}>
                        {initiative.priority} Priority
                      </span>
                      {initiative.projectStage && (
                        <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-white/10 text-white capitalize border border-white/10">
                          {initiative.projectStage}
                        </span>
                      )}
                      {initiative.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-white/10 text-white capitalize border border-white/10">
                          {initiative.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isFullscreen) {
                        setIsFullscreen(false);
                        setModalWidth(75);
                      } else if (modalWidth === 75) {
                        setModalWidth(95);
                      } else {
                        setIsFullscreen(true);
                      }
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {initiative.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-white/60 font-roobert-medium">Overall Progress</span>
                    <span className="font-roobert-bold text-white">{initiative.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${initiative.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-2 border-b border-white/20">
                {['overview', 'milestones', 'performance', 'resources', 'risks', 'tasks', ...(linkedGoals && linkedGoals.length > 0 ? ['goals'] : [])].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 font-roobert-medium text-sm transition-all relative capitalize ${
                      activeTab === tab ? 'text-white' : 'text-white/60 hover:text-white/80'
                    }`}
                  >
                    {tab === 'risks' ? 'Risks & Success' : tab === 'goals' ? `Goals (${linkedGoals.length})` : tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* SMART Goal Statement */}
                  {initiative.smartGoal?.statement && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-roobert-semibold text-white">Mission Statement</h3>
                      </div>
                      <p className="text-white/70 font-roobert-light leading-relaxed">
                        {initiative.smartGoal.statement}
                      </p>
                    </div>
                  )}

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/60 font-roobert-medium uppercase">Leadership</span>
                      </div>
                      <div className="text-white font-roobert-semibold">{initiative.owner}</div>
                      {initiative.sponsor && (
                        <div className="text-sm text-white/60 mt-1">Sponsor: {initiative.sponsor}</div>
                      )}
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-white/60 font-roobert-medium uppercase">Timeline</span>
                      </div>
                      {initiative.startDate && initiative.endDate && (
                        <>
                          <div className="text-white font-roobert-semibold">
                            {new Date(initiative.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-sm text-white/60">
                            to {new Date(initiative.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/60 font-roobert-medium uppercase">Linked Goals</span>
                      </div>
                      <div className="text-white font-roobert-bold text-2xl">
                        {linkedGoals.length}
                      </div>
                      <div className="text-sm text-white/60">Connected goals</div>
                    </div>
                  </div>

                  {/* Linked Goals List */}
                  {linkedGoals.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Linked Strategic Goals</h3>
                      <div className="space-y-2">
                        {linkedGoals.map((goal: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                            <Target className="w-4 h-4 text-purple-400" />
                            <span className="text-white font-roobert-medium">{goal.name || goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Case */}
                  {initiative.businessCase && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-roobert-semibold text-white">Business Impact</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-white/60 mb-1">Expected ROI</div>
                          <div className="text-xl font-roobert-bold text-green-400">{initiative.businessCase.roi}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">Payback Period</div>
                          <div className="text-xl font-roobert-bold text-blue-400">{initiative.businessCase.paybackPeriod}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'smart' && (
                <motion.div
                  key="smart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Specific */}
                  {initiative.smartGoal?.specific?.objectives && initiative.smartGoal.specific.objectives.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Specific Objectives</h3>
                      <ul className="space-y-2">
                        {initiative.smartGoal.specific.objectives.map((obj: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-white/80 font-roobert-light">{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Measurable */}
                  {initiative.smartGoal?.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Key Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initiative.smartGoal.measurable.metrics.map((metric: string, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-1 font-roobert-medium">
                              {metric.split(':')[0]}
                            </div>
                            <div className="text-lg font-roobert-bold text-white">
                              {metric.split(':')[1] || metric}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Achievable */}
                  {initiative.smartGoal?.achievable && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Resources & Team</h3>
                      {initiative.smartGoal.achievable.resources && (
                        <div className="mb-3">
                          <div className="text-sm text-white/60 mb-1">Resources</div>
                          <div className="text-white/80 font-roobert-light">{initiative.smartGoal.achievable.resources}</div>
                        </div>
                      )}
                      {initiative.smartGoal.achievable.teamSize && (
                        <div>
                          <div className="text-sm text-white/60 mb-1">Team Size</div>
                          <div className="text-white/80 font-roobert-light">{initiative.smartGoal.achievable.teamSize}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Relevant */}
                  {initiative.smartGoal?.relevant && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Strategic Alignment</h3>
                      {initiative.smartGoal.relevant.croAlignment && initiative.smartGoal.relevant.croAlignment.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-white/60 mb-2">CRO Alignment</div>
                          <div className="space-y-2">
                            {initiative.smartGoal.relevant.croAlignment.map((item: string, idx: number) => (
                              <div key={idx} className="text-white/80 font-roobert-light">• {item}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {initiative.smartGoal.relevant.strategicThemes && initiative.smartGoal.relevant.strategicThemes.length > 0 && (
                        <div>
                          <div className="text-sm text-white/60 mb-2">Strategic Themes</div>
                          <div className="flex flex-wrap gap-2">
                            {initiative.smartGoal.relevant.strategicThemes.map((theme: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-roobert-medium">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div
                  key="timeline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {initiative.smartGoal?.timeBound?.timeline && initiative.smartGoal.timeBound.timeline.length > 0 ? (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-6">Project Timeline</h3>
                      <div className="space-y-4">
                        {initiative.smartGoal.timeBound.timeline.map((phase: any, idx: number) => (
                          <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                            {/* Connector Line */}
                            {idx < initiative.smartGoal!.timeBound!.timeline!.length - 1 && (
                              <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-white/10" />
                            )}
                            
                            {/* Phase Number Circle */}
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-roobert-bold border-2 ${
                              phase.status === 'completed' ? 'bg-green-500/20 border-green-500 text-green-300' :
                              phase.status === 'in-progress' ? 'bg-blue-500/20 border-blue-500 text-blue-300' :
                              'bg-white/10 border-white/30 text-white/60'
                            }`}>
                              {idx + 1}
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-roobert-semibold text-white">{phase.phase}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-roobert-medium capitalize ${getStatusColor(phase.status)}`}>
                                  {phase.status}
                                </span>
                              </div>
                              <p className="text-white/70 text-sm mb-3 font-roobert-light">{phase.deliverable}</p>
                              {phase.dueDate && (
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                  <Clock className="w-4 h-4" />
                                  Due: {new Date(phase.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No timeline data available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'budget' && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {initiative.budget && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-white/60 font-roobert-medium uppercase">Total Budget</span>
                          </div>
                          <div className="text-2xl font-roobert-bold text-white">
                            {initiative.budget.currency || '$'}{initiative.budget.total.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-orange-400" />
                            <span className="text-sm text-white/60 font-roobert-medium uppercase">Spent</span>
                          </div>
                          <div className="text-2xl font-roobert-bold text-white">
                            {initiative.budget.currency || '$'}{initiative.budget.spent.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-white/60 font-roobert-medium uppercase">Remaining</span>
                          </div>
                          <div className="text-2xl font-roobert-bold text-white">
                            {initiative.budget.currency || '$'}{(initiative.budget.total - initiative.budget.spent).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Budget Progress Bar */}
                      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                        <h3 className="text-lg font-roobert-semibold text-white mb-4">Budget Utilization</h3>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-white/60">Spent vs. Total Budget</span>
                            <span className="font-roobert-bold text-white">
                              {((initiative.budget.spent / initiative.budget.total) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all"
                              style={{ width: `${Math.min((initiative.budget.spent / initiative.budget.total) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'risks' && (
                <motion.div
                  key="risks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {initiative.topRisks && initiative.topRisks.length > 0 ? (
                    <div className="space-y-4">
                      {initiative.topRisks.map((risk: any, idx: number) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${getRiskColor(risk.level)}`}>
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-roobert-semibold text-white">{risk.risk}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-roobert-medium capitalize ${getRiskColor(risk.level)}`}>
                                  {risk.level} Risk
                                </span>
                              </div>
                              {risk.mitigation && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <div className="text-sm text-white/60 mb-1">Mitigation Strategy</div>
                                  <p className="text-white/80 font-roobert-light">{risk.mitigation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No risks identified</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
