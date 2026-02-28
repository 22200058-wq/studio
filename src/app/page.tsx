
"use client";

import React, { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStore } from '@/app/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  calculateSummaryStats, 
  prepareSalesTrendData, 
  prepareCategoryDistribution 
} from './lib/dashboard-logic';
import { StatsGrid } from './dashboard/components/StatsGrid';

const CHART_COLORS = ['#5E8F66', '#C7E05E', '#A0C49D', '#D4E2D4', '#E1ECC8'];

export default function DashboardPage() {
  const { products, transactions } = useStore();

  // Data preparation decoupled via logic utilities (DIP)
  const dashboardData = useMemo(() => ({
    stats: calculateSummaryStats(products, transactions),
    trend: prepareSalesTrendData(transactions),
    categories: prepareCategoryDistribution(products)
  }), [products, transactions]);

  return (
    <Shell>
      {/* Metrics Row - SRP: Delegated to StatsGrid component */}
      <StatsGrid 
        stats={dashboardData.stats} 
        categoryCount={dashboardData.categories.length} 
      />

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        {/* Sales Trend Chart Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Performance over the last 7 recorded days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="sales" fill="#5E8F66" radius={[4, 4, 0, 0]} name="Sales" />
                  <Bar dataKey="profit" fill="#C7E05E" radius={[4, 4, 0, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Mix Chart Section */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Mix</CardTitle>
            <CardDescription>Product count by category</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
              {dashboardData.categories.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
