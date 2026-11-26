import { useContext } from 'react';
import { EmergencyContext } from '@/contexts/EmergencyContext';
export function useEmergency() { const context = useContext(EmergencyContext); if (!context) throw new Error('useEmergency memerlukan EmergencyProvider'); return context; }
