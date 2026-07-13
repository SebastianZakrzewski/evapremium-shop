import Image from "next/image";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { memo, useMemo } from "react";
import { formatPriceValue } from "@/lib/utils/formatPrice";
import { buildConfiguratorEntryUrl } from "@/features/car-configurator/utils/buildConfiguratorEntryUrl";
import {
  buildVehicleDisplayLabels,
  formatVehicleCardTitle,
} from "@/shared/vehicle/displayLabels";

interface ProductDisplayItem {
  id: string;
  brand: string;
  model: string;
  modelFamilyKey?: string;
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

function ProductCardV2({ product }: ProductCardV2Props) {
  const labels = useMemo(
    () =>
      buildVehicleDisplayLabels({
        brandName: product.brand,
        modelFamilyName: product.model,
        modelFamilyKey: product.modelFamilyKey ?? product.model,
        modelKey: product.modelFamilyKey ?? product.model,
        generation: product.generation,
        yearFrom: product.yearFrom,
        yearTo: product.yearTo,
        bodyType: product.bodyType,
      }),
    [product],
  );

  const title = formatVehicleCardTitle(labels);

  const configuratorUrl = buildConfiguratorEntryUrl({
    brand: product.brand,
    model: (product.modelFamilyKey ?? product.model).toLowerCase(),
    generation: product.generation,
    bodyType: product.bodyType,
  });

  return (
    <Link href={configuratorUrl} className="group block h-full">
      <article className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
        <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden p-8 flex items-center justify-center">
          {product.imageSrc ? (
            <div className="relative w-full h-full">
              <Image
                src={product.imageSrc}
                alt={title}
                fill
                loading="lazy"
                className="object-contain transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Car className="w-24 h-24 opacity-20" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.yearFrom && product.yearTo && (
              <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-white border-white/10 hover:bg-black/90">
                {labels.yearRangeDisplay || `${product.yearFrom}-${product.yearTo}`}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>

          <div className="text-sm text-gray-400 mb-4 flex-1">
            {labels.yearRangeDisplay && (
              <span className="block">{labels.yearRangeDisplay}</span>
            )}
            {labels.bodyTypeDisplay && (
              <span className="block text-xs uppercase mt-1">{labels.bodyTypeDisplay}</span>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Cena od</span>
              <span className="text-xl font-bold text-white">
                {formatPriceValue(product.price)} <span className="text-red-500">PLN</span>
              </span>
            </div>

            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700 shrink-0 gap-2 transition-all duration-300"
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

export default memo(ProductCardV2);
