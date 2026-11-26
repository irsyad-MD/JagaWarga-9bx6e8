import {useMemo,useState} from 'react';
import {useWarga} from './useWarga';
import {useFeatureNavigation} from './useFeatureNavigation';
import {getHelpTopics} from '@/services/helpService';
export function useHelp(){const {isAdmin,isSuperAdmin}=useWarga();const [search,setSearch]=useState('');const [open,setOpen]=useState(0);const go=useFeatureNavigation();const topics=useMemo(()=>getHelpTopics(isAdmin,isSuperAdmin).filter(item=>`${item.title} ${item.flow}`.toLowerCase().includes(search.toLowerCase())),[isAdmin,isSuperAdmin,search]);return{search,setSearch,open,toggle:(id:number)=>setOpen(current=>current===id?0:id),topics,go};}
