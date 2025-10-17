# Konfiguracja Środowiskowa - EVA Website

## Plik `.env` jako domyślny

Plik `.env` jest ustawiony jako **główny plik środowiskowy** dla aplikacji EVA Website.

### Hierarchia plików środowiskowych w Next.js:

1. **`.env.local`** - najwyższy priorytet (lokalne zmienne, ignorowany przez Git)
2. **`.env.development`** - zmienne dla środowiska development
3. **`.env.production`** - zmienne dla środowiska production  
4. **`.env`** - **DOMYŚLNY** - zmienne dla wszystkich środowisk
5. **`env.example`** - szablon konfiguracji (nie jest ładowany automatycznie)

### Aktualna konfiguracja:

- ✅ **`.env`** - główny plik z rzeczywistymi danymi (ignorowany przez Git)
- ✅ **`env.example`** - szablon dla zespołu (commitowany)
- ✅ **`src/config/env.ts`** - centralna konfiguracja TypeScript

### Potwierdzenie:

Next.js automatycznie wykrywa i ładuje plik `.env`:
```
Environments: .env
```

### Użycie w kodzie:

```typescript
// ✅ POPRAWNIE - używaj centralnej konfiguracji
import { env } from '@/config/env';
const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// ❌ NIE RÓB TEGO - bezpośrednie użycie process.env
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### Struktura pliku `.env`:

```bash
# ===========================================
# EVA WEBSITE - KONFIGURACJA ŚRODOWISKOWA
# ===========================================

# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://kmepxyervpeujwvgdqtm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL=postgresql://username:password@localhost:5432/eva_website_db

# ===========================================
# NEXT.JS CONFIGURATION
# ===========================================
NEXTAUTH_URL=https://evapremium.pl
NEXTAUTH_SECRET=your-nextauth-secret

# ===========================================
# ENVIRONMENT
# ===========================================
NODE_ENV=development

# ===========================================
# API CONFIGURATION
# ===========================================
API_BASE_URL=https://evapremium.pl/api

# ===========================================
# POSTGRESQL CONFIGURATION (for scripts)
# ===========================================
PGHOST=localhost
PGPORT=5432
PGUSER=eva_user
PGPASSWORD=eva_password
PGDATABASE=eva_db
```

### Bezpieczeństwo:

- Plik `.env` jest w `.gitignore` (linia 34: `.env*`)
- Zawiera rzeczywiste dane konfiguracyjne
- **NIE** powinien być commitowany do repozytorium
- Używaj `env.example` jako szablonu dla nowych środowisk

### Aktualizacja konfiguracji:

1. Edytuj plik `.env` z nowymi danymi
2. Skopiuj zmiany do `env.example`:
   ```bash
   cp .env env.example
   ```
3. Zaktualizuj `src/config/env.ts` jeśli dodajesz nowe zmienne

---

**Status: ✅ PLIK `.env` JEST USTAWIONY JAKO DOMYŚLNY**
