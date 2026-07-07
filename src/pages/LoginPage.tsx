import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Zap, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const { login, users } = useStore();
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

  const demoUsers = users.filter(u => u.isActive).slice(0, 4);

  const fillDemo = (u: typeof users[0]) => {
    setUsername(u.username);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">POS EVO</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Point of Sale System</p>
        </div>

        {/* Login Card */}
        <div className="pos-card p-6 md:p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Username</label>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Password</label>
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
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 text-center mb-3">Akun Demo</p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillDemo(u)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
                      {u.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Password demo: 123456</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          POS EVO Enterprise v6.0 &copy; 2025
        </p>
      </div>
    </div>
  );
}
