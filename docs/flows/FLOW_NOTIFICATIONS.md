# FLOW_NOTIFICATIONS.md — התראות

## סיכום
מערכת התראות real-time עם כפתורי פעולה ייעודיים לכל סוג. כולל התראות ידניות (מהמערכת), אוטומטיות (מ-leads), ותגובות מהירות (אישור משתמש, מעבר לליד).

## תפקיד מקצועי
**Notification System Architect + UX Designer**

## ישויות מעורבות
- **DB:** `notifications`, `profiles`, `leads`, `documents`
- **Lib:** `lib/notifications.ts`
- **Page:** `/notifications`
- **Sidebar/MobileNav:** badge עם unread count

---

## סוגי התראות

| type | מי מקבל | טריגר | פעולה |
|------|---------|--------|-------|
| `new_user_pending` | admin/developer | הרשמה חדשה | [אשר] [דחה] |
| `user_approved` | agent | אישור חשבון | info |
| `lead_created` | agent | ליד חדש | [פתח ליד] |
| `lead_status_change` | agent | שינוי סטטוס | [פתח ליד] |
| `payment_due` | agent | תשלום ממתין | [פתח ליד] |
| `payment_received` | agent | תשלום התקבל | [פתח ליד] |
| `document_expiring` | agent | מסמך פג תוקף ב-30 יום | [צפה במסמכים] |
| `flight_tomorrow` | agent | יציאה מחר | [פתח ליד] |
| `customer_returned` | agent | לקוח חזר | [פתח ליד] |
| `system_alert` | כולם | שגיאות מערכת | info |
| `message` | agent | הודעה ישירה | info |

---

## תרשים זרימה ראשי

```
/notifications
     │
  useEffect → init()
     │
  ┌──┴───────────────────────────────────────────┐
  │  1. getUser() → profile.role                 │
  │  2. generateProactiveNotifications(userId)   │
  │  3. getNotifications() → DB query            │
  └──────────────────────────────────────────────┘
     │
  ┌──────────────────────────────────────────────┐
  │              Filter Tabs                     │
  │  [הכל (N)] [לא נקראו (X)] [דורשות פעולה (Y)]│
  └──────────────────────────────────────────────┘
     │
  ┌──────────────────────────────────────────────┐
  │  "דורשות פעולה" section (unread action items)│
  │     ↓ NotifCard עם כפתורי פעולה             │
  ├──────────────────────────────────────────────┤
  │  שאר ההתראות                               │
  └──────────────────────────────────────────────┘
```

---

## Flow: אישור משתמש מתוך התראה

```
NotifCard(type='new_user_pending')
  כפתור [אשר משתמש]
     │
  supabase.profiles.update({
    status: 'approved', role: 'agent'
  }).eq('id', data.userId)
     │
  /api/email/send → Resend
  { type: 'user_approved', to: userEmail }
     │
  markAsRead(notifId)
  remove from list
```

---

## Flow: יצירת התראות אוטומטיות

```
generateProactiveNotifications(userId)
     │
  getLeads(agent_id=userId) → כל לידי הסוכן
     │
  ┌──────────────────────────────────────────┐
  │  לכל ליד:                               │
  │  ├── departure_date = מחר?              │
  │  │   → check existing (last 24h)        │
  │  │   → INSERT notification 'flight_tomorrow'
  │  │                                      │
  │  └── return_date ≤ היום ≤ +2 days       │
  │      AND status = 'flying'?             │
  │      → check existing (last 3 days)    │
  │      → INSERT 'customer_returned'       │
  └──────────────────────────────────────────┘
     │
  documents expiring in 30 days:
  supabase.from('documents')
    .lte('expiry_date', +30days)
    .gte('expiry_date', today)
  → check existing (last 7 days)
  → INSERT 'document_expiring'
```

---

## מידע עובר (Notification Data Model)

```typescript
interface Notification {
  id: string
  user_id: string           // מי מקבל
  type: string              // סוג (ראה טבלה)
  title: string             // כותרת
  body?: string             // תוכן
  is_read: boolean
  created_at: string
  data?: {
    leadId?: string         // לניווט לליד
    userId?: string         // לאישור משתמש
    userEmail?: string
    userName?: string
    docId?: string          // למסמכים
  }
}
```

---

## Sidebar Badge Flow

```
Sidebar + MobileNav
  │
  useEffect + setInterval(30s)
  │
  getUnreadCount() → supabase.count(is_read=false)
  │
  badge מוצג אם count > 0
```

---

## Edge Cases

| מצב | טיפול |
|-----|-------|
| אישור משתמש שכבר אושר | supabase UPDATE — לא נכשל |
| התראה אוטומטית כפולה | בדיקת existing בטרם INSERT |
| מחיקת התראה | supabase.delete + remove from state |
| Resend נכשל | console.warn — לא מפסיק flow |

---

## קבצים מושפעים
- `app/notifications/page.tsx`
- `lib/notifications.ts`
- `components/Sidebar.tsx` (unread badge)
- `components/MobileNav.tsx` (unread badge)
