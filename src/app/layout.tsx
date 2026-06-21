import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { AppProvider } from '../context/AppContext';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crossroads — AI Life Decision Simulator',
  description:
    'An AI decision simulator that catches your hidden assumptions, models realistic futures with honest uncertainty, and helps you choose with clarity — not guessing.',
  openGraph: {
    title: 'Crossroads — AI Life Decision Simulator',
    description:
      'An AI decision simulator that catches your hidden assumptions, models realistic futures with honest uncertainty, and helps you choose with clarity.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
        {/* Novus.ai Product Tracking Integration — World Product Day Hard Blocker */}
        <Script
          id="novus-tracker"
          src="https://cdn.novus.ai/tracking.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
