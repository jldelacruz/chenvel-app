import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { logout } from './authSlice';

type PaymentsState = {
  /**
   * The payment (its `id`) picked in the Payments table, which opens Apply Payment for it.
   * null when Apply Payment was opened from Home instead. Kept in memory only.
   */
  selectedPaymentId: number | null;
};

const initialState: PaymentsState = { selectedPaymentId: null };

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    selectPayment(state, action: PayloadAction<number>) {
      state.selectedPaymentId = action.payload;
    },
    clearSelectedPayment(state) {
      state.selectedPaymentId = null;
    },
  },
  extraReducers: (builder) => {
    // Never carry one user's selection over to the next.
    builder.addCase(logout.pending, () => initialState);
  },
});

export const { selectPayment, clearSelectedPayment } = paymentsSlice.actions;
export default paymentsSlice.reducer;
