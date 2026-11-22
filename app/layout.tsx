import type { Metadata, Viewport } from 'next';
import '@fontsource/anton/400.css';
import '@fontsource/lilita-one/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Malta Guinness | A Taste of Greatness',
  description:
    'A scroll-driven brand experience for Malta Guinness, the non-alcoholic malt drink. Watch the harp open and the bottle step into the light.',
};

export const viewport: Viewport = {
  themeColor: '#f4ecdd',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
