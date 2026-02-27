'use client';

import { useState } from 'react';
import { MOCK_LEADS, LEAD_STATUS_LABELS, LeadStatus, Lead } from '@/lib/data';
import { MapPin, Calendar, Users, Phone, Plus } from 'lucide-react';
import Link from 'next/link';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];

function LeadCard({ lead }: { lead: Lead }) {
  const totalPax = lead.adults + lead.children + lead.infants;
  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="bg-white border border-black p-4 hover:bg-black hover:text-white transition-colors duration-100 cursor-pointer group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 border-b border-current pb-2">
          <div
            className="font-medium text-sm"
            style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
          >
            {lead.name}
          </div>
          <div
            className="text-xs font-medium ltr"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            ₪{lead.budget.toLocaleString()}
          </div>
        </div>

        {/* Source badge */}
        <div className="mb-3">
          <span
            className="text-xs tracking-widest uppercase border border-current px-1.5 py-0.5"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            {lead.source === 'facebook' ? 'FB' :
             lead.source === 'whatsapp' ? 'WA' :
             lead.source === 'referral' ? 'REF' : 'WEB'}
          </span>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-1.5 mb-2 text-xs opacity-70">
          <MapPin className="w-3 h-3 shrink-0" />
          <span>{lead.destination}</span>
        </div>

        {/* Dates */}
        <div
          className="flex items-center gap-1.5 mb-2 text-xs opacity-70 ltr"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          <Calendar className="w-3 h-3 shrink-0" />
          <span>
            {new Date(lead.departure_date).toLocaleDateString('he-IL')} — {new Date(lead.return_date).toLocaleDateString('he-IL')}
          </span>
        </div>

        {/* PAX */}
        <div className="flex items-center gap-1.5 mb-3 text-xs opacity-70">
          <Users className="w-3 h-3 shrink-0" />
          <span>{totalPax} נוסעים</span>
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lead.tags.map(tag => (
              <span
                key={tag}
                className="text-xs border border-current px-1.5 py-0.5 tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
              >
                {tag === 'honeymoon' ? 'MOON' :
                 tag === 'vip' ? 'VIP' :
                 tag === 'kosher' ? 'KSH' :
                 tag === 'family' ? 'FAM' :
                 tag === 'solo' ? 'SOLO' : tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="flex items-center gap-1 text-xs opacity-60 pt-2 border-t border-current">
          <Phone className="w-3 h-3" />
          <span
            className="ltr"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            {lead.phone}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LeadsPage() {
  const [leads] = useState(MOCK_LEADS);

  const getLeadsByStatus = (status: LeadStatus) =>
    leads.filter(l => l.status === status);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
        <div>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
          >
            לידים
          </h1>
          <p
            className="text-xs tracking-widest uppercase text-muted-500 mt-1"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            Pipeline · {leads.length} records
          </p>
        </div>
        <Link href="/leads/new">
          <button
            className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black border-2 border-black transition-colors duration-100"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            <Plus className="w-4 h-4" />
            ליד חדש
          </button>
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-px bg-black overflow-x-auto pb-4">
        {STATUS_ORDER.map(status => {
          const statusLeads = getLeadsByStatus(status);
          const total = statusLeads.reduce((s, l) => s + l.budget, 0);
          return (
            <div key={status} className="flex-shrink-0 w-64 bg-white">
              {/* Column Header */}
              <div className="bg-black text-white p-4 border-b-4 border-white">
                <div
                  className="text-xs tracking-widest uppercase font-medium"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {LEAD_STATUS_LABELS[status]}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-playfair), serif' }}
                  >
                    {statusLeads.length}
                  </span>
                  {statusLeads.length > 0 && (
                    <span
                      className="text-xs opacity-60 ltr"
                      style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                    >
                      ₪{total.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-px bg-muted-200 kanban-column p-px">
                {statusLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}

                {statusLeads.length === 0 && (
                  <div
                    className="bg-white border-2 border-dashed border-muted-300 h-24 flex items-center justify-center text-muted-400 text-xs tracking-widest uppercase"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    EMPTY
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
