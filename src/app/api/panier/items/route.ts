import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ─── POST /api/panier/items — Ajouter/modifier une ligne du panier ───────────
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { produitId, quantite } = body as {
      produitId?: string;
      quantite?: number;
    };

    if (!produitId || quantite === undefined || quantite === null) {
      return NextResponse.json(
        { error: "produitId et quantite sont requis" },
        { status: 400 }
      );
    }

    if (typeof quantite !== "number" || quantite < 0) {
      return NextResponse.json(
        { error: "La quantité doit être un nombre positif" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await db.product.findUnique({
      where: { id: produitId },
      include: {
        supermarket: {
          select: { id: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Check product availability
    if (!product.isActive) {
      return NextResponse.json(
        { error: "Ce produit n'est plus disponible" },
        { status: 400 }
      );
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: "Ce produit n'est plus en stock" },
        { status: 400 }
      );
    }

    // Check stock availability
    if (product.stock < quantite) {
      return NextResponse.json(
        {
          error: `Stock insuffisant. Disponible : ${product.stock} ${product.unit}(s)`,
        },
        { status: 400 }
      );
    }

    // Find or create cart for the user
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { supermarketId: true },
            },
          },
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
                select: { supermarketId: true },
              },
            },
          },
        },
      });
    }

    // ── Check supermarket consistency ────────────────────────────────────────
    // If cart already has items from a different supermarket, reject
    if (cart.items.length > 0) {
      const existingSupermarketId = cart.items[0].product.supermarketId;
      if (existingSupermarketId !== product.supermarketId) {
        return NextResponse.json(
          {
            error:
              "Votre panier contient déjà des produits d'un autre supermarché. Videz-le d'abord.",
          },
          { status: 409 }
        );
      }
    }

    // ── If quantite === 0, delete the item if it exists ──────────────────────
    if (quantite === 0) {
      const existingItem = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: produitId,
        },
      });

      if (existingItem) {
        await db.cartItem.delete({
          where: { id: existingItem.id },
        });
      }

      return NextResponse.json({
        message: "Article retiré du panier",
        deleted: true,
      });
    }

    // ── Check if item already exists in the cart ─────────────────────────────
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: produitId,
      },
    });

    if (existingItem) {
      // Update quantity: add to existing
      const newQuantity = existingItem.quantity + quantite;

      // Re-check stock for the new total quantity
      if (product.stock < newQuantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant. Vous avez déjà ${existingItem.quantity} ${product.unit}(s) dans votre panier. Stock disponible : ${product.stock} ${product.unit}(s)`,
          },
          { status: 400 }
        );
      }

      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
      });

      return NextResponse.json({
        item: updatedItem,
        message: "Quantité mise à jour dans le panier",
      });
    }

    // ── Create new cart item ─────────────────────────────────────────────────
    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: produitId,
        quantity: quantite,
      },
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
    });

    return NextResponse.json(
      {
        item: cartItem,
        message: "Produit ajouté au panier",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout au panier" },
      { status: 500 }
    );
  }
}
