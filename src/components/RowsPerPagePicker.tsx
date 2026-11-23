import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Menu, Text, useTheme } from 'react-native-paper';

type Props = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

/**
 * "Rows per page" dropdown for tables.
 *
 * Replaces DataTable.Pagination's built-in dropdown: on web, Paper's Menu "closes" itself on
 * first render and moves keyboard focus to its button, which scrolls the page down to the
 * table footer. Creating the Menu only while it is open avoids that.
 */
export function RowsPerPagePicker({ value, options, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const anchor = (
    <Button
      mode="outlined"
      compact
      icon="menu-down"
      contentStyle={styles.buttonContent}
      onPress={() => setOpen(true)}
      accessibilityLabel={`Rows per page: ${value}`}
    >
      {value}
    </Button>
  );

  return (
    <View style={styles.row}>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        Rows per page
      </Text>
      {open ? (
        <Menu visible onDismiss={() => setOpen(false)} anchor={anchor} anchorPosition="bottom">
          {options.map((n) => (
            <Menu.Item
              key={n}
              title={String(n)}
              leadingIcon={n === value ? 'check' : undefined}
              onPress={() => {
                setOpen(false);
                onChange(n);
              }}
            />
          ))}
        </Menu>
      ) : (
        anchor
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  buttonContent: { flexDirection: 'row-reverse' }, // Arrow after the number.
});
