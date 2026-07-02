import Image from "next/image";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPriceValue } from "@/lib/utils/formatPrice";

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
    <Link href={configuratorUrl} className="group block h-full outline-none">
      <article className="h-full flex flex-col bg-[#111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:border-white/10 hover:bg-[#111]/40 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-gradient-to-b from-neutral-900/50 to-transparent overflow-hidden p-6 flex items-center justify-center">
          {product.imageSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={product.imageSrc}
                alt={`${product.brand} ${product.model}`}
                fill
                loading="lazy"
                className="object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Car className="w-20 h-20 opacity-20" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.yearFrom && product.yearTo && (
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white/90 border-white/10 font-medium tracking-wide">
                {product.yearFrom}-{product.yearTo}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6 pt-4">
          <div className="mb-1">
            <h3 className="text-xl font-semibold text-white leading-tight transition-colors line-clamp-2">
              {product.brand} {product.model}
            </h3>
          </div>
          
          <div className="text-sm text-gray-400 mb-6 flex-1 font-light tracking-wide">
             {product.generation && (
               <span className="block">{product.generation}</span>
             )}
             {product.bodyType && (
               <span className="block text-xs uppercase mt-1 opacity-70">{formatBodyType(product.bodyType)}</span>
             )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Cena od</span>
              <span className="text-2xl font-bold text-white tracking-tight">
                {formatPriceValue(product.price)} <span className="text-sm font-medium text-gray-400 ml-0.5">PLN</span>
              </span>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-300 shrink-0">
              <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}






















