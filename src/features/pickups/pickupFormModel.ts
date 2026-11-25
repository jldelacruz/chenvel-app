import {
  EMPTY_BOX_RATE,
  PRIVATE_TIME_FROM,
  PRIVATE_TIME_TO,
  SAGAWA_FORWARDER_ID,
  type NewPickup,
  type PickupRecord,
} from '@/api/pickups';

/** What the pickup form edits. Box counts are text while typing and become numbers on save. */
export type PickupFormValues = {
  trackingNo: string;
  datePickup: string;
  isPrivate: boolean;
  forwarder: number;
  timeFrom: string;
  timeTo: string;
  company: number;
  agent: number;
  operator: string;
  pickupPhone: string;
  pickupLname: string;
  pickupFname: string;
  pickupPostal: string;
  prefecture: number;
  city: number;
  town: number;
  pickupAddress: string;
  pickupBoxRegQty: string;
  pickupBoxHalfQty: string;
  emptyBoxRegQty: string;
  memo: string;
  japanese: string;
  status: string;
  /** Not editable; kept so saving an edit doesn't reset a paid status. */
  emptyBoxPaymentStatus: string;
};

export type PickupFormErrors = Partial<Record<keyof PickupFormValues, string>>;

/** A new, empty pickup (same defaults as the web app's pickupModel). */
export const emptyPickupForm: PickupFormValues = {
  trackingNo: '',
  datePickup: '',
  isPrivate: false,
  forwarder: 0,
  timeFrom: PRIVATE_TIME_FROM,
  timeTo: PRIVATE_TIME_TO,
  company: 0,
  agent: 0,
  operator: '',
  pickupPhone: '',
  pickupLname: '',
  pickupFname: '',
  pickupPostal: '',
  prefecture: 0,
  city: 0,
  town: 0,
  pickupAddress: '',
  pickupBoxRegQty: '0',
  pickupBoxHalfQty: '0',
  emptyBoxRegQty: '0',
  memo: '',
  japanese: '',
  status: 'LINED-UP',
  emptyBoxPaymentStatus: 'UNPAID',
};

/** Form values for editing an existing pickup. Missing fields fall back to the empty form's. */
export function fromPickupRecord(r: PickupRecord): PickupFormValues {
  const e = emptyPickupForm;
  const text = (v: string | null | undefined, fallback: string) => v ?? fallback;
  const num = (v: number | null | undefined) => Number(v) || 0;
  return {
    trackingNo: text(r.trackingNo, e.trackingNo),
    // The server may send a full date-time ("2026-11-25T00:00:00"); the form uses the date part.
    datePickup: text(r.datePickup, '').slice(0, 10),
    isPrivate: !!r.isPrivate,
    forwarder: num(r.forwarder),
    timeFrom: text(r.timeFrom, e.timeFrom),
    timeTo: text(r.timeTo, e.timeTo),
    company: num(r.company),
    agent: num(r.agent),
    operator: text(r.operator, ''),
    pickupPhone: text(r.pickupPhone, ''),
    pickupLname: text(r.pickupLname, ''),
    pickupFname: text(r.pickupFname, ''),
    pickupPostal: text(r.pickupPostal, ''),
    prefecture: num(r.prefecture),
    city: num(r.city),
    town: num(r.town),
    pickupAddress: text(r.pickupAddress, ''),
    pickupBoxRegQty: String(num(r.pickupBoxRegQty)),
    pickupBoxHalfQty: String(num(r.pickupBoxHalfQty)),
    emptyBoxRegQty: String(num(r.emptyBoxRegQty)),
    memo: text(r.memo, ''),
    japanese: text(r.japanese, ''),
    status: text(r.status, e.status),
    emptyBoxPaymentStatus: text(r.emptyBoxPaymentStatus, e.emptyBoxPaymentStatus),
  };
}

const count = (text: string) => Number(text) || 0;

export const emptyBoxTotal = (v: PickupFormValues) => count(v.emptyBoxRegQty) * EMPTY_BOX_RATE;

/** Field checks (same rules as the web app's pickupValidation). Empty result = valid. */
export function validatePickup(v: PickupFormValues): PickupFormErrors {
  const e: PickupFormErrors = {};
  const isWhole = (s: string) => /^\d*$/.test(s.trim());

  if (!v.datePickup) e.datePickup = 'Pickup date is required.';
  if (!v.timeFrom) e.timeFrom = 'Time (from) is required.';
  if (!v.timeTo) e.timeTo = 'Time (to) is required.';
  if (v.company < 1) e.company = 'Please select a company.';
  if (v.agent < 1) e.agent = 'Please select an agent.';

  if (!v.pickupLname.trim()) e.pickupLname = 'Please input the last name.';
  else if (v.pickupLname.length > 15) e.pickupLname = 'Maximum 15 characters.';
  if (!v.pickupFname.trim()) e.pickupFname = 'Please input the first name.';
  else if (v.pickupFname.length > 15) e.pickupFname = 'Maximum 15 characters.';

  if (!v.pickupPhone.trim()) e.pickupPhone = 'Please input a phone number.';
  else if (v.pickupPhone.length < 10 || v.pickupPhone.length > 11) e.pickupPhone = 'Please input a valid phone number.';

  if (!v.pickupPostal.trim()) e.pickupPostal = 'Please input a postal code.';
  if (v.prefecture < 1) e.prefecture = 'Please select a prefecture.';
  if (v.city < 1) e.city = 'Please select a city.';
  if (v.town < 1) e.town = 'Please select a town.';

  if (!v.pickupAddress.trim()) e.pickupAddress = 'Please input the street address.';
  else if (v.pickupAddress.length > 45) e.pickupAddress = 'Maximum 45 characters.';

  if (!isWhole(v.pickupBoxRegQty)) e.pickupBoxRegQty = 'Invalid number.';
  if (!isWhole(v.pickupBoxHalfQty)) e.pickupBoxHalfQty = 'Invalid number.';
  if (!isWhole(v.emptyBoxRegQty)) e.emptyBoxRegQty = 'Invalid number.';
  return e;
}

/** Checks across fields, done after validatePickup passes. Returns the problem, or null. */
export function checkPickupRules(v: PickupFormValues): string | null {
  const sagawa = v.forwarder === SAGAWA_FORWARDER_ID;
  if (!v.isPrivate && !sagawa) return 'Please turn on "Private?" if the forwarder is not SAGAWA EXPRESS.';
  if (count(v.pickupBoxRegQty) === 0 && count(v.pickupBoxHalfQty) === 0) {
    return 'At least 1 Jumbo or Half box must be greater than zero.';
  }
  if (sagawa) {
    const longWord = v.pickupAddress.split(' ').find((w) => w.length > 15);
    if (longWord) return `Each word of the address must be 15 characters or less. Problem: "${longWord}"`;
  }
  return null;
}

/** The body for POST /pickup. */
export const toNewPickup = ({ emptyBoxPaymentStatus, ...v }: PickupFormValues): NewPickup => ({
  ...v,
  pickupBoxRegQty: count(v.pickupBoxRegQty),
  pickupBoxHalfQty: count(v.pickupBoxHalfQty),
  emptyBoxRegQty: count(v.emptyBoxRegQty),
  emptyBoxTotalPayable: emptyBoxTotal({ ...v, emptyBoxPaymentStatus }),
  regularRateEmptyBox: EMPTY_BOX_RATE,
  EmptyBoxPaymentStatus: emptyBoxPaymentStatus,
});
