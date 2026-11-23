import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

/** Big bold page title with a muted subtitle, e.g. "Payments / Search and review…". */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, marginBottom: 8 },
});
