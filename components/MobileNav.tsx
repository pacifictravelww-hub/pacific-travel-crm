'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Settings,
  MessageCircle, BarChart3, FileText, Menu, X, HelpCircle, LogOut, Bell,
} from 'lucide-react';
import { signOut, getUserRole, UserRole } from '@/lib/auth';
import { getUnreadCount } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/leads', label: 'לידים', icon: Users },
  { href: '/customers', label: 'לקוחות', icon: UserCheck },
  { href: '/automations', label: 'אוטומציות', icon: MessageCircle },
  { href: '/reports', label: 'דוחות', icon: BarChart3 },
  { href: '/documents', label: 'מסמכים', icon: FileText },
  { href: '/notifications', label: 'התראות', icon: Bell },
  { href: '/help', label: 'עזרה', icon: HelpCircle },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [userRole, setUserRole] = useState<UserRole>(null);
  const pathname = usePathname();
  const router = useRouter();

  const loadUserData = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserEmail(user.email || '');
      // Load profile: name, avatar, role
      supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUserDisplayName(data.full_name || user.email || '');
          setAvatarUrl(data.avatar_url || '');
          setUserRole(data.role as UserRole || null);
        }
      });
    });

  };

  useEffect(() => {
    loadUserData();
    getUnreadCount().then(setUnreadCount);
    const interval = setInterval(() => getUnreadCount().then(setUnreadCount), 30000);

    // Re-load on focus
    const onFocus = () => loadUserData();
    window.addEventListener('focus', onFocus);



    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);

    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    router.push('/login');
  };

  const initials = userDisplayName
    ? userDisplayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : userEmail.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 bg-slate-900 text-white px-4 shadow-md">
        <div className="flex items-center gap-2">
        </div>

        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="פתח תפריט"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Spacer moved to AppShell to sit above banner */}

      {/* Backdrop */}
      <button
        aria-label="סגור תפריט"
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 w-full border-0 cursor-default',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
        onTouchEnd={() => setOpen(false)}
        tabIndex={-1}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-end">
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="סגור תפריט"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">{initials}</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{userDisplayName || userEmail}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                {userRole === 'developer' && <span className="text-purple-400">👑 Developer</span>}
                {userRole === 'admin' && <span className="text-yellow-400">⭐ Admin</span>}
                {(userRole === 'agent' || !userRole) && <span>סוכן נסיעות</span>}
                {userRole === 'customer' && <span>לקוח</span>}
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings + Logout */}
        <div className="p-4 border-t border-slate-700 space-y-1">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>הגדרות</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>התנתק</span>
          </button>
        </div>
      </aside>
    </>
  );
}
