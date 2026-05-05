import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SM-${timestamp}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const supermarketId = searchParams.get("supermarketId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId est requis" },
        { status: 400 }
      );
    }

    let where: Record<string, unknown> = {};

    if (role === "SUPERMARCHE" && supermarketId) {
      where.supermarketId = supermarketId;
    } else {
      where.userId = userId;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                unit: true,
              },
            },
          },
        },
        supermarket: {
          select: {
            id: true,
            name: true,
            commune: true,
            address: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deliveryAddress, commune, phone, notes, userId } = body;

    if (!userId || !deliveryAddress || !commune || !phone) {
      return NextResponse.json(
        { error: "userId, deliveryAddress, commune et phone sont requis" },
        { status: 400 }
      );
    }

    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Votre panier est vide" },
        { status: 400 }
      );
    }

    // Group items by supermarket
    const itemsBySupermarket = new Map<string, typeof cart.items>();

    for (const item of cart.items) {
      const smId = item.product.supermarketId;
      if (!itemsBySupermarket.has(smId)) {
        itemsBySupermarket.set(smId, []);
      }
      itemsBySupermarket.get(smId)!.push(item);
    }

    const orders = [];

    for (const [supermarketId, items] of itemsBySupermarket) {
      const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const deliveryFee = 1000; // Fixed delivery fee: 1000 FCFA

      const order = await db.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: "EN_ATTENTE",
          total: total + deliveryFee,
          deliveryFee,
          deliveryAddress,
          commune,
          phone,
          notes: notes || null,
          userId,
          supermarketId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  unit: true,
                },
              },
            },
          },
          supermarket: {
            select: {
              id: true,
              name: true,
              commune: true,
              address: true,
            },
          },
        },
      });

      orders.push(order);
    }

    // Clear the cart after order creation
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      orders,
      message: `${orders.length} commande(s) créée(s) avec succès`,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}
