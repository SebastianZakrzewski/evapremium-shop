# Generator obrazu modelu Audi z dywanikami 3D

Skrypt do automatycznego generowania obrazu przedstawiającego model Audi na tle dywaników 3D.

## Funkcjonalność

1. **Pobiera zdjęcie modelu Audi** z internetu (domyślnie Audi A4 B9)
2. **Tworzy obraz dywaników 3D** na podstawie opisu (lub używa istniejącego pliku)
3. **Łączy obrazy** - umieszcza zdjęcie samochodu nad obrazem dywaników
4. **Dodaje opis modelu** pod obrazem z informacjami o modelu

## Wymagania

- Node.js (wersja 18+)
- npm
- Pakiet `sharp` (zainstalowany automatycznie)

## Instalacja

```bash
npm install sharp --save-dev
```

## Użycie

### Podstawowe użycie (tworzy obraz dywaników automatycznie)

```bash
node scripts/generate-audi-model-image.js
```

### Z własnym obrazem dywaników

```bash
node scripts/generate-audi-model-image.js ścieżka/do/obrazu-dywaników.png
```

### Z własnym obrazem dywaników i własnym URL zdjęcia samochodu

```bash
node scripts/generate-audi-model-image.js ścieżka/do/obrazu-dywaników.png https://url-do-zdjęcia-samochodu.jpg
```

## Przykład

```bash
# Generuje obraz z domyślnymi ustawieniami
node scripts/generate-audi-model-image.js

# Używa własnego obrazu dywaników
node scripts/generate-audi-model-image.js public/images/mats-3d.png

# Używa własnego obrazu dywaników i własnego URL zdjęcia
node scripts/generate-audi-model-image.js public/images/mats-3d.png https://example.com/audi-a4.jpg
```

## Wyjście

Obraz zostanie zapisany w katalogu `output/` jako `audi-a4-b9-with-mats.png`.

## Konfiguracja modelu

Informacje o modelu można zmienić w pliku `scripts/generate-audi-model-image.js` w obiekcie `MODEL_INFO`:

```javascript
const MODEL_INFO = {
  brand: "Audi",
  model: "A4",
  generation: "B9",
  years: "2015-2023",
  bodyType: "Sedan",
  description: "Opis modelu..."
};
```

## Struktura obrazu wyjściowego

```
┌─────────────────────────┐
│   Zdjęcie samochodu     │
│   (Audi A4 B9)          │
├─────────────────────────┤
│   Obraz dywaników 3D    │
│   (z czerwoną obwódką)  │
├─────────────────────────┤
│   Tytuł: Audi A4 B9     │
│   Podtytuł: Sedan •     │
│   2015-2023             │
│   Opis modelu...        │
└─────────────────────────┘
```

## Rozwiązywanie problemów

### Błąd: "Cannot find module 'sharp'"
```bash
npm install sharp --save-dev
```

### Błąd przy pobieraniu zdjęcia
- Sprawdź połączenie z internetem
- Użyj innego URL zdjęcia jako argumentu
- Upewnij się, że URL wskazuje na prawidłowy obraz

### Obraz dywaników nie jest wyświetlany poprawnie
- Upewnij się, że plik istnieje i jest w formacie PNG/JPG
- Sprawdź ścieżkę do pliku

## Autor

Wygenerowane automatycznie dla projektu eva-website.








