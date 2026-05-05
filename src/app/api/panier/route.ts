import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// ─── GET /api/panier — Récupérer le panier du client connecté ────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find or create the cart with items and product details
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                supermarket: {
                  select: { id: true, name: true, commune: true },
                },
                category: {
                  select: { id: true, name: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  supermarket: {
                    select: { id: true, name: true, commune: true },
                  },
                  category: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    // Calculate sous-total (sum of price × quantity)
    const sousTotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Determine the supermarket from the first item (or null if cart is empty)
    let supermarketInfo: {
      id: string;
      name: string;
      fraisLivraison: number;
      livraisonGratuiteDes: number;
    } | null = null;

    let fraisLivraison = 0;

    if (cart.items.length > 0) {
      const firstItemSupermarket = cart.items[0].product.supermarket;

      // Fetch full supermarket details for delivery calculation
      const supermarket = await db.supermarket.findUnique({
        where: { id: firstItemSupermarket.id },
        select: {
          id: true,
          name: true,
          fraisLivraison: true,
          livraisonGratuiteDes: true,
          livraisonDisponible: true,
        },
      });

      if (supermarket) {
        supermarketInfo = {
          id: supermarket.id,
          name: supermarket.name,
          fraisLivraison: supermarket.fraisLivraison,
          livraisonGratuiteDes: supermarket.livraisonGratuiteDes,
        };

        // Calculate delivery fee
        if (supermarket.livraisonDisponible) {
          const livraisonGratuite = sousTotal >= supermarket.livraisonGratuiteDes && supermarket.livraisonGratuiteDes > 0;
          fraisLivraison = livraisonGratuite ? 0 : supermarket.fraisLivraison;
        }
      }
    }

    const total = sousTotal + fraisLivraison;

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cart.items,
        sousTotal,
        fraisLivraison,
        total,
        supermarket: supermarketInfo,
      },
    });
  } catch (error) {
    console.error("Erreur lors du chargement du panier:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du panier" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/panier — Vider le panier ─────────────────────────────────────
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé" },
        { status: 404 }
      );
    }

    // Delete all items in the cart
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      message: "Panier vidé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du vidage du panier:", error);
    return NextResponse.json(
      { error: "Erreur lors du vidage du panier" },
      { status: 500 }
    );
  }
}
