# Backend - Eva Premium (Next.js API Layer)

Katalog backend dla aplikacji Eva Premium - moduły API i serwisy działające w warstwie Next.js.

## Struktura katalogu

```
backend/
├── README.md          # Ten plik
├── src/               # Kod źródłowy modułów
│   ├── api/           # Endpointy API
│   ├── services/      # Serwisy biznesowe
│   ├── models/        # Modele danych
│   ├── utils/         # Narzędzia pomocnicze
│   └── middleware/    # Middleware
├── config/            # Konfiguracje
├── tests/             # Testy
└── docs/              # Dokumentacja API
```

## Architektura Next.js

Ten katalog jest częścią projektu Next.js i zawiera:
- **API Routes** - Endpointy `/api/*`
- **Serwisy** - Logika biznesowa
- **Modele** - Struktury danych
- **Middleware** - Autoryzacja, walidacja

## Technologie

- **Next.js API Routes** - Endpointy API
- **TypeScript** - Typowanie
- **Prisma** - ORM dla bazy danych
- **JWT** - Autoryzacja
- **Zod** - Walidacja danych
- **Nodemailer** - Wysyłanie emaili

## Funkcjonalności

- API REST dla frontendu
- Zarządzanie produktami (dywaniki)
- System zamówień
- Autoryzacja użytkowników
- Obsługa płatności
- System powiadomień

## Struktura API

```
/api/
├── products/          # Produkty
├── orders/            # Zamówienia
├── auth/              # Autoryzacja
├── users/             # Użytkownicy
└── payments/          # Płatności
```

## Serwisy

- `ProductService` - Zarządzanie produktami
- `OrderService` - Obsługa zamówień
- `AuthService` - Autoryzacja
- `EmailService` - Powiadomienia email
- `PaymentService` - Integracja płatności

## Uruchomienie

Backend działa jako część Next.js:
```bash
npm run dev    # Uruchamia cały projekt (frontend + backend)
```

## API Endpoints

- `GET /api/products` - Lista produktów
- `POST /api/orders` - Tworzenie zamówienia
- `GET /api/orders/:id` - Szczegóły zamówienia
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/register` - Rejestracja 