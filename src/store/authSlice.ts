import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { LoginError, loginRequest } from '@/api/auth';
import {
  clearSession,
  loadSession,
  saveSession,
  setRememberedUserName,
  tokenExpiry,
  type Session,
} from '@/auth/sessionStorage';

type AuthState = {
  session: Session | null;
  /** False until the saved session has been checked on startup. */
  restored: boolean;
  status: 'idle' | 'loading';
  error: string | null;
};

const initialState: AuthState = { session: null, restored: false, status: 'idle', error: null };

/** On startup (and on page refresh): sign back in from the saved session, if it hasn't expired. */
export const restoreSession = createAsyncThunk('auth/restore', () => loadSession());

export const login = createAsyncThunk<
  Session,
  { userName: string; password: string; remember: boolean },
  { rejectValue: string }
>('auth/login', async ({ userName, password, remember }, { rejectWithValue }) => {
  try {
    const data = await loginRequest(userName, password);
    const session: Session = {
      token: data.token,
      refreshToken: data.refreshToken,
      expiresAt: tokenExpiry(data.token),
      user: data.credential,
    };
    // Always saved, so a refresh or restart stays signed in until the user logs out.
    await saveSession(session);
    // "Remember me" only pre-fills the username on the login screen next time.
    await setRememberedUserName(remember ? userName : null);
    return session;
  } catch (e) {
    return rejectWithValue(e instanceof LoginError ? e.message : 'Something went wrong. Please try again.');
  }
});

export const logout = createAsyncThunk('auth/logout', () => clearSession());

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearLoginError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.restored = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.restored = true;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.session = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Something went wrong. Please try again.';
      })
      // Sign out straight away; clearing storage happens in the background.
      .addCase(logout.pending, (state) => {
        state.session = null;
        state.error = null;
      });
  },
});

export const { clearLoginError } = authSlice.actions;
export default authSlice.reducer;
