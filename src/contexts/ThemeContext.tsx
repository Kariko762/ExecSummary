import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    console.log('[ThemeProvider] INIT - localStorage theme:', saved);
    const initialTheme = (saved as Theme) || 'light';
    console.log('[ThemeProvider] INIT - Setting initial theme to:', initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    console.log('[ThemeProvider] useEffect BEFORE - HTML class:', root.className);
    console.log('[ThemeProvider] useEffect - Applying theme:', theme);
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // CRITICAL: Set color-scheme to override Windows preference
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
    console.log('[ThemeProvider] useEffect AFTER - HTML class:', root.className);
    console.log('[ThemeProvider] useEffect AFTER - colorScheme:', root.style.colorScheme);
    
    // Check if browser is overriding
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    console.log('[ThemeProvider] Browser prefers-color-scheme: dark?', mediaQuery.matches);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
