import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSavedTools } from '../hooks/useSavedTools';
import { ToolListItem } from '../components/ToolListItem';
import { EmptyState } from '../components/EmptyState';
import { useQuestitTheme } from '../lib/theme';

export function ToolsScreen() {
  const navigation = useNavigation<any>();
  const { palette, accentHex } = useQuestitTheme();
  const { data, isLoading, refetch } = useSavedTools();

  const tools = data?.tools ?? [];
  const requiresAuth = data?.requiresAuth;
  const errorMessage = data?.error;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Image source={require('../../assets/brand-logo.png')} style={styles.logo} />
        <Text style={styles.title}>My tools</Text>
      </View>
      <Text style={styles.subtitle}>
        Every tool you save in Questit appears here. Publish to share a branded URL instantly.
      </Text>

      {!tools.length ? (
        <EmptyState
          title={
            requiresAuth
              ? 'Sign in to sync your creations'
              : errorMessage || 'No saved tools yet'
          }
          description={
            requiresAuth
              ? 'Head to the Profile tab to sign in with your email and password.'
              : 'Generate a tool from the Create tab and tap “Save to Questit”.'
          }
          action={
            requiresAuth ? (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accentHex }]}
                onPress={() => navigation.navigate('Profile' as never)}
              >
                <Text style={styles.primaryButtonLabel}>Open profile</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <View style={styles.list}>
          {tools.map((tool) => (
            <ToolListItem key={tool.id} tool={tool} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16
  },
  header: {
    gap: 8
  },
  logo: {
    width: 110,
    height: 34,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    color: '#475569'
  },
  list: {
    gap: 12
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600'
  }
});
