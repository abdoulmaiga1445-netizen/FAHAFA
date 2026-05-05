'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Clock, Truck, Store, ShoppingBag, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function getStatusConfig(status: string) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-800 hover:bg-amber-100', icon: <Clock className="size-3" /> },
    CONFIRMEE: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800 hover:bg-blue-100', icon: <CheckCircle2 className="size-3" /> },
    EN_PREPARATION: { label: 'En préparation', color: 'bg-purple-100 text-purple-800 hover:bg-purple-100', icon: <Package className="size-3" /> },
    EN_LIVRAISON: { label: 'En livraison', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100', icon: <Truck className="size-3" /> },
    LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-800 hover:bg-green-100', icon: <CheckCircle2 className="size-3" /> },
    ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-800 hover:bg-red-100', icon: <XCircle className="size-3" /> },
  };
  return map[status] || { label: status, color: 'bg-gray-100 text-gray-800 hover:bg-gray-100', icon: <AlertCircle className="size-3" /> };
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; image: string | null; unit: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  typeCommande: string;
  total: number;
  deliveryFee: number;
  createdAt: string;
  supermarket: { id: string; name: string; commune: string; address: string };
  items: OrderItem[];
}

export default function CommandesPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/commandes');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [session, fetchOrders]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-[#1B4332] mb-1">Mes commandes</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Suivez l&apos;état de vos commandes
          </p>

          {!session?.user ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="size-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Connectez-vous</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vous devez être connecté pour voir vos commandes
              </p>
              <Link href="/?view=login">
                <Button className="bg-[#1B4332] hover:bg-[#40916C]">Se connecter</Button>
              </Link>
            </div>
          ) : loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-48 mt-2" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="size-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Aucune commande</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vous n&apos;avez pas encore passé de commande
              </p>
              <Link href="/decouverte">
                <Button className="bg-[#1B4332] hover:bg-[#40916C]">Découvrir les supermarchés</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <Card key={order.id} className="border-border/60 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
                            <Badge className={`text-[10px] px-1.5 py-0 h-5 font-semibold ${statusConfig.color}`}>
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <Store className="size-3" />
                            <span>{order.supermarket.name} — {order.supermarket.commune}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{order.items.length} article{order.items.length !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span>{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-sm text-[#1B4332]">{formatPrice(order.total)}</p>
                          {order.typeCommande === 'CLICK_AND_COLLECT' && (
                            <span className="text-[10px] text-muted-foreground">Click & Collect</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex gap-1 overflow-hidden">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {item.product.image ? (
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="size-3 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <span className="text-[10px] text-muted-foreground font-medium">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                        <Link href={`/commandes/${order.id}/confirmation`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                            Détails
                            <ChevronRight className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
