import { useEffect, lazy, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import { initializeData } from '@/data/seedData';
import Layout from '@/components/Layout';
import { Toaster, toast } from 'sonner';

// Code-splitting via React.lazy for performance optimization
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const POSPage = lazy(() => import('@/pages/POSPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const CustomersPage = lazy(() => import('@/pages/CustomersPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const StockPage = lazy(() => import('@/pages/StockPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AuditPage = lazy(() => import('@/pages/AuditPage'));

function App() {
  const { currentUser, currentPage, setCurrentPage } = useStore();

  useEffect(() => {
    initializeData();
    const savedUser = localStorage.getItem('pos_currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        useStore.setState({ currentUser: user });
      } catch {
        localStorage.removeItem('pos_currentUser');
      }
    }
    
    // Auto-sync offline queue when internet connection restores
    const handleOnline = () => {
      useStore.getState().processOfflineSyncQueue();
      toast.success("Koneksi terhubung kembali! Mengirim data transaksi tertunda...");
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pos_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pos_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser && currentPage !== 'login') {
      setCurrentPage('login');
    }
  }, [currentUser, currentPage, setCurrentPage]);

  const renderPage = () => {
    if (!currentUser) {
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'pos': return <POSPage />;
      case 'products': return <ProductsPage />;
      case 'categories': return <CategoriesPage />;
      case 'customers': return <CustomersPage />;
      case 'transactions': return <TransactionsPage />;
      case 'stock': return <StockPage />;
      case 'reports': return <ReportsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      case 'audit': return <AuditPage />;
      default: return <DashboardPage />;
    }
  };

  if (!currentUser) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <LoginPage />
      </Suspense>
    );
  }

  return (
    <>
      <Layout>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<PageSkeleton />}>
          {renderPage()}
        </Suspense>
      </Layout>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl mt-6" />
    </div>
  );
}

export default App;
