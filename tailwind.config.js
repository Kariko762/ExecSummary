/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'], // ONLY use class strategy, ignore media queries
  theme: {
    colorFormat: 'rgb', // Force RGB format instead of oklch for html2canvas compatibility
    extend: {
      fontFamily: {
        'sans': ['Roobert', 'system-ui', 'sans-serif'],
        'roobert': ['Roobert', 'sans-serif'],
        'roobert-light': ['Roobert Light', 'sans-serif'],
        'roobert-medium': ['Roobert Medium', 'sans-serif'],
        'roobert-heavy': ['Roobert Heavy', 'sans-serif'],
      },
      colors: {
        'brand': {
          'primary': 'var(--brand-primary)',
          'secondary': 'var(--brand-secondary)',
          'tertiary': 'var(--brand-tertiary)',
        },
        'fis': {
          'eggplant': '#431C5B',      // Primary - Eggplant
          'navy': '#1D1F48',           // Primary - Navy
          'raspberry': '#B21A53',      // Primary - Raspberry
          'charcoal': '#3D3D40',       // Secondary - Charcoal
          'gray': '#E6E7E8',           // Secondary - Gray
          'green': {
            DEFAULT: '#4BCD3E',        // Accent - FIS Brand Green
            50: '#e8f9e6',
            100: '#c5efc0',
            200: '#a2e59a',
            300: '#7fdb74',
            400: '#5cd14e',
            500: '#4BCD3E',
            600: '#3ca632',
            700: '#2d7f26',
            800: '#1e581a',
            900: '#0f310e',
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
