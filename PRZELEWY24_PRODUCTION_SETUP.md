# 🚀 Przelewy24 - Wdrożenie Produkcji

## 📋 Checklist przejścia na produkcję

### ✅ 1. Przygotowanie danych produkcyjnych

- [ ] **Zarejestrowane konto produkcyjne** w Przelewy24
- [ ] **Pobrane klucze produkcyjne** z panelu P24 (wpisz do `.env`):
  - [ ] Merchant ID / POS ID: `YOUR_P24_MERCHANT_ID` / `YOUR_P24_POS_ID`
  - [ ] Klucz CRC: `YOUR_P24_CRC_KEY`
  - [ ] Klucz API: `YOUR_P24_API_KEY`
  - [ ] Klucz do raportów: `YOUR_P24_REPORT_KEY`

### ✅ 2. Konfiguracja panelu Przelewy24

- [ ] **URL Status** ustawiony na: `https://evapremium.pl/api/payments/p24/callback`
- [ ] **URL Return** ustawiony na: `https://evapremium.pl/payment/success`
- [ ] **Adres IP serwera** dodany do białej listy (IP Vercel)
- [ ] **Test połączenia** z panelu P24 wykonany

### ✅ 3. Konfiguracja zmiennych środowiskowych

**W Vercel Dashboard:**
```env
P24_ENVIRONMENT=production
P24_MERCHANT_ID=YOUR_P24_MERCHANT_ID
P24_POS_ID=YOUR_P24_POS_ID
P24_CRC_KEY=YOUR_P24_CRC_KEY
P24_API_KEY=YOUR_P24_API_KEY
P24_REPORT_KEY=YOUR_P24_REPORT_KEY
```

### ✅ 4. Testowanie przed uruchomieniem

- [ ] **Test z małą kwotą** (1-5 PLN)
- [ ] **Weryfikacja webhook** - sprawdzenie logów
- [ ] **Test płatności** - pełny przepływ
- [ ] **Weryfikacja weryfikacji** - sprawdzenie czy P24 zwraca success

## 🔧 Instrukcje krok po kroku

### Krok 1: Pobranie kluczy produkcyjnych

1. Zaloguj się do [panelu Przelewy24](https://secure.przelewy24.pl/panel)
2. Przejdź do **"Moje dane"**
3. Znajdź sekcję **"Dane API i konfiguracja"**
4. Skopiuj klucze z panelu do `.env` (nie commituj):
   - **Klucz CRC**: `YOUR_P24_CRC_KEY`
   - **Klucz do raportów**: `YOUR_P24_REPORT_KEY`
   - **Klucz zamówień**: `YOUR_P24_API_KEY`

### Krok 2: Konfiguracja panelu P24

1. W sekcji **"Moje dane"** znajdź **"Konfiguracja"**
2. Ustaw **URL Status**: `https://evapremium.pl/api/payments/p24/callback`
3. Ustaw **URL Return**: `https://evapremium.pl/payment/success`
4. W sekcji **"Adres IP"** dodaj IP serwera Vercel
5. Zapisz zmiany

### Krok 3: Konfiguracja Vercel

1. Przejdź do [Vercel Dashboard](https://vercel.com/dashboard)
2. Wybierz projekt `eva-website-v0.1-alpha`
3. Przejdź do **Settings** → **Environment Variables**
4. Dodaj/edytuj zmienne:
   ```
   P24_ENVIRONMENT = production
   P24_MERCHANT_ID = YOUR_P24_MERCHANT_ID
   P24_POS_ID = YOUR_P24_POS_ID
   P24_CRC_KEY = YOUR_P24_CRC_KEY
   P24_API_KEY = YOUR_P24_API_KEY
   P24_REPORT_KEY = YOUR_P24_REPORT_KEY
   ```
5. **Redeploy** aplikacji

### Krok 4: Testowanie

1. **Test połączenia**:
   ```bash
   # Sprawdź logi po deploy
   vercel logs --follow
   ```

2. **Test płatności**:
   - Utwórz zamówienie z małą kwotą (1-5 PLN)
   - Przejdź przez proces płatności
   - Sprawdź czy webhook działa
   - Zweryfikuj w logach czy weryfikacja P24 przeszła

## 🔍 Monitoring i diagnostyka

### Logi do sprawdzenia

1. **Logi aplikacji** (Vercel):
   ```bash
   vercel logs --follow
   ```

2. **Logi P24** (panel):
   - Przejdź do **"Transakcje"** w panelu P24
   - Sprawdź status transakcji testowych

3. **Logi webhook**:
   - Sprawdź czy webhook otrzymuje dane
   - Zweryfikuj czy weryfikacja P24 działa

### Typowe problemy

| Problem | Rozwiązanie |
|---------|-------------|
| "Nieprawidłowy podpis webhook" | Sprawdź czy `P24_CRC_KEY` jest poprawny |
| "Błąd weryfikacji P24" | Sprawdź czy `P24_REPORT_KEY` jest poprawny |
| "Webhook nie działa" | Sprawdź URL w panelu P24 i IP serwera |
| "Płatność nie przechodzi" | Sprawdź czy `P24_ENVIRONMENT=production` |

## 🚨 Rollback (powrót do sandbox)

W przypadku problemów:

1. **Zmiana środowiska**:
   ```env
   P24_ENVIRONMENT=sandbox
   ```

2. **Przywrócenie kluczy sandbox** – wstaw wartości z panelu sandbox:
   ```env
   P24_CRC_KEY=YOUR_SANDBOX_P24_CRC_KEY
   P24_API_KEY=YOUR_SANDBOX_P24_API_KEY
   P24_REPORT_KEY=YOUR_SANDBOX_P24_REPORT_KEY
   ```

3. **Redeploy** aplikacji

## 🔒 Bezpieczeństwo

### ✅ Zabezpieczenia włączone w produkcji

- **Weryfikacja podpisu webhook** - włączona tylko w produkcji
- **Weryfikacja transakcji P24** - zawsze włączona
- **HTTPS** - wszystkie URLe callback
- **Ostrzeżenia** - logi informują o środowisku produkcyjnym

### ⚠️ Zalecenia bezpieczeństwa

- **Regularnie rotuj klucze** API (co 3-6 miesięcy)
- **Monitoruj logi** płatności codziennie
- **Nie commituj** kluczy produkcyjnych do repozytorium
- **Używaj zmiennych środowiskowych** w Vercel
- **Testuj zmiany** najpierw na sandbox

## 📞 Wsparcie

W przypadku problemów:

1. **Sprawdź logi** aplikacji i P24
2. **Zweryfikuj konfigurację** w panelu P24
3. **Przetestuj** na sandbox
4. **Skontaktuj się** z supportem Przelewy24

---

**Status**: ✅ Gotowe do wdrożenia produkcji
**Ostatnia aktualizacja**: $(date)
