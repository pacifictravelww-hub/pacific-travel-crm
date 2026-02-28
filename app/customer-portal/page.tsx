'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plane, FileText, CreditCard, Phone, Loader2,
  Calendar, MapPin, Hotel, Users, CheckCircle2,
  Clock, AlertTriangle, MessageCircle, ChevronDown,
  ChevronUp, FileWarning, Wallet, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLeadsByEmail, getLeadsByPhone, getDocuments } from '@/lib/leads';
import { Lead, Document, LEAD_STATUS_LABELS, VACATION_TYPE_LABELS, BOARD_BASIS_LABELS, HOTEL_LEVEL_LABELS } from '@/lib/data';

const MONTH_NAMES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

function formatDate(d?: string | null) {
  if (!d) return null;
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
}

function daysUntil(d?: string | null): number | null {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  lead:          { label: 'בטיפול',        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: Clock },
  proposal_sent: { label: 'הצעה נשלחה',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: FileText },
  paid:          { label: 'מאושר ✓',       color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: CheckCircle2 },
  flying:        { label: 'בנסיעה ✈️',    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: Plane },
  returned:      { label: 'הסתיים',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle2 },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: '🛂 דרכון', visa: '📋 ויזה', ticket: '🎫 כרטיס טיסה',
  voucher: '🏨 אישור מלון', contract: '📄 חוזה', other: '📎 אחר',
};

// ── Trip Card ──────────────────────────────────────────────────────────────
function TripCard({ lead, docs, agentProfile }: {
  lead: Lead; docs: Document[]; agentProfile: { full_name: string; phone?: string } | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_STYLE[lead.status] ?? STATUS_STYLE.lead;
  const StatusIcon = st.icon;
  const daysToGo = daysUntil(lead.departure_date);
  const isPast = lead.status === 'returned';
  const isCurrent = lead.status === 'flying';
  const remaining = (lead.total_price || 0) - (lead.deposit_amount || 0);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <h3 className="text-lg font-bold text-white">{lead.destination || 'יעד לא צוין'}</h3>
            </div>
            {lead.vacation_type && (
              <span className="text-xs text-slate-400">{VACATION_TYPE_LABELS[lead.vacation_type]}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: st.bg, color: st.color }}>
              <StatusIcon className="w-3.5 h-3.5" />
              {st.label}
            </div>
            {isCurrent && (
              <div className="flex items-center gap-1 text-xs text-purple-400 animate-pulse">
                <Plane className="w-3 h-3" /> אתה בנסיעה עכשיו!
              </div>
            )}
            {!isPast && !isCurrent && daysToGo !== null && daysToGo > 0 && (
              <div className="text-xs text-slate-400">
                {daysToGo} ימים ליציאה
              </div>
            )}
          </div>
        </div>

        {/* Dates + travelers row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {lead.departure_date && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-slate-500 mb-1">יציאה</p>
              <p className="text-sm font-medium text-white">{formatDate(lead.departure_date)}</p>
            </div>
          )}
          {lead.return_date && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-slate-500 mb-1">חזרה</p>
              <p className="text-sm font-medium text-white">{formatDate(lead.return_date)}</p>
            </div>
          )}
          {lead.adults && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-slate-500 mb-1">נוסעים</p>
              <p className="text-sm font-medium text-white flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" />{lead.adults}</p>
            </div>
          )}
          {lead.hotel_preference && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-slate-500 mb-1">מלון</p>
              <p className="text-sm font-medium text-white truncate">{lead.hotel_preference}</p>
            </div>
          )}
        </div>

        {/* Payment mini-bar */}
        {lead.total_price && lead.total_price > 0 && (
          <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">סה"כ לתשלום</span>
              <span className="text-sm font-bold text-white">₪{lead.total_price.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(((lead.deposit_amount || 0) / lead.total_price) * 100, 100)}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} />
            </div>
            <div className="flex justify-between mt-1.5 text-xs">
              <span className="text-emerald-400">שולם: ₪{(lead.deposit_amount || 0).toLocaleString()}</span>
              {remaining > 0 && <span className="text-amber-400">יתרה: ₪{remaining.toLocaleString()}</span>}
              {remaining <= 0 && <span className="text-emerald-400">✓ שולם במלואו</span>}
            </div>
          </div>
        )}

        {/* Expand button */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-400 transition-colors hover:text-slate-200"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'פחות פרטים' : 'כל הפרטים'}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {/* Hotel details */}
          {(lead.hotel_level || lead.board_basis) && (
            <div>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Hotel className="w-3.5 h-3.5" /> פרטי מלון</p>
              <div className="flex gap-2 flex-wrap">
                {lead.hotel_level && <span className="text-xs px-2 py-1 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.06)' }}>{HOTEL_LEVEL_LABELS[lead.hotel_level]} ⭐</span>}
                {lead.board_basis && <span className="text-xs px-2 py-1 rounded-lg text-slate-300" style={{ background: 'rgba(255,255,255,0.06)' }}>{BOARD_BASIS_LABELS[lead.board_basis]}</span>}
              </div>
            </div>
          )}

          {/* Documents for this trip */}
          {docs.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> מסמכים ({docs.length})</p>
              <div className="space-y-1.5">
                {docs.map(doc => {
                  const exp = daysUntil(doc.expiry_date);
                  return (
                    <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-xs text-slate-300">{DOC_TYPE_LABELS[doc.type] || doc.type}</span>
                      {doc.expiry_date && (
                        <span className={`text-xs ${exp !== null && exp < 0 ? 'text-red-400' : exp !== null && exp < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {exp !== null && exp < 0 ? '⚠️ פג תוקף' : `תוקף עד ${formatDate(doc.expiry_date)}`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes from agent */}
          {lead.notes && (
            <div>
              <p className="text-xs text-slate-500 mb-2">הערות מהסוכן</p>
              <p className="text-sm text-slate-300 leading-relaxed px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {lead.notes}
              </p>
            </div>
          )}

          {/* Agent contact */}
          {agentProfile && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p className="text-xs text-blue-400 mb-2">הסוכן שלי</p>
              <p className="text-sm font-medium text-white">{agentProfile.full_name}</p>
              {agentProfile.phone && (
                <div className="flex gap-2 mt-2">
                  <a href={`tel:${agentProfile.phone}`}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                    <Phone className="w-3 h-3" /> {agentProfile.phone}
                  </a>
                  <a href={`https://wa.me/972${agentProfile.phone.replace(/^0/, '').replace(/-/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(34,197,94,0.15)', color: '#34d399' }}>
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function CustomerPortalPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [docsMap, setDocsMap] = useState<Record<string, Document[]>>({});
  const [agentProfile, setAgentProfile] = useState<{ full_name: string; phone?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).single();
      setUserName(profile?.full_name || user.email || '');

      // Find leads matching this customer's email or phone
      let myLeads: Lead[] = [];
      if (user.email) {
        myLeads = await getLeadsByEmail(user.email);
      }
      if (myLeads.length === 0 && profile?.phone) {
        myLeads = await getLeadsByPhone(profile.phone);
      }
      setLeads(myLeads);

      // Load docs + agent profiles for each lead
      const docsResult: Record<string, Document[]> = {};
      for (const lead of myLeads) {
        docsResult[lead.id] = await getDocuments(lead.id);
      }
      setDocsMap(docsResult);

      // Load agent profile (first lead's agent_id)
      if (myLeads.length > 0 && myLeads[0].agent_id) {
        const { data: agent } = await supabase.from('profiles').select('full_name, phone').eq('id', myLeads[0].agent_id).single();
        if (agent) setAgentProfile(agent);
      }

      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 100%)' }}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  const upcomingLeads = leads.filter(l => !['returned'].includes(l.status));
  const pastLeads = leads.filter(l => l.status === 'returned');
  const allDocs = Object.values(docsMap).flat();
  const expiringDocs = allDocs.filter(d => { const days = daysUntil(d.expiry_date); return days !== null && days >= 0 && days <= 90; });
  const totalPaid = leads.reduce((s, l) => s + (l.deposit_amount || 0), 0);
  const totalDue = leads.reduce((s, l) => s + (l.total_price || 0), 0);

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 60%, #0f0a20 100%)' }}>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">שלום, {userName} 👋</h1>
            <p className="text-slate-400 text-sm">הנסיעות שלי עם Pacific Travel</p>
          </div>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Plane, label: 'נסיעות', value: leads.length.toString(), color: '#60a5fa' },
          { icon: Calendar, label: 'קרובות', value: upcomingLeads.length.toString(), color: '#a78bfa' },
          { icon: FileText, label: 'מסמכים', value: allDocs.length.toString(), color: '#34d399' },
          { icon: Wallet, label: 'שולם סה"כ', value: `₪${totalPaid.toLocaleString()}`, color: '#fbbf24' },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: `${item.color}22` }}>
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <p className="text-xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Expiring docs alert */}
      {expiringDocs.length > 0 && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">{expiringDocs.length} מסמכים פגים בתוך 90 יום</p>
            <p className="text-xs text-slate-400">פנה לסוכן כדי לחדש</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="trips" dir="rtl">
        <TabsList className="mb-5 w-full justify-start" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TabsTrigger value="trips" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            ✈️ הנסיעות שלי ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            📄 מסמכים ({allDocs.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            💳 תשלומים
          </TabsTrigger>
          <TabsTrigger value="checklist" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            ✅ לנסיעה
          </TabsTrigger>
        </TabsList>

        {/* ── Trips Tab ────────────────────────────────────────────────── */}
        <TabsContent value="trips" className="space-y-4">
          {leads.length === 0 ? (
            <div className="text-center py-16">
              <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">אין נסיעות עדיין</p>
              <p className="text-slate-600 text-sm mt-1">צור קשר עם הסוכן שלך להזמנה</p>
            </div>
          ) : (
            <>
              {upcomingLeads.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-3">נסיעות קרובות ופעילות</p>
                  <div className="space-y-3">
                    {upcomingLeads.map(l => (
                      <TripCard key={l.id} lead={l} docs={docsMap[l.id] || []} agentProfile={agentProfile} />
                    ))}
                  </div>
                </div>
              )}
              {pastLeads.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-slate-500 font-medium mb-3">נסיעות שהסתיימו</p>
                  <div className="space-y-3 opacity-70">
                    {pastLeads.map(l => (
                      <TripCard key={l.id} lead={l} docs={docsMap[l.id] || []} agentProfile={agentProfile} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Documents Tab ─────────────────────────────────────────────── */}
        <TabsContent value="documents">
          {allDocs.length === 0 ? (
            <div className="text-center py-16">
              <FileWarning className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">אין מסמכים עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allDocs.map(doc => {
                const lead = leads.find(l => l.id === doc.lead_id);
                const exp = daysUntil(doc.expiry_date);
                const isExpired = exp !== null && exp < 0;
                const isExpiring = exp !== null && exp >= 0 && exp <= 90;
                return (
                  <div key={doc.id} className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isExpired ? 'rgba(248,113,113,0.3)' : isExpiring ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                        {lead && <p className="text-xs text-slate-400 mt-0.5">✈️ {lead.destination || 'נסיעה'}</p>}
                      </div>
                      {doc.expiry_date && (
                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${isExpired ? 'bg-red-500/15 text-red-400' : isExpiring ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                          {isExpired ? '⚠️ פג תוקף' : `תוקף: ${formatDate(doc.expiry_date)}`}
                        </div>
                      )}
                    </div>
                    
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Payments Tab ──────────────────────────────────────────────── */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'סה"כ עלות', value: `₪${totalDue.toLocaleString()}`, color: '#f8fafc' },
              { label: 'שולם', value: `₪${totalPaid.toLocaleString()}`, color: '#34d399' },
              { label: 'יתרה', value: `₪${Math.max(totalDue - totalPaid, 0).toLocaleString()}`, color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {leads.map(lead => lead.total_price ? (
            <div key={lead.id} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{lead.destination}</p>
                  <p className="text-xs text-slate-400">{formatDate(lead.departure_date)}</p>
                </div>
                <p className="text-sm font-bold text-white">₪{lead.total_price.toLocaleString()}</p>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(((lead.deposit_amount || 0) / lead.total_price) * 100, 100)}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs">
                <span className="text-emerald-400">שולם ₪{(lead.deposit_amount || 0).toLocaleString()}</span>
                <span className="text-slate-400">{Math.round(((lead.deposit_amount || 0) / lead.total_price) * 100)}%</span>
              </div>
            </div>
          ) : null)}
        </TabsContent>

        {/* ── Checklist Tab ─────────────────────────────────────────────── */}
        <TabsContent value="checklist">
          <ChecklistTab leads={leads} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChecklistTab({ leads }: { leads: Lead[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setChecked(p => ({ ...p, [key]: !p[key] }));

  const ITEMS = [
    { key: 'passport', label: '🛂 דרכון בתוקף (לפחות 6 חודשים)' },
    { key: 'visa', label: '📋 ויזה (אם נדרשת)' },
    { key: 'tickets', label: '🎫 כרטיסי טיסה הורדו' },
    { key: 'insurance', label: '🏥 ביטוח נסיעות' },
    { key: 'hotel', label: '🏨 אישור מלון נשמר' },
    { key: 'forex', label: '💵 מטבע חוץ / כרטיס אשראי בינלאומי' },
    { key: 'emergency', label: '📱 מספרי חירום שמורים' },
    { key: 'luggage', label: '🧳 מגבלת כבודה בוצדקה' },
    { key: 'checkin', label: '✅ צ׳ק-אין אונליין (24 שעות לפני)' },
    { key: 'transfer', label: '🚗 העברה לשדה תעופה מסודרת' },
  ];

  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">רשימת מוכנות לנסיעה</h3>
        <span className="text-xs text-slate-400">{done}/{ITEMS.length}</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${(done / ITEMS.length) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#7c3aed)' }} />
      </div>
      <div className="space-y-2">
        {ITEMS.map(item => (
          <button key={item.key} onClick={() => toggle(item.key)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all"
            style={{ background: checked[item.key] ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${checked[item.key] ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked[item.key] ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'}`}>
              {checked[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${checked[item.key] ? 'text-slate-400 line-through' : 'text-white'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
