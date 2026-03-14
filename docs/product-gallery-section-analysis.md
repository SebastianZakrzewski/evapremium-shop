# Analiza sekcji "Nasza galeria produktów" (ProductGallerySection)

## Źródło

Komponent: [`src/features/products/components/ProductGallerySection.tsx`](src/features/products/components/ProductGallerySection.tsx)

---

## Wzorzec designu (Design System) – ustalony dla strony

Na podstawie Hero i QuickSearchBar:

| Element | Wzorzec | ProductGallerySection | Zgodność |
|---------|---------|----------------------|----------|
| Tło sekcji | `bg-neutral-950` | `bg-neutral-950` | ✅ |
| Nagłówek | `text-white font-bold` | `bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent` | ❌ Inny styl |
| Subtitle | `text-gray-300` | `text-gray-300` | ✅ |
| CTA przycisk | `rounded-full`, `from-red-600 to-red-700`, `shadow-xl shadow-red-900/30` | `rounded-full`, `bg-red-600 hover:bg-red-700` (bez gradientu) | ⚠️ Brak gradientu, shadow-lg |
| Padding sekcji | `py-20 md:py-24` (QuickSearch) / `pb-20` (Hero) | `py-12 md:py-16` | ⚠️ Mniejszy |
| role="region" | ✅ | ❌ | ❌ |
| aria-label | ✅ | ❌ | ❌ |
| Gradient line top | Opcjonalnie (QuickSearch ma) | ❌ | ⚠️ Brak separacji |
| id sekcji | `id="quick-search"` | `data-section="product-gallery"` (brak id) | ⚠️ |

---

## Słabe strony

### 1. Hierarchia nagłówków

- **Problem:** Użycie `<h1>` dla tytułu sekcji. Na stronie głównej Hero ma już H1 ("Dywaniki Samochodowe EVA Premium"). Druga sekcja z H1 łamie semantykę i SEO.
- **Wzorzec:** Hero = H1, pozostałe sekcje = H2.
- **QuickSearchBar:** H2 ("Dobierz dywaniki w 15 sekund").
- **Rekomendacja:** Zmienić na H2.

### 2. Styl nagłówka – brak spójności

- **Hero:** `text-white` (prosty biały).
- **QuickSearchBar:** `text-white` + `text-red-500` dla akcentu.
- **ProductGallery:** `bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent` (cały nagłówek w gradiencie).
- **AdvantagesSection:** Ten sam gradient na H1.
- **Problem:** Hero i QuickSearchBar używają białego tekstu z czerwonym akcentem. ProductGallery i AdvantagesSection – gradient na całym nagłówku. Brak spójności między sekcjami.

### 3. Ikona nad nagłówkiem

- **ProductGallery:** Ikona ImageIcon w gradient circle przed tytułem.
- **AdvantagesSection:** Ikona Package w gradient circle.
- **Hero, QuickSearchBar:** Brak ikony.
- **Problem:** ProductGallery i AdvantagesSection mają wspólny wzorzec, ale różnią się od Hero i QuickSearchBar. Można to traktować jako wariant dla sekcji „feature”, ale warto ujednolicić.

### 4. CTA – brak gradientu i cienia

- **Wzorzec (Hero, QuickSearchBar):** `bg-gradient-to-r from-red-600 to-red-700`, `shadow-xl shadow-red-900/30`.
- **ProductGallery:** `bg-red-600 hover:bg-red-700`, `shadow-lg hover:shadow-xl hover:shadow-red-900/30`.
- **Różnice:** Brak gradientu, słabszy cień w stanie spoczynku.

### 5. Strzałki karuzeli – inny styl

- **Hero:** `glass-button` (bg-white/10, border-white/20).
- **ProductGallery:** `bg-black/80 hover:bg-red-600`, `border-white/10 hover:border-red-500`.
- **Problem:** Inna paleta i zachowanie – Hero jest subtelniejszy, ProductGallery bardziej kontrastowy.

### 6. Dostępność

- Brak `role="region"` i `aria-label` na sekcji.
- Brak `id` (tylko `data-section`) – utrudnione linkowanie i scroll.
- Przycisk zamknięcia modala: `p-2` – potencjalnie za mały touch target (ok. 32px).
- Brak obsługi klawiatury (Escape) w modalu – wymaga weryfikacji.

### 7. Tło – nadmiar elementów

- ProductGallery ma: gradient tła, blur circles, animowane cząsteczki.
- Hero: proste `bg-neutral-950`.
- QuickSearchBar: `bg-neutral-950` + gradient line.
- **Problem:** ProductGallery jest bardziej „gadatliwy” wizualnie niż Hero i QuickSearchBar.

### 8. Spójność z sąsiednimi sekcjami

| Sekcja | Tło | Nagłówek | CTA |
|--------|-----|----------|-----|
| Hero | neutral-950 | text-white | gradient, rounded-full |
| QuickSearchBar | neutral-950 | text-white + red-500 | gradient, rounded-full |
| **ProductGallery** | neutral-950 + gradienty + cząsteczki | gradient text | flat red, rounded-full |
| AdvantagesSection | neutral-950 + gradienty + cząsteczki | gradient text | brak CTA (karty) |

ProductGallery i AdvantagesSection są ze sobą spójne (gradienty, ikony, tło), ale obie odbiegają od Hero i QuickSearchBar.

---

## Metryki zgodności

### WCAG 2.1 AA – Kontrast

| Element | Kolor | Ocena |
|---------|-------|-------|
| H1 (gradient) | red-400–600 | ✅ |
| Subtitle | gray-300 | ✅ |
| Tekst na kartach | text-white, gray-300 | ✅ |
| Modal description | gray-400 | ⚠️ Na granicy |

### Touch targets (min 44×44px)

| Element | Wymiary | Status |
|---------|---------|--------|
| Strzałki karuzeli | p-3 md:p-4 | ⚠️ p-3 = 24px, może być za mało |
| Przycisk CTA | py-2.5 md:py-4 | ✅ |
| Przycisk zamknięcia modala | p-2 | ❌ ~32px |
| Karty (klikalne) | w-80 h-64 | ✅ |

---

## Ocena ogólna

| Kryterium | Ocena | Uwagi |
|-----------|-------|-------|
| Design | 7/10 | Atrakcyjny, ale niespójny z Hero/QuickSearch |
| Prostota | 6/10 | Za dużo warstw (tło, cząsteczki, gradient) |
| Czytelność | 7/10 | Dobra typografia |
| Spójność z wzorcem | 5/10 | Inny nagłówek, CTA, strzałki |
| Spójność z resztą strony | 5/10 | Zgodna z AdvantagesSection, różna od Hero/QuickSearch |
| Dostępność | 6/10 | Brak aria, mały przycisk w modalu |

---

## Plan poprawek

1. **Hierarchia:** H1 → H2.
2. **Nagłówek:** Rozważyć `text-white` + `text-red-500` dla akcentu (jak QuickSearchBar) LUB zachować gradient dla spójności z AdvantagesSection – wybór zależy od kierunku designu.
3. **CTA:** Dodać gradient `from-red-600 to-red-700`, `shadow-xl shadow-red-900/30`.
4. **Dostępność:** `role="region"`, `aria-label`, `id="product-gallery"`.
5. **Touch targets:** Strzałki i przycisk modala – `min-w-[44px] min-h-[44px]`.
6. **Gradient line:** Opcjonalnie dodać linię na górze (jak QuickSearchBar) dla spójności.
7. **Strzałki:** Dopasować do `glass-button` LUB zachować obecny styl – decyzja designowa.
