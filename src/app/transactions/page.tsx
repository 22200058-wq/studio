"use client";

import React, { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useStore, Transaction } from '@/app/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Download, 
  Calendar as CalendarIcon, 
  Search,
  Filter
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const { transactions } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.items.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or product name..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2">
              <CalendarIcon size={16} />
              This Month
            </Button>
            <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2">
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-none overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No transactions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs text-primary font-bold">#{tx.id}</TableCell>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tx.items.length} items</Badge>
                      </TableCell>
                      <TableCell className="font-bold">₱{tx.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-primary font-medium">₱{tx.profit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedTx(tx)}>
                              <Eye size={16} />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex justify-between items-center pr-8">
                                <span>Transaction Details</span>
                                <span className="font-mono text-sm text-primary">#{tx.id}</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Date: {new Date(tx.date).toLocaleString()}</span>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Ordered Items</span>
                                {tx.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <div className="flex gap-2">
                                      <span className="text-primary font-bold">{item.quantity}x</span>
                                      <span>{item.name}</span>
                                    </div>
                                    <span className="font-medium">₱{item.subtotal.toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                              <Separator />
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">Subtotal</span>
                                  <span className="text-sm">₱{tx.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                  <span className="font-bold">Total Amount</span>
                                  <span className="text-xl font-black text-primary">₱{tx.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-xs text-accent-foreground/60 font-medium">
                                  <span>Generated Profit</span>
                                  <span>₱{tx.profit.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full gap-2">
                              <Download size={16} />
                              Download Receipt
                            </Button>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}