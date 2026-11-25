import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Divider, IconButton, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  onDismiss: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  /** Saving: the Save button shows a spinner and nothing can be pressed. */
  loading?: boolean;
  submitDisabled?: boolean;
  /** Widest the dialog gets on big screens. Default 1100. */
  maxWidth?: number;
  /** Shown just above the buttons, always in view (e.g. a save error or success message). */
  footer?: ReactNode;
  children: ReactNode;
};

/** From this window width up, the form is a centred dialog; below it, it fills the screen. */
const DIALOG_MIN_WIDTH = 700;

/**
 * Pop-up form: title with a close button, scrollable content, and Cancel / Save at the bottom.
 * Full screen on phones, a centred dialog on tablets and desktop.
 */
export function FormModal({
  visible,
  title,
  onDismiss,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
  submitDisabled = false,
  maxWidth = 1100,
  footer,
  children,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const dialog = width >= DIALOG_MIN_WIDTH;

  return (
    <Portal>
      <Modal
        visible={visible}
        // Not closable by tapping outside: a stray tap would lose what was typed.
        dismissable={false}
        onDismiss={onDismiss}
        style={styles.modal}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: theme.colors.surface },
          dialog
            ? { width: '92%', maxWidth, maxHeight: height * 0.9, borderRadius: 16 }
            : { flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <IconButton icon="close" onPress={onDismiss} disabled={loading} accessibilityLabel="Close" />
        </View>
        <Divider />

        <ScrollView
          style={styles.body}
          contentContainerStyle={[styles.content, { padding: dialog ? 24 : 16 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        <Divider />
        {footer && <View style={styles.footer}>{footer}</View>}
        <View style={styles.actions}>
          <Button mode="outlined" onPress={onDismiss} disabled={loading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            icon="content-save"
            onPress={onSubmit}
            loading={loading}
            disabled={loading || submitDisabled}
          >
            {submitLabel}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'center', alignItems: 'center', margin: 0 },
  sheet: { alignSelf: 'center', width: '100%', overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 8, paddingVertical: 4 },
  title: { flex: 1 },
  body: { flexGrow: 0, flexShrink: 1 },
  content: { gap: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 16 },
});
