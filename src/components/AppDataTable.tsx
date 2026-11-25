import { useMemo, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { ActivityIndicator, Button, DataTable, Text, useTheme } from 'react-native-paper';

import { Panel } from '@/components/Panel';
import { RowsPerPagePicker } from '@/components/RowsPerPagePicker';

export type DataTableColumn<T> = {
  /** Unique id of the column (also used as React key). */
  key: string;
  title: string;
  /** Relative width, like flexbox `flex`. Default 1. Ignored when columns have `width`. */
  flex?: number;
  /**
   * Width in px. When columns have widths, the table is at least as wide as their sum: on small
   * screens it scrolls sideways, on wide screens the columns grow (in proportion) to fill it.
   */
  width?: number;
  /** Right-aligns the title and cell (amounts, counts). */
  numeric?: boolean;
  /** Hide the column, e.g. `hidden: narrow` on phones. */
  hidden?: boolean;
  /** Lines the header title may wrap to. Default 1. */
  titleLines?: number;
  /** Plain text for the cell. Ignored when `render` is given. */
  value?: (row: T) => string | number | null | undefined;
  /** Custom cell content (several lines, badges, buttons...). */
  render?: (row: T) => ReactNode;
  /** Text style for `value` cells, fixed or per row (e.g. red when negative). */
  textStyle?: StyleProp<TextStyle> | ((row: T) => StyleProp<TextStyle>);
  /** Extra style for both the title and the cells of this column. */
  style?: StyleProp<ViewStyle>;
};

export type DataTablePagination = {
  page: number; // 0-based
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  /** Shows the "Rows per page" picker when given together with `onRowsPerPageChange`. */
  rowsPerPageOptions?: number[];
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  /** Total number of rows, when known. */
  total?: number;
  /** For APIs without a total count: whether there is a next page. */
  hasMore?: boolean;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  /** The rows of the current page. */
  rows: T[];
  keyExtractor: (row: T) => string | number;
  onRowPress?: (row: T) => void;
  rowAccessibilityLabel?: (row: T) => string;
  /** Extra style per row, e.g. a highlight background. */
  rowStyle?: (row: T) => StyleProp<ViewStyle>;
  /** First load: shows a spinner instead of rows. */
  loading?: boolean;
  /** Rows are from the previous page/search while a new one loads: shown dimmed. */
  stale?: boolean;
  /** Error message; shows it with a "Try again" button (when `onRetry` is given). */
  error?: string | null;
  onRetry?: () => void;
  emptyText?: string;
  pagination?: DataTablePagination;
  style?: StyleProp<ViewStyle>;
};

/**
 * Themed table: header, rows, loading / error / empty states and optional pagination.
 *
 * Works for server paging (pass the current page's rows plus `total` or `hasMore`) and for
 * local data (see `useLocalPagination` below).
 */
export function AppDataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  rowAccessibilityLabel,
  rowStyle,
  loading = false,
  stale = false,
  error,
  onRetry,
  emptyText = 'No records found.',
  pagination,
  style,
}: Props<T>) {
  const theme = useTheme();
  const visible = columns.filter((c) => !c.hidden);
  const fixedWidth = visible.some((c) => c.width != null);
  const minWidth = fixedWidth ? visible.reduce((sum, c) => sum + (c.width ?? 100), 0) : undefined;
  const colStyle = (c: DataTableColumn<T>) => [
    fixedWidth ? { flex: c.width ?? 100 } : { flex: c.flex ?? 1 },
    c.numeric && styles.numericCol,
    c.style,
  ];

  // Rows scroll sideways together with the header; messages stay in view below them.
  let message: ReactNode = null;
  let body: ReactNode = null;
  if (loading) {
    message = (
      <View style={styles.message}>
        <ActivityIndicator accessibilityLabel="Loading" />
      </View>
    );
  } else if (error) {
    message = (
      <View style={styles.message} accessibilityRole="alert">
        <Text variant="bodyMedium" style={[styles.center, { color: theme.colors.error }]}>
          {error}
        </Text>
        {onRetry && (
          <Button mode="outlined" icon="refresh" onPress={onRetry}>
            Try again
          </Button>
        )}
      </View>
    );
  } else if (rows.length === 0) {
    message = (
      <View style={styles.message}>
        <Text variant="bodyMedium" style={[styles.center, { color: theme.colors.onSurfaceVariant }]}>
          {emptyText}
        </Text>
      </View>
    );
  } else {
    body = (
      <View style={stale && styles.stale}>
        {rows.map((row) => (
          <DataTable.Row
            key={keyExtractor(row)}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
            accessibilityLabel={rowAccessibilityLabel?.(row)}
            style={rowStyle?.(row)}
          >
            {visible.map((c) =>
              c.render ? (
                <DataTable.Cell key={c.key} numeric={c.numeric} style={colStyle(c)}>
                  {/* Wrapped in a View so custom content can span several lines. */}
                  <View style={styles.customCell}>{c.render(row)}</View>
                </DataTable.Cell>
              ) : (
                <DataTable.Cell
                  key={c.key}
                  numeric={c.numeric}
                  style={colStyle(c)}
                  textStyle={typeof c.textStyle === 'function' ? c.textStyle(row) : c.textStyle}
                >
                  {c.value?.(row) ?? ''}
                </DataTable.Cell>
              ),
            )}
          </DataTable.Row>
        ))}
      </View>
    );
  }

  const table = (
    <View style={fixedWidth && [styles.fill, { minWidth }]}>
      <DataTable.Header style={{ backgroundColor: theme.colors.elevation.level2 }}>
        {visible.map((c) => (
          <DataTable.Title key={c.key} numeric={c.numeric} numberOfLines={c.titleLines} style={colStyle(c)}>
            {c.title}
          </DataTable.Title>
        ))}
      </DataTable.Header>
      {body}
    </View>
  );

  return (
    <Panel style={style}>
      <DataTable>
        {fixedWidth ? (
          <ScrollView horizontal contentContainerStyle={styles.fill}>
            {table}
          </ScrollView>
        ) : (
          table
        )}

        {message}

        {pagination && <Footer pagination={pagination} shownRows={rows.length} />}
      </DataTable>
    </Panel>
  );
}

function Footer({ pagination: p, shownRows }: { pagination: DataTablePagination; shownRows: number }) {
  const from = p.page * p.rowsPerPage;
  const numberOfPages =
    p.total != null ? Math.max(1, Math.ceil(p.total / p.rowsPerPage)) : p.hasMore ? p.page + 2 : p.page + 1;
  const range = shownRows ? `${from + 1}–${from + shownRows}` : '0';
  const label = p.total != null ? `${range} of ${p.total}` : range;

  return (
    <View style={styles.footer}>
      {p.rowsPerPageOptions && p.onRowsPerPageChange && (
        <RowsPerPagePicker
          value={p.rowsPerPage}
          options={p.rowsPerPageOptions}
          onChange={p.onRowsPerPageChange}
        />
      )}
      <DataTable.Pagination page={p.page} numberOfPages={numberOfPages} onPageChange={p.onPageChange} label={label} />
    </View>
  );
}

/**
 * Paging for data that is already fully loaded (no server paging).
 *
 *   const { pageRows, pagination } = useLocalPagination(items);
 *   <AppDataTable rows={pageRows} pagination={pagination} ... />
 */
export function useLocalPagination<T>(items: T[], rowsPerPageOptions: number[] = [10, 25, 50]) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  // If the list shrinks (filter, delete), don't stay on a page that no longer exists.
  const lastPage = Math.max(0, Math.ceil(items.length / rowsPerPage) - 1);
  const current = Math.min(page, lastPage);
  const pageRows = useMemo(
    () => items.slice(current * rowsPerPage, (current + 1) * rowsPerPage),
    [items, current, rowsPerPage],
  );

  const pagination: DataTablePagination = {
    page: current,
    onPageChange: setPage,
    rowsPerPage,
    rowsPerPageOptions,
    onRowsPerPageChange: (n) => {
      setRowsPerPage(n);
      setPage(0);
    },
    total: items.length,
  };

  return { pageRows, pagination };
}

const styles = StyleSheet.create({
  fill: { flexGrow: 1 },
  numericCol: { paddingLeft: 12 }, // Keeps neighbouring number columns apart on narrow screens.
  customCell: { flex: 1, paddingVertical: 8 },
  message: { padding: 24, alignItems: 'center', gap: 12 },
  center: { textAlign: 'center' },
  stale: { opacity: 0.5 },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 16,
  },
});
