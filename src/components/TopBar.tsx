import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Menu, Search, Bell, Clock, Fingerprint, Sun, Moon, AlertTriangle } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  alertCount: number;
  onMenuToggle: () => void;
}

export default function TopBar({ alertCount, onMenuToggle }: TopBarProps) {
  const { settings, alerts, markAlertRead, clearAllAlerts, products } = useStore();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const lowStockCount = products.filter(p => p.isActive && p.currentStock <= p.minStock).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateStr = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className={`offline-badge ${isOffline ? 'visible' : 'hidden'}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>Koneksi Terputus - Mode Offline Aktif</span>
      </div>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:block">
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{timeStr}</span>
              </div>
              <span className="hidden lg:inline text-slate-400 dark:text-slate-600">{dateStr}</span>
              {lowStockCount > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-semibold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lowStockCount} Stok Menipis</span>
                </div>
              )}
              <div className="hidden lg:flex items-center gap-1.5 ml-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">F1 POS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">F2 Produk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari transaksi atau produk... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {alertCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifikasi</span>
                  {alerts.length > 0 && (
                    <button onClick={() => { clearAllAlerts(); setShowNotifications(false); }} className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline">Bersihkan semua</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto pos-scrollbar">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">Belum ada notifikasi baru</div>
                  ) : (
                    alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        onClick={() => markAlertRead(alert.id)}
                        className={`p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!alert.isRead ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            alert.type === 'critical' ? 'bg-rose-500' :
                            alert.type === 'high' ? 'bg-amber-500' :
                            alert.type === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          <span className={`text-xs font-semibold truncate ${!alert.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                            {alert.title}
                          </span>
                        </div>
                        <p className={`text-xs ml-4 line-clamp-2 ${!alert.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600/20 dark:from-emerald-500/20 to-emerald-600/5 dark:to-emerald-500/5 border border-emerald-600/20 dark:border-emerald-500/20 flex items-center justify-center">
              <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{settings.storeName}</p>
              <p className="text-[10px] text-slate-500">{settings.storeAddress?.slice(0, 30)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pos-input w-full pl-10 text-sm"
          />
        </div>
      </div>
    </header>
    </>
  );
}
