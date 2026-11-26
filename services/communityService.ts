import { getSupabaseClient } from './wargaService';
import { FunctionsHttpError } from '@supabase/supabase-js';
export interface RecordData { id: string; region_id?: string; user_id?: string; created_at?: string; [key: string]: any }
export const resourceTables = ['announcements','early_warnings','emergency_contacts','water_readings','households','family_members','family_safety','evacuation_requests','guest_visits','patrol_posts','patrol_shifts','patrol_assignments','patrol_attendance','shift_swap_requests','inventory_items','assembly_points','logistics_needs','safe_routes','safe_route_points','cash_transactions','payment_confirmations','polls','poll_options','poll_votes','live_locations','location_recipients','volunteer_offers','service_listings','mitigation_guides','go_bag_items','letter_requests','notification_preferences','notifications','audit_logs','webhook_integrations','webhook_deliveries','report_categories'] as const;
export type ResourceTable = typeof resourceTables[number];
export async function loadResource(table: ResourceTable, regionId: string): Promise<RecordData[]> {
  const { data, error } = await getSupabaseClient().from(table).select('*').eq('region_id', regionId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function saveResource(table: ResourceTable, regionId: string, userId: string, values: Record<string, unknown>, id?: string) {
  const query = id ? getSupabaseClient().from(table).update(values).eq('id', id).eq('region_id', regionId) : getSupabaseClient().from(table).insert({ ...values, region_id: regionId, user_id: ['households', 'patrol_assignments'].includes(table) ? values.user_id ?? userId : userId });
  const { data, error } = await query.select().single(); if (error) throw error; return data as RecordData;
}
export async function deleteResource(table: ResourceTable, id: string, regionId: string) {
  const { data, error } = await getSupabaseClient().from(table).delete().eq('id', id).eq('region_id', regionId).select('id');
  if (error) throw error; if (!data?.length) throw new Error('Hak akses tidak mengizinkan penghapusan data ini.');
}
export async function callRpc(name: string, args: Record<string, unknown>) { const { data, error } = await getSupabaseClient().rpc(name, args); if (error) throw error; return data; }
export async function callEdge(name: string, body: Record<string, unknown>) {
  const { data, error } = await getSupabaseClient().functions.invoke(name, { body });
  if (error) { let message = error.message; if (error instanceof FunctionsHttpError) { try { const text = await error.context.text(); try { message = JSON.parse(text).error ?? text; } catch { message = text || message; } } catch { /* original backend error */ } } throw new Error(message); }
  if (data?.error) throw new Error(data.error); return data;
}
export async function loadReportThread(reportId: string) {
  const db = getSupabaseClient(); const [report, updates, comments, media, escalations, debriefs, rating, crowd, own] = await Promise.all([
    db.rpc('get_report_detail', { target_report: reportId }), db.from('report_updates').select('*').eq('report_id', reportId).order('created_at'), db.from('report_comments').select('*').eq('report_id', reportId).order('created_at'), db.from('report_media').select('*').eq('report_id', reportId), db.from('report_escalations').select('*').eq('report_id', reportId), db.from('incident_debriefs').select('*').eq('report_id', reportId), db.from('report_ratings').select('*').eq('report_id', reportId), db.rpc('get_crowd_summary', { target_report: reportId }), db.from('report_confirmations').select('*').eq('report_id', reportId),
  ]);
  for (const result of [report, updates, comments, media, escalations, debriefs, rating, crowd, own]) if (result.error) throw result.error;
  return { report: report.data, updates: updates.data ?? [], comments: comments.data ?? [], media: media.data ?? [], escalations: escalations.data ?? [], debriefs: debriefs.data ?? [], ratings: rating.data ?? [], crowd: crowd.data, confirmations: own.data ?? [] };
}
export async function saveReportChild(table: 'report_comments' | 'report_confirmations' | 'report_escalations' | 'report_ratings' | 'incident_debriefs', reportId: string, userId: string, values: Record<string, unknown>, id?: string) {
  const db = getSupabaseClient(); const query = id ? db.from(table).update(values).eq('id', id) : db.from(table).insert({ ...values, report_id: reportId, user_id: userId }); const { error } = await query; if (error) throw error;
}
export async function toggleConfirmation(reportId: string, userId: string, response: string, existingId?: string, same = false) {
  if (existingId && same) { const { error } = await getSupabaseClient().from('report_confirmations').delete().eq('id', existingId); if (error) throw error; }
  else await saveReportChild('report_confirmations', reportId, userId, { response }, existingId);
}
export async function loadPollResults(id: string) { return callRpc('get_poll_results', { target_poll: id }) as Promise<{ option_id: string; label: string; votes: number }[]>; }
export async function votePoll(regionId: string, userId: string, pollId: string, optionId: string) { return saveResource('poll_votes', regionId, userId, { poll_id: pollId, option_id: optionId }); }
export async function createPoll(regionId: string, userId: string, values: Record<string, unknown>, labels: string[]) {
  const poll = await saveResource('polls', regionId, userId, values);
  const { error } = await getSupabaseClient().from('poll_options').insert(labels.map(label => ({ region_id: regionId, user_id: userId, poll_id: poll.id, label })));
  if (error) { const rollback = await getSupabaseClient().from('polls').delete().eq('id', poll.id); if (rollback.error) throw new Error(`${error.message}. Polling ${poll.id} belum memiliki opsi lengkap; edit opsi sebelum menerbitkan.`); throw error; } return poll;
}
