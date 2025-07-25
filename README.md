# Eva Website v0.1-alpha

## 🛡️ Bezpieczeństwo

### Implementowane zabezpieczenia:
- ✅ **Autoryzacja JWT** z hashowaniem haseł (bcrypt)
- ✅ **Rate limiting** - ochrona przed DDoS
- ✅ **Security headers** (CSP, XSS Protection, etc.)
- ✅ **CORS** konfiguracja
- ✅ **Input validation** z Zod
- ✅ **Prisma ORM** - ochrona przed SQL injection
- ✅ **Backup system** - automatyczne backupy bazy danych
- ✅ **Environment variables** - bezpieczne zarządzanie konfiguracją

### 🔧 Konfiguracja bezpieczeństwa:

1. **Skonfiguruj zmienne środowiskowe:**
   ```bash
   cp env.example .env
   # Edytuj .env z bezpiecznymi wartościami
   ```

2. **Wygeneruj bezpieczny JWT secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Uruchom migracje bazy danych:**
   ```bash
   npx prisma migrate dev
   ```

4. **Utwórz pierwszy backup:**
   ```bash
   npm run backup:create
   ```

## 🚀 Uruchomienie

### Development:
```bash
npm run dev
```

### Production:
```bash
npm run build
npm start
```

### Docker:
```bash
npm run docker:dev
```

## 📋 Checklist bezpieczeństwa przed wdrożeniem:

- [ ] Zmień domyślne hasła w bazie danych
- [ ] Skonfiguruj HTTPS w produkcji
- [ ] Ustaw bezpieczny JWT_SECRET
- [ ] Skonfiguruj firewall
- [ ] Włącz logowanie błędów
- [ ] Skonfiguruj monitoring
- [ ] Ustaw automatyczne backupy
- [ ] Przetestuj rate limiting
- [ ] Sprawdź CORS settings
- [ ] Weryfikuj security headers

## 🔄 Backupy

### Automatyczne backupy:
```bash
npm run backup:create  # Utwórz backup
npm run backup:list    # Lista backupów
npm run backup:restore # Przywróć backup
```

### Cron job dla automatycznych backupów:
```bash
# Dodaj do crontab
0 2 * * * cd /path/to/project && npm run backup:create
```

## 📊 Monitoring

Aplikacja zawiera podstawowe logowanie błędów i monitoring. W produkcji zalecane jest użycie:
- **Sentry** dla error tracking
- **Prometheus + Grafana** dla metryk
- **ELK Stack** dla logów

## 🛠️ Development

### Struktura projektu:
```
src/
├── lib/
│   ├── middleware/     # Security middleware
│   ├── services/       # Business logic
│   ├── database/       # Database connection
│   └── utils/          # Utilities (backup, etc.)
├── components/         # React components
└── app/               # Next.js app router
```

### Dodanie nowego endpointu z zabezpieczeniami:
```typescript
import { authMiddleware, securityMiddleware } from '@/lib/middleware/security';

export async function GET(request: NextRequest) {
  // Zastosuj security middleware
  const response = securityMiddleware(request);
  
  // Sprawdź autoryzację
  const authResult = await authMiddleware(request);
  if (authResult.status === 401) return authResult;
  
  // Twoja logika...
}
```

## 📞 Support

W przypadku problemów z bezpieczeństwem, skontaktuj się z zespołem deweloperskim.
