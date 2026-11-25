/**
 * Lists used by forms (companies, agents, prefectures, cities, towns) and related lookups.
 * Types are assumed from the web app and not yet checked against real responses.
 */

/** An item of GET /company, /agents/{companyId}, /states/{countryId}, /cities/{stateId}. */
export type NamedItem = { id: number; name: string };

/** A town (GET /towns/{cityId}, /towns/byId/{id}, /towns/postal/{postalCode}). */
export type Town = NamedItem & {
  /** Prefecture (state) id. */
  state: number;
  /** City id. */
  city: number;
  postalCode?: string | null;
  /** Island towns have an extra charge per box. */
  isIsland?: boolean | null;
  islandCharge?: number | null;
  /** No fixed pickup time in this area. */
  noDefiniteTime?: boolean | null;
};

/** GET /accounting/creditlimit/{agentId}: the agent's unpaid balance and credit limit. */
export type CreditLimit = { payable: number; credit: number };

/** Country id of Japan, whose prefectures are listed in the pickup form. */
export const JAPAN_COUNTRY_ID = 116;

/** Turns API items into dropdown options. */
export const toOptions = (items: NamedItem[] | undefined) =>
  (items ?? []).map((i) => ({ value: Number(i.id), label: i.name }));
