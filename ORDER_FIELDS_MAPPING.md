# Mapowanie pól Order do Bitrix24 - Etap "Zamówienia ze strony opłacone"

## 📋 Pola Order po złożeniu zamówienia przez klienta

### 🔑 Podstawowe pola Order (z bazy danych)

```typescript
interface Order {
  // Identyfikatory
  id: string;                    // UUID zamówienia
  orderNumber: string;           // Unikalny numer zamówienia (np. "EVA-2024-001")
  
  // Statusy
  status: OrderStatus;           // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: PaymentStatus;  // "pending" | "paid" | "failed" | "refunded"
  
  // Płatności
  paymentMethod?: string;        // "card" | "transfer" | "blik" | "przelewy24"
  trackingNumber?: string;       // Numer śledzenia przesyłki
  
  // Dane klienta (JSON)
  customer: {
    name: string;                // Pełne imię i nazwisko
    email: string;               // Email klienta
    phone: string;               // Telefon klienta
    company?: string;            // Nazwa firmy (opcjonalne)
  };
  
  // Adres dostawy (JSON)
  shippingAddress: {
    street: string;              // Ulica i numer
    city: string;                // Miasto
    postalCode: string;          // Kod pocztowy
    country: string;             // Kraj (domyślnie "Polska")
  };
  
  // Adres faktury (JSON, opcjonalne)
  billingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
  // Ceny
  subtotal: number;              // Suma netto
  shippingCost: number;          // Koszt dostawy
  tax: number;                   // Podatek
  discount: number;              // Rabat
  total: number;                 // Suma całkowita
  
  // Przelewy24 (opcjonalne)
  p24SessionId?: string;         // Session ID P24
  p24Token?: string;             // Token transakcji P24
  p24OrderId?: number;           // Order ID z P24
  p24MethodId?: number;          // Metoda płatności P24
  
  // Dodatkowe
  notes?: string;                // Uwagi do zamówienia
  shippedAt?: Date;              // Data wysyłki
  deliveredAt?: Date;            // Data dostawy
  createdAt: Date;               // Data utworzenia
  updatedAt: Date;               // Data aktualizacji
  
  // Pozycje zamówienia
  items: OrderItem[];            // Lista produktów
}
```

### 🛍️ Pola OrderItem (pozycje zamówienia)

```typescript
interface OrderItem {
  id: string;                    // UUID pozycji
  quantity: number;              // Ilość
  unitPrice: number;             // Cena jednostkowa
  subtotal: number;              // Suma pozycji
  
  // Identyfikacja produktu
  productType: string;           // "accessory" | "mat"
  productId: string;             // ID z tabeli accessories lub mats
  
  // Snapshot produktu (zachowuje dane nawet po usunięciu produktu)
  productName: string;           // Nazwa produktu
  productSku?: string;           // SKU produktu
  productImage?: string;         // Obraz produktu
  
  // Konfiguracja dla dywaników (JSON)
  configuration?: {
    carDetails: {
      brand: string;             // Marka samochodu
      model: string;             // Model samochodu
      year: string;              // Rok produkcji
      body: string;              // Typ nadwozia
      trans: string;             // Skrzynia biegów
    };
    setType: string;             // Typ zestawu
    cellType: string;            // Typ komórek
    colors: {
      main: string;              // Kolor główny
      edge: string;              // Kolor krawędzi
      heelPad: string;           // Kolor podkładki
    };
    heelPad: boolean;            // Czy z podkładką
  };
  
  createdAt: Date;
  updatedAt: Date;
  orderId: string;               // ID zamówienia
}
```

## 🔄 Mapowanie do Bitrix24 Deal (etap UC_DMBNNJ)

### 📊 Podstawowe pola Deal

```typescript
interface Bitrix24Deal {
  // Wymagane pola
  TITLE: string;                 // "Zamówienie EVA-2024-001"
  STAGE_ID: string;              // "UC_DMBNNJ" (Zamówienia ze strony opłacone)
  OPPORTUNITY: number;           // Wartość zamówienia (order.total)
  CURRENCY_ID: string;           // "PLN"
  CONTACT_ID?: string;           // ID kontaktu w Bitrix24
  
  // Opcjonalne pola
  COMMENTS?: string;             // Szczegółowe komentarze
  
  // Pola niestandardowe EVA Website
  UF_CRM_ORDER_NUMBER?: string;      // order.orderNumber
  UF_CRM_PAYMENT_METHOD?: string;    // order.paymentMethod
  UF_CRM_PAYMENT_STATUS?: string;    // order.paymentStatus
  UF_CRM_CAR_BRAND?: string;         // Z order.items[0].configuration.carDetails.brand
  UF_CRM_CAR_MODEL?: string;         // Z order.items[0].configuration.carDetails.model
  UF_CRM_CAR_YEAR?: string;          // Z order.items[0].configuration.carDetails.year
  UF_CRM_PRODUCT_TYPE?: string;      // Z order.items[0].productType
  UF_CRM_PRODUCT_COLOR?: string;     // Z order.items[0].configuration.colors.main
  UF_CRM_SHIPPING_METHOD?: string;   // "Kurier" | "Paczkomat" | "Odbiór osobisty"
  UF_CRM_ORDER_DATE?: string;        // order.createdAt (format YYYY-MM-DD)
  UF_CRM_ORDER_SOURCE?: string;      // "EVA Website"
}
```

### 👤 Mapowanie do Bitrix24 Contact

```typescript
interface Bitrix24Contact {
  NAME: string;                  // order.customer.name (pierwsza część)
  LAST_NAME?: string;            // order.customer.name (reszta)
  EMAIL?: Array<{                // order.customer.email
    VALUE: string;
    VALUE_TYPE: "WORK";
  }>;
  PHONE?: Array<{                // order.customer.phone
    VALUE: string;
    VALUE_TYPE: "WORK";
  }>;
  ADDRESS?: string;              // order.shippingAddress.street
  ADDRESS_CITY?: string;         // order.shippingAddress.city
  ADDRESS_POSTAL_CODE?: string;  // order.shippingAddress.postalCode
  ADDRESS_COUNTRY?: string;      // order.shippingAddress.country
  COMPANY_TITLE?: string;        // order.customer.company
  COMMENTS?: string;             // Szczegółowe komentarze
  SOURCE_ID?: string;            // "WEB" (strona internetowa)
  SOURCE_DESCRIPTION?: string;   // "EVA Website"
}
```

## ✅ Wymagane pola dla poprawnego mapowania

### 🔴 Krytyczne (wymagane)
- `order.orderNumber` → `UF_CRM_ORDER_NUMBER`
- `order.total` → `OPPORTUNITY`
- `order.customer.name` → `NAME` (Contact)
- `order.customer.email` → `EMAIL` (Contact)
- `order.customer.phone` → `PHONE` (Contact)

### 🟡 Ważne (zalecane)
- `order.paymentStatus` → `UF_CRM_PAYMENT_STATUS`
- `order.paymentMethod` → `UF_CRM_PAYMENT_METHOD`
- `order.shippingAddress` → `ADDRESS_*` (Contact)
- `order.items[0].configuration.carDetails` → `UF_CRM_CAR_*`
- `order.createdAt` → `UF_CRM_ORDER_DATE`

### 🟢 Opcjonalne (dodatkowe)
- `order.notes` → `COMMENTS`
- `order.trackingNumber` → w komentarzach
- `order.items[0].configuration.colors` → `UF_CRM_PRODUCT_COLOR`
- `order.shippingAddress.city` → `UF_CRM_SHIPPING_METHOD`

## 🚀 Przykład mapowania

```typescript
// Order z bazy danych
const order = {
  id: "uuid-123",
  orderNumber: "EVA-2024-001",
  status: "confirmed",
  paymentStatus: "paid",
  paymentMethod: "przelewy24",
  total: 299.99,
  customer: {
    name: "Jan Kowalski",
    email: "jan@example.com",
    phone: "+48123456789",
    company: "Firma ABC"
  },
  shippingAddress: {
    street: "ul. Przykładowa 123",
    city: "Warszawa",
    postalCode: "00-001",
    country: "Polska"
  },
  items: [{
    productName: "Dywaniki BMW X5",
    productType: "mat",
    configuration: {
      carDetails: {
        brand: "BMW",
        model: "X5",
        year: "2020",
        body: "SUV",
        trans: "Automatyczna"
      },
      colors: {
        main: "Czarny",
        edge: "Szary"
      }
    }
  }],
  createdAt: new Date("2024-01-15T10:30:00Z")
};

// Mapowanie do Bitrix24 Deal
const bitrixDeal = {
  TITLE: "Zamówienie EVA-2024-001",
  STAGE_ID: "UC_DMBNNJ",  // Zamówienia ze strony opłacone
  OPPORTUNITY: 299.99,
  CURRENCY_ID: "PLN",
  UF_CRM_ORDER_NUMBER: "EVA-2024-001",
  UF_CRM_PAYMENT_METHOD: "przelewy24",
  UF_CRM_PAYMENT_STATUS: "paid",
  UF_CRM_CAR_BRAND: "BMW",
  UF_CRM_CAR_MODEL: "X5",
  UF_CRM_CAR_YEAR: "2020",
  UF_CRM_PRODUCT_TYPE: "mat",
  UF_CRM_PRODUCT_COLOR: "Czarny",
  UF_CRM_ORDER_DATE: "2024-01-15",
  UF_CRM_ORDER_SOURCE: "EVA Website"
};
```

## ⚠️ Uwagi dotyczące mapowania

1. **Etap UC_DMBNNJ** - używaj tylko dla zamówień ze statusem `paymentStatus: "paid"`
2. **Kontakt** - zawsze utwórz kontakt przed utworzeniem deala
3. **Produkty** - dodaj produkty do deala po jego utworzeniu
4. **Walidacja** - sprawdź czy wszystkie wymagane pola są wypełnione
5. **Błędy** - loguj błędy mapowania dla debugowania

## 🔧 Implementacja

Mapowanie jest już zaimplementowane w:
- `src/lib/integrations/bitrix24/mappers/orderToDeal.ts`
- `src/lib/integrations/bitrix24/mappers/orderToContact.ts`
- `src/lib/integrations/bitrix24/services/DealService.ts`
