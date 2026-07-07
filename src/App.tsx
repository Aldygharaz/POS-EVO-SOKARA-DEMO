import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { initializeData } from '@/data/seedData';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import POSPage from '@/pages/POSPage';
import ProductsPage from '@/pages/ProductsPage';
import CategoriesPage from '@/pages/CategoriesPage';
import CustomersPage from '@/pages/CustomersPage';
import TransactionsPage from '@/pages/TransactionsPage';
import StockPage from '@/pages/StockPage';
import ReportsPage from '@/pages/ReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import AuditPage from '@/pages/AuditPage';

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
    return <LoginPage />;
  }

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default App;
