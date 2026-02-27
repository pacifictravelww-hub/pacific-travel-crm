'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Settings, Plane,
  MessageCircle, BarChart3, FileText, Menu, X, HelpCircle, LogOut,
} from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'לוח בקרה', icon: LayoutDashboard },
  { href: '/leads', label: 'לידים', icon: Users },
  { href: '/customers', label: 'לקוחות', icon: UserCheck },
  { href: '/automations', label: 'אוטומציות', icon: MessageCircle },
  { href: '/reports', label: 'דוחות', icon: BarChart3 },
  { href: '/documents', label: 'מסמכים', icon: FileText },
  { href: '/help', label: 'עזרה', icon: HelpCircle },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Top bar — visible on mobile only */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 bg-slate-900 text-white px-4 shadow-md">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Pacific Travel</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="פתח תפריט"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Spacer so content isn't hidden behind fixed header */}
      <div className="md:hidden h-14" />

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

      {/* Slide-in drawer from right (RTL) */}
      <aside
        className={cn(
          'md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">Pacific Travel</div>
              <div className="text-xs text-slate-400">CRM System</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="סגור תפריט"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agent info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
              רי
            </div>
            <div>
              <div className="text-sm font-medium">רינה כהן</div>
              <div className="text-xs text-slate-400">סוכן נסיעות</div>
            </div>
            <div className="mr-auto w-2 h-2 bg-green-400 rounded-full" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
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
                {item.href === '/leads' && (
                  <span className={cn(
                    'mr-auto text-xs px-1.5 py-0.5 rounded-full',
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                  )}>6</span>
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
