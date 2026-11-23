import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

// Inter, loaded in src/app/_layout.tsx. Each weight is its own font family, so the
// family carries the weight and fontWeight stays 'normal' (avoids faux-bold on web).
export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const familyFor = (weight: string | undefined) =>
  weight === '700' || weight === 'bold'
    ? fontFamilies.bold
    : weight === '600'
      ? fontFamilies.semibold
      : weight === '500'
        ? fontFamilies.medium
        : fontFamilies.regular;

const fonts = Object.fromEntries(
  Object.entries(MD3LightTheme.fonts).map(([variant, font]) => {
    // Big headings are bold, titles semibold, everything else keeps its MD3 weight.
    const weight = /^(display|headline)/.test(variant)
      ? '700'
      : /^title/.test(variant)
        ? '600'
        : (font as { fontWeight?: string }).fontWeight;
    return [variant, { ...font, fontFamily: familyFor(weight), fontWeight: 'normal' }];
  }),
) as MD3Theme['fonts'];

const ROUNDNESS = 12; // Inputs get 12px corners; buttons and menu items become pills.

export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: ROUNDNESS,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2F6FED',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E8F0FE',
    onPrimaryContainer: '#1E4FB8',
    secondary: '#5B6B82',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8F0FE', // Active sidebar item.
    onSecondaryContainer: '#2F6FED',
    background: '#F3F7FC',
    onBackground: '#1B2536',
    surface: '#FFFFFF',
    onSurface: '#1B2536',
    surfaceVariant: '#F1F4F9',
    onSurfaceVariant: '#6B7A90',
    outline: '#DCE3EC',
    outlineVariant: '#EBEFF5',
    error: '#D93B3B',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F8FAFD',
      level3: '#F3F6FB',
      level4: '#F1F4F9',
      level5: '#EEF2F8',
    },
  },
};

export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: ROUNDNESS,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5C8EF2',
    onPrimary: '#FFFFFF',
    primaryContainer: '#1D355F',
    onPrimaryContainer: '#CFE0FF',
    secondary: '#94A3B8',
    onSecondary: '#0E1420',
    secondaryContainer: '#1D355F',
    onSecondaryContainer: '#A9C6FF',
    background: '#0E1420',
    onBackground: '#E7ECF4',
    surface: '#161E2C',
    onSurface: '#E7ECF4',
    surfaceVariant: '#1C2636',
    onSurfaceVariant: '#94A3B8',
    outline: '#2C3748',
    outlineVariant: '#222C3B',
    error: '#F07070',
    elevation: {
      level0: 'transparent',
      level1: '#161E2C',
      level2: '#1A2332',
      level3: '#1C2636',
      level4: '#1E2839',
      level5: '#212C3E',
    },
  },
};

// Soft, slightly blue-tinted shadow used by cards and primary buttons.
export const shadows = {
  card: '0px 4px 16px rgba(30, 64, 120, 0.06)',
  button: '0px 6px 14px rgba(47, 111, 237, 0.28)',
};

// Keep navigation chrome (screen background, borders, fonts) in sync with the Paper theme.
function toNavTheme<T extends typeof NavLightTheme>(nav: T, paper: MD3Theme): T {
  return {
    ...nav,
    colors: {
      ...nav.colors,
      primary: paper.colors.primary,
      background: paper.colors.background,
      card: paper.colors.surface,
      text: paper.colors.onSurface,
      border: paper.colors.outlineVariant,
      notification: paper.colors.error,
    },
    fonts: {
      regular: { fontFamily: fontFamilies.regular, fontWeight: 'normal' },
      medium: { fontFamily: fontFamilies.medium, fontWeight: 'normal' },
      bold: { fontFamily: fontFamilies.bold, fontWeight: 'normal' },
      heavy: { fontFamily: fontFamilies.bold, fontWeight: 'normal' },
    },
  };
}

export const navLightTheme = toNavTheme(NavLightTheme, paperLightTheme);
export const navDarkTheme = toNavTheme(NavDarkTheme, paperDarkTheme);
