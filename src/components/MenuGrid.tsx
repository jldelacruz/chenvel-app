import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { useAppDispatch } from '@/store';
import { clearSelectedPayment } from '@/store/paymentsSlice';
import { fontFamilies, shadows } from '@/theme';

type MenuItem = {
  href: Href;
  label: string;
  caption: string; // Short hint shown under the label.
  icon: string;
};

/** The app's pages, shown as cards on the Home screen. Add a page here to give it a card. */
const menu: MenuItem[] = [
  { href: '/payments', label: 'Payments', caption: 'List of payments', icon: 'credit-card-outline' },
  { href: '/payments/apply', label: 'Apply Payment', caption: 'Pay a package to release', icon: 'cash-plus' },
];

const GAP = 16;

/** Grid of page cards: 2 per row on phones, 3 on wider screens. */
export function MenuGrid() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { width: windowWidth } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const columns = windowWidth >= 700 ? 3 : 2;
  // The reported width can be rounded up (e.g. 369.6 -> 370), so leave 1px spare and round down,
  // otherwise the last card in a row wraps onto its own line.
  const tileWidth = gridWidth ? Math.floor((gridWidth - 1 - GAP * (columns - 1)) / columns) : undefined;

  // Build each page in the background while Home is showing, so opening one is instant instead
  // of a blank moment while it is created. Re-run on every return to Home, since going back
  // removes the page that was open.
  useFocusEffect(
    useCallback(() => {
      menu.forEach((item) => router.prefetch(item.href));
    }, []),
  );

  return (
    <View style={styles.grid} onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}>
      {menu.map((item) => (
        <Pressable
          key={item.label}
          // navigate (not push) reuses the page that the prefetch above already built.
          onPress={() => {
            // Opened from Home, so not for a payment picked in the Payments table.
            dispatch(clearSelectedPayment());
            router.navigate(item.href);
          }}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
            styles.tile,
            {
              width: tileWidth,
              backgroundColor: theme.colors.surface,
              borderColor: hovered || pressed ? theme.colors.primary : theme.colors.outlineVariant,
              boxShadow: shadows.card,
            },
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Icon source={item.icon} size={28} color={theme.colors.primary} />
          </View>
          <Text variant="titleMedium" numberOfLines={2} style={styles.label}>
            {item.label}
          </Text>
          <Text variant="bodySmall" numberOfLines={2} style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>
            {item.caption}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  pressed: { opacity: 0.85 },
  iconBox: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  label: { fontFamily: fontFamilies.semibold, textAlign: 'center' },
  caption: { textAlign: 'center', marginTop: 4 },
});
