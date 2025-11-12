import { useEffect } from 'react';

/**
 * Design System CSS Variable Injector
 * 
 * This component runs on app load and injects all design system colors
 * as CSS custom properties into the :root element.
 * 
 * Also auto-generates light and dark variants for semantic colors.
 */

interface ColorDefinition {
  key: string;
  label: string;
  value: string;
  description: string;
}

const STORAGE_KEY = 'design-system-v2';

const DEFAULT_FONTS = {
  // Base font families
  primary: 'Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: 'Roobert Medium, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: 'Courier New, Monaco, Consolas, monospace',
  
  // Typography variants (derived from Typography panel)
  header: 'Roobert, sans-serif',           // Main section headers
  title: 'Roobert Medium, sans-serif',     // Card/component titles
  subtitle: 'Roobert Medium, sans-serif',  // Secondary headings
  label: 'Roobert Medium, sans-serif',     // Field labels
  fieldLabel: 'Roobert, sans-serif',       // Small field labels
  body: 'Roobert, sans-serif',             // Body text
  bodySmall: 'Roobert, sans-serif',        // Small body text
  quote: 'Roobert, sans-serif',            // Quotes
  code: 'Courier New, monospace',          // Code blocks
  chartLabel: 'Roobert, sans-serif',       // Chart labels
  chartValue: 'Roobert Medium, sans-serif' // Chart values
};

const DEFAULT_COLORS: ColorDefinition[] = [
  // Brand Colors
  { key: 'brand-primary', label: 'Brand Primary', value: '#431C5B', description: 'Primary brand color (Eggplant)' },
  { key: 'brand-secondary', label: 'Brand Secondary', value: '#B21A53', description: 'Secondary brand color (Raspberry)' },
  { key: 'brand-tertiary', label: 'Brand Tertiary', value: '#1D1F48', description: 'Tertiary brand color (Navy)' },
  
  // Accent Colors
  { key: 'accent-blue', label: 'Accent Blue', value: '#3B82F6', description: 'Blue accent' },
  { key: 'accent-green', label: 'Accent Green', value: '#4BCD3E', description: 'FIS Brand Green accent' },
  { key: 'accent-yellow', label: 'Accent Yellow', value: '#F59E0B', description: 'Yellow accent' },
  { key: 'accent-red', label: 'Accent Red', value: '#EF4444', description: 'Red accent' },
  
  // Semantic Colors
  { key: 'semantic-info', label: 'Info', value: '#3B82F6', description: 'Information state' },
  { key: 'semantic-success', label: 'Success', value: '#10B981', description: 'Success state' },
  { key: 'semantic-warning', label: 'Warning', value: '#F59E0B', description: 'Warning state' },
  { key: 'semantic-error', label: 'Error', value: '#EF4444', description: 'Error state' },
  
  // Surface Colors
  { key: 'surface-base', label: 'Surface Base', value: '#FFFFFF', description: 'Base surface color' },
  { key: 'surface-card', label: 'Surface Card', value: '#F9FAFB', description: 'Card surface color' },
  { key: 'surface-elevated', label: 'Surface Elevated', value: '#FFFFFF', description: 'Elevated surface color' },
  
  // Border Colors
  { key: 'border-subtle', label: 'Border Subtle', value: '#F3F4F6', description: 'Subtle border' },
  { key: 'border-default', label: 'Border Default', value: '#E5E7EB', description: 'Default border' },
  { key: 'border-strong', label: 'Border Strong', value: '#D1D5DB', description: 'Strong border' },
  { key: 'border-accent', label: 'Border Accent', value: '#6B1B5E', description: 'Accent border' },
  
  // Text Colors
  { key: 'text-primary', label: 'Text Primary', value: '#111827', description: 'Primary text' },
  { key: 'text-secondary', label: 'Text Secondary', value: '#6B7280', description: 'Secondary text' },
  { key: 'text-tertiary', label: 'Text Tertiary', value: '#9CA3AF', description: 'Tertiary text' },
  { key: 'text-inverse', label: 'Text Inverse', value: '#FFFFFF', description: 'Inverse text (on dark)' },
];

// Helper function to generate light tint (mix with white)
const generateLightTint = (hexColor: string, percentage: number = 85): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const white = 255;
  const mixedR = Math.round(r + (white - r) * (percentage / 100));
  const mixedG = Math.round(g + (white - g) * (percentage / 100));
  const mixedB = Math.round(b + (white - b) * (percentage / 100));
  
  return `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
};

// Helper function to generate dark shade (mix with black)
const generateDarkShade = (hexColor: string, percentage: number = 30): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const darkenedR = Math.round(r * (1 - percentage / 100));
  const darkenedG = Math.round(g * (1 - percentage / 100));
  const darkenedB = Math.round(b * (1 - percentage / 100));
  
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
};

export default function DesignSystemInjector() {
  useEffect(() => {
    // Load design system from localStorage or use defaults
    let colors = DEFAULT_COLORS;
    let fonts = DEFAULT_FONTS;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.colors) {
          colors = parsed.colors;
        }
        if (parsed.fonts) {
          fonts = parsed.fonts;
        }
      }
    } catch (error) {
      console.error('Failed to load saved design system:', error);
    }

    // Inject all variables into :root
    const root = document.documentElement;
    
    // Inject font variables for all typography types
    Object.entries(fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value as string);
    });
    
    // Inject color variables
    colors.forEach((color: ColorDefinition) => {
      root.style.setProperty(`--${color.key}`, color.value);
      
      // Auto-generate light and dark variants for semantic colors
      if (color.key.startsWith('semantic-')) {
        const lightTint = generateLightTint(color.value, 85);
        const darkShade = generateDarkShade(color.value, 30);
        
        root.style.setProperty(`--${color.key}-light`, lightTint);
        root.style.setProperty(`--${color.key}-dark`, darkShade);
      }
    });

    console.log('✅ Design System: CSS variables injected', {
      totalColors: colors.length,
      semanticVariants: colors.filter(c => c.key.startsWith('semantic-')).length * 2, // light + dark
      fonts: Object.keys(fonts).length
    });
  }, []); // Run once on mount

  // This component has no UI
  return null;
}
