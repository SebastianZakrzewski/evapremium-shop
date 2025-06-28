"use client";

import { Target } from "lucide-react";
import Image from "next/image";

const advantagesItems = [
  {
    id: 1,
    type: "image" as const,
    src: "/images/zalety/3d.png"
  },
  {
    id: 2,
    type: "image" as const,
    src: "/images/zalety/szycie.png"
  },
  {
    id: 3,
    type: "image" as const,
    src: "/images/zalety/kolorystyka.png"
  },
  {
    id: 4,
    type: "image" as const,
    src: "/images/zalety/plaster.png"
  }
];

export default function AdvantagesSection() {
  return (
    <section className="py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {advantagesItems.map((item) => {
            return (
              <div
                key={item.id}
                className="flex items-center justify-center"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Image with text */}
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-black rounded-xl p-4 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 flex items-center justify-center border-4 border-red-800/50 hover:border-red-700/50 transition-colors">
                      <Image
                        src={item.src}
                        alt="Zaleta"
                        width={200}
                        height={200}
                        className="w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-cover"
                      />
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      {item.id === 1 ? "Dywaniki 3D z rantami" : 
                       item.id === 2 ? "Szyte na miarę do twojego auta" : 
                       item.id === 3 ? "Różnorodna kolorystyka" :
                       "Głęboka struktura komórek blokująca zabrudzenia"}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 