'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell, CheckCheck, User, CreditCard, Activity, Plane,
  FileWarning, UserCheck, MessageSquare, AlertCircle,
  Loader2, X, ArrowLeft, RefreshCw, ShieldCheck, ShieldX,
  Clock, Star, TrendingUp, CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, Notification } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ── Notification type registry ────────────────────────────────────────────
type NotifConfig = {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  label: string;
};

const TYPE_CONFIG: Record<string, NotifConfig> = {
  new_user_pending:    { icon: User,         color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  label: 'משתמש חדש' },
  user_approved:       { icon: UserCheck,    color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  label: 'חשבון אושר' },
  lead_status_change:  { icon: Activity,     color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', label: 'שינוי סטטוס' },
  lead_created:        { icon: Star,         color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  label: 'ליד חדש' },
  payment_due:         { icon: CreditCard,   color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', label: 'תשלום ממתין' },
  payment_received:    { icon: TrendingUp,   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  label: 'תשלום התקבל' },
  document_expiring:   { icon: FileWarning,  color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)',  label: 'מסמך פג תוקף' },
  flight_tomorrow:     { icon: Plane,        color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.25)',  label: 'טיסה מחר' },
  customer_returned:   { icon: CalendarClock,color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', label: 'לקוח חזר' },
  system_alert:        { icon: AlertCircle,  color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', label: 'התראת מערכת' },
  message:             { icon: MessageSquare,color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  label: 'הודעה' },
};

const FALLBACK: NotifConfig = { icon: Bell, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', label: 'התראה' };

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'עכשיו';
  if (diff < 3600) return `לפני ${Math.floor(diff / 60)} דק׳`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שע׳`;
  if (diff < 604800) return `לפני ${Math.floor(diff / 86400)} ימים`;
  return new Date(dateStr).toLocaleDateString('he-IL');
}

// ── Action buttons per notification type ─────────────────────────────────
function NotifActions({ notif, userRole, onAction }: {
  notif: Notification;
  userRole: string;
  onAction: (notifId: string, result?: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const data = notif.data as Record<string, string> | null;

  const approveUser = async () => {
    if (!data?.userId) return;
    setLoading('approve');
    const { data: profile } = await supabase.from('profiles').select('email,full_name').eq('id', data.userId).single();
    await supabase.from('profiles').update({ status: 'approved', role: 'agent', updated_at: new Date().toISOString() }).eq('id', data.userId);
    // Send approval email
    if (profile?.email) {
      try {
        await fetch('/api/email/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'user_approved', to: profile.email, data: { userName: profile.full_name || profile.email, loginUrl: window.location.origin + '/login' } }),
        });
      } catch (e) { console.warn(e); }
    }
    setLoading(null);
    onAction(notif.id, 'approved');
  };

  const rejectUser = async () => {
    if (!data?.userId) return;
    setLoading('reject');
    await supabase.from('profiles').update({ status: 'suspended', updated_at: new Date().toISOString() }).eq('id', data.userId);
    setLoading(null);
    onAction(notif.id, 'rejected');
  };

  if (notif.type === 'new_user_pending' && (userRole === 'admin' || userRole === 'developer')) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <button onClick={approveUser} disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.25)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}>
          {loading === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
          אשר משתמש
        </button>
        <button onClick={rejectUser} disabled={!!loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}>
          {loading === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldX className="w-3 h-3" />}
          דחה
        </button>
        {data?.userEmail && (
          <span className="text-xs text-slate-500" dir="ltr">{data.userEmail}</span>
        )}
      </div>
    );
  }

  if ((notif.type === 'lead_status_change' || notif.type === 'lead_created' ||
       notif.type === 'payment_due' || notif.type === 'flight_tomorrow' ||
       notif.type === 'customer_returned') && data?.leadId) {
    return (
      <div className="mt-3">
        <button onClick={() => router.push(`/leads/detail?id=${data.leadId}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
          <ArrowLeft className="w-3 h-3" />
          פתח ליד
        </button>
      </div>
    );
  }

  if (notif.type === 'document_expiring' && data?.leadId) {
    return (
      <div className="mt-3">
        <button onClick={() => router.push(`/documents`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }}>
          <FileWarning className="w-3 h-3" />
          צפה במסמכים
        </button>
      </div>
    );
  }

  return null;
}

// ── Notification card ─────────────────────────────────────────────────────
function NotifCard({ notif, userRole, onRead, onDelete, onAction }: {
  notif: Notification; userRole: string;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, result?: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? FALLBACK;
  const Icon = cfg.icon;

  return (
    <div className={cn(
      'relative rounded-2xl p-4 transition-all duration-200 group',
      !notif.is_read && 'ring-1 ring-inset'
    )}
      style={{
        background: notif.is_read ? 'rgba(255,255,255,0.02)' : cfg.bg,
        border: `1px solid ${notif.is_read ? 'rgba(255,255,255,0.07)' : cfg.border}`,
        ...((!notif.is_read) ? { boxShadow: `0 4px 20px ${cfg.bg}` } : {}),
      }}>

      {/* Unread dot */}
      {!notif.is_read && (
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full animate-pulse"
          style={{ background: cfg.color }} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-2"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />{timeAgo(notif.created_at)}
              </span>
            </div>
          </div>

          <p className="text-sm font-semibold text-white mt-2">{notif.title}</p>
          {notif.body && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.body}</p>}

          {/* Actions */}
          <NotifActions notif={notif} userRole={userRole} onAction={onAction} />
        </div>

        {/* Dismiss buttons */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!notif.is_read && (
            <button onClick={() => onRead(notif.id)} title="סמן כנקרא"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
          <button onClick={() => onDelete(notif.id)} title="מחק"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auto-generate proactive notifications from leads ──────────────────────
async function generateProactiveNotifications(userId: string) {
  const { data: leads } = await supabase
    .from('leads')
    .select('id, full_name, departure_date, return_date, status')
    .eq('agent_id', userId);
  if (!leads) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const in30 = new Date();
  in30.setDate(in30.getDate() + 30);

  for (const lead of leads) {
    // Flight tomorrow
    if (lead.departure_date?.startsWith(tomorrowStr)) {
      const { data: existing } = await supabase.from('notifications')
        .select('id').eq('type', 'flight_tomorrow').contains('data', { leadId: lead.id })
        .eq('user_id', userId).gte('created_at', new Date(Date.now() - 86400000).toISOString())
        .maybeSingle();
      if (!existing) {
        await supabase.from('notifications').insert({
          user_id: userId, type: 'flight_tomorrow',
          title: `✈️ ${lead.full_name} טס מחר!`,
          body: 'וודא שכל המסמכים תקינים ושלח הודעת בהצלחה ללקוח',
          data: { leadId: lead.id },
        });
      }
    }

    // Customer returned (return_date was yesterday or today, status not 'returned')
    if (lead.return_date && lead.status === 'flying') {
      const returnDate = new Date(lead.return_date);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - returnDate.getTime()) / 86400000);
      if (diffDays >= 0 && diffDays <= 2) {
        const { data: existing } = await supabase.from('notifications')
          .select('id').eq('type', 'customer_returned').contains('data', { leadId: lead.id })
          .eq('user_id', userId).gte('created_at', new Date(Date.now() - 3 * 86400000).toISOString())
          .maybeSingle();
        if (!existing) {
          await supabase.from('notifications').insert({
            user_id: userId, type: 'customer_returned',
            title: `🏠 ${lead.full_name} חזר מהטיול`,
            body: 'זה הזמן לשלוח ברכה ולאסוף משוב — לקוחות מרוצים ממליצים!',
            data: { leadId: lead.id },
          });
        }
      }
    }
  }

  // Expiring documents (next 30 days)
  const { data: docs } = await supabase
    .from('documents')
    .select('id, type, expiry_date, lead_id')
    .lte('expiry_date', in30.toISOString().split('T')[0])
    .gte('expiry_date', new Date().toISOString().split('T')[0]);

  if (docs) {
    for (const doc of docs) {
      const { data: existing } = await supabase.from('notifications')
        .select('id').eq('type', 'document_expiring').contains('data', { docId: doc.id })
        .eq('user_id', userId).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .maybeSingle();
      if (!existing) {
        const daysLeft = Math.floor((new Date(doc.expiry_date).getTime() - Date.now()) / 86400000);
        await supabase.from('notifications').insert({
          user_id: userId, type: 'document_expiring',
          title: `⚠️ מסמך פג תוקף בעוד ${daysLeft} ימים`,
          body: `${doc.type} — יש לחדש בהקדם`,
          data: { docId: doc.id, leadId: doc.lead_id },
        });
      }
    }
  }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState('agent');
  const [filter, setFilter] = useState<'all' | 'unread' | 'action'>('all');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role) setUserRole(profile.role);
      await generateProactiveNotifications(user.id);
    }
    const data = await getNotifications();
    setNotifications(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleAction = (id: string, result?: string) => {
    if (result === 'approved' || result === 'rejected') {
      // Delete from DB so it doesn't reappear on refresh
      deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const ACTION_TYPES = ['new_user_pending', 'payment_due', 'flight_tomorrow', 'customer_returned', 'document_expiring'];
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'action') return ACTION_TYPES.includes(n.type);
    return true;
  });

  const unread = notifications.filter(n => !n.is_read).length;
  const actionNeeded = notifications.filter(n => ACTION_TYPES.includes(n.type) && !n.is_read).length;

  return (
    <div className="p-4 md:p-6 min-h-screen" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 60%, #0f0a20 100%)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            התראות
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {unread > 0 ? `${unread} לא נקראות` : 'הכל עדכני'}
            {actionNeeded > 0 && ` · ${actionNeeded} דורשות פעולה`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => load(true)} disabled={refreshing}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={cn('w-4 h-4 text-slate-400', refreshing && 'animate-spin')} />
          </button>
          {unread > 0 && (
            <button onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
              <CheckCheck className="w-4 h-4" />
              סמן הכל
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: `הכל (${notifications.length})` },
          { key: 'unread', label: `לא נקראו (${unread})` },
          { key: 'action', label: `דורשות פעולה (${notifications.filter(n => ACTION_TYPES.includes(n.type)).length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key as typeof filter)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={filter === tab.key
              ? { background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.35)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }
            }>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Bell className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg font-medium">אין התראות</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter === 'unread' ? 'כל ההתראות נקראו' :
             filter === 'action' ? 'אין פעולות ממתינות' : 'אין התראות עדיין'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {/* Action needed section */}
          {filter === 'all' && filtered.some(n => ACTION_TYPES.includes(n.type) && !n.is_read) && (
            <div className="mb-2">
              <p className="text-xs text-slate-500 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                דורשות פעולה
              </p>
              {filtered.filter(n => ACTION_TYPES.includes(n.type) && !n.is_read).map(n => (
                <div key={n.id} className="mb-3">
                  <NotifCard notif={n} userRole={userRole} onRead={handleRead} onDelete={handleDelete} onAction={handleAction} />
                </div>
              ))}
              <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <p className="text-xs text-slate-500 font-medium mb-2">שאר ההתראות</p>
            </div>
          )}

          {/* Main list (skip action items already shown above) */}
          {filtered
            .filter(n => filter !== 'all' || !(ACTION_TYPES.includes(n.type) && !n.is_read))
            .map(n => (
              <NotifCard key={n.id} notif={n} userRole={userRole}
                onRead={handleRead} onDelete={handleDelete} onAction={handleAction} />
            ))}
        </div>
      )}
    </div>
  );
}
