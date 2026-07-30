import { Tabs } from 'expo-router';

const INDIGO = '#4F46E5';
const INK_SOFT = '#71717A';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: INDIGO,
        tabBarInactiveTintColor: INK_SOFT,
      }}
    >
      <Tabs.Screen
        name="provas-trabalhos"
        options={{ title: 'Provas e Trabalhos' }}
      />
      <Tabs.Screen name="timeline" options={{ title: 'Timeline' }} />
    </Tabs>
  );
}
