import React,{useMemo} from 'react';
import {Redirect,useLocalSearchParams,useRouter} from 'expo-router';
import {Text} from 'react-native';
import {useWarga} from '@/hooks/useWarga';
import {getModule,ModuleDefinition} from '@/constants/modules';
import {ResourceScreen} from './ResourceScreen';
import {SpecialScreen} from './SpecialScreen';
import {Screen,layout} from '@/components/layout/Screen';
import {Button} from '@/components/ui/Primitives';
export function FeatureScreen(){const params=useLocalSearchParams<{key:string}>();const warga=useWarga();const router=useRouter();const module=useMemo<ModuleDefinition|undefined>(()=>params.key==='poll-vote'?{key:'poll-vote',title:'Voting Polling',description:'Pilih jawaban dan lihat hasil suara asli.',icon:'bar-chart-2',kind:'poll-vote',group:'Layanan'}:getModule(params.key),[params.key]);if(!warga.session||!warga.region||warga.membership?.status!=='verified')return <Redirect href="/"/>;if(!module)return <Screen><Text style={layout.title}>Menu tidak dikenali</Text><Button title="Buka Beranda" onPress={()=>router.replace('/(tabs)')}/></Screen>;if(module.adminOnly&&!warga.isAdmin)return <Redirect href="/(tabs)"/>;if(module.key==='roles'&&!warga.isSuperAdmin)return <Redirect href="/(tabs)"/>;return module.table?<ResourceScreen module={module}/>:<SpecialScreen module={module}/>;}
