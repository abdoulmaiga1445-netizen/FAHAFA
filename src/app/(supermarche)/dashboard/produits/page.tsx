'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ProduitCard from '@/components/supermarche/ProduitCard';
import {
  Search,
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Tag,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  unit: string;
  image: string | null;
  images: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
}

const ITEMS_PER_PAGE = 20;

export default function ProduitsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<string>('__all__');
  const [actifFilter, setActifFilter] = useState<string>('__all__');

  // Pagination
  const [page, setPage] = useState(1);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categorieFilter && categorieFilter !== '__all__') params.set('categorie', categorieFilter);
      if (actifFilter && actifFilter !== '__all__') params.set('estActif', actifFilter);

      const response = await fetch(`/api/produits?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching produits:', error);
    } finally {
      setLoading(false);
    }
  }, [search, categorieFilter, actifFilter]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, categorieFilter, actifFilter]);

  // Stats
  const totalProduits = products.length;
  const produitsActifs = products.filter((p) => p.isActive).length;
  const enRupture = products.filter((p) => p.stock === 0).length;
  const enPromo = products.filter((p) => p.comparePrice && p.comparePrice > p.price).length;

  // Pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Toggle product active
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/produits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? 'Produit désactivé' : 'Produit réactivé');
        fetchProducts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-[#1B4332]">Mes produits</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1B4332]">Mes produits</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Gérez le catalogue de votre supermarché
              </p>
            </div>
            <Link href="/dashboard/produits/nouveau">
              <Button className="bg-[#1B4332] hover:bg-[#40916C] gap-2">
                <Plus className="size-4" />
                Ajouter un produit
              </Button>
            </Link>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="size-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total produits</p>
                  <p className="text-lg font-bold text-foreground">{totalProduits}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="size-5 text-green-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                  <p className="text-lg font-bold text-foreground">{produitsActifs}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="size-5 text-red-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En rupture</p>
                  <p className="text-lg font-bold text-foreground">{enRupture}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Tag className="size-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">En promotion</p>
                  <p className="text-lg font-bold text-foreground">{enPromo}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[200px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={actifFilter} onValueChange={setActifFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous</SelectItem>
                <SelectItem value="true">Actifs</SelectItem>
                <SelectItem value="false">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="size-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Aucun produit trouvé</h3>
              <p className="text-sm text-muted-foreground max-w-[300px] mb-4">
                {search || categorieFilter !== '__all__' || actifFilter !== '__all__'
                  ? 'Essayez de modifier vos filtres pour trouver des produits.'
                  : 'Commencez par ajouter votre premier produit au catalogue.'}
              </p>
              {!search && categorieFilter === '__all__' && actifFilter === '__all__' && (
                <Link href="/dashboard/produits/nouveau">
                  <Button className="bg-[#1B4332] hover:bg-[#40916C] gap-2">
                    <Plus className="size-4" />
                    Ajouter un produit
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                  <ProduitCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    price={product.price}
                    comparePrice={product.comparePrice}
                    stock={product.stock}
                    unit={product.unit}
                    image={product.image}
                    images={product.images}
                    isActive={product.isActive}
                    category={product.category}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={`w-8 h-8 p-0 ${page === pageNum ? 'bg-[#1B4332] hover:bg-[#40916C]' : ''}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="gap-1"
                  >
                    Suivant
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
