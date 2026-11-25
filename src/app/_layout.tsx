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
import { Provider as ReduxProvider } from 'react-redux';

import { navDarkTheme, navLightTheme, paperDarkTheme, paperLightTheme } from '@/theme';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { logout, restoreSession } from '@/store/authSlice';
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
        <ReduxProvider store={store}>
          <ThemedApp />
        </ReduxProvider>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}

function ThemedApp() {
  const { isDark } = useThemeMode();
  const dispatch = useAppDispatch();
  const session = useAppSelector((state) => state.auth.session);
  const ready = useAppSelector((state) => state.auth.restored);
  const signedIn = session !== null;

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // The token stops working after a while (8 hours at the moment): sign out when it does.
  const expiresAt = session?.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const delay = expiresAt - Date.now();
    // Timers longer than ~24 days fire immediately, so only schedule ones that fit.
    if (delay > 2 ** 31 - 1) return;
    const timer = setTimeout(() => dispatch(logout()), Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [expiresAt, dispatch]);

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
          {/* Signed in: the app. Signing in or out switches automatically. */}
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
