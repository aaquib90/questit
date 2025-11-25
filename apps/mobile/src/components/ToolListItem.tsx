import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SavedTool } from '../hooks/useSavedTools';

interface Props {
  tool: SavedTool;
}

const SHARE_BASE = 'https://questit.cc/tools';

export function ToolListItem({ tool }: Props) {
  const handleOpen = () => {
    const slug = tool.share_slug;
    if (!slug) return;
    Linking.openURL(`${SHARE_BASE}/${slug}`).catch((error) => {
      console.error('Failed to open share slug', error);
    });
  };

  const createdAt = tool.created_at ? new Date(tool.created_at).toLocaleDateString() : 'Recently saved';

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.title}>{tool.title || 'Untitled tool'}</Text>
        {tool.summary ? <Text style={styles.summary}>{tool.summary}</Text> : null}
        <Text style={styles.meta}>Saved {createdAt}</Text>
      </View>
      {tool.share_slug ? (
        <TouchableOpacity style={styles.linkButton} onPress={handleOpen}>
          <Ionicons name="arrow-forward-outline" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  body: {
    flex: 1,
    gap: 6
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  summary: {
    color: '#475569'
  },
  meta: {
    color: '#94a3b8',
    fontSize: 12
  },
  linkButton: {
    height: 40,
    width: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bae6fd',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
