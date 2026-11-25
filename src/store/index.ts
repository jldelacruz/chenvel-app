import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { api } from './api';
import auth, { logout } from './authSlice';
import payments from './paymentsSlice';

// On logout, forget all cached server data so the next user never sees the previous user's data.
const listener = createListenerMiddleware();
listener.startListening({
  actionCreator: logout.pending,
  effect: (_action, { dispatch }) => {
    dispatch(api.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: { auth, payments, [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().prepend(listener.middleware).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Typed versions of react-redux's hooks; use these instead of the plain ones. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
