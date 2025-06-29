"use client";
import React, { useState } from "react";
import Image from "next/image";

const carpetColors = [
  { name: "Czarny", color: "#222" },
  { name: "Szary", color: "#888" },
  { name: "Brązowy", color: "#7a5c3e" },
  { name: "Czerwony", color: "#b13a2b" },
  { name: "Żółty", color: "#ffd600" },
  { name: "Niebieski", color: "#1e40af" },
];
const edgeColors = [
  { name: "Czarny", color: "#222" },
  { name: "Brązowy", color: "#7a5c3e" },
  { name: "Ciemnoczerwony", color: "#b13a2b" },
  { name: "Niebieski", color: "#1e40af" },
  { name: "Żółty", color: "#ffd600" },
  { name: "Czerwony", color: "#ff0033" },
];
const textures = [
  { name: "Plaster miodu", img: "/images/zalety/plaster.png" },
  { name: "3D", img: "/images/zalety/3d.png" },
];
const configurations = [
  { name: "Przód", img: "/images/products/audi.jpg" },
  { name: "Przód i tył", img: "/images/products/bmw.png" },
  { name: "Przód i tył + bagażnik", img: "/images/products/mercedes.jpg" },
  { name: "Mata do bagażnika", img: "/images/products/porsche.png" },
];
const carBrands = ["BMW", "Audi", "Mercedes", "Porsche", "Tesla"];
const carModels = ["Seria 3", "A4", "C-klasa", "911", "Model S"];
const carYears = ["2024", "2023", "2022", "2021", "2020"];
const carBodies = ["Sedan", "Kombi", "SUV", "Coupe"];
const carTransmissions = ["Manualna", "Automatyczna"];

export default function ConfiguratorSection() {
  const [selectedCarpet, setSelectedCarpet] = useState(0);
  const [selectedEdge, setSelectedEdge] = useState(0);
  const [selectedTexture, setSelectedTexture] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [body, setBody] = useState("");
  const [trans, setTrans] = useState("");

  return (
    <section className="w-full max-w-6xl mx-auto mt-10 rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8 bg-black border border-neutral-800">
      {/* Galeria */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full aspect-square relative rounded-lg overflow-hidden border-2 border-[#ff0033]">
          <Image src="/images/products/audi.jpg" alt="Dywanik" fill className="object-cover" />
        </div>
        <div className="flex gap-2 mt-4">
          <Image src="/images/products/audi.jpg" alt="mini1" width={60} height={60} className="rounded border-2 border-[#ff0033] object-cover" />
          <Image src="/images/products/bmw.png" alt="mini2" width={60} height={60} className="rounded border-2 border-[#ff0033] object-cover" />
          <Image src="/images/products/mercedes.jpg" alt="mini3" width={60} height={60} className="rounded border-2 border-[#ff0033] object-cover" />
        </div>
      </div>
      {/* Opcje konfiguracji */}
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-2xl font-bold mb-2 text-white">Dywaniki samochodowe na zamówienie</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-medium text-white">Kolor dywanika:</span>
          {carpetColors.map((c, i) => (
            <button key={c.name} onClick={() => setSelectedCarpet(i)} className={`w-7 h-7 rounded-full border-2 ${selectedCarpet === i ? "border-[#ff0033] ring-2 ring-[#ff0033]" : "border-neutral-700"}`} style={{ background: c.color }} />
          ))}
          <span className="ml-4 font-medium text-white">Kolor obszycia:</span>
          {edgeColors.map((c, i) => (
            <button key={c.name} onClick={() => setSelectedEdge(i)} className={`w-7 h-7 rounded-full border-2 ${selectedEdge === i ? "border-[#ff0033] ring-2 ring-[#ff0033]" : "border-neutral-700"}`} style={{ background: c.color }} />
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <span className="font-medium text-white">Tekstura:</span>
          {textures.map((t, i) => (
            <button key={t.name} onClick={() => setSelectedTexture(i)} className={`rounded border-2 p-1 bg-neutral-900 ${selectedTexture === i ? "border-[#ff0033] ring-2 ring-[#ff0033]" : "border-neutral-700"}`}><Image src={t.img} alt={t.name} width={40} height={40} /></button>
          ))}
        </div>
        <div className="flex gap-4 items-center">
          <span className="font-medium text-white">Konfiguracja:</span>
          {configurations.map((c, i) => (
            <button key={c.name} onClick={() => setSelectedConfig(i)} className={`rounded border-2 p-1 bg-neutral-900 ${selectedConfig === i ? "border-[#ff0033] ring-2 ring-[#ff0033]" : "border-neutral-700"}`}><Image src={c.img} alt={c.name} width={40} height={40} /></button>
          ))}
        </div>
        <div className="rounded-lg p-4 flex flex-col gap-3 bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff0033] w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800">1</span>
            <span className="text-white">Marka:</span>
            <select className="ml-2 border rounded px-2 py-1 bg-black text-white border-neutral-700 focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]" value={brand} onChange={e => setBrand(e.target.value)}>
              <option value="">wybierz</option>
              {carBrands.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff0033] w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800">2</span>
            <span className="text-white">Model:</span>
            <select className="ml-2 border rounded px-2 py-1 bg-black text-white border-neutral-700 focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]" value={model} onChange={e => setModel(e.target.value)}>
              <option value="">wybierz</option>
              {carModels.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff0033] w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800">3</span>
            <span className="text-white">Rocznik:</span>
            <select className="ml-2 border rounded px-2 py-1 bg-black text-white border-neutral-700 focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">wybierz</option>
              {carYears.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff0033] w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800">4</span>
            <span className="text-white">Nadwozie:</span>
            <select className="ml-2 border rounded px-2 py-1 bg-black text-white border-neutral-700 focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]" value={body} onChange={e => setBody(e.target.value)}>
              <option value="">wybierz</option>
              {carBodies.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff0033] w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800">5</span>
            <span className="text-white">Skrzynia biegów:</span>
            <select className="ml-2 border rounded px-2 py-1 bg-black text-white border-neutral-700 focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]" value={trans} onChange={e => setTrans(e.target.value)}>
              <option value="">wybierz</option>
              {carTransmissions.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-white">260 zł</span>
          <button className="bg-[#ff0033] text-white px-8 py-3 rounded-lg font-semibold opacity-60 cursor-not-allowed" disabled>DODAJ DO KOSZYKA</button>
        </div>
      </div>
    </section>
  );
} 