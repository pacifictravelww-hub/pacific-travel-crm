# FLOW_LEADS.md — ניהול לידים

## סיכום
הלב של המערכת. כל מחזור חיי הליד — מיצירה ועד חזרה מהנסיעה. כולל Kanban, חיפוש/פילטור, עריכה מלאה, מסמכים, שינוי סטטוס ומחיקה.

## תפקיד מקצועי
**CRM Product Manager + Full-Stack Developer** — מחזור חיי ליד שלם עם UX מקצועי.

## ישויות מעורבות
- **DB:** `leads`, `documents`
- **Lib:** `lib/leads.ts`, `lib/data.ts`
- **Pages:** `/leads`, `/leads/new`, `/leads/detail`, `/leads/edit`
- **Components:** `AppShell.tsx`, `Sidebar.tsx`, `MobileNav.tsx`

---

## סטטוסים ומעברים

```
lead → proposal_sent → paid → flying → returned
 │          │            │       │         │
ליד       הצעה       שילם    בטיסה    חזר
חדש       נשלחה      מקדמה

מעברים אפשריים: כל סטטוס → כל סטטוס (אין חסימה)
```

---

## תרשים זרימה ראשי — Kanban

```
/leads (עמוד ראשי)
       │
  useEffect → getLeads() → supabase.from('leads').select('*').eq('agent_id', user.id)
       │
  ┌────┴─────────────────────────────────────┐
  │              תצוגת Kanban               │
  │  [ליד] [הצעה נשלחה] [שילם] [טס] [חזר] │
  └────┬─────────────────────────────────────┘
       │
  ┌────┼────────────────────┬──────────────────────┐
  │    │                    │                      │
חיפוש  פילטור           Drag & Drop            כפתור "ליד חדש"
  │    │                    │                      │
  │    │            updateLeadStatus()             ▼
  │    │            supabase.update(status)    /leads/new
  │    │            optimistic update
  │    │
  │  [source, tags, budget_range, departure_date, deposit_status]
  │    │
  └────┘
     ▼
  כרטיסי ליד מסוננים ומוצגים
     │
  לחיצה על כרטיס
     ▼
  router.push('/leads/detail?id=xxx')
```

---

## Flow: יצירת ליד חדש

```
/leads/new
     │
  טופס (חלקים):
  ├── פרטים אישיים: full_name, phone, email, source
  ├── נסיעה: destination, departure_date, return_date, num_travelers, vacation_type
  ├── מלון: hotel_name, hotel_level, board_basis
  ├── תשלומים: total_price, deposit_amount, deposit_paid, commission
  ├── תגיות: tags[]
  └── העדפות: notes, preferences
     │
  handleSubmit()
     │
  createLead({
    ...formData,
    agent_id: user.id,   // UUID של הסוכן
    status: 'lead',
    created_at: now()
  })
     │
  supabase.from('leads').insert([data]).select().single()
     │
  ┌──┴──┐
success  error
  │        │
router   toast error
.push    + stay on form
('/leads')
```

---

## Flow: צפייה בליד (Detail)

```
/leads/detail?id=xxx
     │
  useSearchParams() → id
  getLead(id) → supabase.from('leads').select('*').eq('id',id).single()
  getDocuments(id) → supabase.from('documents').select('*').eq('lead_id',id)
     │
  ┌──────────────────────────────────────────┐
  │              Lead Detail UI              │
  │  ├── פרטים אישיים + קשר                │
  │  ├── פרטי נסיעה                        │
  │  ├── מלון + תשלומים                   │
  │  ├── StatusBar (שינוי סטטוס)           │
  │  ├── מסמכים                            │
  │  └── הערות + תגיות                    │
  └──────────────────────────────────────────┘
     │
  ┌──┼──────────────────────┬──────────────────┐
  │  │                      │                  │
עריכה  שינוי סטטוס       הוספת מסמך       מחיקה
  │  │                      │                  │
  ▼  │                addDocument()        dialog אישור
/leads/ updateLeadStatus()  supabase.insert    │
edit?id=  supabase.update   ↓ refresh docs  deleteLead()
          ↓ refresh lead                   router→/leads
```

---

## Flow: עריכת ליד

```
/leads/edit?id=xxx
     │
  useSearchParams() → id
  getLead(id) → populate form fields
     │
  טופס מלא (זהה לNew, עם ערכים קיימים)
     │
  handleSubmit()
     │
  updateLead(id, {
    ...formData,
    updated_at: now()
  })
     │
  supabase.from('leads').update(data).eq('id',id).select().single()
     │
  router.push('/leads/detail?id=xxx')
```

---

## Flow: Drag & Drop Kanban

```
onDragStart(leadId, fromStatus)
     │
  dragover → highlight column
     │
onDrop(toStatus)
     │
  optimistic update: setState(leads.map → status change)
     │
  updateLeadStatus(leadId, toStatus)
  supabase.update({status: toStatus}).eq('id', leadId)
     │
  ┌──┴──┐
success  error
  │        │
confirm  revert to original state
```

---

## מידע עובר (Lead Data Model)

```typescript
interface Lead {
  id: string
  agent_id: string          // UUID של הסוכן
  status: LeadStatus        // 'lead'|'proposal_sent'|'paid'|'flying'|'returned'
  full_name: string
  phone: string
  email?: string
  source: 'facebook'|'whatsapp'|'referral'|'website'|'instagram'|'other'
  destination?: string
  departure_date?: string   // ISO date
  return_date?: string
  num_travelers?: number
  vacation_type?: VacationType
  hotel_name?: string
  hotel_level?: HotelLevel
  board_basis?: BoardBasis
  total_price?: number      // ₪
  deposit_amount?: number   // ₪
  deposit_paid?: boolean
  commission?: number       // ₪
  tags?: Tag[]
  notes?: string
  budget?: number
  created_at: string
}
```

---

## חיפוש ופילטור

```
Search bar → filter by: full_name, phone, destination (client-side)
Filter panel:
  ├── source (facebook/whatsapp/referral/website)
  ├── tags (honeymoon/family/vip/kosher/solo/group)
  ├── budget range (min-max ₪)
  ├── departure date range
  └── deposit_status (paid/unpaid)

Active filters → chip tags → removable
```

---

## Edge Cases + שגיאות

| מצב | טיפול |
|-----|-------|
| getLead → null | הצגת "ליד לא נמצא" |
| agent_id לא תואם | RLS מונע גישה |
| Drag & Drop שגיאה | revert optimistic update |
| MOCK_LEADS | מוצגים אם DB ריק / שגיאה |
| מחיקה בטעות | dialog אישור לפני מחיקה |

---

## קבצים מושפעים
- `app/leads/page.tsx` — Kanban + search/filter
- `app/leads/new/page.tsx` — יצירה
- `app/leads/detail/LeadDetailClient.tsx` — צפייה
- `app/leads/edit/EditLeadClient.tsx` — עריכה
- `lib/leads.ts` — כל CRUD operations
- `lib/data.ts` — types, labels, mock data
