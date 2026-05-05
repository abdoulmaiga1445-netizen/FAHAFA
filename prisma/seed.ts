import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hashed_${Math.abs(hash).toString(36)}_${str.length}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supermarket.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const clientUser = await prisma.user.create({
    data: {
      email: "amadou@test.com",
      name: "Amadou Koné",
      password: simpleHash("password123"),
      role: "CLIENT",
      phone: "+225 07 08 09 10 11",
    },
  });
  console.log("✅ Created client user:", clientUser.email);

  const ownerUser1 = await prisma.user.create({
    data: {
      email: "marie@test.com",
      name: "Marie Bamba",
      password: simpleHash("password123"),
      role: "SUPERMARCHE",
      phone: "+225 05 06 07 08 09",
    },
  });
  const ownerUser2 = await prisma.user.create({
    data: {
      email: "jean@test.com",
      name: "Jean Yao",
      password: simpleHash("password123"),
      role: "SUPERMARCHE",
      phone: "+225 05 12 13 14 15",
    },
  });
  const ownerUser3 = await prisma.user.create({
    data: {
      email: "aicha@test.com",
      name: "Aïcha Diabaté",
      password: simpleHash("password123"),
      role: "SUPERMARCHE",
      phone: "+225 05 16 17 18 19",
    },
  });
  const ownerUser4 = await prisma.user.create({
    data: {
      email: "kouassi@test.com",
      name: "Kouassi N'Guessan",
      password: simpleHash("password123"),
      role: "SUPERMARCHE",
      phone: "+225 05 20 21 22 23",
    },
  });
  console.log("✅ Created owner users:", ownerUser1.email, ownerUser2.email, ownerUser3.email, ownerUser4.email);

  // Create Categories
  const fruitsLegumes = await prisma.category.create({
    data: { name: "Fruits & Légumes", icon: "Apple" },
  });
  const viandesPoissons = await prisma.category.create({
    data: { name: "Viandes & Poissons", icon: "Beef" },
  });
  const produitsLaitiers = await prisma.category.create({
    data: { name: "Produits Laitiers", icon: "Milk" },
  });
  const boissons = await prisma.category.create({
    data: { name: "Boissons", icon: "Wine" },
  });
  const epicerie = await prisma.category.create({
    data: { name: "Épicerie", icon: "ShoppingBasket" },
  });
  const boulangerie = await prisma.category.create({
    data: { name: "Boulangerie", icon: "Croissant" },
  });
  console.log("✅ Created 6 categories");

  // Create Supermarkets
  const auchanCocody = await prisma.supermarket.create({
    data: {
      name: "Auchan Cocody",
      description: "Grand supermarché au cœur de Cocody avec une large sélection de produits locaux et importés.",
      address: "Boulevard de France, Cocody",
      commune: "Cocody",
      latitude: 5.3600,
      longitude: -3.9400,
      phone: "+225 27 22 44 55 66",
      isOpen: true,
      rating: 4.5,
      ownerId: ownerUser1.id,
    },
  });

  const carrefourMarcory = await prisma.supermarket.create({
    data: {
      name: "Carrefour Marcory",
      description: "Carrefour Market avec des produits frais et un rayon boulangerie artisanale.",
      address: "Rue du Commerce, Marcory",
      commune: "Marcory",
      latitude: 5.3000,
      longitude: -3.9700,
      phone: "+225 27 21 33 44 55",
      isOpen: true,
      rating: 4.2,
      ownerId: ownerUser2.id,
    },
  });

  const supermarcheAbobo = await prisma.supermarket.create({
    data: {
      name: "Supermarché Abobo",
      description: "Supermarché de quartier avec des prix compétitifs et des produits locaux.",
      address: "Carrefour Abobo, Abobo",
      commune: "Abobo",
      latitude: 5.4200,
      longitude: -4.0200,
      phone: "+225 27 20 11 22 33",
      isOpen: true,
      rating: 3.8,
      ownerId: ownerUser3.id,
    },
  });

  const leaderPriceYopougon = await prisma.supermarket.create({
    data: {
      name: "Leader Price Yopougon",
      description: "Leader Price avec des produits de qualité à petits prix dans le quartier de Yopougon.",
      address: "Boulevard de Yopougon, Yopougon",
      commune: "Yopougon",
      latitude: 5.3300,
      longitude: -4.0800,
      phone: "+225 27 20 55 66 77",
      isOpen: true,
      rating: 4.0,
      ownerId: ownerUser4.id,
    },
  });
  console.log("✅ Created 4 supermarkets");

  // Create Products
  const products = [
    // Fruits & Légumes
    { name: "Bananes plantains", description: "Bananes plantains fraîches, idéales pour l'alloco ou le foutou", price: 750, comparePrice: 900, unit: "kg", supermarketId: auchanCocody.id, categoryId: fruitsLegumes.id, inStock: true },
    { name: "Mangues Kent", description: "Mangues Kent juteuses et sucrées, de saison", price: 1200, unit: "kg", supermarketId: carrefourMarcory.id, categoryId: fruitsLegumes.id, inStock: true },
    { name: "Tomates fraîches", description: "Tomates mûres parfaites pour les sauces", price: 500, comparePrice: 650, unit: "kg", supermarketId: supermarcheAbobo.id, categoryId: fruitsLegumes.id, inStock: true },
    { name: "Ignames", description: "Ignames de qualité, idéales pour le foutou", price: 800, unit: "kg", supermarketId: leaderPriceYopougon.id, categoryId: fruitsLegumes.id, inStock: true },

    // Viandes & Poissons
    { name: "Poulet fermier entier", description: "Poulet fermier élevé en plein air, prêt à cuire", price: 4500, comparePrice: 5000, unit: "unité", supermarketId: auchanCocody.id, categoryId: viandesPoissons.id, inStock: true },
    { name: "Thon frais", description: "Filet de thon frais pêché localement", price: 6000, unit: "kg", supermarketId: carrefourMarcory.id, categoryId: viandesPoissons.id, inStock: true },
    { name: "Viande de bœuf hachée", description: "Bœuf haché frais, 500g", price: 3500, unit: "unité", supermarketId: supermarcheAbobo.id, categoryId: viandesPoissons.id, inStock: true },

    // Produits Laitiers
    { name: "Lait Nido", description: "Lait en poudre Nido, 400g", price: 2800, comparePrice: 3200, unit: "unité", supermarketId: auchanCocody.id, categoryId: produitsLaitiers.id, inStock: true },
    { name: "Yaourt Faci", description: "Yaourt nature Faci, pack de 6", price: 1500, unit: "unité", supermarketId: carrefourMarcory.id, categoryId: produitsLaitiers.id, inStock: true },
    { name: "Fromage mozzarella", description: "Mozzarella râpée, 200g", price: 2200, unit: "unité", supermarketId: leaderPriceYopougon.id, categoryId: produitsLaitiers.id, inStock: true },

    // Boissons
    { name: "Jus de bissap", description: "Jus de bissap artisanal, 1L", price: 800, unit: "unité", supermarketId: supermarcheAbobo.id, categoryId: boissons.id, inStock: true },
    { name: "Eau minérale Olympe", description: "Eau minérale Olympe, pack de 6 bouteilles 1.5L", price: 2400, comparePrice: 2800, unit: "unité", supermarketId: auchanCocody.id, categoryId: boissons.id, inStock: true },
    { name: "Coca-Cola", description: "Coca-Cola, pack de 6 canettes 33cl", price: 3000, unit: "unité", supermarketId: carrefourMarcory.id, categoryId: boissons.id, inStock: true },
    { name: "Bière Flag", description: "Bière Flag, pack de 6 bouteilles 65cl", price: 4500, unit: "unité", supermarketId: leaderPriceYopougon.id, categoryId: boissons.id, inStock: true },

    // Épicerie
    { name: "Riz Uncle Ben's", description: "Riz long grain Uncle Ben's, 1kg", price: 1800, unit: "unité", supermarketId: auchanCocody.id, categoryId: epicerie.id, inStock: true },
    { name: "Huile de palme", description: "Huile de palme traditionnelle, 1L", price: 1500, comparePrice: 1800, unit: "unité", supermarketId: supermarcheAbobo.id, categoryId: epicerie.id, inStock: true },
    { name: "Cube Maggi", description: "Cubes Maggi assaisonnés, pack de 50", price: 2500, unit: "unité", supermarketId: carrefourMarcory.id, categoryId: epicerie.id, inStock: true },
    { name: "Spaghetti Barilla", description: "Spaghetti Barilla n°5, 500g", price: 1200, unit: "unité", supermarketId: leaderPriceYopougon.id, categoryId: epicerie.id, inStock: true },

    // Boulangerie
    { name: "Pain baguette", description: "Baguette traditionnelle fraîche", price: 200, unit: "unité", supermarketId: auchanCocody.id, categoryId: boulangerie.id, inStock: true },
    { name: "Croissants beurre", description: "Croissants au beurre, pack de 4", price: 1500, unit: "unité", supermarketId: carrefourMarcory.id, categoryId: boulangerie.id, inStock: true },
    { name: "Pain de mie", description: "Pain de mie tranché, 500g", price: 1100, comparePrice: 1300, unit: "unité", supermarketId: leaderPriceYopougon.id, categoryId: boulangerie.id, inStock: true },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ Created ${products.length} products`);

  // Create a cart for the client user
  await prisma.cart.create({
    data: {
      userId: clientUser.id,
    },
  });
  console.log("✅ Created cart for client user");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("📧 Test accounts:");
  console.log("   Client:     amadou@test.com / password123");
  console.log("   Owner 1:    marie@test.com / password123");
  console.log("   Owner 2:    jean@test.com / password123");
  console.log("   Owner 3:    aicha@test.com / password123");
  console.log("   Owner 4:    kouassi@test.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
