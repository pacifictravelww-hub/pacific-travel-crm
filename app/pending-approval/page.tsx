'use client';

import { Clock, LogOut, Mail, CheckCircle2, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, full_name, phone')
        .eq('id', user.id)
        .single();

      if (profile?.status === 'approved') {
        router.push('/');
        return;
      }

      setUserName(profile?.full_name || user.email || '');

      // ── Send admin notification if not already sent ──────────────────
      // Check if a 'new_user_pending' notification already exists for this user
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'new_user_pending')
        .contains('data', { userId: user.id })
        .maybeSingle();

      if (!existingNotif) {
        // Notify admins in-app
        const { data: admins } = await supabase
          .from('profiles')
          .select('id, email')
          .in('role', ['admin', 'developer'])
          .eq('is_active', true);

        if (admins && admins.length > 0) {
          const name = profile?.full_name || user.email || 'משתמש חדש';

          // In-app notifications
          await Promise.all(
            admins.map((admin: { id: string; email: string }) =>
              supabase.from('notifications').insert({
                user_id: admin.id,
                type: 'new_user_pending',
                title: 'משתמש חדש ממתין לאישור',
                body: `${name} (${user.email}) נרשם וממתין לאישור`,
                data: { userId: user.id, userName: name, userEmail: user.email },
              })
            )
          );

          // Email notification
          const adminEmails = admins
            .map((a: { email: string }) => a.email)
            .filter(Boolean);

          if (adminEmails.length > 0) {
            try {
              await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'new_user_pending',
                  to: adminEmails,
                  data: {
                    userName: name,
                    userEmail: user.email,
                    userPhone: profile?.phone,
                    approveUrl: `${window.location.origin}/settings?tab=users`,
                  },
                }),
              });
            } catch (e) {
              console.warn('Admin email failed:', e);
            }
          }
        }
      }

      // ── Poll every 10s for approval ──────────────────────────────────
      pollInterval = setInterval(async () => {
        const { data: p } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();
        if (p?.status === 'approved') {
          router.push('/');
        }
      }, 10000);
    };

    init();
    return () => clearInterval(pollInterval);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f2044 40%, #1a0a2e 100%)' }}>

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, #f59e0b, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <div className="relative w-full max-w-md" dir="rtl">
        <div className="rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
          }}>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
                  border: '2px solid rgba(245,158,11,0.4)',
                  boxShadow: '0 0 40px rgba(245,158,11,0.2)'
                }}>
                <Clock className="w-10 h-10 text-amber-400" style={{ animation: 'float 3s ease-in-out infinite' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.5)' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">ממתין לאישור</h1>
          {userName && <p className="text-slate-300 text-sm mb-1">שלום, {userName} 👋</p>}
          <p className="text-amber-300/70 text-sm mb-6">הבקשה שלך בדרך למנהל 🛂</p>

          {email && (
            <div className="mb-6 px-4 py-3 rounded-2xl inline-flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200 text-sm" dir="ltr">{email}</span>
            </div>
          )}

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            החשבון שלך נוצר בהצלחה ומחכה לאישור מנהל.<br />
            הדף יתרענן אוטומטית כשתאושר.
          </p>

          {/* Steps */}
          <div className="space-y-3 mb-8 text-right">
            {[
              { icon: CheckCircle2, text: 'החשבון נוצר בהצלחה', done: true },
              { icon: CheckCircle2, text: 'המנהל קיבל התראה', done: true },
              { icon: Clock, text: 'ממתין לאישור מנהל', done: false, active: true },
              { icon: Shield, text: 'גישה מלאה למערכת', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: step.done ? 'rgba(34,197,94,0.08)' : step.active ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${step.done ? 'rgba(34,197,94,0.2)' : step.active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`
                }}>
                <step.icon className={`w-4 h-4 shrink-0 ${step.done ? 'text-green-400' : step.active ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={`text-sm ${step.done ? 'text-green-300' : step.active ? 'text-amber-300' : 'text-slate-400'}`}>{step.text}</span>
                {step.done && <span className="mr-auto text-xs text-green-500">✓</span>}
              </div>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW · CRM System</p>
      </div>
    </div>
  );
}
