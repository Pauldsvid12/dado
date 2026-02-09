import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Constants from 'expo-constants';

import { AuthProvider, useAuth } from '@/lib/modules/auth/AuthProvider';
import { usePushNotifications } from '@/lib/core/notifications/usePushNotifications';

function AppStack() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Solo activar push en Development Build (no en Expo Go)
  const isDevBuild = Constants.appOwnership !== 'expo'; // 'expo' = Expo Go
  const userId = session?.user.id;

  if (isDevBuild) {
    usePushNotifications(userId);
  }

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) router.replace('/(auth)/login');
    else if (session && inAuthGroup) router.replace('/');
  }, [session, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppStack />
    </AuthProvider>
  );
}