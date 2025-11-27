"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccessories } from "@/hooks/useAccessories";
import { Accessory } from "@/lib/types/accessory";
import AccessoryDetailsSheet from "@/components/accessory-details-sheet";
import { ShoppingCart, ExternalLink, Loader2 } from "lucide-react";
import type { ConfiguratorState } from "./ConfiguratorSimple";

interface AccessoriesStepProps {
  config: ConfiguratorState;
  onUpdate: (updates: Partial<ConfiguratorState>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function AccessoriesStep({ config, onUpdate, onNext, onPrevious }: AccessoriesStepProps) {
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
  };

  const handleAddPodpietka = (podpietka: Accessory, color?: string) => {
    onUpdate({
      selectedPodpietka: podpietka.id,
      podpietkaColor: color || undefined
    });
    setIsSheetOpen(false);
  };

  const handleRemovePodpietka = () => {
    onUpdate({
      selectedPodpietka: undefined,
      podpietkaColor: undefined
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Sekcja Podpiętki */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Podpiętki</h3>
          <span className="text-sm text-gray-400">Opcjonalne</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : podpietki.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Brak dostępnych podpiętek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {podpietki.map((podpietka) => {
              const isSelected = config.selectedPodpietka === podpietka.id;
              const displayImage = podpietka.images && podpietka.images.length > 0 
                ? podpietka.images[0] 
                : podpietka.imageSrc;

              return (
                <div
                  key={podpietka.id}
                  className={`
                    relative group cursor-pointer rounded-lg border-2 overflow-hidden transition-all
                    ${isSelected 
                      ? 'border-red-600 bg-red-600/10' 
                      : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                    }
                  `}
                  onClick={() => handlePodpietkaClick(podpietka)}
                >
                  {/* Obraz */}
                  <div className="relative aspect-square bg-neutral-900">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={podpietka.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    
                    {/* Badge wybranego */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-600 text-white">Wybrano</Badge>
                      </div>
                    )}
                  </div>

                  {/* Informacje */}
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-1">{podpietka.name}</h4>
                    {podpietka.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{podpietka.description}</p>
                    )}
                    
                    {/* Dostępne kolory */}
                    {podpietka.availableColors && podpietka.availableColors.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">Kolory:</span>
                        <div className="flex gap-1 flex-wrap">
                          {podpietka.availableColors.slice(0, 5).map((color) => (
                            <div
                              key={color}
                              className={`
                                w-4 h-4 rounded-full border border-white/20
                                ${config.podpietkaColor === color ? 'ring-2 ring-red-500' : ''}
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
                            <span className="text-xs text-gray-500">+{podpietka.availableColors.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-white">
                        {podpietka.price.toLocaleString('pl-PL')} <span className="text-sm text-gray-400">PLN</span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neutral-600 hover:bg-neutral-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePodpietkaClick(podpietka);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
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
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-400 mb-1">Wybrana podpiętka:</p>
                <p className="text-white font-semibold">{selectedPodpietka.name}</p>
                {config.podpietkaColor && (
                  <p className="text-xs text-gray-400 mt-1">Kolor: {config.podpietkaColor}</p>
                )}
                <p className="text-sm text-gray-300 mt-1">
                  {selectedPodpietka.price.toLocaleString('pl-PL')} PLN
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemovePodpietka}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Usuń
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nawigacja */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        <Button onClick={onPrevious} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
          Wstecz
        </Button>
        <Button onClick={onNext} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">
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
          }}
          onAddToConfig={(accessory, color) => {
            handleAddPodpietka(accessory, color);
          }}
        />
      )}
    </div>
  );
}

