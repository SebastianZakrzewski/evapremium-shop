# Konfiguracja Przelewy24 - Instrukcje

## 1. Instalacja zależności

```bash
npm install
```

## 2. Konfiguracja zmiennych środowiskowych

### Zmienne Przelewy24 – dodaj do pliku `.env.local` (przykład z placeholderami):

```env
# ===========================================
# PRZELEWY24 CONFIGURATION
# ===========================================
# Dane z konta Przelewy24
P24_MERCHANT_ID=YOUR_P24_MERCHANT_ID
P24_POS_ID=YOUR_P24_POS_ID
P24_CRC_KEY=YOUR_P24_CRC_KEY
P24_API_KEY=YOUR_P24_API_KEY
P24_REPORT_KEY=YOUR_P24_REPORT_KEY

# Środowisko (sandbox lub production)
P24_ENVIRONMENT=sandbox

# URLe callback dla płatności
P24_URL_RETURN=https://your-domain/payment/success
P24_URL_STATUS=https://your-domain/api/payments/przelewy24/callback
```

### ✅ Gotowe! Możesz od razu uruchomić test.

## 3. Uruchomienie testu połączenia

```bash
npm run test:p24
```

## 4. Interpretacja wyników

### ✅ Wszystkie testy przeszły:
- Połączenie z P24 Sandbox działa poprawnie
- Dane uwierzytelniające są prawidłowe
- Można przejść do implementacji pełnej integracji

### ❌ Niektóre testy nie przeszły:
- Sprawdź czy wszystkie zmienne w `.env.local` są wypełnione
- Upewnij się, że dane z panelu P24 są aktualne
- Sprawdź połączenie internetowe

## 5. Następne kroki

Po pomyślnym teście:

1. **Skonfiguruj webhook w panelu P24:**
   - Zaloguj się do [panelu P24](https://sandbox.przelewy24.pl/panel/index.php)
   - Przejdź do ustawień konta
   - Ustaw URL Status: `https://evapremium.pl/api/payments/przelewy24/callback`

2. **Dodaj adres IP serwera:**
   - W sekcji "Adres IP" dodaj IP Twojego serwera
   - To zabezpieczy webhook przed nieautoryzowanymi żądaniami

3. **Przetestuj pełny przepływ:**
   - Utwórz testowe zamówienie
   - Przejdź przez proces płatności
   - Sprawdź czy webhook działa poprawnie

4. **Przejdź na produkcję:**
   - Skonfiguruj konto produkcyjne
   - Zaktualizuj zmienne środowiskowe
   - Przetestuj na środowisku produkcyjnym
   - **Szczegółowa instrukcja**: Zobacz `PRZELEWY24_PRODUCTION_SETUP.md`

### 🔄 Różnice między sandbox a produkcją

| Aspekt | Sandbox | Produkcja |
|--------|---------|-----------|
| **URL API** | `sandbox.przelewy24.pl` | `secure.przelewy24.pl` |
| **Klucze** | Testowe | Produkcyjne z panelu P24 |
| **Płatności** | Symulowane | Rzeczywiste |
| **Weryfikacja webhook** | Wyłączona | Włączona |
| **Weryfikacja transakcji** | Włączona | Włączona |

### 🔑 Klucze produkcyjne

Użyj wartości z panelu P24 (nie commituj realnych kluczy do repozytorium).

### ⚠️ Konfiguracja białej listy IP

W produkcji **MUSISZ** dodać adres IP serwera Vercel do białej listy w panelu P24:
1. Przejdź do **"Moje dane"** → **"Adres IP"**
2. Dodaj IP serwera Vercel (sprawdź w logach Vercel)
3. Bez tego webhook nie będzie działał!

### 🧪 Testowanie na produkcji

**ZALECANE**: Przetestuj z małą kwotą (1-5 PLN) przed pełnym uruchomieniem:
1. Utwórz testowe zamówienie
2. Przejdź przez proces płatności
3. Sprawdź czy webhook działa
4. Zweryfikuj w logach czy wszystko przeszło

## 6. Struktura plików

```
scripts/
├── test-p24-connection.ts    # Skrypt testowy
└── ...

env.example                   # Szablon zmiennych środowiskowych
.env.local                   # Twoje dane (NIE COMMITUJ!)
PRZELEWY24_SETUP.md          # Ta instrukcja
```

## 7. Bezpieczeństwo

⚠️ **WAŻNE:**
- Nigdy nie commituj pliku `.env.local`
- Regularnie rotuj klucze API
- Używaj HTTPS dla wszystkich URLi callback
- Monitoruj logi płatności

## 8. Wsparcie

W przypadku problemów:
1. Sprawdź logi w konsoli
2. Zweryfikuj dane w panelu P24
3. Sprawdź dokumentację API: https://developers.przelewy24.pl/
