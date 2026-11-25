import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { UserCredential } from '@/api/auth';

/** What we keep about a signed-in user. Saved on the device so a refresh or restart stays signed in. */
export type Session = {
  token: string;
  refreshToken: string;
  /** When the token stops working, in milliseconds since 1970 (from the token itself). */
  expiresAt: number;
  user: UserCredential;
};

const KEY = 'auth.session';
/** Username filled in on the login screen when "Remember me" was ticked. Not a secret. */
const USERNAME_KEY = 'auth.rememberedUserName';

// Phones: the device's encrypted keychain/keystore. Web has no equivalent, so the browser's storage.
const store =
  Platform.OS === 'web'
    ? { get: AsyncStorage.getItem, set: AsyncStorage.setItem, remove: AsyncStorage.removeItem }
    : { get: SecureStore.getItemAsync, set: SecureStore.setItemAsync, remove: SecureStore.deleteItemAsync };

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await store.get(KEY);
    const session = raw ? (JSON.parse(raw) as Session) : null;
    return session && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session) {
  await store.set(KEY, JSON.stringify(session)).catch(() => {});
}

export async function clearSession() {
  await store.remove(KEY).catch(() => {});
  // Left over from the earlier placeholder login.
  await AsyncStorage.removeItem('auth.rememberedUser').catch(() => {});
}

/** Username saved by "Remember me", or null. */
export async function loadRememberedUserName(): Promise<string | null> {
  return AsyncStorage.getItem(USERNAME_KEY).catch(() => null);
}

export async function setRememberedUserName(userName: string | null) {
  await (userName ? AsyncStorage.setItem(USERNAME_KEY, userName) : AsyncStorage.removeItem(USERNAME_KEY)).catch(() => {});
}

/** Reads the expiry ("exp", in seconds) from a JWT. Falls back to 8 hours if it can't be read. */
export function tokenExpiry(token: string): number {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='))).exp;
    if (typeof exp === 'number') return exp * 1000;
  } catch {}
  return Date.now() + 8 * 60 * 60 * 1000;
}
