'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserProvider } from '@/lib/userContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const PUBLIC_PATHS = ['/login', '/register', '/verify-email', '/complete-profile', '/pending-approval'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  const [checking, setChecking] = useState(!isPublicPage);

  useEffect(() => {
    if (isPublicPage) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error || !session) {
        router.replace('/login');
        return;
      }

      // Check profile status
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        // No profile yet (e.g. Google auth first login)
        router.replace('/complete-profile');
        return;
      }

      if (profile.status === 'pending') {
        router.replace('/pending-approval');
        return;
      }

      if (profile.status === 'suspended') {
        await supabase.auth.signOut();
        router.replace('/login?error=suspended');
        return;
      }

      setChecking(false);
    }).catch(() => {
      router.replace('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !PUBLIC_PATHS.includes(pathname)) {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [isPublicPage, pathname, router]);

  // Public pages — no shell
  if (isPublicPage) {
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
    <UserProvider>
      <MobileNav />
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    </UserProvider>
  );
}
