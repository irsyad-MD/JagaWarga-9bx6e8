import {useEffect,useRef,useState} from 'react';
import {Audio} from 'expo-av';
import {playAudio} from '@/services/audioService';
import {useCommunity} from './useCommunity';
export function useAudioEvidence(uri:string){const state=useCommunity();const sound=useRef<Audio.Sound|null>(null);const [playing,setPlaying]=useState(false);useEffect(()=>()=>{void sound.current?.unloadAsync().catch(()=>{});},[uri]);async function toggle(){await state.run(async()=>{if(sound.current){await sound.current.unloadAsync();sound.current=null;setPlaying(false);}else{sound.current=await playAudio(uri);sound.current.setOnPlaybackStatusUpdate(status=>{if(status.isLoaded&&status.didJustFinish)setPlaying(false);});setPlaying(true);}});}return{playing,toggle};}
