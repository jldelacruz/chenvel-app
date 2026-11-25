import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/api/config';
import type { PackageFilter, PackageListFilter, PackagesResponse } from '@/api/packages';
import type { Payment, PaymentFilter } from '@/api/payments';
import type { EmptyBoxesResponse, EmptyBoxFilter } from '@/api/emptyBoxes';
import type { CreditLimit, NamedItem, Town } from '@/api/lookups';
import type {
  LastPickup,
  NewPickup,
  PickupFilter,
  PickupRecord,
  PickupsResponse,
  SavePickupResponse,
} from '@/api/pickups';

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

export type PickupsArgs = { filter: PickupFilter; start: number; length: number };
export type PackagesArgs = { filter: PackageListFilter; start: number; length: number };
export type EmptyBoxesArgs = { filter: EmptyBoxFilter; start: number; length: number };

/**
 * All server data goes through here. Results are cached per set of arguments (filter + page), so
 * going back to a page shown recently is instant; cached data is kept 5 minutes after the last
 * screen using it closes, and is reloaded when a screen opens with data older than 30 seconds.
 * The cache is emptied on logout (see store/index.ts).
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Pickups', 'Pickup'],
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
    // GET /pickup/filter?...filter&start=0&length=10 -> { data: Pickup[], total: number }
    getPickups: build.query<PickupsResponse, PickupsArgs>({
      query: ({ filter, start, length }) => ({
        url: '/pickup/filter',
        params: { ...filter, start, length },
      }),
      providesTags: ['Pickups'],
    }),
    // Saving a pickup reloads the pickups table.
    addPickup: build.mutation<SavePickupResponse, NewPickup>({
      query: (pickup) => ({ url: '/pickup', method: 'POST', body: pickup }),
      invalidatesTags: (_result, error) => (error ? [] : ['Pickups']),
    }),
    // TODO: check these two URLs against the web app's getPickUp / updatePickUp (assumed here).
    getPickup: build.query<PickupRecord, number>({
      query: (id) => `/pickup/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Pickup', id }],
    }),
    updatePickup: build.mutation<SavePickupResponse, { id: number; pickup: NewPickup }>({
      query: ({ id, pickup }) => ({ url: `/pickup/${id}`, method: 'PUT', body: pickup }),
      invalidatesTags: (_result, error, { id }) => (error ? [] : ['Pickups', { type: 'Pickup', id }]),
    }),
    getLastPickupByPhone: build.query<LastPickup | null, string>({
      query: (phoneNumber) => ({ url: '/pickup/lastPickup', params: { companyId: 0, phoneNumber } }),
    }),

    // Lists for forms. These rarely change, so they are kept for an hour.
    getCompanies: build.query<NamedItem[], void>({
      query: () => '/company',
      keepUnusedDataFor: 3600,
    }),
    getAgents: build.query<NamedItem[], number>({
      query: (companyId) => `/agents/${companyId}`,
      keepUnusedDataFor: 3600,
    }),
    getStates: build.query<NamedItem[], number>({
      query: (countryId) => `/states/${countryId}`,
      keepUnusedDataFor: 3600,
    }),
    getCities: build.query<NamedItem[], number>({
      query: (stateId) => `/cities/${stateId}`,
      keepUnusedDataFor: 3600,
    }),
    getTowns: build.query<Town[], number>({
      query: (cityId) => `/towns/${cityId}`,
      keepUnusedDataFor: 3600,
    }),
    getTownById: build.query<Town, number>({
      query: (id) => `/towns/byId/${id}`,
    }),
    getTownByPostal: build.query<Town | null, string>({
      query: (postalCode) => `/towns/postal/${encodeURIComponent(postalCode)}`,
    }),
    getCreditLimit: build.query<CreditLimit, number>({
      query: (agentId) => `/accounting/creditlimit/${agentId}`,
    }),
    // GET /package/getAll?...filter&start=0&length=10 -> { data: PackageListItem[], total: number }
    getAllPackages: build.query<PackagesResponse, PackagesArgs>({
      query: ({ filter, start, length }) => ({
        url: '/package/getAll',
        params: { ...filter, start, length },
      }),
    }),
    // GET /emptybox/getAll?...filter&start=0&length=10 -> { data: EmptyBoxOrder[], total: number }
    getEmptyBoxes: build.query<EmptyBoxesResponse, EmptyBoxesArgs>({
      query: ({ filter, start, length }) => ({
        url: '/emptybox/getAll',
        params: { ...filter, start, length },
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

export const {
  useGetPaymentsQuery,
  useGetPickupsQuery,
  useAddPickupMutation,
  useGetPickupQuery,
  useUpdatePickupMutation,
  useLazyGetLastPickupByPhoneQuery,
  useGetCompaniesQuery,
  useGetAgentsQuery,
  useGetStatesQuery,
  useGetCitiesQuery,
  useGetTownsQuery,
  useLazyGetTownByIdQuery,
  useLazyGetTownByPostalQuery,
  useGetCreditLimitQuery,
  useGetAllPackagesQuery,
  useGetEmptyBoxesQuery,
  useLazySearchPackagesQuery,
} = api;

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
