import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import type { Category } from '@/types';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const { generateId } = useFormat();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editing) {
      const updated = { ...editing, name, description, updatedAt: new Date().toISOString() };
      updateCategory(updated);
    } else {
      addCategory({ id: generateId('C'), name, description, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
  };

  const handleDelete = (cat: Category) => {
    const productCount = products.filter(p => p.categoryId === cat.id && p.isActive).length;
    if (productCount > 0) {
      alert(`Kategori masih memiliki ${productCount} produk aktif. Pindahkan produk terlebih dahulu.`);
      return;
    }
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    deleteCategory(cat.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Kategori</h2>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} kategori</p>
        </div>
        <button onClick={openCreate} className="pos-btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const productCount = products.filter(p => p.categoryId === cat.id && p.isActive).length;
          return (
            <div key={cat.id} className="pos-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{productCount} produk</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-xs text-gray-500 mt-2">{cat.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="pos-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editing ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Kategori *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="pos-input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="pos-input w-full h-20 resize-none" />
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
