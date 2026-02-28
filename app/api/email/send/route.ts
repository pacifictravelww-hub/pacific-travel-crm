import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  emailLayout, emailHeading, emailSubheading,
  emailInfoCard, emailButton, emailStepList
} from '@/lib/emailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: Replace with verified domain once pacifictravel.co.il is verified in resend.com/domains
const FROM = 'Pacific Travel CRM <onboarding@resend.dev>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, data } = body;

    let subject = '';
    let html = '';

    // ── New user pending (to admins) ──────────────────────────────────────
    if (type === 'new_user_pending') {
      subject = `🔔 משתמש חדש ממתין לאישור — ${data.userName}`;

      const rows = [
        { label: '👤 שם', value: data.userName },
        { label: '📧 אימייל', value: data.userEmail },
        ...(data.userPhone ? [{ label: '📱 טלפון', value: data.userPhone }] : []),
      ];

      html = emailLayout(
        emailHeading('משתמש חדש ממתין לאישור') +
        emailSubheading('הצטרף משתמש חדש למערכת וממתין לאישורך.') +
        emailInfoCard(rows) +
        emailButton('אשר משתמש', data.approveUrl) +
        `<p style="color:#64748b;font-size:13px;text-align:center;margin-top:12px;">
          לחץ על הכפתור כדי לנהל משתמשים
        </p>`,
        `${data.userName} ממתין לאישור`
      );

    // ── User approved (to user) ───────────────────────────────────────────
    } else if (type === 'user_approved') {
      subject = `🎉 הגישה שלך אושרה — ברוך הבא ל-Pacific Travel!`;

      html = emailLayout(
        `<div style="text-align:center;margin-bottom:28px;">
          <div style="font-size:56px;margin-bottom:8px;">🎉</div>
          ${emailHeading(`ברוך הבא, ${data.userName}!`)}
          ${emailSubheading('הגישה שלך למערכת אושרה. אתה מוכן להתחבר ולהתחיל לעבוד.')}
        </div>` +
        emailStepList([
          { text: 'החשבון נוצר בהצלחה', done: true },
          { text: 'אימות אימייל', done: true },
          { text: 'אישור מנהל — הושלם!', done: true },
          { text: 'גישה מלאה למערכת', done: true },
        ]) +
        emailButton('כניסה למערכת', data.loginUrl),
        'הגישה שלך אושרה!'
      );

    // ── Email verification ─────────────────────────────────────────────────
    } else if (type === 'verify_email') {
      subject = `אמת את האימייל שלך — Pacific Travel`;

      html = emailLayout(
        `<div style="text-align:center;margin-bottom:28px;">
          <div style="font-size:48px;margin-bottom:12px;">📧</div>
          ${emailHeading('אמת את כתובת האימייל')}
          ${emailSubheading('לחץ על הכפתור כדי לאשר את כתובת האימייל שלך ולהמשיך בתהליך ההרשמה.')}
        </div>` +
        emailStepList([
          { text: 'יצירת חשבון', done: true },
          { text: 'אימות אימייל', done: false, active: true },
          { text: 'השלמת פרטים', done: false },
          { text: 'אישור מנהל', done: false },
        ]) +
        emailButton('אמת את האימייל שלי', data.confirmUrl) +
        `<p style="color:#64748b;font-size:12px;text-align:center;margin-top:16px;">
          הלינק תקף ל-24 שעות. אם לא ביקשת להירשם, אפשר להתעלם מהמייל הזה.
        </p>`,
        'אמת את האימייל שלך'
      );

    } else {
      return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: result?.id, ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
