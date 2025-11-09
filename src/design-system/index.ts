/**
 * Design System Entry Point
 * 
 * Import everything you need from one place:
 * import { getClasses, DesignSystem, Colors, spacing, getSpacing } from '../design-system';
 */

// Re-export from existing design system
export { DesignSystem, getClasses, Colors, ChartColors } from './colors';
export type { ColorScheme } from './colors';

// New design system modules
export { spacing, getSpacing, spacingPatterns, getSpacingPattern } from './spacing';
export { typography, getTypography, typographyPresets, getTypographyPreset } from './typography';
export { variants, shadows, rounded, borders, getStyle, stylePresets, getStylePreset } from './styles';

// Re-export types
export type { TypographyKey, TypographyPresetKey } from './typography';
export type { VariantKey, ShadowKey, RoundedKey, BorderKey, StylePresetCategory } from './styles';
