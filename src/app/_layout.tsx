import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../belysh/api/auth';
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Mulish_400Regular,
  Mulish_500Medium,
  Mulish_600SemiBold,
  Mulish_700Bold,
  Mulish_800ExtraBold,
} from '@expo-google-fonts/mulish';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'Cormorant-Medium': CormorantGaramond_500Medium,
    'Cormorant-SemiBold': CormorantGaramond_600SemiBold,
    'Cormorant-Bold': CormorantGaramond_700Bold,
    'Cormorant-MediumItalic': CormorantGaramond_500Medium_Italic,
    'Cormorant-SemiBoldItalic': CormorantGaramond_600SemiBold_Italic,
    'Mulish-Regular': Mulish_400Regular,
    'Mulish-Medium': Mulish_500Medium,
    'Mulish-SemiBold': Mulish_600SemiBold,
    'Mulish-Bold': Mulish_700Bold,
    'Mulish-ExtraBold': Mulish_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F6F3EB' } }} />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
