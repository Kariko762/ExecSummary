import { useState, useEffect } from 'react';
import { Target, TrendingUp, Clock, ChevronRight, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  owner: string;
  status: string;
  priority: string;
  progress?: number;
  targetDate?: string;
  smartGoal?: {
    statement: string;
  };
  indicators?: {
    leading: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
    lagging: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
  };
  linkedAssets?: number;
  icon?: string;
  color?: string;
}

interface GoalsHomeProps {
  onSelectGoal?: (goal: any) => void;
}

export default function GoalsHome({ onSelectGoal }: GoalsHomeProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleGoalClick = async (id: string) => {
    if (onSelectGoal) {
      try {
        const response = await fetch(`http://localhost:3001/api/goals/${id}`);
        const data = await response.json();
        onSelectGoal(data);
      } catch (error) {
        console.error('Failed to fetch goal:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading strategic goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section - Purple/Navy Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-900 via-fis-eggplant to-fis-navy dark:bg-gray-950 overflow-hidden rounded-t-xl">
        {/* SVG Target/Goal Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="goal-pattern-header" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                {/* Target/Goal patterns */}
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.3" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" className="text-white" strokeWidth="1.5" opacity="0.3" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" className="text-white" strokeWidth="1" opacity="0.3" />
                <circle cx="10" cy="10" r="3" fill="currentColor" className="text-white" opacity="0.2" />
                <circle cx="90" cy="90" r="3" fill="currentColor" className="text-white" opacity="0.2" />
                <path d="M20,80 L30,70 M30,80 L20,70" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.2" />
                <path d="M75,20 L85,10 M85,20 L75,10" stroke="currentColor" className="text-white" strokeWidth="2" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goal-pattern-header)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 2xl:px-6 py-4 2xl:py-8">
          <div className="flex items-center gap-3 2xl:gap-4 mb-2 2xl:mb-4">
            <div className="p-2 2xl:p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Target className="w-6 h-6 2xl:w-8 2xl:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl 2xl:text-3xl font-roobert-semibold text-white">
                Strategic Goals
              </h1>
              <p className="text-white/70 text-xs 2xl:text-sm hidden 2xl:block">
                Browse and explore all strategic goals and initiatives
              </p>
            </div>
          </div>
          
          <div className="hidden 2xl:flex items-center gap-4 2xl:gap-6 text-xs 2xl:text-sm text-white/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>{goals.length} Total Goals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - White Background with Subtle Pattern */}
      <div className="relative bg-white dark:bg-gray-900">
        {/* SVG Target Pattern Background - Light Grey */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="goal-pattern-content" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Target/Goal patterns */}
                <circle cx="40" cy="40" r="15" fill="none" stroke="currentColor" className="text-purple-600" strokeWidth="1.5" opacity="0.4" />
                <circle cx="40" cy="40" r="10" fill="none" stroke="currentColor" className="text-purple-600" strokeWidth="1" opacity="0.4" />
                <circle cx="8" cy="8" r="2" fill="currentColor" className="text-purple-600" />
                <circle cx="72" cy="72" r="2" fill="currentColor" className="text-purple-600" />
                <path d="M16,64 L24,56 M24,64 L16,56" stroke="currentColor" className="text-purple-600" strokeWidth="1.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#goal-pattern-content)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  onClick={() => handleGoalClick(goal.id)}
                  className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-pink-500/10 transition-all duration-500 rounded-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {goal.name}
                    </h3>
                    
                    {goal.shortName && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-2">
                        {goal.shortName}
                      </span>
                    )}

                    {goal.smartGoal?.statement && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-roobert-light">
                        {goal.smartGoal.statement}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {goal.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-roobert-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Key Metrics Preview */}
                    {goal.indicators?.leading && goal.indicators.leading.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {goal.indicators.leading.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-roobert-medium truncate">{metric.name}</div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white truncate">
                              {metric.current}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">→ {metric.target}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats Footer */}
                    <div className="flex items-center gap-2 flex-wrap text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-roobert-medium capitalize">
                        {goal.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.status === 'complete' || goal.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        goal.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        goal.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        goal.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.priority === 'high' || goal.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
                    
                    {/* Owner & Assets Footer */}
                    {(goal.owner || goal.linkedAssets !== undefined) && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {goal.owner && (
                          <span className="flex items-center gap-1 font-roobert-medium">
                            <Users className="w-3 h-3" />
                            {goal.owner}
                          </span>
                        )}
                        {goal.linkedAssets !== undefined && (
                          <span className="font-roobert-medium">
                            {goal.linkedAssets} asset{goal.linkedAssets !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                No Goals Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Strategic goals will appear here once they are created.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
