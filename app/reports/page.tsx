'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Plane,
  BarChart3, Calendar, Award, MapPin, Loader2,
  Target, Clock, Tag, CreditCard, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getLeads } from '@/lib/leads';
import { Lead, LEAD_STATUS_LABELS, LeadStatus } from '@/lib/data';

const STATUS_ORDER: LeadStatus[] = ['lead', 'proposal_sent', 'paid', 'flying', 'returned'];
const MONTH_NAMES = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
const STATUS_COLORS: Record<LeadStatus, string> = {
  lead: '#64748b', proposal_sent: '#3b82f6', paid: '#22c55e', flying: '#a855f7', returned: '#10b981'
};

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, gradient, trend, trendVal }: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; gradient: string;
  trend?: 'up' | 'down' | null; trendVal?: string;
}) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
      <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: gradient }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: gradient, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trendVal}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Line Chart (SVG) ────────────────────────────────────────────────────────
function LineChart({ data, color = '#3b82f6', label = '', height = 140 }: {
  data: { label: string; value: number }[];
  color?: string; label?: string; height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 520; const H = height; const PAD = { t: 10, r: 10, b: 28, l: 40 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => ({
    x: PAD.l + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD.t + chartH - (d.value / maxV) * chartH,
    ...d,
  }));

  // Smooth bezier path
  const path = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y} ${cpX} ${pt.y} ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${path} L ${pts[pts.length - 1]?.x ?? 0} ${PAD.t + chartH} L ${pts[0]?.x ?? 0} ${PAD.t + chartH} Z`;
  const gradId = `grad-${color.replace('#', '')}`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <line key={i}
            x1={PAD.l} y1={PAD.t + chartH * r}
            x2={PAD.l + chartW} y2={PAD.t + chartH * r}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((r, i) => (
          <text key={i} x={PAD.l - 6} y={PAD.t + chartH * (1 - r) + 4}
            textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
            {Math.round(maxV * r)}
          </text>
        ))}
        {/* Area fill */}
        {pts.length > 1 && <path d={areaPath} fill={`url(#${gradId})`} />}
        {/* Line */}
        {pts.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />}
        {/* Dots + X labels */}
        {pts.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={hovered === i ? 5 : 3.5}
              fill={color} stroke="rgba(15,26,56,0.9)" strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.1s' }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
            <text x={pt.x} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
              {pt.label}
            </text>
          </g>
        ))}
        {/* Tooltip */}
        {hovered !== null && (() => {
          const pt = pts[hovered];
          const tW = 60; const tH = 28;
          const tX = Math.min(Math.max(pt.x - tW / 2, 0), W - tW);
          const tY = pt.y - tH - 8;
          return (
            <g>
              <rect x={tX} y={tY} width={tW} height={tH} rx="6"
                fill="rgba(15,26,56,0.95)" stroke={color} strokeWidth="1" />
              <text x={tX + tW / 2} y={tY + 11} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">{pt.label}</text>
              <text x={tX + tW / 2} y={tY + 22} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">
                {label === '₪' ? `₪${pt.value.toLocaleString()}` : pt.value}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Horizontal Bar ──────────────────────────────────────────────────────────
function HBar({ label, value, max, color, sub }: { label: string; value: number; max: number; color: string; sub?: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 3) : 3;
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs text-slate-400 w-28 text-right shrink-0 group-hover:text-white transition-colors">{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', height: '28px' }}>
        <div className="h-full rounded-full flex items-center justify-end px-3 transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}>
          <span className="text-xs text-white font-semibold">{value}</span>
        </div>
      </div>
      {sub && <span className="text-xs text-slate-500 w-20 shrink-0">{sub}</span>}
    </div>
  );
}

// ── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="text-slate-500 text-sm text-center py-6">אין נתונים</p>;
  const R = 60; const cx = 80; const cy = 80; const strokeW = 22;
  let offset = 0;
  const circ = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" className="shrink-0">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeW} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={R} fill="none"
              stroke={seg.color} strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dasharray 0.6s', strokeLinecap: 'round' }} />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">לידים</text>
      </svg>
      <div className="space-y-2 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
              <span className="text-xs text-slate-300">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{seg.value}</span>
              <span className="text-xs text-slate-500">{Math.round((seg.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Insight Card ────────────────────────────────────────────────────────────
function InsightCard({ icon: Icon, title, value, sub, color }: {
  icon: React.ElementType; title: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="rounded-xl p-4 flex items-start gap-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{title}</p>
        <p className="text-base font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(data => { setLeads(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  // ── Core metrics ──────────────────────────────────────────────────────────
  const total = leads.length;
  const paid = leads.filter(l => ['paid','flying','returned'].includes(l.status));
  const returned = leads.filter(l => l.status === 'returned');
  const activeLeads = leads.filter(l => l.status === 'lead');
  const conv = total > 0 ? Math.round((paid.length / total) * 100) : 0;
  const revenue = paid.reduce((s, l) => s + (l.total_price || 0), 0);
  const commission = leads.reduce((s, l) => s + (l.commission || 0), 0);
  const avgDeal = paid.length > 0 ? Math.round(revenue / paid.length) : 0;
  const depositPaid = leads.filter(l => l.deposit_paid).length;
  const depositRate = total > 0 ? Math.round((depositPaid / total) * 100) : 0;
  const pipelineValue = activeLeads.reduce((s, l) => s + (l.budget || 0), 0);
  const avgTravelers = total > 0 ? (leads.length / total).toFixed(1) : '0';

  // ── Monthly (12 months) ────────────────────────────────────────────────────
  const now = new Date();
  const monthly12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    const ml = leads.filter(l => {
      const c = new Date(l.created_at);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    });
    return {
      label: MONTH_NAMES[d.getMonth()].slice(0, 3),
      value: ml.length,
      revenue: ml.reduce((s, l) => s + (l.total_price || 0), 0),
      closed: ml.filter(l => ['paid','flying','returned'].includes(l.status)).length,
    };
  });
  const monthly6 = monthly12.slice(-6);

  // Month over month change
  const thisMonth = monthly12[11].value;
  const lastMonth = monthly12[10].value;
  const momChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  // ── By source ─────────────────────────────────────────────────────────────
  const SOURCE_META: Record<string, { label: string; color: string }> = {
    facebook: { label: 'פייסבוק', color: '#3b82f6' },
    whatsapp: { label: 'ווטסאפ', color: '#22c55e' },
    referral: { label: 'המלצה', color: '#a855f7' },
    website: { label: 'אתר', color: '#f59e0b' },
    instagram: { label: 'אינסטגרם', color: '#ec4899' },
    other: { label: 'אחר', color: '#64748b' },
  };
  const bySource = Object.entries(SOURCE_META).map(([key, meta]) => ({
    ...meta, key,
    value: leads.filter(l => l.source === key).length,
    revenue: leads.filter(l => l.source === key && l.total_price).reduce((s, l) => s + (l.total_price || 0), 0),
  })).filter(s => s.value > 0);

  const topSourceRevenue = bySource.length > 0
    ? bySource.reduce((a, b) => a.revenue > b.revenue ? a : b).label
    : '—';

  // ── By destination ────────────────────────────────────────────────────────
  const destMap: Record<string, { count: number; revenue: number }> = {};
  leads.forEach(l => {
    if (l.destination) {
      if (!destMap[l.destination]) destMap[l.destination] = { count: 0, revenue: 0 };
      destMap[l.destination].count++;
      destMap[l.destination].revenue += l.total_price || 0;
    }
  });
  const topDests = Object.entries(destMap).sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  const maxDest = topDests[0]?.[1].count || 1;

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagMap: Record<string, number> = {};
  leads.forEach(l => (l.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; }));
  const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // ── Departure months ──────────────────────────────────────────────────────
  const depByMonth = Array.from({ length: 12 }, (_, i) => ({
    label: MONTH_NAMES[i].slice(0, 3),
    value: leads.filter(l => l.departure_date && new Date(l.departure_date).getMonth() === i).length,
  }));
  const peakDepMonth = depByMonth.reduce((a, b) => a.value > b.value ? a : b);

  const maxMonthly = Math.max(...monthly12.map(m => m.value), 1);
  const maxMonthlyRev = Math.max(...monthly12.map(m => m.revenue), 1);
  const maxDepByMonth = Math.max(...depByMonth.map(m => m.value), 1);

  return (
    <div className="p-4 md:p-6 min-h-screen"
      style={{ background: 'linear-gradient(160deg, #050a1a 0%, #0a1628 60%, #0f0a20 100%)' }}>

      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">דוחות וניתוחים</h1>
          <p className="text-slate-400 text-sm mt-1">תובנות עסקיות בזמן אמת</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          עדכון בזמן אמת
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="סה״כ לידים" value={total.toString()} sub={`${activeLeads.length} פתוחים`}
          icon={Users} gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)"
          trend={momChange !== null ? (momChange >= 0 ? 'up' : 'down') : null}
          trendVal={momChange !== null ? `${Math.abs(momChange)}%` : undefined} />
        <StatCard title="שיעור המרה" value={`${conv}%`} sub={`${paid.length} עסקאות נסגרו`}
          icon={Target} gradient="linear-gradient(135deg,#22c55e,#15803d)"
          trend={conv > 25 ? 'up' : 'down'} trendVal={conv > 25 ? 'מעל ממוצע' : 'מתחת ממוצע'} />
        <StatCard title="סה״כ הכנסות" value={`₪${revenue.toLocaleString()}`} sub={`ממוצע ₪${avgDeal.toLocaleString()}/עסקה`}
          icon={DollarSign} gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard title="עמלות צבורות" value={`₪${commission.toLocaleString()}`} sub={`${returned.length} לקוחות חזרו`}
          icon={Award} gradient="linear-gradient(135deg,#a855f7,#7c3aed)" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
        {[
          { icon: CreditCard, title: 'שילמו מקדמה', value: `${depositRate}%`, sub: `${depositPaid} מתוך ${total}`, color: '#06b6d4' },
          { icon: TrendingUp, title: 'שווי פייפליין', value: `₪${Math.round(pipelineValue / 1000)}K`, sub: `${activeLeads.length} לידים פעילים`, color: '#3b82f6' },
          { icon: Users, title: 'ממוצע נוסעים', value: avgTravelers.toString(), sub: 'לעסקה', color: '#a855f7' },
          { icon: MapPin, title: 'חודש שיא יציאות', value: peakDepMonth.value > 0 ? peakDepMonth.label : '—', sub: `${peakDepMonth.value} יציאות`, color: '#f59e0b' },
        ].map((item, i) => (
          <InsightCard key={i} {...item} />
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { value: 'overview', label: 'סקירה כללית' },
            { value: 'funnel', label: 'משפך מכירות' },
            { value: 'sources', label: 'מקורות' },
            { value: 'destinations', label: 'יעדים' },
            { value: 'trends', label: 'מגמות' },
          ].map(t => (
            <TabsTrigger key={t.value} value={t.value}
              className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-blue-600/30 shrink-0">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Overview Tab ────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Monthly leads line chart */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">לידים חדשים — 12 חודשים</h3>
                  <p className="text-xs text-slate-400 mt-0.5">מגמת גיוס לקוחות</p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>
                  {thisMonth} החודש
                </div>
              </div>
              <LineChart data={monthly12} color="#3b82f6" />
            </div>
            {/* Monthly revenue line chart */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">הכנסות חודשיות</h3>
                  <p className="text-xs text-slate-400 mt-0.5">₪ לפי חודש</p>
                </div>
                <div className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                  ₪{monthly12[11].revenue.toLocaleString()}
                </div>
              </div>
              <LineChart data={monthly12.map(m => ({ label: m.label, value: m.revenue }))} color="#f59e0b" label="₪" />
            </div>
          </div>
          {/* Sources donut + top destinations */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4">מקורות לידים</h3>
              <DonutChart segments={bySource} />
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4">יעדים מובילים</h3>
              <div className="space-y-2.5">
                {topDests.slice(0, 5).map(([dest, data], i) => (
                  <HBar key={i} label={dest} value={data.count} max={maxDest}
                    color={`hsl(${200 + i * 20},70%,55%)`}
                    sub={data.revenue > 0 ? `₪${Math.round(data.revenue / 1000)}K` : undefined} />
                ))}
                {topDests.length === 0 && <p className="text-slate-500 text-sm text-center py-4">אין נתוני יעדים</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Funnel Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="funnel" className="space-y-5">
          {/* Visual funnel */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-sm font-bold text-white mb-6">משפך המרה חזותי</h3>
            <div className="space-y-2">
              {STATUS_ORDER.map((status, i) => {
                const count = leads.filter(l => l.status === status).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const nextCount = i < STATUS_ORDER.length - 1
                  ? leads.filter(l => l.status === STATUS_ORDER[i + 1]).length : null;
                const dropPct = nextCount !== null && count > 0 ? Math.round(((count - nextCount) / count) * 100) : null;
                return (
                  <div key={status}>
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-xs text-slate-400 w-28 text-right shrink-0">{LEAD_STATUS_LABELS[status]}</span>
                      <div className="flex-1 flex">
                        <div className="h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold transition-all duration-700"
                          style={{ width: `${Math.max(pct, 8)}%`, background: STATUS_COLORS[status], boxShadow: `0 4px 16px ${STATUS_COLORS[status]}44` }}>
                          {count} <span className="text-xs font-normal ml-1 opacity-75">({pct}%)</span>
                        </div>
                      </div>
                    </div>
                    {dropPct !== null && dropPct > 0 && (
                      <div className="mr-28 text-xs text-slate-600 mb-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-red-500/50" />
                        <span>{dropPct}% נשרו לפני השלב הבא</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'לידים פתוחים', value: activeLeads.length, color: '#64748b' },
              { label: 'הצעות שנשלחו', value: leads.filter(l => l.status === 'proposal_sent').length, color: '#3b82f6' },
              { label: 'עסקאות שנסגרו', value: paid.length, color: '#22c55e' },
              { label: 'לקוחות חזרו', value: returned.length, color: '#10b981' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4 text-center"
                style={{ background: `${item.color}14`, border: `1px solid ${item.color}30` }}>
                <p className="text-3xl font-bold text-white mb-1">{item.value}</p>
                <p className="text-xs" style={{ color: item.color }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Closed deals line chart */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-sm font-bold text-white mb-4">עסקאות שנסגרו — 12 חודשים</h3>
            <LineChart data={monthly12.map(m => ({ label: m.label, value: m.closed }))} color="#22c55e" />
          </div>
        </TabsContent>

        {/* ── Sources Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="sources" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4">התפלגות לפי מקור</h3>
              <DonutChart segments={bySource} />
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-1">הכנסות לפי מקור</h3>
              <p className="text-xs text-slate-400 mb-4">המקור המוביל: <span className="text-blue-400">{topSourceRevenue}</span></p>
              <div className="space-y-3">
                {bySource.sort((a, b) => b.revenue - a.revenue).map((s, i) => (
                  <HBar key={i} label={s.label} value={s.value} max={Math.max(...bySource.map(x => x.value), 1)}
                    color={s.color}
                    sub={s.revenue > 0 ? `₪${Math.round(s.revenue / 1000)}K` : '—'} />
                ))}
                {bySource.length === 0 && <p className="text-slate-500 text-sm text-center py-4">אין נתוני מקורות</p>}
              </div>
            </div>
          </div>
          {/* Source insights */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {bySource.map((s, i) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              const avgRev = s.value > 0 ? Math.round(s.revenue / s.value) : 0;
              return (
                <div key={i} className="rounded-xl p-4"
                  style={{ background: `${s.color}0d`, border: `1px solid ${s.color}25` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm font-bold text-white">{s.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{pct}%</p>
                  <p className="text-xs text-slate-400">{s.value} לידים</p>
                  {avgRev > 0 && <p className="text-xs mt-1" style={{ color: s.color }}>ממוצע ₪{avgRev.toLocaleString()}/עסקה</p>}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Destinations Tab ────────────────────────────────────────────── */}
        <TabsContent value="destinations" className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4">יעדים לפי כמות לידים</h3>
              <div className="space-y-2.5">
                {topDests.map(([dest, data], i) => (
                  <HBar key={i} label={dest} value={data.count} max={maxDest}
                    color={`hsl(${170 + i * 18},65%,50%)`} />
                ))}
                {topDests.length === 0 && <p className="text-slate-500 text-sm text-center py-8">אין נתוני יעדים</p>}
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4">יעדים לפי הכנסות</h3>
              <div className="space-y-3">
                {topDests.sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 6).map(([dest, data], i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs w-5">#{i + 1}</span>
                      <span className="text-sm font-medium text-white">{dest}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">₪{data.revenue.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{data.count} לידים</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Departure months line chart */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">עונתיות יציאות</h3>
                <p className="text-xs text-slate-400 mt-0.5">חלוקת תאריכי יציאה לפי חודש</p>
              </div>
              {peakDepMonth.value > 0 && (
                <div className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                  שיא: {peakDepMonth.label}
                </div>
              )}
            </div>
            <LineChart data={depByMonth} color="#f59e0b" />
          </div>

          {/* Tags */}
          {topTags.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                סוגי נסיעות פופולריים
              </h3>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count], i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: `hsl(${240 + i * 30},60%,50%)22`,
                      border: `1px solid hsl(${240 + i * 30},60%,50%)44`,
                      color: `hsl(${240 + i * 30},80%,75%)`
                    }}>
                    <span>{tag}</span>
                    <span className="opacity-70 text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Trends Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="trends" className="space-y-5">
          {/* Leads + revenue dual chart */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">לידים חדשים — 12 חודשים</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> לידים</span>
              </div>
            </div>
            <LineChart data={monthly12} color="#3b82f6" height={160} />
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">הכנסות — 12 חודשים</h3>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 inline-block rounded" /> הכנסות ₪
              </div>
            </div>
            <LineChart data={monthly12.map(m => ({ label: m.label, value: m.revenue }))} color="#f59e0b" label="₪" height={160} />
          </div>

          {/* Monthly table */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-sm font-bold text-white mb-4">טבלת נתונים חודשית</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-right pb-3 text-slate-400 font-medium text-xs">חודש</th>
                    <th className="text-center pb-3 text-slate-400 font-medium text-xs">לידים</th>
                    <th className="text-center pb-3 text-slate-400 font-medium text-xs">נסגרו</th>
                    <th className="text-center pb-3 text-slate-400 font-medium text-xs">המרה</th>
                    <th className="text-left pb-3 text-slate-400 font-medium text-xs">הכנסות</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly6.map((m, i) => {
                    const conv = m.value > 0 ? Math.round((m.closed / m.value) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                        <td className="py-3 text-white font-medium">{m.label}</td>
                        <td className="py-3 text-center text-slate-300">{m.value}</td>
                        <td className="py-3 text-center text-emerald-400">{m.closed}</td>
                        <td className="py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${conv > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-white/5'}`}>
                            {conv}%
                          </span>
                        </td>
                        <td className="py-3 text-left text-amber-400 font-medium">
                          {m.revenue > 0 ? `₪${m.revenue.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
