/** Search filter for GET /package/filter (sent as URL query parameters, like /payment/filter). */
export type PackageFilter = {
  SearchBy: string;
  SearchValue: string;
  PaymentStatus: string;
  Start: number;
  Length: number;
};

/** How /package/filter can search. */
export type PackageSearchBy = 'Box Number' | 'Tracking Number' | 'Sender Phone';

/** Unpaid packages for a box number, tracking number or sender's phone number. */
export const unpaidPackages = (searchBy: PackageSearchBy, value: string): PackageFilter => ({
  SearchBy: searchBy,
  SearchValue: value,
  PaymentStatus: 'UNPAID',
  Start: 0,
  Length: 1,
});

/**
 * One package from GET /package/filter. Only the fields the app uses are listed; `id` is assumed
 * (used to avoid adding the same package twice) and may be missing.
 */
export type Package = {
  id?: number | string;
  trackNo?: string;
  senderFullName: string;
  receiverFullName?: string;
  equivalent?: string | number; // Package size.
  receiverAddress?: string;
  receiverTown?: string;
  receiverCity?: string;
  receiverState?: string;
  receiverPostal?: string;
  boxno: string;
  payable: number;
};

/** Receiver's address, town, city, state and postal code on one line (blank parts skipped). */
export const packageDestination = (pkg: Package): string =>
  [pkg.receiverAddress, pkg.receiverTown, pkg.receiverCity, pkg.receiverState, pkg.receiverPostal]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ');

/** A row in Apply Payment's To Pay list. */
export type ToPayItem = {
  id: string;
  fullName: string;
  number: string; // Box number (has letters) or tracking number (digits only).
  amount: number;
};

/** The server may send the list directly or wrapped in an object (e.g. `{ data: [...] }`). */
export const packagesFromResponse = (response: unknown): Package[] => {
  if (Array.isArray(response)) return response;
  const wrapped = response as { data?: unknown } | null;
  return Array.isArray(wrapped?.data) ? wrapped.data : [];
};

export const toPayItemFromPackage = (pkg: Package): ToPayItem => ({
  // Without an id, fall back to the package's details so the same one still isn't added twice.
  id: String(pkg.id ?? `${pkg.boxno}|${pkg.senderFullName}|${pkg.payable}`),
  fullName: pkg.senderFullName,
  number: pkg.boxno,
  amount: Number(pkg.payable) || 0,
});

/** Filter for GET /package/getAll (PackageFilterDto). The server adds the user's role and agent from the token. */
// TODO: add the filter fields (search, status, ...) once PackageFilterDto's fields are known.
export type PackageListFilter = Record<string, string | number>;

/** One row from GET /package/getAll (PackagesGetAllViewModel; `id` comes from BaseModel). */
export type PackageListItem = {
  id: number;
  senderFullName: string;
  boxno: string;
  equivalent: string;
  destination: string;
  status: string;
};

export type PackagesResponse = { data: PackageListItem[]; total: number };
