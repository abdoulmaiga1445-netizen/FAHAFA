'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Plus,
  X,
  Loader2,
  ArrowLeft,
  Save,
  Camera,
  Package,
  Tag,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const UNITES = [
  { value: 'unité', label: 'Pièce' },
  { value: 'kg', label: 'Kilogramme (kg)' },
  { value: 'g', label: 'Gramme (g)' },
  { value: 'L', label: 'Litre (L)' },
  { value: 'mL', label: 'Millilitre (mL)' },
  { value: 'pack', label: 'Pack' },
];

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function NouveauProduitPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Formulaire
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [prixPromo, setPrixPromo] = useState('');
  const [stock, setStock] = useState('');
  const [unite, setUnite] = useState('unité');
  const [categorieId, setCategorieId] = useState('');
  const [codeBarres, setCodeBarres] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Nouvelle catégorie
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

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
    fetchCategories();
  }, [fetchCategories]);

  // Image upload handler (base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images autorisées');
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, base64];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Create new category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: newCategoryName, icone: newCategoryIcon }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      toast.success('Catégorie créée avec succès');
      setCategorieId(data.category.id);
      setShowNewCategory(false);
      setNewCategoryName('');
      setNewCategoryIcon('');
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Validation
  const validate = (): boolean => {
    if (!nom.trim()) { toast.error('Le nom du produit est obligatoire'); return false; }
    if (!prix || parseFloat(prix) <= 0) { toast.error('Le prix doit être supérieur à 0'); return false; }
    if (prixPromo && parseFloat(prixPromo) <= 0) { toast.error('Le prix promotionnel doit être supérieur à 0'); return false; }
    if (prixPromo && parseFloat(prixPromo) >= parseFloat(prix)) { toast.error('Le prix promotionnel doit être inférieur au prix normal'); return false; }
    if (stock === '' || parseInt(stock) < 0) { toast.error('Le stock doit être positif ou nul'); return false; }
    if (!categorieId) { toast.error('La catégorie est obligatoire'); return false; }
    return true;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/produits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom,
          description,
          prix: parseFloat(prix),
          prixPromo: prixPromo ? parseFloat(prixPromo) : null,
          stock: parseInt(stock),
          unite,
          categorieId,
          images,
          codeBarres,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      toast.success('Produit créé avec succès !');
      router.push('/dashboard/produits');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/dashboard/produits">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Produits
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-[#1B4332]">Nouveau</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard/produits">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#1B4332]">Ajouter un produit</h1>
              <p className="text-sm text-muted-foreground">
                Remplissez les informations ci-dessous pour ajouter un nouveau produit
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-6">
                {/* Images */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Camera className="size-4 text-[#1B4332]" />
                    Photos du produit (max 5)
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border/60">
                        <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-[#1B4332] text-white py-0.5 font-medium">
                            Principale
                          </span>
                        )}
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-[#1B4332]/40 hover:bg-[#D8F3DC]/30 transition-all">
                        <Plus className="size-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground mt-0.5">Ajouter</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    La première image sera utilisée comme image principale
                  </p>
                </div>

                <Separator />

                {/* Informations générales */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Package className="size-4 text-[#1B4332]" />
                    Informations générales
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom du produit *</Label>
                    <Input
                      id="nom"
                      placeholder="Ex: Riz parfumé 5kg"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre produit..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prix">Prix (FCFA) *</Label>
                      <Input
                        id="prix"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="2500"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prixPromo">Prix promotionnel (FCFA)</Label>
                      <Input
                        id="prixPromo"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Optionnel"
                        value={prixPromo}
                        onChange={(e) => setPrixPromo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="100"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unite">Unité</Label>
                      <Select value={unite} onValueChange={setUnite}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITES.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Catégorie */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="size-4 text-[#1B4332]" />
                    Catégorie
                  </h3>

                  {!showNewCategory ? (
                    <div className="space-y-2">
                      <Label htmlFor="categorie">Catégorie *</Label>
                      <div className="flex gap-2">
                        <Select value={categorieId} onValueChange={setCategorieId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-10"
                          onClick={() => setShowNewCategory(true)}
                        >
                          <Plus className="size-4" />
                          Nouvelle
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card className="border-[#1B4332]/30 bg-[#D8F3DC]/20">
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm font-medium text-[#1B4332]">Créer une nouvelle catégorie</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nom *</Label>
                            <Input
                              placeholder="Ex: Boissons"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Icône</Label>
                            <Input
                              placeholder="cup"
                              value={newCategoryIcon}
                              onChange={(e) => setNewCategoryIcon(e.target.value)}
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-[#1B4332] hover:bg-[#40916C] gap-1.5"
                            onClick={handleCreateCategory}
                            disabled={creatingCategory}
                          >
                            {creatingCategory ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                            Créer
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowNewCategory(false);
                              setNewCategoryName('');
                              setNewCategoryIcon('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Separator />

                {/* Code-barres */}
                <div className="space-y-2">
                  <Label htmlFor="codeBarres">Code-barres (optionnel)</Label>
                  <Input
                    id="codeBarres"
                    placeholder="Ex: 3760000000000"
                    value={codeBarres}
                    onChange={(e) => setCodeBarres(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-between mt-6">
              <Link href="/dashboard/produits">
                <Button type="button" variant="outline" className="gap-1.5">
                  <ArrowLeft className="size-4" />
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#1B4332] hover:bg-[#40916C] gap-2 min-w-[180px]"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {submitting ? 'Création...' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
