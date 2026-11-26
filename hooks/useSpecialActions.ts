import {useCallback,useEffect,useRef,useState} from 'react';
import {Linking,Share} from 'react-native';
import {useRouter} from 'expo-router';
import {Audio} from 'expo-av';
import {useCommunity} from './useCommunity';
import {useWarga} from './useWarga';
import {getCurrentCoordinates,openCoordinates} from '@/services/locationService';
import {callRpc,callEdge,loadPollResults,votePoll,RecordData} from '@/services/communityService';
import {loadWeather,WeatherData} from '@/services/weatherService';
import {monthlyData,exportCsv,exportPdf,MonthlyData} from '@/services/exportService';
import {playSiren} from '@/services/audioService';
import {openPrivateFile} from '@/services/mediaService';
export function useSpecialActions(kind:string){
 const state=useCommunity();const warga=useWarga();const router=useRouter();
 const [weather,setWeather]=useState<WeatherData|null>(null);const [point,setPoint]=useState<{latitude:number;longitude:number}|null>(null);const [month,setMonth]=useState(new Date().toISOString().slice(0,7));const [monthly,setMonthly]=useState<MonthlyData|null>(null);const [siren,setSiren]=useState(false);const sound=useRef<Audio.Sound|null>(null);const [results,setResults]=useState<{option_id:string;label:string;votes:number}[]>([]);const [vote,setVote]=useState('');const [roleEmail,setRoleEmail]=useState('');const [role,setRole]=useState('admin');const [ownAssignment,setOwnAssignment]=useState('');const [targetAssignment,setTargetAssignment]=useState('');const [reviewNote,setReviewNote]=useState('');
 useEffect(()=>()=>{void sound.current?.unloadAsync().catch(()=>{});},[]);
 const call=useCallback(async(phone:string)=>{await state.run(async()=>{const number=phone.replace(/[^+0-9]/g,'');if(number.length<3)throw new Error('Nomor kontak tidak valid.');await Linking.openURL(`tel:${number}`);});},[state.run]);
 const map=useCallback(async(row:RecordData|{latitude:number;longitude:number})=>{await state.run(async()=>{const latitude=Number(row.latitude);const longitude=Number(row.longitude);if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw new Error('Koordinat tidak valid.');await openCoordinates({latitude,longitude});});},[state.run]);
 const openUrl=useCallback(async(url:string)=>{await state.run(async()=>{if(!/^https?:\/\//.test(url))throw new Error('Gunakan tautan HTTP/HTTPS.');await Linking.openURL(url);});},[state.run]);
 const share=useCallback(async(message:string)=>{await state.run(()=>Share.share({message}));},[state.run]);
 const markRead=useCallback(async(id:string)=>{await state.save('notifications',{read_at:new Date().toISOString()},id);},[state.save]);
 const openNotification=useCallback((row:RecordData)=>{if(row.kind==='report_created')router.push({pathname:'/report/[id]',params:{id:row.entity_id}});else if(row.kind==='sos_created')router.push({pathname:'/(tabs)/reports',params:{view:'sos'}});else router.push({pathname:'/feature/[key]',params:{key:row.kind==='patrol_assignment'?'reminders':'warnings'}});},[router]);
 const testWebhook=useCallback(async(id:string)=>{await state.run(async()=>{const result=await callEdge('dispatch-webhooks',{region_id:warga.region!.id,test_id:id});const failed=result.results?.find((row:any)=>!row.ok);if(failed)throw new Error(failed.error??`Endpoint: HTTP ${failed.status}`);await state.load('webhook_deliveries');},'Endpoint menerima uji koneksi.');},[state.run,state.load,warga.region?.id]);
 async function sendWarning(id:string){const result=await state.run(()=>callEdge('send-warning-push',{id}));if(result){const message=result.sent?`${result.sent} push diterima layanan Expo; penerimaan perangkat perlu diuji.`:result.message??'Peringatan tersimpan tanpa token push aktif.';await state.run(async()=>true,message);}}
 async function locate(){const result=await state.run(getCurrentCoordinates);if(result)setPoint(result);}
 async function fetchWeather(){const result=await state.run(async()=>{const location=await getCurrentCoordinates();setPoint(location);return loadWeather(location);});if(result)setWeather(result);}
 async function prepareMonthly(){const result=await state.run(()=>monthlyData(warga.region!.id,month));if(result)setMonthly(result);}
 async function exportMonthly(format:'csv'|'pdf'){await state.run(async()=>{const data=await monthlyData(warga.region!.id,month);setMonthly(data);if(format==='csv')await exportCsv(data);else await exportPdf(data,warga.region!.name);},'Rekap siap disimpan.');}
 async function toggleSiren(){await state.run(async()=>{if(sound.current){await sound.current.stopAsync();await sound.current.unloadAsync();sound.current=null;setSiren(false);}else{sound.current=await playSiren();setSiren(true);}});}
 async function setAdmin(){await state.run(async()=>{if(!roleEmail.trim())throw new Error('Isi email akun yang sudah terverifikasi.');await callRpc('set_admin_by_email',{target_email:roleEmail.trim(),target_region:warga.region!.id,new_role:role});await warga.refresh();},'Hak akses akun diperbarui.');}
 async function reviewMember(id:string,status:string){await state.run(async()=>{await callRpc('review_membership',{target_membership:id,new_status:status,note:reviewNote});await warga.refresh();},'Status keanggotaan tersimpan.');}
 async function viewDomicile(path:string){await state.run(()=>openPrivateFile('domicile-proofs',path));}
 async function swap(){await state.run(async()=>{if(!ownAssignment||!targetAssignment)throw new Error('Pilih dua jadwal berbeda.');await callRpc('request_shift_swap',{own_assignment:ownAssignment,target_assignment:targetAssignment});await state.load('shift_swap_requests');},'Permintaan tukar terkirim ke rekan.');}
 async function respondSwap(id:string,approve:boolean){await state.run(async()=>{await callRpc('respond_shift_swap',{target_swap:id,approve});await Promise.all([state.load('shift_swap_requests'),state.load('patrol_assignments')]);},approve?'Kedua jadwal berhasil ditukar.':'Permintaan tukar ditolak.');}
 async function checkin(id:string,token?:string){await state.run(async()=>{if(token&&!/^[0-9a-f-]{36}$/i.test(token))throw new Error('QR harus berisi token pos yang valid.');const coordinates=await getCurrentCoordinates();await callRpc('checkin_patrol',{target_assignment:id,lat:coordinates.latitude,lng:coordinates.longitude,token:token??null});await state.load('patrol_attendance');},'Kehadiran ronda tercatat.');}
 async function loadResults(id:string){const result=await state.run(()=>loadPollResults(id));if(result)setResults(result);}
 async function sendVote(id:string){await state.run(async()=>{if(!vote)throw new Error('Pilih jawaban terlebih dahulu.');await votePoll(warga.region!.id,warga.session!.user.id,id,vote);setResults(await loadPollResults(id));await state.load('poll_votes');},'Suara Anda tersimpan.');}
 return{...state,weather,point,locate,fetchWeather,month,setMonth,monthly,prepareMonthly,exportMonthly,siren,toggleSiren,call,map,openUrl,share,markRead,openNotification,testWebhook,sendWarning,roleEmail,setRoleEmail,role,setRole,setAdmin,reviewNote,setReviewNote,reviewMember,viewDomicile,ownAssignment,setOwnAssignment,targetAssignment,setTargetAssignment,swap,respondSwap,checkin,results,vote,setVote,loadResults,sendVote};
}
