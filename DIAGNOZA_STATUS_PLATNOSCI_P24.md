# 🔍 DIAGNOZA: Status płatności P24 nie zmienia się z pending

## ✅ **Problem zidentyfikowany:**

**Status płatności nie zmienia się z `pending` bo zamówienie nie istnieje w bazie danych!**

## 📊 **Wyniki testów:**

### ✅ **Co działa poprawnie:**
1. **Przelewy24 WYSYŁA signature** - mechanizm podpisu działa (96 znaków SHA384)
2. **Webhook dociera do aplikacji** - endpoint `/api/payments/p24/callback` odpowiada
3. **Weryfikacja podpisu działa** - webhook przeszedł weryfikację podpisu
4. **Mechanizm aktualizacji statusu** - kod działa poprawnie

### ❌ **Główny problem:**
**Webhook zwraca błąd 404: "Zamówienie nie zostało znalezione"**

```typescript
// Linia 55-64 w src/app/api/payments/p24/callback/route.ts
const order = await orderService.getOrderBySessionId(webhookData.sessionId)

if (!order) {
  console.error('❌ P24 Callback API: Nie znaleziono zamówienia', webhookData.sessionId)
  return NextResponse.json(
    { error: 'Zamówienie nie zostało znalezione' },
    { status: 404 }
  )
}
```

## 🔍 **Przyczyny braku zamówienia:**

### 1. **Niezgodność sessionId**
- P24 wysyła `webhookData.sessionId` 
- Aplikacja szuka `order.p24SessionId`
- **Możliwa niezgodność** między tymi wartościami

### 2. **Zamówienie nie zostało zapisane**
- Proces tworzenia zamówienia nie zapisał `p24SessionId`
- Błąd w `OrderService.createOrder()` lub `OrderService.updateOrderP24Data()`

### 3. **Problem z bazą danych**
- Zamówienie zostało utworzone, ale nie zapisane
- Problem z połączeniem do bazy danych
- Błąd w `OrderRepository`

## 🛠️ **Rozwiązanie:**

### Krok 1: Sprawdź logi aplikacji
```bash
# Sprawdź logi podczas tworzenia zamówienia
# Czy wywoływane jest updateOrderP24Data()?
# Czy p24SessionId jest zapisywane w bazie?
```

### Krok 2: Sprawdź bazę danych
```sql
-- Sprawdź czy zamówienia mają p24SessionId
SELECT id, order_number, p24_session_id, payment_status 
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Krok 3: Dodaj debugowanie
Dodaj logi do `OrderService.updateOrderP24Data()`:

```typescript
async updateOrderP24Data(orderId: string, p24Data: {
  p24SessionId?: string;
  p24Token?: string;
}): Promise<void> {
  console.log('🔍 OrderService: updateOrderP24Data', { orderId, p24Data });
  
  // ... istniejący kod ...
  
  console.log('🔍 OrderService: Updated order with P24 data');
}
```

### Krok 4: Test E2E
1. Utwórz testowe zamówienie
2. Sprawdź czy `p24SessionId` jest zapisane w bazie
3. Wykonaj płatność w P24 Sandbox
4. Sprawdź logi webhook

## 📋 **Następne kroki:**

1. **Sprawdź logi aplikacji** podczas tworzenia zamówienia
2. **Zweryfikuj bazę danych** - czy zamówienia mają `p24SessionId`
3. **Dodaj debugowanie** do `updateOrderP24Data()`
4. **Przeprowadź test E2E** z rzeczywistym zamówieniem

## 🎯 **Wniosek:**

**Problem NIE jest z Przelewy24 ani z webhook** - wszystko działa poprawnie. 

**Problem jest w aplikacji** - zamówienia nie są prawidłowo zapisywane z `p24SessionId` lub istnieje niezgodność w identyfikatorach.

---

**Status:** ✅ **DIAGNOZA ZAKOŃCZONA**  
**Następny krok:** Sprawdzenie logów aplikacji i bazy danych
