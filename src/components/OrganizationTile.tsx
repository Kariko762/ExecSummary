import { motion } from 'framer-motion';
import { Organization } from '../types';
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface OrganizationTileProps {
  organization: Organization;
  onClick: () => void;
  index: number;
}

export function OrganizationTile({ organization, onClick, index }: OrganizationTileProps) {
  // Calculate status based on projects
  const atRiskProjects = organization.strategicProjects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length;
  const activeIssues = organization.supportActivities.filter(a => a.status === 'active' && a.priority === 'high').length;
  
  const getStatusInfo = () => {
    if (atRiskProjects > 0 || activeIssues > 0) {
      if (activeIssues > 2 || atRiskProjects > 1) {
        return { 
          icon: AlertTriangle, 
          color: 'text-red-500 bg-red-500/20', 
          label: `${activeIssues + atRiskProjects} Needs Attention`,
          borderColor: 'border-red-500/30'
        };
      }
      return { 
        icon: AlertTriangle, 
        color: 'text-yellow-500 bg-yellow-500/20', 
        label: `${atRiskProjects} At Risk`,
        borderColor: 'border-yellow-500/30'
      };
    }
    return { 
      icon: CheckCircle, 
      color: 'text-green-500 bg-green-500/20', 
      label: 'All On Track',
      borderColor: 'border-green-500/30'
    };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

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
        <div>
          <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-1">
            {organization.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Updated {new Date(organization.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${status.color}`}>
          <StatusIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} mb-4`}>
        <div className={`w-2 h-2 rounded-full ${status.color.includes('red') ? 'bg-red-500' : status.color.includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
        <span className="text-xs font-roobert-medium">{status.label}</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-fis-eggplant" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Projects</p>
          </div>
          <p className="text-lg font-roobert-bold text-gray-900 dark:text-white">
            {organization.strategicProjects.length}
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-fis-navy" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Demos</p>
          </div>
          <p className="text-lg font-roobert-bold text-gray-900 dark:text-white">
            {organization.demoInsights.demosThisWeek}
          </p>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-fis-green" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Hours</p>
          </div>
          <p className="text-lg font-roobert-bold text-gray-900 dark:text-white">
            {organization.demoInsights.hoursInvested}
          </p>
        </div>
      </div>

      {/* Top Highlight */}
      {organization.keyHighlights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            🎯 {organization.keyHighlights[0]}
          </p>
        </div>
      )}

      {/* Click indicator */}
      <div className="mt-4 text-xs text-fis-eggplant dark:text-purple-300 font-roobert-medium flex items-center gap-1">
        Click for details
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}
