'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Loader2, AlertCircle, CheckCircle2, Plane } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery tokens in the URL hash — it handles them automatically
    // Just check that we have an active session (from the recovery link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check existing session (if user already clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/'), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">
      {/* Hero */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <Image src="/banner-hero.jpg" alt="Pacific Travel" fill className="object-cover" priority />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.85) 0%, rgba(5,10,30,0.2) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(10,15,30,1) 0%, rgba(15,26,56,0.8) 8%, transparent 35%)' }} />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07), transparent 70%)' }} />

        {/* Mobile banner */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-48 overflow-hidden">
          <Image src="/banner-hero.jpg" alt="Pacific Travel" fill className="object-cover object-center" priority />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,1) 100%)' }} />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Pacific Travel</span>
          </div>
        </div>

        <div className="relative w-full max-w-sm mt-40 md:mt-0">

          {success ? (
            /* Success state */
            <div className="rounded-3xl p-8 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.3)', boxShadow: '0 0 40px rgba(52,211,153,0.15)' }}>
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">הסיסמה עודכנה!</h1>
              <p className="text-slate-400 text-sm">מעביר אותך למערכת...</p>
            </div>
          ) : (
            /* Form */
            <>
              <div className="mb-8 text-right">
                <h1 className="text-2xl font-bold text-white mb-1">איפוס סיסמה</h1>
                <p className="text-slate-400 text-sm">בחר סיסמה חדשה לחשבונך</p>
              </div>

              <div className="rounded-3xl p-7"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>

                {!sessionReady && (
                  <div className="text-center py-4 mb-4">
                    <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      מאמת קישור...
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5 text-right">סיסמה חדשה</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" required dir="ltr"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-1.5 text-right">אימות סיסמה</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                        placeholder="••••••••" required dir="ltr"
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

                  <button type="submit" disabled={loading || !sessionReady}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'מעדכן...' : 'עדכן סיסמה'}
                  </button>
                </form>
              </div>
            </>
          )}

          <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW</p>
        </div>
      </div>
    </div>
  );
}
