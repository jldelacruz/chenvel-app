import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PageHeader } from './PageHeader';

// Phones already fade between pages (see src/app/(app)/_layout.tsx); web has no page animation,
// so fade the page in there instead of letting it appear abruptly.
const webFadeIn = Platform.OS === 'web' ? FadeIn.duration(200) : undefined;

/** Side padding of a page: wider on tablets / desktop. */
export function useScreenPadding() {
  const { width } = useWindowDimensions();
  return width >= 600 ? 32 : 16;
}

type Props = {
  title: string;
  subtitle?: string;
  /**
   * Use the whole window width, with no side padding (e.g. for wide tables). The title keeps its
   * padding; give other content that needs it `paddingHorizontal: useScreenPadding()`.
   */
  fullWidth?: boolean;
  children?: ReactNode;
};

/** Standard page: scrollable, centred column with a title and subtitle at the top. */
export function Screen({ title, subtitle, fullWidth = false, children }: Props) {
  const padding = useScreenPadding();
  return (
    <Animated.ScrollView
      entering={webFadeIn}
      contentContainerStyle={[
        styles.container,
        fullWidth ? { paddingVertical: padding } : [styles.centred, { padding }],
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={fullWidth && { paddingHorizontal: padding }}>
        <PageHeader title={title} subtitle={subtitle} />
      </View>
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, width: '100%' },
  centred: { maxWidth: 1040, alignSelf: 'center' },
});
