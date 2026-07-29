import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { TrendingUp, Target, Package, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useTheme } from 'next-themes';
import InteractiveTiltCard from '@/components/ui/InteractiveTiltCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

export default function AnalyticsPage() {
  const { transactions, products, customers, settings } = useStore();
  const { formatRupiah, formatCompactRupiah } = useFormat();
  const { theme } = useTheme();
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.analytics-card',
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)', clearProps: 'all' }
    );
  }, { scope: container });

  const now = new Date();
  const days30Ago = new Date(now.getTime() - 30 * 86400000);

  const recentTrans = transactions.filter(t => new Date(t.createdAt) >= days30Ago && !t.isVoided);

  const metrics = useMemo(() => {
    const revenue = recentTrans.reduce((s, t) => s + t.total, 0);
    const profit = recentTrans.reduce((s, t) => {
      const cost = t.items.reduce((c, i) => c + i.costPrice * i.quantity, 0);
      return s + (t.total - cost - t.discount);
    }, 0);
    const avgMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgOrder = recentTrans.length > 0 ? revenue / recentTrans.length : 0;
    const uniqueCustomers = new Set(recentTrans.map(t => t.customerId).filter(Boolean)).size;
    const totalItems = recentTrans.reduce((s, t) => s + t.items.reduce((is, i) => is + i.quantity, 0), 0);

    const inventoryValue = products.filter(p => p.isActive).reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);
    const avgInventory = products.filter(p => p.isActive).length > 0
      ? products.filter(p => p.isActive).reduce((s, p) => s + p.currentStock, 0) / products.filter(p => p.isActive).length
      : 0;

    const cogs = recentTrans.reduce((s, t) => s + t.items.reduce((is, i) => is + i.costPrice * i.quantity, 0), 0);
    const inventoryTurnover = inventoryValue > 0 ? cogs / inventoryValue : 0;

    const retention = customers.filter(c => c.isActive && c.lastPurchase && new Date(c.lastPurchase) >= days30Ago).length;
    const retentionRate = customers.filter(c => c.isActive).length > 0
      ? (retention / customers.filter(c => c.isActive).length) * 100
      : 0;

    return {
      revenue, profit, avgMargin, avgOrder, uniqueCustomers, totalItems,
      inventoryValue, avgInventory, inventoryTurnover, retentionRate,
    };
  }, [recentTrans, products, customers, days30Ago]);

  const dailyTrend = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; profit: number; cost: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      map[key] = { date: key, revenue: 0, profit: 0, cost: 0 };
    }
    recentTrans.forEach(t => {
      const d = t.createdAt.split('T')[0];
      if (map[d]) {
        map[d].revenue += t.total;
        const cost = t.items.reduce((c, i) => c + i.costPrice * i.quantity, 0);
        map[d].cost += cost;
        map[d].profit += t.total - cost - t.discount;
      }
    });
    return Object.values(map);
  }, [recentTrans, now]);

  const productMovement = useMemo(() => {
    const map: Record<string, { name: string; sold: number; stock: number; velocity: number }> = {};
    recentTrans.forEach(t => {
      t.items.forEach(i => {
        if (!map[i.productId]) map[i.productId] = { name: i.productName, sold: 0, stock: 0, velocity: 0 };
        map[i.productId].sold += i.quantity;
      });
    });
    products.filter(p => p.isActive).forEach(p => {
      if (map[p.id]) map[p.id].stock = p.currentStock;
    });
    return Object.values(map)
      .map(p => ({ ...p, velocity: p.stock > 0 ? p.sold / p.stock : 0 }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
  }, [recentTrans, products]);

  const radarData = [
    { subject: 'Revenue', A: Math.min(100, (metrics.revenue / 50000000) * 100) },
    { subject: 'Profit', A: Math.min(100, metrics.avgMargin * 2) },
    { subject: 'Inventory', A: Math.min(100, metrics.inventoryTurnover * 50) },
    { subject: 'Retention', A: metrics.retentionRate },
    { subject: 'AOV', A: Math.min(100, (metrics.avgOrder / 100000) * 100) },
    { subject: 'Growth', A: 75 },
  ];

  const healthScore = Math.round(
    (radarData.reduce((s, d) => s + d.A, 0) / radarData.length)
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Sangat Baik';
    if (score >= 60) return 'Baik';
    if (score >= 40) return 'Perlu Perhatian';
    return 'Kritis';
  };

  return (
    <div className="space-y-4" ref={container}>
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Analitik & BI</h2>
        <p className="text-sm text-slate-500 mt-0.5">Business Intelligence Dashboard</p>
      </div>

      {/* Health Score */}
      <InteractiveTiltCard className="pos-card p-5 analytics-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
              <span className={`text-2xl font-bold font-mono ${getHealthColor(healthScore)}`}>{healthScore}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Business Health Score</h3>
              <p className={`text-sm ${getHealthColor(healthScore)}`}>{getHealthLabel(healthScore)}</p>
              <p className="text-xs text-slate-500 mt-0.5">30 hari terakhir</p>
            </div>
          </div>
          <div className="w-full md:w-auto grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 text-center md:text-right">
            <div>
              <p className="text-xs text-slate-500 mb-1">Revenue</p>
              <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{formatCompactRupiah(metrics.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
              <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-500">{metrics.avgMargin.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Inventory Turnover</p>
              <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{metrics.inventoryTurnover.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Retention</p>
              <p className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">{metrics.retentionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </InteractiveTiltCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Cost Chart */}
        <InteractiveTiltCard className="pos-card p-5 analytics-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Revenue vs Profit (30 Hari)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis dataKey="date" tickFormatter={v => v.slice(8)} stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} formatter={(v: number, name: string) => [formatRupiah(v), name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : name]} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#gradRevenue)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={1} strokeOpacity={0.4} fill="url(#gradProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </InteractiveTiltCard>

        {/* Radar Chart */}
        <InteractiveTiltCard className="pos-card p-5 analytics-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Health Metrics
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} formatter={(v: number, name: string) => [`${v.toFixed(1)}`, name === 'A' ? 'Score' : name]} />
            </RadarChart>
          </ResponsiveContainer>
        </InteractiveTiltCard>
      </div>

      {/* Product Velocity */}
      <InteractiveTiltCard className="pos-card p-5 analytics-card">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Product Velocity (30 Hari)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={productMovement} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
            <XAxis type="number" stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} tick={{ fill: '#64748b', fontSize: 10 }} width={120} />
            <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} formatter={(v: number, name: string) => [v, name === 'sold' ? 'Terjual' : name]} />
            <Bar dataKey="sold" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </InteractiveTiltCard>

      {/* Target Progress */}
      <InteractiveTiltCard className="pos-card p-5 analytics-card">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          Target Bulanan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: '1', type: 'revenue', target: settings.targetRevenue || 50000000, actual: metrics.revenue },
            { id: '2', type: 'profit', target: settings.targetProfit || 10000000, actual: metrics.profit },
            { id: '3', type: 'transactions', target: settings.targetTransactions || 1000, actual: recentTrans.length },
            { id: '4', type: 'customers', target: settings.targetCustomers || 500, actual: metrics.uniqueCustomers },
          ].map(t => {
            const pct = t.target > 0 ? Math.min(100, (t.actual / t.target) * 100) : 0;
            const typeLabels: Record<string, string> = { revenue: 'Revenue', profit: 'Profit', transactions: 'Transaksi', customers: 'Pelanggan' };
            return (
              <InteractiveTiltCard key={t.id} className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 hover:border-emerald-500/30">
                <p className="text-xs text-slate-500">{typeLabels[t.type]}</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-2xl font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {t.type === 'transactions' || t.type === 'customers' ? t.actual.toLocaleString() : formatCompactRupiah(t.actual, false)}
                  </p>
                  <p className="text-xs text-slate-500 font-medium pb-1">/ {t.type === 'transactions' || t.type === 'customers' ? t.target.toLocaleString() : formatCompactRupiah(t.target)}</p>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-900 mt-2 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold mt-1.5">{pct.toFixed(1)}% tercapai</p>
              </InteractiveTiltCard>
            );
          })}
        </div>
      </InteractiveTiltCard>
    </div>
  );
}
