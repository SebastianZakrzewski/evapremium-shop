# Paynow MVP — konfiguracja i testy sandbox

## Wymagane zmienne środowiskowe

```env
PAYNOW_ENABLED=true
NEXT_PUBLIC_PAYNOW_ENABLED=true
PAYNOW_ENVIRONMENT=sandbox
PAYNOW_API_KEY=...
PAYNOW_SIGNATURE_KEY=...
PAYNOW_RETURN_URL=https://evapremium.pl/payment/success
PAYNOW_NOTIFICATION_URL=https://evapremium.pl/api/payments/paynow/webhook
PAYNOW_RETURN_URL_LOCAL=http://localhost:3000/payment/success
PAYNOW_NOTIFICATION_URL_LOCAL=https://<ngrok-id>.ngrok.io/api/payments/paynow/webhook
```

Gdy `PAYNOW_ENABLED=true`, checkout pokazuje Paynow zamiast P24. Integracja P24 pozostaje w kodzie bez zmian.

## Panel sandbox

- URL: https://panel.sandbox.paynow.pl/
- Sklep: `evapremium.pl` (już skonfigurowany)
- Płatności: `/merchant/payments`
- Ręczny test linku: `/merchant/payments/link-form`

W panelu ustaw:
- **Adres powiadomień** → `PAYNOW_NOTIFICATION_URL`
- **Adres powrotu** → `PAYNOW_RETURN_URL`
- **Dane uwierzytelniające** → `PAYNOW_API_KEY`, `PAYNOW_SIGNATURE_KEY`

## Migracja bazy

```bash
# Zastosuj migrację w Supabase (schemat evapremium_shop)
supabase db push
# lub uruchom plik:
# supabase/migrations/20260727120000_create_evapremium_shop_payments.sql
```

## Flow testowy (lokalnie)

1. `npm run dev`
2. `ngrok http 3000`
3. Ustaw `PAYNOW_NOTIFICATION_URL_LOCAL` na URL ngrok
4. Zaktualizuj webhook w panelu sandbox
5. Złóż zamówienie testowe
6. Zapłać w paywall:
   - BLIK sukces: `111111`
   - BLIK błąd: `333333`
   - Karta: `4444 4444 4444 4000`, CVC `111`

## Endpointy API

| Endpoint | Opis |
|----------|------|
| `POST /api/payments/paynow/register` | Rejestracja płatności, zwraca `paymentUrl` |
| `POST /api/payments/paynow/webhook` | Webhook Paynow (weryfikacja podpisu) |
| `GET /api/payments/paynow/status?orderId=` | Status ostatniej płatności (polling) |

## Baza danych

Tabela: `evapremium_shop.payments`

Powiązanie: `order_id` → `public.orders.id`

Idempotencja:
- API: `idempotency_key` (UNIQUE)
- Webhook: `webhook_dedupe_key` (UNIQUE)
