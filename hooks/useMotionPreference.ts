import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useCommunity } from './useCommunity';
export function useMotionPreference() {
  const { batterySaver } = useCommunity();
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { let mounted = true; void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); }); const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion); return () => { mounted = false; sub.remove(); }; }, []);
  return reducedMotion || batterySaver;
}
