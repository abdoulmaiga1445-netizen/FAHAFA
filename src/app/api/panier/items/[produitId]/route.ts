import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ─── PUT /api/panier/items/[produitId] — Modifier la quantité d'un article ───
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ produitId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { produitId } = await params;
    const body = await request.json();
    const { quantite } = body as { quantite?: number };

    if (quantite === undefined || quantite === null || typeof quantite !== "number") {
      return NextResponse.json(
        { error: "quantite est requis et doit être un nombre" },
        { status: 400 }
      );
    }

    // Find the user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé" },
        { status: 404 }
      );
    }

    // Find the cart item by productId and user's cart
    const cartItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: produitId,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans votre panier" },
        { status: 404 }
      );
    }

    // If quantite <= 0, delete the item
    if (quantite <= 0) {
      await db.cartItem.delete({
        where: { id: cartItem.id },
      });

      return NextResponse.json({
        message: "Article retiré du panier",
        deleted: true,
      });
    }

    // Check stock availability for the new quantity
    const product = await db.product.findUnique({
      where: { id: produitId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    if (product.stock < quantite) {
      return NextResponse.json(
        {
          error: `Stock insuffisant. Disponible : ${product.stock} ${product.unit}(s)`,
        },
        { status: 400 }
      );
    }

    // Update the quantity
    const updatedItem = await db.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: quantite },
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
      message: "Quantité mise à jour",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du panier:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du panier" },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/panier/items/[produitId] — Supprimer un article ──────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ produitId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { produitId } = await params;

    // Find the user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé" },
        { status: 404 }
      );
    }

    // Find the cart item by productId and user's cart
    const cartItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: produitId,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Article non trouvé dans votre panier" },
        { status: 404 }
      );
    }

    // Delete the item
    await db.cartItem.delete({
      where: { id: cartItem.id },
    });

    return NextResponse.json({
      message: "Article retiré du panier",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article" },
      { status: 500 }
    );
  }
}
