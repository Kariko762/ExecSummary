import { useState, useEffect } from 'react';
import { Target, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Goal {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  owner: string;
  status: string;
  priority: string;
  smartGoal?: {
    statement: string;
  };
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

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-roobert-semibold text-white">
                Strategic Goals
              </h1>
              <p className="text-white/70 mt-1">
                Browse and explore all strategic goals and initiatives
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-white/60">
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
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-xl group-hover:scale-110 transition-transform">
                        <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <motion.div
                        animate={{ rotate: 0 }}
                        whileHover={{ rotate: 45 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {goal.name}
                    </h3>

                    {goal.smartGoal?.statement && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 font-roobert-light">
                        {goal.smartGoal.statement}
                      </p>
                    )}

                    {/* Stats Footer */}
                    <div className="flex items-center gap-2 flex-wrap text-xs border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <span className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-roobert-medium capitalize">
                        {goal.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.status === 'complete' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        goal.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {goal.priority}
                      </span>
                    </div>
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
