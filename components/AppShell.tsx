'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    }).catch(() => {
      router.replace('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [isLoginPage, pathname, router]);

  // Login page — no shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Checking auth
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Authenticated app shell
  return (
    <>
      <MobileNav />
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    </>
  );
}
