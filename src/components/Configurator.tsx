"use client";
import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getAvailableColors, getColorInfo } from "@/lib/color-mapping";

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
  { id: "3d-without-rims", name: "3D bez rantów", description: "Dywaniki 3D bez obszycia rantowego", priceModifier: -20 },
  { id: "classic", name: "Classic", description: "Klasyczne dywaniki płaskie", priceModifier: -40 },
];

const cellTypes: CellType[] = [
  { id: "diamonds", name: "Romby", description: "Struktura rombowa", priceModifier: 0 },
  { id: "honey", name: "Plaster miodu", description: "Struktura plastra miodu", priceModifier: 10 },
];

const setVariants: SetVariant[] = [
  { id: "basic", name: "Podstawowy", description: "4 dywaniki (przód + tył)", priceModifier: 0 },
  { id: "premium", name: "Premium", description: "5 dywaników (przód + tył + bagażnik)", priceModifier: 50 },
  { id: "complete", name: "Kompletny", description: "6 dywaników (przód + tył + bagażnik + dodatkowe)", priceModifier: 80 },
];

export default function Configurator() {
  const [selectedMat, setSelectedMat] = useState<string>("black");
  const [selectedEdge, setSelectedEdge] = useState<string>("black");
  const [selectedHeelPad, setSelectedHeelPad] = useState<string>("brak");
  const [selectedSetType, setSelectedSetType] = useState<string>(setTypes[0].id);
  const [selectedCellType, setSelectedCellType] = useState<string>(cellTypes[0].id);
  const [selectedSetVariant, setSelectedSetVariant] = useState<string>(setVariants[0].id);

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

  return (
    <section className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🚗</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block h-6 w-6 rounded-full border-2 border-white/20" style={{ backgroundColor: mat.color }} />
                    <span className="text-sm">Kolor: {mat.name}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block h-6 w-6 rounded-full border-2 border-white/20" style={{ backgroundColor: edge.hex }} />
                    <span className="text-sm">Obszycie: {edge.name}</span>
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
          <div className="w-full lg:w-[420px] xl:w-[460px] bg-neutral-950/60 border border-neutral-800 rounded-2xl p-5 md:p-6 h-fit">
            <h2 className="text-xl md:text-2xl font-semibold">Skonfiguruj swoje dywaniki</h2>
            <p className="text-white/70 text-sm mt-1">Zachowujemy stylistykę EvaPremium i jakość premium.</p>

            <Separator className="my-5 bg-neutral-800" />

            <div>
              <h3 className="text-sm font-medium mb-3">Rodzaj dywaników</h3>
              <RadioGroup value={selectedSetType} onValueChange={setSelectedSetType} className="space-y-3">
                {setTypes.map((s) => (
                  <Label key={s.id} htmlFor={`set-${s.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetType === s.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                    <RadioGroupItem value={s.id} id={`set-${s.id}`} className="sr-only" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{s.name}</div>
                        <div className="text-xs text-white/60">{s.description}</div>
                      </div>
                      {s.priceModifier !== 0 && (
                        <div className={`text-xs font-medium ${s.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {s.priceModifier > 0 ? '+' : ''}{s.priceModifier} zł
                        </div>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Rodzaj komórek</h3>
              <RadioGroup value={selectedCellType} onValueChange={setSelectedCellType} className="space-y-3">
                {cellTypes.map((c) => (
                  <Label key={c.id} htmlFor={`cell-${c.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedCellType === c.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                    <RadioGroupItem value={c.id} id={`cell-${c.id}`} className="sr-only" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-white/60">{c.description}</div>
                      </div>
                      {c.priceModifier !== 0 && (
                        <div className={`text-xs font-medium ${c.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.priceModifier > 0 ? '+' : ''}{c.priceModifier} zł
                        </div>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Rodzaj zestawu</h3>
              <RadioGroup value={selectedSetVariant} onValueChange={setSelectedSetVariant} className="space-y-3">
                {setVariants.map((v) => (
                  <Label key={v.id} htmlFor={`variant-${v.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedSetVariant === v.id ? "border-white" : "border-neutral-800"} p-4 bg-neutral-900/50 hover:bg-neutral-900 transition`}>
                    <RadioGroupItem value={v.id} id={`variant-${v.id}`} className="sr-only" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-white/60">{v.description}</div>
                      </div>
                      {v.priceModifier !== 0 && (
                        <div className={`text-xs font-medium ${v.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {v.priceModifier > 0 ? '+' : ''}{v.priceModifier} zł
                        </div>
                      )}
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Kolor dywaników</h3>
              <RadioGroup value={selectedMat} onValueChange={setSelectedMat} className="grid grid-cols-3 gap-3">
                {availableMaterialColors.map((c) => (
                  <Label key={c.id} htmlFor={`mat-${c.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedMat === c.id ? "border-white" : "border-neutral-800"} p-3 bg-neutral-900/50 hover:bg-neutral-900 transition focus-within:ring-2 focus-within:ring-white/30`}>
                    <RadioGroupItem value={c.id} id={`mat-${c.id}`} className="sr-only" />
                    <div className="flex items-center gap-3">
                      <span className="inline-block h-8 w-8 rounded-full border-2 border-white/20" style={{ backgroundColor: c.color }} />
                      <span className="text-sm">{c.name}</span>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Kolor obszycia</h3>
              <div className="grid grid-cols-3 gap-3">
                {availableEdgeColors.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEdge(e.id)}
                    className={`rounded-xl border ${selectedEdge === e.id ? "border-white" : "border-neutral-800"} p-3 flex items-center gap-3 bg-neutral-900/50 hover:bg-neutral-900 transition`}
                    aria-pressed={selectedEdge === e.id}
                  >
                    <span className="inline-block h-8 w-8 rounded-full border-2 border-white/20" style={{ backgroundColor: e.hex }} />
                    <span className="text-sm">{e.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
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

            <Separator className="my-5 bg-neutral-800" />

            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70">Wybrana konfiguracja:</span>
                </div>
                <div className="text-xs text-white/60 space-y-1">
                  <div>• {setType.name}</div>
                  <div>• {cellType.name}</div>
                  <div>• {setVariant.name}</div>
                  <div>• {mat.name} + {edge.name} obszycie</div>
                  {selectedHeelPad !== "brak" && <div>• Ochraniacz pod piętę</div>}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs">Cena wstępna</p>
                  <p className="text-2xl font-semibold">{price} zł</p>
                </div>
                <Button className="bg-white text-black hover:bg-white/90" onClick={() => window.open("/checkout", "_blank", "noopener,noreferrer")}>Przejdź do zamówienia</Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/60">Finalna cena może się różnić w zależności od modelu auta.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


