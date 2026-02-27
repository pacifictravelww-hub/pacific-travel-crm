'use client';

import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">ממתין לאישור</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          החשבון שלך ממתין לאישור מנהל. תקבל הודעה כשיאושר.
        </p>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-slate-600 text-slate-300 hover:bg-slate-800 gap-2"
        >
          <LogOut className="w-4 h-4" />
          התנתק
        </Button>
      </div>
    </div>
  );
}
