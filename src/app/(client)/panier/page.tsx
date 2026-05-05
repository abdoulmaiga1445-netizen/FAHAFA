'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePanier } from '@/hooks/usePanier';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Store,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────────

function CartLoadingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="lg:w-[360px]">
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Empty Cart ─────────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <Package className="size-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Votre panier est vide</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">
        Vous n&apos;avez encore ajouté aucun article à votre panier. Découvrez les supermarchés près de chez vous et commencez vos courses !
      </p>
      <Link href="/decouverte">
        <Button className="bg-[#1B4332] hover:bg-[#40916C] text-white">
          <Store className="size-4 mr-2" />
          Découvrir les supermarchés
        </Button>
      </Link>
    </div>
  );
}

// ─── Cart Item ──────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      image: string | null;
      unit: string;
      stock: number;
      inStock: boolean;
      supermarket: {
        id: string;
        name: string;
        commune: string;
      };
      category: {
        id: string;
        name: string;
      };
    };
  };
  updating: boolean;
  onModifierQuantite: (produitId: string, quantite: number) => Promise<boolean>;
  onSupprimer: (produitId: string) => Promise<boolean>;
}

function CartItem({ item, updating, onModifierQuantite, onSupprimer }: CartItemProps) {
  const lineTotal = item.product.price * item.quantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onModifierQuantite(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.product.stock) {
      onModifierQuantite(item.productId, item.quantity + 1);
    } else {
      toast.error('Stock maximum atteint');
    }
  };

  const handleRemove = () => {
    onSupprimer(item.productId);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
            {item.product.image ? (
              <Image
                src={item.product.image}
                alt={item.product.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="size-6 text-muted-foreground" />
            )}
          </div>

          {/* Product details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-sm leading-tight truncate">
                  {item.product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {item.product.category.name}
                  </Badge>
                  {!item.product.inStock && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                      Rupture
                    </Badge>
                  )}
                </div>
              </div>
              {/* Remove button - visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-red-600 flex-shrink-0 lg:hidden"
                onClick={handleRemove}
                disabled={updating}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {formatPrice(item.product.price)} / {item.product.unit}
            </p>

            {/* Quantity controls and line total */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={handleDecrease}
                  disabled={updating || item.quantity <= 1}
                >
                  <Minus className="size-3" />
                  <span className="sr-only">Diminuer</span>
                </Button>
                <span className="w-8 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  onClick={handleIncrease}
                  disabled={updating || item.quantity >= item.product.stock}
                >
                  <Plus className="size-3" />
                  <span className="sr-only">Augmenter</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#1B4332]">
                  {formatPrice(lineTotal)}
                </span>
                {/* Remove button - visible on desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-red-600 hidden lg:flex"
                  onClick={handleRemove}
                  disabled={updating}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Supprimer</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Cart Summary ───────────────────────────────────────────────────────────────

interface CartSummaryProps {
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  supermarket: {
    id: string;
    name: string;
    fraisLivraison: number;
    livraisonGratuiteDes: number;
  } | null;
}

function CartSummary({ sousTotal, fraisLivraison, total, supermarket }: CartSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-20">
      <CardContent className="p-6">
        <h3 className="font-semibold text-base mb-4">Résumé de la commande</h3>

        <div className="space-y-3">
          {/* Sous-total */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatPrice(sousTotal)}</span>
          </div>

          {/* Frais de livraison */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Truck className="size-3.5" />
              Frais de livraison
            </span>
            <span className={fraisLivraison === 0 ? 'text-[#40916C] font-medium' : ''}>
              {fraisLivraison === 0 ? 'Gratuite' : formatPrice(fraisLivraison)}
            </span>
          </div>

          {/* Free delivery note */}
          {supermarket && supermarket.livraisonGratuiteDes > 0 && fraisLivraison > 0 && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
              <AlertCircle className="size-3.5 mt-0.5 flex-shrink-0 text-[#40916C]" />
              <span>
                Livraison gratuite à partir de{' '}
                <strong className="text-foreground">
                  {formatPrice(supermarket.livraisonGratuiteDes)}
                </strong>
              </span>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">Total</span>
            <span className="font-bold text-lg text-[#1B4332]">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Checkout button */}
        <Link href="/panier/checkout" className="block mt-6">
          <Button className="w-full h-11 text-base bg-[#1B4332] hover:bg-[#40916C] text-white">
            <ShoppingCart className="size-4 mr-2" />
            Passer la commande
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function PanierPage() {
  const { panier, loading, updating, itemCount, modifierQuantite, supprimerProduit, viderPanier } = usePanier();

  const handleViderPanier = () => {
    toast('Vider le panier ?', {
      description: 'Tous les articles seront supprimés de votre panier.',
      action: {
        label: 'Confirmer',
        onClick: () => {
          viderPanier();
        },
      },
      cancel: {
        label: 'Annuler',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {loading ? (
            <CartLoadingSkeleton />
          ) : !panier || panier.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold">Mon panier</h1>
                  <Badge variant="secondary" className="text-xs">
                    {itemCount} article{itemCount > 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-600"
                  onClick={handleViderPanier}
                  disabled={updating}
                >
                  <Trash2 className="size-4 mr-1.5" />
                  Vider le panier
                </Button>
              </div>

              {/* Supermarket badge */}
              {panier.supermarket && (
                <div className="mb-4">
                  <Badge className="bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/20 hover:bg-[#1B4332]/15">
                    <Store className="size-3 mr-1" />
                    {panier.supermarket.name}
                  </Badge>
                </div>
              )}

              {/* Content: items + summary */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Items list */}
                <div className="flex-1 space-y-3">
                  {panier.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      updating={updating}
                      onModifierQuantite={modifierQuantite}
                      onSupprimer={supprimerProduit}
                    />
                  ))}
                </div>

                {/* Summary */}
                <div className="lg:w-[360px] flex-shrink-0">
                  <CartSummary
                    sousTotal={panier.sousTotal}
                    fraisLivraison={panier.fraisLivraison}
                    total={panier.total}
                    supermarket={panier.supermarket}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
