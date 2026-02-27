'use client';

import { useState, useEffect } from 'react';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_STATUS_BG, LeadStatus, Lead } from '@/lib/data';
import { getLeads } from '@/lib/leads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Facebook, MessageCircle, Users, MapPin, Calendar, Phone, Plus, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-3 h-3 text-blue-600" />,
  whatsapp: <MessageCircle className="w-3 h-3 text-green-600" />,
  referral: <Users className="w-3 h-3 text-purple-600" />,
  website: <MapPin className="w-3 h-3 text-orange-600" />,
};

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Link href={`/leads/detail?id=${lead.id}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              {lead.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">{lead.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                {SOURCE_ICONS[lead.source]}
                <span className="text-xs text-slate-400">{lead.source === 'facebook' ? 'פייסבוק' : lead.source === 'whatsapp' ? 'ווטסאפ' : lead.source}</span>
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-slate-700">₪{(lead.budget || 0).toLocaleString()}</div>
        </div>

        {/* Destination */}
        {lead.destination && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600 truncate">{lead.destination}</span>
          </div>
        )}

        {/* Dates */}
        {lead.departure_date && (
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 ltr">
              {new Date(lead.departure_date).toLocaleDateString('he-IL')} — {lead.return_date ? new Date(lead.return_date).toLocaleDateString('he-IL') : ''}
            </span>
          </div>
        )}

        {/* PAX */}
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500">
            {lead.adults} מבוגרים{lead.children > 0 ? ` · ${lead.children} ילדים` : ''}{lead.infants > 0 ? ` · ${lead.infants} תינוקות` : ''}
          </span>
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lead.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs py-0 h-5 text-slate-600">
                {tag === 'honeymoon' ? '💑 ירח דבש' :
                 tag === 'vip' ? '⭐ VIP' :
                 tag === 'kosher' ? '✡️ כשר' :
                 tag === 'family' ? '👨‍👩‍👧 משפחה' :
                 tag === 'solo' ? '🧳 יחיד' : tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors" onClick={e => e.stopPropagation()}>
            <Phone className="w-3 h-3" />
            {lead.phone}
          </a>
        </div>
      </div>
    </Link>
  );
}

function MobileColumn({ status, leads }: { status: LeadStatus; leads: Lead[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-full">
      {/* Column Header — tappable to collapse */}
      <button
        className={`w-full rounded-xl border-2 p-3 mb-3 ${LEAD_STATUS_BG[status]} flex items-center justify-between`}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[status]}`}>
            {LEAD_STATUS_LABELS[status]}
          </span>
          <span className="text-sm font-bold text-slate-600">({leads.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {leads.length > 0 && (
            <span className="text-xs text-slate-500">
              ₪{leads.reduce((s, l) => s + (l.budget || 0), 0).toLocaleString()}
            </span>
          )}
          {collapsed
            ? <ChevronDown className="w-4 h-4 text-slate-500" />
            : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {!collapsed && (
        <div className="space-y-3">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {leads.length === 0 && (
            <div className="border-2 border-dashed border-slate-200 rounded-xl h-16 flex items-center justify-center text-slate-300 text-sm">
              אין לידים
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter(l => l.status === status);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">לידים</h1>
          <p className="text-slate-500 mt-1 text-sm">ניהול משפך מכירות</p>
        </div>
        <Link href="/leads/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">ליד חדש</span>
            <span className="sm:hidden">חדש</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Mobile: vertical stack of collapsible columns */}
          <div className="md:hidden space-y-4">
            {STATUS_ORDER.map(status => (
              <MobileColumn key={status} status={status} leads={getLeadsByStatus(status)} />
            ))}
          </div>

          {/* Desktop: horizontal Kanban */}
          <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map(status => {
              const statusLeads = getLeadsByStatus(status);
              return (
                <div key={status} className="flex-shrink-0 w-72">
                  {/* Column Header */}
                  <div className={`rounded-xl border-2 p-3 mb-3 ${LEAD_STATUS_BG[status]}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[status]}`}>
                        {LEAD_STATUS_LABELS[status]}
                      </span>
                      <span className="text-sm font-bold text-slate-600">{statusLeads.length}</span>
                    </div>
                    {statusLeads.length > 0 && (
                      <div className="mt-1 text-xs text-slate-500">
                        סה&quot;כ ₪{statusLeads.reduce((s, l) => s + (l.budget || 0), 0).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 kanban-column">
                    {statusLeads.map(lead => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                    {statusLeads.length === 0 && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center text-slate-300 text-sm">
                        אין לידים
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
