import { StyleSheet } from 'react-native';
import { List, Switch, Text, useTheme } from 'react-native-paper';

import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { useThemeMode } from '@/theme/ThemeModeProvider';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDark, setDark } = useThemeMode();

  return (
    <Screen title="Settings" subtitle="Manage your preferences.">
      <Text variant="labelLarge" style={[styles.section, { color: theme.colors.onSurfaceVariant }]}>
        Appearance
      </Text>
      <Panel>
        <List.Item
          title="Dark mode"
          description={isDark ? 'On' : 'Off'}
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => <Switch value={isDark} onValueChange={setDark} />}
          onPress={() => setDark(!isDark)}
          style={styles.item}
        />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: -8 },
  item: { paddingHorizontal: 8 },
});
