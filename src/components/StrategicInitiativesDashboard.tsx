import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { strategicInitiatives } from '../data/initiatives-loader';
import { StrategicInitiativeTile } from './StrategicInitiativeTile';
import { ContentModal } from './ContentModal';
import { StrategicInitiative } from '../types';

export function StrategicInitiativesDashboard() {
  const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');

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
    if (selectedTag === 'All') return strategicInitiatives;
    return strategicInitiatives.filter(initiative => 
      initiative.tags.includes(selectedTag)
    );
  }, [selectedTag]);

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
                  ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-lg'
                  : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
              }`}
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

      {/* Initiative Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInitiatives.map((initiative, index) => (
          <StrategicInitiativeTile
            key={initiative.id}
            initiative={initiative}
            onClick={() => setSelectedInitiative(initiative)}
            index={index}
          />
        ))}
      </div>

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
            className="mt-4 px-6 py-2 bg-fis-eggplant text-white rounded-lg hover:bg-fis-raspberry transition-colors"
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
