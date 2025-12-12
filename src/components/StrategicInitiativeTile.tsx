import { motion } from 'framer-motion';
import { StrategicInitiative } from '../types';
import { Target, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface StrategicInitiativeTileProps {
  initiative: StrategicInitiative;
  onClick: () => void;
  index: number;
}

export function StrategicInitiativeTile({ initiative, onClick, index }: StrategicInitiativeTileProps) {
  // Calculate overall status based on milestones and risk level
  const getStatusInfo = () => {
    const delayedMilestones = initiative.timeline?.milestones.filter(m => m.status === 'delayed' || m.status === 'at-risk').length || 0;
    const riskLevel = initiative.riskAssessment?.overallRiskLevel;
    
    if (delayedMilestones > 1 || riskLevel === 'critical' || riskLevel === 'high') {
      return { 
        icon: AlertTriangle, 
        color: 'text-red-500 bg-red-500/20', 
        label: 'Needs Attention',
        borderColor: 'border-red-500/30'
      };
    }
    if (delayedMilestones === 1 || riskLevel === 'medium') {
      return { 
        icon: AlertTriangle, 
        color: 'text-yellow-500 bg-yellow-500/20', 
        label: 'Monitor Closely',
        borderColor: 'border-yellow-500/30'
      };
    }
    return { 
      icon: CheckCircle, 
      color: 'text-fis-green bg-fis-green/20', 
      label: 'On Track',
      borderColor: 'border-fis-green/30'
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  // Calculate progress based on milestones
  const totalMilestones = initiative.timeline?.milestones.length || 0;
  const completedMilestones = initiative.timeline?.milestones.filter(m => m.status === 'completed').length || 0;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Get stage color
  const getStageColor = () => {
    if (!initiative.currentStatus) return 'bg-gray-500/20 text-gray-600';
    switch (initiative.currentStatus.projectStage) {
      case 'concept': return 'bg-purple-500/20 text-purple-600';
      case 'pilot': return 'bg-blue-500/20 text-blue-600';
      case 'mvp': return 'bg-cyan-500/20 text-cyan-600';
      case 'scaling': return 'bg-orange-500/20 text-orange-600';
      case 'production': return 'bg-fis-green/20 text-fis-green';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className={`glass-strong card-shadow hover:card-shadow-hover rounded-2xl p-6 cursor-pointer border-2 ${status.borderColor} hover:border-fis-eggplant transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 pr-2">
            {initiative.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {initiative.currentStatus && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-roobert-semibold ${getStageColor()}`}>
                {initiative.currentStatus.projectStage.toUpperCase()}
              </span>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Updated {new Date(initiative.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${status.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} mb-4`}>
        <div className={`w-2 h-2 rounded-full ${
          status.color.includes('red') ? 'bg-red-500' : 
          status.color.includes('yellow') ? 'bg-yellow-500' : 
          'bg-fis-green'
        } animate-pulse`} />
        <span className="text-xs font-roobert-medium">{status.label}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
            Progress
          </span>
          <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">
            {progressPercentage}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(to right, rgba(67, 28, 91, 0.6), rgba(178, 26, 83, 0.6))'
            }}
          />
        </div>
      </div>

      {/* Executive Summary Preview */}
      {initiative.executiveSummary && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-4 font-roobert-regular">
          {initiative.executiveSummary.overview}
        </p>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {initiative.budget && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-fis-green" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
            </div>
            <p className="text-sm font-roobert-bold text-gray-900 dark:text-white">
              ${(initiative.budget.totalFunding / 1000000).toFixed(1)}M
            </p>
          </div>
        )}

        {initiative.roi && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-fis-navy" />
              <p className="text-xs text-gray-500 dark:text-gray-400">ROI</p>
            </div>
            <p className="text-sm font-roobert-bold text-gray-900 dark:text-white">
              {initiative.roi.paybackPeriod.split(' ')[0]}mo
            </p>
          </div>
        )}

        {initiative.timeline && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-fis-raspberry" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Timeline</p>
            </div>
            <p className="text-sm font-roobert-bold text-gray-900 dark:text-white">
              {initiative.timeline.phases.length} phases
            </p>
          </div>
        )}
      </div>

      {/* Top Benefit */}
      {initiative.executiveSummary?.benefits && initiative.executiveSummary.benefits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 font-roobert-regular">
            💡 {initiative.executiveSummary.benefits[0].replace(/\*\*/g, '')}
          </p>
        </div>
      )}

      {/* Click indicator */}
      <div className="mt-4 text-xs text-fis-eggplant dark:text-purple-300 font-roobert-medium flex items-center gap-1">
        View full details
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}
