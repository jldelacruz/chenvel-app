import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

import { shadows } from '@/theme';

type Props = {
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner instead of the icon and ignores presses (keeps the blue look). */
  loading?: boolean;
};

/** 48×48 rounded-square blue button that lines up with a 48px-tall outlined text box. */
export function PrimaryIconButton({ icon, accessibilityLabel, onPress, disabled, loading }: Props) {
  const theme = useTheme();
  // Greyed out only when really unavailable; while loading it stays blue with a white spinner.
  const dimmed = disabled && !loading;
  return (
    <IconButton
      mode="contained"
      icon={icon}
      size={22}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      // Custom colours would hide Paper's disabled look, so only apply them when enabled.
      containerColor={dimmed ? undefined : theme.colors.primary}
      iconColor={dimmed ? undefined : theme.colors.onPrimary}
      style={[styles.button, !dimmed && { boxShadow: shadows.button }]}
    />
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 12, margin: 0 },
});
