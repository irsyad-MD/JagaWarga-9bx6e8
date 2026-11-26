import {useContext} from 'react';
import {CommunityContext} from '@/contexts/CommunityContext';
export function useCommunity(){const state=useContext(CommunityContext);if(!state)throw new Error('useCommunity must be used within CommunityProvider');return state;}
