export type ParcelNumberKind = 'box' | 'tracking' | 'phone';

/** Shortest number accepted on the Apply Payment form. */
export const MIN_PARCEL_NUMBER_LENGTH = 6;

/** Phone numbers are exactly 11 digits. */
const PHONE_NUMBER = /^\d{11}$/;

/**
 * Box numbers contain at least one letter. Without letters: exactly 11 digits is a phone number,
 * anything else is a tracking number.
 */
export const parcelNumberKind = (value: string): ParcelNumberKind => {
  if (/[a-z]/i.test(value)) return 'box';
  if (PHONE_NUMBER.test(value)) return 'phone';
  return 'tracking';
};

const LABELS: Record<ParcelNumberKind, string> = {
  box: 'Box Number',
  tracking: 'Tracking Number',
  phone: 'Phone Number',
};

export const parcelNumberLabel = (kind: ParcelNumberKind) => LABELS[kind];
