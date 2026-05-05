import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — détail d'un supermarché avec catégories et produits (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supermarket = await db.supermarket.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            category: { select: { id: true, name: true, icon: true } },
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!supermarket || !supermarket.isActive) {
      return NextResponse.json(
        { error: "Supermarché non trouvé" },
        { status: 404 }
      );
    }

    // Extraire les catégories uniques des produits
    const categoriesMap = new Map<string, { id: string; name: string; icon: string | null; productCount: number }>();
    for (const product of supermarket.products) {
      const cat = product.category;
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, { ...cat, productCount: 0 });
      }
      categoriesMap.get(cat.id)!.productCount++;
    }
    const categories = Array.from(categoriesMap.values());

    return NextResponse.json({
      supermarket: {
        id: supermarket.id,
        name: supermarket.name,
        slug: supermarket.slug,
        description: supermarket.description,
        logo: supermarket.logo,
        coverImage: supermarket.coverImage,
        address: supermarket.address,
        commune: supermarket.commune,
        latitude: supermarket.latitude,
        longitude: supermarket.longitude,
        phone: supermarket.phone,
        email: supermarket.email,
        isOpen: supermarket.isOpen,
        rating: supermarket.rating,
        horaires: supermarket.horaires,
        fraisLivraison: supermarket.fraisLivraison,
        livraisonGratuiteDes: supermarket.livraisonGratuiteDes,
        livraisonDisponible: supermarket.livraisonDisponible,
        rayonLivraisonKm: supermarket.rayonLivraisonKm,
        moyensPaiement: supermarket.moyensPaiement,
        ownerId: supermarket.ownerId,
        productCount: supermarket._count.products,
        orderCount: supermarket._count.orders,
        createdAt: supermarket.createdAt,
        updatedAt: supermarket.updatedAt,
      },
      products: supermarket.products,
      categories,
    });
  } catch (error) {
    console.error("Error fetching supermarket:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du supermarché" },
      { status: 500 }
    );
  }
}

// PUT — modifier son supermarché (owner seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const userRole = (session.user as { role: string }).role;
    const { id } = await params;

    // Vérifier que le supermarché appartient à l'utilisateur
    const supermarket = await db.supermarket.findUnique({ where: { id } });
    if (!supermarket) {
      return NextResponse.json(
        { error: "Supermarché non trouvé" },
        { status: 404 }
      );
    }

    if (supermarket.ownerId !== userId && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce supermarché" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      adresse,
      commune,
      latitude,
      longitude,
      telephone,
      email,
      fraisLivraison,
      livraisonGratuiteDes,
      rayonLivraisonKm,
      moyensPaiement,
      horaires,
      isOpen,
    } = body;

    // Si le nom change, mettre à jour le slug
    let slug = supermarket.slug;
    if (name && name !== supermarket.name) {
      slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingSlug = await db.supermarket.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }
    }

    const updated = await db.supermarket.update({
      where: { id },
      data: {
        ...(name !== undefined && { name, slug }),
        ...(description !== undefined && { description: description || null }),
        ...(adresse !== undefined && { address: adresse }),
        ...(commune !== undefined && { commune }),
        ...(latitude !== undefined && { latitude: parseFloat(String(latitude)) }),
        ...(longitude !== undefined && { longitude: parseFloat(String(longitude)) }),
        ...(telephone !== undefined && { phone: telephone || null }),
        ...(email !== undefined && { email: email || null }),
        ...(fraisLivraison !== undefined && { fraisLivraison: parseFloat(String(fraisLivraison)) }),
        ...(livraisonGratuiteDes !== undefined && { livraisonGratuiteDes: parseFloat(String(livraisonGratuiteDes)) }),
        ...(rayonLivraisonKm !== undefined && { rayonLivraisonKm: parseFloat(String(rayonLivraisonKm)) }),
        ...(moyensPaiement !== undefined && { moyensPaiement: JSON.stringify(moyensPaiement) }),
        ...(horaires !== undefined && { horaires: JSON.stringify(horaires) }),
        ...(isOpen !== undefined && { isOpen }),
      },
    });

    return NextResponse.json({
      message: "Supermarché mis à jour avec succès",
      supermarket: updated,
    });
  } catch (error) {
    console.error("Error updating supermarket:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du supermarché" },
      { status: 500 }
    );
  }
}

// DELETE — désactiver (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const userRole = (session.user as { role: string }).role;
    const { id } = await params;

    const supermarket = await db.supermarket.findUnique({ where: { id } });
    if (!supermarket) {
      return NextResponse.json(
        { error: "Supermarché non trouvé" },
        { status: 404 }
      );
    }

    if (supermarket.ownerId !== userId && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce supermarché" },
        { status: 403 }
      );
    }

    await db.supermarket.update({
      where: { id },
      data: { isActive: false, isOpen: false },
    });

    return NextResponse.json({
      message: "Supermarché désactivé avec succès",
    });
  } catch (error) {
    console.error("Error deleting supermarket:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation du supermarché" },
      { status: 500 }
    );
  }
}
