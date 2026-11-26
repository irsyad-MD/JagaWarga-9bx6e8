import { useCallback, useState } from 'react';
import { Coordinates, openCoordinates } from '@/services/locationService';
export function useLocationActions() {
  const [locationError, setLocationError] = useState('');
  const openLocation = useCallback(async (coordinates: Coordinates) => { setLocationError(''); try { await openCoordinates(coordinates); } catch (cause) { setLocationError((cause as Error).message || 'Lokasi tidak dapat dibuka.'); } }, []);
  return { locationError, openLocation };
}
