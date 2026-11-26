import {useEffect,useRef} from 'react';
import {Animated} from 'react-native';
import {useMotionPreference} from './useMotionPreference';
export function useRowAnimation(index:number){const reduced=useMotionPreference();const value=useRef(new Animated.Value(reduced?1:0)).current;useEffect(()=>{if(reduced){value.setValue(1);return;}const animation=Animated.timing(value,{toValue:1,duration:180,delay:Math.min(100,index*20),useNativeDriver:true});animation.start();return()=>animation.stop();},[index,reduced,value]);return{opacity:value,transform:[{translateY:value.interpolate({inputRange:[0,1],outputRange:[8,0]})}]};}
