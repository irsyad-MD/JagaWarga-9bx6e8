import {useCallback,useEffect,useRef,useState} from 'react';
import {Audio} from 'expo-av';
import {useRouter} from 'expo-router';
import {useWarga} from './useWarga';
import {useCommunity} from './useCommunity';
import {getSupabaseClient} from '@/services/wargaService';
import {playSiren} from '@/services/audioService';
import {localNotification} from '@/services/notificationService';
interface AlertItem {title:string;body:string;kind:string;entity_id:string;}
export function useNotificationAlerts(){const {session,isAdmin,region}=useWarga();const state=useCommunity();const router=useRouter();const [alert,setAlert]=useState<AlertItem|null>(null);const sound=useRef<Audio.Sound|null>(null);const seen=useRef(new Set<string>());const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const stop=useCallback(()=>{void sound.current?.unloadAsync().catch(()=>{});sound.current=null;if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{setAlert(null);seen.current.clear();if(!session||!region)return;let alive=true;const db=getSupabaseClient();const channel=db.channel(`alerts-${session.user.id}-${region.id}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:`user_id=eq.${session.user.id}`},event=>{const row=event.new as any;if(seen.current.has(row.id))return;seen.current.add(row.id);setAlert(row);void localNotification(row.title,row.body,{kind:row.kind,id:row.entity_id}).catch(()=>{});void state.load('notifications');if(isAdmin&&row.kind==='sos_created'&&!state.batterySaver){stop();void playSiren().then(value=>{if(!alive){void value.unloadAsync();return;}sound.current=value;timer.current=setTimeout(stop,5000);}).catch(()=>{});}}).subscribe();return()=>{alive=false;stop();void db.removeChannel(channel);};},[session?.user.id,region?.id,isAdmin,state.batterySaver,state.load,stop]);
 const dismiss=useCallback(()=>{stop();setAlert(null);},[stop]);const open=useCallback(()=>{if(!alert)return;stop();if(alert.kind==='report_created')router.push({pathname:'/report/[id]',params:{id:alert.entity_id}});else if(alert.kind==='sos_created')router.push({pathname:'/(tabs)/reports',params:{view:'sos'}});else router.push({pathname:'/feature/[key]',params:{key:alert.kind==='patrol_assignment'?'reminders':'warnings'}});setAlert(null);},[alert,router,stop]);return{alert,dismiss,open};}
