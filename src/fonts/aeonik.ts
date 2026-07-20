import localFont from 'next/font/local';

export const aeonik = localFont({
  src: [
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Air.otf', weight: '100', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Thin.otf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Medium.otf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Bold.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/AeonikHangul/AeonikHangulTRIAL-Black.otf', weight: '900', style: 'normal' },
  ],
  variable: '--font-aeonik',
  display: 'swap',
});
