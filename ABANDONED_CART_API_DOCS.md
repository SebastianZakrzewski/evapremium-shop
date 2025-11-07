# Dokumentacja API - Porzucone Koszyki

## Endpointy API

### 1. POST `/api/abandoned-carts` (Heartbeat)

**Opis:** Endpoint wywoływany co 30 sekund podczas checkout step 2, aby śledzić aktywność użytkownika i aktualizować dane koszyka.

**Request Body:**
```typescript
{
  sessionId: string; // min 8 znaków
  stage: 'checkout_step2'; // tylko checkout_step2
  cartHasItems: boolean; // musi być true
  utm?: Record<string, unknown>;
  contact?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  car?: {
    make?: string;
    model?: string;
    year?: string | number;
    bodyType?: string;
  };
  configuration?: {
    variant?: number | string;
    setType?: number | string;
    cellShape?: number | string;
    materialColor?: number | string;
    trimColor?: number | string;
  };
  items?: Array<{
    productId?: string;
    productName?: string;
    productType?: string;
    quantity?: number;
    price?: number;
    currency?: string;
  }>;
  currency?: string; // default: 'PLN'
  totalAmount?: number;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: AbandonedCartRecord;
  skipped?: boolean;
  reason?: string;
  error?: string;
}
```

**Logika:**
- Jeśli istnieje koszyk dla danej sesji (status='pending', bitrix_deal_id=null) → aktualizuje
- Jeśli nie istnieje → tworzy nowy
- Resetuje `expire_at` do `now + 15 minut`
- Aktualizuje `last_activity_at` do teraz

**Race Condition Protection:**
- Aktualizacja używana z warunkiem `.is('bitrix_deal_id', null)` aby uniknąć aktualizacji już wyeksportowanych koszyków
- Jeśli koszyk został już wyeksportowany, zwraca `skipped: true`

---

### 2. POST `/api/abandoned-carts/webhook` (Pagehide/Beforeunload)

**Opis:** Endpoint wywoływany przez `navigator.sendBeacon()` gdy użytkownik opuszcza stronę (pagehide/beforeunload event).

**Request Body:**
```typescript
{
  ...same as heartbeat endpoint
  event?: 'pagehide' | 'beforeunload' | 'heartbeat';
}
```

**Response:**
```typescript
{
  success: boolean;
  dealId?: string;
  recordId?: string;
  skipped?: boolean;
  reason?: string;
  warning?: string;
  error?: string;
}
```

**Logika:**
1. Upsertuje koszyk (jak heartbeat)
2. **Natychmiast** tworzy deal w Bitrix24
3. Aktualizuje koszyk: `bitrix_deal_id` = ID deala, `status` = 'exported'

**Race Condition Protection:**
- Przed utworzeniem deala sprawdza czy koszyk już ma `bitrix_deal_id`
- Update używa warunku `.is('bitrix_deal_id', null)` aby uniknąć duplikatów
- Jeśli update nie zwrócił rekordu, oznacza że inny proces już utworzył deal

**Uwaga:** Webhook tworzy deal natychmiastowo, nawet jeśli koszyk jeszcze nie wygasł. To jest zamierzone zachowanie - jeśli użytkownik opuszcza stronę, uznajemy to za porzucenie koszyka.

---

### 3. POST `/api/abandoned-carts/cron` (Scheduled Job)

**Opis:** Endpoint wywoływany przez Vercel Cron co 5 minut. Przetwarza koszyki które wygasły (expire_at <= now) i nie zostały jeszcze wyeksportowane.

**Schedule:** `*/5 * * * *` (co 5 minut) - skonfigurowane w `vercel.json`

**Request:** Brak body (ignorowane)

**Response:**
```typescript
{
  success: boolean;
  count: number;
  results: Array<{
    id: string;
    bitrixDealId?: string;
    error?: string;
  }>;
  error?: string;
}
```

**Logika:**
1. Znajduje koszyki: `status='pending'`, `expire_at <= now()`, `bitrix_deal_id IS NULL`, `metadata.stage='checkout_step2'`
2. Limit: 50 koszyków na wywołanie
3. Dla każdego koszyka:
   - Sprawdza czy jeszcze nie ma deala (double-check)
   - Tworzy deal w Bitrix24
   - Aktualizuje koszyk z `bitrix_deal_id` (atomic update z warunkiem `.is('bitrix_deal_id', null)`)

**Race Condition Protection:**
- Double-check przed utworzeniem deala
- Atomic update z warunkiem sprawdzającym czy deal_id jest jeszcze null
- Jeśli update nie zwrócił rekordu, oznacza że inny proces już utworzył deal

---

### 4. POST `/api/abandoned-carts/convert`

**Opis:** Oznacza koszyk jako skonwertowany (gdy użytkownik wraca i kończy zamówienie).

**Request Body:**
```typescript
{
  sessionId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: AbandonedCartRecord;
  error?: string;
}
```

**Logika:**
- Aktualizuje koszyk: `status` = 'converted'
- Wyszukuje po `session_id`

---

## React Hook

### `useAbandonedCartHeartbeat`

**Opis:** Hook zarządzający heartbeat i eventami pagehide/beforeunload.

**Usage:**
```typescript
useAbandonedCartHeartbeat(
  active: boolean, // czy hook jest aktywny (np. currentStep === 2 && cartHasItems)
  buildPayload: () => Payload, // funkcja zwracająca payload
  options?: { intervalMs?: number } // default: 30000ms (30s)
);
```

**Zachowanie:**
1. Gdy `active === true`:
   - Wysyła initial ping
   - Ustawia interval wysyłający heartbeat co `intervalMs` (default 30s)
   - Dodaje listenery na `pagehide` i `beforeunload` które wysyłają beacon do `/api/abandoned-carts/webhook`
2. Gdy `active === false`:
   - Czyści interval
   - Usuwa listenery

**Optymalizacja:**
- Używa `useRef` do przechowywania `buildPayload` aby uniknąć restartowania effect przy każdym renderze
- Dependency array zawiera tylko `active` i `intervalMs`, nie `buildPayload`

---

## Mechanizm wygasania

**Czas wygasania:** 15 minut od ostatniej aktywności

**Aktualizacja:**
- Każde heartbeat/webhook resetuje `expire_at` do `now + 15 minut`
- Jeśli użytkownik jest aktywny na checkout step 2, koszyk nigdy nie wygaśnie
- Jeśli użytkownik przestanie być aktywny, cron przetworzy koszyk po 15 minutach

---

## Race Condition Protection

Moduł używa następujących mechanizmów ochrony przed race conditions:

1. **Atomic Updates:**
   - Wszystkie update'y używają warunku `.is('bitrix_deal_id', null)`
   - Jeśli update nie zwróci rekordu, oznacza że inny proces już utworzył deal

2. **Double-Check:**
   - Cron sprawdza ponownie przed utworzeniem deala czy koszyk jeszcze nie ma deala

3. **Select z bitrix_deal_id:**
   - Webhook sprawdza czy koszyk już ma deal przed utworzeniem nowego

4. **Status Updates:**
   - Status zmienia się na 'exported' tylko gdy deal został pomyślnie utworzony
   - Filtry zawsze sprawdzają `bitrix_deal_id IS NULL` aby uniknąć duplikatów

---

## Logowanie

Wszystkie endpointy używają konsystentnego formatu logowania:

```
[AbandonedCart:{Endpoint}] Message { context }
```

**Przykłady:**
- `[AbandonedCart:Heartbeat] Received heartbeat`
- `[AbandonedCart:Webhook] Successfully created deal`
- `[AbandonedCart:Cron] Race condition detected`

Logi zawierają:
- Session ID (obcięte do 8 znaków + '...' dla bezpieczeństwa)
- Cart ID
- Deal ID (jeśli dotyczy)
- Błędy z pełnym kontekstem

---

## Statusy koszyków

- `pending`: Koszyk jest aktywny, czeka na wygasnięcie lub eksport
- `exported`: Deal został utworzony w Bitrix24
- `converted`: Użytkownik wrócił i zakończył zamówienie
- `discarded`: Koszyk został odrzucony (nieużywane w obecnej implementacji)

---

## Przykładowy przepływ

1. **Użytkownik wchodzi na checkout step 2:**
   - Hook aktywuje się: `active = true`
   - Initial ping → `/api/abandoned-carts` tworzy koszyk
   - Heartbeat co 30s aktualizuje `expire_at` i `last_activity_at`

2. **Użytkownik opuszcza stronę:**
   - Event `pagehide` → `navigator.sendBeacon()` → `/api/abandoned-carts/webhook`
   - Webhook tworzy deal natychmiast
   - Status zmienia się na 'exported'

3. **Użytkownik nie opuszcza strony, ale przestaje być aktywny:**
   - Heartbeat przestaje być wysyłany
   - `expire_at` nie jest resetowany
   - Po 15 minutach cron przetwarza koszyk
   - Cron Tworzy deal i zmienia status na 'exported'

4. **Użytkownik wraca i kończy zamówienie:**
   - Frontend wywołuje `/api/abandoned-carts/convert`
   - Status zmienia się na 'converted'





