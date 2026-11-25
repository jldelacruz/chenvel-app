import type { UserCredential } from './auth';

/** Search filter for GET /payment/filter (sent as URL query parameters, with start/length paging). */
export type PaymentFilter = {
  paymentDate: string;
  paidThru: number;
  searchBy: string;
  searchValue: string;
  status: string;
  isConfirmed: boolean;
  isHold: boolean;
  method: string;
  agentId: number;
  companyId: number;
};

/**
 * One payment, as returned by GET /payment/filter. Field types were read from a real response;
 * any of them may turn out to be null for some records.
 */
export type Payment = {
  id: number;
  referenceNo: number;
  serialNo: string;
  paymentDate: string;
  payor: string;
  amount: number;
  excess: number;
  memo: string;
  method: string;
  type: string;
  status: string;
  paidThru: number;
  paidThru2: string;
  paymentDays: number;
  agent: number;
  agentName: string;
  company: number;
  companyName: string;
  isDeleted: boolean;
  createdBy: string;
  dateCreated: string;
};

/**
 * The default filter (everything), scoped to the signed-in user's agent and company.
 * With `payorSearch`, only payments whose payor matches it (server-side search).
 */
export const defaultPaymentFilter = (user: UserCredential, payorSearch = ''): PaymentFilter => ({
  paymentDate: '',
  paidThru: 0,
  // The server only recognises "Payor" with this exact capitalisation.
  searchBy: payorSearch ? 'Payor' : '',
  searchValue: payorSearch,
  status: 'ALL',
  isConfirmed: true,
  isHold: false,
  method: '',
  agentId: user.agentId,
  companyId: user.companyId,
});
