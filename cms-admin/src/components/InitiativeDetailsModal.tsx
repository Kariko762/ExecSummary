import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Rocket, 
  TrendingUp, 
  Target, 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Award,
  Briefcase,
  BarChart3,
  FileText,
  Link2,
  Edit2,
  Shield
} from 'lucide-react';

interface Initiative {
  id: string;
  name: string;
  shortName?: string;
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;
  coOwners?: string[];
  sponsor?: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];
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
  startDate: string;
  endDate: string;
  budget?: {
    total?: number;
    allocated?: number;
    spent?: number;
    currency?: string;
    breakdown?: Array<{
      category: string;
      allocated: number;
      spent: number;
    }>;
    fundingSource?: string;
    costAvoidance?: string;
  };
  funding?: {
    requestedAmount?: number;
    approvedAmount?: number;
    approvalDate?: string;
    approvedBy?: string;
    phaseGates?: Array<{
      phase: string;
      amount: number;
      releaseCondition: string;
      status: string;
    }>;
  };
  indicators?: {
    leading?: Array<{
      name: string;
      baseline: string;
      target: string;
      current: string;
      unit: string;
    }>;
    lagging?: Array<{
      name: string;
      baseline: string;
      target: string;
      current: string;
      unit: string;
    }>;
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
  risks?: Array<{
    id: string;
    description: string;
    impact: string;
    probability: string;
    severity: string;
    mitigation: string;
    owner: string;
    status: string;
  }>;
  successCriteria?: Array<{
    metric: string;
    baseline: string;
    target: string;
    measurement: string;
    frequency: string;
  }>;
  stakeholders?: Array<{ name: string; role: string; supportLevel: string }>;
}

interface InitiativeDetailsModalProps {
  initiative: Initiative;
  linkedGoals?: any[];
  onClose: () => void;
  onEdit?: () => void;
}

export default function InitiativeDetailsModal({ initiative, linkedGoals = [], onClose, onEdit }: InitiativeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'performance' | 'budget' | 'resources' | 'risks' | 'tasks' | 'goals'>('overview');

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
      default: return 'bg-white/10 text-white/70 border-white/10';
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-orange-500';
      default: return 'bg-white/20';
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
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0f172a] w-[75vw] h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0f172a] text-white overflow-hidden border-b border-white/10">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="details-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#details-grid)" />
              </svg>
            </div>

            <div className="relative px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-roobert-bold">{initiative.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium border ${getStatusColor(initiative.status)}`}>
                        {initiative.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium border ${getPriorityColor(initiative.priority)}`}>
                        {initiative.priority}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-roobert-medium bg-white/10 text-white/80 border border-white/10 capitalize">
                        {initiative.category}
                      </span>
                      {initiative.projectStage && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-roobert-medium bg-white/10 text-white/80 border border-white/10 capitalize">
                          {initiative.projectStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                      title="Edit Initiative"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60">Overall Progress</span>
                  <span className="font-roobert-bold text-white">{initiative.progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${initiative.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="relative px-6 flex gap-2 border-t border-white/10 bg-black/20">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'milestones', label: 'Milestones', icon: Calendar },
                { id: 'performance', label: 'Performance', icon: BarChart3 },
                { id: 'budget', label: 'Budget & Funding', icon: DollarSign },
                { id: 'resources', label: 'Resources', icon: Users },
                { id: 'risks', label: 'Risks & Success', icon: AlertTriangle },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle },
                ...(linkedGoals && linkedGoals.length > 0 ? [{ id: 'goals', label: `Goals (${linkedGoals.length})`, icon: Target }] : [])
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-roobert-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Initiative Statement - Hero Section */}
                  {initiative.smartGoal?.statement && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-5 border border-blue-500/20">
                      <h3 className="text-sm font-roobert-semibold text-blue-400 mb-2 uppercase tracking-wide">Initiative Statement</h3>
                      <p className="text-white font-roobert-light leading-relaxed">
                        {initiative.smartGoal.statement}
                      </p>
                    </div>
                  )}

                  {/* Business Case - 3 Column Grid */}
                  {initiative.businessCase && (
                    <div>
                      <h3 className="text-sm font-roobert-semibold text-white mb-3">Business Case</h3>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {initiative.businessCase.problem && (
                          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                            <h4 className="text-xs font-roobert-semibold text-red-400 mb-2 uppercase">Problem</h4>
                            <p className="text-white/90 text-sm leading-snug">{initiative.businessCase.problem}</p>
                          </div>
                        )}
                        
                        {initiative.businessCase.opportunity && (
                          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                            <h4 className="text-xs font-roobert-semibold text-blue-400 mb-2 uppercase">Opportunity</h4>
                            <p className="text-white/90 text-sm leading-snug">{initiative.businessCase.opportunity}</p>
                          </div>
                        )}
                        
                        {initiative.businessCase.solution && (
                          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                            <h4 className="text-xs font-roobert-semibold text-green-400 mb-2 uppercase">Solution</h4>
                            <p className="text-white/90 text-sm leading-snug">{initiative.businessCase.solution}</p>
                          </div>
                        )}
                      </div>

                      {/* ROI & Benefits Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* ROI & Payback */}
                        {(initiative.businessCase.roi || initiative.businessCase.paybackPeriod) && (
                          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
                            <h4 className="text-xs font-roobert-semibold text-purple-400 mb-3 uppercase">Financial Impact</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {initiative.businessCase.roi && (
                                <div>
                                  <p className="text-xs text-white/60 mb-1">ROI</p>
                                  <p className="text-sm font-roobert-bold text-white">{initiative.businessCase.roi}</p>
                                </div>
                              )}
                              {initiative.businessCase.paybackPeriod && (
                                <div>
                                  <p className="text-xs text-white/60 mb-1">Payback Period</p>
                                  <p className="text-sm font-roobert-bold text-white">{initiative.businessCase.paybackPeriod}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expected Benefits */}
                        {initiative.businessCase.expectedBenefits && initiative.businessCase.expectedBenefits.length > 0 && (
                          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                            <h4 className="text-xs font-roobert-semibold text-green-400 mb-2 uppercase">Expected Benefits</h4>
                            <ul className="space-y-1.5">
                              {initiative.businessCase.expectedBenefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Team & Leadership */}
                  <div>
                    <h3 className="text-sm font-roobert-semibold text-white mb-3">Team & Leadership</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {initiative.owner && (
                        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-xl p-4 border border-indigo-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <h4 className="text-xs font-roobert-semibold text-indigo-400 uppercase">Owner</h4>
                          </div>
                          <p className="text-white font-roobert-semibold mb-1">{initiative.owner}</p>
                          {initiative.coOwners && initiative.coOwners.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <p className="text-xs text-white/60 mb-1">Co-Owners</p>
                              <p className="text-sm text-white/90">{initiative.coOwners.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {initiative.sponsor && (
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-roobert-semibold text-amber-400 uppercase">Sponsor</h4>
                          </div>
                          <p className="text-white font-roobert-semibold">{initiative.sponsor}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stakeholders */}
                  {initiative.stakeholders && initiative.stakeholders.length > 0 && (
                    <div>
                      <h3 className="text-sm font-roobert-semibold text-white mb-3">Key Stakeholders</h3>
                      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        {initiative.stakeholders.map((stakeholder: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                            <div className="flex-1">
                              <p className="text-sm font-roobert-semibold text-white">{stakeholder.name}</p>
                              <p className="text-xs text-white/60 mt-0.5">{stakeholder.role}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-medium ${
                              stakeholder.supportLevel === 'champion' ? 'bg-green-500/20 text-green-300' :
                              stakeholder.supportLevel === 'supporter' ? 'bg-blue-500/20 text-blue-300' :
                              stakeholder.supportLevel === 'neutral' ? 'bg-white/10 text-white/70' :
                              'bg-orange-500/20 text-orange-300'
                            }`}>
                              {stakeholder.supportLevel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar at Bottom */}
                  {initiative.progress !== undefined && (
                    <div className="bg-gradient-to-r from-white/5 to-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-roobert-semibold text-white">Overall Progress</h3>
                        <span className="text-xl font-roobert-bold text-blue-400">{initiative.progress}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all"
                          style={{ width: `${initiative.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Milestones Tab */}
              {activeTab === 'milestones' && (
                <motion.div
                  key="milestones"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Timeline Milestones */}
                  <div>
                    <h3 className="text-lg font-roobert-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      Milestones
                    </h3>
                    {initiative.smartGoal?.timeBound?.timeline && initiative.smartGoal.timeBound.timeline.length > 0 ? (
                      <div className="space-y-3">
                        {initiative.smartGoal.timeBound.timeline.map((phase: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex-shrink-0">
                              {phase.status === 'complete' || phase.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : phase.status === 'in-progress' ? (
                                <Clock className="w-5 h-5 text-blue-400" />
                              ) : (
                                <Clock className="w-5 h-5 text-white/40" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-roobert-semibold text-white mb-1">{phase.phase}</h4>
                              <p className="text-xs text-white/70 mb-2">{phase.deliverable}</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-white/60 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(phase.dueDate).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-roobert-medium ${getStatusColor(phase.status)}`}>
                                  {phase.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                        <p className="text-white/40">No milestones defined</p>
                      </div>
                    )}
                  </div>

                  {/* Specific Objectives & Measurable Metrics - Side by Side */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Specific Objectives - Left Column */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-400" />
                        Specific Objectives
                      </h3>
                      {initiative.smartGoal?.specific?.objectives && initiative.smartGoal.specific.objectives.length > 0 ? (
                        <div className="space-y-2">
                          {initiative.smartGoal.specific.objectives.map((obj: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <p className="text-white/90 font-roobert-light text-sm">{obj}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                          <p className="text-white/40">No specific objectives defined</p>
                        </div>
                      )}
                    </div>

                    {/* Measurable Metrics - Right Column */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        Measurable Metrics
                      </h3>
                      {initiative.smartGoal?.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 ? (
                        <div className="space-y-2">
                          {initiative.smartGoal.measurable.metrics.map((metric: string, idx: number) => {
                            const parts = metric.split(':');
                            const label = parts[0]?.trim() || `Metric ${idx + 1}`;
                            const value = parts[1]?.trim() || metric;
                            return (
                              <div key={idx} className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                                <BarChart3 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                <p className="text-white/90 font-roobert-light text-sm">{label}: {value}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                          <p className="text-white/40">No measurable metrics defined</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strategic Alignment */}
                  <div>
                    <h3 className="text-lg font-roobert-semibold text-white mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400" />
                      Strategic Alignment
                    </h3>
                    {initiative.smartGoal?.relevant ? (
                      <div className="space-y-3">
                        {initiative.smartGoal.relevant.croAlignment && initiative.smartGoal.relevant.croAlignment.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-2">CRO Alignment</div>
                            <div className="space-y-1">
                              {initiative.smartGoal.relevant.croAlignment.map((item: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-blue-400" />
                                  <span className="text-white/90 font-roobert-light text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {initiative.smartGoal.relevant.strategicThemes && initiative.smartGoal.relevant.strategicThemes.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-sm text-white/60 mb-2">Strategic Themes</div>
                            <div className="flex flex-wrap gap-2">
                              {initiative.smartGoal.relevant.strategicThemes.map((theme: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {theme}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                        <p className="text-white/40">No strategic alignment defined</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Leading Indicators */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Leading Indicators
                      </h3>
                      {initiative.indicators?.leading && initiative.indicators.leading.length > 0 ? (
                        <div className="space-y-4">
                          {initiative.indicators.leading.map((indicator: any, idx: number) => {
                            const baselineNum = parseFloat(indicator.baseline);
                            const targetNum = parseFloat(indicator.target);
                            const currentNum = parseFloat(indicator.current);
                            const progress = targetNum !== baselineNum ? ((currentNum - baselineNum) / (targetNum - baselineNum)) * 100 : 0;
                            const clampedProgress = Math.max(0, Math.min(100, progress));
                            
                            return (
                              <div key={idx} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 overflow-hidden">
                                <div className="bg-green-500/10 px-5 py-3 border-b border-green-500/20">
                                  <h4 className="text-white font-roobert-semibold">{indicator.name}</h4>
                                </div>
                                <div className="p-5">
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Baseline</div>
                                      <div className="text-lg font-roobert-bold text-white">{indicator.baseline}</div>
                                      <div className="text-xs text-white/50 mt-0.5">{indicator.unit}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-green-400 mb-1 font-roobert-medium uppercase">Current</div>
                                      <div className="text-lg font-roobert-bold text-green-400">{indicator.current}</div>
                                      <div className="text-xs text-green-400/60 mt-0.5">{indicator.unit}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-blue-400 mb-1 font-roobert-medium uppercase">Target</div>
                                      <div className="text-lg font-roobert-bold text-blue-400">{indicator.target}</div>
                                      <div className="text-xs text-blue-400/60 mt-0.5">{indicator.unit}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-white/60">Progress to Target</span>
                                      <span className="font-roobert-bold text-white">{clampedProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                                      <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                                        style={{ width: `${clampedProgress}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-white/50">
                                      <span>{indicator.baseline} {indicator.unit}</span>
                                      <span>{indicator.target} {indicator.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                          <TrendingUp className="w-10 h-10 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40">No leading indicators defined</p>
                        </div>
                      )}
                    </div>

                    {/* Lagging Indicators */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Lagging Indicators
                      </h3>
                      {initiative.indicators?.lagging && initiative.indicators.lagging.length > 0 ? (
                        <div className="space-y-4">
                          {initiative.indicators.lagging.map((indicator: any, idx: number) => {
                            const baselineNum = parseFloat(indicator.baseline);
                            const targetNum = parseFloat(indicator.target);
                            const currentNum = parseFloat(indicator.current);
                            const progress = targetNum !== baselineNum ? ((currentNum - baselineNum) / (targetNum - baselineNum)) * 100 : 0;
                            const clampedProgress = Math.max(0, Math.min(100, progress));
                            
                            return (
                              <div key={idx} className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 overflow-hidden">
                                <div className="bg-blue-500/10 px-5 py-3 border-b border-blue-500/20">
                                  <h4 className="text-white font-roobert-semibold">{indicator.name}</h4>
                                </div>
                                <div className="p-5">
                                  <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Baseline</div>
                                      <div className="text-lg font-roobert-bold text-white">{indicator.baseline}</div>
                                      <div className="text-xs text-white/50 mt-0.5">{indicator.unit}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-blue-400 mb-1 font-roobert-medium uppercase">Current</div>
                                      <div className="text-lg font-roobert-bold text-blue-400">{indicator.current}</div>
                                      <div className="text-xs text-blue-400/60 mt-0.5">{indicator.unit}</div>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                      <div className="text-xs text-purple-400 mb-1 font-roobert-medium uppercase">Target</div>
                                      <div className="text-lg font-roobert-bold text-purple-400">{indicator.target}</div>
                                      <div className="text-xs text-purple-400/60 mt-0.5">{indicator.unit}</div>
                                    </div>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-white/60">Progress to Target</span>
                                      <span className="font-roobert-bold text-white">{clampedProgress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${clampedProgress}%` }}
                                      />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-white/50">
                                      <span>{indicator.baseline} {indicator.unit}</span>
                                      <span>{indicator.target} {indicator.unit}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                          <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40">No lagging indicators defined</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Budget & Funding Tab */}
              {activeTab === 'budget' && (
                <motion.div
                  key="budget"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Budget Overview */}
                  {initiative.budget && (
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Budget Overview
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {initiative.budget.total !== undefined && (
                          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-5 border border-blue-500/20">
                            <div className="text-sm text-blue-400 mb-2 font-roobert-medium uppercase tracking-wide">Total Budget</div>
                            <div className="text-2xl font-roobert-bold text-white">
                              {initiative.budget.currency || '$'}{initiative.budget.total.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {initiative.budget.allocated !== undefined && (
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
                            <div className="text-sm text-green-400 mb-2 font-roobert-medium uppercase tracking-wide">Allocated</div>
                            <div className="text-2xl font-roobert-bold text-white">
                              {initiative.budget.currency || '$'}{initiative.budget.allocated.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {initiative.budget.spent !== undefined && (
                          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl p-5 border border-orange-500/20">
                            <div className="text-sm text-orange-400 mb-2 font-roobert-medium uppercase tracking-wide">Spent</div>
                            <div className="text-2xl font-roobert-bold text-white">
                              {initiative.budget.currency || '$'}{initiative.budget.spent.toLocaleString()}
                            </div>
                            {initiative.budget.allocated && (
                              <div className="mt-2 text-xs text-white/60">
                                {Math.round((initiative.budget.spent / initiative.budget.allocated) * 100)}% utilized
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Additional Budget Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {initiative.budget.fundingSource && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Funding Source</div>
                            <div className="text-white font-roobert-semibold">{initiative.budget.fundingSource}</div>
                          </div>
                        )}
                        {initiative.budget.costAvoidance && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Cost Avoidance</div>
                            <div className="text-white font-roobert-semibold">{initiative.budget.costAvoidance}</div>
                          </div>
                        )}
                      </div>

                      {/* Budget Breakdown */}
                      {initiative.budget.breakdown && initiative.budget.breakdown.length > 0 && (
                        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                          <div className="bg-white/5 px-5 py-3 border-b border-white/10">
                            <h4 className="text-sm font-roobert-semibold text-white uppercase tracking-wide">Budget Breakdown by Category</h4>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {initiative.budget.breakdown.map((item, idx) => {
                                const percentOfTotal = initiative.budget?.total ? (item.allocated / initiative.budget.total) * 100 : 0;
                                const percentSpent = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
                                return (
                                  <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex-1">
                                        <div className="text-white font-roobert-semibold mb-1">{item.category}</div>
                                        <div className="text-xs text-white/60">
                                          {percentOfTotal.toFixed(1)}% of total budget
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-white font-roobert-bold">
                                          {initiative.budget?.currency || '$'}{item.allocated.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-green-400">
                                          Spent: {initiative.budget?.currency || '$'}{item.spent.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                                        style={{ width: `${Math.min(percentSpent, 100)}%` }}
                                      />
                                    </div>
                                    <div className="text-xs text-white/60 mt-1">
                                      {percentSpent.toFixed(1)}% spent
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Funding Details */}
                  {initiative.funding && (
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" />
                        Funding & Approval
                      </h3>
                      
                      {/* Funding Overview */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                          <div className="text-sm text-purple-400 mb-2 font-roobert-medium uppercase tracking-wide">Requested Amount</div>
                          <div className="text-2xl font-roobert-bold text-white">
                            ${initiative.funding.requestedAmount?.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20">
                          <div className="text-sm text-green-400 mb-2 font-roobert-medium uppercase tracking-wide">Approved Amount</div>
                          <div className="text-2xl font-roobert-bold text-white">
                            ${initiative.funding.approvedAmount?.toLocaleString()}
                          </div>
                          {initiative.funding.requestedAmount && initiative.funding.approvedAmount && (
                            <div className="mt-2 text-xs text-white/60">
                              {Math.round((initiative.funding.approvedAmount / initiative.funding.requestedAmount) * 100)}% of request
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {initiative.funding.approvalDate && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Approval Date
                            </div>
                            <div className="text-white font-roobert-semibold">
                              {new Date(initiative.funding.approvalDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        )}
                        {initiative.funding.approvedBy && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Approved By
                            </div>
                            <div className="text-white font-roobert-semibold">{initiative.funding.approvedBy}</div>
                          </div>
                        )}
                      </div>

                      {/* Phase Gates */}
                      {initiative.funding.phaseGates && initiative.funding.phaseGates.length > 0 && (
                        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                          <div className="bg-white/5 px-5 py-3 border-b border-white/10">
                            <h4 className="text-sm font-roobert-semibold text-white uppercase tracking-wide">Phase Gate Funding</h4>
                          </div>
                          <div className="p-5">
                            <div className="space-y-3">
                              {initiative.funding.phaseGates.map((gate, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10">
                                  <div className="flex-shrink-0">
                                    {gate.status === 'released' ? (
                                      <CheckCircle className="w-6 h-6 text-green-400" />
                                    ) : gate.status === 'pending' ? (
                                      <Clock className="w-6 h-6 text-yellow-400" />
                                    ) : (
                                      <Clock className="w-6 h-6 text-white/40" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-white font-roobert-semibold mb-1">{gate.phase}</div>
                                    <div className="text-sm text-white/70 mb-2">{gate.releaseCondition}</div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-roobert-bold text-white">
                                        ${gate.amount.toLocaleString()}
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-roobert-medium capitalize ${
                                        gate.status === 'released' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                        gate.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                        'bg-white/10 text-white/60 border border-white/10'
                                      }`}>
                                        {gate.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Budget or Funding Data */}
                  {!initiative.budget && !initiative.funding && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">No budget or funding information available</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Resources Tab */}
              {activeTab === 'resources' && (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {initiative.smartGoal?.achievable ? (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-roobert-semibold text-white mb-4">Resources & Team</h3>
                      {initiative.smartGoal.achievable.resources && (
                        <div className="mb-4">
                          <div className="text-sm text-white/60 mb-1">Resources</div>
                          <div className="text-white/90 font-roobert-light">{initiative.smartGoal.achievable.resources}</div>
                        </div>
                      )}
                      {initiative.smartGoal.achievable.teamSize && (
                        <div>
                          <div className="text-sm text-white/60 mb-1">Team Size</div>
                          <div className="text-white/90 font-roobert-light">{initiative.smartGoal.achievable.teamSize}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">No resource information available</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Risks & Success Tab */}
              {activeTab === 'risks' && (
                <motion.div
                  key="risks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-6">
                    {/* Risk Register - Left Column */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        Risk Register
                      </h3>
                      {initiative.risks && initiative.risks.length > 0 ? (
                        <div className="space-y-4">
                          {initiative.risks.map((risk: any, idx: number) => (
                            <div key={idx} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                              <div className="flex items-start gap-4 p-5">
                                <div className={`p-3 rounded-lg flex-shrink-0 ${
                                  risk.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                                  risk.severity === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-roobert-semibold text-white text-lg mb-1">{risk.description}</h4>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium capitalize border ${
                                          risk.severity === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                          risk.severity === 'medium' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                        }`}>
                                          {risk.severity} Severity
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium capitalize border ${
                                          risk.probability === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                          risk.probability === 'medium' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                          'bg-green-500/20 text-green-300 border-green-500/30'
                                        }`}>
                                          {risk.probability} Probability
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium capitalize border ${
                                          risk.status === 'open' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                          risk.status === 'mitigated' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                          risk.status === 'accepted' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                          'bg-white/10 text-white/60 border-white/10'
                                        }`}>
                                          {risk.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Risk Details Grid */}
                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                    {risk.impact && (
                                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                        <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Impact</div>
                                        <div className="text-sm text-white font-roobert-light">{risk.impact}</div>
                                      </div>
                                    )}
                                    {risk.owner && (
                                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                        <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          Risk Owner
                                        </div>
                                        <div className="text-sm text-white font-roobert-semibold">{risk.owner}</div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Mitigation Strategy */}
                                  {risk.mitigation && (
                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                                      <div className="text-xs text-green-400 mb-2 font-roobert-semibold uppercase tracking-wide flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Mitigation Strategy
                                      </div>
                                      <p className="text-white/90 font-roobert-light text-sm leading-relaxed">{risk.mitigation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : initiative.topRisks && initiative.topRisks.length > 0 ? (
                        <div className="space-y-4">
                          {initiative.topRisks.map((risk: any, idx: number) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/10">
                              <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${getRiskColor(risk.level)}`}>
                                  <AlertTriangle className="w-5 h-5" />
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
                        <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                          <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40">No risks identified</p>
                        </div>
                      )}
                    </div>

                    {/* Success Criteria - Right Column */}
                    <div>
                      <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-400" />
                        Success Criteria
                      </h3>
                      {initiative.successCriteria && initiative.successCriteria.length > 0 ? (
                        <div className="space-y-4">
                          {initiative.successCriteria.map((criteria: any, idx: number) => (
                            <div key={idx} className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 overflow-hidden">
                              <div className="bg-green-500/10 px-5 py-3 border-b border-green-500/20">
                                <h4 className="text-white font-roobert-semibold">{criteria.metric}</h4>
                              </div>
                              <div className="p-5">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                    <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Baseline</div>
                                    <div className="text-lg font-roobert-bold text-white">{criteria.baseline}</div>
                                  </div>
                                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                    <div className="text-xs text-green-400 mb-1 font-roobert-medium uppercase">Target</div>
                                    <div className="text-lg font-roobert-bold text-green-400">{criteria.target}</div>
                                  </div>
                                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                                    <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Frequency</div>
                                    <div className="text-sm font-roobert-bold text-white">{criteria.frequency}</div>
                                  </div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                  <div className="text-xs text-white/60 mb-1 font-roobert-medium uppercase">Measurement Method</div>
                                  <div className="text-sm text-white/90 font-roobert-light">{criteria.measurement}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                          <Award className="w-10 h-10 text-white/20 mx-auto mb-3" />
                          <p className="text-white/40">No success criteria defined</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/60">Task integration coming soon</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {linkedGoals && linkedGoals.length > 0 ? (
                    <div className="space-y-3">
                      {linkedGoals.map((goal: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <Target className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-roobert-medium">{goal.name || goal}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/60">No linked goals</p>
                      </div>
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
