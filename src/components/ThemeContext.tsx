import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  danger: string;
  border: string;
  warn: string;
};

const palettes: Record<'light' | 'dark', ThemeColors> = {
  light: {
    bg: '#F5F7FA',
    card: '#FFFFFF',
    text: '#17212B',
    muted: '#687586',
    primary: '#3867E8',
    primaryLight: '#E7EDFF',
    success: '#168653',
    successLight: '#E4F4EC',
    danger: '#CF4545',
    border: '#E5E9EF',
    warn: '#FFF1D6',
  },
  dark: {
    bg: '#10151C',
    card: '#191F28',
    text: '#F0F3F7',
    muted: '#9AA6B5',
    primary: '#86A8FF',
    primaryLight: '#263655',
    success: '#5BD39A',
    successLight: '#20382F',
    danger: '#FF8585',
    border: '#2A3441',
    warn: '#40351F',
  },
};

const STORAGE_KEY = '@fitness-tracker/theme';

type ThemeContextValue = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: palettes.light,
  toggle: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark'>(systemScheme === 'dark' ? 'dark' : 'light');
  const hasStoredChoice = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark') {
          hasStoredChoice.current = true;
          setMode(stored);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hasStoredChoice.current && systemScheme) {
      setMode(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme]);

  const toggle = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    hasStoredChoice.current = true;
    setMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  };

  return <ThemeContext.Provider value={{ mode, colors: palettes[mode], toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
