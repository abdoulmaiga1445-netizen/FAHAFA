'use client';

import dynamic from 'next/dynamic';

export interface SupermarcheMapMarker {
  id: string;
  name: string;
  slug: string;
  commune: string;
  latitude: number;
  longitude: number;
  estOuvert: boolean;
  distance: number | null;
}

interface SupermarcheMapProps {
  supermarkets: SupermarcheMapMarker[];
  center?: [number, number];
  zoom?: number;
  onLocateMe?: () => void;
  showLocateButton?: boolean;
  className?: string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}

// Dynamic import with ssr: false — Leaflet is loaded from CDN at runtime
const SupermarcheMapInner = dynamic(() => import('./SupermarcheMapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Chargement de la carte...</span>
    </div>
  ),
});

export default function SupermarcheMap(props: SupermarcheMapProps) {
  return <SupermarcheMapInner {...props} />;
}
