# Naprawa automatycznego tworzenia deali z porzuconych koszyków

## Zmiany wprowadzone

### 1. Naprawa parsowania Blob w endpointcie webhook ✅

**Problem:** `sendBeacon` wysyła Blob, ale endpoint używał tylko `request.json()`, co mogło nie działać poprawnie.

**Rozwiązanie:** Endpoint teraz obsługuje zarówno zwykłe JSON requesty jak i Blob z sendBeacon:
- Najpierw próbuje parsować jako JSON
- Jeśli to się nie powiedzie, próbuje odczytać jako text i sparsować JSON
- Dodano lepsze logowanie błędów parsowania

### 2. Ulepszone logowanie w hooku ✅

**Dodano:**
- Logowanie przed wysłaniem beacon
- Sprawdzanie czy `sendBeacon` został zaakceptowany przez przeglądarkę
- Fallback do `fetch` z `keepalive: true` jeśli `sendBeacon` nie zadziała
- Logowanie błędów zamiast cichego ignorowania

### 3. Dynamiczne pobieranie sessionId ✅

**Problem:** `sessionId` był pobierany raz na początku komponentu, co mogło powodować problemy jeśli sesja nie była jeszcze utworzona.

**Rozwiązanie:** `sessionId` jest teraz pobierany dynamicznie w funkcji `buildPayload`, co zapewnia że zawsze jest aktualny.

### 4. Lepsze logowanie w endpointcie webhook ✅

**Dodano:**
- Logowanie więcej szczegółów o otrzymanym requeście
- Sprawdzanie czy request zawiera contact i items
- Lepsze logowanie błędów parsowania

## Jak przetestować

### Test 1: Sprawdź logi w konsoli przeglądarki
1. Otwórz checkout step 2 z produktami w koszyku
2. Otwórz DevTools Console
3. Zamknij zakładkę/przeglądarkę
4. Szukaj logów:
   - `[AbandonedCart:Heartbeat] Sending beacon on pagehide`
   - `[AbandonedCart:Webhook] Received webhook request`

### Test 2: Sprawdź logi serwera
1. Sprawdź logi backendu (Vercel logs lub lokalne)
2. Szukaj:
   - `[AbandonedCart:Webhook] Received webhook request`
   - `[AbandonedCart:Webhook] Creating Bitrix24 deal`
   - `✅ Deal created successfully`

### Test 3: Sprawdź bazę danych
```sql
SELECT id, session_id, status, bitrix_deal_id, created_at, expire_at
FROM abandoned_carts
WHERE session_id = 'your-session-id'
ORDER BY created_at DESC;
```

Jeśli deal został utworzony:
- `status` powinien być `'exported'`
- `bitrix_deal_id` powinien zawierać ID deala z Bitrix24

### Test 4: Ręczne wywołanie webhooka (dla debugowania)
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-12345678",
    "stage": "checkout_step2",
    "cartHasItems": true,
    "event": "pagehide",
    "contact": {
      "email": "test@example.com",
      "phone": "123456789"
    },
    "items": [{
      "productId": "prod-1",
      "productName": "Test Product",
      "quantity": 1,
      "price": 100
    }],
    "totalAmount": 100,
    "currency": "PLN"
  }'
```

## Możliwe problemy i rozwiązania

### Problem: sendBeacon nie działa w niektórych przeglądarkach
**Rozwiązanie:** Dodałem fallback do `fetch` z `keepalive: true` jeśli `sendBeacon` zwróci `false`.

### Problem: sessionId nie jest dostępny
**Rozwiązanie:** `sessionId` jest teraz pobierany dynamicznie w `buildPayload`, co zapewnia że zawsze jest aktualny.

### Problem: Endpoint nie może parsować Blob
**Rozwiązanie:** Endpoint teraz próbuje parsować jako JSON lub text, co powinno obsłużyć Blob z sendBeacon.

### Problem: Deal nie jest tworzony w Bitrix24
**Sprawdź:**
1. Czy `BITRIX24_WEBHOOK_URL` jest poprawne
2. Czy kategoria "Leady z Reklam" i etap "Porzucone Koszyki" istnieją w Bitrix24
3. Czy są błędy w logach serwera (`❌ Failed to create deal`)

## Następne kroki

1. Przetestuj w rzeczywistym środowisku
2. Sprawdź logi w konsoli przeglądarki przy opuszczaniu strony
3. Sprawdź logi serwera czy webhook dociera
4. Sprawdź czy deal jest tworzony w Bitrix24
5. Jeśli nadal nie działa, sprawdź szczegóły błędów w logach

