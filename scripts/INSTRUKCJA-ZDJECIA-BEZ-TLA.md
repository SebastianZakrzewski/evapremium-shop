# Instrukcja: Jak użyć zdjęcia z usuniętym tłem

## Opcja 1: Użyj lokalnego pliku PNG z przezroczystym tłem

Najlepszym rozwiązaniem jest użycie zdjęcia PNG z już usuniętym tłem:

```bash
# Użyj lokalnego pliku PNG z przezroczystym tłem
node scripts/generate-audi-model-image.js null ./path/to/audi-a4-b9-transparent.png
```

## Opcja 2: Skrypt automatycznie usuwa białe tło

Skrypt automatycznie próbuje usunąć białe/jasne tło ze zdjęć. Działa najlepiej ze zdjęciami na białym tle.

```bash
# Użyj URL do zdjęcia (skrypt spróbuje usunąć białe tło)
node scripts/generate-audi-model-image.js null https://example.com/audi-a4.jpg
```

## Gdzie znaleźć zdjęcia Audi A4 B9 z przezroczystym tłem?

1. **FavPNG**: https://favpng.com/png_search/audi-a4-b9
   - Darmowe obrazy PNG z przezroczystym tłem

2. **PNGPlay**: https://www.pngplay.com/free-png/audi-a4
   - Różne obrazy Audi A4 z przezroczystym tłem

3. **FreeIconsPNG**: https://www.freeiconspng.com/images/audi-png
   - Obrazy Audi na przezroczystym tle

4. **Hum2D**: https://hum2d.com/clipart/audi-a4-b9-sedan-2016/
   - Plany techniczne Audi A4 B9 w formacie PNG

## Jak przygotować własne zdjęcie?

1. **Użyj narzędzi online do usuwania tła:**
   - remove.bg (https://www.remove.bg/)
   - Photopea (https://www.photopea.com/)
   - Canva Background Remover

2. **Zapisz jako PNG** z przezroczystym tłem

3. **Użyj w skrypcie:**
   ```bash
   node scripts/generate-audi-model-image.js null ./twoje-zdjecie.png
   ```

## Przykład użycia z lokalnym plikiem

```bash
# Jeśli masz plik audi-a4-transparent.png w katalogu images/
node scripts/generate-audi-model-image.js null ./images/audi-a4-transparent.png
```

## Uwagi

- Skrypt automatycznie wykrywa, czy obraz ma już przezroczyste tło (PNG z kanałem alpha)
- Jeśli obraz nie ma przezroczystego tła, skrypt próbuje usunąć białe/jasne tło
- Dla najlepszych wyników użyj zdjęć PNG z już usuniętym tłem








