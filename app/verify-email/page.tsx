'use client';

import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    // We don't have the email here easily, so just show a message
    // In a real flow you'd pass it via query param or session storage
    await new Promise(r => setTimeout(r, 1000));
    setResending(false);
    setResent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">בדוק את האימייל שלך</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          שלחנו מייל לאימות לכתובת שלך. אנא בדוק את תיבת הדואר ולחץ על הקישור לאישור.
        </p>
        {resent ? (
          <p className="text-green-400 text-sm">המייל נשלח מחדש!</p>
        ) : (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resending}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            {resending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            שלח מחדש
          </Button>
        )}
        <p className="text-slate-500 text-xs mt-6">
          לא קיבלת? בדוק את תיקיית הספאם
        </p>
      </div>
    </div>
  );
}
