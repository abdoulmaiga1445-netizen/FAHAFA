'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Truck, Star, ChevronRight } from 'lucide-react';
import { formatDistance } from '@/lib/geo';
import { getHorairesAujourdhui } from '@/lib/horaires';

interface SupermarcheCardProps {
  id: string;
  name: string;
  slug: string;
  commune: string;
  address: string;
  distance: number | null;
  estOuvert: boolean;
  isOpen: boolean;
  rating: number;
  horaires: string;
  fraisLivraison: number;
  livraisonDisponible: boolean;
  nbProduits: number;
  logo?: string | null;
  description?: string | null;
}

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export default function SupermarcheCard({
  name,
  slug,
  commune,
  distance,
  estOuvert,
  rating,
  horaires,
  fraisLivraison,
  livraisonDisponible,
  nbProduits,
  logo,
  description,
}: SupermarcheCardProps) {
  const horairesAujourdhui = getHorairesAujourdhui(horaires);

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#D8F3DC] flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-[#1B4332]">
                  {name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-[#1B4332] transition-colors">
                  {name}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{commune}</span>
                </div>
              </div>

              {/* Open/Closed badge */}
              <Badge
                variant={estOuvert ? 'default' : 'destructive'}
                className={`flex-shrink-0 text-[10px] px-1.5 py-0 h-5 font-semibold ${
                  estOuvert
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'bg-red-100 text-red-800 hover:bg-red-100'
                }`}
              >
                {estOuvert ? 'OUVERT' : 'FERMÉ'}
              </Badge>
            </div>

            {/* Rating & Distance */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="size-3 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-xs font-medium">{formatRating(rating)}</span>
                </div>
              )}
              {distance !== null && (
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDistance(distance)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {nbProduits} produit{nbProduits !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Hours & Delivery */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span>{horairesAujourdhui}</span>
              </div>
              {livraisonDisponible && (
                <div className="flex items-center gap-1">
                  <Truck className="size-3" />
                  <span>Livraison {formatPrice(fraisLivraison)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <Link href={`/supermarche/${slug}`} className="block">
            <Button
              size="sm"
              className="w-full h-8 text-xs bg-[#1B4332] hover:bg-[#40916C] transition-colors"
            >
              Commander
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
