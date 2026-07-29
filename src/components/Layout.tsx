import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useDashboard } from '@/hooks/useDashboard';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentUser } = useStore();
  const { alerts } = useDashboard();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        useStore.getState().setCurrentPage('pos');
      }
      if (e.key === 'F2') {
        e.preventDefault();
        useStore.getState().setCurrentPage('products');
      }
      if (e.key === 'F3') {
        e.preventDefault();
        useStore.getState().setCurrentPage('customers');
      }
      if (e.key === 'F4') {
        e.preventDefault();
        useStore.getState().setCurrentPage('transactions');
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useStore.getState().logout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) return <>{children}</>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          alertCount={alerts.filter(a => !a.isRead).length}
          onMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pos-scrollbar p-4 md:p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Watermark */}
      <div className="fixed bottom-4 right-6 z-[100] pointer-events-none opacity-20 dark:opacity-30">
        <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest drop-shadow-md">
          Demo by Aldy Alfarisy
        </p>
      </div>
    </div>
  );
}
