import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const REMEMBER_KEY = 'auth.rememberedUser';

type AuthContextValue = {
  username: string | null;
  /** False until the saved "Remember me" sign-in has been checked on startup. */
  ready: boolean;
  signIn: (username: string, password: string, remember: boolean) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Placeholder sign-in: any non-empty username/password is accepted.
 * With "Remember me" the username (never the password) is saved on the device so the next
 * launch skips the login screen; without it, closing or reloading the app signs out.
 * Replace signIn with a real API call (and store a session token instead) when a backend exists.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_KEY)
      .then((saved) => {
        if (saved) setUsername(saved);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value: AuthContextValue = {
    username,
    ready,
    signIn: (name, _password, remember) => {
      setUsername(name);
      (remember ? AsyncStorage.setItem(REMEMBER_KEY, name) : AsyncStorage.removeItem(REMEMBER_KEY)).catch(() => {});
    },
    signOut: () => {
      setUsername(null);
      AsyncStorage.removeItem(REMEMBER_KEY).catch(() => {});
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
