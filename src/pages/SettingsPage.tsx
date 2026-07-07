import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { Store, Percent, FileText, Save, AlertTriangle, Target } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, currentUser, addAuditLog } = useStore();
  const { generateId } = useFormat();

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    addAuditLog({
      id: generateId('AL'), action: 'UPDATE_SETTINGS', entityType: 'settings',
      newValue: JSON.stringify(form),
      userId: currentUser!.id, userName: currentUser!.name, createdAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi aplikasi POS</p>
      </div>

      {/* Store Info */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Informasi Toko
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nama Toko</label>
            <input
              value={form.storeName}
              onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))}
              className="pos-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Alamat</label>
            <textarea
              value={form.storeAddress || ''}
              onChange={e => setForm(f => ({ ...f, storeAddress: e.target.value }))}
              className="pos-input w-full h-16 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Telepon</label>
            <input
              value={form.storePhone || ''}
              onChange={e => setForm(f => ({ ...f, storePhone: e.target.value }))}
              className="pos-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Tax & Invoice */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Pajak & Invoice
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pajak (%)</label>
            <input
              type="number"
              value={form.taxRate}
              onChange={e => setForm(f => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))}
              className="pos-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prefix Invoice</label>
            <input
              value={form.invoicePrefix}
              onChange={e => setForm(f => ({ ...f, invoicePrefix: e.target.value }))}
              className="pos-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Receipt */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Struk
        </h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Footer Struk</label>
          <textarea
            value={form.receiptFooter || ''}
            onChange={e => setForm(f => ({ ...f, receiptFooter: e.target.value }))}
            className="pos-input w-full h-20 resize-none"
            placeholder="Terima kasih telah berbelanja"
          />
        </div>
      </div>

      {/* Inventory */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Stok
        </h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Batas Stok Menipis</label>
          <input
            type="number"
            value={form.lowStockThreshold}
            onChange={e => setForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 0 }))}
            className="pos-input w-full"
          />
        </div>
      </div>

      {/* Business Targets */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Target Bisnis Bulanan (Analitik & BI)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Revenue (Rp)</label>
            <input
              type="number"
              value={form.targetRevenue || ''}
              onChange={e => setForm(f => ({ ...f, targetRevenue: parseFloat(e.target.value) || 0 }))}
              className="pos-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Profit (Rp)</label>
            <input
              type="number"
              value={form.targetProfit || ''}
              onChange={e => setForm(f => ({ ...f, targetProfit: parseFloat(e.target.value) || 0 }))}
              className="pos-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Transaksi</label>
            <input
              type="number"
              value={form.targetTransactions || ''}
              onChange={e => setForm(f => ({ ...f, targetTransactions: parseInt(e.target.value) || 0 }))}
              className="pos-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Pelanggan Baru</label>
            <input
              type="number"
              value={form.targetCustomers || ''}
              onChange={e => setForm(f => ({ ...f, targetCustomers: parseInt(e.target.value) || 0 }))}
              className="pos-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <span className="pos-badge-green text-xs flex items-center gap-1">
            <Save className="w-3 h-3" />
            Pengaturan tersimpan
          </span>
        )}
        <div className="ml-auto">
          <button onClick={handleSave} className="pos-btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
