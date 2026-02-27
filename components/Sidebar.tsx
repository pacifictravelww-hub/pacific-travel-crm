'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
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
    <aside
      className="w-64 bg-black text-white flex flex-col min-h-screen shrink-0"
      style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 40px,
          rgba(255,255,255,0.02) 40px,
          rgba(255,255,255,0.02) 41px
        )`,
        borderLeft: '4px solid #000',
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b-4 border-white">
        <div
          className="font-playfair text-2xl font-bold tracking-[0.2em] text-white uppercase"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          PACIFIC
        </div>
        <div className="font-mono text-xs tracking-widest text-muted-400 mt-1 uppercase">
          Travel CRM
        </div>
      </div>

      {/* Agent info */}
      <div className="p-4 border-b border-muted-800">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 border border-white flex items-center justify-center text-xs font-bold text-white"
            style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
          >
            רי
          </div>
          <div>
            <div
              className="text-sm font-medium text-white"
              style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
            >
              רינה כהן
            </div>
            <div className="text-xs text-muted-500 font-mono tracking-widest uppercase">Agent</div>
          </div>
          <div className="mr-auto w-2 h-2 bg-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-px">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-all duration-100 border border-transparent',
                isActive
                  ? 'bg-white text-black'
                  : 'text-muted-400 hover:bg-white hover:text-black'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span style={{ fontFamily: 'var(--font-source-serif), serif' }}>{item.label}</span>
              {item.href === '/leads' && (
                <span className={cn(
                  'mr-auto text-xs px-1.5 py-0.5 border font-mono',
                  isActive ? 'border-black text-black bg-white' : 'border-muted-600 text-muted-400'
                )}>6</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t-4 border-muted-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase text-muted-500 hover:bg-white hover:text-black transition-all duration-100"
        >
          <Settings className="w-4 h-4" />
          <span>הגדרות</span>
        </Link>
      </div>
    </aside>
  );
}
