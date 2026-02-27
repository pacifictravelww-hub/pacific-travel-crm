'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText, Search, Filter, Plus, Loader2,
  AlertTriangle, CheckCircle, Clock, Calendar, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getLeads, getDocuments, addDocument } from '@/lib/leads';
import { Lead, Document } from '@/lib/data';

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: '🛂 דרכון',
  visa: '🪪 ויזה',
  ticket: '✈️ כרטיס טיסה',
  voucher: "🏨 וואוצ'ר",
  contract: '📄 חוזה',
  other: '📎 אחר',
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
  if (!status) return <span className="text-xs text-slate-400">ללא תוקף</span>;
  if (status === 'expired') return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">פג תוקף</Badge>;
  if (status === 'warning') return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">בקרוב</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">תקין</Badge>;
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
    const doc = await addDocument({
      lead_id: addForm.lead_id,
      type: addForm.type as Document['type'],
      name: addForm.name,
      expiry_date: addForm.expiry_date || undefined,
      url: '#',
    });
    if (doc) {
      const lead = leads.find(l => l.id === addForm.lead_id);
      setDocs(prev => [{ ...doc, leadName: lead?.name || '', leadId: addForm.lead_id }, ...prev]);
    }
    setAdding(false);
    setShowAddModal(false);
    setAddForm({ lead_id: '', type: 'passport', name: '', expiry_date: '' });
  };

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.leadName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || d.type === filterType;
    const expiryStatus = getExpiryStatus(d.expiry_date);
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'expired' ? expiryStatus === 'expired' :
      filterStatus === 'warning' ? expiryStatus === 'warning' :
      filterStatus === 'ok' ? expiryStatus === 'ok' : true;
    return matchSearch && matchType && matchStatus;
  });

  // Summary
  const expiredCount = docs.filter(d => getExpiryStatus(d.expiry_date) === 'expired').length;
  const warningCount = docs.filter(d => getExpiryStatus(d.expiry_date) === 'warning').length;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">מסמכים</h1>
          <p className="text-slate-500 mt-1 text-sm">ניהול מסמכי לקוחות — דרכונים, ויזות, כרטיסי טיסה</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">מסמך חדש</span>
        </Button>
      </div>

      {/* Alert banner */}
      {(expiredCount > 0 || warningCount > 0) && (
        <div className="mb-4 flex flex-wrap gap-3">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{expiredCount} מסמכים פגי תוקף</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm text-orange-700">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{warningCount} מסמכים פגים בקרוב (30 יום)</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="חיפוש מסמך או לקוח..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">כל הסוגים</option>
          {DOC_TYPE_VALUES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="expired">פג תוקף</option>
          <option value="warning">בקרוב</option>
          <option value="ok">תקין</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-base">אין מסמכים</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setShowAddModal(true)}>הוסף מסמך ראשון</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(doc => {
            const expiryStatus = getExpiryStatus(doc.expiry_date);
            return (
              <Card key={doc.id} className={`border-0 shadow-sm hover:shadow-md transition-all ${expiryStatus === 'expired' ? 'border-r-4 border-r-red-400' : expiryStatus === 'warning' ? 'border-r-4 border-r-orange-400' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                      {DOC_TYPE_LABELS[doc.type]?.split(' ')[0] || '📎'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-sm text-slate-800">{doc.name}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type]?.replace(/^.+ /, '')}</span>
                      </div>
                      <Link href={`/leads/detail?id=${doc.leadId}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {doc.leadName}
                      </Link>
                    </div>

                    {/* Expiry */}
                    <div className="text-left shrink-0">
                      <ExpiryBadge date={doc.expiry_date} />
                      {doc.expiry_date && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.expiry_date).toLocaleDateString('he-IL')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && docs.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><FileText className="w-4 h-4" />{docs.length} מסמכים סה״כ</span>
          <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" />{docs.filter(d => getExpiryStatus(d.expiry_date) === 'ok').length} תקינים</span>
          <span className="flex items-center gap-1 text-orange-500"><Clock className="w-4 h-4" />{warningCount} פגים בקרוב</span>
          <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-4 h-4" />{expiredCount} פגי תוקף</span>
        </div>
      )}

      {/* Add Document Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף מסמך</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>ליד / לקוח</Label>
              <select
                className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                value={addForm.lead_id}
                onChange={e => setAddForm(f => ({ ...f, lead_id: e.target.value }))}
              >
                <option value="">בחר ליד...</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <Label>סוג מסמך</Label>
              <select
                className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                value={addForm.type}
                onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
              >
                {DOC_TYPE_VALUES.map(t => <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <Label>שם המסמך</Label>
              <Input className="mt-1" placeholder="לדוג': דרכון - ישראל ישראלי" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>תאריך תפוגה (אופציונלי)</Label>
              <Input className="mt-1" type="date" value={addForm.expiry_date} onChange={e => setAddForm(f => ({ ...f, expiry_date: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" disabled={!addForm.lead_id || !addForm.name || adding} onClick={handleAdd}>
                {adding ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                הוסף מסמך
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>ביטול</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
