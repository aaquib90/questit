import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  TEMPLATE_COLLECTIONS,
  flattenTemplates,
  templateCategorySlug
} from '@questit/toolkit/templates';
import { TemplateCard } from '../components/TemplateCard';
import { EmptyState } from '../components/EmptyState';
import { useTemplateCollections } from '../hooks/useTemplateCollections';
import { useQuestitTheme } from '../lib/theme';
import type { ToolkitTemplate } from '@questit/toolkit/templates';

const CATEGORY_ALL = 'all';

export function TemplatesScreen() {
  const navigation = useNavigation<any>();
  const { accentHex } = useQuestitTheme();
  const { data, isLoading, refetch } = useTemplateCollections();
  const collections = data?.collections ?? TEMPLATE_COLLECTIONS;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(CATEGORY_ALL);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    collections.forEach((collection) => {
      unique.set(templateCategorySlug(collection.id), collection.title);
    });
    return [{ id: CATEGORY_ALL, title: 'All' }, ...Array.from(unique.entries()).map(([id, title]) => ({ id, title }))];
  }, [collections]);

  const filtered = useMemo<ToolkitTemplate[]>(() => {
    const entries = flattenTemplates(collections);
    return entries.filter((template) => {
      const matchesCategory =
        category === CATEGORY_ALL ||
        template.collectionId === category ||
        templateCategorySlug(template.collectionId || '') === category;
      if (!matchesCategory) return false;
      if (!query) return true;
      const haystack = `${template.title} ${template.summary}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [collections, category, query]);

  const handleOpenTemplate = (template: ToolkitTemplate) => {
    navigation.navigate('TemplateDetail' as never, { templateId: template.id } as never);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <TemplateCard template={item} onPress={handleOpenTemplate} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Image source={require('../../assets/brand-logo.png')} style={styles.logo} />
            <Text style={styles.title}>Template Library</Text>
            <TextInput
              placeholder="Search templates"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
            <ScrollChips
              categories={categories}
              activeId={category}
              onChange={setCategory}
              accent={accentHex}
            />
          </View>
        }
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Loading templates…' : 'No templates match your filters.'}
            action={isLoading ? <ActivityIndicator color={accentHex} /> : undefined}
          />
        }
      />
    </View>
  );
}

function ScrollChips({
  categories,
  activeId,
  onChange,
  accent
}: {
  categories: { id: string; title: string }[];
  activeId: string;
  onChange: (value: string) => void;
  accent: string;
}) {
  return (
    <View style={styles.chipRow}>
      {categories.map((cat) => {
        const active = cat.id === activeId;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onChange(cat.id)}
            style={[
              styles.chip,
              active && { backgroundColor: `${accent}22`, borderColor: accent }
            ]}
          >
            <Text style={[styles.chipLabel, active && { color: accent }]}>{cat.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  listContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16,
    gap: 8
  },
  logo: {
    width: 110,
    height: 34,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 12
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  }
});
