'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signInWithGoogle } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Pacific Travel</h1>
          <p className="text-slate-400 text-sm mt-1">מערכת ניהול לקוחות</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-lg">כניסה למערכת</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300 text-sm">אימייל</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">סיסמה</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                התחבר
              </Button>
            </form>

            <div className="mt-4">
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs">או</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                התחבר עם Google
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              אין גישה? צרו קשר עם מנהל המערכת
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
