import { Text } from 'react-native-paper';

import type { Pickup } from '@/api/pickups';
import type { DataTableColumn } from '@/components/AppDataTable';
import { join } from '@/utils/format';

/** Same columns and widths as the web app's pickups table (tableConfig.pickups). */
export const pickupColumns: DataTableColumn<Pickup>[] = [
  { key: 'id', title: 'ID', width: 90, value: (r) => r.id },
  { key: 'trackingNo', title: 'Tracking #', width: 130, value: (r) => r.trackingNo },
  { key: 'forwarder', title: 'Forwarder', width: 130, value: (r) => r.forwarder },
  { key: 'datePickup', title: 'Date Pick-Up', width: 130, value: (r) => r.datePickup },
  { key: 'pickupTotal', title: 'Regular / Half / Pasabay', width: 200, value: (r) => r.pickupTotal },
  {
    key: 'details',
    title: 'Client Details',
    width: 400,
    // Name / phone / address, postal — wraps to two lines instead of being cut off.
    render: (r) => (
      <Text variant="bodyMedium" numberOfLines={2}>
        {join(
          ' / ',
          r.pickUpFullName,
          r.pickupPhone,
          join(', ', join(' ', r.prefecture, r.city, r.town, r.pickupAddress), r.pickupPostal),
        )}
      </Text>
    ),
  },
  { key: 'japanese', title: 'Japanese Memo', width: 180, value: (r) => r.japanese },
  { key: 'schedule', title: 'Schedule', width: 170, value: (r) => join(' - ', r.timeFrom, r.timeTo) },
  { key: 'company', title: 'Company', width: 180, value: (r) => r.company },
  { key: 'agent', title: 'Agent', width: 180, value: (r) => r.agent },
  { key: 'status', title: 'Status', width: 130, value: (r) => r.status },
  { key: 'createdBy', title: 'Created By', width: 130, value: (r) => r.createdBy },
];
