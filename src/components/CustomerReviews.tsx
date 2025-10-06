"use client";

import React, { useState } from "react";
import { Star, Quote, ThumbsUp, Award, Shield, Truck } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  review: string;
  carModel: string;
  purchaseDate: string;
  verified: boolean;
  helpful: number;
}

export default function CustomerReviews() {
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);

  const reviews: Review[] = [
    {
      id: 1,
      name: "Anna Kowalska",
      location: "Warszawa",
      rating: 5,
      review: "Dywaniki EVA Premium to absolutny hit! Idealnie pasują do mojego BMW X5, są bardzo łatwe w czyszczeniu i wyglądają jak oryginalne. Materiał EVA jest naprawdę wysokiej jakości - nie odkształca się i nie traci koloru. Polecam każdemu!",
      carModel: "BMW X5 2022",
      purchaseDate: "Grudzień 2024",
      verified: true,
      helpful: 12
    },
    {
      id: 2,
      name: "Marek Nowak",
      location: "Kraków",
      rating: 5,
      review: "Zamówiłem dywaniki do Mercedesa i jestem pod ogromnym wrażeniem! Precyzyjne dopasowanie, szybka dostawa (2 dni!) i świetna jakość wykonania. Obsługa klienta na najwyższym poziomie. Na pewno wrócę po akcesoria.",
      carModel: "Mercedes C-Class 2023",
      purchaseDate: "Styczeń 2025",
      verified: true,
      helpful: 8
    },
    {
      id: 3,
      name: "Tomasz Wiśniewski",
      location: "Gdańsk",
      rating: 5,
      review: "Najlepsze dywaniki jakie miałem w aucie! Wodoodporne, nie wchłaniają brudu, a czyszczenie to pestka. W zimie idealnie chronią podłogę przed solą i śniegiem. Warto każdej złotówki!",
      carModel: "Audi A4 2021",
      purchaseDate: "Listopad 2024",
      verified: true,
      helpful: 15
    },
    {
      id: 4,
      name: "Katarzyna Zielińska",
      location: "Wrocław",
      rating: 5,
      review: "Fantastyczna jakość i obsługa! Dywaniki idealnie dopasowane do mojego Tesli Model 3. Materiał EVA jest miękki w dotyku, ale bardzo wytrzymały. Szybka dostawa i profesjonalne opakowanie.",
      carModel: "Tesla Model 3 2023",
      purchaseDate: "Styczeń 2025",
      verified: true,
      helpful: 6
    },
    {
      id: 5,
      name: "Piotr Krawczyk",
      location: "Poznań",
      rating: 5,
      review: "Zamówiłem komplet dywaników do Porsche 911 i jestem zachwycony! Precyzyjne wycięcie, doskonała jakość materiału i piękne wykończenie. To nie są zwykłe dywaniki - to dzieło sztuki!",
      carModel: "Porsche 911 2022",
      purchaseDate: "Grudzień 2024",
      verified: true,
      helpful: 9
    },
    {
      id: 6,
      name: "Magdalena Lewandowska",
      location: "Łódź",
      rating: 5,
      review: "Doskonałe dywaniki EVA! Łatwe w utrzymaniu czystości, nie powodują alergii u mojego syna. Materiał jest antybakteryjny i bezpieczny. Polecam wszystkim rodzicom!",
      carModel: "Volkswagen Golf 2023",
      purchaseDate: "Styczeń 2025",
      verified: true,
      helpful: 11
    }
  ];

  const toggleHelpful = (reviewId: number) => {
    setHelpfulReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section id="opinie" className="py-16 md:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
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
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
            Opinie naszych klientów
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Ponad <span className="text-red-400 font-semibold">5000 zadowolonych klientów</span> już wybrało nasze dywaniki EVA Premium
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 text-green-400 mr-2" />
              <span>Gwarancja 3 lata</span>
            </div>
            <div className="flex items-center">
              <Truck className="w-4 h-4 text-blue-400 mr-2" />
              <span>Dostawa 24h</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="w-4 h-4 text-red-400 mr-2" />
              <span>98% zadowolonych</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700 hover:border-red-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{review.name}</h4>
                    <p className="text-gray-400 text-sm">{review.location}</p>
                  </div>
                </div>
                {review.verified && (
                  <div className="flex items-center text-green-400 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    <span>Zweryfikowany</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
                <span className="text-gray-400 text-sm ml-2">{review.rating}/5</span>
              </div>

              {/* Review Text */}
              <div className="relative mb-4">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-red-400/30" />
                <p className="text-gray-300 leading-relaxed text-sm pl-4">
                  {review.review}
                </p>
              </div>

              {/* Car Model & Date */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p><span className="font-medium">Model:</span> {review.carModel}</p>
                <p><span className="font-medium">Zakup:</span> {review.purchaseDate}</p>
              </div>

              {/* Helpful Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                    helpfulReviews.includes(review.id)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Pomocne ({review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Dołącz do grona zadowolonych klientów!
            </h3>
            <p className="text-gray-300 mb-6">
              Sprawdź nasze dywaniki EVA Premium i przekonaj się, dlaczego nasi klienci nas polecają.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#dywaniki"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-800 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
              >
                <Award className="w-5 h-5 mr-2" />
                Zobacz produkty
              </a>
              <a
                href="#faq"
                className="inline-flex items-center justify-center px-6 py-3 border border-red-500 text-red-400 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Quote className="w-5 h-5 mr-2" />
                Czytaj więcej opinii
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 