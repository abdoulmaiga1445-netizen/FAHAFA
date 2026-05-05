'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  Phone,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Truck,
  Store,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    unit: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  typeCommande: string;
  methodePaiement: string;
  total: number;
  deliveryFee: number;
  deliveryAddress: string;
  commune: string;
  phone: string;
  notes: string | null;
  supermarket: {
    id: string;
    name: string;
    commune: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentInstructions(method: string): { title: string; details: string } {
  switch (method) {
    case 'ORANGE_MONEY':
      return {
        title: 'Orange Money',
        details:
          "Envoyez le paiement au numéro 07 XX XX XX XX via Orange Money. Incluez votre numéro de commande dans les notes.",
      };
    case 'MTN_MONEY':
      return {
        title: 'MTN Mobile Money',
        details:
          "Envoyez le paiement au numéro 05 XX XX XX XX via MTN Mobile Money. Incluez votre numéro de commande dans les notes.",
      };
    case 'WAVE':
      return {
        title: 'Wave',
        details:
          "Envoyez le paiement via Wave au numéro 07 XX XX XX XX. Incluez votre numéro de commande dans les notes.",
      };
    case 'CASH':
      return {
        title: 'Espèces',
        details:
          "Payez en espèces lors de la livraison ou du retrait en magasin.",
      };
    default:
      return {
        title: 'Paiement',
        details:
          "Les instructions de paiement vous seront communiquées par le supermarché.",
      };
  }
}

function getPaymentIcon(method: string) {
  switch (method) {
    case 'ORANGE_MONEY':
      return (
        <div className="size-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
          OM
        </div>
      );
    case 'MTN_MONEY':
      return (
        <div className="size-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-xs">
          MTN
        </div>
      );
    case 'WAVE':
      return (
        <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
          W
        </div>
      );
    case 'CASH':
      return (
        <div className="size-10 rounded-full bg-sm-accent flex items-center justify-center text-white">
          <CreditCard className="size-5" />
        </div>
      );
    default:
      return (
        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <CreditCard className="size-5" />
        </div>
      );
  }
}

function getTypeCommandeLabel(type: string): string {
  switch (type) {
    case 'LIVRAISON':
      return 'Livraison';
    case 'CLICK_AND_COLLECT':
      return 'Click & Collect';
    default:
      return type;
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function ConfirmationPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status: sessionStatus } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/commandes/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('not_found');
          } else if (response.status === 401) {
            setError('unauthorized');
          } else {
            setError('error');
          }
          return;
        }
        const data = await response.json();
        setOrder(data.order);
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, session, sessionStatus]);

  // ─── Loading State ───────────────────────────────────────────────────────────

  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Card>
              <CardContent className="space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Not Authenticated ───────────────────────────────────────────────────────

  if (!session?.user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Connexion requise
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Vous devez être connecté pour voir les détails de votre commande.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/login">
                <Button className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90 text-white">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Order Not Found ─────────────────────────────────────────────────────────

  if (error === 'not_found' || (!order && error)) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="size-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Commande introuvable
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Cette commande n&apos;existe pas ou vous n&apos;avez pas les droits pour la consulter.
            </p>
            <Link href="/commandes">
              <Button className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white">
                Voir mes commandes
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── General Error ───────────────────────────────────────────────────────────

  if (error === 'error' || error === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <Package className="size-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Impossible de charger les détails de votre commande. Veuillez réessayer.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-[#1B4332] hover:bg-[#1B4332]/90 text-white"
            >
              Réessayer
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  // ─── Computed values ─────────────────────────────────────────────────────────

  const sousTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const paymentInfo = getPaymentInstructions(order.methodePaiement);
  const isLivraison = order.typeCommande === 'LIVRAISON';

  // ─── Success Page ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
          {/* ── Success Header ──────────────────────────────────────────────── */}
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="relative">
              <CheckCircle2 className="size-20 text-[#40916C]" strokeWidth={1.5} />
              <div className="absolute inset-0 animate-ping size-20 rounded-full bg-[#40916C]/10 pointer-events-none" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Commande confirmée !
            </h1>
            <p className="text-lg font-bold text-[#1B4332] tracking-wide">
              {order.orderNumber}
            </p>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100 text-sm px-3 py-1">
              <Clock className="size-3.5 mr-1" />
              En attente de confirmation
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>

          {/* ── Order Details Card ──────────────────────────────────────────── */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Store className="size-4 text-[#40916C]" />
                Détails de la commande
              </h2>

              {/* Supermarket info */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="size-10 rounded-lg bg-[#1B4332] flex items-center justify-center flex-shrink-0">
                  <Store className="size-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">
                    {order.supermarket.name}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" />
                    {order.supermarket.commune} &mdash; {order.supermarket.address}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Type de commande */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type de commande</span>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {isLivraison ? (
                    <Truck className="size-4 text-[#40916C]" />
                  ) : (
                    <ShoppingBag className="size-4 text-[#40916C]" />
                  )}
                  {getTypeCommandeLabel(order.typeCommande)}
                </div>
              </div>

              {/* Delivery address (if Livraison) */}
              {isLivraison && order.deliveryAddress && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    Adresse de livraison
                  </span>
                  <span className="text-sm font-medium text-right">
                    {order.deliveryAddress}
                    {order.commune && (
                      <span className="text-muted-foreground">, {order.commune}</span>
                    )}
                  </span>
                </div>
              )}

              {/* Phone */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Téléphone</span>
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  {order.phone}
                </span>
              </div>

              {/* Notes */}
              {order.notes && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Notes</p>
                    <p className="text-sm text-foreground">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Products List ───────────────────────────────────────────────── */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Package className="size-4 text-[#40916C]" />
                Produits commandés
                <Badge variant="secondary" className="ml-auto text-xs">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </Badge>
              </h2>

              {/* Items */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2"
                  >
                    {/* Product image or fallback icon */}
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={32}
                          height={32}
                          className="size-8 object-cover rounded-md"
                        />
                      ) : (
                        <Package className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Name & quantity */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} &times; {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Line total */}
                    <p className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total</span>
                  <span className="text-sm font-medium">{formatPrice(sousTotal)}</span>
                </div>

                {isLivraison && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Frais de livraison
                    </span>
                    <span className="text-sm font-medium">
                      {order.deliveryFee > 0
                        ? formatPrice(order.deliveryFee)
                        : 'Gratuit'}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-base font-bold text-[#40916C]">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Payment Instructions Card ───────────────────────────────────── */}
          <Card className="border-[#40916C]/20 bg-[#D8F3DC]/30">
            <CardContent className="space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="size-4 text-[#40916C]" />
                Instructions de paiement
              </h2>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-border/50">
                {getPaymentIcon(order.methodePaiement)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {paymentInfo.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {paymentInfo.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200/60">
                <Clock className="size-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  Votre commande sera confirmée après réception du paiement.
                  Conservez votre numéro de commande :{' '}
                  <span className="font-bold">{order.orderNumber}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Actions ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-8">
            <Link href="/commandes" className="flex-1">
              <Button className="w-full bg-[#1B4332] hover:bg-[#1B4332]/90 text-white h-11">
                <Package className="size-4 mr-2" />
                Suivre ma commande
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link href="/decouverte" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-11 border-[#1B4332]/20 text-[#1B4332] hover:bg-[#1B4332]/5"
              >
                <Store className="size-4 mr-2" />
                Retour à la découverte
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
