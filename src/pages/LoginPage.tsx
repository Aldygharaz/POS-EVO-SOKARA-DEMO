import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useTheme } from 'next-themes';
import { Zap, Eye, EyeOff, ShieldCheck, AlertTriangle, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const { login, users } = useStore();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        setError('Username atau password salah');
      }
      setIsLoading(false);
    }, 500);
  };

  const demoUsers = users.filter(u => u.isActive && u.username === 'demo');

  const fillDemo = (u: typeof users[0]) => {
    setUsername(u.username);
    // Jika username demo, passwordnya demo
    setPassword(u.username === 'demo' ? 'demo' : '123456');
    setError('');
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 overflow-hidden transition-colors duration-200">
      {/* Quick Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow transition-all"
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/brand/sokara-logomark-transparent-light.svg"
            alt="Sokara Logo"
            className="w-20 h-20 mb-4 drop-shadow-md dark:hidden"
          />
          <img
            src="/brand/sokara-logomark-transparent-dark.svg"
            alt="Sokara Logo"
            className="w-20 h-20 mb-4 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] hidden dark:block animate-pulse"
          />
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Sokara POS
          </h1>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mt-1">
            Sokara AI Enterprise Point of Sale
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="pos-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pos-input w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="pos-btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          {demoUsers.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">Login Instan</p>
              <div className="grid grid-cols-1 gap-2">
                {demoUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillDemo(u)}
                    className="flex items-center justify-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group text-emerald-700 dark:text-emerald-400 font-semibold"
                  >
                    <Zap className="w-5 h-5 group-hover:text-white" />
                    <span>Masuk sebagai Demo</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Sokara POS Enterprise v6.0 &copy; 2026 Sokara AI
        </p>
      </div>
    </div>
  );
}
