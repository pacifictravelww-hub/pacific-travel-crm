'use client';

import { useState, useEffect, useRef } from 'react';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_BG, LeadStatus, Lead, Tag } from '@/lib/data';
import { getLeads, updateLead } from '@/lib/leads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Facebook, MessageCircle, Users, MapPin, Calendar, Phone, Plus, Loader2,
  ChevronDown, ChevronUp, Search, X, SlidersHorizontal, Filter
} from 'lucide-react';
import Link from 'next/link';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-3 h-3 text-blue-600" />,
  whatsapp: <MessageCircle className="w-3 h-3 text-green-600" />,
  referral: <Users className="w-3 h-3 text-purple-600" />,
  website: <MapPin className="w-3 h-3 text-orange-600" />,
};

const TAG_LABELS: Record<string, string> = {
  honeymoon: '💑 ירח דבש',
  family: '👨‍👩‍👧 משפחה',
  vip: '⭐ VIP',
  kosher: '✡️ כשר',
  solo: '🧳 יחיד',
  group: '👥 קבוצה',
};

const SOURCE_LABELS: Record<string, string> = {
  facebook: 'פייסבוק',
  whatsapp: 'ווטסאפ',
  referral: 'המלצה',
  website: 'אתר',
};

interface Filters {
  search: string;
  sources: string[];
  tags: string[];
  budgetMin: string;
  budgetMax: string;
  departurFrom: string;
  departureTo: string;
  hasDeposit: boolean | null;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  sources: [],
  tags: [],
  budgetMin: '',
  budgetMax: '',
  departurFrom: '',
  departureTo: '',
  hasDeposit: null,
};

function applyFilters(leads: Lead[], filters: Filters): Lead[] {
  return leads.filter(lead => {
    // Text search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match =
        lead.name.toLowerCase().includes(s) ||
        lead.phone.includes(s) ||
        lead.email?.toLowerCase().includes(s) ||
        lead.destination?.toLowerCase().includes(s);
      if (!match) return false;
    }
    // Sources
    if (filters.sources.length > 0 && !filters.sources.includes(lead.source)) return false;
    // Tags
    if (filters.tags.length > 0 && !filters.tags.some(t => lead.tags?.includes(t as Tag))) return false;
    // Budget
    if (filters.budgetMin && (lead.budget || 0) < Number(filters.budgetMin)) return false;
    if (filters.budgetMax && (lead.budget || 0) > Number(filters.budgetMax)) return false;
    // Departure date
    if (filters.departurFrom && lead.departure_date && lead.departure_date < filters.departurFrom) return false;
    if (filters.departureTo && lead.departure_date && lead.departure_date > filters.departureTo) return false;
    // Deposit
    if (filters.hasDeposit === true && !lead.deposit_paid) return false;
    if (filters.hasDeposit === false && lead.deposit_paid) return false;
    return true;
  });
}

function countActive(filters: Filters): number {
  let n = 0;
  if (filters.search) n++;
  if (filters.sources.length) n++;
  if (filters.tags.length) n++;
  if (filters.budgetMin || filters.budgetMax) n++;
  if (filters.departurFrom || filters.departureTo) n++;
  if (filters.hasDeposit !== null) n++;
  return n;
}

// ---- Filter Panel ----
function FilterPanel({ filters, onChange, onClose }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
      {/* Sources */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">מקור ליד</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SOURCE_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onChange({ ...filters, sources: toggle(filters.sources, val) })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                filters.sources.includes(val)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {SOURCE_ICONS[val]}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">תגיות</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TAG_LABELS).map(([val, label]) => (
            <button
              key={val}
              onClick={() => onChange({ ...filters, tags: toggle(filters.tags, val) })}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                filters.tags.includes(val)
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">תקציב (₪)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="מינימום"
            value={filters.budgetMin}
            onChange={e => onChange({ ...filters, budgetMin: e.target.value })}
            className="ltr text-sm h-8"
          />
          <span className="text-slate-400">—</span>
          <Input
            type="number"
            placeholder="מקסימום"
            value={filters.budgetMax}
            onChange={e => onChange({ ...filters, budgetMax: e.target.value })}
            className="ltr text-sm h-8"
          />
        </div>
      </div>

      {/* Departure Date */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">תאריך יציאה</p>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.departurFrom}
            onChange={e => onChange({ ...filters, departurFrom: e.target.value })}
            className="ltr text-sm h-8"
          />
          <span className="text-slate-400">—</span>
          <Input
            type="date"
            value={filters.departureTo}
            onChange={e => onChange({ ...filters, departureTo: e.target.value })}
            className="ltr text-sm h-8"
          />
        </div>
      </div>

      {/* Deposit */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">מקדמה</p>
        <div className="flex gap-2">
          {[
            { val: null, label: 'הכל' },
            { val: true, label: '✅ שולמה' },
            { val: false, label: '⏳ ממתינה' },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => onChange({ ...filters, hasDeposit: opt.val })}
              className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                filters.hasDeposit === opt.val
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          נקה הכל
        </button>
        <Button size="sm" onClick={onClose}>סגור</Button>
      </div>
    </div>
  );
}

// ---- Lead Card ----
function LeadCard({ lead, onDragStart, onDragEnd, dragging }: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragEnd: () => void;
  dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group cursor-grab active:cursor-grabbing select-none ${dragging ? 'opacity-40 scale-95' : ''}`}
    >
      <Link href={`/leads/detail?id=${lead.id}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{lead.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {SOURCE_ICONS[lead.source]}
                <span className="text-xs text-slate-400">{SOURCE_LABELS[lead.source] || lead.source}</span>
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-slate-700">₪{(lead.budget || 0).toLocaleString()}</div>
        </div>

        {lead.destination && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600 truncate">{lead.destination}</span>
          </div>
        )}

        {lead.departure_date && (
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500">
              {new Date(lead.departure_date).toLocaleDateString('he-IL')}
              {lead.return_date ? ` — ${new Date(lead.return_date).toLocaleDateString('he-IL')}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-3">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500">
            {lead.adults} מבוגרים{lead.children > 0 ? ` · ${lead.children} ילדים` : ''}{lead.infants > 0 ? ` · ${lead.infants} תינוקות` : ''}
          </span>
        </div>

        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lead.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs py-0 h-5 text-slate-600">
                {TAG_LABELS[tag] || tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors" onClick={e => e.stopPropagation()}>
            <Phone className="w-3 h-3" />{lead.phone}
          </a>
          {lead.deposit_paid && <span className="text-xs text-green-600 font-medium">✅ מקדמה</span>}
        </div>
      </Link>
    </div>
  );
}

// ---- Mobile Column ----
function MobileColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="w-full">
      <button
        className={`w-full rounded-xl border-2 p-3 mb-3 ${LEAD_STATUS_BG[status]} flex items-center justify-between`}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[status]}`}>{LEAD_STATUS_LABELS[status]}</span>
          <span className="text-sm font-bold text-slate-600">({leads.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {leads.length > 0 && <span className="text-xs text-slate-500">₪{leads.reduce((s, l) => s + (l.budget || 0), 0).toLocaleString()}</span>}
          {collapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      {!collapsed && (
        <div className="space-y-3">
          {leads.map(lead => (
            <Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
              <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">{lead.name.charAt(0)}</div>
                  <span className="font-semibold text-sm text-slate-800">{lead.name}</span>
                  <span className="mr-auto text-sm font-bold text-slate-700">₪{(lead.budget||0).toLocaleString()}</span>
                </div>
                {lead.destination && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.destination}</p>}
              </div>
            </Link>
          ))}
          {leads.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl h-16 flex items-center justify-center text-slate-300 text-sm">אין לידים</div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [draggingLead, setDraggingLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setLoading(false); });
  }, []);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false);
      }
    };
    if (showFilterPanel) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilterPanel]);

  const filtered = applyFilters(leads, filters);
  const activeCount = countActive(filters);

  const getLeadsByStatus = (status: LeadStatus) => filtered.filter(l => l.status === status);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggingLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingLead(null);
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (!draggingLead || draggingLead.status === status) { setDragOverColumn(null); return; }
    setLeads(prev => prev.map(l => l.id === draggingLead.id ? { ...l, status } : l));
    setDragOverColumn(null);
    await updateLead(draggingLead.id, { status });
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">לידים</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {activeCount > 0 ? `${filtered.length} מתוך ${leads.length} לידים` : `${leads.length} לידים במשפך`}
          </p>
        </div>
        <Link href="/leads/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">ליד חדש</span>
            <span className="sm:hidden">חדש</span>
          </Button>
        </Link>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-2 mb-4 relative" ref={filterRef}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="חיפוש לפי שם, טלפון, יעד..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="pr-9 bg-white"
          />
          {filters.search && (
            <button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <Button
          variant={activeCount > 0 ? 'default' : 'outline'}
          onClick={() => setShowFilterPanel(v => !v)}
          className="gap-2 shrink-0 relative"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">סינון</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Active filters quick chips */}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)} className="text-slate-400 hover:text-red-500 shrink-0 gap-1">
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">נקה</span>
          </Button>
        )}

        {/* Filter Panel Dropdown */}
        {showFilterPanel && (
          <div className="absolute top-full right-0 mt-2 w-full md:w-[480px] z-50" onClick={e => e.stopPropagation()}>
            <FilterPanel filters={filters} onChange={setFilters} onClose={() => setShowFilterPanel(false)} />
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.sources.map(s => (
            <span key={s} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
              {SOURCE_ICONS[s]}{SOURCE_LABELS[s]}
              <button onClick={() => setFilters(f => ({ ...f, sources: f.sources.filter(x => x !== s) }))}><X className="w-3 h-3 mr-0.5" /></button>
            </span>
          ))}
          {filters.tags.map(t => (
            <span key={t} className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
              {TAG_LABELS[t]}
              <button onClick={() => setFilters(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X className="w-3 h-3 mr-0.5" /></button>
            </span>
          ))}
          {(filters.budgetMin || filters.budgetMax) && (
            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
              תקציב: {filters.budgetMin ? `₪${Number(filters.budgetMin).toLocaleString()}` : '0'} — {filters.budgetMax ? `₪${Number(filters.budgetMax).toLocaleString()}` : '∞'}
              <button onClick={() => setFilters(f => ({ ...f, budgetMin: '', budgetMax: '' }))}><X className="w-3 h-3 mr-0.5" /></button>
            </span>
          )}
          {(filters.departurFrom || filters.departureTo) && (
            <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              יציאה: {filters.departurFrom || '...'} → {filters.departureTo || '...'}
              <button onClick={() => setFilters(f => ({ ...f, departurFrom: '', departureTo: '' }))}><X className="w-3 h-3 mr-0.5" /></button>
            </span>
          )}
          {filters.hasDeposit !== null && (
            <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              מקדמה: {filters.hasDeposit ? '✅ שולמה' : '⏳ ממתינה'}
              <button onClick={() => setFilters(f => ({ ...f, hasDeposit: null }))}><X className="w-3 h-3 mr-0.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && leads.length > 0 && (
        <div className="text-center py-16 text-slate-400">
          <Filter className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-base">לא נמצאו לידים תואמים</p>
          <button onClick={() => setFilters(DEFAULT_FILTERS)} className="mt-2 text-sm text-blue-600 hover:underline">נקה פילטרים</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {STATUS_ORDER.map(status => (
              <MobileColumn key={status} status={status} leads={getLeadsByStatus(status)} />
            ))}
          </div>

          {/* Desktop Kanban */}
          <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map(status => {
              const statusLeads = getLeadsByStatus(status);
              const isOver = dragOverColumn === status;
              return (
                <div
                  key={status}
                  className="flex-shrink-0 w-72"
                  onDragOver={(e) => { e.preventDefault(); setDragOverColumn(status); }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, status)}
                >
                  <div className={`rounded-xl border-2 p-3 mb-3 ${LEAD_STATUS_BG[status]} ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[status]}`}>
                        {LEAD_STATUS_LABELS[status]}
                      </span>
                      <span className="text-sm font-bold text-slate-600">{statusLeads.length}</span>
                    </div>
                    {statusLeads.length > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        ₪{statusLeads.reduce((s, l) => s + (l.budget || 0), 0).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className={`space-y-3 min-h-24 rounded-xl transition-colors ${isOver ? 'bg-blue-50/60 ring-2 ring-blue-200 ring-dashed p-2' : ''}`}>
                    {statusLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        dragging={draggingLead?.id === lead.id}
                      />
                    ))}
                    {statusLeads.length === 0 && (
                      <div className={`border-2 border-dashed rounded-xl h-24 flex items-center justify-center text-sm transition-colors ${isOver ? 'border-blue-400 text-blue-400 bg-blue-50' : 'border-slate-200 text-slate-300'}`}>
                        {isOver ? 'שחרר כאן' : 'אין לידים'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
