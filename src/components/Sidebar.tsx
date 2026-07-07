import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Users,
  Receipt,
  Warehouse,
  BarChart3,
  Settings,
  ClipboardList,
  ShieldCheck,
  LogOut,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const menuGroups = [
  {
    label: 'Utama',
    items: [
      { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { page: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { page: 'products', label: 'Produk', icon: Package },
      { page: 'categories', label: 'Kategori', icon: Tag },
      { page: 'customers', label: 'Pelanggan', icon: Users },
      { page: 'transactions', label: 'Transaksi', icon: Receipt },
      { page: 'stock', label: 'Stok', icon: Warehouse },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { page: 'reports', label: 'Laporan', icon: ClipboardList },
      { page: 'analytics', label: 'Analitik & BI', icon: BarChart3 },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { page: 'settings', label: 'Pengaturan', icon: Settings },
      { page: 'audit', label: 'Audit Log', icon: ShieldCheck },
    ],
  },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { currentPage, setCurrentPage, currentUser, logout, hasPermission } = useStore();

  const handleNav = (page: string) => {
    setCurrentPage(page);
    onMobileClose();
  };

  const renderMenuItem = (item: { page: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    if (!hasPermission(item.page)) return null;
    const isActive = currentPage === item.page;
    const Icon = item.icon;

    return (
      <button
        key={item.page}
        onClick={() => handleNav(item.page)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
          isActive
            ? 'bg-emerald-600/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-600/20 dark:border-emerald-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
        }`}
      >
        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
        <span>{item.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-600 dark:text-emerald-500" />}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">POS EVO</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Enterprise</p>
          </div>
          <button onClick={onMobileClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="mx-3 mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600/20 dark:from-emerald-500/20 to-emerald-600/5 dark:to-emerald-500/5 border border-emerald-600/20 dark:border-emerald-500/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto pos-scrollbar px-3 py-3 space-y-4">
          {menuGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => renderMenuItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
