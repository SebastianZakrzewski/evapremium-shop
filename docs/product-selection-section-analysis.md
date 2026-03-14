# Analiza sekcji "Popularne Marki Samochodów" (ProductSelection)

## Źródło

Komponent: [`src/features/products/components/ProductSelection.tsx`](src/features/products/components/ProductSelection.tsx)

---

## Wzorzec designu (ustalony dla Hero, QuickSearchBar, ProductGallery, AdvantagesSection)

| Element | Wzorzec | ProductSelection | Zgodność |
|---------|---------|------------------|----------|
| Tło | `bg-neutral-950` | `bg-neutral-950` | ✅ |
| Gradient line top | Tak | ❌ Brak | ❌ |
| Nagłówek | `text-white` + `text-red-500` | `text-white` (bez akcentu) | ❌ |
| Subtitle | `text-gray-300`, `max-w-2xl`, `text-sm sm:text-base md:text-lg` | `text-gray-300`, `max-w-3xl`, `text-xl` | ⚠️ |
| Padding | `py-20 md:py-24` | `py-8 md:py-12` | ❌ |
| Kontener | `max-w-5xl mx-auto px-4 sm:px-6` | `max-w-7xl mx-auto px-4` | ⚠️ |
| role="region" | ✅ | ❌ | ❌ |
| aria-label | ✅ | ❌ | ❌ |
| Ikona nad nagłówkiem | Brak | Car w gradient circle | ❌ |
| min-h | – | `min-h-screen` | ❌ Za wysoka sekcja |

---

## Słabe strony

### 1. Ikona nad nagłówkiem
- Car w gradient circle – inne sekcje nie mają ikon.

### 2. Brak gradient line
- QuickSearchBar, ProductGallery, AdvantagesSection mają gradient line na górze.

### 3. Nagłówek bez akcentu
- Wzorzec: "Tekst <span class='text-red-500'>akcent</span>".
- ProductSelection: "Popularne Marki Samochodów" – cały biały.

### 4. Padding i wysokość
- `py-8 md:py-12` – mniejszy niż `py-20 md:py-24`.
- `min-h-screen` – sekcja zajmuje cały ekran, łamie flow "książki".

### 5. Typografia
- H2: `text-4xl md:text-6xl` – wzorzec to `text-2xl sm:text-3xl md:text-4xl lg:text-5xl`.
- Subtitle: `text-xl` – wzorzec to `text-sm sm:text-base md:text-lg`.

### 6. Badge z emoji
- "🚗 Dostępne marki: X producentów" – unikalny element, można zachować w subtelniejszej formie.

### 7. Dostępność
- Brak `role="region"`, `aria-label`.

---

## Plan poprawek

1. Usunąć ikonę Car nad nagłówkiem.
2. Dodać gradient line na górze.
3. Nagłówek: "Popularne marki <span>samochodów</span>" (red accent).
4. Subtitle: dopasować typografię i max-w-2xl.
5. Padding: `py-20 md:py-24`.
6. Usunąć `min-h-screen` – naturalna wysokość.
7. Kontener: `max-w-5xl mx-auto px-4 sm:px-6`.
8. Dodać `role="region"`, `aria-label`.
9. Loading state: dopasować do wzorca.
10. Badge: zachować, uprościć styl (spójny z glass).
