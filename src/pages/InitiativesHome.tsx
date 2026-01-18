import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ChevronRight, Users } from 'lucide-react';
import ViewInitiativeModal from '../components/ViewInitiativeModal';

interface Initiative {
  id: string;
  name: string;
  shortName?: string;
  icon?: string;
  category: string;
  status: string;
  priority: string;
  progress?: number;
  owner?: string;
  linkedAssets?: number;
  linkedGoals?: string[];
  smartGoal?: {
    statement?: string;
    measurable?: {
      metrics?: string[];
    };
  };
  [key: string]: any; // For additional properties
}

export default function InitiativesHome() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInitiative, setSelectedInitiative] = useState<any | null>(null);
  const [linkedGoals, setLinkedGoals] = useState<any[]>([]);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/initiatives');
      const data = await response.json();
      if (data.success) {
        setInitiatives(data.initiatives);
      }
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiativeClick = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/initiatives/${id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedInitiative(data.initiative);
        setLinkedGoals(data.linkedGoals || []);
      }
    } catch (error) {
      console.error('Error fetching initiative details:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedInitiative(null);
    setLinkedGoals([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fis-navy dark:border-fis-raspberry mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading initiatives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="relative overflow-hidden">
        {/* Hero Header with Navy/Raspberry Gradient */}
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="initiatives-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
                <pattern id="initiatives-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#initiatives-grid)" />
              <rect width="100%" height="100%" fill="url(#initiatives-lines)" />
            </svg>
          </div>

          {/* Floating Shapes */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
          />

          {/* Header Content */}
          <div className="relative max-w-7xl mx-auto px-4 2xl:px-6 py-4 2xl:py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 2xl:gap-3 mb-2 2xl:mb-4"
            >
              <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <Rocket className="w-5 h-5 2xl:w-6 2xl:h-6" />
              </div>
              <div>
                <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5">
                  Strategic Initiatives
                </h1>
                <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                  Key projects driving organizational transformation
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden 2xl:grid grid-cols-1 md:grid-cols-3 gap-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold">{initiatives.length}</div>
                <div className="text-white/80 text-[11px] font-roobert-medium">Total Initiatives</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-xl font-roobert-bold">
                  {initiatives.filter(i => i.status === 'in-progress').length}
                </div>
                <div className="text-white/80 text-[11px] font-roobert-medium">In Progress</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="text-white/80 text-[11px] font-roobert-medium mb-2">Status Overview</div>
                <div className="h-6 bg-white/10 rounded-full overflow-hidden flex mb-2">
                  {initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length > 0 && (
                    <div 
                      className="bg-green-500 hover:bg-green-600 transition-colors" 
                      style={{ width: `${(initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length / initiatives.length) * 100}%` }}
                      title={`Completed: ${initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length}`}
                    />
                  )}
                  {initiatives.filter(i => i.status === 'in-progress').length > 0 && (
                    <div 
                      className="bg-blue-500 hover:bg-blue-600 transition-colors" 
                      style={{ width: `${(initiatives.filter(i => i.status === 'in-progress').length / initiatives.length) * 100}%` }}
                      title={`In Progress: ${initiatives.filter(i => i.status === 'in-progress').length}`}
                    />
                  )}
                  {initiatives.filter(i => i.status === 'at-risk').length > 0 && (
                    <div 
                      className="bg-orange-500 hover:bg-orange-600 transition-colors" 
                      style={{ width: `${(initiatives.filter(i => i.status === 'at-risk').length / initiatives.length) * 100}%` }}
                      title={`At Risk: ${initiatives.filter(i => i.status === 'at-risk').length}`}
                    />
                  )}
                  {initiatives.filter(i => i.status === 'on-hold').length > 0 && (
                    <div 
                      className="bg-yellow-500 hover:bg-yellow-600 transition-colors" 
                      style={{ width: `${(initiatives.filter(i => i.status === 'on-hold').length / initiatives.length) * 100}%` }}
                      title={`On Hold: ${initiatives.filter(i => i.status === 'on-hold').length}`}
                    />
                  )}
                  {initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length > 0 && (
                    <div 
                      className="bg-gray-500 hover:bg-gray-600 transition-colors" 
                      style={{ width: `${(initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length / initiatives.length) * 100}%` }}
                      title={`Planning: ${initiatives.filter(i => i.status === 'planning' || i.status === 'not-started').length}`}
                    />
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/70">
                  <span>{initiatives.filter(i => i.status === 'completed' || i.status === 'complete').length} Done</span>
                  <span>{initiatives.filter(i => i.status === 'at-risk').length} At Risk</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          {initiatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative, index) => (
                <motion.div
                  key={initiative.id}
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
                  onClick={() => handleInitiativeClick(initiative.id)}
                  className="relative bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer group overflow-hidden shadow-md hover:shadow-2xl transition-shadow"
                >
                  {/* Gradient Overlay on Hover - Navy to Raspberry */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/0 via-fis-navy/0 to-fis-raspberry/0 group-hover:from-blue-900/10 group-hover:via-fis-navy/5 group-hover:to-fis-raspberry/10 transition-all duration-500 rounded-xl" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-2 group-hover:text-fis-navy dark:group-hover:text-fis-raspberry transition-colors">
                      {initiative.name}
                    </h3>
                    
                    {initiative.shortName && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
                        {initiative.shortName}
                      </span>
                    )}

                    {initiative.smartGoal?.statement && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 font-roobert-light">
                        {initiative.smartGoal.statement}
                      </p>
                    )}

                    {/* Progress Bar - Navy to Raspberry gradient */}
                    {initiative.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-roobert-semibold text-gray-900 dark:text-white">{initiative.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fis-navy to-fis-raspberry transition-all"
                            style={{ width: `${initiative.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Key Metrics Preview */}
                    {initiative.smartGoal?.measurable?.metrics && initiative.smartGoal.measurable.metrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {initiative.smartGoal.measurable.metrics.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5 font-roobert-medium truncate">
                              {metric.split(':')[0]}
                            </div>
                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white truncate">
                              {metric.split(':')[1] || metric}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stats Footer */}
                    <div className="flex items-center gap-2 flex-wrap text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-roobert-medium capitalize">
                        {initiative.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        initiative.status === 'complete' || initiative.status === 'achieved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        initiative.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        initiative.status === 'at-risk' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        initiative.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {initiative.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full font-roobert-medium capitalize ${
                        initiative.priority === 'high' || initiative.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                        initiative.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {initiative.priority}
                      </span>
                    </div>
                    
                    {/* Owner & Assets Footer */}
                    {(initiative.owner || initiative.linkedAssets !== undefined || initiative.linkedGoals !== undefined) && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        {initiative.owner && (
                          <span className="flex items-center gap-1 font-roobert-medium">
                            <Users className="w-3 h-3" />
                            {initiative.owner}
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          {initiative.linkedGoals !== undefined && initiative.linkedGoals.length > 0 && (
                            <span className="font-roobert-medium">
                              {initiative.linkedGoals.length} goal{initiative.linkedGoals.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {initiative.linkedAssets !== undefined && (
                            <span className="font-roobert-medium">
                              {initiative.linkedAssets} asset{initiative.linkedAssets !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                No Initiatives Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Strategic initiatives will appear here once they are created.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedInitiative && (
        <ViewInitiativeModal
          initiative={selectedInitiative}
          linkedGoals={linkedGoals}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
