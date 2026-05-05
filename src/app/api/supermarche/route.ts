import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// POST — créer un supermarché (réservé SUPERMARCHE_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    const userId = session.user.id as string;

    if (userRole !== "SUPERMARCHE_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Seuls les gérants de supermarché peuvent créer un magasin" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà un supermarché
    const existingStore = await db.supermarket.findUnique({
      where: { ownerId: userId },
    });
    if (existingStore) {
      return NextResponse.json(
        { error: "Vous avez déjà un supermarché enregistré", supermarketId: existingStore.id },
        { status: 409 }
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
    } = body;

    // Validation minimale
    if (!name || !adresse || !commune || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Nom, adresse, commune et coordonnées sont obligatoires" },
        { status: 400 }
      );
    }

    // Générer un slug unique
    let slug = slugify(name);
    const existingSlug = await db.supermarket.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const supermarket = await db.supermarket.create({
      data: {
        name,
        slug,
        description: description || null,
        address: adresse,
        commune,
        latitude: parseFloat(String(latitude)),
        longitude: parseFloat(String(longitude)),
        phone: telephone || null,
        email: email || null,
        fraisLivraison: fraisLivraison ? parseFloat(String(fraisLivraison)) : 1000,
        livraisonGratuiteDes: livraisonGratuiteDes ? parseFloat(String(livraisonGratuiteDes)) : 0,
        rayonLivraisonKm: rayonLivraisonKm ? parseFloat(String(rayonLivraisonKm)) : 10,
        livraisonDisponible: true,
        moyensPaiement: JSON.stringify(moyensPaiement || []),
        horaires: JSON.stringify(horaires || {}),
        ownerId: userId,
      },
    });

    // Lier le user à son supermarché
    await db.user.update({
      where: { id: userId },
      data: { supermarcheId: supermarket.id },
    });

    return NextResponse.json(
      { message: "Supermarché créé avec succès", supermarket },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating supermarket:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du supermarché" },
      { status: 500 }
    );
  }
}

// GET — récupérer tous les supermarchés actifs (public)
export async function GET() {
  try {
    const supermarkets = await db.supermarket.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = supermarkets.map((sm) => ({
      id: sm.id,
      name: sm.name,
      slug: sm.slug,
      description: sm.description,
      logo: sm.logo,
      coverImage: sm.coverImage,
      address: sm.address,
      commune: sm.commune,
      latitude: sm.latitude,
      longitude: sm.longitude,
      phone: sm.phone,
      email: sm.email,
      isOpen: sm.isOpen,
      rating: sm.rating,
      horaires: sm.horaires,
      fraisLivraison: sm.fraisLivraison,
      livraisonGratuiteDes: sm.livraisonGratuiteDes,
      livraisonDisponible: sm.livraisonDisponible,
      rayonLivraisonKm: sm.rayonLivraisonKm,
      moyensPaiement: sm.moyensPaiement,
      productCount: sm._count.products,
    }));

    return NextResponse.json({ supermarkets: result });
  } catch (error) {
    console.error("Error fetching supermarkets:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des supermarchés" },
      { status: 500 }
    );
  }
}
