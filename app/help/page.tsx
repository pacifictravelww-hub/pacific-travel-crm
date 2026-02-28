'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Users, FileText, CreditCard, Bell } from 'lucide-react';

interface FAQItem { q: string; a: string; }
interface Section {
  id: string; icon: React.ReactNode; title: string;
  color: string; iconColor: string;
  steps?: { title: string; description: string }[];
}

const sections: Section[] = [
  {
    id: 'leads', icon: <Users className="w-5 h-5" />, title: 'ניהול לידים',
    color: 'rgba(59,130,246,', iconColor: '#60a5fa',
    steps: [
      { title: '1. ליד נכנס', description: 'ליד מגיע מפייסבוק, וואטסאפ או הכנסה ידנית. לוחצים על "ליד חדש" וממלאים את הפרטים.' },
      { title: '2. יצירת קשר', description: 'מיד לאחר קבלת הליד יוצרים קשר עם הלקוח. מעדכנים הערות ומזיזים ל"הצעה נשלחה".' },
      { title: '3. מעקב סטטוס', description: 'גוררים את הכרטיס בלוח הקאנבן: ליד ← הצעה נשלחה ← שולם ← טס ← חזר.' },
      { title: '4. סגירת עסקה', description: 'לאחר תשלום — מזיזים ל"שולם". מעלים מסמכים. לאחר הטיסה — מזיזים ל"חזר".' },
    ],
  },
  {
    id: 'profile', icon: <FileText className="w-5 h-5" />, title: 'פרופיל לקוח',
    color: 'rgba(167,139,250,', iconColor: '#a78bfa',
    steps: [
      { title: 'פרטים אישיים', description: 'שם, טלפון, מייל, העדפות מושב, כשרות, מלון מועדף.' },
      { title: 'מסמכים', description: 'מעלים דרכון, ויזה, כרטיסי טיסה. המערכת מתריעה על תוקף שעומד לפוג.' },
      { title: 'תיוגים', description: 'מתייגים: ירח דבש, משפחה, VIP, כשרות. עוזר לסנן ולמצוא לקוחות.' },
    ],
  },
  {
    id: 'payments', icon: <CreditCard className="w-5 h-5" />, title: 'תשלומים',
    color: 'rgba(52,211,153,', iconColor: '#34d399',
    steps: [
      { title: 'מקדמה', description: 'מגדירים סכום מקדמה ותאריך. המערכת שולחת תזכורת אוטומטית.' },
      { title: 'יתרה', description: 'מגדירים יתרת תשלום ותאריך פירעון. רואים מצב פיננסי בפרופיל.' },
      { title: 'מעקב', description: 'בדשבורד — סך הכנסות, עמלות ותשלומים ממתינים.' },
    ],
  },
  {
    id: 'automations', icon: <Bell className="w-5 h-5" />, title: 'אוטומציות',
    color: 'rgba(251,146,60,', iconColor: '#fb923c',
    steps: [
      { title: 'אישור פנייה', description: 'ברגע שנכנס ליד — נשלחת הודעת וואטסאפ אוטומטית ללקוח.' },
      { title: 'תזכורת לפני טיסה', description: 'תזכורת 48 שעות לפני הטיסה עם פרטים ומה להכין.' },
      { title: 'פידבק אחרי חזרה', description: 'יום לאחר שהלקוח חזר — נשלחת בקשה לחוות דעת.' },
    ],
  },
];

const faqs: FAQItem[] = [
  { q: 'איך מוסיפים ליד חדש ידנית?', a: 'לוחצים על "ליד חדש +" בראש הדף, ממלאים את הטופס ולוחצים שמור.' },
  { q: 'איך מזיזים ליד בין סטטוסים?', a: 'גוררים את הכרטיס בלוח הקאנבן, או נכנסים לפרופיל ומשנים סטטוס.' },
  { q: 'איך מעלים מסמכים?', a: 'פרופיל הלקוח ← לשונית "מסמכים" ← "העלה מסמך".' },
  { q: 'איך יודעים שדרכון עומד לפוג?', a: 'המערכת מסמנת בצהוב/אדום מסמכים שתוקפם עומד לפוג ב-6 חודשים.' },
  { q: 'מה קורה אם לקוח לא משלם בזמן?', a: 'תזכורת אוטומטית 3 ימים לפני הדדליין, וביום הדדליין. ניתן לשלוח ידנית.' },
  { q: 'איך רואים את הביצועים שלי?', a: 'בדשבורד — סיכום מכירות, המרות ועמלות. ניתן לסנן לפי חודש.' },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="w-full text-right p-4 flex justify-between items-center transition-all hover:bg-white/5"
            onClick={() => setOpen(open === i ? null : i)}>
            <span className="font-medium text-slate-200">{item.q}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm text-slate-400" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>

      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10 pt-4">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">מרכז העזרה</h1>
          <p className="text-slate-400">כל מה שצריך לדעת כדי לעבוד עם Pacific Travel CRM</p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {sections.map((s) => (
            <button key={s.id}
              onClick={() => { setActiveSection(activeSection === s.id ? null : s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
              className="p-3 rounded-xl text-sm font-medium transition-all text-right flex items-center gap-2"
              style={activeSection === s.id
                ? { background: `${s.color}0.15)`, border: `1px solid ${s.color}0.35)`, color: s.iconColor }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
              <span className="p-1.5 rounded-lg" style={{ background: `${s.color}0.2)` }}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-10">
          {sections.map((section) => (
            <div key={section.id} id={section.id}
              className={`rounded-2xl overflow-hidden scroll-mt-6 transition-all ${activeSection && activeSection !== section.id ? 'opacity-40' : ''}`}
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="p-2 rounded-xl" style={{ background: `${section.color}0.15)`, border: `1px solid ${section.color}0.25)` }}>
                  <span style={{ color: section.iconColor }}>{section.icon}</span>
                </span>
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              </div>
              <div className="p-5 space-y-4">
                {section.steps?.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${section.color}0.2)`, color: section.iconColor }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 mb-0.5">{step.title}</p>
                      <p className="text-slate-400 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-2xl overflow-hidden mb-8"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <HelpCircle className="w-5 h-5 text-slate-400" />
            </span>
            <h2 className="text-lg font-semibold text-white">שאלות נפוצות</h2>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>{faqs.length}</span>
          </div>
          <div className="p-5">
            <FAQAccordion items={faqs} />
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 pb-6">
          Pacific Travel CRM · גרסה 1.0 · עודכן לאחרונה: פברואר 2026
        </p>
      </div>
    </div>
  );
}
