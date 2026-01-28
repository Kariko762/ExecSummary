# Glassmorphism Modal System - Implementation Guide

## 📋 Overview
This document explains the glassmorphism modal system used in the Executive Summary application. This pattern provides:
- **Full-screen popup modals** with glassmorphism backgrounds
- **Flexible sizing** (75% / 95% / Full Screen toggle)
- **Gradient headers** with smooth color transitions
- **Sticky navigation** with tabs and section menus
- **Dark/light mode support**

This guide is designed for AI-assisted recreation in other projects with different branding, colors, and themes while maintaining the same functionality.

---

## 🎨 Core Design Patterns

### 1. **Modal Overlay Architecture**

The modal system uses a **three-layer structure**:

#### Layer 1: Backdrop Overlay
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
```

**Key Properties:**
- `fixed inset-0` - Covers entire viewport
- `z-50` - High z-index to appear above all content
- `flex items-center justify-center` - Centers modal
- `p-4` - Padding for mobile responsiveness
- `bg-black/50` - Semi-transparent black overlay (50% opacity)
- `backdrop-blur-sm` - **Glassmorphism effect** - blurs background content

#### Layer 2: Modal Container
```tsx
<div className="w-full max-w-7xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
```

**Key Properties:**
- `w-full max-w-7xl` - Responsive width with maximum constraint
- `h-[90vh]` - Height 90% of viewport (for size toggle: use `h-[75vh]` / `h-[95vh]` / `h-screen`)
- `bg-white dark:bg-gray-900` - Solid background with dark mode support
- `rounded-2xl` - Large rounded corners (16px)
- `shadow-2xl` - Deep shadow for depth
- `flex flex-col` - Vertical flex layout (header → content → footer)
- `overflow-hidden` - Prevents content overflow, clips rounded corners

#### Layer 3: Content Sections
Modal contains three main sections:
1. **Header** (sticky) - Title, status, controls
2. **Content** (scrollable) - Main body
3. **Footer/Actions** (optional, sticky) - Save/close buttons

---

### 2. **Gradient Header Pattern**

```tsx
<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-[#431C5B] to-[#B21A53]">
  <div>
    <h2 className="text-xl font-roobert-heavy text-white">Modal Title</h2>
    <p className="text-xs text-white/80 mt-0.5">Subtitle or description</p>
  </div>
  <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
    <X className="w-6 h-6 text-white" />
  </button>
</div>
```

**Key Elements:**
- `bg-gradient-to-r from-[#431C5B] to-[#B21A53]` - **Left-to-right gradient** (purple → raspberry)
  - **Customization:** Replace hex codes with your brand colors
  - Example: `from-blue-600 to-blue-800` or `from-[#YOUR_COLOR_1] to-[#YOUR_COLOR_2]`
- `text-white` - White text on dark gradient
- `text-white/80` - 80% opacity white for subtitles
- `hover:bg-white/10` - Subtle hover effect for close button
- `border-b` - Bottom border separates header from content

**Gradient Customization Tips:**
- Use `bg-gradient-to-r` (left→right), `bg-gradient-to-br` (top-left→bottom-right), or `bg-gradient-to-b` (top→bottom)
- For multi-color gradients: `from-color-1 via-color-2 to-color-3`
- Opacity variants: `/90`, `/80`, `/70` (e.g., `from-fis-navy/90`)

---

### 3. **Size Toggle System**

Implement three modal sizes with smooth transitions:

```tsx
const [modalSize, setModalSize] = useState<'75' | '95' | 'full'>('90');

const sizeClasses = {
  '75': 'h-[75vh] max-w-6xl',
  '95': 'h-[95vh] max-w-7xl',
  'full': 'h-screen max-w-none w-screen rounded-none' // Full screen removes rounded corners
};

<div className={`w-full ${sizeClasses[modalSize]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
```

**Size Controls (in header):**
```tsx
<div className="flex items-center gap-2">
  <button 
    onClick={() => setModalSize('75')}
    className={`px-3 py-1 rounded text-xs font-medium ${
      modalSize === '75' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    75%
  </button>
  <button 
    onClick={() => setModalSize('95')}
    className={`px-3 py-1 rounded text-xs font-medium ${
      modalSize === '95' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    95%
  </button>
  <button 
    onClick={() => setModalSize('full')}
    className={`px-3 py-1 rounded text-xs font-medium ${
      modalSize === 'full' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    Full
  </button>
</div>
```

**Key Features:**
- `transition-all duration-300` - Smooth animated resize
- Active state uses higher opacity background
- Full screen mode removes rounded corners and max-width

---

### 4. **Tabs System (Sticky Navigation)**

Tabs positioned below header, stays fixed during scroll:

```tsx
<div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        activeTab === tab.id
          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      {tab.name}
    </button>
  ))}
</div>
```

**Key Properties:**
- `sticky top-0 z-10` - **Sticky positioning** keeps tabs visible during scroll
- Active tab uses gradient background (matches header)
- Inactive tabs use hover states
- `border-b` creates visual separation

**Customization:**
- Replace gradient colors with your brand palette
- Use icons: `<Icon className="w-4 h-4 mr-2" />{tab.name}`
- Add badges: `<span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">3</span>`

---

### 5. **Sidebar Navigation Pattern**

Left-side sticky navigation for section jumping:

```tsx
<div className="flex-1 flex overflow-hidden">
  {/* Sidebar */}
  <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
    <div className="p-3">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Sections
      </h3>
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
    {/* Your content here */}
  </div>
</div>
```

**Key Features:**
- `w-64` - Fixed sidebar width (256px)
- `border-r` - Right border separates sidebar from content
- `overflow-y-auto` - Independent scrolling
- Active section uses gradient highlight

---

### 6. **Scrollable Content Area**

Main content section with proper overflow handling:

```tsx
<div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
  <div className="max-w-5xl mx-auto">
    {/* Your content sections */}
  </div>
</div>
```

**Key Properties:**
- `flex-1` - Takes remaining space after header/tabs/sidebar
- `overflow-y-auto` - Enables vertical scrolling
- `max-w-5xl mx-auto` - **Content max-width** with centered layout
- Adjust max-width for your layout: `max-w-3xl` (narrow), `max-w-7xl` (wide)

---

### 7. **Glassmorphism Sub-Modals**

Nested modals with glass effect (e.g., for asset previews, confirmations):

```tsx
<div className="absolute inset-0 bg-gradient-to-br from-fis-navy/90 via-fis-eggplant/80 to-fis-navy/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
  <div className="text-center px-8 py-10 glass-strong rounded-2xl border-2 border-fis-raspberry/50 backdrop-blur-md shadow-2xl max-w-md">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-fis-raspberry to-fis-eggplant flex items-center justify-center shadow-lg">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <p className="text-lg font-bold text-white mb-2">Title</p>
    <p className="text-sm text-white/90">Description</p>
  </div>
</div>
```

**Glassmorphism Properties:**
- `backdrop-blur-sm` (small), `backdrop-blur-md` (medium), `backdrop-blur-lg` (large)
- `glass-strong` CSS class (if using custom utility):
  ```css
  .glass-strong {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  ```

---

## 🎯 Complete Modal Template

Here's a complete modal implementation you can customize:

```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
}

export function CustomModal({ isOpen, onClose, title, subtitle }: CustomModalProps) {
  const [modalSize, setModalSize] = useState<'75' | '95' | 'full'>('90');
  const [activeTab, setActiveTab] = useState('tab1');
  const [activeSection, setActiveSection] = useState('section1');

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    '75': 'h-[75vh] max-w-6xl',
    '95': 'h-[95vh] max-w-7xl',
    'full': 'h-screen max-w-none w-screen rounded-none'
  };

  const tabs = [
    { id: 'tab1', name: 'Overview' },
    { id: 'tab2', name: 'Details' },
    { id: 'tab3', name: 'Settings' }
  ];

  const sections = [
    { id: 'section1', title: 'Introduction' },
    { id: 'section2', title: 'Features' },
    { id: 'section3', title: 'Configuration' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`w-full ${sizeClasses[modalSize]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}
        >
          {/* HEADER with Gradient */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-purple-600">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {subtitle && <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Size Toggle */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setModalSize('75')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    modalSize === '75' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  75%
                </button>
                <button 
                  onClick={() => setModalSize('95')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    modalSize === '95' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  95%
                </button>
                <button 
                  onClick={() => setModalSize('full')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    modalSize === 'full' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Full
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* TABS (Sticky) */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT: Sidebar + Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Sections
                </h3>
                <div className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
              <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {sections.find(s => s.id === activeSection)?.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Your content goes here. This area is scrollable while the header, tabs, and sidebar remain fixed.
                </p>
                {/* Add your content sections here */}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

---

## 🎨 Customization Guide

### Colors & Branding

**1. Replace Gradient Colors:**
```tsx
// Original (purple → raspberry)
bg-gradient-to-r from-[#431C5B] to-[#B21A53]

// Custom examples:
bg-gradient-to-r from-blue-500 to-cyan-500       // Blue → Cyan
bg-gradient-to-r from-green-600 to-teal-600      // Green → Teal
bg-gradient-to-r from-orange-500 to-red-500      // Orange → Red
bg-gradient-to-r from-[#YOUR_HEX] to-[#YOUR_HEX] // Custom hex codes
```

**2. Update Dark Mode Colors:**
```tsx
// Light/Dark backgrounds
bg-white dark:bg-gray-900          // Main modal
bg-gray-50 dark:bg-gray-800/50     // Sidebar/tabs
border-gray-200 dark:border-gray-800 // Borders
text-gray-700 dark:text-gray-300   // Text
```

**3. Active State Colors:**
Match active tab/section colors to your header gradient:
```tsx
activeTab === tab.id
  ? 'bg-gradient-to-r from-YOUR-COLOR-1 to-YOUR-COLOR-2 text-white'
  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
```

### Layout Adjustments

**1. Sidebar Width:**
```tsx
w-64  // Default (256px)
w-72  // Wider (288px)
w-56  // Narrower (224px)
```

**2. Content Max Width:**
```tsx
max-w-5xl  // Default (1024px)
max-w-3xl  // Narrower (768px)
max-w-7xl  // Wider (1280px)
```

**3. Modal Sizes:**
```tsx
// Adjust viewport height percentages:
'75': 'h-[75vh]'  // 75% of viewport
'90': 'h-[90vh]'  // 90% (default)
'95': 'h-[95vh]'  // 95%
```

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0"
  }
}
```

### Tailwind Config (if using custom utilities)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Add your custom brand colors here
        'brand-primary': '#431C5B',
        'brand-secondary': '#B21A53',
      }
    }
  }
}
```

### Custom CSS (optional glassmorphism utilities)

```css
/* Add to your global CSS */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 🚀 Usage Example

```tsx
import { CustomModal } from './components/CustomModal';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Open Modal
      </button>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="My Application"
        subtitle="Powered by Glassmorphism"
      />
    </div>
  );
}
```

---

## ✨ Key Takeaways

1. **Three-layer structure**: Backdrop → Modal Container → Content Sections
2. **Glassmorphism**: `backdrop-blur-sm/md/lg` + semi-transparent backgrounds
3. **Sticky elements**: Header, tabs, and sidebar use `sticky` positioning
4. **Smooth animations**: Framer Motion for enter/exit, CSS transitions for size changes
5. **Responsive**: Works on all screen sizes with proper padding/overflow
6. **Dark mode ready**: Uses Tailwind's `dark:` variants throughout
7. **Accessible**: Escape key closes, prevent background scroll, focus management

Replace all brand colors (`from-[#431C5B] to-[#B21A53]`) with your palette and you're ready to deploy! 🎉
