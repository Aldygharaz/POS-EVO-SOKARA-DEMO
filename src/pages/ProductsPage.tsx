import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { Product } from '@/types';
import {
  Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  Package, AlertTriangle
} from 'lucide-react';

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, currentUser, addAuditLog } = useStore();
  const { formatRupiah, generateId } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '', sku: '', barcode: '', categoryId: '', purchasePrice: 0, sellingPrice: 0,
    currentStock: 0, minStock: 0, unit: 'pcs', imageUrl: '', isActive: true,
  });

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode?.includes(q)
      );
    }
    return result;
  }, [products, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', sku: '', barcode: '', categoryId: '', purchasePrice: 0, sellingPrice: 0, currentStock: 0, minStock: 0, unit: 'pcs', imageUrl: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku || !form.categoryId) return;

    const cat = categories.find(c => c.id === form.categoryId);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        ...form,
        categoryName: cat?.name,
        updatedAt: new Date().toISOString(),
      } as Product;
      updateProduct(updated);
      addAuditLog({
        id: generateId('AL'), action: 'UPDATE_PRODUCT', entityType: 'product', entityId: updated.id,
        oldValue: JSON.stringify(editingProduct), newValue: JSON.stringify(updated),
        userId: currentUser!.id, userName: currentUser!.name, createdAt: new Date().toISOString(),
      });
    } else {
      const newProduct: Product = {
        ...form as Product,
        id: generateId('P'),
        categoryName: cat?.name,
        isActive: true, createdAt: new Date().toISOString(),
      };
      addProduct(newProduct);
      addAuditLog({
        id: generateId('AL'), action: 'CREATE_PRODUCT', entityType: 'product', entityId: newProduct.id,
        newValue: JSON.stringify(newProduct),
        userId: currentUser!.id, userName: currentUser!.name, createdAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (product: Product) => {
    if (!confirm(`Hapus produk "${product.name}"?`)) return;
    deleteProduct(product.id, currentUser!.id);
    addAuditLog({
      id: generateId('AL'), action: 'DELETE_PRODUCT', entityType: 'product', entityId: product.id,
      oldValue: JSON.stringify(product), reason: 'Soft delete',
      userId: currentUser!.id, userName: currentUser!.name, createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Produk</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filteredProducts.length} produk aktif</p>
        </div>
        <button onClick={openCreate} className="pos-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari produk (nama, SKU, barcode)..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            className="pos-input w-full pl-10"
          />
        </div>
      </div>

      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Produk</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Kategori</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Harga Beli</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Harga Jual</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Stok</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id} className="pos-table-row border-l-2 border-transparent hover:border-l-emerald-500">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                        {product.barcode && <p className="text-xs text-gray-500">{product.barcode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{product.sku}</td>
                  <td className="px-4 py-3">
                    <span className="pos-badge-blue text-[10px]">{product.categoryName || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono text-right">{formatRupiah(product.purchasePrice)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-500 font-mono text-right">{formatRupiah(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-mono ${product.currentStock <= product.minStock ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {product.currentStock}
                    </span>
                    {product.currentStock <= product.minStock && (
                      <AlertTriangle className="w-3 h-3 text-rose-500 inline ml-1" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Tidak ada produk</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md hover:bg-white/5 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md hover:bg-white/5 disabled:opacity-30">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Produk *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="pos-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="pos-input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Barcode</label>
                  <input value={form.barcode || ''} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} className="pos-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kategori *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="pos-input w-full">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Beli</label>
                  <input type="number" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: parseInt(e.target.value) || 0 }))} className="pos-input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Harga Jual</label>
                  <input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice: parseInt(e.target.value) || 0 }))} className="pos-input w-full" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stok</label>
                  <input type="number" value={form.currentStock} onChange={e => setForm(f => ({ ...f, currentStock: parseInt(e.target.value) || 0 }))} className="pos-input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Stok</label>
                  <input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: parseInt(e.target.value) || 0 }))} className="pos-input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Satuan</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="pos-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL Gambar</label>
                <input value={form.imageUrl || ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="pos-input w-full" placeholder="/images/prod-1.png" />
              </div>
              <div className="flex gap-3 pt-2">
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
