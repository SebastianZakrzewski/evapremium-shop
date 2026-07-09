import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Script from "next/script";
import { SessionProvider } from "@/lib/contexts/session-context";
import { TrackingProvider } from "@/components/tracking-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import Chatbot from "@/features/chatbot/components/Chatbot";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
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
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/icon.png',
    shortcut: '/favicon.ico',
  },
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      "telephone": "+48-793-993-430",
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
        {/* Cookiebot — musi być pierwszym skryptem w <head> */}
        <script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="646107cd-5e5a-41eb-af5f-80b502582c41"
          data-blockingmode="auto"
          type="text/javascript"
        />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TD2WDGKV');`,
          }}
        />
        {/* End Google Tag Manager */}

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ubkouhtkbb");
          `}
        </Script>
        
        {/* Facebook Pixel Noscript - dla użytkowników z wyłączonym JavaScript */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || ''}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        
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
      <body className={`${montserrat.variable} bg-black min-h-screen`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TD2WDGKV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <QueryProvider>
          <SessionProvider>
            <TrackingProvider>
              <Navbar />
              <div className="pt-16 md:pt-20 lg:pt-24 max-w-full overflow-x-hidden">{children}</div>
              <Footer />
              <Chatbot />
            </TrackingProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
