import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Divider, HelperText, IconButton, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';

import { PackageConfirmDialog } from '@/components/PackageConfirmDialog';
import { Panel } from '@/components/Panel';
import { PrimaryIconButton } from '@/components/PrimaryIconButton';
import { Screen } from '@/components/Screen';
import { SwipeToDeleteRow } from '@/components/SwipeToDeleteRow';
import {
  packagesFromResponse,
  toPayItemFromPackage,
  unpaidPackages,
  type PackageSearchBy,
  type Package,
  type ToPayItem,
} from '@/api/packages';
import { errorMessage, useLazySearchPackagesQuery } from '@/store/api';
import { fontFamilies, shadows } from '@/theme';
import { formatMoney } from '@/utils/format';
import {
  MIN_PARCEL_NUMBER_LENGTH,
  type ParcelNumberKind,
  parcelNumberKind,
  parcelNumberLabel,
} from '@/utils/parcelNumber';

/** The To Pay list shows this many rows; any more scroll inside the list. */
const VISIBLE_ROWS = 5;

/** From this window width up (desktop / tablet), rows get a visible Delete button instead of swipe. */
const WIDE_LAYOUT = 768;

/** For each kind of number: how the server searches it, and how messages name it. */
const SEARCH: Record<ParcelNumberKind, { searchBy: PackageSearchBy; what: string }> = {
  box: { searchBy: 'Box Number', what: 'box' },
  tracking: { searchBy: 'Tracking Number', what: 'tracking number' },
  phone: { searchBy: 'Sender Phone', what: 'phone number' },
};

/** Result of the last press of +: an error, or which kind of number was entered. */
type Result = { type: 'error' | 'info'; message: string } | null;

export default function ApplyPaymentScreen() {
  const theme = useTheme();
  const isWide = useWindowDimensions().width >= WIDE_LAYOUT;
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [items, setItems] = useState<ToPayItem[]>([]);
  const [notice, setNotice] = useState('');
  // Packages found by the last search, waiting for Yes / No one at a time (first one is shown).
  const [toConfirm, setToConfirm] = useState<Package[]>([]);
  // Measured row heights (by id), used to size the list to exactly VISIBLE_ROWS rows.
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const [searchPackages, { isFetching: searching }] = useLazySearchPackagesQuery();

  const trimmed = number.trim();
  const isError = result?.type === 'error';

  const check = () => {
    if (!trimmed) return;
    if (trimmed.length < MIN_PARCEL_NUMBER_LENGTH) {
      setResult({ type: 'error', message: 'Invalid box number or tracking number' });
      return;
    }
    const kind = parcelNumberKind(trimmed);
    setResult({ type: 'info', message: parcelNumberLabel(kind) });

    // Look up unpaid packages by box number, tracking number or sender's phone, then confirm
    // each one in the pop-up.
    const value = trimmed;
    const what = `${SEARCH[kind].what} ${value}`;
    searchPackages(unpaidPackages(SEARCH[kind].searchBy, value))
      .unwrap()
      .then((response) => {
        const found = packagesFromResponse(response);
        if (found.length === 0) {
          setResult({ type: 'error', message: `No unpaid packages for ${what}` });
          return;
        }
        // Only ask about packages that aren't in the list yet.
        const known = new Set(items.map((i) => i.id));
        const fresh = found.filter((pkg) => !known.has(toPayItemFromPackage(pkg).id));
        if (fresh.length === 0) {
          setNotice(`The package for ${what} is already in the list.`);
          return;
        }
        setToConfirm(fresh);
      })
      .catch((error) => setResult({ type: 'error', message: errorMessage(error) }));
  };

  // Yes: add the package to the list and clear the text box. No: just close the pop-up.
  // Either way, move on to the next found package, if any.
  const confirmYes = () => {
    const [pkg, ...rest] = toConfirm;
    if (!pkg) return;
    const item = toPayItemFromPackage(pkg);
    setItems((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));
    setNumber('');
    setResult(null);
    setNotice(`Added ${item.fullName}.`);
    setToConfirm(rest);
  };
  const confirmNo = () => setToConfirm((prev) => prev.slice(1));

  const remove = (item: ToPayItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setNotice(`Removed ${item.fullName}.`);
  };

  // Height of the first VISIBLE_ROWS rows once they have been measured; until then, no limit.
  const firstRows = items.slice(0, VISIBLE_ROWS);
  const listMaxHeight =
    items.length > VISIBLE_ROWS && firstRows.every((item) => rowHeights[item.id])
      ? firstRows.reduce((sum, item) => sum + rowHeights[item.id], 0)
      : undefined;

  const muted = { color: theme.colors.onSurfaceVariant };

  return (
    <View style={styles.fill}>
      <Screen title="Apply Payment" subtitle="Input box number, tracking number or phone number to apply a payment.">
        <View>
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              mode="outlined"
              dense
              placeholder="Enter box number or tracking number"
              value={number}
              onChangeText={(text) => {
                setNumber(text);
                if (result) setResult(null); // The message describes the old text; hide it while typing.
              }}
              onSubmitEditing={check}
              returnKeyType="done"
              autoCapitalize="characters"
              autoCorrect={false}
              error={isError}
            />
            <PrimaryIconButton icon="plus" accessibilityLabel="Add" disabled={!trimmed} loading={searching} onPress={check} />
          </View>
          <HelperText
            type={isError ? 'error' : 'info'}
            visible={!!result}
            style={!isError && { color: theme.colors.primary, fontFamily: fontFamilies.medium }}
          >
            {result?.message}
          </HelperText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" accessibilityRole="header" style={styles.sectionTitle}>
              To Pay
            </Text>
            {items.length > 0 && !isWide && (
              <Text variant="bodySmall" style={muted}>
                Swipe left on a row to delete it
              </Text>
            )}
          </View>
          <Panel>
            {items.length === 0 ? (
              <Text variant="bodyMedium" style={[styles.empty, muted]}>
                Nothing to pay.
              </Text>
            ) : (
              // Its own scroll area, so a long list scrolls inside the card instead of pushing the
              // Apply Payment button down. nestedScrollEnabled lets it scroll inside the page on Android.
              <ScrollView style={{ maxHeight: listMaxHeight }} nestedScrollEnabled>
                {items.map((item, i) => (
                  <View
                    key={item.id}
                    onLayout={(e) => {
                      const height = e.nativeEvent.layout.height;
                      setRowHeights((prev) => (prev[item.id] === height ? prev : { ...prev, [item.id]: height }));
                    }}
                  >
                    {i > 0 && <Divider />}
                    {isWide ? (
                      // Wide screens (usually a mouse): a Delete button on the row instead of swiping.
                      <View style={[styles.row, styles.rowWide]}>
                        <ToPayRowContent item={item} />
                        <IconButton
                          icon="trash-can-outline"
                          iconColor={theme.colors.error}
                          size={20}
                          style={styles.deleteButton}
                          accessibilityLabel={`Delete ${item.fullName}`}
                          onPress={() => remove(item)}
                        />
                      </View>
                    ) : (
                      <SwipeToDeleteRow onDelete={() => remove(item)} deleteLabel={`Delete ${item.fullName}`}>
                        <View style={styles.row}>
                          <ToPayRowContent item={item} />
                        </View>
                      </SwipeToDeleteRow>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </Panel>
        </View>

        <Button
          mode="contained"
          onPress={() => setNotice('Applying payments isn’t set up yet.')}
          disabled={items.length === 0}
          style={[styles.applyButton, items.length > 0 && { boxShadow: shadows.button }]}
          contentStyle={styles.applyButtonContent}
          labelStyle={styles.applyButtonLabel}
        >
          Apply Payment
        </Button>
      </Screen>

      <PackageConfirmDialog pkg={toConfirm[0] ?? null} onYes={confirmYes} onNo={confirmNo} />
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2500}>
        {notice}
      </Snackbar>
    </View>
  );
}

/** Name with box/tracking number underneath, and the amount on the right. */
function ToPayRowContent({ item }: { item: ToPayItem }) {
  const theme = useTheme();
  return (
    <>
      <View style={styles.rowText}>
        <Text variant="bodyLarge" numberOfLines={1} style={styles.name}>
          {item.fullName}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
          {parcelNumberLabel(parcelNumberKind(item.number))}: {item.number}
        </Text>
      </View>
      <Text variant="bodyLarge" style={styles.amount}>
        {formatMoney(item.amount)}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  sectionTitle: { fontFamily: fontFamilies.semibold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 14 },
  rowWide: { paddingRight: 12 }, // The Delete button brings its own padding.
  deleteButton: { margin: 0 },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: fontFamilies.medium },
  amount: { fontFamily: fontFamilies.semibold, fontVariant: ['tabular-nums'] },
  empty: { textAlign: 'center', paddingVertical: 24 },
  applyButton: { borderRadius: 12, marginTop: 8 },
  applyButtonContent: { height: 52 },
  applyButtonLabel: { fontSize: 16 },
});
