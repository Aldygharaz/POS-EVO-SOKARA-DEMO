import { useDashboard } from '@/hooks/useDashboard';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import {
  TrendingUp, ShoppingCart, Package,
  AlertTriangle, Bell, Zap, ArrowUpRight, ArrowDownRight,
  DollarSign, Receipt, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from 'next-themes';

const COLORS = ['#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'];
const DARK_COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'];

export default function DashboardPage() {
  const { kpi, salesTrend, topProducts, alerts, categorySales } = useDashboard();
  const { products } = useStore();
  const { formatRupiah } = useFormat();
  const { theme } = useTheme();

  const kpiCards = [
    {
      label: 'Revenue Hari Ini',
      value: kpi.todayRevenue,
      icon: DollarSign,
      trend: kpi.growthRevenue,
      color: '#00FF41',
      prefix: 'Rp',
    },
    {
      label: 'Transaksi Hari Ini',
      value: kpi.todayTransactions,
      icon: Receipt,
      trend: kpi.growthTransactions,
      color: '#00FF41',
      prefix: '',
    },
    {
      label: 'Profit Hari Ini',
      value: kpi.todayProfit,
      icon: TrendingUp,
      trend: kpi.growthRevenue,
      color: '#00FF41',
      prefix: 'Rp',
    },
    {
      label: 'Rata-rata Order',
      value: kpi.averageOrderValue,
      icon: ShoppingCart,
      trend: 0,
      color: '#00FF41',
      prefix: 'Rp',
    },
  ];

  const lowStockProducts = products.filter(p => p.isActive && p.currentStock <= p.minStock).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Ringkasan bisnis hari ini</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pos-badge-green flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Live
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className="pos-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                  {card.prefix}{formatRupiah(card.value, false)}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            {card.trend !== 0 && (
              <div className="flex items-center gap-1 mt-3">
                {card.trend >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-500" />
                )}
                <span className={`text-xs font-medium ${card.trend >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
                  {Math.abs(card.trend).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500">vs kemarin</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend Chart */}
        <div className="pos-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              Tren Penjualan 30 Hari
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                <span className="text-xs text-slate-500">Profit</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => v.slice(8)}
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                tick={{ fill: '#666', fontSize: 11 }}
              />
              <YAxis
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                tick={{ fill: '#666', fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#999' }}
                itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                formatter={(value: number, name: string) => [`Rp${formatRupiah(value, false)}`, name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : name]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={1}
                strokeOpacity={0.4}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales Pie */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Penjualan per Kategori
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categorySales}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="revenue"
                nameKey="name"
              >
                {categorySales.map((_, index) => {
                  const palette = theme === 'dark' ? DARK_COLORS : COLORS;
                  return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#111111' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                formatter={(value: number, name: string) => [`Rp${formatRupiah(value, false)}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {categorySales.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (theme === 'dark' ? DARK_COLORS : COLORS)[i % COLORS.length] }} />
                  <span className="text-slate-500 dark:text-slate-400">{cat.name}</span>
                </div>
                <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(cat.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Produk Terlaris
          </h3>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((prod, i) => (
              <div key={prod.productId} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-500">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{prod.productName}</p>
                  <p className="text-xs text-slate-500">{prod.quantity} terjual</p>
                </div>
                <span className="text-sm font-mono text-emerald-600 dark:text-emerald-500">{formatRupiah(prod.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Peringatan
          </h3>
          <div className="space-y-2.5">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                  alert.type === 'critical'
                    ? 'bg-rose-500/5 border-rose-500/10'
                    : alert.type === 'high'
                    ? 'bg-amber-500/5 border-amber-500/10'
                    : 'bg-emerald-500/5 border-emerald-500/10'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  alert.type === 'critical' ? 'text-rose-500' :
                  alert.type === 'high' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-500'
                }`} />
                <div>
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{alert.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Tidak ada peringatan</p>
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-rose-500" />
            Stok Menipis
          </h3>
          <div className="space-y-2.5">
            {lowStockProducts.map(prod => (
              <div key={prod.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{prod.name}</p>
                  <p className="text-xs text-slate-500">Min: {prod.minStock} {prod.unit}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-mono font-semibold ${
                    prod.currentStock === 0 ? 'text-rose-500' : 'text-amber-500'
                  }`}>
                    {prod.currentStock}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">{prod.unit}</span>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Semua stok aman</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
