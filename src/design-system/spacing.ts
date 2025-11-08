/**
 * Centralized Spacing System
 * 
 * Standardized spacing values for consistent layout across the application.
 * All components should use these values instead of arbitrary Tailwind classes.
 */

export const spacing = {
  // Container-level spacing
  container: {
    main: 'p-6',           // Main app container padding (24px)
    modal: 'p-6',          // Modal container padding (24px)
    card: 'p-4',           // Card/panel padding (16px)
    tight: 'p-2',          // Compact container (8px)
    none: 'p-0',           // No padding
  },

  // Section-level spacing
  section: {
    gap: 'space-y-6',      // Gap between major sections (24px)
    header: 'mb-4',        // Section header bottom margin (16px)
    content: 'space-y-4',  // Gap between section content items (16px)
    tight: 'space-y-2',    // Tight section spacing (8px)
    none: 'space-y-0',     // No spacing between items
  },

  // Component-level spacing
  component: {
    gap: 'gap-4',          // Gap between component elements (16px)
    tight: 'gap-2',        // Tight component gap (8px)
    loose: 'gap-6',        // Loose component gap (24px)
  },

  // Margin utilities
  margin: {
    bottom: {
      xl: 'mb-8',          // Extra large bottom margin (32px)
      lg: 'mb-6',          // Large bottom margin (24px)
      md: 'mb-4',          // Medium bottom margin (16px)
      sm: 'mb-2',          // Small bottom margin (8px)
      xs: 'mb-1',          // Extra small bottom margin (4px)
      none: 'mb-0',        // No margin
    },
    top: {
      xl: 'mt-8',          // Extra large top margin (32px)
      lg: 'mt-6',          // Large top margin (24px)
      md: 'mt-4',          // Medium top margin (16px)
      sm: 'mt-2',          // Small top margin (8px)
      xs: 'mt-1',          // Extra small top margin (4px)
      none: 'mt-0',        // No margin
    },
  },

  // Editor/CMS specific spacing
  editor: {
    containerPadding: 'p-[5px]',        // Editor container padding (5px)
    sectionHeaderMargin: 'mb-2',        // Section header margin (8px)
    contentGap: 'space-y-0',            // No gap between editor content
    controlsGap: 'gap-1.5',             // Gap between control buttons (6px)
  },
} as const;

/**
 * Helper function to get spacing class
 * Usage: getSpacing('container', 'card') => 'p-4'
 */
export function getSpacing(category: keyof typeof spacing, key: string): string {
  const category_obj = spacing[category] as any;
  return category_obj[key] || '';
}

/**
 * Common spacing patterns for specific use cases
 */
export const spacingPatterns = {
  // Dashboard layout
  dashboard: {
    container: spacing.container.main,
    sectionGap: spacing.section.gap,
    cardPadding: spacing.container.card,
  },

  // Modal layout
  modal: {
    container: spacing.container.modal,
    sectionGap: spacing.section.content,
    headerMargin: spacing.margin.bottom.lg,
  },

  // Form layout
  form: {
    container: spacing.container.card,
    fieldGap: spacing.section.content,
    labelMargin: spacing.margin.bottom.sm,
  },

  // List layout
  list: {
    container: spacing.container.tight,
    itemGap: spacing.section.tight,
    itemPadding: spacing.container.tight,
  },

  // Chart/visualization layout
  chart: {
    container: spacing.container.none,
    contentGap: spacing.section.none,
    previewPadding: spacing.container.card,
  },

  // Editor/CMS layout
  editor: {
    container: spacing.editor.containerPadding,
    sectionHeader: spacing.editor.sectionHeaderMargin,
    contentGap: spacing.editor.contentGap,
    controls: spacing.editor.controlsGap,
  },
} as const;

/**
 * Get a complete spacing pattern
 * Usage: getSpacingPattern('dashboard') => { container: 'p-6', sectionGap: 'space-y-6', ... }
 */
export function getSpacingPattern(pattern: keyof typeof spacingPatterns) {
  return spacingPatterns[pattern];
}
