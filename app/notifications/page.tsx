'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, User, CreditCard, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/lib/notifications';
import { cn } from '@/lib/utils';

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  new_user_pending: { icon: <User className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-400' },
  lead_status_change: { icon: <Activity className="w-4 h-4" />, color: 'bg-green-500/20 text-green-400' },
  payment_due: { icon: <CreditCard className="w-4 h-4" />, color: 'bg-yellow-500/20 text-yellow-400' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">התראות</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500">{unreadCount} לא נקראות</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} className="gap-2">
            <CheckCheck className="w-4 h-4" />
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">טוען...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400">אין התראות</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => {
            const config = typeConfig[notification.type] ?? typeConfig.lead_status_change;
            return (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                  notification.is_read
                    ? 'bg-white border-slate-200'
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                )}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', config.color)}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', notification.is_read ? 'text-slate-700' : 'text-slate-900')}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-xs text-slate-500 mt-0.5">{notification.body}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{formatDate(notification.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
