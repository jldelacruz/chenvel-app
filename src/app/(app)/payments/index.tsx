import { skipToken } from '@reduxjs/toolkit/query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ActivityIndicator, Button, DataTable, Text, TextInput, useTheme } from 'react-native-paper';

import { defaultPaymentFilter } from '@/api/payments';
import { Panel } from '@/components/Panel';
import { PrimaryIconButton } from '@/components/PrimaryIconButton';
import { RowsPerPagePicker } from '@/components/RowsPerPagePicker';
import { Screen } from '@/components/Screen';
import { useAppDispatch, useAppSelector } from '@/store';
import { errorMessage, useGetPaymentsQuery } from '@/store/api';
import { selectPayment } from '@/store/paymentsSlice';
import { formatMoney } from '@/utils/format';

const ROWS_PER_PAGE_OPTIONS = [8, 25, 50]; // The first option is the default.

export default function PaymentsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { width, height } = useWindowDimensions();
  // Landscape (wide) windows: the payment date has its own column, first in the row.
  // Phones and portrait (vertical) windows: the date sits above the payor name in the same cell.
  const narrow = width < 600 || height > width;
  const payorCol = { flex: narrow ? 1.6 : 2 };
  const dateCol = { flex: 1 };
  const amountCol = [styles.amountCol, { flex: 1 }];
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState(''); // The search that was last submitted.
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  const user = useAppSelector((state) => state.auth.session?.user);

  // Search and paging both happen on the server; each page is cached (see src/store/api.ts).
  const filter = useMemo(() => (user ? defaultPaymentFilter(user, query.trim()) : null), [user, query]);
  const from = page * rowsPerPage;
  const { currentData, data, error, isFetching, refetch } = useGetPaymentsQuery(
    filter ? { filter, start: from, length: rowsPerPage } : skipToken,
  );
  // While a new page loads, keep showing the previous one (dimmed) instead of an empty table.
  const shown = currentData ?? (isFetching ? data : undefined);
  const rows = shown?.rows ?? [];
  const stale = !currentData && isFetching && !!data;
  const firstLoad = isFetching && !shown;
  const failed = !!error && !isFetching;

  // The API has no total count, so the pager only knows whether there is a next page.
  const numberOfPages = shown?.hasMore ? page + 2 : page + 1;
  const pageLabel = rows.length ? `${from + 1}–${from + rows.length}` : '0';

  const search = (text = searchText) => {
    setQuery(text);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchText('');
    search('');
  };

  // Clicking a row remembers that payment (see store/paymentsSlice.ts) and opens Apply Payment.
  const openPayment = (paymentId: number) => {
    dispatch(selectPayment(paymentId));
    router.push('/payments/apply');
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
            {!narrow && <DataTable.Title style={dateCol}>Payment Date</DataTable.Title>}
            <DataTable.Title style={payorCol}>Payor</DataTable.Title>
            <DataTable.Title numeric numberOfLines={2} style={amountCol}>Paid Amt</DataTable.Title>
            <DataTable.Title numeric numberOfLines={2} style={amountCol}>Available Amt.</DataTable.Title>
          </DataTable.Header>

          {firstLoad ? (
            <View style={styles.message}>
              <ActivityIndicator accessibilityLabel="Loading payments" />
            </View>
          ) : failed ? (
            <View style={styles.message} accessibilityRole="alert">
              <Text variant="bodyMedium" style={[styles.center, { color: theme.colors.error }]}>
                {errorMessage(error)}
              </Text>
              <Button mode="outlined" icon="refresh" onPress={refetch}>
                Try again
              </Button>
            </View>
          ) : rows.length === 0 ? (
            <View style={styles.message}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {query.trim() ? `No payors match “${query.trim()}”.` : 'No payments yet.'}
              </Text>
            </View>
          ) : (
            <View style={stale && styles.stale}>
              {rows.map((row) => (
                <DataTable.Row
                  key={row.id}
                  onPress={() => openPayment(row.id)}
                  accessibilityLabel={`${row.payor}, ${row.paymentDate}. Open Apply Payment`}
                >
                  {!narrow && <DataTable.Cell style={dateCol}>{row.paymentDate}</DataTable.Cell>}
                  <DataTable.Cell style={payorCol}>
                    {/* Own Text so long names can wrap to two lines (Paper clips cells to one line). */}
                    <View style={styles.payorCell}>
                      {narrow && (
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {row.paymentDate}
                        </Text>
                      )}
                      <Text variant="bodyMedium" numberOfLines={2}>
                        {row.payor}
                      </Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={amountCol}>
                    {formatMoney(row.amount)}
                  </DataTable.Cell>
                  <DataTable.Cell numeric style={amountCol} textStyle={{ color: theme.colors.error }}>
                    {formatMoney(row.excess)}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <RowsPerPagePicker value={rowsPerPage} options={ROWS_PER_PAGE_OPTIONS} onChange={changeRowsPerPage} />
            <DataTable.Pagination
              page={page}
              numberOfPages={numberOfPages}
              onPageChange={setPage}
              label={pageLabel}
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
  message: { padding: 24, alignItems: 'center', gap: 12 },
  center: { textAlign: 'center' },
  stale: { opacity: 0.5 },
  payorCell: { flex: 1, paddingVertical: 8 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 16 },
});
