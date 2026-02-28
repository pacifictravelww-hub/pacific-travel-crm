# FLOW_EMAIL.md — מיילים אוטומטיים

## סיכום
כל המיילים היוצאים מהמערכת — אישור הרשמה, אישור חשבון, איפוס סיסמה. שרת-צד בלבד דרך Resend API. תבנית מאוחדת עם banner + branding.

## תפקיד מקצועי
**Email Infrastructure Engineer**

## ישויות מעורבות
- **API Route:** `app/api/email/send/route.ts`
- **Lib:** `lib/emailTemplate.ts`, `lib/email.ts`
- **External:** Resend API (`re_Njd5ycVF_8HD4jaZrAs2pHe1Qqgco8ioE`)
- **Supabase:** Auth email templates (recovery)

---

## מיילים ומי שולח אותם

| type | מי שולח | מתי | נמען |
|------|---------|-----|------|
| `new_user_pending` | pending-approval page | משתמש מגיע לעמוד | admins |
| `user_approved` | settings (approve) / notifications (approve) | אדמין לוחץ "אשר" | המשתמש שאושר |
| `verify_email` | (עתידי) | הרשמה | המשתמש |
| Supabase Recovery | Supabase (template מותאמת) | איפוס סיסמה | המשתמש |

---

## תרשים זרימה: POST /api/email/send

```
Client (browser) → POST /api/email/send
{
  type: 'new_user_pending' | 'user_approved' | 'verify_email',
  to: string | string[],
  data: { userName, userEmail, userPhone?, approveUrl?, loginUrl?, confirmUrl? }
}
     │
route.ts:
  resend.emails.send({
    from: 'Pacific Travel CRM <onboarding@resend.dev>',
    to: [...],
    subject: ...,
    html: emailLayout(content, previewText)
  })
     │
  ┌──┴──┐
success  error
  │        │
{ id, ok } { error: msg }
  HTTP 200   HTTP 500
```

---

## תבנית מייל (emailTemplate.ts)

```
emailLayout(content, previewText):
  ├── banner image (banner-app.jpg) → 600px, 180px height
  ├── gradient overlay
  ├── logo badge "✈️ Pacific Travel CRM"
  ├── content (HTML)
  └── footer: pacific-travel.vercel.app

primitives:
  emailHeading(text) → <h1>
  emailSubheading(text) → <p>
  emailInfoCard([{label,value}]) → table
  emailButton(text, url) → gradient CTA
  emailStepList([{text,done,active}]) → visual steps
```

---

## Supabase Recovery Email

```
Subject: "🔑 איפוס סיסמה — Pacific Travel CRM"
Template: mailer_templates_recovery_content (HTML)
Variable: {{ .ConfirmationURL }} → /reset-password

מוגדר ב: Supabase Management API
  PATCH /v1/projects/{ref}/config/auth
  mailer_subjects_recovery + mailer_templates_recovery_content
```

---

## מגבלות נוכחיות

```
⚠️ Resend בmode בדיקות:
  - שולח רק ל: pacific.travel.ww@gmail.com
  - כדי לשלוח לכולם: אמת דומיין ב- resend.com/domains
  - FROM כרגע: onboarding@resend.dev
  - אחרי אימות: noreply@pacifictravel.co.il
```

---

## קבצים מושפעים
- `app/api/email/send/route.ts`
- `lib/emailTemplate.ts`
- `lib/email.ts`
