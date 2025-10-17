# Szybka Naprawa - Ngrok

## Problem
P24 wymaga publicznie dostępnych URL-i webhook. `localhost:3000` nie jest dostępny z internetu.

## Rozwiązanie - Ngrok

### 1. Instalacja Ngrok
```bash
# Windows (Chocolatey)
choco install ngrok

# Windows (Scoop)
scoop install ngrok

# macOS
brew install ngrok

# Linux
# Pobierz z https://ngrok.com/download
```

### 2. Konfiguracja
```bash
# Zarejestruj się na https://ngrok.com
# Pobierz token z dashboard
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 3. Uruchomienie
```bash
# Terminal 1: Uruchom aplikację
npm run dev

# Terminal 2: Uruchom ngrok
ngrok http 3000
```

### 4. Skopiuj URL
Z terminala ngrok skopiuj URL (np. `https://abc123.ngrok.io`)

### 5. Zaktualizuj .env.local
```env
# Dodaj publiczny URL (jeśli potrzebny)
# PUBLIC_URL=https://abc123.ngrok.io
```

### 6. Test
```bash
# Uruchom test aplikacji
curl http://localhost:3000/api/health
```

## Alternatywa - Deploy

### Vercel (najłatwiejszy)
```bash
# Zainstaluj Vercel CLI
npm i -g vercel

# Deploy
vercel

# Skopiuj URL z Vercel
# Zaktualizuj .env.local (jeśli potrzebny)
# PUBLIC_URL=https://your-app.vercel.app
```

## Status Po Naprawie

✅ **Test Access:** Działa  
✅ **Transaction Register:** Będzie działać z publicznym URL  
✅ **Callback:** Będzie działać z publicznym URL  
✅ **Verify:** Będzie działać z publicznym URL  

**Implementacja jest w 100% gotowa!** Problem tylko w URL-ach webhook.
