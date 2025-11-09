import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, Tag, Clock } from 'lucide-react';
import { KBArticle } from '../data/knowledge-base-loader';
import { KBCategory } from '../data/kb-categories-loader';

interface KnowledgeBaseTileProps {
  article: KBArticle;
  category?: KBCategory;
  onClick: () => void;
  index: number;
}

export function KnowledgeBaseTile({ article, category, onClick, index }: KnowledgeBaseTileProps) {
  // Calculate read time (rough estimate: 200 words per minute)
  const estimateReadTime = () => {
    let wordCount = 0;
    
    // Count words in overview
    if (article.overview) {
      wordCount += article.overview.split(' ').length;
    }
    
    // Count words in steps
    if (article.steps && Array.isArray(article.steps)) {
      article.steps.forEach((step: any) => {
        if (step.description) wordCount += step.description.split(' ').length;
      });
    }
    
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
  };

  const readTime = estimateReadTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="glass-strong card-shadow hover:card-shadow-hover rounded-2xl p-6 cursor-pointer border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-fis-eggplant transition-all duration-300"
    >
      {/* Category Badge */}
      {category && (
        <div 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{
            backgroundColor: `${category.color}15`,
            color: category.color
          }}
        >
          <BookOpen className="w-3 h-3" />
          <span className="text-xs font-roobert-semibold">{category.name}</span>
        </div>
      )}

      {/* Published Date (Subtitle) */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <Calendar className="w-3.5 h-3.5" />
        <span className="font-roobert-medium">
          {new Date(article.publishDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </span>
      </div>

      {/* Title (Main heading) */}
      <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
        {article.title}
      </h3>

      {/* Overview */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {article.overview}
      </p>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-roobert-medium"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {article.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-roobert-medium">
              +{article.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metadata Row */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        {/* Author */}
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span className="font-roobert-medium">{article.author}</span>
        </div>
        
        {/* Read Time */}
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="font-roobert-medium">{readTime}</span>
        </div>
      </div>
    </motion.div>
  );
}
