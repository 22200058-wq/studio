
import { Product, Transaction } from './store';

/**
 * Pure functions for dashboard data transformations.
 * Follows SRP by handling only data processing.
 */

export const calculateSummaryStats = (products: Product[], transactions: Transaction[]) => {
  const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalProfit = transactions.reduce((acc, t) => acc + t.profit, 0);
  const lowStockItems = products.filter(p => p.stockQuantity < 5);
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  return {
    totalSales,
    totalProfit,
    lowStockItemsCount: lowStockItems.length,
    hasLowStock: lowStockItems.length > 0,
    profitMargin,
    productCount: products.length
  };
};

export const prepareSalesTrendData = (transactions: Transaction[]) => {
  const salesByDate = transactions.reduce((acc: Record<string, { date: string, sales: number, profit: number }>, t) => {
    const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = { date, sales: 0, profit: 0 };
    acc[date].sales += t.totalAmount;
    acc[date].profit += t.profit;
    return acc;
  }, {});

  return Object.values(salesByDate).slice(-7);
};

export const prepareCategoryDistribution = (products: Product[]) => {
  return products.reduce((acc: { name: string, value: number }[], p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: p.category, value: 1 });
    }
    return acc;
  }, []);
};
