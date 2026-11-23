import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { navDarkTheme, navLightTheme, paperDarkTheme, paperLightTheme } from '@/theme';
import { ThemeModeProvider, useThemeMode } from '@/theme/ThemeModeProvider';

// Keep the splash screen up until the fonts are ready, so text never flashes in a fallback font.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { isDark } = useThemeMode();
  const { username, ready } = useAuth();
  const signedIn = username !== null;
  const theme = isDark ? paperDarkTheme : paperLightTheme;

  // Wait for the saved "Remember me" sign-in so a remembered user never sees the login screen flash.
  if (!ready) return null;

  return (
    <PaperProvider
      theme={theme}
      settings={{ icon: (props) => <MaterialCommunityIcons {...(props as any)} /> }}
    >
      <ThemeProvider value={isDark ? navDarkTheme : navLightTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
          {/* Signed out: only the login screen exists; any other URL redirects to it. */}
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="login" />
          </Stack.Protected>
          {/* Signed in: the sidebar app. Signing in or out switches automatically. */}
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
