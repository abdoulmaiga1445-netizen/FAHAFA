'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import HorairesEditor from '@/components/supermarche/HorairesEditor';
import type { WeekSchedule, DaySchedule } from '@/lib/horaires';
import { toast } from 'sonner';
import {
  Store,
  MapPin,
  Truck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const OnboardingMap = dynamic(() => import('@/components/maps/SupermarcheMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-sm text-muted-foreground">Chargement de la carte...</span>
    </div>
  ),
});

const COMMUNES = ['Cocody', 'Plateau', 'Adjamé', 'Marcory', 'Yopougon', 'Abobo', 'Treichville'];

const MOYENS_PAIEMENT_OPTIONS = [
  { id: 'orange_money', label: 'Orange Money', value: 'Orange Money' },
  { id: 'mtn_money', label: 'MTN Money', value: 'MTN Money' },
  { id: 'wave', label: 'Wave', value: 'Wave' },
  { id: 'carte_bancaire', label: 'Carte bancaire', value: 'Carte bancaire' },
  { id: 'cash', label: 'Cash / Espèces', value: 'Espèces' },
];

const DEFAULT_HORAIRES: WeekSchedule = {
  lundi: { open: '08:00', close: '20:00', closed: false },
  mardi: { open: '08:00', close: '20:00', closed: false },
  mercredi: { open: '08:00', close: '20:00', closed: false },
  jeudi: { open: '08:00', close: '20:00', closed: false },
  vendredi: { open: '08:00', close: '20:00', closed: false },
  samedi: { open: '08:00', close: '21:00', closed: false },
  dimanche: { open: '09:00', close: '13:00', closed: false },
};

const STEPS = [
  { number: 1, title: 'Infos générales', icon: Store },
  { number: 2, title: 'Localisation & livraison', icon: MapPin },
  { number: 3, title: 'Horaires d\'ouverture', icon: Clock },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Infos générales
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commune, setCommune] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 — Localisation & livraison
  const [latitude, setLatitude] = useState(5.36);
  const [longitude, setLongitude] = useState(-4.0083);
  const [fraisLivraison, setFraisLivraison] = useState('1000');
  const [livraisonGratuiteDes, setLivraisonGratuiteDes] = useState('25000');
  const [rayonLivraisonKm, setRayonLivraisonKm] = useState('10');
  const [moyensPaiement, setMoyensPaiement] = useState<string[]>(['Espèces', 'Orange Money', 'Wave']);

  // Step 3 — Horaires
  const [horaires, setHoraires] = useState<WeekSchedule>(DEFAULT_HORAIRES);

  // Validate current step
  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!name.trim()) { toast.error('Le nom du magasin est obligatoire'); return false; }
      if (!commune) { toast.error('Veuillez sélectionner une commune'); return false; }
      if (!adresse.trim()) { toast.error('L\'adresse est obligatoire'); return false; }
      return true;
    }
    if (s === 2) {
      if (!fraisLivraison || parseFloat(fraisLivraison) < 0) { toast.error('Les frais de livraison doivent être positifs'); return false; }
      if (moyensPaiement.length === 0) { toast.error('Sélectionnez au moins un moyen de paiement'); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(Math.min(step + 1, 3));
    }
  };

  const handlePrev = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Vous devez être connecté');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/supermarche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          adresse,
          commune,
          latitude,
          longitude,
          telephone,
          email,
          fraisLivraison: parseFloat(fraisLivraison),
          livraisonGratuiteDes: parseFloat(livraisonGratuiteDes),
          rayonLivraisonKm: parseFloat(rayonLivraisonKm),
          moyensPaiement,
          horaires,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      toast.success('Supermarché créé avec succès !');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle moyen de paiement
  const togglePaiement = (value: string) => {
    setMoyensPaiement((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  // Map marker for current position
  const mapMarkers = latitude && longitude ? [{
    id: 'new',
    name: name || 'Nouveau magasin',
    slug: '',
    commune: commune || '',
    latitude,
    longitude,
    estOuvert: true,
    distance: null,
  }] : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#D8F3DC] flex items-center justify-center mx-auto mb-4">
              <Store className="size-8 text-[#1B4332]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B4332]">Inscrire mon supermarché</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complétez les 3 étapes pour mettre votre magasin en ligne sur FAHAFA Market
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s) => {
                const StepIcon = s.icon;
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                return (
                  <div key={s.number} className="flex items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        isCompleted
                          ? 'bg-[#1B4332] text-white'
                          : isActive
                            ? 'bg-[#40916C] text-white'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="size-4" /> : <StepIcon className="size-4" />}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isActive ? 'text-[#1B4332]' : isCompleted ? 'text-[#40916C]' : 'text-muted-foreground'
                      }`}
                    >
                      {s.title}
                    </span>
                    {s.number < 3 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-2 ${step > s.number ? 'bg-[#1B4332]' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-[#1B4332] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <Card className="border-border/60">
            <CardContent className="p-6">

              {/* ── ÉTAPE 1 : Infos générales ──────────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Store className="size-5 text-[#1B4332]" />
                    Informations générales
                  </h2>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du magasin *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Auchan Cocody"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Décrivez votre supermarché en quelques mots..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="commune">Commune *</Label>
                      <Select value={commune} onValueChange={setCommune}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMUNES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adresse">Adresse *</Label>
                      <Input
                        id="adresse"
                        placeholder="Boulevard de France, Cocody"
                        value={adresse}
                        onChange={(e) => setAdresse(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        placeholder="+225 27 XX XX XX XX"
                        value={telephone}
                        onChange={(e) => setTelephone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@magasin.ci"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 2 : Localisation & livraison ────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="size-5 text-[#1B4332]" />
                    Localisation & livraison
                  </h2>

                  {/* Map for selecting location */}
                  <div className="space-y-2">
                    <Label>Cliquez sur la carte pour définir l&apos;emplacement</Label>
                    <div className="h-[300px] rounded-lg overflow-hidden border border-border/40">
                      <OnboardingMap
                        supermarkets={mapMarkers}
                        center={[latitude, longitude]}
                        zoom={13}
                        showLocateButton={true}
                        onLocateMe={() => {
                          navigator.geolocation?.getCurrentPosition((pos) => {
                            setLatitude(pos.coords.latitude);
                            setLongitude(pos.coords.longitude);
                          });
                        }}
                      />
                    </div>
                    {/* Clickable overlay to capture clicks */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Latitude</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 5.36)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Longitude</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || -4.0)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery settings */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="size-4 text-[#1B4332]" />
                      Paramètres de livraison
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Frais de livraison (FCFA)</Label>
                        <Input
                          type="number"
                          value={fraisLivraison}
                          onChange={(e) => setFraisLivraison(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Gratuit à partir de (FCFA)</Label>
                        <Input
                          type="number"
                          value={livraisonGratuiteDes}
                          onChange={(e) => setLivraisonGratuiteDes(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Rayon de livraison (km)</Label>
                        <Input
                          type="number"
                          value={rayonLivraisonKm}
                          onChange={(e) => setRayonLivraisonKm(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment methods */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-semibold">Moyens de paiement acceptés</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {MOYENS_PAIEMENT_OPTIONS.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            moyensPaiement.includes(option.value)
                              ? 'border-[#1B4332] bg-[#D8F3DC]/50'
                              : 'border-border/60 hover:border-border'
                          }`}
                        >
                          <Checkbox
                            checked={moyensPaiement.includes(option.value)}
                            onCheckedChange={() => togglePaiement(option.value)}
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 3 : Horaires d'ouverture ─────────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="size-5 text-[#1B4332]" />
                    Horaires d&apos;ouverture
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Définissez les horaires d&apos;ouverture de votre supermarché pour chaque jour de la semaine.
                    Les clients verront si vous êtes ouvert en temps réel.
                  </p>

                  <HorairesEditor value={horaires} onChange={setHoraires} />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/40">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Précédent
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-[#1B4332] hover:bg-[#40916C] gap-1"
                  >
                    Suivant
                    <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#1B4332] hover:bg-[#40916C] gap-2 min-w-[180px]"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {submitting ? 'Création en cours...' : 'Créer mon supermarché'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
