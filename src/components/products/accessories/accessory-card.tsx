import Image from "next/image";
import { Accessory } from "@/entities/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface AccessoryCardProps {
  accessory: Accessory;
  onAddToCart: (e: React.MouseEvent) => void;
  onView?: () => void;
}

export default function AccessoryCard({ accessory, onAddToCart, onView }: AccessoryCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onView?.();
    }
  };

  // Wybierz obraz do wyświetlenia: pierwszy z tablicy images lub imageSrc
  const displayImage = accessory.images && accessory.images.length > 0 
    ? accessory.images[0] 
    : accessory.imageSrc;

  return (
    <div 
      onClick={onView}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Zobacz szczegóły produktu ${accessory.name}, cena ${accessory.price.toLocaleString('pl-PL')} PLN`}
      className="group block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-xl"
    >
      <article className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={accessory.name}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">📦</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!accessory.inStock && (
              <Badge variant="destructive" className="bg-red-900/90 backdrop-blur-sm">
                Niedostępny
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-red-500 transition-colors line-clamp-2">
              {accessory.name}
            </h3>
          </div>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
            {accessory.description || 'Brak opisu'}
          </p>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Cena</span>
              <span className="text-xl font-bold text-white">
                {accessory.price.toLocaleString('pl-PL')} <span className="text-red-500">PLN</span>
              </span>
            </div>
            
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Zatrzymaj propagację - przycisk nie otwiera Sheet
                onAddToCart(e);
              }}
              disabled={!accessory.inStock}
              size="sm"
              aria-label={`Dodaj ${accessory.name} do koszyka`}
              className={`
                shrink-0 gap-2 transition-all duration-300
                ${!accessory.inStock 
                  ? 'opacity-50 cursor-not-allowed bg-white/5 text-gray-400' 
                  : 'bg-red-600 text-white hover:bg-red-700'
                }
              `}
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Do koszyka</span>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}

