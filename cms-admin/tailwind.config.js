/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roobert', 'system-ui', 'sans-serif'],
        'roobert': ['Roobert', 'sans-serif'],
        'roobert-light': ['Roobert Light', 'sans-serif'],
        'roobert-medium': ['Roobert Medium', 'sans-serif'],
        'roobert-semibold': ['Roobert', 'sans-serif'],  // weight 600
        'roobert-bold': ['Roobert', 'sans-serif'],      // weight 700
        'roobert-heavy': ['Roobert Heavy', 'sans-serif'],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'heavy': '800',
      },
      colors: {
        'fis': {
          'eggplant': '#431C5B',      // Primary - Eggplant
          'navy': '#1D1F48',           // Primary - Navy
          'raspberry': '#B21A53',      // Secondary - Raspberry
          'charcoal': '#403040',       // Secondary - Charcoal
          'gray': '#E6E7E8',           // Secondary - Gray
          'green': {
            DEFAULT: '#3bcd3e',        // Accent - Core Green
            50: '#e6f9e6',
            100: '#b3ecb3',
            200: '#80df80',
            300: '#4dd24d',
            400: '#3bcd3e',
            500: '#2fb831',
            600: '#26a329',
            700: '#1d8e21',
            800: '#147918',
            900: '#0b6410',
          }
        },
        // Dark Mode Color Scheme (extracted from infographic designs)
        'dark': {
          'bg': {
            'primary': '#1a1a1a',      // Main canvas background
            'secondary': '#2d2d2d',    // Cards, panels
            'tertiary': '#3a3a3a',     // Hover states
          },
          'text': {
            'primary': '#ffffff',      // Headings, important text
            'secondary': '#b0b0b0',    // Body text, descriptions
            'tertiary': '#808080',     // Labels, captions
            'muted': '#5a5a5a',        // Disabled, placeholder
          },
          'accent': {
            'orange': '#ff8c42',       // Primary accent (buttons, highlights)
            'coral': '#ff5252',        // Warnings, alerts
            'teal': '#42d4f4',         // Info, links
            'purple': '#a855f7',       // Secondary accent
            'amber': '#fbbf24',        // Success states
            'green': '#10b981',        // Positive metrics
          },
          'chart': {
            'orange': '#ff8c42',
            'blue': '#3b82f6',
            'purple': '#9333ea',
            'teal': '#06b6d4',
            'yellow': '#f59e0b',
            'green': '#22c55e',
            'red': '#ef4444',
          }
        },
        'glass': {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

