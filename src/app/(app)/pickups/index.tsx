import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';

import { defaultPickupFilter } from '@/api/pickups';
import { AppDataTable } from '@/components/AppDataTable';
import { Screen, useScreenPadding } from '@/components/Screen';
import { PickupForm } from '@/features/pickups/PickupForm';
import { pickupColumns } from '@/features/pickups/pickupColumns';
import { errorMessage, useGetPickupsQuery } from '@/store/api';
import { join } from '@/utils/format';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]; // The first option is the default.

/** Light blue background for rows that were already reminded (same as the web app). */
const REMINDED_BG = 'rgba(137, 207, 240, 0.35)';

export default function PickupsScreen() {
  const padding = useScreenPadding();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);
  // The form: closed (null), new pickup (0), or editing the pickup with that id.
  const [formRecordId, setFormRecordId] = useState<number | null>(null);

  // Paging happens on the server; each page is cached (see src/store/api.ts).
  const { currentData, data, error, isFetching, refetch } = useGetPickupsQuery({
    filter: defaultPickupFilter,
    start: page * rowsPerPage,
    length: rowsPerPage,
  });
  // While a new page loads, keep showing the previous one (dimmed) instead of an empty table.
  const shown = currentData ?? (isFetching ? data : undefined);

  return (
    <Screen title="Pickups" subtitle="Packages scheduled for pickup." fullWidth>
      <View style={[styles.actions, { paddingHorizontal: padding }]}>
        <Button mode="contained" icon="plus" onPress={() => setFormRecordId(0)}>
          Add
        </Button>
      </View>

      {/* Mounted only while open, so each open starts fresh (empty, or the record as saved). */}
      {formRecordId !== null && <PickupForm recordId={formRecordId} onClose={() => setFormRecordId(null)} />}

      <AppDataTable
        style={styles.table}
        columns={pickupColumns}
        rows={shown?.data ?? []}
        keyExtractor={(r) => r.id}
        onRowPress={(r) => setFormRecordId(r.id)}
        rowAccessibilityLabel={(r) => `${join(', ', r.pickUpFullName, r.trackingNo, r.status)}. Edit pickup`}
        rowStyle={(r) => (r.reminded ? { backgroundColor: REMINDED_BG } : undefined)}
        loading={isFetching && !shown}
        stale={!currentData && isFetching && !!data}
        error={error && !isFetching ? errorMessage(error) : null}
        onRetry={refetch}
        emptyText="No pickups found."
        pagination={{
          page,
          onPageChange: setPage,
          rowsPerPage,
          rowsPerPageOptions: ROWS_PER_PAGE_OPTIONS,
          onRowsPerPageChange: (n) => {
            setRowsPerPage(n);
            setPage(0);
          },
          total: shown?.total ?? 0,
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-start' },
  // Nearly full width: a small gap at the sides, smaller than the page padding.
  table: { marginHorizontal: 8 },
});
