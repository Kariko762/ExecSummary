import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

type ProcessingOverlayProps = {
  isOpen: boolean;
  message?: string | null;
};

export default function ProcessingOverlay({ isOpen, message }: ProcessingOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/90 px-6 py-5 shadow-2xl"
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-slate-700/70" />
              <div
                className="absolute inset-1 rounded-full border-2"
                style={{ borderColor: '#4bcd3e' }}
              />
              <RefreshCw className="h-6 w-6 animate-spin" style={{ color: '#4bcd3e' }} />
            </div>
            <div className="text-center">
              <div className="text-sm font-roobert-semibold text-white">Processing</div>
              <div className="text-xs text-slate-300">{message || 'Working on it...'}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
