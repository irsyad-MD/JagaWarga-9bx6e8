import {useCallback} from 'react';
import {useRouter} from 'expo-router';
import type {FeatureLink} from '@/constants/featureCatalog';
export function useFeatureNavigation(){const router=useRouter();return useCallback((item:FeatureLink)=>{if(item.key)router.push({pathname:'/feature/[key]',params:{key:item.key}});else if(item.route==='reports')router.push({pathname:'/(tabs)/reports',params:item.params});else if(item.route==='new')router.push('/report/new');else if(item.route==='home')router.push('/(tabs)');else if(item.route==='profile')router.push('/(tabs)/profile');else if(item.route==='help')router.push('/help');else if(item.route==='sos')router.push('/sos');},[router]);}
