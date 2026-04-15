// Powered by OnSpace.AI
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '@/contexts/AppContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="surah/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="azkar/[category]" options={{ headerShown: false }} />
          <Stack.Screen name="hadith/[collection]" options={{ headerShown: false }} />
          <Stack.Screen name="qibla" options={{ headerShown: false }} />
          <Stack.Screen name="radio" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
