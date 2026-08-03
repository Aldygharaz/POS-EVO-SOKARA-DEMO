import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { Store, Percent, FileText, Save, AlertTriangle, Target, Link2, Users, Database, Trash2, Key, UserPlus, X } from 'lucide-react';
import { resetDatabase } from '@/data/seedData';
import type { UserRole } from '@/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { settings, updateSettings, currentUser, addAuditLog, users, updateUser, addUser } = useStore();
  const { generateId } = useFormat();

  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', username: '', password: '', role: 'kasir' as UserRole, isActive: true });

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

      {/* Google Sheets Sync */}
      <div className="pos-card p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          Integrasi Google Sheets
        </h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Webhook URL (Apps Script)</label>
          <input
            type="url"
            value={form.googleSheetsWebhookUrl || ''}
            onChange={e => setForm(f => ({ ...f, googleSheetsWebhookUrl: e.target.value }))}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="pos-input w-full font-mono text-xs"
          />
          <p className="text-xs text-gray-500 mt-2">
            Setiap transaksi baru akan otomatis dikirim ke URL ini secara realtime.
          </p>
        </div>
      </div>

      {/* User Management */}
      <div className="pos-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            Manajemen Pengguna (Akun)
          </h3>
          <button 
            onClick={() => setShowAddUserModal(true)}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tambah Pengguna
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 rounded-tr-lg rounded-br-lg font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.username}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{u.role}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => {
                          const newPassword = window.prompt(`Masukkan password baru untuk ${u.name}:`);
                          if (newPassword && newPassword.trim() !== '') {
                            const hashed = btoa(newPassword + u.salt);
                            updateUser({ ...u, password: hashed });
                            alert(`Password untuk ${u.name} berhasil diubah!`);
                          }
                        }}
                        className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                        title="Ganti Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 disabled:opacity-30" 
                        disabled={u.role === 'owner'}
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Management */}
      <div className="pos-card p-5 border-l-4 border-rose-500">
        <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-500 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Reset Database (Pemulihan)
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Kembalikan semua data ke kondisi awal (Data Dummy).</p>
            <p className="text-xs text-rose-500 mt-1">Peringatan: Semua data transaksi, produk, dan pengaturan saat ini akan terhapus!</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Apakah Anda yakin ingin me-reset seluruh database ke data demo awal? Semua data saat ini akan hilang permanen!")) {
                resetDatabase();
              }
            }}
            className="px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset Database Sekarang
          </button>
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-500" />
                Tambah Pengguna Baru
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              // Poka-Yoke: Check Duplicate Username
              if (users.some(u => u.username.toLowerCase() === newUserForm.username.toLowerCase())) {
                toast.error('Username sudah digunakan! Silakan pilih username lain.');
                return;
              }
              addUser(newUserForm);
              toast.success(`Pengguna ${newUserForm.name} berhasil ditambahkan!`);
              setNewUserForm({ name: '', username: '', password: '', role: 'kasir', isActive: true });
              setShowAddUserModal(false);
            }} className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Nama Lengkap</label>
                <input required value={newUserForm.name} onChange={e => setNewUserForm(f => ({ ...f, name: e.target.value }))} className="pos-input w-full" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Username</label>
                <input required value={newUserForm.username} onChange={e => setNewUserForm(f => ({ ...f, username: e.target.value }))} className="pos-input w-full" placeholder="Cth: budi" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm(f => ({ ...f, password: e.target.value }))} className="pos-input w-full" placeholder="Min. 6 karakter" minLength={6} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Role (Peran)</label>
                <select value={newUserForm.role} onChange={e => setNewUserForm(f => ({ ...f, role: e.target.value as UserRole }))} className="pos-input w-full bg-white dark:bg-slate-900">
                  <option value="kasir">Kasir</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="pos-btn-secondary flex-1">Batal</button>
                <button type="submit" className="pos-btn-primary flex-1">Simpan Pengguna</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
