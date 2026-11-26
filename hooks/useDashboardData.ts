import { useMemo } from 'react';
import { useWarga } from '@/hooks/useWarga';
import { useEmergency } from '@/hooks/useEmergency';
export function useDashboardData() {
  const warga = useWarga(); const emergency = useEmergency();
  const visible = warga.reports;
  const counts = useMemo(() => ({ active: visible.filter(item => !['resolved', 'duplicate', 'hoax'].includes(item.status)).length, pending: visible.filter(item => item.status === 'pending').length, resolved: visible.filter(item => item.status === 'resolved').length, total: visible.filter(item => item.user_id === warga.session?.user.id).length, verified: warga.members.filter(item => item.status === 'verified').length }), [visible, warga.members]);
  const chart = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + index); const end = new Date(date); end.setDate(end.getDate() + 1);
    return { label: date.toLocaleDateString('id-ID', { weekday: 'short' }), count: visible.filter(item => new Date(item.created_at) >= date && new Date(item.created_at) < end).length };
  }), [visible]);
  const activeSos = useMemo(() => emergency.alerts.filter(item => ['active', 'responded'].includes(item.status) && (warga.adminMode || item.user_id === warga.session?.user.id)), [emergency.alerts, warga.adminMode, warga.session?.user.id]);
  return { ...warga, counts, chart, recent: visible.slice(0, 3), activeSos };
}
