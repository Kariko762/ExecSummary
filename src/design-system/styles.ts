/**
 * Style Utilities Design System
 * 
 * Visual style variants and utilities that templates can reference.
 * Works with the existing DesignSystem from colors.ts
 */

/**
 * Container/Card Variants
 */
export const variants = {
  flat: 'bg-white dark:bg-gray-900',
  elevated: 'bg-white dark:bg-gray-800/50 shadow-md',
  outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-700',
  glass: 'glass-strong', // Uses existing Tailwind custom class
  subtle: 'bg-gray-50 dark:bg-gray-800/30',
} as const;

/**
 * Shadow Levels
 */
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
} as const;

/**
 * Border Radius
 */
export const rounded = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Border Styles
 */
export const borders = {
  none: 'border-0',
  subtle: 'border border-gray-200 dark:border-gray-800',
  default: 'border border-gray-300 dark:border-gray-700',
  strong: 'border-2 border-gray-400 dark:border-gray-600',
  accent: 'border-2 border-fis-eggplant dark:border-fis-raspberry',
} as const;

export type VariantKey = keyof typeof variants;
export type ShadowKey = keyof typeof shadows;
export type RoundedKey = keyof typeof rounded;
export type BorderKey = keyof typeof borders;

/**
 * Get style class by key and type
 */
export const getStyle = {
  variant: (key: VariantKey | string): string => {
    if (key in variants) return variants[key as VariantKey];
    console.warn(`Variant "${key}" not found, using flat`);
    return variants.flat;
  },
  
  shadow: (key: ShadowKey | string): string => {
    if (key in shadows) return shadows[key as ShadowKey];
    console.warn(`Shadow "${key}" not found, using md`);
    return shadows.md;
  },
  
  rounded: (key: RoundedKey | string): string => {
    if (key in rounded) return rounded[key as RoundedKey];
    console.warn(`Rounded "${key}" not found, using lg`);
    return rounded.lg;
  },
  
  border: (key: BorderKey | string): string => {
    if (key in borders) return borders[key as BorderKey];
    console.warn(`Border "${key}" not found, using default`);
    return borders.default;
  },
};

/**
 * Complete style presets for common component patterns
 * These combine variant, shadow, rounded, and border
 */
export const stylePresets = {
  // Card styles
  card: {
    primary: `${variants.elevated} ${rounded.xl} ${borders.default}`,
    secondary: `${variants.subtle} ${rounded.lg} ${borders.subtle}`,
    glass: `${variants.glass} ${rounded.xl}`,
    flat: `${variants.flat} ${rounded.lg}`,
  },
  
  // Chart container styles
  chart: {
    elevated: `${variants.elevated} ${rounded.lg} ${shadows.md}`,
    flat: `${variants.flat} ${rounded.md}`,
    outlined: `${variants.outlined} ${rounded.lg}`,
  },
  
  // Section container styles
  section: {
    default: `${variants.flat} ${rounded.none}`,
    elevated: `${variants.elevated} ${rounded.xl} ${shadows.sm}`,
    subtle: `${variants.subtle} ${rounded.lg}`,
  },
  
  // Modal/overlay styles
  modal: {
    default: `${variants.elevated} ${rounded.xl} ${shadows['2xl']}`,
    glass: `${variants.glass} ${rounded.xl}`,
  },
} as const;

export type StylePresetCategory = keyof typeof stylePresets;

/**
 * Get complete style preset
 */
export function getStylePreset(
  category: StylePresetCategory,
  key: string
): string {
  const preset = stylePresets[category];
  if (key in preset) {
    return preset[key as keyof typeof preset];
  }
  
  // Fallback to first key in category
  const firstKey = Object.keys(preset)[0];
  console.warn(`Style preset "${key}" not found in "${category}", using ${firstKey}`);
  return preset[firstKey as keyof typeof preset];
}
