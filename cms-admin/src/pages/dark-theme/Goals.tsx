/**
 * GOALS PAGE - DARK THEME
 * 
 * Strategic goals management with three views:
 * 1. Goals Home - 5 strategic goals with visual SMART indicators
 * 2. Goal Details - Deep dive into specific goal with timeline & KPIs
 * 3. Edit Goal - Full goal editor (CMS-style with dark theme)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, X, Download, Edit2, Save, ArrowLeft, Calendar, TrendingUp, 
  Users, CheckCircle2, AlertCircle, Clock, Award, Zap, ChevronRight,
  BarChart3, LineChart, PieChart, Activity, Maximize2, Minimize2
} from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { useNavigate } from 'react-router-dom';

interface GoalsProps {
  onClose?: () => void;
  onOpenGoalsManager?: (goalId?: string) => void;
}

interface Goal {
  id: string;
  name: string;
  shortName: string;
  category: string;
  owner: string;
  coOwners: string[];
  status: string;
  priority: string;
  targetDate: string;
  color: string;
  icon: string;
  progress: number;
  linkedAssets: number;
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; ownership: string };
    relevant: { croAlignment: string[] };
    timeBound: {
      timeline: Array<{
        phase: string;
        deliverable: string;
        dueDate: string;
        status: string;
      }>;
    };
  };
  indicators: {
    leading: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
    lagging: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
  };
  createdDate: string;
  lastUpdated: string;
  linkedInitiatives: number;
  linkedTasks: number;
}

type ViewMode = 'home' | 'details' | 'edit';

export default function Goals({ onClose, onOpenGoalsManager }: GoalsProps = {}) {
  let navigate: any;
  try {
    navigate = useNavigate();
  } catch (e) {
    // useNavigate not available (CMS context)
    navigate = null;
  }
  const contentRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/goals');
      const data = await response.json();
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setViewMode('details');
  };

  const handleBack = () => {
    if (viewMode === 'edit') {
      setViewMode('details');
    } else if (viewMode === 'details') {
      setViewMode('home');
      setSelectedGoal(null);
    } else {
      // Close modal or navigate home
      if (onClose) {
        onClose();
      } else if (navigate) {
        navigate('/');
      }
    }
  };

  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a'
      });
      
      const link = document.createElement('a');
      link.download = `strategic-goals-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400 font-roobert-light">Loading strategic goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 flex flex-col transition-all duration-300 ${
          isFullscreen ? 'w-full h-full' : 'w-[95vw] h-[95vh]'
        }`}
        ref={contentRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-slate-700/40 transition-all"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <Target className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">
                {viewMode === 'home' ? 'Strategic Goals' : viewMode === 'details' ? selectedGoal?.name : 'Edit Goal'}
              </h2>
              <p className="text-sm text-slate-400 font-roobert-light">
                {viewMode === 'home' 
                  ? `${goals.length} Commercial Office Goals • FY2026`
                  : viewMode === 'details'
                    ? `Owner: ${selectedGoal?.owner} • Target: ${selectedGoal?.targetDate}`
                    : 'Modify goal details and SMART framework'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === 'details' && (
              <button
                onClick={() => {
                  if (onOpenGoalsManager && selectedGoal) {
                    onOpenGoalsManager(selectedGoal.id);
                  } else {
                    setViewMode('edit');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-roobert-medium transition-all"
              >
                <Edit2 className="w-4 h-4 inline mr-2" />
                Edit Goal
              </button>
            )}
            {viewMode === 'edit' && (
              <button
                onClick={() => setViewMode('details')}
                className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-roobert-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Details
              </button>
            )}
            
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg hover:bg-slate-700/40 transition-all disabled:opacity-50"
              title="Export to Image"
            >
              <Download className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-slate-700/40 transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-slate-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            <button
              onClick={() => {
                if (onClose) {
                  onClose();
                } else if (navigate) {
                  navigate('/');
                }
              }}
              className="p-2 rounded-lg hover:bg-slate-700/40 transition-all"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {viewMode === 'home' && (
              <GoalsHomeView goals={goals} onGoalClick={handleGoalClick} />
            )}
            {viewMode === 'details' && selectedGoal && (
              <GoalDetailsView goal={selectedGoal} />
            )}
            {viewMode === 'edit' && selectedGoal && (
              <GoalEditView goal={selectedGoal} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ===========================
// GOALS HOME VIEW
// ===========================
function GoalsHomeView({ goals, onGoalClick }: { goals: Goal[]; onGoalClick: (goal: Goal) => void }) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-8"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatCard
          icon={<Target className="w-5 h-5 text-purple-400" />}
          label="Total Goals"
          value={goals.length}
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-green-400" />}
          label="On Track"
          value={goals.filter(g => g.status === 'on-track' || g.status === 'in-progress').length}
          color="green"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-orange-400" />}
          label="High Priority"
          value={goals.filter(g => g.priority === 'high').length}
          color="orange"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-blue-400" />}
          label="Avg Progress"
          value={`${Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)}%`}
          color="blue"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-cyan-400" />}
          label="Target: 2026"
          value="Q4"
          color="cyan"
        />
      </div>

      {/* Goals Grid - Clever Visual Cards */}
      <div className="grid grid-cols-1 gap-6">
        {goals.map((goal, index) => (
          <GoalCard key={goal.id} goal={goal} index={index} onClick={() => onGoalClick(goal)} />
        ))}
      </div>
    </motion.div>
  );
}

// ===========================
// GOAL CARD - VISUAL SMART DISPLAY
// ===========================
function GoalCard({ goal, index, onClick }: { goal: Goal; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group bg-slate-800/50 border border-slate-700/40 rounded-xl p-6 cursor-pointer hover:bg-slate-800/80 hover:border-slate-600/60 transition-all"
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Icon & Title (3 cols) */}
        <div className="col-span-3 flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{goal.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-roobert-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                {goal.name}
              </h3>
              <p className="text-xs text-slate-400 font-roobert-medium">{goal.shortName}</p>
            </div>
          </div>
          
          {/* Progress Ring */}
          <div className="flex items-center gap-3">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgb(51 65 85)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgb(168 85 247)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - goal.progress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div>
              <div className="text-2xl font-roobert-bold text-white">{goal.progress}%</div>
              <div className="text-xs text-slate-400">Complete</div>
            </div>
          </div>

          {/* Owner */}
          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <div className="text-xs text-slate-500 mb-1">Owner</div>
            <div className="text-sm font-roobert-medium text-slate-300">{goal.owner}</div>
          </div>
        </div>

        {/* Middle: SMART Objectives (5 cols) */}
        <div className="col-span-5">
          <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">SMART Objectives</div>
          <div className="space-y-2">
            {goal.smartGoal.specific.objectives.slice(0, 4).map((obj, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-slate-300 font-roobert-light"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{obj}</span>
              </div>
            ))}
            {goal.smartGoal.specific.objectives.length > 4 && (
              <div className="text-xs text-slate-500 pl-6">
                +{goal.smartGoal.specific.objectives.length - 4} more objectives
              </div>
            )}
          </div>

          {/* CRO Alignment */}
          <div className="mt-4 pt-4 border-t border-slate-700/40">
            <div className="text-xs text-slate-500 mb-2">CRO Alignment</div>
            <div className="flex flex-wrap gap-2">
              {goal.smartGoal.relevant.croAlignment.slice(0, 3).map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-roobert-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Metrics & Timeline (4 cols) */}
        <div className="col-span-4">
          <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Key Metrics</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {goal.indicators.leading.slice(0, 2).map((metric, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/40">
                <div className="text-xs text-slate-500 mb-1 truncate">{metric.name}</div>
                <div className="text-lg font-roobert-bold text-white">
                  {metric.current}<span className="text-xs text-slate-500">{metric.unit}</span>
                </div>
                <div className="text-xs text-slate-400">Target: {metric.target}{metric.unit}</div>
              </div>
            ))}
          </div>

          {/* Timeline Phases */}
          <div className="space-y-2">
            <div className="text-xs text-slate-500 mb-2">Timeline</div>
            {goal.smartGoal.timeBound.timeline.map((phase, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs"
              >
                <div className={`w-2 h-2 rounded-full ${
                  phase.status === 'complete' ? 'bg-green-400' :
                  phase.status === 'in-progress' ? 'bg-blue-400' :
                  'bg-slate-600'
                }`} />
                <span className="text-slate-400 font-roobert-light flex-1 truncate">
                  {phase.phase}
                </span>
                <span className="text-slate-500">{phase.dueDate.split('-')[1]}/Q</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Click Indicator */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </motion.div>
  );
}

// ===========================
// STAT CARD
// ===========================
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    orange: 'bg-orange-500/10 border-orange-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-4`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs text-slate-400 font-roobert-medium">{label}</span>
      </div>
      <div className="text-2xl font-roobert-bold text-white">{value}</div>
    </div>
  );
}

// ===========================
// GOAL DETAILS VIEW
// ===========================
function GoalDetailsView({ goal }: { goal: Goal }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'timeline'>('overview');

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-800/30 p-1 rounded-lg border border-slate-700/40 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
            activeTab === 'metrics'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Metrics & KPIs
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
            activeTab === 'timeline'
              ? 'bg-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Timeline
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && <OverviewTab goal={goal} />}
        {activeTab === 'metrics' && <MetricsTab goal={goal} />}
        {activeTab === 'timeline' && <TimelineTab goal={goal} />}
      </AnimatePresence>
    </motion.div>
  );
}

// Overview Tab
function OverviewTab({ goal }: { goal: Goal }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* SMART Statement */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
        <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          SMART Goal Statement
        </h3>
        <p className="text-slate-300 font-roobert-light leading-relaxed">
          {goal.smartGoal.statement}
        </p>
      </div>

      {/* SMART Framework Grid */}
      <div className="grid grid-cols-2 gap-4">
        <SMARTSection
          title="Specific"
          icon={<Target className="w-5 h-5 text-blue-400" />}
          items={goal.smartGoal.specific.objectives}
        />
        <SMARTSection
          title="Measurable"
          icon={<BarChart3 className="w-5 h-5 text-green-400" />}
          items={goal.smartGoal.measurable.metrics}
        />
      </div>

      {/* Achievable & Relevant */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
          <h4 className="text-md font-roobert-semibold text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            Achievable
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500 uppercase">Resources</span>
              <p className="text-sm text-slate-300 mt-1">{goal.smartGoal.achievable.resources}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase">Ownership</span>
              <p className="text-sm text-slate-300 mt-1">{goal.smartGoal.achievable.ownership}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
          <h4 className="text-md font-roobert-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Relevant - CRO Alignment
          </h4>
          <div className="flex flex-wrap gap-2">
            {goal.smartGoal.relevant.croAlignment.map((area, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-sm font-roobert-medium border border-purple-500/20"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Co-Owners */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
        <h4 className="text-md font-roobert-semibold text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Team & Ownership
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-slate-500 uppercase">Owner</span>
            <p className="text-sm text-white font-roobert-medium mt-1">{goal.owner}</p>
          </div>
          {goal.coOwners.map((coOwner, idx) => (
            <div key={idx}>
              <span className="text-xs text-slate-500 uppercase">Co-Owner</span>
              <p className="text-sm text-slate-300 mt-1">{coOwner}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SMARTSection({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
      <h4 className="text-md font-roobert-semibold text-white mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Metrics Tab
function MetricsTab({ goal }: { goal: Goal }) {
  return (
    <motion.div
      key="metrics"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Leading Indicators */}
        <div>
          <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Leading Indicators
          </h3>
          <div className="space-y-3">
            {goal.indicators.leading.map((metric, idx) => (
              <MetricCard key={idx} metric={metric} type="leading" />
            ))}
          </div>
        </div>

        {/* Lagging Indicators */}
        <div>
          <h3 className="text-lg font-roobert-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Lagging Indicators
          </h3>
          <div className="space-y-3">
            {goal.indicators.lagging.map((metric, idx) => (
              <MetricCard key={idx} metric={metric} type="lagging" />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ metric, type }: { metric: any; type: 'leading' | 'lagging' }) {
  const progress = ((parseFloat(metric.current) - parseFloat(metric.baseline)) / (parseFloat(metric.target) - parseFloat(metric.baseline))) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-roobert-medium text-white mb-1">{metric.name}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Baseline: {metric.baseline}{metric.unit}</span>
            <span>→</span>
            <span>Target: {metric.target}{metric.unit}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-roobert-bold text-white">
            {metric.current}<span className="text-sm text-slate-400">{metric.unit}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-700/40 rounded-full overflow-hidden">
        <div
          className={`h-full ${type === 'leading' ? 'bg-green-500' : 'bg-blue-500'} transition-all`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

// Timeline Tab
function TimelineTab({ goal }: { goal: Goal }) {
  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
        <h3 className="text-lg font-roobert-semibold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          Quarterly Timeline • FY2026
        </h3>

        <div className="space-y-4">
          {goal.smartGoal.timeBound.timeline.map((phase, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  phase.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                  phase.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700/40 text-slate-500'
                }`}>
                  {phase.status === 'complete' ? <CheckCircle2 className="w-5 h-5" /> :
                   phase.status === 'in-progress' ? <Clock className="w-5 h-5" /> :
                   <span className="text-sm font-roobert-bold">{idx + 1}</span>
                  }
                </div>
                {idx < goal.smartGoal.timeBound.timeline.length - 1 && (
                  <div className="w-0.5 h-16 bg-slate-700/40 my-1" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-md font-roobert-semibold text-white">{phase.phase}</h4>
                  <span className="text-sm text-slate-400 font-roobert-medium">{phase.dueDate}</span>
                </div>
                <p className="text-sm text-slate-300 font-roobert-light">{phase.deliverable}</p>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium ${
                    phase.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                    phase.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-slate-700/40 text-slate-400'
                  }`}>
                    {phase.status === 'not-started' ? 'Not Started' : 
                     phase.status === 'in-progress' ? 'In Progress' :
                     'Complete'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ===========================
// GoalEditView - CMS ONLY
// ===========================
function GoalEditView({ goal }: { goal: Goal }) {
  return (
    <motion.div
      key="edit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-8"
    >
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-8 text-center">
        <Edit2 className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-roobert-semibold text-white mb-2">Goal Editor</h3>
        <p className="text-slate-400 font-roobert-light mb-6">
          Click the "Edit Goal" button to open the full CMS editor for this goal.
        </p>
        <div className="bg-slate-900/50 border border-slate-700/40 rounded-lg p-4 text-left">
          <div className="space-y-2 text-sm text-slate-300">
            <div><span className="font-roobert-semibold text-white">Goal:</span> {goal.name}</div>
            <div><span className="font-roobert-semibold text-white">Owner:</span> {goal.owner}</div>
            <div><span className="font-roobert-semibold text-white">Status:</span> {goal.status}</div>
            <div><span className="font-roobert-semibold text-white">Priority:</span> {goal.priority}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          The Goals Manager provides full editing capabilities for SMART framework, indicators, and timeline.
        </p>
      </div>
    </motion.div>
  );
}
