"use client";

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStore, Product, SaleItem } from '@/app/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Package,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function POSPage() {
  const { products, processSale } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<{ productId: string, quantity: number }[]>([]);
  const { toast } = useToast();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stockQuantity > 0
  );

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      if (existing.quantity + 1 > product.stockQuantity) {
        toast({ title: 'Stock Limit', description: 'Cannot add more than available stock.', variant: 'destructive' });
        return;
      }
      setCart(cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productId, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > product.stockQuantity) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartItemsDetails = cart.map(item => {
    const p = products.find(prod => prod.id === item.productId)!;
    return {
      ...item,
      name: p.name,
      sellPrice: p.sellPrice,
      subtotal: p.sellPrice * item.quantity
    };
  });

  const total = cartItemsDetails.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    try {
      processSale(cart);
      toast({ 
        title: 'Sale Completed', 
        description: `Processed sale for ₱${total}. Inventory updated.`,
      });
      setCart([]);
    } catch (err: any) {
      toast({ title: 'Checkout Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Shell>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-10rem)]">
        {/* Product Selection */}
        <div className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Quick search products..." 
              className="pl-10 h-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="flex-1 rounded-xl border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden"
                  onClick={() => addToCart(product.id)}
                >
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tight bg-secondary/30">
                        {product.category}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {product.stockQuantity} left
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">₱{product.sellPrice}</span>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Cart / Checkout */}
        <Card className="lg:col-span-4 flex flex-col shadow-lg border-primary/20 bg-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart size={20} />
                Current Cart
              </CardTitle>
              <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                {cart.length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-4">
              {cartItemsDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
                  <ShoppingCart size={48} className="mb-2" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {cartItemsDetails.map((item) => (
                    <div key={item.productId} className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm leading-tight max-w-[70%]">{item.name}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">₱{item.subtotal.toFixed(2)}</span>
                      </div>
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 bg-muted/30 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-bold text-lg">Total</span>
                <span className="text-3xl font-black text-primary">₱{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-background border-t">
            <Button 
              className="w-full h-14 text-lg font-bold gap-3" 
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Checkout Now
              <ArrowRight size={20} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Shell>
  );
}