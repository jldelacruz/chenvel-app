import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { PageHeader } from './PageHeader';

// Phones already fade between pages (see src/app/(app)/_layout.tsx); web has no page animation,
// so fade the page in there instead of letting it appear abruptly.
const webFadeIn = Platform.OS === 'web' ? FadeIn.duration(200) : undefined;

/** Standard page: scrollable, centred column with a title and subtitle at the top. */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  const { width } = useWindowDimensions();
  const padding = width >= 600 ? 32 : 16;
  return (
    <Animated.ScrollView
      entering={webFadeIn}
      contentContainerStyle={[styles.container, { padding }]}
      keyboardShouldPersistTaps="handled"
    >
      <PageHeader title={title} subtitle={subtitle} />
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, width: '100%', maxWidth: 1040, alignSelf: 'center' },
});
