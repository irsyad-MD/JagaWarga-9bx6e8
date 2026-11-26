import React, { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { theme } from '@/constants/theme';
const AnimatedPath = Animated.createAnimatedComponent(Path);
interface IntroProps { onDone: () => void }
export function Intro({ onDone }: IntroProps) {
  const stroke = useRef(new Animated.Value(0)).current; const text = useRef(new Animated.Value(0)).current; const opacity = useRef(new Animated.Value(1)).current; const done = useRef(false); const reducedMotion = useRef(false); const callback = useRef(onDone); callback.current = onDone;
  const finish = useCallback(() => { if (done.current) return; done.current = true; if (reducedMotion.current) { opacity.setValue(0); callback.current(); return; } Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => callback.current()); }, [opacity]);
  useEffect(() => {
    let mounted = true; let timer: ReturnType<typeof setTimeout> | null = null; let animation: Animated.CompositeAnimation | null = null;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!mounted || done.current) return;
      reducedMotion.current = reduced;
      if (reduced) { stroke.setValue(1); text.setValue(1); timer = setTimeout(finish, 350); return; }
      animation = Animated.parallel([Animated.timing(stroke, { toValue: 1, duration: 650, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: false }), Animated.sequence([Animated.delay(300), Animated.timing(text, { toValue: 1, duration: 450, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true })])]);
      animation.start(); timer = setTimeout(finish, 1500);
    }).catch(() => { stroke.setValue(1); text.setValue(1); if (mounted) timer = setTimeout(finish, 1500); });
    return () => { mounted = false; if (timer) clearTimeout(timer); animation?.stop(); };
  }, [finish, stroke, text]);
  return <Animated.View style={[styles.overlay, { opacity }]}><SafeAreaView style={styles.safe}><Pressable accessibilityRole="button" accessibilityLabel="Lewati animasi pembuka Jaga Warga" onPress={finish} style={styles.root}><View style={styles.center}><View style={styles.mark}><Svg width={100} height={112} viewBox="0 0 100 112"><AnimatedPath d="M50 7 L88 22 V54 C88 77 70 94 50 105 C30 94 12 77 12 54 V22 Z" fill="none" stroke={theme.colors.danger} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="300" strokeDashoffset={stroke.interpolate({ inputRange: [0, 1], outputRange: [300, 0] })} /><AnimatedPath d="M31 57 L50 40 L69 57 M36 53 V76 H45 V63 H55 V76 H64 V53" fill="none" stroke={theme.colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="130" strokeDashoffset={stroke.interpolate({ inputRange: [0, 1], outputRange: [130, 0] })} /></Svg></View><Animated.View style={[styles.copy, { opacity: text, transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}><Text style={styles.title}>Jaga Warga</Text><Text style={styles.tagline}>Lingkungan aman. Warga terlindungi.</Text></Animated.View></View><View style={styles.bottom}><Text style={styles.byline}>By ImsyadDeveloper</Text><Text style={styles.skip}>Ketuk untuk melewati</Text></View></Pressable></SafeAreaView></Animated.View>;
}
const styles = StyleSheet.create({ overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, backgroundColor: theme.colors.background }, safe: { flex: 1 }, root: { flex: 1, alignItems: 'center', justifyContent: 'center' }, center: { alignItems: 'center', gap: theme.space.md, marginTop: -theme.space.xl }, mark: { width: 132, height: 140, justifyContent: 'center', alignItems: 'center' }, copy: { alignItems: 'center', gap: theme.space.xs }, title: { color: theme.colors.ink, fontSize: theme.type.display, fontWeight: '700', letterSpacing: -1, includeFontPadding: false }, tagline: { color: theme.colors.muted, fontSize: theme.type.body, textAlign: 'center', paddingHorizontal: theme.space.sm }, bottom: { position: 'absolute', bottom: theme.space.lg, alignItems: 'center', gap: theme.space.sm }, byline: { fontSize: theme.type.caption, fontWeight: '600', color: theme.colors.ink, includeFontPadding: false }, skip: { color: theme.colors.muted, fontSize: theme.type.small } });
