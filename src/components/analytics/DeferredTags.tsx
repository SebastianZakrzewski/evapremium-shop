"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { GoogleAnalyticsScript } from "@/components/analytics/GoogleAnalyticsScript"

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TD2WDGKV');`

export const DeferredTags = () => {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const enable = () => setEnabled(true)
    window.addEventListener("pointerdown", enable, { once: true })
    window.addEventListener("keydown", enable, { once: true })

    return () => {
      window.removeEventListener("pointerdown", enable)
      window.removeEventListener("keydown", enable)
    }
  }, [])

  if (!enabled) {
    return null
  }

  return (
    <>
      <Script
        id="gtm"
        strategy="afterInteractive"
        data-cookieconsent="ignore"
        dangerouslySetInnerHTML={{ __html: GTM_SNIPPET }}
      />
      <GoogleAnalyticsScript />
    </>
  )
}
