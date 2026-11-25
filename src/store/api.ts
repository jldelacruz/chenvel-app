import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/api/config';
import type { PackageFilter } from '@/api/packages';
import type { Payment, PaymentFilter } from '@/api/payments';

import { logout } from './authSlice';
import type { RootState } from './index';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  // Every request goes out as the signed-in user.
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.session?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Accept', 'application/json');
    return headers;
  },
  // Errors come back as plain text; successes as JSON.
  responseHandler: 'content-type',
});

/** Like fetchBaseQuery, but a 401 (sign-in no longer accepted) sends the user back to login. */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) api.dispatch(logout());
  return result;
};

export type PaymentsArgs = { filter: PaymentFilter; start: number; length: number };
/** One page of payments. The API sends no total count, so `hasMore` says whether a next page exists. */
export type PaymentsPage = { rows: Payment[]; hasMore: boolean };

/**
 * All server data goes through here. Results are cached per set of arguments (filter + page), so
 * going back to a page shown recently is instant; cached data is kept 5 minutes after the last
 * screen using it closes, and is reloaded when a screen opens with data older than 30 seconds.
 * The cache is emptied on logout (see store/index.ts).
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: 30,
  endpoints: (build) => ({
    getPayments: build.query<PaymentsPage, PaymentsArgs>({
      // Ask for one extra row: if it comes back, there is a next page.
      query: ({ filter, start, length }) => ({
        url: '/payment/filter',
        params: { ...filter, start, length: length + 1 },
      }),
      transformResponse: (rows: Payment[], _meta, { length }) => ({
        rows: rows.slice(0, length),
        hasMore: rows.length > length,
      }),
    }),
    // Response shape not known yet, so it stays `unknown` until it has been logged and typed.
    // e.g. /package/filter?PaymentStatus=UNPAID&SearchBy=Box%20Number&SearchValue=114EB194&Start=0&Length=10
    searchPackages: build.query<unknown, PackageFilter>({
      query: ({ PaymentStatus, SearchBy, SearchValue, Start, Length }) => ({
        url: '/package/filter',
        params: { PaymentStatus, SearchBy, SearchValue, Start, Length },
      }),
    }),
  }),
});

export const { useGetPaymentsQuery, useLazySearchPackagesQuery } = api;

/** A short, user-facing message for a failed request. */
export function errorMessage(error: unknown): string {
  const e = error as FetchBaseQueryError | undefined;
  if (e?.status === 'TIMEOUT_ERROR') return 'The server took too long to respond. Please try again.';
  if (e?.status === 'FETCH_ERROR') return 'Can’t reach the server. Check your internet connection and try again.';
  if (e && typeof e.status === 'number' && typeof e.data === 'string' && e.data.trim() && e.data.length < 200) {
    return e.data.trim();
  }
  return `Something went wrong${e && typeof e.status === 'number' ? ` (${e.status})` : ''}. Please try again.`;
}
