# 🎯 Logika wstawiania deala do etapu w Bitrix24

## 📋 Przepływ synchronizacji

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK P24 CALLBACK                        │
│  /api/payments/p24/callback                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                updatePaymentStatus()                           │
│  - paymentStatus: 'pending' → 'paid'                          │
│  - status: 'pending' → 'confirmed'                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Synchronizacja z Bitrix24                         │
│  if (bitrix24Config.enabled && bitrix24Config.autoSyncOrders)  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                syncOrderToBitrix24()                           │
│  - Pobierz świeże dane zamówienia                              │
│  - Sprawdź czy deal już istnieje                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Aktualizacja istniejącego deala                   │
│  if (existingDeal) {                                           │
│    const dealStage = getDealStageFromOrderStatus()             │
│    await dealService.updateDealStage()                         │
│  }                                                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              getDealStageFromOrderStatus()                     │
│  - Mapowanie statusu zamówienia i płatności na etap deala      │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Mapowanie etapów deala

### Priorytet: Status płatności > Status zamówienia

```typescript
function getDealStageFromOrderStatus(orderStatus: string, paymentStatus: string): string {
  // 1. PRIORYTET: Status płatności
  if (paymentStatus === 'paid') {
    switch (orderStatus) {
      case 'delivered':  return 'WON';           // ✅ Dostarczone
      case 'cancelled':  return 'LOSE';          // ❌ Anulowane
      case 'pending':
      case 'confirmed':
      case 'processing':
      case 'shipped':
      default:           return 'UC_DMBNNJ';     // 🎯 Zamówienia ze strony opłacone
    }
  }
  
  if (paymentStatus === 'failed')   return 'LOSE';  // ❌ Płatność nieudana
  if (paymentStatus === 'refunded') return 'LOSE';  // ❌ Zwrot

  // 2. Status zamówienia (dla nieopłaconych)
  switch (orderStatus) {
    case 'pending':     return 'NEW';           // ⏳ Czeka na opłatę
    case 'confirmed':   return 'UC_DMBNNJ';     // 🎯 Zamówienia ze strony opłacone
    case 'processing':  return 'UC_DMBNNJ';     // 🎯 Zamówienia ze strony opłacone
    case 'shipped':     return 'UC_DMBNNJ';     // 🎯 Zamówienia ze strony opłacone
    case 'delivered':   return 'WON';           // ✅ Dostarczone
    case 'cancelled':   return 'LOSE';          // ❌ Anulowane
    default:            return 'NEW';           // ⏳ Domyślnie
  }
}
```

## 🔄 Aktualizacja etapu deala

### 1. Znalezienie istniejącego deala
```typescript
const existingDeal = await dealService.findByOrderNumber(order.orderNumber);
```

### 2. Obliczenie nowego etapu
```typescript
const dealStage = this.getDealStageFromOrderStatus(order.status, order.paymentStatus);
```

### 3. Aktualizacja deala w Bitrix24
```typescript
await dealService.updateDealStage(existingDeal.id, {
  stageId: dealStage,
  comment: `Zamówienie zaktualizowane: ${order.status} (płatność: ${order.paymentStatus})`
});
```

### 4. Wywołanie API Bitrix24
```typescript
const response = await this.client.post('crm.deal.update', {
  id: dealId,
  fields: {
    STAGE_ID: options.stageId
  }
});
```

## 📊 Przykłady mapowania

| Status zamówienia | Status płatności | Etap deala | Opis |
|-------------------|------------------|------------|------|
| `pending` | `pending` | `NEW` | ⏳ Czeka na opłatę |
| `confirmed` | `paid` | `UC_DMBNNJ` | 🎯 **Zamówienia ze strony opłacone** |
| `processing` | `paid` | `UC_DMBNNJ` | 🎯 **Zamówienia ze strony opłacone** |
| `shipped` | `paid` | `UC_DMBNNJ` | 🎯 **Zamówienia ze strony opłacone** |
| `delivered` | `paid` | `WON` | ✅ Dostarczone |
| `cancelled` | `paid` | `LOSE` | ❌ Anulowane |
| `confirmed` | `failed` | `LOSE` | ❌ Płatność nieudana |
| `confirmed` | `refunded` | `LOSE` | ❌ Zwrot |

## 🚨 Kluczowe punkty

1. **Priorytet płatności**: Jeśli `paymentStatus === 'paid'`, etap jest określany na podstawie statusu zamówienia
2. **Etap "Zamówienia ze strony opłacone"**: `UC_DMBNNJ` dla opłaconych zamówień (confirmed, processing, shipped)
3. **Synchronizacja**: Wywoływana automatycznie po aktualizacji statusu płatności
4. **Aktualizacja**: Deal jest aktualizowany, a nie tworzony nowy

## 🔍 Debugowanie

Aby sprawdzić czy logika działa poprawnie, szukaj w logach:
- `🎯 OrderService: Order paid with status confirmed -> UC_DMBNNJ`
- `💼 Updating deal stage: { id: '244', stageId: 'UC_DMBNNJ' }`
- `✅ Deal stage updated successfully: { id: '244', stageId: 'UC_DMBNNJ' }`
