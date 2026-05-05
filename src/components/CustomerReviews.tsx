"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, Quote, CheckCircle } from "lucide-react";

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
      review: "Dywaniki EVA Premium to absolutny hit! Idealnie pasują do mojego BMW X5, są bardzo łatwe w czyszczeniu i wyglądają jak oryginalne. Materiał EVA jest naprawdę wysokiej jakości.",
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
      review: "Zamówiłem dywaniki do Mercedesa i jestem pod ogromnym wrażeniem! Precyzyjne dopasowanie, szybka dostawa (2 dni!) i świetna jakość wykonania. Obsługa klienta na najwyższym poziomie.",
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
      review: "Najlepsze dywaniki jakie miałem w aucie! Wodoodporne, nie wchłaniają brudu, a czyszczenie to pestka. W zimie idealnie chronią podłogę przed solą i śniegiem.",
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
      review: "Fantastyczna jakość! Dywaniki 3D z rantami idealnie chronią podłogę. Mój pies często wsiada z mokrymi łapami i nie ma problemu - wszystko się łatwo czyści. Polecam!",
      carModel: "Volkswagen Golf 2023",
      purchaseDate: "Styczeń 2025",
      verified: true,
      helpful: 9
    },
    {
      id: 5,
      name: "Piotr Krawczyk",
      location: "Poznań",
      rating: 5,
      review: "Profesjonalna obsługa od początku do końca. Dywaniki wykonane na miarę, pasują idealnie. Materiał EVA jest bardzo trwały i wygląda elegancko. Warto każdej złotówki!",
      carModel: "Tesla Model 3 2024",
      purchaseDate: "Grudzień 2024",
      verified: true,
      helpful: 11
    },
    {
      id: 6,
      name: "Magdalena Szymańska",
      location: "Łódź",
      rating: 5,
      review: "Po pół roku użytkowania mogę powiedzieć, że to najlepsza inwestycja w moje auto. Dywaniki wyglądają jak nowe, łatwo się czyści, a struktura 3D świetnie zatrzymuje brud.",
      carModel: "Skoda Octavia 2022",
      purchaseDate: "Październik 2024",
      verified: true,
      helpful: 7
    }
  ];

  const toggleHelpful = (reviewId: number) => {
    setHelpfulReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  return (
    <section 
      id="opinie" 
      className="py-10 md:py-14 bg-black relative overflow-hidden"
      role="region"
      aria-label="Opinie klientów o dywanikach EVA"
    >
      {/* Gradient line top */}
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Opinie naszych <span className="text-red-500">Klientów</span>
          </h2>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Dołącz do ponad <span className="text-white font-semibold">2000+</span> zadowolonych kierowców, którzy wybrali komfort i jakość EVA Premium.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-red-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl overflow-hidden">
                <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>

              {/* User Info */}
              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-bold">{review.name}</h4>
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-red-500" aria-label="Zweryfikowany zakup" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{review.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="relative z-10 flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 mb-6 min-h-[80px]">
                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-white/10 transform -scale-x-100" />
                <p className="text-gray-400 leading-relaxed text-sm relative pl-4">
                  {review.review}
                </p>
              </div>

              {/* Footer */}
              <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  <p className="font-medium text-gray-400 mb-0.5">{review.carModel}</p>
                  <p>{review.purchaseDate}</p>
                </div>
                
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border
                    ${helpfulReviews.includes(review.id) 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'}
                  `}
                  aria-label={helpfulReviews.includes(review.id) ? "Cofnij ocenę przydatne" : "Oceń jako przydatne"}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{review.helpful + (helpfulReviews.includes(review.id) ? 1 : 0)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
