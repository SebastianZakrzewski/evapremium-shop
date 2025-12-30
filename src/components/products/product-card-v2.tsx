import Image from "next/image";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductDisplayItem {
  id: string;
  brand: string;
  model: string;
  generation?: string;
  bodyType?: string;
  yearFrom?: number;
  yearTo?: number;
  price: number;
  imageSrc?: string;
}

interface ProductCardV2Props {
  product: ProductDisplayItem;
}

export default function ProductCardV2({ product }: ProductCardV2Props) {
  // Body type mapping function (same as in other components, could be extracted to utils)
  const formatBodyType = (bodyType: string) => {
    const mapping: Record<string, string> = {
      'sedan': 'Sedan',
      'suv': 'SUV',
      'hatchback': 'Hatchback',
      'coupe': 'Coupe',
      'roadster': 'Roadster',
      'cabrio': 'Kabriolet',
      'kombi': 'Kombi',
      'minivan': 'Minivan',
      'van': 'Van',
      'dostawczak': 'Dostawczak',
      'fastback': 'Fastback',
      'liftback': 'Liftback',
      'hatchback 2drzwi': 'Hatchback 2-drzwiowy',
      'hatchback 3drzwi': 'Hatchback 3-drzwiowy',
      'hatchback 5drzwi': 'Hatchback 5-drzwiowy',
      'hatchback 3/5drzwi': 'Hatchback 3/5-drzwiowy',
      'SUV 5os.': 'SUV 5-osobowy',
      'SUV 7os.': 'SUV 7-osobowy',
      'kombi/ sedan': 'Kombi/Sedan',
      'van 4drzwi': 'Van 4-drzwiowy',
      'shooting brake': 'Shooting Brake',
    };
    const normalized = bodyType.toLowerCase().trim();
    return mapping[normalized] || bodyType.charAt(0).toUpperCase() + bodyType.slice(1).toLowerCase();
  };

  const configuratorUrl = `/konfigurator?brand=${encodeURIComponent(product.brand.toLowerCase())}&model=${encodeURIComponent(product.model.toLowerCase())}${product.generation ? `&generation=${encodeURIComponent(product.generation)}` : ""}${product.bodyType ? `&bodyType=${encodeURIComponent(product.bodyType)}` : ""}`;

  return (
    <Link href={configuratorUrl} className="group block h-full">
      <article className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden p-8 flex items-center justify-center">
          {product.imageSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={product.imageSrc}
                alt={`${product.brand} ${product.model}`}
                fill
                loading="lazy"
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <Car className="w-24 h-24 opacity-20" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.yearFrom && product.yearTo && (
              <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-white border-white/10 hover:bg-black/90">
                {product.yearFrom}-{product.yearTo}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
              {product.brand} {product.model}
            </h3>
          </div>
          
          <div className="text-sm text-gray-400 mb-4 flex-1">
             {product.generation && (
               <span className="block">{product.generation}</span>
             )}
             {product.bodyType && (
               <span className="block text-xs uppercase mt-1">{formatBodyType(product.bodyType)}</span>
             )}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Cena od</span>
              <span className="text-xl font-bold text-white">
                {product.price.toLocaleString('pl-PL')} <span className="text-red-500">PLN</span>
              </span>
            </div>
            
            <Button
              size="sm"
              className="bg-white text-black hover:bg-red-600 hover:text-white shrink-0 gap-2 transition-all duration-300"
            >
              <span className="hidden sm:inline">Konfiguruj</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}






















