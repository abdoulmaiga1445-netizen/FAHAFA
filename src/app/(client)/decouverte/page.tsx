'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  X,
  Map,
  Navigation,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  XCircle,
  SlidersHorizontal,
  Truck,
  Clock,
} from 'lucide-react';
import SupermarcheMap from '@/components/maps/SupermarcheMap';
import type { SupermarcheMapMarker } from '@/components/maps/SupermarcheMap';
import SupermarcheCard from '@/components/client/SupermarcheCard';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const COMMUNES = ['Cocody', 'Marcory', 'Abobo', 'Yopougon', 'Plateau', 'Treichville', 'Adjame'];

interface SupermarketResult {
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
  distance: number | null;
  estOuvert: boolean;
}

export default function DecouvertePage() {
  const [supermarkets, setSupermarkets] = useState<SupermarketResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [commune, setCommune] = useState<string>('__all__');
  const [ouvertMaintenant, setOuvertMaintenant] = useState(false);
  const [livraisonDisponible, setLivraisonDisponible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.36, -4.0083]);
  const [selectedSupermarketId, setSelectedSupermarketId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch supermarkets
  const fetchSupermarkets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userLocation) {
        params.set('lat', userLocation.lat.toString());
        params.set('lng', userLocation.lng.toString());
      }
      if (commune && commune !== '__all__') {
        params.set('commune', commune);
      }
      if (search) {
        params.set('search', search);
      }
      if (ouvertMaintenant) {
        params.set('ouvertMaintenant', 'true');
      }

      const response = await fetch(`/api/supermarches/proches?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSupermarkets(data.supermarkets || []);
      }
    } catch (error) {
      console.error('Error fetching supermarkets:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, commune, search, ouvertMaintenant]);

  useEffect(() => {
    fetchSupermarkets();
  }, [fetchSupermarkets]);

  // Geolocation — with optional callback to open map after
  const handleLocateMe = useCallback((onSuccess?: () => void) => {
    if (!navigator.geolocation) {
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setLocating(false);
        onSuccess?.();
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Map markers from supermarket data
  const mapMarkers: SupermarcheMapMarker[] = supermarkets.map((sm) => ({
    id: sm.id,
    name: sm.name,
    slug: sm.slug,
    commune: sm.commune,
    latitude: sm.latitude,
    longitude: sm.longitude,
    estOuvert: sm.estOuvert,
    distance: sm.distance,
  }));

  // Filter by livraisonDisponible (client-side)
  const filteredSupermarkets = livraisonDisponible
    ? supermarkets.filter((sm) => sm.livraisonDisponible)
    : supermarkets;

  // Scroll handlers for carousel
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  // Handle map button click
  const handleOpenMap = () => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setShowMap(true);
    } else {
      handleLocateMe(() => {
        setShowMap(true);
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ─── Compact Hero ─────────────────────────────────────────────────── */}
        <div className="bg-[#1B4332] text-white px-5 pt-5 pb-7 md:px-8 md:pt-6 md:pb-9">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <h1 className="text-lg md:text-xl font-bold mb-4 leading-snug">
              Decouvrez les supermarches
              <span className="text-[#52B788]"> pres de chez vous</span>
            </h1>

            {/* Search + Map Button Row — compact, not full width */}
            <div className="flex items-center gap-2.5">
              {/* Search bar — takes flexible space but not forced full width */}
              <div className="relative flex-1 max-w-[420px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Magasin ou produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 bg-white text-foreground border-0 rounded-xl text-sm pr-8"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Map Button — compact circular pill */}
              <button
                type="button"
                onClick={handleOpenMap}
                className="flex items-center gap-2 bg-white rounded-xl h-10 pl-3.5 pr-4 shadow-sm hover:shadow-md transition-all group shrink-0"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-[#1B4332] group-hover:scale-110 transition-transform">
                  <Navigation className="size-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-[#1B4332] hidden sm:inline">
                  Carte
                </span>
                {locating && (
                  <div className="size-3.5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>

            {/* Location indicator */}
            {userLocation && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90">
                <LocateFixed className="size-3.5" />
                Position detectee
                <button
                  type="button"
                  onClick={() => setUserLocation(null)}
                  className="ml-0.5 text-white/50 hover:text-white"
                >
                  <XCircle className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Filter Chips Row ─────────────────────────────────────────────── */}
        <div className="border-b border-border/40 bg-background sticky top-[60px] md:top-[70px] z-30">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Commune chips */}
              <button
                type="button"
                onClick={() => setCommune('__all__')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  commune === '__all__'
                    ? 'bg-[#1B4332] text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Toutes
              </button>
              {COMMUNES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCommune(commune === c ? '__all__' : c)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    commune === c
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {c}
                </button>
              ))}

              {/* Divider */}
              <div className="shrink-0 w-px h-5 bg-border/60 mx-1" />

              {/* Open now toggle chip */}
              <button
                type="button"
                onClick={() => setOuvertMaintenant(!ouvertMaintenant)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  ouvertMaintenant
                    ? 'bg-green-100 text-green-800 shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Clock className="size-3" />
                Ouvert
              </button>

              {/* Delivery toggle chip */}
              <button
                type="button"
                onClick={() => setLivraisonDisponible(!livraisonDisponible)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  livraisonDisponible
                    ? 'bg-amber-50 text-amber-700 shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Truck className="size-3" />
                Livraison
              </button>

              {/* Results count */}
              <span className="shrink-0 text-xs text-muted-foreground ml-2">
                {loading ? '...' : `${filteredSupermarkets.length}`}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Supermarket Horizontal Carousel ──────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">
          <div className="relative">
            {/* Left Arrow */}
            <button
              type="button"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-[#E5E7EB] text-[#1B4332] hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] transition-all -translate-x-2"
              aria-label="Precedent"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-[#E5E7EB] text-[#1B4332] hover:bg-[#1B4332] hover:text-white hover:border-[#1B4332] transition-all translate-x-2"
              aria-label="Suivant"
            >
              <ChevronRight className="size-4" />
            </button>

            {loading ? (
              <div className="flex gap-5 overflow-hidden px-7">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[300px]">
                    <Skeleton className="h-[180px] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredSupermarkets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Aucun supermarche trouve</h3>
                <p className="text-xs text-muted-foreground max-w-[240px]">
                  Modifiez vos filtres ou votre recherche pour trouver des supermarches.
                </p>
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-7"
              >
                {filteredSupermarkets.map((sm) => (
                  <div key={sm.id} className="shrink-0 w-[300px] snap-start">
                    <SupermarcheCard
                      id={sm.id}
                      name={sm.name}
                      slug={sm.slug}
                      commune={sm.commune}
                      address={sm.address}
                      distance={sm.distance}
                      estOuvert={sm.estOuvert}
                      isOpen={sm.isOpen}
                      rating={sm.rating}
                      horaires={sm.horaires}
                      fraisLivraison={sm.fraisLivraison}
                      livraisonDisponible={sm.livraisonDisponible}
                      nbProduits={sm.nbProduits}
                      logo={sm.logo}
                      description={sm.description}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Map Overlay ──────────────────────────────────────────────────── */}
        {showMap && (
          <MapOverlay
            supermarkets={mapMarkers}
            center={mapCenter}
            zoom={userLocation ? 14 : 12}
            userLocation={userLocation}
            locating={locating}
            filteredCount={filteredSupermarkets.length}
            onLocateMe={() => handleLocateMe()}
            selectedId={selectedSupermarketId}
            onSelect={(id) => setSelectedSupermarketId(id)}
            onClose={() => setShowMap(false)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── MapOverlay Component ──────────────────────────────────────────────────

function MapOverlay({
  supermarkets,
  center,
  zoom,
  userLocation,
  locating,
  filteredCount,
  onLocateMe,
  selectedId,
  onSelect,
  onClose,
}: {
  supermarkets: SupermarcheMapMarker[];
  center: [number, number];
  zoom: number;
  userLocation: { lat: number; lng: number } | null;
  locating: boolean;
  filteredCount: number;
  onLocateMe: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setTimeout(() => {
          setMapReady(true);
        }, 50);
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ height: '85vh', maxHeight: '700px' }}
      >
        {/* Map header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-[#1B4332] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15">
              <Map className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">
                {userLocation ? 'Supermarches a proximite' : 'Carte des supermarches'}
              </h2>
              <p className="text-xs text-white/70">
                {filteredCount} supermarche{filteredCount !== 1 ? 's' : ''} affiche{filteredCount !== 1 ? 's' : ''}
                {userLocation && ' — tries par distance'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Map content */}
        <div className="relative flex-1 min-h-0">
          {mapReady ? (
            <SupermarcheMap
              supermarkets={supermarkets}
              center={center}
              zoom={zoom}
              onLocateMe={onLocateMe}
              showLocateButton={true}
              selectedId={selectedId}
              onSelect={onSelect}
              userLocation={userLocation}
            />
          ) : (
            <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Chargement de la carte...</span>
            </div>
          )}

          {/* Location indicator */}
          {locating && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-4 py-2 shadow-lg text-xs font-medium text-[#1B4332] flex items-center gap-2">
              <div className="size-3 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
              Localisation en cours...
            </div>
          )}
          {userLocation && (
            <div className="absolute top-3 left-3 z-[1000] bg-white rounded-full px-3 py-1.5 shadow-lg text-xs font-medium text-[#3B82F6] flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
              Votre position
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
