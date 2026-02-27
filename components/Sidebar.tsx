'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  Plane,
  MessageCircle,
  BarChart3,
  FileText,
  HelpCircle,
} from 'lucide-react';
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Pacific Travel</div>
            <div className="text-slate-400 text-xs">CRM System</div>
          </div>
        </div>
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

      {/* Settings */}
      <div className="p-4 border-t border-slate-700">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>הגדרות</span>
        </Link>
      </div>
    </aside>
  );
}
