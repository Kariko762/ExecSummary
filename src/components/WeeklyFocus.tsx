import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface WeeklyFocusProps {
  focusItems: string[];
}

export function WeeklyFocus({ focusItems }: WeeklyFocusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6"
    >
      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-4">
        This Week's Focus
      </h3>

      <div className="space-y-3">
        {focusItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5">
              <div className="w-6 h-6 rounded-full bg-fis-raspberry flex items-center justify-center text-white text-xs font-roobert-heavy flex-shrink-0">
                {index + 1}
              </div>
            </div>
            <p className="flex-1 text-base font-roobert-light text-gray-700 dark:text-gray-300">
              {item}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-fis-eggplant/10 to-fis-navy/10 dark:from-fis-eggplant/20 dark:to-fis-navy/20 rounded-lg border border-fis-eggplant/20 dark:border-fis-eggplant/30">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 text-fis-eggplant mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-roobert-semibold text-fis-eggplant dark:text-purple-300">Focus Goal: </span>
            Drive key initiatives forward while maintaining operational excellence across Demo Services Group.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
