/**
 * Typography Design System
 * 
 * Centralized typography definitions for all text elements.
 * Template metadata references these keys to apply consistent text styling.
 */

export const typography = {
  // Main section headers
  header: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
  
  // Card/component titles
  title: 'text-xl font-semibold text-gray-800 dark:text-gray-200',
  
  // Secondary headings
  subtitle: 'text-lg font-medium text-gray-700 dark:text-gray-300',
  
  // Field labels and small headers
  label: 'text-sm font-medium text-gray-600 dark:text-gray-400',
  
  // Small field labels (Description:, Severity:, etc.) - Roobert Light, 8px, Purple
  fieldLabel: 'text-xs font-roobert-light text-fis-eggplant dark:text-fis-raspberry',
  
  // Body text
  body: 'text-base text-gray-700 dark:text-gray-300',
  
  // Small body text
  bodySmall: 'text-sm text-gray-600 dark:text-gray-400',
  
  // Info messages
  info: 'text-sm text-blue-600 dark:text-blue-400',
  
  // Warning messages
  warning: 'text-sm text-yellow-600 dark:text-yellow-400',
  
  // Success messages
  success: 'text-sm text-green-600 dark:text-green-400',
  
  // Error messages
  error: 'text-sm text-red-600 dark:text-red-400',
  
  // Chart labels
  chartLabel: 'text-xs font-medium text-gray-600 dark:text-gray-400',
  
  // Chart values
  chartValue: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  
  // Table headers
  tableHeader: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
  
  // Table body
  tableBody: 'text-sm text-gray-600 dark:text-gray-400',
  
  // Metadata/secondary info
  meta: 'text-xs text-gray-500 dark:text-gray-500',
} as const;

export type TypographyKey = keyof typeof typography;

/**
 * Get typography class string by key
 * @param key - Typography key from design system
 * @returns Tailwind class string for typography
 */
export function getTypography(key: TypographyKey | string): string {
  if (key in typography) {
    return typography[key as TypographyKey];
  }
  
  // Fallback to body text if key not found
  console.warn(`Typography key "${key}" not found, using body as fallback`);
  return typography.body;
}

/**
 * Typography presets for common component patterns
 */
export const typographyPresets = {
  // Card header pattern
  cardHeader: {
    title: typography.title,
    subtitle: typography.subtitle,
    meta: typography.meta,
  },
  
  // Section header pattern
  sectionHeader: {
    title: typography.header,
    subtitle: typography.subtitle,
  },
  
  // Form pattern
  form: {
    label: typography.label,
    input: typography.body,
    help: typography.bodySmall,
    error: typography.error,
  },
  
  // Chart pattern
  chart: {
    title: typography.title,
    label: typography.chartLabel,
    value: typography.chartValue,
  },
  
  // Table pattern
  table: {
    header: typography.tableHeader,
    body: typography.tableBody,
  },
  
  // Status messages
  status: {
    info: typography.info,
    warning: typography.warning,
    success: typography.success,
    error: typography.error,
  },
} as const;

export type TypographyPresetKey = keyof typeof typographyPresets;

/**
 * Get typography preset by key
 * @param key - Preset key
 * @returns Object with typography classes for the preset
 */
export function getTypographyPreset(key: TypographyPresetKey): Record<string, string> {
  return typographyPresets[key];
}
