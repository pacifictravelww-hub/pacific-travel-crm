# Pacific Travel CRM — User Flows Index

> **הוראות שימוש:** לפני כל משימה — זהה את ה-flow הרלוונטי מהרשימה למטה, פתח את הקובץ המתאים וקרא אותו לעומק. אם אין קובץ flow לאזור שבו אתה עובד — צור אותו לפני הביצוע ועדכן את ה-INDEX הזה.

---

## רשימת Flows

| קובץ | אזור | עמודים מושפעים | עדכון אחרון |
|------|------|----------------|-------------|
| [FLOW_AUTH.md](./FLOW_AUTH.md) | אימות משתמשים | login, register, complete-profile, pending-approval, reset-password, verify-email | 2026-02-28 |
| [FLOW_LEADS.md](./FLOW_LEADS.md) | ניהול לידים | /leads, /leads/new, /leads/detail, /leads/edit | 2026-02-28 |
| [FLOW_CUSTOMERS.md](./FLOW_CUSTOMERS.md) | לקוחות | /customers | 2026-02-28 |
| [FLOW_DOCUMENTS.md](./FLOW_DOCUMENTS.md) | מסמכים | /documents | 2026-02-28 |
| [FLOW_NOTIFICATIONS.md](./FLOW_NOTIFICATIONS.md) | התראות | /notifications | 2026-02-28 |
| [FLOW_REPORTS.md](./FLOW_REPORTS.md) | דוחות | /reports | 2026-02-28 |
| [FLOW_SETTINGS.md](./FLOW_SETTINGS.md) | הגדרות וניהול משתמשים | /settings | 2026-02-28 |
| [FLOW_EMAIL.md](./FLOW_EMAIL.md) | מיילים אוטומטיים | API /api/email/send | 2026-02-28 |

---

## מבנה כל קובץ Flow

```
# FLOW_X.md
## כותרת + סיכום
## תפקיד מקצועי לביצוע משימות בתחום זה
## ישויות מעורבות (DB tables, components, lib files)
## תרשים זרימה ראשי
## תת-flows (לכל פעולה)
## מידע עובר (data models)
## כללי עיצוב ו-UX
## edge cases + שגיאות
## קבצים מושפעים
```

---

## כללי ברזל

1. **לפני משימה:** קרא את ה-flow הרלוונטי
2. **אחרי שינוי:** עדכן את ה-flow + תאריך ב-INDEX
3. **Flow חדש:** צור קובץ + הוסף ל-INDEX + הודע למשתמש
4. **אם Flow לא קיים:** צור → בצע → עדכן
