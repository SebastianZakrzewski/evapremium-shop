/**
 * Consent Mode v2 default. Must run before GTM and gtag config.
 * Reuses dataLayer when it already exists so the GTM snippet is not wiped.
 * A stored CookieConsent cookie is applied immediately so the first page_view
 * on a return visit is not sent with storage denied.
 */
export const GA_CONSENT_DEFAULT_SCRIPT = `(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  window.gtag('set', 'ads_data_redaction', true);

  try {
    var cookie = document.cookie.split(';').map(function (part) {
      return part.trim();
    }).find(function (part) {
      return part.indexOf('CookieConsent=') === 0;
    });
    if (!cookie) return;
    var value = decodeURIComponent(cookie.split('=').slice(1).join('='));
    var granted = function (flag) { return value.indexOf(flag + ':true') !== -1; };
    var statistics = granted('statistics');
    var marketing = granted('marketing');
    var preferences = granted('preferences');
    window.gtag('consent', 'update', {
      analytics_storage: statistics ? 'granted' : 'denied',
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      functionality_storage: preferences ? 'granted' : 'denied',
      personalization_storage: preferences ? 'granted' : 'denied',
      security_storage: 'granted'
    });
  } catch (error) {}
})();`

export const buildGa4InitScript = (measurementId: string): string => {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error('Invalid GA4 measurement id')
  }

  return `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
window.gtag('js', new Date());
window.gtag('config', '${measurementId}');`
}
