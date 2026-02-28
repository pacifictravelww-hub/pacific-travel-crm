'use client';

import { useState } from 'react';
import {
  MessageCircle, Bell, Clock, Send, Zap, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Plus, Pencil, Phone, Mail, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AutomationType = 'whatsapp' | 'email' | 'notification' | 'task';
type TriggerEvent = 'new_lead' | 'proposal_sent' | 'paid' | 'pre_flight' | 'returned' | 'doc_expiry' | 'payment_reminder';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: TriggerEvent;
  type: AutomationType;
  enabled: boolean;
  delay?: string;
  template?: string;
}

const TRIGGER_LABELS: Record<TriggerEvent, string> = {
  new_lead: 'ליד חדש נכנס',
  proposal_sent: 'הצעה נשלחה',
  paid: 'תשלום התקבל',
  pre_flight: '48 שעות לפני טיסה',
  returned: 'לקוח חזר מטיסה',
  doc_expiry: 'מסמך עומד לפוג',
  payment_reminder: 'תזכורת תשלום',
};

const TRIGGER_COLORS: Record<TriggerEvent, { bg: string; border: string; text: string }> = {
  new_lead: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa' },
  proposal_sent: { bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  paid: { bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#34d399' },
  pre_flight: { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', text: '#fb923c' },
  returned: { bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#93c5fd' },
  doc_expiry: { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', text: '#f87171' },
  payment_reminder: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

const TYPE_ICONS: Record<AutomationType, { icon: typeof MessageCircle; label: string }> = {
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  email: { icon: Mail, label: 'אימייל' },
  notification: { icon: Bell, label: 'התראה' },
  task: { icon: Calendar, label: 'משימה' },
};

const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: '1', name: 'אישור קבלת פנייה', description: 'הודעת WhatsApp אוטומטית ללקוח ברגע שנכנס ליד חדש',
    trigger: 'new_lead', type: 'whatsapp', enabled: true,
    template: 'שלום {name}! 👋\nקיבלנו את פנייתך ונחזור אליך בהקדם.\nצוות Pacific Travel',
  },
  {
    id: '2', name: 'שליחת הצעת מחיר', description: 'הודעת WhatsApp עם סיכום ההצעה ללקוח',
    trigger: 'proposal_sent', type: 'whatsapp', enabled: true,
    template: 'היי {name}! 🌍\nשלחנו לך הצעת מחיר ל{destination}.\nסה"כ: ₪{total_price}\nמחכים לתשובתך!',
  },
  {
    id: '3', name: 'אישור תשלום', description: 'הודעה + אימייל ללקוח לאחר קבלת תשלום',
    trigger: 'paid', type: 'whatsapp', enabled: true,
    template: 'שלום {name}! ✅\nהתשלום שלך התקבל בהצלחה.\nאנחנו מכינים הכל לטיסה שלך ל{destination}!',
  },
  {
    id: '4', name: 'תזכורת לפני טיסה', description: 'תזכורת 48 שעות לפני הטיסה עם פרטים חשובים',
    trigger: 'pre_flight', type: 'whatsapp', enabled: true, delay: '48 שעות לפני',
    template: 'היי {name}! ✈️\nהטיסה שלך ל{destination} מחר!\n\n🛂 דרכון\n🧳 ארוז מזוודה\n📱 שמור את הווצ\'ר\n\nטיסה טובה! 🎉',
  },
  {
    id: '5', name: 'בקשת פידבק', description: 'יום לאחר החזרה — בקשה לחוות דעת',
    trigger: 'returned', type: 'whatsapp', enabled: false, delay: '24 שעות אחרי',
    template: 'שלום {name}! 🏠\nמקווים שנהנית ב{destination}!\nנשמח אם תשתף אותנו בחוות דעת קצרה 🙏',
  },
  {
    id: '6', name: 'התראת תוקף מסמך', description: 'התראה לסוכן כשמסמך עומד לפוג תוך 30 יום',
    trigger: 'doc_expiry', type: 'notification', enabled: true, delay: '30 יום לפני',
  },
  {
    id: '7', name: 'תזכורת תשלום', description: 'תזכורת ללקוח 3 ימים לפני דדליין תשלום',
    trigger: 'payment_reminder', type: 'whatsapp', enabled: false, delay: '3 ימים לפני',
    template: 'היי {name}! 💳\nתזכורת ידידותית — יש תשלום של ₪{amount} שמגיע בעוד 3 ימים.\nאם שילמת כבר, אפשר להתעלם 😊',
  },
  {
    id: '8', name: 'אימייל אישור הזמנה', description: 'אימייל מסכם עם כל פרטי ההזמנה לאחר תשלום',
    trigger: 'paid', type: 'email', enabled: false,
  },
];

function AutomationCard({ automation, onToggle }: { automation: Automation; onToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const triggerStyle = TRIGGER_COLORS[automation.trigger];
  const TypeIcon = TYPE_ICONS[automation.type].icon;

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
        border: `1px solid ${automation.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        opacity: automation.enabled ? 1 : 0.6,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = automation.enabled ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = automation.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'; }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: triggerStyle.bg, border: `1px solid ${triggerStyle.border}` }}>
            <TypeIcon className="w-5 h-5" style={{ color: triggerStyle.text }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white">{automation.name}</h3>
                <p className="text-sm text-slate-400 mt-0.5">{automation.description}</p>
              </div>
              <button onClick={() => onToggle(automation.id)} className="shrink-0 mt-1">
                {automation.enabled
                  ? <ToggleRight className="w-8 h-8 text-blue-400" />
                  : <ToggleLeft className="w-8 h-8 text-slate-600" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: triggerStyle.bg, color: triggerStyle.text, border: `1px solid ${triggerStyle.border}` }}>
                <Zap className="w-3 h-3 inline ml-1" />
                {TRIGGER_LABELS[automation.trigger]}
              </div>
              <div className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                {TYPE_ICONS[automation.type].label}
              </div>
              {automation.delay && (
                <div className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Clock className="w-3 h-3 inline ml-1" />{automation.delay}
                </div>
              )}
            </div>

            {automation.template && (
              <button className="mt-3 text-xs text-blue-400 hover:underline flex items-center gap-1"
                onClick={() => setExpanded(e => !e)}>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {expanded ? 'הסתר תבנית' : 'הצג תבנית הודעה'}
              </button>
            )}

            {expanded && automation.template && (
              <div className="mt-3 p-3 rounded-xl text-sm text-slate-300 whitespace-pre-line leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {automation.template}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(DEFAULT_AUTOMATIONS);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const filtered = automations.filter(a => {
    if (filter === 'active') return a.enabled;
    if (filter === 'inactive') return !a.enabled;
    return true;
  });

  const activeCount = automations.filter(a => a.enabled).length;

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">אוטומציות</h1>
          <p className="text-slate-400 mt-1 text-sm">הודעות אוטומטיות, תזכורות והתראות לפי שלב הליד</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">אוטומציה חדשה</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'סה״כ', value: automations.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
          { label: 'פעילות', value: activeCount, color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
          { label: 'כבויות', value: automations.length - activeCount, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <Button key={f} size="sm" onClick={() => setFilter(f)}
            className={filter === f
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10'}>
            {f === 'all' ? 'הכל' : f === 'active' ? 'פעילות' : 'כבויות'}
          </Button>
        ))}
      </div>

      {/* Automations list */}
      <div className="space-y-4">
        {filtered.map(automation => (
          <AutomationCard key={automation.id} automation={automation} onToggle={toggleAutomation} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Zap className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">אין אוטומציות {filter === 'active' ? 'פעילות' : filter === 'inactive' ? 'כבויות' : ''}</p>
        </div>
      )}

      {/* Info banner */}
      <div className="mt-8 rounded-2xl p-5"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
        <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" /> איך זה עובד?
        </h3>
        <div className="text-sm text-slate-400 space-y-1.5">
          <p>• כל אוטומציה מופעלת אוטומטית כשליד מגיע לשלב המתאים</p>
          <p>• ניתן להפעיל/לכבות כל אוטומציה בנפרד</p>
          <p>• תבניות הודעה תומכות במשתנים: {'{name}'}, {'{destination}'}, {'{total_price}'}</p>
          <p>• בקרוב: חיבור WhatsApp Business API לשליחה אמיתית</p>
        </div>
      </div>
    </div>
  );
}
