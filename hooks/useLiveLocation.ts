import {useContext} from 'react';
import {LiveLocationContext} from '@/contexts/LiveLocationContext';
export function useLiveLocation(){const value=useContext(LiveLocationContext);if(!value)throw new Error('useLiveLocation must be used within LiveLocationProvider');return value;}
