"use client";

import Image from "next/image";
import { Zap } from "lucide-react";

export default function GlebokaStrukturaKomorekSection() {
  return (
    <section id="gleboka-struktura-komorek-section" className="py-12 md:py-16 bg-black relative overflow-hidden">
      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-black to-red-600/5"></div>
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-pink-400 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-pink-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 transition-all duration-1000 ease-out">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full mb-6 animate-pulse-glow">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
            NOWOCZESNY MATERIAŁ EVA
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Specjalna struktura materiału EVA skutecznie zatrzymuje brud i wilgoć, zapewniając czystość w Twoim aucie nawet w trudnych warunkach.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
          {/* Obrazek */}
          <div className="relative w-full md:w-1/2 flex justify-center">
            <div className="relative bg-black rounded-2xl p-6 border-4 border-pink-600/50 shadow-2xl w-full max-w-md">
              <Image
                src="/images/zalety/pianka.webp"
                alt="Nowoczesny Materiał EVA"
                width={400}
                height={400}
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
          {/* Opis cechy */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Dlaczego to ważne?</h3>
            <p className="text-gray-200 text-lg text-center mb-4">
              Nowoczesny materiał EVA z głęboką strukturą komórek działa jak bariera, która blokuje przedostawanie się zabrudzeń i wilgoci do wnętrza samochodu. Dzięki temu dywaniki EVA są nie tylko łatwe w czyszczeniu, ale także skutecznie chronią podłogę auta.
            </p>
            <ul className="list-disc text-left text-gray-300 pl-6 space-y-2">
              <li>Skuteczne zatrzymywanie błota, piasku i wody</li>
              <li>Łatwe opróżnianie i czyszczenie dywaników</li>
              <li>Ochrona przed nieprzyjemnymi zapachami</li>
              <li>Wytrzymałość i trwałość na lata</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
} 