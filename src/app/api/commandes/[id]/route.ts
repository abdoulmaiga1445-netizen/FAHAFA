import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── GET — Détail d'une commande ────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;
    const userRole = (session.user as { role: string }).role;
    const userSupermarcheId = (
      session.user as { supermarcheId?: string | null }
    ).supermarcheId;

    const { id } = await params;

    // 2. Récupérer la commande
    const order = await db.order.findUnique({
      where: { id },
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
            phone: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // 3. Vérifier les autorisations d'accès
    //    - Le propriétaire de la commande peut la voir
    //    - Un SUPER_ADMIN peut voir toutes les commandes
    //    - Un SUPERMARCHE_ADMIN peut voir les commandes de son supermarché
    const isOwner = order.userId === userId;
    const isSuperAdmin = userRole === "SUPER_ADMIN";
    const isSupermarcheAdmin =
      userRole === "SUPERMARCHE_ADMIN" &&
      userSupermarcheId === order.supermarketId;

    if (!isOwner && !isSuperAdmin && !isSupermarcheAdmin) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à voir cette commande" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Erreur lors du chargement de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de la commande" },
      { status: 500 }
    );
  }
}
