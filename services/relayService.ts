import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Crypto from 'expo-crypto';
import { getSupabaseClient } from './wargaService';
export interface QueueItem { id: string; userId: string; regionId: string; table: 'reports' | 'sos_alerts'; payload: Record<string,unknown>; createdAt: string; error: string; attempts: number }
const storageKey='jaga-warga-outbox-v1';
let processing=false; let mutation:Promise<unknown>=Promise.resolve();
function serialized<T>(action:()=>Promise<T>):Promise<T> {const next=mutation.then(action,action); mutation=next.catch(()=>{}); return next;}
export async function loadQueue(userId:string):Promise<QueueItem[]> {const raw=await AsyncStorage.getItem(storageKey);const data:QueueItem[]=raw?JSON.parse(raw):[];return data.filter(item=>item.userId===userId);}
async function allQueue():Promise<QueueItem[]> {const raw=await AsyncStorage.getItem(storageKey);return raw?JSON.parse(raw):[];}
export async function removeQueue(id:string,userId:string){await serialized(async()=>{const list=await allQueue();await AsyncStorage.setItem(storageKey,JSON.stringify(list.filter(item=>item.id!==id||item.userId!==userId)));});}
export function isNetworkError(cause:unknown){const text=String((cause as {message?:string})?.message??cause).toLowerCase();return ['network request failed','failed to fetch','networkerror','network error','fetch failed','load failed'].some(item=>text.includes(item));}
export async function submitDurable(table:'reports'|'sos_alerts',userId:string,regionId:string,values:Record<string,unknown>,requestId=Crypto.randomUUID()) {
  const payload={...values,user_id:userId,region_id:regionId,client_request_id:requestId};const net=await NetInfo.fetch();
  if(net.isConnected!==false&&net.isInternetReachable!==false){try{const {data,error}=await getSupabaseClient().from(table).insert(payload).select().single();if(error)throw error;return {queued:false as const,data};}catch(cause){if(!isNetworkError(cause))throw cause;}}
  const item:QueueItem={id:requestId,userId,regionId,table,payload,createdAt:new Date().toISOString(),error:'',attempts:0};
  await serialized(async()=>{const list=await allQueue();if(!list.some(row=>row.id===requestId))list.push(item);await AsyncStorage.setItem(storageKey,JSON.stringify(list));});
  return {queued:true as const,data:null};
}
export async function flushQueue(userId:string){
  if(processing)return;const network=await NetInfo.fetch();if(network.isConnected===false||network.isInternetReachable===false)return;processing=true;
  try{const list=await loadQueue(userId);for(const item of list){
    try{const db=getSupabaseClient();const {data:existing,error:readError}=await db.from(item.table).select('id').eq('user_id',userId).eq('client_request_id',item.id).maybeSingle();if(readError)throw readError;
      if(!existing){const {error}=await db.from(item.table).insert(item.payload);if(error&&error.code!=='23505')throw error;}
      await removeQueue(item.id,userId);
    }catch(cause){await serialized(async()=>{const current=await allQueue();await AsyncStorage.setItem(storageKey,JSON.stringify(current.map(row=>row.id===item.id?{...row,error:String((cause as {message?:string})?.message??cause),attempts:row.attempts+1}:row)));});if(isNetworkError(cause))break;}
  }}finally{processing=false;}
}
