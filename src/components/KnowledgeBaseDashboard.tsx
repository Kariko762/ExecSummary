import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { kbArticles, KBArticle } from '../data/knowledge-base-loader';
import { kbCategories } from '../data/kb-categories-loader';
import { KnowledgeBaseTile } from './KnowledgeBaseTile';
import { ContentModal } from './ContentModal';
import { BookOpen, Search, Filter } from 'lucide-react';

export function KnowledgeBaseDashboard() {
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return kbArticles.filter(article => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div id="knowledge-base" className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-fis-raspberry" />
          <h2 className="text-4xl font-roobert-heavy text-gray-900 dark:text-white">
            Knowledge Base
          </h2>
        </div>
        <p className="text-lg font-roobert-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Documentation, guides, and best practices
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles, tags, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry font-roobert-regular"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-11 pr-10 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry font-roobert-medium cursor-pointer min-w-[200px]"
            >
              <option value="all">All Categories</option>
              {kbCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 font-roobert-medium">
          {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
        </div>
      </motion.div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => {
            const category = kbCategories.find(cat => cat.id === article.category);
            return (
              <KnowledgeBaseTile
                key={article.id}
                article={article}
                category={category}
                onClick={() => setSelectedArticle(article)}
                index={index}
              />
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg font-roobert-medium text-gray-500 dark:text-gray-400">
            No articles found matching your search
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try adjusting your filters or search terms
          </p>
        </motion.div>
      )}

      {/* Content Modal */}
      {selectedArticle && (
        <ContentModal 
          content={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
