"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { Accessory } from "@/entities/product";
import AccessoryDetailsSheet from "@/components/products/accessories/accessory-details-sheet";
import { ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState";

interface AccessoriesStepProps {
  config: ConfiguratorState;
  onUpdate: (updates: Partial<ConfiguratorState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onProductModalOpenChange?: (isOpen: boolean) => void;
}

export function AccessoriesStep({ config, onUpdate, onNext, onPrevious, onProductModalOpenChange }: AccessoriesStepProps) {
  const { accessories, isLoading } = useAccessories();
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filtruj tylko podpiętki
  const podpietki = useMemo(() => {
    return accessories.filter(acc => acc.productType === 'podpietka' && acc.inStock);
  }, [accessories]);

  // Znajdź wybraną podpiętkę
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return podpietki.find(p => p.id === config.selectedPodpietka) || null;
  }, [podpietki, config.selectedPodpietka]);

  const handlePodpietkaClick = (podpietka: Accessory) => {
    setSelectedAccessory(podpietka);
    setIsSheetOpen(true);
    onProductModalOpenChange?.(true);
  };

  const handleAddPodpietka = (podpietka: Accessory, color?: string) => {
    onUpdate({
      selectedPodpietka: podpietka.id,
      podpietkaColor: color || undefined
    });
    setIsSheetOpen(false);
    onProductModalOpenChange?.(false);
  };

  const handleRemovePodpietka = () => {
    onUpdate({
      selectedPodpietka: undefined,
      podpietkaColor: undefined
    });
  };

  // Synchronizuj stan modala z rodzicem - zawsze aktualizuj gdy isSheetOpen się zmienia
  useEffect(() => {
    if (onProductModalOpenChange) {
      onProductModalOpenChange(isSheetOpen);
    }
  }, [isSheetOpen, onProductModalOpenChange]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Sekcja Podpiętki */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Podpiętki</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Opcjonalne</span>
            <Button
              onClick={onNext}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/5 hover:text-white text-gray-300 h-7 px-3 text-xs font-medium"
            >
              Pomiń
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : podpietki.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">Brak dostępnych podpiętek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {podpietki.map((podpietka) => {
              const isSelected = config.selectedPodpietka === podpietka.id;
              const displayImage = podpietka.images && podpietka.images.length > 0 
                ? podpietka.images[0] 
                : podpietka.imageSrc;

              return (
                <div
                  key={podpietka.id}
                  className={`
                    relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all min-h-[140px] active:scale-[0.98]
                    ${isSelected 
                      ? 'border-red-600 bg-red-600/10' 
                      : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5'
                    }
                  `}
                  onClick={() => handlePodpietkaClick(podpietka)}
                >
                  {/* Obraz */}
                  <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] max-h-[120px]">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={podpietka.name}
                        fill
                        className="object-cover scale-90"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-2xl">📦</span>
                      </div>
                    )}
                    
                    {/* Badge wybranego */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Badge className="bg-red-600 text-white text-[10px] px-1.5 py-0.5">Wybrano</Badge>
                      </div>
                    )}
                  </div>

                  {/* Informacje */}
                  <div className="p-2.5">
                    <h4 className="font-medium text-white mb-0.5 text-xs">{podpietka.name}</h4>
                    {podpietka.description && (
                      <p className="text-[10px] text-gray-400 line-clamp-2 mb-1.5">{podpietka.description}</p>
                    )}
                    
                    {/* Dostępne kolory */}
                    {podpietka.availableColors && podpietka.availableColors.length > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-[10px] text-gray-400">Kolory:</span>
                        <div className="flex gap-0.5 flex-wrap">
                          {podpietka.availableColors.slice(0, 5).map((color) => (
                            <div
                              key={color}
                              className={`
                                w-3 h-3 rounded-full border border-white/20
                                ${config.podpietkaColor === color ? 'ring-1.5 ring-red-500' : ''}
                              `}
                              style={{
                                backgroundColor: color.toLowerCase().includes('czarn') ? '#000' :
                                                color.toLowerCase().includes('czerwon') ? '#dc2626' :
                                                color.toLowerCase().includes('niebiesk') ? '#2563eb' :
                                                color.toLowerCase().includes('zielon') ? '#16a34a' :
                                                color.toLowerCase().includes('brąz') ? '#92400e' :
                                                '#666'
                              }}
                              title={color}
                            />
                          ))}
                          {podpietka.availableColors.length > 5 && (
                            <span className="text-[10px] text-gray-400">+{podpietka.availableColors.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-white">
                        {podpietka.price.toLocaleString('pl-PL')} <span className="text-[10px] text-gray-400">PLN</span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 hover:bg-white/5 h-7 text-[10px] px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePodpietkaClick(podpietka);
                        }}
                      >
                        <ExternalLink className="w-2.5 h-2.5 mr-0.5" />
                        Zobacz
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wybrana podpiętka - podsumowanie */}
        {selectedPodpietka && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-400 mb-0.5">Wybrana podpiętka:</p>
                <p className="text-white font-semibold text-sm">{selectedPodpietka.name}</p>
                {config.podpietkaColor && (
                  <p className="text-[10px] text-gray-400 mt-0.5">Kolor: {config.podpietkaColor}</p>
                )}
                <p className="text-xs text-gray-300 mt-0.5">
                  {selectedPodpietka.price.toLocaleString('pl-PL')} PLN
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemovePodpietka}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2 text-xs"
              >
                Usuń
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nawigacja */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        <Button onClick={onPrevious} variant="outline" className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-white/10 hover:bg-white/5 active:scale-95">
          Wstecz
        </Button>
        <Button onClick={onNext} className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 active:scale-95">
          Dalej
        </Button>
      </div>

      {/* Sheet z szczegółami podpiętki */}
      {selectedAccessory && (
        <AccessoryDetailsSheet
          accessory={selectedAccessory}
          isOpen={isSheetOpen}
          onClose={() => {
            setIsSheetOpen(false);
            setSelectedAccessory(null);
            onProductModalOpenChange?.(false);
          }}
          onAddToConfig={(accessory, color) => {
            handleAddPodpietka(accessory, color);
          }}
        />
      )}
    </div>
  );
}

