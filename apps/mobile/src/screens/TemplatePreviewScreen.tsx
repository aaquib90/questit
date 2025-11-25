import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import {
  TEMPLATE_COLLECTIONS,
  getTemplateById
} from '@questit/toolkit/templates';
import type { ToolkitTemplate } from '@questit/toolkit/templates';
import { useTemplateCollections } from '../hooks/useTemplateCollections';
import { useQuestitTheme } from '../lib/theme';
import { buildTemplatePreviewHtml } from '../lib/templatePreview';

export function TemplatePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { accentHex, palette, resolvedMode } = useQuestitTheme();
  const { data } = useTemplateCollections();
  const templateId = (route.params as { templateId: string })?.templateId;
  const template = useMemo<ToolkitTemplate | null>(
    () => getTemplateById(templateId, data?.collections ?? TEMPLATE_COLLECTIONS),
    [templateId, data]
  );

  const html = useMemo(() => {
    if (!template) return '';
    return buildTemplatePreviewHtml(template, {
      accentHex,
      mode: resolvedMode
    });
  }, [template, accentHex, resolvedMode]);

  if (!template || !html) {
    return (
      <SafeAreaView style={[styles.fallback, { backgroundColor: palette.background }]}>
        <Text style={styles.fallbackLabel}>Loading template preview…</Text>
        <ActivityIndicator color={accentHex} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: palette.background }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.flex}
        setSupportMultipleWindows={false}
        onHttpError={(event) => {
          console.warn('Preview HTTP error', event.nativeEvent.statusCode);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  fallbackLabel: {
    color: '#475569'
  }
});
