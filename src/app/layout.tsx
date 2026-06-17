import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
