import React, { ComponentType, memo, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { theme } from '@/constants/theme';
export interface MapPoint { id: string; latitude: number; longitude: number; title: string; status: string }
export interface IncidentMapProps { points: MapPoint[]; onSelect: (id: string) => void; paths?: { latitude: number; longitude: number }[][]; heatmap?: boolean; onPick?: (point: { latitude: number; longitude: number }) => void }
export const IncidentMap = memo(function IncidentMap(props: IncidentMapProps) {
  const [MapComponent, setMapComponent] = useState<ComponentType<IncidentMapProps> | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    if (!document.getElementById('jaga-warga-leaflet')) { const link = document.createElement('link'); link.id = 'jaga-warga-leaflet'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link); }
    void import('./LeafletMap.web').then(module => { if (mounted) setMapComponent(() => module.LeafletMap); }).catch(() => { if (mounted) setError('Peta tidak dapat dimuat. Pilih laporan pada daftar di bawah untuk membuka detail lokasinya.'); });
    return () => { mounted = false; };
  }, []);
  if (error) return <View style={styles.loading}><Text style={styles.error}>{error}</Text></View>;
  if (!MapComponent) return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} /></View>;
  return <MapComponent {...props} />;
});
const styles = StyleSheet.create({ loading: { flex: 1, backgroundColor: theme.colors.input, alignItems: 'center', justifyContent: 'center', padding: theme.space.sm }, error: { fontSize: theme.type.body, lineHeight: 26, color: theme.colors.danger } });
