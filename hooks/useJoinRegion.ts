import {useState} from 'react';
import {useWarga} from './useWarga';
import {callRpc} from '@/services/communityService';
import {pickDocument,PickedFile,uploadPrivateFile} from '@/services/mediaService';
export function useJoinRegion(){const {refresh,session}=useWarga();const [invite,setInvite]=useState('');const [house,setHouse]=useState('');const [file,setFile]=useState<PickedFile|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function pick(){try{setError('');const chosen=await pickDocument();if(chosen)setFile(chosen);}catch(cause){setError((cause as Error).message);}}
 async function submit(){if(busy||!session)return;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invite.trim())||!house.trim()||!file){setError('Isi kode undangan wilayah, nomor rumah, dan bukti domisili.');return;}setBusy(true);setError('');try{const proof=await uploadPrivateFile('domicile-proofs',null,file);await callRpc('join_region',{invite:invite.trim(),house:house.trim(),proof_path:proof.path});await refresh();}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
 return{invite,setInvite,house,setHouse,file,pick,submit,busy,error};}
