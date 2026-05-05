import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      );
    }

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
          orderBy: { id: "desc" },
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
            orderBy: { id: "desc" },
          },
        },
      });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    return NextResponse.json({
      cart: {
        id: cart.id,
        userId: cart.userId,
        items: cart.items,
        total,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du panier" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, userId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "userId et productId sont requis" },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: "Ce produit n'est plus en stock" },
        { status: 400 }
      );
    }

    let cart = await db.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      });
    }

    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: {
              supermarket: { select: { id: true, name: true, commune: true } },
              category: { select: { id: true, name: true } },
            },
          },
        },
      });

      return NextResponse.json({
        item: updatedItem,
        message: "Quantité mise à jour dans le panier",
      });
    }

    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            supermarket: { select: { id: true, name: true, commune: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      item: cartItem,
      message: "Produit ajouté au panier",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout au panier" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartItemId, userId } = body;

    if (!cartItemId || !userId) {
      return NextResponse.json(
        { error: "cartItemId et userId sont requis" },
        { status: 400 }
      );
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: "Article non trouvé dans votre panier" },
        { status: 404 }
      );
    }

    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({
      message: "Article retiré du panier",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du panier" },
      { status: 500 }
    );
  }
}
