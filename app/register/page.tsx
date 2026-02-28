'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plane, Loader2, AlertCircle, User, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    router.push('/pending-approval');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">

      {/* === Hero Panel === */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden flex-col items-center justify-end">
        <Image
          src="/banner.jpg"
          alt="Pacific Travel"
          fill
          className="object-cover"
          priority
        />
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">שם מלא</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    required
                    dir="rtl"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">אימייל</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    dir="ltr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    dir="ltr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5 text-right">אימות סיסמה</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    dir="ltr"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm py-3 px-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'יוצר חשבון...' : 'הרשמה'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-5">
              יש לך חשבון?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">התחבר כאן</Link>
            </p>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW · CRM System</p>
        </div>
      </div>
    </div>
  );
}
