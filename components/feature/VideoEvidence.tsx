import React,{memo} from 'react';
import {StyleSheet} from 'react-native';
import {useVideoPlayer,VideoView} from 'expo-video';
import {theme} from '@/constants/theme';
interface VideoEvidenceProps {uri:string}
export const VideoEvidence=memo(function VideoEvidence({uri}:VideoEvidenceProps){const player=useVideoPlayer(uri);return <VideoView player={player} style={styles.video} nativeControls contentFit="contain"/>;});
const styles=StyleSheet.create({video:{height:200,width:'100%',backgroundColor:theme.colors.night,borderRadius:theme.radius.sm}});
