import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'settings.darkMode';

type ThemeModeContextValue = {
  isDark: boolean;
  setDark: (dark: boolean) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

/** Holds the light/dark choice. Defaults to light and remembers the user's choice. */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved !== null) setIsDark(saved === 'true');
      })
      .catch(() => {});
  }, []);

  const setDark = (dark: boolean) => {
    setIsDark(dark);
    AsyncStorage.setItem(STORAGE_KEY, String(dark)).catch(() => {});
  };

  return <ThemeModeContext.Provider value={{ isDark, setDark }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return ctx;
}
