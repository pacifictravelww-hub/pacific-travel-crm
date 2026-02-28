'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plane, Loader2, AlertCircle, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/complete-profile`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Show "check your email" screen
    setEmailSent(true);
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/complete-profile`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  // ── Check email screen ──────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" dir="rtl"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08), transparent 70%)' }} />

        <div className="relative w-full max-w-sm text-center">
          <div className="rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4)'
            }}>

            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
                border: '2px solid rgba(34,197,94,0.35)',
                boxShadow: '0 0 40px rgba(34,197,94,0.15)'
              }}>
              <Mail className="w-9 h-9 text-emerald-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">בדוק את האימייל שלך</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              שלחנו לינק אימות ל-<br />
              <span className="text-blue-400 font-medium" dir="ltr">{email}</span><br />
              לחץ על הלינק כדי להמשיך
            </p>

            <div className="space-y-3 text-right mb-6">
              {[
                { text: 'החשבון נוצר בהצלחה', done: true },
                { text: 'ממתין לאימות אימייל', done: false, active: true },
                { text: 'השלמת פרטים אישיים', done: false },
                { text: 'אישור מנהל', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: step.done ? 'rgba(34,197,94,0.08)' : step.active ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${step.done ? 'rgba(34,197,94,0.2)' : step.active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)'}`
                  }}>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${step.done ? 'text-emerald-400' : step.active ? 'text-blue-400' : 'text-slate-600'}`} />
                  <span className={`text-sm ${step.done ? 'text-emerald-300' : step.active ? 'text-blue-300' : 'text-slate-500'}`}>{step.text}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-xs mb-4">לא קיבלת? בדוק ספאם, או:</p>
            <button
              onClick={() => setEmailSent(false)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              חזור ונסה שוב
            </button>
          </div>
          <p className="text-slate-700 text-xs mt-6">Pacific Travel WW</p>
        </div>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">

      {/* === Hero Panel === */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden flex-col items-center justify-end">
        <Image src="/banner-hero.jpg" alt="Pacific Travel" fill className="object-cover" priority />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.92) 0%, rgba(5,10,30,0.3) 50%, rgba(5,10,30,0.15) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(10,15,30,1) 0%, rgba(15,26,56,0.8) 8%, transparent 35%)' }} />
        <div className="relative z-10 p-12 w-full text-right">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}>
              <Plane className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Pacific Travel</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-3">
            הצטרף לצוות<br />Pacific Travel
          </h2>
          <p className="text-blue-200/70 text-lg max-w-sm">
            צור חשבון וקבל גישה לכלי הניהול המתקדמים ביותר לסוכני נסיעות.
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
          <Image src="/banner-hero.jpg" alt="Pacific Travel" fill className="object-cover object-center" priority />
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
            <h1 className="text-2xl font-bold text-white mb-1">יצירת חשבון</h1>
            <p className="text-slate-400 text-sm">מלא את הפרטים להתחלת הרשמה</p>
          </div>

          <div className="rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 mb-5"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#1f2937', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
              onMouseEnter={e => !googleLoading && (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              )}
              הירשם עם Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-slate-600 text-xs">או עם אימייל</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">שם מלא</label>
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
                <label className="block text-sm text-slate-300 mb-1.5 text-right">אימייל</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required dir="ltr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">סיסמה</label>
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
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
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

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'יוצר חשבון...' : 'הירשם'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-5">
              יש לך חשבון?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">התחבר כאן</Link>
            </p>
          </div>
          <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW</p>
        </div>
      </div>
    </div>
  );
}
