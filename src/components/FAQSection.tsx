"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    answer: "Standardowy czas realizacji to 2-3 tygodnie. W przypadku specjalnych zamówień lub nietypowych modeli aut czas może się wydłużyć. Oferujemy również ekspresową realizację w 24h za dodatkową opłatą.",
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
    answer: "Tak, wszystkie nasze dywaniki objęte są roczną gwarancją na wady materiałowe i wykonania. Gwarancja obejmuje również odporność na normalne użytkowanie. W przypadku problemów wymieniamy produkt bezpłatnie.",
    category: "Gwarancja"
  },
  {
    id: 6,
    question: "Jakie kolory są dostępne?",
    answer: "Oferujemy szeroką paletę kolorów: czarny, szary, beżowy, brązowy, niebieski, czerwony, zielony i wiele innych. Kolory są dopasowane do najpopularniejszych odcieni wnętrz samochodowych.",
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
    answer: "Tak, oferujemy darmową dostawę na terenie całej Polski przy zamówieniach powyżej 600 zł. Dla zamówień poniżej tej kwoty koszt dostawy wynosi 27 zł. Dostawa realizowana jest przez firmę kurierską w ciągu 1-2 dni roboczych.",
    category: "Dostawa"
  },
  {
    id: 10,
    question: "Co zrobić jeśli dywaniki nie pasują?",
    answer: "Jeśli dywaniki nie pasują idealnie do Twojego samochodu, skontaktuj się z nami w ciągu 14 dni od otrzymania przesyłki. Wymienimy je na nowe, dopasowane do Twojego pojazdu. Jakość dopasowania jest dla nas priorytetem.",
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
    <section 
      id="faq-section" 
      className="py-10 md:py-14 bg-black text-white relative overflow-hidden"
      role="region"
      aria-label="Najczęściej zadawane pytania - FAQ"
    >
      {/* Gradient line top */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Najczęściej zadawane <span className="text-red-500">pytania</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Znajdź odpowiedzi na najważniejsze pytania dotyczące naszych dywaników samochodowych.
          </p>
        </div>

        {/* Filtry kategorii */}
        <div className={`flex flex-wrap justify-center gap-3 mb-6 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                selectedCategory === category
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/30'
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
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
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div 
                className={`
                  rounded-2xl border overflow-hidden transition-all duration-300
                  ${openItems.includes(faq.id) 
                    ? 'bg-white/10 border-red-500/30 shadow-lg shadow-black/20' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'}
                `}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between group"
                  aria-expanded={openItems.includes(faq.id)}
                >
                  <h3 className={`text-lg font-semibold pr-8 transition-colors duration-300 ${openItems.includes(faq.id) ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                    {faq.question}
                  </h3>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="hidden sm:inline-block text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full border border-white/5">
                      {faq.category}
                    </span>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-red-500 transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-transform duration-300" />
                    )}
                  </div>
                </button>
                
                <div 
                  className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${openItems.includes(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-gray-400 leading-relaxed text-sm md:text-base">
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
        <div className={`text-center mt-16 transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Nie znalazłeś odpowiedzi na swoje pytanie?
            </h3>
            <p className="text-gray-400 mb-8">
              Skontaktuj się z naszym zespołem - chętnie pomożemy!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-xl shadow-red-900/20 hover:scale-105 hover:shadow-red-900/40">
                Napisz do nas
              </button>
              <button className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-full font-bold transition-all duration-300 hover:bg-white/10 hover:border-white/40">
                Zadzwoń: +48 793 993 430
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
