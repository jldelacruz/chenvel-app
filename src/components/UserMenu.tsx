import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Icon, Menu, Text, useTheme } from 'react-native-paper';

import { useAppDispatch, useAppSelector } from '@/store';
import { logout } from '@/store/authSlice';
import { fontFamilies } from '@/theme';

/**
 * Signed-in user's agent name and icon in the top bar; pressing either opens a dropdown with
 * Settings and Log out.
 *
 * The Menu is only created while open: on web, Paper's Menu otherwise moves focus to its button
 * on first render (same workaround as RowsPerPagePicker).
 */
export function UserMenu() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.session?.user);
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Some accounts (e.g. admin) have no agent name, so fall back to the username.
  const displayName = user?.agentName?.trim() || user?.userName || '';
  // Phones and portrait (vertical) windows: only the icon in the top bar; the name moves to the
  // top of the dropdown instead.
  const narrow = width < 600 || height > width;

  const anchor = (
    <Pressable
      onPress={() => setOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={displayName ? `Account menu, signed in as ${displayName}` : 'Account menu'}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.anchor,
        (pressed || hovered) && { backgroundColor: theme.colors.surfaceVariant },
      ]}
    >
      {displayName && !narrow ? (
        <Text
          variant="labelLarge"
          numberOfLines={1}
          style={[styles.name, { maxWidth: 240, color: theme.colors.onSurface }]}
        >
          {displayName}
        </Text>
      ) : null}
      <Icon source="account-circle-outline" size={28} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
  if (!open) return anchor;

  return (
    <Menu visible onDismiss={close} anchor={anchor} anchorPosition="bottom">
      {narrow && displayName ? (
        <Menu.Item title={displayName} leadingIcon="account-outline" disabled titleStyle={styles.name} />
      ) : null}
      <Menu.Item
        title="Settings"
        leadingIcon="cog-outline"
        onPress={() => {
          close();
          router.push('/settings');
        }}
      />
      {/* Signing out switches back to the login screen automatically (see src/app/_layout.tsx). */}
      <Menu.Item
        title="Log out"
        leadingIcon="logout"
        onPress={() => {
          close();
          dispatch(logout());
        }}
      />
    </Menu>
  );
}

const styles = StyleSheet.create({
  anchor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 8,
    marginRight: 4,
    borderRadius: 24,
  },
  name: { fontFamily: fontFamilies.semibold },
});
