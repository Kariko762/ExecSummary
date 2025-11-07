import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ConfirmationButton {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  closeAfter?: boolean; // Close modal after action
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'info' | 'warning' | 'success' | 'danger';
  buttons: ConfirmationButton[];
  showCloseButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttons,
  showCloseButton = true
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getButtonClasses = (variant: string = 'secondary') => {
    const base = "px-6 py-2.5 rounded-lg font-roobert-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${base} bg-fis-eggplant text-white hover:bg-fis-eggplant/90`;
      case 'danger':
        return `${base} bg-red-600 text-white hover:bg-red-700`;
      case 'success':
        return `${base} bg-green-600 text-white hover:bg-green-700`;
      case 'secondary':
      default:
        return `${base} bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600`;
    }
  };

  const handleButtonClick = (button: ConfirmationButton) => {
    button.action();
    if (button.closeAfter !== false) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>

            {/* Title */}
            <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                {message}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(button)}
                  className={getButtonClasses(button.variant)}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
