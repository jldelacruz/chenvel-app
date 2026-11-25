import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppHeader } from '@/components/AppHeader';

/**
 * The signed-in part of the app: Home shows the page cards; every page shares one top bar.
 *
 * The top bar sits outside the Stack so it stays still while pages change; only the page
 * content fades. (Native page animations only run on phones; on web, Screen fades pages in.)
 */
export default function AppLayout() {
  const theme = useTheme();

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <AppHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="payments/index" options={{ title: 'Payments' }} />
        <Stack.Screen name="payments/apply" options={{ title: 'Apply Payment' }} />
        <Stack.Screen name="pickups/index" options={{ title: 'Pickups' }} />
        <Stack.Screen name="packages/index" options={{ title: 'Packages' }} />
        <Stack.Screen name="orders/index" options={{ title: 'Orders' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
