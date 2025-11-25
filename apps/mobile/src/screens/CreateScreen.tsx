import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TEMPLATE_COLLECTIONS, flattenTemplates } from '@questit/toolkit/templates';
import type { ToolkitTemplate } from '@questit/toolkit/templates';
import type { GeneratedToolBundle } from '@questit/toolkit/generateTool';
import { TemplateCard } from '../components/TemplateCard';
import { useQuestitTheme } from '../lib/theme';
import { useTemplateCollections } from '../hooks/useTemplateCollections';
import { useGenerateTool } from '../hooks/useGenerateTool';
import { buildTemplatePreviewHtml } from '../lib/templatePreview';

const QUICK_PROMPTS = [
  {
    label: 'Design a gratitude journal with mood tracking',
    emoji: '🧠',
    accent: '#c7d2fe'
  },
  {
    label: 'Create a meal planner that auto-builds grocery lists',
    emoji: '🍲',
    accent: '#fee2e2'
  },
  {
    label: 'Plan a product launch checklist for a marketing team',
    emoji: '🚀',
    accent: '#d9f99d'
  },
  {
    label: 'Build a finance tracker with monthly charts',
    emoji: '📊',
    accent: '#fef3c7'
  }
];

type Status = 'idle' | 'thinking' | 'ready';

export function CreateScreen() {
  const { palette, accentHex, resolvedMode } = useQuestitTheme();
  const { data, isLoading } = useTemplateCollections();
  const generateToolMutation = useGenerateTool();
  const collections = data?.collections ?? TEMPLATE_COLLECTIONS;
  const curated = useMemo<ToolkitTemplate[]>(
    () => flattenTemplates(collections).slice(0, 3),
    [collections]
  );

  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [insight, setInsight] = useState<string | null>(null);
  const [bundle, setBundle] = useState<GeneratedToolBundle | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      Alert.alert('Add a prompt', 'Tell Questit what you want to build first.');
      return;
    }
    setStatus('thinking');
    setInsight(null);
    try {
      const result = await generateToolMutation.mutateAsync({
        prompt: trimmed,
        previousCode: bundle
      });
      setBundle(result);
      setInsight(
        'Blueprint ready. We sketched the layout, added stateful components, and wrapped it in the Questit shell. Open the full builder to iterate or publish.'
      );
      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to generate a preview.';
      Alert.alert('Generation failed', message);
      setStatus('idle');
    }
  };

  const handleOpenWorkbench = () => {
    Linking.openURL('https://questit.cc/build').catch((error) => {
      console.error('Failed to open workbench', error);
      Alert.alert('Unable to open Questit', 'Visit questit.cc/build to continue.');
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.content}
    >
      <Image source={require('../../assets/brand-logo.png')} style={styles.logo} />
      <View style={styles.hero}>
        <Text style={styles.badge}>Create</Text>
        <Text style={styles.heroTitle}>Describe the tool you need</Text>
        <Text style={styles.heroSubtitle}>
          Questit will produce HTML/CSS/JS, wire up memory, and let you publish to the edge.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Prompt</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={6}
          placeholder="e.g. Help me build a travel budget dashboard with quick currency conversion."
          placeholderTextColor="#94a3b8"
          value={prompt}
          onChangeText={setPrompt}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: accentHex }]}
            onPress={handleGenerate}
            disabled={generateToolMutation.isPending}
          >
            <Text style={styles.primaryButtonLabel}>
              {generateToolMutation.isPending ? 'Drafting…' : 'Generate preview'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenWorkbench}>
            <Ionicons name="open-outline" size={18} color={accentHex} />
            <Text style={[styles.secondaryButtonLabel, { color: accentHex }]}>Open full builder</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickList}>
        {QUICK_PROMPTS.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.label}
            style={[styles.quickPrompt, { backgroundColor: suggestion.accent }]}
            onPress={() => setPrompt(suggestion.label)}
          >
            <Text style={styles.quickPromptEmoji}>{suggestion.emoji}</Text>
            <Text style={styles.quickPromptLabel}>{suggestion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GeneratedPreview
        status={status}
        accentHex={accentHex}
        insight={insight}
        bundle={bundle}
        prompt={prompt}
        resolvedMode={resolvedMode}
        onContinue={handleOpenWorkbench}
      />

    </ScrollView>
  );
}

interface GeneratedPreviewProps {
  status: Status;
  accentHex: string;
  insight: string | null;
  bundle: GeneratedToolBundle | null;
  prompt: string;
  resolvedMode: 'light' | 'dark' | 'no-preference';
  onContinue: () => void;
}

function GeneratedPreview({
  status,
  accentHex,
  insight,
  bundle,
  prompt,
  resolvedMode,
  onContinue
}: GeneratedPreviewProps) {
  const previewHtml = useMemo(() => {
    if (!bundle) return null;
    const pseudoTemplate = {
      id: 'generated-preview',
      title: 'Generated tool',
      summary: prompt,
      preview: {
        html: bundle.html,
        css: bundle.css,
        js: bundle.js
      },
      html: bundle.html,
      css: bundle.css,
      js: bundle.js
    };
    return buildTemplatePreviewHtml(pseudoTemplate as ToolkitTemplate, {
      accentHex,
      mode: resolvedMode === 'dark' ? 'dark' : 'light'
    });
  }, [bundle, prompt, accentHex, resolvedMode]);

  return (
    <View style={styles.previewCard}>
      <Text style={styles.sectionTitle}>Preview</Text>
      {status === 'idle' && (
        <Text style={styles.previewCopy}>
          Start with a quick prompt. We’ll show a draft summary and suggest the next step.
        </Text>
      )}
      {status === 'thinking' && (
        <View style={styles.previewState}>
          <ActivityIndicator color={accentHex} />
          <Text style={styles.previewCopy}>Assembling layout, styles, and runtime hints…</Text>
        </View>
      )}
      {status === 'ready' && insight ? (
        <View style={styles.previewResult}>
          <Text style={styles.previewHeadline}>Concept drafted</Text>
          <Text style={styles.previewCopy}>{insight}</Text>
        </View>
      ) : null}
      {previewHtml ? (
        <View style={styles.webviewFrame}>
          <WebView
            source={{ html: previewHtml }}
            style={styles.webview}
            originWhitelist={['*']}
            setSupportMultipleWindows={false}
            javaScriptEnabled
            automaticallyAdjustContentInsets
          />
        </View>
      ) : null}
      {status === 'ready' && (
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentHex }]} onPress={onContinue}>
          <Text style={styles.primaryButtonLabel}>Continue in Questit</Text>
        </TouchableOpacity>
      )}
    </View>
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
  logo: {
    width: 110,
    height: 34,
    resizeMode: 'contain',
    marginTop: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
    marginLeft: 4
  },
  hero: {
    gap: 8
  },
  badge: {
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: 12,
    color: '#94a3b8'
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a'
  },
  heroSubtitle: {
    color: '#475569'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 20,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 150,
    textAlignVertical: 'top'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600'
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5f5'
  },
  secondaryButtonLabel: {
    fontWeight: '600'
  },
  quickList: {
    flexDirection: 'column',
    gap: 10
  },
  quickPrompt: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickPromptEmoji: {
    fontSize: 20
  },
  quickPromptLabel: {
    color: '#0f172a',
    flex: 1,
    fontWeight: '600'
  },
  previewCard: {
    backgroundColor: '#0b1120',
    borderRadius: 28,
    padding: 24,
    gap: 12
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a'
  },
  previewCopy: {
    color: '#cbd5f5'
  },
  previewState: {
    gap: 12
  },
  previewResult: {
    gap: 12
  },
  previewHeadline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0f2fe'
  },
  webviewFrame: {
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginTop: 12
  },
  webview: {
    flex: 1
  },
  loadingState: {
    padding: 20,
    alignItems: 'center',
    gap: 12
  },
  loadingLabel: {
    color: '#475569'
  }
});
