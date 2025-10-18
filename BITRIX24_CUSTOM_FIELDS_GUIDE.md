# 📋 Instrukcja tworzenia pól niestandardowych w Bitrix24

## 🎯 Pola do utworzenia dla integracji EVA Website

### 📍 Gdzie utworzyć pola:
1. Wejdź do **Bitrix24**
2. **Ustawienia** → **CRM** → **Pola niestandardowe**
3. Wybierz **"Deale"**
4. Kliknij **"Dodaj pole"**

---

## 🔧 SZCZEGÓŁOWE INSTRUKCJE TWORZENIA PÓL

### 1. **UF_CRM_ORDER_NUMBER** - Numer zamówienia
- **Nazwa pola:** `Numer zamówienia`
- **Kod pola:** `UF_CRM_ORDER_NUMBER`
- **Typ pola:** `Tekst`
- **Wymagane:** ✅ TAK
- **Długość:** 50 znaków
- **Opis:** Unikalny numer zamówienia z systemu EVA

### 2. **UF_CRM_PAYMENT_METHOD** - Metoda płatności
- **Nazwa pola:** `Metoda płatności`
- **Kod pola:** `UF_CRM_PAYMENT_METHOD`
- **Typ pola:** `Lista`
- **Wymagane:** ❌ NIE
- **Wartości listy:**
  ```
  Przelewy24
  Karta płatnicza
  Przelew bankowy
  BLIK
  Gotówka
  ```
- **Domyślna wartość:** `Przelewy24`

### 3. **UF_CRM_PAYMENT_STATUS** - Status płatności
- **Nazwa pola:** `Status płatności`
- **Kod pola:** `UF_CRM_PAYMENT_STATUS`
- **Typ pola:** `Lista`
- **Wymagane:** ❌ NIE
- **Wartości listy:**
  ```
  Oczekuje na płatność
  Opłacone
  Błąd płatności
  Zwrócone
  Częściowo zwrócone
  ```
- **Domyślna wartość:** `Oczekuje na płatność`

### 4. **UF_CRM_CAR_BRAND** - Marka samochodu
- **Nazwa pola:** `Marka samochodu`
- **Kod pola:** `UF_CRM_CAR_BRAND`
- **Typ pola:** `Tekst`
- **Wymagane:** ❌ NIE
- **Długość:** 50 znaków
- **Opis:** Marka samochodu klienta

### 5. **UF_CRM_CAR_MODEL** - Model samochodu
- **Nazwa pola:** `Model samochodu`
- **Kod pola:** `UF_CRM_CAR_MODEL`
- **Typ pola:** `Tekst`
- **Wymagane:** ❌ NIE
- **Długość:** 100 znaków
- **Opis:** Model samochodu klienta

### 6. **UF_CRM_CAR_YEAR** - Rok samochodu
- **Nazwa pola:** `Rok samochodu`
- **Kod pola:** `UF_CRM_CAR_YEAR`
- **Typ pola:** `Liczba`
- **Wymagane:** ❌ NIE
- **Format:** Liczba całkowita
- **Zakres:** 1990-2030
- **Opis:** Rok produkcji samochodu

### 7. **UF_CRM_PRODUCT_TYPE** - Typ produktu
- **Nazwa pola:** `Typ produktu`
- **Kod pola:** `UF_CRM_PRODUCT_TYPE`
- **Typ pola:** `Lista`
- **Wymagane:** ❌ NIE
- **Wartości listy:**
  ```
  Dywaniki
  Akcesoria
  Zestaw dywaników
  Podkładki
  ```
- **Domyślna wartość:** `Dywaniki`

### 8. **UF_CRM_PRODUCT_COLOR** - Kolor produktu
- **Nazwa pola:** `Kolor produktu`
- **Kod pola:** `UF_CRM_PRODUCT_COLOR`
- **Typ pola:** `Tekst`
- **Wymagane:** ❌ NIE
- **Długość:** 50 znaków
- **Opis:** Główny kolor zamówionego produktu

### 9. **UF_CRM_SHIPPING_METHOD** - Metoda dostawy
- **Nazwa pola:** `Metoda dostawy`
- **Kod pola:** `UF_CRM_SHIPPING_METHOD`
- **Typ pola:** `Lista`
- **Wymagane:** ❌ NIE
- **Wartości listy:**
  ```
  Kurier DPD
  Kurier InPost
  Paczkomat InPost
  Odbiór osobisty
  Poczta Polska
  ```
- **Domyślna wartość:** `Kurier DPD`

### 10. **UF_CRM_ORDER_DATE** - Data zamówienia
- **Nazwa pola:** `Data zamówienia`
- **Kod pola:** `UF_CRM_ORDER_DATE`
- **Typ pola:** `Data`
- **Wymagane:** ❌ NIE
- **Format:** YYYY-MM-DD
- **Opis:** Data złożenia zamówienia

### 11. **UF_CRM_ORDER_SOURCE** - Źródło zamówienia
- **Nazwa pola:** `Źródło zamówienia`
- **Kod pola:** `UF_CRM_ORDER_SOURCE`
- **Typ pola:** `Tekst`
- **Wymagane:** ❌ NIE
- **Długość:** 100 znaków
- **Domyślna wartość:** `EVA Website`
- **Opis:** Źródło pochodzenia zamówienia

---

## ⚙️ DODATKOWE USTAWIENIA

### 🔒 Uprawnienia:
- **Widoczność:** Wszyscy użytkownicy
- **Edytowanie:** Wszyscy użytkownicy
- **Wymagane:** Tylko `UF_CRM_ORDER_NUMBER`

### 📊 Wyświetlanie:
- **W formularzu:** ✅ TAK (wszystkie pola)
- **W liście:** ✅ TAK (ważne pola)
- **W kanban:** ❌ NIE (opcjonalnie)

### 🎨 Grupowanie:
Sugerowane grupy pól:
- **Grupa 1:** Informacje o zamówieniu
  - UF_CRM_ORDER_NUMBER
  - UF_CRM_ORDER_DATE
  - UF_CRM_ORDER_SOURCE

- **Grupa 2:** Płatności
  - UF_CRM_PAYMENT_METHOD
  - UF_CRM_PAYMENT_STATUS

- **Grupa 3:** Samochód
  - UF_CRM_CAR_BRAND
  - UF_CRM_CAR_MODEL
  - UF_CRM_CAR_YEAR

- **Grupa 4:** Produkt
  - UF_CRM_PRODUCT_TYPE
  - UF_CRM_PRODUCT_COLOR
  - UF_CRM_SHIPPING_METHOD

---

## ✅ WERYFIKACJA PO UTWORZENIU

Po utworzeniu wszystkich pól uruchom ponownie test:

```bash
node -r dotenv/config check-bitrix24-custom-fields.js
```

Powinien pokazać:
- ✅ Znalezione pola: 11/11
- ❌ Brakujące pola: 0/11

---

## 🚨 WAŻNE UWAGI

1. **Kody pól MUSZĄ być dokładnie takie same** jak w instrukcji
2. **Nie zmieniaj kodów pól** - system ich szuka po kodzie
3. **Utwórz wszystkie 11 pól** - brak któregoś spowoduje błędy
4. **Sprawdź uprawnienia** - pola muszą być dostępne dla wszystkich użytkowników
5. **Po utworzeniu** mapowanie będzie działać automatycznie

---

## 🔄 CO SIĘ STANIE PO UTWORZENIU PÓL

- ✅ System automatycznie wypełni pola przy tworzeniu deali
- ✅ Dane z zamówień będą trafiać do odpowiednich pól
- ✅ Będziesz mógł filtrować i sortować deali po tych polach
- ✅ Raporty będą zawierać szczegółowe dane o zamówieniach
