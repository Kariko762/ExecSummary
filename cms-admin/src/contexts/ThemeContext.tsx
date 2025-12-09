import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Force light theme always
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light'); // Always light
    root.style.colorScheme = 'light';
    localStorage.setItem('theme', 'light');
    
    console.log('🎨 CMS Theme initialized:', {
      theme: 'light',
      className: root.className,
      colorScheme: root.style.colorScheme,
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
    });
  }, []);

  const toggleTheme = () => {
    // Disabled - always stay light
    console.log('⚠️ Theme toggle disabled - CMS forced to light mode');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
