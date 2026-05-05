import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPES_COMMANDE = ["LIVRAISON", "CLICK_AND_COLLECT"] as const;
const METHODES_PAIEMENT = ["ORANGE_MONEY", "MTN_MONEY", "WAVE", "CASH"] as const;

type TypeCommande = (typeof TYPES_COMMANDE)[number];
type MethodePaiement = (typeof METHODES_PAIEMENT)[number];

// ─── POST — Créer une commande depuis le panier ────────────────────────────

export async function POST(request: NextRequest) {
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

    // 2. Parser le body
    const body = await request.json();
    const {
      typeCommande,
      adresseLivraison,
      communeLivraison,
      methodePaiement,
      notesClient,
    } = body as {
      typeCommande?: string;
      adresseLivraison?: string;
      communeLivraison?: string;
      methodePaiement?: string;
      notesClient?: string;
    };

    // 3. Valider typeCommande
    if (!typeCommande || !TYPES_COMMANDE.includes(typeCommande as TypeCommande)) {
      return NextResponse.json(
        {
          error: `typeCommande invalide. Valeurs acceptées : ${TYPES_COMMANDE.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 4. Si LIVRAISON, adresse et commune sont obligatoires
    if (typeCommande === "LIVRAISON") {
      if (!adresseLivraison?.trim()) {
        return NextResponse.json(
          { error: "L'adresse de livraison est obligatoire pour une livraison" },
          { status: 400 }
        );
      }
      if (!communeLivraison?.trim()) {
        return NextResponse.json(
          { error: "La commune de livraison est obligatoire pour une livraison" },
          { status: 400 }
        );
      }
    }

    // 5. Valider methodePaiement
    if (
      !methodePaiement ||
      !METHODES_PAIEMENT.includes(methodePaiement as MethodePaiement)
    ) {
      return NextResponse.json(
        {
          error: `methodePaiement invalide. Valeurs acceptées : ${METHODES_PAIEMENT.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 6. Récupérer le téléphone de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (!user?.phone) {
      return NextResponse.json(
        {
          error:
            "Un numéro de téléphone est requis pour passer une commande. Veuillez mettre à jour votre profil.",
        },
        { status: 400 }
      );
    }

    // 7. Récupérer le panier avec les articles
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                inStock: true,
                supermarketId: true,
              },
            },
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

    // 8. Vérifier la disponibilité en stock de chaque article
    for (const item of cart.items) {
      if (!item.product.inStock || item.product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Le produit "${item.product.name}" n'est plus disponible en quantité suffisante (stock : ${item.product.stock})`,
          },
          { status: 400 }
        );
      }
    }

    // Tous les articles proviennent du même supermarché (contrainte au niveau du panier)
    const supermarketId = cart.items[0].product.supermarketId;
    const sameSupermarket = cart.items.every(
      (item) => item.product.supermarketId === supermarketId
    );

    if (!sameSupermarket) {
      return NextResponse.json(
        {
          error:
            "Tous les articles du panier doivent provenir du même supermarché",
        },
        { status: 400 }
      );
    }

    // 9. Récupérer les infos du supermarché pour les frais de livraison
    const supermarket = await db.supermarket.findUnique({
      where: { id: supermarketId },
      select: {
        id: true,
        name: true,
        fraisLivraison: true,
        livraisonGratuiteDes: true,
      },
    });

    if (!supermarket) {
      return NextResponse.json(
        { error: "Supermarché introuvable" },
        { status: 400 }
      );
    }

    // 10. Calculer les montants
    const sousTotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let fraisLivraison = 0;

    if (typeCommande === "LIVRAISON") {
      // Appliquer les frais de livraison du supermarché
      fraisLivraison = supermarket.fraisLivraison;

      // Livraison gratuite si le sous-total atteint le seuil
      if (
        supermarket.livraisonGratuiteDes > 0 &&
        sousTotal >= supermarket.livraisonGratuiteDes
      ) {
        fraisLivraison = 0;
      }
    }
    // CLICK_AND_COLLECT => fraisLivraison = 0 (déjà initialisé)

    const total = sousTotal + fraisLivraison;

    // 11. Générer le numéro de commande
    const orderNumber = `CMD-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;

    // Vérifier l'unicité du numéro de commande
    const existingOrder = await db.order.findUnique({
      where: { orderNumber },
    });

    // En cas de collision (très rare), regénérer
    const finalOrderNumber = existingOrder
      ? `CMD-${new Date().getFullYear()}-${String(
          Math.floor(1000 + Math.random() * 9000)
        )}`
      : orderNumber;

    // 12. Déterminer l'adresse et la commune selon le type de commande
    const deliveryAddress =
      typeCommande === "LIVRAISON"
        ? adresseLivraison!.trim()
        : supermarket.name;

    const commune =
      typeCommande === "LIVRAISON"
        ? communeLivraison!.trim()
        : supermarket.name;

    // 13. Transaction atomique : créer commande + items + décrémenter stock + vider panier
    const order = await db.$transaction(async (tx) => {
      // a. Créer la commande avec ses articles
      const newOrder = await tx.order.create({
        data: {
          orderNumber: finalOrderNumber,
          status: "EN_ATTENTE",
          typeCommande,
          methodePaiement,
          total,
          deliveryFee: fraisLivraison,
          deliveryAddress,
          commune,
          phone: user.phone!,
          notes: notesClient?.trim() || null,
          userId,
          supermarketId,
          items: {
            create: cart.items.map((item) => ({
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

      // b. Décrémenter le stock pour chaque produit
      for (const item of cart.items) {
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!currentProduct) continue;

        const newStock = currentProduct.stock - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            inStock: newStock > 0,
          },
        });
      }

      // c. Vider le panier
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

// ─── GET — Liste des commandes du client connecté ───────────────────────────

export async function GET() {
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

    // 2. Récupérer les commandes de l'utilisateur
    const orders = await db.order.findMany({
      where: { userId },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Erreur lors du chargement des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes" },
      { status: 500 }
    );
  }
}
