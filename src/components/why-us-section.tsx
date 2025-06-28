"use client";

import { CheckCircle, Award, Truck, Shield } from "lucide-react";

const whyUsItems = [
  {
    id: 1,
    icon: Award,
    title: "Najwyższa Jakość",
    description: "Używamy tylko najlepszych materiałów premium, które zapewniają trwałość i elegancki wygląd przez lata."
  },
  {
    id: 2,
    icon: CheckCircle,
    title: "Dokładne Dopasowanie",
    description: "Każda mata jest precyzyjnie dopasowana do konkretnego modelu auta, zapewniając idealne dopasowanie."
  },
  {
    id: 3,
    icon: Truck,
    title: "Szybka Dostawa",
    description: "Dostarczamy zamówienia w ciągu 24-48 godzin w całej Polsce. Darmowa dostawa od 200 zł."
  },
  {
    id: 4,
    icon: Shield,
    title: "Gwarancja Satysfakcji",
    description: "30-dniowa gwarancja zwrotu pieniędzy. Jeśli nie jesteś zadowolony, zwracamy pełną kwotę."
  }
];

export default function WhyUsSection() {
  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Dlaczego My?
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Wybierz Evapremium i doświadcz różnicy w jakości, precyzji i obsłudze klienta
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {whyUsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-700/50 hover:border-red-800/50"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-red-900/40 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-800/50 transition-colors border border-red-800/50">
                    <IconComponent className="w-8 h-8 text-red-400" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 md:mt-16">
          <button 
            onClick={() => {
              const element = document.getElementById('products');
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }}
            className="bg-red-800 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
          >
            Zobacz Nasze Produkty
          </button>
        </div>
      </div>
    </section>
  );
} 