import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadRememberedUserName } from '@/auth/sessionStorage';
import { Panel } from '@/components/Panel';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearLoginError, login } from '@/store/authSlice';
import { fontFamilies, shadows } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.status === 'loading');
  const loginError = useAppSelector((state) => state.auth.error);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState(''); // Short message for links that have no page yet.

  const usernameMissing = submitted && !username.trim();
  const passwordMissing = submitted && !password;

  // "Remember me" from last time: fill in the username and keep the box ticked.
  useEffect(() => {
    loadRememberedUserName().then((saved) => {
      if (!saved) return;
      setUsername((current) => current || saved);
      setRemember(true);
    });
  }, []);

  const logIn = () => {
    setSubmitted(true);
    if (loading || !username.trim() || !password) return;
    // A successful login switches the app to the signed-in pages automatically (see src/app/_layout.tsx).
    dispatch(login({ userName: username.trim(), password, remember }));
  };

  // The server's error is about what was typed before; hide it once either box changes.
  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    if (loginError) dispatch(clearLoginError());
  };

  // Soft grey filled boxes; the blue outline only appears while typing (or red on error).
  const inputProps = {
    mode: 'outlined' as const,
    dense: true,
    style: { backgroundColor: theme.colors.surfaceVariant },
    outlineColor: 'transparent',
    outlineStyle: styles.inputOutline,
    autoCapitalize: 'none' as const,
    autoCorrect: false,
  };
  const muted = { color: theme.colors.onSurfaceVariant };
  const link = { color: theme.colors.primary, fontFamily: fontFamilies.medium };

  return (
    // White page (surface colour, so dark mode still gets its dark surface).
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.colors.surface }]}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
          <Panel style={styles.card}>
            <Text
              variant="displaySmall"
              accessibilityRole="header"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              Login
            </Text>

            <View>
              <Text variant="bodyMedium" style={[styles.label, muted]}>
                Username:
              </Text>
              <TextInput
                {...inputProps}
                value={username}
                onChangeText={edit(setUsername)}
                autoComplete="username"
                textContentType="username"
                returnKeyType="go"
                onSubmitEditing={logIn}
                error={usernameMissing}
                accessibilityLabel="Username"
              />
              <HelperText type="error" visible={usernameMissing}>
                Please enter your username.
              </HelperText>
            </View>

            <View>
              <Text variant="bodyMedium" style={[styles.label, muted]}>
                Password:
              </Text>
              <TextInput
                {...inputProps}
                value={password}
                onChangeText={edit(setPassword)}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={logIn}
                error={passwordMissing}
                accessibilityLabel="Password"
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword((s) => !s)}
                  />
                }
              />
              <HelperText type="error" visible={passwordMissing}>
                Please enter your password.
              </HelperText>
            </View>

            <View style={styles.optionsRow}>
              {/* One pressable for box + label (a Paper Checkbox here would put a button inside a button on web). */}
              <Pressable
                onPress={() => setRemember((r) => !r)}
                role="checkbox"
                aria-checked={remember}
                aria-label="Remember me"
                hitSlop={8}
                style={styles.remember}
              >
                <Icon
                  source={remember ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={remember ? theme.colors.primary : theme.colors.outline}
                />
                <Text variant="bodyMedium" style={link}>
                  Remember me
                </Text>
              </Pressable>
              <Text
                variant="bodyMedium"
                style={link}
                accessibilityRole="link"
                onPress={() => setNotice('Password reset isn’t set up yet.')}
              >
                Forgot Password ?
              </Text>
            </View>

            {loginError && (
              <View
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={[styles.errorBox, { backgroundColor: theme.colors.errorContainer }]}
              >
                <Icon source="alert-circle-outline" size={20} color={theme.colors.onErrorContainer} />
                <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
                  {loginError}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={logIn}
              loading={loading}
              accessibilityLabel={loading ? 'Logging in' : 'Login'}
              style={[styles.button, { boxShadow: shadows.button }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Login
            </Button>

            <View style={styles.signupRow}>
              <Text variant="bodyLarge" style={muted}>
                Don’t have an account?
              </Text>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.primary }}
                accessibilityRole="link"
                onPress={() => setNotice('Sign up isn’t set up yet.')}
              >
                Sign up
              </Text>
            </View>

            <Text variant="bodySmall" style={[styles.terms, muted]}>
              By creating or logging into an account you are agreeing with our{' '}
              <Text variant="bodySmall" style={styles.termsStrong}>
                Terms and Conditions
              </Text>{' '}
              and{' '}
              <Text variant="bodySmall" style={styles.termsStrong}>
                Privacy Policy
              </Text>
              .
            </Text>
          </Panel>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2500}>
        {notice}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  // flexGrow + center keeps the card in the middle of the screen, and still scrolls if the
  // keyboard or a small screen leaves too little room.
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 440, paddingHorizontal: 28, paddingVertical: 36, gap: 6 },
  title: { textAlign: 'center', marginBottom: 24 },
  label: { marginBottom: 6 },
  inputOutline: { borderRadius: 8 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { alignSelf: 'center', width: '75%', borderRadius: 8, marginTop: 28 },
  buttonContent: { height: 50 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8, padding: 12, marginTop: 16 },
  errorText: { flex: 1 },
  buttonLabel: { fontSize: 16 },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  terms: { textAlign: 'center', marginTop: 20 },
  termsStrong: { fontFamily: fontFamilies.semibold },
});
