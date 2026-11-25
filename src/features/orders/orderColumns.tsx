import { Text } from 'react-native-paper';

import type { EmptyBoxOrder } from '@/api/emptyBoxes';
import type { DataTableColumn } from '@/components/AppDataTable';
import { join } from '@/utils/format';

/** Columns for the empty-box orders table (fields of EmptyBoxModel). */
export const orderColumns: DataTableColumn<EmptyBoxOrder>[] = [
  { key: 'id', title: 'ID', width: 90, value: (r) => r.id },
  { key: 'trackingNo', title: 'Tracking #', width: 130, value: (r) => r.trackingNo },
  { key: 'postingDate', title: 'Posting Date', width: 130, value: (r) => r.postingDate },
  { key: 'deliveryDate', title: 'Delivery Date', width: 130, value: (r) => r.deliveryDate },
  { key: 'totalOrder', title: 'Regular / Half', width: 130, value: (r) => r.totalOrder },
  {
    key: 'details',
    title: 'Client Details',
    width: 400,
    // Name / phone / address, postal — wraps to two lines instead of being cut off.
    render: (r) => (
      <Text variant="bodyMedium" numberOfLines={2}>
        {join(
          ' / ',
          r.name,
          r.phone,
          join(', ', join(' ', r.prefecture, r.city, r.town, r.streetAddress, r.apartment), r.postalCode),
        )}
      </Text>
    ),
  },
  { key: 'schedule', title: 'Schedule', width: 170, value: (r) => join(' - ', r.timeFrom, r.timeTo) },
  { key: 'company', title: 'Company', width: 180, value: (r) => r.company },
  { key: 'agent', title: 'Agent', width: 180, value: (r) => r.agent },
];
