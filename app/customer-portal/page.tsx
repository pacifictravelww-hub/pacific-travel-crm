'use client';

import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Plane, FileText, Phone, Loader2,
  Calendar, MapPin, Hotel, Users, CheckCircle2,
  Clock, AlertTriangle, MessageCircle, ChevronDown,
  ChevronUp, FileWarning, User, LogOut, Upload, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getLeadsByEmail, getLeadsByPhone, getDocuments, addDocument } from '@/lib/leads';
import { Lead, Document, LEAD_STATUS_LABELS, VACATION_TYPE_LABELS, BOARD_BASIS_LABELS, HOTEL_LEVEL_LABELS } from '@/lib/data';
import { signOut } from '@/lib/auth';

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

// ── Upload Doc Modal ──────────────────────────────────────────────────────
function UploadDocModal({ leadId, leadDest, open, onClose }: {
  leadId: string; leadDest: string; open: boolean; onClose: (doc?: Document) => void;
}) {
  const [form, setForm] = useState({ type: 'passport', name: '', expiry_date: '' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!form.name) return;
    setUploading(true);
    let url = '#';
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `leads/${leadId}/documents/${Date.now()}_${form.name.replace(/\s+/g,'_')}.${ext}`;
      const { data: up, error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (!error && up) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        url = urlData.publicUrl;
      }
    }
    const doc = await addDocument({
      lead_id: leadId,
      type: form.type as Document['type'],
      name: form.name,
      expiry_date: form.expiry_date || undefined,
      url,
    });
    setUploading(false);
    onClose(doc || undefined);
    setForm({ type: 'passport', name: '', expiry_date: '' });
    setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent dir="rtl" className="border-white/10 max-w-md" style={{ background: '#0a1628' }}>
        <DialogHeader>
          <DialogTitle className="text-white">העלאת מסמך — {leadDest}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-slate-300">סוג מסמך</Label>
            <select
              className="w-full mt-1 border border-white/20 rounded-md px-3 py-2 text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {Object.entries({ passport: 'דרכון', visa: 'ויזה', ticket: 'כרטיס טיסה', voucher: "אישור מלון", contract: 'חוזה', other: 'אחר' }).map(([v, l]) => (
                <option key={v} value={v} style={{ background: '#0a1628' }}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-slate-300">שם המסמך</Label>
            <Input
              className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-slate-500"
              placeholder="לדוגמה: דרכון — ישראל ישראלי"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label className="text-slate-300">תאריך תפוגה (אופציונלי)</Label>
            <Input className="mt-1 bg-white/5 border-white/20 text-white" type="date"
              value={form.expiry_date}
              onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
            />
          </div>
          {/* File upload drop zone */}
          <div>
            <Label className="text-slate-300">קובץ</Label>
            <div
              className="mt-1 border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              {file
                ? <p className="text-sm text-blue-300 font-medium">{file.name}</p>
                : <><p className="text-sm text-slate-400">לחץ לבחירת קובץ</p><p className="text-xs text-slate-600 mt-0.5">PDF, JPG, PNG, DOC</p></>
              }
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleSave} disabled={!form.name || uploading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
              {uploading ? 'מעלה...' : 'שמור מסמך'}
            </Button>
            <Button variant="outline" onClick={() => onClose()} className="border-white/20 text-white bg-transparent">ביטול</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Trip Card ──────────────────────────────────────────────────────────────
function TripCard({ lead, docs, agentProfile, onDocsUpdate }: {
  lead: Lead;
  docs: Document[];
  agentProfile: { full_name: string; phone?: string } | null;
  onDocsUpdate: (leadId: string, newDoc: Document) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [imgError, setImgError] = useState(false);
  const st = STATUS_STYLE[lead.status] ?? STATUS_STYLE.lead;
  const StatusIcon = st.icon;
  const daysToGo = daysUntil(lead.departure_date);
  const isPast = lead.status === 'returned';
  const isCurrent = lead.status === 'flying';

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.03)' }}>
      {/* Destination hero image */}
      {lead.destination && !imgError && (
        <div className="relative h-32 overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(lead.destination + '_travel')}/800/250`}
            alt={lead.destination}
            className="w-full h-full object-cover opacity-50"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 right-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white/80" />
            <span className="text-white font-bold text-base">{lead.destination}</span>
          </div>
          {isCurrent && (
            <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-300 animate-pulse"
              style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)' }}>
              <Plane className="w-3 h-3" /> בנסיעה עכשיו!
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {!lead.destination || imgError ? (
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-blue-400" />
            <h3 className="text-lg font-bold text-white">{lead.destination || 'יעד לא צוין'}</h3>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: st.bg, color: st.color }}>
              <StatusIcon className="w-3.5 h-3.5" />
              {st.label}
            </div>
            {lead.vacation_type && (
              <span className="text-xs text-slate-400">{VACATION_TYPE_LABELS[lead.vacation_type]}</span>
            )}
          </div>
          {!isPast && !isCurrent && daysToGo !== null && daysToGo > 0 && (
            <div className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
              {daysToGo} ימים ליציאה
            </div>
          )}
        </div>

        {/* Dates + travelers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            lead.departure_date && { label: 'יציאה', value: formatDate(lead.departure_date) },
            lead.return_date && { label: 'חזרה', value: formatDate(lead.return_date) },
            lead.adults && { label: 'נוסעים', value: `${lead.adults} אנשים` },
            lead.hotel_level && { label: 'מלון', value: HOTEL_LEVEL_LABELS[lead.hotel_level] },
          ].filter(Boolean).map((item, i) => item && (
            <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'פחות פרטים' : 'כל הפרטים'}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-300 hover:text-blue-200 transition-all"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
            <Upload className="w-3.5 h-3.5" />
            העלה מסמך
          </button>
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> מסמכים ({docs.length})</p>
              <button onClick={() => setShowUpload(true)}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" />הוסף
              </button>
            </div>
            {docs.length === 0 ? (
              <p className="text-xs text-slate-600">אין מסמכים לנסיעה זו</p>
            ) : (
              <div className="space-y-1.5">
                {docs.map(doc => {
                  const exp = daysUntil(doc.expiry_date);
                  return (
                    <div key={doc.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-xs text-slate-300">{DOC_TYPE_LABELS[doc.type] || doc.type} — {doc.name}</span>
                      <div className="flex items-center gap-2">
                        {doc.expiry_date && (
                          <span className={`text-xs ${exp !== null && exp < 0 ? 'text-red-400' : exp !== null && exp < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {exp !== null && exp < 0 ? '⚠️ פג תוקף' : `עד ${formatDate(doc.expiry_date)}`}
                          </span>
                        )}
                        {doc.url && doc.url !== '#' && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline">הורד</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {lead.notes && (
            <div>
              <p className="text-xs text-slate-500 mb-2">הערות מהסוכן</p>
              <p className="text-sm text-slate-300 leading-relaxed px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {lead.notes}
              </p>
            </div>
          )}

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

      {/* Upload modal */}
      <UploadDocModal
        leadId={lead.id}
        leadDest={lead.destination || 'נסיעה'}
        open={showUpload}
        onClose={(doc) => {
          setShowUpload(false);
          if (doc) onDocsUpdate(lead.id, doc);
        }}
      />
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

      let myLeads: Lead[] = [];
      if (user.email) myLeads = await getLeadsByEmail(user.email);
      if (myLeads.length === 0 && profile?.phone) myLeads = await getLeadsByPhone(profile.phone);
      setLeads(myLeads);

      const docsResult: Record<string, Document[]> = {};
      for (const lead of myLeads) {
        docsResult[lead.id] = await getDocuments(lead.id);
      }
      setDocsMap(docsResult);

      if (myLeads.length > 0 && myLeads[0].agent_id) {
        const { data: agent } = await supabase.from('profiles').select('full_name, phone').eq('id', myLeads[0].agent_id).single();
        if (agent) setAgentProfile(agent);
      }

      setLoading(false);
    };
    init();
  }, []);

  const handleDocsUpdate = (leadId: string, newDoc: Document) => {
    setDocsMap(prev => ({ ...prev, [leadId]: [newDoc, ...(prev[leadId] || [])] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 100%)' }}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  const upcomingLeads = leads.filter(l => l.status !== 'returned');
  const pastLeads = leads.filter(l => l.status === 'returned');
  const allDocs = Object.values(docsMap).flat();
  const expiringDocs = allDocs.filter(d => { const days = daysUntil(d.expiry_date); return days !== null && days >= 0 && days <= 90; });

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 60%, #0f0a20 100%)' }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">שלום, {userName} 👋</h1>
            <p className="text-slate-400 text-sm">הנסיעות שלי עם Pacific Travel</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-white/10 hover:border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">התנתק</span>
        </button>
      </div>

      {/* KPIs — 3 cards, no "total paid" */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Plane,    label: 'נסיעות',    value: leads.length.toString(),        color: '#60a5fa' },
          { icon: Calendar, label: 'קרובות',    value: upcomingLeads.length.toString(), color: '#a78bfa' },
          { icon: FileText, label: 'מסמכים',   value: allDocs.length.toString(),       color: '#34d399' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4"
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

      {/* 3 tabs — no payments */}
      <Tabs defaultValue="trips" dir="rtl">
        <TabsList className="mb-5 w-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <TabsTrigger value="trips" className="flex-1 data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            ✈️ נסיעות ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            📄 מסמכים ({allDocs.length})
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex-1 data-[state=active]:bg-blue-600/30 data-[state=active]:text-white text-slate-400">
            ✅ לנסיעה
          </TabsTrigger>
        </TabsList>

        {/* Trips Tab */}
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
                      <TripCard key={l.id} lead={l} docs={docsMap[l.id] || []} agentProfile={agentProfile} onDocsUpdate={handleDocsUpdate} />
                    ))}
                  </div>
                </div>
              )}
              {pastLeads.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-slate-500 font-medium mb-3">נסיעות שהסתיימו</p>
                  <div className="space-y-3 opacity-70">
                    {pastLeads.map(l => (
                      <TripCard key={l.id} lead={l} docs={docsMap[l.id] || []} agentProfile={agentProfile} onDocsUpdate={handleDocsUpdate} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          {allDocs.length === 0 ? (
            <div className="text-center py-16">
              <FileWarning className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">אין מסמכים עדיין</p>
              <p className="text-xs text-slate-600 mt-1">ניתן להעלות מסמכים מדף הנסיעות</p>
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
                        <p className="text-xs text-slate-500 mt-0.5">{doc.name}</p>
                        {lead && <p className="text-xs text-slate-500 mt-0.5">✈️ {lead.destination || 'נסיעה'}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {doc.expiry_date && (
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${isExpired ? 'bg-red-500/15 text-red-400' : isExpiring ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                            {isExpired ? '⚠️ פג תוקף' : `תוקף: ${formatDate(doc.expiry_date)}`}
                          </div>
                        )}
                        {doc.url && doc.url !== '#' && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline">הורד</a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Checklist Tab */}
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
    { key: 'luggage', label: '🧳 מגבלת כבודה בדוקה' },
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
