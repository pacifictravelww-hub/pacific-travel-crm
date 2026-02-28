'use client';

import { useState, useEffect } from 'react';
import { Lead, LEAD_STATUS_LABELS } from '@/lib/data';
import { getLeads } from '@/lib/leads';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, TrendingUp, DollarSign, Plane,
  Calendar, Star, Target, ArrowLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(data => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const totalLeads = leads.length;
  const paidLeads = leads.filter(l => l.status === 'paid' || l.status === 'flying' || l.status === 'returned');
  const totalRevenue = paidLeads.reduce((sum, l) => sum + (l.total_price || 0), 0);
  const totalCommission = paidLeads.reduce((sum, l) => sum + (l.commission || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((paidLeads.length / totalLeads) * 100) : 0;
  const monthlyTarget = 20000;
  const targetProgress = Math.round((totalCommission / monthlyTarget) * 100);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const statusCounts = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingFlights = leads.filter(l =>
    l.status === 'paid' || l.status === 'flying'
  ).sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen" style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const statusBarColors: Record<string, string> = {
    lead: 'rgba(148,163,184,0.6)',
    proposal_sent: 'rgba(96,165,250,0.7)',
    paid: 'rgba(52,211,153,0.7)',
    flying: 'rgba(167,139,250,0.7)',
    returned: 'rgba(251,146,60,0.7)',
  };

  const statusBadgeColors: Record<string, string> = {
    lead: 'bg-slate-500/20 text-slate-300',
    proposal_sent: 'bg-blue-500/20 text-blue-300',
    paid: 'bg-emerald-500/20 text-emerald-300',
    flying: 'bg-purple-500/20 text-purple-300',
    returned: 'bg-orange-500/20 text-orange-300',
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen"
      style={{ background: 'linear-gradient(160deg, #0a0f1e 0%, #0f1a38 50%, #1a0a2e 100%)' }}>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">לוח בקרה</h1>

      </div>

      {/* KPI Cards — glassmorphism with transparent gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[
          { icon: Users, value: totalLeads, label: 'סה״כ לידים', gradient: 'rgba(37,99,235,0.25), rgba(124,58,237,0.2)', glow: 'rgba(37,99,235,0.15)', iconBg: 'rgba(96,165,250,0.2)', textColor: 'text-blue-200' },
          { icon: DollarSign, value: `₪${(totalRevenue/1000).toFixed(0)}K`, label: 'הכנסות', gradient: 'rgba(5,150,105,0.25), rgba(13,148,136,0.2)', glow: 'rgba(52,211,153,0.15)', iconBg: 'rgba(52,211,153,0.2)', textColor: 'text-emerald-200' },
          { icon: Star, value: `₪${totalCommission.toLocaleString()}`, label: 'עמלות', gradient: 'rgba(124,58,237,0.25), rgba(168,85,247,0.2)', glow: 'rgba(167,139,250,0.15)', iconBg: 'rgba(167,139,250,0.2)', textColor: 'text-purple-200' },
          { icon: TrendingUp, value: `${conversionRate}%`, label: 'אחוז המרה', gradient: 'rgba(234,88,12,0.25), rgba(245,158,11,0.2)', glow: 'rgba(251,146,60,0.15)', iconBg: 'rgba(251,146,60,0.2)', textColor: 'text-orange-200' },
        ].map(({ icon: Icon, value, label, gradient, glow, iconBg, textColor }) => (
          <div key={label}
            className="rounded-2xl p-5 text-white relative overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-default"
            style={{
              background: `linear-gradient(135deg, ${gradient})`,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: `0 8px 32px ${glow}`,
            }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(25%, -25%)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: iconBg, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold">{value}</div>
            <div className={`${textColor} text-sm mt-1`}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Commission Target */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              יעד עמלות חודשי
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">הושג</span>
                <span className="font-semibold text-white">₪{totalCommission.toLocaleString()} / ₪{monthlyTarget.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min(targetProgress, 100)}%`,
                  background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(124,58,237,0.8))',
                  marginRight: 0,
                  marginLeft: 'auto',
                }} />
              </div>
              <div className="text-center text-sm text-slate-400">{targetProgress}% מהיעד</div>
            </div>

            <div className="mt-4 pt-4 grid grid-cols-3 gap-2 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-lg font-bold text-slate-200">{statusCounts.lead || 0}</div>
                <div className="text-xs text-slate-500">ליד</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-400">{statusCounts.proposal_sent || 0}</div>
                <div className="text-xs text-slate-500">הצעות</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">{statusCounts.paid || 0}</div>
                <div className="text-xs text-slate-500">שולם</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Flights */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-400" />
              טיסות קרובות
            </h3>
          </div>
          <div className="p-5">
            {upcomingFlights.length === 0 ? (
              <div className="text-center text-slate-500 py-4 text-sm">אין טיסות קרובות</div>
            ) : (
              <div className="space-y-2">
                {upcomingFlights.map(lead => (
                  <Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-white/5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.3)' }}>
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.destination}</div>
                      </div>
                      <div className="text-xs text-slate-400 text-right">
                        {new Date(lead.departure_date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              סיכום משפך מכירות
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {(Object.entries(LEAD_STATUS_LABELS) as [string, string][]).map(([status, label]) => {
                const count = statusCounts[status] || 0;
                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className="w-20 text-xs text-slate-400 text-right">{label}</div>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: statusBarColors[status], float: 'right' }}
                      />
                    </div>
                    <div className="w-6 text-xs text-slate-400 text-center">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-base font-semibold text-white">לידים אחרונים</h3>
          <Link href="/leads">
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 gap-1">
              כל הלידים
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="p-5">
          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {recentLeads.map(lead => (
              <Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
                <div className="p-3 rounded-xl transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3))' }}>
                      {lead.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 text-sm">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.destination}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeColors[lead.status]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{lead.adults} מבוגרים{lead.children > 0 ? ` · ${lead.children} ילדים` : ''}</span>
                    <span className="font-medium text-slate-300">₪{(lead.budget || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block space-y-2">
            {recentLeads.map(lead => (
              <Link key={lead.id} href={`/leads/detail?id=${lead.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer hover:bg-white/5"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3))' }}>
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 text-sm">{lead.name}</span>
                      {lead.tags && lead.tags.map(tag => (
                        <Badge key={tag} className="text-xs py-0 h-4 bg-white/8 text-slate-400 border-white/15">
                          {tag === 'honeymoon' ? '💑' : tag === 'vip' ? '⭐' : tag === 'kosher' ? '✡️' : tag === 'family' ? '👨‍👩‍👧' : tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{lead.destination} · {lead.adults} מבוגרים {lead.children > 0 ? `· ${lead.children} ילדים` : ''}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-slate-300">₪{(lead.budget || 0).toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeColors[lead.status]}`}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
