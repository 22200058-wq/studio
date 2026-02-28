"use client";

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStore, Product } from '@/app/lib/store';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newP = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      buyPrice: Number(formData.get('buyPrice')),
      sellPrice: Number(formData.get('sellPrice')),
      stockQuantity: Number(formData.get('stockQuantity')),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, newP);
      toast({ title: 'Product Updated', description: `${newP.name} has been updated.` });
    } else {
      addProduct(newP);
      toast({ title: 'Product Added', description: `${newP.name} is now in inventory.` });
    }
    setIsAddOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
      toast({ title: 'Product Deleted', description: `${name} was removed.`, variant: 'destructive' });
    }
  };

  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products or categories..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setEditingProduct(null);
          }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto gap-2">
                <Plus size={18} />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" defaultValue={editingProduct?.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={editingProduct?.category} placeholder="e.g., Snacks, Beverages" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="buyPrice">Buy Price (₱)</Label>
                    <Input id="buyPrice" name="buyPrice" type="number" defaultValue={editingProduct?.buyPrice} step="0.01" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sellPrice">Sell Price (₱)</Label>
                    <Input id="sellPrice" name="sellPrice" type="number" defaultValue={editingProduct?.sellPrice} step="0.01" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input id="stockQuantity" name="stockQuantity" type="number" defaultValue={editingProduct?.stockQuantity} required />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Prices (Buy/Sell)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No products found. Add some items to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">₱{product.buyPrice} / ₱{product.sellPrice}</span>
                        <span className="text-sm font-semibold text-primary">Profit: ₱{(product.sellPrice - product.buyPrice).toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      {product.stockQuantity <= 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.stockQuantity < 10 ? (
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary text-primary">Healthy</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingProduct(product);
                            setIsAddOpen(true);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Shell>
  );
}