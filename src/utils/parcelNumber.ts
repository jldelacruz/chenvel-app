export type ParcelNumberKind = 'box' | 'tracking';

/** Shortest number accepted on the Apply Payment form. */
export const MIN_PARCEL_NUMBER_LENGTH = 6;

/** Box numbers contain at least one letter; tracking numbers are digits only. */
export const parcelNumberKind = (value: string): ParcelNumberKind => (/[a-z]/i.test(value) ? 'box' : 'tracking');

export const parcelNumberLabel = (kind: ParcelNumberKind) => (kind === 'box' ? 'Box Number' : 'Tracking Number');
