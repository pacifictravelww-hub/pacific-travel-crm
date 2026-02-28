# FLOW_SETTINGS.md — הגדרות וניהול משתמשים

## סיכום
4 טאבים: פרופיל אישי, הגדרות סוכנות, ניהול משתמשים, אישור בקשות. כולל העלאת אווטאר/לוגו, עריכת פרטים, ניהול הרשאות, איפוס סיסמה ומחיקת משתמשים.

## תפקיד מקצועי
**System Administrator + Full-Stack Developer**

## ישויות מעורבות
- **DB:** `profiles`, `auth.users`
- **Storage:** Supabase Storage bucket `avatars`
- **Lib:** `lib/profile.ts`, `lib/auth.ts`
- **Page:** `/settings` (Tabs: profile, agency, users, approvals)
- **External:** Resend (password reset email)

---

## תרשים טאבים

```
/settings
  │
  Tabs (dir="rtl"):
  ├── [פרופיל] → FLOW: עדכון פרופיל אישי
  ├── [סוכנות] → FLOW: הגדרות סוכנות + לוגו
  ├── [משתמשים] → FLOW: ניהול משתמשים
  └── [אישורים] → FLOW: אישור/דחיית בקשות
       (מוצג רק ל-admin/developer)
```

---

## Flow: עדכון פרופיל אישי

```
טאב "פרופיל"
     │
  load: supabase.profiles.select().eq('id', user.id)
     │
  ┌──────────────────────────────┐
  │  שדות: שם, טלפון, אימייל   │
  │  + העלאת אווטאר             │
  └──────────────────────────────┘
     │
  [שמור]
  supabase.profiles.update({full_name, phone, updated_at})
     │
  אווטאר:
  <label> + <input type="file" hidden>
  ↓ file selected
  supabase.storage.from('avatars').upload(
    `avatars/${user.id}.${ext}`,
    file, {upsert: true}
  )
  ↓
  getPublicUrl() → avatar_url
  ↓
  supabase.profiles.update({avatar_url})
  ↓
  localStorage.setItem('avatar_url', url)
  window.dispatchEvent(new Event('storage'))
  → Sidebar + MobileNav מתעדכנים
```

---

## Flow: הגדרות סוכנות + לוגו

```
טאב "סוכנות"
     │
  שדות: שם סוכנות, טלפון, כתובת, אימייל
     │
  לוגו:
  <label> + <input type="file" hidden>
  ↓
  supabase.storage.from('avatars').upload(
    'avatars/agency/logo.{ext}', file, {upsert: true}
  )
  ↓
  getPublicUrl() → logo_url
  ↓
  localStorage.setItem('agency_logo_url', url)
  window.dispatchEvent(new Event('storage'))
  → Sidebar + MobileNav מציגים לוגו חדש
```

---

## Flow: ניהול משתמשים

```
טאב "משתמשים" (admin/developer only - RoleGuard)
     │
  getAllProfiles() → supabase.profiles.select('*').order('created_at')
     │
  טבלת משתמשים:
  ├── שם | אימייל | תפקיד | סטטוס | פעיל
  ├── [✏️ עריכה] → Edit Modal
  ├── [🔑 איפוס סיסמה] → resetPasswordForEmail()
  ├── [❌ השבת] → deactivateUser() (admin+developer)
  └── [🗑️ מחק] → deleteUser() (developer ONLY)
     │
  Edit Modal:
  ├── full_name, phone
  ├── role (developer/admin/agent/customer)
  └── is_active toggle
  ↓
  supabase.profiles.update({...}).eq('id', userId)
     │
  [שלח איפוס סיסמה]:
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin + '/reset-password'
  })
  → מייל עם תבנית מותאמת (Resend subject: "🔑 איפוס סיסמה")
     │
  [מחיקה] (developer only):
  inline confirm: "בטוח? כן / לא"
  ↓ כן:
  supabase.profiles.delete().eq('id', userId)
  → reload users list
```

---

## Flow: אישור בקשות הרשמה

```
טאב "אישורים" (admin/developer only)
     │
  loadPendingUsers():
  supabase.profiles.select().eq('status','pending').order('created_at')
     │
  רשימת משתמשים ממתינים:
  כל שורה: שם | אימייל | תאריך | [אשר] [דחה]
     │
  [אשר]:
  handleApprove(userId, role)
  ├── profiles.select(email, full_name) ← של המשתמש
  ├── profiles.update({status:'approved', role, updated_at})
  └── /api/email/send → {type:'user_approved', to:email}
     │
  [דחה]:
  handleReject(userId)
  └── profiles.update({status:'suspended', updated_at})
     │
  הצגת הודעה: "המשתמש אושר ונשלח אליו אימייל!"
  loadPendingUsers() → refresh
```

---

## Storage: Supabase Bucket 'avatars'

```
bucket: avatars (public)
paths:
  avatars/{userId}.{ext}     ← אווטאר אישי
  avatars/agency/logo.{ext}  ← לוגו סוכנות

RLS Policies:
  INSERT: authenticated users only
  UPDATE: authenticated users only
  SELECT: public (everyone)
```

---

## הרשאות לפי Tab

| Tab | מי רואה |
|-----|---------|
| פרופיל | כולם |
| סוכנות | admin + developer |
| משתמשים | admin + developer |
| אישורים | admin + developer |
| מחיקת משתמש | developer בלבד |

---

## Edge Cases

| מצב | טיפול |
|-----|-------|
| לוגו לא נטען | fallback: אייקון Plane |
| avatar_url ישן | window focus → reload |
| password reset שגיאה | הצגת שגיאה inline |
| developer מוחק את עצמו | blocked: `u.id !== user?.id` |

---

## קבצים מושפעים
- `app/settings/page.tsx`
- `lib/profile.ts` (getAllProfiles, updateProfile, deactivateUser, deleteUser)
- `lib/auth.ts` (signOut, getUserRole)
- `components/Sidebar.tsx` (logo + avatar)
- `components/MobileNav.tsx` (logo + avatar)
