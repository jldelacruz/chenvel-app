import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Dialog, Icon, Portal, Text, useTheme } from 'react-native-paper';

import { packageDestination, type Package } from '@/api/packages';
import { fontFamilies } from '@/theme';
import { formatMoney } from '@/utils/format';

type Props = {
  /** The package to confirm; the dialog is hidden while this is null. */
  pkg: Package | null;
  onYes: () => void;
  onNo: () => void;
};

/** "Is this the correct package?" pop-up with the package's details and Yes / No. */
export function PackageConfirmDialog({ pkg, onYes, onNo }: Props) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  // Phones and portrait (vertical) windows: smaller title so it stays on one line.
  const compact = width < 600 || height > width;
  const show = (value: unknown) => String(value ?? '').trim() || '—';

  return (
    <Portal>
      {/* Tapping outside or the back button counts as No. */}
      <Dialog
        visible={!!pkg}
        onDismiss={onNo}
        style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
      >
        {/* Title with an info icon in front (Dialog.Title can't hold an icon, so its own row). */}
        <View style={styles.titleRow}>
          <Icon source="information-outline" size={compact ? 22 : 26} color={theme.colors.primary} />
          <Text
            variant={compact ? 'titleMedium' : 'headlineSmall'}
            style={styles.titleText}
            accessibilityRole="header"
            // Native only: shrink a little more on very small phones rather than wrap.
            numberOfLines={compact ? 1 : undefined}
            adjustsFontSizeToFit={compact}
          >
            Is this the correct package?
          </Text>
        </View>
        {pkg && (
          <Dialog.Content style={styles.details}>
            <Detail label="Sender" value={show(pkg.senderFullName)} />
            <Detail label="Receiver" value={show(pkg.receiverFullName)} />
            <Detail label="Size" value={show(pkg.equivalent)} />
            <Detail label="Destination" value={show(packageDestination(pkg))} />
            <Detail
              label="Payable"
              value={formatMoney(Number(pkg.payable) || 0)}
              valueStyle={{ color: theme.colors.primary, fontFamily: fontFamilies.semibold }}
            />
          </Dialog.Content>
        )}
        <Dialog.Actions>
          <Button mode="contained" icon="check" onPress={onYes} style={styles.button}>
            Yes
          </Button>
          <Button mode="outlined" icon="close" onPress={onNo} style={styles.button}>
            No
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

type DetailProps = { label: string; value: string; valueStyle?: object };

function Detail({ label, value, valueStyle }: DetailProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text variant="bodyMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
        {label}:
      </Text>
      <Text variant="bodyMedium" style={[styles.value, valueStyle]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Paper rounds dialogs at 7× the theme's roundness (84px here), which looks like a pill;
  // use the same 16px corners as the Home cards instead.
  dialog: { maxWidth: 480, width: '90%', alignSelf: 'center', borderRadius: 16 },
  details: { gap: 8 },
  // Same spacing as Paper's Dialog.Title.
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 24, marginBottom: 16 },
  titleText: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  label: { width: 96 },
  value: { flex: 1 },
  button: { minWidth: 88 },
});
