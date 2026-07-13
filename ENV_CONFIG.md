# Konfiguracja Środowiskowa - EVA Website

## Pliki Konfiguracyjne

### 1. `.env` (Główny plik środowiskowy)
Zawiera rzeczywiste dane konfiguracyjne dla środowiska deweloperskiego.

### 2. `env.example` (Szablon konfiguracji)
Zawiera aktualne dane konfiguracyjne i służy jako szablon dla nowych środowisk.

### 3. `src/config/env.ts` (Konfiguracja TypeScript)
Centralny plik konfiguracyjny z typami TypeScript i wartościami domyślnymi.

## Aktualna Konfiguracja

### Supabase
- **URL**: https://kmepxyervpeujwvgdqtm.supabase.co
- **Anon Key**: ustawiany przez `NEXT_PUBLIC_SUPABASE_ANON_KEY` w `.env`
- **Service Role Key**: ustawiany przez `SUPABASE_SERVICE_ROLE_KEY` wyłącznie po stronie serwera

### Feature flags
- **NEXT_PUBLIC_MAT_TEMPLATES_CATALOG_ENABLED**: domyślnie `true` (brak zmiennej = włączone). Ustaw `false`, aby wyłączyć katalog mat_templates w UI.

### Skrypty synchronizacji katalogu
```bash
npm run seed:mat-templates
npm run verify:mat-templates
npm run fetch:bitrix-enums
npm run sync:pricing-catalog
npm run sync:bitrix-enum-ids
```


## Użycie w Kodzie

### Import konfiguracji
```typescript
import { env } from '@/config/env';

// Użycie
const supabase = createClient(env.supabase.url, env.supabase.anonKey);
```

### Walidacja zmiennych
```typescript
import { validateEnv } from '@/config/env';

// Na początku aplikacji
validateEnv();
```

## Aktualizacja Konfiguracji

1. Zaktualizuj plik `.env` z nowymi danymi
2. Skopiuj zmiany do `env.example`:
   ```bash
   cp .env env.example
   ```
3. Zaktualizuj `src/config/env.ts` jeśli dodajesz nowe zmienne

## Bezpieczeństwo

- Plik `.env` jest ignorowany przez Git
- `env.example` zawiera wyłącznie nazwy zmiennych i bezpieczne placeholdery
- `src/config/env.ts` nie może zawierać kluczy jako fallback

## Dostępność w Nowym Kontekście

W nowym kontekście AI, zawsze sprawdzaj:
1. `env.example` - zawiera aktualne dane konfiguracyjne
2. `src/config/env.ts` - zawiera strukturę i wartości domyślne
3. Ten plik (`ENV_CONFIG.md`) - zawiera dokumentację konfiguracji
