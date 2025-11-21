"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, Quote } from "lucide-react";

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
    },
    {
      id: 7,
      name: "Jakub Lewandowski",
      location: "Katowice",
      rating: 5,
      review: "Szybka realizacja zamówienia, dokładne dopasowanie do modelu. Dywaniki są bardzo grube i solidne. W zimie nie ma problemu z solą i śniegiem - wszystko się łatwo spłukuje.",
      carModel: "Ford Focus 2023",
      purchaseDate: "Styczeń 2025",
      verified: true,
      helpful: 6
    },
    {
      id: 8,
      name: "Aleksandra Wójcik",
      location: "Szczecin",
      rating: 5,
      review: "Zamówiłam dywaniki w kolorze kości słoniowej - idealnie pasują do wnętrza mojego auta. Jakość wykonania na najwyższym poziomie, a cena bardzo przystępna. Polecam wszystkim!",
      carModel: "Peugeot 308 2023",
      purchaseDate: "Grudzień 2024",
      verified: true,
      helpful: 10
    },
    {
      id: 9,
      name: "Michał Dąbrowski",
      location: "Lublin",
      rating: 5,
      review: "Ranty 3D są genialne! Chronią przed wnikaniem wody pod dywanik. Po deszczu wystarczy przetrzeć wilgotną szmatką i wygląda jak nowy. Świetna jakość za rozsądną cenę.",
      carModel: "Hyundai i30 2022",
      purchaseDate: "Listopad 2024",
      verified: true,
      helpful: 13
    },
  ];

  const toggleHelpful = (reviewId: number) => {
    setHelpfulReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  return (
    <section id="opinie" className="py-24 bg-neutral-950 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Opinie naszych <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">Klientów</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Dołącz do ponad <span className="text-white font-semibold">2000+</span> zadowolonych kierowców, którzy wybrali komfort i jakość EVA Premium.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className="group relative bg-gray-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-gray-800/60 hover:border-white/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} />
                ))}
              </div>

              {/* Content */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5 transform -scale-x-100" />
                <p className="text-gray-300 leading-relaxed text-sm relative z-10 pl-2">
                  {review.review}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <p className="font-medium text-gray-400">{review.carModel}</p>
                  <p>{review.purchaseDate}</p>
                </div>
                
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
                    ${helpfulReviews.includes(review.id) 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                  `}
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
