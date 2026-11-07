# Naprawy konfiguratora — bez wdrożenia

Baza: `0bbf71e73c4c9552a67c483121079aad72785ef4`. Kolory paska ceny bez zmian. Bez pusha, PR i wdrożenia.

## Co się zmieniło

Wariant zostaje, jeśli cennik wybranego typu nadal go zawiera. Na atrapie „Przód” po „3D bez rantów” zostaje `front`, struktura jest aktywna, a cena atrapy nadal `319,00 zł` i rabat `80,00 zł`. Gdy klucza nie ma na liście wariantów, wybór jest czyszczony, w sekcji wariantu widać „Ten wariant nie jest dostępny dla wybranego typu dywanika. Wybierz wariant zestawu.”, a ta sekcja się otwiera. Cena nie jest wymyślana: bierze się tylko z odpowiedzi cennika.

Zapis czyta się przed pierwszym nadpisaniem `localStorage` i jest osobny dla pary marka+model. Odświeżenie Tucsona zostawia rok `2024`, skrzynię „Automatyczna” i wariant `front`. Inne auto nie dostaje tego zapisu. Zepsuty JSON jest pomijany. Rok, skrzynia i wariant z innego modelu nie wracają.

Adres z `year=` nie kasuje już później wybranego roku. Lista roczników zostaje zakresem katalogu, a nie jedną liczbą z adresu. Rok spoza zakresu nie jest dopisywany. Na telefonie, adres z `year=2024`, po wyborze 2024 widać skrzynię. Wejście nie zjeżdża (`scrollTop` 0). Pole szukania i „Dowiedz się więcej” na telefonie nadal ukryte.

Na desktopie „romby” pokazuje „Struktura komórek” i chowa kolor. Fraza bez trafień daje „Brak pasujących opcji. Dotychczasowy wybór zostaje bez zmian.”, a wariant zostaje `front`.

Pod zablokowaną strukturą jest zdanie: „Najpierw wybierz wariant zestawu. Bez tego nie da się ustawić struktury komórek ani zobaczyć ceny.”

## Kolory ceny

Cena sprzedaży: `rgb(255, 255, 255)`. Rabat: biały z przezroczystością 0,45 (`text-white/45`). Test paska sprawdza, że nie ma klas zieleni ani czerwieni. Zrzut: `/tmp/cfg-fixes/m390-price.png`. Liczby na zrzutach to ceny atrapy, nie cennik sklepu.

## Sprawdzenia

| Polecenie | Kod | Wynik |
| --- | ---: | --- |
| `npx vitest run` | 0 | 735 zaliczonych, 0 niezaliczonych, 146 plików |
| `npx tsc --noEmit` | 0 | |
| `npx eslint .` | 0 | 0 błędów, 554 ostrzeżenia |
| `npx next build --webpack` | 0 | |

Atrapa `http://127.0.0.1:3456`. Zapisów zamówień: 0. `pageerror`: 0. Node 22.

## Czego nie sprawdzono na żywo

Nie wołałem produkcyjnego cennika. Atrapa zwraca te same klucze wariantów dla obu typów, więc ścieżka „wariant znika” jest w teście jednostkowym, a ścieżka „wariant zostaje” także w przeglądarce. Stary konfigurator prosty nadal czyści wariant przy zmianie typu; sklep otwiera konfigurator v2.
