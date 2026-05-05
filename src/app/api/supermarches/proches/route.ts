import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { haversineDistance } from "@/lib/geo";
import { estOuvertMaintenant } from "@/lib/horaires";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const commune = searchParams.get("commune");
    const search = searchParams.get("search");
    const ouvertMaintenant = searchParams.get("ouvertMaintenant");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (commune) {
      where.commune = commune;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { products: { some: { name: { contains: search } } } },
      ];
    }

    // Fetch supermarkets with product count
    const supermarkets = await db.supermarket.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Calculate distance and open status for each supermarket
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    let results = supermarkets.map((sm) => {
      const distance =
        userLat !== null && userLng !== null
          ? haversineDistance(userLat, userLng, sm.latitude, sm.longitude)
          : null;

      const estOuvert = estOuvertMaintenant(sm.horaires);

      return {
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
        isOpen: sm.isOpen,
        rating: sm.rating,
        horaires: sm.horaires,
        fraisLivraison: sm.fraisLivraison,
        livraisonDisponible: sm.livraisonDisponible,
        moyensPaiement: sm.moyensPaiement,
        nbProduits: sm._count.products,
        distance,
        estOuvert,
      };
    });

    // Filter by open now if requested
    if (ouvertMaintenant === "true") {
      results = results.filter((r) => r.estOuvert);
    }

    // Sort by distance if geolocation provided, otherwise by name
    if (userLat !== null && userLng !== null) {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    } else {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    return NextResponse.json({
      supermarkets: paginatedResults,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching nearby supermarkets:", error);
    // Return empty array instead of 500 if database doesn't exist yet
    return NextResponse.json({ supermarkets: [], total: 0, limit, offset: 0, dbError: true });
  }
}
