# 📊 Mapowanie tabel Supabase do pól Bitrix24 Deal

## 🗄️ Analiza struktury tabel w Supabase

### 📋 Tabela `orders` (Supabase)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Customer data as JSON
    customer JSONB NOT NULL, -- {name, email, phone, company?}
    shipping_address JSONB NOT NULL, -- {street, city, postalCode, country}
    billing_address JSONB, -- if different from shipping
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Przelewy24 fields
    p24_session_id VARCHAR(100),
    p24_token VARCHAR(100),
    p24_order_id INTEGER,
    p24_method_id INTEGER,
    
    -- Timestamps
    notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🛍️ Tabela `order_items` (Supabase)

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    -- Product identification
    product_type VARCHAR(50) NOT NULL, -- "accessory" or "mat"
    product_id UUID NOT NULL, -- ID from accessories or mats table
    
    -- Product snapshot (preserves data even if product is deleted)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image VARCHAR(500),
    
    -- Configuration for mats
    configuration JSONB, -- {carDetails, setType, cellType, colors, heelPad}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);
```

## 🔄 Mapowanie do Bitrix24 Deal

### 📊 **Pola podstawowe Deal (wymagane)**

| Pole Bitrix24 | Źródło w Supabase | Typ | Wymagane | Opis |
|---------------|-------------------|-----|----------|------|
| `TITLE` | `order_number` | String | ✅ | "Zamówienie EVA-2024-001" |
| `STAGE_ID` | - | String | ✅ | "UC_DMBNNJ" (stałe) |
| `OPPORTUNITY` | `total` | Number | ✅ | Wartość zamówienia |
| `CURRENCY_ID` | - | String | ✅ | "PLN" (stałe) |
| `CONTACT_ID` | - | String | ❌ | ID kontaktu (utworzony) |

### 🏷️ **Pola niestandardowe Deal (EVA Website)**

| Pole Bitrix24 | Źródło w Supabase | Typ | Wymagane | Opis |
|---------------|-------------------|-----|----------|------|
| `UF_CRM_ORDER_NUMBER` | `order_number` | String | ✅ | Unikalny numer zamówienia |
| `UF_CRM_PAYMENT_METHOD` | `payment_method` | String | ❌ | Metoda płatności |
| `UF_CRM_PAYMENT_STATUS` | `payment_status` | String | ✅ | Status płatności |
| `UF_CRM_CAR_BRAND` | `order_items.configuration->carDetails->brand` | String | ❌ | Marka samochodu |
| `UF_CRM_CAR_MODEL` | `order_items.configuration->carDetails->model` | String | ❌ | Model samochodu |
| `UF_CRM_CAR_YEAR` | `order_items.configuration->carDetails->year` | String | ❌ | Rok samochodu |
| `UF_CRM_PRODUCT_TYPE` | `order_items.product_type` | String | ❌ | Typ produktu |
| `UF_CRM_PRODUCT_COLOR` | `order_items.configuration->colors->main` | String | ❌ | Kolor główny |
| `UF_CRM_SHIPPING_METHOD` | `shipping_address` (wywnioskowane) | String | ❌ | Metoda dostawy |
| `UF_CRM_ORDER_DATE` | `created_at` | Date | ✅ | Data zamówienia |
| `UF_CRM_ORDER_SOURCE` | - | String | ✅ | "EVA Website" (stałe) |

### 📝 **Pola komentarzy Deal**

| Pole Bitrix24 | Źródło w Supabase | Opis |
|---------------|-------------------|------|
| `COMMENTS` | Kombinacja pól | Szczegółowe informacje o zamówieniu |

## 🔍 **Szczegółowa analiza pól JSON**

### 👤 **Pole `customer` (JSONB)**
```json
{
  "name": "Jan Kowalski",
  "email": "jan@example.com", 
  "phone": "+48123456789",
  "company": "Firma ABC" // opcjonalne
}
```

### 🏠 **Pole `shipping_address` (JSONB)**
```json
{
  "street": "ul. Przykładowa 123",
  "city": "Warszawa",
  "postalCode": "00-001", 
  "country": "Polska"
}
```

### 🚗 **Pole `configuration` w `order_items` (JSONB)**
```json
{
  "carDetails": {
    "brand": "BMW",
    "model": "X5", 
    "year": "2020",
    "body": "SUV",
    "trans": "Automatyczna"
  },
  "setType": "Kompletny",
  "cellType": "Standard",
  "colors": {
    "main": "Czarny",
    "edge": "Szary", 
    "heelPad": "Czarny"
  },
  "heelPad": true
}
```

## 📊 **Dodatkowe pola do rozważenia**

### 🔢 **Pola liczbowe**
| Pole Bitrix24 | Źródło w Supabase | Typ | Opis |
|---------------|-------------------|-----|------|
| `UF_CRM_ITEMS_COUNT` | `COUNT(order_items)` | Number | Liczba pozycji |
| `UF_CRM_SUBTOTAL` | `subtotal` | Number | Suma netto |
| `UF_CRM_SHIPPING_COST` | `shipping_cost` | Number | Koszt dostawy |
| `UF_CRM_TAX` | `tax` | Number | Podatek |
| `UF_CRM_DISCOUNT` | `discount` | Number | Rabat |

### 📦 **Pola produktów**
| Pole Bitrix24 | Źródło w Supabase | Typ | Opis |
|---------------|-------------------|-----|------|
| `UF_CRM_PRODUCT_NAMES` | `STRING_AGG(product_name)` | String | Nazwy produktów |
| `UF_CRM_PRODUCT_SKUS` | `STRING_AGG(product_sku)` | String | SKU produktów |
| `UF_CRM_PRODUCT_IMAGES` | `STRING_AGG(product_image)` | String | Obrazy produktów |

### 🚚 **Pola dostawy**
| Pole Bitrix24 | Źródło w Supabase | Typ | Opis |
|---------------|-------------------|-----|------|
| `UF_CRM_TRACKING_NUMBER` | `tracking_number` | String | Numer śledzenia |
| `UF_CRM_SHIPPED_AT` | `shipped_at` | Date | Data wysyłki |
| `UF_CRM_DELIVERED_AT` | `delivered_at` | Date | Data dostawy |

### 💳 **Pola Przelewy24**
| Pole Bitrix24 | Źródło w Supabase | Typ | Opis |
|---------------|-------------------|-----|------|
| `UF_CRM_P24_SESSION_ID` | `p24_session_id` | String | Session ID P24 |
| `UF_CRM_P24_TOKEN` | `p24_token` | String | Token P24 |
| `UF_CRM_P24_ORDER_ID` | `p24_order_id` | Number | Order ID P24 |
| `UF_CRM_P24_METHOD_ID` | `p24_method_id` | Number | Method ID P24 |

## 🎯 **Rekomendowane pola do utworzenia**

### ✅ **Pola podstawowe (11 pól)**
1. `UF_CRM_ORDER_NUMBER` - Numer zamówienia
2. `UF_CRM_PAYMENT_METHOD` - Metoda płatności  
3. `UF_CRM_PAYMENT_STATUS` - Status płatności
4. `UF_CRM_CAR_BRAND` - Marka samochodu
5. `UF_CRM_CAR_MODEL` - Model samochodu
6. `UF_CRM_CAR_YEAR` - Rok samochodu
7. `UF_CRM_PRODUCT_TYPE` - Typ produktu
8. `UF_CRM_PRODUCT_COLOR` - Kolor produktu
9. `UF_CRM_SHIPPING_METHOD` - Metoda dostawy
10. `UF_CRM_ORDER_DATE` - Data zamówienia
11. `UF_CRM_ORDER_SOURCE` - Źródło zamówienia

### 🔄 **Pola dodatkowe (opcjonalne)**
12. `UF_CRM_ITEMS_COUNT` - Liczba pozycji
13. `UF_CRM_SUBTOTAL` - Suma netto
14. `UF_CRM_SHIPPING_COST` - Koszt dostawy
15. `UF_CRM_TRACKING_NUMBER` - Numer śledzenia
16. `UF_CRM_PRODUCT_NAMES` - Nazwy produktów

## ⚠️ **Uwagi implementacyjne**

1. **Pola JSON** - wymagają specjalnego mapowania w kodzie
2. **Pola z order_items** - mogą być puste dla akcesoriów
3. **Pola Przelewy24** - tylko dla zamówień z P24
4. **Pola dat** - wymagają konwersji formatu
5. **Pola liczbowe** - wymagają konwersji z DECIMAL

## 🔧 **Przykład mapowania**

```typescript
// Przykład mapowania z Supabase do Bitrix24
const deal: Bitrix24Deal = {
  TITLE: `Zamówienie ${order.order_number}`,
  STAGE_ID: "UC_DMBNNJ",
  OPPORTUNITY: Number(order.total),
  CURRENCY_ID: "PLN",
  
  // Podstawowe pola
  UF_CRM_ORDER_NUMBER: order.order_number,
  UF_CRM_PAYMENT_STATUS: order.payment_status,
  UF_CRM_PAYMENT_METHOD: order.payment_method,
  UF_CRM_ORDER_DATE: order.created_at.split('T')[0],
  UF_CRM_ORDER_SOURCE: "EVA Website",
  
  // Pola z order_items (pierwszy item)
  UF_CRM_PRODUCT_TYPE: orderItems[0]?.product_type,
  UF_CRM_PRODUCT_COLOR: orderItems[0]?.configuration?.colors?.main,
  
  // Pola z configuration JSON
  UF_CRM_CAR_BRAND: orderItems[0]?.configuration?.carDetails?.brand,
  UF_CRM_CAR_MODEL: orderItems[0]?.configuration?.carDetails?.model,
  UF_CRM_CAR_YEAR: orderItems[0]?.configuration?.carDetails?.year,
  
  // Pola dodatkowe
  UF_CRM_ITEMS_COUNT: orderItems.length,
  UF_CRM_SUBTOTAL: Number(order.subtotal),
  UF_CRM_SHIPPING_COST: Number(order.shipping_cost),
  UF_CRM_TRACKING_NUMBER: order.tracking_number,
};
```
