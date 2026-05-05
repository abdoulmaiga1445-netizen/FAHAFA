'use client';

import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export default function StockBadge({ stock, className = '' }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <Badge variant="destructive" className={`text-[10px] px-1.5 py-0 h-5 font-semibold ${className}`}>
        Rupture
      </Badge>
    );
  }

  if (stock < 5) {
    return (
      <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 text-[10px] px-1.5 py-0 h-5 font-semibold ${className}`}>
        Stock critique ({stock})
      </Badge>
    );
  }

  if (stock < 20) {
    return (
      <Badge className={`bg-orange-100 text-orange-800 hover:bg-orange-100 text-[10px] px-1.5 py-0 h-5 font-semibold ${className}`}>
        Stock bas ({stock})
      </Badge>
    );
  }

  return (
    <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0 h-5 font-semibold ${className}`}>
      En stock ({stock})
    </Badge>
  );
}
