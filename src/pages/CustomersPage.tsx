import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { Customer } from '@/types';
import { Search, Plus, Edit2, Trash2, Star } from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const { formatRupiah, generateId } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  const filtered = useMemo(() => {
    let result = customers.filter(c => c.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q));
    }
    return result;
  }, [customers, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '', membership: 'bronze' });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name?.trim()) return;
    if (editing) {
      updateCustomer({ ...editing, ...form, updatedAt: new Date().toISOString() } as Customer);
    } else {
      addCustomer({
        ...form as Customer,
        id: generateId('CU'),
        membership: form.membership || 'bronze',
        points: 0, totalSpent: 0, transactionCount: 0,
        isActive: true, createdAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
  };

  const tierColors: Record<string, string> = {
    bronze: 'text-amber-600 bg-amber-600/10',
    silver: 'text-gray-300 bg-gray-300/10',
    gold: 'text-yellow-400 bg-yellow-400/10',
    platinum: 'text-cyan-400 bg-cyan-400/10',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pelanggan</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} pelanggan aktif</p>
        </div>
        <button onClick={openCreate} className="pos-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Cari pelanggan..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pos-input w-full pl-10"
        />
      </div>

      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Pelanggan</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Membership</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Poin</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Total Belanja</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Transaksi</th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="pos-table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                        {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pos-badge text-[10px] capitalize ${tierColors[c.membership]}`}>
                      <Star className="w-3 h-3 mr-1" />
                      {c.membership}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100 text-right">{c.points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-emerald-600 dark:text-emerald-500 text-right">{formatRupiah(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100 text-right">{c.transactionCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if (confirm('Hapus pelanggan?')) deleteCustomer(c.id); }} className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Tidak ada pelanggan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{editing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama *</label>
                <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="pos-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Telepon</label>
                  <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="pos-input w-full" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="pos-input w-full" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alamat</label>
                <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="pos-input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Membership</label>
                <select value={form.membership || 'bronze'} onChange={e => setForm(f => ({ ...f, membership: e.target.value as any }))} className="pos-input w-full">
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
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
