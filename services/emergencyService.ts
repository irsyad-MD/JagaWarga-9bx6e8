import { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/services/wargaService';
import { Coordinates } from '@/services/locationService';
export interface SosAlert extends Coordinates { id: string; user_id: string; region_id: string; status: 'active' | 'responded' | 'safe' | 'cancelled'; responded_at: string | null; created_at: string }
export async function loadSosAlerts(regionId: string) {
  const { data, error } = await getSupabaseClient().from('sos_alerts').select('*').eq('region_id', regionId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as SosAlert[];
}
export async function createSosAlert(regionId: string, userId: string, coordinates: Coordinates) {
  const { data, error } = await getSupabaseClient().from('sos_alerts').insert({ region_id: regionId, user_id: userId, ...coordinates }).select().single();
  if (error) throw error;
  return data as SosAlert;
}
export async function respondToSos(id: string) {
  const { error } = await getSupabaseClient().from('sos_alerts').update({ status: 'responded', responded_at: new Date().toISOString() }).eq('id', id).eq('status', 'active').select('id').single();
  if (error) throw error;
}
export async function closeOwnSos(id: string, status: 'safe' | 'cancelled') {
  const { data, error } = await getSupabaseClient().functions.invoke('close-own-sos', { body: { id, status } });
  if (error) {
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try { const text = await error.context.text(); try { message = JSON.parse(text).error ?? text; } catch { message = text || message; } } catch { /* preserve original error */ }
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
}
