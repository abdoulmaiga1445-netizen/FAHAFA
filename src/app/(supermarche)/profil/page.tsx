'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import HorairesEditor from '@/components/supermarche/HorairesEditor';
import type { WeekSchedule } from '@/lib/horaires';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import {
  Store,
  MapPin,
  Truck,
  Clock,
  Save,
  Loader2,
  ArrowLeft,
  BadgeCheck,
  CreditCard,
} from 'lucide-react';

const ProfilMap = dynamic(() => import('@/components/maps/SupermarcheMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] w-full bg-muted animate-pulse rounded-lg" />
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

interface SupermarketData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  commune: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  isOpen: boolean;
  horaires: string;
  fraisLivraison: number;
  livraisonGratuiteDes: number;
  livraisonDisponible: boolean;
  rayonLivraisonKm: number;
  moyensPaiement: string;
  productCount: number;
}

export default function ProfilPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supermarketId, setSupermarketId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commune, setCommune] = useState('');
  const [adresse, setAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [latitude, setLatitude] = useState(5.36);
  const [longitude, setLongitude] = useState(-4.0083);
  const [fraisLivraison, setFraisLivraison] = useState('1000');
  const [livraisonGratuiteDes, setLivraisonGratuiteDes] = useState('0');
  const [rayonLivraisonKm, setRayonLivraisonKm] = useState('10');
  const [moyensPaiement, setMoyensPaiement] = useState<string[]>([]);
  const [horaires, setHoraires] = useState<WeekSchedule>(DEFAULT_HORAIRES);
  const [isOpen, setIsOpen] = useState(true);

  // Fetch existing supermarket data
  const fetchSupermarket = useCallback(async () => {
    if (!session?.user) return;

    const supermarcheId = (session.user as { supermarcheId?: string | null }).supermarcheId;
    if (!supermarcheId) {
      setLoading(false);
      return;
    }

    setSupermarketId(supermarcheId);

    try {
      const res = await fetch(`/api/supermarche/${supermarcheId}`);
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      const sm: SupermarketData = data.supermarket;

      // Pre-fill form
      setName(sm.name);
      setDescription(sm.description || '');
      setCommune(sm.commune);
      setAdresse(sm.address);
      setTelephone(sm.phone || '');
      setEmail(sm.email || '');
      setLatitude(sm.latitude);
      setLongitude(sm.longitude);
      setFraisLivraison(String(sm.fraisLivraison));
      setLivraisonGratuiteDes(String(sm.livraisonGratuiteDes || 0));
      setRayonLivraisonKm(String(sm.rayonLivraisonKm));
      setIsOpen(sm.isOpen);

      try {
        const parsed = JSON.parse(sm.moyensPaiement);
        if (Array.isArray(parsed)) setMoyensPaiement(parsed);
      } catch { /* keep default */ }

      try {
        const parsedHoraires = JSON.parse(sm.horaires) as Partial<WeekSchedule>;
        const merged = { ...DEFAULT_HORAIRES };
        for (const key of Object.keys(parsedHoraires) as (keyof WeekSchedule)[]) {
          if (parsedHoraires[key]) {
            merged[key] = { ...DEFAULT_HORAIRES[key], ...parsedHoraires[key] };
          }
        }
        setHoraires(merged);
      } catch { /* keep default */ }
    } catch (err) {
      console.error('Error fetching supermarket:', err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSupermarket();
  }, [fetchSupermarket]);

  const handleSave = async () => {
    if (!supermarketId) {
      toast.error('Aucun supermarché trouvé');
      return;
    }

    if (!name.trim() || !commune || !adresse.trim()) {
      toast.error('Nom, commune et adresse sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/supermarche/${supermarketId}`, {
        method: 'PUT',
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
          isOpen,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      toast.success('Profil mis à jour avec succès !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const togglePaiement = (value: string) => {
    setMoyensPaiement((prev) =>
      prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]
    );
  };

  // Map marker
  const mapMarkers = [{
    id: supermarketId || 'current',
    name: name || 'Mon magasin',
    slug: '',
    commune,
    latitude,
    longitude,
    estOuvert: isOpen,
    distance: null,
  }];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="size-8 animate-spin text-[#1B4332] mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Chargement du profil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No supermarket linked
  if (!supermarketId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Store className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Aucun supermarché enregistré</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Vous n&apos;avez pas encore de supermarché. Créez-en un pour commencer à vendre vos produits.
            </p>
            <Button
              onClick={() => router.push('/onboarding')}
              className="bg-[#1B4332] hover:bg-[#40916C]"
            >
              <Store className="size-4 mr-2" />
              Créer mon supermarché
            </Button>
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#1B4332]">Profil du supermarché</h1>
                <p className="text-xs text-muted-foreground">
                  Modifiez les informations de votre magasin
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1B4332] hover:bg-[#40916C] gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <BadgeCheck className="size-3.5" />
              {isOpen ? 'Ouvert' : 'Fermé'}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Changer le statut
            </button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 h-10 mb-4">
              <TabsTrigger value="infos" className="text-sm gap-1.5">
                <Store className="size-3.5" />
                Infos générales
              </TabsTrigger>
              <TabsTrigger value="localisation" className="text-sm gap-1.5">
                <MapPin className="size-3.5" />
                Localisation & livraison
              </TabsTrigger>
              <TabsTrigger value="horaires" className="text-sm gap-1.5">
                <Clock className="size-3.5" />
                Horaires
              </TabsTrigger>
            </TabsList>

            {/* Infos générales */}
            <TabsContent value="infos">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du magasin *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Commune *</Label>
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
                      <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email professionnel</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Localisation & livraison */}
            <TabsContent value="localisation">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="size-4 text-[#1B4332]" />
                      Emplacement
                    </h3>
                    <div className="h-[250px] rounded-lg overflow-hidden border border-border/40">
                      <ProfilMap
                        supermarkets={mapMarkers}
                        center={[latitude, longitude]}
                        zoom={14}
                        showLocateButton={true}
                        onLocateMe={() => {
                          navigator.geolocation?.getCurrentPosition((pos) => {
                            setLatitude(pos.coords.latitude);
                            setLongitude(pos.coords.longitude);
                          });
                        }}
                      />
                    </div>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Truck className="size-4 text-[#1B4332]" />
                      Livraison
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Frais de livraison (FCFA)</Label>
                        <Input
                          type="number"
                          value={fraisLivraison}
                          onChange={(e) => setFraisLivraison(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Gratuit à partir de (FCFA)</Label>
                        <Input
                          type="number"
                          value={livraisonGratuiteDes}
                          onChange={(e) => setLivraisonGratuiteDes(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Rayon (km)</Label>
                        <Input
                          type="number"
                          value={rayonLivraisonKm}
                          onChange={(e) => setRayonLivraisonKm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="size-4 text-[#1B4332]" />
                      Moyens de paiement
                    </h3>
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Horaires */}
            <TabsContent value="horaires">
              <Card>
                <CardContent className="p-5">
                  <HorairesEditor value={horaires} onChange={setHoraires} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save button at bottom */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1B4332] hover:bg-[#40916C] gap-2 min-w-[160px]"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
