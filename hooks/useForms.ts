import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useWarga } from '@/hooks/useWarga';
import { getCurrentCoordinates } from '@/services/locationService';
export function useAuthForm(initialRegister = false) {
  const { authenticate } = useWarga();
  const [register, setRegister] = useState(initialRegister);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [validation, setValidation] = useState('');
  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || !password || (register && !name.trim())) { setValidation('Isi email yang valid, kata sandi, dan nama jika mendaftar.'); return; }
    setValidation(''); await authenticate(email, password, register ? name : undefined);
  }
  return { register, setRegister, email, setEmail, password, setPassword, name, setName, validation, submit };
}
export function useRegionForm() {
  const { registerRegion } = useWarga();
  const [name, setName] = useState(''); const [rt, setRt] = useState(''); const [rw, setRw] = useState(''); const [address, setAddress] = useState(''); const [validation, setValidation] = useState('');
  async function submit() {
    if (![name, rt, rw, address].every(value => value.trim())) { setValidation('Lengkapi nama wilayah, RT, RW, dan alamat.'); return; }
    setValidation(''); await registerRegion(name, rt, rw, address);
  }
  return { name, setName, rt, setRt, rw, setRw, address, setAddress, validation, submit };
}
export function useReportForm() {
  const { submitReport } = useWarga(); const router = useRouter();
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [category, setCategory] = useState('Keamanan'); const [priority, setPriority] = useState('medium'); const [anonymous, setAnonymous] = useState(false); const [validation, setValidation] = useState('');
  const [latitude, setLatitude] = useState(''); const [longitude, setLongitude] = useState(''); const [locating, setLocating] = useState(false);
  async function locate() {
    setLocating(true); setValidation('');
    try { const point = await getCurrentCoordinates(); setLatitude(point.latitude.toFixed(6)); setLongitude(point.longitude.toFixed(6)); }
    catch (cause) { setValidation(cause instanceof Error ? cause.message : 'Lokasi tidak dapat diambil. Isi koordinat secara manual.'); }
    finally { setLocating(false); }
  }
  async function submit() {
    if (!title.trim() || !description.trim()) { setValidation('Judul dan kronologi wajib diisi.'); return; }
    setValidation('');
    const lat = latitude.trim() ? Number(latitude) : null; const lng = longitude.trim() ? Number(longitude) : null;
    if ((lat === null) !== (lng === null) || (lat !== null && (!Number.isFinite(lat) || Math.abs(lat) > 90)) || (lng !== null && (!Number.isFinite(lng) || Math.abs(lng) > 180))) { setValidation('Isi pasangan koordinat yang valid: lintang −90 hingga 90, bujur −180 hingga 180.'); return; }
    const id = await submitReport(title, description, category, priority, anonymous, lat, lng);
    if (id) router.replace({ pathname: '/report/[id]', params: { id } });
  }
  return { title, setTitle, description, setDescription, category, setCategory, priority, setPriority, anonymous, setAnonymous, latitude, longitude, setLatitude, setLongitude, locating, locate, validation, submit };
}
export function useProfileForm() {
  const { profile, saveProfile } = useWarga();
  const [name, setName] = useState(''); const [phone, setPhone] = useState(''); const [validation, setValidation] = useState('');
  useEffect(() => { setName(profile?.username ?? ''); setPhone(profile?.phone ?? ''); }, [profile]);
  async function submit() { if (!name.trim()) { setValidation('Nama wajib diisi.'); return; } setValidation(''); await saveProfile(name, phone); }
  return { name, setName, phone, setPhone, validation, submit };
}
