# Analiza sekcji "Dobierz dywaniki w 15 sekund" (QuickSearchBar)

## Źródło

Komponent: [`src/components/quick-search-bar.tsx`](src/components/quick-search-bar.tsx)

---

## Wzorce designu (Design System) – wyciągnięte z Hero

| Element | Hero | QuickSearchBar | Zgodność |
|---------|------|----------------|----------|
| Tło sekcji | `bg-neutral-950` | `bg-neutral-950` | ✅ |
| Akcent czerwony | `text-red-500`, `from-red-600 to-red-700` | `text-red-500`, `from-red-600 to-red-700` | ✅ |
| Nagłówek | `text-white font-bold` | `text-white font-bold` | ✅ |
| Tekst drugorzędny | `text-gray-200` | `text-gray-400` | ⚠️ Słabszy kontrast |
| Glass container | `bg-white/5 backdrop-blur-md border-white/10` | `bg-white/5 backdrop-blur-md border-white/10` | ✅ |
| Cień CTA | `shadow-xl shadow-red-900/30` | `shadow-lg shadow-red-900/30` | ⚠️ Różne shadow-xl vs shadow-lg |
| Zaokrąglenie CTA | `rounded-full` | `rounded-xl` | ❌ Brak spójności |
| Zaokrąglenie kontenera | `rounded-2xl md:rounded-3xl` | `rounded-2xl` | ⚠️ Brak md:rounded-3xl |
| Cień kontenera | `shadow-2xl shadow-red-900/30` (glass) | `shadow-2xl shadow-red-900/10` | ⚠️ Słabszy cień |
| Max-width | `max-w-4xl` (treść) | `max-w-5xl` | ⚠️ Szerszy (akceptowalne dla formularza) |

---

## Metryki zgodności

### 1. WCAG 2.1 AA – Kontrast

| Element | Kolor | Tło | Ocena |
|---------|-------|-----|-------|
| H2 | white (#fff) | neutral-950 | ✅ >7:1 |
| "15 sekund" | red-500 | neutral-950 | ✅ >4.5:1 |
| Subtitle | gray-400 | neutral-950 | ⚠️ ~4.5:1 (na granicy) |
| Labels (Marka/Model) | gray-500 | neutral-950 | ❌ <4.5:1 |
| "Wyczyść filtry" | gray-500 | neutral-950 | ❌ <4.5:1 |

**Rekomendacja:** `text-gray-400` → `text-gray-300`, labels `text-gray-500` → `text-gray-400`.

### 2. Touch targets (min 44×44px)

| Element | Wymiary | Status |
|---------|---------|--------|
| Select (Marka/Model) | py-3.5 = ~56px height | ✅ |
| Przycisk Szukaj | py-3.5 md:py-4 | ✅ |
| Przycisk "Wyczyść filtry" | text-xs, brak min-height | ❌ Za mały |

**Rekomendacja:** Dodać `min-h-[44px] min-w-[44px]` lub `py-3 px-4` do "Wyczyść filtry".

### 3. Dostępność (a11y)

| Wymóg | Hero | QuickSearchBar |
|-------|------|----------------|
| role="region" | ✅ | ❌ |
| aria-label | ✅ | ❌ |
| aria-label na select | N/A | ❌ Brak powiązania label |
| focus:ring | ✅ | ✅ |

**Rekomendacja:** Dodać `role="region"`, `aria-label`, poprawić powiązanie label z select (id + htmlFor lub aria-label).

### 4. Spójność wizualna z Hero

| Aspekt | Ocena |
|--------|-------|
| Paleta kolorów | 8/10 – ta sama, drobne różnice w odcieniach |
| Typografia | 8/10 – podobna skala (H2 vs H1) |
| CTA styling | 6/10 – rounded-xl vs rounded-full |
| Cienie | 6/10 – różna intensywność |
| Odstępy | 7/10 – py-20 vs hero pb-20 |

---

## Ocena ogólna

| Kryterium | Ocena | Uwagi |
|-----------|-------|-------|
| Design | 7/10 | Spójny z Hero, drobne rozbieżności |
| Prostota | 8/10 | Prosty formularz, jasny cel |
| Czytelność | 7/10 | gray-400 na granicy kontrastu |
| Przyjazność | 7/10 | Brak aria, mały touch target "Wyczyść" |
| Spójność z Hero | 6.5/10 | CTA, cienie, subtitle wymagają dopasowania |

---

## Plan poprawek

1. **Spójność CTA** – przycisk "Szukaj": `rounded-full` (jak Hero)
2. **Cień** – `shadow-xl shadow-red-900/30` (jak Hero)
3. **Subtitle** – `text-gray-300` (lepszy kontrast)
4. **Labels** – `text-gray-400` (lepszy kontrast)
5. **"Wyczyść filtry"** – `min-h-[44px] py-3 px-4` (touch target)
6. **Dostępność** – `role="region"`, `aria-label="Wyszukiwarka dywaników - wybierz markę i model"`
7. **Select labels** – dodać `aria-label` na select (lub ukryte `<label>` z htmlFor)
8. **id sekcji** – `id="quick-search"` dla potencjalnego scroll z Hero
