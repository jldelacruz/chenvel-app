/**
 * Filter for GET /pickup/filter (sent as URL query parameters, with start/length paging).
 * Same fields and defaults as the web app. The server scopes results by the signed-in user's
 * role and agent (from the token), so agentId / companyId 0 means "all I'm allowed to see".
 */
export type PickupFilter = {
  isPrivate: string;
  companyId: number;
  agentId: number;
  datePickup: string;
  datePickupEnd: string;
  searchBy: string;
  searchValue: string;
  status: string;
  prefecture: number;
  forwarder: number;
  city: number;
  paymentStatus: string;
};

export const defaultPickupFilter: PickupFilter = {
  isPrivate: '',
  companyId: 0,
  agentId: 0,
  datePickup: '',
  datePickupEnd: '',
  searchBy: '',
  searchValue: '',
  status: '',
  prefecture: 0,
  forwarder: 0,
  city: 0,
  paymentStatus: '',
};

/**
 * One pickup (PickupModel), as returned in `data` by GET /pickup/filter.
 * Field names are taken from the web app; types are assumed and not yet checked against a real
 * response, so most are optional / nullable.
 */
export type Pickup = {
  id: number;
  company?: string | null;
  agent?: string | null;
  agentId?: number | null;
  trackingNo?: string | null;
  forwarder?: string | null;
  pickUpFullName?: string | null;
  dateposted?: string | null;
  datePickup?: string | null;
  timeFrom?: string | null;
  timeTo?: string | null;
  pickupPostal?: string | null;
  prefecture?: string | null;
  city?: string | null;
  town?: string | null;
  pickupBoxRegQty?: number | null;
  pickupBoxHalfQty?: number | null;
  /** "Regular / Half / Pasabay" counts, already formatted by the server. */
  pickupTotal?: string | number | null;
  pickupPhone?: string | null;
  pickupAddress?: string | null;
  /** Japanese memo. */
  japanese?: string | null;
  status?: string | null;
  createdBy?: string | null;
  reminded?: boolean | null;
};

/** Response of GET /pickup/filter: one page of rows plus the total matching the filter. */
export type PickupsResponse = { data: Pickup[]; total: number };

/** Pickup statuses (same as the web app's PICKUP_STATUS). */
export const PICKUP_STATUSES = ['LINED-UP', 'SCHEDULED', 'PICKED-UP', 'CANCELLED'] as const;

/** Forwarders (same ids as the web app). */
export const FORWARDERS = [
  { value: 2, label: 'FROSBYM INC' },
  { value: 5, label: 'KAINZ' },
  { value: 7, label: 'KAINZ KONO' },
  { value: 8, label: 'LEMON - SELF' },
  { value: 9, label: 'LEMON UNSO' },
  { value: 11, label: 'SAGAWA EXPRESS' },
  { value: 18, label: 'SELF PICK-UP' },
  { value: 19, label: 'ROM' },
  { value: 20, label: 'KAINZ-SAGAWA' },
  { value: 21, label: 'LEMON-SAGAWA' },
  { value: 22, label: 'ROM-SAGAWA' },
  { value: 23, label: 'NO RECORD' },
];

/** SAGAWA EXPRESS: not private, no pasabay empty boxes, max 15 characters per address word. */
export const SAGAWA_FORWARDER_ID = 11;

export const PICKUP_TIMES_FROM = ['07:00 am', '08:00 am', '12:00 nn', '02:00 pm', '04:00 pm', '06:00 pm', '07:00 pm'];
export const PICKUP_TIMES_TO = ['02:00 pm', '04:00 pm', '06:00 pm', '08:00 pm', '09:00 pm'];

/** Private pickups are always the whole day. */
export const PRIVATE_TIME_FROM = '07:00 am';
export const PRIVATE_TIME_TO = '09:00 pm';

/** Price of one pasabay (empty) box, in yen. */
export const EMPTY_BOX_RATE = 600;

/** Body of POST /pickup (same fields as the web app's pickupModel). */
export type NewPickup = {
  datePickup: string;
  isPrivate: boolean;
  forwarder: number;
  timeFrom: string;
  timeTo: string;
  company: number;
  agent: number;
  pickupLname: string;
  pickupFname: string;
  pickupPhone: string;
  pickupPostal: string;
  prefecture: number;
  city: number;
  town: number;
  pickupAddress: string;
  pickupBoxRegQty: number;
  pickupBoxHalfQty: number;
  memo: string;
  status: string;
  operator: string;
  emptyBoxTotalPayable: number;
  emptyBoxRegQty: number;
  japanese: string;
  regularRateEmptyBox: number;
  trackingNo: string;
  EmptyBoxPaymentStatus: string;
};

/** Response of POST /pickup, e.g. { message: 'Insert Success' }. */
export type SavePickupResponse = { message: string };

/**
 * Last pickup for a phone number (GET /pickup/lastPickup), used to fill in a returning client.
 * Only the fields the form uses; types assumed from the web app.
 */
export type LastPickup = {
  pickupLname?: string | null;
  pickupFname?: string | null;
  pickupPostal?: string | null;
  pickupAddress?: string | null;
  prefecture?: number | null;
  city?: number | null;
  town?: number | null;
  company?: number | null;
  agent?: number | null;
};

/**
 * One pickup as returned by GET /pickup/{id}, used to fill in the edit form.
 * Same fields as NewPickup; types assumed from the web app (ids are numbers here, unlike the
 * names shown in the table).
 */
export type PickupRecord = Partial<Omit<NewPickup, 'EmptyBoxPaymentStatus'>> & {
  id: number;
  emptyBoxPaymentStatus?: string | null;
};

/** Statuses after which a pickup can no longer be edited (same as the web app). */
export const LOCKED_PICKUP_STATUSES = ['PICKED-UP', 'SCHEDULED'];
