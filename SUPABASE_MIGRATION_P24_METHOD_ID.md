# 🔧 Migracja: Dodanie kolumny p24_method_id

## Problem
Brakuje kolumny `p24_method_id` w tabeli `orders`, co powoduje błąd:
```
Error updating orders: Could not find the 'p24MethodId' column of 'orders' in the schema cache
```

## Rozwiązanie

### Krok 1: Otwórz Supabase Dashboard
1. Przejdź do https://supabase.com/dashboard
2. Wybierz projekt `eva-website`
3. Przejdź do **SQL Editor**

### Krok 2: Wykonaj migrację SQL
Skopiuj i wykonaj następujący SQL:

```sql
-- Dodanie kolumny p24_method_id do tabeli orders
ALTER TABLE orders 
ADD COLUMN p24_method_id INTEGER;

-- Dodaj komentarz do kolumny
COMMENT ON COLUMN orders.p24_method_id IS 'ID metody płatności wybranej w Przelewy24 (1=karta, 2=przelew, 3=BLIK, etc.)';

-- Sprawdź czy kolumna została dodana
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'p24_method_id';
```

### Krok 3: Weryfikacja
Po wykonaniu SQL powinieneś zobaczyć:
- `column_name`: p24_method_id
- `data_type`: integer
- `is_nullable`: YES

## Co to jest p24_method_id?

**Definicja:** ID metody płatności wybranej przez klienta w Przelewy24

**Przykładowe wartości:**
- `1` - Karta płatnicza
- `2` - Przelew bankowy  
- `3` - BLIK
- `4` - Płatność mobilna
- `5` - Płatność ratalna

**Użycie w aplikacji:**
```typescript
// W webhook P24
{
  "methodId": 1,  // ← To jest p24_method_id
  "sessionId": "eva_ORD-2025-000001_1760986688029",
  "amount": 84700
}

// W bazie danych
await orderService.updatePaymentStatus(order.id, 'paid', {
  p24OrderId: webhookData.orderId,
  p24MethodId: webhookData.methodId,  // ← Zapisujemy metodę płatności
  error: verificationResult.error
})
```

## Następne kroki

Po dodaniu kolumny:
1. ✅ Naprawić błąd weryfikacji P24 ("Invalid CRC")
2. ✅ Przetestować webhook z prawdziwymi danymi
3. ✅ Sprawdzić czy `payment_status` zmienia się z `pending` na `paid`

---

**Status:** 🔴 **WYMAGANA MIGRACJA**  
**Priorytet:** WYSOKI - blokuje aktualizację statusu płatności
