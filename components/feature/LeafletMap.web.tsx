import React, { memo, useEffect } from 'react';
import { CircleMarker, Circle, Polyline, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import type { IncidentMapProps, MapPoint } from './IncidentMap.web';
import { theme } from '@/constants/theme';
function Bounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => { if (points.length > 1) map.fitBounds(points.map(point => [point.latitude, point.longitude] as [number, number]), { padding: [24, 24], maxZoom: 17 }); else if (points[0]) map.setView([points[0].latitude, points[0].longitude], 16); const timer = setTimeout(() => map.invalidateSize(), 200); return () => clearTimeout(timer); }, [points, map]);
  return null;
}
function PickPoint({ onPick }: { onPick?: IncidentMapProps['onPick'] }) { useMapEvents({ click: event => onPick?.({ latitude: event.latlng.lat, longitude: event.latlng.lng }) }); return null; }
export const LeafletMap = memo(function LeafletMap({ points, onSelect, paths, heatmap, onPick }: IncidentMapProps) {
  if (points.length === 0) return null;
  return <MapContainer center={[points[0].latitude, points[0].longitude]} zoom={16} style={{ width: '100%', height: '100%', borderRadius: theme.radius.sm, zIndex: 0 }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' /><Bounds points={points} /><PickPoint onPick={onPick} />{paths?.map((path, index) => <Polyline key={`path-${index}`} positions={path.map(point => [point.latitude, point.longitude] as [number, number])} pathOptions={{ color: theme.colors.warning, weight: 5 }} />)}{heatmap ? points.map(point => <Circle key={`heat-${point.id}`} center={[point.latitude, point.longitude]} radius={120} pathOptions={{ stroke: false, fillColor: theme.colors.danger, fillOpacity: 0.15 }} />) : null}{points.map(point => <CircleMarker key={point.id} center={[point.latitude, point.longitude]} radius={9} pathOptions={{ color: theme.colors.white, weight: 2, fillColor: point.status === 'resolved' ? theme.colors.primary : theme.colors.danger, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(point.id) }}><Tooltip>{point.title}</Tooltip></CircleMarker>)}</MapContainer>;
});
