# FLOW_CUSTOMERS.md — לקוחות

## סיכום
עמוד לקוחות מציג לידים שהגיעו לסטטוס "לקוח פעיל" (paid/flying/returned). מאגד לפי טלפון לזיהוי לקוחות חוזרים, KPIs, חיפוש וסינון.

## תפקיד מקצועי
**CRM Analyst + UX Designer** — תצוגה ממוקדת לקוח (לא ליד).

## ישויות מעורבות
- **DB:** `leads` (filtered by status)
- **Lib:** `lib/leads.ts`
- **Page:** `/customers`

---

## הגדרת "לקוח"

```
ליד הופך ללקוח כאשר status ∈ ['paid', 'flying', 'returned']
לקוח חוזר = אותו phone מופיע ב-2+ רשומות לקוח
```

---

## תרשים זרימה ראשי

```
/customers
     │
  useEffect → getLeads()
     │
  filter: leads.filter(l => ['paid','flying','returned'].includes(l.status))
     │
  group by phone:
  Map<phone, Lead[]>
     │
  ┌─────────────────────────────────────────────┐
  │                   KPI Bar                   │
  │  סה"כ לקוחות | לקוחות חוזרים | הכנסה כוללת │
  │  ממוצע עסקה  | טסים עכשיו                  │
  └─────────────────────────────────────────────┘
     │
  ┌──┴──────────────────┐
חיפוש (שם/טלפון)     סינון (סטטוס)
  │                    │
  └──────────┬──────────┘
             ▼
  רשימת לקוחות (כרטיסים)
  כל כרטיס מציג:
  ├── שם + טלפון
  ├── badge "לקוח חוזר" (אם visits > 1)
  ├── סטטוס נוכחי
  ├── יעד + תאריך יציאה
  ├── סה"כ עסקאות + הכנסה
  └── כפתור "צפה בפרטים" → /leads/detail?id=xxx
```

---

## מידע עובר

```typescript
// CustomerView (aggregated)
{
  phone: string
  full_name: string
  visits: number           // כמה פעמים היה לקוח
  isReturning: boolean     // visits > 1
  totalRevenue: number     // סה"כ הכנסות מלקוח זה
  lastStatus: LeadStatus
  leads: Lead[]            // כל הרשומות שלו
}
```

---

## קבצים מושפעים
- `app/customers/page.tsx`
- `lib/leads.ts` (getLeads)
