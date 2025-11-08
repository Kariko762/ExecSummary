import { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Download, Upload, RotateCcw, Save, Eye, Code, Sun, Moon } from 'lucide-react';

interface ColorScheme {
  fis: {
    eggplant: string;
    navy: string;
    raspberry: string;
    charcoal: string;
    gray: string;
    green: string;
  };
  dark: {
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      muted: string;
    };
    accent: {
      orange: string;
      coral: string;
      teal: string;
      purple: string;
      amber: string;
      green: string;
    };
  };
}

interface FontScheme {
  weights: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    heavy: number;
  };
}

const DEFAULT_COLORS: ColorScheme = {
  fis: {
    eggplant: '#431C5B',
    navy: '#1D1F48',
    raspberry: '#B21A53',
    charcoal: '#403040',
    gray: '#E6E7E8',
    green: '#3bcd3e',
  },
  dark: {
    bg: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      tertiary: '#3a3a3a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      tertiary: '#808080',
      muted: '#5a5a5a',
    },
    accent: {
      orange: '#ff8c42',
      coral: '#ff5252',
      teal: '#42d4f4',
      purple: '#a855f7',
      amber: '#fbbf24',
      green: '#10b981',
    },
  },
};

const DEFAULT_FONTS: FontScheme = {
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800,
  },
};

export default function StyleSchemeManager() {
  const [colors, setColors] = useState<ColorScheme>(DEFAULT_COLORS);
  const [fonts, setFonts] = useState<FontScheme>(DEFAULT_FONTS);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'preview'>('colors');
  const [darkMode, setDarkMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateColor = (category: string, key: string, value: string, subkey?: string) => {
    setColors(prev => {
      const updated = { ...prev };
      if (subkey) {
        // @ts-ignore
        updated[category][key][subkey] = value;
      } else {
        // @ts-ignore
        updated[category][key] = value;
      }
      return updated;
    });
    setHasChanges(true);
  };

  const updateFontWeight = (weight: keyof FontScheme['weights'], value: number) => {
    setFonts(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [weight]: value,
      },
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all styles to corporate defaults? This cannot be undone.')) {
      setColors(DEFAULT_COLORS);
      setFonts(DEFAULT_FONTS);
      setHasChanges(false);
    }
  };

  const exportScheme = () => {
    const scheme = {
      colors,
      fonts,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(scheme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `style-scheme-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importScheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const scheme = JSON.parse(e.target?.result as string);
            if (scheme.colors) setColors(scheme.colors);
            if (scheme.fonts) setFonts(scheme.fonts);
            setHasChanges(true);
          } catch (error) {
            alert('Invalid scheme file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const saveScheme = () => {
    // In a real app, this would update tailwind.config.js via API
    console.log('Saving scheme:', { colors, fonts });
    alert('Style scheme saved! Note: In production, this would update tailwind.config.js and trigger a rebuild.');
    setHasChanges(false);
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border-2 border-white dark:border-gray-600 shadow-lg cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <div>
          <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{value}</p>
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 px-2 py-1 text-xs font-mono rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant p-6">
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-3">
                <Palette className="w-8 h-8 text-fis-raspberry" />
                Style Scheme Manager
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure centralized design system - colors, fonts, and themes
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={importScheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={exportScheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={saveScheme}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-all ${
                activeTab === 'colors'
                  ? 'bg-fis-eggplant text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Palette className="w-4 h-4" />
              Colors
            </button>
            <button
              onClick={() => setActiveTab('fonts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-all ${
                activeTab === 'fonts'
                  ? 'bg-fis-eggplant text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Type className="w-4 h-4" />
              Typography
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-roobert-medium text-sm transition-all ${
                activeTab === 'preview'
                  ? 'bg-fis-eggplant text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* FIS Corporate Colors */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">FIS Corporate Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Primary - Eggplant"
                    value={colors.fis.eggplant}
                    onChange={(v) => updateColor('fis', 'eggplant', v)}
                  />
                  <ColorPicker
                    label="Primary - Navy"
                    value={colors.fis.navy}
                    onChange={(v) => updateColor('fis', 'navy', v)}
                  />
                  <ColorPicker
                    label="Secondary - Raspberry"
                    value={colors.fis.raspberry}
                    onChange={(v) => updateColor('fis', 'raspberry', v)}
                  />
                  <ColorPicker
                    label="Secondary - Charcoal"
                    value={colors.fis.charcoal}
                    onChange={(v) => updateColor('fis', 'charcoal', v)}
                  />
                  <ColorPicker
                    label="Secondary - Gray"
                    value={colors.fis.gray}
                    onChange={(v) => updateColor('fis', 'gray', v)}
                  />
                  <ColorPicker
                    label="Accent - Green"
                    value={colors.fis.green}
                    onChange={(v) => updateColor('fis', 'green', v)}
                  />
                </div>
              </div>

              {/* Dark Mode - Backgrounds */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">Dark Mode - Backgrounds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Primary BG"
                    value={colors.dark.bg.primary}
                    onChange={(v) => updateColor('dark', 'bg', v, 'primary')}
                  />
                  <ColorPicker
                    label="Secondary BG"
                    value={colors.dark.bg.secondary}
                    onChange={(v) => updateColor('dark', 'bg', v, 'secondary')}
                  />
                  <ColorPicker
                    label="Tertiary BG"
                    value={colors.dark.bg.tertiary}
                    onChange={(v) => updateColor('dark', 'bg', v, 'tertiary')}
                  />
                </div>
              </div>

              {/* Dark Mode - Text */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">Dark Mode - Text</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorPicker
                    label="Primary Text"
                    value={colors.dark.text.primary}
                    onChange={(v) => updateColor('dark', 'text', v, 'primary')}
                  />
                  <ColorPicker
                    label="Secondary Text"
                    value={colors.dark.text.secondary}
                    onChange={(v) => updateColor('dark', 'text', v, 'secondary')}
                  />
                  <ColorPicker
                    label="Tertiary Text"
                    value={colors.dark.text.tertiary}
                    onChange={(v) => updateColor('dark', 'text', v, 'tertiary')}
                  />
                  <ColorPicker
                    label="Muted Text"
                    value={colors.dark.text.muted}
                    onChange={(v) => updateColor('dark', 'text', v, 'muted')}
                  />
                </div>
              </div>

              {/* Dark Mode - Accents */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">Dark Mode - Accent Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorPicker
                    label="Orange"
                    value={colors.dark.accent.orange}
                    onChange={(v) => updateColor('dark', 'accent', v, 'orange')}
                  />
                  <ColorPicker
                    label="Coral"
                    value={colors.dark.accent.coral}
                    onChange={(v) => updateColor('dark', 'accent', v, 'coral')}
                  />
                  <ColorPicker
                    label="Teal"
                    value={colors.dark.accent.teal}
                    onChange={(v) => updateColor('dark', 'accent', v, 'teal')}
                  />
                  <ColorPicker
                    label="Purple"
                    value={colors.dark.accent.purple}
                    onChange={(v) => updateColor('dark', 'accent', v, 'purple')}
                  />
                  <ColorPicker
                    label="Amber"
                    value={colors.dark.accent.amber}
                    onChange={(v) => updateColor('dark', 'accent', v, 'amber')}
                  />
                  <ColorPicker
                    label="Green"
                    value={colors.dark.accent.green}
                    onChange={(v) => updateColor('dark', 'accent', v, 'green')}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">Roobert Font Weights</h3>
              <div className="space-y-4">
                {(Object.keys(fonts.weights) as Array<keyof FontScheme['weights']>).map((weight) => (
                  <div key={weight} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <p className="text-sm font-roobert-semibold text-gray-900 dark:text-white capitalize mb-2">
                        {weight}
                      </p>
                      <p className={`text-2xl text-gray-900 dark:text-white`} style={{ fontWeight: fonts.weights[weight] }}>
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </div>
                    <input
                      type="number"
                      min="100"
                      max="900"
                      step="100"
                      value={fonts.weights[weight]}
                      onChange={(e) => updateFontWeight(weight, parseInt(e.target.value))}
                      className="w-20 px-3 py-2 text-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Component Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white mb-4">Live Component Preview</h3>
                
                {/* Buttons */}
                <div className="mb-6">
                  <p className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Buttons</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-4 py-2 rounded-lg font-roobert-medium transition-all"
                      style={{ backgroundColor: colors.fis.eggplant, color: '#ffffff' }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg font-roobert-medium transition-all"
                      style={{ backgroundColor: colors.fis.raspberry, color: '#ffffff' }}
                    >
                      Secondary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg border-2 font-roobert-medium transition-all"
                      style={{ borderColor: colors.fis.eggplant, color: colors.fis.eggplant }}
                    >
                      Outline Button
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="mb-6">
                  <p className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Cards</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border-2" style={{ borderColor: colors.fis.eggplant }}>
                      <h4 className="font-roobert-bold mb-2" style={{ color: colors.fis.eggplant }}>Card Title</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sample card content with corporate styling</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: colors.fis.gray }}>
                      <h4 className="font-roobert-bold mb-2" style={{ color: colors.fis.navy }}>Gray Card</h4>
                      <p className="text-sm" style={{ color: colors.fis.charcoal }}>Using secondary gray background</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: `linear-gradient(135deg, ${colors.fis.eggplant}, ${colors.fis.raspberry})` }}>
                      <h4 className="font-roobert-bold mb-2 text-white">Gradient Card</h4>
                      <p className="text-sm text-white/80">Eggplant to Raspberry gradient</p>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <p className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Typography Scale</p>
                  <div className="space-y-2">
                    {(Object.keys(fonts.weights) as Array<keyof FontScheme['weights']>).map((weight) => (
                      <p
                        key={weight}
                        className="text-gray-900 dark:text-white capitalize"
                        style={{ fontWeight: fonts.weights[weight] }}
                      >
                        {weight} - The quick brown fox jumps over the lazy dog
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Output */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Generated Tailwind Config
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({ colors, fonts }, null, 2));
                      alert('Copied to clipboard!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry text-sm font-roobert-medium transition-all"
                  >
                    Copy Config
                  </button>
                </div>
                <pre className="text-xs font-mono bg-gray-900 dark:bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify({ colors, fonts }, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
