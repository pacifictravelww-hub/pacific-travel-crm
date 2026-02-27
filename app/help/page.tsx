'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, FileText, CreditCard, Bell } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  steps?: { title: string; description: string }[];
}

const sections: Section[] = [
  {
    id: 'leads',
    icon: <Users className="w-4 h-4" />,
    title: 'ניהול לידים',
    steps: [
      {
        title: 'ליד נכנס',
        description: 'ליד מגיע מפייסבוק, וואטסאפ או הכנסה ידנית. לוחצים על "ליד חדש" וממלאים את הפרטים: שם, טלפון, מייל, תאריכים, תקציב וסוג חופשה.',
      },
      {
        title: 'יצירת קשר',
        description: 'מיד לאחר קבלת הליד יוצרים קשר עם הלקוח. מעדכנים הערות בפרופיל ומזיזים את הסטטוס ל"הצעה נשלחה" לאחר שנשלחה הצעת מחיר.',
      },
      {
        title: 'מעקב סטטוס',
        description: 'גוררים את הכרטיס בלוח הקאנבן לפי מצב: ליד ← הצעה נשלחה ← שולם ← טס ← חזר.',
      },
      {
        title: 'סגירת עסקה',
        description: 'לאחר תשלום מקדמה — מזיזים ל"שולם". מעלים מסמכים (כרטיסים, ווצ\'רים). לאחר הטיסה — מזיזים ל"חזר" ומבקשים פידבק.',
      },
    ],
  },
  {
    id: 'profile',
    icon: <FileText className="w-4 h-4" />,
    title: 'פרופיל לקוח',
    steps: [
      {
        title: 'פרטים אישיים',
        description: 'שם, טלפון, מייל, העדפות מושב, כשרות, מלון מועדף. חשוב למלא כמה שיותר פרטים לשירות מדויק.',
      },
      {
        title: 'מסמכים',
        description: 'מעלים דרכון, ויזה, כרטיסי טיסה וווצ\'רים. המערכת מתריעה על תוקף שעומד לפוג.',
      },
      {
        title: 'תיוגים',
        description: 'מתייגים הזמנות: ירח דבש, משפחה, VIP, כשרות וכו\'. עוזר לסנן ולמצוא לקוחות מהר.',
      },
    ],
  },
  {
    id: 'payments',
    icon: <CreditCard className="w-4 h-4" />,
    title: 'תשלומים',
    steps: [
      {
        title: 'מקדמה',
        description: 'מגדירים סכום מקדמה ותאריך יעד. המערכת שולחת תזכורת אוטומטית ללקוח לפני הדדליין.',
      },
      {
        title: 'יתרה',
        description: 'לאחר קבלת המקדמה — מגדירים את יתרת התשלום ותאריך פירעון. ניתן לראות את כל המצב הפיננסי בפרופיל הלקוח.',
      },
      {
        title: 'מעקב',
        description: 'בדשבורד הראשי רואים את סך ההכנסות, עמלות ורשימת תשלומים ממתינים.',
      },
    ],
  },
  {
    id: 'automations',
    icon: <Bell className="w-4 h-4" />,
    title: 'אוטומציות',
    steps: [
      {
        title: 'אישור פנייה',
        description: 'ברגע שנכנס ליד חדש — נשלחת הודעת וואטסאפ אוטומטית ללקוח עם אישור שקיבלנו את פנייתו.',
      },
      {
        title: 'תזכורת לפני טיסה',
        description: 'המערכת שולחת תזכורת 48 שעות לפני הטיסה עם פרטי הטיסה ומה להכין.',
      },
      {
        title: 'פידבק אחרי חזרה',
        description: 'יום לאחר שהלקוח חזר — נשלחת בקשה אוטומטית לחוות דעת.',
      },
    ],
  },
];

const faqs: FAQItem[] = [
  {
    q: 'איך מוסיפים ליד חדש ידנית?',
    a: 'לוחצים על כפתור "ליד חדש +" בראש הדף, ממלאים את הטופס ולוחצים שמור.',
  },
  {
    q: 'איך מזיזים ליד בין סטטוסים?',
    a: 'גוררים את הכרטיס בלוח הקאנבן, או נכנסים לפרופיל הלקוח ומשנים את הסטטוס מהתפריט.',
  },
  {
    q: 'איך מעלים מסמכים?',
    a: 'נכנסים לפרופיל הלקוח ← לשונית "מסמכים" ← לוחצים "העלה מסמך".',
  },
  {
    q: 'איך יודעים שדרכון עומד לפוג?',
    a: 'המערכת מסמנת מסמכים שתוקפם עומד לפוג ב-6 חודשים הקרובים.',
  },
  {
    q: 'מה קורה אם לקוח לא משלם בזמן?',
    a: 'המערכת שולחת תזכורת אוטומטית ב-3 ימים לפני הדדליין, וב-1 ביום הדדליין. ניתן לשלוח תזכורת ידנית בכל עת.',
  },
  {
    q: 'איך רואים את הביצועים שלי?',
    a: 'בדשבורד הראשי יש סיכום מכירות, המרות ועמלות. ניתן לסנן לפי חודש/שנה.',
  },
];

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border-t border-black">
          <button
            className="w-full text-right py-4 px-0 flex justify-between items-center hover:bg-black hover:text-white transition-colors duration-100 px-4 group"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span
              className="font-medium text-sm"
              style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
            >
              {item.q}
            </span>
            {open === i
              ? <ChevronUp className="w-4 h-4 shrink-0" />
              : <ChevronDown className="w-4 h-4 shrink-0" />
            }
          </button>
          {open === i && (
            <div
              className="px-4 pb-4 text-sm text-muted-600 border-t border-muted-200"
              style={{ fontFamily: 'var(--font-source-serif), serif' }}
            >
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
      <div className="border-t border-black" />
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Breadcrumb */}
      <div
        className="border-b border-muted-300 px-8 py-3 text-xs tracking-widest uppercase text-muted-500 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
      >
        <Link href="/" className="hover:text-black">דשבורד</Link>
        <span>·</span>
        <span className="text-black">עזרה</span>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Hero */}
        <div className="mb-12 pb-8 border-b-4 border-black">
          <h1
            className="text-6xl font-bold italic mb-3"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            מרכז העזרה
          </h1>
          <p
            className="text-sm text-muted-500"
            style={{ fontFamily: 'var(--font-source-serif), serif' }}
          >
            כל מה שצריך לדעת כדי לעבוד עם Pacific Travel CRM
          </p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-4 gap-px bg-black mb-12">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="bg-white p-4 text-center hover:bg-black hover:text-white transition-colors duration-100 flex flex-col items-center gap-2 group"
            >
              <div className="w-8 h-8 border border-current flex items-center justify-center group-hover:border-white">
                {s.icon}
              </div>
              <span
                className="text-xs tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {s.title}
              </span>
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-16 mb-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="border-b-4 border-black pb-3 mb-8">
                <h2
                  className="text-3xl font-bold italic flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {section.title}
                </h2>
              </div>
              <div className="space-y-6">
                {section.steps?.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    {/* Step number — square, inverted */}
                    <div
                      className="shrink-0 w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-bold"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <p
                        className="font-semibold mb-1 text-sm"
                        style={{ fontFamily: 'var(--font-playfair), serif' }}
                      >
                        {step.title}
                      </p>
                      <p
                        className="text-sm text-muted-600"
                        style={{ fontFamily: 'var(--font-source-serif), serif' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <section>
          <div className="border-b-4 border-black pb-3 mb-8">
            <h2
              className="text-3xl font-bold italic"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              שאלות נפוצות
            </h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>

        {/* Footer */}
        <div
          className="text-center text-xs text-muted-400 mt-16 pt-8 border-t border-muted-300 tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Pacific Travel CRM · v1.0 · Feb 2026
        </div>
      </div>
    </div>
  );
}
