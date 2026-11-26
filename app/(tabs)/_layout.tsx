import React from 'react';
import { Tabs } from 'expo-router';
import { WargaTabBar } from '@/components/layout/WargaTabBar';
import { useMotionPreference } from '@/hooks/useMotionPreference';
export default function TabLayout() {
  const reducedMotion = useMotionPreference();
  return <Tabs tabBar={props => <WargaTabBar {...props} />} screenOptions={{ headerShown: false, animation: reducedMotion ? 'none' : 'fade' }}><Tabs.Screen name="index" options={{ title: 'Beranda' }} /><Tabs.Screen name="reports" options={{ title: 'Peta & Laporan' }} /><Tabs.Screen name="residents" options={{ title: 'Warga' }} /><Tabs.Screen name="profile" options={{ title: 'Profil & Layanan' }} /></Tabs>;
}
