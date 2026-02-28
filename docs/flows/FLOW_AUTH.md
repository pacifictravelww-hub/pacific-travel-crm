# FLOW_AUTH.md — אימות משתמשים

## סיכום
כל תהליכי הכניסה, ההרשמה, אימות המייל, השלמת פרופיל, המתנה לאישור, ואיפוס סיסמה. זהו שער הכניסה למערכת — כל משתמש חייב לעבור דרכו.

## תפקיד מקצועי
**Security Engineer + UX Designer** — תהליך onboarding מאובטח עם UX נקי.

## ישויות מעורבות
- **DB:** `auth.users` (Supabase), `public.profiles`
- **Components:** `AppShell.tsx`, `AuthGuard.tsx`
- **Lib:** `lib/auth.ts`, `lib/supabase.ts`, `lib/email.ts`
- **API:** `/api/email/send`
- **Pages:** `/login`, `/register`, `/complete-profile`, `/pending-approval`, `/reset-password`, `/verify-email`
- **External:** Supabase Auth, Google OAuth, Resend

---

## תרשים זרימה ראשי

```
משתמש חדש                           משתמש קיים
     │                                    │
     ▼                                    ▼
/register                            /login
     │                                    │
     ├─── אימייל+סיסמה                   ├─── אימייל+סיסמה
     │         │                          │         │
     │    supabase.auth.signUp()          │    signIn(email, password)
     │         │                          │         │
     │    [auto-confirm=OFF]              │    supabase.auth.signInWithPassword()
     │         │                          │         │
     │    מסך "בדוק אימייל"              │    ◄── JWT session token
     │         │                          │         │
     │    לינק במייל (Supabase)           │    AppShell.getSession()
     │         │                          │         │
     │    emailRedirectTo:                │    profiles.select(status)
     │    /complete-profile              │         │
     │         │                          │    ┌────┴────────────┐
     ├─── Google OAuth                   │  approved        pending/suspended
     │         │                          │    │                  │
     │    signInWithOAuth(Google)         │    ▼                  ▼
     │    redirectTo: /complete-profile  │   /app            /pending-approval
     │         │                          │
     └─────────┘
               │
               ▼
        /complete-profile
               │
     ┌─────────┴──────────┐
  יש פרופיל?            אין פרופיל?
     │                    │
  (trigger יצר)    supabase.profiles.upsert({
     │               full_name, phone,
     │               role:'agent',
     │               status:'pending'
     │             })
     └────────┬───────────┘
              │
    notifyAdmins() — in-app notification
    sendNewUserPendingEmail() → /api/email/send → Resend
              │
              ▼
       /pending-approval
              │
    generateProactiveNotifications()
    poll כל 10s: profiles.select(status)
              │
        ┌─────┴──────┐
     approved      rejected
        │              │
       /app         signOut() → /login
```

---

## AppShell Auth Guard Flow

```
כל עמוד שאינו PUBLIC_PATH
           │
    AppShell.useEffect()
           │
    supabase.auth.getSession()
           │
    ┌──────┴──────────────┐
  אין session           יש session
    │                    │
    ▼              profiles.select(status)
/login                  │
              ┌──────────┼──────────┬─────────────┐
           no profile  pending  suspended       approved
              │           │         │               │
      /complete-profile  /pending  signOut()     setChecking(false)
                         -approval  /login       → render page
```

---

## Flow: איפוס סיסמה

```
/settings (admin לוחץ "שלח איפוס")
           │
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: origin + '/reset-password'
    })
           │
    Supabase שולח מייל (תבנית מותאמת)
    Subject: "🔑 איפוס סיסמה — Pacific Travel CRM"
           │
    משתמש לוחץ בלינק
           │
    /reset-password
           │
    onAuthStateChange('PASSWORD_RECOVERY')
    setSessionReady(true)
           │
    supabase.auth.updateUser({ password })
           │
    redirect → /
```

---

## מידע עובר (Data Models)

### profiles table
```typescript
{
  id: string           // = auth.users.id (UUID)
  email: string
  full_name: string
  role: 'developer' | 'admin' | 'agent' | 'customer'
  status: 'pending' | 'approved' | 'suspended'
  is_active: boolean
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
```

### DB Trigger: handle_new_user
```sql
-- מופעל על auth.users INSERT
INSERT INTO profiles (id, email, full_name, role, status, is_active, created_at, updated_at)
VALUES (new.id, new.email, COALESCE(full_name_from_meta, email_prefix),
        'agent', 'pending', true, now(), now())
ON CONFLICT (id) DO NOTHING
```

---

## הרשאות לפי Role

| Role | יכול לגשת ל... |
|------|---------------|
| developer | הכל + מחיקת משתמשים |
| admin | הכל חוץ ממחיקת משתמשים |
| agent | לידים שלו + לקוחות + מסמכים + דוחות |
| customer | (לא ממומש עדיין) |

---

## PUBLIC_PATHS (ללא auth guard)
```
/login, /register, /verify-email, /complete-profile, /pending-approval, /reset-password
```

---

## Edge Cases + שגיאות

| מצב | טיפול |
|-----|-------|
| Google OAuth — משתמש קיים | עדכון session, redirect לפי status |
| trigger נכשל | profiles ריק → AppShell → /complete-profile |
| סיסמה פגה / session פגה | signOut → /login |
| status=suspended | signOut → /login?error=suspended |
| Resend מוגבל (testing) | שגיאה console.warn — לא נכשל התהליך |

---

## קבצים מושפעים
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/complete-profile/page.tsx`
- `app/pending-approval/page.tsx`
- `app/reset-password/page.tsx`
- `components/AppShell.tsx`
- `lib/auth.ts`
- `lib/email.ts`
- `app/api/email/send/route.ts`
- `lib/emailTemplate.ts`
