import { MOCK_LEADS, LEAD_STATUS_LABELS } from '@/lib/data';
import Link from 'next/link';

export default function DashboardPage() {
  const totalLeads = MOCK_LEADS.length;
  const paidLeads = MOCK_LEADS.filter(l => l.status === 'paid' || l.status === 'flying' || l.status === 'returned');
  const totalRevenue = paidLeads.reduce((sum, l) => sum + (l.total_price || 0), 0);
  const totalCommission = paidLeads.reduce((sum, l) => sum + (l.commission || 0), 0);
  const conversionRate = Math.round((paidLeads.length / totalLeads) * 100);

  const recentLeads = [...MOCK_LEADS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const statusCounts = MOCK_LEADS.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: 'סה"כ לידים', value: totalLeads.toString(), meta: '+12% החודש', inverted: false },
    { label: 'הכנסות', value: `₪${totalRevenue.toLocaleString()}`, meta: '+8% החודש', inverted: true },
    { label: 'עמלות', value: `₪${totalCommission.toLocaleString()}`, meta: 'החודש', inverted: false },
    { label: 'אחוז המרה', value: `${conversionRate}%`, meta: 'יעד: 30%', inverted: false },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="mb-10 pb-6 border-b-4 border-black">
        <h1
          className="text-5xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
        >
          דשבורד
        </h1>
        <p
          className="text-sm tracking-widest uppercase mt-2 text-muted-500"
          style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
        >
          Pacific Travel CRM · ינואר 2026
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-black mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-6 group cursor-default transition-all duration-100 ${
              stat.inverted
                ? 'bg-black text-white hover:bg-white hover:text-black'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <div
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {stat.value}
            </div>
            <div className="text-sm mb-1" style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}>
              {stat.label}
            </div>
            <div
              className="text-xs tracking-widest uppercase opacity-60"
              style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
            >
              {stat.meta}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Summary */}
      <div className="mb-10">
        <div className="border-b-4 border-black mb-6 pb-2">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            משפך מכירות
          </h2>
        </div>
        <div className="grid grid-cols-5 gap-px bg-black">
          {(Object.entries(LEAD_STATUS_LABELS) as [string, string][]).map(([status, label]) => {
            const count = statusCounts[status] || 0;
            const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
            return (
              <div key={status} className="bg-white p-4 text-center hover:bg-black hover:text-white transition-colors duration-100 group cursor-default">
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-playfair), serif' }}
                >
                  {count}
                </div>
                <div className="text-xs mb-2" style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}>
                  {label}
                </div>
                <div
                  className="text-xs tracking-widest opacity-50"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Leads Table */}
      <div>
        <div className="border-b-4 border-black mb-0 pb-2 flex items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            לידים אחרונים
          </h2>
          <Link
            href="/leads"
            className="text-xs tracking-widest uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors duration-100"
            style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
          >
            כל הלידים ←
          </Link>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              {['שם', 'יעד', 'תאריך יציאה', 'תקציב', 'סטטוס'].map((h) => (
                <th
                  key={h}
                  className="text-right py-3 px-4 text-xs tracking-widest uppercase text-muted-600 font-normal"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead, i) => (
              <tr
                key={lead.id}
                className={`border-b border-muted-200 hover:bg-black hover:text-white transition-colors duration-100 cursor-pointer ${i % 2 === 0 ? 'bg-white' : 'bg-muted-100'}`}
              >
                <td className="py-3 px-4">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <span
                      className="font-medium text-sm"
                      style={{ fontFamily: 'var(--font-frank-ruhl), serif' }}
                    >
                      {lead.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-muted-700">{lead.destination}</td>
                <td
                  className="py-3 px-4 text-sm ltr"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  {new Date(lead.departure_date).toLocaleDateString('he-IL')}
                </td>
                <td
                  className="py-3 px-4 text-sm font-medium ltr"
                  style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                >
                  ₪{lead.budget.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className="text-xs tracking-widest uppercase border border-black px-2 py-0.5"
                    style={{ fontFamily: 'var(--font-jetbrains-mono), monospace' }}
                  >
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
