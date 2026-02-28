'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plane, Loader2, AlertCircle, User, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notifyAdmins } from '@/lib/notifications';
import { sendNewUserPendingEmail } from '@/lib/email';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUserEmail(user.email || '');
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('לא נמצא משתמש מחובר');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone,
        role: 'agent',
        status: 'pending',
        is_active: true,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    // In-app notification to admins
    await notifyAdmins(
      'new_user_pending',
      'משתמש חדש ממתין לאישור',
      `${fullName} (${user.email}) נרשם וממתין לאישור`,
      { userId: user.id, userName: fullName, userEmail: user.email }
    );

    // Email notification to admins
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('email')
        .in('role', ['admin', 'developer'])
        .eq('is_active', true);

      if (admins && admins.length > 0) {
        const adminEmails = admins.map((a: { email: string }) => a.email).filter(Boolean);
        await sendNewUserPendingEmail({
          adminEmails,
          userName: fullName,
          userEmail: user.email || '',
          userPhone: phone,
        });
      }
    } catch (emailErr) {
      // Non-critical — don't fail the flow
      console.warn('Admin email notification failed:', emailErr);
    }

    router.push('/pending-approval');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">

      {/* === Hero Panel === */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden flex-col items-center justify-end">
        <Image src="/banner.jpg" alt="Pacific Travel" fill className="object-cover" priority />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.92) 0%, rgba(5,10,30,0.3) 50%, rgba(5,10,30,0.15) 100%)' }} />
        <div className="relative z-10 p-12 w-full text-right">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Pacific Travel</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            עוד צעד אחד<br />ואתה בפנים
          </h2>
          <p className="text-blue-200/70 text-lg max-w-sm">
            מלא את הפרטים האישיים שלך כדי שהמנהל יוכל לאשר את הגישה שלך.
          </p>
        </div>
      </div>

      {/* === Form Panel === */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07), transparent 70%)' }} />

        {/* Mobile banner */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-48 overflow-hidden">
          <Image src="/banner.jpg" alt="Pacific Travel" fill className="object-cover object-center" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,1) 100%)' }} />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Pacific Travel</span>
          </div>
        </div>

        <div className="relative w-full max-w-sm mt-40 md:mt-0">
          <div className="mb-8 text-right">
            <h1 className="text-2xl font-bold text-white mb-1">השלמת פרופיל</h1>
            <p className="text-slate-400 text-sm">
              {userEmail ? <span>מחובר כ-<span dir="ltr" className="text-blue-400">{userEmail}</span></span> : 'ספר לנו עוד קצת עליך'}
            </p>
          </div>

          <div className="rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">שם מלא *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="ישראל ישראלי" required dir="rtl"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">טלפון</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="050-0000000" dir="ltr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm py-3 px-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'שומר...' : 'שמור והמשך →'}
              </button>
            </form>
          </div>
          <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW · CRM System</p>
        </div>
      </div>
    </div>
  );
}
