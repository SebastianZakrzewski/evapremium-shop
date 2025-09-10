"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

const matColors: MatColor[] = [
  { id: "black", name: "Czarny", swatch: "/images/konfigurator/mats/black.webp" },
  { id: "grey", name: "Szary", swatch: "/images/konfigurator/mats/grey.webp" },
  { id: "beige", name: "Beżowy", swatch: "/images/konfigurator/mats/beige.webp" },
];

const edgeColors: EdgeColor[] = [
  { id: "black", name: "Czarny", hex: "#111111" },
  { id: "red", name: "Czerwony", hex: "#ef4444" },
  { id: "grey", name: "Szary", hex: "#6b7280" },
];

export default function Configurator() {
  const [selectedMat, setSelectedMat] = useState<string>(matColors[0].id);
  const [selectedEdge, setSelectedEdge] = useState<string>(edgeColors[0].id);
  const [selectedHeelPad, setSelectedHeelPad] = useState<string>("brak");

  const price = useMemo(() => {
    let base = 219; // PLN, starter price
    if (selectedHeelPad !== "brak") base += 29;
    if (selectedEdge === "red") base += 10; // small premium for contrast edge
    return base;
  }, [selectedEdge, selectedHeelPad]);

  const mat = useMemo(() => matColors.find(m => m.id === selectedMat)!, [selectedMat]);
  const edge = useMemo(() => edgeColors.find(e => e.id === selectedEdge)!, [selectedEdge]);

  return (
    <section className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <Image
                src={mat.swatch}
                alt={`Dywanik ${mat.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-4 text-xs md:text-sm bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-neutral-800">
                  Krawędź: <span style={{ color: edge.hex }}>{edge.name}</span>
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
              <h3 className="text-sm font-medium mb-3">Kolor dywaników</h3>
              <RadioGroup value={selectedMat} onValueChange={setSelectedMat} className="grid grid-cols-3 gap-3">
                {matColors.map((c) => (
                  <Label key={c.id} htmlFor={`mat-${c.id}`} className={`group relative cursor-pointer rounded-xl border ${selectedMat === c.id ? "border-white" : "border-neutral-800"} overflow-hidden focus-within:ring-2 focus-within:ring-white/30`}>
                    <RadioGroupItem value={c.id} id={`mat-${c.id}`} className="sr-only" />
                    <div className="relative aspect-square w-full">
                      <Image src={c.swatch} alt={c.name} fill className="object-cover" sizes="100px" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-xs py-1">{c.name}</div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Kolor obszycia</h3>
              <div className="grid grid-cols-3 gap-3">
                {edgeColors.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEdge(e.id)}
                    className={`rounded-xl border ${selectedEdge === e.id ? "border-white" : "border-neutral-800"} p-3 flex items-center gap-3 bg-neutral-900/50 hover:bg-neutral-900 transition`}
                    aria-pressed={selectedEdge === e.id}
                  >
                    <span className="inline-block h-5 w-5 rounded-full" style={{ backgroundColor: e.hex }} />
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

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs">Cena wstępna</p>
                <p className="text-2xl font-semibold">{price} zł</p>
              </div>
              <Button className="bg-white text-black hover:bg-white/90" onClick={() => window.open("/checkout", "_blank", "noopener,noreferrer")}>Przejdź do zamówienia</Button>
            </div>
            <p className="mt-2 text-xs text-white/60">Finalna cena może się różnić w zależności od modelu auta.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


