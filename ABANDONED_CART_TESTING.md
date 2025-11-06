# Test automatycznego tworzenia deali z porzuconych koszyków

## Sprawdzenie czy działa

### 1. Warunki wymagane do działania

#### Zmienne środowiskowe:
- `BITRIX24_WEBHOOK_URL` - URL webhooka Bitrix24 (wymagane)
- `BITRIX24_ABANDONED_CATEGORY_ID` - ID kategorii dla porzuconych koszyków (opcjonalne)
- `BITRIX24_ABANDONED_STAGE_ID` - ID etapu "Porzucone Koszyki" (opcjonalne)

#### Jeśli zmienne `BITRIX24_ABANDONED_*` nie są ustawione:
- System automatycznie znajdzie kategorię "Leady z Reklam"
- System automatycznie znajdzie etap "Porzucone Koszyki"

### 2. Dwa sposoby tworzenia deali

#### A. Webhook (natychmiastowo)
**Kiedy:** Gdy użytkownik opuszcza stronę (pagehide/beforeunload event)

**Endpoint:** `POST /api/abandoned-carts/webhook`

**Jak działa:**
1. Użytkownik jest na checkout step 2 z produktami w koszyku
2. Użytkownik zamyka zakładkę/przeglądarkę
3. `navigator.sendBeacon()` wysyła request do webhooka
4. Webhook **natychmiast** tworzy deal w Bitrix24
5. Status koszyka zmienia się na `exported`

#### B. Cron job (po 15 minutach)
**Kiedy:** Gdy koszyk wygasł (15 minut od ostatniej aktywności)

**Endpoint:** `POST /api/abandoned-carts/cron`

**Schedule:** Co 5 minut (Vercel Cron)

**Jak działa:**
1. Użytkownik jest na checkout step 2 z produktami w koszyku
2. Heartbeat aktualizuje `expire_at` co 30 sekund (jeśli użytkownik jest aktywny)
3. Jeśli użytkownik przestanie być aktywny, `expire_at` nie jest resetowany
4. Po 15 minutach `expire_at <= now()`
5. Cron wykrywa wygasły koszyk
6. Cron tworzy deal w Bitrix24
7. Status koszyka zmienia się na `exported`

### 3. Jak przetestować działanie

#### Test 1: Ręczne utworzenie deala (debug endpoint)

**Endpoint:** `POST /api/abandoned-carts/debug/force-export`

**Request:**
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/debug/force-export \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-session-123"}'
```

**Lub bez sessionId (wybierze najnowszy pending koszyk):**
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/debug/force-export \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Odpowiedź sukcesu:**
```json
{
  "success": true,
  "dealId": "123",
  "sessionId": "test-session-123"
}
```

**Uwaga:** Tylko w środowisku development (blokowane w production)

#### Test 2: Symulacja webhooka

**Endpoint:** `POST /api/abandoned-carts/webhook`

**Request:**
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
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

#### Test 3: Symulacja crona

**Endpoint:** `POST /api/abandoned-carts/cron`

**Request:**
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/cron \
  -H "Content-Type: application/json"
```

**Sprawdź odpowiedź:**
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "id": "cart-id-123",
      "bitrixDealId": "456"
    }
  ]
}
```

#### Test 4: Przyspieszenie wygasania koszyka (debug)

**Endpoint:** `POST /api/abandoned-carts/debug/fast-forward`

**Request:**
```bash
curl -X POST http://localhost:3000/api/abandoned-carts/debug/fast-forward \
  -H "Content-Type: application/json" \
  -d '{"minutes": 16}'
```

To ustawi `expire_at` na 16 minut wstecz dla najnowszego pending koszyka, co pozwoli cronowi go przetworzyć.

### 4. Sprawdzenie logów

Wszystkie endpointy logują swoje działania:

**Format logów:**
- `[AbandonedCart:Heartbeat]` - logi heartbeat endpoint
- `[AbandonedCart:Webhook]` - logi webhook endpoint
- `[AbandonedCart:Cron]` - logi cron endpoint

**Przykładowe logi sukcesu:**
```
[AbandonedCart:Webhook] Received webhook request { sessionId: 'test-ses...', event: 'pagehide' }
[AbandonedCart:Webhook] Creating Bitrix24 deal for cart { cartId: '...' }
💼 Creating Bitrix24 deal: { title: '[Porzucony koszyk] BMW X5', ... }
✅ Deal created successfully with stage: { id: '123', ... }
[AbandonedCart:Webhook] Successfully created deal { cartId: '...', dealId: '123' }
```

**Przykładowe logi błędów:**
```
[AbandonedCart:Webhook] Error finding existing cart { error: '...' }
❌ Failed to create deal: { error: 'Bitrix24 API Error: ...' }
```

### 5. Sprawdzenie w Bazie Danych

**Sprawdź czy koszyk został wyeksportowany:**
```sql
SELECT id, session_id, status, bitrix_deal_id, expire_at, created_at
FROM abandoned_carts
WHERE session_id = 'test-session-123'
ORDER BY created_at DESC;
```

**Sprawdź ostatnie wyeksportowane koszyki:**
```sql
SELECT id, session_id, status, bitrix_deal_id, expire_at, created_at
FROM abandoned_carts
WHERE status = 'exported'
ORDER BY created_at DESC
LIMIT 10;
```

### 6. Sprawdzenie w Bitrix24

Po utworzeniu deala, sprawdź w Bitrix24:
1. Kategoria: "Leady z Reklam" (lub z `BITRIX24_ABANDONED_CATEGORY_ID`)
2. Etap: "Porzucone Koszyki" (lub z `BITRIX24_ABANDONED_STAGE_ID`)
3. Tytuł: `[Porzucony koszyk] {marka} {model}` (np. `[Porzucony koszyk] BMW X5`)
4. Wartość: zgodna z `total_amount` z koszyka
5. Komentarze: zawierają konfigurację, UTM i session ID

### 7. Częste problemy

#### Problem: Deal nie jest tworzony
**Sprawdź:**
1. Czy `BITRIX24_WEBHOOK_URL` jest poprawne
2. Czy Bitrix24 API działa (sprawdź logi)
3. Czy kategoria/etap istnieją w Bitrix24
4. Czy koszyk ma `status='pending'` i `bitrix_deal_id IS NULL`

#### Problem: Duplikaty deali
**Powinno być naprawione przez:**
- Atomic updates z warunkiem `.is('bitrix_deal_id', null)`
- Double-check przed utworzeniem deala
- Sprawdzenie `bitrix_deal_id` przed update

#### Problem: Cron nie przetwarza koszyków
**Sprawdź:**
1. Czy cron jest uruchomiony (Vercel Cron schedule)
2. Czy koszyki mają `expire_at <= now()`
3. Czy koszyki mają `status='pending'` i `bitrix_deal_id IS NULL`
4. Czy `metadata.stage='checkout_step2'`

### 8. Monitoring

**Metryki do monitorowania:**
- Liczba tworzonych deali dziennie
- Liczba porzuconych koszyków
- Procent koszyków które zostały wyeksportowane
- Czas między porzuceniem a utworzeniem deala
- Błędy przy tworzeniu deali

**Logi do monitorowania:**
- `[AbandonedCart:*]` - wszystkie logi modułu
- `💼 Creating Bitrix24 deal` - próby utworzenia deali
- `❌ Failed to create deal` - błędy przy tworzeniu deali

