import { useMemo } from 'react';
import { useStore } from '@/store/useStore';
import type { DashboardKPI, SalesTrend, TopProduct, AlertItem } from '@/types';

export function useDashboard() {
  const { products, transactions, businessTargets, dismissedAlertIds } = useStore();

  const kpi: DashboardKPI = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);

    const todayTrans = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= todayStart && d < todayEnd && !t.isVoided;
    });

    const monthTrans = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= monthStart && !t.isVoided;
    });

    const yesterdayTrans = transactions.filter(t => {
      const d = new Date(t.createdAt);
      return d >= yesterdayStart && d < todayStart && !t.isVoided;
    });

    const todayRevenue = todayTrans.reduce((s, t) => s + t.total, 0);
    const todayProfit = todayTrans.reduce((s, t) => {
      const itemCost = t.items.reduce((is, i) => is + i.costPrice * i.quantity, 0);
      return s + (t.total - itemCost - t.discount);
    }, 0);

    const monthRevenue = monthTrans.reduce((s, t) => s + t.total, 0);
    const monthProfit = monthTrans.reduce((s, t) => {
      const itemCost = t.items.reduce((is, i) => is + i.costPrice * i.quantity, 0);
      return s + (t.total - itemCost - t.discount);
    }, 0);

    const yesterdayRevenue = yesterdayTrans.reduce((s, t) => s + t.total, 0);
    const growthRevenue = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    const averageOrderValue = todayTrans.length > 0 ? Math.round(todayRevenue / todayTrans.length) : 0;

    const inventoryValue = products
      .filter(p => p.isActive)
      .reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);

    const lowStockCount = products.filter(p => p.isActive && p.currentStock <= p.minStock).length;

    return {
      todayRevenue,
      todayTransactions: todayTrans.length,
      todayProfit,
      todayCustomers: new Set(todayTrans.map(t => t.customerId).filter(Boolean)).size,
      monthRevenue,
      monthTransactions: monthTrans.length,
      monthProfit,
      averageOrderValue,
      inventoryValue,
      lowStockCount,
      growthRevenue,
      growthTransactions: yesterdayTrans.length > 0
        ? ((todayTrans.length - yesterdayTrans.length) / yesterdayTrans.length) * 100
        : 0,
    };
  }, [transactions, products]);

  const salesTrend: SalesTrend[] = useMemo(() => {
    const days: Record<string, SalesTrend> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = { date: key, revenue: 0, profit: 0, transactions: 0 };
    }

    transactions.filter(t => !t.isVoided).forEach(t => {
      const d = new Date(t.createdAt);
      const key = d.toISOString().split('T')[0];
      if (days[key]) {
        days[key].revenue += t.total;
        const itemCost = t.items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
        days[key].profit += t.total - itemCost - t.discount;
        days[key].transactions += 1;
      }
    });

    return Object.values(days);
  }, [transactions]);

  const topProducts: TopProduct[] = useMemo(() => {
    const map: Record<string, TopProduct> = {};
    transactions.filter(t => !t.isVoided).forEach(t => {
      t.items.forEach(i => {
        if (!map[i.productId]) {
          map[i.productId] = { productId: i.productId, productName: i.productName, quantity: 0, revenue: 0, profit: 0 };
        }
        map[i.productId].quantity += i.quantity;
        map[i.productId].revenue += i.subtotal;
        map[i.productId].profit += (i.price - i.costPrice) * i.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [transactions]);

  const alerts: AlertItem[] = useMemo(() => {
    const items: AlertItem[] = [];
    products.filter(p => p.isActive && p.currentStock <= p.minStock).forEach(p => {
      items.push({
        id: `ALERT-STOCK-${p.id}`,
        type: p.currentStock === 0 ? 'critical' : 'high',
        title: p.currentStock === 0 ? 'Stok Habis' : 'Stok Menipis',
        message: `${p.name} - Sisa ${p.currentStock} ${p.unit}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    });

    const revenueTarget = businessTargets.find(t => t.type === 'revenue' && t.period === 'monthly');
    if (revenueTarget && revenueTarget.actual < revenueTarget.target * 0.75) {
      items.push({
        id: 'ALERT-REVENUE',
        type: 'medium',
        title: 'Target Revenue Belum Tercapai',
        message: `Realisasi ${((revenueTarget.actual / revenueTarget.target) * 100).toFixed(1)}% dari target`,
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    return items.filter(alert => !dismissedAlertIds.includes(alert.id));
  }, [products, businessTargets, dismissedAlertIds]);

  const categorySales = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    transactions.filter(t => !t.isVoided).forEach(t => {
      t.items.forEach(i => {
        const prod = products.find(p => p.id === i.productId);
        const catName = prod?.categoryName || 'Lainnya';
        if (!map[catName]) map[catName] = { name: catName, revenue: 0, count: 0 };
        map[catName].revenue += i.subtotal;
        map[catName].count += i.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [transactions, products]);

  return { kpi, salesTrend, topProducts, alerts, categorySales };
}
