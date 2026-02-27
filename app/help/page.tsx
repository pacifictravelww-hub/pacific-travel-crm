'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Users, FileText, CreditCard, Bell, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  steps?: { title: string; description: string }[];
  faqs?: FAQItem[];
}

const sections: Section[] = [
  {
    id: 'leads',
    icon: <Users className="w-5 h-5" />,
    title: 'ניהול לידים',
    color: 'blue',
    steps: [
      {
        title: '1. ליד נכנס',
        description: 'ליד מגיע מפייסבוק, וואטסאפ או הכנסה ידנית. לוחצים על "ליד חדש" וממלאים את הפרטים: שם, טלפון, מייל, תאריכים, תקציב וסוג חופשה.',
      },
      {
        title: '2. יצירת קשר',
        description: 'מיד לאחר קבלת הליד יוצרים קשר עם הלקוח. מעדכנים הערות בפרופיל ומזיזים את הסטטוס ל"הצעה נשלחה" לאחר שנשלחה הצעת מחיר.',
      },
      {
        title: '3. מעקב סטטוס',
        description: 'גוררים את הכרטיס בלוח הקאנבן לפי מצב: ליד ← הצעה נשלחה ← שולם ← טס ← חזר.',
      },
      {
        title: '4. סגירת עסקה',
        description: 'לאחר תשלום מקדמה — מזיזים ל"שולם". מעלים מסמכים (כרטיסים, ווצ\'רים). לאחר הטיסה — מזיזים ל"חזר" ומבקשים פידבק.',
      },
    ],
  },
  {
    id: 'profile',
    icon: <FileText className="w-5 h-5" />,
    title: 'פרופיל לקוח',
    color: 'purple',
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
    icon: <CreditCard className="w-5 h-5" />,
    title: 'תשלומים',
    color: 'green',
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
    icon: <Bell className="w-5 h-5" />,
    title: 'אוטומציות',
    color: 'orange',
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
    a: 'המערכת מסמנת בצהוב/אדום מסמכים שתוקפם עומד לפוג ב-6 חודשים הקרובים.',
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
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button
            className="w-full text-right p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-medium text-gray-800">{item.q}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-gray-600 text-sm border-t bg-gray-50">
              <p className="pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
};

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
};

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">דשבורד</Link>
        <ArrowRight className="w-3 h-3 text-gray-400 rotate-180" />
        <span className="text-gray-700 font-medium">עזרה</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">מרכז העזרה</h1>
          <p className="text-gray-500">כל מה שצריך לדעת כדי לעבוד עם Pacific Travel CRM</p>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(activeSection === s.id ? null : s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`p-3 rounded-xl border text-sm font-medium transition-all text-right flex items-center gap-2 ${
                activeSection === s.id ? colorMap[s.color] : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className={`p-1.5 rounded-lg ${iconBgMap[s.color]}`}>{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-6 mb-10">
          {sections.map((section) => (
            <Card key={section.id} id={section.id} className={`transition-all scroll-mt-6 ${activeSection && activeSection !== section.id ? 'opacity-50' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className={`p-2 rounded-lg ${iconBgMap[section.color]}`}>{section.icon}</span>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.steps?.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${iconBgMap[section.color]}`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 mb-0.5">{step.title}</p>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="p-2 rounded-lg bg-gray-100 text-gray-600">
                <HelpCircle className="w-5 h-5" />
              </span>
              שאלות נפוצות
              <Badge variant="secondary">{faqs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FAQAccordion items={faqs} />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          Pacific Travel CRM · גרסה 1.0 · עודכן לאחרונה: פברואר 2026
        </p>
      </div>
    </div>
  );
}
