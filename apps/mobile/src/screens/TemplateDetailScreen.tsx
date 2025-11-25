import { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  TEMPLATE_COLLECTIONS,
  getTemplateById
} from '@questit/toolkit/templates';
import type { ToolkitTemplate } from '@questit/toolkit/templates';
import { useTemplateCollections } from '../hooks/useTemplateCollections';
import { useQuestitTheme } from '../lib/theme';

export function TemplateDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { accentHex } = useQuestitTheme();
  const { data } = useTemplateCollections();

  const templateId = (route.params as { templateId: string })?.templateId;
  const template = useMemo<ToolkitTemplate | null>(
    () => getTemplateById(templateId, data?.collections ?? TEMPLATE_COLLECTIONS),
    [templateId, data]
  );

  if (!template) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>Template unavailable</Text>
        <Text style={styles.missingCopy}>
          We couldn’t find that template. Please return to the library and choose another.
        </Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentHex }]} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonLabel}>Back to library</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePreview = () => {
    navigation.navigate('TemplatePreview' as never, { templateId: template.id } as never);
  };

  const handleShare = () => {
    Alert.alert('Coming soon', 'Sharing from mobile will be available after the next release.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>{template.collectionTitle || 'Questit Template'}</Text>
      <Text style={styles.title}>{template.title}</Text>
      {template.descriptor ? <Text style={styles.descriptor}>{template.descriptor}</Text> : null}
      {template.summary ? <Text style={styles.summary}>{template.summary}</Text> : null}

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentHex }]} onPress={handlePreview}>
          <Text style={styles.primaryButtonLabel}>Preview tool</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Text style={[styles.secondaryButtonLabel, { color: accentHex }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audience</Text>
        <View style={styles.chipRow}>
          {(template.audience || []).map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipLabel}>{item}</Text>
            </View>
          ))}
          {(template.tags || []).map((item) => (
            <View key={item} style={styles.tagChip}>
              <Text style={styles.tagChipLabel}>#{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {template.quickTweaks?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick tweaks</Text>
          {template.quickTweaks.map((tweak) => (
            <Text key={tweak} style={styles.bullet}>
              • {tweak}
            </Text>
          ))}
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
    paddingBottom: 40,
    gap: 16
  },
  kicker: {
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#94a3b8',
    fontSize: 12
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a'
  },
  descriptor: {
    fontSize: 16,
    color: '#0ea5e9',
    fontWeight: '600'
  },
  summary: {
    fontSize: 16,
    color: '#334155'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5f5'
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#0ea5e922',
    borderRadius: 999
  },
  chipLabel: {
    color: '#0ea5e9',
    fontWeight: '600'
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderColor: '#e2e8f0',
    borderWidth: 1
  },
  tagChipLabel: {
    color: '#475569'
  },
  bullet: {
    color: '#475569'
  },
  missing: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff'
  },
  missingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a'
  },
  missingCopy: {
    color: '#475569',
    textAlign: 'center'
  }
});
