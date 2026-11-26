import {useEffect,useState} from 'react';
import {useWarga} from './useWarga';
import {getSupabaseClient} from '@/services/wargaService';
export function useRelatedDebriefs(reportId:string,category?:string,block?:string){const warga=useWarga();const [debriefs,setDebriefs]=useState<any[]>([]);useEffect(()=>{let alive=true;const ids=warga.reports.filter(row=>row.id!==reportId&&row.status==='resolved'&&row.category===category&&(!block||row.block===block)).map(row=>row.id).slice(0,30);if(!ids.length){setDebriefs([]);return;}void getSupabaseClient().from('incident_debriefs').select('*').in('report_id',ids).then(({data,error})=>{if(alive&&!error)setDebriefs(data??[]);});return()=>{alive=false;};},[reportId,category,block,warga.reports]);return debriefs;}
