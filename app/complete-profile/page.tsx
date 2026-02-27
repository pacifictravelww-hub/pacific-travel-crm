'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { notifyAdmins } from '@/lib/notifications';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'agent' | 'customer'>('agent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setFullName(user.user_metadata.full_name);
      }
    });
  }, []);

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
        role,
        status: 'pending',
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    // Notify all admins
    await notifyAdmins(
      'new_user_pending',
      'משתמש חדש ממתין לאישור',
      `${fullName} (${user.email}) נרשם כ${role === 'agent' ? 'סוכן נסיעות' : 'לקוח'} וממתין לאישור`,
      { userId: user.id, userName: fullName, userEmail: user.email, userRole: role }
    );

    router.push('/pending-approval');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">השלמת פרופיל</h1>
          <p className="text-slate-400 text-sm mt-1">ספר לנו עוד קצת</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-lg">פרטים אישיים</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-300 text-sm">שם מלא</Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  required
                  className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">טלפון</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="050-0000000"
                  className="mt-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="text-slate-300 text-sm">סוג משתמש</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      role === 'agent'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    סוכן נסיעות
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      role === 'customer'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    לקוח
                  </button>
                </div>
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
                שמור והמשך
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
