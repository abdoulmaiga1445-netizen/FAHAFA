'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface CartItemProduct {
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
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: CartItemProduct;
}

export interface CartSupermarket {
  id: string;
  name: string;
  fraisLivraison: number;
  livraisonGratuiteDes: number;
}

export interface PanierData {
  id: string;
  items: CartItemWithProduct[];
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  supermarket: CartSupermarket | null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function usePanier() {
  const { data: session } = useSession();
  const { cartItems, clearCart: clearLocalCart, removeFromCart: removeLocalItem, updateQuantity: updateLocalQty } = useAppStore();
  const [panier, setPanier] = useState<PanierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isAuthenticated = !!session?.user;

  // Fetch panier from server
  const fetchPanier = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/panier');
      if (response.ok) {
        const data = await response.json();
        setPanier(data.cart);
      }
    } catch (error) {
      console.error('Error fetching panier:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPanier();
  }, [fetchPanier]);

  // Ajouter un produit au panier
  const ajouterProduit = async (produitId: string, quantite: number = 1) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/panier/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produitId, quantite }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(data.error, {
            action: {
              label: 'Vider le panier',
              onClick: async () => {
                await viderPanier();
                // Retry adding after clearing
                await ajouterProduit(produitId, quantite);
              },
            },
          });
        } else {
          toast.error(data.error || 'Erreur lors de l\'ajout au panier');
        }
        return false;
      }

      toast.success(data.message || 'Produit ajouté au panier');
      await fetchPanier();
      return true;
    } catch {
      toast.error('Erreur lors de l\'ajout au panier');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Modifier la quantité d'un produit
  const modifierQuantite = async (produitId: string, quantite: number) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/panier/items/${produitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantite }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la mise à jour');
        return false;
      }

      if (quantite <= 0 || data.deleted) {
        removeLocalItem(produitId);
      }

      await fetchPanier();
      return true;
    } catch {
      toast.error('Erreur lors de la mise à jour');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer un produit du panier
  const supprimerProduit = async (produitId: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/panier/items/${produitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
        return false;
      }

      removeLocalItem(produitId);
      toast.success('Article retiré du panier');
      await fetchPanier();
      return true;
    } catch {
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Vider le panier
  const viderPanier = async () => {
    setUpdating(true);
    try {
      const response = await fetch('/api/panier', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors du vidage');
        return false;
      }

      clearLocalCart();
      setPanier((prev) => prev ? { ...prev, items: [], sousTotal: 0, fraisLivraison: 0, total: 0, supermarket: null } : null);
      toast.success('Panier vidé');
      return true;
    } catch {
      toast.error('Erreur lors du vidage');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Nombre d'items dans le panier
  const itemCount = panier?.items.reduce((sum, item) => sum + item.quantity, 0) || cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    panier,
    loading,
    updating,
    itemCount,
    isAuthenticated,
    fetchPanier,
    ajouterProduit,
    modifierQuantite,
    supprimerProduit,
    viderPanier,
  };
}
