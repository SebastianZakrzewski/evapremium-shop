# Analiza sekcji "Poznaj nasz produkt" (AdvantagesSection)

## Źródło

Komponent: [`src/features/marketing/components/AdvantagesSection.tsx`](src/features/marketing/components/AdvantagesSection.tsx)

---

## Wzorzec designu (ustalony dla Hero, QuickSearchBar, ProductGallery)

| Element | Wzorzec | AdvantagesSection | Zgodność |
|---------|---------|-------------------|----------|
| Tło | `bg-neutral-950` | `bg-neutral-950` | ✅ |
| Gradient line top | Tak (QuickSearch, Gallery) | ❌ Brak | ❌ |
| Nagłówek | `text-white` + `text-red-500` | `bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text` | ❌ Inny styl |
| Subtitle | `text-gray-300`, `<p>` | `text-gray-300`, `<h2>` | ⚠️ Zła semantyka |
| Padding | `py-20 md:py-24` | `py-12 md:py-16` | ❌ |
| Kontener | `max-w-5xl mx-auto px-4 sm:px-6` | `container mx-auto px-4` | ⚠️ |
| role="region" | ✅ | ❌ | ❌ |
| aria-label | ✅ | ❌ | ❌ |
| Ikona nad nagłówkiem | Brak | Package w gradient circle | ❌ |
| Blur circles | Brak | bg-red-900/10, bg-blue-900/10 | ❌ |
| Gradient overlay | Brak | from-red-900/10 via-neutral-950 | ❌ |
| Animowane cząsteczki | Brak | 4 cząsteczki | ❌ |

---

## Słabe strony

### 1. Hierarchia
- **H1** dla tytułu sekcji – Hero ma już H1. Powinno być **H2**.
- **H2** dla subtitle – powinno być **`<p>`**.

### 2. Niespójność wizualna
- Ikona, blur, gradient, cząsteczki – Hero, QuickSearch, Gallery mają czyste tło.
- Gradient na całym nagłówku – wzorzec to `text-white` + `text-red-500`.

### 3. Dostępność
- Brak `role="region"`, `aria-label`.
- Karty: `div` z `onClick` – brak obsługi klawiatury (tabIndex, onKeyDown).
- "Więcej" w `text-gray-600` – słaby kontrast na neutral-950.

### 4. Touch targets
- Karty są duże – OK.
- Ikona w karcie 40×40px – na granicy 44px.

---

## Plan poprawek

1. Usunąć: ikonę, blur circles, gradient overlay, cząsteczki.
2. Nagłówek: H2, `text-white` + `text-red-500` (np. "Poznaj nasz **produkt**").
3. Subtitle: `<p>`, `text-sm sm:text-base md:text-lg`, `max-w-2xl`.
4. Dodać gradient line na górze.
5. Padding: `py-20 md:py-24`.
6. Kontener: `max-w-5xl mx-auto px-4 sm:px-6`.
7. Dodać `role="region"`, `aria-label`.
8. Karty: `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space).
9. "Więcej": `text-gray-400` lub `text-gray-500` (lepszy kontrast).
10. Ikona w karcie: `min-w-[44px] min-h-[44px]` lub zachować 40px (akceptowalne).
