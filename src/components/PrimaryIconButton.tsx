import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

import { shadows } from '@/theme';

type Props = {
  icon: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

/** 48×48 rounded-square blue button that lines up with a 48px-tall outlined text box. */
export function PrimaryIconButton({ icon, accessibilityLabel, onPress, disabled }: Props) {
  const theme = useTheme();
  return (
    <IconButton
      mode="contained"
      icon={icon}
      size={22}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      // Custom colours would hide Paper's disabled look, so only apply them when enabled.
      containerColor={disabled ? undefined : theme.colors.primary}
      iconColor={disabled ? undefined : theme.colors.onPrimary}
      style={[styles.button, !disabled && { boxShadow: shadows.button }]}
    />
  );
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 12, margin: 0 },
});
