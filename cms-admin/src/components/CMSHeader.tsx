import { motion } from 'framer-motion';
import { Moon, Sun, Database } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const CMSHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src="/FIS-Logo.png" 
              alt="FIS Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                ContentIQ
              </h1>
              <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                Executive Dashboard CMS
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.div className="px-4 py-2 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-roobert-medium">
              ● Backend Connected
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:glass-strong transition-all"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
