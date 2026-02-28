'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users, Search, Phone, Mail, MapPin, Calendar,
  Loader2, Star, RotateCcw, TrendingUp, Plane, FileText,
  Upload, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getLeads, getDocuments, addDocument } from '@/lib/leads';
import { Lead, Document, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/data';
import { supabase } from '@/lib/supabase';

type SortKey = 'name' | 'trips' | 'lastTrip';

type Customer = {
  phone: string;
  name: string;
  email: string;
  trips: Lead[];
  lastTrip?: Lead;
  isReturning: boolean;
  tags: string[];
};

function buildCustomers(leads: Lead[]): Customer[] {
  const map: Record<string, Lead[]> = {};
  leads.forEach(lead => {
    const key = lead.phone.replace(/\D/g, '');
    if (!map[key]) map[key] = [];
    map[key].push(lead);
  });

  return Object.values(map).map(trips => {
    const sorted = [...trips].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const allTags = Array.from(new Set(trips.flatMap(t => t.tags || [])));
    return {
      phone: trips[0].phone,
      name: sorted[0].name,
      email: sorted[0].email,
      trips: sorted,
      lastTrip: sorted[0],
      isReturning: trips.length > 1,
      tags: allTags,
    };
  }).sort((a, b) => b.trips.length - a.trips.length);
}

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'דרכון', visa: 'ויזה', ticket: 'כרטיס טיסה',
  voucher: "וואוצ'ר", contract: 'חוזה', other: 'אחר',
};

function getStatusDot(status: string) {
  const colors: Record<string, string> = {
    returned: 'bg-emerald-400', flying: 'bg-purple-400',
    paid: 'bg-green-400', proposal_sent: 'bg-blue-400', lead: 'bg-slate-400',
  };
  return colors[status] || 'bg-slate-400';
}

function UploadDocModal({ leadId, leadName, open, onClose }: {
  leadId: string; leadName: string; open: boolean; onClose: (newDoc?: Document) => void;
}) {
  const [docForm, setDocForm] = useState({ type: 'passport', name: '', expiry_date: '' });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!docForm.name) return;
    setUploading(true);
    let fileUrl = '#';
    if (docFile) {
      const ext = docFile.name.split('.').pop();
      const path = `leads/${leadId}/documents/${Date.now()}_${docForm.name.replace(/\s+/g, '_')}.${ext}`;
      const { data: uploadData, error } = await supabase.storage.from('avatars').upload(path, docFile, { upsert: true });
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }
    }
    const doc = await addDocument({
      lead_id: leadId,
      type: docForm.type as Document['type'],
      name: docForm.name,
      expiry_date: docForm.expiry_date || undefined,
      url: fileUrl,
    });
    setUploading(false);
    onClose(doc || undefined);
    setDocForm({ type: 'passport', name: '', expiry_date: '' });
    setDocFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="border-white/10 max-w-md" style={{ background: '#0f1a38' }}>
        <DialogHeader>
          <DialogTitle className="text-white">העלאת מסמך — {leadName}</DialogTitle>
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
              placeholder="לדוגמה: דרכון — ישראל ישראלי"
              value={docForm.name}
              onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <Label className="text-slate-300">תאריך תפוגה (אופציונלי)</Label>
            <Input className="mt-1 bg-white/5 border-white/20 text-white" type="date"
              value={docForm.expiry_date}
              onChange={e => setDocForm(f => ({ ...f, expiry_date: e.target.value }))}
            />
          </div>
          <div>
            <Label className="text-slate-300">קובץ</Label>
            <div
              className="mt-1 border-2 border-dashed border-white/20 rounded-xl p-5 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => setDocFile(e.target.files?.[0] || null)} />
              <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              {docFile
                ? <p className="text-sm text-blue-300 font-medium">{docFile.name}</p>
                : <><p className="text-sm text-slate-400">לחץ לבחירת קובץ</p><p className="text-xs text-slate-600 mt-0.5">PDF, JPG, PNG, DOC</p></>
              }
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleUpload} disabled={!docForm.name || uploading} className="flex-1 bg-blue-600 hover:bg-blue-700">
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

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForLead, setUploadForLead] = useState<Lead | null>(null);
  const [imgError, setImgError] = useState(false);

  const destination = customer.lastTrip?.destination;
  const heroImg = destination && !imgError
    ? `https://picsum.photos/seed/${encodeURIComponent(destination + '_travel')}/800/300`
    : null;

  const loadDocs = async () => {
    if (docsLoaded) return;
    setDocsLoading(true);
    // Load docs for all trips of this customer
    const allDocs: Document[] = [];
    for (const trip of customer.trips) {
      const docs = await getDocuments(trip.id);
      allDocs.push(...docs);
    }
    setDocuments(allDocs);
    setDocsLoading(false);
    setDocsLoaded(true);
  };

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!docsLoaded) loadDocs();
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 transition-all hover:border-blue-500/30"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)' }}>

      {/* Destination image header */}
      {heroImg && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={heroImg}
            alt={destination || ''}
            className="w-full h-full object-cover opacity-50"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {destination && (
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white font-semibold text-sm">{destination}</span>
            </div>
          )}
          {customer.isReturning && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-amber-500/80 text-white border-0 backdrop-blur text-xs gap-1">
                <Star className="w-3 h-3" />לקוח חוזר
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Main info row */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-purple-500/20">
              {customer.name.charAt(0)}
            </div>
            {customer.isReturning && !heroImg && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center border-2 border-black/20">
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-lg leading-tight">{customer.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300 transition-colors">
                <Phone className="w-3 h-3" />{customer.phone}
              </a>
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300 transition-colors">
                  <Mail className="w-3 h-3" />{customer.email}
                </a>
              )}
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {customer.tags.map(tag => (
                  <Badge key={tag} className="bg-white/8 text-slate-300 border-white/15 text-xs">
                    {tag === 'honeymoon' ? '💑 ירח דבש' : tag === 'vip' ? '⭐ VIP' : tag === 'kosher' ? '✡️ כשר' : tag === 'family' ? '👨‍👩‍👧 משפחה' : tag === 'solo' ? '🧳 יחיד' : tag === 'group' ? '👥 קבוצה' : tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/8">
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Plane className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-slate-300 font-medium">{customer.trips.length} {customer.trips.length === 1 ? 'נסיעה' : 'נסיעות'}</span>
          </div>
          {customer.lastTrip?.departure_date && (
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-slate-300">{new Date(customer.lastTrip.departure_date).toLocaleDateString('he-IL')}</span>
            </div>
          )}
          {customer.lastTrip && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${LEAD_STATUS_COLORS[customer.lastTrip.status]} border-current/30`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(customer.lastTrip.status)}`} />
              {LEAD_STATUS_LABELS[customer.lastTrip.status]}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-white/15 text-slate-300 bg-white/5 hover:bg-white/10 gap-1.5"
            onClick={handleExpand}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'סגור' : 'פרטים ומסמכים'}
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600/80 hover:bg-blue-600 text-white border-0"
            onClick={() => {
              setUploadForLead(customer.lastTrip || customer.trips[0]);
              setShowUpload(true);
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            העלה מסמך
          </Button>
          {customer.trips.length === 1 && (
            <Link href={`/leads/detail?id=${customer.trips[0].id}`}>
              <Button size="sm" variant="outline" className="border-white/15 text-slate-300 bg-white/5 hover:bg-white/10">
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {/* Expanded section — trips + documents */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-white/8 pt-4">
            {/* Trips list */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">נסיעות</p>
              <div className="space-y-2">
                {customer.trips.map(trip => (
                  <Link key={trip.id} href={`/leads/detail?id=${trip.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(trip.status)}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-200 truncate block">{trip.destination || 'יעד לא מוגדר'}</span>
                        <span className="text-xs text-slate-500">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('he-IL') : '—'}</span>
                      </div>
                      <Badge className={`${LEAD_STATUS_COLORS[trip.status]} border text-xs shrink-0`}>
                        {LEAD_STATUS_LABELS[trip.status]}
                      </Badge>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Documents section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">מסמכים</p>
                <button
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  onClick={() => {
                    setUploadForLead(customer.lastTrip || customer.trips[0]);
                    setShowUpload(true);
                  }}
                >
                  <Plus className="w-3 h-3" />העלה מסמך
                </button>
              </div>
              {docsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-6 rounded-xl border border-dashed border-white/10">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs text-slate-600">אין מסמכים</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3">
                      <div className="w-8 h-8 bg-blue-500/15 rounded-lg flex items-center justify-center border border-blue-500/20 shrink-0">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                      </div>
                      <div className="shrink-0 text-left">
                        {doc.expiry_date && (
                          <p className="text-xs text-slate-400">{new Date(doc.expiry_date).toLocaleDateString('he-IL')}</p>
                        )}
                        {doc.url && doc.url !== '#' && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">הורד</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload modal */}
      {uploadForLead && (
        <UploadDocModal
          leadId={uploadForLead.id}
          leadName={customer.name}
          open={showUpload}
          onClose={(newDoc) => {
            setShowUpload(false);
            if (newDoc) {
              setDocuments(prev => [newDoc, ...prev]);
              setDocsLoaded(true);
              if (!expanded) setExpanded(true);
            }
          }}
        />
      )}
    </div>
  );
}

// Missing import
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'returning'>('all');
  const [sort, setSort] = useState<SortKey>('trips');

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setLoading(false); });
  }, []);

  const customers = buildCustomers(leads);

  const filtered = customers
    .filter(c => {
      if (filter === 'returning' && !c.isReturning) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.email.toLowerCase().includes(s);
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'he');
      if (sort === 'trips') return b.trips.length - a.trips.length;
      if (sort === 'lastTrip') {
        const aDate = a.lastTrip?.created_at || '';
        const bDate = b.lastTrip?.created_at || '';
        return bDate.localeCompare(aDate);
      }
      return 0;
    });

  const returningCount = customers.filter(c => c.isReturning).length;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">לקוחות</h1>
          <p className="text-slate-400 mt-1 text-sm">כל הלקוחות, הנסיעות והמסמכים שלהם</p>
        </div>

        {/* KPI Row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Users, color: 'blue', value: customers.length, label: 'לקוחות' },
              { icon: RotateCcw, color: 'amber', value: returningCount, label: 'לקוחות חוזרים' },
              { icon: TrendingUp, color: 'purple', value: `${customers.length > 0 ? Math.round((returningCount / customers.length) * 100) : 0}%`, label: 'שיעור חזרה' },
            ].map(({ icon: Icon, color, value, label }) => (
              <div key={label}
                className="rounded-2xl border border-white/10 p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-${color}-500/20 border border-${color}-500/30`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="חיפוש לפי שם, טלפון, אימייל..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-9 bg-white/5 border-white/15 text-white placeholder:text-slate-500 focus:border-blue-500/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10'}
            >
              כולם
            </Button>
            <Button
              size="sm"
              onClick={() => setFilter('returning')}
              className={filter === 'returning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10'}
            >
              ⭐ חוזרים
            </Button>
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="border border-white/15 rounded-lg px-3 py-2 text-sm text-slate-300"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <option value="trips" style={{ background: '#0f1a38' }}>מיון: מספר נסיעות</option>
            <option value="name" style={{ background: '#0f1a38' }}>מיון: שם</option>
            <option value="lastTrip" style={{ background: '#0f1a38' }}>מיון: נסיעה אחרונה</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-500">לא נמצאו לקוחות</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(customer => (
              <CustomerCard key={customer.phone} customer={customer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
