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
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDk0MjUsImV4cCI6MjA3MzA4NTQyNX0.PlhrCXHWb3YhOnqu8jVrt_P7nGMx3ETUmrxSwdj48rE
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI


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
- Plik `env.example` zawiera dane deweloperskie (bezpieczne do commitowania)
- Plik `src/config/env.ts` zawiera wartości domyślne jako fallback

## Dostępność w Nowym Kontekście

W nowym kontekście AI, zawsze sprawdzaj:
1. `env.example` - zawiera aktualne dane konfiguracyjne
2. `src/config/env.ts` - zawiera strukturę i wartości domyślne
3. Ten plik (`ENV_CONFIG.md`) - zawiera dokumentację konfiguracji
