"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Shield, Zap, Droplets, Wrench, Truck, Star } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "Czy dywaniki EVA pasują do każdego modelu auta?",
      answer: "Tak! Produkujemy dywaniki na miarę do ponad 95% popularnych modeli samochodów. Nasze dywaniki są precyzyjnie wycinane na podstawie oryginalnych szablonów, dzięki czemu idealnie dopasowują się do każdego zakamarka podłogi w Twoim aucie.",
      icon: Wrench,
      category: "Dopasowanie"
    },
    {
      id: 2,
      question: "Jak czyścić dywaniki EVA?",
      answer: "Czyszczenie dywaników EVA to pestka! Wystarczy opłukać je wodą z węża, przetrzeć wilgotną szmatką lub użyć myjki ciśnieniowej. Materiał EVA nie wchłania brudu, więc wszystko spływa z powierzchni. Można je również myć w zmywarce!",
      icon: Droplets,
      category: "Pielęgnacja"
    },
    {
      id: 3,
      question: "Czy dywaniki EVA są w 100% wodoodporne?",
      answer: "Absolutnie! Materiał EVA jest całkowicie wodoodporny i nie przepuszcza wilgoci. Dzięki temu chroni podłogę auta przed korozją, pleśnią i nieprzyjemnymi zapachami. Idealne na zimę i lato!",
      icon: Shield,
      category: "Właściwości"
    },
    {
      id: 4,
      question: "Jak długo trwa realizacja zamówienia?",
      answer: "Standardowy czas realizacji to 2-5 dni roboczych. W przypadku nietypowych modeli może to potrwać do 7 dni. Oferujemy również ekspresową realizację w 24h za dodatkową opłatą. Wszystkie zamówienia wysyłamy kurierem z możliwością śledzenia.",
      icon: Truck,
      category: "Dostawa"
    },
    {
      id: 5,
      question: "Czy dywaniki EVA są trwałe?",
      answer: "Tak! Dywaniki EVA zachowują swoje właściwości przez lata. Materiał nie traci elastyczności, nie kruszy się i nie zmienia koloru pod wpływem słońca. Gwarantujemy 3 lata gwarancji na nasze produkty.",
      icon: Star,
      category: "Trwałość"
    },
    {
      id: 6,
      question: "Jak montować dywaniki EVA?",
      answer: "Montaż jest bardzo prosty! Wystarczy wyjąć dywaniki z opakowania, rozłożyć je na podłodze auta i delikatnie docisnąć do krawędzi. Materiał EVA jest elastyczny, więc łatwo się dopasowuje. Nie wymagają żadnych dodatkowych elementów montażowych.",
      icon: Zap,
      category: "Montaż"
    },
    {
      id: 7,
      question: "Czy dywaniki EVA są bezpieczne dla dzieci?",
      answer: "Tak! Materiał EVA jest całkowicie bezpieczny i nietoksyczny. Nie zawiera ftalanów, ołowiu ani innych szkodliwych substancji. Jest hipoalergiczny i może być używany w samochodach z dziećmi bez obaw.",
      icon: Shield,
      category: "Bezpieczeństwo"
    },
    {
      id: 8,
      question: "Jakie kolory dywaników EVA są dostępne?",
      answer: "Oferujemy szeroką gamę kolorów: czarny, szary, beżowy, brązowy, granatowy, czerwony i wiele innych. Wszystkie kolory są trwałe i nie blakną. Możemy również wykonać dywaniki w niestandardowych kolorach na specjalne zamówienie.",
      icon: HelpCircle,
      category: "Kolorystyka"
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animowane tło */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-pulse-glow">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            Najczęściej zadawane pytania
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Wszystko co musisz wiedzieć o dywanikach EVA Premium. 
            <span className="text-red-400 font-semibold"> Nie znalazłeś odpowiedzi?</span> Skontaktuj się z nami!
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item) => {
              const isOpen = openItems.includes(item.id);
              const IconComponent = item.icon;
              
              return (
                <div
                  key={item.id}
                  className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-red-400/30 hover:shadow-lg hover:shadow-red-500/10"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-1">
                          {item.question}
                        </h3>
                        <span className="text-sm text-red-400 font-medium">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ChevronDown 
                      className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6 pt-2">
                      <div className="pl-14">
                        <p className="text-gray-300 leading-relaxed text-base md:text-lg">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Masz inne pytania?
            </h3>
            <p className="text-gray-300 mb-6">
              Nasz zespół ekspertów chętnie odpowie na wszystkie Twoje pytania dotyczące dywaników EVA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+48533791868"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
              >
                <Zap className="w-5 h-5 mr-2" />
                Zadzwoń: +48 533 791 868
              </a>
              <a
                href="mailto:kontakt@evapremium.pl"
                className="inline-flex items-center justify-center px-6 py-3 border border-red-500 text-red-400 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Napisz do nas
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 