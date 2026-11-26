import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { theme } from '@/constants/theme';
export interface MapPoint { id: string; latitude: number; longitude: number; title: string; status: string }
export interface IncidentMapProps { points: MapPoint[]; onSelect: (id: string) => void; paths?: { latitude: number; longitude: number }[][]; heatmap?: boolean; onPick?: (point: { latitude: number; longitude: number }) => void }
export const IncidentMap = memo(function IncidentMap({ points, onSelect, paths, heatmap, onPick }: IncidentMapProps) {
  const map = useRef<MapView>(null);
  useEffect(() => { if (points.length > 1) map.current?.fitToCoordinates(points, { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: false }); }, [points]);
  if (points.length === 0) return null;
  return <MapView ref={map} onPress={event => onPick?.(event.nativeEvent.coordinate)} style={styles.map} initialRegion={{ latitude: points[0].latitude, longitude: points[0].longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }} onMapReady={() => { if (points.length > 1) map.current?.fitToCoordinates(points, { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: false }); }}>{heatmap ? points.map(point => <Circle key={`heat-${point.id}`} center={point} radius={120} strokeWidth={0} fillColor={theme.colors.dangerSoft} />) : null}{paths?.map((path, index) => <Polyline key={`path-${index}`} coordinates={path} strokeColor={theme.colors.warning} strokeWidth={5} />)}{points.map(point => <Marker key={point.id} coordinate={point} title={point.title} pinColor={point.status === 'resolved' ? theme.colors.primary : theme.colors.danger} onPress={() => onSelect(point.id)} />)}</MapView>;
});
const styles = StyleSheet.create({ map: { flex: 1, borderRadius: theme.radius.sm } });
