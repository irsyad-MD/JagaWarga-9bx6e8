import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useWarga } from '@/hooks/useWarga';
import { AuthScreen, RegionScreen } from '@/components/feature/AccountScreens';
import { Screen, layout } from '@/components/layout/Screen';
import { theme } from '@/constants/theme';
export default function Entry() {
  const { session, loading, region, membership } = useWarga();
  if (loading) return <Screen><View style={layout.card}><ActivityIndicator accessibilityLabel="Memulihkan sesi akun Jaga Warga" color={theme.colors.primary} /><Text style={layout.section}>Jaga Warga</Text><Text style={layout.body}>Memulihkan sesi akun Anda…</Text></View></Screen>;
  if (!session) return <AuthScreen />;
  if (region && membership?.status === 'verified') return <Redirect href="/(tabs)" />;
  return <RegionScreen />;
}
