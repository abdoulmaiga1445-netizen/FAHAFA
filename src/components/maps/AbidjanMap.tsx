'use client';

import dynamic from 'next/dynamic';

export interface SupermarketMarker {
  id: string;
  name: string;
  commune: string;
  latitude: number;
  longitude: number;
  rating: number;
}

interface AbidjanMapProps {
  supermarkets: SupermarketMarker[];
}

const AbidjanMap = dynamic(() => import('./AbidjanMapInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />,
}) as React.ComponentType<AbidjanMapProps>;

export default AbidjanMap;
