import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { FileText, Download, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'];

export default function ReportsPage() {
  const { transactions, products } = useStore();
  const { formatRupiah } = useFormat();

  const [period, setPeriod] = useState('week');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();
    if (period === 'today') cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') cutoff = new Date(now.getTime() - 7 * 86400000);
    else if (period === 'month') cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    else cutoff = new Date(now.getFullYear(), 0, 1);
    return transactions.filter(t => new Date(t.createdAt) >= cutoff && !t.isVoided);
  }, [transactions, period]);

  const summary = useMemo(() => {
    const revenue = filteredTransactions.reduce((s, t) => s + t.total, 0);
    const profit = filteredTransactions.reduce((s, t) => {
      const cost = t.items.reduce((c, i) => c + i.costPrice * i.quantity, 0);
      return s + (t.total - cost - t.discount);
    }, 0);
    const count = filteredTransactions.length;
    const avgOrder = count > 0 ? Math.round(revenue / count) : 0;
    return { revenue, profit, count, avgOrder };
  }, [filteredTransactions]);

  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; profit: number; transactions: number }> = {};
    filteredTransactions.forEach(t => {
      const d = t.createdAt.split('T')[0];
      if (!map[d]) map[d] = { date: d, revenue: 0, profit: 0, transactions: 0 };
      map[d].revenue += t.total;
      const cost = t.items.reduce((c, i) => c + i.costPrice * i.quantity, 0);
      map[d].profit += t.total - cost - t.discount;
      map[d].transactions += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTransactions]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        if (!map[i.productName]) map[i.productName] = { name: i.productName, qty: 0, revenue: 0 };
        map[i.productName].qty += i.quantity;
        map[i.productName].revenue += i.subtotal;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, { name: string; value: number }> = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(i => {
        const prod = products.find(p => p.id === i.productId);
        const cat = prod?.categoryName || 'Lainnya';
        if (!map[cat]) map[cat] = { name: cat, value: 0 };
        map[cat].value += i.subtotal;
      });
    });
    return Object.values(map);
  }, [filteredTransactions, products]);

  const exportCSV = () => {
    const rows = [
      ['Invoice', 'Tanggal', 'Pelanggan', 'Kasir', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Metode'],
      ...filteredTransactions.map(t => [
        t.invoiceNumber, t.createdAt, t.customerName || '-', t.cashierName,
        t.subtotal.toString(), t.discount.toString(), t.tax.toString(), t.total.toString(), t.paymentMethod,
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Laporan</h2>
          <p className="text-sm text-slate-500 mt-0.5">Ringkasan penjualan dan profit</p>
        </div>
        <button onClick={exportCSV} className="pos-btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'today', label: 'Hari Ini' },
          { key: 'week', label: '7 Hari' },
          { key: 'month', label: 'Bulan Ini' },
          { key: 'year', label: 'Tahun Ini' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === p.key
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue', value: summary.revenue, icon: DollarSign, color: '#10b981' },
          { label: 'Profit', value: summary.profit, icon: TrendingUp, color: '#10b981' },
          { label: 'Transaksi', value: summary.count, icon: ShoppingCart, color: '#10b981' },
          { label: 'Rata-rata Order', value: summary.avgOrder, icon: FileText, color: '#10b981' },
        ].map((card, i) => (
          <div key={i} className="pos-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-1">
                  {typeof card.value === 'number' && card.value > 999 ? formatRupiah(card.value) : card.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Chart */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Tren Harian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" />
              <XAxis dataKey="date" tickFormatter={v => v.slice(8)} stroke="rgba(100,116,139,0.2)" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="rgba(100,116,139,0.2)" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} formatter={(v: number, name: string) => [formatRupiah(v), name === 'revenue' ? 'Revenue' : name === 'value' ? 'Total' : name]} />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="pos-card p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-500">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.qty} terjual</p>
                </div>
                <span className="text-sm font-mono text-emerald-600 dark:text-emerald-500">{formatRupiah(p.revenue)}</span>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Tidak ada data</p>}
          </div>
        </div>
      </div>

      {/* Category Pie */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Penjualan per Kategori</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} formatter={(v: number, name: string) => [formatRupiah(v), name === 'revenue' ? 'Revenue' : name === 'value' ? 'Total' : name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-slate-500 dark:text-slate-400">{cat.name}</span>
                <span className="text-sm font-mono text-slate-900 dark:text-slate-100 ml-2">{formatRupiah(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
