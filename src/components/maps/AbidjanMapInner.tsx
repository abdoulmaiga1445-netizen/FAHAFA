'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '@/lib/store';
import type { SupermarketMarker } from './AbidjanMap';
import { Star, MapPin } from 'lucide-react';

// Leaflet CSS is loaded via CDN link tag in the wrapper component

// Fix leaflet default icon issue
// Leaflet's default icon URLs break with bundlers, so we set them manually
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AbidjanMapInnerProps {
  supermarkets: SupermarketMarker[];
}

function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export default function AbidjanMapInner({ supermarkets }: AbidjanMapInnerProps) {
  const { setSelectedSupermarketId, setCurrentView } = useAppStore();

  // Ensure leaflet CSS is loaded
  useEffect(() => {
    // Force a recalculation to ensure leaflet renders correctly
    window.dispatchEvent(new Event('resize'));
  }, []);

  const handleMarkerClick = (id: string) => {
    setSelectedSupermarketId(id);
    setCurrentView('decouverte');
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[5.3364, -4.0267]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {supermarkets.map((market) => (
          <Marker
            key={market.id}
            position={[market.latitude, market.longitude]}
            eventHandlers={{
              click: () => handleMarkerClick(market.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <h3 className="font-semibold text-sm-foreground text-sm leading-tight">
                  {market.name}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{market.commune}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="size-3 fill-sm-gold text-sm-gold" />
                  <span className="text-xs font-medium">
                    {formatRating(market.rating)}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
