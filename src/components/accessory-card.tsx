import Image from "next/image";
import Link from "next/link";
import { Accessory } from "@/lib/types/accessory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface AccessoryCardProps {
  accessory: Accessory;
  onAddToCart: (e: React.MouseEvent) => void;
}

export default function AccessoryCard({ accessory, onAddToCart }: AccessoryCardProps) {
  return (
    <Link 
      href={`/akcesoria/${accessory.category?.slug || 'all'}`}
      className="group block h-full"
    >
      <article className="h-full flex flex-col bg-[#111] border border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-900 to-black overflow-hidden">
          {accessory.imageSrc ? (
            <Image
              src={accessory.imageSrc}
              alt={accessory.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <span className="text-4xl">📦</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {accessory.category?.name && (
              <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-white border-white/10 hover:bg-black/90">
                {accessory.category.name}
              </Badge>
            )}
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
              <span className="text-xs text-gray-500">Cena</span>
              <span className="text-xl font-bold text-white">
                {accessory.price.toLocaleString('pl-PL')} <span className="text-red-500">PLN</span>
              </span>
            </div>
            
            <Button
              onClick={onAddToCart}
              disabled={!accessory.inStock}
              size="sm"
              className={`
                shrink-0 gap-2 transition-all duration-300
                ${!accessory.inStock 
                  ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-400' 
                  : 'bg-white text-black hover:bg-red-600 hover:text-white'
                }
              `}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Do koszyka</span>
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}

