'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { SupermarcheMapMarker } from './SupermarcheMap';
import { formatDistance } from '@/lib/geo';

// We load Leaflet from CDN to avoid Turbopack memory issues with the npm package
declare global {
  interface Window {
    L: any;
  }
}

// Load Leaflet CSS + JS from CDN, returns true when ready
function loadLeaflet(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(true);
      return;
    }

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.querySelector('script[src*="leaflet"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(!!window.L);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.L) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(!!window.L);
      }, 10000);
    }
  });
}

interface SupermarcheMapInnerProps {
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

export default function SupermarcheMapInner({
  supermarkets,
  center = [5.36, -4.0083],
  zoom = 12,
  onLocateMe,
  showLocateButton = true,
  selectedId,
  onSelect,
  userLocation,
}: SupermarcheMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const linesLayerRef = useRef<any>(null);
  const labelsLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  const initDoneRef = useRef(false);
  const [leafletReady, setLeafletReady] = useState(false);
  // We need a render trigger after map init so other effects can run
  const [renderTick, setRenderTick] = useState(0);

  // Load Leaflet from CDN
  useEffect(() => {
    loadLeaflet().then((ok) => {
      console.log('[Map] Leaflet CDN loaded:', ok);
      setLeafletReady(ok);
    });
  }, []);

  // Initialize map once Leaflet is loaded and container is available
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return;
    const L = window.L;
    if (!L) return;

    console.log('[Map] Initializing map...', { center, zoom });

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    linesLayerRef.current = L.layerGroup().addTo(map);
    labelsLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;
    initDoneRef.current = true;

    // Trigger a re-render so other effects that depend on mapInitDone can run
    // Using setTimeout to avoid the "setState in effect" lint warning
    const timer = setTimeout(() => setRenderTick((t) => t + 1), 0);

    // Force invalidate size after delays
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 300);
    setTimeout(() => map.invalidateSize(), 600);

    return () => {
      clearTimeout(timer);
      console.log('[Map] Cleaning up map...');
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      linesLayerRef.current = null;
      labelsLayerRef.current = null;
      userMarkerRef.current = null;
      userCircleRef.current = null;
      initDoneRef.current = false;
    };
  }, [leafletReady]);

  // Build popup HTML for a supermarket marker
  const buildPopupHtml = useCallback((market: SupermarcheMapMarker) => {
    const statusClass = market.estOuvert
      ? 'background:#D1FAE5;color:#065F46;'
      : 'background:#FEE2E2;color:#991B1B;';
    const statusText = market.estOuvert ? 'OUVERT' : 'FERME';
    const distanceTag = market.distance !== null
      ? `<span style="font-size:11px;font-weight:600;background:#D8F3DC;color:#1B4332;padding:2px 6px;border-radius:4px;">${formatDistance(market.distance)}</span>`
      : '';

    return `
      <div style="min-width:200px;padding:4px;">
        <h3 style="font-weight:600;font-size:14px;line-height:1.3;margin:0;">${market.name}</h3>
        <div style="display:flex;align-items:center;gap:5px;margin-top:6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span style="font-size:12px;color:#6B7280;">${market.commune}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
          <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;${statusClass}">${statusText}</span>
          ${distanceTag}
        </div>
        <a href="/supermarche/${market.slug}" style="display:block;margin-top:10px;">
          <span style="display:block;text-align:center;font-size:12px;font-weight:600;background:#1B4332;color:white;padding:6px 0;border-radius:6px;text-decoration:none;">
            Voir le magasin
          </span>
        </a>
      </div>
    `;
  }, []);

  // Update supermarket markers
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!L || !map || !layer || !initDoneRef.current) return;

    console.log('[Map] Updating markers:', supermarkets.length);
    layer.clearLayers();

    const GreenIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#1B4332" stroke="#081C15" stroke-width="1"/>
        <circle cx="12" cy="12" r="6" fill="#D8F3DC"/>
        <path d="M9 12l2 2 4-4" stroke="#1B4332" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
      iconSize: [28, 42],
      iconAnchor: [14, 42],
      popupAnchor: [0, -42],
      className: 'supermarket-marker',
    });

    const RedIcon = L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#6B7280" stroke="#4B5563" stroke-width="1"/>
        <circle cx="12" cy="12" r="6" fill="#F3F4F6"/>
        <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      iconSize: [28, 42],
      iconAnchor: [14, 42],
      popupAnchor: [0, -42],
      className: 'supermarket-marker-closed',
    });

    supermarkets.forEach((market) => {
      const icon = market.estOuvert ? GreenIcon : RedIcon;
      const marker = L.marker([market.latitude, market.longitude], { icon })
        .addTo(layer)
        .bindPopup(buildPopupHtml(market), {
          maxWidth: 280,
          className: 'supermarket-popup',
        });
      marker.on('click', () => onSelect?.(market.id));
    });

    // Fit bounds
    const allPoints: [number, number][] = supermarkets.map((m) => [m.latitude, m.longitude]);
    if (userLocation) {
      allPoints.push([userLocation.lat, userLocation.lng]);
    }
    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60], maxZoom: 15 });
    }
  }, [supermarkets, buildPopupHtml, onSelect, userLocation, renderTick]);

  // Update dotted lines and distance labels
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    const linesLayer = linesLayerRef.current;
    const labelsLayer = labelsLayerRef.current;
    if (!L || !map || !linesLayer || !labelsLayer || !initDoneRef.current) return;

    linesLayer.clearLayers();
    labelsLayer.clearLayers();

    if (!userLocation) return;

    console.log('[Map] Drawing dotted lines from user to', supermarkets.length, 'supermarkets');

    supermarkets.forEach((market) => {
      const userPos: [number, number] = [userLocation.lat, userLocation.lng];
      const marketPos: [number, number] = [market.latitude, market.longitude];

      // Dashed polyline
      L.polyline([userPos, marketPos], {
        color: '#1B4332',
        weight: 2,
        opacity: 0.5,
        dashArray: '6, 8',
        lineCap: 'round',
      }).addTo(linesLayer);

      // Distance label at midpoint
      if (market.distance !== null) {
        const midLat = (userLocation.lat + market.latitude) / 2;
        const midLng = (userLocation.lng + market.longitude) / 2;
        const text = formatDistance(market.distance);
        const labelIcon = L.divIcon({
          html: `<div style="
            background:white;
            border:1.5px solid #1B4332;
            border-radius:20px;
            padding:2px 10px;
            font-size:11px;
            font-weight:700;
            color:#1B4332;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(0,0,0,0.12);
            line-height:1.4;
            text-align:center;
          ">${text}</div>`,
          iconSize: [0, 0],
          className: 'distance-label-marker',
        });
        L.marker([midLat, midLng], {
          icon: labelIcon,
          interactive: false,
          zIndexOffset: 500,
        }).addTo(labelsLayer);
      }
    });
  }, [userLocation, supermarkets, renderTick]);

  // Update user location marker
  useEffect(() => {
    const L = window.L;
    const map = mapRef.current;
    if (!L || !map || !initDoneRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    if (userLocation) {
      console.log('[Map] Adding user location marker:', userLocation);

      const UserIcon = L.divIcon({
        html: `
          <div style="position:relative;width:20px;height:20px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;opacity:0.25;animation:userPulse 2s ease-in-out infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:12px;height:12px;border-radius:50%;background:#3B82F6;border:2.5px solid white;box-shadow:0 0 6px rgba(59,130,246,0.5);"></div>
          </div>
          <style>@keyframes userPulse{0%,100%{transform:scale(1);opacity:0.25}50%{transform:scale(2.2);opacity:0}}</style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: 'user-location-marker',
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: UserIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`
          <div style="padding:4px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>
              <span style="font-weight:600;font-size:13px;color:#1D4ED8;">Votre position</span>
            </div>
          </div>
        `);

      userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: 200,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.3,
      }).addTo(map);
    }
  }, [userLocation, renderTick]);

  if (!leafletReady) {
    return (
      <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Chargement de la carte...</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      />

      {/* Locate me button */}
      {showLocateButton && onLocateMe && (
        <button
          onClick={onLocateMe}
          className="absolute bottom-4 right-4 z-[1000] bg-white shadow-lg rounded-full p-2.5 hover:bg-gray-50 transition-colors border border-border"
          title="Me localiser"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1B4332"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      )}
    </div>
  );
}
