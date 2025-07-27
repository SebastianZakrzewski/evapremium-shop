import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modele Aut - Dywaniki Samochodowe | Eva',
  description: 'Wybierz model swojego auta: Audi, BMW, Mercedes, Tesla, Porsche. Spersonalizowane dywaniki samochodowe dla każdego modelu. Darmowa dostawa.',
  keywords: 'dywaniki samochodowe, modele aut, audi, bmw, mercedes, tesla, porsche, dywaniki do auta, dywaniki 2024',
  openGraph: {
    title: 'Modele Aut - Dywaniki Samochodowe | Eva',
    description: 'Wybierz model swojego auta i spersonalizuj dywaniki samochodowe',
    type: 'website',
    images: ['/images/hero/heromat-poster.jpg'],
  },
  alternates: {
    canonical: 'https://eva-dywaniki.pl/modele',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ModeleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Modele Aut - Dywaniki Samochodowe",
            "description": "Wybierz model swojego auta i spersonalizuj dywaniki samochodowe",
            "url": "https://eva-dywaniki.pl/modele",
            "numberOfItems": 12,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Product",
                  "name": "Dywaniki Audi A4 2024",
                  "brand": "Audi",
                  "model": "A4",
                  "year": "2024"
                }
              },
              {
                "@type": "ListItem", 
                "position": 2,
                "item": {
                  "@type": "Product",
                  "name": "Dywaniki BMW X5 2024",
                  "brand": "BMW",
                  "model": "X5",
                  "year": "2024"
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
} 