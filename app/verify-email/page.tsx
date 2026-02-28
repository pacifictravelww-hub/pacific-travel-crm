'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, ArrowRight, CheckCircle2, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResent(true);
    setCountdown(60);
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.max(2, b.length)) + c)
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              top: `${15 + i * 14}%`,
              left: `${10 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }} />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                  border: '2px solid rgba(59,130,246,0.4)',
                  boxShadow: '0 0 40px rgba(59,130,246,0.2)'
                }}>
                <Mail className="w-10 h-10 text-blue-400" />
              </div>
              {/* Success badge */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                style={{ boxShadow: '0 0 16px rgba(34,197,94,0.5)' }}>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">בדוק את האימייל שלך</h1>
          <p className="text-blue-300/80 text-sm mb-6">המייל בדרך אליך ✈️</p>

          {/* Email address box */}
          {email && (
            <div className="mb-6 mx-auto px-5 py-3 rounded-2xl inline-flex items-center gap-3"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)'
              }}>
              <Inbox className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-blue-200 text-sm font-medium ltr">{email}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-slate-300 leading-relaxed mb-8 text-sm">
            שלחנו לינק אימות לכתובת זו.<br />
            לחץ על הקישור במייל כדי להמשיך.
          </p>

          {/* Steps */}
          <div className="mb-8 space-y-3 text-right">
            {[
              { num: '1', text: 'פתח את תיבת הדואר שלך', color: 'text-blue-400' },
              { num: '2', text: 'חפש מייל מ-Pacific Travel CRM', color: 'text-purple-400' },
              { num: '3', text: 'לחץ על "אמת כתובת אימייל"', color: 'text-green-400' },
            ].map(step => (
              <div key={step.num} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.color}`}
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {step.num}
                </div>
                <span className="text-slate-300 text-sm">{step.text}</span>
              </div>
            ))}
          </div>

          {/* Resend button */}
          <div className="flex flex-col items-center gap-3">
            {resent ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>המייל נשלח מחדש!</span>
                {countdown > 0 && <span className="text-slate-400">({countdown}s)</span>}
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || !email || countdown > 0}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                style={{
                  background: resending ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#93c5fd',
                  cursor: resending ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={e => !resending && ((e.currentTarget.style.background = 'rgba(59,130,246,0.3)'))}
                onMouseLeave={e => !resending && ((e.currentTarget.style.background = 'rgba(59,130,246,0.15)'))}
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'שולח...' : countdown > 0 ? `שלח מחדש (${countdown}s)` : 'שלח מחדש'}
              </button>
            )}

            <p className="text-slate-500 text-xs">לא קיבלת? בדוק את תיקיית הספאם</p>
          </div>

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link href="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowRight className="w-4 h-4" />
              חזרה להתחברות
            </Link>
          </div>
        </div>

        {/* Pacific Travel branding */}
        <div className="text-center mt-6">
          <p className="text-slate-600 text-xs">Pacific Travel WW · CRM System</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
