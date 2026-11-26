import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

let client: SupabaseClient | null = null;
export function getSupabaseClient() {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Konfigurasi Supabase belum tersedia di aplikasi. Periksa koneksi proyek dan muat ulang pratinjau.');
  const storage = Platform.OS === 'web' ? {
    getItem: async (name: string) => { try { return typeof window !== 'undefined' ? window.localStorage.getItem(name) : null; } catch { return null; } },
    setItem: async (name: string, value: string) => { if (typeof window !== 'undefined') window.localStorage.setItem(name, value); },
    removeItem: async (name: string) => { if (typeof window !== 'undefined') window.localStorage.removeItem(name); },
  } : AsyncStorage;
  client = createClient(url, key, { auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
  return client;
}
export interface Membership { id: string; region_id: string; role: string; status: string; house_number: string; review_note: string | null }
export interface MemberSummary extends Membership { user_id: string; created_at: string; domicile_path?: string | null; user_profiles?: { username: string; email: string; phone: string } | null }
export async function loadMembers(regionId: string) {
  const { data, error } = await getSupabaseClient().from('memberships').select('*,user_profiles(username,email,phone)').eq('region_id', regionId).order('created_at', { ascending: false });
  if (error) throw error;
  return data as MemberSummary[];
}
export interface Region { id: string; name: string; rt: string; rw: string; address: string; invitation_code: string }
export interface Report { id: string; title: string; description: string; category: string; status: string; priority: string; user_id: string | null; anonymous: boolean; latitude: number | null; longitude: number | null; created_at: string; updated_at: string; block?: string; assigned_to?: string | null; verification_note?: string | null }
export type AccountRole = 'super_admin' | 'admin' | 'resident';
export interface Profile { username: string; email: string; phone: string; account_role: AccountRole }
export async function loadAccount(userId: string) {
  const db = getSupabaseClient();
  const [profileResult, membershipResult] = await Promise.all([db.from('user_profiles').select('username,email,phone,account_role').eq('id', userId).single(), db.from('memberships').select('*').eq('user_id', userId).order('created_at', { ascending: true })]);
  if (profileResult.error) throw profileResult.error;
  if (membershipResult.error) throw membershipResult.error;
  const memberships = membershipResult.data as Membership[];
  let membership = memberships.find(item => item.status === 'verified') ?? memberships[0] ?? null;
  let region: Region | null = null;
  if (membership?.status === 'verified') {
    const result = await db.from('regions').select('*').eq('id', membership.region_id).single();
    if (result.error) throw result.error;
    region = result.data as Region;
  }
  if (!region && profileResult.data.account_role === 'super_admin') {
    const result = await db.from('regions').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (result.error) throw result.error;
    if (result.data) { region = result.data as Region; membership = { id: '', region_id: region.id, role: 'super_admin', status: 'verified', house_number: '', review_note: null }; }
  }
  return { profile: profileResult.data as Profile, membership, region };
}
export async function loadReports(regionId: string) {
  const { data, error } = await getSupabaseClient().rpc('get_region_feed', { target_region: regionId });
  if (error) throw error;
  return data as Report[];
}
export async function createReport(input: { region_id: string; user_id: string; title: string; description: string; category: string; priority: string; anonymous: boolean; latitude?: number | null; longitude?: number | null }) {
  const { data, error } = await getSupabaseClient().from('reports').insert(input).select().single();
  if (error) throw error;
  return data as Report;
}
export async function createRegion(name: string, rt: string, rw: string, address: string) {
  const { error } = await getSupabaseClient().rpc('create_region', { region_name: name, rt_number: rt, rw_number: rw, region_address: address });
  if (error) throw error;
}
export async function updateReport(id: string, status: string) {
  const { error } = await getSupabaseClient().rpc('update_report_progress', { target_report: id, new_status: status, note: 'Status diperbarui oleh pengurus.' });
  if (error) throw error;
}
export async function updateProfile(id: string, username: string, phone: string) {
  const { error } = await getSupabaseClient().from('user_profiles').update({ username, phone, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
