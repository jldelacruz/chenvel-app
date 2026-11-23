import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Icon, Text, useTheme } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { fontFamilies } from '@/theme';

const ACTION_WIDTH = 96;

type Props = {
  children: ReactNode;
  onDelete: () => void;
  /** Spoken by screen readers, e.g. "Delete Maria Santos". */
  deleteLabel: string;
};

/**
 * List row that reveals a red Delete button when swiped left (drag with the mouse on web).
 * Screen readers get a "Delete" action on the row instead of having to swipe.
 */
export function SwipeToDeleteRow({ children, onDelete, deleteLabel }: Props) {
  const theme = useTheme();

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootRight={false}
      childrenContainerStyle={{ backgroundColor: theme.colors.surface }}
      renderRightActions={(progress) => (
        <DeleteAction progress={progress} onDelete={onDelete} label={deleteLabel} />
      )}
    >
      <Pressable
        accessible
        accessibilityActions={[{ name: 'delete', label: 'Delete' }]}
        onAccessibilityAction={(e) => e.nativeEvent.actionName === 'delete' && onDelete()}
      >
        {children}
      </Pressable>
    </ReanimatedSwipeable>
  );
}

/** Red Delete button behind the row. Invisible until the row moves, so no red shows at the edges. */
function DeleteAction({ progress, onDelete, label }: { progress: SharedValue<number>; onDelete: () => void; label: string }) {
  const theme = useTheme();
  const visible = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 0.05], [0, 1], 'clamp') }));

  return (
    <Animated.View style={visible}>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.action, { backgroundColor: theme.colors.error }]}
      >
        <Icon source="trash-can-outline" size={22} color={theme.colors.onError} />
        <Text variant="labelMedium" style={[styles.actionLabel, { color: theme.colors.onError }]}>
          Delete
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1, width: ACTION_WIDTH, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionLabel: { fontFamily: fontFamilies.semibold },
});
