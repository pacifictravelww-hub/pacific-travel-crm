'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Loader2, ChevronLeft, Phone, Mail, MapPin, Calendar,
  Users, FileText, MessageCircle, Plus, CheckCircle2,
  Clock, AlertCircle, Send, Pencil, Trash2, RotateCcw, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Lead, Document, LeadStatus,
  LEAD_STATUS_LABELS, LEAD_STATUS_COLORS,
  HOTEL_LEVEL_LABELS, BOARD_BASIS_LABELS, VACATION_TYPE_LABELS, SOURCE_LABELS,
  WHATSAPP_TEMPLATES,
} from '@/lib/data';
import { getLead, updateLead, deleteLead, getDocuments, addDocument } from '@/lib/leads';
import { supabase } from '@/lib/supabase';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];

const STATUS_NEXT_COLORS: Record<LeadStatus, string> = {
  lead: 'bg-blue-600 hover:bg-blue-700',
  proposal_sent: 'bg-green-600 hover:bg-green-700',
  paid: 'bg-purple-600 hover:bg-purple-700',
  flying: 'bg-orange-600 hover:bg-orange-700',
  returned: 'bg-slate-600 hover:bg-slate-700',
};

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'דרכון',
  visa: 'ויזה',
  ticket: 'כרטיס טיסה',
  voucher: "וואוצ'ר",
  contract: 'חוזה',
  other: 'אחר',
};

type FieldCheck = { field: keyof Lead; label: string; required: boolean };
const STAGE_REQUIREMENTS: Record<string, FieldCheck[]> = {
  lead_to_proposal_sent: [
    { field: 'destination', label: 'יעד', required: true },
    { field: 'departure_date', label: 'תאריך יציאה', required: true },
    { field: 'return_date', label: 'תאריך חזרה', required: true },
    { field: 'total_price', label: 'מחיר כולל', required: true },
    { field: 'commission', label: 'עמלה', required: true },
  ],
  proposal_sent_to_paid: [
    { field: 'total_price', label: 'מחיר כולל', required: true },
    { field: 'commission', label: 'עמלה', required: true },
    { field: 'deposit_amount', label: 'סכום מקדמה', required: false },
  ],
  paid_to_flying: [
    { field: 'departure_date', label: 'תאריך יציאה', required: true },
    { field: 'destination', label: 'יעד', required: true },
  ],
  flying_to_returned: [
    { field: 'return_date', label: 'תאריך חזרה', required: false },
  ],
};

type StageInput = { field: keyof Lead; label: string; type: string; placeholder?: string };
const STAGE_INPUTS: Record<string, StageInput[]> = {
  lead_to_proposal_sent: [
    { field: 'total_price', label: 'מחיר כולל (₪)', type: 'number', placeholder: '0' },
    { field: 'commission', label: 'עמלה (₪)', type: 'number', placeholder: '0' },
  ],
  proposal_sent_to_paid: [
    { field: 'deposit_amount', label: 'סכום מקדמה (₪)', type: 'number', placeholder: '0' },
  ],
  paid_to_flying: [],
  flying_to_returned: [],
};

function getExpiryColor(expiryDate?: string): string {
  if (!expiryDate) return 'text-slate-500';
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 30) return 'text-red-400 font-semibold';
  if (days < 90) return 'text-yellow-400 font-semibold';
  return 'text-emerald-400';
}

function getExpiryBadge(expiryDate?: string) {
  if (!expiryDate) return null;
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">פג תוקף</Badge>;
  if (days < 30) return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">פחות מ-30 יום</Badge>;
  if (days < 90) return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">פחות מ-90 יום</Badge>;
  return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">תקין</Badge>;
}

export default function LeadProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const [lead, setLead] = useState<Lead | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [docForm, setDocForm] = useState({ type: 'passport', name: '', expiry_date: '' });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stage advancement
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceDirection, setAdvanceDirection] = useState<'forward' | 'back'>('forward');
  const [stageInputs, setStageInputs] = useState<Record<string, string | number>>({});
  const [missingRequired, setMissingRequired] = useState<string[]>([]);
  const [advanceError, setAdvanceError] = useState('');

  useEffect(() => {
    Promise.all([getLead(id), getDocuments(id)]).then(([lead, docs]) => {
      setLead(lead);
      setEditForm(lead || {});
      setDocuments(docs);
      setLoading(false);
    });
  }, [id]);

  function validateStageTransition(from: LeadStatus, to: LeadStatus, currentLead: Lead): string[] {
    const key = `${from}_to_${to}`;
    const checks = STAGE_REQUIREMENTS[key] || [];
    return checks
      .filter(c => c.required && !currentLead[c.field])
      .map(c => c.label);
  }

  function getTransitionKey(from: LeadStatus, to: LeadStatus) {
    return `${from}_to_${to}`;
  }

  const openAdvanceModal = () => {
    if (!lead) return;
    const currentIndex = STATUS_ORDER.indexOf(lead.status);
    if (currentIndex >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIndex + 1];
    const missing = validateStageTransition(lead.status, nextStatus, lead);
    const key = getTransitionKey(lead.status, nextStatus);
    const inputs = STAGE_INPUTS[key] || [];
    const prefilled: Record<string, string | number> = {};
    inputs.forEach(inp => {
      const val = lead[inp.field];
      if (val !== undefined && val !== null) prefilled[inp.field as string] = val as string | number;
    });
    setStageInputs(prefilled);
    setMissingRequired(missing);
    setAdvanceDirection('forward');
    setAdvanceError('');
    setShowAdvanceModal(true);
  };

  const openGoBackModal = () => {
    if (!lead) return;
    const currentIndex = STATUS_ORDER.indexOf(lead.status);
    if (currentIndex <= 0) return;
    setStageInputs({});
    setMissingRequired([]);
    setAdvanceDirection('back');
    setAdvanceError('');
    setShowAdvanceModal(true);
  };

  const executeAdvance = async (skipValidation = false) => {
    if (!lead) return;
    const currentIndex = STATUS_ORDER.indexOf(lead.status);
    const targetStatus = advanceDirection === 'forward'
      ? STATUS_ORDER[currentIndex + 1]
      : STATUS_ORDER[currentIndex - 1];
    if (!targetStatus) return;

    if (!skipValidation && advanceDirection === 'forward') {
      const missing = validateStageTransition(lead.status, targetStatus, lead);
      if (missing.length > 0) { setMissingRequired(missing); return; }
    }

    setSaving(true);
    setAdvanceError('');
    const updates: Partial<Lead> = { status: targetStatus };
    if (advanceDirection === 'forward') {
      Object.entries(stageInputs).forEach(([k, v]) => {
        if (v !== '' && v !== undefined) {
          (updates as Record<string, unknown>)[k] = typeof v === 'string' ? (isNaN(Number(v)) ? v : Number(v)) : v;
        }
      });
    }
    const updated = await updateLead(id, updates);
    if (updated) { setLead(updated); setShowAdvanceModal(false); }
    else setAdvanceError('שגיאה בשמירה. נסה שוב.');
    setSaving(false);
  };

  const saveNotes = async (notes: string) => {
    if (!lead) return;
    await updateLead(id, { notes });
  };

  const handleDelete = async () => {
    const ok = await deleteLead(id);
    if (ok) router.push('/leads');
  };

  const handleEdit = async () => {
    if (!lead) return;
    setSaving(true);
    const updated = await updateLead(id, editForm);
    if (updated) setLead(updated);
    setSaving(false);
    setShowEditModal(false);
  };

  const handleAddDocument = async () => {
    if (!docForm.name) return;
    setUploadingDoc(true);

    let fileUrl = '#';

    // Upload file to Supabase Storage if selected
    if (docFile) {
      const ext = docFile.name.split('.').pop();
      const path = `leads/${id}/documents/${Date.now()}_${docForm.name.replace(/\s+/g, '_')}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, docFile, { upsert: true });
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }
    }

    const doc = await addDocument({
      lead_id: id,
      type: docForm.type as Document['type'],
      name: docForm.name,
      expiry_date: docForm.expiry_date || undefined,
      url: fileUrl,
    });

    if (doc) {
      setDocuments(prev => [doc, ...prev]);
    } else {
      setDocuments(prev => [{
        id: Math.random().toString(36).slice(2),
        lead_id: id,
        type: docForm.type as Document['type'],
        name: docForm.name,
        expiry_date: docForm.expiry_date || undefined,
        url: fileUrl,
        uploaded_at: new Date().toISOString(),
      }, ...prev]);
    }
    setUploadingDoc(false);
    setShowDocModal(false);
    setDocForm({ type: 'passport', name: '', expiry_date: '' });
    setDocFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">ליד לא נמצא</p>
        <Link href="/leads"><Button className="mt-4">חזרה ללידים</Button></Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(lead.status);
  const nextStatus = STATUS_ORDER[currentStatusIndex + 1];
  const prevStatus = STATUS_ORDER[currentStatusIndex - 1];
  const advanceModalNextStatus = advanceDirection === 'forward'
    ? STATUS_ORDER[currentStatusIndex + 1]
    : STATUS_ORDER[currentStatusIndex - 1];
  const transitionKey = nextStatus ? getTransitionKey(lead.status, nextStatus) : '';
  const modalInputFields = transitionKey ? (STAGE_INPUTS[transitionKey] || []) : [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-blue-300/70 hover:text-blue-300 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          חזרה ללידים
        </Link>

        {/* Hero Header */}
        <div className="relative rounded-2xl overflow-hidden mb-6 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          {/* Destination image stripe */}
          {lead.destination && (
            <div className="h-28 w-full relative overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(lead.destination)}/1200/200`}
                alt={lead.destination}
                className="w-full h-full object-cover opacity-60"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 right-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-white font-semibold text-lg">{lead.destination}</span>
              </div>
            </div>
          )}

          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg shadow-purple-500/30">
                {lead.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge className={`${LEAD_STATUS_COLORS[lead.status]} border`}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </Badge>
                  {lead.departure_date && (
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(lead.departure_date).toLocaleDateString('he-IL')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => router.push(`/leads/edit?id=${id}`)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ערוך</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10 bg-transparent"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">מחק</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="border-white/10" style={{ background: '#0f1a38' }}>
            <DialogHeader>
              <DialogTitle className="text-white">מחיקת ליד</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-300 py-2">האם אתה בטוח שברצונך למחוק את הליד של <strong className="text-white">{lead.name}</strong>?</p>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>כן, מחק</Button>
              <Button variant="outline" className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10" onClick={() => setShowDeleteConfirm(false)}>ביטול</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto border-white/10" style={{ background: '#0f1a38' }}>
            <DialogHeader>
              <DialogTitle className="text-white">עריכת ליד — {lead.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'שם מלא', field: 'name', type: 'text' },
                  { label: 'טלפון', field: 'phone', type: 'text' },
                  { label: 'אימייל', field: 'email', type: 'email' },
                  { label: 'יעד', field: 'destination', type: 'text' },
                  { label: 'תאריך יציאה', field: 'departure_date', type: 'date' },
                  { label: 'תאריך חזרה', field: 'return_date', type: 'date' },
                  { label: 'תקציב (₪)', field: 'budget', type: 'number' },
                  { label: 'מחיר כולל (₪)', field: 'total_price', type: 'number' },
                  { label: 'עמלה (₪)', field: 'commission', type: 'number' },
                  { label: 'מבוגרים', field: 'adults', type: 'number' },
                  { label: 'ילדים', field: 'children', type: 'number' },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <Label className="text-slate-300">{label}</Label>
                    <Input
                      className="mt-1 bg-white/5 border-white/20 text-white"
                      type={type}
                      value={(editForm as Record<string, unknown>)[field] as string ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-slate-300">הערות</Label>
                <Textarea className="mt-1 bg-white/5 border-white/20 text-white" value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleEdit} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}שמור שינויים
                </Button>
                <Button variant="outline" className="flex-1 border-white/20 text-white bg-transparent" onClick={() => setShowEditModal(false)}>ביטול</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stage Advancement Modal */}
        <Dialog open={showAdvanceModal} onOpenChange={setShowAdvanceModal}>
          <DialogContent className="max-w-md border-white/10" style={{ background: '#0f1a38' }} dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {advanceDirection === 'forward'
                  ? `קידום לשלב: ${advanceModalNextStatus ? LEAD_STATUS_LABELS[advanceModalNextStatus] : ''}`
                  : `החזרה לשלב: ${advanceModalNextStatus ? LEAD_STATUS_LABELS[advanceModalNextStatus] : ''}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {missingRequired.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-sm font-semibold text-amber-300">חסרים פרטים נדרשים:</p>
                  </div>
                  <ul className="space-y-1">
                    {missingRequired.map(f => (
                      <li key={f} className="text-xs text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-400/70 mt-2">תוכל להשלים כעת או להמשיך בלעדיהם.</p>
                </div>
              )}
              {advanceDirection === 'forward' && modalInputFields.map(inp => (
                <div key={inp.field as string}>
                  <Label className="text-slate-300">{inp.label}</Label>
                  <Input
                    className="mt-1 bg-white/5 border-white/20 text-white"
                    type={inp.type}
                    placeholder={inp.placeholder}
                    value={stageInputs[inp.field as string] ?? ''}
                    onChange={e => setStageInputs(prev => ({ ...prev, [inp.field as string]: e.target.value }))}
                  />
                </div>
              ))}
              {advanceDirection === 'back' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-orange-400 shrink-0" />
                    <p className="text-sm text-orange-300">
                      הליד יוחזר לשלב <strong>{advanceModalNextStatus ? LEAD_STATUS_LABELS[advanceModalNextStatus] : ''}</strong>
                    </p>
                  </div>
                </div>
              )}
              {advanceError && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{advanceError}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  className={`flex-1 ${advanceDirection === 'back' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={() => executeAdvance(false)}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                  {advanceDirection === 'forward' ? 'קדם שלב' : 'החזר שלב'}
                </Button>
                {missingRequired.length > 0 && advanceDirection === 'forward' && (
                  <Button variant="outline" className="flex-1 border-white/20 text-slate-300 bg-transparent" onClick={() => executeAdvance(true)} disabled={saving}>
                    המשך בלי הפרטים
                  </Button>
                )}
                <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10" onClick={() => setShowAdvanceModal(false)} disabled={saving}>ביטול</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Bar */}
        <div className="rounded-2xl p-4 mb-6 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {STATUS_ORDER.map((status, i) => (
              <div key={status} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${i < currentStatusIndex ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    i === currentStatusIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' :
                    'bg-white/5 text-slate-500 border border-white/10'}`}>
                  {i < currentStatusIndex && <CheckCircle2 className="w-3 h-3" />}
                  {LEAD_STATUS_LABELS[status]}
                </div>
                {i < STATUS_ORDER.length - 1 && <ChevronLeft className="w-3 h-3 text-slate-600 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {nextStatus && (
              <Button onClick={openAdvanceModal} disabled={saving} className={`${STATUS_NEXT_COLORS[lead.status]} text-white font-semibold shadow-lg`}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                קדם לשלב: {LEAD_STATUS_LABELS[nextStatus]}
              </Button>
            )}
            {prevStatus && (
              <Button onClick={openGoBackModal} disabled={saving} variant="outline" className="gap-1.5 border-white/20 text-slate-300 bg-transparent hover:bg-white/10">
                <RotateCcw className="w-3.5 h-3.5" />
                החזר שלב
              </Button>
            )}
            {!nextStatus && (
              <div className="text-sm text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />הושלמו כל השלבים
              </div>
            )}
          </div>
        </div>

        {/* Tabs — 3 tabs (no payments) */}
        <Tabs defaultValue="details" dir="rtl">
          <TabsList className="grid grid-cols-3 w-full mb-6" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
            <TabsTrigger value="details" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">פרטים</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">מסמכים</TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400">אוטומציות</TabsTrigger>
          </TabsList>

          {/* Tab 1: Details */}
          <TabsContent value="details" className="space-y-4">
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-semibold text-white">פרטי קשר</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href={`tel:${lead.phone}`} className="text-blue-300 hover:underline">{lead.phone}</a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-blue-300 hover:underline">{lead.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-slate-500 text-xs">מקור:</span>
                  <span>{SOURCE_LABELS[lead.source]}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-slate-500 text-xs">נוצר:</span>
                  <span>{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="font-semibold text-white">פרטי נסיעה</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'יעד', value: lead.destination },
                  { label: 'סוג חופשה', value: VACATION_TYPE_LABELS[lead.vacation_type] },
                  { label: 'רמת מלון', value: HOTEL_LEVEL_LABELS[lead.hotel_level] },
                  { label: 'בסיס תזונה', value: BOARD_BASIS_LABELS[lead.board_basis] },
                  { label: 'תאריך יציאה', value: lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('he-IL') : null },
                  { label: 'תאריך חזרה', value: lead.return_date ? new Date(lead.return_date).toLocaleDateString('he-IL') : null },
                  { label: 'נוסעים', value: `${lead.adults} מבוגרים${lead.children > 0 ? ` · ${lead.children} ילדים` : ''}${lead.infants > 0 ? ` · ${lead.infants} תינוקות` : ''}` },
                  { label: 'תקציב', value: `₪${(lead.budget || 0).toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-slate-200">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
              <div className="rounded-2xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <h3 className="font-semibold text-white mb-3">תגיות</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map(tag => (
                    <Badge key={tag} className="bg-white/10 text-slate-300 border-white/20 text-sm">
                      {tag === 'honeymoon' ? '💑 ירח דבש' : tag === 'vip' ? '⭐ VIP' : tag === 'kosher' ? '✡️ כשר' : tag === 'family' ? '👨‍👩‍👧 משפחה' : tag === 'solo' ? '🧳 יחיד' : tag === 'group' ? '👥 קבוצה' : tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 p-5" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-semibold text-white mb-3">הערות</h3>
              <Textarea
                defaultValue={lead.notes || ''}
                placeholder="הוסף הערות..."
                className="min-h-[120px] text-sm bg-white/5 border-white/20 text-white placeholder:text-slate-500"
                onBlur={e => saveNotes(e.target.value)}
              />
              <p className="text-xs text-slate-500 mt-1">ההערות נשמרות אוטומטית בעזיבת השדה</p>
            </div>
          </TabsContent>

          {/* Tab 2: Documents */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-300">{documents.length} מסמכים</h3>
              <Button size="sm" onClick={() => setShowDocModal(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" />העלה מסמך
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-2xl border border-white/10 p-12 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-slate-500">אין מסמכים עדיין</p>
                <Button size="sm" variant="outline" className="mt-3 border-white/20 text-slate-300 bg-transparent" onClick={() => setShowDocModal(true)}>
                  העלה מסמך ראשון
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="rounded-xl border border-white/10 p-4 hover:border-blue-500/30 transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/30">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                        </div>
                      </div>
                      <div className="text-left shrink-0 flex flex-col items-end gap-1">
                        {doc.expiry_date ? (
                          <>
                            {getExpiryBadge(doc.expiry_date)}
                            <p className={`text-xs ${getExpiryColor(doc.expiry_date)}`}>
                              {new Date(doc.expiry_date).toLocaleDateString('he-IL')}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600">ללא תוקף</span>
                        )}
                        {doc.url && doc.url !== '#' && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                            הורד
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Upload Document Modal */}
            <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
              <DialogContent className="border-white/10" style={{ background: '#0f1a38' }}>
                <DialogHeader>
                  <DialogTitle className="text-white">העלאת מסמך</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-slate-300">סוג מסמך</Label>
                    <select
                      className="w-full mt-1 border border-white/20 rounded-md px-3 py-2 text-sm text-white"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      value={docForm.type}
                      onChange={e => setDocForm(f => ({ ...f, type: e.target.value }))}
                    >
                      {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                        <option key={val} value={val} style={{ background: '#0f1a38' }}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-slate-300">שם מסמך</Label>
                    <Input
                      className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-slate-500"
                      placeholder="לדוגמה: דרכון - ישראל ישראלי"
                      value={docForm.name}
                      onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">תאריך תפוגה (אופציונלי)</Label>
                    <Input
                      className="mt-1 bg-white/5 border-white/20 text-white"
                      type="date"
                      value={docForm.expiry_date}
                      onChange={e => setDocForm(f => ({ ...f, expiry_date: e.target.value }))}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label className="text-slate-300">קובץ (אופציונלי)</Label>
                    <div
                      className="mt-1 border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => setDocFile(e.target.files?.[0] || null)}
                      />
                      <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                      {docFile ? (
                        <p className="text-sm text-blue-300 font-medium">{docFile.name}</p>
                      ) : (
                        <>
                          <p className="text-sm text-slate-400">לחץ להעלאת קובץ</p>
                          <p className="text-xs text-slate-600 mt-1">PDF, JPG, PNG, DOC</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleAddDocument} disabled={!docForm.name || uploadingDoc} className="flex-1 bg-blue-600 hover:bg-blue-700">
                      {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                      {uploadingDoc ? 'מעלה...' : 'שמור מסמך'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDocModal(false)} className="border-white/20 text-white bg-transparent">
                      ביטול
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Tab 3: Automations */}
          <TabsContent value="automations" className="space-y-4">
            <p className="text-sm text-slate-400">תבניות הודעות WhatsApp לפי שלב</p>
            {STATUS_ORDER.map(status => {
              const templates = WHATSAPP_TEMPLATES[status] || [];
              const isCurrentStage = status === lead.status;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`${LEAD_STATUS_COLORS[status]} border`}>{LEAD_STATUS_LABELS[status]}</Badge>
                    {isCurrentStage && <span className="text-xs text-blue-400 font-medium">שלב נוכחי</span>}
                  </div>
                  <div className="space-y-2 mb-4">
                    {templates.map((tpl, i) => (
                      <div key={i} className={`rounded-xl border p-4 ${isCurrentStage ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white mb-1">{tpl.title}</p>
                            <p className="text-xs text-slate-400 leading-relaxed rounded-lg p-3 border border-white/10 bg-white/5">
                              {tpl.message.replace('{name}', lead.name).replace('{destination}', lead.destination || 'היעד')}
                            </p>
                          </div>
                          <Button size="sm" className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                            <Send className="w-3 h-3" />שלח
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
