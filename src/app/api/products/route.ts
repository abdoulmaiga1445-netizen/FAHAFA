import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET — produits publics (filtres : categoryId, supermarketId, search, commune)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const supermarketId = searchParams.get("supermarketId");
    const search = searchParams.get("search");
    const commune = searchParams.get("commune");

    const where: Record<string, unknown> = {
      isActive: true,
      inStock: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supermarketId) {
      where.supermarketId = supermarketId;
    }

    if (search) {
      where.name = { contains: search };
    }

    if (commune) {
      where.supermarket = { commune: commune, isActive: true };
    }

    const products = await db.product.findMany({
      where,
      include: {
        supermarket: {
          select: {
            id: true,
            name: true,
            slug: true,
            commune: true,
            isOpen: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits" },
      { status: 500 }
    );
  }
}
