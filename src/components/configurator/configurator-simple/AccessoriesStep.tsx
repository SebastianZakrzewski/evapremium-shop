"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccessories } from "@/features/accessories/hooks/useAccessories";
import { Accessory } from "@/entities/product";
import AccessoryDetailsSheet from "@/components/products/accessories/accessory-details-sheet";
import { PodpietkaMountingModal } from "@/components/configurator/configurator-v2/modals/PodpietkaMountingModal";
import { ExternalLink, Loader2 } from "lucide-react";
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState";
import {
  getPodpietkaMountingLabel,
  getPodpietkaTotalPrice,
  type PodpietkaMounting,
} from "@/features/car-configurator/domain/podpietkaMounting";
import { formatPriceCurrency, formatPriceValue } from "@/lib/utils/formatPrice";
import { MAT_FINISH_PRODUCT_TYPE } from "@/features/car-configurator/domain/matFinishes";

type AccessoriesSurface = "dark" | "light"

const accessoriesStyles = {
  dark: {
    heading: "text-white",
    muted: "text-gray-400",
    empty: "text-gray-400",
    card: "border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5",
    cardSelected: "border-red-600 bg-red-600/10",
    image: "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]",
    title: "text-white",
    price: "text-white",
    swatch: "border-white/20",
    details: "border-white/10 hover:bg-white/5",
    selectedBox: "bg-green-500/10 border border-green-500/20",
    selectedLabel: "text-green-400",
    selectedName: "text-white",
    remove: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
  },
  light: {
    heading: "text-neutral-950",
    muted: "text-neutral-600",
    empty: "text-neutral-600",
    card: "border-neutral-300 bg-[#FDFDFD] hover:border-neutral-500",
    cardSelected: "border-neutral-950 bg-[#FDFDFD]",
    image: "bg-neutral-100",
    title: "text-neutral-950",
    price: "text-neutral-950",
    swatch: "border-neutral-300",
    details: "border-neutral-300 bg-[#FDFDFD] text-neutral-950 hover:bg-neutral-100",
    selectedBox: "bg-green-50 border border-green-200",
    selectedLabel: "text-green-700",
    selectedName: "text-neutral-950",
    remove: "text-red-600 hover:text-red-700 hover:bg-red-50",
  },
} as const

interface AccessoriesStepProps {
  config: ConfiguratorState;
  onUpdate: (updates: Partial<ConfiguratorState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceedToSummary?: boolean;
  nextLabel?: string;
  hideNavigation?: boolean;
  surface?: AccessoriesSurface;
  onProductModalOpenChange?: (isOpen: boolean) => void;
}

type PendingPodpietka = {
  accessory: Accessory;
  color?: string;
};

export function AccessoriesStep({
  config,
  onUpdate,
  onNext,
  onPrevious,
  canProceedToSummary = true,
  nextLabel = "Dalej",
  hideNavigation = false,
  surface = "dark",
  onProductModalOpenChange,
}: AccessoriesStepProps) {
  const styles = accessoriesStyles[surface];
  const { accessories, isLoading } = useAccessories();
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pendingPodpietka, setPendingPodpietka] = useState<PendingPodpietka | null>(null);
  const [isMountingModalOpen, setIsMountingModalOpen] = useState(false);

  // Filtruj tylko podpiętki
  const podpietki = useMemo(() => {
    return accessories.filter(acc => acc.productType === 'podpietka' && acc.inStock);
  }, [accessories]);

  const finishes = useMemo(() => {
    return accessories
      .filter((acc) => acc.productType === MAT_FINISH_PRODUCT_TYPE && acc.inStock)
      .sort((left, right) => left.price - right.price);
  }, [accessories]);

  const selectedFinishIds = config.selectedFinishIds ?? [];

  // Znajdź wybraną podpiętkę
  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null;
    return podpietki.find(p => p.id === config.selectedPodpietka) || null;
  }, [podpietki, config.selectedPodpietka]);

  const selectedPodpietkaTotalPrice = selectedPodpietka
    ? getPodpietkaTotalPrice(selectedPodpietka.price, config.podpietkaMounting)
    : 0;

  const handlePodpietkaClick = (podpietka: Accessory) => {
    setSelectedAccessory(podpietka);
    setIsSheetOpen(true);
    onProductModalOpenChange?.(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedAccessory(null);
    onProductModalOpenChange?.(false);
  };

  const handleAddPodpietka = (podpietka: Accessory, color?: string) => {
    setPendingPodpietka({ accessory: podpietka, color });
    setIsSheetOpen(false);
    setSelectedAccessory(null);
    setIsMountingModalOpen(true);
    onProductModalOpenChange?.(true);
  };

  const handleMountingSelect = (mounting: PodpietkaMounting) => {
    if (!pendingPodpietka) return;

    onUpdate({
      selectedPodpietka: pendingPodpietka.accessory.id,
      podpietkaColor: pendingPodpietka.color || undefined,
      podpietkaMounting: mounting,
    });
    setPendingPodpietka(null);
    setIsMountingModalOpen(false);
    onProductModalOpenChange?.(false);
  };

  const handleMountingCancel = () => {
    setPendingPodpietka(null);
    setIsMountingModalOpen(false);
    onProductModalOpenChange?.(false);
  };

  const handleRemovePodpietka = () => {
    onUpdate({
      selectedPodpietka: undefined,
      podpietkaColor: undefined,
      podpietkaMounting: undefined,
    });
  };

  const handleToggleFinish = (finishId: string) => {
    const nextIds = selectedFinishIds.includes(finishId)
      ? selectedFinishIds.filter((id) => id !== finishId)
      : [...selectedFinishIds, finishId];
    onUpdate({ selectedFinishIds: nextIds });
  };

  // Synchronizuj stan modala z rodzicem - zawsze aktualizuj gdy isSheetOpen się zmienia
  useEffect(() => {
    if (onProductModalOpenChange) {
      onProductModalOpenChange(isSheetOpen || isMountingModalOpen);
    }
  }, [isSheetOpen, isMountingModalOpen, onProductModalOpenChange]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Sekcja Podpiętki */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-semibold ${styles.heading}`}>
            Podpiętki
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${styles.muted}`}>Opcjonalne</span>
            {!hideNavigation && (
              <Button
                onClick={onNext}
                disabled={!canProceedToSummary}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 hover:text-white text-gray-400 h-7 px-3 text-xs font-medium disabled:opacity-50"
              >
                Pomiń
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className={`w-5 h-5 animate-spin ${styles.muted}`} />
          </div>
        ) : podpietki.length === 0 ? (
          <div className={`text-center py-6 ${styles.empty}`}>
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
                    ${isSelected ? styles.cardSelected : styles.card}
                  `}
                  onClick={() => handlePodpietkaClick(podpietka)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handlePodpietkaClick(podpietka)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Wybierz podpiętkę ${podpietka.name}`}
                >
                  {/* Obraz */}
                  <div className={`relative aspect-square max-h-[120px] ${styles.image}`}>
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={podpietka.name}
                        fill
                        className="object-cover scale-90"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${styles.muted}`}>
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
                    <h4 className={`font-medium mb-0.5 text-xs ${styles.title}`}>{podpietka.name}</h4>
                    {podpietka.description && (
                      <p className={`text-[10px] line-clamp-2 mb-1.5 ${styles.muted}`}>{podpietka.description}</p>
                    )}
                    
                    {/* Dostępne kolory */}
                    {podpietka.availableColors && podpietka.availableColors.length > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className={`text-[10px] ${styles.muted}`}>Kolory:</span>
                        <div className="flex gap-0.5 flex-wrap">
                          {podpietka.availableColors.slice(0, 5).map((color) => (
                            <div
                              key={color}
                              className={`
                                w-3 h-3 rounded-full border ${styles.swatch}
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
                            <span className={`text-[10px] ${styles.muted}`}>+{podpietka.availableColors.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-bold ${styles.price}`}>
                        {formatPriceValue(podpietka.price)} <span className={`text-[10px] ${styles.muted}`}>PLN</span>
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 text-[10px] px-2 ${styles.details}`}
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
          <div className={`mt-3 p-3 rounded-lg ${styles.selectedBox}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium mb-0.5 ${styles.selectedLabel}`}>Wybrana podpiętka:</p>
                <p className={`font-semibold text-sm ${styles.selectedName}`}>{selectedPodpietka.name}</p>
                {config.podpietkaColor && (
                  <p className={`text-[10px] mt-0.5 ${styles.muted}`}>Kolor: {config.podpietkaColor}</p>
                )}
                {config.podpietkaMounting && (
                  <p className={`text-[10px] mt-0.5 ${styles.muted}`}>
                    {getPodpietkaMountingLabel(config.podpietkaMounting)}
                  </p>
                )}
                <p className={`text-xs mt-0.5 ${styles.muted}`}>
                  {formatPriceCurrency(selectedPodpietkaTotalPrice)}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemovePodpietka}
                className={`h-7 px-2 text-xs ${styles.remove}`}
              >
                Usuń
              </Button>
            </div>
          </div>
        )}
      </div>

      {finishes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-semibold ${styles.heading}`}>Dodatki do dywanika</h3>
            <span className={`text-xs ${styles.muted}`}>Opcjonalne</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {finishes.map((finish) => {
              const isSelected = selectedFinishIds.includes(finish.id);
              return (
                <button
                  key={finish.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleToggleFinish(finish.id)}
                  className={`rounded-lg border-2 px-3 py-3 text-left transition-all ${
                    isSelected ? styles.cardSelected : styles.card
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className={`text-sm font-semibold ${styles.title}`}>{finish.name}</span>
                    <span className={`shrink-0 text-sm font-bold ${styles.price}`}>
                      {formatPriceCurrency(finish.price)}
                    </span>
                  </span>
                  {finish.description ? (
                    <span className={`mt-1 block text-xs leading-relaxed ${styles.muted}`}>
                      {finish.description}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hideNavigation && (
      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
        <Button onClick={onPrevious} variant="outline" className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-white/10 hover:bg-white/5 active:scale-95">
          Wstecz
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceedToSummary}
          className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {nextLabel}
        </Button>
      </div>
      )}

      {/* Sheet z szczegółami podpiętki */}
      {selectedAccessory && (
        <AccessoryDetailsSheet
          accessory={selectedAccessory}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onAddToConfig={(accessory, color) => {
            handleAddPodpietka(accessory, color);
          }}
        />
      )}

      <PodpietkaMountingModal
        isOpen={isMountingModalOpen}
        onClose={handleMountingCancel}
        onSelect={handleMountingSelect}
        accessoryName={pendingPodpietka?.accessory.name}
      />
    </div>
  );
}
