/**
 * Design System Loader
 * 
 * Fetches centralized design system from backend API and injects
 * CSS custom properties into the :root element.
 * 
 * This ensures all colors and fonts are loaded from a single source
 * of truth that can be managed via the CMS Design System Manager.
 */

interface ColorDefinition {
  key: string;
  label: string;
  value: string;
  description: string;
}

interface FontDefinition {
  primary: string;
  secondary: string;
  mono: string;
  header: string;
  title: string;
  subtitle: string;
  label: string;
  fieldLabel: string;
  body: string;
  bodySmall: string;
  quote: string;
  code: string;
  chartLabel: string;
  chartValue: string;
}

interface DesignSystemProfile {
  colors: ColorDefinition[];
  fonts: FontDefinition;
}

interface DesignSystemData {
  version: string;
  timestamp: string;
  light: DesignSystemProfile;
  dark: DesignSystemProfile;
  activeTheme: 'light' | 'dark';
}

// Default fallback colors (FIS Brand Palette)
const DEFAULT_COLORS: ColorDefinition[] = [
  { key: 'brand-primary', label: 'Brand Primary', value: '#431C5B', description: 'Primary brand color (Eggplant)' },
  { key: 'brand-secondary', label: 'Brand Secondary', value: '#B21A53', description: 'Secondary brand color (Raspberry)' },
  { key: 'brand-tertiary', label: 'Brand Tertiary', value: '#1D1F48', description: 'Tertiary brand color (Navy)' },
  { key: 'accent-blue', label: 'Accent Blue', value: '#3B82F6', description: 'Blue accent' },
  { key: 'accent-green', label: 'Accent Green', value: '#4BCD3E', description: 'FIS Brand Green accent' },
  { key: 'accent-yellow', label: 'Accent Yellow', value: '#F59E0B', description: 'Yellow accent' },
  { key: 'accent-orange', label: 'Accent Orange', value: '#F97316', description: 'Orange accent' },
  { key: 'accent-red', label: 'Accent Red', value: '#EF4444', description: 'Red accent' },
  { key: 'accent-purple', label: 'Accent Purple', value: '#8B4789', description: 'Purple accent' },
  { key: 'semantic-info', label: 'Info', value: '#3B82F6', description: 'Information state' },
  { key: 'semantic-success', label: 'Success', value: '#10B981', description: 'Success state' },
  { key: 'semantic-warning', label: 'Warning', value: '#F59E0B', description: 'Warning state' },
  { key: 'semantic-error', label: 'Error', value: '#EF4444', description: 'Error state' },
  { key: 'surface-base', label: 'Surface Base', value: '#FFFFFF', description: 'Base surface color' },
  { key: 'surface-card', label: 'Surface Card', value: '#F9FAFB', description: 'Card surface color' },
  { key: 'surface-elevated', label: 'Surface Elevated', value: '#FFFFFF', description: 'Elevated surface color' },
  { key: 'border-subtle', label: 'Border Subtle', value: '#F3F4F6', description: 'Subtle border' },
  { key: 'border-default', label: 'Border Default', value: '#E5E7EB', description: 'Default border' },
  { key: 'border-strong', label: 'Border Strong', value: '#D1D5DB', description: 'Strong border' },
  { key: 'border-accent', label: 'Border Accent', value: '#6B1B5E', description: 'Accent border' },
  { key: 'text-primary', label: 'Text Primary', value: '#111827', description: 'Primary text' },
  { key: 'text-secondary', label: 'Text Secondary', value: '#6B7280', description: 'Secondary text' },
  { key: 'text-tertiary', label: 'Text Tertiary', value: '#9CA3AF', description: 'Tertiary text' },
  { key: 'text-inverse', label: 'Text Inverse', value: '#FFFFFF', description: 'Inverse text (on dark backgrounds)' },
];

const DEFAULT_FONTS: FontDefinition = {
  primary: 'Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: 'Roobert Medium, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: 'Courier New, Monaco, Consolas, monospace',
  header: 'Roobert Heavy, sans-serif',
  title: 'Roobert Medium, sans-serif',
  subtitle: 'Roobert Medium, sans-serif',
  label: 'Roobert Medium, sans-serif',
  fieldLabel: 'Roobert Light, sans-serif',
  body: 'Roobert, sans-serif',
  bodySmall: 'Roobert, sans-serif',
  quote: 'Roobert, sans-serif',
  code: 'Courier New, monospace',
  chartLabel: 'Roobert, sans-serif',
  chartValue: 'Roobert Medium, sans-serif',
};

// Helper function to generate light tint (mix with white)
const generateLightTint = (hexColor: string, percentage: number = 85): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const tintR = Math.round(r + (255 - r) * (percentage / 100));
  const tintG = Math.round(g + (255 - g) * (percentage / 100));
  const tintB = Math.round(b + (255 - b) * (percentage / 100));
  
  return `#${tintR.toString(16).padStart(2, '0')}${tintG.toString(16).padStart(2, '0')}${tintB.toString(16).padStart(2, '0')}`;
};

// Helper function to generate dark shade (mix with black)
const generateDarkShade = (hexColor: string, percentage: number = 70): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const shadeR = Math.round(r * (percentage / 100));
  const shadeG = Math.round(g * (percentage / 100));
  const shadeB = Math.round(b * (percentage / 100));
  
  return `#${shadeR.toString(16).padStart(2, '0')}${shadeG.toString(16).padStart(2, '0')}${shadeB.toString(16).padStart(2, '0')}`;
};

/**
 * Load design system from backend API and inject CSS variables
 */
export async function loadDesignSystem(): Promise<void> {
  let colors = DEFAULT_COLORS;
  let fonts = DEFAULT_FONTS;
  
  try {
    // Try to load from API first
    const response = await fetch('http://localhost:3001/api/design-system');
    if (response.ok) {
      const data: DesignSystemData = await response.json();
      // Use active theme (light or dark)
      const activeProfile = data[data.activeTheme] || data.light;
      if (activeProfile.colors) {
        colors = activeProfile.colors;
      }
      if (activeProfile.fonts) {
        fonts = activeProfile.fonts;
      }
      console.log('✅ Design System Loader: Loaded from API', { 
        theme: data.activeTheme,
        colors: colors.length,
        fonts: Object.keys(fonts).length 
      });
    } else {
      throw new Error('API not available');
    }
  } catch (error) {
    console.warn('⚠️ Design System Loader: API failed, using defaults', error);
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

  console.log('✅ Frontend Design System: CSS variables injected', {
    totalColors: colors.length,
    semanticVariants: colors.filter(c => c.key.startsWith('semantic-')).length * 2, // light + dark
    fonts: Object.keys(fonts).length
  });
}
