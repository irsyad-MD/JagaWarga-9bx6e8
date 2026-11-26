import { useContext } from 'react';
import { WargaContext } from '@/contexts/WargaContext';
export function useWarga() {
  const context = useContext(WargaContext);
  if (!context) throw new Error('useWarga memerlukan WargaProvider');
  return context;
}
