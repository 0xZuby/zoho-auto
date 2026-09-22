import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

/**
 * Archivo (industrial grotesque) carries structure and headings; IBM Plex
 * Mono carries every identifier, figure and micro-label. Both are
 * self-hosted by next/font at build time, so there is no runtime request to
 * Google and no layout shift.
 */
const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plex-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Employee Onboarding & Zoho Provisioning Portal',
  description: 'Request credentials for new hires, offboard leavers, and manage Zoho provisioning.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
