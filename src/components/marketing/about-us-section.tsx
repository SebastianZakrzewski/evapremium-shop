"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Award, 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Truck, 
  Star,
  CheckCircle,
  TrendingUp,
  Globe,
  ArrowRight
} from 'lucide-react';
import SectionHeading from "@/components/ui/section-heading";
import { cn } from '@/lib/utils';

const stats = [
  {
    icon: Award,
    value: "13+",
    label: "Lat doświadczenia",
    description: "Od 2010 roku na rynku"
  },
  {
    icon: Users,
    value: "15K+",
    label: "Zadowolonych klientów",
    description: "W całej Europie"
  },
  {
    icon: Target,
    value: "2500+",
    label: "Modeli samochodów",
    description: "Precyzyjnie zmierzonych"
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Średnia ocena",
    description: "Z tysięcy opinii"
  }
];

const values = [
  {
    icon: Shield,
    title: "Jakość Premium",
    description: "Używamy tylko certyfikowanego materiału EVA o podwyższonej gęstości i trwałości."
  },
  {
    icon: Heart,
    title: "Pasja do Motoryzacji",
    description: "Każdy komplet dywaników traktujemy jak element tuningu wnętrza."
  },
  {
    icon: TrendingUp,
    title: "Ciągły Rozwój",
    description: "Stale poszerzamy bazę szablonów o najnowsze modele samochodów."
  },
  {
    icon: Users,
    title: "Podejście do Klienta",
    description: "Jesteśmy doradcami, nie tylko sprzedawcami. Pomagamy w wyborze."
  },
  {
    icon: Truck,
    title: "Ekspresowa Realizacja",
    description: "Wysyłka w 24-48h dla większości popularnych modeli."
  },
  {
    icon: CheckCircle,
    title: "Gwarancja Satysfakcji",
    description: "Pełne wsparcie posprzedażowe i bezproblemowe zwroty."
  }
];

export default function AboutUsSection() {
  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden py-20 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-[#111] border border-white/5 p-8 rounded-2xl hover:border-red-900/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                  {stat.value}
                </h3>
                <p className="text-white font-medium mb-1">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Mission & Vision - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative">
             <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-blue-600 opacity-20 blur-2xl rounded-full" />
             <div className="relative bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-6">
                  <Target className="w-4 h-4" />
                  Nasza Misja
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Redefinicja standardów ochrony wnętrza
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Naszym celem jest dostarczenie produktu, który nie tylko chroni samochód, ale staje się jego integralną, estetyczną częścią. Wierzymy, że praktyczność nie musi oznaczać kompromisów w wyglądzie.
                </p>
                <ul className="space-y-4">
                  {['Innowacja materiałowa', 'Lokalna produkcja', 'Ekologia'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-[#111] border border-white/5 p-8 rounded-2xl hover:bg-[#161616] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Globalna Wizja</h4>
                    <p className="text-gray-400 leading-relaxed">
                      Chcemy być pierwszym wyborem dla świadomych kierowców w Europie, wyznaczając trendy w akcesoriach samochodowych.
                    </p>
                  </div>
                </div>
             </div>
             <div className="bg-[#111] border border-white/5 p-8 rounded-2xl hover:bg-[#161616] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Mistrzowska Jakość</h4>
                    <p className="text-gray-400 leading-relaxed">
                      Każdy dywanik przechodzi rygorystyczną kontrolę jakości. Nie uznajemy dróg na skróty w procesie produkcji.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-24">
          <SectionHeading title="NASZE" highlight="WARTOŚCI" className="mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="p-6 rounded-xl bg-[#111] border border-white/5 hover:border-white/20 transition-all duration-300 group">
                  <Icon className="w-8 h-8 text-gray-500 group-hover:text-white mb-4 transition-colors" />
                  <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-white/10 p-8 md:p-16 text-center">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Dołącz do Świata EvaPremium
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Przekonaj się, dlaczego tysiące kierowców wybrało nasze rozwiązania. 
              Zmień wnętrze swojego auta już dziś.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#dywaniki" 
                className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Zobacz Ofertę
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="tel:+48793993430" 
                className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-semibold transition-colors"
              >
                Zadzwoń do nas
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
