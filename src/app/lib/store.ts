import { useState, useEffect } from 'react';

export type Product = {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stockQuantity: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  quantity: number;
  sellPrice: number;
  subtotal: number;
};

export type Transaction = {
  id: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  profit: number;
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Coke 300ml', category: 'Beverages', buyPrice: 15, sellPrice: 20, stockQuantity: 24 },
  { id: '2', name: 'Skyflakes Cracker', category: 'Snacks', buyPrice: 5, sellPrice: 8, stockQuantity: 50 },
  { id: '3', name: 'Safeguard White', category: 'Toiletries', buyPrice: 35, sellPrice: 45, stockQuantity: 12 },
  { id: '4', name: 'Piattos Large', category: 'Snacks', buyPrice: 28, sellPrice: 35, stockQuantity: 15 },
];

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedProducts = localStorage.getItem('ss_products');
    const storedTransactions = localStorage.getItem('ss_transactions');
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('ss_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    
    setIsLoading(false);
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('ss_products', JSON.stringify(newProducts));
  };

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('ss_transactions', JSON.stringify(newTransactions));
  };

  const addProduct = (p: Omit<Product, 'id'>) => {
    const newProduct = { ...p, id: Date.now().toString() };
    saveProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    saveProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    saveProducts(products.filter(p => p.id !== id));
  };

  const processSale = (items: { productId: string, quantity: number }[]) => {
    let totalAmount = 0;
    let totalProfit = 0;
    const saleItems: SaleItem[] = [];
    const updatedProducts = [...products];

    for (const item of items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex === -1) continue;
      
      const product = updatedProducts[productIndex];
      const quantity = item.quantity;
      
      if (product.stockQuantity < quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const subtotal = product.sellPrice * quantity;
      const profit = (product.sellPrice - product.buyPrice) * quantity;
      
      totalAmount += subtotal;
      totalProfit += profit;
      
      saleItems.push({
        productId: product.id,
        name: product.name,
        quantity,
        sellPrice: product.sellPrice,
        subtotal
      });

      updatedProducts[productIndex].stockQuantity -= quantity;
    }

    const transaction: Transaction = {
      id: `T${Date.now()}`,
      date: new Date().toISOString(),
      items: saleItems,
      totalAmount,
      profit: totalProfit
    };

    saveTransactions([transaction, ...transactions]);
    saveProducts(updatedProducts);
    return transaction;
  };

  return {
    products,
    transactions,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    processSale
  };
}