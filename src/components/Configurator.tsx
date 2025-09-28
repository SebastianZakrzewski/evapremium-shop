"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { getAvailableColors, getColorInfo } from "@/lib/color-mapping";
import { getMatImagePath } from "@/lib/image-mapping";
import { useCart } from "@/hooks/useCart";
import { ConfiguratorService } from "@/lib/services/ConfiguratorService";
import { ConfigurationData } from "@/lib/types/product";

// Mapowanie ID na typy dla funkcji getMatImagePath
const getMatTypeForImage = (setTypeId: string): '3d' | 'classic' => {
  if (setTypeId === 'classic') return 'classic';
  return '3d'; // dla '3d-with-rims' i '3d-without-rims'
};

type MatColor = {
  id: string;
  name: string;
  swatch: string; // image path
};

type EdgeColor = {
  id: string;
  name: string;
  hex: string;
};

type SetType = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
};

type CellType = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
};

type SetVariant = {
  id: string;
  name: string;
  description: string;
  priceModifier: number;
};

// Kolory będą generowane dynamicznie na podstawie wybranej struktury komórek

const setTypes: SetType[] = [
  { id: "3d-with-rims", name: "3D z rantami", description: "Dywaniki 3D z obszyciem rantowym", priceModifier: 0 },
  { id: "classic", name: "3D bez rantów", description: "Klasyczne dywaniki płaskie", priceModifier: -40 },
];

const cellTypes: CellType[] = [
  { id: "diamonds", name: "Romby", description: "Struktura rombowa", priceModifier: 0 },
  { id: "honey", name: "Plaster miodu", description: "Struktura plastra miodu", priceModifier: 10 },
];

const setVariants: SetVariant[] = [
  { id: "front", name: "Starter", description: "2 dywaniki (tylko przód)", priceModifier: -30 },
  { id: "basic", name: "Podstawowy", description: "5 dywaników (przód + tył + ochrona na tunel środkowy)", priceModifier: 0 },
  { id: "premium", name: "Premium", description: "5 dywaników (przód + tył + bagażnik)", priceModifier: 0 },
  { id: "complete", name: "Mata do Bagażnika", description: "6 dywaników (przód + tył + bagażnik + dodatkowe)", priceModifier: 0 },
];

export default function Configurator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandParam = searchParams.get('brand');
  const { addToCart, isLoading: cartLoading, error: cartError } = useCart();
  
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [selectedMat, setSelectedMat] = useState<string>("black");
  const [selectedEdge, setSelectedEdge] = useState<string>("black");
  const [selectedHeelPad, setSelectedHeelPad] = useState<string>("brak");
  const [selectedSetType, setSelectedSetType] = useState<string>(setTypes[0].id);
  const [selectedCellType, setSelectedCellType] = useState<string>(cellTypes[0].id);
  const [selectedSetVariant, setSelectedSetVariant] = useState<string>(setVariants[0].id);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Oblicz datę dostawy (2 tygodnie od dzisiaj)
  const deliveryDate = useMemo(() => {
    const today = new Date();
    const delivery = new Date(today);
    delivery.setDate(today.getDate() + 14); // +2 tygodnie
    
    return delivery.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const totalSections = 6;

  const nextSection = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      const configData: ConfigurationData = {
        setType: selectedSetType,
        cellType: selectedCellType,
        setVariant: selectedSetVariant,
        materialColor: selectedMat,
        edgeColor: selectedEdge,
        heelPad: selectedHeelPad,
        carDetails: brandParam ? {
          brand: brandParam,
          model: 'Unknown',
          year: '2023'
        } : undefined
      };

      console.log('🛒 === DODAWANIE DO KOSZYKA ===');
      console.log('📋 Dane konfiguracji:', configData);
      
      const product = ConfiguratorService.createProductFromConfiguration(configData);
      
      console.log('🏗️ Utworzony produkt:', {
        id: product.id,
        sessionId: product.sessionId,
        configuration: product.configuration,
        pricing: product.pricing,
        carDetails: product.carDetails,
        status: product.status,
        createdAt: product.createdAt
      });
      
      await addToCart(product);

      console.log('✅ Produkt dodany do koszyka:', product.id);
      console.log('💰 Cena produktu:', `${product.pricing.totalPrice} zł`);
      console.log('🔧 Konfiguracja:', {
        'Rodzaj zestawu': selectedSetType,
        'Struktura komórek': selectedCellType,
        'Wariant': selectedSetVariant,
        'Kolor materiału': selectedMat,
        'Kolor obszycia': selectedEdge,
        'Podkładka pod piętę': selectedHeelPad
      });
      console.log('🚗 Dane samochodu:', product.carDetails || 'Brak');
      console.log('🛒 === KONIEC DODAWANIA ===');
      
      // Opcjonalnie: przekieruj do koszyka
      // router.push('/cart');
      
    } catch (error) {
      console.error('❌ Błąd podczas dodawania do koszyka:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getSectionTitle = (section: number) => {
    const titles = [
      "Rodzaj zestawu",
      "Rodzaj dywaników", 
      "Rodzaj komórek",
      "Kolory",
      "Dodatki",
      "Podsumowanie"
    ];
    return titles[section] || "";
  };

  // Dynamiczne kolory na podstawie wybranej struktury komórek
  const availableMaterialColors = useMemo(() => {
    return getAvailableColors(selectedCellType, 'material').map(colorKey => ({
      id: colorKey,
      name: getColorInfo(colorKey).name,
      color: getColorInfo(colorKey).color
    }));
  }, [selectedCellType]);

  const availableEdgeColors = useMemo(() => {
    return getAvailableColors(selectedCellType, 'border').map(colorKey => ({
      id: colorKey,
      name: getColorInfo(colorKey).name,
      hex: getColorInfo(colorKey).color
    }));
  }, [selectedCellType]);

  // Resetuj wybrane kolory jeśli nie są dostępne dla nowej struktury komórek
  useEffect(() => {
    if (!availableMaterialColors.find(c => c.id === selectedMat)) {
      setSelectedMat(availableMaterialColors[0]?.id || "black");
    }
    if (!availableEdgeColors.find(c => c.id === selectedEdge)) {
      setSelectedEdge(availableEdgeColors[0]?.id || "black");
    }
  }, [selectedCellType, availableMaterialColors, availableEdgeColors, selectedMat, selectedEdge]);

  const price = useMemo(() => {
    let base = 219; // PLN, starter price
    if (selectedHeelPad !== "brak") base += 29;
    if (selectedEdge === "red") base += 10; // small premium for contrast edge
    
    // Dodaj modyfikatory cenowe dla nowych opcji
    const setType = setTypes.find(s => s.id === selectedSetType);
    const cellType = cellTypes.find(c => c.id === selectedCellType);
    const setVariant = setVariants.find(v => v.id === selectedSetVariant);
    
    if (setType) base += setType.priceModifier;
    if (cellType) base += cellType.priceModifier;
    if (setVariant) base += setVariant.priceModifier;
    
    return Math.max(base, 99); // Minimalna cena 99 zł
  }, [selectedEdge, selectedHeelPad, selectedSetType, selectedCellType, selectedSetVariant]);

  const mat = useMemo(() => availableMaterialColors.find(m => m.id === selectedMat)!, [selectedMat, availableMaterialColors]);
  const edge = useMemo(() => availableEdgeColors.find(e => e.id === selectedEdge)!, [selectedEdge, availableEdgeColors]);
  const setType = useMemo(() => setTypes.find(s => s.id === selectedSetType)!, [selectedSetType]);
  const cellType = useMemo(() => cellTypes.find(c => c.id === selectedCellType)!, [selectedCellType]);
  const setVariant = useMemo(() => setVariants.find(v => v.id === selectedSetVariant)!, [selectedSetVariant]);

  // Obraz dywanika z wszystkimi dependencies
  const matImagePath = useMemo(() => {
    const matType = getMatTypeForImage(selectedSetType);
    const path = getMatImagePath(
      matType,
      selectedCellType as 'diamonds' | 'honey',
      selectedMat,
      selectedEdge
    );
    
    // Debug - wyświetl ścieżkę w konsoli
    console.log('🖼️ Obraz dywanika:', {
      selectedSetType,
      matType,
      selectedCellType,
      selectedMat,
      selectedEdge,
      path
    });
    
    return path;
  }, [selectedSetType, selectedCellType, selectedMat, selectedEdge]);

  return (
    <section className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Lewa strona - wizualizacja */}
          <div className="w-full lg:w-[900px] xl:w-[1000px]">
            <div className="relative w-full h-[700px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
              {/* Rzeczywisty obraz dywanika */}
              <Image
                key={`${selectedSetType}-${selectedCellType}-${selectedMat}-${selectedEdge}`}
                src={matImagePath}
                alt={`Dywanik ${mat.name} z obszyciem ${edge.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback do emoji jeśli obraz nie istnieje
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              
              {/* Fallback z emoji i kolorami */}
              <div className="absolute inset-0 flex items-center justify-center text-center space-y-4" style={{ display: 'none' }}>
                <div className="text-6xl">🚗</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span 
                      className="inline-block h-4 w-4 rounded-full border-2 shadow-lg" 
                      style={{ 
                        backgroundColor: mat.color,
                        borderColor: mat.color === '#ffffff' || mat.color === '#d9d7c7' || mat.color === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                      }} 
                    />
                    <span className="text-sm font-medium">Kolor: {mat.name}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span 
                      className="inline-block h-4 w-4 rounded-full border-2 shadow-lg" 
                      style={{ 
                        backgroundColor: edge.hex,
                        borderColor: edge.hex === '#ffffff' || edge.hex === '#d9d7c7' || edge.hex === '#bdbdbd' ? '#333' : 'rgba(255,255,255,0.3)'
                      }} 
                    />
                    <span className="text-sm font-medium">Obszycie: {edge.name}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 text-xs md:text-sm bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-neutral-800">
                  <div>Typ: {setType.name}</div>
                  <div>Komórki: {cellType.name}</div>
                  <div>Zestaw: {setVariant.name}</div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Wizualizacja poglądowa. Docelowy kształt dywanika dopasujemy do Twojego modelu auta.
            </p>
          </div>

          {/* Prawa strona - konfigurator z sekcjami */}
          <div className="w-full lg:w-[700px] xl:w-[780px] bg-neutral-950/60 border border-neutral-800 rounded-2xl p-8 md:p-10 h-[900px] flex flex-col overflow-y-auto pb-24">
            {/* Header z progressem */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                Skonfiguruj dywaniki
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {brandParam 
                  ? `Dopasowane dywaniki EVA Premium dla marki ${brandParam.toUpperCase()}. Zachowujemy stylistykę EvaPremium i jakość premium.`
                  : 'Zachowujemy stylistykę EvaPremium i jakość premium.'
                }
              </p>
              
              {/* Progress indicator */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 bg-neutral-800 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/60">
                  {currentSection + 1} / {totalSections}
                </span>
              </div>
            </div>

            <Separator className="mb-6 bg-neutral-800" />

            {/* Sekcja 1: Rodzaj zestawu */}
            {currentSection === 0 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj zestawu</h3>
                  <RadioGroup value={selectedSetVariant} onValueChange={setSelectedSetVariant} className="space-y-3">
                    {setVariants.map((v) => (
                      <Label key={v.id} htmlFor={`variant-${v.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetVariant === v.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                        <RadioGroupItem value={v.id} id={`variant-${v.id}`} className="sr-only" />
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{v.name}</div>
                            <div className="text-xs text-white/60">{v.description}</div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {(v.id === "front" || v.id === "basic" || v.id === "premium" || v.id === "complete") && (
                              <div className="flex items-center justify-center">
                                <Image
                                  src={v.id === "front" ? "/konfigurator/zestaw/przod.png" : v.id === "basic" ? "/konfigurator/zestaw/pt.png" : v.id === "premium" ? "/konfigurator/zestaw/ptb.png" : "/konfigurator/zestaw/mata.png"}
                                  alt={`Wizualizacja zestawu ${v.name}`}
                                  width={80}
                                  height={48}
                                  className="rounded-lg"
                                  sizes="80px"
                                />
                              </div>
                            )}
                            {v.priceModifier !== 0 && v.id !== 'front' && (
                              <div className={`text-xs font-medium ${v.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {v.priceModifier > 0 ? '+' : ''}{v.priceModifier} zł
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 2: Rodzaj dywaników */}
            {currentSection === 1 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj dywaników</h3>
                  <RadioGroup value={selectedSetType} onValueChange={setSelectedSetType} className="space-y-3">
                    {setTypes.map((s) => (
                      <Label key={s.id} htmlFor={`set-${s.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetType === s.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                        <RadioGroupItem value={s.id} id={`set-${s.id}`} className="sr-only" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{s.name}</div>
                            <div className="text-xs text-white/60">{s.description}</div>
                          </div>
                          {s.priceModifier !== 0 && s.id !== 'classic' && (
                            <div className={`text-xs font-medium ${s.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {s.priceModifier > 0 ? '+' : ''}{s.priceModifier} zł
                            </div>
                          )}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 3: Rodzaj komórek */}
            {currentSection === 2 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Wybierz rodzaj komórek</h3>
                  <RadioGroup value={selectedCellType} onValueChange={setSelectedCellType} className="space-y-3">
                    {cellTypes.map((c) => (
                      <Label key={c.id} htmlFor={`cell-${c.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedCellType === c.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                        <RadioGroupItem value={c.id} id={`cell-${c.id}`} className="sr-only" />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-xs text-white/60">{c.description}</div>
                          </div>
                          {c.priceModifier !== 0 && c.id !== 'honey' && (
                            <div className={`text-xs font-medium ${c.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {c.priceModifier > 0 ? '+' : ''}{c.priceModifier} zł
                            </div>
                          )}
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 4: Kolory */}
            {currentSection === 3 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Kolor dywaników</h3>
                  <RadioGroup value={selectedMat} onValueChange={setSelectedMat} className="grid grid-cols-7 gap-1.5">
                    {availableMaterialColors.map((c) => (
                      <Label key={c.id} htmlFor={`mat-${c.id}`} className={`group relative cursor-pointer rounded-lg border-2 ${selectedMat === c.id ? "border-white ring-2 ring-white/30" : "border-neutral-700"} hover:opacity-80 transition-all duration-200 focus-within:ring-2 focus-within:ring-white/30 aspect-square overflow-hidden`}>
                        <RadioGroupItem value={c.id} id={`mat-${c.id}`} className="sr-only" />
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: c.color,
                            filter: 'brightness(1.15) saturate(1.25) contrast(1.05)'
                          }}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          data-testid="texture-overlay"
                          style={{
                            backgroundImage: `url(${selectedCellType === 'honey' ? '/konfigurator/komorki/plaster.png' : '/konfigurator/komorki/romb.png'})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            mixBlendMode: 'multiply',
                            opacity: 0.35
                          }}
                        />
                        <div className="flex items-center justify-center h-full relative z-[1]">
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Kolor obszycia</h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {availableEdgeColors.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEdge(e.id)}
                        className={`rounded-lg border-2 ${selectedEdge === e.id ? "border-white ring-2 ring-white/30" : "border-neutral-700"} hover:opacity-80 transition-all duration-200 aspect-square cursor-pointer`}
                        style={{ backgroundColor: e.hex }}
                        aria-pressed={selectedEdge === e.id}
                      >
                        <div className="flex items-center justify-center h-full">
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sekcja 5: Dodatki */}
            {currentSection === 4 && (
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Ochraniacz pod piętę</h3>
                  <RadioGroup value={selectedHeelPad} onValueChange={setSelectedHeelPad} className="grid grid-cols-2 gap-3">
                    {[
                      { id: "brak", name: "Brak" },
                      { id: "gumowy", name: "Gumowy" },
                    ].map((h) => (
                      <Label key={h.id} htmlFor={`heel-${h.id}`} className={`cursor-pointer rounded-xl border ${selectedHeelPad === h.id ? "border-white" : "border-neutral-800"} px-4 py-3 bg-neutral-900/50 hover:bg-neutral-900 transition` }>
                        <RadioGroupItem value={h.id} id={`heel-${h.id}`} className="sr-only" />
                        <span className="text-sm">{h.name}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Sekcja 6: Podsumowanie */}
            {currentSection === 5 && (
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/70">Wybrana konfiguracja:</span>
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>• {setVariant.name}</div>
                      <div>• {setType.name}</div>
                      <div>• {cellType.name}</div>
                      <div>• {mat.name} + {edge.name} obszycie</div>
                      {selectedHeelPad !== "brak" && <div>• Ochraniacz pod piętę</div>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-xs">Cena wstępna</p>
                      <p className="text-2xl font-semibold">{price} zł</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/60">Finalna cena może się różnić w zależności od modelu auta.</p>
                
                {/* Szacowany czas dostawy */}
                <div className="mt-6 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-white/80 font-medium">Szacowany czas dostawy</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 ml-4">
                    Szacowana data dostawy: <span className="text-green-400 font-medium">{deliveryDate}</span>
                  </p>
                </div>
                
                {/* Uwagi do zamówienia */}
                <div className="mt-4">
                  <label htmlFor="order-notes" className="block text-xs text-white/70 mb-2">
                    Uwagi do zamówienia (opcjonalnie)
                  </label>
                  <textarea
                    id="order-notes"
                    placeholder="Dodatkowe informacje, uwagi, specjalne życzenia..."
                    className="w-full h-20 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
                
                {/* Checkbox zgody */}
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacy-agreement"
                    className="w-4 h-4 text-red-600 bg-neutral-800 border-neutral-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="privacy-agreement" className="text-xs text-white/70 cursor-pointer">
                    Zgadzam się z polityką prywatności i regulaminem
                  </label>
                </div>
              </div>
            )}


            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-800">
              <Button
                variant="outline"
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2 border-neutral-700 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Wstecz
              </Button>
              
              
              {currentSection === totalSections - 1 ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || cartLoading}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-8 py-3 text-lg font-semibold min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart || cartLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dodawanie...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Dodaj do Koszyka
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextSection}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                >
                  Dalej
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


