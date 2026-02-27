import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

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
        {/* Mobile top bar + hamburger drawer */}
        <MobileNav />

        <div className="flex min-h-screen bg-slate-50">
          {/* Desktop sidebar — hidden on mobile */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
