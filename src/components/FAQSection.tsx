"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Czy dywaniki pasują do każdego modelu auta?",
    answer: "Tak, produkujemy dywaniki na miarę do większości popularnych modeli samochodów. Nasza baza danych zawiera ponad 5000 modeli pojazdów. Jeśli nie znajdziesz swojego modelu, skontaktuj się z nami - możemy wykonać dywaniki na specjalne zamówienie.",
    category: "Dopasowanie"
  },
  {
    id: 2,
    question: "Jak czyścić dywaniki EVA?",
    answer: "Dywaniki EVA są niezwykle łatwe w czyszczeniu. Wystarczy opłukać je wodą lub przetrzeć wilgotną szmatką. W przypadku większych zabrudzeń możesz użyć delikatnego detergentu. Materiał EVA jest wodoodporny i szybko schnie.",
    category: "Pielęgnacja"
  },
  {
    id: 3,
    question: "Ile trwa realizacja zamówienia?",
    answer: "Standardowy czas realizacji to 2-5 dni roboczych. W przypadku specjalnych zamówień lub nietypowych modeli aut czas może się wydłużyć do 7-10 dni. Oferujemy również ekspresową realizację w 24h za dodatkową opłatą.",
    category: "Dostawa"
  },
  {
    id: 4,
    question: "Jakie są zalety materiału EVA?",
    answer: "Materiał EVA (Etylenowo-Octan Winylu) charakteryzuje się doskonałą wodoodpornością, łatwością czyszczenia, odpornością na ścieranie i elastycznością. Jest również antybakteryjny i nie uczula. Dywaniki EVA skutecznie zatrzymują brud i wilgoć, chroniąc oryginalne dywaniki samochodowe.",
    category: "Materiał"
  },
  {
    id: 5,
    question: "Czy dywaniki mają gwarancję?",
    answer: "Tak, wszystkie nasze dywaniki objęte są 2-letnią gwarancją na wady materiałowe i wykonania. Gwarancja obejmuje również odporność na normalne użytkowanie. W przypadku problemów zwracamy lub wymieniamy produkt bezpłatnie.",
    category: "Gwarancja"
  },
  {
    id: 6,
    question: "Jakie kolory są dostępne?",
    answer: "Oferujemy szeroką paletę kolorów: czarny, szary, beżowy, brązowy, niebieski, czerwony, zielony i wiele innych. Kolory są dopasowane do najpopularniejszych odcieni wnętrz samochodowych. Możemy również wykonać dywaniki w kolorach specjalnych na zamówienie.",
    category: "Kolorystyka"
  },
  {
    id: 7,
    question: "Czy dywaniki są bezpieczne dla dzieci?",
    answer: "Tak, dywaniki EVA są w pełni bezpieczne dla dzieci i dorosłych. Materiał jest nietoksyczny, antybakteryjny i nie zawiera szkodliwych substancji. Dodatkowo, antypoślizgowa powierzchnia zapewnia bezpieczeństwo podczas jazdy.",
    category: "Bezpieczeństwo"
  },
  {
    id: 8,
    question: "Jak zamontować dywaniki w samochodzie?",
    answer: "Montaż jest bardzo prosty - wystarczy umieścić dywaniki w odpowiednich miejscach w samochodzie. Dywaniki są precyzyjnie dopasowane do kształtu podłogi, więc idealnie się układają. Nie wymagają żadnych dodatkowych narzędzi ani kleju.",
    category: "Montaż"
  },
  {
    id: 9,
    question: "Czy oferujecie darmową dostawę?",
    answer: "Tak, oferujemy darmową dostawę na terenie całej Polski przy zamówieniach powyżej 199 zł. Dla zamówień poniżej tej kwoty koszt dostawy wynosi 15 zł. Dostawa realizowana jest przez firmę kurierską w ciągu 1-2 dni roboczych.",
    category: "Dostawa"
  },
  {
    id: 10,
    question: "Co zrobić jeśli dywaniki nie pasują?",
    answer: "Jeśli dywaniki nie pasują idealnie do Twojego samochodu, skontaktuj się z nami w ciągu 14 dni od otrzymania przesyłki. Wymienimy je na nowe lub zwrócimy pełną kwotę. Jakość dopasowania jest dla nas priorytetem.",
    category: "Zwroty"
  }
];

const categories = ["Wszystkie", "Dopasowanie", "Pielęgnacja", "Dostawa", "Materiał", "Gwarancja", "Kolorystyka", "Bezpieczeństwo", "Montaż", "Zwroty"];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
  const [isVisible, setIsVisible] = useState(false);
  const [filteredFAQs, setFilteredFAQs] = useState(faqData);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('faq-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedCategory === "Wszystkie") {
      setFilteredFAQs(faqData);
    } else {
      setFilteredFAQs(faqData.filter(faq => faq.category === selectedCategory));
    }
  }, [selectedCategory]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section id="faq-section" className="py-16 bg-black text-white relative overflow-hidden">
      {/* Animowane tło z gradientem */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-800/5"></div>
      
      {/* Animowane cząsteczki tła */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header z animacją */}
        <div className={`text-center mb-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-6 animate-pulse-glow">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            NAJCZĘŚCIEJ ZADAWANE PYTANIA
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Znajdź odpowiedzi na najważniejsze pytania dotyczące naszych dywaników samochodowych
          </p>
        </div>

        {/* Filtry kategorii */}
        <div className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {categories.map((category, index) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Lista FAQ */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={faq.id}
              className={`transition-all duration-1000 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-xl border border-red-800/30 overflow-hidden hover:border-red-500/50 transition-all duration-300">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                      {faq.category}
                    </span>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-red-400 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-red-400 transition-transform duration-300" />
                    )}
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openItems.includes(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-4">
                    <div className="border-t border-red-800/30 pt-4">
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-12 transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-2xl p-8 border border-red-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Nie znalazłeś odpowiedzi na swoje pytanie?
            </h3>
            <p className="text-gray-300 mb-6">
              Skontaktuj się z naszym zespołem - chętnie pomożemy!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-red-500/25 hover:scale-105">
                Napisz do nas
              </button>
              <button className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:bg-white/20">
                Zadzwoń: +48 570 123 635
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 