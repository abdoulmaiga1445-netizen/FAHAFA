'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePanier } from '@/hooks/usePanier';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Store,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  Smartphone,
  Banknote,
  Package,
  CheckCircle2,
  ImageOff,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const COMMUNES = [
  'Cocody',
  'Plateau',
  'Adjamé',
  'Marcory',
  'Yopougon',
  'Abobo',
  'Treichville',
] as const;

const TYPES_COMMANDE = {
  LIVRAISON: 'LIVRAISON',
  CLICK_AND_COLLECT: 'CLICK_AND_COLLECT',
} as const;

const METHODES_PAIEMENT = [
  {
    value: 'ORANGE_MONEY',
    label: 'Orange Money',
    description: 'Paiement mobile Orange',
    phone: '07 XX XX XX XX',
    color: '#FF6600',
    icon: Smartphone,
  },
  {
    value: 'MTN_MONEY',
    label: 'MTN Mobile Money',
    description: 'Paiement mobile MTN',
    phone: '05 XX XX XX XX',
    color: '#FFCC00',
    icon: Smartphone,
  },
  {
    value: 'WAVE',
    label: 'Wave',
    description: 'Paiement mobile Wave',
    phone: '',
    color: '#1DC7EA',
    icon: Smartphone,
  },
  {
    value: 'CASH',
    label: 'Cash à la livraison',
    description: 'Payer en espèces à la réception',
    phone: '',
    color: '#22C55E',
    icon: Banknote,
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { panier, loading: panierLoading } = usePanier();

  // Form state
  const [typeCommande, setTypeCommande] = useState<string>(TYPES_COMMANDE.LIVRAISON);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [communeLivraison, setCommuneLivraison] = useState('');
  const [instructionsLivraison, setInstructionsLivraison] = useState('');
  const [methodePaiement, setMethodePaiement] = useState<string>('ORANGE_MONEY');
  const [submitting, setSubmitting] = useState(false);

  // Redirects
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      toast.error('Veuillez vous connecter pour passer commande');
      router.push('/?view=login');
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!panierLoading && panier && panier.items.length === 0) {
      toast.error('Votre panier est vide');
      router.push('/panier');
    }
  }, [panierLoading, panier, router]);

  // Computed delivery fee
  const fraisLivraison = (() => {
    if (typeCommande === TYPES_COMMANDE.CLICK_AND_COLLECT) return 0;
    if (!panier?.supermarket) return 0;
    const sm = panier.supermarket;
    if (sm.livraisonGratuiteDes > 0 && panier.sousTotal >= sm.livraisonGratuiteDes) return 0;
    return sm.fraisLivraison;
  })();

  const totalCalc = (panier?.sousTotal ?? 0) + fraisLivraison;

  // Validate form
  const isFormValid = (() => {
    if (!methodePaiement) return false;
    if (typeCommande === TYPES_COMMANDE.LIVRAISON) {
      if (!adresseLivraison.trim()) return false;
      if (!communeLivraison) return false;
    }
    return true;
  })();

  // Submit
  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        typeCommande,
        methodePaiement,
        notesClient: instructionsLivraison.trim(),
      };

      if (typeCommande === TYPES_COMMANDE.LIVRAISON) {
        body.adresseLivraison = adresseLivraison.trim();
        body.communeLivraison = communeLivraison;
      } else {
        body.adresseLivraison = '';
        body.communeLivraison = '';
      }

      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la création de la commande');
        return;
      }

      // Success — redirect to confirmation page
      router.push(`/commandes/${data.order.id}/confirmation`);
    } catch {
      toast.error('Erreur réseau. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────

  if (sessionStatus === 'loading' || panierLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-[#1B4332]" />
            <p className="text-sm text-muted-foreground">Chargement du checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If not authenticated or empty panier, the useEffect will redirect.
  // Show nothing in the meantime to avoid flash.
  if (!session?.user || !panier || panier.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#1B4332]" />
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-[#1B4332] text-white">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-3 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Retour au panier
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingBag className="size-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Finaliser la commande</h1>
                <p className="text-sm text-white/70 mt-0.5">
                  {panier.items.length} article{panier.items.length > 1 ? 's' : ''} •{' '}
                  {panier.supermarket?.name ?? 'Supermarché'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column — Form sections */}
            <div className="lg:col-span-2 space-y-6">

              {/* ─── Step 1: Type de commande ──────────────────────────────── */}
              <Card className="overflow-hidden">
                <div className="bg-[#1B4332]/5 px-5 py-3 flex items-center gap-3 border-b">
                  <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h2 className="font-semibold text-[#1B4332]">Type de commande</h2>
                </div>
                <CardContent className="p-5">
                  <RadioGroup
                    value={typeCommande}
                    onValueChange={setTypeCommande}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    {/* Livraison */}
                    <Label
                      htmlFor="type-livraison"
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        typeCommande === TYPES_COMMANDE.LIVRAISON
                          ? 'border-[#1B4332] bg-[#D8F3DC]/40'
                          : 'border-border hover:border-[#40916C]/40'
                      }`}
                    >
                      <RadioGroupItem
                        value={TYPES_COMMANDE.LIVRAISON}
                        id="type-livraison"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            typeCommande === TYPES_COMMANDE.LIVRAISON
                              ? 'bg-[#1B4332] text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Truck className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Livraison à domicile</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Livré à votre adresse
                          </p>
                        </div>
                      </div>
                    </Label>

                    {/* Click & Collect */}
                    <Label
                      htmlFor="type-click-collect"
                      className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        typeCommande === TYPES_COMMANDE.CLICK_AND_COLLECT
                          ? 'border-[#1B4332] bg-[#D8F3DC]/40'
                          : 'border-border hover:border-[#40916C]/40'
                      }`}
                    >
                      <RadioGroupItem
                        value={TYPES_COMMANDE.CLICK_AND_COLLECT}
                        id="type-click-collect"
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            typeCommande === TYPES_COMMANDE.CLICK_AND_COLLECT
                              ? 'bg-[#1B4332] text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Store className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Click & Collect</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Retirer en magasin
                          </p>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>

                  {/* Livraison fields */}
                  {typeCommande === TYPES_COMMANDE.LIVRAISON && (
                    <div className="mt-5 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="adresse" className="text-sm font-medium">
                          Adresse de livraison <span className="text-[#DC2626]">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="adresse"
                            placeholder="Ex: Riviera 3, près de la pharmacie..."
                            value={adresseLivraison}
                            onChange={(e) => setAdresseLivraison(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commune" className="text-sm font-medium">
                          Commune <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Select value={communeLivraison} onValueChange={setCommuneLivraison}>
                          <SelectTrigger className="w-full" id="commune">
                            <SelectValue placeholder="Sélectionnez votre commune" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMUNES.map((commune) => (
                              <SelectItem key={commune} value={commune}>
                                {commune}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instructions" className="text-sm font-medium">
                          Instructions de livraison{' '}
                          <span className="text-muted-foreground font-normal">(optionnel)</span>
                        </Label>
                        <Textarea
                          id="instructions"
                          placeholder="Ex: 2e étage, porte gauche. Sonner à M. Koné..."
                          value={instructionsLivraison}
                          onChange={(e) => setInstructionsLivraison(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      {/* Free delivery info */}
                      {panier.supermarket &&
                        panier.supermarket.livraisonGratuiteDes > 0 &&
                        panier.sousTotal < panier.supermarket.livraisonGratuiteDes && (
                          <div className="bg-[#D8F3DC]/50 rounded-lg p-3 text-sm">
                            <p className="text-[#1B4332]">
                              <span className="font-medium">Livraison gratuite</span> à partir de{' '}
                              {formatPrice(panier.supermarket.livraisonGratuiteDes)}. Il vous
                              manque{' '}
                              <span className="font-semibold">
                                {formatPrice(panier.supermarket.livraisonGratuiteDes - panier.sousTotal)}
                              </span>
                              .
                            </p>
                          </div>
                        )}

                      {panier.supermarket &&
                        panier.supermarket.livraisonGratuiteDes > 0 &&
                        panier.sousTotal >= panier.supermarket.livraisonGratuiteDes && (
                          <div className="bg-[#D8F3DC]/50 rounded-lg p-3 text-sm flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-[#1B4332] flex-shrink-0" />
                            <p className="text-[#1B4332]">
                              <span className="font-medium">Livraison gratuite !</span> Vous avez
                              atteint le montant minimum.
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Click & Collect info */}
                  {typeCommande === TYPES_COMMANDE.CLICK_AND_COLLECT && (
                    <div className="mt-5 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                      <Separator className="mb-4" />
                      <div className="bg-[#D8F3DC]/50 rounded-lg p-4 flex items-start gap-3">
                        <Store className="size-5 text-[#1B4332] flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-[#1B4332]">
                            Retrait en magasin — Aucun frais de livraison
                          </p>
                          <p className="text-[#1B4332]/70 mt-1">
                            Vous pourrez retirer votre commande à{' '}
                            <span className="font-medium">
                              {panier.supermarket?.name ?? 'votre supermarché'}
                            </span>
                            ,{' '}
                            {panier.supermarket?.commune
                              ? `${panier.supermarket.commune}, Abidjan`
                              : 'Abidjan'}
                            . Vous serez notifié lorsque votre commande sera prête.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Step 2: Moyen de paiement ─────────────────────────────── */}
              <Card className="overflow-hidden">
                <div className="bg-[#1B4332]/5 px-5 py-3 flex items-center gap-3 border-b">
                  <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h2 className="font-semibold text-[#1B4332]">Moyen de paiement</h2>
                </div>
                <CardContent className="p-5">
                  <RadioGroup
                    value={methodePaiement}
                    onValueChange={setMethodePaiement}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    {METHODES_PAIEMENT.map((method) => {
                      const Icon = method.icon;
                      const isSelected = methodePaiement === method.value;

                      return (
                        <Label
                          key={method.value}
                          htmlFor={`payment-${method.value}`}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#1B4332] bg-[#D8F3DC]/40'
                              : 'border-border hover:border-[#40916C]/40'
                          }`}
                        >
                          <RadioGroupItem
                            value={method.value}
                            id={`payment-${method.value}`}
                          />
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-[#1B4332] text-white'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Icon className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{method.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {method.description}
                              </p>
                              {method.phone && (
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-mono">
                                  {method.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>

                  {/* Payment notice for CASH */}
                  {methodePaiement === 'CASH' && typeCommande === TYPES_COMMANDE.CLICK_AND_COLLECT && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-start gap-2">
                      <Banknote className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-800">
                        Vous payerez en espèces lors du retrait en magasin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ─── Step 3: Récapitulatif (mobile only) ───────────────────── */}
              <div className="lg:hidden">
                <RecapSection
                  panier={panier}
                  fraisLivraison={fraisLivraison}
                  total={totalCalc}
                  typeCommande={typeCommande}
                  adresseLivraison={adresseLivraison}
                  communeLivraison={communeLivraison}
                  methodePaiement={methodePaiement}
                />
              </div>
            </div>

            {/* Right column — Order summary (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <RecapSection
                  panier={panier}
                  fraisLivraison={fraisLivraison}
                  total={totalCalc}
                  typeCommande={typeCommande}
                  adresseLivraison={adresseLivraison}
                  communeLivraison={communeLivraison}
                  methodePaiement={methodePaiement}
                />
              </div>
            </div>
          </div>

          {/* ─── Bottom action bar ────────────────────────────────────────── */}
          <div className="mt-8 border-t pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/panier')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="size-4 mr-2" />
                Retour au panier
              </Button>

              <Button
                size="lg"
                disabled={!isFormValid || submitting}
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-[#1B4332] hover:bg-[#40916C] text-white min-w-[240px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4 mr-2" />
                    Confirmer la commande — {formatPrice(totalCalc)}
                  </>
                )}
              </Button>
            </div>

            {!isFormValid && !submitting && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                {typeCommande === TYPES_COMMANDE.LIVRAISON && !adresseLivraison.trim()
                  ? 'Veuillez renseigner votre adresse de livraison'
                  : typeCommande === TYPES_COMMANDE.LIVRAISON && !communeLivraison
                    ? 'Veuillez sélectionner votre commune'
                    : 'Veuillez remplir tous les champs obligatoires'}
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// ─── Recap Section ────────────────────────────────────────────────────────────

interface RecapSectionProps {
  panier: NonNullable<ReturnType<typeof usePanier>['panier']>;
  fraisLivraison: number;
  total: number;
  typeCommande: string;
  adresseLivraison: string;
  communeLivraison: string;
  methodePaiement: string;
}

function RecapSection({
  panier,
  fraisLivraison,
  total,
  typeCommande,
  adresseLivraison,
  communeLivraison,
  methodePaiement,
}: RecapSectionProps) {
  const paymentLabel =
    METHODES_PAIEMENT.find((m) => m.value === methodePaiement)?.label ?? methodePaiement;

  return (
    <Card className="overflow-hidden">
      <div className="bg-[#1B4332]/5 px-5 py-3 flex items-center gap-3 border-b">
        <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-sm font-bold">
          3
        </div>
        <h2 className="font-semibold text-[#1B4332]">Récapitulatif</h2>
      </div>
      <CardContent className="p-5 space-y-4">
        {/* Supermarket info */}
        {panier.supermarket && (
          <div className="flex items-center gap-2 text-sm">
            <Store className="size-4 text-[#1B4332]" />
            <span className="font-medium">{panier.supermarket.name}</span>
            <Badge variant="secondary" className="text-[10px] bg-[#D8F3DC] text-[#1B4332]">
              {panier.supermarket.commune}
            </Badge>
          </div>
        )}

        {/* Delivery info summary */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          {typeCommande === TYPES_COMMANDE.LIVRAISON ? (
            <>
              <Truck className="size-4 mt-0.5 text-[#40916C]" />
              <div className="min-w-0">
                <p className="text-foreground font-medium">Livraison à domicile</p>
                {adresseLivraison && (
                  <p className="truncate">{adresseLivraison}</p>
                )}
                {communeLivraison && <p>{communeLivraison}, Abidjan</p>}
              </div>
            </>
          ) : (
            <>
              <Store className="size-4 mt-0.5 text-[#40916C]" />
              <div>
                <p className="text-foreground font-medium">Click & Collect</p>
                <p>Retrait en magasin</p>
              </div>
            </>
          )}
        </div>

        {/* Payment method summary */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="size-4 text-[#40916C]" />
          <p className="text-foreground font-medium">{paymentLabel}</p>
        </div>

        <Separator />

        {/* Product list */}
        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {panier.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {/* Product image */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D8F3DC] to-[#B7E4C7] flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="size-4 text-[#1B4332]/30" />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.product.price)} / {item.product.unit}
                </p>
              </div>

              {/* Quantity & line total */}
              <div className="text-right flex-shrink-0">
                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-muted">
                  x{item.quantity}
                </Badge>
                <p className="text-sm font-semibold text-[#1B4332] mt-1">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Price summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-medium">{formatPrice(panier.sousTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              {typeCommande === TYPES_COMMANDE.LIVRAISON
                ? 'Frais de livraison'
                : 'Frais de livraison'}
            </span>
            {fraisLivraison === 0 ? (
              <Badge className="bg-[#D8F3DC] text-[#1B4332] hover:bg-[#D8F3DC] text-xs">
                Gratuit
              </Badge>
            ) : (
              <span className="font-medium">{formatPrice(fraisLivraison)}</span>
            )}
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#1B4332]">Total</span>
            <span className="text-lg font-bold text-[#1B4332]">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Item count */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
          <Package className="size-3.5" />
          <span>
            {panier.items.length} article{panier.items.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
