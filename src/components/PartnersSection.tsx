import React from "react";

export default function PartnersSection() {
  return (
    <section className="py-8 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-6">Zaufali nam</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <img src="/images/partner1.png" alt="Partner 1" className="h-12" />
          <img src="/images/partner2.png" alt="Partner 2" className="h-12" />
          <img src="/images/partner3.png" alt="Partner 3" className="h-12" />
        </div>
      </div>
    </section>
  );
} 