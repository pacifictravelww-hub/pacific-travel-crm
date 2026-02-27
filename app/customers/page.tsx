'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Search, Phone, Mail, MapPin, Calendar,
  Loader2, Star, RotateCcw, TrendingUp, DollarSign, Plane
} from 'lucide-react';
import Link from 'next/link';
import { getLeads } from '@/lib/leads';
import { Lead, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/data';

type SortKey = 'name' | 'totalSpent' | 'trips' | 'lastTrip';

// Group leads by customer (phone number = identity)
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
      phone: trips[0].phone,
      name: sorted[0].name,
      email: sorted[0].email,
      trips: sorted,
      totalSpent,
      lastTrip: sorted[0],
      isReturning: trips.length > 1,
      tags: allTags,
    };
  }).sort((a, b) => b.trips.length - a.trips.length || b.totalSpent - a.totalSpent);
}

function TripMiniCard({ trip }: { trip: Lead }) {
  return (
    <Link href={`/leads/detail?id=${trip.id}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          trip.status === 'returned' ? 'bg-emerald-500' :
          trip.status === 'flying' ? 'bg-purple-500' :
          trip.status === 'paid' ? 'bg-green-500' :
          trip.status === 'proposal_sent' ? 'bg-blue-500' : 'bg-slate-400'
        }`} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-slate-700 truncate block">{trip.destination || 'יעד לא מוגדר'}</span>
          <span className="text-xs text-slate-400">{trip.departure_date ? new Date(trip.departure_date).toLocaleDateString('he-IL') : '—'}</span>
        </div>
        <Badge className={`${LEAD_STATUS_COLORS[trip.status]} border text-xs`}>
          {LEAD_STATUS_LABELS[trip.status]}
        </Badge>
        <span className="text-xs font-medium text-slate-600 shrink-0">₪{(trip.total_price || trip.budget || 0).toLocaleString()}</span>
      </div>
    </Link>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-lg font-bold text-white">
              {customer.name.charAt(0)}
            </div>
            {customer.isReturning && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center" title="לקוח חוזר">
                <RotateCcw className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-bold text-slate-800">{customer.name}</h3>
                <div className="flex flex-wrap gap-3 mt-1">
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                    <Phone className="w-3 h-3" />{customer.phone}
                  </a>
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                      <Mail className="w-3 h-3" />{customer.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="text-lg font-bold text-green-700">₪{customer.totalSpent.toLocaleString()}</div>
                <div className="text-xs text-slate-400">סה״כ עסקאות</div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                <Plane className="w-3 h-3" />
                <span>{customer.trips.length} {customer.trips.length === 1 ? 'נסיעה' : 'נסיעות'}</span>
              </div>
              {customer.isReturning && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                  ⭐ לקוח חוזר
                </Badge>
              )}
              {customer.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag === 'honeymoon' ? '💑 ירח דבש' :
                   tag === 'vip' ? '⭐ VIP' :
                   tag === 'kosher' ? '✡️ כשר' :
                   tag === 'family' ? '👨‍👩‍👧 משפחה' :
                   tag === 'solo' ? '🧳 יחיד' : tag}
                </Badge>
              ))}
            </div>

            {/* Last trip info */}
            {customer.lastTrip?.destination && (
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>נסיעה אחרונה: {customer.lastTrip.destination}</span>
                {customer.lastTrip.departure_date && (
                  <span>· {new Date(customer.lastTrip.departure_date).toLocaleDateString('he-IL')}</span>
                )}
              </div>
            )}

            {/* Trips expand */}
            {customer.trips.length > 1 && (
              <button
                className="mt-3 text-xs text-blue-600 hover:underline"
                onClick={() => setExpanded(e => !e)}
              >
                {expanded ? 'הסתר נסיעות' : `הצג את כל ${customer.trips.length} הנסיעות`}
              </button>
            )}
            {customer.trips.length === 1 && (
              <Link href={`/leads/detail?id=${customer.trips[0].id}`} className="mt-2 text-xs text-blue-600 hover:underline block">
                צפה בפרטי הנסיעה ←
              </Link>
            )}

            {expanded && (
              <div className="mt-3 border-t border-slate-100 pt-3 space-y-1">
                {customer.trips.map(trip => (
                  <TripMiniCard key={trip.id} trip={trip} />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
      if (sort === 'totalSpent') return b.totalSpent - a.totalSpent;
      if (sort === 'trips') return b.trips.length - a.trips.length;
      if (sort === 'lastTrip') {
        const aDate = a.lastTrip?.created_at || '';
        const bDate = b.lastTrip?.created_at || '';
        return bDate.localeCompare(aDate);
      }
      return 0;
    });

  const returningCount = customers.filter(c => c.isReturning).length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">לקוחות</h1>
        <p className="text-slate-500 mt-1 text-sm">כל הלקוחות וההיסטוריה שלהם</p>
      </div>

      {/* KPI Row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{customers.length}</p>
                <p className="text-xs text-slate-500">לקוחות</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{returningCount}</p>
                <p className="text-xs text-slate-500">חוזרים</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">₪{(totalRevenue/1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">סה״כ עסקאות</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">
                  {customers.length > 0 ? Math.round((returningCount / customers.length) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-500">שיעור חזרה</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="חיפוש לפי שם, טלפון, אימייל..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            כולם
          </Button>
          <Button size="sm" variant={filter === 'returning' ? 'default' : 'outline'} onClick={() => setFilter('returning')}>
            ⭐ חוזרים
          </Button>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortKey)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="trips">מיון: מספר נסיעות</option>
          <option value="totalSpent">מיון: סה״כ הוצאה</option>
          <option value="name">מיון: שם</option>
          <option value="lastTrip">מיון: נסיעה אחרונה</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>לא נמצאו לקוחות</p>
          </CardContent>
        </Card>
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
