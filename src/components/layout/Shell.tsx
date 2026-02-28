"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Sparkles,
  Store,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'POS Terminal', href: '/pos', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'AI Advisor', href: '/ai-advisor', icon: Sparkles },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-primary font-headline group-data-[collapsible=icon]:hidden">
                SariStore Insight
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground group-data-[collapsible=icon]:hidden">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.name}
                        className={cn(
                          "transition-all duration-200 hover:bg-secondary/50",
                          pathname === item.href && "bg-secondary text-primary font-semibold"
                        )}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("size-5", pathname === item.href && "text-primary")} />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4 group-data-[collapsible=icon]:hidden">
            <p className="text-center text-xs text-muted-foreground">
              © 2024 SariStore Insight
            </p>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold font-headline">
              {navigation.find(n => n.href === pathname)?.name || 'SariStore Insight'}
            </h1>
          </header>
          <div className="container mx-auto p-6 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}