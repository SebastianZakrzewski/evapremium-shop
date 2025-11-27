"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Accessory } from "@/lib/types/accessory";
import { useCart } from "@/hooks/useCart.new";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Check, X as XIcon, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

interface AccessoryDetailsSheetProps {
  accessory: Accessory | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToConfig?: (accessory: Accessory, color?: string) => void; // Callback dla konfiguratora
}

export default function AccessoryDetailsSheet({
  accessory,
  isOpen,
  onClose,
  onAddToConfig
}: AccessoryDetailsSheetProps) {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Przygotuj listę zdjęć - użyj useMemo aby uniknąć problemów z hookami
  const productImages = useMemo(() => {
    if (!accessory) return [];
    
    // PRIORYTET 1: Jeśli wybrano kolor i są dostępne obrazy dla kolorów, użyj obrazu dla wybranego koloru
    if (selectedColor && accessory.colorImages) {
      const colorImage = accessory.colorImages[selectedColor];
      if (colorImage) {
        return [colorImage];
      }
    }
    
    // PRIORYTET 2: Jeśli są dostępne obrazy w tablicy images
    if (accessory.images && accessory.images.length > 0) {
      return accessory.images;
    }
    
    // PRIORYTET 3: Użyj głównego obrazu
    if (accessory.imageSrc) {
      return [accessory.imageSrc];
    }
    
    return [];
  }, [accessory, selectedColor]);

  // Ustaw domyślny kolor przy otwarciu
  useEffect(() => {
    if (isOpen && accessory?.availableColors && accessory.availableColors.length > 0 && !selectedColor) {
      setSelectedColor(accessory.availableColors[0]);
    }
  }, [isOpen, accessory?.availableColors, selectedColor]);

  // Resetuj indeks obrazu przy zmianie koloru lub otwarciu
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
      setImageError(false); // Reset błędu obrazu przy otwarciu
    }
  }, [isOpen, selectedColor]);

  // Resetuj wybrane zdjęcie jeśli indeks jest poza zakresem
  useEffect(() => {
    if (isOpen && productImages.length > 0 && selectedImageIndex >= productImages.length) {
      setSelectedImageIndex(0);
    }
  }, [isOpen, productImages.length, selectedImageIndex]);

  // Wybierz aktualny obraz - priorytet dla wybranego koloru
  const currentImage = useMemo(() => {
    if (!accessory) return '';
    if (productImages.length > 0 && selectedImageIndex < productImages.length) {
      return productImages[selectedImageIndex];
    }
    // Fallback do głównego obrazu
    return accessory.imageSrc || '';
  }, [accessory, productImages, selectedImageIndex]);

  // Maksymalna liczba slotów w karuzeli (pokazujemy placeholdery jeśli mniej zdjęć)
  const MAX_THUMBNAILS = 4;
  const thumbnailSlots = useMemo(() => {
    return Math.max(productImages.length, MAX_THUMBNAILS);
  }, [productImages.length]);

  if (!accessory) return null;

  const handleAddToCart = async () => {
    if (isAddingToCart) return; // Zapobiegaj wielokrotnym kliknięciom
    
    // Jeśli jest callback onAddToConfig (tryb konfiguratora), użyj go
    if (onAddToConfig) {
      onAddToConfig(accessory, selectedColor || undefined);
      toast.success(`Dodano "${accessory.name}"${selectedColor ? ` w kolorze ${selectedColor}` : ''} do konfiguracji`);
      return;
    }
    
    // W przeciwnym razie dodaj bezpośrednio do koszyka
    setIsAddingToCart(true);
    try {
      await addToCart({
        productType: 'accessory',
        productId: accessory.id,
        quantity: quantity
      });
      toast.success(`Dodano ${quantity} ${quantity === 1 ? 'sztukę' : 'sztuki'} "${accessory.name}" do koszyka`);
      setQuantity(1); // Reset po dodaniu
    } catch (error) {
      console.error('Błąd dodawania do koszyka:', error);
      toast.error('Nie udało się dodać produktu do koszyka');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (accessory.stockQuantity && newQuantity > accessory.stockQuantity) return;
    setQuantity(newQuantity);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        className="w-full sm:max-w-xl bg-neutral-950 border-l border-white/10 text-white p-0 flex flex-col h-full"
        aria-labelledby="accessory-details-title"
        aria-describedby="accessory-details-description"
      >
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Section - Fixed at top on mobile, scrollable content below */}
          <div className="relative w-full bg-neutral-900">
            {/* Main Image */}
            <div className="relative aspect-video w-full">
              {currentImage && !imageError ? (
                <Image
                  key={`${currentImage}-${selectedColor || 'default'}`}
                  src={currentImage}
                  alt={`Zdjęcie produktu ${accessory.name}${selectedColor ? ` w kolorze ${selectedColor}` : ''} ${selectedImageIndex + 1} z ${productImages.length}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority={selectedImageIndex === 0}
                  unoptimized={false}
                  onError={() => {
                    console.error(`Błąd ładowania obrazu: ${currentImage}`);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    setImageError(false);
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700 bg-neutral-800/50">
                  <span className="text-6xl mb-2">📦</span>
                  {currentImage && (
                    <p className="text-xs text-neutral-600 text-center px-4">
                      Obraz nie został znaleziony
                      <br />
                      <span className="text-[10px] font-mono">{currentImage}</span>
                    </p>
                  )}
                </div>
              )}
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {accessory.category?.name && (
                  <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-white border-white/10">
                    {accessory.category.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel - zawsze widoczna z placeholderami */}
            {productImages.length > 0 && (
              <div className="px-4 py-3 bg-neutral-900/50 border-t border-white/5">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {Array.from({ length: thumbnailSlots }).map((_, index) => {
                    const hasImage = index < productImages.length;
                    const image = productImages[index];
                    
                    return (
                      <button
                        key={index}
                        onClick={() => hasImage && setSelectedImageIndex(index)}
                        disabled={!hasImage}
                        className={`
                          relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                          ${hasImage 
                            ? selectedImageIndex === index
                              ? 'border-red-500 ring-2 ring-red-500/50 cursor-pointer' 
                              : 'border-white/20 hover:border-white/40 cursor-pointer'
                            : 'border-white/10 opacity-40 cursor-not-allowed'
                          }
                        `}
                        aria-label={hasImage 
                          ? `Zobacz zdjęcie ${index + 1} z ${productImages.length}` 
                          : 'Miejsce na dodatkowe zdjęcie'
                        }
                        aria-pressed={hasImage && selectedImageIndex === index}
                        aria-disabled={!hasImage}
                      >
                        {hasImage ? (
                          <>
                            <Image
                              src={image}
                              alt={`Miniatura ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            {selectedImageIndex === index && (
                              <div className="absolute inset-0 bg-red-500/20" />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-800/50">
                            <div className="w-8 h-8 border-2 border-dashed border-white/30 rounded flex items-center justify-center">
                              <span className="text-white/30 text-xs">+</span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6 pb-6">
          <SheetHeader className="space-y-4 text-left">
             <div className="flex items-start justify-between gap-4">
                <SheetTitle 
                  id="accessory-details-title"
                  className="text-2xl md:text-3xl font-bold leading-tight text-white"
                >
                  {accessory.name}
                </SheetTitle>
             </div>
             
             <div className="flex items-center gap-4">
               <div className="text-2xl font-bold text-white">
                 {accessory.price.toLocaleString('pl-PL')} <span className="text-red-500">PLN</span>
               </div>
               {accessory.originalPrice && accessory.originalPrice > accessory.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {accessory.originalPrice.toLocaleString('pl-PL')} PLN
                  </span>
               )}
             </div>

             <div className="flex items-center gap-2 text-sm">
                {accessory.inStock ? (
                  <div className="flex items-center text-green-400 gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Dostępny w magazynie</span>
                  </div>
                ) : (
                   <div className="flex items-center text-red-400 gap-1.5">
                    <XIcon className="w-4 h-4" />
                    <span>Produkt niedostępny</span>
                  </div>
                )}
             </div>
          </SheetHeader>

          <Separator className="bg-white/10" />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Opis produktu</h4>
            <SheetDescription 
              id="accessory-details-description"
              className="text-base text-gray-300 leading-relaxed"
            >
              {accessory.description || "Brak opisu produktu."}
            </SheetDescription>
          </div>

          {/* Color Selection */}
          {accessory.availableColors && accessory.availableColors.length > 0 && (
            <>
              <Separator className="bg-white/10" />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Kolor</h4>
                <div className="flex flex-wrap gap-3">
                  {accessory.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedImageIndex(0); // Resetuj indeks obrazu przy zmianie koloru
                      }}
                      className={`
                        px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                        ${selectedColor === color
                          ? 'border-red-500 bg-red-500/10 text-white'
                          : 'border-white/20 hover:border-white/40 text-gray-300'
                        }
                      `}
                      aria-label={`Wybierz kolor ${color}`}
                      aria-pressed={selectedColor === color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {accessory.features && accessory.features.length > 0 && (
            <>
              <Separator className="bg-white/10" />
              <div className="space-y-4">
                 <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Cechy produktu</h4>
                 <ul className="grid grid-cols-1 gap-3">
                   {accessory.features.map((feature, index) => (
                     <li key={index} className="flex items-start gap-3 text-gray-300 min-w-0">
                       <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                       <span className="flex-1 break-words min-w-0 pr-2">{feature}</span>
                     </li>
                   ))}
                 </ul>
              </div>
            </>
          )}

          </div>
        </div>

        {/* Fixed Footer Action */}
        <div className="shrink-0 p-6 bg-neutral-950/95 backdrop-blur border-t border-white/10 space-y-4">
          {/* Quantity Selector */}
          {accessory.inStock && (
            <div className="flex items-center justify-center gap-4">
              <label htmlFor="quantity-selector" className="text-sm text-gray-400">
                Ilość:
              </label>
              <div className="flex items-center gap-2 border border-white/20 rounded-lg overflow-hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zmniejsz ilość"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  id="quantity-selector"
                  type="number"
                  min="1"
                  max={accessory.stockQuantity || 999}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-16 text-center bg-transparent text-white border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Ilość produktu"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={accessory.stockQuantity ? quantity >= accessory.stockQuantity : false}
                  className="h-10 w-10 p-0 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Zwiększ ilość"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {accessory.stockQuantity && (
                <span className="text-xs text-gray-500">
                  Dostępne: {accessory.stockQuantity}
                </span>
              )}
            </div>
          )}
          
          <Button 
            className={`w-full h-12 text-lg font-medium transition-all ${
              accessory.inStock 
                ? 'bg-white text-black hover:bg-red-600 hover:text-white' 
                : 'bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleAddToCart}
            disabled={!accessory.inStock || isAddingToCart}
            aria-label={`Dodaj ${quantity} ${quantity === 1 ? 'sztukę' : 'sztuki'} ${accessory.name} do koszyka`}
          >
            {isAddingToCart ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" aria-hidden="true" />
                Dodawanie...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 w-5 h-5" aria-hidden="true" />
                {accessory.inStock 
                  ? `Dodaj do koszyka${quantity > 1 ? ` (${quantity})` : ''}` 
                  : 'Tymczasowo niedostępny'}
              </>
            )}
          </Button>
        </div>

      </SheetContent>
    </Sheet>
  );
}

