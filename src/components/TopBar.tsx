import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Menu, Search, Bell, Clock, Fingerprint, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  alertCount: number;
  onMenuToggle: () => void;
}

export default function TopBar({ alertCount, onMenuToggle }: TopBarProps) {
  const { settings } = useStore();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

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
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-slate-900 dark:text-slate-100">{timeStr}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>{dateStr}</span>
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

          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors">
            <Bell className="w-5 h-5" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </button>

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
  );
}
