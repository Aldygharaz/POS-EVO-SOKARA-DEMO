import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { Search, Receipt, Ban, Eye, X } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions, voidTransaction, currentUser } = useStore();
  const { formatRupiah, formatDate } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [showVoid, setShowVoid] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.invoiceNumber.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.cashierName.toLowerCase().includes(q)
      );
    }
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter(t => t.createdAt.startsWith(today));
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      result = result.filter(t => t.createdAt >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      result = result.filter(t => t.createdAt >= monthStart);
    }
    return result;
  }, [transactions, searchQuery, dateFilter]);

  const handleVoid = (id: string) => {
    if (!voidReason.trim()) return;
    voidTransaction(id, voidReason, currentUser!.id);
    setShowVoid(null);
    setVoidReason('');
  };

  const detail = showDetail ? transactions.find(t => t.id === showDetail) : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Transaksi</h2>
        <p className="text-sm text-gray-500 mt-0.5">{filtered.length} transaksi</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari invoice, pelanggan, kasir..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pos-input w-full pl-10"
          />
        </div>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="pos-input sm:w-40">
          <option value="all">Semua Waktu</option>
          <option value="today">Hari Ini</option>
          <option value="week">7 Hari</option>
          <option value="month">Bulan Ini</option>
        </select>
      </div>

      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Tanggal</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Pelanggan</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Kasir</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className={`pos-table-row ${t.isVoided ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-mono text-slate-900 dark:text-slate-100">{t.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">{t.customerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{t.cashierName}</td>
                  <td className="px-4 py-3 text-sm font-mono text-emerald-600 dark:text-emerald-500 text-right">{formatRupiah(t.total)}</td>
                  <td className="px-4 py-3 text-center">
                    {t.isVoided ? (
                      <span className="pos-badge-red text-[10px]">Void</span>
                    ) : (
                      <span className="pos-badge-green text-[10px]">Sukses</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setShowDetail(t.id)} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!t.isVoided && (
                        <button onClick={() => setShowVoid(t.id)} className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Detail Transaksi</h3>
              <button onClick={() => setShowDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="text-slate-900 dark:text-slate-100 font-mono">{detail.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tanggal</span><span className="text-slate-900 dark:text-slate-100">{formatDate(detail.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Kasir</span><span className="text-slate-900 dark:text-slate-100">{detail.cashierName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pelanggan</span><span className="text-slate-900 dark:text-slate-100">{detail.customerName || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Pembayaran</span><span className="text-slate-900 dark:text-slate-100 uppercase">{detail.paymentMethod}</span></div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
              {detail.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div><span className="text-slate-900 dark:text-slate-100">{item.productName}</span><span className="text-slate-500 ml-1">x{item.quantity}</span></div>
                  <span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-slate-900 dark:text-slate-100 font-mono">{formatRupiah(detail.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Diskon</span><span className="text-rose-500 font-mono">-{formatRupiah(detail.discount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Pajak</span><span className="text-slate-400 font-mono">{formatRupiah(detail.tax)}</span></div>
              <div className="flex justify-between text-base font-semibold pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-900 dark:text-slate-100">TOTAL</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-mono">{formatRupiah(detail.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {showVoid && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Void Transaksi</h3>
            <p className="text-sm text-gray-500 mb-3">Masukkan alasan pembatalan transaksi</p>
            <textarea
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
              placeholder="Alasan void..."
              className="pos-input w-full h-20 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowVoid(null); setVoidReason(''); }} className="pos-btn-secondary flex-1">Batal</button>
              <button onClick={() => handleVoid(showVoid)} disabled={!voidReason.trim()} className="pos-btn-danger flex-1 disabled:opacity-30">
                <Ban className="w-4 h-4 inline mr-1" />
                Void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
