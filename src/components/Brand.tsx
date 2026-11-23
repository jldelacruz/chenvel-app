import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

import { fontFamilies } from '@/theme';

/** App logo + name, used at the top of the sidebar and in the phone top bar. */
export function Brand({ size = 40 }: { size?: number }) {
  return (
    <View style={styles.row}>
      <Avatar.Icon size={size} icon="wallet" style={{ borderRadius: size * 0.3 }} />
      <Text variant="titleLarge" style={{ fontFamily: fontFamilies.bold }}>
        Portal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
