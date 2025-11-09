import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Layout, Download, Upload, RotateCcw, Save, Eye, ArrowLeft } from 'lucide-react';

/**
 * Style Scheme Manager V2
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

interface StyleSchemeManagerV2Props {
  onClose?: () => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
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

const DEFAULT_COLORS: ColorDefinition[] = [
  // Brand Colors - FIS Official Brand Palette
  { key: 'brand.primary', label: 'Brand Primary', value: '#431C5B', description: 'Primary brand color (Eggplant)' },
  { key: 'brand.secondary', label: 'Brand Secondary', value: '#B21A53', description: 'Secondary brand color (Raspberry)' },
  { key: 'brand.tertiary', label: 'Brand Tertiary', value: '#1D1F48', description: 'Tertiary brand color (Navy)' },
  
  // Accent Colors
  { key: 'accent.blue', label: 'Accent Blue', value: '#3B82F6', description: 'Blue accent' },
  { key: 'accent.green', label: 'Accent Green', value: '#4BCD3E', description: 'FIS Brand Green accent' },
  { key: 'accent.yellow', label: 'Accent Yellow', value: '#F59E0B', description: 'Yellow accent' },
  { key: 'accent.red', label: 'Accent Red', value: '#EF4444', description: 'Red accent' },
  
  // Semantic Colors
  { key: 'semantic.info', label: 'Info', value: '#3B82F6', description: 'Information state' },
  { key: 'semantic.success', label: 'Success', value: '#10B981', description: 'Success state' },
  { key: 'semantic.warning', label: 'Warning', value: '#F59E0B', description: 'Warning state' },
  { key: 'semantic.error', label: 'Error', value: '#EF4444', description: 'Error state' },
  
  // Surface Colors
  { key: 'surface.base', label: 'Surface Base', value: '#FFFFFF', description: 'Base surface color' },
  { key: 'surface.card', label: 'Surface Card', value: '#F9FAFB', description: 'Card surface color' },
  { key: 'surface.elevated', label: 'Surface Elevated', value: '#FFFFFF', description: 'Elevated surface color' },
  
  // Border Colors
  { key: 'border.subtle', label: 'Border Subtle', value: '#F3F4F6', description: 'Subtle border' },
  { key: 'border.default', label: 'Border Default', value: '#E5E7EB', description: 'Default border' },
  { key: 'border.strong', label: 'Border Strong', value: '#D1D5DB', description: 'Strong border' },
  { key: 'border.accent', label: 'Border Accent', value: '#6B1B5E', description: 'Accent border' },
  
  // Text Colors
  { key: 'text.primary', label: 'Text Primary', value: '#111827', description: 'Primary text' },
  { key: 'text.secondary', label: 'Text Secondary', value: '#6B7280', description: 'Secondary text' },
  { key: 'text.tertiary', label: 'Text Tertiary', value: '#9CA3AF', description: 'Tertiary text' },
  { key: 'text.inverse', label: 'Text Inverse', value: '#FFFFFF', description: 'Inverse text (on dark)' },
];

const DEFAULT_SPACING: SpacingDefinition[] = [
  // Container Spacing
  { key: 'container.main', label: 'Container Main', value: 'p-6', description: 'Main container padding' },
  { key: 'container.modal', label: 'Container Modal', value: 'p-8', description: 'Modal container padding' },
  { key: 'container.card', label: 'Container Card', value: 'p-6', description: 'Card container padding' },
  { key: 'container.tight', label: 'Container Tight', value: 'p-4', description: 'Tight container padding' },
  
  // Section Spacing
  { key: 'section.gap', label: 'Section Gap', value: 'space-y-6', description: 'Gap between sections' },
  { key: 'section.header', label: 'Section Header', value: 'mb-4', description: 'Section header margin' },
  { key: 'section.content', label: 'Section Content', value: 'space-y-4', description: 'Section content spacing' },
  
  // Component Spacing
  { key: 'component.gap', label: 'Component Gap', value: 'space-y-3', description: 'Gap between components' },
  { key: 'component.tight', label: 'Component Tight', value: 'space-y-2', description: 'Tight component gap' },
];

const STORAGE_KEY = 'design-system-v2';

export default function StyleSchemeManagerV2({ onClose, onNotification }: StyleSchemeManagerV2Props) {
  // Load from localStorage on mount
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          typography: parsed.typography || DEFAULT_TYPOGRAPHY,
          colors: parsed.colors || DEFAULT_COLORS,
          spacing: parsed.spacing || DEFAULT_SPACING,
        };
      }
    } catch (error) {
      console.error('Failed to load saved design system:', error);
    }
    return {
      typography: DEFAULT_TYPOGRAPHY,
      colors: DEFAULT_COLORS,
      spacing: DEFAULT_SPACING,
    };
  };

  const savedData = loadSavedData();
  const [typography, setTypography] = useState(savedData.typography);
  const [colors, setColors] = useState(savedData.colors);
  const [spacing, setSpacing] = useState(savedData.spacing);
  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'spacing' | 'preview'>('colors');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleExport = () => {
    const exportData = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      typography,
      colors,
      spacing,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-system-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.typography) setTypography(imported.typography);
        if (imported.colors) setColors(imported.colors);
        if (imported.spacing) setSpacing(imported.spacing);
        setHasChanges(true);
        onNotification?.('success', 'Design system imported successfully!');
      } catch (error) {
        console.error('Failed to import design system:', error);
        onNotification?.('error', 'Failed to import file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Reset all design system values to defaults?')) {
      setTypography(DEFAULT_TYPOGRAPHY);
      setColors(DEFAULT_COLORS);
      setSpacing(DEFAULT_SPACING);
      setHasChanges(false);
      onNotification?.('success', 'Design system reset to defaults');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        typography,
        colors,
        spacing,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Simulate a brief delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
    setColors((prev: ColorDefinition[]) => prev.map((c: ColorDefinition) => c.key === key ? { ...c, value } : c));
    setHasChanges(true);
  };

  const updateTypography = (key: string, className: string) => {
    setTypography((prev: Record<string, TypographyStyle>) => ({ ...prev, [key]: { ...prev[key], className } }));
    setHasChanges(true);
  };

  const updateSpacing = (key: string, value: string) => {
    setSpacing((prev: SpacingDefinition[]) => prev.map((s: SpacingDefinition) => s.key === key ? { ...s, value } : s));
    setHasChanges(true);
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
                  Configure centralized design system - colors, typography, spacing, and themes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
  const [brandTheme, setBrandTheme] = useState<'light' | 'dark'>('light');
  
  const categories = {
    'Brand Colors': colors.filter(c => c.key.startsWith('brand.')),
    'Accent Colors': colors.filter(c => c.key.startsWith('accent.')),
    'Semantic Colors': colors.filter(c => c.key.startsWith('semantic.')),
    'Surface Colors': colors.filter(c => c.key.startsWith('surface.')),
    'Border Colors': colors.filter(c => c.key.startsWith('border.')),
    'Text Colors': colors.filter(c => c.key.startsWith('text.')),
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-roobert-semibold text-gray-900 dark:text-white">
              {category}
            </h2>
            
            {/* Light/Dark toggle for Brand Colors */}
            {category === 'Brand Colors' && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setBrandTheme('light')}
                  className={`px-3 py-1 text-xs font-roobert-medium rounded transition-all ${
                    brandTheme === 'light'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setBrandTheme('dark')}
                  className={`px-3 py-1 text-xs font-roobert-medium rounded transition-all ${
                    brandTheme === 'dark'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Dark
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map(color => (
              <div
                key={color.key}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-10 h-10 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-roobert-medium text-xs text-gray-900 dark:text-white truncate">
                      {color.label}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">
                      {color.key}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={color.value}
                  onChange={(e) => onUpdate(color.key, e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded"
                />
              </div>
            ))}
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
