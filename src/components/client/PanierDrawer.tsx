'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from 'lucide-react';
import { usePanier } from '@/hooks/usePanier';

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

export default function PanierDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { panier, loading, updating, modifierQuantite, supprimerProduit } = usePanier();

  const items = panier?.items || [];
  const sousTotal = panier?.sousTotal || 0;
  const fraisLivraison = panier?.fraisLivraison || 0;
  const total = panier?.total || 0;
  const supermarket = panier?.supermarket;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-[#1B4332]">
            <ShoppingCart className="size-5" />
            Mon panier
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.reduce((s, i) => s + i.quantity, 0)} article{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 px-4 py-3 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="size-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Votre panier est vide</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Découvrez les supermarchés près de chez vous et ajoutez des produits.
            </p>
            <Link href="/decouverte" onClick={() => onOpenChange(false)}>
              <Button size="sm" className="bg-[#1B4332] hover:bg-[#40916C] gap-1.5">
                Découvrir les supermarchés
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Supermarket badge */}
            {supermarket && (
              <div className="px-4 py-2 bg-[#D8F3DC]/40 border-b border-border/40">
                <p className="text-xs font-medium text-[#1B4332] flex items-center gap-1.5">
                  <Package className="size-3.5" />
                  {supermarket.name}
                </p>
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 group">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="size-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">{formatPrice(item.product.price)} / {item.product.unit}</p>

                    <div className="flex items-center justify-between mt-1.5">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          disabled={updating}
                          onClick={() => modifierQuantite(item.productId, item.quantity - 1)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          disabled={updating}
                          onClick={() => modifierQuantite(item.productId, item.quantity + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      {/* Line total */}
                      <span className="text-sm font-semibold text-[#1B4332]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
                    disabled={updating}
                    onClick={() => supprimerProduit(item.productId)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border/60 px-4 py-3 space-y-2 bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(sousTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span>{fraisLivraison === 0 ? 'Gratuite' : formatPrice(fraisLivraison)}</span>
              </div>
              {supermarket && supermarket.livraisonGratuiteDes > 0 && fraisLivraison > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  Livraison gratuite à partir de {formatPrice(supermarket.livraisonGratuiteDes)}
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#1B4332]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-border/60 space-y-2">
              <Link href="/panier" onClick={() => onOpenChange(false)}>
                <Button className="w-full bg-[#1B4332] hover:bg-[#40916C] gap-1.5">
                  Voir le panier
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
