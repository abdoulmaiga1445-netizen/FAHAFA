import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — catégories du supermarché connecté (ou par param supermarketId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supermarketId = searchParams.get("supermarketId");

    // Si on a un supermarketId en param, c'est public (côté client)
    // Sinon, on utilise la session pour le dashboard
    let targetSupermarketId = supermarketId;

    if (!targetSupermarketId) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
      }

      const userRole = (session.user as { role: string }).role;
      const supermarcheId = (session.user as { supermarcheId?: string | null }).supermarcheId;

      if (userRole !== "SUPERMARCHE_ADMIN" && userRole !== "SUPER_ADMIN") {
        return NextResponse.json(
          { error: "Accès réservé aux gérants de supermarché" },
          { status: 403 }
        );
      }

      targetSupermarketId = supermarcheId;
    }

    if (!targetSupermarketId) {
      return NextResponse.json({ categories: [] });
    }

    const categories = await db.category.findMany({
      where: { supermarketId: targetSupermarketId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      productCount: cat._count.products,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des catégories" },
      { status: 500 }
    );
  }
}

// POST — créer catégorie { nom, icone }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    const supermarcheId = (session.user as { supermarcheId?: string | null }).supermarcheId;

    if (userRole !== "SUPERMARCHE_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Seuls les gérants de supermarché peuvent créer des catégories" },
        { status: 403 }
      );
    }

    if (!supermarcheId) {
      return NextResponse.json(
        { error: "Aucun supermarché associé à ce compte" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nom, icone } = body;

    if (!nom || !nom.trim()) {
      return NextResponse.json({ error: "Le nom de la catégorie est obligatoire" }, { status: 400 });
    }

    // Vérifier unicité du nom dans le supermarché
    const existing = await db.category.findFirst({
      where: {
        name: nom.trim(),
        supermarketId: supermarcheId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name: nom.trim(),
        icon: icone?.trim() || null,
        supermarketId: supermarcheId,
      },
    });

    return NextResponse.json(
      { message: "Catégorie créée avec succès", category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}
