import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useDashboard } from '@/hooks/useDashboard';
import { Menu, Search, Bell, Clock, Fingerprint, Sun, Moon, AlertTriangle, PlaySquare, StopCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useFormat } from '@/hooks/useFormat';
import { toast } from 'sonner';

interface TopBarProps {
  alertCount: number;
  onMenuToggle: () => void;
}

export default function TopBar({ alertCount, onMenuToggle }: TopBarProps) {
  const { settings, dismissAlert, clearAllAlerts, products, activeSession, endSession, transactions } = useStore();
  const { alerts } = useDashboard();
  const { theme, setTheme } = useTheme();
  const { formatRupiah } = useFormat();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [actualClosingBalance, setActualClosingBalance] = useState('');

  // Calculate session live revenue
  const sessionRevenue = activeSession ? transactions
    .filter(t => t.cashierId === activeSession.cashierId && new Date(t.createdAt).getTime() >= new Date(activeSession.startTime).getTime() && !t.isVoided && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.total, 0) : 0;
  
  const expectedBalance = activeSession ? activeSession.openingBalance + sessionRevenue : 0;

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
            
            {activeSession && (
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800/30">
                  <PlaySquare className="w-3 h-3" />
                  Sesi Kasir Aktif
                </span>
                <button 
                  onClick={() => setShowEndSessionModal(true)}
                  className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-full border border-rose-200 dark:border-rose-800/30 transition-colors"
                >
                  <StopCircle className="w-3 h-3" />
                  Tutup Sesi
                </button>
              </div>
            )}
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
                    <button onClick={() => { clearAllAlerts(alerts.map(a => a.id)); setShowNotifications(false); }} className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline">Bersihkan semua</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto pos-scrollbar">
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">Belum ada notifikasi baru</div>
                  ) : (
                    alerts.map(alert => (
                      <div 
                        key={alert.id} 
                        onClick={() => dismissAlert(alert.id)}
                        className={`p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-emerald-50/30 dark:bg-emerald-900/10`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            alert.type === 'critical' ? 'bg-rose-500' :
                            alert.type === 'high' ? 'bg-amber-500' :
                            alert.type === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                          }`} />
                          <span className={`text-xs font-semibold truncate text-slate-900 dark:text-slate-100`}>
                            {alert.title}
                          </span>
                        </div>
                        <p className={`text-xs ml-4 line-clamp-2 text-slate-700 dark:text-slate-300`}>
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

    {/* End Session Modal */}
    {showEndSessionModal && activeSession && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <StopCircle className="w-5 h-5 text-rose-500" />
              Tutup Sesi Kasir
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Saldo Awal (Modal)</span>
                <span className="font-mono">{formatRupiah(activeSession.openingBalance)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Penerimaan Tunai</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{formatRupiah(sessionRevenue)}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white text-base">
                <span>Total Seharusnya</span>
                <span className="font-mono">{formatRupiah(expectedBalance)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Uang Aktual di Laci Kasir
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                <input
                  type="text"
                  value={actualClosingBalance === '' ? '' : formatRupiah(parseInt(actualClosingBalance.replace(/\D/g, '')) || 0).replace('Rp', '').trim()}
                  onChange={e => setActualClosingBalance(e.target.value)}
                  placeholder="0"
                  className="pos-input w-full pl-10 h-12 text-lg font-bold"
                />
              </div>
            </div>

            {actualClosingBalance !== '' && (
              <div className={`p-3 rounded-lg flex items-center justify-between text-sm font-medium ${
                (parseInt(actualClosingBalance.replace(/\D/g, '')) || 0) === expectedBalance
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
              }`}>
                <span>Selisih:</span>
                <span className="font-mono font-bold">
                  {formatRupiah((parseInt(actualClosingBalance.replace(/\D/g, '')) || 0) - expectedBalance)}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex gap-3">
            <button 
              onClick={() => {
                setShowEndSessionModal(false);
                setActualClosingBalance('');
              }}
              className="pos-btn-secondary flex-1"
            >
              Batal
            </button>
            <button 
              onClick={() => {
                if (!actualClosingBalance) {
                  toast.error('Masukkan jumlah uang aktual');
                  return;
                }
                const amount = parseInt(actualClosingBalance.replace(/\D/g, '')) || 0;
                endSession(amount);
                setShowEndSessionModal(false);
                setActualClosingBalance('');
                toast.success('Sesi kasir berhasil ditutup');
              }}
              className="pos-btn-danger flex-1"
            >
              Tutup Sesi
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
