# Migracja do Supabase

Projekt został zmigrowany z PostgreSQL + Prisma na Supabase. Ten dokument zawiera instrukcje dotyczące migracji i konfiguracji.

## Konfiguracja

### 1. Zmienne środowiskowe

Dodaj następujące zmienne do pliku `.env`:

```env
# Supabase Configuration
SUPABASE_URL="https://diqbnsinhsedmvvstvvc.supabase.co"
SUPABASE_KEY="your-supabase-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-here"
```

### 2. Struktura tabel w Supabase

Upewnij się, że w Supabase są utworzone następujące tabele:

#### Tabela `mats`
```sql
CREATE TABLE mats (
  id SERIAL PRIMARY KEY,
  type VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  "cellType" VARCHAR NOT NULL,
  "edgeColor" VARCHAR NOT NULL,
  image VARCHAR NOT NULL
);
```

#### Tabela `car_brands`
```sql
CREATE TABLE car_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  "displayName" VARCHAR,
  logo VARCHAR,
  description TEXT,
  website VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabela `car_models`
```sql
CREATE TABLE car_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  "displayName" VARCHAR,
  "yearFrom" INTEGER,
  "yearTo" INTEGER,
  generation VARCHAR,
  "bodyType" VARCHAR,
  "engineType" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "carBrandId" INTEGER REFERENCES car_brands(id) ON DELETE CASCADE,
  UNIQUE(name, "carBrandId", "yearFrom")
);
```

## Migracja danych

### 1. Migracja z istniejącej bazy PostgreSQL

```bash
npm run supabase:migrate
```

Ten skrypt:
- Pobiera dane z lokalnej bazy PostgreSQL (Prisma)
- Migruje je do Supabase
- Weryfikuje poprawność migracji

### 2. Seedowanie przykładowych danych

```bash
npm run supabase:seed
```

Ten skrypt:
- Czyści istniejące dane
- Dodaje przykładowe dane (maty, marki samochodów, modele)
- Weryfikuje poprawność seedowania

## Nowe serwisy

Projekt używa teraz nowych serwisów Supabase:

- `SupabaseMatsService` - zarządzanie matami
- `SupabaseCarBrandService` - zarządzanie markami samochodów  
- `SupabaseCarModelService` - zarządzanie modelami samochodów

## API Endpoints

Wszystkie API endpoints zostały zaktualizowane do używania Supabase:

- `GET /api/mats` - pobieranie mat
- `POST /api/mats` - tworzenie mat
- `GET /api/mats/[id]` - pobieranie maty po ID
- `PUT /api/mats/[id]` - aktualizacja maty
- `DELETE /api/mats/[id]` - usuwanie maty
- `GET /api/mats/3d` - pobieranie mat 3D
- `GET /api/car-brands` - pobieranie marek samochodów
- `POST /api/car-brands` - tworzenie marki samochodu
- `GET /api/car-models` - pobieranie modeli samochodów
- `POST /api/car-models` - tworzenie modelu samochodu
- `GET /api/car-models/[id]` - pobieranie modelu po ID
- `PUT /api/car-models/[id]` - aktualizacja modelu
- `DELETE /api/car-models/[id]` - usuwanie modelu

## Usunięte pliki

Następujące pliki zostały usunięte jako niepotrzebne:

- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/lib/database/prisma.ts`
- `src/lib/services/MatsService.ts`
- `src/lib/services/CarBrandService.ts`
- `src/lib/services/CarModelService.ts`

## Testowanie

Po migracji przetestuj wszystkie API endpoints:

```bash
# Test pobierania mat
curl http://localhost:3000/api/mats

# Test pobierania marek samochodów
curl http://localhost:3000/api/car-brands

# Test pobierania modeli samochodów
curl http://localhost:3000/api/car-models
```

## Uwagi

- Supabase używa PostgreSQL pod spodem, więc wszystkie zapytania SQL działają tak samo
- RLS (Row Level Security) można włączyć w Supabase dla dodatkowego bezpieczeństwa
- Supabase oferuje automatyczne backup'y i skalowanie
- Można używać Supabase Studio do zarządzania danymi przez interfejs webowy
