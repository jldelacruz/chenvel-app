import { router } from 'expo-router';
import { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';

import { useAuth } from '@/auth/AuthProvider';

/**
 * User icon in the top bar; pressing it opens a dropdown with Settings and Log out.
 *
 * The Menu is only created while open: on web, Paper's Menu otherwise moves focus to its button
 * on first render (same workaround as RowsPerPagePicker).
 */
export function UserMenu() {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const anchor = (
    <IconButton
      icon="account-circle-outline"
      size={28}
      accessibilityLabel="Account menu"
      onPress={() => setOpen(true)}
    />
  );
  if (!open) return anchor;

  return (
    <Menu visible onDismiss={close} anchor={anchor} anchorPosition="bottom">
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
          signOut();
        }}
      />
    </Menu>
  );
}
