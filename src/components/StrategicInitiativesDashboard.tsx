import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { strategicInitiatives } from '../data/initiatives-loader';
import { StrategicInitiativeTile } from './StrategicInitiativeTile';
import { ContentModal } from './ContentModal';
import { StrategicInitiative } from '../types';

export function StrategicInitiativesDashboard() {
  const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [scrollIndex, setScrollIndex] = useState(0);

  // Extract all unique tags from initiatives
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    strategicInitiatives.forEach(initiative => {
      initiative.tags.forEach(tag => tagsSet.add(tag));
    });
    return ['All', ...Array.from(tagsSet).sort()];
  }, []);

  // Filter initiatives by selected tag
  const filteredInitiatives = useMemo(() => {
    setScrollIndex(0); // Reset scroll when filter changes
    if (selectedTag === 'All') return strategicInitiatives;
    return strategicInitiatives.filter(initiative => 
      initiative.tags.includes(selectedTag)
    );
  }, [selectedTag]);

  // Pagination controls
  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredInitiatives.length / itemsPerPage);
  const visibleInitiatives = filteredInitiatives.slice(scrollIndex, scrollIndex + itemsPerPage);

  const handleScrollForward = () => {
    if (scrollIndex + itemsPerPage < filteredInitiatives.length) {
      setScrollIndex(scrollIndex + itemsPerPage);
    }
  };

  const handleScrollBackward = () => {
    if (scrollIndex - itemsPerPage >= 0) {
      setScrollIndex(scrollIndex - itemsPerPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-roobert-heavy text-gray-900 dark:text-white mb-4">
          Strategic Initiatives
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-roobert-regular max-w-3xl mx-auto">
          Explore our portfolio of strategic projects driving innovation and transformation across the organization
        </p>
      </motion.div>

      {/* Tag Filter Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-2 overflow-x-auto"
      >
        <div className="flex gap-2 min-w-max">
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag(tag)}
              className={`px-6 py-3 rounded-xl font-roobert-semibold text-sm transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
              }`}
              style={selectedTag === tag ? { background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' } : {}}
            >
              {tag}
              {tag !== 'All' && (
                <span className="ml-2 text-xs opacity-75">
                  ({strategicInitiatives.filter(i => i.tags.includes(tag)).length})
                </span>
              )}
              {tag === 'All' && (
                <span className="ml-2 text-xs opacity-75">
                  ({strategicInitiatives.length})
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Initiative Grid with Scroll Controls */}
      {filteredInitiatives.length > 0 && (
        <div className="relative">
          {/* Scroll Controls */}
          {filteredInitiatives.length > itemsPerPage && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleScrollBackward}
                disabled={scrollIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-roobert-medium">Previous</span>
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-roobert-medium">
                Showing {scrollIndex + 1}-{Math.min(scrollIndex + itemsPerPage, filteredInitiatives.length)} of {filteredInitiatives.length}
              </span>
              <button
                onClick={handleScrollForward}
                disabled={scrollIndex + itemsPerPage >= filteredInitiatives.length}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <span className="text-sm font-roobert-medium">Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Initiative Grid - Show 3 per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleInitiatives.map((initiative, index) => (
              <StrategicInitiativeTile
                key={initiative.id}
                initiative={initiative}
                onClick={() => setSelectedInitiative(initiative)}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredInitiatives.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 glass-strong rounded-2xl"
        >
          <p className="text-2xl font-roobert-medium text-gray-500 dark:text-gray-400">
            No initiatives found for "{selectedTag}"
          </p>
          <button
            onClick={() => setSelectedTag('All')}
            className="mt-4 px-6 py-2 text-white rounded-lg transition-all"
            style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, rgba(67, 28, 91, 0.9), rgba(178, 26, 83, 0.9))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))';
            }}
          >
            View All Initiatives
          </button>
        </motion.div>
      )}

      {/* Content Modal */}
      {selectedInitiative && (
        <ContentModal 
          content={selectedInitiative}
          onClose={() => setSelectedInitiative(null)}
        />
      )}
    </div>
  );
}
