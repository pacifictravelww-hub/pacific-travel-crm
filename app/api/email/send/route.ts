import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO: Replace with verified domain email once pacifictravel.co.il is verified in Resend
const FROM = 'Pacific Travel CRM <onboarding@resend.dev>';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, to, data } = body;

    let subject = '';
    let html = '';

    if (type === 'new_user_pending') {
      // Email to admin(s): new user waiting for approval
      subject = `משתמש חדש ממתין לאישור — ${data.userName}`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 12px; padding: 12px 20px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">✈️ Pacific Travel CRM</span>
            </div>
          </div>
          <h2 style="color: #f8fafc; font-size: 22px; margin-bottom: 8px;">משתמש חדש ממתין לאישור</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">הצטרף משתמש חדש וממתין לאישורך:</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px;"><strong style="color: #93c5fd;">שם:</strong> <span style="color: #e2e8f0;">${data.userName}</span></p>
            <p style="margin: 0 0 8px;"><strong style="color: #93c5fd;">אימייל:</strong> <span style="color: #e2e8f0;">${data.userEmail}</span></p>
            ${data.userPhone ? `<p style="margin: 0;"><strong style="color: #93c5fd;">טלפון:</strong> <span style="color: #e2e8f0;">${data.userPhone}</span></p>` : ''}
          </div>
          <div style="text-align: center;">
            <a href="${data.approveUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px;">
              אשר משתמש ←
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 32px;">Pacific Travel WW · CRM System</p>
        </div>
      `;
    } else if (type === 'user_approved') {
      // Email to user: you've been approved
      subject = `🎉 הגישה שלך אושרה — Pacific Travel CRM`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 12px; padding: 12px 20px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">✈️ Pacific Travel CRM</span>
            </div>
          </div>
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1)); border: 2px solid rgba(34,197,94,0.4); border-radius: 50%; line-height: 72px; font-size: 32px;">✅</div>
          </div>
          <h2 style="color: #f8fafc; font-size: 24px; text-align: center; margin-bottom: 8px;">ברוך הבא, ${data.userName}! 🎉</h2>
          <p style="color: #94a3b8; text-align: center; margin-bottom: 32px;">הגישה שלך למערכת אושרה. אתה יכול להתחבר עכשיו.</p>
          <div style="text-align: center;">
            <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px;">
              כניסה למערכת ←
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 32px;">Pacific Travel WW · CRM System</p>
        </div>
      `;
    } else if (type === 'welcome_verify') {
      // Email confirmation (fallback / custom)
      subject = `אמת את כתובת האימייל שלך — Pacific Travel`;
      html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); border-radius: 12px; padding: 12px 20px;">
              <span style="color: white; font-size: 20px; font-weight: bold;">✈️ Pacific Travel CRM</span>
            </div>
          </div>
          <h2 style="color: #f8fafc; font-size: 22px; text-align: center; margin-bottom: 8px;">אמת את האימייל שלך</h2>
          <p style="color: #94a3b8; text-align: center; margin-bottom: 32px;">לחץ על הכפתור כדי לאשר את כתובת האימייל שלך ולהמשיך בהרשמה.</p>
          <div style="text-align: center;">
            <a href="${data.confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; font-size: 15px;">
              אמת אימייל ←
            </a>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 32px;">Pacific Travel WW · CRM System</p>
        </div>
      `;
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
