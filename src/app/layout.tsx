import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProcX - Beat Procrastination',
  description: 'Complete daily challenges, earn points and get real rewards. An anti-procrastination app with skill-based rewards.',
  keywords: ['procrastination', 'challenges', 'productivity', 'rewards', 'habits'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
