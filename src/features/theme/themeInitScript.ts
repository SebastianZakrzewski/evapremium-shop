/** localStorage key used by next-themes (`storageKey` default). */
export const THEME_STORAGE_KEY = "theme"

/**
 * Blocking script for <head>. Applies `light` or `dark` before paint.
 * Default is the system preference. An explicit saved choice wins.
 * Does not touch dataLayer, consent, or analytics.
 */
export const themeInitScript = `(function(){try{var stored=localStorage.getItem("${THEME_STORAGE_KEY}");var theme=stored||"system";var dark=theme==="dark"||(theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(dark?"dark":"light");root.style.colorScheme=dark?"dark":"light";}catch(e){}})();`
