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
  Zap,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen
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
  const { currentPage, setCurrentPage, currentUser, hasPermission, isSidebarCollapsed, toggleSidebarCollapse } = useStore();

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
        title={isSidebarCollapsed ? item.label : undefined}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isSidebarCollapsed ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-600 dark:text-emerald-400 font-semibold before:content-[""] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:bg-emerald-500 before:rounded-r-full before:shadow-[0_0_8px_#10b981]'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
        }`}
      >
        <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
        {!isSidebarCollapsed && <span>{item.label}</span>}
        {!isSidebarCollapsed && isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-600 dark:text-emerald-400" />}
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
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-[240px]' : `-translate-x-full lg:translate-x-0 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[240px]'}`
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-800 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white dark:text-slate-900" />
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden transition-all">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">Sokara POS</h1>
              <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider truncate">Sokara AI Enterprise</p>
            </div>
          )}
          
          <button 
            onClick={toggleSidebarCollapse} 
            className="hidden lg:flex text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 ml-auto shrink-0 transition-transform"
            title={isSidebarCollapsed ? "Perluas Sidebar" : "Lipat Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <button onClick={onMobileClose} className="ml-auto lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className={`mx-3 mt-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 ${isSidebarCollapsed ? 'px-2 flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-emerald-500/25 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center" title={currentUser?.name}>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser?.name}</p>
                  {currentUser?.username === 'demo' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider ml-2 shrink-0">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize truncate">{currentUser?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto pos-scrollbar px-3 py-3 space-y-4">
          {menuGroups.map(group => {
            const hasVisibleItems = group.items.some(item => hasPermission(item.page));
            if (!hasVisibleItems) return null;
            
            return (
              <div key={group.label}>
                <p className={`text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 mb-1.5 ${isSidebarCollapsed ? 'text-center opacity-0 h-0 overflow-hidden m-0' : ''}`}>
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => renderMenuItem(item))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logout & Reset */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 flex gap-2">
          {currentUser?.username === 'demo' && !isSidebarCollapsed && (
            <button
              onClick={() => {
                if(confirm('Reset semua data ke versi awal?')) {
                  useStore.getState().factoryReset();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-500/10 rounded-lg transition-colors border border-amber-500/20"
              title="Factory Reset Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => useStore.setState({ currentUser: null })}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors ${currentUser?.username === 'demo' && !isSidebarCollapsed ? 'flex-[2]' : 'w-full'}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
