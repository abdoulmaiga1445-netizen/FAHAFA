import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

// Horaires d'ouverture types pour les supermarchés d'Abidjan
const HORAIRES_STANDARD = JSON.stringify({
  lundi: { open: "08:00", close: "20:00" },
  mardi: { open: "08:00", close: "20:00" },
  mercredi: { open: "08:00", close: "20:00" },
  jeudi: { open: "08:00", close: "20:00" },
  vendredi: { open: "08:00", close: "20:00" },
  samedi: { open: "08:00", close: "21:00" },
  dimanche: { open: "09:00", close: "13:00" },
});

const HORAIRES_COCODY = JSON.stringify({
  lundi: { open: "07:30", close: "21:00" },
  mardi: { open: "07:30", close: "21:00" },
  mercredi: { open: "07:30", close: "21:00" },
  jeudi: { open: "07:30", close: "21:00" },
  vendredi: { open: "07:30", close: "21:30" },
  samedi: { open: "08:00", close: "22:00" },
  dimanche: { open: "09:00", close: "14:00" },
});

const HORAIRES_ABOBO = JSON.stringify({
  lundi: { open: "07:00", close: "19:30" },
  mardi: { open: "07:00", close: "19:30" },
  mercredi: { open: "07:00", close: "19:30" },
  jeudi: { open: "07:00", close: "19:30" },
  vendredi: { open: "07:00", close: "20:00" },
  samedi: { open: "07:00", close: "20:00" },
  dimanche: { closed: true },
});

const MOYENS_PAIEMENT = JSON.stringify(["Espèces", "Mobile Money", "Carte bancaire", "Wave", "Orange Money"]);

export async function GET() {
  try {
    // Supprimer les données existantes dans l'ordre des dépendances
    await db.$executeRawUnsafe('DELETE FROM OrderItem');
    await db.$executeRawUnsafe('DELETE FROM "Order"');
    await db.$executeRawUnsafe('DELETE FROM CartItem');
    await db.$executeRawUnsafe('DELETE FROM Cart');
    await db.$executeRawUnsafe('DELETE FROM Product');
    await db.$executeRawUnsafe('DELETE FROM Category');
    await db.$executeRawUnsafe('DELETE FROM Supermarket');
    await db.$executeRawUnsafe('DELETE FROM Session');
    await db.$executeRawUnsafe('DELETE FROM Account');
    await db.$executeRawUnsafe('DELETE FROM User');

    // ─── Créer les utilisateurs avec bcrypt ─────────────────────────────

    const clientUser = await db.user.create({
      data: {
        email: "amadou@test.com",
        name: "Amadou Koné",
        password: await hashPassword("Password1"),
        role: "CLIENT",
        phone: "+225 07 08 09 10 11",
      },
    });

    const adminUser = await db.user.create({
      data: {
        email: "admin@supermarche.ci",
        name: "Super Admin",
        password: await hashPassword("AdminPass1"),
        role: "SUPER_ADMIN",
        phone: "+225 01 02 03 04 05",
      },
    });

    const owner1 = await db.user.create({
      data: {
        email: "marie@test.com",
        name: "Marie Bamba",
        password: await hashPassword("Gerant1!"),
        role: "SUPERMARCHE_ADMIN",
        phone: "+225 05 06 07 08 09",
      },
    });

    const owner2 = await db.user.create({
      data: {
        email: "jean@test.com",
        name: "Jean Yao",
        password: await hashPassword("Gerant2!"),
        role: "SUPERMARCHE_ADMIN",
        phone: "+225 05 12 13 14 15",
      },
    });

    const owner3 = await db.user.create({
      data: {
        email: "aicha@test.com",
        name: "Aïcha Diabaté",
        password: await hashPassword("Gerant3!"),
        role: "SUPERMARCHE_ADMIN",
        phone: "+225 05 16 17 18 19",
      },
    });

    const owner4 = await db.user.create({
      data: {
        email: "kouassi@test.com",
        name: "Kouassi N'Guessan",
        password: await hashPassword("Gerant4!"),
        role: "SUPERMARCHE_ADMIN",
        phone: "+225 05 20 21 22 23",
      },
    });

    // ─── Créer les supermarchés ─────────────────────────────────────────

    const auchanCocody = await db.supermarket.create({
      data: {
        name: "Auchan Cocody",
        slug: "auchan-cocody",
        description: "Grand supermarché au cœur de Cocody avec une large sélection de produits locaux et importés.",
        address: "Boulevard de France, Cocody",
        commune: "Cocody",
        latitude: 5.36,
        longitude: -3.94,
        phone: "+225 27 22 44 55 66",
        email: "contact@auchan-cocody.ci",
        isOpen: true,
        rating: 4.5,
        horaires: HORAIRES_COCODY,
        fraisLivraison: 1000,
        livraisonGratuiteDes: 25000,
        livraisonDisponible: true,
        rayonLivraisonKm: 15,
        moyensPaiement: MOYENS_PAIEMENT,
        ownerId: owner1.id,
      },
    });

    const carrefourMarcory = await db.supermarket.create({
      data: {
        name: "Carrefour Marcory",
        slug: "carrefour-marcory",
        description: "Carrefour Market avec des produits frais et un rayon boulangerie artisanale.",
        address: "Rue du Commerce, Marcory",
        commune: "Marcory",
        latitude: 5.3,
        longitude: -3.97,
        phone: "+225 27 21 33 44 55",
        email: "info@carrefour-marcory.ci",
        isOpen: true,
        rating: 4.2,
        horaires: HORAIRES_STANDARD,
        fraisLivraison: 1000,
        livraisonGratuiteDes: 20000,
        livraisonDisponible: true,
        rayonLivraisonKm: 12,
        moyensPaiement: MOYENS_PAIEMENT,
        ownerId: owner2.id,
      },
    });

    const supermarcheAbobo = await db.supermarket.create({
      data: {
        name: "Supermarché Abobo",
        slug: "supermarche-abobo",
        description: "Supermarché de quartier avec des prix compétitifs et des produits locaux.",
        address: "Carrefour Abobo, Abobo",
        commune: "Abobo",
        latitude: 5.42,
        longitude: -4.02,
        phone: "+225 27 20 11 22 33",
        email: "abobo@supermarche-abobo.ci",
        isOpen: true,
        rating: 3.8,
        horaires: HORAIRES_ABOBO,
        fraisLivraison: 800,
        livraisonGratuiteDes: 15000,
        livraisonDisponible: true,
        rayonLivraisonKm: 8,
        moyensPaiement: JSON.stringify(["Espèces", "Mobile Money", "Orange Money"]),
        ownerId: owner3.id,
      },
    });

    const leaderPriceYopougon = await db.supermarket.create({
      data: {
        name: "Leader Price Yopougon",
        slug: "leader-price-yopougon",
        description: "Leader Price avec des produits de qualité à petits prix dans le quartier de Yopougon.",
        address: "Boulevard de Yopougon, Yopougon",
        commune: "Yopougon",
        latitude: 5.33,
        longitude: -4.08,
        phone: "+225 27 20 55 66 77",
        email: "contact@leaderprice-yopougon.ci",
        isOpen: true,
        rating: 4.0,
        horaires: HORAIRES_STANDARD,
        fraisLivraison: 1200,
        livraisonGratuiteDes: 30000,
        livraisonDisponible: true,
        rayonLivraisonKm: 10,
        moyensPaiement: MOYENS_PAIEMENT,
        ownerId: owner4.id,
      },
    });

    // Lier les gérants à leur supermarché
    await db.$executeRawUnsafe(`UPDATE User SET supermarcheId = '${auchanCocody.id}' WHERE id = '${owner1.id}'`);
    await db.$executeRawUnsafe(`UPDATE User SET supermarcheId = '${carrefourMarcory.id}' WHERE id = '${owner2.id}'`);
    await db.$executeRawUnsafe(`UPDATE User SET supermarcheId = '${supermarcheAbobo.id}' WHERE id = '${owner3.id}'`);
    await db.$executeRawUnsafe(`UPDATE User SET supermarcheId = '${leaderPriceYopougon.id}' WHERE id = '${owner4.id}'`);

    // ─── Créer les catégories (par supermarché) ────────────────────────

    // Auchan Cocody
    const cat1_fruits = await db.category.create({ data: { name: "Fruits & Légumes", icon: "apple", supermarketId: auchanCocody.id } });
    const cat1_viandes = await db.category.create({ data: { name: "Viandes & Poissons", icon: "beef", supermarketId: auchanCocody.id } });
    const cat1_laitiers = await db.category.create({ data: { name: "Produits Laitiers", icon: "milk", supermarketId: auchanCocody.id } });
    const cat1_boissons = await db.category.create({ data: { name: "Boissons", icon: "cup", supermarketId: auchanCocody.id } });
    const cat1_epicerie = await db.category.create({ data: { name: "Épicerie", icon: "wheat", supermarketId: auchanCocody.id } });
    const cat1_boulangerie = await db.category.create({ data: { name: "Boulangerie", icon: "croissant", supermarketId: auchanCocody.id } });

    // Carrefour Marcory
    const cat2_fruits = await db.category.create({ data: { name: "Fruits & Légumes", icon: "apple", supermarketId: carrefourMarcory.id } });
    const cat2_viandes = await db.category.create({ data: { name: "Viandes & Poissons", icon: "beef", supermarketId: carrefourMarcory.id } });
    const cat2_laitiers = await db.category.create({ data: { name: "Produits Laitiers", icon: "milk", supermarketId: carrefourMarcory.id } });
    const cat2_boissons = await db.category.create({ data: { name: "Boissons", icon: "cup", supermarketId: carrefourMarcory.id } });
    const cat2_epicerie = await db.category.create({ data: { name: "Épicerie", icon: "wheat", supermarketId: carrefourMarcory.id } });
    const cat2_boulangerie = await db.category.create({ data: { name: "Boulangerie", icon: "croissant", supermarketId: carrefourMarcory.id } });

    // Supermarché Abobo
    const cat3_fruits = await db.category.create({ data: { name: "Fruits & Légumes", icon: "apple", supermarketId: supermarcheAbobo.id } });
    const cat3_viandes = await db.category.create({ data: { name: "Viandes & Poissons", icon: "beef", supermarketId: supermarcheAbobo.id } });
    const cat3_epicerie = await db.category.create({ data: { name: "Épicerie", icon: "wheat", supermarketId: supermarcheAbobo.id } });
    const cat3_boissons = await db.category.create({ data: { name: "Boissons", icon: "cup", supermarketId: supermarcheAbobo.id } });

    // Leader Price Yopougon
    const cat4_fruits = await db.category.create({ data: { name: "Fruits & Légumes", icon: "apple", supermarketId: leaderPriceYopougon.id } });
    const cat4_laitiers = await db.category.create({ data: { name: "Produits Laitiers", icon: "milk", supermarketId: leaderPriceYopougon.id } });
    const cat4_boissons = await db.category.create({ data: { name: "Boissons", icon: "cup", supermarketId: leaderPriceYopougon.id } });
    const cat4_epicerie = await db.category.create({ data: { name: "Épicerie", icon: "wheat", supermarketId: leaderPriceYopougon.id } });
    const cat4_boulangerie = await db.category.create({ data: { name: "Boulangerie", icon: "croissant", supermarketId: leaderPriceYopougon.id } });

    // ─── Créer les produits ─────────────────────────────────────────────

    const products = [
      // Auchan Cocody
      { name: "Bananes plantains", description: "Bananes plantains fraîches, idéales pour l'alloco ou le foutou", price: 750, comparePrice: 900, unit: "kg", stock: 50, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_fruits.id },
      { name: "Poulet fermier entier", description: "Poulet fermier élevé en plein air, prêt à cuire", price: 4500, comparePrice: 5000, unit: "unité", stock: 15, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_viandes.id },
      { name: "Lait Nido", description: "Lait en poudre Nido, 400g", price: 2800, comparePrice: 3200, unit: "unité", stock: 30, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_laitiers.id },
      { name: "Eau minérale Olympe", description: "Eau minérale Olympe, pack de 6 bouteilles 1.5L", price: 2400, comparePrice: 2800, unit: "unité", stock: 100, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_boissons.id },
      { name: "Riz Uncle Ben's", description: "Riz long grain Uncle Ben's, 1kg", price: 1800, unit: "unité", stock: 45, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_epicerie.id },
      { name: "Pain baguette", description: "Baguette traditionnelle fraîche", price: 200, unit: "unité", stock: 3, inStock: true, isActive: true, supermarketId: auchanCocody.id, categoryId: cat1_boulangerie.id },

      // Carrefour Marcory
      { name: "Mangues Kent", description: "Mangues Kent juteuses et sucrées, de saison", price: 1200, unit: "kg", stock: 25, inStock: true, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_fruits.id },
      { name: "Thon frais", description: "Filet de thon frais pêché localement", price: 6000, unit: "kg", stock: 8, inStock: true, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_viandes.id },
      { name: "Yaourt Faci", description: "Yaourt nature Faci, pack de 6", price: 1500, unit: "unité", stock: 40, inStock: true, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_laitiers.id },
      { name: "Coca-Cola", description: "Coca-Cola, pack de 6 canettes 33cl", price: 3000, unit: "unité", stock: 60, inStock: true, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_boissons.id },
      { name: "Cube Maggi", description: "Cubes Maggi assaisonnés, pack de 50", price: 2500, unit: "unité", stock: 35, inStock: true, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_epicerie.id },
      { name: "Croissants beurre", description: "Croissants au beurre, pack de 4", price: 1500, unit: "unité", stock: 0, inStock: false, isActive: true, supermarketId: carrefourMarcory.id, categoryId: cat2_boulangerie.id },

      // Supermarché Abobo
      { name: "Tomates fraîches", description: "Tomates mûres parfaites pour les sauces", price: 500, comparePrice: 650, unit: "kg", stock: 40, inStock: true, isActive: true, supermarketId: supermarcheAbobo.id, categoryId: cat3_fruits.id },
      { name: "Viande de bœuf hachée", description: "Bœuf haché frais, 500g", price: 3500, unit: "unité", stock: 12, inStock: true, isActive: true, supermarketId: supermarcheAbobo.id, categoryId: cat3_viandes.id },
      { name: "Jus de bissap", description: "Jus de bissap artisanal, 1L", price: 800, unit: "unité", stock: 20, inStock: true, isActive: true, supermarketId: supermarcheAbobo.id, categoryId: cat3_boissons.id },
      { name: "Huile de palme", description: "Huile de palme traditionnelle, 1L", price: 1500, comparePrice: 1800, unit: "unité", stock: 18, inStock: true, isActive: true, supermarketId: supermarcheAbobo.id, categoryId: cat3_epicerie.id },

      // Leader Price Yopougon
      { name: "Ignames", description: "Ignames de qualité, idéales pour le foutou", price: 800, unit: "kg", stock: 30, inStock: true, isActive: true, supermarketId: leaderPriceYopougon.id, categoryId: cat4_fruits.id },
      { name: "Fromage mozzarella", description: "Mozzarella râpée, 200g", price: 2200, unit: "unité", stock: 10, inStock: true, isActive: true, supermarketId: leaderPriceYopougon.id, categoryId: cat4_laitiers.id },
      { name: "Bière Flag", description: "Bière Flag, pack de 6 bouteilles 65cl", price: 4500, unit: "unité", stock: 4, inStock: true, isActive: true, supermarketId: leaderPriceYopougon.id, categoryId: cat4_boissons.id },
      { name: "Spaghetti Barilla", description: "Spaghetti Barilla n°5, 500g", price: 1200, unit: "unité", stock: 55, inStock: true, isActive: true, supermarketId: leaderPriceYopougon.id, categoryId: cat4_epicerie.id },
      { name: "Pain de mie", description: "Pain de mie tranché, 500g", price: 1100, comparePrice: 1300, unit: "unité", stock: 2, inStock: true, isActive: true, supermarketId: leaderPriceYopougon.id, categoryId: cat4_boulangerie.id },
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await db.product.create({ data: product });
      createdProducts.push(created);
    }

    // Créer un panier vide pour le client
    await db.cart.create({ data: { userId: clientUser.id } });

    return NextResponse.json({
      success: true,
      message: "Base de données réinitialisée avec succès !",
      data: {
        users: 6,
        categories: 21,
        supermarkets: 4,
        products: createdProducts.length,
        credentials: {
          client: { email: "amadou@test.com", password: "Password1" },
          admin: { email: "admin@supermarche.ci", password: "AdminPass1" },
          gerants: [
            { email: "marie@test.com", password: "Gerant1!", supermarket: "Auchan Cocody" },
            { email: "jean@test.com", password: "Gerant2!", supermarket: "Carrefour Marcory" },
            { email: "aicha@test.com", password: "Gerant3!", supermarket: "Supermarché Abobo" },
            { email: "kouassi@test.com", password: "Gerant4!", supermarket: "Leader Price Yopougon" },
          ],
        },
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Erreur lors du peuplement de la base de données", details: String(error) },
      { status: 500 }
    );
  }
}
