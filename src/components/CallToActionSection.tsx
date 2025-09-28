import React from "react";
import Link from "next/link";

export default function CallToActionSection() {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Zamów swoje dywaniki EVA już teraz!</h2>
        <p className="mb-8">Wybierz model, kolor i wariant – a my zajmiemy się resztą.</p>
        <Link href="/modele" className="inline-block bg-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-900 transition">Zobacz modele aut</Link>
      </div>
    </section>
  );
} 