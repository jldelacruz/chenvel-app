import type { PackageListItem } from '@/api/packages';
import type { DataTableColumn } from '@/components/AppDataTable';

/** Columns for the packages table (fields of PackagesGetAllViewModel). */
export const packageColumns: DataTableColumn<PackageListItem>[] = [
  { key: 'id', title: 'ID', width: 90, value: (r) => r.id },
  { key: 'boxno', title: 'Box #', width: 130, value: (r) => r.boxno },
  { key: 'senderFullName', title: 'Sender', width: 200, value: (r) => r.senderFullName },
  { key: 'equivalent', title: 'Equivalent', width: 130, value: (r) => r.equivalent },
  { key: 'destination', title: 'Destination', width: 300, titleLines: 1, value: (r) => r.destination },
  { key: 'status', title: 'Status', width: 130, value: (r) => r.status },
];
