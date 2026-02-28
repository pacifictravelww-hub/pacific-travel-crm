'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, Loader2, ChevronLeft, Phone, Mail, MapPin, Calendar,
  Users, DollarSign, FileText, MessageCircle, Plus, X, CheckCircle2,
  Clock, AlertCircle, Send, Pencil, Trash2
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

function getExpiryColor(expiryDate?: string): string {
  if (!expiryDate) return 'text-slate-500';
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 30) return 'text-red-600 font-semibold';
  if (days < 90) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
}

function getExpiryBadge(expiryDate?: string) {
  if (!expiryDate) return null;
  const days = Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return <Badge className="bg-red-100 text-red-700 border-red-200">פג תוקף</Badge>;
  if (days < 30) return <Badge className="bg-red-100 text-red-700 border-red-200">פחות מ-30 יום</Badge>;
  if (days < 90) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">פחות מ-90 יום</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-200">תקין</Badge>;
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

  useEffect(() => {
    Promise.all([getLead(id), getDocuments(id)]).then(([lead, docs]) => {
      setLead(lead);
      setEditForm(lead || {});
      setDocuments(docs);
      setLoading(false);
    });
  }, [id]);

  const advanceStatus = async () => {
    if (!lead) return;
    const currentIndex = STATUS_ORDER.indexOf(lead.status);
    if (currentIndex >= STATUS_ORDER.length - 1) return;
    const nextStatus = STATUS_ORDER[currentIndex + 1];
    setSaving(true);
    const updated = await updateLead(id, { status: nextStatus });
    if (updated) setLead(updated);
    else setLead(prev => prev ? { ...prev, status: nextStatus } : null);
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
    const doc = await addDocument({
      lead_id: id,
      type: docForm.type as Document['type'],
      name: docForm.name,
      expiry_date: docForm.expiry_date || undefined,
      url: '#',
    });
    if (doc) {
      setDocuments(prev => [doc, ...prev]);
    } else {
      // fallback: add locally
      setDocuments(prev => [{
        id: Math.random().toString(36).slice(2),
        lead_id: id,
        type: docForm.type as Document['type'],
        name: docForm.name,
        expiry_date: docForm.expiry_date || undefined,
        url: '#',
        uploaded_at: new Date().toISOString(),
      }, ...prev]);
    }
    setShowDocModal(false);
    setDocForm({ type: 'passport', name: '', expiry_date: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">ליד לא נמצא</p>
        <Link href="/leads"><Button className="mt-4">חזרה ללידים</Button></Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(lead.status);
  const nextStatus = STATUS_ORDER[currentStatusIndex + 1];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
        <ArrowRight className="w-4 h-4" />
        חזרה ללידים
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0">
          {lead.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge className={`${LEAD_STATUS_COLORS[lead.status]} border`}>
              {LEAD_STATUS_LABELS[lead.status]}
            </Badge>
            {lead.destination && (
              <span className="text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{lead.destination}
              </span>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/leads/edit?id=${id}`)}>
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ערוך</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">מחק</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת ליד</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">האם אתה בטוח שברצונך למחוק את הליד של <strong>{lead.name}</strong>? פעולה זו אינה ניתנת לביטול.</p>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>כן, מחק</Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>ביטול</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>עריכת ליד — {lead.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>שם מלא</Label>
                <Input className="mt-1" value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>טלפון</Label>
                <Input className="mt-1" value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <Label>אימייל</Label>
                <Input className="mt-1" type="email" value={editForm.email || ''} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <Label>יעד</Label>
                <Input className="mt-1" value={editForm.destination || ''} onChange={e => setEditForm(f => ({ ...f, destination: e.target.value }))} />
              </div>
              <div>
                <Label>תאריך יציאה</Label>
                <Input className="mt-1" type="date" value={editForm.departure_date?.slice(0,10) || ''} onChange={e => setEditForm(f => ({ ...f, departure_date: e.target.value }))} />
              </div>
              <div>
                <Label>תאריך חזרה</Label>
                <Input className="mt-1" type="date" value={editForm.return_date?.slice(0,10) || ''} onChange={e => setEditForm(f => ({ ...f, return_date: e.target.value }))} />
              </div>
              <div>
                <Label>תקציב (₪)</Label>
                <Input className="mt-1" type="number" value={editForm.budget || ''} onChange={e => setEditForm(f => ({ ...f, budget: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>מחיר כולל (₪)</Label>
                <Input className="mt-1" type="number" value={editForm.total_price || ''} onChange={e => setEditForm(f => ({ ...f, total_price: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>מבוגרים</Label>
                <Input className="mt-1" type="number" min={1} value={editForm.adults || 1} onChange={e => setEditForm(f => ({ ...f, adults: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>ילדים</Label>
                <Input className="mt-1" type="number" min={0} value={editForm.children || 0} onChange={e => setEditForm(f => ({ ...f, children: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea className="mt-1" value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleEdit} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                שמור שינויים
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>ביטול</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Bar */}
      <Card className="mb-6 border-2 border-slate-200">
        <CardContent className="p-4">
          {/* Progress steps */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto">
            {STATUS_ORDER.map((status, i) => (
              <div key={status} className="flex items-center gap-1 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${i < currentStatusIndex ? 'bg-blue-100 text-blue-700' :
                    i === currentStatusIndex ? 'bg-blue-600 text-white shadow-md' :
                    'bg-slate-100 text-slate-400'}`}>
                  {i < currentStatusIndex && <CheckCircle2 className="w-3 h-3" />}
                  {LEAD_STATUS_LABELS[status]}
                </div>
                {i < STATUS_ORDER.length - 1 && <ChevronLeft className="w-3 h-3 text-slate-300 shrink-0" />}
              </div>
            ))}
          </div>

          {nextStatus && (
            <Button
              onClick={advanceStatus}
              disabled={saving}
              className={`w-full md:w-auto ${STATUS_NEXT_COLORS[lead.status]} text-white font-semibold py-2 px-6`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              ← קדם לשלב: {LEAD_STATUS_LABELS[nextStatus]}
            </Button>
          )}
          {!nextStatus && (
            <div className="text-sm text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              הושלמו כל השלבים
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" dir="rtl">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="details">פרטים</TabsTrigger>
          <TabsTrigger value="payments">תשלומים</TabsTrigger>
          <TabsTrigger value="documents">מסמכים</TabsTrigger>
          <TabsTrigger value="automations">אוטומציות</TabsTrigger>
        </TabsList>

        {/* Tab 1: Details */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">פרטי קשר</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 text-xs w-4 text-center">מקור</span>
                <span>{SOURCE_LABELS[lead.source]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400 text-xs">נוצר:</span>
                <span>{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">פרטי נסיעה</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-500">יעד</Label>
                <p className="text-sm font-medium mt-1">{lead.destination || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">סוג חופשה</Label>
                <p className="text-sm font-medium mt-1">{VACATION_TYPE_LABELS[lead.vacation_type] || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">תאריך יציאה</Label>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {lead.departure_date ? new Date(lead.departure_date).toLocaleDateString('he-IL') : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">תאריך חזרה</Label>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {lead.return_date ? new Date(lead.return_date).toLocaleDateString('he-IL') : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">רמת מלון</Label>
                <p className="text-sm font-medium mt-1">{HOTEL_LEVEL_LABELS[lead.hotel_level] || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">בסיס תזונה</Label>
                <p className="text-sm font-medium mt-1">{BOARD_BASIS_LABELS[lead.board_basis] || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">נוסעים</Label>
                <p className="text-sm font-medium mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {lead.adults} מבוגרים
                  {lead.children > 0 ? ` · ${lead.children} ילדים` : ''}
                  {lead.infants > 0 ? ` · ${lead.infants} תינוקות` : ''}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-500">תקציב</Label>
                <p className="text-sm font-medium mt-1">₪{(lead.budget || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {lead.tags && lead.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">תגיות</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag === 'honeymoon' ? '💑 ירח דבש' :
                       tag === 'vip' ? '⭐ VIP' :
                       tag === 'kosher' ? '✡️ כשר' :
                       tag === 'family' ? '👨‍👩‍👧 משפחה' :
                       tag === 'solo' ? '🧳 יחיד' :
                       tag === 'group' ? '👥 קבוצה' : tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">הערות</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                defaultValue={lead.notes || ''}
                placeholder="הוסף הערות..."
                className="min-h-[120px] text-sm"
                onBlur={e => saveNotes(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">ההערות נשמרות אוטומטית בעזיבת השדה</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 mb-1">מחיר כולל</p>
                <p className="text-2xl font-bold text-blue-800">
                  ₪{(lead.total_price || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-green-600 mb-1">עמלה</p>
                <p className="text-2xl font-bold text-green-800">
                  ₪{(lead.commission || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className={lead.deposit_paid ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}>
              <CardContent className="p-4 text-center">
                <p className={`text-xs mb-1 ${lead.deposit_paid ? 'text-green-600' : 'text-orange-600'}`}>מקדמה</p>
                <p className={`text-2xl font-bold ${lead.deposit_paid ? 'text-green-800' : 'text-orange-800'}`}>
                  ₪{(lead.deposit_amount || 0).toLocaleString()}
                </p>
                <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${lead.deposit_paid ? 'text-green-600' : 'text-orange-600'}`}>
                  {lead.deposit_paid
                    ? <><CheckCircle2 className="w-3 h-3" /> שולמה</>
                    : <><Clock className="w-3 h-3" /> ממתינה</>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">יתרה לתשלום</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">סכום יתרה</span>
                <span className="text-lg font-bold text-slate-800">₪{(lead.balance_amount || 0).toLocaleString()}</span>
              </div>
              {lead.balance_due_date && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">תאריך תשלום יתרה</span>
                  <span className={`text-sm font-medium ${getExpiryColor(lead.balance_due_date)}`}>
                    {new Date(lead.balance_due_date).toLocaleDateString('he-IL')}
                  </span>
                </div>
              )}

              {/* Payment status summary */}
              <div className="pt-2 border-t border-slate-200">
                {!lead.total_price ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <AlertCircle className="w-4 h-4" />
                    לא הוגדר מחיר לעסקה
                  </div>
                ) : lead.deposit_paid && lead.balance_amount === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    עסקה שולמה במלואה
                  </div>
                ) : lead.deposit_paid ? (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    מקדמה שולמה — יתרה ממתינה לתשלום
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    מקדמה טרם שולמה
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Documents */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">{documents.length} מסמכים</h3>
            <Button size="sm" onClick={() => setShowDocModal(true)} className="gap-1.5">
              <Plus className="w-4 h-4" />
              הוסף מסמך
            </Button>
          </div>

          {documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>אין מסמכים עדיין</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowDocModal(true)}>
                  הוסף מסמך ראשון
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <Card key={doc.id} className="hover:border-blue-200 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {doc.expiry_date ? (
                          <>
                            {getExpiryBadge(doc.expiry_date)}
                            <p className={`text-xs mt-1 ${getExpiryColor(doc.expiry_date)}`}>
                              {new Date(doc.expiry_date).toLocaleDateString('he-IL')}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">ללא תוקף</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Document Modal */}
          <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הוסף מסמך</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>סוג מסמך</Label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={docForm.type}
                    onChange={e => setDocForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {Object.entries(DOC_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>שם מסמך</Label>
                  <Input
                    className="mt-1"
                    placeholder="לדוגמה: דרכון - ישראל ישראלי"
                    value={docForm.name}
                    onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>תאריך תפוגה (אופציונלי)</Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={docForm.expiry_date}
                    onChange={e => setDocForm(f => ({ ...f, expiry_date: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddDocument} disabled={!docForm.name} className="flex-1">
                    הוסף מסמך
                  </Button>
                  <Button variant="outline" onClick={() => setShowDocModal(false)}>
                    ביטול
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Tab 4: Automations */}
        <TabsContent value="automations" className="space-y-4">
          <p className="text-sm text-slate-500">תבניות הודעות WhatsApp לפי שלב</p>
          {STATUS_ORDER.map(status => {
            const templates = WHATSAPP_TEMPLATES[status] || [];
            const isCurrentStage = status === lead.status;
            return (
              <div key={status}>
                <div className={`flex items-center gap-2 mb-2`}>
                  <Badge className={`${LEAD_STATUS_COLORS[status]} border`}>
                    {LEAD_STATUS_LABELS[status]}
                  </Badge>
                  {isCurrentStage && <span className="text-xs text-blue-600 font-medium">← שלב נוכחי</span>}
                </div>
                <div className="space-y-2 mb-4">
                  {templates.map((tpl, i) => (
                    <Card key={i} className={`border ${isCurrentStage ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 mb-1">{tpl.title}</p>
                            <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-lg p-3">
                              {tpl.message.replace('{name}', lead.name).replace('{destination}', lead.destination || 'היעד')}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            title="שלח הודעה (UI בלבד)"
                          >
                            <Send className="w-3 h-3" />
                            שלח
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
