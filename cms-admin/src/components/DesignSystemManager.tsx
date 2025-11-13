import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Type, Layout, Download, Upload, RotateCcw, Save, Eye, ArrowLeft } from 'lucide-react';

/**
 * Color manipulation utilities
 */

// Convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate highlight (lighter) variants
function generateHighlight(hex: string, amount: number): string {
  const hsl = hexToHSL(hex);
  // Increase lightness, slightly reduce saturation for natural look
  const newL = Math.min(95, hsl.l + amount);
  const newS = Math.max(20, hsl.s - amount * 0.2);
  return hslToHex(hsl.h, newS, newL).toUpperCase();
}

// Generate shadow (darker) variants
function generateShadow(hex: string, amount: number): string {
  const hsl = hexToHSL(hex);
  // Decrease lightness, slightly increase saturation for richness
  const newL = Math.max(5, hsl.l - amount);
  const newS = Math.min(100, hsl.s + amount * 0.15);
  return hslToHex(hsl.h, newS, newL).toUpperCase();
}

/**
 * Design System Manager
 * 
 * Manages the centralized design system that templates reference.
 * Allows editing of:
 * - Typography styles (header, title, subtitle, label, body, etc.)
 * - Color palette (brand, accent, semantic, surface, border, text)
 * - Spacing patterns (container, section, component)
 * - Style variants (flat, elevated, glass, outlined)
 */

interface TypographyStyle {
  className: string;
  description: string;
}

interface ColorDefinition {
  key: string;
  label: string;
  value: string;
  description: string;
}

interface SpacingDefinition {
  key: string;
  label: string;
  value: string;
  description: string;
}

interface DesignSystemManagerProps {
  onClose?: () => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

interface DesignSystemProfile {
  typography: Record<string, TypographyStyle>;
  colors: ColorDefinition[];
  spacing: SpacingDefinition[];
  fonts: typeof DEFAULT_FONTS;
}

interface DesignSystemData {
  version: string;
  timestamp: string;
  light: DesignSystemProfile;
  dark: DesignSystemProfile;
  activeTheme?: 'light' | 'dark';
}

const DEFAULT_TYPOGRAPHY: Record<string, TypographyStyle> = {
  header: {
    className: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
    description: 'Main section headers',
  },
  title: {
    className: 'text-xl font-semibold text-gray-800 dark:text-gray-200',
    description: 'Card/component titles',
  },
  subtitle: {
    className: 'text-lg font-medium text-gray-700 dark:text-gray-300',
    description: 'Secondary headings',
  },
  label: {
    className: 'text-sm font-medium text-gray-600 dark:text-gray-400',
    description: 'Field labels and small headers',
  },
  fieldLabel: {
    className: 'text-xs font-roobert-light text-fis-eggplant dark:text-fis-raspberry',
    description: 'Small field labels (Description:, Severity:, etc.)',
  },
  body: {
    className: 'text-base text-gray-700 dark:text-gray-300',
    description: 'Body text',
  },
  bodySmall: {
    className: 'text-sm text-gray-600 dark:text-gray-400',
    description: 'Small body text',
  },
  info: {
    className: 'text-sm text-blue-600 dark:text-blue-400',
    description: 'Info messages',
  },
  warning: {
    className: 'text-sm text-yellow-600 dark:text-yellow-400',
    description: 'Warning messages',
  },
  success: {
    className: 'text-sm text-green-600 dark:text-green-400',
    description: 'Success messages',
  },
  error: {
    className: 'text-sm text-red-600 dark:text-red-400',
    description: 'Error messages',
  },
  chartLabel: {
    className: 'text-xs font-medium text-gray-600 dark:text-gray-400',
    description: 'Chart labels',
  },
  chartValue: {
    className: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
    description: 'Chart values',
  },
  tableHeader: {
    className: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    description: 'Table headers',
  },
  tableBody: {
    className: 'text-sm text-gray-600 dark:text-gray-400',
    description: 'Table body text',
  },
};

// Generate brand color variants (highlights and shadows)
function generateBrandColorSet(baseColor: string, name: string): ColorDefinition[] {
  return [
    { key: `brand-${name}-high-2`, label: `${name} High 2`, value: generateHighlight(baseColor, 35), description: `Lightest ${name} variant` },
    { key: `brand-${name}-high-1`, label: `${name} High 1`, value: generateHighlight(baseColor, 20), description: `Light ${name} variant` },
    { key: `brand-${name}`, label: `${name} Base`, value: baseColor, description: `Base ${name} color` },
    { key: `brand-${name}-low-1`, label: `${name} Low 1`, value: generateShadow(baseColor, 15), description: `Dark ${name} variant` },
    { key: `brand-${name}-low-2`, label: `${name} Low 2`, value: generateShadow(baseColor, 30), description: `Darkest ${name} variant` },
  ];
}

const DEFAULT_COLORS: ColorDefinition[] = [
  // Brand Colors - FIS Official Brand Palette (with calculated variants)
  ...generateBrandColorSet('#431C5B', 'primary'),
  ...generateBrandColorSet('#B21A53', 'secondary'),
  ...generateBrandColorSet('#1D1F48', 'tertiary'),
  
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

const DEFAULT_SPACING: SpacingDefinition[] = [
  // Container Spacing
  { key: 'container-main', label: 'Container Main', value: 'p-6', description: 'Main container padding' },
  { key: 'container-modal', label: 'Container Modal', value: 'p-8', description: 'Modal container padding' },
  { key: 'container-card', label: 'Container Card', value: 'p-6', description: 'Card container padding' },
  { key: 'container-tight', label: 'Container Tight', value: 'p-4', description: 'Tight container padding' },
  
  // Section Spacing
  { key: 'section-gap', label: 'Section Gap', value: 'space-y-6', description: 'Gap between sections' },
  { key: 'section-header', label: 'Section Header', value: 'mb-4', description: 'Section header margin' },
  { key: 'section-content', label: 'Section Content', value: 'space-y-4', description: 'Section content spacing' },
  
  // Component Spacing
  { key: 'component-gap', label: 'Component Gap', value: 'space-y-3', description: 'Gap between components' },
  { key: 'component-tight', label: 'Component Tight', value: 'space-y-2', description: 'Tight component gap' },
];

const STORAGE_KEY = 'design-system-v2';

const DEFAULT_FONTS = {
  // Base font families
  primary: 'Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  secondary: 'Roobert Medium, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: 'Courier New, Monaco, Consolas, monospace',
  
  // Typography variants
  header: 'Roobert, sans-serif',
  title: 'Roobert Medium, sans-serif',
  subtitle: 'Roobert Medium, sans-serif',
  label: 'Roobert Medium, sans-serif',
  fieldLabel: 'Roobert, sans-serif',
  body: 'Roobert, sans-serif',
  bodySmall: 'Roobert, sans-serif',
  quote: 'Roobert, sans-serif',
  code: 'Courier New, monospace',
  chartLabel: 'Roobert, sans-serif',
  chartValue: 'Roobert Medium, sans-serif'
};

// Font options for dropdowns
const FONT_OPTIONS = [
  // Custom Fonts
  { value: 'Roobert, sans-serif', label: 'Roobert (Regular)', category: 'Custom' },
  { value: 'Roobert Medium, sans-serif', label: 'Roobert Medium', category: 'Custom' },
  { value: 'Roobert Light, sans-serif', label: 'Roobert Light', category: 'Custom' },
  { value: 'Roobert Heavy, sans-serif', label: 'Roobert Heavy', category: 'Custom' },
  
  // Web-Safe Sans-Serif
  { value: 'Arial, sans-serif', label: 'Arial', category: 'Sans-Serif' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', category: 'Sans-Serif' },
  { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', label: 'System Font', category: 'Sans-Serif' },
  { value: 'Verdana, sans-serif', label: 'Verdana', category: 'Sans-Serif' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma', category: 'Sans-Serif' },
  
  // Web-Safe Serif
  { value: 'Georgia, serif', label: 'Georgia', category: 'Serif' },
  { value: '"Times New Roman", serif', label: 'Times New Roman', category: 'Serif' },
  { value: 'Garamond, serif', label: 'Garamond', category: 'Serif' },
  
  // Monospace
  { value: 'Courier New, monospace', label: 'Courier New', category: 'Monospace' },
  { value: 'Monaco, monospace', label: 'Monaco', category: 'Monospace' },
  { value: 'Consolas, monospace', label: 'Consolas', category: 'Monospace' },
  { value: '"Courier Prime", monospace', label: 'Courier Prime', category: 'Monospace' },
];

export default function DesignSystemManager({ onClose, onNotification }: DesignSystemManagerProps) {
  // Load from localStorage on mount
  const loadSavedData = (): { data: DesignSystemData; savedTheme: 'light' | 'dark' } => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Check if it's the new format (with light/dark profiles)
        if (parsed.light && parsed.dark) {
          return {
            data: parsed,
            savedTheme: parsed.activeTheme || 'light'
          };
        }
        // Old format - migrate to new format
        return {
          data: {
            version: '2.0.0',
            timestamp: new Date().toISOString(),
            light: {
              typography: parsed.typography || DEFAULT_TYPOGRAPHY,
              colors: parsed.colors || DEFAULT_COLORS,
              spacing: parsed.spacing || DEFAULT_SPACING,
              fonts: parsed.fonts || DEFAULT_FONTS,
            },
            dark: {
              typography: DEFAULT_TYPOGRAPHY,
              colors: [
              // Brand Colors - Dark Theme from Infographic (with calculated variants)
              ...generateBrandColorSet('#FF8C42', 'primary'),
              ...generateBrandColorSet('#00C9FF', 'secondary'),
              ...generateBrandColorSet('#B366FF', 'tertiary'),
              
              // Accent Colors - Vibrant for Dark Background
              { key: 'accent-blue', label: 'Accent Blue', value: '#06B6D4', description: 'Cyan-blue accent' },
              { key: 'accent-green', label: 'Accent Green', value: '#4BCD3E', description: 'Bright green accent' },
              { key: 'accent-yellow', label: 'Accent Yellow', value: '#FFC107', description: 'Golden yellow accent' },
              { key: 'accent-red', label: 'Accent Red', value: '#FF6B6B', description: 'Coral red accent' },
              
              // Semantic Colors - High Contrast
              { key: 'semantic-info', label: 'Info', value: '#06B6D4', description: 'Information state' },
              { key: 'semantic-success', label: 'Success', value: '#10B981', description: 'Success state' },
              { key: 'semantic-warning', label: 'Warning', value: '#FFA500', description: 'Warning state' },
              { key: 'semantic-error', label: 'Error', value: '#EF4444', description: 'Error state' },
              
              // Surface Colors - Dark Background Layers
              { key: 'surface-base', label: 'Surface Base', value: '#1F2937', description: 'Base surface color (Dark Slate)' },
              { key: 'surface-card', label: 'Surface Card', value: '#2D3748', description: 'Card surface color (Charcoal)' },
              { key: 'surface-elevated', label: 'Surface Elevated', value: '#374151', description: 'Elevated surface color' },
              
              // Border Colors - Subtle Dark Borders
              { key: 'border-subtle', label: 'Border Subtle', value: '#374151', description: 'Subtle border' },
              { key: 'border-default', label: 'Border Default', value: '#4B5563', description: 'Default border' },
              { key: 'border-strong', label: 'Border Strong', value: '#6B7280', description: 'Strong border' },
              { key: 'border-accent', label: 'Border Accent', value: '#FF8C42', description: 'Accent border (Orange)' },
              
              // Text Colors - High Contrast on Dark
              { key: 'text-primary', label: 'Text Primary', value: '#F9FAFB', description: 'Primary text (Near White)' },
              { key: 'text-secondary', label: 'Text Secondary', value: '#D1D5DB', description: 'Secondary text (Light Gray)' },
              { key: 'text-tertiary', label: 'Text Tertiary', value: '#9CA3AF', description: 'Tertiary text (Medium Gray)' },
              { key: 'text-inverse', label: 'Text Inverse', value: '#111827', description: 'Inverse text (on light)' },
            ],
            spacing: DEFAULT_SPACING,
            fonts: DEFAULT_FONTS,
          },
        },
        savedTheme: 'light'
      };
    }
    } catch (error) {
      console.error('Failed to load saved design system:', error);
    }
    // Return default profiles
    return {
      data: {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        light: {
          typography: DEFAULT_TYPOGRAPHY,
          colors: DEFAULT_COLORS,
          spacing: DEFAULT_SPACING,
          fonts: DEFAULT_FONTS,
        },
        dark: {
          typography: DEFAULT_TYPOGRAPHY,
          colors: [
            // Brand Colors - Dark Theme from Infographic (with calculated variants)
            ...generateBrandColorSet('#FF8C42', 'primary'),
            ...generateBrandColorSet('#00C9FF', 'secondary'),
            ...generateBrandColorSet('#B366FF', 'tertiary'),
            
            // Accent Colors - Vibrant for Dark Background
            { key: 'accent-blue', label: 'Accent Blue', value: '#06B6D4', description: 'Cyan-blue accent' },
            { key: 'accent-green', label: 'Accent Green', value: '#4BCD3E', description: 'Bright green accent' },
            { key: 'accent-yellow', label: 'Accent Yellow', value: '#FFC107', description: 'Golden yellow accent' },
            { key: 'accent-red', label: 'Accent Red', value: '#FF6B6B', description: 'Coral red accent' },
            
            // Semantic Colors - High Contrast
            { key: 'semantic-info', label: 'Info', value: '#06B6D4', description: 'Information state' },
            { key: 'semantic-success', label: 'Success', value: '#10B981', description: 'Success state' },
            { key: 'semantic-warning', label: 'Warning', value: '#FFA500', description: 'Warning state' },
            { key: 'semantic-error', label: 'Error', value: '#EF4444', description: 'Error state' },
            
            // Surface Colors - Dark Background Layers
            { key: 'surface-base', label: 'Surface Base', value: '#1F2937', description: 'Base surface color (Dark Slate)' },
            { key: 'surface-card', label: 'Surface Card', value: '#2D3748', description: 'Card surface color (Charcoal)' },
            { key: 'surface-elevated', label: 'Surface Elevated', value: '#374151', description: 'Elevated surface color' },
            
            // Border Colors - Subtle Dark Borders
            { key: 'border-subtle', label: 'Border Subtle', value: '#374151', description: 'Subtle border' },
            { key: 'border-default', label: 'Border Default', value: '#4B5563', description: 'Default border' },
            { key: 'border-strong', label: 'Border Strong', value: '#6B7280', description: 'Strong border' },
            { key: 'border-accent', label: 'Border Accent', value: '#FF8C42', description: 'Accent border (Orange)' },
            
            // Text Colors - High Contrast on Dark
            { key: 'text-primary', label: 'Text Primary', value: '#F9FAFB', description: 'Primary text (Near White)' },
            { key: 'text-secondary', label: 'Text Secondary', value: '#D1D5DB', description: 'Secondary text (Light Gray)' },
            { key: 'text-tertiary', label: 'Text Tertiary', value: '#9CA3AF', description: 'Tertiary text (Medium Gray)' },
            { key: 'text-inverse', label: 'Text Inverse', value: '#111827', description: 'Inverse text (on light)' },
          ],
          spacing: DEFAULT_SPACING,
          fonts: DEFAULT_FONTS,
        },
      },
      savedTheme: 'light'
    };
  };

  const { data: savedData, savedTheme } = loadSavedData();
  const [lightProfile, setLightProfile] = useState<DesignSystemProfile>(savedData.light);
  const [darkProfile, setDarkProfile] = useState<DesignSystemProfile>(savedData.dark);
  const [activeProfile, setActiveProfile] = useState<'light' | 'dark'>('light');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(savedTheme); // Which theme is currently applied
  const [pendingThemeChange, setPendingThemeChange] = useState<'light' | 'dark' | null>(null);
  const [showThemeChangeModal, setShowThemeChangeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'fonts' | 'typography' | 'colors' | 'spacing' | 'preview'>('colors');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Get current profile data based on active profile
  const currentProfile = activeProfile === 'light' ? lightProfile : darkProfile;
  const typography = currentProfile.typography;
  const colors = currentProfile.colors;
  const spacing = currentProfile.spacing;
  const fonts = currentProfile.fonts;

  // Update current profile
  const updateCurrentProfile = (updates: Partial<DesignSystemProfile>) => {
    if (activeProfile === 'light') {
      setLightProfile({ ...lightProfile, ...updates });
    } else {
      setDarkProfile({ ...darkProfile, ...updates });
    }
    setHasChanges(true);
  };

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

  // Inject CSS variables into :root based on active theme
  useEffect(() => {
    const root = document.documentElement;
    const themeProfile = activeTheme === 'light' ? lightProfile : darkProfile;
    
    // Inject all color variables from active theme
    themeProfile.colors.forEach((color: ColorDefinition) => {
      root.style.setProperty(`--${color.key}`, color.value);
      
      // Auto-generate light and dark variants for semantic colors
      if (color.key.startsWith('semantic-')) {
        const lightTint = generateLightTint(color.value, 85);
        const darkShade = generateDarkShade(color.value, 30);
        
        root.style.setProperty(`--${color.key}-light`, lightTint);
        root.style.setProperty(`--${color.key}-dark`, darkShade);
      }
    });

    // Apply dark/light class to document for Tailwind
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeTheme, lightProfile, darkProfile]);

  const handleExport = () => {
    const exportData: DesignSystemData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      light: lightProfile,
      dark: darkProfile,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-system-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotification?.('success', 'Design system exported (Light & Dark profiles)');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        // Check if it's the new format (with light/dark profiles)
        if (imported.light && imported.dark) {
          setLightProfile(imported.light);
          setDarkProfile(imported.dark);
          onNotification?.('success', 'Design system imported (Light & Dark profiles)!');
        } else {
          // Old format - import to current profile only
          const profile: DesignSystemProfile = {
            typography: imported.typography || currentProfile.typography,
            colors: imported.colors || currentProfile.colors,
            spacing: imported.spacing || currentProfile.spacing,
            fonts: imported.fonts || currentProfile.fonts,
          };
          if (activeProfile === 'light') {
            setLightProfile(profile);
          } else {
            setDarkProfile(profile);
          }
          onNotification?.('success', `Design system imported to ${activeProfile} profile!`);
        }
        
        setHasChanges(true);
      } catch (error) {
        console.error('Failed to import design system:', error);
        onNotification?.('error', 'Failed to import file. Please check the format.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    const profileName = activeProfile === 'light' ? 'Light' : 'Dark';
    const defaultProfile: DesignSystemProfile = {
      typography: DEFAULT_TYPOGRAPHY,
      colors: DEFAULT_COLORS,
      spacing: DEFAULT_SPACING,
      fonts: DEFAULT_FONTS,
    };
    
    if (activeProfile === 'light') {
      setLightProfile(defaultProfile);
    } else {
      setDarkProfile(defaultProfile);
    }
    
    setHasChanges(true);
    setShowResetModal(false);
    onNotification?.('success', `${profileName} profile reset to defaults`);
  };

  const cancelReset = () => {
    setShowResetModal(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave: DesignSystemData = {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        light: lightProfile,
        dark: darkProfile,
        activeTheme: activeTheme, // Save which theme is currently active
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      setHasChanges(false);
      onNotification?.('success', 'Design system saved successfully!');
    } catch (error) {
      console.error('Failed to save design system:', error);
      onNotification?.('error', 'Failed to save design system');
    } finally {
      setIsSaving(false);
    }
  };

  const updateColor = (key: string, value: string) => {
    let updatedColors = colors.map((c: ColorDefinition) => c.key === key ? { ...c, value } : c);
    
    // If updating a base brand color, regenerate its highlights and shadows
    const brandColorMatch = key.match(/^brand-(primary|secondary|tertiary)$/);
    if (brandColorMatch) {
      const colorName = brandColorMatch[1];
      const newVariants = generateBrandColorSet(value, colorName);
      
      // Find the position of the first variant of this color
      const firstVariantIndex = updatedColors.findIndex(c => c.key.startsWith(`brand-${colorName}`));
      
      if (firstVariantIndex !== -1) {
        // Remove old variants (all 5 shades)
        updatedColors = updatedColors.filter(c => !c.key.startsWith(`brand-${colorName}`));
        // Insert new variants at the exact same position
        updatedColors.splice(firstVariantIndex, 0, ...newVariants);
      } else {
        // Fallback: shouldn't happen, but insert in correct order
        const primaryIndex = updatedColors.findIndex(c => c.key.startsWith('brand-primary'));
        const secondaryIndex = updatedColors.findIndex(c => c.key.startsWith('brand-secondary'));
        
        let insertIndex = 0;
        if (colorName === 'primary') {
          insertIndex = 0;
        } else if (colorName === 'secondary') {
          insertIndex = primaryIndex >= 0 ? primaryIndex + 5 : 0;
        } else if (colorName === 'tertiary') {
          insertIndex = secondaryIndex >= 0 ? secondaryIndex + 5 : (primaryIndex >= 0 ? primaryIndex + 5 : 0);
        }
        
        updatedColors.splice(insertIndex, 0, ...newVariants);
      }
    }
    
    updateCurrentProfile({ colors: updatedColors });
  };

  const updateTypography = (key: string, className: string) => {
    const updatedTypography = { ...typography, [key]: { ...typography[key], className } };
    updateCurrentProfile({ typography: updatedTypography });
  };

  const updateSpacing = (key: string, value: string) => {
    const updatedSpacing = spacing.map((s: SpacingDefinition) => s.key === key ? { ...s, value } : s);
    updateCurrentProfile({ spacing: updatedSpacing });
  };

  const updateFonts = (newFonts: typeof DEFAULT_FONTS) => {
    updateCurrentProfile({ fonts: newFonts });
  };

  const handleThemeDropdownChange = (newTheme: 'light' | 'dark') => {
    if (newTheme !== activeTheme) {
      setPendingThemeChange(newTheme);
      setShowThemeChangeModal(true);
    }
  };

  const confirmThemeChange = () => {
    if (pendingThemeChange) {
      setActiveTheme(pendingThemeChange);
      // CSS variables are automatically applied via useEffect
      onNotification?.('success', `${pendingThemeChange === 'light' ? '☀️ Light' : '🌙 Dark'} theme activated`);
    }
    setShowThemeChangeModal(false);
    setPendingThemeChange(null);
  };

  const cancelThemeChange = () => {
    setShowThemeChangeModal(false);
    setPendingThemeChange(null);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-fis-eggplant dark:text-fis-raspberry" />
                  <h1 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    Design System Manager
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Configure centralized design system (DSM)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Light/Dark Profile Toggle - For Editing */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
                <button
                  onClick={() => setActiveProfile('light')}
                  className={`px-3 py-1.5 text-sm font-roobert-medium rounded transition-all ${
                    activeProfile === 'light'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setActiveProfile('dark')}
                  className={`px-3 py-1.5 text-sm font-roobert-medium rounded transition-all ${
                    activeProfile === 'dark'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Dark
                </button>
              </div>

              {/* Active Theme Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                  Active Theme:
                </label>
                <select
                  value={activeTheme}
                  onChange={(e) => handleThemeDropdownChange(e.target.value as 'light' | 'dark')}
                  className="px-3 py-1.5 text-sm font-roobert-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="light">☀️ Light</option>
                  <option value="dark">🌙 Dark</option>
                </select>
              </div>

              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-roobert-medium">Import</span>
                </div>
              </label>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-roobert-medium">Export</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-roobert-medium">Reset</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!hasChanges && !isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-fis-eggplant dark:bg-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-roobert-semibold">
                  {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                </span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <TabButton
              active={activeTab === 'fonts'}
              onClick={() => setActiveTab('fonts')}
              icon={<Type className="w-4 h-4" />}
              label="Fonts"
            />
            <TabButton
              active={activeTab === 'colors'}
              onClick={() => setActiveTab('colors')}
              icon={<Palette className="w-4 h-4" />}
              label="Colors"
            />
            <TabButton
              active={activeTab === 'typography'}
              onClick={() => setActiveTab('typography')}
              icon={<Type className="w-4 h-4" />}
              label="Typography"
            />
            <TabButton
              active={activeTab === 'spacing'}
              onClick={() => setActiveTab('spacing')}
              icon={<Layout className="w-4 h-4" />}
              label="Spacing"
            />
            <TabButton
              active={activeTab === 'preview'}
              onClick={() => setActiveTab('preview')}
              icon={<Eye className="w-4 h-4" />}
              label="Preview"
            />
          </div>
        </div>
      </div>

      {/* Theme Change Confirmation Modal */}
      <AnimatePresence>
        {showThemeChangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-fis-eggplant/10 dark:bg-fis-raspberry/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Change Active Theme?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Are you sure you want to activate the <strong>{pendingThemeChange === 'light' ? 'Light' : 'Dark'}</strong> theme? This will apply the colors, fonts, and styling from that profile to the entire application.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelThemeChange}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmThemeChange}
                      className="px-4 py-2 text-sm font-roobert-semibold bg-fis-eggplant dark:bg-fis-raspberry text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Activate {pendingThemeChange === 'light' ? 'Light' : 'Dark'} Theme
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Reset {activeProfile === 'light' ? 'Light' : 'Dark'} Profile?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This will restore all colors, fonts, typography, and spacing to their default values. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelReset}
                      className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmReset}
                      className="px-4 py-2 text-sm font-roobert-semibold bg-red-600 dark:bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'fonts' && (
          <div className="space-y-6">
            {/* Base Fonts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Base Font Families
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Primary font stacks used throughout the application
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Font
                  </label>
                  <select
                    value={fonts.primary}
                    onChange={(e) => {
                      updateFonts({ ...fonts, primary: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secondary Font
                  </label>
                  <select
                    value={fonts.secondary}
                    onChange={(e) => {
                      updateFonts({ ...fonts, secondary: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monospace Font
                  </label>
                  <select
                    value={fonts.mono}
                    onChange={(e) => {
                      updateFonts({ ...fonts, mono: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                  >
                    {FONT_OPTIONS.filter(opt => opt.category === 'Monospace').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Typography-Specific Fonts */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Typography Type Fonts
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Customize fonts for specific text types (headers, titles, body, quotes, code, etc.)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Headers & Titles */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Section Headers
                  </label>
                  <select
                    value={fonts.header}
                    onChange={(e) => {
                      updateFonts({ ...fonts, header: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Titles
                  </label>
                  <select
                    value={fonts.title}
                    onChange={(e) => {
                      updateFonts({ ...fonts, title: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Subtitles
                  </label>
                  <select
                    value={fonts.subtitle}
                    onChange={(e) => {
                      updateFonts({ ...fonts, subtitle: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Labels */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Labels
                  </label>
                  <select
                    value={fonts.label}
                    onChange={(e) => {
                      updateFonts({ ...fonts, label: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Field Labels
                  </label>
                  <select
                    value={fonts.fieldLabel}
                    onChange={(e) => {
                      updateFonts({ ...fonts, fieldLabel: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Body Text */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Body Text
                  </label>
                  <select
                    value={fonts.body}
                    onChange={(e) => {
                      updateFonts({ ...fonts, body: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Small Body Text
                  </label>
                  <select
                    value={fonts.bodySmall}
                    onChange={(e) => {
                      updateFonts({ ...fonts, bodySmall: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Special Types */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Quotes
                  </label>
                  <select
                    value={fonts.quote}
                    onChange={(e) => {
                      updateFonts({ ...fonts, quote: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Code Blocks
                  </label>
                  <select
                    value={fonts.code}
                    onChange={(e) => {
                      updateFonts({ ...fonts, code: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                  >
                    {FONT_OPTIONS.filter(opt => opt.category === 'Monospace').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Charts */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Chart Labels
                  </label>
                  <select
                    value={fonts.chartLabel}
                    onChange={(e) => {
                      updateFonts({ ...fonts, chartLabel: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Chart Values
                  </label>
                  <select
                    value={fonts.chartValue}
                    onChange={(e) => {
                      updateFonts({ ...fonts, chartValue: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'colors' && (
          <ColorsPanel colors={colors} onUpdate={updateColor} />
        )}
        
        {activeTab === 'typography' && (
          <TypographyPanel typography={typography} onUpdate={updateTypography} />
        )}
        
        {activeTab === 'spacing' && (
          <SpacingPanel spacing={spacing} onUpdate={updateSpacing} />
        )}
        
        {activeTab === 'preview' && (
          <PreviewPanel typography={typography} colors={colors} spacing={spacing} />
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors ${
        active
          ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Colors Panel
function ColorsPanel({ colors, onUpdate }: { colors: ColorDefinition[]; onUpdate: (key: string, value: string) => void }) {
  const categories = {
    'Brand Colors': colors.filter(c => c.key.startsWith('brand-')),
    'Accent Colors': colors.filter(c => c.key.startsWith('accent-')),
    'Semantic Colors': colors.filter(c => c.key.startsWith('semantic-')),
    'Surface Colors': colors.filter(c => c.key.startsWith('surface-')),
    'Border Colors': colors.filter(c => c.key.startsWith('border-')),
    'Text Colors': colors.filter(c => c.key.startsWith('text-')),
  };

  // Helper to check if color is a base brand color (not a variant)
  const isBaseBrandColor = (key: string) => {
    return key.match(/^brand-(primary|secondary|tertiary)$/);
  };

  // Get all variants for a base brand color
  const getBrandColorVariants = (baseKey: string) => {
    const match = baseKey.match(/^brand-(primary|secondary|tertiary)$/);
    if (!match) return [];
    const colorName = match[1];
    return colors.filter(c => c.key.startsWith(`brand-${colorName}`));
  };

  // Only show base brand colors, hide variants
  const displayItems = (items: ColorDefinition[]) => {
    if (items.some(c => c.key.startsWith('brand-'))) {
      return items.filter(c => isBaseBrandColor(c.key));
    }
    return items;
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
              {category}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayItems(items).map(color => {
              const isBrand = isBaseBrandColor(color.key);
              const variants = isBrand ? getBrandColorVariants(color.key) : [];
              
              return (
                <div
                  key={color.key}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-end gap-2 mb-2">
                    <div
                      className="w-14 h-14 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-end">
                      <div className="font-roobert-medium text-xs text-gray-900 dark:text-white truncate">
                        {color.label}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate mb-2">
                        {color.key}
                      </div>
                      
                      {/* Show variants as small color boxes for brand colors */}
                      {isBrand && variants.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {variants.map(variant => (
                            <div
                              key={variant.key}
                              className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
                              style={{ backgroundColor: variant.value }}
                              title={variant.label}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={color.value}
                    onChange={(e) => onUpdate(color.key, e.target.value)}
                    className="w-full px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                    placeholder="#RRGGBB"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Typography Panel
function TypographyPanel({ typography, onUpdate }: { typography: Record<string, TypographyStyle>; onUpdate: (key: string, className: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {Object.entries(typography).map(([key, style]) => (
        <div
          key={key}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-0.5">
                {key}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                {style.description}
              </div>
              <textarea
                value={style.className}
                onChange={(e) => onUpdate(key, e.target.value)}
                className="w-full h-16 px-2 py-1.5 text-[11px] font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded resize-none"
              />
            </div>
            <div className="flex-shrink-0 w-32 h-16 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded text-center px-2">
              <div className={style.className + ' text-xs'}>
                Sample
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Spacing Panel
function SpacingPanel({ spacing, onUpdate }: { spacing: SpacingDefinition[]; onUpdate: (key: string, value: string) => void }) {
  const categories = {
    'Container Spacing': spacing.filter(s => s.key.startsWith('container.')),
    'Section Spacing': spacing.filter(s => s.key.startsWith('section.')),
    'Component Spacing': spacing.filter(s => s.key.startsWith('component.')),
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-3">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(item => (
              <div
                key={item.key}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="font-roobert-medium text-xs text-gray-900 dark:text-white mb-0.5">
                  {item.label}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mb-2">
                  {item.key}
                </div>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => onUpdate(item.key, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                  placeholder="e.g., p-6, space-y-4"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Preview Panel
function PreviewPanel({ typography, colors }: { typography: Record<string, TypographyStyle>; colors: ColorDefinition[]; spacing: SpacingDefinition[] }) {
  const brandPrimary = colors.find(c => c.key === 'brand.primary')?.value || '#6B1B5E';
  
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
        <h2 className="text-xl font-roobert-semibold text-gray-900 dark:text-white mb-6">
          Design System Preview
        </h2>
        
        {/* Typography Samples */}
        <div className="space-y-4 mb-8">
          <div className={typography.header.className}>Header Text Sample</div>
          <div className={typography.title.className}>Title Text Sample</div>
          <div className={typography.subtitle.className}>Subtitle Text Sample</div>
          <div className="flex gap-4 items-baseline">
            <div className={typography.label.className}>Label:</div>
            <div className={typography.fieldLabel.className}>Field Label:</div>
          </div>
          <div className={typography.body.className}>Body Text Sample - This is regular content text that would appear in paragraphs.</div>
          <div className="flex gap-4">
            <div className={typography.info.className}>Info Message</div>
            <div className={typography.warning.className}>Warning Message</div>
            <div className={typography.success.className}>Success Message</div>
            <div className={typography.error.className}>Error Message</div>
          </div>
        </div>

        {/* Color Swatches */}
        <div className="grid grid-cols-6 gap-2 mb-8">
          {colors.slice(0, 12).map(color => (
            <div key={color.key} className="text-center">
              <div
                className="w-full h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-1"
                style={{ backgroundColor: color.value }}
              />
              <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                {color.label.split(' ')[1] || color.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sample Card with Design System */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
          <div className={typography.title.className}>Sample Content Card</div>
          <div className={typography.body.className}>
            This card demonstrates how the design system applies to real content. All typography, colors, and spacing come from the centralized design system.
          </div>
          <button
            className="px-4 py-2 rounded-lg text-white font-roobert-medium"
            style={{ backgroundColor: brandPrimary }}
          >
            Primary Action
          </button>
        </div>
      </div>
    </div>
  );
}
