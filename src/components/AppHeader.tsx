import { router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from './Brand';
import { UserMenu } from './UserMenu';

/** Top bar on every signed-in page: back (except on Home) + logo, and the user menu (Settings, Log out) on the right. */
export function AppHeader() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isHome = usePathname() === '/';

  // Opening a page directly (e.g. a web link) leaves nothing to go back to, so fall back to Home.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.left}>
        {!isHome && <IconButton icon="arrow-left" accessibilityLabel="Back" onPress={goBack} />}
        <View style={isHome && styles.brandAlone}>
          <Brand size={32} />
        </View>
      </View>
      <UserMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brandAlone: { paddingLeft: 8, paddingVertical: 4 },
});
