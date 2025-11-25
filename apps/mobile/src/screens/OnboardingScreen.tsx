import { useRef, useState, type ReactElement } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PillButton, SectionTitle, Surface, Chip } from '@questit/ui/native';
import { questitTheme } from '@questit/ui';
import { useQuestitTheme } from '../lib/theme';

interface OnboardingScreenProps {
  onContinue: () => void;
  onBrowseTemplates: () => void;
}

const QUICK_POINTS = [
  'Describe the tool once, iterate as many times as you need.',
  'Save and publish directly from Questit.',
  'Templates, models, and memory settings stay in sync with the web.'
];

const USE_CASES = ['Product ops', 'Support macros', 'Launch checklists', 'Personal dashboards'];

type SlideId = 'create' | 'why' | 'popular';

const SCREEN_TITLES: Record<SlideId, string> = {
  create: 'Onboarding Screen 1 – Create & Iterate',
  why: 'Onboarding Screen 2 – Why Builders Love Questit',
  popular: 'Onboarding Screen 3 – Popular Starting Points'
};

interface Slide {
  id: SlideId;
  render: () => ReactElement;
}

export function OnboardingScreen({ onContinue, onBrowseTemplates }: OnboardingScreenProps) {
  const { resolvedMode } = useQuestitTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const slides: Slide[] = [
    {
      id: 'create',
      render: () => (
        <LinearGradient
          colors={resolvedMode === 'dark' ? ['#0b1120', '#020617'] : ['#cffafe', '#e0f2fe']}
          style={[styles.hero, { width: width - questitTheme.spacing.lg * 2 }]}
        >
          <View style={styles.logoRow}>
            <Image source={require('../../assets/brand-logo.png')} style={styles.heroLogo} />
          </View>
          <Text style={styles.heroTitle}>Create and iterate micro-apps in minutes</Text>
          <Text style={styles.heroSubtitle}>
            The Questit workbench is now on your phone. Pick a template or craft something bespoke,
            preview instantly, then share it across the team.
          </Text>
          <View style={styles.heroList}>
            <Text style={styles.heroListItem}>• Guided prompts mirror the desktop experience.</Text>
            <Text style={styles.heroListItem}>• Preview and iterate on-device with one tap.</Text>
            <Text style={styles.heroListItem}>• Continue on web without losing state.</Text>
          </View>
          <View style={styles.heroButtons}>
            <PillButton label="Start building" onPress={onContinue} />
            <PillButton variant="ghost" label="Browse templates" onPress={onBrowseTemplates} />
          </View>
        </LinearGradient>
      )
    },
    {
      id: 'why',
      render: () => (
        <Surface elevated style={[styles.surface, { width: width - questitTheme.spacing.lg * 2 }]}>
          <SectionTitle>Why builders love Questit</SectionTitle>
          {QUICK_POINTS.map((point) => (
            <View key={point} style={styles.pointRow}>
              <View style={styles.pointBullet} />
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </Surface>
      )
    },
    {
      id: 'popular',
      render: () => (
        <Surface elevated style={[styles.surface, { width: width - questitTheme.spacing.lg * 2 }]}>
          <SectionTitle>Popular starting points</SectionTitle>
          <View style={styles.chipRow}>
            {USE_CASES.map((useCase) => (
              <Chip key={useCase} label={useCase} />
            ))}
          </View>
          <PillButton label="Let's build" onPress={onContinue} style={{ marginTop: questitTheme.spacing.md }} />
        </Surface>
      )
    }
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (nextIndex !== index) {
      setIndex(nextIndex);
    }
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onContinue();
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      listRef.current?.scrollToIndex({ index: index - 1, animated: true });
    }
  };

  return (
    <View style={styles.root}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>{item.render()}</View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.pagination}>
        {slides.map((slide, idx) => (
          <View
            key={slide.id}
            style={[styles.dot, idx === index ? styles.dotActive : null]}
          />
        ))}
      </View>
      <View style={styles.navRow}>
        <PillButton
          label="Back"
          variant="ghost"
          onPress={handlePrev}
          disabled={index === 0}
          style={styles.navButton}
        />
        <PillButton
          label={index === slides.length - 1 ? 'Get started' : 'Next'}
          onPress={handleNext}
          style={styles.navButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: questitTheme.colors.background,
    paddingBottom: questitTheme.spacing.lg
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: questitTheme.spacing.lg
  },
  hero: {
    borderRadius: questitTheme.radii.xl,
    padding: questitTheme.spacing.lg,
    gap: questitTheme.spacing.md
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: questitTheme.spacing.sm
  },
  heroLogo: {
    width: 140,
    height: 46,
    resizeMode: 'contain'
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0b1120'
  },
  heroSubtitle: {
    color: '#1f2937',
    fontSize: 15
  },
  heroList: {
    gap: 6
  },
  heroListItem: {
    color: '#0f172a',
    fontSize: 13,
    opacity: 0.85
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: questitTheme.spacing.sm
  },
  surface: {
    gap: questitTheme.spacing.sm,
    marginTop: questitTheme.spacing.md
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: questitTheme.spacing.sm
  },
  pointBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: questitTheme.colors.primary
  },
  pointText: {
    flex: 1,
    color: questitTheme.colors.muted,
    fontSize: 15
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: questitTheme.spacing.sm
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: questitTheme.spacing.md
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: questitTheme.colors.border
  },
  dotActive: {
    backgroundColor: questitTheme.colors.primary
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: questitTheme.spacing.lg,
    marginTop: questitTheme.spacing.md
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4
  }
});
