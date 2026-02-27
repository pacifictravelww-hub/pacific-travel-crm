'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Plane,
  BarChart3, Calendar, Award, MapPin, Loader2
} from 'lucide-react';
import { getLeads } from '@/lib/leads';
import { Lead, LEAD_STATUS_LABELS, LeadStatus } from '@/lib/data';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];

const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function StatCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend === 'up' ? 'עלייה' : 'ירידה'} מהחודש שעבר</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BarChart({ data, maxVal }: { data: { label: string; value: number; color?: string }[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-24 text-right shrink-0">{item.label}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full flex items-center justify-end px-2 transition-all duration-500 ${item.color || 'bg-blue-500'}`}
              style={{ width: maxVal > 0 ? `${Math.max((item.value / maxVal) * 100, 4)}%` : '4%' }}
            >
              <span className="text-xs text-white font-medium">{item.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Calculations
  const totalLeads = leads.length;
  const paidLeads = leads.filter(l => ['paid', 'flying', 'returned'].includes(l.status));
  const returnedLeads = leads.filter(l => l.status === 'returned');
  const conversionRate = totalLeads > 0 ? Math.round((paidLeads.length / totalLeads) * 100) : 0;
  const totalRevenue = paidLeads.reduce((s, l) => s + (l.total_price || 0), 0);
  const totalCommission = leads.reduce((s, l) => s + (l.commission || 0), 0);
  const avgDeal = paidLeads.length > 0 ? Math.round(totalRevenue / paidLeads.length) : 0;

  // By status
  const byStatus = STATUS_ORDER.map(s => ({
    label: LEAD_STATUS_LABELS[s],
    value: leads.filter(l => l.status === s).length,
    color: s === 'lead' ? 'bg-slate-400' :
           s === 'proposal_sent' ? 'bg-blue-500' :
           s === 'paid' ? 'bg-green-500' :
           s === 'flying' ? 'bg-purple-500' : 'bg-emerald-500',
  }));

  // By source
  const sources = ['facebook', 'whatsapp', 'referral', 'website'];
  const bySource = sources.map(s => ({
    label: s === 'facebook' ? 'פייסבוק' : s === 'whatsapp' ? 'ווטסאפ' : s === 'referral' ? 'המלצה' : 'אתר',
    value: leads.filter(l => l.source === s).length,
    color: s === 'facebook' ? 'bg-blue-600' : s === 'whatsapp' ? 'bg-green-500' : s === 'referral' ? 'bg-purple-500' : 'bg-orange-500',
  })).filter(s => s.value > 0);

  // By destination (top 5)
  const destMap: Record<string, number> = {};
  leads.forEach(l => {
    if (l.destination) {
      destMap[l.destination] = (destMap[l.destination] || 0) + 1;
    }
  });
  const byDestination = Object.entries(destMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value, color: 'bg-teal-500' }));

  // Monthly (last 6 months)
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthLeads = leads.filter(l => {
      const created = new Date(l.created_at);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    });
    return {
      label: MONTH_NAMES[d.getMonth()],
      value: monthLeads.length,
      revenue: monthLeads.reduce((s, l) => s + (l.total_price || 0), 0),
      color: 'bg-blue-500',
    };
  });

  // Top destinations by revenue
  const destRevMap: Record<string, number> = {};
  leads.forEach(l => {
    if (l.destination && l.total_price) {
      destRevMap[l.destination] = (destRevMap[l.destination] || 0) + l.total_price;
    }
  });
  const topDestByRevenue = Object.entries(destRevMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxStatus = Math.max(...byStatus.map(s => s.value), 1);
  const maxSource = Math.max(...bySource.map(s => s.value), 1);
  const maxDest = Math.max(...byDestination.map(s => s.value), 1);
  const maxMonthly = Math.max(...monthly.map(m => m.value), 1);

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">דוחות</h1>
        <p className="text-slate-500 mt-1 text-sm">סיכום ביצועים ומגמות</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="סה״כ לידים" value={totalLeads.toString()} sub="כל הזמנים" icon={Users} color="bg-blue-500" trend={null} />
        <StatCard title="שיעור המרה" value={`${conversionRate}%`} sub={`${paidLeads.length} עסקאות`} icon={TrendingUp} color="bg-green-500" trend={conversionRate > 30 ? 'up' : null} />
        <StatCard title="סה״כ הכנסות" value={`₪${totalRevenue.toLocaleString()}`} sub="עסקאות שנסגרו" icon={DollarSign} color="bg-emerald-500" trend={null} />
        <StatCard title="עמלות צבורות" value={`₪${totalCommission.toLocaleString()}`} sub={`ממוצע ₪${avgDeal.toLocaleString()} לעסקה`} icon={Award} color="bg-purple-500" trend={null} />
      </div>

      <Tabs defaultValue="funnel" dir="rtl">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="funnel">משפך מכירות</TabsTrigger>
          <TabsTrigger value="sources">מקורות</TabsTrigger>
          <TabsTrigger value="destinations">יעדים</TabsTrigger>
          <TabsTrigger value="monthly">חודשי</TabsTrigger>
        </TabsList>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                התפלגות לידים לפי שלב
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={byStatus} maxVal={maxStatus} />
            </CardContent>
          </Card>

          {/* Funnel visual */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">משפך המרה חזותי</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {STATUS_ORDER.map((status, i) => {
                  const count = leads.filter(l => l.status === status).length;
                  const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                  const width = 100 - (i * 15);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-24 text-right">{LEAD_STATUS_LABELS[status]}</span>
                      <div className="flex-1 flex justify-center">
                        <div
                          className="h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all"
                          style={{
                            width: `${width}%`,
                            backgroundColor: ['#64748b','#3b82f6','#22c55e','#a855f7','#10b981'][i]
                          }}
                        >
                          {count} ({pct}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Conversion Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-100">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 mb-1">לידים פתוחים</p>
                <p className="text-3xl font-bold text-blue-700">{leads.filter(l => l.status === 'lead').length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-green-50 border-green-100">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-green-600 mb-1">עסקאות שנסגרו</p>
                <p className="text-3xl font-bold text-green-700">{paidLeads.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-purple-50 border-purple-100">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-purple-600 mb-1">לקוחות שחזרו</p>
                <p className="text-3xl font-bold text-purple-700">{returnedLeads.length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">לידים לפי מקור</CardTitle>
            </CardHeader>
            <CardContent>
              {bySource.length > 0 ? (
                <BarChart data={bySource} maxVal={maxSource} />
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">אין נתונים עדיין</p>
              )}
            </CardContent>
          </Card>

          {/* Source breakdown table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">פירוט מקורות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bySource.map((s, i) => {
                  const pct = totalLeads > 0 ? Math.round((s.value / totalLeads) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-medium text-slate-700">{s.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">{s.value} לידים</span>
                        <Badge variant="outline" className="text-xs">{pct}%</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Destinations Tab */}
        <TabsContent value="destinations" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                יעדים פופולריים
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byDestination.length > 0 ? (
                <BarChart data={byDestination} maxVal={maxDest} />
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">אין נתוני יעדים עדיין</p>
              )}
            </CardContent>
          </Card>

          {topDestByRevenue.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">יעדים לפי הכנסות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topDestByRevenue.map(([dest, rev], i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm w-5">#{i + 1}</span>
                        <span className="text-sm font-medium text-slate-700">{dest}</span>
                      </div>
                      <span className="text-sm font-bold text-green-700">₪{rev.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                לידים חדשים — 6 חודשים אחרונים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart data={monthly} maxVal={maxMonthly} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="w-4 h-4 text-purple-600" />
                הכנסות חודשיות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthly.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{m.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{m.value} לידים</span>
                      <span className="text-sm font-bold text-slate-700">
                        {m.revenue > 0 ? `₪${m.revenue.toLocaleString()}` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
