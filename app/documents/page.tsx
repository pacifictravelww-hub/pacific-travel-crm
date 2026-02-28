'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText, Search, Plus, Loader2, Upload,
  AlertTriangle, CheckCircle, Clock, Calendar, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getLeads, getDocuments, addDocument } from '@/lib/leads';
import { Lead, Document } from '@/lib/data';
import { supabase } from '@/lib/supabase';

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: '🛂 דרכון', visa: '🪪 ויזה', ticket: '✈️ כרטיס טיסה',
  voucher: "🏨 וואוצ'ר", contract: '📄 חוזה', other: '📎 אחר',
};
const DOC_TYPE_VALUES = ['passport', 'visa', 'ticket', 'voucher', 'contract', 'other'];

type DocWithLead = Document & { leadName: string; leadId: string };

function getExpiryStatus(date?: string): 'expired' | 'warning' | 'ok' | null {
  if (!date) return null;
  const days = Math.floor((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'expired';
  if (days < 30) return 'warning';
  return 'ok';
}

function ExpiryBadge({ date }: { date?: string }) {
  const status = getExpiryStatus(date);
  if (!status) return <span className="text-xs text-slate-600">ללא תוקף</span>;
  if (status === 'expired') return <Badge className="bg-red-500/15 text-red-400 border-red-500/25 text-xs">פג תוקף</Badge>;
  if (status === 'warning') return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 text-xs">בקרוב</Badge>;
  return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-xs">תקין</Badge>;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocWithLead[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ lead_id: '', type: 'passport', name: '', expiry_date: '' });
  const [adding, setAdding] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAll = async () => {
      const allLeads = await getLeads();
      setLeads(allLeads);
      const allDocs: DocWithLead[] = [];
      for (const lead of allLeads) {
        const leadDocs = await getDocuments(lead.id);
        leadDocs.forEach(d => allDocs.push({ ...d, leadName: lead.name, leadId: lead.id }));
      }
      setDocs(allDocs);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleAdd = async () => {
    if (!addForm.lead_id || !addForm.name) return;
    setAdding(true);
    let url = '#';
    if (docFile) {
      const ext = docFile.name.split('.').pop();
      const path = `leads/${addForm.lead_id}/documents/${Date.now()}_${addForm.name.replace(/\s+/g, '_')}.${ext}`;
      const { data: up, error } = await supabase.storage.from('avatars').upload(path, docFile, { upsert: true });
      if (!error && up) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        url = urlData.publicUrl;
      }
    }
    const doc = await addDocument({
      lead_id: addForm.lead_id, type: addForm.type as Document['type'],
      name: addForm.name, expiry_date: addForm.expiry_date || undefined, url,
    });
    if (doc) {
      const lead = leads.find(l => l.id === addForm.lead_id);
      setDocs(prev => [{ ...doc, leadName: lead?.name || '', leadId: addForm.lead_id }, ...prev]);
    }
    setAdding(false);
    setShowAddModal(false);
    setAddForm({ lead_id: '', type: 'passport', name: '', expiry_date: '' });
    setDocFile(null);
  };

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.leadName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    const expiryStatus = getExpiryStatus(d.expiry_date);
    const matchStatus = filterStatus === 'all' ? true : filterStatus === expiryStatus;
    return matchSearch && matchType && matchStatus;
  });

  const expiredCount = docs.filter(d => getExpiryStatus(d.expiry_date) === 'expired').length;
  const warningCount = docs.filter(d => getExpiryStatus(d.expiry_date) === 'warning').length;

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">מסמכים</h1>
          <p className="text-slate-400 mt-1 text-sm">ניהול מסמכי לקוחות — דרכונים, ויזות, כרטיסי טיסה</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">מסמך חדש</span>
        </Button>
      </div>

      {(expiredCount > 0 || warningCount > 0) && (
        <div className="mb-4 flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />{expiredCount} מסמכים פגי תוקף
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
              style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)', color: '#fb923c' }}>
              <Clock className="w-4 h-4 shrink-0" />{warningCount} מסמכים פגים בקרוב
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="חיפוש מסמך או לקוח..." value={search} onChange={e => setSearch(e.target.value)}
            className="pr-9 bg-white/5 border-white/15 text-white placeholder:text-slate-500 focus:border-blue-500/50" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-slate-300" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <option value="all" style={{ background: '#0f1a38' }}>כל הסוגים</option>
          {DOC_TYPE_VALUES.map(t => <option key={t} value={t} style={{ background: '#0f1a38' }}>{DOC_TYPE_LABELS[t]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm text-slate-300" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <option value="all" style={{ background: '#0f1a38' }}>כל הסטטוסים</option>
          <option value="expired" style={{ background: '#0f1a38' }}>פג תוקף</option>
          <option value="warning" style={{ background: '#0f1a38' }}>בקרוב</option>
          <option value="ok" style={{ background: '#0f1a38' }}>תקין</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">אין מסמכים</p>
          <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>הוסף מסמך ראשון</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(doc => {
            const expiryStatus = getExpiryStatus(doc.expiry_date);
            return (
              <div key={doc.id} className="rounded-xl p-4 transition-all hover:bg-white/5"
                style={{
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
                  border: `1px solid ${expiryStatus === 'expired' ? 'rgba(248,113,113,0.3)' : expiryStatus === 'warning' ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRight: expiryStatus === 'expired' ? '3px solid rgba(248,113,113,0.6)' : expiryStatus === 'warning' ? '3px solid rgba(251,146,60,0.5)' : undefined,
                }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {DOC_TYPE_LABELS[doc.type]?.split(' ')[0] || '📎'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm text-slate-200">{doc.name}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type]?.replace(/^.+ /, '')}</span>
                    </div>
                    <Link href={`/leads/detail?id=${doc.leadId}`} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />{doc.leadName}
                    </Link>
                  </div>
                  <div className="text-left shrink-0 flex flex-col items-end gap-1">
                    <ExpiryBadge date={doc.expiry_date} />
                    {doc.expiry_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />{new Date(doc.expiry_date).toLocaleDateString('he-IL')}
                      </div>
                    )}
                    {doc.url && doc.url !== '#' && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">הורד</a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1 text-slate-400"><FileText className="w-4 h-4" />{docs.length} מסמכים</span>
          <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-4 h-4" />{docs.filter(d => getExpiryStatus(d.expiry_date) === 'ok').length} תקינים</span>
          <span className="flex items-center gap-1 text-amber-400"><Clock className="w-4 h-4" />{warningCount} פגים בקרוב</span>
          <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-4 h-4" />{expiredCount} פגי תוקף</span>
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="border-white/10" style={{ background: '#0f1a38' }}>
          <DialogHeader><DialogTitle className="text-white">הוסף מסמך</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-slate-300">ליד / לקוח</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                value={addForm.lead_id} onChange={e => setAddForm(f => ({ ...f, lead_id: e.target.value }))}>
                <option value="" style={{ background: '#0f1a38' }}>בחר ליד...</option>
                {leads.map(l => <option key={l.id} value={l.id} style={{ background: '#0f1a38' }}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-slate-300">סוג מסמך</Label>
              <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm text-white"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}>
                {DOC_TYPE_VALUES.map(t => <option key={t} value={t} style={{ background: '#0f1a38' }}>{DOC_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-slate-300">שם המסמך</Label>
              <Input className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-slate-500" placeholder="לדוג': דרכון - ישראל ישראלי"
                value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-slate-300">תאריך תפוגה (אופציונלי)</Label>
              <Input className="mt-1 bg-white/5 border-white/20 text-white" type="date"
                value={addForm.expiry_date} onChange={e => setAddForm(f => ({ ...f, expiry_date: e.target.value }))} />
            </div>
            <div>
              <Label className="text-slate-300">קובץ (אופציונלי)</Label>
              <div className="mt-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                {docFile ? <p className="text-sm text-blue-300 font-medium">{docFile.name}</p>
                  : <><p className="text-sm text-slate-400">לחץ לבחירת קובץ</p><p className="text-xs text-slate-600 mt-0.5">PDF, JPG, PNG, DOC</p></>}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={!addForm.lead_id || !addForm.name || adding} onClick={handleAdd}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                {adding ? 'מעלה...' : 'שמור מסמך'}
              </Button>
              <Button variant="outline" className="border-white/20 text-white bg-transparent" onClick={() => setShowAddModal(false)}>ביטול</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
