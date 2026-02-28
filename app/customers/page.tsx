'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Search, Phone, Mail, MapPin, Calendar,
  Loader2, Star, RotateCcw, TrendingUp, DollarSign, Plane,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getLeads } from '@/lib/leads';
import { Lead, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/data';

type SortKey = 'name' | 'totalSpent' | 'trips' | 'lastTrip';

type Customer = {
  phone: string;
  name: string;
  email: string;
  trips: Lead[];
  totalSpent: number;
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
    const totalSpent = trips.reduce((s, t) => s + (t.total_price || t.budget || 0), 0);
    const allTags = Array.from(new Set(trips.flatMap(t => t.tags || [])));
    return {
      phone: trips[0].phone, name: sorted[0].name, email: sorted[0].email,
      trips: sorted, totalSpent, lastTrip: sorted[0],
      isReturning: trips.length > 1, tags: allTags,
    };
  }).sort((a, b) => b.trips.length - a.trips.length || b.totalSpent - a.totalSpent);
}

function getStatusDot(status: string) {
  const c: Record<string, string> = { returned: 'bg-emerald-400', flying: 'bg-purple-400', paid: 'bg-green-400', proposal_sent: 'bg-blue-400', lead: 'bg-slate-400' };
  return c[status] || 'bg-slate-400';
}

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.4), rgba(167,139,250,0.4))' }}>
              {customer.name.charAt(0)}
            </div>
            {customer.isReturning && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(251,191,36,0.8)', border: '2px solid rgba(10,15,30,0.8)' }}>
                <Star className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300 transition-colors">
                    <Phone className="w-3 h-3" />{customer.phone}
                  </a>
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-300 transition-colors">
                      <Mail className="w-3 h-3" />{customer.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-lg font-bold text-emerald-400">₪{customer.totalSpent.toLocaleString()}</div>
                <div className="text-xs text-slate-500">סה״כ עסקאות</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(96,165,250,0.15)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' }}>
                <Plane className="w-3 h-3" />
                <span>{customer.trips.length} {customer.trips.length === 1 ? 'נסיעה' : 'נסיעות'}</span>
              </div>
              {customer.isReturning && (
                <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                  ⭐ לקוח חוזר
                </div>
              )}
              {customer.tags.map(tag => (
                <Badge key={tag} className="text-xs bg-white/8 text-slate-400 border-white/15">
                  {tag === 'honeymoon' ? '💑 ירח דבש' : tag === 'vip' ? '⭐ VIP' : tag === 'kosher' ? '✡️ כשר' : tag === 'family' ? '👨‍👩‍👧 משפחה' : tag === 'solo' ? '🧳 יחיד' : tag}
                </Badge>
              ))}
            </div>

            {customer.lastTrip?.destination && (
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>נסיעה אחרונה: {customer.lastTrip.destination}</span>
                {customer.lastTrip.departure_date && (
                  <span>· {new Date(customer.lastTrip.departure_date).toLocaleDateString('he-IL')}</span>
                )}
              </div>
            )}

            <button className="mt-3 text-xs text-blue-400 hover:underline flex items-center gap-1"
              onClick={() => setExpanded(e => !e)}>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {customer.trips.length > 1
                ? (expanded ? 'הסתר נסיעות' : `הצג ${customer.trips.length} נסיעות`)
                : 'צפה בפרטים'}
            </button>

            {expanded && (
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {customer.trips.map(trip => (
                  <Link key={trip.id} href={`/leads/detail?id=${trip.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(trip.status)}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-200 truncate block">{trip.destination || 'יעד לא מוגדר'}</span>
                        <span className="text-xs text-slate-500">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('he-IL') : '—'}</span>
                      </div>
                      <Badge className={`${LEAD_STATUS_COLORS[trip.status]} border text-xs`}>{LEAD_STATUS_LABELS[trip.status]}</Badge>
                      <span className="text-xs font-medium text-slate-400 shrink-0">₪{(trip.total_price || trip.budget || 0).toLocaleString()}</span>
                      <ExternalLink className="w-3 h-3 text-slate-600 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'returning'>('all');
  const [sort, setSort] = useState<SortKey>('trips');

  useEffect(() => { getLeads().then(data => { setLeads(data); setLoading(false); }); }, []);

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
      if (sort === 'totalSpent') return b.totalSpent - a.totalSpent;
      if (sort === 'trips') return b.trips.length - a.trips.length;
      if (sort === 'lastTrip') return (b.lastTrip?.created_at || '').localeCompare(a.lastTrip?.created_at || '');
      return 0;
    });

  const returningCount = customers.filter(c => c.isReturning).length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="p-4 md:p-6 min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">לקוחות</h1>
        <p className="text-slate-400 mt-1 text-sm">כל הלקוחות וההיסטוריה שלהם</p>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, value: customers.length, label: 'לקוחות', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
            { icon: RotateCcw, value: returningCount, label: 'חוזרים', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
            { icon: DollarSign, value: `₪${(totalRevenue/1000).toFixed(0)}K`, label: 'סה״כ עסקאות', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
            { icon: TrendingUp, value: `${customers.length > 0 ? Math.round((returningCount / customers.length) * 100) : 0}%`, label: 'שיעור חזרה', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
          ].map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: bg, border: `1px solid ${color}33` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="חיפוש לפי שם, טלפון, אימייל..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9 bg-white/5 border-white/15 text-white placeholder:text-slate-500 focus:border-blue-500/50" />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10'}>
            כולם
          </Button>
          <Button size="sm" onClick={() => setFilter('returning')}
            className={filter === 'returning' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-white/5 border border-white/15 text-slate-300 hover:bg-white/10'}>
            ⭐ חוזרים
          </Button>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="border rounded-lg px-3 py-2 text-sm text-slate-300"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}>
          <option value="trips" style={{ background: '#0f1a38' }}>מיון: מספר נסיעות</option>
          <option value="totalSpent" style={{ background: '#0f1a38' }}>מיון: סה״כ הוצאה</option>
          <option value="name" style={{ background: '#0f1a38' }}>מיון: שם</option>
          <option value="lastTrip" style={{ background: '#0f1a38' }}>מיון: נסיעה אחרונה</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-slate-500">לא נמצאו לקוחות</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(customer => (
            <CustomerCard key={customer.phone} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}
