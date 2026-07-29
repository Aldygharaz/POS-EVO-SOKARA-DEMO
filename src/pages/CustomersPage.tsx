import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { Customer } from '@/types';
import { Search, Plus, Edit2, Trash2, Star, Filter, Users, Award } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import InteractiveTiltCard from '@/components/ui/InteractiveTiltCard';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const { formatRupiah, generateId } = useFormat();

  const [searchQuery, setSearchQuery] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({});

  useGSAP(() => {
    gsap.from('.customer-kpi-card', {
      y: 15,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out',
      duration: 0.4,
      clearProps: 'all'
    });
  }, []);

  useGSAP(() => {
    gsap.from('.customer-table-row', {
      y: 10,
      opacity: 0,
      stagger: 0.05,
      ease: 'power2.out',
      duration: 0.3,
      clearProps: 'all'
    });
  }, [searchQuery, membershipFilter]);

  const filtered = useMemo(() => {
    let result = customers.filter(c => c.isActive);
    if (membershipFilter !== 'all') {
      result = result.filter(c => c.membership === membershipFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q));
    }
    return result;
  }, [customers, searchQuery, membershipFilter]);

  const totalPoints = useMemo(() => customers.reduce((sum, c) => sum + (c.points || 0), 0), [customers]);
  const vipCount = useMemo(() => customers.filter(c => c.membership === 'gold' || c.membership === 'platinum').length, [customers]);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InteractiveTiltCard className="customer-kpi-card pos-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Total Pelanggan Aktif</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{customers.length}</h3>
            </div>
          </div>
        </InteractiveTiltCard>
        
        <InteractiveTiltCard className="customer-kpi-card pos-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Total Poin Beredar</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{totalPoints.toLocaleString()}</h3>
            </div>
          </div>
        </InteractiveTiltCard>

        <InteractiveTiltCard className="customer-kpi-card pos-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">Pelanggan VIP (Gold+)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{vipCount}</h3>
            </div>
          </div>
        </InteractiveTiltCard>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {(['all', 'bronze', 'silver', 'gold', 'platinum'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setMembershipFilter(tier)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize ${membershipFilter === tier ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {tier === 'all' ? 'Semua' : tier}
            </button>
          ))}
        </div>
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
                <tr key={c.id} className="pos-table-row customer-table-row">
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
