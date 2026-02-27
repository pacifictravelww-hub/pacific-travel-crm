'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/auth';

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

            <p className="text-center text-xs text-slate-500 mt-4">
              אין גישה? צרו קשר עם מנהל המערכת
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
