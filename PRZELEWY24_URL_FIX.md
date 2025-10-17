# Naprawa URL-i Przelewy24 - Instrukcje

## Problem
Przelewy24 przekierowuje do ngrok URL zamiast do evapremium.pl po zatwierdzeniu płatności.

## Rozwiązanie

### 1. ✅ Zaktualizowano zmienne środowiskowe
W pliku `.env` zmieniono wszystkie URL-e z ngrok na evapremium.pl:

```env
NEXTAUTH_URL=https://evapremium.pl
API_BASE_URL=https://evapremium.pl/api
P24_URL_RETURN=https://evapremium.pl/payment/success
P24_URL_STATUS=https://evapremium.pl/api/payments/p24/callback
```

### 2. 🔧 Wymagane działania w panelu Przelewy24

#### A. Zaloguj się do panelu Przelewy24
- **Sandbox**: https://sandbox.przelewy24.pl/panel/index.php
- **Production**: https://secure.przelewy24.pl/panel/index.php

#### B. Zaktualizuj ustawienia konta
1. Przejdź do **"Ustawienia konta"** lub **"Konfiguracja"**
2. Znajdź sekcję **"URL-e zwrotne"** lub **"Callback URLs"**
3. Zaktualizuj następujące adresy:

   **URL powrotu (Return URL):**
   ```
   https://evapremium.pl/payment/success
   ```

   **URL statusu (Status URL):**
   ```
   https://evapremium.pl/api/payments/p24/callback
   ```

#### C. Dodaj adres IP serwera (opcjonalnie)
1. W sekcji **"Adres IP"** dodaj IP serwera Vercel
2. To zabezpieczy webhook przed nieautoryzowanymi żądaniami

### 3. 🚀 Wdrożenie zmian

#### A. Zrestartuj aplikację
```bash
# Zatrzymaj serwer development
Ctrl+C

# Uruchom ponownie
npm run dev
```

#### B. Wdróż na Vercel
```bash
# Commit zmian
git add .env
git commit -m "fix: update Przelewy24 URLs from ngrok to evapremium.pl"

# Push do GitHub
git push origin master

# Deploy na Vercel
vercel --prod
```

### 4. ✅ Weryfikacja

#### A. Test w sandbox
1. Utwórz testowe zamówienie
2. Przejdź przez proces płatności
3. Sprawdź czy po zatwierdzeniu przekierowuje do:
   ```
   https://evapremium.pl/payment/success
   ```

#### B. Sprawdź logi
- Sprawdź logi Vercel czy webhook działa
- Sprawdź czy zamówienia są zapisywane w bazie danych

### 5. 🔄 Przejście na produkcję

Po pomyślnym teście w sandbox:

1. **Zaktualizuj zmienne środowiskowe na produkcji:**
   ```env
   P24_ENVIRONMENT=production
   ```

2. **Zaktualizuj URL-e w panelu produkcyjnym P24**

3. **Przetestuj na produkcji**

## Status
- ✅ Zmienne środowiskowe zaktualizowane
- ⏳ Wymagana aktualizacja w panelu Przelewy24
- ⏳ Wymagane wdrożenie na Vercel
