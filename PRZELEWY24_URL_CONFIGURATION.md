# 🔧 Konfiguracja URL-ów Przelewy24

## 📋 Przegląd

Aplikacja automatycznie używa różnych URL-ów w zależności od środowiska:

- **Development (lokalnie)** → ngrok URLs
- **Production (Vercel)** → evapremium.pl URLs

## 🌍 Środowiska

### Development (NODE_ENV=development)
- **Return URL**: `https://a2d41c191229.ngrok-free.app/payment/success`
- **Status URL**: `https://a2d41c191229.ngrok-free.app/api/payments/p24/callback`

### Production (NODE_ENV=production)
- **Return URL**: `https://evapremium.pl/payment/success`
- **Status URL**: `https://evapremium.pl/api/payments/p24/callback`

## ⚙️ Konfiguracja

### Zmienne środowiskowe

```env
# PRODUCTION URLs (Vercel)
P24_URL_RETURN=https://evapremium.pl/payment/success
P24_URL_STATUS=https://evapremium.pl/api/payments/p24/callback

# DEVELOPMENT URLs (ngrok - opcjonalne)
P24_URL_RETURN_LOCAL=https://a2d41c191229.ngrok-free.app/payment/success
P24_URL_STATUS_LOCAL=https://a2d41c191229.ngrok-free.app/api/payments/p24/callback
```

### Logika wyboru URL

```typescript
// W src/lib/config/przelewy24.ts
const urlStatus = process.env.NODE_ENV === 'development'
  ? process.env.P24_URL_STATUS_LOCAL || 'https://a2d41c191229.ngrok-free.app/api/payments/p24/callback'
  : process.env.P24_URL_STATUS || 'https://evapremium.pl/api/payments/p24/callback'
```

## 🔄 Aktualizacja ngrok URL

Gdy ngrok URL się zmieni:

1. **Zaktualizuj domyślne wartości** w `src/lib/config/przelewy24.ts`:
   ```typescript
   // Linia 64-65 i 68-69
   'https://NOWY-NGROK-URL.ngrok-free.app/payment/success'
   'https://NOWY-NGROK-URL.ngrok-free.app/api/payments/p24/callback'
   ```

2. **Lub ustaw zmienne środowiskowe** w `.env`:
   ```env
   P24_URL_RETURN_LOCAL=https://NOWY-NGROK-URL.ngrok-free.app/payment/success
   P24_URL_STATUS_LOCAL=https://NOWY-NGROK-URL.ngrok-free.app/api/payments/p24/callback
   ```

## 🧪 Testowanie

### Development
```bash
# Uruchom aplikację lokalnie
npm run dev

# Sprawdź logi - powinny pokazywać ngrok URLs
🔍 P24Config: urlReturn: https://a2d41c191229.ngrok-free.app/payment/success
🔍 P24Config: urlStatus: https://a2d41c191229.ngrok-free.app/api/payments/p24/callback
```

### Production
```bash
# Deploy na Vercel
vercel --prod

# Sprawdź logi - powinny pokazywać evapremium.pl URLs
🔍 P24Config: urlReturn: https://evapremium.pl/payment/success
🔍 P24Config: urlStatus: https://evapremium.pl/api/payments/p24/callback
```

## ✅ Status

- ✅ **Development**: ngrok URLs skonfigurowane
- ✅ **Production**: evapremium.pl URLs skonfigurowane
- ✅ **Automatyczne przełączanie** na podstawie NODE_ENV
- ✅ **Fallback URLs** w przypadku braku zmiennych środowiskowych

## 🚨 Ważne

- **ngrok URL zmienia się** przy każdym restarcie ngrok
- **Zaktualizuj konfigurację** gdy zmienisz ngrok URL
- **Vercel URLs** są stałe i nie wymagają aktualizacji
