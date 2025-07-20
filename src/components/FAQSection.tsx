import React from "react";

export default function FAQSection() {
  return (
    <section className="py-12 bg-black text-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Najczęściej zadawane pytania</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold">Czy dywaniki pasują do każdego modelu auta?</h3>
            <p>Tak, produkujemy dywaniki na miarę do większości popularnych modeli samochodów.</p>
          </div>
          <div>
            <h3 className="font-semibold">Jak czyścić dywaniki EVA?</h3>
            <p>Wystarczy opłukać je wodą lub przetrzeć wilgotną szmatką.</p>
          </div>
          <div>
            <h3 className="font-semibold">Ile trwa realizacja zamówienia?</h3>
            <p>Standardowy czas realizacji to 2-5 dni roboczych.</p>
          </div>
        </div>
      </div>
    </section>
  );
} 