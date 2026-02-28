# FLOW_REPORTS.md — דוחות וניתוחים

## סיכום
דשבורד ניתוחי מלא עם KPIs, line charts, donut charts, funnel מכירות, ניתוח מקורות/יעדים ומגמות חודשיות. כל הנתונים מחושבים client-side מ-leads.

## תפקיד מקצועי
**Business Intelligence Developer + Data Visualizer**

## ישויות מעורבות
- **DB:** `leads` (read-only)
- **Lib:** `lib/leads.ts` (getLeads)
- **Page:** `/reports`
- **Charts:** SVG custom (ללא ספריות חיצוניות)

---

## תרשים זרימה ראשי

```
/reports
  │
  useEffect → getLeads() → כל לידי הסוכן
  │
  ┌────────────────────────────────────────────────┐
  │           חישובי KPI (client-side)             │
  │  total, paid, returned, conversionRate         │
  │  revenue, commission, avgDeal                  │
  │  depositRate, pipelineValue                    │
  │  monthly12, monthly6, depByMonth               │
  │  bySource, topDests, topTags                   │
  └────────────────────────────────────────────────┘
  │
  ┌──────────────┬───────────────┬────────────────┐
  │  KPI Row (4) │ Secondary KPIs│   Tabs (5)     │
  └──────────────┴───────────────┴────────────────┘

Tabs:
├── סקירה כללית: line charts × 2 + donut + top dests
├── משפך מכירות: funnel visual + drop-off % + line chart
├── מקורות: donut + revenue per source + source cards
├── יעדים: bars + revenue table + עונתיות + tags
└── מגמות: line charts × 2 + monthly table
```

---

## חישובים עיקריים

```typescript
// KPIs
total = leads.length
paid = leads.filter(status ∈ ['paid','flying','returned'])
conv = Math.round((paid.length / total) * 100)
revenue = paid.reduce((s,l) => s + l.total_price, 0)
commission = leads.reduce((s,l) => s + l.commission, 0)
avgDeal = revenue / paid.length
depositRate = leads.filter(deposit_paid).length / total × 100
pipelineValue = activeLeads.reduce((s,l) => s + l.budget, 0)

// Monthly
monthly12 = last 12 months [{label, value, revenue, closed}]
  value = leads created in that month
  revenue = total_price of those leads
  closed = leads with paid/flying/returned status

// Source
bySource = group by lead.source
  revenue per source = sum(total_price) for that source
  avg = revenue / count

// Destinations
destMap = group by lead.destination
  count + revenue per destination
```

---

## SVG Charts (ללא ספריות)

```
LineChart:
  input: [{label, value}]
  bezier cubic curve (smooth)
  gradient fill below line
  hover tooltip → hovered state
  axis labels

DonutChart:
  input: [{label, value, color}]
  SVG circle stroke-dasharray segments
  center text: total

HBar (Horizontal Bar):
  pct = (value/max) × 100
  animated width transition
```

---

## קבצים מושפעים
- `app/reports/page.tsx`
- `lib/leads.ts` (getLeads)
