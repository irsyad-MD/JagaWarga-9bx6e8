import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok',{headers:corsHeaders});
  const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
  try {
    if(req.method!=='POST') return reply({error:'Metode tidak didukung'},405);
    const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');
    const db=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');
    const {data:{user},error:authError}=await db.auth.getUser(token); if(authError||!user) return reply({error:'Silakan masuk kembali'},401);
    const input=await req.json(); const allowed=['domicile-proofs','report-media','payment-proofs','community-documents']; if(!allowed.includes(input.bucket)) return reply({error:'Bucket tidak valid'},400);
    const {data:profile,error:profileError}=await db.from('user_profiles').select('account_role').eq('id',user.id).single(); if(profileError) throw profileError;
    const superAdmin=profile.account_role==='super_admin'&&!!user.email_confirmed_at;
    const member=async(region:string,admin=false)=>{ const {data,error}=await db.from('memberships').select('role,status').eq('region_id',region).eq('user_id',user.id).maybeSingle(); if(error)throw error; return superAdmin || (data?.status==='verified'&&(!admin||data.role==='admin')); };
    if(input.action==='upload') {
      const limit=input.bucket==='report-media'?52428800:10485760;
      if(!Number.isFinite(input.size)||input.size<=0||input.size>limit) return reply({error:'Ukuran berkas tidak valid'},400);
      if(input.bucket!=='domicile-proofs' && (!input.region_id || !await member(input.region_id)))return reply({error:'Keanggotaan wilayah belum terverifikasi'},403);
      const {data:bucket,error:bucketError}=await db.storage.getBucket(input.bucket); if(bucketError)throw bucketError;
      if(!bucket.allowed_mime_types?.includes(input.mime))return reply({error:'Format berkas tidak didukung'},400);
      const ext=String(input.name??'file').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10)||'bin';
      const path=`${user.id}/${input.bucket==='domicile-proofs'?'':input.region_id+'/'}${crypto.randomUUID()}.${ext}`;
      const {data,error}=await db.storage.from(input.bucket).createSignedUploadUrl(path);if(error)throw error;
      return reply({path,token:data.token});
    }
    if(input.action==='download') {
      const path=String(input.path??''); if(!path||path.includes('..'))return reply({error:'Path tidak valid'},400);
      let access=path.split('/')[0]===user.id;
      if(!access&&input.bucket==='domicile-proofs'){const {data,error}=await db.from('memberships').select('region_id').eq('domicile_path',path);if(error)throw error;for(const row of data??[])if(await member(row.region_id,true))access=true;}
      if(!access&&input.bucket==='payment-proofs')access=await member(path.split('/')[1],true);
      if(!access&&input.bucket==='report-media') {
        const [media,updates]=await Promise.all([db.from('report_media').select('report_id').eq('storage_path',path),db.from('report_updates').select('report_id').eq('proof_path',path)]);if(media.error)throw media.error;if(updates.error)throw updates.error;
        for(const child of [...(media.data??[]),...(updates.data??[])]){const {data,error}=await db.from('reports').select('region_id').eq('id',child.report_id).single();if(error)throw error;if(await member(data.region_id))access=true;}
      }
      if(!access&&input.bucket==='community-documents'){const {data,error}=await db.from('letter_requests').select('region_id,user_id').eq('document_path',path);if(error)throw error;for(const row of data??[])if((row.user_id===user.id&&await member(row.region_id))||await member(row.region_id,true))access=true;}
      if(!access)return reply({error:'Tidak memiliki akses berkas'},403);
      const {data,error}=await db.storage.from(input.bucket).createSignedUrl(path,300);if(error)throw error;return reply({url:data.signedUrl});
    }
    return reply({error:'Aksi tidak valid'},400);
  }catch(error){console.error('private-file:',error instanceof Error?error.message:'error');return reply({error:error instanceof Error?error.message:'Gagal mengakses berkas'},400);}
});
