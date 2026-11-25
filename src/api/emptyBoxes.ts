/** Filter for GET /emptybox/getAll (EmptyBoxFilterDto). The server adds the user's role and agent from the token. */
// TODO: add the filter fields (search, dates, ...) once EmptyBoxFilterDto's fields are known.
export type EmptyBoxFilter = Record<string, string | number>;

/** One empty-box order from GET /emptybox/getAll (EmptyBoxModel; `id` comes from BaseModel). */
export type EmptyBoxOrder = {
  id: number;
  trackingNo: string;
  postingDate: string;
  deliveryDate: string;
  company: string;
  agent: string;
  timeFrom: string;
  timeTo: string;
  name: string;
  phone: string;
  postalCode: string;
  prefecture: string;
  city: string;
  town: string;
  streetAddress: string;
  apartment: string;
  regQty: number | null;
  regRate: number | null;
  halfQty: number | null;
  halfRate: number | null;
  /** "Regular/Half" counts, formatted by the server. */
  totalOrder: string;
};

export type EmptyBoxesResponse = { data: EmptyBoxOrder[]; total: number };
