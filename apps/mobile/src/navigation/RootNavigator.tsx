import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuestitTheme } from '../lib/theme';
import { CreateScreen } from '../screens/CreateScreen';
import { ToolsScreen } from '../screens/ToolsScreen';
import { TemplatesScreen } from '../screens/TemplatesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TemplateDetailScreen } from '../screens/TemplateDetailScreen';
import { TemplatePreviewScreen } from '../screens/TemplatePreviewScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ONBOARDING_KEY } from '../constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
type TabName = 'Create' | 'My Tools' | 'Templates' | 'Profile';

function TabsNavigator({ initialTab = 'Create' }: { initialTab?: TabName }) {
  const { resolvedMode, accentHex } = useQuestitTheme();
  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: accentHex,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: resolvedMode === 'dark' ? '#0b1120' : '#fff',
          borderTopColor: resolvedMode === 'dark' ? '#1e293b' : '#e2e8f0',
          height: 64
        },
        tabBarIcon: ({ focused, color, size }) => {
          const map = {
            Create: 'sparkles-outline',
            'My Tools': 'construct-outline',
            Templates: 'grid-outline',
            Profile: 'person-circle-outline'
          } as const;
          const iconName = map[route.name as keyof typeof map] || 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} style={{ opacity: focused ? 1 : 0.6 }} />;
        }
      })}
    >
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="My Tools" component={ToolsScreen} />
      <Tab.Screen name="Templates" component={TemplatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { resolvedMode } = useQuestitTheme();
  const theme = resolvedMode === 'dark' ? DarkTheme : DefaultTheme;
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialTab, setInitialTab] = useState<TabName>('Create');

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        setShowOnboarding(value !== 'true');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOnboardingComplete = async (nextTab: TabName = 'Create') => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setInitialTab(nextTab);
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingScreen
                onContinue={() => handleOnboardingComplete('Create')}
                onBrowseTemplates={() => handleOnboardingComplete('Templates')}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Tabs">
            {(props) => <TabsNavigator {...props} initialTab={initialTab} />}
          </Stack.Screen>
        )}
        <Stack.Screen
          name="TemplateDetail"
          component={TemplateDetailScreen}
          options={{ headerShown: true, title: 'Template' }}
        />
        <Stack.Screen
          name="TemplatePreview"
          component={TemplatePreviewScreen}
          options={{ headerShown: true, title: 'Preview' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
