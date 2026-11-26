import { useCallback, useState } from 'react';
import { Share } from 'react-native';
import { useWarga } from '@/hooks/useWarga';
export function useProfileActions() {
  const { region } = useWarga(); const [shareError, setShareError] = useState('');
  const shareInvitation = useCallback(async () => {
    if (!region) return;
    try { setShareError(''); await Share.share({ message: `Kode undangan Jaga Warga — ${region.name} (RT ${region.rt}/RW ${region.rw}): ${region.invitation_code}` }); }
    catch (cause) { setShareError((cause as Error).message); }
  }, [region]);
  return { shareError, shareInvitation };
}
