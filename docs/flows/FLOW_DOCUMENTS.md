# FLOW_DOCUMENTS.md — מסמכים

## סיכום
ניהול כל המסמכים בכל הלידים — דרכונים, ויזות, כרטיסי טיסה, וואוצ'רים, חוזים. כולל התראות פקיעת תוקף, חיפוש, פילטור וצפייה מרוכזת.

## תפקיד מקצועי
**Document Management Specialist + Frontend Developer**

## ישויות מעורבות
- **DB:** `documents`, `leads`
- **Lib:** `lib/leads.ts` (getDocuments, addDocument)
- **Page:** `/documents`
- **Notification trigger:** `FLOW_NOTIFICATIONS.md`

---

## תרשים זרימה ראשי

```
/documents
     │
  useEffect →
  ┌─── getLeads() → כל הלידים של הסוכן
  └─── לכל ליד: getDocuments(leadId) → מקביל Promise.all
     │
  flatten → מערך אחד של כל המסמכים
     │
  ┌─────────────────────────────────────────────┐
  │              Alert Banners                  │
  │  ⚠️ X מסמכים פגים תוך 30 יום              │
  │  🔴 X מסמכים פגו כבר                      │
  └─────────────────────────────────────────────┘
     │
  ┌──┴──────────────────┬──────────────────────┐
חיפוש (שם/סוג)      פילטר type             פילטר expiry
  └──────────────────────┴──────────────────────┘
                          │
                 טבלת מסמכים:
                 ├── סוג מסמך (icon)
                 ├── שם הלקוח
                 ├── תאריך פקיעה
                 ├── badge סטטוס (תקף/פג בקרוב/פג)
                 └── כפתור "עבור לליד" → /leads/detail?id
                          │
                 כפתור "הוסף מסמך"
                          │
                   modal: AddDocumentModal
                          │
              ┌───────────┴──────────────┐
           בחר ליד                  מלא פרטים:
           מהרשימה                  type, expiry_date, url, notes
                          │
              addDocument({
                lead_id, type, expiry_date,
                url, notes,
                uploaded_at: now()
              })
                          │
              supabase.from('documents').insert(...)
                          │
              refresh documents list
```

---

## מידע עובר (Document Data Model)

```typescript
interface Document {
  id: string
  lead_id: string
  type: 'passport' | 'visa' | 'ticket' | 'voucher' | 'contract' | 'other'
  expiry_date?: string      // ISO date — לפקיעת תוקף
  url?: string              // קישור לקובץ
  notes?: string
  uploaded_at: string
}
```

---

## לוגיקת פקיעת תוקף

```
today = new Date()
in30 = today + 30 days

expired: expiry_date < today
expiring_soon: today ≤ expiry_date ≤ in30
valid: expiry_date > in30
```

---

## חיבור ל-Notifications Flow

```
בכל טעינת /notifications:
generateProactiveNotifications() בודק:
  supabase.from('documents')
    .lte('expiry_date', in30)
    .gte('expiry_date', today)
  → יוצר notification type='document_expiring'
  → כפתור "צפה במסמכים" → /documents
```

---

## Edge Cases

| מצב | טיפול |
|-----|-------|
| ליד ללא מסמכים | לא מוצג בטבלה |
| expiry_date חסר | מוצג "ללא תאריך" |
| הוספת מסמך ללא ליד | disabled כפתור שמור |

---

## קבצים מושפעים
- `app/documents/page.tsx`
- `lib/leads.ts` (getDocuments, addDocument)
- `lib/data.ts` (Document interface)
