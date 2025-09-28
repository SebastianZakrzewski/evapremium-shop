import React from "react";

export default function CustomerReviews() {
  return (
    <section className="py-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Opinie naszych klientów</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <p className="mb-4">&quot;Dywaniki są świetne! Idealnie pasują i łatwo się je czyści.&quot;</p>
            <span className="font-semibold">Anna, Warszawa</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <p className="mb-4">&quot;Super jakość, szybka dostawa. Polecam każdemu!&quot;</p>
            <span className="font-semibold">Marek, Kraków</span>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
            <p className="mb-4">&quot;Najlepsze dywaniki jakie miałem w aucie.&quot;</p>
            <span className="font-semibold">Tomasz, Gdańsk</span>
          </div>
        </div>
      </div>
    </section>
  );
} 