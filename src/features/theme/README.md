# Motyw jasny / ciemny

Sklep używa klasowego dark mode (Tailwind v4 `@custom-variant dark`) i `next-themes`.

Domyślnie motyw podąża za systemem. Wybór użytkownika jest zapisywany w `localStorage` pod kluczem `theme`. Skrypt `themeInitScript` w `<head>` ustawia klasę `dark` albo `light` przed pierwszym malowaniem.

```tsx
import { ThemeProvider, ThemeToggle } from "@/features/theme"

export const Example = () => (
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>
)
```

Kolory powierzchni, tekstu, linii i akcentu są zmiennymi CSS (`--shop-*`, `--tesla-*`). Jasny motyw zachowuje dotychczasowe wartości. Zdjęcia produktów i hero nie dostają filtrów.
