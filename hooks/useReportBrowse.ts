import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useWarga } from '@/hooks/useWarga';
export const reportFilters = [{ id: 'all', label: 'Semua' }, { id: 'active', label: 'Aktif' }, { id: 'pending', label: 'Menunggu' }, { id: 'resolved', label: 'Selesai' }];
export function useReportBrowse() {
  const { reports, session, adminMode } = useWarga(); const params = useLocalSearchParams<{ filter?: string; view?: string; mine?: string; archive?: string }>();
  const [fromDate, setFromDate] = useState(''); const [toDate, setToDate] = useState(''); const [category, setCategory] = useState(''); const [block, setBlock] = useState('');
  const [filter, setFilter] = useState('all'); const [search, setSearch] = useState(''); const [view, setView] = useState('list'); const [mine, setMine] = useState(false);
  useEffect(() => { if (params.filter && reportFilters.some(item => item.id === params.filter)) setFilter(params.filter); if (params.view) setView(params.view); setMine(params.mine === 'true'); }, [params.filter, params.view, params.mine]);
  const data = useMemo(() => reports.filter(item => (!mine || item.user_id === session?.user.id) && (filter === 'all' || (filter === 'active' ? !['resolved', 'duplicate', 'hoax'].includes(item.status) : item.status === filter)) && (!fromDate || item.created_at >= `${fromDate}T00:00:00`) && (!toDate || item.created_at.slice(0, 10) <= toDate) && (!category || item.category.toLowerCase().includes(category.toLowerCase())) && (!block || (item.block ?? '').toLowerCase().includes(block.toLowerCase())) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase().trim())), [reports, session?.user.id, adminMode, mine, filter, search, fromDate, toDate, category, block]);
  const points = useMemo(() => data.filter(item => item.latitude !== null && item.longitude !== null).map(item => ({ id: item.id, latitude: item.latitude!, longitude: item.longitude!, title: item.title, status: item.status })), [data]);
  return { data, filter, setFilter, search, setSearch, view, setView, mine, points, fromDate, setFromDate, toDate, setToDate, category, setCategory, block, setBlock, archive: params.archive === 'true' };
}
