import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — liste produits du supermarché connecté (filtres : categorie, search, estActif)
export async function GET(request: NextRequest) {
  try {
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

    if (!supermarcheId) {
      return NextResponse.json(
        { error: "Aucun supermarché associé à ce compte" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get("categorie");
    const search = searchParams.get("search");
    const estActif = searchParams.get("estActif");

    const where: Record<string, unknown> = {
      supermarketId: supermarcheId,
    };

    if (categorie) {
      where.categoryId = categorie;
    }

    if (search) {
      where.name = { contains: search };
    }

    if (estActif !== null && estActif !== undefined && estActif !== "") {
      where.isActive = estActif === "true";
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching produits:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits" },
      { status: 500 }
    );
  }
}

// POST — créer un produit
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
        { error: "Seuls les gérants de supermarché peuvent créer des produits" },
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
    const {
      nom,
      description,
      prix,
      prixPromo,
      stock,
      unite,
      categorieId,
      images,
      codeBarres,
    } = body;

    // Validation
    if (!nom || !nom.trim()) {
      return NextResponse.json({ error: "Le nom du produit est obligatoire" }, { status: 400 });
    }
    if (prix === undefined || prix === null || parseFloat(prix) <= 0) {
      return NextResponse.json({ error: "Le prix doit être supérieur à 0" }, { status: 400 });
    }
    if (stock === undefined || stock === null || parseInt(stock) < 0) {
      return NextResponse.json({ error: "Le stock doit être positif ou nul" }, { status: 400 });
    }
    if (!categorieId) {
      return NextResponse.json({ error: "La catégorie est obligatoire" }, { status: 400 });
    }

    // Vérifier que la catégorie appartient au supermarché
    const category = await db.category.findUnique({ where: { id: categorieId } });
    if (!category || category.supermarketId !== supermarcheId) {
      return NextResponse.json(
        { error: "Catégorie invalide ou n'appartenant pas à votre supermarché" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name: nom.trim(),
        description: description?.trim() || null,
        price: parseFloat(prix),
        comparePrice: prixPromo ? parseFloat(prixPromo) : null,
        stock: parseInt(stock),
        unit: unite || "unité",
        inStock: parseInt(stock) > 0,
        isActive: true,
        codeBarres: codeBarres?.trim() || null,
        images: JSON.stringify(images || []),
        image: images && images.length > 0 ? images[0] : null,
        supermarketId: supermarcheId,
        categoryId: categorieId,
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
      },
    });

    return NextResponse.json(
      { message: "Produit créé avec succès", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
