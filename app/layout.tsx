import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Pacific Travel CRM',
  description: 'מערכת ניהול לקוחות - Pacific Travel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
