import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { StockMutation } from '@/types';
import { Search, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StockPage() {
  const { products, stockMutations, addStockMutation, updateProduct, currentUser, addAuditLog } = useStore();
  const { formatDate, generateId } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [mutationType, setMutationType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }, [products, searchQuery]);

  const handleSubmit = () => {
    if (!selectedProduct || !quantity || !reason) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity);
    const beforeStock = product.currentStock;
    let afterStock = beforeStock;

    if (mutationType === 'in') afterStock = beforeStock + qty;
    else if (mutationType === 'out') afterStock = Math.max(0, beforeStock - qty);
    else afterStock = qty;

    const mutation: StockMutation = {
      id: generateId('SM'),
      productId: product.id,
      productName: product.name,
      type: mutationType,
      quantity: mutationType === 'in' ? qty : mutationType === 'out' ? -qty : qty - beforeStock,
      beforeStock,
      afterStock,
      reason,
      createdBy: currentUser!.id,
      createdByName: currentUser!.name,
      createdAt: new Date().toISOString(),
    };

    addStockMutation(mutation);
    updateProduct({ ...product, currentStock: afterStock });
    addAuditLog({
      id: generateId('AL'), action: `STOCK_${mutationType.toUpperCase()}`, entityType: 'stock', entityId: product.id,
      newValue: JSON.stringify({ product: product.name, qty, before: beforeStock, after: afterStock }),
      reason, userId: currentUser!.id, userName: currentUser!.name, createdAt: new Date().toISOString(),
    });

    setShowModal(false);
    setSelectedProduct('');
    setQuantity('');
    setReason('');
  };

  const typeIcons = {
    in: { icon: ArrowDownLeft, color: 'text-emerald-600 dark:text-emerald-500', bg: 'bg-emerald-500/10', label: 'Masuk' },
    out: { icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Keluar' },
    adjustment: { icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Penyesuaian' },
    opname: { icon: AlertTriangle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Opname' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manajemen Stok</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola stok produk</p>
        </div>
        <button onClick={() => setShowModal(true)} className="pos-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Mutasi Stok
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pos-input w-full pl-10" />
      </div>

      {/* Stock Table */}
      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Produk</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">SKU</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Stok</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Min Stok</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className="pos-table-row">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.sku}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right">
                    <span className={p.currentStock <= p.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}>{p.currentStock}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500 text-right">{p.minStock}</td>
                  <td className="px-4 py-3">
                    {p.currentStock === 0 ? (
                      <span className="pos-badge-red text-[10px]">Habis</span>
                    ) : p.currentStock <= p.minStock ? (
                      <span className="pos-badge-amber text-[10px]">Menipis</span>
                    ) : (
                      <span className="pos-badge-green text-[10px]">Aman</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada produk</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Mutations */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Riwayat Mutasi Stok</h3>
        <div className="space-y-2">
          {stockMutations.slice(0, 10).map(m => {
            const t = typeIcons[m.type];
            const Icon = t.icon;
            return (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">{m.productName}</p>
                  <p className="text-xs text-gray-500">{m.reason} - {m.createdByName}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-semibold ${m.quantity >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
                    {m.quantity >= 0 ? '+' : ''}{m.quantity}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(m.createdAt)}</p>
                </div>
              </div>
            );
          })}
          {stockMutations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada mutasi stok</p>
          )}
        </div>
      </div>

      {/* Mutation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Mutasi Stok</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Produk *</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="pos-input w-full">
                  <option value="">Pilih Produk</option>
                  {products.filter(p => p.isActive).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stok: {p.currentStock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jenis Mutasi *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['in', 'out', 'adjustment'] as const).map(t => {
                    const cfg = typeIcons[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setMutationType(t)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          mutationType === t
                            ? `${cfg.bg} ${cfg.color} border-current`
                            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  {mutationType === 'adjustment' ? 'Stok Baru *' : 'Jumlah *'}
                </label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="pos-input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alasan *</label>
                <input value={reason} onChange={e => setReason(e.target.value)} className="pos-input w-full" placeholder="Contoh: Pembelian dari supplier" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="pos-btn-secondary flex-1">Batal</button>
                <button onClick={handleSubmit} className="pos-btn-primary flex-1">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
