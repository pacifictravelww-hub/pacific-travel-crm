# FLOW_CUSTOMER_PORTAL.md — פורטל לקוח

## סיכום
ממשק ייעודי ללקוחות (role='customer'). מציג רק את ההזמנות, המסמכים, התשלומים ופרטי הסוכן הקשורים אליהם. הלקוח לא רואה נתוני לקוחות אחרים, עמלות, או פרטים פנימיים.

## תפקיד מקצועי
**UX Product Designer + Customer Experience Specialist**

## ישויות מעורבות
- **DB:** `leads` (match by email/phone), `documents`, `profiles`
- **Pages:** `/customer-portal`
- **AppShell:** redirect ל-/customer-portal אם role='customer'

---

## ערך ללקוח
1. **הזמנות** — כל הנסיעות שלו + סטטוס
2. **מסמכים** — כרטיסים, וואוצ'רים, ויזות + תזכורת תוקף
3. **תשלומים** — מה שולם, מה נשאר
4. **הסוכן שלי** — פרטי קשר ישיר + WhatsApp
5. **חשוב לנסיעה** — checklist + מידע על היעד

---

## קבצים מושפעים
- `app/customer-portal/page.tsx`
- `components/AppShell.tsx` (redirect by role)
- `lib/leads.ts` (getLeadsByEmail)
