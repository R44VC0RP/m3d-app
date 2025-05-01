import localFont from 'next/font/local';

export const overusedGrotesk = localFont({
  src: [
    {
      path: './OverusedGrotesk-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-Book.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './OverusedGrotesk-Black.otf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-overused',
  display: 'swap',
}); 