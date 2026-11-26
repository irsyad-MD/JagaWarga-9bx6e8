export const theme = {
  colors: { background: '#FAFAF7', surface: '#FFFFFF', input: '#F1F3F3', ink: '#14171A', muted: '#606865', border: '#E1E5E3', primary: '#16834A', soft: '#EDF7F0', danger: '#DC2626', dangerSoft: '#FBECE8', warning: '#A45D08', warningSoft: '#FFF3E1', white: '#FFFFFF', night: '#14191D', nightMuted: '#ADB8BA', overlay: 'rgba(20,23,26,0.45)' },
  space: { xxs: 4, xs: 8, sm: 16, md: 24, lg: 32, xl: 48 },
  radius: { sm: 6, md: 8, lg: 12, pill: 999 },
  type: { small: 12, caption: 14, body: 16, section: 18, title: 22, headline: 28, display: 36 },
  layout: { maxWidth: 960, touch: 48 },
};
export const statusLabels: Record<string, string> = { pending: 'Menunggu', verified: 'Terverifikasi', rejected: 'Ditolak', suspended: 'Ditangguhkan', valid: 'Valid', duplicate: 'Duplikat', hoax: 'Tidak valid', assigned: 'Ditugaskan', in_progress: 'Ditangani', resolved: 'Selesai' };
