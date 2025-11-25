import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ToolkitTemplate } from '@questit/toolkit/templates';
import { useQuestitTheme } from '../lib/theme';

interface Props {
  template: ToolkitTemplate;
  onPress?: (template: ToolkitTemplate) => void;
}

function TemplateCardInner({ template, onPress }: Props) {
  const { accentHex, palette } = useQuestitTheme();
  const textPrimary = palette.foreground;
  const textMuted = palette.foreground === '#e2e8f0' ? '#cbd5f5' : '#475569';
  const glyph = template.heroImage || template.title?.charAt(0) || 'Q';
  const audiences = template.audience?.slice(0, 2) || [];
  return (
    <Pressable
      onPress={() => onPress?.(template)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${accentHex}12` }]}>
        <Text style={[styles.iconLabel, { color: accentHex }]}>{glyph}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.collectionLabel, { color: textMuted }]}>
          {template.collectionTitle || 'Questit Template'}
        </Text>
        <Text style={[styles.title, { color: textPrimary }]}>{template.title}</Text>
        {!!template.summary && (
          <Text style={[styles.summary, { color: textMuted }]} numberOfLines={2}>
            {template.summary}
          </Text>
        )}
        <View style={styles.badges}>
          {audiences.map((aud) => (
            <View key={aud} style={[styles.badge, { borderColor: `${accentHex}55` }]}>
              <Text style={[styles.badgeLabel, { color: accentHex }]}>{aud}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16
  },
  icon: {
    height: 52,
    width: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconLabel: {
    fontSize: 20,
    fontWeight: '600'
  },
  body: {
    flex: 1,
    gap: 6
  },
  collectionLabel: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#64748b'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a'
  },
  summary: {
    fontSize: 14,
    color: '#475569'
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600'
  }
});

export const TemplateCard = memo(TemplateCardInner);
