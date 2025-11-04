import { motion } from 'framer-motion';
import { ExecutiveSummary } from '../types';
import { X, TrendingUp, Users, DollarSign, ThumbsUp, Calendar, Target, AlertTriangle, CheckCircle2, Clock, Printer } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { WeeklyFocus } from './WeeklyFocus';
import { IssuesBlockers } from './IssuesBlockers';

interface SummaryDetailProps {
  summary: ExecutiveSummary;
  onClose: () => void;
}

export const SummaryDetail: React.FC<SummaryDetailProps> = ({ summary, onClose }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      case 'on-track':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/20';
      case 'at-risk':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
      case 'delayed':
        return 'text-red-600 dark:text-red-400 bg-red-500/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'on-track':
        return <TrendingUp className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'delayed':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const departmentChartData = summary.departments.map((dept) => ({
    name: dept.name,
    performance: dept.performance,
    fill: dept.performance >= 90 ? '#10B981' : dept.performance >= 80 ? '#3B82F6' : '#F59E0B',
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto no-print"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen py-8 px-4"
      >
        <div className="max-w-6xl mx-auto glass-strong rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-fis-eggplant to-fis-navy p-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all no-print"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={handlePrint}
              className="absolute top-4 right-16 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all no-print"
              title="Print Summary"
            >
              <Printer className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-roobert-heavy text-white mb-2">
                  {summary.quarter} {summary.year}
                </h1>
                <p className="text-blue-100 font-roobert-light">
                  {new Date(summary.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-roobert-medium text-white mt-6">
              {summary.title}
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Key Metrics */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Revenue
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatCurrency(summary.keyMetrics.revenue)}
                  </p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-navy/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-fis-navy" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Customers
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatNumber(summary.keyMetrics.customers)}
                  </p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-green/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-fis-green" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Growth
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    +{summary.keyMetrics.growth}%
                  </p>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <ThumbsUp className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    NPS Score
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {summary.keyMetrics.satisfaction}
                  </p>
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Key Highlights
              </h3>
              <div className="glass rounded-xl p-6 space-y-3">
                {summary.highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-roobert-heavy">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1">
                      {highlight}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Departments & Initiatives Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Department Performance */}
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Department Performance
                </h3>
                <div className="glass rounded-xl p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={departmentChartData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        background
                        dataKey="performance"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  <div className="space-y-3 mt-6">
                    {summary.departments.map((dept) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                dept.performance >= 90
                                  ? '#10B981'
                                  : dept.performance >= 80
                                  ? '#3B82F6'
                                  : '#F59E0B',
                            }}
                          />
                          <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                            {dept.name}
                          </span>
                        </div>
                        <span className="text-sm font-roobert-heavy text-gray-900 dark:text-white">
                          {dept.performance}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Strategic Initiatives */}
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Strategic Initiatives
                </h3>
                <div className="space-y-3">
                  {summary.initiatives.map((initiative) => (
                    <div key={initiative.name} className="glass rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white mb-1">
                            {initiative.name}
                          </h4>
                          <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                            {initiative.owner}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-roobert-medium ${getStatusColor(initiative.status)}`}>
                          {getStatusIcon(initiative.status)}
                          <span className="capitalize">{initiative.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${initiative.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-fis-eggplant to-fis-navy rounded-full"
                        />
                      </div>
                      <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 mt-2">
                        {initiative.progress}% complete
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Weekly Focus - Show if available */}
            {summary.weeklyFocus && summary.weeklyFocus.length > 0 && (
              <section>
                <WeeklyFocus focusItems={summary.weeklyFocus} />
              </section>
            )}

            {/* Issues & Blockers - Show if available */}
            {summary.issuesAndBlockers && summary.issuesAndBlockers.length > 0 && (
              <section>
                <IssuesBlockers issues={summary.issuesAndBlockers} />
              </section>
            )}

            {/* Risks & Mitigation */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Risks & Mitigation
              </h3>
              <div className="space-y-4">
                {summary.risks.map((risk, index) => (
                  <div key={index} className="glass rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white">
                            {risk.description}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-roobert-medium ${getSeverityColor(risk.severity)}`}>
                            {risk.severity} severity
                          </span>
                        </div>
                        <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-400">
                          <span className="font-roobert-medium">Mitigation: </span>
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Outlook */}
            <section>
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Outlook
              </h3>
              <div className="glass rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-roobert-light text-gray-700 dark:text-gray-300 leading-relaxed">
                    {summary.outlook}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
