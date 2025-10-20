# 🏠 **Lokalne testowanie z Przelewy24 Sandbox**

## ✅ **Konfiguracja zakończona!**

### 🔧 **Co zostało skonfigurowane:**

1. **Ngrok uruchomiony** - `https://58bfe6843cfe.ngrok-free.app`
2. **Aplikacja Next.js działa** - `http://localhost:3000`
3. **Endpoint testowy działa** - `/api/payments/p24/webhook-test`
4. **Zmienne środowiskowe** - `.env.local` skonfigurowany

---

## 🚀 **Instrukcje testowania:**

### **Krok 1: Skonfiguruj P24 Sandbox**

1. **Zaloguj się do panelu P24 Sandbox:**
   - URL: https://sandbox.przelewy24.pl/panel/index.php
   - Login: Twoje dane z `.env`

2. **Zaktualizuj URL-e webhook:**
   - **URL powrotu (Return URL):** `https://58bfe6843cfe.ngrok-free.app/payment/success`
   - **URL statusu (Status URL):** `https://58bfe6843cfe.ngrok-free.app/api/payments/p24/callback`

3. **Zapisz zmiany w panelu P24**

### **Krok 2: Przetestuj endpoint testowy**

```bash
# Test GET
curl -H "ngrok-skip-browser-warning: true" \
  https://58bfe6843cfe.ngrok-free.app/api/payments/p24/webhook-test

# Test POST z danymi webhook
curl -X POST \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{"merchantId":352557,"posId":352557,"sessionId":"ORDER-TEST-123","amount":10000,"currency":"PLN","orderId":123456789,"methodId":1,"statement":"Test payment","sign":"test-signature"}' \
  https://58bfe6843cfe.ngrok-free.app/api/payments/p24/webhook-test
```

### **Krok 3: Przetestuj rzeczywistą płatność**

1. **Utwórz testowe zamówienie** w aplikacji
2. **Przejdź przez proces płatności** w P24 Sandbox
3. **Sprawdź logi** w `logs/webhook-test.log`
4. **Zweryfikuj status** w bazie danych

---

## 📊 **Aktualne URL-e:**

| Typ | URL | Status |
|-----|-----|--------|
| **Aplikacja lokalna** | `http://localhost:3000` | ✅ Działa |
| **Ngrok publiczny** | `https://58bfe6843cfe.ngrok-free.app` | ✅ Działa |
| **Endpoint testowy** | `https://58bfe6843cfe.ngrok-free.app/api/payments/p24/webhook-test` | ✅ Działa |
| **Callback produkcyjny** | `https://58bfe6843cfe.ngrok-free.app/api/payments/p24/callback` | ✅ Działa |

---

## 🔍 **Monitorowanie:**

### **Logi aplikacji:**
```bash
# Sprawdź logi w terminalu gdzie uruchomiono npm run dev
# Szukaj logów:
# - "🔄 P24 Callback API: Otrzymano webhook"
# - "🛒 OrderService: updatePaymentStatus"
# - "🛒 OrderService: Setting order status to confirmed"
```

### **Logi webhook testowego:**
```bash
# Sprawdź plik logów
type logs\webhook-test.log

# Lub w PowerShell
Get-Content logs\webhook-test.log -Tail 20
```

### **Baza danych:**
```sql
-- Sprawdź ostatnie zamówienia
SELECT id, order_number, status, payment_status, p24_session_id, created_at, updated_at
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 🛠️ **Rozwiązywanie problemów:**

### **Problem: Ngrok nie działa**
```bash
# Sprawdź czy ngrok działa
curl http://localhost:4040/api/tunnels

# Restart ngrok
taskkill /F /IM ngrok.exe
ngrok http 3000
```

### **Problem: Aplikacja nie odpowiada**
```bash
# Sprawdź czy Next.js działa
netstat -an | findstr :3000

# Restart aplikacji
taskkill /F /IM node.exe
npm run dev
```

### **Problem: P24 nie wysyła webhook**
1. Sprawdź URL w panelu P24 Sandbox
2. Sprawdź czy ngrok URL jest aktualny
3. Sprawdź logi w panelu P24 (jeśli dostępne)

---

## 📋 **Następne kroki:**

1. **Skonfiguruj P24 Sandbox** z nowymi URL-ami
2. **Przetestuj endpoint testowy** - sprawdź czy loguje dane
3. **Utwórz testowe zamówienie** i przejdź przez płatność
4. **Sprawdź logi** - czy webhook dociera i czy status się zmienia
5. **Zweryfikuj bazę danych** - czy zamówienia mają prawidłowe statusy

---

## 🎯 **Oczekiwane rezultaty:**

Po pomyślnym teście powinieneś zobaczyć:

- ✅ **Webhook dociera** do aplikacji
- ✅ **Zamówienie zostaje znalezione** po `p24SessionId`
- ✅ **Status płatności zmienia się** z `pending` na `paid`
- ✅ **Status zamówienia zmienia się** z `pending` na `confirmed`
- ✅ **Logi pokazują sukces** w każdym etapie

**Jeśli wszystko działa lokalnie, możesz wdrożyć naprawki na produkcję!** 🚀

---

**Data konfiguracji:** $(Get-Date)  
**Status:** ✅ **GOTOWE DO TESTÓW**  
**Ngrok URL:** `https://58bfe6843cfe.ngrok-free.app`
