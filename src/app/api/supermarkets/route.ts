import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commune = searchParams.get("commune");
    const slug = searchParams.get("slug");

    const where: Record<string, unknown> = {};
    if (commune) {
      where.commune = commune;
    }
    if (slug) {
      where.slug = slug;
    }
    where.isActive = true; // Only active supermarkets

    const supermarkets = await db.supermarket.findMany({
      where,
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
      createdAt: sm.createdAt,
      updatedAt: sm.updatedAt,
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
