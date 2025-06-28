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
                className="flex items-center justify-center group cursor-pointer"
              >
                <div className="flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105">
                  {/* Icon Container with black background and red border */}
                  <div className="mb-4 bg-black rounded-xl p-4 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 flex items-center justify-center border-4 border-red-800/50 hover:border-red-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
                    <div className="w-16 h-16 bg-red-900/40 rounded-full flex items-center justify-center transition-all duration-300 border border-red-800/50 group-hover:bg-red-800/50 group-hover:scale-110">
                      <IconComponent className="w-8 h-8 text-red-400 transition-all duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-4 transition-all duration-300 group-hover:text-red-400">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed max-w-xs transition-all duration-300 group-hover:text-white">
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