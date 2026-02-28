import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, userEmail } = await req.json();
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 });
    }

    // Check if notification already exists for this user (avoid duplicates)
    const { data: existing } = await serviceSupabase
      .from('notifications')
      .select('id')
      .eq('type', 'new_user_pending')
      .contains('data', { userId })
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Get all active admins/developers
    const { data: admins, error: adminError } = await serviceSupabase
      .from('profiles')
      .select('id, email')
      .in('role', ['admin', 'developer'])
      .eq('is_active', true);

    if (adminError || !admins?.length) {
      return NextResponse.json({ ok: true, count: 0 });
    }

    const name = userName || userEmail;

    // Insert notification for each admin using service role (bypasses RLS)
    const inserts = admins.map((admin: { id: string }) =>
      serviceSupabase.from('notifications').insert({
        user_id: admin.id,
        type: 'new_user_pending',
        title: 'משתמש חדש ממתין לאישור',
        body: `${name} (${userEmail}) נרשם וממתין לאישור`,
        data: { userId, userName: name, userEmail },
      })
    );

    await Promise.all(inserts);

    return NextResponse.json({ ok: true, count: admins.length });
  } catch (err) {
    console.error('notify-admins error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
