import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { DataTable, Text, TextInput, useTheme } from 'react-native-paper';

import { Panel } from '@/components/Panel';
import { PrimaryIconButton } from '@/components/PrimaryIconButton';
import { RowsPerPagePicker } from '@/components/RowsPerPagePicker';
import { Screen } from '@/components/Screen';
import { payors } from '@/data/payors';
import { formatMoney } from '@/utils/format';

const ROWS_PER_PAGE_OPTIONS = [8, 25, 50]; // The first option is the default.

export default function PaymentsScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // On phones, give the amount columns more of the width so values are not cut off.
  const payorCol = { flex: width < 600 ? 1.3 : 2 };
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState(''); // The search that was last submitted.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? payors.filter((p) => p.payor.toLowerCase().includes(q)) : payors;
  }, [query]);

  const from = page * rowsPerPage;
  const to = Math.min(from + rowsPerPage, results.length);
  const numberOfPages = Math.max(1, Math.ceil(results.length / rowsPerPage));

  const search = (text = searchText) => {
    setQuery(text);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchText('');
    search('');
  };

  const changeRowsPerPage = (n: number) => {
    setRowsPerPage(n);
    setPage(0); // Go back to the first page when the page size changes.
  };

  return (
    <Screen title="Payments" subtitle="Search and review payor balances.">
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.surface }]}
          mode="outlined"
          dense
          placeholder="Search payor"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => search()}
          returnKeyType="search"
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchText ? (
              <TextInput.Icon icon="close" accessibilityLabel="Clear search" onPress={clearSearch} />
            ) : undefined
          }
        />
        <PrimaryIconButton icon="magnify" accessibilityLabel="Search" onPress={() => search()} />
      </View>

      <Panel>
        <DataTable>
          <DataTable.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
            <DataTable.Title style={payorCol}>Payor</DataTable.Title>
            <DataTable.Title numeric numberOfLines={2} style={styles.amountCol}>Paid Amt</DataTable.Title>
            <DataTable.Title numeric numberOfLines={2} style={styles.amountCol}>Available Amt.</DataTable.Title>
          </DataTable.Header>

          {results.slice(from, to).map((row) => (
            <DataTable.Row key={row.id}>
              <DataTable.Cell style={payorCol}>
                {/* Own Text so long names can wrap to two lines on phones (Paper clips cells to one line). */}
                <Text variant="bodyMedium" numberOfLines={2} style={styles.payorText}>
                  {row.payor}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell numeric style={styles.amountCol}>{formatMoney(row.paidAmount)}</DataTable.Cell>
              <DataTable.Cell numeric style={styles.amountCol}>{formatMoney(row.availableAmount)}</DataTable.Cell>
            </DataTable.Row>
          ))}

          {results.length === 0 && (
            <View style={styles.empty}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No payors match “{query.trim()}”.</Text>
            </View>
          )}

          <View style={styles.footer}>
            <RowsPerPagePicker value={rowsPerPage} options={ROWS_PER_PAGE_OPTIONS} onChange={changeRowsPerPage} />
            <DataTable.Pagination
              page={page}
              numberOfPages={numberOfPages}
              onPageChange={setPage}
              label={results.length ? `${from + 1}–${to} of ${results.length}` : '0 of 0'}
              showFastPaginationControls
            />
          </View>
        </DataTable>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1 },
  amountCol: { paddingLeft: 12 }, // Keeps the two amount columns apart on narrow screens.
  empty: { padding: 24, alignItems: 'center' },
  payorText: { paddingVertical: 8 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 16 },
});
