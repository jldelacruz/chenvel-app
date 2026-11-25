import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppDataTable } from '@/components/AppDataTable';
import { Screen } from '@/components/Screen';
import { packageColumns } from '@/features/packages/packageColumns';
import { errorMessage, useGetAllPackagesQuery } from '@/store/api';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]; // The first option is the default.

export default function PackagesScreen() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]);

  // Paging happens on the server; each page is cached (see src/store/api.ts).
  const { currentData, data, error, isFetching, refetch } = useGetAllPackagesQuery({
    filter: {},
    start: page * rowsPerPage,
    length: rowsPerPage,
  });
  // While a new page loads, keep showing the previous one (dimmed) instead of an empty table.
  const shown = currentData ?? (isFetching ? data : undefined);

  return (
    <Screen title="Packages" subtitle="All packages." fullWidth>
      <AppDataTable
        style={styles.table}
        columns={packageColumns}
        rows={shown?.data ?? []}
        keyExtractor={(r) => r.id}
        loading={isFetching && !shown}
        stale={!currentData && isFetching && !!data}
        error={error && !isFetching ? errorMessage(error) : null}
        onRetry={refetch}
        emptyText="No packages found."
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
  // Nearly full width: a small gap at the sides, smaller than the page padding.
  table: { marginHorizontal: 8 },
});
