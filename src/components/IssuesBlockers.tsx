import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { IssueBlocker } from '../types';

interface IssuesBlockersProps {
  issues: IssueBlocker[];
}

export function IssuesBlockers({ issues }: IssuesBlockersProps) {
  const getImpactColor = (impact: IssueBlocker['impact']) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const groupedIssues = {
    open: issues.filter(i => i.status === 'open'),
    'in-progress': issues.filter(i => i.status === 'in-progress'),
    resolved: issues.filter(i => i.status === 'resolved')
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-fis-eggplant" />
        <h3 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white">
          Issues & Blockers
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Open Issues */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-roobert-semibold text-gray-900 dark:text-white">
              Open ({groupedIssues.open.length})
            </h4>
          </div>
          {groupedIssues.open.map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                  {issue.title}
                </h5>
                <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(issue.impact)}`}>
                  {issue.impact}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {issue.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-roobert-medium">Timeline:</span> {issue.timeline}
              </div>
            </motion.div>
          ))}
        </div>

        {/* In Progress Issues */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-yellow-200 dark:border-yellow-800">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h4 className="font-roobert-semibold text-gray-900 dark:text-white">
              In Progress ({groupedIssues['in-progress'].length})
            </h4>
          </div>
          {groupedIssues['in-progress'].map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                  {issue.title}
                </h5>
                <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(issue.impact)}`}>
                  {issue.impact}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {issue.description}
              </p>
              <div className="text-xs space-y-1">
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-roobert-medium text-fis-eggplant dark:text-purple-300">Action:</span> {issue.action}
                </div>
                <div className="text-gray-500 dark:text-gray-500">
                  <span className="font-roobert-medium">Timeline:</span> {issue.timeline}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resolved Issues */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-800">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-roobert-semibold text-gray-900 dark:text-white">
              Resolved ({groupedIssues.resolved.length})
            </h4>
          </div>
          {groupedIssues.resolved.map((issue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-75"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                  {issue.title}
                </h5>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {issue.outcome}
              </p>
            </motion.div>
          ))}
          {groupedIssues.resolved.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-500 italic">
              No resolved issues yet
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
