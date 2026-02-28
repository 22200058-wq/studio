
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsGridProps {
  stats: {
    totalSales: number;
    totalProfit: number;
    lowStockItemsCount: number;
    hasLowStock: boolean;
    profitMargin: number;
    productCount: number;
  };
  categoryCount: number;
}

export function StatsGrid({ stats, categoryCount }: StatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">₱{stats.totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-primary" />
            All time revenue
          </p>
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-primary">₱{stats.totalProfit.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Profit margin: {stats.profitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{stats.productCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {categoryCount} categories
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertCircle className={cn("h-4 w-4", stats.hasLowStock ? "text-destructive" : "text-primary")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold font-headline", stats.hasLowStock && "text-destructive")}>
            {stats.lowStockItemsCount}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Items need reordering
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
