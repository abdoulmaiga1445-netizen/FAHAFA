'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Truck,
  Star,
  CreditCard,
  Search,
  Plus,
  ShoppingCart,
  Check,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { estOuvertMaintenant, getHorairesAujourdhui, getHorairesSemaine } from '@/lib/horaires';
import { formatDistance } from '@/lib/geo';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const SupermarcheDetailMap = dynamic(() => import('@/components/maps/SupermarcheMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[200px] w-full bg-muted animate-pulse rounded-lg" />
  ),
});

interface SupermarketDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  address: string;
  commune: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  isOpen: boolean;
  rating: number;
  horaires: string;
  fraisLivraison: number;
  livraisonDisponible: boolean;
  moyensPaiement: string;
  nbProduits: number;
  estOuvert: boolean;
  distance: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  image: string | null;
  unit: string;
  inStock: boolean;
  categoryId: string;
  category: { id: string; name: string; icon: string | null };
  supermarket: { id: string; name: string; commune: string; isOpen: boolean };
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

export default function SupermarcheDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToCart, cartItems } = useAppStore();

  const [supermarket, setSupermarket] = useState<SupermarketDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Fetch supermarket detail
  const fetchSupermarket = useCallback(async () => {
    try {
      const response = await fetch(`/api/supermarkets?slug=${slug}`);
      if (response.ok) {
        const data = await response.json();
        const sm = data.supermarkets?.[0];
        if (sm) {
          setSupermarket({
            ...sm,
            estOuvert: estOuvertMaintenant(sm.horaires),
            nbProduits: sm.productCount || 0,
            distance: null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching supermarket:', error);
    }
  }, [slug]);

  // Fetch products for this supermarket
  const fetchProducts = useCallback(async () => {
    if (!supermarket) return;
    try {
      const params = new URLSearchParams();
      params.set('supermarketId', supermarket.id);
      if (productSearch) params.set('search', productSearch);
      if (selectedCategory && selectedCategory !== '__all__') params.set('categoryId', selectedCategory);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, [supermarket, productSearch, selectedCategory]);

  // Fetch categories
  const fetchCategories = useCallback(async (smId?: string) => {
    try {
      const url = smId ? `/api/categories?supermarketId=${smId}` : '/api/categories';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Load supermarket first, then its categories
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      await fetchSupermarket();
      setLoading(false);
    };
    loadInitial();
  }, [fetchSupermarket]);

  // When supermarket is loaded, fetch its categories
  useEffect(() => {
    if (supermarket) {
      fetchCategories(supermarket.id);
    }
  }, [supermarket, fetchCategories]);

  useEffect(() => {
    if (supermarket) {
      fetchProducts();
    }
  }, [supermarket, fetchProducts]);

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    if (!supermarket) return;
    setAddingProductId(product.id);
    addToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      supermarketName: supermarket.name,
      supermarketId: supermarket.id,
    });
    toast.success(`${product.name} ajouté au panier`);
    setTimeout(() => setAddingProductId(null), 600);
  };

  // Check if product is in cart
  const isInCart = (productId: string) => cartItems.some((item) => item.productId === productId);

  // Horaires de la semaine
  const horairesSemaine = supermarket ? getHorairesSemaine(supermarket.horaires) : [];
  const moyensPaiement = supermarket ? JSON.parse(supermarket.moyensPaiement || '[]') as string[] : [];

  // Map markers
  const mapMarkers = supermarket
    ? [
        {
          id: supermarket.id,
          name: supermarket.name,
          slug: supermarket.slug,
          commune: supermarket.commune,
          latitude: supermarket.latitude,
          longitude: supermarket.longitude,
          estOuvert: supermarket.estOuvert,
          distance: supermarket.distance,
        },
      ]
    : [];

  // Filtered categories (only those with products)
  const activeCategories = categories.filter((cat) =>
    products.some((p) => p.categoryId === cat.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!supermarket) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Supermarché non trouvé</h2>
            <p className="text-muted-foreground mb-4">Ce supermarché n&apos;existe pas ou a été supprimé.</p>
            <Link href="/decouverte">
              <Button className="bg-[#1B4332] hover:bg-[#40916C]">
                <ArrowLeft className="size-4 mr-2" />
                Retour à la découverte
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-[#1B4332] text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Retour
            </button>

            <div className="flex gap-4 items-start">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/20">
                {supermarket.logo ? (
                  <img src={supermarket.logo} alt={supermarket.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {supermarket.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold">{supermarket.name}</h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <MapPin className="size-3.5" />
                        <span>{supermarket.commune}</span>
                      </div>
                      {supermarket.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="size-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="font-medium">{supermarket.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Badge
                        className={`text-[10px] px-1.5 py-0 h-5 font-semibold ${
                          supermarket.estOuvert
                            ? 'bg-green-500/20 text-green-200 hover:bg-green-500/20'
                            : 'bg-red-500/20 text-red-200 hover:bg-red-500/20'
                        }`}
                      >
                        {supermarket.estOuvert ? 'OUVERT' : 'FERMÉ'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Hours today */}
                <div className="flex items-center gap-4 mt-3 text-sm text-white/80 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>{getHorairesAujourdhui(supermarket.horaires)}</span>
                  </div>
                  {supermarket.livraisonDisponible && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="size-3.5" />
                      <span>Livraison {formatPrice(supermarket.fraisLivraison)}</span>
                    </div>
                  )}
                  {supermarket.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      <span>{supermarket.phone}</span>
                    </div>
                  )}
                </div>

                {supermarket.description && (
                  <p className="mt-2 text-sm text-white/70 line-clamp-2">
                    {supermarket.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Tabs defaultValue="produits" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 h-10">
              <TabsTrigger value="produits" className="text-sm">
                Produits ({products.length})
              </TabsTrigger>
              <TabsTrigger value="infos" className="text-sm">
                Infos & livraison
              </TabsTrigger>
            </TabsList>

            {/* Products tab */}
            <TabsContent value="produits" className="mt-4">
              {/* Search & Category filter */}
              <div className="flex gap-2 mb-4 flex-col sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9 w-full sm:w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Toutes les catégories</SelectItem>
                    {activeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product grid */}
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Aucun produit trouvé</h3>
                  <p className="text-xs text-muted-foreground">
                    Essayez de modifier votre recherche ou votre filtre.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((product) => {
                    const inCart = isInCart(product.id);
                    const isAdding = addingProductId === product.id;

                    return (
                      <Card
                        key={product.id}
                        className="group hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden"
                      >
                        <CardContent className="p-0">
                          {/* Product image */}
                          <div className="aspect-square bg-gradient-to-br from-[#D8F3DC] to-[#B7E4C7] flex items-center justify-center relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl font-bold text-[#1B4332]/20">
                                {product.name.charAt(0)}
                              </span>
                            )}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">Rupture</span>
                              </div>
                            )}
                            {product.comparePrice && (
                              <Badge className="absolute top-1.5 left-1.5 bg-[#DC2626] text-white text-[10px] h-5 px-1.5">
                                Promo
                              </Badge>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="p-3">
                            <h3 className="font-medium text-xs leading-tight line-clamp-2 min-h-[2rem]">
                              {product.name}
                            </h3>
                            <div className="mt-1.5 flex items-baseline gap-1.5">
                              <span className="font-bold text-sm text-[#1B4332]">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">/{product.unit}</span>
                            </div>
                            {product.comparePrice && (
                              <span className="text-[10px] text-muted-foreground line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}

                            {/* Add to cart button */}
                            <Button
                              size="sm"
                              className={`w-full mt-2 h-7 text-xs transition-all ${
                                inCart
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : isAdding
                                    ? 'bg-green-500 text-white hover:bg-green-500'
                                    : 'bg-[#1B4332] hover:bg-[#40916C] text-white'
                              }`}
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.inStock || isAdding}
                            >
                              {!product.inStock ? (
                                'Rupture'
                              ) : inCart ? (
                                <>
                                  <Check className="size-3 mr-1" />
                                  Dans le panier
                                </>
                              ) : isAdding ? (
                                <>
                                  <Check className="size-3 mr-1" />
                                  Ajouté !
                                </>
                              ) : (
                                <>
                                  <Plus className="size-3 mr-1" />
                                  Panier
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Info & delivery tab */}
            <TabsContent value="infos" className="mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Address & Contact */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <MapPin className="size-4 text-[#1B4332]" />
                        Adresse & Contact
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">{supermarket.address}</p>
                        <p className="text-muted-foreground">{supermarket.commune}, Abidjan</p>
                        {supermarket.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="size-3.5 text-muted-foreground" />
                            <a href={`tel:${supermarket.phone}`} className="text-[#40916C] hover:underline">
                              {supermarket.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Opening hours */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Clock className="size-4 text-[#1B4332]" />
                        Horaires d&apos;ouverture
                      </h3>
                      <div className="space-y-1.5">
                        {horairesSemaine.map((h) => (
                          <div
                            key={h.jour}
                            className="flex justify-between items-center text-sm py-1 border-b border-border/20 last:border-0"
                          >
                            <span className="font-medium">{h.jour}</span>
                            <span
                              className={`${
                                h.horaire === 'Fermé'
                                  ? 'text-[#DC2626] font-medium'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {h.horaire}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment methods */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <CreditCard className="size-4 text-[#1B4332]" />
                        Moyens de paiement
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {moyensPaiement.map((m: string) => (
                          <Badge
                            key={m}
                            variant="secondary"
                            className="text-xs bg-[#D8F3DC] text-[#1B4332] hover:bg-[#D8F3DC]"
                          >
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right column - Map */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <MapPin className="size-4 text-[#1B4332]" />
                        Localisation
                      </h3>
                      <div className="h-[200px] rounded-lg overflow-hidden">
                        <SupermarcheDetailMap
                          supermarkets={mapMarkers}
                          center={[supermarket.latitude, supermarket.longitude]}
                          zoom={15}
                          showLocateButton={false}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery info */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Truck className="size-4 text-[#1B4332]" />
                        Livraison
                      </h3>
                      {supermarket.livraisonDisponible ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Check className="size-4 text-green-600" />
                            <span>Livraison disponible</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground">Frais de livraison</span>
                            <span className="font-semibold text-[#1B4332]">
                              {formatPrice(supermarket.fraisLivraison)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Livraison dans la commune de {supermarket.commune} et environs.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <X className="size-4 text-[#DC2626]" />
                          <span>Livraison non disponible</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
