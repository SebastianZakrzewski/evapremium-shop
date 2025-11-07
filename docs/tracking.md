# Dokumentacja modułu śledzenia ruchu (Tracking)

## Przegląd

Moduł trackingowy umożliwia śledzenie zdarzeń e-commerce na stronie z integracją Facebook Pixel. Moduł jest zaprojektowany jako uniwersalny i łatwo rozszerzalny o kolejne pixele (TikTok, Snapchat, Google Analytics 4 events).

## Konfiguracja

### Zmienne środowiskowe

Dodaj następujące zmienne do pliku `.env`:

```env
# Facebook Pixel ID (znajdziesz w Facebook Events Manager)
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id

# Włączenie/wyłączenie tracking (true/false)
NEXT_PUBLIC_TRACKING_ENABLED=true
```

### Instalacja

Moduł jest już zintegrowany z aplikacją. Wystarczy:

1. Dodać zmienne środowiskowe do `.env`
2. Uruchomić aplikację

## Architektura

```
src/lib/tracking/
├── providers/
│   ├── FacebookPixelProvider.ts    # Implementacja Facebook Pixel
│   ├── BasePixelProvider.ts        # Abstrakcyjna klasa bazowa
│   └── index.ts
├── events/
│   ├── ecommerceEvents.ts          # Standardowe zdarzenia e-commerce
│   └── index.ts
├── hooks/
│   ├── useTracking.ts               # Hook do łatwego użycia
│   ├── usePageView.ts               # Hook do automatycznego PageView
│   └── index.ts
├── types/
│   ├── tracking.ts                  # TypeScript types
│   └── index.ts
└── index.ts                         # Public API
```

## Zdarzenia e-commerce

Moduł śledzi następujące zdarzenia:

### 1. PageView
**Automatyczne** - śledzone przy każdej zmianie route w Next.js App Router.

**Lokalizacja:** `src/lib/tracking/hooks/usePageView.ts`

**Mapowanie route:**
- `/` → `{ content_name: "Home", content_category: "Landing" }`
- `/konfigurator` → `{ content_name: "Configurator", content_category: "Product" }`
- `/checkout` → `{ content_name: "Checkout", content_category: "Checkout" }`
- `/payment/success` → `{ content_name: "Payment Success", content_category: "Checkout" }`
- `/akcesoria` → `{ content_name: "Accessories", content_category: "Product" }`
- `/modele` → `{ content_name: "Car Models", content_category: "Product" }`

### 2. ViewContent
**Wyświetlenie produktu** - śledzone gdy użytkownik skonfiguruje produkt w konfiguratorze.

**Lokalizacja:** `src/components/Configurator.tsx` (linia ~769-819)

**Warunki wywołania:**
- `selectedCarBrand && selectedCarModel && selectedCarYear` są ustawione
- `price > 0` (cena jest obliczona)
- Wywołanie tylko raz na sesję dla danej konfiguracji (cache w sessionStorage)

**Dane przekazywane:**
```typescript
{
  content_name: "Dywaniki EVA Premium - BMW 3 Series",
  content_ids: ["BMW-3-Series-2020-3d-premium"],
  content_type: "product",
  content_category: "car_mats",
  value: 299.99,
  currency: "PLN",
  product: {
    id: "BMW-3-Series-2020-3d-premium",
    name: "Dywaniki EVA Premium - BMW 3 Series",
    sku: "EVA-3d-diamonds-black-black",
    price: 299.99,
    brand: "BMW",
    category: "car_mats",
    configuration: { ... }
  }
}
```

### 3. AddToCart
**Dodanie do koszyka** - śledzone gdy użytkownik doda produkt do koszyka.

**Lokalizacje:**
- `src/components/Configurator.tsx` (linia ~620-639) - przy dodaniu z konfiguratora
- `src/hooks/useCart.new.ts` (linia ~204-218) - przy dodaniu przez hook

**Dane przekazywane:**
```typescript
{
  content_name: "Dywaniki EVA Premium - BMW 3 Series",
  content_ids: ["BMW-3-Series-2020-3d-premium"],
  content_type: "product",
  content_category: "car_mats",
  value: 299.99,
  currency: "PLN",
  num_items: 1,
  contents: [{
    id: "BMW-3-Series-2020-3d-premium",
    quantity: 1,
    item_price: 299.99,
    item_name: "Dywaniki EVA Premium - BMW 3 Series",
    item_category: "car_mats",
    item_brand: "BMW",
    item_variant: "EVA-3d-diamonds-black-black"
  }]
}
```

### 4. InitiateCheckout
**Rozpoczęcie checkoutu** - śledzone gdy użytkownik rozpocznie proces checkoutu.

**Lokalizacja:** `src/components/checkout-section.new.tsx` (linia ~154-177)

**Warunki:**
- Tylko gdy koszyk nie jest pusty (`items.length > 0`)
- Wywołanie tylko raz na sesję checkoutu (cache w sessionStorage)

**Dane przekazywane:**
```typescript
{
  content_name: "Checkout",
  content_category: "checkout",
  value: 599.98,
  currency: "PLN",
  num_items: 2,
  contents: [
    { id: "product-1", quantity: 1, item_price: 299.99, ... },
    { id: "product-2", quantity: 1, item_price: 299.99, ... }
  ]
}
```

### 5. AddPaymentInfo
**Dodanie danych płatności** - śledzone gdy użytkownik wybierze metodę płatności.

**Lokalizacja:** `src/components/checkout-section.new.tsx` (linia ~365-386)

**Moment wywołania:**
- W funkcji `onSubmit()` - przed wysłaniem formularza
- Po walidacji formularza, przed utworzeniem zamówienia

**Dane przekazywane:**
```typescript
{
  content_name: "Payment Info Added",
  content_category: "checkout",
  value: 599.98,
  currency: "PLN",
  payment_method: "p24",
  contents: [...]
}
```

### 6. Purchase
**Zakończenie zakupu** - śledzone gdy płatność zostanie potwierdzona.

**Lokalizacja:** `src/components/payment-success.tsx` (linia ~168-194)

**Warunki:**
- Tylko gdy `paymentStatus.status === 'paid'`
- Sprawdzenie czy event nie został już wysłany dla tego zamówienia (deduplikacja przez localStorage)

**Dane przekazywane:**
```typescript
{
  content_name: "Purchase Completed",
  content_ids: ["ORD-2025-000001"],
  value: 599.98,
  currency: "PLN",
  transaction_id: "123456789",
  payment_method: "p24",
  contents: [...],
  customer: {
    email_hash: "hashed_email",
    phone_hash: "hashed_phone"
  }
}
```

## Użycie

### Podstawowe użycie w komponencie

```typescript
import { useTracking } from '@/lib/tracking';

function MyComponent() {
  const { trackViewContent, trackAddToCart } = useTracking();

  const handleViewProduct = () => {
    trackViewContent({
      content_name: 'Product Name',
      content_ids: ['product-123'],
      content_type: 'product',
      content_category: 'car_mats',
      value: 299.99,
      currency: 'PLN',
      product: {
        id: 'product-123',
        name: 'Product Name',
        price: 299.99,
        brand: 'EvaPremium',
        category: 'car_mats'
      }
    });
  };

  return <button onClick={handleViewProduct}>View Product</button>;
}
```

### Helper functions

Moduł udostępnia helper functions do łatwego tworzenia danych zdarzeń:

```typescript
import { useTracking, createAddToCartData, createInitiateCheckoutData, createPurchaseData } from '@/lib/tracking';

const { trackAddToCart, trackInitiateCheckout, trackPurchase } = useTracking();

// AddToCart
const cartItem = {
  id: 'item-1',
  quantity: 1,
  unitPrice: 299.99,
  subtotal: 299.99,
  productType: 'mat' as const,
  productId: 'product-123',
  productName: 'Product Name',
  productSku: 'SKU-123'
};

const addToCartData = createAddToCartData(cartItem, 299.99);
trackAddToCart(addToCartData);

// InitiateCheckout
const checkoutData = createInitiateCheckoutData(cartItems, total);
trackInitiateCheckout(checkoutData);

// Purchase
const purchaseData = createPurchaseData(
  orderItems,
  orderNumber,
  total,
  transactionId,
  paymentMethod,
  customerEmail,
  customerPhone
);
trackPurchase(purchaseData);
```

## Mechanizmy zabezpieczające

### Deduplikacja eventów

Moduł automatycznie zapobiega duplikatom eventów:

- **PageView**: SessionStorage cache (raz na route)
- **ViewContent**: SessionStorage cache (raz na konfigurację)
- **InitiateCheckout**: SessionStorage cache (raz na sesję checkoutu)
- **Purchase**: LocalStorage cache (raz na zamówienie)

### Walidacja danych

Wszystkie dane są walidowane przed wysłaniem:
- Sprawdzanie czy wymagane pola są wypełnione
- Walidacja cen (> 0)
- Sprawdzanie czy produkty istnieją

### Error handling

- Try-catch wokół wszystkich wywołań tracking
- Fallback do console.log w development
- Nie blokuje głównego flow aplikacji

## Rozszerzalność

Moduł jest zaprojektowany jako uniwersalny i łatwo rozszerzalny. Aby dodać nowy pixel:

1. Utwórz nowy provider dziedziczący z `BasePixelProvider`
2. Zaimplementuj metody `init()`, `track()`, `pageView()`
3. Dodaj do singleton instance w `ecommerceEvents.ts`

Przykład:

```typescript
export class TikTokPixelProvider extends BasePixelProvider {
  init(options?: TrackingProviderOptions): void {
    // Inicjalizacja TikTok Pixel
  }

  track(event: TrackingEvent, data: EcommerceEventData): void {
    // Wysyłanie zdarzenia do TikTok
  }

  pageView(data: PageViewData): void {
    // Wysyłanie PageView do TikTok
  }
}
```

## Debugowanie

W trybie development (`NODE_ENV=development`), moduł automatycznie włącza tryb debug, który loguje wszystkie zdarzenia do konsoli.

Możesz również ręcznie włączyć debug:

```typescript
const provider = new FacebookPixelProvider();
provider.init({ debug: true });
```

## Testowanie

Moduł jest gotowy do testowania. Przykładowe testy znajdują się w `src/lib/tracking/__tests__/`.

## Troubleshooting

### Eventy nie są wysyłane

1. Sprawdź czy `NEXT_PUBLIC_TRACKING_ENABLED=true` w `.env`
2. Sprawdź czy `NEXT_PUBLIC_FB_PIXEL_ID` jest ustawione
3. Sprawdź konsolę przeglądarki pod kątem błędów
4. Sprawdź Facebook Events Manager czy pixel jest aktywny

### Duplikaty eventów

- Sprawdź czy deduplikacja działa poprawnie (sessionStorage/localStorage)
- Sprawdź czy event nie jest wywoływany w wielu miejscach

### Brak danych w Facebook Events Manager

1. Sprawdź czy pixel jest poprawnie zainicjalizowany
2. Sprawdź czy eventy są wysyłane (konsola przeglądarki)
3. Sprawdź czy Test Event Code jest poprawnie skonfigurowany (jeśli używasz)

## Wsparcie

W razie problemów, sprawdź:
- Dokumentację Facebook Pixel: https://developers.facebook.com/docs/meta-pixel
- Logi w konsoli przeglądarki
- Facebook Events Manager dla statusu pixela

