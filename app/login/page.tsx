'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Loader2, AlertCircle, Lock, Mail } from 'lucide-react';
import { signIn, signInWithGoogle } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('אימייל או סיסמה שגויים. אנא נסה שוב.');
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">

      {/* === Hero Panel (right on RTL = right side visually) === */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden flex-col items-center justify-end">
        {/* Banner image */}
        <Image
          src="/banner-hero.jpg"
          alt="Pacific Travel"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.92) 0%, rgba(5,10,30,0.3) 50%, rgba(5,10,30,0.15) 100%)' }} />


      </div>

      {/* === Form Panel === */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>

        {/* Subtle glow behind form */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.07), transparent 70%)' }} />

        {/* Mobile hero banner (shown only on mobile) */}
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

          {/* Card */}
          <div className="rounded-3xl p-7"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
            }}>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? 'מתחבר...' : 'כניסה למערכת'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <span className="text-slate-600 text-xs">או</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium text-sm transition-all duration-200"
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
              התחבר עם Google
            </button>

            <p className="text-center text-xs text-slate-500 mt-5">
              אין לך חשבון?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">הירשם כאן</Link>
            </p>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6">Pacific Travel WW · CRM System</p>
        </div>
      </div>
    </div>
  );
}
