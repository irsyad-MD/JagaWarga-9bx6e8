import React,{useCallback,useState} from 'react';
import {StyleSheet,View} from 'react-native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {WargaProvider} from '@/contexts/WargaContext';
import {CommunityProvider} from '@/contexts/CommunityContext';
import {EmergencyProvider} from '@/contexts/EmergencyContext';
import {LiveLocationProvider} from '@/contexts/LiveLocationContext';
import {Intro} from '@/components/feature/Intro';
import {NotificationOverlay} from '@/components/feature/NotificationOverlay';
import {useMotionPreference} from '@/hooks/useMotionPreference';
import {theme} from '@/constants/theme';
function AppNavigator(){const [intro,setIntro]=useState(true);const reducedMotion=useMotionPreference();const completeIntro=useCallback(()=>setIntro(false),[]);return <View style={styles.root}><StatusBar style="dark"/><Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:theme.colors.background},animation:reducedMotion?'none':'slide_from_right',headerTitleAlign:'center',headerTintColor:theme.colors.ink,headerStyle:{backgroundColor:theme.colors.background},headerShadowVisible:false}}><Stack.Screen name="index"/><Stack.Screen name="(tabs)"/><Stack.Screen name="report/new" options={{headerShown:true,title:'Jaga Warga'}}/><Stack.Screen name="report/[id]" options={{headerShown:true,title:'Jaga Warga'}}/><Stack.Screen name="feature/[key]" options={{headerShown:true,title:'Jaga Warga'}}/><Stack.Screen name="sos" options={{headerShown:false,animation:reducedMotion?'none':'slide_from_bottom'}}/><Stack.Screen name="profile/edit" options={{headerShown:true,title:'Jaga Warga'}}/><Stack.Screen name="help" options={{headerShown:true,title:'Jaga Warga'}}/></Stack><NotificationOverlay/>{intro?<Intro onDone={completeIntro}/>:null}</View>;}
export default function RootLayout(){return <SafeAreaProvider><WargaProvider><CommunityProvider><EmergencyProvider><LiveLocationProvider><AppNavigator/></LiveLocationProvider></EmergencyProvider></CommunityProvider></WargaProvider></SafeAreaProvider>;}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:theme.colors.background}});
