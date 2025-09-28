import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Script from "next/script";
import { SessionProvider } from "@/lib/contexts/session-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dywaniki Samochodowe EVA Premium | Najwyższa Jakość | EvaPremium",
  description: "Profesjonalne dywaniki samochodowe EVA Premium. Wodoodporne, łatwe w czyszczeniu, precyzyjnie dopasowane do modelu auta. Darmowa dostawa w 24h. Sprawdź ceny już od 199 zł!",
  keywords: "dywaniki samochodowe, maty EVA, dywaniki premium, maty samochodowe, dywaniki wodoodporne, dywaniki samochodowe premium",
  authors: [{ name: "EvaPremium" }],
  creator: "EvaPremium",
  publisher: "EvaPremium",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://evapremium.pl'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Dywaniki Samochodowe EVA Premium | Najwyższa Jakość",
    description: "Profesjonalne dywaniki samochodowe EVA Premium. Wodoodporne, łatwe w czyszczeniu, precyzyjnie dopasowane do modelu auta.",
    url: 'https://evapremium.pl',
    siteName: 'EvaPremium',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dywaniki Samochodowe EVA Premium',
      },
    ],
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dywaniki Samochodowe EVA Premium | Najwyższa Jakość",
    description: "Profesjonalne dywaniki samochodowe EVA Premium. Wodoodporne, łatwe w czyszczeniu.",
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code', // Zastąp kodem z GSC
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Google Analytics ID - zastąp swoim ID
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX' // Zastąp swoim ID z GA4
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EvaPremium",
    "url": "https://evapremium.pl",
    "logo": "https://evapremium.pl/Logo svg.svg",
    "description": "Profesjonalne dywaniki samochodowe EVA Premium",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "PL"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+48-505-401-233",
      "contactType": "customer service"
    },
    "sameAs": [
      "https://facebook.com/evapremium",
      "https://instagram.com/evapremium"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EvaPremium",
    "url": "https://evapremium.pl",
    "description": "Profesjonalne dywaniki samochodowe EVA Premium",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://evapremium.pl/wyszukaj?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="pl">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        
        {/* Schema.org */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} bg-black min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <div className="pt-16 md:pt-20 lg:pt-24">{children}</div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
