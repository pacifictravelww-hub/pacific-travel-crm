'use client';

import { useState, useEffect } from 'react';
import { Lead, LEAD_STATUS_LABELS } from '@/lib/data';
import { getLeads } from '@/lib/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">לוח בקרה</h1>
        <p className="text-slate-500 mt-1">Pacific Travel CRM</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs">+12%</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
            <div className="text-sm text-slate-500 mt-1">סה&quot;כ לידים</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <Badge variant="secondary" className="text-xs">+8%</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900">₪{totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">הכנסות החודש</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="text-xs">+5%</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900">₪{totalCommission.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mt-1">עמלות החודש</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <Badge variant="secondary" className="text-xs">יעד: 30%</Badge>
            </div>
            <div className="text-2xl font-bold text-slate-900">{conversionRate}%</div>
            <div className="text-sm text-slate-500 mt-1">אחוז המרה</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Commission Target */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              יעד עמלות חודשי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">הושג</span>
                <span className="font-semibold">₪{totalCommission.toLocaleString()} / ₪{monthlyTarget.toLocaleString()}</span>
              </div>
              <Progress value={Math.min(targetProgress, 100)} className="h-3" />
              <div className="text-center text-sm text-slate-500">{targetProgress}% מהיעד</div>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-900">{statusCounts.lead || 0}</div>
                <div className="text-xs text-slate-500">ליד</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{statusCounts.proposal_sent || 0}</div>
                <div className="text-xs text-slate-500">הצעות</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{statusCounts.paid || 0}</div>
                <div className="text-xs text-slate-500">שולם</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Flights */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-600" />
              טיסות קרובות
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingFlights.length === 0 ? (
              <div className="text-center text-slate-400 py-4 text-sm">אין טיסות קרובות</div>
            ) : (
              <div className="space-y-3">
                {upcomingFlights.map(lead => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">{lead.name}</div>
                        <div className="text-xs text-slate-500">{lead.destination}</div>
                      </div>
                      <div className="text-xs text-slate-500 text-right">
                        {new Date(lead.departure_date).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              סיכום משפך מכירות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(Object.entries(LEAD_STATUS_LABELS) as [string, string][]).map(([status, label]) => {
                const count = statusCounts[status] || 0;
                const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                const colors: Record<string, string> = {
                  lead: 'bg-gray-400',
                  proposal_sent: 'bg-blue-500',
                  paid: 'bg-green-500',
                  flying: 'bg-purple-500',
                  returned: 'bg-orange-500',
                };
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className="w-20 text-xs text-slate-600 text-right">{label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-6 text-xs text-slate-500 text-center">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">לידים אחרונים</CardTitle>
          <Link href="/leads">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 gap-1">
              כל הלידים
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {(() => {
            const statusColors: Record<string, string> = {
              lead: 'bg-gray-100 text-gray-700',
              proposal_sent: 'bg-blue-100 text-blue-700',
              paid: 'bg-green-100 text-green-700',
              flying: 'bg-purple-100 text-purple-700',
              returned: 'bg-orange-100 text-orange-700',
            };
            return (
              <>
                {/* Mobile: card list */}
                <div className="space-y-3 md:hidden">
                  {recentLeads.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 text-sm">{lead.name}</div>
                            <div className="text-xs text-slate-500">{lead.destination}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[lead.status]}`}>
                            {LEAD_STATUS_LABELS[lead.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{lead.adults} מבוגרים{lead.children > 0 ? ` · ${lead.children} ילדים` : ''}</span>
                          <span className="font-medium text-slate-700">₪{(lead.budget || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Desktop: row list */}
                <div className="hidden md:block space-y-2">
                  {recentLeads.map(lead => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800 text-sm">{lead.name}</span>
                            {lead.tags && lead.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs py-0 h-4">
                                {tag === 'honeymoon' ? '💑' : tag === 'vip' ? '⭐' : tag === 'kosher' ? '✡️' : tag === 'family' ? '👨‍👩‍👧' : tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{lead.destination} · {lead.adults} מבוגרים {lead.children > 0 ? `· ${lead.children} ילדים` : ''}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-medium text-slate-700">₪{(lead.budget || 0).toLocaleString()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[lead.status]}`}>
                            {LEAD_STATUS_LABELS[lead.status]}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
