import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';
export function useHoldToSos(onComplete: () => Promise<void>, disabled: boolean) {
  const progress = useRef(new Animated.Value(0)).current; const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false); const [seconds, setSeconds] = useState(3); const reduced = useRef(false); const completed = useRef(false);
  const action = useRef(onComplete); action.current = onComplete;
  const stop = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = null; progress.stopAnimation(); progress.setValue(0); setHolding(false); setSeconds(3); }, [progress]);
  useEffect(() => { void AccessibilityInfo.isReduceMotionEnabled().then(value => { reduced.current = value; }); const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', value => { reduced.current = value; }); return () => { sub.remove(); if (timer.current) clearTimeout(timer.current); progress.stopAnimation(); }; }, [progress]);
  useEffect(() => { if (!holding) return; const tick = setInterval(() => setSeconds(previous => Math.max(1, previous - 1)), 1000); return () => clearInterval(tick); }, [holding]);
  const start = useCallback(() => {
    if (disabled || timer.current) return; completed.current = false; setHolding(true); setSeconds(3); progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false }).start();
    timer.current = setTimeout(() => { timer.current = null; completed.current = true; setHolding(false); progress.setValue(0); void action.current(); }, 3000);
  }, [disabled, progress]);
  return { progress, holding, seconds, start, stop };
}
