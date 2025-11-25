import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { useQuestitTheme } from '../lib/theme';
import { ONBOARDING_KEY } from '../constants';
import { APP_ENV } from '../lib/env';
import { useThemeManager } from '../hooks/useThemeManager';
import type { QuestitThemeToken } from '@questit/ui';
import { usePasswordAuth } from '../hooks/usePasswordAuth';

const ACCENT_OPTIONS: QuestitThemeToken[] = [
  'emerald',
  'sky',
  'violet',
  'amber',
  'rose',
  'cyan',
  'indigo',
  'lime',
  'slate'
];

const MODE_OPTIONS: Array<{ label: string; value: 'light' | 'dark' | 'system' }> = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'system' }
];

export function ProfileScreen() {
  const { accentHex } = useQuestitTheme();
  const { accent, mode, setAccent, setMode } = useThemeManager();
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const {
    status: authStatus,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
    resetStatus: resetAuthStatus
  } = usePasswordAuth();

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email || '');
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || '');
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const configured = hasSupabaseConfig;

  const handleSendLink = async () => {
    if (!supabase) {
      Alert.alert('Supabase not configured');
      return;
    }
    if (!email.trim()) {
      setMessage('Enter an email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('Sending a sign-in link…');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: 'questit://auth'
      }
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage('Check your inbox to finish signing in.');
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserEmail('');
  };

  const statusColor = useMemo(() => {
    if (authStatus.state === 'error') return '#dc2626';
    if (authStatus.state === 'success') return '#16a34a';
    return '#475569';
  }, [authStatus.state]);

  const statusMessage = authStatus.message;

  const isSubmitting = authStatus.state === 'loading';

  const primaryButtonLabel = isSubmitting
    ? 'Working…'
    : mode === 'sign-in'
      ? 'Sign in'
      : 'Create account';

  const setModeAndReset = (nextMode: 'sign-in' | 'sign-up') => {
    setMode(nextMode);
    resetAuthStatus();
  };

  const handleSubmit = async () => {
    if (!supabase) {
      Alert.alert('Supabase not configured');
      return;
    }
    const action =
      mode === 'sign-in'
        ? signInWithPassword
        : signUpWithPassword;
    const result = await action({
      email,
      password
    });
    if (!result?.error) {
      setPassword('');
    }
  };

  const handleResetPassword = async () => {
    await sendPasswordReset({ email });
  };

  const handleClearOnboarding = async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    Alert.alert('Cache cleared', 'Onboarding will show again next launch.');
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Text style={styles.title}>Profile & access</Text>
      {!configured ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Supabase credentials are not set for this build. Add them to <Text style={styles.code}>apps/mobile/.env</Text> and restart the dev server to enable sign-in.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{userEmail ? 'Signed in' : 'Sign in to Questit'}</Text>
          {userEmail ? (
            <>
              <Text style={styles.cardCopy}>You are signed in as {userEmail}.</Text>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentHex }]} onPress={handleSignOut}>
                <Text style={styles.primaryButtonLabel}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.authToggle}>
                <TouchableOpacity
                  style={[styles.authToggleButton, mode === 'sign-in' && styles.authToggleButtonActive]}
                  onPress={() => setModeAndReset('sign-in')}
                >
                  <Text style={[styles.authToggleLabel, mode === 'sign-in' && styles.authToggleLabelActive]}>
                    Sign in
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authToggleButton, mode === 'sign-up' && styles.authToggleButtonActive]}
                  onPress={() => setModeAndReset('sign-up')}
                >
                  <Text style={[styles.authToggleLabel, mode === 'sign-up' && styles.authToggleLabelActive]}>
                    Create account
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
              <View style={styles.passwordRow}>
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: accentHex }]}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Text style={[styles.secondaryButtonLabel, { color: accentHex }]}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {statusMessage ? (
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusMessage}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accentHex }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonLabel}>
                  {primaryButtonLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={!email || isSubmitting}
              >
                <Text style={[styles.resetButtonLabel, !email ? styles.resetButtonDisabled : { color: accentHex }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Theme</Text>
        <Text style={styles.cardCopy}>Pick an accent and color mode. Matches the web workbench.</Text>
        <View style={styles.chipRow}>
          {ACCENT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.chip,
                accent === option && [styles.chipActive, { borderColor: accentHex }]
              ]}
              onPress={() => setAccent(option)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  accent === option ? { color: accentHex } : null
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chipRow}>
          {MODE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.chip,
                mode === option.value && [styles.chipActive, { borderColor: accentHex }]
              ]}
              onPress={() => setMode(option.value)}
            >
              <Text
                style={[
                  styles.chipLabel,
                  mode === option.value ? { color: accentHex } : null
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {APP_ENV !== 'production' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Debug tools</Text>
          <Text style={styles.cardCopy}>For development builds only.</Text>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: accentHex }]}
            onPress={handleClearOnboarding}
          >
            <Text style={[styles.secondaryButtonLabel, { color: accentHex }]}>Clear onboarding cache</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    padding: 20,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  notice: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  noticeText: {
    color: '#b91c1c'
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#fff',
    paddingHorizontal: 4
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardCopy: {
    color: '#475569'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a'
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center'
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  chipActive: {
    backgroundColor: '#ecfeff'
  },
  chipLabel: {
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize'
  },
  authToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  authToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    alignItems: 'center'
  },
  authToggleButtonActive: {
    backgroundColor: '#ecfeff',
    borderColor: '#bae6fd'
  },
  authToggleLabel: {
    fontWeight: '600',
    color: '#475569'
  },
  authToggleLabelActive: {
    color: '#0f172a'
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  passwordInput: {
    flex: 1
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center'
  },
  secondaryButtonLabel: {
    fontWeight: '600'
  },
  resetButton: {
    alignSelf: 'flex-start',
    marginTop: 4
  },
  resetButtonLabel: {
    fontWeight: '600'
  },
  resetButtonDisabled: {
    color: '#94a3b8'
  },
  statusLabel: {
    fontSize: 13
  }
});
