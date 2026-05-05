import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — détail produit (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
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
          select: { id: true, name: true, icon: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du produit" },
      { status: 500 }
    );
  }
}

// PUT — modifier produit (owner du supermarché)
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
    const supermarcheId = (session.user as { supermarcheId?: string | null }).supermarcheId;
    const { id } = await params;

    // Vérifier que le produit existe et appartient au supermarché de l'utilisateur
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    if (product.supermarketId !== supermarcheId && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce produit" },
        { status: 403 }
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
      isActive,
    } = body;

    // Si catégorie fournie, vérifier qu'elle appartient au supermarché
    if (categorieId) {
      const category = await db.category.findUnique({ where: { id: categorieId } });
      if (!category || category.supermarketId !== (supermarcheId || product.supermarketId)) {
        return NextResponse.json(
          { error: "Catégorie invalide" },
          { status: 400 }
        );
      }
    }

    const parsedImages = images || (product.images ? JSON.parse(product.images) : []);
    const updated = await db.product.update({
      where: { id },
      data: {
        ...(nom !== undefined && { name: nom.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(prix !== undefined && { price: parseFloat(prix) }),
        ...(prixPromo !== undefined && { comparePrice: prixPromo ? parseFloat(prixPromo) : null }),
        ...(stock !== undefined && { stock: parseInt(stock), inStock: parseInt(stock) > 0 }),
        ...(unite !== undefined && { unit: unite }),
        ...(categorieId !== undefined && { categoryId: categorieId }),
        ...(images !== undefined && {
          images: JSON.stringify(images),
          image: images && images.length > 0 ? images[0] : null,
        }),
        ...(codeBarres !== undefined && { codeBarres: codeBarres?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
      },
    });

    return NextResponse.json({
      message: "Produit mis à jour avec succès",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}

// DELETE — désactiver produit (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    const supermarcheId = (session.user as { supermarcheId?: string | null }).supermarcheId;
    const { id } = await params;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    if (product.supermarketId !== supermarcheId && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce produit" },
        { status: 403 }
      );
    }

    await db.product.update({
      where: { id },
      data: { isActive: false, inStock: false },
    });

    return NextResponse.json({
      message: "Produit désactivé avec succès",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation du produit" },
      { status: 500 }
    );
  }
}
