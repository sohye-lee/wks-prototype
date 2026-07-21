import localFont from 'next/font/local';

export const aeonikMono = localFont({
  src: [{ path: '../../public/fonts/AeonikMonoTRIAL-Regular.otf', weight: '400', style: 'normal' }],
  variable: '--font-aeonik-mono',
  display: 'swap',
});
