# 📋 Struktura pola `configuration` w tabeli `order_items`

## 🗄️ Podstawowe informacje

**Pole:** `configuration` (JSONB)  
**Tabela:** `order_items`  
**Typ:** `Json?` (opcjonalne)  
**Opis:** Konfiguracja produktu - zawiera szczegóły o samochodzie, kolorach i opcjach dla dywaników

## 🔍 Struktura JSON

### 📊 **Pełna struktura `configuration`**

```json
{
  "carDetails": {
    "brand": "BMW",
    "model": "X5", 
    "year": "2020",
    "bodyType": "SUV"
  },
  "setType": "3d-with-rims",
  "cellType": "diamonds", 
  "setVariant": "premium",
  "materialColor": "Czarny",
  "edgeColor": "Szary",
  "heelPad": "tak"
}
```

### 🚗 **Sekcja `carDetails`**

| Pole | Typ | Opis | Przykład |
|------|-----|------|----------|
| `brand` | String | Marka samochodu | "BMW", "Audi", "Mercedes" |
| `model` | String | Model samochodu | "X5", "A4", "C-Class" |
| `year` | String | Rok produkcji | "2020", "2021", "2022" |
| `bodyType` | String | Typ nadwozia | "SUV", "Sedan", "Hatchback" |

### 🎨 **Sekcja kolorów i materiałów**

| Pole | Typ | Opis | Przykłady wartości |
|------|-----|------|-------------------|
| `materialColor` | String | Kolor główny materiału | "Czarny", "Szary", "Brązowy" |
| `edgeColor` | String | Kolor obszycia/krawędzi | "Szary", "Czarny", "Biały" |
| `heelPad` | String | Czy z podkładką | "tak", "nie" |

### ⚙️ **Sekcja konfiguracji produktu**

| Pole | Typ | Opis | Możliwe wartości |
|------|-----|------|------------------|
| `setType` | String | Typ zestawu dywaników | "3d-with-rims", "classic" |
| `cellType` | String | Typ komórek | "diamonds", "honey" |
| `setVariant` | String | Wariant zestawu | "front", "basic", "premium", "complete" |

## 🔄 Mapowanie do Bitrix24

### 📊 **Pola Deal w Bitrix24**

| Pole Bitrix24 | Źródło w configuration | Przykład |
|---------------|----------------------|----------|
| `UF_CRM_CAR_BRAND` | `carDetails.brand` | "BMW" |
| `UF_CRM_CAR_MODEL` | `carDetails.model` | "X5" |
| `UF_CRM_CAR_YEAR` | `carDetails.year` | "2020" |
| `UF_CRM_PRODUCT_COLOR` | `materialColor` | "Czarny" |
| `UF_CRM_PRODUCT_TYPE` | `setType` | "3d-with-rims" |

### 🎯 **Kod mapowania**

```typescript
// Funkcja extractCarDetails w orderToDeal.ts
function extractCarDetails(order: Order) {
  const matItem = order.items.find(item => 
    item.productType === 'mat' && item.configuration
  );

  if (matItem && matItem.configuration) {
    const config = matItem.configuration as any;
    if (config.carDetails) {
      return {
        brand: config.carDetails.brand,      // → UF_CRM_CAR_BRAND
        model: config.carDetails.model,      // → UF_CRM_CAR_MODEL  
        year: config.carDetails.year,        // → UF_CRM_CAR_YEAR
        body: config.carDetails.bodyType,    // → (dodatkowe)
      };
    }
  }
  return {};
}

// Funkcja extractProductColors w orderToDeal.ts
function extractProductColors(order: Order) {
  const colors: string[] = [];
  
  order.items.forEach(item => {
    if (item.configuration) {
      const config = item.configuration as any;
      if (config.materialColor) {
        colors.push(`Materiał: ${config.materialColor}`);  // → UF_CRM_PRODUCT_COLOR
      }
      if (config.edgeColor) {
        colors.push(`Obszycie: ${config.edgeColor}`);
      }
    }
  });
  
  return colors.join(', ');
}
```

## 📝 **Przykłady rzeczywistych danych**

### 🚗 **Przykład 1: BMW X5 (3D z obręczami)**

```json
{
  "carDetails": {
    "brand": "BMW",
    "model": "X5",
    "year": "2020", 
    "bodyType": "SUV"
  },
  "setType": "3d-with-rims",
  "cellType": "diamonds",
  "setVariant": "premium", 
  "materialColor": "Czarny",
  "edgeColor": "Szary",
  "heelPad": "tak"
}
```

**Mapowanie do Bitrix24:**
- `UF_CRM_CAR_BRAND` = "BMW"
- `UF_CRM_CAR_MODEL` = "X5" 
- `UF_CRM_CAR_YEAR` = "2020"
- `UF_CRM_PRODUCT_COLOR` = "Materiał: Czarny, Obszycie: Szary"
- `UF_CRM_PRODUCT_TYPE` = "3d-with-rims"

### 🚙 **Przykład 2: Audi A4 (Klasyczne)**

```json
{
  "carDetails": {
    "brand": "Audi",
    "model": "A4",
    "year": "2021",
    "bodyType": "Sedan"
  },
  "setType": "classic",
  "cellType": "honey", 
  "setVariant": "basic",
  "materialColor": "Szary",
  "edgeColor": "Czarny",
  "heelPad": "nie"
}
```

**Mapowanie do Bitrix24:**
- `UF_CRM_CAR_BRAND` = "Audi"
- `UF_CRM_CAR_MODEL` = "A4"
- `UF_CRM_CAR_YEAR` = "2021" 
- `UF_CRM_PRODUCT_COLOR` = "Materiał: Szary, Obszycie: Czarny"
- `UF_CRM_PRODUCT_TYPE` = "classic"

## ⚠️ **Uwagi implementacyjne**

### 🔍 **Kiedy pole jest wypełnione:**
- ✅ **Tylko dla dywaników** (`productType = "mat"`)
- ❌ **Puste dla akcesoriów** (`productType = "accessory"`)

### 🛡️ **Walidacja danych:**
```typescript
// Sprawdzenie czy configuration istnieje
if (item.configuration) {
  const config = item.configuration as any;
  
  // Sprawdzenie czy carDetails istnieje
  if (config.carDetails) {
    // Bezpieczne mapowanie
    brand: config.carDetails.brand || '',
    model: config.carDetails.model || '',
    year: config.carDetails.year || ''
  }
}
```

### 🔄 **Obsługa wielu pozycji:**
- **Pierwsza pozycja** - używana do mapowania podstawowych pól
- **Wszystkie pozycje** - agregowane dla kolorów i typów produktów

### 📊 **Pola opcjonalne:**
- `bodyType` - może być puste
- `heelPad` - może być "nie"
- `edgeColor` - może być takie samo jak `materialColor`

## 🎯 **Podsumowanie**

Pole `configuration` zawiera **wszystkie szczegóły konfiguracji dywaników**:
- 🚗 **Dane samochodu** (marka, model, rok, typ nadwozia)
- 🎨 **Kolory** (materiał, obszycie, podkładka)  
- ⚙️ **Opcje produktu** (typ zestawu, komórki, wariant)

**Mapowanie jest automatyczne** - system wyciąga odpowiednie dane i wypełnia pola w Bitrix24 Deal.
