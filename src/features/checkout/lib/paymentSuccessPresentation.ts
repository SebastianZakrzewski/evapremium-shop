import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice"

export type PaymentSuccessAddress = {
  street?: string
  city?: string
  postalCode?: string
  country?: string
}

export type PaymentSuccessCustomer = {
  name?: string
  email?: string
  phone?: string
  company?: string
  taxId?: string
}

export type PaymentSuccessItem = {
  id?: string
  productName?: string
  quantity?: number
  unitPrice?: number
  subtotal?: number
  productType?: string
  configuration?: unknown
}

export type PaymentSuccessStatus = {
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded"
  orderId?: string
  orderNumber?: string
  p24OrderId?: string
  total?: number
  subtotal?: number
  shippingCost?: number
  tax?: number
  discount?: number
  customer?: PaymentSuccessCustomer
  shippingAddress?: PaymentSuccessAddress
  billingAddress?: PaymentSuccessAddress
  paymentMethod?: string
  orderStatus?: string
  paymentStatus?: string
  trackingNumber?: string
  notes?: string
  createdAt?: string
  items?: PaymentSuccessItem[]
}

export type DetailRow = {
  label: string
  value: string
}

export type PriceLine = {
  label: string
  value: string
  tone: "default" | "discount" | "total"
}

export type PaymentTone = "success" | "pending" | "danger" | "neutral"

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Karta płatnicza",
  transfer: "Przelew bankowy",
  blik: "BLIK",
  przelewy24: "Przelewy24",
  paynow: "Paynow (mBank)",
  cash: "Gotówka",
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Opłacone",
  pending: "Oczekujące",
  failed: "Nieudane",
  cancelled: "Anulowane",
  refunded: "Zwrócone",
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Oczekujące",
  confirmed: "Potwierdzone",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
}

const PAYMENT_HEADLINES: Record<string, string> = {
  paid: "Dziękujemy za zamówienie",
  pending: "Płatność jest przetwarzana",
  failed: "Płatność nie została dokończona",
  cancelled: "Płatność została anulowana",
  refunded: "Płatność została zwrócona",
}

const PAYMENT_LEADS: Record<string, string> = {
  paid: "Płatność została potwierdzona. Potwierdzenie wyślemy na adres e-mail.",
  pending: "Operator płatności jeszcze nie potwierdził transakcji. Status odświeży się po chwili.",
  failed: "Transakcja nie przeszła. Możesz wrócić do kasy i spróbować ponownie.",
  cancelled: "Płatność została przerwana. Zamówienie pozostaje nieopłacone.",
  refunded: "Środki za to zamówienie zostały zwrócone.",
}

export const PAID_NEXT_STEPS = [
  "Potwierdzenie zamówienia wyślemy na e-mail",
  "Dywaniki przygotowujemy do 14 dni",
  "Po wysyłce przekażemy numer śledzenia",
  "Dostawa trwa zwykle 2–3 dni robocze",
]

const labelFromMap = (value: string | undefined, labels: Record<string, string>, fallback: string) => {
  if (!value) return fallback
  return labels[value.toLowerCase()] || value
}

export const getPaymentMethodLabel = (method?: string) =>
  labelFromMap(method, PAYMENT_METHOD_LABELS, "Nie określono")

export const getPaymentStatusLabel = (status?: string) =>
  labelFromMap(status, PAYMENT_STATUS_LABELS, "Nieznany")

export const getOrderStatusLabel = (status?: string) =>
  labelFromMap(status, ORDER_STATUS_LABELS, status || "Nieznany")

export const getPaymentHeadline = (status: string) =>
  PAYMENT_HEADLINES[status] || "Status płatności"

export const getPaymentLead = (status: string) =>
  PAYMENT_LEADS[status] || "Nie udało się odczytać statusu płatności."

export const getPaymentTone = (status: string): PaymentTone => {
  if (status === "paid") return "success"
  if (status === "pending") return "pending"
  if (status === "failed" || status === "cancelled") return "danger"
  return "neutral"
}

export const formatOrderDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatAddressLines = (address?: PaymentSuccessAddress) => {
  if (!address) return []

  const lines: string[] = []
  if (address.street) lines.push(address.street)

  const cityLine = [address.postalCode, address.city].filter(Boolean).join(" ")
  if (cityLine) lines.push(cityLine)
  if (address.country) lines.push(address.country)

  return lines
}

const compactAddress = (address?: PaymentSuccessAddress) => ({
  street: address?.street?.trim() || "",
  postalCode: address?.postalCode?.trim() || "",
  city: address?.city?.trim() || "",
  country: address?.country?.trim() || "",
})

export const addressesDiffer = (
  shipping?: PaymentSuccessAddress,
  billing?: PaymentSuccessAddress
) => {
  if (!shipping || !billing) return false
  return JSON.stringify(compactAddress(shipping)) !== JSON.stringify(compactAddress(billing))
}

export const buildOrderMetaRows = (payment: PaymentSuccessStatus): DetailRow[] => {
  const rows: DetailRow[] = []

  if (payment.orderNumber) {
    rows.push({ label: "Numer zamówienia", value: payment.orderNumber })
  }
  if (payment.createdAt) {
    rows.push({ label: "Data", value: formatOrderDate(payment.createdAt) })
  }
  if (payment.orderStatus) {
    rows.push({ label: "Realizacja", value: getOrderStatusLabel(payment.orderStatus) })
  }

  const paymentStatus = payment.paymentStatus || payment.status
  if (paymentStatus) {
    rows.push({ label: "Płatność", value: getPaymentStatusLabel(paymentStatus) })
  }
  if (payment.paymentMethod) {
    rows.push({ label: "Metoda płatności", value: getPaymentMethodLabel(payment.paymentMethod) })
  }
  if (payment.trackingNumber) {
    rows.push({ label: "Numer śledzenia", value: payment.trackingNumber })
  }

  return rows
}

export const buildCustomerRows = (customer?: PaymentSuccessCustomer): DetailRow[] => {
  if (!customer) return []

  const rows: DetailRow[] = []
  if (customer.name) rows.push({ label: "Imię i nazwisko", value: customer.name })
  if (customer.company) rows.push({ label: "Firma", value: customer.company })
  if (customer.taxId) rows.push({ label: "NIP", value: customer.taxId })
  if (customer.email) rows.push({ label: "E-mail", value: customer.email })
  if (customer.phone) rows.push({ label: "Telefon", value: customer.phone })
  return rows
}

export const buildPaymentPriceLines = (payment: {
  subtotal?: number
  shippingCost?: number
  tax?: number
  discount?: number
  total?: number
}): PriceLine[] => {
  const lines: PriceLine[] = []

  if (payment.subtotal !== undefined) {
    lines.push({
      label: "Wartość produktów",
      value: formatPricePln(payment.subtotal),
      tone: "default",
    })
  }
  if (payment.shippingCost !== undefined && payment.shippingCost > 0) {
    lines.push({
      label: "Dostawa",
      value: formatPricePln(payment.shippingCost),
      tone: "default",
    })
  }
  if (payment.tax !== undefined && payment.tax > 0) {
    lines.push({
      label: "Podatek",
      value: formatPricePln(payment.tax),
      tone: "default",
    })
  }
  if (payment.discount !== undefined && payment.discount > 0) {
    lines.push({
      label: "Rabat",
      value: `-${formatPriceValue(payment.discount)} zł`,
      tone: "discount",
    })
  }
  if (payment.total !== undefined) {
    lines.push({
      label: "Razem",
      value: formatPricePln(payment.total),
      tone: "total",
    })
  }

  return lines
}

export const getOrderItemTitle = (item: Pick<PaymentSuccessItem, "productType" | "productName">) =>
  item.productType === "mat" ? "Dywaniki samochodowe" : item.productName || "Produkt"

export const getOrderItemLineTotal = (
  item: Pick<PaymentSuccessItem, "subtotal" | "unitPrice" | "quantity">
) => {
  if (item.subtotal !== undefined) return formatPricePln(item.subtotal)
  if (item.unitPrice !== undefined && item.quantity !== undefined) {
    return formatPricePln(item.unitPrice * item.quantity)
  }
  return "—"
}
