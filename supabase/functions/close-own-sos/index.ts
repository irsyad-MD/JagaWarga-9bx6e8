import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method !== 'POST') return reply({ error: 'Metode tidak diizinkan.' }, 405);
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return reply({ error: 'Silakan masuk kembali.' }, 401);
    const authClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return reply({ error: 'Sesi tidak valid. Silakan masuk kembali.' }, 401);
    const { id, status } = await req.json();
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id) || !['safe', 'cancelled'].includes(status)) return reply({ error: 'Data SOS tidak valid.' }, 400);
    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } });
    const { data, error } = await admin.from('sos_alerts').update({ status }).eq('id', id).eq('user_id', user.id).in('status', ['active', 'responded']).select('id').maybeSingle();
    if (error) { console.error('close-own-sos update failed', error.message); return reply({ error: error.message }, 500); }
    if (!data) return reply({ error: 'SOS tidak ditemukan atau sudah ditutup.' }, 409);
    return reply({ ok: true, id: data.id });
  } catch (error) { console.error('close-own-sos failed', error instanceof Error ? error.message : 'Unknown error'); return reply({ error: 'Tidak dapat memperbarui SOS. Coba lagi.' }, 500); }
});
