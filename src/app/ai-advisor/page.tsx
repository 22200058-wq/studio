"use client";

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStore } from '@/app/lib/store';
import { aiSalesForecastingReorder, AiSalesForecastingReorderOutput } from '@/ai/flows/ai-sales-forecasting-reorder';
import { aiInventoryMarketingAdvice } from '@/ai/flows/ai-inventory-marketing-advice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Sparkles, 
  RefreshCcw, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AIAdvisorPage() {
  const { products, transactions } = useStore();
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<AiSalesForecastingReorderOutput | null>(null);
  const [marketingAdvice, setMarketingAdvice] = useState<string | null>(null);

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const input = {
        productDetails: products.map(p => ({
          productId: p.id,
          productName: p.name,
          category: p.category,
          buyPrice: p.buyPrice,
          sellPrice: p.sellPrice
        })),
        historicalSalesData: transactions.flatMap(tx => 
          tx.items.map(item => ({
            productId: item.productId,
            quantitySold: item.quantity,
            saleDate: tx.date
          }))
        ),
        currentStockLevels: products.map(p => ({
          productId: p.id,
          stockQuantity: p.stockQuantity
        }))
      };

      const result = await aiSalesForecastingReorder(input);
      setForecast(result);

      const adviceInput = {
        inventoryItems: products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          buyPrice: p.buyPrice,
          sellPrice: p.sellPrice,
          stockQuantity: p.stockQuantity,
          salesHistory: transactions.flatMap(tx => 
            tx.items
              .filter(item => item.productId === p.id)
              .map(item => ({
                date: tx.date.split('T')[0],
                quantitySold: item.quantity
              }))
          )
        }))
      };
      
      const adviceResult = await aiInventoryMarketingAdvice(adviceInput);
      setMarketingAdvice(adviceResult);

    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <Sparkles className="text-accent h-6 w-6" />
              SariStore Insight AI
            </h2>
            <p className="text-muted-foreground">Analyze your sales patterns and get inventory recommendations.</p>
          </div>
          <Button 
            onClick={handleGenerateForecast} 
            disabled={loading || products.length === 0}
            className="w-full md:w-auto gap-2"
          >
            {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {forecast ? 'Refresh Insights' : 'Generate Insights'}
          </Button>
        </div>

        {!forecast && !loading ? (
          <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-muted/20">
            <div className="bg-primary/10 p-6 rounded-full mb-4">
              <Sparkles className="h-12 w-12 text-primary opacity-50" />
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">Unlock Your Data Potential</h3>
            <p className="text-muted-foreground max-w-md text-center px-6">
              Click the button above to have SariStore Insight AI analyze your inventory levels and transaction history to give you smart reordering points and marketing tips.
            </p>
          </Card>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Forecast Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="text-primary h-5 w-5" />
                    Sales Forecast & Reorders
                  </CardTitle>
                  <CardDescription>Based on recent transaction patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {forecast?.forecasts.map((item) => {
                      const currentProduct = products.find(p => p.id === item.productId);
                      const isLowStock = currentProduct && currentProduct.stockQuantity <= item.suggestedReorderPoint;

                      return (
                        <div key={item.productId} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-all gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{item.productName}</h4>
                              {isLowStock && <Badge variant="destructive" className="animate-pulse">Action Required</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{item.marketingAdvice}</p>
                          </div>
                          <div className="flex gap-4 border-l pl-4">
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Monthly Demand</span>
                              <p className="text-lg font-black text-primary">{item.predictedDemand}</p>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Reorder At</span>
                              <p className="text-lg font-black text-accent-foreground">{item.suggestedReorderPoint}</p>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">Qty to Order</span>
                              <p className="text-lg font-black text-primary">{item.suggestedReorderQuantity}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 border-t">
                  <p className="text-sm italic text-muted-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-accent-foreground" />
                    {forecast?.generalInsights || "Generating more trends..."}
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Advice Column */}
            <div className="lg:col-span-1">
              <Card className="h-full bg-primary text-primary-foreground border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Marketing Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <ScrollArea className="h-full pr-4">
                    <div className="prose prose-invert prose-sm">
                      <div className="whitespace-pre-wrap leading-relaxed text-primary-foreground/90 font-medium">
                        {marketingAdvice || "Generating tailored strategies..."}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}