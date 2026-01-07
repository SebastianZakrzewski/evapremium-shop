# Wizualna Dokumentacja Systemu - EVA Website

**Data utworzenia:** 2025-01-27  
**Wersja:** 0.1-alpha

## Spis Treści

1. [Architektura Systemu](#1-architektura-systemu)
2. [Przepływ Danych - Konfigurator](#2-przepływ-danych---konfigurator)
3. [Przepływ Danych - Koszyk](#3-przepływ-danych---koszyk)
4. [Przepływ Danych - Checkout](#4-przepływ-danych---checkout)
5. [Odpowiedzialności Komponentów](#5-odpowiedzialności-komponentów)
6. [Integracje Zewnętrzne](#6-integracje-zewnętrzne)

---

## 1. Architektura Systemu

### 1.1 Warstwy Architektury

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App Router]
        B[React Components]
        C[Custom Hooks]
        D[UI Components]
    end
    
    subgraph "Business Logic Layer"
        E[Services]
        F[CartService]
        G[OrderService]
        H[MatService]
        I[PricingService]
    end
    
    subgraph "Data Access Layer"
        J[Repositories]
        K[OrderRepository]
        L[MatRepository]
        M[AccessoryRepository]
    end
    
    subgraph "API Layer"
        N[API Routes]
        O[/api/orders]
        P[/api/mats]
        Q[/api/cart]
    end
    
    subgraph "Database"
        R[(Supabase PostgreSQL)]
    end
    
    subgraph "External Services"
        S[Bitrix24]
        T[Przelewy24]
        U[CarMat API]
    end
    
    A --> B
    B --> C
    C --> E
    E --> J
    J --> R
    B --> N
    N --> E
    E --> S
    E --> T
    E --> U
```

### 1.2 Struktura Folderów i Odpowiedzialności

```mermaid
graph LR
    subgraph "src/app"
        A1[Pages/Routes]
        A2[API Routes]
    end
    
    subgraph "src/components"
        B1[UI Components]
        B2[Layout Components]
        B3[Feature Components]
    end
    
    subgraph "src/features"
        C1[Shopping Cart]
        C2[Checkout]
        C3[Products]
        C4[Brands]
        C5[Chatbot]
    end
    
    subgraph "src/lib"
        D1[Services]
        D2[Repositories]
        D3[API Clients]
        D4[Utils]
    end
    
    subgraph "src/entities"
        E1[Product]
        E2[Order]
        E3[Car]
    end
    
    A1 --> B3
    B3 --> C1
    C1 --> D1
    D1 --> D2
    D2 --> A2
```

---

## 2. Przepływ Danych - Konfigurator

### 2.1 Proces Konfiguracji Produktu

```mermaid
sequenceDiagram
    participant U as User
    participant C as Configurator Component
    participant H as useCart Hook
    participant CS as CartService
    participant PS as PricingService
    participant LS as localStorage
    
    U->>C: Wybiera markę/model/rok
    U->>C: Wybiera typ zestawu
    U->>C: Wybiera kolory
    U->>C: Wybiera dodatki
    U->>C: Kliknie "Dodaj do koszyka"
    
    C->>PS: Oblicz cenę (konfiguracja)
    PS-->>C: Zwróć cenę końcową
    
    C->>H: addToCart(configData)
    H->>CS: addToCart(cart, item)
    CS->>PS: Oblicz cenę produktu
    PS-->>CS: Cena jednostkowa
    CS->>CS: Dodaj do items[]
    CS->>CS: Przelicz subtotal/total
    CS-->>H: Zwróć zaktualizowany cart
    
    H->>LS: Zapisz cart do localStorage
    H->>H: Dispatch 'cartUpdated' event
    H-->>C: Cart zaktualizowany
    C-->>U: Pokazuj potwierdzenie
```

### 2.2 Struktura Danych Konfiguracji

```mermaid
classDiagram
    class ConfigurationData {
        +setType: string
        +cellType: string
        +setVariant: string
        +materialColor: string
        +edgeColor: string
        +heelPad: boolean
        +carDetails: CarDetails
    }
    
    class CarDetails {
        +brand: string
        +model: string
        +year: string
        +bodyType: string
    }
    
    class AddToCartDTO {
        +productType: 'mat' | 'accessory'
        +productId: string
        +quantity: number
        +unitPrice: number
        +configuration: ConfigurationData
    }
    
    class CartItem {
        +id: string
        +productType: string
        +productId: string
        +quantity: number
        +unitPrice: number
        +subtotal: number
        +configuration: ConfigurationData
    }
    
    ConfigurationData --> CarDetails
    AddToCartDTO --> ConfigurationData
    CartItem --> ConfigurationData
```

---

## 3. Przepływ Danych - Koszyk

### 3.1 Zarządzanie Koszykiem

```mermaid
stateDiagram-v2
    [*] --> EmptyCart: Inicjalizacja
    EmptyCart --> CartWithItems: Dodaj produkt
    CartWithItems --> CartWithItems: Zaktualizuj ilość
    CartWithItems --> CartWithItems: Usuń produkt
    CartWithItems --> EmptyCart: Wyczyść koszyk
    CartWithItems --> Checkout: Przejdź do kasy
    Checkout --> [*]: Zamówienie złożone
    
    note right of CartWithItems
        Stan przechowywany w:
        - React State (useCart)
        - localStorage
        - Event 'cartUpdated'
    end note
```

### 3.2 Synchronizacja Koszyka

```mermaid
graph TB
    A[useCart Hook] --> B{localStorage}
    A --> C[React State]
    A --> D[CartService]
    
    E[CartModal] --> A
    F[Configurator] --> A
    G[Checkout] --> A
    
    A --> H[cartUpdated Event]
    H --> E
    H --> F
    H --> G
    
    I[addToCart] --> D
    J[removeFromCart] --> D
    K[updateQuantity] --> D
    
    D --> L[PricingService]
    D --> M[Recalculate Cart]
    M --> A
```

---

## 4. Przepływ Danych - Checkout

### 4.1 Proces Składania Zamówienia

```mermaid
sequenceDiagram
    participant U as User
    participant CH as CheckoutSection
    participant UC as useCart Hook
    participant UO as useOrder Hook
    participant API as /api/orders
    participant OS as OrderService
    participant OR as OrderRepository
    participant DB as Database
    participant B24 as Bitrix24
    participant P24 as Przelewy24
    
    U->>CH: Wypełnia formularz
    CH->>UC: Pobierz items z koszyka
    UC-->>CH: Cart items
    
    U->>CH: Kliknie "Złóż zamówienie"
    CH->>CH: Walidacja formularza (Zod)
    CH->>UO: createOrder(orderData)
    
    UO->>API: POST /api/orders
    API->>OS: createOrder(dto)
    
    OS->>OS: Waliduj pozycje zamówienia
    OS->>OS: Oblicz ceny (PricingService)
    OS->>OS: Generuj numer zamówienia
    
    OS->>OR: create(orderData)
    OR->>DB: INSERT INTO orders
    DB-->>OR: Order ID
    OR->>DB: INSERT INTO order_items
    DB-->>OR: Success
    
    OS->>B24: Utwórz Contact + Deal
    B24-->>OS: Contact ID, Deal ID
    
    OS->>P24: Zarejestruj płatność
    P24-->>OS: Payment URL
    
    OS-->>API: Order + Payment URL
    API-->>UO: Order response
    UO-->>CH: Order success
    CH->>UC: clearCart()
    CH-->>U: Przekieruj do P24
```

### 4.2 Struktura Zamówienia

```mermaid
classDiagram
    class CreateOrderDTO {
        +customer: Customer
        +shippingAddress: Address
        +billingAddress: Address
        +items: OrderItem[]
        +paymentMethod: string
        +discountCode?: string
        +notes?: string
    }
    
    class Order {
        +id: string
        +orderNumber: string
        +status: OrderStatus
        +paymentStatus: PaymentStatus
        +customer: Customer
        +items: OrderItem[]
        +subtotal: number
        +shippingCost: number
        +tax: number
        +discount: number
        +total: number
    }
    
    class OrderItem {
        +productType: string
        +productId: string
        +quantity: number
        +unitPrice: number
        +subtotal: number
        +configuration: object
    }
    
    class Customer {
        +email: string
        +phone: string
        +firstName: string
        +lastName: string
    }
    
    CreateOrderDTO --> Customer
    CreateOrderDTO --> OrderItem
    Order --> Customer
    Order --> OrderItem
```

---

## 5. Odpowiedzialności Komponentów

### 5.1 Hierarchia Komponentów Frontend

```mermaid
graph TD
    A[RootLayout] --> B[Navbar]
    A --> C[Page Content]
    A --> D[Footer]
    A --> E[Chatbot]
    A --> F[SessionProvider]
    A --> G[TrackingProvider]
    A --> H[QueryProvider]
    
    C --> I[Home Page]
    C --> J[CarModelsSection]
    C --> K[Configurator]
    C --> L[CheckoutSection]
    
    I --> M[HeroSection]
    I --> N[ProductGallerySection]
    I --> O[AdvantagesSection]
    
    J --> P[BrandGridCard]
    J --> Q[ModelNavigationBar]
    J --> R[useCarModelsFilters]
    
    K --> S[ConfiguratorSimple]
    K --> T[useCart Hook]
    
    L --> U[CheckoutForm]
    L --> V[useOrder Hook]
    L --> T
    
    style A fill:#1a1a1a,stroke:#ff0000,stroke-width:3px
    style T fill:#0066cc,stroke:#003366,stroke-width:2px
    style V fill:#0066cc,stroke:#003366,stroke-width:2px
```

### 5.2 Odpowiedzialności Główne

| Komponent | Odpowiedzialność | Zależności |
|-----------|-----------------|------------|
| **Configurator** | Zbieranie konfiguracji produktu, walidacja kroków | useCart, PricingService |
| **CartModal** | Wyświetlanie koszyka, zarządzanie pozycjami | useCart, CartItem |
| **CheckoutSection** | Formularz zamówienia, walidacja, płatność | useCart, useOrder, PricingService |
| **CarModelsSection** | Wybór marki/modelu, filtrowanie | useCarModels, useCarModelsFilters |
| **useCart** | Stan koszyka, operacje CRUD | CartService, localStorage |
| **useOrder** | Tworzenie zamówień | OrderService, API client |
| **CartService** | Logika biznesowa koszyka | MatService, AccessoryService, PricingService |
| **OrderService** | Logika biznesowa zamówień | OrderRepository, Bitrix24, Przelewy24 |

---

## 6. Integracje Zewnętrzne

### 6.1 Przepływ Integracji z Bitrix24

```mermaid
sequenceDiagram
    participant OS as OrderService
    participant CS as ContactService
    participant DS as DealService
    participant B24 as Bitrix24 API
    
    OS->>CS: mapOrderToContact(order)
    CS->>B24: POST /crm.contact.add
    B24-->>CS: Contact ID
    
    OS->>DS: mapOrderToDeal(order, contactId)
    DS->>DS: createDealProducts(order.items)
    DS->>B24: POST /crm.deal.add
    B24-->>DS: Deal ID
    
    DS->>B24: POST /crm.deal.productrows.set
    B24-->>DS: Success
    
    DS->>B24: POST /crm.deal.update (status)
    B24-->>DS: Success
    
    DS-->>OS: Integration complete
```

### 6.2 Przepływ Płatności Przelewy24

```mermaid
sequenceDiagram
    participant CH as CheckoutSection
    participant API as /api/payments/p24/register
    participant PS as Przelewy24Service
    participant P24 as Przelewy24 API
    
    CH->>API: POST register (orderData)
    API->>PS: registerPayment(order)
    PS->>PS: Przygotuj dane płatności
    PS->>P24: POST /api/v1/transaction/register
    P24-->>PS: Payment URL + Token
    PS-->>API: Payment response
    API-->>CH: Payment URL
    CH->>CH: Redirect to P24
    
    P24->>API: POST /api/payments/p24/callback
    API->>PS: verifyCallback(data)
    PS->>P24: POST /api/v1/transaction/verify
    P24-->>PS: Payment status
    PS->>PS: Update order status
    PS-->>API: Callback processed
```

---

## 7. Przepływ Danych - End-to-End

### 7.1 Pełny Przepływ od Konfiguracji do Płatności

```mermaid
graph TB
    Start([Użytkownik wchodzi na stronę]) --> Config[Konfigurator]
    Config --> SelectCar[Wybór samochodu]
    SelectCar --> SelectType[Wybór typu zestawu]
    SelectType --> SelectColors[Wybór kolorów]
    SelectColors --> AddToCart[Dodaj do koszyka]
    
    AddToCart --> CartService[CartService.addToCart]
    CartService --> Pricing[PricingService.calculate]
    Pricing --> SaveCart[Zapisz do localStorage]
    SaveCart --> CartModal[Pokaż CartModal]
    
    CartModal --> CheckoutBtn[Przejdź do kasy]
    CheckoutBtn --> Checkout[CheckoutSection]
    
    Checkout --> FillForm[Wypełnij formularz]
    FillForm --> Validate[Walidacja Zod]
    Validate --> SubmitOrder[Złóż zamówienie]
    
    SubmitOrder --> OrderService[OrderService.createOrder]
    OrderService --> ValidateItems[Walidacja pozycji]
    ValidateItems --> CalculatePrice[Oblicz ceny]
    CalculatePrice --> GenerateNumber[Generuj numer]
    GenerateNumber --> SaveDB[Zapisz do DB]
    
    SaveDB --> Bitrix24[Integracja Bitrix24]
    Bitrix24 --> Przelewy24[Rejestracja P24]
    Przelewy24 --> Redirect[Przekieruj do płatności]
    
    Redirect --> Payment[Płatność P24]
    Payment --> Callback[Callback P24]
    Callback --> UpdateOrder[Aktualizuj status]
    UpdateOrder --> Success([Zamówienie złożone])
    
    style Start fill:#90EE90
    style Success fill:#90EE90
    style CartService fill:#FFD700
    style OrderService fill:#FFD700
    style Bitrix24 fill:#87CEEB
    style Przelewy24 fill:#87CEEB
```

---

## 8. Mapowanie Odpowiedzialności

### 8.1 Warstwa Prezentacji (Components)

| Komponent | Odpowiedzialność | Nie robi |
|-----------|-----------------|----------|
| **Configurator** | UI konfiguracji, walidacja kroków | Obliczanie cen, zapis do DB |
| **CartModal** | Wyświetlanie koszyka, UI operacji | Logika biznesowa koszyka |
| **CheckoutSection** | Formularz zamówienia, walidacja | Tworzenie zamówień w DB |
| **CarModelsSection** | Lista modeli, filtrowanie | Pobieranie danych z API |

### 8.2 Warstwa Logiki Biznesowej (Services)

| Serwis | Odpowiedzialność | Zależności |
|--------|-----------------|------------|
| **CartService** | Operacje na koszyku, walidacja | MatService, AccessoryService, PricingService |
| **OrderService** | Tworzenie zamówień, integracje | OrderRepository, Bitrix24, Przelewy24 |
| **MatService** | Zarządzanie dywanikami | MatRepository |
| **PricingService** | Kalkulacje cenowe | - |
| **ConfiguratorService** | Walidacja konfiguracji | ProductFactory |

### 8.3 Warstwa Dostępu do Danych (Repositories)

| Repozytorium | Odpowiedzialność | Tabele |
|--------------|-----------------|--------|
| **OrderRepository** | CRUD zamówień | orders, order_items |
| **MatRepository** | CRUD dywaników | mats, car_models |
| **AccessoryRepository** | CRUD akcesoriów | accessories |

---

## 9. Diagram Stanów

### 9.1 Stan Koszyka

```mermaid
stateDiagram-v2
    [*] --> Empty: Inicjalizacja
    Empty --> Loading: Ładowanie z localStorage
    Loading --> Empty: Brak danych
    Loading --> WithItems: Znaleziono dane
    
    WithItems --> Adding: Dodawanie produktu
    Adding --> WithItems: Sukces
    Adding --> Error: Błąd
    
    WithItems --> Updating: Aktualizacja ilości
    Updating --> WithItems: Sukces
    
    WithItems --> Removing: Usuwanie produktu
    Removing --> WithItems: Pozostały produkty
    Removing --> Empty: Ostatni produkt
    
    WithItems --> Clearing: Czyszczenie
    Clearing --> Empty: Wyczyszczono
    
    Error --> WithItems: Retry
    Error --> Empty: Reset
```

### 9.2 Stan Zamówienia

```mermaid
stateDiagram-v2
    [*] --> Pending: Utworzenie zamówienia
    Pending --> Processing: Rozpoczęcie płatności
    Processing --> Paid: Płatność zakończona
    Processing --> Failed: Błąd płatności
    Processing --> Cancelled: Anulowanie
    
    Paid --> Shipped: Wysłano
    Paid --> Completed: Zrealizowano
    
    Failed --> Pending: Retry
    Cancelled --> [*]
    Completed --> [*]
    
    note right of Pending
        Status w DB: 'pending'
        Payment Status: 'pending'
    end note
    
    note right of Paid
        Status w DB: 'paid'
        Payment Status: 'completed'
        Bitrix24: Deal updated
    end note
```

---

## 10. Podsumowanie Architektury

### 10.1 Zasady Projektowe

1. **Separation of Concerns**
   - Komponenty = UI tylko
   - Hooks = Stan i logika UI
   - Services = Logika biznesowa
   - Repositories = Dostęp do danych

2. **Single Responsibility**
   - Każdy serwis ma jedną odpowiedzialność
   - Komponenty są małe i skupione

3. **Dependency Injection**
   - Services używają Repositories przez konstruktor
   - Hooks używają Services przez instancje

4. **Data Flow**
   - Jednokierunkowy przepływ danych
   - State management przez React hooks
   - Synchronizacja przez events

### 10.2 Kluczowe Decyzje Architektoniczne

- ✅ **Client-side cart** - localStorage dla szybkości
- ✅ **Server-side orders** - bezpieczeństwo i integracje
- ✅ **Hybrid session** - client + server session ID
- ✅ **Event-based sync** - cartUpdated event dla synchronizacji
- ✅ **Service layer** - enkapsulacja logiki biznesowej
- ✅ **Repository pattern** - abstrakcja dostępu do danych

---

**Koniec dokumentacji**

