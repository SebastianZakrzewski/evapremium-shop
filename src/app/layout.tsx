import "./globals.css";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ShopChrome } from "@/components/layout/ShopChrome";
import { EvaChatWidget } from "@/features/eva-chat-widget";
import Script from "next/script";
import { SessionProvider } from "@/lib/contexts/session-context";
import { TrackingProvider } from "@/components/tracking-provider";
import { GoogleAnalyticsScript } from "@/components/analytics/GoogleAnalyticsScript";
import { GoogleConsentDefaultScript } from "@/components/analytics/GoogleConsentDefaultScript";
import { QueryProvider } from "@/lib/providers/query-provider";
import { isSandboxTrackingScope } from "@/lib/sandbox/runtime";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
    "logo": {
      "@type": "ImageObject",
      "url": "https://evapremium.pl/logo.png",
      "width": 1024,
      "height": 1024
    },
    "image": "https://evapremium.pl/logo.png",
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #CybotCookiebotDialog,
              #CybotCookiebotDialogBodyUnderlay,
              #CookiebotWidget,
              [id^="CybotCookiebot"] {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
              }
            `,
          }}
        />

        {/*
          Cookiebot is not loaded here. GTM-TD2WDGKV already injects the same
          CBID. A second uc.js plus Cookiebot.hide() swallowed banner clicks
          and never persisted consent. This script only keeps that injected
          dialog from covering the shop banner.
        */}
        <Script
          id="cookiebot-ui-suppress"
          strategy="beforeInteractive"
          data-cookieconsent="ignore"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var hideNode = function (node) {
                  if (!node || !node.style) return;
                  node.style.setProperty('display', 'none', 'important');
                  node.style.setProperty('visibility', 'hidden', 'important');
                  node.style.setProperty('pointer-events', 'none', 'important');
                };
                var hideCookiebotUi = function () {
                  var nodes = document.querySelectorAll('[id^="CybotCookiebot"], #CookiebotWidget');
                  for (var i = 0; i < nodes.length; i += 1) hideNode(nodes[i]);
                };
                hideCookiebotUi();
                document.addEventListener('CookiebotOnDialogInit', hideCookiebotUi);
                document.addEventListener('CookiebotOnLoad', hideCookiebotUi);
                document.addEventListener('CookiebotOnDialogDisplay', hideCookiebotUi);
                var observer = new MutationObserver(hideCookiebotUi);
                var start = function () {
                  hideCookiebotUi();
                  if (document.body) {
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ['style', 'class']
                    });
                  }
                };
                if (document.body) start();
                else document.addEventListener('DOMContentLoaded', start);
              })();
            `,
          }}
        />

        <GoogleConsentDefaultScript />

        {isSandboxTrackingScope() ? null : (
        <>
        {/* Google Tag Manager — zgody obsługuje samo GTM, Cookiebot nie blokuje tego skryptu */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          data-cookieconsent="ignore"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TD2WDGKV');`,
          }}
        />
        {/* End Google Tag Manager */}

        <GoogleAnalyticsScript />
        </>
        )}
        
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
      <body className={`${montserrat.variable} ${inter.variable} bg-black min-h-screen`}>
        <QueryProvider>
          <SessionProvider>
            <TrackingProvider>
              <ShopChrome>{children}</ShopChrome>
              <EvaChatWidget />
            </TrackingProvider>
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
