import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, CheckCircle, Clock, Users, BarChart3, Award } from 'lucide-react';
import { Organization } from '../types';

interface OrganizationModalProps {
  organization: Organization | null;
  onClose: () => void;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({ organization, onClose }) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (organization) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [organization]);

  if (!organization) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on-track':
      case 'completed':
        return 'text-fis-green bg-fis-green/20';
      case 'at-risk':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'delayed':
      case 'blocked':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'text-red-500 bg-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 dark:border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                {organization.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated: {new Date(organization.lastUpdated).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Key Highlights */}
            <section>
              <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-fis-raspberry" />
                Key Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organization.keyHighlights.map((highlight, index) => (
                  <div key={index} className="glass-card p-4 rounded-xl">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategic Projects */}
            <section>
              <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-fis-eggplant" />
                Strategic Projects
              </h3>
              <div className="space-y-4">
                {organization.strategicProjects.map((project) => (
                  <div key={project.id} className="glass-card p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Due: {new Date(project.dueDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-fis-eggplant to-fis-raspberry transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular">
                      {project.executiveSummary}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Support Activities */}
            <section>
              <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-fis-navy" />
                Support Activities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organization.supportActivities.map((activity) => (
                  <div key={activity.id} className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${
                        activity.type === 'incident' ? 'bg-red-500/20 text-red-500' :
                        activity.type === 'request' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-purple-500/20 text-purple-500'
                      }`}>
                        {activity.type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-roobert-regular">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-roobert-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Impact: {activity.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Demo Insights */}
            <section>
              <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-fis-raspberry" />
                Demo Studio Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-roobert-heavy text-fis-raspberry mb-1">
                    {organization.demoInsights.demosThisWeek}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-regular">
                    Demos This Week
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <div className="text-2xl font-roobert-heavy text-fis-eggplant mb-1">
                    {organization.demoInsights.hoursInvested}h
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-regular">
                    Hours Invested
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl md:col-span-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-regular mb-2">
                    Top Request
                  </div>
                  <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                    {organization.demoInsights.topRequests[0]}
                  </div>
                </div>
              </div>

              {/* Wins */}
              {organization.demoInsights.wins.length > 0 && (
                <div className="mt-4 glass-card p-4 rounded-xl">
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-fis-green" />
                    Recent Wins
                  </h4>
                  <ul className="space-y-2">
                    {organization.demoInsights.wins.map((win, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 font-roobert-regular flex items-start gap-2">
                        <span className="text-fis-green mt-1">•</span>
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
