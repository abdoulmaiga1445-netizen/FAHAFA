'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StockBadge from '@/components/supermarche/StockBadge';
import { Package, Pencil, EyeOff, Tag } from 'lucide-react';

interface ProduitCardProps {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  comparePrice?: number | null;
  stock: number;
  unit: string;
  image?: string | null;
  images?: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    icon?: string | null;
  };
  onToggleActive?: (id: string, isActive: boolean) => void;
}

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' FCFA';
}

export default function ProduitCard({
  id,
  name,
  description,
  price,
  comparePrice,
  stock,
  unit,
  image,
  images: imagesJson,
  isActive,
  category,
  onToggleActive,
}: ProduitCardProps) {
  // Parse images
  let imageList: string[] = [];
  try {
    imageList = imagesJson ? JSON.parse(imagesJson) : [];
  } catch {
    imageList = [];
  }
  const displayImage = image || (imageList.length > 0 ? imageList[0] : null);

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden ${!isActive ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {displayImage ? (
                <img src={displayImage} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Package className="size-7 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-medium">
                    <Tag className="size-3 mr-0.5" />
                    {category.name}
                  </Badge>
                </div>
              </div>

              {!isActive && (
                <Badge className="flex-shrink-0 bg-gray-100 text-gray-600 hover:bg-gray-100 text-[10px] px-1.5 py-0 h-5 font-semibold">
                  Inactif
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-sm font-bold text-[#1B4332]">
                {formatPrice(price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">/{unit}</span>
            </div>

            {/* Stock */}
            <div className="mt-1.5">
              <StockBadge stock={stock} />
            </div>

            {description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
          <Link href={`/dashboard/produits/${id}/edit`} className="flex-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs gap-1.5"
            >
              <Pencil className="size-3" />
              Modifier
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className={`h-8 text-xs gap-1.5 ${isActive ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
            onClick={() => onToggleActive?.(id, isActive)}
          >
            <EyeOff className="size-3" />
            {isActive ? 'Désactiver' : 'Activer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
