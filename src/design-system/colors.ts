/**
 * FIS Executive Summary - Design System Color Palette
 * 
 * Centralized color scheme management for consistent UI/UX
 * across all components, renderers, and views.
 */

export interface ColorScheme {
  // Primary brand colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgGlass: string;
  
  // Border colors
  borderLight: string;
  borderMedium: string;
  borderDark: string;
  
  // Interactive states
  hover: string;
  active: string;
  focus: string;
  disabled: string;
}

/**
 * Design System Color Roles
 * Defines what color to use for specific UI purposes
 */
export const DesignSystem = {
  // LABELS - The small descriptive text (like "Demos Registered:", "Revenue:", etc.)
  label: {
    light: 'text-xs font-roobert-medium text-fis-eggplant',
    dark: 'text-xs font-roobert-medium text-fis-raspberry',
    combined: 'text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry',
  },

  // HEADINGS - Section titles, card headers, etc.
  heading: {
    primary: {
      light: 'text-gray-900 font-roobert-heavy',
      dark: 'text-white font-roobert-heavy',
      combined: 'text-gray-900 dark:text-white font-roobert-heavy',
    },
    secondary: {
      light: 'text-gray-700 font-roobert-semibold',
      dark: 'text-gray-300 font-roobert-semibold',
      combined: 'text-gray-700 dark:text-gray-300 font-roobert-semibold',
    },
  },

  // BODY TEXT - Regular content text
  body: {
    primary: {
      light: 'text-gray-900 font-roobert-regular',
      dark: 'text-white font-roobert-regular',
      combined: 'text-gray-900 dark:text-white font-roobert-regular',
    },
    secondary: {
      light: 'text-gray-700 font-roobert-light',
      dark: 'text-gray-300 font-roobert-light',
      combined: 'text-gray-700 dark:text-gray-300 font-roobert-light',
    },
    muted: {
      light: 'text-gray-500 font-roobert-light',
      dark: 'text-gray-400 font-roobert-light',
      combined: 'text-gray-500 dark:text-gray-400 font-roobert-light',
    },
  },

  // VALUES - Numeric data, metric values (paired with labels)
  value: {
    primary: {
      light: 'text-gray-900 font-roobert-medium',
      dark: 'text-white font-roobert-medium',
      combined: 'text-gray-900 dark:text-white font-roobert-medium',
    },
    heavy: {
      light: 'text-gray-900 font-roobert-heavy',
      dark: 'text-white font-roobert-heavy',
      combined: 'text-gray-900 dark:text-white font-roobert-heavy',
    },
  },

  // BUTTONS
  button: {
    primary: {
      base: 'bg-fis-eggplant hover:bg-fis-eggplant/90 text-white',
      dark: 'dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90',
      combined: 'bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 text-white',
    },
    secondary: {
      base: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      dark: 'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300',
      combined: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    },
    danger: {
      base: 'bg-red-600 hover:bg-red-700 text-white',
      dark: 'dark:bg-red-500 dark:hover:bg-red-600',
      combined: 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white',
    },
  },

  // INPUTS & FORMS
  input: {
    base: {
      light: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      dark: 'dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500',
      combined: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
    },
    focus: 'focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },

  // CARDS & CONTAINERS
  card: {
    primary: {
      light: 'bg-white border-gray-300 shadow-md',
      dark: 'dark:bg-gray-800/50 dark:border-gray-700',
      combined: 'bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md',
    },
    secondary: {
      light: 'bg-gray-50 border-gray-200',
      dark: 'dark:bg-gray-800/30 dark:border-gray-700',
      combined: 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700',
    },
    glass: 'glass-strong', // Uses Tailwind custom class
  },

  // BORDERS
  border: {
    light: 'border-gray-200 dark:border-gray-800',
    medium: 'border-gray-300 dark:border-gray-700',
    dark: 'border-gray-400 dark:border-gray-600',
  },

  // STATUS INDICATORS
  status: {
    success: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    error: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
    },
    info: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700',
    },
  },

  // HELP TEXT & HINTS
  hint: {
    light: 'text-xs text-gray-500',
    dark: 'text-xs text-gray-400',
    combined: 'text-xs text-gray-500 dark:text-gray-400',
  },

  // LINKS
  link: {
    base: 'text-fis-eggplant hover:text-fis-eggplant/80 dark:text-fis-raspberry dark:hover:text-fis-raspberry/80',
    underline: 'underline decoration-fis-eggplant dark:decoration-fis-raspberry',
  },

  // BADGES & PILLS
  badge: {
    primary: 'bg-fis-eggplant/20 text-fis-eggplant dark:bg-fis-raspberry/20 dark:text-fis-raspberry',
    secondary: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },

  // DIVIDERS
  divider: {
    light: 'border-gray-200 dark:border-gray-800',
    medium: 'border-gray-300 dark:border-gray-700',
    gradient: 'bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent',
  },
} as const;

/**
 * Utility function to get consistent class combinations
 */
export const getClasses = {
  /** Standard label styling (for "Demos Registered:", "Revenue:", etc.) */
  label: () => DesignSystem.label.combined,
  
  /** Primary heading */
  h1: () => `text-2xl ${DesignSystem.heading.primary.combined}`,
  
  /** Secondary heading */
  h2: () => `text-xl ${DesignSystem.heading.secondary.combined}`,
  
  /** Body text - primary */
  text: () => `text-sm ${DesignSystem.body.primary.combined}`,
  
  /** Body text - muted */
  textMuted: () => `text-sm ${DesignSystem.body.muted.combined}`,
  
  /** Metric value (paired with label) */
  value: () => `text-sm ${DesignSystem.value.primary.combined}`,
  
  /** Large metric value */
  valueHeavy: () => `text-2xl ${DesignSystem.value.heavy.combined}`,
  
  /** Standard input field */
  input: () => `w-full px-3 py-2 rounded-lg ${DesignSystem.input.base.combined} ${DesignSystem.input.focus} ${DesignSystem.input.disabled}`,
  
  /** Standard card */
  card: () => `rounded-xl p-6 ${DesignSystem.card.primary.combined}`,
  
  /** Primary button */
  buttonPrimary: () => `px-4 py-2 rounded-lg font-roobert-medium transition-colors ${DesignSystem.button.primary.combined}`,
  
  /** Secondary button */
  buttonSecondary: () => `px-4 py-2 rounded-lg font-roobert-medium transition-colors ${DesignSystem.button.secondary.combined}`,
  
  /** Help text */
  hint: () => DesignSystem.hint.combined,
} as const;

/**
 * Export individual color tokens for direct access
 */
export const Colors = {
  // FIS Brand
  eggplant: '#552583',
  raspberry: '#e31c79',
  navy: '#002f6c',
  green: '#3bcd3e',
  
  // Grays (light mode)
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // State colors
  success: '#3bcd3e',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',
} as const;
