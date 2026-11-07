# Konfigurator na mobile — 7 listopada 2026

Tylko lokalnie. Bez pusha, PR i wdrożenia. Produkcja nadal serwuje `4b89c21882abc842bf0ea6442e594bcfe5fdbb17`. Ta zmiana jest commitem po tym SHA.

## Co widać na telefonie

Pod podglądem zniknęły trzy rzeczy, które zasłaniały opcje:

- czerwony link „Dowiedz się więcej”
- szara karta „Dowiedz się więcej o dywanikach EVA” / „Poznaj materiał, strukturę komórek i wykończenie.”
- pole „Szukaj opcji”

Na szerokości od `lg` (desktop 1280 i 1440) te trzy elementy zostają. Sekcje opcji (auto, typ, wariant, struktura, kolory) są na mobile bez wyszukiwarki. Nagłówek „Hyundai Tucson” jest mniejszy (`text-lg`, na `lg` nadal `2rem`). Miniatury galerii pod zdjęciem mają 44 px wysokości.

„Wróć do edycji” i „Przejdź do koszyka” stoją w jednym rzędzie, wysokość 44 px (`h-11`). Od `sm` wraca poprzedni rozmiar 48 px i szerszy przycisk koszyka. Etykieta w kodzie to „Przejdź do koszyka”, nie „Dodaj do koszyka”.

## Przeskok w dół

Przy adresie z Hyundai Tucson, na 390×844, panel `main` po wejściu sam schodził z `scrollTop` 226 (po 0,4 s) do **639** (po ok. 3 s). Robił to `useConfiguratorV2InitialVehicleScroll`: po załadowaniu danych przewijał do kolejnego pustego pola. Na desktopie `scrollTop` zostawał 0.

Po zmianie, ten sam adres, ten sam viewport: `scrollTop` **0** na starcie i po 3 s. `window.scrollY` 0. Galeria aktywnej miniatury przewija tylko swój poziomy pasek, nie stronę. Przewinięcie po „Podsumowanie” i „Wróć” zostaje, bo to klik użytkownika.

## Sprawdzenia

Harness `http://127.0.0.1:3456`, atrapa, bez POST zamówienia. `pageerror`: 0. Brak poziomego overflow na 390.

| Polecenie | Kod | Wynik |
| --- | ---: | --- |
| `npx vitest run` | 0 | 720 zaliczonych, 0 niezaliczonych, 143 pliki |
| `npx tsc --noEmit` | 0 | |
| `npx eslint .` | 0 | 0 błędów, 554 ostrzeżenia |
| `npx next build --webpack` | 0 | |

Widoki po zmianie: 320×568, 360×640, 390×844, 430×932, 390×500 i krajobraz 844×390. Rok 2024 da się wybrać. Na tej atrapie nie doszedłem do aktywnego podsumowania (brak kontrolki skrzyni pod tą ścieżką); rząd przycisków jest w teście `SummarySection`.

Zrzuty: `/tmp/cfg-ui/before/m390-top.png`, `/tmp/cfg-ui/before/m390-after-jump.png`, `/tmp/cfg-ui/after/m390-top.png`, `/tmp/cfg-ui/after/desk1280.png`.
