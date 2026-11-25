import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  ActivityIndicator,
  Divider,
  HelperText,
  Icon,
  List,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

export type SelectOption<V extends string | number = string | number> = { value: V; label: string };

type Props<V extends string | number> = {
  label: string;
  value: V | null | undefined;
  options: SelectOption<V>[];
  onChange: (value: V) => void;
  error?: string | false | null;
  disabled?: boolean;
  loading?: boolean;
  /** Show a search box above the list. Default: on when there are more than 8 options. */
  searchable?: boolean;
};

/**
 * Dropdown for forms (Paper has none): looks like an outlined text field; tapping it opens a
 * list, with a search box for long lists.
 */
export function SelectField<V extends string | number>({
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
  loading = false,
  searchable,
}: Props<V>) {
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((o) => o.value === value);
  const showSearch = searchable ?? options.length > 8;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, search]);

  const close = () => {
    setOpen(false);
    setSearch('');
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'not selected'}`}
      >
        {/* pointerEvents none: the Pressable gets the tap, not the read-only input. */}
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={selected?.label ?? ''}
            editable={false}
            disabled={disabled}
            error={!!error}
            contentStyle={styles.inputContent}
          />
          {/*
            A plain icon, not TextInput.Icon: that one is a button, and on web a button inside
            this Pressable (also a <button>) is invalid HTML.
          */}
          <View style={styles.trailing}>
            {loading ? (
              <ActivityIndicator size={16} />
            ) : (
              <Icon
                source="menu-down"
                size={24}
                color={disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant}
              />
            )}
          </View>
        </View>
      </Pressable>
      {!!error && (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      )}

      <Portal>
        <Modal
          visible={open}
          onDismiss={close}
          contentContainerStyle={[
            styles.sheet,
            { backgroundColor: theme.colors.surface, maxHeight: height * 0.8 },
          ]}
        >
          <Text variant="titleMedium" style={styles.title}>
            {label}
          </Text>
          {showSearch && (
            <Searchbar
              placeholder="Search"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
              autoFocus
            />
          )}
          <Divider />
          <FlatList
            data={filtered}
            keyExtractor={(o) => String(o.value)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>No matches.</Text>
            }
            renderItem={({ item }) => (
              <List.Item
                title={item.label}
                onPress={() => {
                  onChange(item.value);
                  close();
                }}
                right={(props) =>
                  item.value === value ? <Icon {...props} source="check" size={20} color={theme.colors.primary} /> : null
                }
              />
            )}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContent: { paddingRight: 44 }, // Room for the arrow, so long labels don't run under it.
  trailing: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  sheet: {
    alignSelf: 'center',
    width: '92%',
    maxWidth: 480,
    borderRadius: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  title: { paddingHorizontal: 20, paddingVertical: 8 },
  search: { marginHorizontal: 16, marginBottom: 8 },
  empty: { padding: 24, textAlign: 'center' },
});
